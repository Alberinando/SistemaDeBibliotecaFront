"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import {useAuth} from "@/resources/users/authentication.resourse";

export default function EditarFuncionario() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);
    const auth = useAuth();

    const [nome, setNome] = useState<string>("");
    const [cargo, setCargo] = useState<string>("");
    const [login, setLogin] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
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
        setLoading(true);
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
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">Editar Funcionário</h1>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                            type="text"
                            value={nome}
                            required
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cargo</label>
                        <input
                            type="text"
                            value={cargo}
                            required
                            onChange={(e) => setCargo(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Login</label>
                        <input
                            type="text"
                            value={login}
                            required
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Link
                            href="/funcionarios"
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                        >
                            Voltar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Atualizando..." : "Atualizar"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
