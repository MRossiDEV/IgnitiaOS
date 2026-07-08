"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Brain,
  Briefcase,
  Camera,
  Database,
  FileBarChart,
  FileText,
  FileType,
  FolderOpen,
  Globe,
  Globe2,
  HardDrive,
  Image,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquare,
  Mic,
  Monitor,
  PlayCircle,
  Radar,
  ScanEye,
  ScanText,
  Search,
  SearchCheck,
  Sheet,
  Shield,
  TerminalSquare,
  Webhook,
  Wrench,
  Zap,
} from "lucide-react";

type AgentTool = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  enabled: boolean;
  configuration?: Record<string, unknown> | null;
};

const COLOR_STYLES: Record<string, string> = {
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  green: "border-green-500/30 bg-green-500/10 text-green-300",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-300",
  slate: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  zinc: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

const ICONS: Record<string, any> = {
  Globe,
  Radar,
  Camera,
  Shield,
  Brain,
  Image,
  ScanEye,
  Mic,
  FileText,
  FileType,
  Sheet,
  Search,
  MessageCircle,
  Briefcase,
  PlayCircle,
  Zap,
  Database,
  FileBarChart,
  Monitor,
  Globe2,
  SearchCheck,
  ScanText,
  TerminalSquare,
  HardDrive,
  FolderOpen,
  Mail,
  MessageSquare,
  ListChecks,
  Webhook,
};

function iconFromName(iconName?: string | null) {
  if (!iconName) {
    return Wrench;
  }

  return ICONS[iconName] ?? Wrench;
}

function colorClass(color?: string | null) {
  if (!color) {
    return "border-white/15 bg-white/5 text-zinc-300";
  }

  return COLOR_STYLES[color] ?? "border-white/15 bg-white/5 text-zinc-300";
}

export default function AgentToolsBoard() {
  const params = useParams<{ id: string }>();
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const agentId = params?.id;
    if (!agentId) {
      return;
    }

    let cancelled = false;

    async function loadTools() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/agents/${agentId}/tools`, {
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Failed to load tools");
        }

        if (!cancelled) {
          setTools(Array.isArray(json.tools) ? json.tools : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tools");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTools();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = tools.filter((tool) => {
      if (!q) return true;

      const text = `${tool.name} ${tool.slug} ${tool.category} ${tool.description ?? ""}`.toLowerCase();
      return text.includes(q);
    });

    const bucket = new Map<string, AgentTool[]>();

    for (const tool of filtered) {
      const category = tool.category || "Other";
      const categoryTools = bucket.get(category) ?? [];
      categoryTools.push(tool);
      bucket.set(category, categoryTools);
    }

    return Array.from(bucket.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tools, search]);

  const enabledCount = tools.filter((tool) => tool.enabled).length;

  async function persist(nextTools: AgentTool[], previousTools: AgentTool[]) {
    const agentId = params?.id;
    if (!agentId) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        tools: nextTools
          .filter((tool) => tool.enabled)
          .map((tool) => ({
            id: tool.id,
            enabled: true,
            configuration: tool.configuration ?? null,
          })),
      };

      const res = await fetch(`/api/v1/agents/${agentId}/tools`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to update tools");
      }

      setTools(Array.isArray(json.tools) ? json.tools : nextTools);
    } catch (err: unknown) {
      setTools(previousTools);
      setError(err instanceof Error ? err.message : "Failed to update tools");
    } finally {
      setSaving(false);
    }
  }

  function onToggle(toolId: string) {
    const previousTools = tools;
    const nextTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    );

    setTools(nextTools);
    void persist(nextTools, previousTools);
  }

  return (
    <section className="mt-2 rounded-xl border border-white/10 bg-[#081322]/70 p-3 backdrop-blur-xl">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Agent Tools</h3>
          <p className="text-xs text-zinc-400">
            Build the skill tree with live toggles. {enabledCount} enabled.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 lg:w-72">
          <Search size={14} className="text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full bg-transparent text-xs text-zinc-100 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertTriangle size={13} />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
            Loading tools...
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
            No tools match your search.
          </div>
        ) : (
          grouped.map(([category, categoryTools]) => (
            <div key={category} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {category}
                </h4>
                <span className="text-xs text-zinc-500">
                  {categoryTools.filter((tool) => tool.enabled).length}/{categoryTools.length}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {categoryTools.map((tool) => {
                  const Icon = iconFromName(tool.icon);
                  const isEnabled = tool.enabled;

                  return (
                    <article
                      key={tool.id}
                      className={`rounded-lg border p-3 transition ${
                        isEnabled
                          ? "border-cyan-500/40 bg-cyan-500/8"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-md border px-2 py-1 ${colorClass(tool.color)}`}>
                            <Icon size={14} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">{tool.name}</p>
                            <p className="text-[11px] text-zinc-500">{tool.slug}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onToggle(tool.id)}
                          className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                            isEnabled
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
                              : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {isEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                        {tool.description || "No description provided yet."}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {saving && (
        <p className="mt-2 text-right text-xs text-cyan-300">Syncing tool assignments...</p>
      )}
    </section>
  );
}
