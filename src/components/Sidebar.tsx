"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import menuItems from "@/util/Options";
import { Menu, X, LogOut, BookOpen } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const user = session?.user;
    const isMounted = status !== "loading";

    function logout() {
        signOut({ callbackUrl: "/" });
    }

    const toggleSidebar = () => setIsOpen((prevState) => !prevState);

    return (
        <>
            {/* Mobile Header */}
            <div
                className={`md:hidden fixed top-0 left-0 z-50 w-full h-16 flex items-center justify-between px-4 transition-all duration-300 ${isOpen
                    ? "bg-transparent"
                    : "bg-sidebar shadow-lg"
                    }`}
            >
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 cursor-pointer"
                        aria-label="Abrir Menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="ml-4 text-sidebar-foreground font-semibold text-lg">
                        Biblioteca
                    </span>
                </div>
                {/* Single NotificationBell - shown on mobile when sidebar is closed */}
                {isMounted && (
                    <div className={isOpen ? 'hidden' : 'block md:hidden'}>
                        <NotificationBell />
                    </div>
                )}
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-60 z-50 bg-sidebar transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 flex flex-col`}
            >
                {/* Close button for mobile */}
                <div className="md:hidden absolute top-3 right-3 z-10">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 cursor-pointer"
                        aria-label="Fechar Menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center py-4 border-b border-sidebar-border shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                        <BookOpen className="text-primary-foreground" size={20} />
                    </div>
                    <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
                        Biblioteca
                    </h1>
                    <span className="text-sidebar-foreground/50 text-xs">
                        Sistema de Gestão
                    </span>
                </div>

                {/* User Info & Notifications for Desktop */}
                {isMounted && user && (
                    <div className="px-3 py-3 border-b border-sidebar-border shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold">
                                Perfil
                            </span>
                            {/* NotificationBell for desktop only */}
                            <div className="hidden md:block">
                                <NotificationBell />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sidebar-foreground font-medium text-xs truncate">
                                    {user.name || "Usuário"}
                                </p>
                                <p className="text-sidebar-foreground/50 text-[10px] truncate">
                                    Funcionário
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar">
                    <div className="px-2 space-y-0.5">
                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-sidebar-accent text-sidebar-foreground"
                                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className={`text-sm transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"
                                            }`}>
                                            {item.icon}
                                        </span>
                                        <span className="ml-2.5 font-medium text-sm">
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-sidebar-border shrink-0">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        <LogOut size={14} />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
