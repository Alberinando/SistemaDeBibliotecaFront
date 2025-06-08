"use client"
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Emprestimo, EmprestimoPage } from "@/interface/EmprestimoPros";
import {useAuth} from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

export default function ListaEmprestimos() {
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const router = useRouter();
    const auth = useAuth();

    const fetchEmprestimos = useCallback(async () => {
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            const response = await api.get<EmprestimoPage>('/v1/emprestimos', {
                params: { page, size: 10 },
                headers: {
                    "Authorization": `Bearer ${userSession?.accessToken}`
                }
            });
            const emprestimosTransformed = response.data.content.map(emprestimo => ({
                ...emprestimo,
                dataDevolucao: emprestimo.dataDevolucao ?? ''
            }));
            setEmprestimos(emprestimosTransformed);
            setTotalPages(response.data.totalPages);
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
        const userSession = auth.getUserSession();
        try {
            await api.delete(`/v1/emprestimos/${toDeleteId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            setShowModal(false);
            setToDeleteId(null);
            fetchEmprestimos();
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir empréstimo.');
        }
    };

    return (
        <AuthenticatedPage>
            <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Lista de Empréstimos</h1>
                <Link href="/emprestimos/cadastrar" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Cadastrar Empréstimo
                </Link>
            </div>

            {loading ? (
                <p>Carregando empréstimos...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : emprestimos.length === 0 ? (
                <div className="text-center py-10">
                    <p className="mb-4">Não há empréstimos cadastrados.</p>
                    <Link
                        href="/emprestimos/cadastrar"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Cadastrar Primeiro Empréstimo
                    </Link>
                </div>
            ) : (
                <>
                    <table className="min-w-full table-auto border-collapse mb-4">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Livro</th>
                            <th className="px-4 py-2 text-left">Membro</th>
                            <th className="px-4 py-2 text-left">Data de Empréstimo</th>
                            <th className="px-4 py-2 text-left">Data de Devolução</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-center">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {emprestimos.map(emprestimo => (
                            <tr key={emprestimo.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{emprestimo.id}</td>
                                <td className="px-4 py-2">{emprestimo.livros.titulo}</td>
                                <td className="px-4 py-2">{emprestimo.membros.nome}</td>
                                <td className="px-4 py-2">
                                    {new Date(emprestimo.dataEmprestimo).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2">
                                    {emprestimo.dataDevolucao === ''
                                        ? ''
                                        : new Date(emprestimo.dataDevolucao).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2">{emprestimo.status ? 'Ativo' : 'Encerrado'}</td>
                                <td className="px-4 py-2 flex justify-center space-x-3">
                                    <Link href={`/emprestimos/${emprestimo.id}`} className="hover:text-blue-600">
                                        <FiEdit2 size={20} />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowModal(true);
                                            setToDeleteId(emprestimo.id);
                                        }}
                                        className="hover:text-red-600 cursor-pointer"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Anterior
                        </button>
                        <span>
              Página {page + 1} de {totalPages}
            </span>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={page + 1 >= totalPages}
                            className="px-3 py-1 bg-blue-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Próxima
                        </button>
                    </div>
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-70"></div>
                    <div className="relative z-20 bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
                        <p className="mb-6">Tem certeza que deseja excluir este empréstimo?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setToDeleteId(null);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AuthenticatedPage>
    );
}
