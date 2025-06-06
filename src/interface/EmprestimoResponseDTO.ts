interface EmprestimoResponseDTO {
    id: number;
    livros: {
        id: number;
        titulo: string;
    };
    membros: {
        id: number;
        nome: string;
    };
    dataEmprestimo: string;
    dataDevolucao: string | null;
    status: boolean;
}

export default EmprestimoResponseDTO;
