import { AuthResponse, Credentials, ExtendedJwtPayload, UserSessionToken } from "@/resources/users/users.resouces";
import { jwtDecode } from 'jwt-decode'
import StorageLike from "@/resources/users/interfaces/storage.interface";
import BrowserStorage from "@/resources/users/interfaces/browser.storage";
import NoopStorage from "@/resources/users/interfaces/noop.storage";

// Usa variável de ambiente ou fallback para a URL da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

class AuthService {
    private storage: StorageLike;
    baseURL: string = `${API_BASE_URL}/v1/funcionario`;
    static AUTH_PARAMS: string = "_auth";

    // Buffer de tempo antes da expiração para renovar o token (5 minutos em segundos)
    private static REFRESH_BUFFER_SECONDS = 5 * 60;

    // Flag para evitar múltiplas tentativas de refresh simultâneas
    private isRefreshing: boolean = false;
    private refreshPromise: Promise<AuthResponse | null> | null = null;

    constructor() {
        if (typeof window !== "undefined" && window.localStorage) {
            this.storage = new BrowserStorage();
        } else {
            this.storage = new NoopStorage();
        }
    }

    async authenticate(credentials: Credentials): Promise<AuthResponse> {
        const response = await fetch(this.baseURL + "/auth", {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            throw new Error("Usuário ou senha incorretos!!!")
        }

        if (!response.ok) {
            throw new Error("Erro ao autenticar");
        }

        return await response.json();
    }

    initSession(authResponse: AuthResponse) {
        if (!authResponse.accessToken) {
            throw new Error("Token inválido ou ausente");
        }

        const decodedToken = jwtDecode<ExtendedJwtPayload>(authResponse.accessToken);

        const userSessionToken: UserSessionToken = {
            id: decodedToken?.id,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            login: decodedToken?.sub,
            name: decodedToken?.name,
            expiration: decodedToken?.exp
        };
        this.setUserSession(userSessionToken);
    }

    setUserSession(userSessionToken: UserSessionToken) {
        try {
            this.storage.setItem(AuthService.AUTH_PARAMS, JSON.stringify(userSessionToken));
        } catch (e) {
            throw new Error("Erro: " + e)
        }
    }

    getUserSession(): UserSessionToken | null {
        try {
            const str = this.storage.getItem(AuthService.AUTH_PARAMS);
            if (!str) return null;
            try {
                return JSON.parse(str) as UserSessionToken;
            } catch {
                return null;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    isSessionValid(): boolean {
        const userSession: UserSessionToken | null = this.getUserSession();
        if (!userSession) {
            return false;
        }
        const expiration = userSession.expiration;
        if (expiration) {
            const expirationDate = expiration * 1000;
            return new Date() < new Date(expirationDate);
        }
        return false;
    }

    /**
     * Verifica se o token está próximo de expirar (dentro do buffer).
     */
    isTokenExpiringSoon(): boolean {
        const userSession = this.getUserSession();
        if (!userSession || !userSession.expiration) {
            return false;
        }

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = userSession.expiration - now;

        return timeUntilExpiration > 0 && timeUntilExpiration <= AuthService.REFRESH_BUFFER_SECONDS;
    }

    /**
     * Renova o access token usando o refresh token.
     * Retorna null se não houver refresh token ou se a renovação falhar.
     */
    async refreshAccessToken(): Promise<AuthResponse | null> {
        // Se já está renovando, retorna a promise existente
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        const userSession = this.getUserSession();
        if (!userSession?.refreshToken) {
            console.warn("Sem refresh token disponível");
            return null;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.doRefresh(userSession.refreshToken);

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private async doRefresh(refreshToken: string): Promise<AuthResponse | null> {
        try {
            const response = await fetch(this.baseURL + "/refresh", {
                method: "POST",
                body: JSON.stringify({ refreshToken }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                // Refresh token inválido ou expirado
                console.warn("Refresh token inválido ou expirado");
                this.invalidateSession();
                return null;
            }

            if (!response.ok) {
                console.error("Erro ao renovar token:", response.status);
                return null;
            }

            const authResponse: AuthResponse = await response.json();

            // Atualiza a sessão com os novos tokens
            this.initSession(authResponse);

            console.log("Token renovado com sucesso");
            return authResponse;
        } catch (e) {
            console.error("Erro ao renovar token:", e);
            return null;
        }
    }

    /**
     * Obtém o access token atual, renovando-o se estiver próximo de expirar.
     * Esta é a função principal que deve ser usada ao fazer requisições.
     */
    async getValidAccessToken(): Promise<string | null> {
        // Se a sessão expirou completamente, tenta renovar
        if (!this.isSessionValid()) {
            const userSession = this.getUserSession();
            if (userSession?.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    return refreshed.accessToken;
                }
            }
            return null;
        }

        // Se está próximo de expirar, renova proativamente
        if (this.isTokenExpiringSoon()) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                return refreshed.accessToken;
            }
            // Se a renovação falhar, retorna o token atual (ainda válido)
        }

        return this.getUserSession()?.accessToken || null;
    }

    /**
     * Faz logout, revogando o refresh token no servidor.
     */
    async logout(): Promise<void> {
        const userSession = this.getUserSession();

        if (userSession?.refreshToken) {
            try {
                await fetch(this.baseURL + "/logout", {
                    method: "POST",
                    body: JSON.stringify({ refreshToken: userSession.refreshToken }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } catch (e) {
                console.error("Erro ao fazer logout no servidor:", e);
            }
        }

        this.invalidateSession();
    }

    invalidateSession(): void {
        try {
            this.storage.removeItem(AuthService.AUTH_PARAMS);
        } catch (e) {
            throw new Error("Erro: " + e)
        }
    }
}

// Instância singleton para compartilhar estado de refresh
let authServiceInstance: AuthService | null = null;

export const useAuth = () => {
    if (!authServiceInstance) {
        authServiceInstance = new AuthService();
    }
    return authServiceInstance;
};
