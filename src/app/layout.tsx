import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Sistema de Biblioteca",
    description: "Sistema de Gerenciamento de Biblioteca",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body className={`${inter.variable} font-sans antialiased bg-background min-h-screen`}>
                <AuthProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
