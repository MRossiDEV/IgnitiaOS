"use client";

import ChatPanel from "./ChatPanel";
import { Gallery } from "./Gallery";
import { KnowledgePanel } from "./KnowledgePanel";
import { MissionTimeline } from "./MissionTimeline";
import { SkillsRadar } from "./SkillsRadar";
import AgentSettingsPanel from "./AgentSettingsPanel";
import type { AgentWorkspaceView } from "./LeftDock";

type WorkspaceProps = {
  activeView: AgentWorkspaceView;
  agent?: {
    name?: string | null;
    category?: string | null;
    status?: string | null;
    personality_preset?: string | null;
  } | null;
};

function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-2 text-xs text-zinc-400">{description}</p>
    </article>
  );
}

export function Workspace({ activeView, agent }: WorkspaceProps) {
	if (activeView === "settings") {
		return (
			<AgentSettingsPanel
				agentName={agent?.name}
				category={agent?.category}
				status={agent?.status}
				personalityPreset={agent?.personality_preset}
			/>
		);
	}

	if (activeView === "chat") {
		return <ChatPanel />;
	}

	if (activeView === "gallery") {
		return <Gallery />;
	}

	if (activeView === "knowledge") {
		return <KnowledgePanel />;
	}

	if (activeView === "missions") {
		return <MissionTimeline />;
	}

	if (activeView === "reports") {
		return (
			<PlaceholderPanel
				title="Reports"
				description="Report modules for this agent are shown here."
			/>
		);
	}

	if (activeView === "files") {
		return (
			<PlaceholderPanel
				title="Files"
				description="Attached files and generated artifacts will appear here."
			/>
		);
	}

	if (activeView === "workspace") {
		return (
			<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
				<SkillsRadar />
				<KnowledgePanel />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
			<SkillsRadar />
			<KnowledgePanel />
			<MissionTimeline />
		</div>
	);
}

export default Workspace;
