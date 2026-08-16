import React from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "./Icons";

export const NavBar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                <Link to="/" className="flex items-center gap-2.5 text-stone-900">
                    <LogoMark className="h-7 w-7 text-indigo-600" />
                    <span className="text-[15px] font-semibold tracking-tight">SummarAIze</span>
                </Link>
                <span className="text-sm text-stone-500">Git Assistant</span>
            </div>
        </nav>
    );
};
