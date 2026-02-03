"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiUser, FiBriefcase, FiLogIn, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function EditarFuncionario() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);
    const auth = useAuth();

    const [nome, setNome] = useState<string>("");
    const [cargo, setCargo] = useState<string>("");
    const [login, setLogin] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFuncionario() {
            try {
                const userSession = auth.getUserSession();
                const response = await api.get(`/v1/funcionario/${id}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${userSession?.accessToken}`
                        }
                    });
                const funcionario = response.data;
                setNome(funcionario.nome);
                setCargo(funcionario.cargo);
                setLogin(funcionario.login);
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar os dados do funcionário.");
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchFuncionario();
        }
    }, [id]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            await api.put(`/v1/funcionario`, {
                id,
                nome,
                cargo,
                login,
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push("/funcionarios");
        } catch (err) {
            console.error(err);
            setError("Erro ao atualizar o funcionário.");
        } finally {
            setSaving(false);
        }
    };

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
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
                            <h1 className="page-title">Editar Funcionário</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Atualize as informações do funcionário
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
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
                                    type="text"
                                    value={nome}
                                    required
                                    onChange={(e) => setNome(e.target.value)}
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
                                    type="text"
                                    value={cargo}
                                    required
                                    onChange={(e) => setCargo(e.target.value)}
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
                                    type="text"
                                    value={login}
                                    required
                                    onChange={(e) => setLogin(e.target.value)}
                                    placeholder="Nome de usuário para acesso"
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
                                    type="submit"
                                    disabled={saving}
                                    className="btn-success flex items-center space-x-2 cursor-pointer"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Atualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave />
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
