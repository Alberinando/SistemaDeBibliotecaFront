import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Se o usuário está logado e tenta acessar a página de login
        if (pathname === "/" && token) {
            return NextResponse.redirect(new URL("/livros", req.url));
        }

        return NextResponse.next();
    },
    {
        pages: {
            signIn: "/",
        },
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Permitir acesso à página de login sem autenticação
                if (pathname === "/" || pathname === "/login") {
                    return true;
                }

                // Permitir acesso às rotas de API do NextAuth
                if (pathname.startsWith("/api/auth")) {
                    return true;
                }

                // Todas outras rotas requerem autenticação
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        // Match all paths except static files and images
        "/((?!_next/static|_next/image|favicon.ico|icon.png).*)",
    ],
};
