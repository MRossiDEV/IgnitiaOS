"use client";

import { Activity, CheckCircle2, Clock3, Sigma } from "lucide-react";

type AgentStatsProps = {
	totalRuns?: number;
	successRuns?: number;
	avgDurationMs?: number;
	totalTokens?: number;
};

export function AgentStats({ totalRuns = 0, successRuns = 0, avgDurationMs = 0, totalTokens = 0 }: AgentStatsProps) {
	const successRate = totalRuns > 0 ? `${Math.round((successRuns / totalRuns) * 100)}%` : "0%";
	const avg = avgDurationMs > 0 ? `${Math.max(1, Math.round(avgDurationMs / 1000))}s` : "n/a";

	const stats = [
		{ label: "Runs", value: String(totalRuns), icon: CheckCircle2 },
		{ label: "Success", value: successRate, icon: Activity },
		{ label: "Avg", value: avg, icon: Clock3 },
		{ label: "Tokens", value: String(totalTokens), icon: Sigma },
	];

	return (
		<div className="grid grid-cols-2 gap-2">
			{stats.map((item) => {
				const Icon = item.icon;
				return (
			<div key={item.label} className="rounded-lg border border-white/10 bg-black/30 p-2">
					<div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
						<Icon size={13} className="text-cyan-400" />
							<span>{item.label}</span>
						</div>
						<p className="mt-0.5 text-sm font-semibold">{item.value}</p>
					</div>
				);
			})}
		</div>
	);
}

export default AgentStats;
