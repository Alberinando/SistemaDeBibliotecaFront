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
                    params: { page: 0, size: 3, sort: 'dataEmprestimo,desc' }
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

    const LoadingSkeleton = () => (
        <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                    <div className="skeleton h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                        <div className="skeleton h-5 w-32 rounded" />
                        <div className="skeleton h-3 w-20 rounded" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="skeleton h-3 w-16 rounded mb-1" />
                        <div className="skeleton h-4 w-full rounded" />
                    </div>
                ))}
            </div>
        </div>
    );

    const emprestimosAtivos = emprestimos.filter(e => e.status === true).length;

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <Link
                            href="/membros"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={16} />
                        </Link>
                        <h1 className="text-base font-semibold text-gray-800">Detalhes do Membro</h1>
                    </div>
                    {membro && (
                        <Link
                            href={`/membros/${id}/editar`}
                            className="flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            <FiEdit2 size={12} />
                            <span>Editar</span>
                        </Link>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
                        <FiAlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                ) : membro && (
                    <div className="space-y-3">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-12" />
                            <div className="px-4 pb-3 -mt-6">
                                <div className="flex items-end space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md border-2 border-white flex-shrink-0">
                                        {membro.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="pb-1 min-w-0">
                                        <h2 className="text-base font-bold text-gray-800 truncate">{membro.nome}</h2>
                                        <p className="text-gray-500 text-xs">ID: #{membro.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Cards - Grid 2x2 compacto */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center space-x-2">
                                <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <FiMail size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">E-mail</p>
                                    <p className="font-medium text-gray-800 text-xs truncate">{membro.email}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center space-x-2">
                                <div className="w-7 h-7 bg-green-50 rounded-md flex items-center justify-center text-green-600 flex-shrink-0">
                                    <FiPhone size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Telefone</p>
                                    <p className="font-medium text-gray-800 text-xs">{formatTelefone(String(membro.telefone))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center space-x-2">
                                <div className="w-7 h-7 bg-purple-50 rounded-md flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <FiCreditCard size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">CPF</p>
                                    <p className="font-medium text-gray-800 text-xs">{formatCpf(String(membro.cpf))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center space-x-2">
                                <div className="w-7 h-7 bg-amber-50 rounded-md flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <FiBook size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Empréstimos</p>
                                    <p className="font-medium text-gray-800 text-xs">
                                        {totalEmprestimos} total • {emprestimosAtivos} ativo
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Loans - Compacto */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FiClock size={12} className="text-indigo-600" />
                                    <h3 className="font-medium text-gray-800 text-xs">Empréstimos Recentes</h3>
                                </div>
                                {totalEmprestimos > 3 && (
                                    <Link
                                        href={`/membros/${id}/historico`}
                                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Ver todos →
                                    </Link>
                                )}
                            </div>

                            {emprestimos.length === 0 ? (
                                <div className="py-4 text-center text-gray-500">
                                    <FiBook className="mx-auto h-6 w-6 text-gray-300 mb-1" />
                                    <p className="text-xs">Nenhum empréstimo</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {emprestimos.map((emp) => {
                                        const isLate = emp.status && emp.dataDevolucao && new Date(emp.dataDevolucao) < new Date();
                                        return (
                                            <div key={emp.id} className="px-3 py-2 flex items-center justify-between">
                                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                    <FiBook size={12} className="text-indigo-500 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-gray-800 text-xs truncate">{emp.livros.titulo}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {format(new Date(emp.dataEmprestimo), "dd MMM yyyy", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 ml-2">
                                                    {emp.status ? (
                                                        isLate ? (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-700">Atrasado</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-700">Aberto</span>
                                                        )
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-700">Devolvido</span>
                                                    )}
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
