"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { FiArrowLeft, FiBook, FiCalendar, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import EmprestimoResponseDTO from '@/interface/EmprestimoResponseDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmprestimoPage {
    content: EmprestimoResponseDTO[];
    totalPages: number;
    totalElements: number;
}

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
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Histórico de Empréstimos</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {membroNome ? `Histórico de ${membroNome}` : 'Carregando...'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
                                <div className="skeleton h-10 w-10 rounded-full" />
                                <div className="skeleton h-4 w-48 rounded" />
                                <div className="skeleton h-4 w-24 rounded ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                        <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-red-800">Erro ao carregar histórico</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                    </div>
                ) : emprestimos.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiClock className="text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum histórico encontrado</h3>
                        <p className="text-gray-500 mt-1">Este membro ainda não realizou nenhum empréstimo.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Livro</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Data Empréstimo</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Data Devolução</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {emprestimos.map((emp) => {
                                        const isLate = emp.status && emp.dataDevolucao && new Date(emp.dataDevolucao) < new Date();
                                        return (
                                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <FiBook />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{emp.livros.titulo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {format(new Date(emp.dataEmprestimo), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {emp.dataDevolucao
                                                        ? format(new Date(emp.dataDevolucao), "dd 'de' MMM, yyyy", { locale: ptBR })
                                                        : <span className="text-gray-400">-</span>
                                                    }
                                                    {emp.status && (
                                                        <span className="text-xs text-gray-400 block">
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
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <span className="text-sm text-gray-500">
                                Página {page + 1} de {totalPages}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1 text-sm border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-3 py-1 text-sm border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
