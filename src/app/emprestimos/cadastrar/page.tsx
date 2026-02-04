"use client"
import { useState, useEffect, FormEvent, useCallback } from 'react';
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
    const [quantidade, setQuantidade] = useState<number>(1);
    const [livros, setLivros] = useState<{ id: number; titulo: string; quantidade?: number }[]>([]);
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

    // Externalized Helpers
    function dateToIsoAtMidnightLocal(date?: Date | undefined) {
        if (!date) return null;
        const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return localMidnight.toISOString();
    }

    const handleSubmit = useCallback(async (e: FormEvent) => {
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
                status,
                quantidade
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
    }, [auth, dataEmprestimoDate, dataDevolucaoDate, livroId, membroId, status, quantidade, router]);

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
                            href="/emprestimos"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <FiArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="page-title text-lg">Cadastrar Empréstimo</h1>
                            <p className="text-gray-500 text-xs">
                                Preencha os dados do empréstimo
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                        >
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-[10px]">!</span>
                            </div>
                            <p className="text-red-600 text-xs">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Livro e Membro em grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Livro */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiBook className="text-indigo-500" size={14} />
                                    <span>Livro</span>
                                </label>
                                <Select
                                    value={livroId}
                                    onValueChange={(value) => setLivroId(value)}
                                    name="livro"
                                    required
                                >
                                    <SelectTrigger className="input-modern text-sm py-2 cursor-pointer">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                                        {livros.map((livro) => (
                                            <SelectItem
                                                key={livro.id}
                                                value={livro.id.toString()}
                                                className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer rounded text-sm"
                                            >
                                                {livro.titulo} {livro.quantidade !== undefined && `(${livro.quantidade} disp.)`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Membro */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiUser className="text-indigo-500" size={14} />
                                    <span>Membro</span>
                                </label>
                                <Select
                                    value={membroId}
                                    onValueChange={(value) => setMembroId(value)}
                                    name="membro"
                                    required
                                >
                                    <SelectTrigger className="input-modern text-sm py-2 cursor-pointer">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                                        {membros.map((membro) => (
                                            <SelectItem
                                                key={membro.id}
                                                value={membro.id.toString()}
                                                className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer rounded text-sm"
                                            >
                                                {membro.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Datas em grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Data de Empréstimo */}
                            <div className="form-group">
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiCalendar className="text-indigo-500" size={14} />
                                    <span>Data Empréstimo</span>
                                </label>
                                <Popover open={openEmprestimo} onOpenChange={setOpenEmprestimo}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between input-modern text-sm py-2 cursor-pointer"
                                        >
                                            {dataEmprestimoDate ? dataEmprestimoDate.toLocaleDateString('pt-BR') : "Selecione"}
                                            <ChevronDownIcon className="text-gray-400" size={16} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-xl border" align="start">
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
                                <label className="form-label text-xs flex items-center space-x-1.5">
                                    <FiCalendar className="text-indigo-500" size={14} />
                                    <span>Data Devolução</span>
                                </label>
                                <Popover open={openDevolucao} onOpenChange={setOpenDevolucao}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between input-modern text-sm py-2 cursor-pointer"
                                        >
                                            {dataDevolucaoDate ? dataDevolucaoDate.toLocaleDateString('pt-BR') : "Selecione"}
                                            <ChevronDownIcon className="text-gray-400" size={16} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-xl border" align="start">
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

                        {/* Quantidade */}
                        <div className="form-group">
                            <label className="form-label text-xs flex items-center space-x-1.5">
                                <FiBook className="text-indigo-500" size={14} />
                                <span>Quantidade</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantidade}
                                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                                className="input-modern text-sm py-2 w-full"
                                required
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="form-group">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${status ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <FiCheck size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">Status</p>
                                        <p className="text-xs text-gray-500">
                                            {status ? 'Ativo' : 'Encerrado'}
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
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <Link
                                href="/emprestimos"
                                className="btn-ghost text-sm flex items-center space-x-1.5 px-3 py-1.5"
                            >
                                <FiArrowLeft size={14} />
                                <span>Voltar</span>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-success text-sm flex items-center space-x-1.5 px-4 py-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={14} />
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
