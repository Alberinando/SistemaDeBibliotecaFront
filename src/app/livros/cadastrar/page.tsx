"use client"
import { useState, FormEvent, useRef, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formatIsbn from "@/util/FormarIsbn";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from '@/components/Authenticated/AuthenticatedPage';
import { FiBook, FiUser, FiTag, FiHash, FiCheck, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CreateLivro() {
    const router = useRouter();

    const [titulo, setTitulo] = useState<string>('');
    const [autor, setAutor] = useState<string>('');
    const [categoria, setCategoria] = useState<string>('');
    const [quantidade, setQuantidade] = useState<number | "">("");
    const [token, setToken] = useState<string>();
    const [disponibilidade, setDisponibilidade] = useState<boolean>(true);
    const [isbn, setIsbn] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const tituloRef = useRef<HTMLInputElement>(null);
    const autorRef = useRef<HTMLInputElement>(null);
    const categoriaRef = useRef<HTMLInputElement>(null);
    const quantidadeRef = useRef<HTMLInputElement>(null);
    const isbnRef = useRef<HTMLInputElement>(null);

    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const auth = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const rawIsbn = isbn.replace(/\D/g, '');
        try {
            await api.post(
                '/v1/livros',
                {
                    titulo: titulo,
                    autor: autor,
                    categoria: categoria,
                    disponibilidade: disponibilidade,
                    isbn: Number(rawIsbn),
                    quantidade: quantidade === "" ? 0 : Number(quantidade),
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            router.push('/livros');
        } catch (err) {
            console.error(err);
            setError('Falha ao cadastrar livro.');
        } finally {
            setLoading(false);
        }
    };

    const handleIsbnChange = (value: string) => {
        const raw = value.replace(/\D/g, '');
        setIsbn(formatIsbn(raw));
    };

    useEffect(() => {
        const cycleRefs = [tituloRef, autorRef, categoriaRef, quantidadeRef, isbnRef];
        const userSession = auth.getUserSession();
        setToken(userSession?.accessToken);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                submitButtonRef.current?.click();
                return;
            }

            if (event.key === 'Escape' && !event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                router.back();
                return;
            }

            if (event.ctrlKey && event.key.toLowerCase() === 'b') {
                event.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                return;
            }

            if (event.key === 'Tab' && !event.shiftKey) {
                const activeElement = document.activeElement;
                const currentIndex = cycleRefs.findIndex(ref => ref.current === activeElement);
                const fieldValues = [
                    titulo,
                    autor,
                    categoria,
                    typeof quantidade === "string" ? quantidade : String(quantidade),
                    isbn
                ];
                const isFilled = fieldValues.map(val => val.trim() !== "");
                const allEmpty = isFilled.every(f => !f);
                const allFilled = isFilled.every(f => f);

                event.preventDefault();

                if (allEmpty) {
                    cycleRefs[0].current?.focus();
                    return;
                }

                if (allFilled) {
                    cycleRefs[0].current?.focus();
                    return;
                }

                let startIndex = currentIndex;
                if (startIndex === -1) {
                    startIndex = -1;
                }
                let nextEmptyIndex: number | null = null;
                for (let i = startIndex + 1; i < cycleRefs.length; i++) {
                    if (!isFilled[i]) {
                        nextEmptyIndex = i;
                        break;
                    }
                }
                if (nextEmptyIndex !== null) {
                    cycleRefs[nextEmptyIndex].current?.focus();
                } else {
                    (document.activeElement as HTMLElement).blur();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [titulo, autor, categoria, quantidade, isbn, router]);

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="page-container">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <Link
                            href="/livros"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Cadastrar Novo Livro</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Preencha os dados do livro abaixo
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
                            >
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">!</span>
                                </div>
                                <p className="text-red-600 text-sm">{error}</p>
                            </motion.div>
                        )}

                        {/* Título */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiBook className="text-indigo-500" />
                                <span>Título</span>
                            </label>
                            <input
                                ref={tituloRef}
                                type="text"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                required
                                placeholder="Digite o título do livro"
                                className="input-modern"
                            />
                        </div>

                        {/* Autor */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiUser className="text-indigo-500" />
                                <span>Autor</span>
                            </label>
                            <input
                                ref={autorRef}
                                type="text"
                                value={autor}
                                onChange={e => setAutor(e.target.value)}
                                required
                                placeholder="Digite o nome do autor"
                                className="input-modern"
                            />
                        </div>

                        {/* Categoria */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiTag className="text-indigo-500" />
                                <span>Categoria</span>
                            </label>
                            <input
                                ref={categoriaRef}
                                type="text"
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                                required
                                placeholder="Ex: Ficção, Romance, Técnico..."
                                className="input-modern"
                            />
                        </div>

                        {/* Quantidade */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiHash className="text-indigo-500" />
                                <span>Quantidade</span>
                            </label>
                            <input
                                ref={quantidadeRef}
                                type="number"
                                min="0"
                                value={quantidade}
                                onChange={(e) =>
                                    setQuantidade(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                required
                                placeholder="Quantidade de exemplares"
                                className="input-modern appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                            />
                        </div>

                        {/* Disponibilidade Toggle */}
                        <div className="form-group">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${disponibilidade ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <FiCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Disponível para empréstimo</p>
                                        <p className="text-sm text-gray-500">
                                            {disponibilidade ? 'O livro pode ser emprestado' : 'O livro não está disponível'}
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

                        {/* ISBN */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiHash className="text-indigo-500" />
                                <span>ISBN</span>
                            </label>
                            <input
                                ref={isbnRef}
                                type="text"
                                value={isbn}
                                onChange={e => handleIsbnChange(e.target.value)}
                                required
                                placeholder="123-4-5678-9012-3"
                                className="input-modern font-mono"
                            />
                            <p className="form-hint">Formato: 123-4-5678-9012-3</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Link
                                href="/livros"
                                className="btn-ghost flex items-center space-x-2"
                            >
                                <FiArrowLeft />
                                <span>Voltar</span>
                            </Link>
                            <button
                                ref={submitButtonRef}
                                type="submit"
                                disabled={loading}
                                className="btn-success flex items-center space-x-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave />
                                        <span>Cadastrar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </AuthenticatedPage>
    );
}
