"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import {
  WorkspacePanel,
  LeftDock,
  RightDock,
  TopBar,
} from "./components";
import type { AgentWorkspaceView } from "./components/LeftDock";

type AgentRecord = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  avatar?: string | null;
  personality_preset?: string | null;
};

type AgentStats = {
  total_runs: number;
  success_runs: number;
  failed_runs: number;
  avg_duration: number;
  total_tokens: number;
  total_cost: number;
};

type AgentRun = {
  status?: string;
  created_at?: string;
  duration_ms?: number;
};

export default function AgentProfilePage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [activeView, setActiveView] = useState<AgentWorkspaceView>("overview");
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    let cancelled = false;

    async function loadAgent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/agents/${id}`, { cache: "no-store" });
        const json = await res.json();

        if (!cancelled && res.ok && json?.success) {
          setAgent(json.agent ?? null);
          setStats(json.stats ?? null);
          setRecentRuns(Array.isArray(json.recent_runs) ? json.recent_runs : []);
        }
      } catch {
        if (!cancelled) {
          setAgent(null);
          setStats(null);
          setRecentRuns([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAgent();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const isOnline = useMemo(() => {
    const status = (agent?.status ?? "").toLowerCase();
    return status === "active" || status === "online";
  }, [agent?.status]);

  const latestRun = recentRuns[0] ?? null;

  return (
    <main className="relative h-screen overflow-hidden bg-[#070B12] text-white">

      {/* Glow */}
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2D6BFF22,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#00D5FF11,transparent_35%)]" /> */}

      {/* Layout */}
      <div className="relative flex h-full">
        {/* LEFT SIDEBAR */}
        <LeftDock
          avatarSrc={agent?.avatar || undefined}
          isOnline={isOnline}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* CENTER */}
        <section className="z-0 flex flex-1 flex-col">
          <div className="flex flex-row">
            <div className="w-[calc(100%-64px)]">
              <TopBar
                agentId={params?.id}
                title={agent?.name}
                subtitle={agent?.category}
                isOnline={isOnline}
                loading={loading}
                onProfileClick={() => setIsRightDrawerOpen(true)}
              />
            </div>

            <button
              type="button"
              aria-label="Open profile drawer"
              onClick={() => setIsRightDrawerOpen(true)}
              className="z-20 rounded-full h-13 w-12 flex items-center justify-center mt-4 border border-cyan-400/30 bg-black/40 text-cyan-300 shadow-[0_0_16px_rgba(91,192,255,0.35)] transition hover:border-cyan-300/50 hover:bg-cyan-500/10"
            >
              <UserCircle2 size={20} />
            </button>
          
          </div>


          <WorkspacePanel activeView={activeView} agent={agent} />
        </section>



        <RightDock
          isOpen={isRightDrawerOpen}
          onClose={() => setIsRightDrawerOpen(false)}
          agentName={agent?.name}
          avatarSrc={agent?.avatar}
          description={agent?.description}
          totalRuns={stats?.total_runs}
          successRuns={stats?.success_runs}
          avgDurationMs={stats?.avg_duration}
          totalTokens={stats?.total_tokens}
          isOnline={isOnline}
          latestRunStatus={latestRun?.status}
          latestRunDurationMs={latestRun?.duration_ms}
          loading={loading}
        />
      </div>
    </main>
  );
}