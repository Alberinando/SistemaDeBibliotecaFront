"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { FiArrowLeft, FiBook, FiPhone, FiMail, FiCreditCard, FiEdit2, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import EmprestimoResponseDTO from '@/interface/EmprestimoResponseDTO';
import { Membro } from '@/interface/MembrosProps';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import formatTelefone from '@/util/formatTelefone';
import formatCpf from '@/util/formatCpf';

interface EmprestimoPage {
    content: EmprestimoResponseDTO[];
    totalPages: number;
    totalElements: number;
}

export default function DetalhesMembro() {
    const params = useParams();
    const id = Number(params?.id);

    const [membro, setMembro] = useState<Membro | null>(null);
    const [emprestimos, setEmprestimos] = useState<EmprestimoResponseDTO[]>([]);
    const [totalEmprestimos, setTotalEmprestimos] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembro = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [membroRes, emprestimosRes] = await Promise.all([
                api.get<Membro>(`/v1/membros/${id}`),
                api.get<EmprestimoPage>(`/v1/emprestimos/membro/${id}`, {
                    params: { page: 0, size: 5, sort: 'dataEmprestimo,desc' }
                })
            ]);
            setMembro(membroRes.data);
            setEmprestimos(emprestimosRes.data.content);
            setTotalEmprestimos(emprestimosRes.data.totalElements);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar dados do membro.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchMembro();
        }
    }, [fetchMembro, id]);

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="skeleton h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl" />
                    <div className="space-y-2">
                        <div className="skeleton h-5 sm:h-6 w-32 sm:w-48 rounded" />
                        <div className="skeleton h-3 sm:h-4 w-20 sm:w-32 rounded" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                        <div className="skeleton h-3 sm:h-4 w-16 sm:w-20 rounded mb-2" />
                        <div className="skeleton h-4 sm:h-5 w-full rounded" />
                    </div>
                ))}
            </div>
        </div>
    );

    const emprestimosAtivos = emprestimos.filter(e => e.status === true).length;

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-container max-w-2xl mx-auto px-3 sm:px-4"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <Link
                            href="/membros"
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
                        >
                            <FiArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Detalhes do Membro</h1>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Visualize as informações e histórico
                            </p>
                        </div>
                    </div>
                    {membro && (
                        <Link
                            href={`/membros/${id}/editar`}
                            className="btn-gradient flex items-center justify-center space-x-2 text-sm py-2 px-4 w-full sm:w-auto"
                        >
                            <FiEdit2 size={14} />
                            <span>Editar</span>
                        </Link>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-8 sm:py-12 bg-red-50 rounded-xl border border-red-100">
                        <FiAlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-400 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-red-800">Erro ao carregar</h3>
                        <p className="text-red-600 mt-2 text-sm">{error}</p>
                    </div>
                ) : membro && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-16 sm:h-24" />
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-8 sm:-mt-12">
                                <div className="flex items-end space-x-3 sm:space-x-4">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-3xl font-bold shadow-lg border-3 sm:border-4 border-white flex-shrink-0">
                                        {membro.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="pb-1 sm:pb-2 min-w-0">
                                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{membro.nome}</h2>
                                        <p className="text-gray-500 text-xs sm:text-sm">ID: #{membro.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <FiMail size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">E-mail</p>
                                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{membro.email}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                                    <FiPhone size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Telefone</p>
                                    <p className="font-medium text-gray-800 font-mono text-sm sm:text-base">{formatTelefone(String(membro.telefone))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <FiCreditCard size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">CPF</p>
                                    <p className="font-medium text-gray-800 font-mono text-sm sm:text-base">{formatCpf(String(membro.cpf))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <FiBook size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Empréstimos</p>
                                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                                        {totalEmprestimos} total • {emprestimosAtivos} ativo{emprestimosAtivos !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Loans */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <FiClock size={14} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Empréstimos Recentes</h3>
                                </div>
                                {totalEmprestimos > 5 && (
                                    <Link
                                        href={`/membros/${id}/historico`}
                                        className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Ver todos →
                                    </Link>
                                )}
                            </div>

                            {emprestimos.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                    <FiBook className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-2 sm:mb-3" />
                                    <p className="text-sm sm:text-base">Nenhum empréstimo registrado</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {emprestimos.map((emp) => {
                                        const isLate = emp.status && emp.dataDevolucao && new Date(emp.dataDevolucao) < new Date();
                                        return (
                                            <div key={emp.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                            <FiBook size={12} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{emp.livros.titulo}</p>
                                                            <p className="text-[10px] sm:text-xs text-gray-500">
                                                                {format(new Date(emp.dataEmprestimo), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {emp.status ? (
                                                            isLate ? (
                                                                <span className="badge badge-danger text-[10px] sm:text-xs">Atrasado</span>
                                                            ) : (
                                                                <span className="badge badge-info text-[10px] sm:text-xs">Em Aberto</span>
                                                            )
                                                        ) : (
                                                            <span className="badge badge-success text-[10px] sm:text-xs">Devolvido</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AuthenticatedPage>
    );
}
