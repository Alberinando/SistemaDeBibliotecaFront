"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { FiUser, FiBriefcase, FiLogIn, FiArrowLeft, FiSave, FiLock, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditarFuncionario() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [activeTab, setActiveTab] = useState<'geral' | 'seguranca'>('geral');

    // Estado Dados Gerais
    const [nome, setNome] = useState<string>("");
    const [cargo, setCargo] = useState<string>("");
    const [login, setLogin] = useState<string>("");

    // Estado Senha
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFuncionario() {
            try {
                const response = await api.get(`/v1/funcionario/${id}`);
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

    const handleUpdateData = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            await api.put(`/v1/funcionario`, {
                id,
                nome,
                cargo,
                login,
            });
            setSuccessMsg("Dados atualizados com sucesso!");
        } catch (err) {
            console.error(err);
            setError("Erro ao atualizar o funcionário.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        if (newPassword !== confirmPassword) {
            setError("A nova senha e a confirmação não coincidem.");
            setSaving(false);
            return;
        }

        try {
            await api.put(`/v1/funcionario/${id}/change-password`, {
                senhaAtual: currentPassword,
                novaSenha: newPassword
            });
            setSuccessMsg("Senha alterada com sucesso!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 400 || err.response?.status === 403) {
                setError(err.response.data?.message || "Erro ao alterar senha. Verifique a senha atual.");
            } else {
                setError("Erro ao alterar senha.");
            }
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
                className="max-w-3xl mx-auto"
            >
                <div className="page-container">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            href="/funcionarios"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Editar Funcionário</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Gerencie dados e segurança
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => { setError(null); setSuccessMsg(null); setActiveTab('geral'); }}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'geral'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            <FiUser size={16} />
                            <span>Dados Gerais</span>
                        </button>
                        <button
                            onClick={() => { setError(null); setSuccessMsg(null); setActiveTab('seguranca'); }}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'seguranca'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            <FiShield size={16} />
                            <span>Segurança</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
                            >
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">!</span>
                                </div>
                                <p className="text-red-600 text-sm">{error}</p>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3"
                            >
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiLock className="text-white w-3 h-3" />
                                </div>
                                <p className="text-green-600 text-sm">{successMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div>
                            {/* Tab Geral */}
                            {activeTab === 'geral' && (
                                <motion.form
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleUpdateData}
                                    className="space-y-6"
                                >
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
                                            className="input-modern"
                                        />
                                    </div>

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
                                            className="input-modern"
                                        />
                                    </div>

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
                                            className="input-modern"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-success flex items-center space-x-2 min-w-[140px] justify-center"
                                        >
                                            {saving ? (
                                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <FiSave />
                                                    <span>Salvar Dados</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {/* Tab Segurança */}
                            {activeTab === 'seguranca' && (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleChangePassword}
                                    className="space-y-6"
                                >
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <FiLock className="text-yellow-600 mt-1" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-yellow-800">Alteração de Senha</h4>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    Para sua segurança, você precisa informar sua senha atual antes de definir uma nova.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Senha Atual</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            required
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Digite sua senha atual"
                                            className="input-modern"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="form-label">Nova Senha</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                required
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Digite a nova senha"
                                                className="input-modern"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Confirmar Nova Senha</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                required
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repita a nova senha"
                                                className="input-modern"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-gradient flex items-center space-x-2 min-w-[160px] justify-center"
                                        >
                                            {saving ? (
                                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <FiShield />
                                                    <span>Atualizar Senha</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AuthenticatedPage>
    );
}
