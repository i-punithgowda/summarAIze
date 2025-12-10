import React from "react";
import { Link } from "react-router-dom";

export const NavBar: React.FC = () => {
    return (
        <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex gap-8 items-center">
                <Link to="/" className="font-bold text-xl hover:text-blue-400 transition">
                    🚀 SummarAIze - Git Assistant
                </Link>
            </div>
        </nav>
    );
};
