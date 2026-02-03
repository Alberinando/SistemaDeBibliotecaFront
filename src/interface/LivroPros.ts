export interface Livro {
    id: number;
    titulo: string;
    autor: string;
    categoria: string;
    disponibilidade: boolean;
    isbn: number;
    quantidade: number;
}

export interface LivroPage {
    content: Livro[];
    totalPages: number;
    totalElements?: number;
    number: number;
}

