import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // APENAS redirecionar se estiver na página de login E estiver logado
        // Não redirecionar de outras rotas!
        if ((pathname === "/" || pathname === "/login") && token) {
            return NextResponse.redirect(new URL("/livros", req.url));
        }

        // Para todas outras rotas, continuar normalmente
        return NextResponse.next();
    },
    {
        pages: {
            signIn: "/",
        },
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                if (pathname === "/" || pathname === "/login" || pathname === "/cadastro") {
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
