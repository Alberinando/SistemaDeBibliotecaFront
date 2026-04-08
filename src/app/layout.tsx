import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Sistema de Biblioteca",
    description: "Sistema de gerenciamento de biblioteca — controle de livros, membros e empréstimos.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                        document.documentElement.classList.add('dark');
                                    }
                                } catch(e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={`${inter.variable} antialiased`}>
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
