"use client"
import { useState, useEffect, FormEvent } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {useAuth} from "@/resources/users/authentication.resourse";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {ChevronDownIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";

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
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Cadastrar Novo Empréstimo</h1>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dropdown para Livro */}
                <div>
                    <label htmlFor="livro" className="block text-lg font-semibold mb-2 cursor-pointer">
                        Livro
                    </label>
                    <Select
                        value={livroId}
                        onValueChange={(value) => setLivroId(value)}
                        name="livro"
                        required
                    >
                        <SelectTrigger
                            id="livro"
                            className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <SelectValue placeholder="Selecione um livro" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
                            {livros.map((livro) => (
                                <SelectItem
                                    key={livro.id}
                                    value={livro.id.toString()}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {livro.titulo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Dropdown para Membro */}
                <div>
                    <label htmlFor="membro" className="block text-lg font-semibold mb-2 cursor-pointer">
                        Membro
                    </label>
                    <Select
                        value={membroId}
                        onValueChange={(value) => setMembroId(value)}
                        name="membro"
                        required
                    >
                        <SelectTrigger
                            id="membro"
                            className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
                            {membros.map((membro) => (
                                <SelectItem
                                    key={membro.id}
                                    value={membro.id.toString()}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {membro.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Data de Empréstimo */}
                <div>
                    <label htmlFor="dataEmprestimo" className="block text-lg font-semibold mb-2">
                        Data de Empréstimo
                    </label>
                    <Popover open={openEmprestimo} onOpenChange={setOpenEmprestimo}>
                        <PopoverTrigger asChild className="cursor-pointer">
                            <Button
                                variant="outline"
                                id="date"
                                className="w-48 justify-between font-normal"
                            >
                                {dataEmprestimoDate ? dataEmprestimoDate.toLocaleDateString() : "Selecione a data"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
                <div>
                    <label htmlFor="dataDevolucao" className="block text-lg font-semibold mb-2">
                        Data de Devolução
                    </label>
                    <Popover open={openDevolucao} onOpenChange={setOpenDevolucao}>
                        <PopoverTrigger asChild className="cursor-pointer">
                            <Button
                                variant="outline"
                                id="date"
                                className="w-48 justify-between font-normal"
                            >
                                {dataDevolucaoDate ? dataDevolucaoDate.toLocaleDateString() : "Selecione a data"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dataDevolucaoDate}
                                onSelect={setDataDevolucaoDate}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Status */}
                <div>
                    {/* Envolvemos o switch inteiro em um label para que toda a área seja clicável */}
                    <label htmlFor="status" className="flex items-center cursor-pointer">
                        <span className="text-lg font-semibold mr-3">Status</span>
                        <div className="relative">
                            <input
                                id="status"
                                type="checkbox"
                                checked={status}
                                onChange={(e) => setStatus(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition"></div>
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                        <span className="ml-3 text-lg font-medium">{status ? "Ativo" : "Inativo"}</span>
                    </label>
                </div>

                {/* Botões */}
                <div className="flex justify-between items-center mt-8">
                    <Link
                        href="/emprestimos"
                        className="cursor-pointer px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition"
                    >
                        Voltar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
        </div>
            </AuthenticatedPage>
    );
}
