export interface Historico {
    id: number;
    livros: {
        id: number;
        titulo: string;
        autor?: string;
        categoria?: string;
        disponibilidade?: boolean;
        isbn?: number;
        quantidade?: number;
        createdAt?: string;
        updatedAt?: string;
    };
    membros: {
        id: number;
        nome: string;
        cpf?: number;
        telefone?: number;
        email?: string;
        createdAt?: string;
        updatedAt?: string;
    };
    dataAcao: string;
}

export interface HistoricoPage {
    content: Historico[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
}
