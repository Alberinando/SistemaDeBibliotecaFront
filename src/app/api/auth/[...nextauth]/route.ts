import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotecaapi.alberinando.net";

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
            // Na primeira autenticação, adiciona os tokens ao JWT
            if (user) {
                token.id = user.id;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            // Expõe os dados necessários na session
            session.user.id = token.id as string;
            session.accessToken = token.accessToken as string;
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
