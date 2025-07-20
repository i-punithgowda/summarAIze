import React, { useState } from "react";
import { summarizePR } from "../api/summarize";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) return;
        const data = await summarizePR(file);
        navigate("/pr-summary", { state: data });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <input
                type="file"
                accept=".zip,.diff"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="mb-4"
            />
            <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={!file}
            >
                Upload & Summarize
            </button>
        </div>
    );
}; 