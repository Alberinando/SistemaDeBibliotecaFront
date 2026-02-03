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
    return `${API_BASE_URL}/ws-notificacoes`;
}

export function useWebSocket() {
    // Estado para verificar se estamos no cliente (evita problemas de hidratação)
    const [isMounted, setIsMounted] = useState(false);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);

    const clientRef = useRef<Client | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const reconnectAttemptsRef = useRef<number>(0);
    const isMountedRef = useRef<boolean>(false);

    const auth = useAuth();
    const userSession = auth.getUserSession();

    // Marcar como montado apenas no cliente
    useEffect(() => {
        setIsMounted(true);
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Carregar notificações iniciais via API REST
    const fetchInitialNotifications = useCallback(async () => {
        if (!isMountedRef.current) return;

        const token = userSession?.accessToken;
        const userId = userSession?.id;
        if (!token || !userId) return;

        try {
            const response = await api.get<Notificacao[]>(`/v1/notificacoes/funcionario/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!isMountedRef.current) return;

            const data = Array.isArray(response.data) ? response.data : [];
            setNotificacoes(data);
            setUnreadCount(data.filter(n => !n.lida).length);
        } catch (error) {
            console.error("Erro ao buscar notificações iniciais:", error);
            if (isMountedRef.current) {
                setNotificacoes([]);
            }
        }
    }, [userSession?.accessToken, userSession?.id]);

    // Efeito principal do WebSocket - só executa no cliente
    useEffect(() => {
        // Não executar no servidor
        if (typeof window === 'undefined') return;
        if (!isMounted) return;

        const token = userSession?.accessToken;
        if (!token) return;

        // Evitar múltiplas conexões simultâneas
        if (isConnectingRef.current) {
            return;
        }

        // Se já tem um cliente ativo, não criar outro
        if (clientRef.current?.active) {
            return;
        }

        isConnectingRef.current = true;
        reconnectAttemptsRef.current = 0;

        // Buscar notificações iniciais
        fetchInitialNotifications();

        const wsUrl = getWebSocketUrl();
        const MAX_RECONNECT_ATTEMPTS = 3;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            // IMPORTANTE: Desabilitar reconexão automática da lib para termos controle
            reconnectDelay: 0,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => {
                // Silenciado em produção
            },
            onConnect: () => {
                if (!isMountedRef.current) {
                    client.deactivate();
                    return;
                }

                setConnected(true);
                isConnectingRef.current = false;
                reconnectAttemptsRef.current = 0;

                client.subscribe(`/user/queue/notificacoes`, (message) => {
                    if (!isMountedRef.current) return;

                    try {
                        const novaNotificacao: Notificacao = JSON.parse(message.body);
                        setNotificacoes(prev => [novaNotificacao, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    } catch (e) {
                        console.error('Erro ao processar notificação:', e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
                isConnectingRef.current = false;
            },
            onWebSocketError: () => {
                // Não loggar para evitar spam no console
                reconnectAttemptsRef.current++;

                if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    isConnectingRef.current = false;
                    setConnected(false);
                    // Desativar silenciosamente
                    try {
                        client.deactivate();
                    } catch {
                        // Ignorar erros ao desativar
                    }
                }
            },
            onWebSocketClose: () => {
                setConnected(false);

                // Não tentar reconectar se já excedeu o limite ou se o componente foi desmontado
                if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS || !isMountedRef.current) {
                    isConnectingRef.current = false;
                    return;
                }

                // Tentar reconectar manualmente com delay
                reconnectAttemptsRef.current++;
                if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && isMountedRef.current) {
                    setTimeout(() => {
                        if (isMountedRef.current && !client.active) {
                            try {
                                client.activate();
                            } catch {
                                // Ignorar erro de ativação
                            }
                        }
                    }, 5000); // 5 segundos entre tentativas
                } else {
                    isConnectingRef.current = false;
                }
            },
            onDisconnect: () => {
                setConnected(false);
                isConnectingRef.current = false;
            }
        });

        try {
            client.activate();
            clientRef.current = client;
        } catch (error) {
            console.error('Erro ao ativar cliente WebSocket:', error);
            isConnectingRef.current = false;
        }

        return () => {
            isConnectingRef.current = false;
            if (clientRef.current) {
                try {
                    clientRef.current.deactivate();
                } catch {
                    // Ignorar erros ao desativar
                }
                clientRef.current = null;
            }
        };
    }, [isMounted, userSession?.accessToken, fetchInitialNotifications]);

    const markAsRead = useCallback(async (id: number) => {
        if (!userSession?.accessToken) return;
        try {
            await api.put(`/v1/notificacoes/${id}/lida`, {}, {
                headers: { "Authorization": `Bearer ${userSession.accessToken}` }
            });

            setNotificacoes(prev => prev.map(n =>
                n.id === id ? { ...n, lida: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Erro ao marcar como lida:", error);
        }
    }, [userSession?.accessToken]);

    const markAllAsRead = useCallback(async () => {
        if (!userSession?.accessToken || !userSession.id) return;

        const unreadIds = notificacoes.filter(n => !n.lida).map(n => n.id);

        // Atualização otimista
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
        setUnreadCount(0);

        // Enviar requisições
        for (const id of unreadIds) {
            try {
                await api.put(`/v1/notificacoes/${id}/lida`, {}, {
                    headers: { "Authorization": `Bearer ${userSession.accessToken}` }
                });
            } catch (error) {
                console.error(`Erro ao marcar notificação ${id} como lida:`, error);
            }
        }
    }, [userSession?.accessToken, userSession?.id, notificacoes]);

    return {
        notificacoes,
        unreadCount,
        connected,
        markAsRead,
        markAllAsRead,
        refresh: fetchInitialNotifications
    };
}
