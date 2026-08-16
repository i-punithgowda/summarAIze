import React from "react";
import { IconSpark } from "./Icons";

type Props = { summary: string; suggestions: string[] };
export const SummaryPanel: React.FC<Props> = ({ summary, suggestions }) => (
    <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-stone-100 bg-indigo-50/70 px-5 py-3 text-indigo-700">
            <IconSpark className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Summary</h2>
        </div>
        <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-stone-800">{summary}</p>
            {suggestions?.length > 0 && (
                <>
                    <h3 className="mt-5 text-sm font-semibold text-stone-900">Suggestions</h3>
                    <ul className="mt-2 space-y-2">
                        {suggestions.map((s, i) => (
                            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-700">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    </div>
);
