"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AcessToken } from "@/resources/users/users.resouces";
import { useAuth } from "@/resources/users/authentication.resourse";
import { Eye, EyeOff, Library, BookOpen, Users, ArrowLeftRight } from "lucide-react";

export default function LoginPage() {
    const [login, setLogin] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
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
            const accessToken: AcessToken = await auth.authenticate(credentials);
            auth.initSession(accessToken);
            router.push("/livros");
        } catch {
            setError("Credenciais inválidas. Verifique seu login e senha.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <BookOpen size={24} className="text-white" />,
            title: "Catálogo Completo",
            description: "Gerencie todo o acervo de livros com facilidade",
        },
        {
            icon: <Users size={24} className="text-white" />,
            title: "Gestão de Membros",
            description: "Controle cadastros e informações dos membros",
        },
        {
            icon: <ArrowLeftRight size={24} className="text-white" />,
            title: "Empréstimos",
            description: "Acompanhe empréstimos e devoluções em tempo real",
        },
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left panel — Branding */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-[#101828] p-10 relative overflow-hidden">
                {/* Brand header */}
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                            <Library size={22} className="text-white" />
                        </div>
                        <span className="text-white font-semibold text-lg tracking-tight">
                            Biblioteca
                        </span>
                    </div>

                    <h2 className="text-white text-3xl font-bold leading-tight mb-3">
                        Sistema de Gestão
                        <br />
                        de Biblioteca
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                        Gerencie de forma eficiente o acervo, membros e empréstimos da sua biblioteca.
                    </p>
                </div>

                {/* Features cards */}
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm mb-0.5">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <p className="text-gray-500 text-xs">
                    © {new Date().getFullYear()} Sistema de Biblioteca
                </p>
            </div>

            {/* Right panel — Login form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    {/* Mobile brand */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                            <Library size={20} className="text-white" />
                        </div>
                        <span className="font-semibold text-lg text-foreground tracking-tight">
                            Biblioteca
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-muted-foreground text-sm mb-8">
                        Faça login para acessar o sistema
                    </p>

                    {error && (
                        <div className="mb-5 p-3 rounded-lg bg-[#D92D20]/10 border border-[#D92D20]/20 flex items-start gap-2.5">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                                <path d="M8 5.5V8.5M8 10.5H8.005M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p className="text-[#D92D20] text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="login"
                                className="block text-sm font-medium text-foreground mb-1.5"
                            >
                                Login
                            </label>
                            <input
                                type="text"
                                id="login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                                placeholder="Digite seu login"
                                className="w-full h-10 px-3 text-sm bg-card text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent placeholder:text-muted-foreground/60 transition-shadow"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="block text-sm font-medium text-foreground mb-1.5"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    placeholder="Digite sua senha"
                                    className="w-full h-10 px-3 pr-10 text-sm bg-card text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent placeholder:text-muted-foreground/60 transition-shadow"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
