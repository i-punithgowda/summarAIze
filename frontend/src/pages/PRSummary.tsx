import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DiffViewer } from "../components/DiffViewer";
import { SummaryPanel } from "../components/SummaryPanel";

export const PRSummary: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) return <div>No summary data. <button onClick={() => navigate("/")}>Go Home</button></div>;

    return (
        <div className="p-8">
            <SummaryPanel summary={state.summary} suggestions={state.suggestions} />
            <h2 className="text-xl font-bold mt-8 mb-2">Diff</h2>
            <DiffViewer diff={state.diff || "Diff not available"} />
        </div>
    );
}; 