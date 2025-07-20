import React, { useState, useRef } from "react";

// Helper to check for .git folder using Electron/Node
async function selectProjectFolder(): Promise<string | null> {
    // Electron context: use window.electron or window.api
    if ((window as any).electron?.showOpenDialog) {
        const result = await (window as any).electron.showOpenDialog({
            properties: ["openDirectory"]
        });
        if (result.canceled || !result.filePaths?.[0]) return null;
        return result.filePaths[0];
    }
    // Fallback: use input[type=file] for web mock
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.onchange = () => {
            if (input.files && input.files.length > 0) {
                // Get the root folder path from the first file
                const path = (input.files[0] as any).webkitRelativePath?.split("/")[0];
                resolve(path || null);
            } else {
                resolve(null);
            }
        };
        input.click();
    });
}

// Helper to check for .git folder (Electron/Node or mock)
async function hasGitFolder(dir: string): Promise<boolean> {
    if ((window as any).electron?.fsExistsSync) {
        return (window as any).electron.fsExistsSync(`${dir}/.git`);
    }
    // Fallback: always true for web mock
    return true;
}

export const GitAssistant: React.FC = () => {
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [showPath, setShowPath] = useState<string>("");
    const folderPickerRef = useRef<HTMLButtonElement>(null);

    // Handler for nav click or button click
    const handleSelectProject = async () => {
        const folder = await selectProjectFolder();
        if (!folder) return;
        const valid = await hasGitFolder(folder);
        if (!valid) {
            alert("Selected folder is not a valid Git repository. Please choose a different folder.");
            setSelectedProject("");
            setShowPath("");
            return;
        }
        setSelectedProject(folder);
        setShowPath(folder);
        console.log("Selected Git project path:", folder);
    };

    // If no project selected, open dialog on mount
    React.useEffect(() => {
        if (!selectedProject && folderPickerRef.current) {
            folderPickerRef.current.click();
        }
    }, [selectedProject]);

    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow flex flex-col gap-6">
            <h1 className="text-2xl font-bold mb-4">Git Assistant</h1>
            <button
                ref={folderPickerRef}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSelectProject}
                style={{ display: selectedProject ? "none" : "block" }}
            >
                Select Project Folder
            </button>
            {showPath && (
                <div className="bg-gray-100 text-gray-800 p-2 rounded text-sm">
                    Selected project: <span className="font-mono">{showPath}</span>
                </div>
            )}
            {/* The rest of the UI (branch selection, etc.) can be shown after project is selected */}
            {selectedProject && (
                <div className="mt-4 text-green-700">Ready to continue with Git features...</div>
            )}
        </div>
    );
}; 