import {JwtPayload} from "jwt-decode";

export class Users {
    name?: string;
    login?: string;
    senha?: string;
}

export class Credentials {
    login?: string;
    senha?: string;
}

// Mantido para compatibilidade
export class AcessToken {
    accessToken?: string;
}

// Nova resposta de autenticação com refresh token
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // tempo em segundos
    tokenType: string;
}

export class UserSessionToken {
    name?: string;
    login?: string;
    accessToken?: string;
    refreshToken?: string;
    expiration?: number;
}

export interface ExtendedJwtPayload extends JwtPayload {
    name?: string;
}

