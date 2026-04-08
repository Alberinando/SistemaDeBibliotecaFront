"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";

export default function LayoutWrapper({ children }: Readonly<{ children: React.ReactNode; }>) {
    const path = usePathname();
    const isLogin = path === "/" || path === "/login";

    if (isLogin) {
        return (
            <main>
                {children}
            </main>
        );
    }

    return (
        <WebSocketProvider>
            <div className="min-h-screen">
                <Sidebar />
                <main className="md:ml-60 min-h-screen p-2 pt-18 md:p-4 md:pt-4 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </WebSocketProvider>
    );
}
