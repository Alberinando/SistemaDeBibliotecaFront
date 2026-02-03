export interface Emprestimo {
    id: number;
    livros: {
        id: number;
        titulo: string;
        categoria: string;
        autor: string;
    };
    membros: {
        id: number;
        nome: string;
    };
    dataEmprestimo: string;
    dataDevolucao: string;
    status: boolean;
}

export interface EmprestimoPage {
    content: Emprestimo[];
    totalPages: number;
    totalElements?: number;
    number: number;
}
