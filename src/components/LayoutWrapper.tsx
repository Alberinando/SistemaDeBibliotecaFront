"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children}: Readonly<{children: React.ReactNode; }>) {
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
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}
