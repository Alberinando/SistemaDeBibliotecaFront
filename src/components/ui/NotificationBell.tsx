"use client";
import React from 'react';
import { Bell, Check, Clock, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const { notificacoes, unreadCount, markAsRead, markAllAsRead } = useWebSocket();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 group cursor-pointer">
                    <Bell size={20} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-sidebar animate-pulse" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-card rounded-xl shadow-modal border border-border overflow-hidden mr-4" align="end">
                {/* Header */}
                <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground">Notificações</h3>
                        <p className="text-xs text-muted-foreground">
                            {unreadCount > 0
                                ? `Você tem ${unreadCount} nova${unreadCount !== 1 ? 's' : ''}`
                                : 'Nenhuma nova notificação'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 font-medium hover:underline cursor-pointer"
                        >
                            Marcar lidas
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {notificacoes.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell size={20} />
                            </div>
                            <p className="text-sm">Tudo limpo por aqui!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            <AnimatePresence>
                                {notificacoes.map((notificacao) => (
                                    <motion.div
                                        key={notificacao.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 hover:bg-muted/50 transition-colors relative group ${!notificacao.lida ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notificacao.lida ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                <BookOpen size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notificacao.lida ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                    {notificacao.mensagem}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                                                    <Clock size={10} />
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
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-card rounded-full text-primary/60 hover:text-primary transition-all shadow-sm border border-transparent hover:border-border cursor-pointer"
                                                    title="Marcar como lida"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {!notificacao.lida && (
                                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-primary rounded-r-full" />
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
