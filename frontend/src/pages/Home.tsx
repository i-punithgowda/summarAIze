import React, { useState } from "react";
import { summarizePR } from "../api/summarize";
import { useNavigate } from "react-router-dom";
import { IconCheck, IconUpload, Spinner } from "../components/Icons";

export const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [dragOver, setDragOver] = useState(false);
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

    const acceptFile = (droppedFile: File) => {
        if (droppedFile.name.endsWith(".diff") || droppedFile.name.endsWith(".zip")) {
            setFile(droppedFile);
            setError("");
        } else {
            setError("Please upload a .diff or .zip file");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) acceptFile(droppedFile);
    };

    return (
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-6 py-16">
            <div className="card w-full p-8">
                <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Upload a PR diff</h1>
                <p className="mt-1 text-sm text-stone-500">Drop a .diff or .zip to get a summary and suggestions.</p>

                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`mt-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                        file
                            ? "border-emerald-300 bg-emerald-50"
                            : dragOver
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-stone-200 bg-stone-50 hover:border-indigo-300"
                    }`}
                >
                    {file ? (
                        <div className="space-y-2">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <IconCheck className="h-6 w-6" />
                            </div>
                            <div className="font-medium text-stone-900">{file.name}</div>
                            <div className="text-sm text-stone-500">{(file.size / 1024).toFixed(2)} KB</div>
                            <button onClick={() => setFile(null)} className="text-sm text-rose-600 hover:underline">
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <IconUpload className="h-6 w-6" />
                            </div>
                            <div className="font-medium text-stone-800">Drag & drop your file</div>
                            <label className="inline-block">
                                <input
                                    type="file"
                                    accept=".zip,.diff"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) acceptFile(selectedFile);
                                    }}
                                    className="hidden"
                                />
                                <span className="btn-primary cursor-pointer">Choose file</span>
                            </label>
                            <div className="text-xs text-stone-400">Supported: .diff, .zip</div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="btn-primary mt-5 w-full py-3"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner /> Processing…
                        </span>
                    ) : (
                        "Analyze & summarize"
                    )}
                </button>
            </div>
        </div>
    );
};
