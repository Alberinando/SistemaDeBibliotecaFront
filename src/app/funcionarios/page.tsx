"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Pencil, Trash2, Plus, UserCog, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FuncionarioPage, { Funcionario } from "@/interface/FuncionarioProps";
import { motion, AnimatePresence } from 'framer-motion';

// Externalized Static Components
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
                <div className="skeleton h-6 w-12 rounded" />
                <div className="skeleton h-6 flex-1 rounded" />
                <div className="skeleton h-6 w-24 rounded" />
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton h-8 w-20 rounded" />
            </div>
        ))}
    </div>
);

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="empty-state"
    >
        <div className="empty-state-icon">
            <UserCog size={36} />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum funcionário cadastrado
        </h3>
        <p className="text-muted-foreground mb-6">
            Comece adicionando o primeiro funcionário
        </p>
        <Link
            href="/funcionarios/cadastrar"
            className="btn-success inline-flex items-center space-x-2"
        >
            <Plus size={16} />
            <span>Cadastrar Primeiro Funcionário</span>
        </Link>
    </motion.div>
);

export default function ListaFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();

    const fetchFuncionarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<FuncionarioPage>('/v1/funcionario', {
                params: { page, size: 10 }
            });
            setFuncionarios(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements || response.data.content.length);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar funcionários.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const handleGlobalShortcuts = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                router.push('/funcionarios/cadastrar');
            }
        };
        window.addEventListener('keydown', handleGlobalShortcuts);
        return () => {
            window.removeEventListener('keydown', handleGlobalShortcuts);
        };
    }, [router]);

    useEffect(() => {
        fetchFuncionarios();
    }, [fetchFuncionarios]);

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

    const handleDelete = useCallback(async () => {
        if (toDeleteId === null) return;
        try {
            await api.delete(`/v1/funcionario/${toDeleteId}`);
            setShowModal(false);
            setToDeleteId(null);
            fetchFuncionarios();
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir funcionário.');
        }
    }, [toDeleteId, fetchFuncionarios]);

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
                        <h1 className="page-title">Lista de Funcionários</h1>
                        {!loading && !error && funcionarios.length > 0 && (
                            <p className="text-muted-foreground text-sm mt-1">
                                {totalElements} funcionário{totalElements !== 1 ? 's' : ''} cadastrado{totalElements !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/funcionarios/cadastrar"
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Cadastrar Funcionário</span>
                    </Link>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-destructive" size={24} />
                        </div>
                        <p className="text-destructive font-medium">{error}</p>
                        <button
                            onClick={() => fetchFuncionarios()}
                            className="mt-4 btn-ghost"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : funcionarios.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Cargo</th>
                                        <th>Login</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.map((funcionario, index) => (
                                        <motion.tr
                                            key={funcionario.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="font-mono text-muted-foreground">
                                                #{funcionario.id}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {funcionario.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {funcionario.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {funcionario.cargo}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground font-mono text-sm">
                                                {funcionario.login}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={`/funcionarios/${funcionario.id}`}
                                                        className="action-btn action-btn-edit"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            setToDeleteId(funcionario.id);
                                                        }}
                                                        className="action-btn action-btn-delete cursor-pointer"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {funcionarios.map((funcionario, index) => (
                                <motion.div
                                    key={funcionario.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                                                {funcionario.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {funcionario.nome}
                                                </p>
                                                <span className="badge badge-info text-xs">
                                                    {funcionario.cargo}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                            #{funcionario.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="text-muted-foreground/70">Login:</span>{' '}
                                            <span className="font-mono text-foreground">{funcionario.login}</span>
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/funcionarios/${funcionario.id}`}
                                                className="action-btn action-btn-edit"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowModal(true);
                                                    setToDeleteId(funcionario.id);
                                                }}
                                                className="action-btn action-btn-delete cursor-pointer"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
                                <ChevronLeft size={16} />
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
                                <ChevronRight size={16} />
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
                                <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="text-destructive" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-center mb-2">
                                    Confirmar Exclusão
                                </h2>
                                <p className="text-muted-foreground text-center mb-6">
                                    Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
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
