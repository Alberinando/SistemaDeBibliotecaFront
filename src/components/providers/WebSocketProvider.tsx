"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from "@/resources/users/authentication.resourse";
import api from '@/services/api';
import { Notificacao } from '@/interface/NotificacaoProps';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

interface WebSocketContextType {
    notificacoes: Notificacao[];
    unreadCount: number;
    connected: boolean;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);

    const clientRef = useRef<Client | null>(null);
    const isMountedRef = useRef<boolean>(false);

    const auth = useAuth();
    const userSession = auth.getUserSession();

    useEffect(() => {
        setIsMounted(true);
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

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
            console.error("Erro ao buscar notificações:", error);
            if (isMountedRef.current) {
                setNotificacoes([]);
            }
        }
    }, [userSession?.accessToken, userSession?.id]);

    useEffect(() => {
        if (typeof window === 'undefined' || !isMounted) return;

        const token = userSession?.accessToken;
        if (!token) return;

        // Prevent duplicate connections
        if (clientRef.current?.active) {
            return;
        }

        fetchInitialNotifications();

        const wsUrl = `${API_BASE_URL}/ws-notificacoes`;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => { },
            onConnect: () => {
                if (!isMountedRef.current) {
                    client.deactivate();
                    return;
                }
                setConnected(true);

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
            onStompError: () => { },
            onWebSocketError: () => {
                setConnected(false);
            },
            onWebSocketClose: () => {
                setConnected(false);
            },
            onDisconnect: () => {
                setConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                try {
                    clientRef.current.deactivate();
                } catch {
                    // Ignore
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
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
        setUnreadCount(0);

        for (const id of unreadIds) {
            try {
                await api.put(`/v1/notificacoes/${id}/lida`, {}, {
                    headers: { "Authorization": `Bearer ${userSession.accessToken}` }
                });
            } catch (error) {
                console.error(`Erro ao marcar ${id}:`, error);
            }
        }
    }, [userSession?.accessToken, userSession?.id, notificacoes]);

    const value: WebSocketContextType = {
        notificacoes: isMounted ? notificacoes : [],
        unreadCount: isMounted ? unreadCount : 0,
        connected,
        markAsRead,
        markAllAsRead,
        refresh: fetchInitialNotifications
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket(): WebSocketContextType {
    const context = useContext(WebSocketContext);
    if (!context) {
        // Return default values if used outside provider (SSR safety)
        return {
            notificacoes: [],
            unreadCount: 0,
            connected: false,
            markAsRead: async () => { },
            markAllAsRead: async () => { },
            refresh: async () => { }
        };
    }
    return context;
}
