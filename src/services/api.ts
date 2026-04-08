import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

// Usa variável de ambiente ou fallback para a URL da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor de requisição para adicionar token do NextAuth
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Obtém a sessão do NextAuth (client-side)
        const session = await getSession();

        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Estende o tipo de config para incluir _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Se receber 401, redireciona para login
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Com NextAuth, o refresh é gerenciado automaticamente pelo middleware
            // Se chegou aqui com 401, a sessão expirou - redireciona para login
            if (typeof window !== "undefined") {
                signOut({ callbackUrl: "/" });
            }
        }

        return Promise.reject(error);
    }
);

export default api;
