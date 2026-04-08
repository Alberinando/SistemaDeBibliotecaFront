"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

export default function LayoutWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
    const path = usePathname();
    const isLogin = path === "/";

    if (isLogin) {
        return (
            <main className="min-h-screen bg-background">
                {children}
            </main>
        );
    }

    return (
        <AuthenticatedPage>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
                    {children}
                </main>
            </div>
        </AuthenticatedPage>
    );
}
