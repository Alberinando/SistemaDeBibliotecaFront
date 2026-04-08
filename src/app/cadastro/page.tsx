"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiBriefcase, FiLogIn, FiLock, FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi';
import { FaBook } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// Externalized Loading Component (Same as Login)
const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-indigo-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
            </svg>
        </div>
    </div>
);

export default function PublicRegistrationPage() {
    const router = useRouter();

    const [nome, setNome] = useState<string>('');
    const [cargo, setCargo] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

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
            await api.post('/v1/funcionario', {
                nome,
                cargo,
                login,
                senha,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/login?registered=true');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('Permissão negada. O cadastro público pode não estar habilitado na API.');
            } else {
                setError('Falha ao cadastrar funcionário. Verifique os dados e tente novamente.');
            }
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
                // Rely on browser default
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="text-green-600 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Cadastro Realizado!</h2>
                    <p className="text-gray-500">Redirecionando para o login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding (Same as Login) */}
            <div
                className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                }}
            >
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center max-w-lg"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/40">
                        <FaBook className="text-white text-4xl" />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4">
                        Junte-se a Nós
                    </h1>
                    <p className="text-indigo-200 text-lg leading-relaxed">
                        Crie sua conta no Sistema de Biblioteca e comece a gerenciar seu acervo hoje mesmo.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                            <FaBook className="text-white text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Biblioteca</h1>
                    </div>

                    {/* Card */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/50 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Criar Nova Conta
                            </h2>
                            <p className="text-gray-500">
                                Preencha os dados abaixo para se cadastrar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 overflow-hidden"
                                    >
                                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-400" />
                                        </div>
                                        <input
                                            ref={nomeRef}
                                            type="text"
                                            value={nome}
                                            onChange={e => setNome(e.target.value)}
                                            required
                                            placeholder="Seu nome"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Cargo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cargo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiBriefcase className="text-gray-400" />
                                        </div>
                                        <input
                                            ref={cargoRef}
                                            type="text"
                                            value={cargo}
                                            onChange={e => setCargo(e.target.value)}
                                            required
                                            placeholder="Seu cargo"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Login */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Login Desejado
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiLogIn className="text-gray-400" />
                                    </div>
                                    <input
                                        ref={loginRef}
                                        type="text"
                                        value={login}
                                        onChange={e => setLogin(e.target.value)}
                                        required
                                        placeholder="Nome de usuário"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        ref={senhaRef}
                                        type="password"
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        required
                                        placeholder="Crie uma senha forte"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2">
                                <button
                                    ref={submitButtonRef}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Finalizando Cadastro...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave />
                                            <span>Criar Conta</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center pt-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-1"
                                >
                                    <FiArrowLeft />
                                    <span>Voltar para Login</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

