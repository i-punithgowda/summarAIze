import React, { useState } from "react";
import api from '../api/axios';

export const GitAssistant: React.FC = () => {
    const [inputPath, setInputPath] = useState<string>("/home/puni/Documents/Personal Stuffs/projects/SummarAIze"); const [selectedProject, setSelectedProject] = useState<string>("");
    const [projectName, setProjectName] = useState<string>("");
    const [branches, setBranches] = useState<string[]>([]);
    const [baseBranch, setBaseBranch] = useState<string>("");
    const [compareBranch, setCompareBranch] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [diff, setDiff] = useState<string>("");
    const [compareLoading, setCompareLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setProjectName("");
        setSelectedProject("");
        setBranches([]);
        setBaseBranch("");
        setCompareBranch("");
        setCompareClicked(false);
        setDiff("");
        if (!inputPath.trim()) {
            setError("Please enter a repository path.");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/check-repo', { path: inputPath.trim() });
            setSelectedProject(inputPath.trim());
            setProjectName(res.data.project_name);
            setBranches(res.data.branches);
            setError("");
            console.log("Selected Git project path:", inputPath.trim());
        } catch (err: any) {
            setSelectedProject("");
            setProjectName("");
            setBranches([]);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Failed to check repository. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompareClicked(true);
        setDiff("");
        setError("");
        setCompareLoading(true);
        try {
            const res = await api.post('/compare-branches', {
                path: selectedProject,
                base_branch: baseBranch,
                compare_branch: compareBranch,
            });
            setDiff(res.data.diff);
        } catch (err: any) {
            setDiff("");
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Failed to compare branches. Please try again.");
            }
        } finally {
            setCompareLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow flex flex-col gap-6">
            <h1 className="text-2xl font-bold mb-4">Git Assistant</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="font-medium text-gray-700">Enter Repository Path</label>
                <input
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. /home/user/projects/my-repo"
                    value={inputPath}
                    onChange={e => setInputPath(e.target.value)}
                    autoFocus
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Checking...' : 'Select Repository'}
                </button>
                {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </form>
            {selectedProject && projectName && branches.length > 0 && (
                <div className="bg-gray-100 text-gray-800 p-2 rounded text-sm">
                    Selected project: <span className="font-mono">{selectedProject}</span><br />
                    Project name: <span className="font-semibold">{projectName}</span>
                </div>
            )}
            {selectedProject && projectName && branches.length > 0 && (
                <form className="flex flex-col gap-4 mt-4" onSubmit={handleCompare}>
                    <label className="font-medium text-gray-700">Base Branch</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                        value={baseBranch}
                        onChange={e => setBaseBranch(e.target.value)}
                        required
                    >
                        <option value="">-- Select base branch --</option>
                        {branches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </select>
                    <label className="font-medium text-gray-700">Compare Branch</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                        value={compareBranch}
                        onChange={e => setCompareBranch(e.target.value)}
                        required
                    >
                        <option value="">-- Select compare branch --</option>
                        {branches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                        disabled={!baseBranch || !compareBranch || baseBranch === compareBranch || compareLoading}
                    >
                        {compareLoading ? 'Comparing...' : 'Compare Branches'}
                    </button>
                    {compareClicked && diff && (
                        <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-x-auto text-xs mt-2 max-h-96 whitespace-pre-wrap">{diff}</pre>
                    )}
                    {compareClicked && !diff && !compareLoading && !error && (
                        <div className="text-blue-700 text-sm mt-2">No differences found.</div>
                    )}
                    {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
                </form>
            )}
        </div>
    );
}; 