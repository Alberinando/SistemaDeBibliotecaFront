"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import formatTelefone from "@/util/formatTelefone";
import formatCpf from "@/util/formatCpf";
import {useAuth} from "@/resources/users/authentication.resourse";

export default function EditarMembro() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [nome, setNome] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [telefone, setTelefone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
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
        setLoading(true);
        setError(null);
        const userSession = auth.getUserSession();
        try {
            await api.put(`/v1/membros`, {
                id,
                nome,
                cpf: Number(cpf.replace(/\D/g, "")), // Remove máscara para envio
                telefone: Number(telefone.replace(/\D/g, "")), // Remove máscara para envio
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
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">Editar Membro</h1>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">CPF</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(formatCpf(e.target.value))}
                            required
                            placeholder="000.000.000-00"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone</label>
                        <input
                            type="text"
                            value={telefone}
                            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                            required
                            placeholder="(00) 00000-0000"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Link href="/membros" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
                            Voltar
                        </Link>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                            {loading ? "Atualizando..." : "Atualizar"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
