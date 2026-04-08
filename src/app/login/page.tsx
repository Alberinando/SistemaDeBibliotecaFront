"use client";
import React, { useState, FormEvent, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import api from '@/services/api';
import { BookOpen, User, Lock, ArrowRight, ArrowLeft, Briefcase, LogIn, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Externalized Loading Component
const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-border animate-spin fill-primary"
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

export default function LoginPage() {
    // Shared State
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    // Login State
    const [login, setLogin] = useState<string>("");
    const [senha, setSenha] = useState<string>("");

    // Registration State
    const [regNome, setRegNome] = useState<string>("");
    const [regCargo, setRegCargo] = useState<string>("");
    const [regLogin, setRegLogin] = useState<string>("");
    const [regSenha, setRegSenha] = useState<string>("");

    // Refs
    const loginRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const { data: session, status } = useSession();

    // Redireciona se já estiver logado
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/livros");
        }
    }, [status, router]);

    const handleLogin = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                login,
                senha,
                redirect: false,
            });

            if (result?.error) {
                setError("Usuário ou senha incorretos!");
            } else if (result?.ok) {
                router.push("/livros");
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao fazer login. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    }, [login, senha, router]);

    const handleRegister = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            await api.post('/v1/funcionario', {
                nome: regNome,
                cargo: regCargo,
                login: regLogin,
                senha: regSenha,
            });

            setSuccessMsg("Cadastro realizado com sucesso! Faça login abaixo.");
            setIsRegistering(false);
            setLogin(regLogin);
            setSenha("");
            setRegNome("");
            setRegCargo("");
            setRegLogin("");
            setRegSenha("");

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
    }, [regNome, regCargo, regLogin, regSenha]);


    if (status === "loading") {
        return <LoadingState />;
    }

    if (status === "authenticated") {
        return null;
    }

    return (
        <div className="h-screen w-screen flex overflow-hidden">
            {/* Left Side - Branding (solid dark bg, no gradient) */}
            <div
                className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-sidebar"
            >
                <motion.div
                    key={isRegistering ? "register-brand" : "login-brand"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center max-w-lg"
                >
                    {/* Logo — solid bg, no gradient */}
                    <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <BookOpen className="text-primary-foreground" size={40} />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4">
                        {isRegistering ? "Junte-se a Nós" : "Sistema de Biblioteca"}
                    </h1>
                    <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
                        {isRegistering
                            ? "Crie sua conta no Sistema de Biblioteca e comece a gerenciar seu acervo hoje mesmo."
                            : "Gerencie seu acervo de forma inteligente. Controle empréstimos, membros e funcionários em uma única plataforma."}
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Forms (solid bg, no gradient) */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background h-full overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-md mb-4">
                            <BookOpen className="text-primary-foreground" size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Biblioteca</h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {isRegistering ? (
                            /* REGISTRATION FORM */
                            <motion.div
                                key="register-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-card rounded-2xl shadow-card border border-border p-8"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        Criar Nova Conta
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Preencha os dados abaixo
                                    </p>
                                </div>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    {/* Error Message */}
                                    {error && (
                                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start space-x-3 text-sm text-destructive">
                                            <span>!</span><span>{error}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Nome */}
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-1">
                                                Nome
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="text-muted-foreground" size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={regNome}
                                                    onChange={e => setRegNome(e.target.value)}
                                                    required
                                                    placeholder="Seu nome"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all text-foreground placeholder-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                        {/* Cargo */}
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-1">
                                                Cargo
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Briefcase className="text-muted-foreground" size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={regCargo}
                                                    onChange={e => setRegCargo(e.target.value)}
                                                    required
                                                    placeholder="Seu cargo"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all text-foreground placeholder-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Login */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1">
                                            Login Desejado
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LogIn className="text-muted-foreground" size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                value={regLogin}
                                                onChange={e => setRegLogin(e.target.value)}
                                                required
                                                placeholder="Nome de usuário"
                                                className="w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all text-foreground placeholder-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    {/* Senha */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1">
                                            Senha
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="text-muted-foreground" size={16} />
                                            </div>
                                            <input
                                                type="password"
                                                value={regSenha}
                                                onChange={e => setRegSenha(e.target.value)}
                                                required
                                                placeholder="Crie uma senha forte"
                                                className="w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all text-foreground placeholder-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center space-x-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                <span>Salvando...</span>
                                            </>
                                        ) : (
                                            <span>Criar Conta</span>
                                        )}
                                    </button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRegistering(false);
                                                setError("");
                                            }}
                                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                                        >
                                            <ArrowLeft size={14} />
                                            <span>Voltar para Login</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            /* LOGIN FORM */
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-card rounded-2xl shadow-card border border-border p-8"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        Bem-vindo de volta!
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Entre com suas credenciais para continuar
                                    </p>
                                </div>

                                {/* Success Message (from Registration) */}
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-start space-x-3"
                                    >
                                        <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle className="text-white" size={12} />
                                        </div>
                                        <p className="text-success text-sm">{successMsg}</p>
                                    </motion.div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start space-x-3"
                                    >
                                        <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                        <p className="text-destructive text-sm">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Login Field */}
                                    <div>
                                        <label htmlFor="login" className="block text-sm font-semibold text-foreground mb-2">
                                            Login
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="text-muted-foreground" size={16} />
                                            </div>
                                            <input
                                                ref={loginRef}
                                                type="text"
                                                id="login"
                                                name="login"
                                                autoComplete="username"
                                                value={login}
                                                onChange={(e) => setLogin(e.target.value)}
                                                required
                                                placeholder="Digite seu login"
                                                className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all duration-200 text-foreground placeholder-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="senha" className="block text-sm font-semibold text-foreground mb-2">
                                            Senha
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-muted-foreground" size={16} />
                                            </div>
                                            <input
                                                type="password"
                                                id="senha"
                                                name="senha"
                                                autoComplete="current-password"
                                                value={senha}
                                                onChange={(e) => setSenha(e.target.value)}
                                                required
                                                placeholder="Digite sua senha"
                                                className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all duration-200 text-foreground placeholder-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    {/* Options: Remember Me */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                                            <span className="text-sm text-muted-foreground">Lembrar de mim</span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                <span>Entrando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Entrar</span>
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    {/* Sign Up Link */}
                                    <p className="text-center text-sm text-muted-foreground">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRegistering(true);
                                                setError("");
                                                setSuccessMsg("");
                                            }}
                                            className="font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer"
                                        >
                                            Cadastre-se aqui
                                        </button>
                                    </p>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <p className="text-center text-muted-foreground text-sm mt-8">
                        Sistema de Gerenciamento de Biblioteca
                    </p>
                </div>
            </div>
        </div>
    );
}
