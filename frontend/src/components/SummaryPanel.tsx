import React from "react";

type Props = { summary: string; suggestions: string[] };
export const SummaryPanel: React.FC<Props> = ({ summary, suggestions }) => (
    <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Summary</h2>
        <p>{summary}</p>
        <h3 className="text-lg font-semibold mt-4">Suggestions</h3>
        <ul className="list-disc ml-6">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
    </div>
); 