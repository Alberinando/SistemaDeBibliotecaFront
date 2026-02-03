"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import menuItems from "@/util/Options";
import { FaBars, FaTimes, FaSignOutAlt, FaBook } from "react-icons/fa";
import { useAuth } from "@/resources/users/authentication.resourse";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const auth = useAuth();
    const router = useRouter();
    const user = auth.getUserSession();

    function logout() {
        auth.invalidateSession();
        router.push("/");
    }

    const toggleSidebar = () => setIsOpen((prevState) => !prevState);

    return (
        <>
            {/* Mobile Header */}
            <div
                className={`md:hidden fixed top-0 left-0 z-50 w-full h-16 flex items-center px-4 transition-all duration-300 ${isOpen
                        ? "bg-transparent"
                        : "bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 shadow-lg"
                    }`}
            >
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
                className={`fixed top-0 left-0 h-screen w-72 z-50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:static`}
                style={{
                    background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                }}
            >
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Close button for mobile */}
                <div className="md:hidden absolute top-4 right-4 z-10">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        aria-label="Fechar Menu"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Logo Section */}
                <div className="relative flex flex-col items-center justify-center py-8 border-b border-white/10">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-3">
                        <FaBook className="text-white text-2xl" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Biblioteca
                    </h1>
                    <span className="text-indigo-300 text-sm mt-1">
                        Sistema de Gestão
                    </span>
                </div>

                {/* User Info */}
                {user && (
                    <div className="relative px-5 py-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                    {user.name || "Usuário"}
                                </p>
                                <p className="text-indigo-300 text-xs truncate">
                                    Funcionário
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="relative flex-1 py-4 overflow-y-auto">
                    <div className="px-3 space-y-1">
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
                                        className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? "bg-white/15 text-white shadow-lg shadow-black/10"
                                                : "text-indigo-200 hover:bg-white/10 hover:text-white"
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"
                                            }`}>
                                            {item.icon}
                                        </span>
                                        <span className="ml-3 font-medium text-[0.95rem]">
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
                <div className="relative p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 cursor-pointer"
                    >
                        <FaSignOutAlt />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
