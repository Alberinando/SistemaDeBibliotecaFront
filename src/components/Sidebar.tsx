"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import menuItems from "@/util/Options";
import { FaBars, FaTimes, FaSignOutAlt, FaBook } from "react-icons/fa";
import { useAuth } from "@/resources/users/authentication.resourse";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const auth = useAuth();
    const router = useRouter();

    // Only access localStorage after component mounts (client-side only)
    const user = isMounted ? auth.getUserSession() : null;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    function logout() {
        auth.invalidateSession();
        router.push("/");
    }

    const toggleSidebar = () => setIsOpen((prevState) => !prevState);

    return (
        <>
            {/* Mobile Header */}
            <div
                className={`md:hidden fixed top-0 left-0 z-50 w-full h-16 flex items-center justify-between px-4 transition-all duration-300 ${isOpen
                    ? "bg-transparent"
                    : "bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 shadow-lg"
                    }`}
            >
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        aria-label="Abrir Menu"
                    >
                        <FaBars size={22} />
                    </button>
                    <span className="ml-4 text-white font-semibold text-lg">
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-60 z-50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:static flex flex-col`}
                style={{
                    background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                }}
            >
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Close button for mobile */}
                <div className="md:hidden absolute top-3 right-3 z-10">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        aria-label="Fechar Menu"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Logo Section */}
                <div className="relative flex flex-col items-center justify-center py-4 border-b border-white/10 shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-2">
                        <FaBook className="text-white text-lg" />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight">
                        Biblioteca
                    </h1>
                    <span className="text-indigo-300 text-xs">
                        Sistema de Gestão
                    </span>
                </div>

                {/* User Info & Notifications for Desktop */}
                {isMounted && user && (
                    <div className="relative px-3 py-3 border-b border-white/10 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">
                                Perfil
                            </span>
                            {/* NotificationBell for desktop only */}
                            <div className="hidden md:block">
                                <NotificationBell />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">
                                    {user.name || "Usuário"}
                                </p>
                                <p className="text-indigo-300 text-[10px] truncate">
                                    Funcionário
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="relative flex-1 py-2 overflow-y-auto custom-scrollbar">
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
                                            ? "bg-white/15 text-white shadow-lg shadow-black/10"
                                            : "text-indigo-200 hover:bg-white/10 hover:text-white"
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
                                                className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="relative p-3 border-t border-white/10 shrink-0">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm rounded-lg transition-all duration-200 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 cursor-pointer"
                    >
                        <FaSignOutAlt size={14} />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
