import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/resources/users/authentication.resourse";

// Usa variável de ambiente ou fallback para a URL da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor de requisição para adicionar token e renovar se necessário
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const auth = useAuth();

        // Obtém um token válido (renova automaticamente se necessário)
        const accessToken = await auth.getValidAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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

        // Se receber 401 e ainda não tentou renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const auth = useAuth();
            const refreshed = await auth.refreshAccessToken();

            if (refreshed) {
                // Atualiza o header com o novo token e retenta a requisição
                originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
                return api(originalRequest);
            } else {
                // Refresh falhou, redireciona para login
                if (typeof window !== "undefined") {
                    auth.invalidateSession();
                    window.location.href = "/";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
