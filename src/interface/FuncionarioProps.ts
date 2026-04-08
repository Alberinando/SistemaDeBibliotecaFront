export interface Funcionario {
    id: number;
    nome: string;
    cargo: string;
    login: string;
}

interface FuncionarioPage {
    content: Funcionario[];
    totalPages: number;
    totalElements?: number;
    number: number;
}

export default FuncionarioPage;
