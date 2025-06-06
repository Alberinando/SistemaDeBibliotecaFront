export interface Membro {
    id: number;
    nome: string;
    cpf: number;
    telefone: number;
    email: string;
}

export interface MembroPage {
    content: Membro[];
    totalPages: number;
    number: number;
}
