"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/resources/users/users.resouces";
import { useAuth } from "@/resources/users/authentication.resourse";
import { FaBook, FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [login, setLogin] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const auth = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const credentials = { login, senha };

        try {
            const authResponse: AuthResponse = await auth.authenticate(credentials);
            auth.initSession(authResponse);
            router.push("/livros");
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro ao fazer login. Verifique suas credenciais.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
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
                    {/* Logo */}
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/40">
                        <FaBook className="text-white text-4xl" />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4">
                        Sistema de Biblioteca
                    </h1>
                    <p className="text-indigo-200 text-lg leading-relaxed">
                        Gerencie seu acervo de forma inteligente. Controle empréstimos,
                        membros e funcionários em uma única plataforma.
                    </p>

                    {/* Features */}
                    <div className="mt-12 grid grid-cols-3 gap-4">
                        {[
                            { label: "Livros", icon: "📚" },
                            { label: "Membros", icon: "👥" },
                            { label: "Empréstimos", icon: "🔄" },
                        ].map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            >
                                <span className="text-2xl mb-2 block">{item.icon}</span>
                                <span className="text-white text-sm font-medium">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
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
                                Bem-vindo de volta!
                            </h2>
                            <p className="text-gray-500">
                                Entre com suas credenciais para continuar
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
                            >
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">!</span>
                                </div>
                                <p className="text-red-600 text-sm">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Login Field */}
                            <div>
                                <label htmlFor="login" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Login
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="login"
                                        value={login}
                                        onChange={(e) => setLogin(e.target.value)}
                                        required
                                        placeholder="Digite seu login"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        id="senha"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        required
                                        placeholder="Digite sua senha"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
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
                                        <span>Entrando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Entrar</span>
                                        <FaArrowRight className="text-sm" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-400 text-sm mt-8">
                        Sistema de Gerenciamento de Biblioteca
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
