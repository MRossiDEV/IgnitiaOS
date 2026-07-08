"use client";

const steps = ["Collect inputs", "Run audits", "Compare competitors", "Build proposal"];

export function MissionTimeline() {
	return (
		<article className="rounded-lg border border-white/10 bg-black/30 p-2.5">
			<h4 className="text-xs font-semibold">Mission Timeline</h4>
			<ul className="mt-1.5 space-y-1 text-xs text-zinc-400">
				{steps.map((step, i) => (
					<li key={step} className="flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-[#5BC0FF]" />
						<span>{i + 1}. {step}</span>
					</li>
				))}
			</ul>
		</article>
	);
}

export default MissionTimeline;
