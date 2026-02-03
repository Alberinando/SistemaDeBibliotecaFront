"use client"
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { FiEdit2, FiTrash2, FiPlus, FiUsers, FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Membro, MembroPage } from "@/interface/MembrosProps";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListaMembros() {
    const [membros, setMembros] = useState<Membro[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();
    const auth = useAuth();

    const fetchMembros = useCallback(async () => {
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            const response = await api.get<MembroPage>('/v1/membros', {
                params: { page, size: 10 },
                headers: {
                    "Authorization": `Bearer ${userSession?.accessToken}`
                }
            });
            setMembros(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements || response.data.content.length);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar membros.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const handleGlobalShortcuts = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                router.push('/membros/cadastrar');
            }
        };

        window.addEventListener('keydown', handleGlobalShortcuts);
        return () => {
            window.removeEventListener('keydown', handleGlobalShortcuts);
        };
    }, [router]);

    useEffect(() => {
        fetchMembros();
    }, [fetchMembros]);

    useEffect(() => {
        if (!showModal) return;

        const handleModalKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (toDeleteId !== null) {
                    handleDelete();
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                setShowModal(false);
                setToDeleteId(null);
            }
        };

        window.addEventListener('keydown', handleModalKeyDown);
        return () => {
            window.removeEventListener('keydown', handleModalKeyDown);
        };
    }, [showModal, toDeleteId]);

    const handleDelete = async () => {
        if (!toDeleteId) return;
        const userSession = auth.getUserSession();
        try {
            await api.delete(`/v1/membros/${toDeleteId}`, {
                headers: {
                    "Authorization": `Bearer ${userSession?.accessToken}`
                }
            });
            setShowModal(false);
            setToDeleteId(null);
            fetchMembros();
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir membro.');
        }
    };

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="skeleton h-6 w-12 rounded" />
                    <div className="skeleton h-6 flex-1 rounded" />
                    <div className="skeleton h-6 w-48 rounded" />
                    <div className="skeleton h-8 w-20 rounded" />
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
                <FiUsers size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum membro cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
                Comece adicionando o primeiro membro da biblioteca
            </p>
            <Link
                href="/membros/cadastrar"
                className="btn-success inline-flex items-center space-x-2"
            >
                <FiPlus />
                <span>Cadastrar Primeiro Membro</span>
            </Link>
        </motion.div>
    );

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-container"
            >
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Lista de Membros</h1>
                        {!loading && !error && membros.length > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                                {totalElements} membro{totalElements !== 1 ? 's' : ''} cadastrado{totalElements !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/membros/cadastrar"
                        className="btn-gradient flex items-center space-x-2"
                    >
                        <FiPlus />
                        <span>Cadastrar Membro</span>
                    </Link>
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
                            onClick={() => fetchMembros()}
                            className="mt-4 btn-ghost"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : membros.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200/50">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {membros.map((membro, index) => (
                                        <motion.tr
                                            key={membro.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="font-mono text-gray-500">
                                                #{membro.id}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {membro.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-800">
                                                        {membro.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-gray-600">
                                                {membro.email}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={`/membros/${membro.id}`}
                                                        className="action-btn action-btn-edit"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            setToDeleteId(membro.id);
                                                        }}
                                                        className="action-btn action-btn-delete cursor-pointer"
                                                        title="Excluir"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                disabled={page === 0}
                                className="pagination-btn flex items-center space-x-1 cursor-pointer"
                            >
                                <FiChevronLeft />
                                <span>Anterior</span>
                            </button>
                            <div className="pagination-info">
                                Página {page + 1} de {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={page + 1 >= totalPages}
                                className="pagination-btn flex items-center space-x-1 cursor-pointer"
                            >
                                <span>Próxima</span>
                                <FiChevronRight />
                            </button>
                        </div>
                    </>
                )}

                {/* Delete Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="modal-content"
                            >
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 className="text-red-500 text-2xl" />
                                </div>
                                <h2 className="text-xl font-bold text-center mb-2">
                                    Confirmar Exclusão
                                </h2>
                                <p className="text-gray-500 text-center mb-6">
                                    Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setToDeleteId(null);
                                        }}
                                        className="flex-1 btn-ghost cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 btn-danger cursor-pointer"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AuthenticatedPage>
    );
}
