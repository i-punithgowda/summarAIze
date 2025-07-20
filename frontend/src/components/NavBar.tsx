import React from "react";
import { Link, useLocation } from "react-router-dom";

export const NavBar: React.FC = () => {
    const location = useLocation();
    return (
        <nav className="bg-gray-800 text-white px-4 py-3 flex gap-6 items-center">
            <span className="font-bold text-lg">SummarAIze</span>
            <Link
                to="/git-assistant"
                className={`hover:underline ${location.pathname === "/git-assistant" ? "underline font-semibold" : ""}`}
            >
                Git Assistant
            </Link>
        </nav>
    );
}; 