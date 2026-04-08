"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import menuItems from "@/util/Options";
import { Menu, X, LogOut, Library, Sun, Moon } from "lucide-react";
import { useAuth } from "@/resources/users/authentication.resourse";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const pathname = usePathname();
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    function toggleTheme() {
        const html = document.documentElement;
        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    }

    function logout() {
        auth.invalidateSession();
        router.push("/");
    }

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[var(--sidebar)] border-b border-[var(--sidebar-border)]">
                <div className="flex items-center gap-2">
                    <Library size={20} className="text-[var(--sidebar-primary)]" />
                    <span className="text-[var(--sidebar-foreground)] font-semibold text-sm">
                        Biblioteca
                    </span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="text-[var(--sidebar-foreground)] p-1 hover:opacity-80 transition-opacity"
                    aria-label="Abrir Menu"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col z-50 transform transition-transform duration-200 ease-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:static md:flex-shrink-0`}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--sidebar-border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--sidebar-primary)] flex items-center justify-center">
                            <Library size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight">
                            Biblioteca
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-[var(--sidebar-foreground)] p-1 hover:opacity-80 transition-opacity"
                        aria-label="Fechar Menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3">
                    <div className="space-y-0.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-[var(--sidebar-primary)] text-white"
                                            : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className={`flex-shrink-0 ${isActive ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--sidebar-border)] space-y-1.5">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
