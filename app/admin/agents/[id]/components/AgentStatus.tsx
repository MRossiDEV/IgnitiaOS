"use client";

import { Activity } from "lucide-react";

type AgentStatusProps = {
	isOnline?: boolean;
	statusText?: string;
};

export function AgentStatus({ isOnline = true, statusText }: AgentStatusProps) {
	return (
		<div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
			<p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Agent Status</p>
			<div className={`mt-1 flex items-center gap-2 ${isOnline ? "text-green-400" : "text-amber-300"}`}>
				<Activity size={12} />
				<span className="text-xs">{statusText || (isOnline ? "Online" : "Idle")}</span>
			</div>
		</div>
	);
}

export default AgentStatus;
