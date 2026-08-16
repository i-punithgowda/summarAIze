import React from "react";

type Props = { diff: string };
export const DiffViewer: React.FC<Props> = ({ diff }: Props) => (
    <pre className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-950 p-5 font-mono text-[13px] leading-relaxed text-emerald-200">
        {diff}
    </pre>
);
