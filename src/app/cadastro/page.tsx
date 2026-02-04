"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiBriefcase, FiLogIn, FiLock, FiArrowLeft, FiSave } from 'react-icons/fi';
import { FaBook } from "react-icons/fa";
import { motion } from 'framer-motion';

export default function PublicRegistrationPage() {
    const router = useRouter();

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

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Note: This endpoint must allow public access on the backend or we need a specific public endpoint.
            // Assuming /v1/funcionario is compatible or we are relying on protected route handling.
            // Since the user asked for public registration, we assume the backend might need adjustment 
            // OR we use the same endpoint if it's open.
            // However, typically /v1/funcionario is protected. 
            // If it fails with 401/403, we might need to notify the user.
            // For now, mirroring the internal logic but without the auth header for the request if the axios interceptor doesn't add it (which it won't if not logged in).

            await api.post('/v1/funcionario', {
                nome,
                cargo,
                login,
                senha,
            });

            // Redirect to login after successful registration
            router.push('/login?registered=true');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('Permissão negada. O cadastro público pode não estar habilitado na API.');
            } else {
                setError('Falha ao cadastrar funcionário. Verifique os dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }, [nome, cargo, login, senha, router]);

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

            if (event.key === 'Tab' && !event.shiftKey) {
                // Simple tab handling if needed, or rely on browser default
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/50 p-8"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                        <FaBook className="text-white text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Novo Cadastro</h1>
                    <p className="text-gray-500 text-sm mt-1 text-center">
                        Crie sua conta para acessar o Sistema de Biblioteca
                    </p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <FiUser className="text-indigo-500" />
                                <span>Nome Completo</span>
                            </label>
                            <input
                                ref={nomeRef}
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                required
                                placeholder="Digite seu nome"
                                className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800"
                            />
                        </div>

                        {/* Cargo */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <FiBriefcase className="text-indigo-500" />
                                <span>Cargo</span>
                            </label>
                            <input
                                ref={cargoRef}
                                type="text"
                                value={cargo}
                                onChange={e => setCargo(e.target.value)}
                                required
                                placeholder="Ex: Visitante, Leitor..."
                                className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800"
                            />
                        </div>

                        {/* Login */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <FiLogIn className="text-indigo-500" />
                                <span>Login Desejado</span>
                            </label>
                            <input
                                ref={loginRef}
                                type="text"
                                value={login}
                                onChange={e => setLogin(e.target.value)}
                                required
                                placeholder="Nome de usuário"
                                className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800"
                            />
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <FiLock className="text-indigo-500" />
                                <span>Senha</span>
                            </label>
                            <input
                                ref={senhaRef}
                                type="password"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                required
                                placeholder="Crie uma senha forte"
                                className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <Link
                            href="/login"
                            className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
                        >
                            <FiArrowLeft />
                            <span>Voltar para Login</span>
                        </Link>
                        <button
                            ref={submitButtonRef}
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    <span>Cadastrar-se</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

