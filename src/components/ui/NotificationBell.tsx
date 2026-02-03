"use client";
import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiClock, FiBookOpen } from 'react-icons/fi';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const [isMounted, setIsMounted] = useState(false);
    const { notificacoes, unreadCount, markAsRead, markAllAsRead } = useWebSocket();

    // Evitar problemas de hidratação - só renderizar conteúdo dinâmico após montar
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Durante SSR e antes de montar, usar valores estáveis
    const displayUnreadCount = isMounted ? unreadCount : 0;
    const displayNotificacoes = isMounted ? notificacoes : [];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                    <FiBell size={20} className={displayUnreadCount > 0 ? "animate-wiggle" : ""} />
                    {displayUnreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e1b4b] animate-pulse" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden mr-4" align="end">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800">Notificações</h3>
                        <p className="text-xs text-gray-500">
                            {displayUnreadCount > 0
                                ? `Você tem ${displayUnreadCount} nova${displayUnreadCount !== 1 ? 's' : ''}`
                                : 'Nenhuma nova notificação'}
                        </p>
                    </div>
                    {displayUnreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline cursor-pointer"
                        >
                            Marcar lidas
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {displayNotificacoes.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FiBell size={20} />
                            </div>
                            <p className="text-sm">Tudo limpo por aqui!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {displayNotificacoes.map((notificacao) => (
                                    <motion.div
                                        key={notificacao.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notificacao.lida ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notificacao.lida ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <FiBookOpen size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notificacao.lida ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                                                    {notificacao.mensagem}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2 text-xs text-gray-400">
                                                    <FiClock size={10} />
                                                    <span>
                                                        {formatDistanceToNow(new Date(notificacao.createdAt), {
                                                            addSuffix: true,
                                                            locale: ptBR
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            {!notificacao.lida && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notificacao.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-full text-indigo-400 hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-gray-100"
                                                    title="Marcar como lida"
                                                >
                                                    <FiCheck size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {!notificacao.lida && (
                                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-indigo-500 rounded-r-full" />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
