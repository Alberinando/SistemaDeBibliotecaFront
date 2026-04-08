"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { History, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Historico, HistoricoPage } from "@/interface/HistoricoPros";
import { useAuth } from "@/resources/users/authentication.resourse";

function SkeletonTable() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="skeleton h-5 w-12 rounded" />
                    <div className="skeleton h-5 flex-1 rounded" />
                    <div className="skeleton h-5 w-28 rounded" />
                    <div className="skeleton h-5 w-24 rounded" />
                </div>
            ))}
        </div>
    );
}

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
                headers: { "Authorization": `Bearer ${userSession?.accessToken}` }
            });
            setHistoricos(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
            setError("Falha ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchHistoricos(); }, [fetchHistoricos]);

    return (
        <div className="bg-card rounded-lg shadow-card border border-border">
            <div className="px-6 py-5 border-b border-border">
                <h1 className="text-xl font-semibold text-foreground">Histórico</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Registro de ações realizadas nos empréstimos</p>
            </div>

            <div className="p-6">
                {loading ? (
                    <SkeletonTable />
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-[#D92D20]/10 border border-[#D92D20]/20">
                        <AlertCircle size={18} className="text-[#D92D20] flex-shrink-0" />
                        <p className="text-sm text-[#D92D20]">{error}</p>
                    </div>
                ) : historicos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                            <History size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-1">Nenhum registro encontrado</h3>
                        <p className="text-sm text-muted-foreground">O histórico aparecerá conforme empréstimos forem realizados.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Livro</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Membro</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data da Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {historicos.map((h) => (
                                        <tr key={h.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{h.id}</td>
                                            <td className="px-4 py-3 text-sm text-foreground font-medium">{h.livros.titulo}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{h.membros.nome}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(h.dataAcao).toLocaleString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
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
        </div>
    );
}
