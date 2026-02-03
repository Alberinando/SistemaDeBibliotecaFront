"use client"
import { useState, useEffect, FormEvent } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FiBook, FiUser, FiCalendar, FiCheck, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CreateEmprestimo() {
    const router = useRouter();

    const [livroId, setLivroId] = useState<string>("");
    const [membroId, setMembroId] = useState<string>("");
    const [dataEmprestimoDate, setDataEmprestimoDate] = useState<Date | undefined>(new Date());
    const [dataDevolucaoDate, setDataDevolucaoDate] = useState<Date | undefined>(undefined);
    const [status, setStatus] = useState<boolean>(true);
    const [livros, setLivros] = useState<{ id: number; titulo: string }[]>([]);
    const [membros, setMembros] = useState<{ id: number; nome: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [openEmprestimo, setOpenEmprestimo] = useState<boolean>(false);
    const [openDevolucao, setOpenDevolucao] = useState<boolean>(false);

    const auth = useAuth();

    useEffect(() => {
        async function fetchOptions() {
            const userSession = auth.getUserSession();
            try {
                const livrosResponse = await api.get('/v1/livros/list', {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                const membrosResponse = await api.get('/v1/membros/list', {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
                setLivros(livrosResponse.data);
                setMembros(membrosResponse.data);
            } catch (error) {
                console.error(error);
                setError("Falha ao carregar as opções.");
            }
        }
        fetchOptions();
    }, []);

    function dateToIsoAtMidnightLocal(date?: Date | undefined) {
        if (!date) return null;
        const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return localMidnight.toISOString();
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const userSession = auth.getUserSession();
        try {
            const dataEmprestimoISO = dateToIsoAtMidnightLocal(dataEmprestimoDate);
            const dataDevolucaoISO = dateToIsoAtMidnightLocal(dataDevolucaoDate);

            await api.post('/v1/emprestimos', {
                livroId: Number(livroId),
                membroId: Number(membroId),
                dataEmprestimo: dataEmprestimoISO,
                dataDevolucao: dataDevolucaoISO,
                status
            },
                {
                    headers: {
                        "Authorization": `Bearer ${userSession?.accessToken}`
                    }
                });
            router.push('/emprestimos');
        } catch (error) {
            console.error(error);
            setError("Erro ao cadastrar empréstimo.");
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
                            href="/emprestimos"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="page-title">Cadastrar Novo Empréstimo</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Preencha os dados do empréstimo abaixo
                            </p>
                        </div>
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Livro */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiBook className="text-indigo-500" />
                                <span>Livro</span>
                            </label>
                            <Select
                                value={livroId}
                                onValueChange={(value) => setLivroId(value)}
                                name="livro"
                                required
                            >
                                <SelectTrigger className="input-modern cursor-pointer">
                                    <SelectValue placeholder="Selecione um livro" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                                    {livros.map((livro) => (
                                        <SelectItem
                                            key={livro.id}
                                            value={livro.id.toString()}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-lg"
                                        >
                                            {livro.titulo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Membro */}
                        <div className="form-group">
                            <label className="form-label flex items-center space-x-2">
                                <FiUser className="text-indigo-500" />
                                <span>Membro</span>
                            </label>
                            <Select
                                value={membroId}
                                onValueChange={(value) => setMembroId(value)}
                                name="membro"
                                required
                            >
                                <SelectTrigger className="input-modern cursor-pointer">
                                    <SelectValue placeholder="Selecione um membro" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                                    {membros.map((membro) => (
                                        <SelectItem
                                            key={membro.id}
                                            value={membro.id.toString()}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-lg"
                                        >
                                            {membro.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Datas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Data de Empréstimo */}
                            <div className="form-group">
                                <label className="form-label flex items-center space-x-2">
                                    <FiCalendar className="text-indigo-500" />
                                    <span>Data de Empréstimo</span>
                                </label>
                                <Popover open={openEmprestimo} onOpenChange={setOpenEmprestimo}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between input-modern cursor-pointer"
                                        >
                                            {dataEmprestimoDate ? dataEmprestimoDate.toLocaleDateString('pt-BR') : "Selecione a data"}
                                            <ChevronDownIcon className="text-gray-400" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-xl border" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dataEmprestimoDate}
                                            onSelect={(date) => setDataEmprestimoDate(date)}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Data de Devolução */}
                            <div className="form-group">
                                <label className="form-label flex items-center space-x-2">
                                    <FiCalendar className="text-indigo-500" />
                                    <span>Data de Devolução</span>
                                </label>
                                <Popover open={openDevolucao} onOpenChange={setOpenDevolucao}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between input-modern cursor-pointer"
                                        >
                                            {dataDevolucaoDate ? dataDevolucaoDate.toLocaleDateString('pt-BR') : "Selecione a data"}
                                            <ChevronDownIcon className="text-gray-400" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-xl border" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dataDevolucaoDate}
                                            onSelect={setDataDevolucaoDate}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="form-group">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${status ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <FiCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Status do Empréstimo</p>
                                        <p className="text-sm text-gray-500">
                                            {status ? 'Empréstimo ativo' : 'Empréstimo encerrado'}
                                        </p>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={status}
                                        onChange={(e) => setStatus(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Link
                                href="/emprestimos"
                                className="btn-ghost flex items-center space-x-2"
                            >
                                <FiArrowLeft />
                                <span>Voltar</span>
                            </Link>
                            <button
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
