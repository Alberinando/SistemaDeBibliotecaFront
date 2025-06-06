"use client";
import { useState, FormEvent, useRef, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateMembro() {
    const router = useRouter();

    const [nome, setNome] = useState<string>("");
    const [cpf, setCpf] = useState<number | "">("");
    const [telefone, setTelefone] = useState<number | "">("");
    const [email, setEmail] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const nomeRef = useRef<HTMLInputElement>(null);
    const cpfRef = useRef<HTMLInputElement>(null);
    const telefoneRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

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
        try {
            await api.post("/v1/membros", {
                nome,
                cpf: cpf === "" ? 0 : Number(cpf),
                telefone: telefone === "" ? 0 : Number(telefone),
                email,
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
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">Cadastrar Novo Membro</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input ref={nomeRef} type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">CPF</label>
                    <input ref={cpfRef} type="number" value={cpf} onChange={(e) => setCpf(e.target.value === "" ? "" : Number(e.target.value))} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input ref={telefoneRef} type="number" value={telefone} onChange={(e) => setTelefone(e.target.value === "" ? "" : Number(e.target.value))} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Link href="/membros" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
                        Voltar
                    </Link>
                    <button ref={submitButtonRef} type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
