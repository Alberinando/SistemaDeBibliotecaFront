"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";

export default function LayoutWrapper({ children }: Readonly<{ children: React.ReactNode; }>) {
    const path = usePathname();
    const isLogin = path === "/";

    if (isLogin) {
        return (
            <main>
                {children}
            </main>
        );
    }

    return (
        <AuthenticatedPage>
            <WebSocketProvider>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 p-2 pt-18 md:p-4 md:pt-4 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </WebSocketProvider>
        </AuthenticatedPage>
    );
}
