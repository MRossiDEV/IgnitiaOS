"use client";

export function KnowledgePanel() {
	return (
		<article className="rounded-lg border border-white/10 bg-black/30 p-2.5">
			<h4 className="text-xs font-semibold">Knowledge</h4>
			<p className="mt-1 text-xs text-zinc-400">12 docs indexed, 3 updated today.</p>
		</article>
	);
}

export default KnowledgePanel;
