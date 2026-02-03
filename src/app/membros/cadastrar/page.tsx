"use client";
import { useState, FormEvent, useRef, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import formatTelefone from "@/util/formatTelefone";
import formatCpf from "@/util/formatCpf";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiUser, FiPhone, FiMail, FiCreditCard, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CreateMembro() {
    const router = useRouter();

    const [nome, setNome] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [telefone, setTelefone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const nomeRef = useRef<HTMLInputElement>(null);
    const cpfRef = useRef<HTMLInputElement>(null);
    const telefoneRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const auth = useAuth();

    useEffect(() => {
        const cycleRefs = [nomeRef, cpfRef, telefoneRef, emailRef];

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === "s") {
                event.preventDefault();
                submitButtonRef.current?.click();
                return;
            }

            if (event.key === "Escape" && !event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                router.back();
                return;
            }

            if (event.ctrlKey && event.key.toLowerCase() === "b") {
                event.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                return;
            }

            if (event.key === "Tab" && !event.shiftKey) {
                const activeElement = document.activeElement;
                const currentIndex = cycleRefs.findIndex(ref => ref.current === activeElement);
                const fieldValues = [nome, typeof cpf === "string" ? cpf : String(cpf), typeof telefone === "string" ? telefone : String(telefone), email];
                const isFilled = fieldValues.map(val => val.trim() !== "");
                const allEmpty = isFilled.every(f => !f);
                const allFilled = isFilled.every(f => f);

                event.preventDefault();

                if (allEmpty || allFilled) {
                    cycleRefs[0].current?.focus();
                    return;
                }

                let nextEmptyIndex: number | null = null;
                for (let i = currentIndex + 1; i < cycleRefs.length; i++) {
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

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nome, cpf, telefone, email, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            await api.post("/v1/membros", {
                nome,
                cpf: Number(cpf.replace(/\D/g, "")),
                telefone: Number(telefone.replace(/\D/g, "")),
                email,
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push("/membros");
        } catch (err) {
            console.error(err);
            setError("Falha ao cadastrar membro.");
        } finally {
            setLoading(false);
        }
    };

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
                            href="/membros"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Cadastrar Novo Membro</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Preencha os dados do membro abaixo
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
                                onChange={(e) => setNome(e.target.value)}
                                required
                                placeholder="Digite o nome completo"
                                className="input-modern"
                            />
                        </div>

                        {/* CPF */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiCreditCard className="text-indigo-500" />
                                <span>CPF</span>
                            </label>
                            <input
                                ref={cpfRef}
                                type="text"
                                value={cpf}
                                onChange={(e) => {
                                    let digits = e.target.value.replace(/\D/g, "");
                                    if (digits.length > 11) digits = digits.slice(0, 11);
                                    setCpf(formatCpf(digits));
                                }}
                                required
                                placeholder="000.000.000-00"
                                className="input-modern font-mono"
                            />
                            <p className="form-hint">Formato: 000.000.000-00</p>
                        </div>

                        {/* Telefone */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiPhone className="text-indigo-500" />
                                <span>Telefone</span>
                            </label>
                            <input
                                ref={telefoneRef}
                                type="text"
                                value={telefone}
                                onChange={(e) => {
                                    let digits = e.target.value.replace(/\D/g, "");
                                    if (digits.length > 11) digits = digits.slice(0, 11);
                                    setTelefone(formatTelefone(digits));
                                }}
                                required
                                placeholder="(00) 00000-0000"
                                className="input-modern font-mono"
                            />
                            <p className="form-hint">Formato: (00) 00000-0000</p>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiMail className="text-indigo-500" />
                                <span>E-mail</span>
                            </label>
                            <input
                                ref={emailRef}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="email@exemplo.com"
                                className="input-modern"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Link
                                href="/membros"
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
