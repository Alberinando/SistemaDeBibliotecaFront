"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { ArrowLeft, BookOpen, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import EmprestimoResponseDTO from '@/interface/EmprestimoResponseDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmprestimoPage {
    content: EmprestimoResponseDTO[];
    totalPages: number;
    totalElements: number;
}

// Externalized Static Component
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-xl">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-24 rounded ml-auto" />
            </div>
        ))}
    </div>
);

export default function HistoricoMembro() {
    const params = useParams();
    const id = Number(params?.id);
    const router = useRouter();
    const auth = useAuth();

    const [emprestimos, setEmprestimos] = useState<EmprestimoResponseDTO[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [membroNome, setMembroNome] = useState<string>("");

    // Buscar nome do membro (opcional, para exibir no título)
    useEffect(() => {
        if (!id) return;
        api.get(`/v1/membros/${id}`, {
            headers: { "Authorization": `Bearer ${auth.getUserSession()?.accessToken}` }
        }).then(res => setMembroNome(res.data.nome))
            .catch(() => setMembroNome("Membro"));
    }, [id, auth]);

    const fetchHistorico = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userSession = auth.getUserSession();
            const response = await api.get<EmprestimoPage>(`/v1/emprestimos/membro/${id}`, {
                params: { page, size: 10, sort: 'dataEmprestimo,desc' },
                headers: {
                    "Authorization": `Bearer ${userSession?.accessToken}`
                }
            });
            setEmprestimos(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar histórico.');
        } finally {
            setLoading(false);
        }
    }, [id, page, auth]);

    useEffect(() => {
        if (id) {
            fetchHistorico();
        }
    }, [fetchHistorico, id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ATIVO':
                return <span className="badge badge-info">Em Aberto</span>;
            case 'DEVOLVIDO':
                return <span className="badge badge-success">Devolvido</span>;
            case 'ATRASADO':
                return <span className="badge badge-danger">Atrasado</span>;
            default:
                return <span className="badge badge-warning">{status}</span>;
        }
    };

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-container"
            >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link
                        href="/membros"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Histórico de Empréstimos</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {membroNome ? `Histórico de ${membroNome}` : 'Carregando...'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/10">
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive/60 mb-4" />
                        <h3 className="text-lg font-medium text-destructive">Erro ao carregar histórico</h3>
                        <p className="text-destructive/80 mt-2">{error}</p>
                    </div>
                ) : emprestimos.length === 0 ? (
                    <div className="text-center py-16 bg-muted/50 rounded-2xl border border-border border-dashed">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-muted-foreground" size={28} />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Nenhum histórico encontrado</h3>
                        <p className="text-muted-foreground mt-1">Este membro ainda não realizou nenhum empréstimo.</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">Livro</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">Data Empréstimo</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">Data Devolução</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {emprestimos.map((emp) => {
                                        const isLate = emp.status && emp.dataDevolucao && new Date(emp.dataDevolucao) < new Date();
                                        return (
                                            <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <BookOpen size={16} />
                                                        </div>
                                                        <span className="font-medium text-foreground">{emp.livros.titulo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {format(new Date(emp.dataEmprestimo), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {emp.dataDevolucao
                                                        ? format(new Date(emp.dataDevolucao), "dd 'de' MMM, yyyy", { locale: ptBR })
                                                        : <span className="text-muted-foreground/50">-</span>
                                                    }
                                                    {emp.status && (
                                                        <span className="text-xs text-muted-foreground/70 block">
                                                            (Prevista)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {emp.status ? (
                                                        isLate ? (
                                                            <span className="badge badge-danger">Atrasado</span>
                                                        ) : (
                                                            <span className="badge badge-info">Em Aberto</span>
                                                        )
                                                    ) : (
                                                        <span className="badge badge-success">Devolvido</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
                            <span className="text-sm text-muted-foreground">
                                Página {page + 1} de {totalPages}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AuthenticatedPage>
    );
}
