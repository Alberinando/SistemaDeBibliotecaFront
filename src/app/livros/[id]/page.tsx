"use client"
import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import formatIsbn from "@/util/FormarIsbn";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiBook, FiUser, FiTag, FiHash, FiCheck, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Externalized Static Component
const LoadingSkeleton = () => (
    <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-12 w-full rounded-xl" />
            </div>
        ))}
    </div>
);

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
    const [saving, setSaving] = useState<boolean>(false);
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

    const handleIsbnChange = useCallback((value: string) => {
        const raw = value.replace(/\D/g, '');
        setIsbn(formatIsbn(raw));
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
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
            setSaving(false);
        }
    }, [auth, id, titulo, autor, categoria, disponibilidade, isbn, quantidade, router]);

    // Loading State externalized

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto"
            >
                <div className="page-container">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                        <Link
                            href="/livros"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="page-title text-lg">Editar Livro</h1>
                            <p className="text-gray-500 text-xs">
                                Atualize as informações do livro
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                                >
                                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-[10px]">!</span>
                                    </div>
                                    <p className="text-red-600 text-xs">{error}</p>
                                </motion.div>
                            )}

                            {/* Título */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiBook className="text-indigo-500" size={14} />
                                    <span>Título</span>
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    required
                                    placeholder="Digite o título do livro"
                                    className="input-modern text-sm py-2"
                                />
                            </div>

                            {/* Autor e Categoria em grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Autor */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiUser className="text-indigo-500" size={14} />
                                        <span>Autor</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={autor}
                                        onChange={e => setAutor(e.target.value)}
                                        required
                                        placeholder="Nome do autor"
                                        className="input-modern text-sm py-2"
                                    />
                                </div>

                                {/* Categoria */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiTag className="text-indigo-500" size={14} />
                                        <span>Categoria</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={categoria}
                                        onChange={e => setCategoria(e.target.value)}
                                        required
                                        placeholder="Ex: Ficção, Romance..."
                                        className="input-modern text-sm py-2"
                                    />
                                </div>
                            </div>

                            {/* Quantidade e ISBN em grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Quantidade */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiHash className="text-indigo-500" size={14} />
                                        <span>Quantidade</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={quantidade}
                                        onChange={(e) =>
                                            setQuantidade(e.target.value === "" ? "" : Number(e.target.value))
                                        }
                                        required
                                        placeholder="Exemplares"
                                        className="input-modern text-sm py-2 appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                                    />
                                </div>

                                {/* ISBN */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiHash className="text-indigo-500" size={14} />
                                        <span>ISBN</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={isbn}
                                        onChange={e => handleIsbnChange(e.target.value)}
                                        required
                                        placeholder="123-4-5678-9012-3"
                                        className="input-modern font-mono text-sm py-2"
                                    />
                                </div>
                            </div>

                            {/* Disponibilidade Toggle */}
                            <div className="form-group">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${disponibilidade ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            <FiCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Disponível</p>
                                            <p className="text-xs text-gray-500">
                                                {disponibilidade ? 'Pode ser emprestado' : 'Indisponível'}
                                            </p>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={disponibilidade}
                                            onChange={e => setDisponibilidade(e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Link
                                    href="/livros"
                                    className="btn-ghost text-sm flex items-center space-x-1.5 px-3 py-1.5"
                                >
                                    <FiArrowLeft size={14} />
                                    <span>Voltar</span>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-success text-sm flex items-center space-x-1.5 px-4 py-2 cursor-pointer"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Atualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={14} />
                                            <span>Atualizar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </AuthenticatedPage>
    );
}
