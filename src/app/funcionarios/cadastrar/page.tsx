"use client";

import { useState, FormEvent, useRef, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {useAuth} from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

export default function CreateFuncionario() {
    const router = useRouter();
    const auth = useAuth();

    const [nome, setNome] = useState<string>('');
    const [cargo, setCargo] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const nomeRef = useRef<HTMLInputElement>(null);
    const cargoRef = useRef<HTMLInputElement>(null);
    const loginRef = useRef<HTMLInputElement>(null);
    const senhaRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            await api.post('/v1/funcionario', {
                nome,
                cargo,
                login,
                senha,
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push('/funcionarios');
        } catch (err) {
            console.error(err);
            setError('Falha ao cadastrar funcionário.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cycleRefs = [nomeRef, cargoRef, loginRef, senhaRef];

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
                const fieldValues = [nome, cargo, login, senha];
                const isFilled = fieldValues.map(val => val.trim() !== '');
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
    }, [nome, cargo, login, senha, router]);

    return (
        <AuthenticatedPage>
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow max-md:mt-11">
            <h1 className="text-2xl font-semibold mb-4">Cadastrar Novo Funcionário</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input
                        ref={nomeRef}
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Cargo</label>
                    <input
                        ref={cargoRef}
                        type="text"
                        value={cargo}
                        onChange={e => setCargo(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Login</label>
                    <input
                        ref={loginRef}
                        type="text"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input
                        ref={senhaRef}
                        type="password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Link
                        href="/funcionarios"
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
            </AuthenticatedPage>
    );
}
