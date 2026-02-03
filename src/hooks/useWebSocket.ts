"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from "@/resources/users/authentication.resourse";
import api from '@/services/api';
import { Notificacao } from '@/interface/NotificacaoProps';

// URL base da API (usa variável de ambiente ou fallback)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

// Converte URL HTTP(S) para WS URL compatível com SockJS
function getWebSocketUrl(): string {
    // SockJS precisa da URL HTTP(S), não WS
    // Ele faz a conversão internamente
    return `${API_BASE_URL}/ws-notificacoes`;
}

export function useWebSocket() {
    // Definir estado inicial como array vazio para garantir que sempre seja iterável
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);
    const clientRef = useRef<Client | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const auth = useAuth();
    const userSession = auth.getUserSession();

    // Usar ref para armazenar valores estáveis do token e userId
    const accessTokenRef = useRef<string | null>(null);
    const userIdRef = useRef<number | null>(null);

    // Atualizar refs quando userSession mudar
    useEffect(() => {
        accessTokenRef.current = userSession?.accessToken ?? null;
        userIdRef.current = userSession?.id ?? null;
    }, [userSession?.accessToken, userSession?.id]);

    // Carregar notificações iniciais via API REST
    const fetchInitialNotifications = useCallback(async () => {
        const token = accessTokenRef.current;
        const userId = userIdRef.current;
        if (!token || !userId) return;
        try {
            const response = await api.get<Notificacao[]>(`/v1/notificacoes/funcionario/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            // Garantir que a resposta seja um array
            const data = Array.isArray(response.data) ? response.data : [];
            setNotificacoes(data);
            setUnreadCount(data.filter(n => !n.lida).length);
        } catch (error) {
            console.error("Erro ao buscar notificações iniciais:", error);
            // Em caso de erro, definir como array vazio para evitar problemas de renderização
            setNotificacoes([]);
        }
    }, []);

    useEffect(() => {
        const token = userSession?.accessToken;
        if (!token) return;

        // Evitar múltiplas conexões simultâneas
        if (isConnectingRef.current || clientRef.current?.active) {
            return;
        }

        isConnectingRef.current = true;

        // Buscar notificações iniciais ao montar
        fetchInitialNotifications();

        // Configurar WebSocket usando URL da variável de ambiente
        const wsUrl = getWebSocketUrl();

        // Contador de tentativas de reconexão
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const INITIAL_RECONNECT_DELAY = 2000; // 2 segundos

        const client = new Client({
            // Usar webSocketFactory para criar um novo socket a cada conexão
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            // Configuração de reconexão com backoff exponencial
            reconnectDelay: INITIAL_RECONNECT_DELAY,
            // Desabilitar heartbeat se causar problemas (opcional)
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: (str) => {
                // console.log(str); // Descomente para debug
            },
            onConnect: () => {
                setConnected(true);
                isConnectingRef.current = false;
                reconnectAttempts = 0; // Reset contador ao conectar com sucesso
                // Inscrever no tópico privado do usuário
                client.subscribe(`/user/queue/notificacoes`, (message) => {
                    const novaNotificacao: Notificacao = JSON.parse(message.body);
                    setNotificacoes(prev => [novaNotificacao, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                isConnectingRef.current = false;
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                reconnectAttempts++;

                // Se exceder o limite de tentativas, desativar a reconexão automática
                if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.warn('Máximo de tentativas de reconexão atingido. Desativando WebSocket.');
                    client.deactivate();
                    setConnected(false);
                    isConnectingRef.current = false;
                }
            },
            onWebSocketClose: () => {
                setConnected(false);
                reconnectAttempts++;

                // Se exceder o limite de tentativas, não tentar reconectar
                if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.warn('Máximo de tentativas de reconexão atingido.');
                    client.deactivate();
                    isConnectingRef.current = false;
                }
            },
            onDisconnect: () => {
                setConnected(false);
                isConnectingRef.current = false;
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            isConnectingRef.current = false;
            if (client.active) {
                client.deactivate();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSession?.accessToken]);

    const markAsRead = async (id: number) => {
        if (!userSession?.accessToken) return;
        try {
            await api.put(`/v1/notificacoes/${id}/lida`, {}, {
                headers: { "Authorization": `Bearer ${userSession.accessToken}` }
            });

            // Atualizar estado local
            setNotificacoes(prev => prev.map(n =>
                n.id === id ? { ...n, lida: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Erro ao marcar como lida:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!userSession?.accessToken || !userSession.id) return;
        // Implementar endpoint de marcar todas como lidas no backend se necessário
        // Por enquanto, marcamos localmente e iteramos (ideal seria batch update)
        const unreadIds = notificacoes.filter(n => !n.lida).map(n => n.id);

        // Otimista: marcar tudo como lido localmente
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
        setUnreadCount(0);

        // Enviar requisições (ideal: endpoint batch)
        unreadIds.forEach(id => markAsRead(id));
    };

    return {
        notificacoes,
        unreadCount,
        connected,
        markAsRead,
        markAllAsRead,
        refresh: fetchInitialNotifications
    };
}
