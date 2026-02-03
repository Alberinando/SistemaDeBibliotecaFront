"use client";

import { useState, FormEvent, useRef, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiUser, FiBriefcase, FiLogIn, FiLock, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="page-container">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <Link
                            href="/funcionarios"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Cadastrar Novo Funcionário</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Preencha os dados do funcionário abaixo
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

                        {/* Nome */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiUser className="text-indigo-500" />
                                <span>Nome Completo</span>
                            </label>
                            <input
                                ref={nomeRef}
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                required
                                placeholder="Digite o nome completo"
                                className="input-modern"
                            />
                        </div>

                        {/* Cargo */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiBriefcase className="text-indigo-500" />
                                <span>Cargo</span>
                            </label>
                            <input
                                ref={cargoRef}
                                type="text"
                                value={cargo}
                                onChange={e => setCargo(e.target.value)}
                                required
                                placeholder="Ex: Bibliotecário, Atendente..."
                                className="input-modern"
                            />
                        </div>

                        {/* Login */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiLogIn className="text-indigo-500" />
                                <span>Login</span>
                            </label>
                            <input
                                ref={loginRef}
                                type="text"
                                value={login}
                                onChange={e => setLogin(e.target.value)}
                                required
                                placeholder="Nome de usuário para acesso"
                                className="input-modern"
                            />
                        </div>

                        {/* Senha */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiLock className="text-indigo-500" />
                                <span>Senha</span>
                            </label>
                            <input
                                ref={senhaRef}
                                type="password"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                required
                                placeholder="Digite a senha de acesso"
                                className="input-modern"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Link
                                href="/funcionarios"
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
