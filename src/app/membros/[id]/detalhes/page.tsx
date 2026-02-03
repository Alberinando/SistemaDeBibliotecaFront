"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { FiArrowLeft, FiBook, FiUser, FiPhone, FiMail, FiCreditCard, FiEdit2, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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
    const auth = useAuth();

    const [membro, setMembro] = useState<Membro | null>(null);
    const [emprestimos, setEmprestimos] = useState<EmprestimoResponseDTO[]>([]);
    const [totalEmprestimos, setTotalEmprestimos] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembro = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userSession = auth.getUserSession();
            const [membroRes, emprestimosRes] = await Promise.all([
                api.get<Membro>(`/v1/membros/${id}`, {
                    headers: { "Authorization": `Bearer ${userSession?.accessToken}` }
                }),
                api.get<EmprestimoPage>(`/v1/emprestimos/membro/${id}`, {
                    params: { page: 0, size: 5, sort: 'dataEmprestimo,desc' },
                    headers: { "Authorization": `Bearer ${userSession?.accessToken}` }
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
    }, [id, auth]);

    useEffect(() => {
        if (id) {
            fetchMembro();
        }
    }, [fetchMembro, id]);

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                    <div className="skeleton h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <div className="skeleton h-6 w-48 rounded" />
                        <div className="skeleton h-4 w-32 rounded" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="skeleton h-4 w-20 rounded mb-2" />
                        <div className="skeleton h-5 w-full rounded" />
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
                className="page-container max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/membros"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Detalhes do Membro</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Visualize as informações e histórico
                            </p>
                        </div>
                    </div>
                    {membro && (
                        <Link
                            href={`/membros/${id}/editar`}
                            className="btn-gradient flex items-center space-x-2"
                        >
                            <FiEdit2 size={16} />
                            <span>Editar</span>
                        </Link>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                        <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-red-800">Erro ao carregar</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                    </div>
                ) : membro && (
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24" />
                            <div className="px-6 pb-6 -mt-12">
                                <div className="flex items-end space-x-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                                        {membro.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="pb-2">
                                        <h2 className="text-2xl font-bold text-gray-800">{membro.nome}</h2>
                                        <p className="text-gray-500 text-sm">ID: #{membro.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <FiMail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">E-mail</p>
                                    <p className="font-medium text-gray-800">{membro.email}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center space-x-4">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                    <FiPhone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Telefone</p>
                                    <p className="font-medium text-gray-800 font-mono">{formatTelefone(String(membro.telefone))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center space-x-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                    <FiCreditCard size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">CPF</p>
                                    <p className="font-medium text-gray-800 font-mono">{formatCpf(String(membro.cpf))}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center space-x-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                    <FiBook size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Empréstimos</p>
                                    <p className="font-medium text-gray-800">
                                        {totalEmprestimos} total • {emprestimosAtivos} ativo{emprestimosAtivos !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Loans */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <FiClock size={16} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Empréstimos Recentes</h3>
                                </div>
                                {totalEmprestimos > 5 && (
                                    <Link
                                        href={`/membros/${id}/historico`}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Ver todos →
                                    </Link>
                                )}
                            </div>

                            {emprestimos.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FiBook className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                    <p>Nenhum empréstimo registrado</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {emprestimos.map((emp) => {
                                        const isLate = emp.status && emp.dataDevolucao && new Date(emp.dataDevolucao) < new Date();
                                        return (
                                            <div key={emp.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <FiBook size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{emp.livros.titulo}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {format(new Date(emp.dataEmprestimo), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {emp.status ? (
                                                            isLate ? (
                                                                <span className="badge badge-danger">Atrasado</span>
                                                            ) : (
                                                                <span className="badge badge-info">Em Aberto</span>
                                                            )
                                                        ) : (
                                                            <span className="badge badge-success">Devolvido</span>
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
