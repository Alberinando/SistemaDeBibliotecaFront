"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AuthenticatedPage from "@/components/Authenticated/AuthenticatedPage";

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
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-3 pt-20 md:p-6 md:pt-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </AuthenticatedPage>
    );
}
