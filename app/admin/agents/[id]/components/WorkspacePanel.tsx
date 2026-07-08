"use client";

import { FloatingHUD } from "./FloatingHUD";
import { Workspace } from "./Workspace";
import type { AgentWorkspaceView } from "./LeftDock";

type WorkspacePanelProps = {
  activeView: AgentWorkspaceView;
  agent?: {
    name?: string | null;
    category?: string | null;
    status?: string | null;
    personality_preset?: string | null;
  } | null;
};

const VIEW_META: Record<
  AgentWorkspaceView,
  {
    title: string;
    subtitle: string;
  }
> = {
  overview: {
    title: "Overview",
    subtitle: "Agent dashboard",
  },
  chat: {
    title: "Chat",
    subtitle: "Live conversation",
  },
  workspace: {
    title: "Workspace",
    subtitle: "Operational modules",
  },
  gallery: {
    title: "Gallery",
    subtitle: "Generated visuals",
  },
  reports: {
    title: "Reports",
    subtitle: "Documents and outcomes",
  },
  knowledge: {
    title: "Knowledge",
    subtitle: "Context and memory",
  },
  missions: {
    title: "Missions",
    subtitle: "Execution timeline",
  },
  files: {
    title: "Files",
    subtitle: "Artifacts and uploads",
  },
  settings: {
    title: "Settings",
    subtitle: "Agent configuration and tools",
  },
};

export function WorkspacePanel({ activeView, agent }: WorkspacePanelProps) {
  const meta = VIEW_META[activeView];

  return (
    <section className="relative m-2 mt-2 flex-1 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2.5 backdrop-blur-xl">
      <FloatingHUD />
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{meta.title}</h3>
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{meta.subtitle}</p>
      </div>

      <Workspace activeView={activeView} agent={agent} />
    </section>
  );
}

export default WorkspacePanel;
