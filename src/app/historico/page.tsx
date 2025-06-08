"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { Historico, HistoricoPage } from "@/interface/HistoricoPros";
import {useAuth} from "@/resources/users/authentication.resourse";

export default function ListaHistorico() {
    const [historicos, setHistoricos] = useState<Historico[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();

    const fetchHistoricos = useCallback(async () => {
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();

        try {
            const response = await api.get<HistoricoPage>("/v1/historico", {
                params: { page, size: 10 },
                headers: {
                    "Authorization": `Bearer ${userSession?.accessToken}`
                }
            });
            console.log(response);
            setHistoricos(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
            setError("Falha ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistoricos();
    }, [fetchHistoricos]);

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Histórico de Empréstimos</h1>
            </div>

            {loading ? (
                <p>Carregando histórico...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : historicos.length === 0 ? (
                <div className="text-center py-10">
                    <p className="mb-4">Não há registros de histórico.</p>
                </div>
            ) : (
                <>
                    <table className="min-w-full table-auto border-collapse mb-4">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Livro</th>
                            <th className="px-4 py-2 text-left">Membro</th>
                            <th className="px-4 py-2 text-left">Data da Ação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {historicos.map((h) => (
                            <tr key={h.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{h.id}</td>
                                <td className="px-4 py-2">{h.livros.titulo}</td>
                                <td className="px-4 py-2">{h.membros.nome}</td>
                                <td className="px-4 py-2">
                                    {new Date(h.dataAcao).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Anterior
                        </button>
                        <span>
              Página {page + 1} de {totalPages}
            </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={page + 1 >= totalPages}
                            className="px-3 py-1 bg-blue-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Próxima
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
