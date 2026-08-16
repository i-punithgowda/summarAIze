import React, { useState, useEffect } from "react";
import api from "../api/axios";
import ReactDiffViewer from "react-diff-viewer-continued";
import {
    IconAlert,
    IconArrowLeft,
    IconBranch,
    IconCheck,
    IconFile,
    IconFolder,
    IconGit,
    IconRefresh,
    IconRules,
    IconSpark,
    IconUp,
    Spinner,
} from "../components/Icons";

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

const isViolation = (s: string) => s.includes("RULE VIOLATION");
const fileHasViolation = (file: FileChange) => file.suggestions.some(isViolation);
const fileName = (path: string) => path.split("/").pop() || path;
const fileDir = (path: string) => path.split("/").slice(0, -1).join("/");

const shortenPath = (path: string, max = 64) => {
    if (!path || path.length <= max) return path;
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 3) return `${path.slice(0, 18)}…${path.slice(-max + 20)}`;
    return `/${parts[0]}/…/${parts.slice(-2).join("/")}`;
};

const stripViolation = (s: string) =>
    s.replace("⚠️ RULE VIOLATION:", "").replace("RULE VIOLATION:", "").trim();

export const GitAssistant: React.FC = () => {
    const [viewState, setViewState] = useState<"setup" | "results">("setup");
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

    useEffect(() => {
        loadDirectories("");
    }, []);

    const loadDirectories = async (path: string) => {
        setBrowserLoading(true);
        setError("");
        try {
            const res = await api.post("/list-directories", { path: path || "" });
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
            const res = await api.post("/check-repo", { path: path });
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
            const res = await api.post("/check-repo", { path: inputPath.trim() });
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
            const res = await api.post("/compare-branches", {
                path: selectedProject,
                base_branch: baseBranch,
                compare_branch: compareBranch,
                review_rules: reviewRules.trim() || undefined,
            });
            const nextFiles = res.data.files || [];
            setFiles(nextFiles);
            setViewState("results");
            setSelectedFile(nextFiles.length > 0 ? 0 : null);
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
        setViewState("setup");
        setFiles([]);
        setSelectedFile(null);
        setError("");
    };

    const violationCount = files.filter(fileHasViolation).length;

    const renderSetupView = () => (
        <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Compare branches</h1>
                <p className="mt-1 text-stone-500">
                    Pick a local repository, choose two branches, and get an AI review of the diff.
                </p>
            </div>

            <div className={`grid items-start gap-6 ${selectedProject ? "lg:grid-cols-2" : ""}`}>
                <section className="card">
                    <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold text-stone-900">
                                {showBrowser ? "Browse folders" : "Repository path"}
                            </h2>
                            <p className="text-xs text-stone-500">
                                {showBrowser ? "Open a git repo from disk" : "Paste an absolute path"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowBrowser(!showBrowser)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            {showBrowser ? "Enter path" : "Browse folders"}
                        </button>
                    </div>

                    <div className="p-5">
                        {showBrowser ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                                    <IconFolder className="h-4 w-4 shrink-0 text-stone-400" />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-mono text-xs text-stone-700" title={currentPath}>
                                            {currentPath || "Loading…"}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-1.5">
                                        {parentPath && (
                                            <button
                                                onClick={() => handleNavigateToDirectory(parentPath)}
                                                className="btn-secondary !px-2.5 !py-1.5"
                                                disabled={browserLoading}
                                                title="Up one level"
                                            >
                                                <IconUp />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => loadDirectories(currentPath)}
                                            className="btn-secondary !px-2.5 !py-1.5"
                                            disabled={browserLoading}
                                            title="Refresh"
                                        >
                                            <IconRefresh />
                                        </button>
                                    </div>
                                </div>

                                {browserLoading ? (
                                    <div className="space-y-2 py-2">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-12 animate-pulse rounded-xl bg-stone-100" />
                                        ))}
                                    </div>
                                ) : directories.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-stone-200 py-12 text-center text-sm text-stone-500">
                                        No directories found here
                                    </div>
                                ) : (
                                    <div className="max-h-[26rem] overflow-y-auto rounded-xl border border-stone-200">
                                        {directories.map((dir, idx) => (
                                            <div
                                                key={idx}
                                                className="group flex items-center gap-3 border-b border-stone-100 px-3 py-2.5 last:border-b-0 hover:bg-stone-50"
                                            >
                                                <span
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                        dir.is_git_repo
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-stone-100 text-stone-500"
                                                    }`}
                                                >
                                                    {dir.is_git_repo ? <IconGit className="h-4 w-4" /> : <IconFolder className="h-4 w-4" />}
                                                </span>
                                                <button
                                                    onClick={() => handleNavigateToDirectory(dir.path)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <div className="truncate text-sm font-medium text-stone-800">{dir.name}</div>
                                                    {dir.is_git_repo && (
                                                        <span className="chip mt-0.5 bg-emerald-50 text-emerald-700">Git repo</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleSelectDirectory(dir.path)}
                                                    className="btn-primary !px-3 !py-1.5 text-xs"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    className="field font-mono"
                                    placeholder="e.g. /home/user/projects/my-repo"
                                    value={inputPath}
                                    onChange={(e) => setInputPath(e.target.value)}
                                    autoFocus
                                    disabled={loading}
                                />
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner /> Checking repository
                                        </span>
                                    ) : (
                                        "Select repository"
                                    )}
                                </button>
                            </form>
                        )}

                        {loading && showBrowser && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                                <Spinner className="h-4 w-4 text-indigo-600" />
                                Opening repository…
                            </div>
                        )}

                        {error && (
                            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                                <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </section>

                {selectedProject && projectName && branches.length > 0 && (
                    <section className="card">
                        <div className="border-b border-stone-100 px-5 py-4">
                            <p className="text-xs font-medium text-stone-500">Selected repository</p>
                            <h2 className="mt-0.5 text-lg font-semibold text-stone-900">{projectName}</h2>
                            <p className="mt-1 truncate font-mono text-xs text-stone-500" title={selectedProject}>
                                {shortenPath(selectedProject)}
                            </p>
                        </div>

                        <form onSubmit={handleCompare} className="flex flex-col gap-4 p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                                        <IconBranch className="h-4 w-4 text-stone-400" /> Base branch
                                    </span>
                                    <select
                                        className="field"
                                        value={baseBranch}
                                        onChange={(e) => setBaseBranch(e.target.value)}
                                        required
                                    >
                                        <option value="">Select base branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                                        <IconBranch className="h-4 w-4 text-stone-400" /> Compare branch
                                    </span>
                                    <select
                                        className="field"
                                        value={compareBranch}
                                        onChange={(e) => setCompareBranch(e.target.value)}
                                        required
                                    >
                                        <option value="">Select compare branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {baseBranch && compareBranch && baseBranch === compareBranch && (
                                <p className="text-sm text-rose-600">Pick two different branches to compare.</p>
                            )}

                            <label className="block">
                                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                                    <IconRules className="h-4 w-4 text-stone-400" />
                                    Custom review rules
                                    <span className="font-normal text-stone-400">(optional)</span>
                                </span>
                                <textarea
                                    className="field min-h-[8rem] resize-y font-mono text-[13px] leading-relaxed"
                                    placeholder={"One rule per line, for example:\n- Don't hardcode API keys\n- Avoid database calls inside loops\n- Add error handling for API calls"}
                                    value={reviewRules}
                                    onChange={(e) => setReviewRules(e.target.value)}
                                    rows={6}
                                />
                            </label>

                            <button
                                type="submit"
                                className="btn-primary py-3"
                                disabled={!baseBranch || !compareBranch || baseBranch === compareBranch || compareLoading}
                            >
                                {compareLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner /> Comparing…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <IconSpark className="h-4 w-4" /> Compare branches
                                    </span>
                                )}
                            </button>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );

    const current = selectedFile !== null ? files[selectedFile] : null;
    const currentViolations = current?.suggestions.filter(isViolation) ?? [];
    const currentSuggestions = current?.suggestions.filter((s) => !isViolation(s)) ?? [];

    const renderResultsView = () => (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="card mb-6">
                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-stone-900">{projectName}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="chip bg-stone-100 font-mono text-stone-700">{baseBranch}</span>
                            <span className="text-stone-400">→</span>
                            <span className="chip bg-indigo-50 font-mono text-indigo-700">{compareBranch}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="chip bg-stone-100 text-stone-700">
                            {files.length} file{files.length === 1 ? "" : "s"}
                        </span>
                        {violationCount > 0 && (
                            <span className="chip bg-rose-50 text-rose-700">
                                {violationCount} violation{violationCount === 1 ? "" : "s"}
                            </span>
                        )}
                        {reviewRules && <span className="chip bg-indigo-50 text-indigo-700">Custom rules</span>}
                        <button onClick={handleNewComparison} className="btn-secondary">
                            <IconArrowLeft /> New comparison
                        </button>
                    </div>
                </div>
            </div>

            {files.length === 0 && (
                <div className="card px-8 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <IconCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-900">No differences found</h2>
                    <p className="mt-1 text-sm text-stone-500">These branches are identical.</p>
                </div>
            )}

            {files.length > 0 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-4">
                        <div className="card sticky top-20 overflow-hidden">
                            <div className="border-b border-stone-100 px-4 py-3">
                                <h3 className="text-sm font-semibold text-stone-900">Changed files</h3>
                            </div>
                            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                                {files.map((file, idx) => {
                                    const active = selectedFile === idx;
                                    const bad = fileHasViolation(file);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedFile(idx)}
                                            className={`relative w-full border-b border-stone-100 px-4 py-3 text-left last:border-b-0 ${
                                                active ? "bg-indigo-50" : "hover:bg-stone-50"
                                            }`}
                                        >
                                            {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-indigo-600" />}
                                            <div className="flex items-start gap-2.5">
                                                <span className={`mt-0.5 ${bad ? "text-rose-500" : "text-stone-400"}`}>
                                                    <IconFile />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-stone-900">
                                                        {fileName(file.file)}
                                                    </span>
                                                    <span className="mt-0.5 block truncate font-mono text-[11px] text-stone-400">
                                                        {fileDir(file.file) || "·"}
                                                    </span>
                                                    <span className={`mt-1 block text-xs ${bad ? "font-medium text-rose-600" : "text-stone-500"}`}>
                                                        {bad
                                                            ? "Rule violations"
                                                            : file.suggestions.length > 0
                                                            ? `${file.suggestions.length} suggestion${file.suggestions.length === 1 ? "" : "s"}`
                                                            : "No issues"}
                                                    </span>
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="lg:col-span-8">
                        {!current ? (
                            <div className="card px-8 py-20 text-center text-sm text-stone-500">
                                Select a file to view the review
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="card px-5 py-4">
                                    <p className="font-mono text-xs text-stone-400">{fileDir(current.file) || "repository root"}</p>
                                    <h2 className="mt-0.5 break-all text-lg font-semibold text-stone-900">
                                        {fileName(current.file)}
                                    </h2>
                                </div>

                                <div className="card overflow-hidden">
                                    <div className="flex items-center gap-2 border-b border-stone-100 bg-indigo-50/60 px-5 py-3 text-indigo-700">
                                        <IconSpark className="h-4 w-4" />
                                        <h3 className="text-sm font-semibold">AI summary</h3>
                                    </div>
                                    <p className="whitespace-pre-line px-5 py-4 text-sm leading-relaxed text-stone-800">
                                        {current.summary}
                                    </p>
                                </div>

                                {currentViolations.length > 0 && (
                                    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
                                        <div className="flex items-center gap-2 border-b border-rose-200 px-5 py-3 text-rose-800">
                                            <IconAlert className="h-4 w-4" />
                                            <h3 className="text-sm font-semibold">Rule violations</h3>
                                        </div>
                                        <ul className="space-y-2 p-4">
                                            {currentViolations.map((s, i) => (
                                                <li key={i} className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm leading-relaxed text-rose-900">
                                                    {stripViolation(s)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {currentSuggestions.length > 0 && (
                                    <div className="card overflow-hidden">
                                        <div className="border-b border-stone-100 bg-amber-50/70 px-5 py-3">
                                            <h3 className="text-sm font-semibold text-amber-900">Suggestions</h3>
                                        </div>
                                        <ul className="space-y-2 p-4">
                                            {currentSuggestions.map((s, i) => (
                                                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-800">
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="card overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
                                        <h3 className="text-sm font-semibold text-stone-900">Code changes</h3>
                                        <div className="flex gap-4 text-xs text-stone-500">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-2.5 w-2.5 rounded-sm bg-red-200" /> Removed
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-200" /> Added
                                            </span>
                                        </div>
                                    </div>
                                    <div className="diff-scroll overflow-x-auto" style={{ maxHeight: "640px" }}>
                                        <ReactDiffViewer
                                            oldValue={current.old_content || "(empty file)"}
                                            newValue={current.new_content || "(empty file)"}
                                            splitView={true}
                                            leftTitle={`Before (${baseBranch})`}
                                            rightTitle={`After (${compareBranch})`}
                                            useDarkTheme={false}
                                            styles={{
                                                variables: {
                                                    light: {
                                                        diffViewerBackground: "#fff",
                                                        diffViewerColor: "#1c1917",
                                                        addedBackground: "#ecfdf5",
                                                        addedColor: "#14532d",
                                                        removedBackground: "#fef2f2",
                                                        removedColor: "#7f1d1d",
                                                        wordAddedBackground: "#a7f3d0",
                                                        wordRemovedBackground: "#fecaca",
                                                        addedGutterBackground: "#d1fae5",
                                                        removedGutterBackground: "#fee2e2",
                                                        gutterBackground: "#fafaf9",
                                                        gutterBackgroundDark: "#f5f5f4",
                                                        highlightBackground: "#fffbeb",
                                                        highlightGutterBackground: "#fef3c7",
                                                    },
                                                },
                                                line: {
                                                    padding: "6px 2px",
                                                    fontSize: "12.5px",
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
    );

    return viewState === "setup" ? renderSetupView() : renderResultsView();
};
