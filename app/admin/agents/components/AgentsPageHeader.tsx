import Link from "next/link";
import { Brain, Layers, Search, Settings, Sparkles, TrendingUp } from "lucide-react";

import { TabButton } from "./AgentsPageUI";
import type { AgentsTab } from "./agent-types";

export function AgentsPageHeader({
  loadError,
  onRetry,
  search,
  onSearchChange,
  tab,
  onTabChange,
}: {
  loadError: string | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  tab: AgentsTab;
  onTabChange: (value: AgentsTab) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents Control Center</h1>

          <p className="text-zinc-500 text-sm">
            Manage AI agents, prompts, models and autonomous execution.
          </p>
        </div>

        <Link
          href="/admin/agents/new"
          className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold hover:bg-cyan-400 transition"
        >
          <Sparkles size={16} />
          New Agent
        </Link>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{loadError}</span>

          <button
            onClick={onRetry}
            className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-medium hover:bg-red-500/10 transition"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full max-w-md">
        <Search size={16} className="text-zinc-400" />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search agents..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      <div className="flex gap-2 flex-wrap rounded-xl border border-white/10 bg-white/5 p-2">
        <TabButton
          active={tab === "overview"}
          onClick={() => onTabChange("overview")}
          label="Overview"
          icon={<Brain size={14} />}
        />

        <TabButton
          active={tab === "performance"}
          onClick={() => onTabChange("performance")}
          label="Performance"
          icon={<TrendingUp size={14} />}
        />

        <TabButton
          active={tab === "configuration"}
          onClick={() => onTabChange("configuration")}
          label="Configuration"
          icon={<Settings size={14} />}
        />

        <TabButton
          active={tab === "logs"}
          onClick={() => onTabChange("logs")}
          label="Logs"
          icon={<Layers size={14} />}
        />
      </div>
    </>
  );
}