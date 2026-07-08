"use client";

export function SkillsRadar() {
	return (
		<article className="rounded-lg border border-white/10 bg-black/30 p-2.5">
			<h4 className="text-xs font-semibold">Skills Radar</h4>
			<div className="mt-2 grid grid-cols-5 gap-1">
				{[72, 90, 64, 81, 77].map((v, i) => (
					<div key={i} className="rounded bg-black/30 p-1 text-center text-[10px] text-zinc-400">
						{v}
					</div>
				))}
			</div>
		</article>
	);
}

export default SkillsRadar;
