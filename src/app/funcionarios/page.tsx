"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Pencil, Trash2, Plus, UserCog, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/resources/users/authentication.resourse";
import FuncionarioPage, { Funcionario } from "@/interface/FuncionarioProps";

function SkeletonTable() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="skeleton h-5 w-12 rounded" />
                    <div className="skeleton h-5 flex-1 rounded" />
                    <div className="skeleton h-5 w-28 rounded" />
                    <div className="skeleton h-5 w-28 rounded" />
                    <div className="skeleton h-5 w-20 rounded" />
                </div>
            ))}
        </div>
    );
}

export default function ListaFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();
    const auth = useAuth();

    const fetchFuncionarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            const response = await api.get<FuncionarioPage>('/v1/funcionario', {
                params: { page, size: 10 },
                headers: { "Authorization": `Bearer ${userSession?.accessToken}` }
            });
            setFuncionarios(response.data.content);
            setTotalPages(response.data.totalPages);
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
        return () => window.removeEventListener('keydown', handleGlobalShortcuts);
    }, [router]);

    useEffect(() => { fetchFuncionarios(); }, [fetchFuncionarios]);

    useEffect(() => {
        if (!showModal) return;
        const handleModalKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && toDeleteId !== null) handleDelete();
            else if (event.key === 'Escape') { setShowModal(false); setToDeleteId(null); }
        };
        window.addEventListener('keydown', handleModalKeyDown);
        return () => window.removeEventListener('keydown', handleModalKeyDown);
    }, [showModal, toDeleteId]);

    const handleDelete = async () => {
        if (toDeleteId === null) return;
        try {
            const userSession = auth.getUserSession();
            await api.delete(`/v1/funcionario/${toDeleteId}`, {
                headers: { "Authorization": `Bearer ${userSession?.accessToken}` }
            });
            setShowModal(false);
            setToDeleteId(null);
            fetchFuncionarios();
        } catch (err) {
            console.error(err);
            setError('Erro ao excluir funcionário.');
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-card border border-border">
            <div className="flex justify-between items-center px-6 py-5 border-b border-border">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Funcionários</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie a equipe da biblioteca</p>
                </div>
                <Link
                    href="/funcionarios/cadastrar"
                    className="inline-flex items-center gap-2 h-10 px-4 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    Cadastrar
                </Link>
            </div>

            <div className="p-6">
                {loading ? (
                    <SkeletonTable />
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-[#D92D20]/10 border border-[#D92D20]/20">
                        <AlertCircle size={18} className="text-[#D92D20] flex-shrink-0" />
                        <p className="text-sm text-[#D92D20]">{error}</p>
                    </div>
                ) : funcionarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                            <UserCog size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-1">Nenhum funcionário cadastrado</h3>
                        <p className="text-sm text-muted-foreground mb-5">Comece adicionando o primeiro funcionário.</p>
                        <Link
                            href="/funcionarios/cadastrar"
                            className="inline-flex items-center gap-2 h-10 px-4 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} />
                            Cadastrar Funcionário
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cargo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Login</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {funcionarios.map(func => (
                                        <tr key={func.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{func.id}</td>
                                            <td className="px-4 py-3 text-sm text-foreground font-medium">{func.nome}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{func.cargo}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{func.login}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-1">
                                                    <Link href={`/funcionarios/${func.id}`} className="p-2 rounded-md text-muted-foreground hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button onClick={() => { setShowModal(true); setToDeleteId(func.id); }}
                                                        className="p-2 rounded-md text-muted-foreground hover:text-[#D92D20] hover:bg-[#D92D20]/10 transition-colors cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                            <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}
                                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page + 1 >= totalPages}
                                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                                Próxima <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => { setShowModal(false); setToDeleteId(null); }} />
                    <div className="relative z-10 bg-card p-6 rounded-lg shadow-modal w-[400px] max-w-[90vw] border border-border">
                        <div className="w-11 h-11 rounded-full bg-[#D92D20]/10 flex items-center justify-center mb-4">
                            <Trash2 size={20} className="text-[#D92D20]" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-1">Excluir funcionário</h2>
                        <p className="text-sm text-muted-foreground mb-6">Esta ação é irreversível. O funcionário será removido permanentemente do sistema.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowModal(false); setToDeleteId(null); }}
                                className="h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                Voltar
                            </button>
                            <button onClick={handleDelete}
                                className="h-10 px-4 text-sm font-medium text-white bg-[#D92D20] rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
                                Sim, excluir funcionário
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
