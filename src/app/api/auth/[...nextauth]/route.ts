import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

async function refreshAccessToken(token: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/funcionario/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fallback to old refresh token
        };
    } catch (error) {
        console.error("Erro ao atualizar token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                login: { label: "Login", type: "text" },
                senha: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.login || !credentials?.senha) {
                    return null;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/v1/funcionario/auth`, {
                        method: "POST",
                        body: JSON.stringify({
                            login: credentials.login,
                            senha: credentials.senha
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    if (!response.ok) {
                        return null;
                    }

                    const data = await response.json();

                    // Retorna o usuário com os tokens
                    return {
                        id: String(data.id || "1"),
                        name: data.name || credentials.login,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    };
                } catch (error) {
                    console.error("Erro na autenticação:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // 1. Initial sign in
            if (user) {
                return {
                    id: user.id,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    name: user.name,
                };
            }

            // 2. Check if access token is still valid
            // Decode token to get expiration time
            if (token.accessToken) {
                try {
                    const decoded: any = jwtDecode(token.accessToken as string);
                    const expirationTime = decoded.exp * 1000; // Convert to ms
                    const now = Date.now();

                    // Refresh if expired or expiring soon (e.g., within 1 minute)
                    if (now < expirationTime - 60000) {
                        return token;
                    }
                } catch (e) {
                    console.error("Error decoding token:", e);
                    // If decode fails, try to refresh immediately
                }
            }

            // 3. Access token has expired, try to update it
            return await refreshAccessToken(token);
        },
        async session({ session, token }) {
            // Expõe os dados necessários na session
            session.user.id = token.id as string;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string; // Pass error to client if refresh failed
            return session;
        }
    },
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
