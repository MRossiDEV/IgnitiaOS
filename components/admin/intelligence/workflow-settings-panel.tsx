"use client";

// ======================================================
// Intelligence: Workflow Settings Panel
// components/admin/intelligence/workflow-settings-panel.tsx
// ======================================================
// Slide-over panel for connecting/disconnecting the automation
// workflows that feed Property Intelligence (built around the
// "Scrape Real Estate Listings" node), plus running one on demand.
// Backed by re_connected_workflows (0008 migration) — replaces the
// earlier MARKET_TIMELINE_WORKFLOW_ID env var with a UI-managed list.

import { useEffect, useState } from "react";
import { X, Play, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowSummary {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

interface LastRun {
  status: string;
  started_at: string;
  finished_at: string | null;
}

interface ScrapeSummary {
  portal?: string;
  listingsFound?: number;
  listingsNew?: number;
  listingsChanged?: number;
}

interface Connection {
  id: string;
  label: string | null;
  created_at: string;
  workflow: WorkflowSummary | null;
  lastRun: LastRun | null;
  scrapeSummary: ScrapeSummary | null;
}

const RUN_STATUS_STYLES: Record<string, string> = {
  completed: "text-emerald-400",
  running: "text-cyan-400",
  paused: "text-amber-400",
  failed: "text-red-400",
};

const WORKFLOW_STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  paused: "bg-amber-400/15 text-amber-300 border-amber-400/20",
};

function runDuration(run: LastRun) {
  if (!run.finished_at) return null;
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  return ms >= 0 ? `${(ms / 1000).toFixed(1)}s` : null;
}

export function WorkflowSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [connectionsRes, workflowsRes] = await Promise.all([
        fetch("/api/v1/intelligence/settings/workflows").then((r) => r.json()),
        fetch("/api/v1/automation/workflows").then((r) => r.json()),
      ]);
      setConnections(connectionsRes.connections ?? []);
      setAvailableWorkflows(workflowsRes.workflows ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const connect = async () => {
    if (!selectedWorkflowId) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/intelligence/settings/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: selectedWorkflowId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to connect workflow.");
        return;
      }
      setSelectedWorkflowId("");
      await load();
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (connectionId: string) => {
    await fetch(`/api/v1/intelligence/settings/workflows/${connectionId}`, { method: "DELETE" });
    await load();
  };

  const runNow = async (connectionId: string) => {
    setRunningId(connectionId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/intelligence/settings/workflows/${connectionId}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Run failed.");
        return;
      }
      await load();
    } finally {
      setRunningId(null);
    }
  };

  if (!open) return null;

  const connectedIds = new Set(connections.map((c) => c.workflow?.id));
  const connectableWorkflows = availableWorkflows.filter((w) => !connectedIds.has(w.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[420px] h-full bg-black border-l border-white/10 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Intelligence Settings</h2>
          <button onClick={onClose} className="rounded p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          Connect automation workflows (built in /admin/automation with the "Scrape Real Estate Listings" node) as
          data sources. Every connected workflow runs whenever the cron at /api/v1/intelligence/scrape fires.
        </p>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 mb-5 flex items-center gap-2">
          <select
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            className="flex-1 h-9 px-2 text-sm rounded-md bg-white/5 border border-white/10 text-white"
          >
            <option value="" className="bg-[#0d1117]">
              Select a workflow to connect...
            </option>
            {connectableWorkflows.map((w) => (
              <option key={w.id} value={w.id} className="bg-[#0d1117]">
                {w.name}
              </option>
            ))}
          </select>
          <Button
            onClick={connect}
            disabled={connecting || !selectedWorkflowId}
            className="gap-1 bg-cyan-500 text-black font-semibold hover:bg-cyan-400 whitespace-nowrap"
          >
            <Plus size={14} />
            Connect
          </Button>
        </div>

        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-2">
          Connected workflows {connections.length > 0 ? `(${connections.length})` : ""}
        </p>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : connections.length === 0 ? (
          <p className="text-sm text-zinc-500">No workflows connected yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {connections.map((c) => {
              const isRunning = runningId === c.id || c.lastRun?.status === "running";
              const duration = c.lastRun ? runDuration(c.lastRun) : null;

              return (
                <div key={c.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">
                          {c.workflow?.name ?? "Deleted workflow"}
                        </p>
                        {c.workflow && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                              WORKFLOW_STATUS_STYLES[c.workflow.status] ?? WORKFLOW_STATUS_STYLES.draft
                            }`}
                          >
                            {c.workflow.status}
                          </span>
                        )}
                      </div>

                      {c.lastRun ? (
                        <p className="text-xs text-zinc-500">
                          <span className={RUN_STATUS_STYLES[c.lastRun.status] ?? "text-zinc-400"}>
                            {c.lastRun.status}
                          </span>
                          {" · "}
                          {new Date(c.lastRun.started_at).toLocaleString()}
                          {duration ? ` · ${duration}` : ""}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500">Never run</p>
                      )}

                      {c.scrapeSummary && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Found {c.scrapeSummary.listingsFound ?? 0} · New {c.scrapeSummary.listingsNew ?? 0} ·
                          Changed {c.scrapeSummary.listingsChanged ?? 0}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => runNow(c.id)}
                        disabled={isRunning}
                        title={isRunning ? "Running..." : "Run now"}
                        className="rounded-md p-1.5 text-zinc-500 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors disabled:opacity-60"
                      >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => disconnect(c.id)}
                        disabled={isRunning}
                        title="Disconnect"
                        className="rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
