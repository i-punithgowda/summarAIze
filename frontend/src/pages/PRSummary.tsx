import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DiffViewer } from "../components/DiffViewer";
import { SummaryPanel } from "../components/SummaryPanel";
import { IconArrowLeft } from "../components/Icons";

export const PRSummary: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        return (
            <div className="mx-auto max-w-md px-6 py-24 text-center">
                <h1 className="text-xl font-semibold text-stone-900">No summary yet</h1>
                <p className="mt-2 text-sm text-stone-500">Upload a diff first, then come back to this page.</p>
                <button onClick={() => navigate("/")} className="btn-primary mt-6">
                    <IconArrowLeft /> Go home
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
            <SummaryPanel summary={state.summary} suggestions={state.suggestions} />
            <div>
                <h2 className="mb-3 text-lg font-semibold text-stone-900">Diff</h2>
                <DiffViewer diff={state.diff || "Diff not available"} />
            </div>
        </div>
    );
};
