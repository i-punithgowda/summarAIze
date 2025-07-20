import React from "react";

type Props = { diff: string };
export const DiffViewer: React.FC<Props> = ({ diff }: Props) => (
    <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-x-auto">{diff}</pre>
); 