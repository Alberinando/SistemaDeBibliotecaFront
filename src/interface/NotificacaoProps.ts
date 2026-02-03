export interface Notificacao {
    id: number;
    mensagem: string;
    lida: boolean;
    createdAt: string;
    emprestimoId: number;
    livroTitulo: string;
    membroNome: string;
}

export interface NotificacaoPage {
    content: Notificacao[];
    totalPages: number;
    totalElements: number;
}
