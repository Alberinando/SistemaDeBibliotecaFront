interface EmprestimoResponseDTO {
    id: number;
    livros: {
        id: number;
        titulo: string;
        quantidade?: number;
    };
    membros: {
        id: number;
        nome: string;
    };
    dataEmprestimo: string;
    dataDevolucao: string | null;
    status: boolean;
    quantidade: number;
}

export default EmprestimoResponseDTO;

