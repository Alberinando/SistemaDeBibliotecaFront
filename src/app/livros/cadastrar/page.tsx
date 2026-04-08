"use client"
import { useState, FormEvent, useRef, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formatIsbn from "@/util/FormarIsbn";
import { useAuth } from "@/resources/users/authentication.resourse";
import { ArrowLeft, AlertCircle } from 'lucide-react';

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

    const inputClasses = "w-full h-10 px-3 text-sm bg-card text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent placeholder:text-muted-foreground/60 transition-shadow";
    const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-lg shadow-card border border-border">
                {/* Header */}
                <div className="px-6 py-5 border-b border-border">
                    <h1 className="text-xl font-semibold text-foreground">Cadastrar Livro</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Adicione um novo livro ao acervo</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#D92D20]/10 border border-[#D92D20]/20">
                            <AlertCircle size={16} className="text-[#D92D20] flex-shrink-0" />
                            <p className="text-sm text-[#D92D20]">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className={labelClasses}>Título</label>
                        <input
                            ref={tituloRef}
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            required
                            placeholder="Nome do livro"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Autor</label>
                        <input
                            ref={autorRef}
                            type="text"
                            value={autor}
                            onChange={e => setAutor(e.target.value)}
                            required
                            placeholder="Nome do autor"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Categoria</label>
                        <input
                            ref={categoriaRef}
                            type="text"
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            required
                            placeholder="Ex: Ficção, Educação, Romance"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Quantidade</label>
                        <input
                            ref={quantidadeRef}
                            type="number"
                            min="0"
                            value={quantidade}
                            onChange={(e) =>
                                setQuantidade(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            required
                            placeholder="0"
                            className={`${inputClasses} appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden`}
                        />
                    </div>

                    <div>
                        <label className="inline-flex items-center gap-3 cursor-pointer">
                            <span className="text-sm font-medium text-foreground">Disponível</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={disponibilidade}
                                    onChange={e => setDisponibilidade(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-[22px] bg-input rounded-full peer-checked:bg-[var(--success)] transition-colors" />
                                <div className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full peer-checked:translate-x-[18px] transition-transform shadow-sm" />
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className={labelClasses}>ISBN</label>
                        <input
                            ref={isbnRef}
                            type="text"
                            value={isbn}
                            onChange={e => handleIsbnChange(e.target.value)}
                            required
                            placeholder="123-4-5678-9012-3"
                            className={inputClasses}
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">Formato: 123-4-5678-9012-3</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2">
                        <Link
                            href="/livros"
                            className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </Link>
                        <button
                            ref={submitButtonRef}
                            type="submit"
                            disabled={loading}
                            className="h-10 px-5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Salvando...
                                </span>
                            ) : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
