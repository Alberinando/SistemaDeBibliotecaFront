"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import formatTelefone from "@/util/formatTelefone";
import formatCpf from "@/util/formatCpf";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiUser, FiPhone, FiMail, FiCreditCard, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function EditarMembro() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [nome, setNome] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [telefone, setTelefone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();

    useEffect(() => {
        async function fetchMembro() {
            const userSession = auth.getUserSession();
            try {
                const response = await api.get(`/v1/membros/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                const membro = response.data;
                setNome(membro.nome);
                setCpf(formatCpf(String(membro.cpf)));
                setTelefone(formatTelefone(String(membro.telefone)));
                setEmail(membro.email);
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar dados do membro.");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchMembro();
    }, [id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            await api.put(`/v1/membros`, {
                id,
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
            setError("Erro ao atualizar membro.");
        } finally {
            setSaving(false);
        }
    };

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                </div>
            ))}
        </div>
    );

    return (
        <AuthenticatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto"
            >
                <div className="page-container">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                        <Link
                            href="/membros"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="page-title text-lg">Editar Membro</h1>
                            <p className="text-gray-500 text-xs">
                                Atualize as informações do membro
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                                >
                                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-[10px]">!</span>
                                    </div>
                                    <p className="text-red-600 text-xs">{error}</p>
                                </motion.div>
                            )}

                            {/* Nome */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiUser className="text-indigo-500" size={14} />
                                    <span>Nome Completo</span>
                                </label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                    placeholder="Digite o nome completo"
                                    className="input-modern text-sm py-2"
                                />
                            </div>

                            {/* CPF e Telefone em grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* CPF */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiCreditCard className="text-indigo-500" size={14} />
                                        <span>CPF</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={cpf}
                                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                                        required
                                        placeholder="000.000.000-00"
                                        className="input-modern font-mono text-sm py-2"
                                    />
                                </div>

                                {/* Telefone */}
                                <div className="form-group">
                                    <label className="form-label text-xs flex items-center space-x-1.5">
                                        <FiPhone className="text-indigo-500" size={14} />
                                        <span>Telefone</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={telefone}
                                        onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                                        required
                                        placeholder="(00) 00000-0000"
                                        className="input-modern font-mono text-sm py-2"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiMail className="text-indigo-500" size={14} />
                                    <span>E-mail</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="email@exemplo.com"
                                    className="input-modern text-sm py-2"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Link
                                    href="/membros"
                                    className="btn-ghost text-sm flex items-center space-x-1.5 px-3 py-1.5"
                                >
                                    <FiArrowLeft size={14} />
                                    <span>Voltar</span>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-success text-sm flex items-center space-x-1.5 px-4 py-2 cursor-pointer"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Atualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={14} />
                                            <span>Atualizar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </AuthenticatedPage>
    );
}
