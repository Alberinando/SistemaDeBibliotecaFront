"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from "@/resources/users/authentication.resourse";
import api from '@/services/api';
import { Notificacao } from '@/interface/NotificacaoProps';

export function useWebSocket() {
    // Definir estado inicial como array vazio para garantir que sempre seja iterável
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);
    const clientRef = useRef<Client | null>(null);
    const auth = useAuth();
    const userSession = auth.getUserSession();

    // Carregar notificações iniciais via API REST
    const fetchInitialNotifications = useCallback(async () => {
        if (!userSession?.accessToken || !userSession.id) return;
        try {
            const response = await api.get<Notificacao[]>(`/v1/notificacoes/funcionario/${userSession.id}`, {
                headers: { "Authorization": `Bearer ${userSession.accessToken}` }
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
    }, [userSession]);

    useEffect(() => {
        if (!userSession?.accessToken) return;

        // Buscar notificações iniciais ao montar
        fetchInitialNotifications();

        // Configurar WebSocket
        const socket = new SockJS('http://localhost:8080/ws-notificacoes');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            debug: (str) => {
                // console.log(str); // Descomente para debug
            },
            onConnect: () => {
                setConnected(true);
                // Inscrever no tópico privado do usuário
                client.subscribe(`user/queue/notificacoes`, (message) => {
                    const novaNotificacao: Notificacao = JSON.parse(message.body);
                    setNotificacoes(prev => [novaNotificacao, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onDisconnect: () => {
                setConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [userSession, fetchInitialNotifications]);

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
