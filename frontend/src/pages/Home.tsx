import React, { useState } from "react";
import { summarizePR } from "../api/summarize";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError("");
        try {
            const data = await summarizePR(file);
            navigate("/pr-summary", { state: data });
        } catch (err: any) {
            setError("Failed to process file. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.diff') || droppedFile.name.endsWith('.zip'))) {
            setFile(droppedFile);
            setError("");
        } else {
            setError("Please upload a .diff or .zip file");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">
                            📄 Upload PR Diff
                        </h1>
                        <p className="text-gray-600">
                            Upload a .diff or .zip file to get AI-powered summaries and suggestions
                        </p>
                    </div>

                    {/* Drag & Drop Area */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={`border-4 border-dashed rounded-xl p-12 text-center transition ${file
                                ? "border-green-400 bg-green-50"
                                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                    >
                        {file ? (
                            <div className="space-y-3">
                                <div className="text-6xl">✅</div>
                                <div className="text-lg font-semibold text-green-700">
                                    {file.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {(file.size / 1024).toFixed(2)} KB
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-6xl">📁</div>
                                <div className="text-lg font-semibold text-gray-700">
                                    Drag & drop your file here
                                </div>
                                <div className="text-sm text-gray-500">
                                    or click below to browse
                                </div>
                                <label className="inline-block">
                                    <input
                                        type="file"
                                        accept=".zip,.diff"
                                        onChange={e => {
                                            const selectedFile = e.target.files?.[0];
                                            if (selectedFile) {
                                                setFile(selectedFile);
                                                setError("");
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer inline-block font-medium">
                                        Choose File
                                    </span>
                                </label>
                                <div className="text-xs text-gray-500 mt-2">
                                    Supported formats: .diff, .zip
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Processing...
                            </span>
                        ) : (
                            '🚀 Analyze & Summarize'
                        )}
                    </button>

                    {/* Info Section */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-2">💡 How it works:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Upload a .diff file from your PR</li>
                            <li>• Or upload a .zip with two files to compare</li>
                            <li>• AI will analyze changes and provide insights</li>
                            <li>• Get summaries and improvement suggestions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
