"use client"
import { useState, useEffect, FormEvent } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {useAuth} from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

export default function CreateEmprestimo() {
    const router = useRouter();

    const hoje = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Sao_Paulo",
    });

    const [livroId, setLivroId] = useState<number | "">("");
    const [membroId, setMembroId] = useState<number | "">("");
    const [dataEmprestimo, setDataEmprestimo] = useState<string>(hoje);
    const [dataDevolucao, setDataDevolucao] = useState<string>("");
    const [status, setStatus] = useState<boolean>(true);
    const [livros, setLivros] = useState<{ id: number; titulo: string }[]>([]);
    const [membros, setMembros] = useState<{ id: number; nome: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();

    useEffect(() => {
        async function fetchOptions() {
            const userSession = auth.getUserSession();
            try {
                const livrosResponse = await api.get('/v1/livros/list', {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                const membrosResponse = await api.get('/v1/membros/list', {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                setLivros(livrosResponse.data);
                setMembros(membrosResponse.data);
            } catch (error) {
                console.error(error);
                setError("Falha ao carregar as opções.");
            }
        }
        fetchOptions();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const userSession = auth.getUserSession();
        try {
            const dataEmprestimoISO = new Date(dataEmprestimo + "T00:00:00").toISOString();
            const dataDevolucaoISO = dataDevolucao ? new Date(dataDevolucao + "T00:00:00").toISOString() : null;

            await api.post('/v1/emprestimos', {
                livroId: Number(livroId),
                membroId: Number(membroId),
                dataEmprestimo: dataEmprestimoISO,
                dataDevolucao: dataDevolucaoISO,
                status
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push('/emprestimos');
        } catch (error) {
            console.error(error);
            setError("Erro ao cadastrar empréstimo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedPage>
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Cadastrar Novo Empréstimo</h1>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dropdown para Livro */}
                <div>
                    <label htmlFor="livro" className="block text-lg font-semibold mb-2 cursor-pointer">
                        Livro
                    </label>
                    <div className="relative">
                        <select
                            id="livro"
                            value={livroId}
                            onChange={(e) => setLivroId(Number(e.target.value))}
                            required
                            className="cursor-pointer appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            <option value="">Selecione um livro</option>
                            {livros.map((livro) => (
                                <option key={livro.id} value={livro.id}>
                                    {livro.titulo}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Dropdown para Membro */}
                <div>
                    <label htmlFor="membro" className="block text-lg font-semibold mb-2 cursor-pointer">
                        Membro
                    </label>
                    <div className="relative">
                        <select
                            id="membro"
                            value={membroId}
                            onChange={(e) => setMembroId(Number(e.target.value))}
                            required
                            className="cursor-pointer appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            <option value="">Selecione um membro</option>
                            {membros.map((membro) => (
                                <option key={membro.id} value={membro.id}>
                                    {membro.nome}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Data de Empréstimo */}
                <div>
                    <label htmlFor="dataEmprestimo" className="block text-lg font-semibold mb-2">
                        Data de Empréstimo
                    </label>
                    <input
                        id="dataEmprestimo"
                        type="date"
                        value={dataEmprestimo}
                        onChange={(e) => setDataEmprestimo(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Data de Devolução */}
                <div>
                    <label htmlFor="dataDevolucao" className="block text-lg font-semibold mb-2">
                        Data de Devolução
                    </label>
                    <input
                        id="dataDevolucao"
                        type="date"
                        value={dataDevolucao}
                        onChange={(e) => setDataDevolucao(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Status */}
                <div>
                    {/* Envolvemos o switch inteiro em um label para que toda a área seja clicável */}
                    <label htmlFor="status" className="flex items-center cursor-pointer">
                        <span className="text-lg font-semibold mr-3">Status</span>
                        <div className="relative">
                            <input
                                id="status"
                                type="checkbox"
                                checked={status}
                                onChange={(e) => setStatus(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition"></div>
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                        <span className="ml-3 text-lg font-medium">{status ? "Ativo" : "Inativo"}</span>
                    </label>
                </div>

                {/* Botões */}
                <div className="flex justify-between items-center mt-8">
                    <Link
                        href="/emprestimos"
                        className="cursor-pointer px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition"
                    >
                        Voltar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
        </div>
            </AuthenticatedPage>
    );
}
