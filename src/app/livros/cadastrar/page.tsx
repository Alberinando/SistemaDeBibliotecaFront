"use client"
import { useState, FormEvent, useRef, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formatIsbn from "@/util/FormarIsbn";

export default function CreateLivro() {
    const router = useRouter();

    const [titulo, setTitulo] = useState<string>('');
    const [autor, setAutor] = useState<string>('');
    const [categoria, setCategoria] = useState<string>('');
    const [quantidade, setQuantidade] = useState<number | "">("");
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const rawIsbn = isbn.replace(/\D/g, '');
            await api.post('/v1/livros', {
                titulo,
                autor,
                categoria,
                disponibilidade,
                isbn: Number(rawIsbn),
                quantidade: quantidade === "" ? Number(0) : Number(quantidade),
            });
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
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">Cadastrar Novo Livro</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        ref={tituloRef}
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
                        ref={autorRef}
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
                        ref={categoriaRef}
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
                        ref={quantidadeRef}
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
                        ref={isbnRef}
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
                    <Link
                        href="/livros"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                    >
                        Voltar
                    </Link>
                    <button
                        ref={submitButtonRef}
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Salvando...' : 'Cadastrar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
