"use client"
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { FiEdit2, FiTrash2, FiPlus, FiRepeat, FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Emprestimo, EmprestimoPage } from "@/interface/EmprestimoPros";
import { motion, AnimatePresence } from 'framer-motion';

export default function ListaEmprestimos() {
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();

    const fetchEmprestimos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<EmprestimoPage>('/v1/emprestimos', {
                params: { page, size: 10 }
            });
            const emprestimosTransformed = response.data.content.map(emprestimo => ({
                ...emprestimo,
                dataDevolucao: emprestimo.dataDevolucao ?? ''
            }));
            setEmprestimos(emprestimosTransformed);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements || response.data.content.length);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar empréstimos.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const handleGlobalShortcuts = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                router.push('/emprestimos/cadastrar');
            }
        };

        window.addEventListener('keydown', handleGlobalShortcuts);
        return () => {
            window.removeEventListener('keydown', handleGlobalShortcuts);
        };
    }, [router]);

    useEffect(() => {
        fetchEmprestimos();
    }, [fetchEmprestimos]);

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
        try {
            await api.delete(`/v1/emprestimos/${toDeleteId}`);
            setShowModal(false);
            setToDeleteId(null);
            fetchEmprestimos();
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir empréstimo.');
        }
    };

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="skeleton h-6 w-12 rounded" />
                    <div className="skeleton h-6 flex-1 rounded" />
                    <div className="skeleton h-6 w-32 rounded" />
                    <div className="skeleton h-6 w-24 rounded" />
                    <div className="skeleton h-6 w-24 rounded" />
                    <div className="skeleton h-6 w-20 rounded" />
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
                <FiRepeat size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum empréstimo registrado
            </h3>
            <p className="text-gray-500 mb-6">
                Comece registrando o primeiro empréstimo
            </p>
            <Link
                href="/emprestimos/cadastrar"
                className="btn-success inline-flex items-center space-x-2"
            >
                <FiPlus />
                <span>Cadastrar Primeiro Empréstimo</span>
            </Link>
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
                        <h1 className="page-title">Lista de Empréstimos</h1>
                        {!loading && !error && emprestimos.length > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                                {totalElements} empréstimo{totalElements !== 1 ? 's' : ''} registrado{totalElements !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/emprestimos/cadastrar"
                        className="btn-gradient flex items-center space-x-2"
                    >
                        <FiPlus />
                        <span>Cadastrar Empréstimo</span>
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
                            onClick={() => fetchEmprestimos()}
                            className="mt-4 btn-ghost"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : emprestimos.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200/50">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Livro</th>
                                        <th>Membro</th>
                                        <th>Data Empréstimo</th>
                                        <th>Data Devolução</th>
                                        <th>Status</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emprestimos.map((emprestimo, index) => (
                                        <motion.tr
                                            key={emprestimo.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="font-mono text-gray-500">
                                                #{emprestimo.id}
                                            </td>
                                            <td className="font-medium text-gray-800">
                                                {emprestimo.livros.titulo}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                        {emprestimo.membros.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-600">
                                                        {emprestimo.membros.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-gray-600">
                                                {new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="text-gray-600">
                                                {emprestimo.dataDevolucao === ''
                                                    ? <span className="text-gray-400">—</span>
                                                    : new Date(emprestimo.dataDevolucao).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td>
                                                <span className={`badge ${emprestimo.status ? 'badge-success' : 'badge-warning'}`}>
                                                    {emprestimo.status ? 'Ativo' : 'Encerrado'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={`/emprestimos/${emprestimo.id}`}
                                                        className="action-btn action-btn-edit"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            setToDeleteId(emprestimo.id);
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

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-3">
                            {emprestimos.map((emprestimo, index) => (
                                <motion.div
                                    key={emprestimo.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-base">
                                                {emprestimo.livros.titulo}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {emprestimo.membros.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-500 text-sm">
                                                    {emprestimo.membros.nome}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                #{emprestimo.id}
                                            </span>
                                            <span className={`badge text-xs ${emprestimo.status ? 'badge-success' : 'badge-warning'}`}>
                                                {emprestimo.status ? 'Ativo' : 'Encerrado'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3 border-t border-gray-100 pt-3">
                                        <div>
                                            <span className="text-gray-400">Empréstimo:</span>{' '}
                                            <span className="font-medium text-gray-600">
                                                {new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Devolução:</span>{' '}
                                            <span className="font-medium text-gray-600">
                                                {emprestimo.dataDevolucao === '' ? '—' : new Date(emprestimo.dataDevolucao).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2 border-t border-gray-100 pt-3">
                                        <Link
                                            href={`/emprestimos/${emprestimo.id}`}
                                            className="action-btn action-btn-edit"
                                            title="Editar"
                                        >
                                            <FiEdit2 size={16} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowModal(true);
                                                setToDeleteId(emprestimo.id);
                                            }}
                                            className="action-btn action-btn-delete cursor-pointer"
                                            title="Excluir"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
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
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={page + 1 >= totalPages}
                                className="pagination-btn flex items-center space-x-1 cursor-pointer"
                            >
                                <span className="hidden sm:inline">Próxima</span>
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
                                    Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.
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
        </>
    );
}
