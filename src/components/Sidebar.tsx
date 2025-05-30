"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import menuItems from "@/util/Options";
import { FaBars, FaTimes } from "react-icons/fa";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen((prevState) => !prevState);

    return (
        <>
            <div
                className={`md:hidden fixed top-0 left-0 z-50 ${
                    isOpen ? "bg-gray-400" : "bg-gray-900"
                } w-full h-14 flex items-center px-4`}
            >
                <button
                    onClick={toggleSidebar}
                    className="text-white focus:outline-none"
                    aria-label="Abrir Menu"
                >
                    <FaBars size={24} />
                </button>
            </div>

            <div
                className={`fixed inset-0 bg-gray-400 z-40 transition-opacity duration-300 md:hidden ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={toggleSidebar}
            ></div>

            <aside
                className={`fixed top-0 left-0 h-screen w-80 bg-gray-900 text-white flex flex-col z-50 transform transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:static`}
            >
                <div className="md:hidden flex justify-end p-4">
                    <button
                        onClick={toggleSidebar}
                        className="text-white focus:outline-none"
                        aria-label="Fechar Menu"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex items-center justify-center h-20 border-b border-gray-800">
                    <h1 className="text-xl font-bold">Sistema de biblioteca</h1>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-6 py-4 transition-colors cursor-pointer hover:bg-gray-700 ${
                                pathname === item.href ? "bg-gray-700" : ""
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="mr-4">{item.icon}</span>
                            <span className="text-lg font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="flex-shrink-0 p-4 border-t border-gray-800">
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors">
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
