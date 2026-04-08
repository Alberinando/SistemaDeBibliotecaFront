"use client"
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Pencil, Trash2, Plus, BookOpen, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Livro, LivroPage } from "@/interface/LivroPros";
import { motion, AnimatePresence } from 'framer-motion';

// Externalized Static Components
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
                <div className="skeleton h-6 w-12 rounded" />
                <div className="skeleton h-6 flex-1 rounded" />
                <div className="skeleton h-6 w-24 rounded" />
                <div className="skeleton h-6 w-20 rounded" />
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
            <BookOpen size={36} />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum livro cadastrado
        </h3>
        <p className="text-muted-foreground mb-6">
            Comece adicionando o primeiro livro ao acervo
        </p>
        <Link
            href="/livros/cadastrar"
            className="btn-success inline-flex items-center space-x-2"
        >
            <Plus size={16} />
            <span>Cadastrar Primeiro Livro</span>
        </Link>
    </motion.div>
);

export default function ListaLivros() {
    const [livros, setLivros] = useState<Livro[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();

    const fetchLivros = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<LivroPage>('/v1/livros', {
                params: { page, size: 10 }
            });
            setLivros(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements || response.data.content.length);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar livros.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const handleGlobalShortcuts = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                router.push('/livros/cadastrar');
            }
        };
        window.addEventListener('keydown', handleGlobalShortcuts);
        return () => {
            window.removeEventListener('keydown', handleGlobalShortcuts);
        };
    }, [router]);

    useEffect(() => {
        fetchLivros();
    }, [fetchLivros]);

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
            await api.delete(`/v1/livros/${toDeleteId}`);
            setShowModal(false);
            setToDeleteId(null);
            fetchLivros();
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir livro.');
        }
    }, [toDeleteId, fetchLivros]);

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
                        <h1 className="page-title">Lista de Livros</h1>
                        {!loading && !error && livros.length > 0 && (
                            <p className="text-muted-foreground text-sm mt-1">
                                {totalElements} livro{totalElements !== 1 ? 's' : ''} cadastrado{totalElements !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/livros/cadastrar"
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Cadastrar Livro</span>
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
                            onClick={() => fetchLivros()}
                            className="mt-4 btn-ghost"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : livros.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Autor</th>
                                        <th>Ano</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {livros.map((livro, index) => (
                                        <motion.tr
                                            key={livro.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="font-mono text-muted-foreground">
                                                #{livro.id}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                        <BookOpen size={16} />
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {livro.titulo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-muted-foreground">
                                                {livro.autor}
                                            </td>
                                            <td className="text-muted-foreground font-mono">
                                                {livro.anoPublicacao}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={`/livros/${livro.id}`}
                                                        className="action-btn action-btn-edit"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            setToDeleteId(livro.id);
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
                            {livros.map((livro, index) => (
                                <motion.div
                                    key={livro.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground text-base">
                                                {livro.titulo}
                                            </p>
                                            <p className="text-muted-foreground text-sm mt-1">
                                                {livro.autor}
                                            </p>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            #{livro.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="text-sm text-muted-foreground">
                                            Ano: <span className="font-mono text-foreground">{livro.anoPublicacao}</span>
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/livros/${livro.id}`}
                                                className="action-btn action-btn-edit"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowModal(true);
                                                    setToDeleteId(livro.id);
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
                                    Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.
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
