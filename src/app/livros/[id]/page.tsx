"use client"
import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import formatIsbn from "@/util/FormarIsbn";
import {useAuth} from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

export default function EditarLivro() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [titulo, setTitulo] = useState<string>('');
    const [autor, setAutor] = useState<string>('');
    const [categoria, setCategoria] = useState<string>('');
    const [quantidade, setQuantidade] = useState<number | "">("");
    const [disponibilidade, setDisponibilidade] = useState<boolean>(true);
    const [isbn, setIsbn] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();

    useEffect(() => {
        async function fetchLivro() {
            try {
                const userSession = auth.getUserSession();
                const response = await api.get(`/v1/livros/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                const livro = response.data;
                setTitulo(livro.titulo);
                setAutor(livro.autor);
                setCategoria(livro.categoria);
                setDisponibilidade(livro.disponibilidade);
                setIsbn(formatIsbn(String(livro.isbn)));
                setQuantidade(livro.quantidade);
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar dados do livro.');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchLivro();
    }, [id]);

    const handleIsbnChange = (value: string) => {
        const raw = value.replace(/\D/g, '');
        setIsbn(formatIsbn(raw));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            const rawIsbn = isbn.replace(/\D/g, '');
            await api.put(`/v1/livros`, {
                id,
                titulo,
                autor,
                categoria,
                disponibilidade,
                isbn: Number(rawIsbn),
                quantidade: quantidade == "" ? Number(0) : Number(quantidade),
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push('/livros');
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar livro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedPage>
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">Editar Livro</h1>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Autor</label>
                        <input
                            type="text"
                            value={autor}
                            onChange={e => setAutor(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <input
                            type="text"
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quantidade</label>
                        <input
                            type="number"
                            min="0"
                            value={quantidade}
                            onChange={(e) =>
                                setQuantidade(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                        />
                    </div>

                    <div>
                        <label className="inline-flex items-center cursor-pointer">
                            <span className="mr-2 text-sm font-medium">Disponível</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={disponibilidade}
                                    onChange={e => setDisponibilidade(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition"></div>
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ISBN</label>
                        <input
                            type="text"
                            value={isbn}
                            onChange={e => handleIsbnChange(e.target.value)}
                            required
                            placeholder="123-4-5678-9012-3"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Formato: 123-4-5678-9012-3</p>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Link href="/livros" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
                            Voltar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Atualizando...' : 'Atualizar'}
                        </button>
                    </div>
                </form>
            )}
        </div>
            </AuthenticatedPage>
    );
}
