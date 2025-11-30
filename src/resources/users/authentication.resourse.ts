import {AcessToken, Credentials, ExtendedJwtPayload, UserSessionToken} from "@/resources/users/users.resouces";
import {jwtDecode} from 'jwt-decode'
import StorageLike from "@/resources/users/interfaces/storage.interface";
import BrowserStorage from "@/resources/users/interfaces/browser.storage";
import NoopStorage from "@/resources/users/interfaces/noop.storage";

class AuthService {
    private storage: StorageLike;
    baseURL: string = "https://sistemabiblioteca.alberinando.com/v1/funcionario";
    static AUTH_PARAMS: string = "_auth";

    constructor() {
        if (typeof window !== "undefined" && window.localStorage) {
            this.storage = new BrowserStorage();
        } else {
            this.storage = new NoopStorage();
        }
    }

    async authenticate(credentials: Credentials): Promise<AcessToken> {
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

        return await response.json();
    }

    initSession(token: AcessToken) {
        if (!token.accessToken) {
            throw new Error("Token inválido ou ausente");
        }

        const decodedToken = jwtDecode<ExtendedJwtPayload>(token.accessToken);

        const userSessionToken: UserSessionToken = {
            accessToken: token.accessToken,
            login: decodedToken?.sub,
            name: decodedToken?.name,
            expiration: decodedToken?.exp
        };
        this.setUserSession(userSessionToken);
    }

    setUserSession(userSessionToken: UserSessionToken){
        try {
            localStorage.setItem(AuthService.AUTH_PARAMS, JSON.stringify(userSessionToken));
        } catch (e){
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
        if(expiration) {
            const expirationDate = expiration * 1000;
            return new Date() < new Date(expirationDate);
        }
        return false;
    }

    invalidateSession(): void {
        try {
            localStorage.removeItem(AuthService.AUTH_PARAMS);
        } catch (e){
            throw new Error("Erro: " + e)
        }
    }
}

export const useAuth = () => new AuthService();
