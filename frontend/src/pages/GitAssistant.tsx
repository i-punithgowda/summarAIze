import React, { useState, useEffect } from "react";
import api from '../api/axios';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface Directory {
    name: string;
    path: string;
    is_git_repo: boolean;
}

interface FileChange {
    file: string;
    old_content: string;
    new_content: string;
    summary: string;
    suggestions: string[];
}

export const GitAssistant: React.FC = () => {
    // View state: 'setup' or 'results'
    const [viewState, setViewState] = useState<'setup' | 'results'>('setup');

    const [showBrowser, setShowBrowser] = useState<boolean>(true);
    const [currentPath, setCurrentPath] = useState<string>("");
    const [parentPath, setParentPath] = useState<string | null>(null);
    const [directories, setDirectories] = useState<Directory[]>([]);
    const [browserLoading, setBrowserLoading] = useState<boolean>(false);
    const [inputPath, setInputPath] = useState<string>("");
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [projectName, setProjectName] = useState<string>("");
    const [branches, setBranches] = useState<string[]>([]);
    const [baseBranch, setBaseBranch] = useState<string>("");
    const [compareBranch, setCompareBranch] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [files, setFiles] = useState<FileChange[]>([]);
    const [compareLoading, setCompareLoading] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<number | null>(null);
    const [reviewRules, setReviewRules] = useState<string>("");

    // Load directories on mount
    useEffect(() => {
        loadDirectories("");
    }, []);

    const loadDirectories = async (path: string) => {
        setBrowserLoading(true);
        setError("");
        try {
            const res = await api.post('/list-directories', { path: path || "" });
            setCurrentPath(res.data.current_path);
            setParentPath(res.data.parent_path);
            setDirectories(res.data.directories);
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Failed to load directories. Please try again.");
            }
        } finally {
            setBrowserLoading(false);
        }
    };

    const handleNavigateToDirectory = (path: string) => {
        loadDirectories(path);
    };

    const handleSelectDirectory = async (path: string) => {
        setInputPath(path);
        setShowBrowser(false);
        setError("");
        setProjectName("");
        setSelectedProject("");
        setBranches([]);
        setBaseBranch("");
        setCompareBranch("");
        setFiles([]);
        setLoading(true);
        try {
            const res = await api.post('/check-repo', { path: path });
            setSelectedProject(path);
            setProjectName(res.data.project_name);
            setBranches(res.data.branches);
            setError("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setProjectName("");
        setSelectedProject("");
        setBranches([]);
        setBaseBranch("");
        setCompareBranch("");
        setFiles([]);
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
        setFiles([]);
        setError("");
        setCompareLoading(true);
        try {
            const res = await api.post('/compare-branches', {
                path: selectedProject,
                base_branch: baseBranch,
                compare_branch: compareBranch,
                review_rules: reviewRules.trim() || undefined,
            });
            setFiles(res.data.files || []);
            setViewState('results'); // Switch to results view
            setSelectedFile(null);
        } catch (err: any) {
            setFiles([]);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Failed to compare branches. Please try again.");
            }
        } finally {
            setCompareLoading(false);
        }
    };

    const handleNewComparison = () => {
        setViewState('setup');
        setFiles([]);
        setSelectedFile(null);
        setError("");
    };

    // Setup View
    const renderSetupView = () => (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Git Assistant</h1>
                <p className="text-gray-600 mt-2">Compare branches and get AI-powered insights</p>
            </div>

            {/* Folder Browser or Manual Input */}
            {showBrowser ? (
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700">📁 Browse Folders</label>
                        <button
                            onClick={() => setShowBrowser(false)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Enter path manually
                        </button>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Current Directory:</div>
                        <div className="font-mono text-sm text-gray-800">{currentPath || "Loading..."}</div>
                    </div>

                    <div className="flex gap-2">
                        {parentPath && (
                            <button
                                onClick={() => handleNavigateToDirectory(parentPath)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                                disabled={browserLoading}
                            >
                                ⬆️ Up
                            </button>
                        )}
                        <button
                            onClick={() => loadDirectories(currentPath)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                            disabled={browserLoading}
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    {browserLoading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2">Loading directories...</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto bg-white">
                            {directories.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No directories found</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {directories.map((dir, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 hover:bg-blue-50 transition"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-2xl">{dir.is_git_repo ? "📦" : "📁"}</span>
                                                <button
                                                    onClick={() => handleNavigateToDirectory(dir.path)}
                                                    className="text-left text-sm font-mono text-gray-700 hover:text-blue-600 truncate flex-1"
                                                >
                                                    {dir.name}
                                                </button>
                                                {dir.is_git_repo && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                        Git Repo
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleSelectDirectory(dir.path)}
                                                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition font-medium whitespace-nowrap"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700">📝 Enter Repository Path</label>
                        <button
                            type="button"
                            onClick={() => setShowBrowser(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Browse folders
                        </button>
                    </div>
                    <input
                        type="text"
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                        placeholder="e.g. /home/user/projects/my-repo"
                        value={inputPath}
                        onChange={e => setInputPath(e.target.value)}
                        autoFocus
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        disabled={loading}
                    >
                        {loading ? 'Checking...' : 'Select Repository'}
                    </button>
                </form>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Branch Selection */}
            {selectedProject && projectName && branches.length > 0 && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="mb-4">
                        <div className="text-sm text-gray-600">Selected Repository:</div>
                        <div className="text-lg font-bold text-gray-800">{projectName}</div>
                        <div className="text-xs font-mono text-gray-500 mt-1">{selectedProject}</div>
                    </div>

                    <form onSubmit={handleCompare} className="flex flex-col gap-4">
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">Base Branch</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={baseBranch}
                                onChange={e => setBaseBranch(e.target.value)}
                                required
                            >
                                <option value="">-- Select base branch --</option>
                                {branches.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-2">Compare Branch</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={compareBranch}
                                onChange={e => setCompareBranch(e.target.value)}
                                required
                            >
                                <option value="">-- Select compare branch --</option>
                                {branches.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div className="border-t border-blue-200 pt-4">
                            <label className="block font-medium text-gray-700 mb-2">
                                📋 Custom Review Rules <span className="text-xs text-gray-500">(Optional)</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-2">
                                Add your own code review rules. AI will check the code against these rules and highlight violations.
                            </p>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                placeholder="Example rules (one per line):&#10;- Don't hardcode API keys or secrets&#10;- Avoid database calls inside loops&#10;- Use async/await instead of callbacks&#10;- Add error handling for all API calls&#10;- Follow consistent naming conventions"
                                value={reviewRules}
                                onChange={e => setReviewRules(e.target.value)}
                                rows={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 The AI will specifically check for these rules and highlight violations in the results
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 font-medium text-lg shadow-lg"
                            disabled={!baseBranch || !compareBranch || baseBranch === compareBranch || compareLoading}
                        >
                            {compareLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Comparing...
                                </span>
                            ) : (
                                '🔍 Compare Branches'
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );

    // Results View
    const renderResultsView = () => (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Comparison Results</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {projectName} • <span className="font-mono">{baseBranch}</span> → <span className="font-mono">{compareBranch}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleNewComparison}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            ← New Comparison
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Files changed:</span>
                            <span className="font-bold text-blue-600">{files.length}</span>
                        </div>
                        {files.some(f => f.suggestions.some((s: string) => s.includes('RULE VIOLATION'))) && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Rule violations:</span>
                                <span className="font-bold text-red-600 animate-pulse">
                                    {files.filter(f => f.suggestions.some((s: string) => s.includes('RULE VIOLATION'))).length}
                                </span>
                            </div>
                        )}
                        {reviewRules && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    ✓ Custom rules applied
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* No changes */}
                {files.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-gray-800">No Differences Found</h2>
                        <p className="text-gray-600 mt-2">The branches are identical</p>
                    </div>
                )}

                {/* Results Grid */}
                {files.length > 0 && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* File List */}
                        <div className="col-span-4">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
                                    <h3 className="font-bold">Changed Files</h3>
                                </div>
                                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {files.map((file, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedFile(idx)}
                                            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition relative ${selectedFile === idx ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                                                }`}
                                        >
                                            {/* Rule violation indicator */}
                                            {file.suggestions.some((s: string) => s.includes('RULE VIOLATION')) && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                        ⚠️
                                                    </span>
                                                </div>
                                            )}
                                            <div className="font-mono text-sm text-gray-800 truncate pr-8">{file.file}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {file.suggestions.some((s: string) => s.includes('RULE VIOLATION')) ? (
                                                    <span className="text-red-600 font-bold">Rule violations detected!</span>
                                                ) : file.suggestions.length > 0 ? (
                                                    `${file.suggestions.length} suggestions`
                                                ) : (
                                                    'No issues'
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* File Details */}
                        <div className="col-span-8">
                            {selectedFile === null ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <div className="text-4xl mb-4">👈</div>
                                    <p className="text-gray-600">Select a file to view details</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* File Header */}
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-xl font-bold text-gray-800 font-mono break-all">
                                            {files[selectedFile].file}
                                        </h2>
                                    </div>

                                    {/* AI Summary */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
                                        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                            <span className="text-xl">🤖</span> AI Summary
                                        </h3>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                            {files[selectedFile].summary}
                                        </p>
                                    </div>

                                    {/* Suggestions and Rule Violations */}
                                    {files[selectedFile].suggestions.length > 0 && (
                                        <div>
                                            {/* Rule Violations - Highlighted */}
                                            {files[selectedFile].suggestions.some((s: string) => s.includes('⚠️ RULE VIOLATION') || s.includes('RULE VIOLATION')) && (
                                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-red-400 mb-4">
                                                    <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                                        <span className="text-xl animate-pulse">⚠️</span> Rule Violations Detected!
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        {files[selectedFile].suggestions
                                                            .filter((s: string) => s.includes('⚠️ RULE VIOLATION') || s.includes('RULE VIOLATION'))
                                                            .map((s: string, i: number) => (
                                                                <li key={i} className="flex gap-2 bg-red-100 p-3 rounded-lg border border-red-300">
                                                                    <span className="text-red-600 font-bold text-lg">⚠️</span>
                                                                    <span className="text-red-900 font-medium">{s.replace('⚠️ RULE VIOLATION:', '').replace('RULE VIOLATION:', '').trim()}</span>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Regular Suggestions */}
                                            {files[selectedFile].suggestions.some((s: string) => !s.includes('RULE VIOLATION')) && (
                                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border border-yellow-200">
                                                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                                                        <span className="text-xl">💡</span> Suggestions
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {files[selectedFile].suggestions
                                                            .filter((s: string) => !s.includes('RULE VIOLATION'))
                                                            .map((s: string, i: number) => (
                                                                <li key={i} className="flex gap-2">
                                                                    <span className="text-orange-600 font-bold">•</span>
                                                                    <span className="text-gray-800">{s}</span>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Code Comparison with Highlighted Changes */}
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-800">Code Changes</h3>
                                            <div className="flex gap-4 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-red-200 rounded"></span>
                                                    <span className="text-gray-600">Removed</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-green-200 rounded"></span>
                                                    <span className="text-gray-600">Added</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
                                            <ReactDiffViewer
                                                oldValue={files[selectedFile].old_content || '(empty file)'}
                                                newValue={files[selectedFile].new_content || '(empty file)'}
                                                splitView={true}
                                                leftTitle={`Before (${baseBranch})`}
                                                rightTitle={`After (${compareBranch})`}
                                                useDarkTheme={false}
                                                styles={{
                                                    variables: {
                                                        light: {
                                                            diffViewerBackground: '#fff',
                                                            diffViewerColor: '#212529',
                                                            addedBackground: '#e6ffed',
                                                            addedColor: '#24292e',
                                                            removedBackground: '#ffeef0',
                                                            removedColor: '#24292e',
                                                            wordAddedBackground: '#acf2bd',
                                                            wordRemovedBackground: '#fdb8c0',
                                                            addedGutterBackground: '#cdffd8',
                                                            removedGutterBackground: '#ffdce0',
                                                            gutterBackground: '#f7f7f7',
                                                            gutterBackgroundDark: '#f3f1f1',
                                                            highlightBackground: '#fffbdd',
                                                            highlightGutterBackground: '#fff5b1',
                                                        },
                                                    },
                                                    line: {
                                                        padding: '8px 2px',
                                                        fontSize: '13px',
                                                        fontFamily: 'Monaco, Consolas, monospace',
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return viewState === 'setup' ? renderSetupView() : renderResultsView();
};
