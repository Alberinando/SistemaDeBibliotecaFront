"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { Historico, HistoricoPage } from "@/interface/HistoricoPros";
import { FiClock, FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ListaHistorico() {
    const [historicos, setHistoricos] = useState<Historico[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistoricos = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<HistoricoPage>("/v1/historico", {
                params: { page, size: 10 }
            });
            setHistoricos(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements || response.data.content.length);
        } catch (err) {
            console.error(err);
            setError("Falha ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistoricos();
    }, [fetchHistoricos]);

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="skeleton h-6 w-12 rounded" />
                    <div className="skeleton h-6 flex-1 rounded" />
                    <div className="skeleton h-6 w-32 rounded" />
                    <div className="skeleton h-6 w-28 rounded" />
                </div>
            ))}
        </div>
    );

    // Empty State
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
        >
            <div className="empty-state-icon">
                <FiClock size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum registro no histórico
            </h3>
            <p className="text-gray-500">
                O histórico de ações aparecerá aqui conforme movimentações forem realizadas
            </p>
        </motion.div>
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-container"
            >
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Histórico de Empréstimos</h1>
                        {!loading && !error && historicos.length > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                                {totalElements} registro{totalElements !== 1 ? 's' : ''} no histórico
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiAlertTriangle className="text-red-500 text-2xl" />
                        </div>
                        <p className="text-red-500 font-medium">{error}</p>
                        <button
                            onClick={() => fetchHistoricos()}
                            className="mt-4 btn-ghost"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : historicos.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/50">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Livro</th>
                                        <th>Membro</th>
                                        <th>Data da Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicos.map((h, index) => (
                                        <motion.tr
                                            key={h.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="font-mono text-gray-500">
                                                #{h.id}
                                            </td>
                                            <td className="font-medium text-gray-800">
                                                {h.livros.titulo}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-7 h-7 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                        {h.membros.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-600">
                                                        {h.membros.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <FiClock className="text-gray-400" size={14} />
                                                    <span>
                                                        {new Date(h.dataAcao).toLocaleString("pt-BR", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {historicos.map((h, index) => (
                                <motion.div
                                    key={h.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-base">
                                                {h.livros.titulo}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="w-5 h-5 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {h.membros.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-500 text-sm">
                                                    {h.membros.nome}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                            #{h.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500 border-t border-gray-100 pt-3">
                                        <FiClock className="text-gray-400" size={14} />
                                        <span>
                                            {new Date(h.dataAcao).toLocaleString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                disabled={page === 0}
                                className="pagination-btn flex items-center space-x-1 cursor-pointer"
                            >
                                <FiChevronLeft />
                                <span className="hidden sm:inline">Anterior</span>
                            </button>
                            <div className="pagination-info">
                                <span className="hidden sm:inline">Página </span>{page + 1} <span className="hidden sm:inline">de</span><span className="sm:hidden">/</span> {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                disabled={page + 1 >= totalPages}
                                className="pagination-btn flex items-center space-x-1 cursor-pointer"
                            >
                                <span className="hidden sm:inline">Próxima</span>
                                <FiChevronRight />
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </>
    );
}
