"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Cpu, HardDrive, X, Zap } from "lucide-react";
import { ActionDock } from "./ActionDock";
import { AgentStats } from "./AgentStats";
import { AgentStatus } from "./AgentStatus";
import { Gallery } from "./Gallery";

type FetchedAgent = {
  name?: string | null;
  description?: string | null;
  avatar?: string | null;
};

type FetchedTool = {
  category?: string | null;
  enabled?: boolean;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function safeFetchJson(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return await response.json().catch(() => null);
  } catch {
    return null;
  }
}

type RightDockProps = {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string | null;
  avatarSrc?: string | null;
  description?: string | null;
  totalRuns?: number;
  successRuns?: number;
  avgDurationMs?: number;
  totalTokens?: number;
  isOnline?: boolean;
  latestRunStatus?: string;
  latestRunDurationMs?: number;
  loading?: boolean;
};

export function RightDock({
  isOpen,
  onClose,
  agentName,
  avatarSrc,
  description,
  totalRuns,
  successRuns,
  avgDurationMs,
  totalTokens,
  isOnline = true,
  latestRunStatus,
  latestRunDurationMs,
  loading = false,
}: RightDockProps) {
  const params = useParams<{ id: string }>();
  const [fetchedAgent, setFetchedAgent] = useState<FetchedAgent | null>(null);
  const [fetchedCapabilities, setFetchedCapabilities] = useState<string[]>([]);

  useEffect(() => {
    const id = params?.id;
    if (!id || !UUID_REGEX.test(id)) {
      setFetchedAgent(null);
      setFetchedCapabilities([]);
      return;
    }

    let cancelled = false;

    async function loadAgent() {
      const [agentJson, toolsJson] = await Promise.all([
        safeFetchJson(`/api/v1/agents/${id}`),
        safeFetchJson(`/api/v1/agents/${id}/tools`),
      ]);

      if (cancelled) {
        return;
      }

      if (agentJson?.success) {
        setFetchedAgent(agentJson.agent ?? null);
      } else {
        setFetchedAgent(null);
      }

      if (toolsJson?.success) {
        const tools = Array.isArray(toolsJson.tools)
          ? (toolsJson.tools as FetchedTool[])
          : [];

        const categories = Array.from(
          new Set(
            tools
              .filter((tool) => Boolean(tool.enabled))
              .map((tool) => tool.category)
              .filter(
                (category): category is string =>
                  typeof category === "string" && category.trim().length > 0
              )
          )
        );

        setFetchedCapabilities(categories);
      } else {
        setFetchedCapabilities([]);
      }
    }

    loadAgent();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const resolvedName = agentName || fetchedAgent?.name || "Agent";
  const resolvedAvatar = avatarSrc || fetchedAgent?.avatar || "/images/agents/ceo-ai.png";
  const resolvedDescription = description || fetchedAgent?.description || "Professional AI Consultant";

  const missionState = loading
    ? "Loading"
    : latestRunStatus
      ? latestRunStatus.toUpperCase()
      : "Idle";

  const runtime = latestRunDurationMs
    ? `${Math.max(1, Math.round(latestRunDurationMs / 1000))}s`
    : "n/a";

  return (
    <>
      <button
        type="button"
        aria-label="Close profile drawer"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-[500px] transform border-l border-white/10 bg-black/40 p-2 backdrop-blur-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${resolvedAvatar})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/92" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,192,255,0.18),transparent_45%)]" />

        <div className="relative z-10 mb-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-black/30 p-1.5 text-zinc-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative z-10 flex h-[calc(100%-40px)] flex-col gap-2 overflow-y-auto pr-1">
        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs text-zinc-400">
          <div className="mb-1 flex items-center gap-2 text-cyan-400">
            <Activity size={12} />
            <span>Agent Profile</span>
          </div>
          <p className="text-sm font-medium text-white">{resolvedName}</p>
          <p className="mt-1">{resolvedDescription}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs">
          <p className="mb-1 text-zinc-500">Capabilities</p>
          {fetchedCapabilities.length === 0 ? (
            <p className="text-zinc-400">No active capabilities</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fetchedCapabilities.map((capability) => (
                <span
                  key={capability}
                  className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300"
                >
                  {capability}
                </span>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className=""
        >
          <AgentStatus isOnline={isOnline} statusText={isOnline ? "Online" : "Idle"} />
        </motion.div>

        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs">
          <p className="text-zinc-500">Mission</p>
          <p className="mt-0.5">{missionState}</p>
        </div>

        <AgentStats
          totalRuns={totalRuns}
          successRuns={successRuns}
          avgDurationMs={avgDurationMs}
          totalTokens={totalTokens}
        />

        <ActionDock />

        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
          <div className="mb-1.5 flex items-center gap-2 text-cyan-400">
            <Cpu size={12} />
            <span className="text-xs">CPU 83% / GPU 41%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 w-[83%] rounded-full bg-[#2D6BFF]" />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
          <div className="mb-1.5 flex items-center gap-2 text-cyan-400">
            <HardDrive size={12} />
            <span className="text-xs">Memory 128GB</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 w-[71%] rounded-full bg-[#5BC0FF]" />
          </div>
        </div>

        <Gallery />

        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
          <div className="mb-1 flex items-center gap-2 text-cyan-400">
            <Zap size={12} />
            <span className="text-xs">Latest Runtime</span>
          </div>
          <p className="text-[11px] text-zinc-500">Most recent agent run duration: {runtime}</p>
        </div>
        </div>
      </aside>
    </>
  );
}

export default RightDock;
