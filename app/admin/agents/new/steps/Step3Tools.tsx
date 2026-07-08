// app/admin/agents/new/steps/Step3Tools.tsx

"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  Search,
  Globe,
  Terminal,
  Database,
  Mail,
  Image,
  FileText,
  Camera,
  Shield,
  Brain,
  Code2,
  Server,
  Cloud,
  Boxes,
  HardDrive,
  Monitor,
  Zap,
  Check,
  Lock,
} from "lucide-react";



interface AgentDefinition {
    name: string;
    description: string;
    category: string;
    model: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    status: string;
    avatar: string;
    provider?: string;
    slug?: string;
    version?: string;
    emoji?: string;
    created_at?: string;
    icon?: string;
    visibility?: "private" | "internal" | "public";
    reasoning?: "low" | "medium" | "high";
    tools: string[];
    tool_configs?: Record<
      string,
      {
        timeout?: number;
        retries?: number;
        rate_limit?: string;
        api_key?: string;
        config_json?: string;
      }
    >;
}

interface Props {
  agent: AgentDefinition;
  setAgent: Dispatch<SetStateAction<AgentDefinition>>;
}

interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  premium?: boolean;
  requires?: string[];
}

const TOOL_CATEGORIES = [
  "All",
  "Web",
  "AI",
  "Automation",
  "Database",
  "Files",
  "Communication",
  "Infrastructure",
];

const TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: "browser",
    name: "Browser",
    description:
      "Browse websites like a real user.",
    category: "Web",
    icon: Globe,
  },

  {
    id: "playwright",
    name: "Playwright",
    description:
      "Full browser automation.",
    category: "Web",
    icon: Monitor,
    requires: ["browser"],
  },

  {
    id: "firecrawl",
    name: "Firecrawl",
    description:
      "Extract structured data from websites.",
    category: "Web",
    icon: Globe,
    premium: true,
  },

  {
    id: "tavily",
    name: "Tavily Search",
    description:
      "AI Search Engine",
    category: "Web",
    icon: Search,
    premium: true,
  },

  {
    id: "vision",
    name: "Vision",
    description:
      "Image understanding",
    category: "AI",
    icon: Image,
  },

  {
    id: "ocr",
    name: "OCR",
    description:
      "Read text from images.",
    category: "AI",
    icon: Camera,
  },

  {
    id: "terminal",
    name: "Terminal",
    description:
      "Execute shell commands.",
    category: "Automation",
    icon: Terminal,
  },

  {
    id: "python",
    name: "Python",
    description:
      "Execute Python scripts.",
    category: "Automation",
    icon: Code2,
  },

  {
    id: "supabase",
    name: "Supabase",
    description:
      "Database access",
    category: "Database",
    icon: Database,
  },

  {
    id: "postgres",
    name: "PostgreSQL",
    description:
      "SQL queries",
    category: "Database",
    icon: Database,
  },

  {
    id: "redis",
    name: "Redis",
    description:
      "Cache & Queue",
    category: "Database",
    icon: HardDrive,
  },

  {
    id: "filesystem",
    name: "Filesystem",
    description:
      "Read & Write files",
    category: "Files",
    icon: FileText,
  },

  {
    id: "pdf",
    name: "PDF Generator",
    description:
      "Generate PDFs",
    category: "Files",
    icon: FileText,
  },

  {
    id: "email",
    name: "Email",
    description:
      "Send Emails",
    category: "Communication",
    icon: Mail,
  },

  {
    id: "slack",
    name: "Slack",
    description:
      "Slack integration",
    category: "Communication",
    icon: Mail,
  },

  {
    id: "docker",
    name: "Docker",
    description:
      "Run Containers",
    category: "Infrastructure",
    icon: Boxes,
  },

  {
    id: "queue",
    name: "Queue",
    description:
      "Job Queue",
    category: "Infrastructure",
    icon: Server,
  },

  {
    id: "webhook",
    name: "Webhook",
    description:
      "Receive events",
    category: "Infrastructure",
    icon: Cloud,
  },
];

export default function Step3Tools({
  agent,
  setAgent,
}: Props) {
  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const filteredTools = useMemo(() => {
    return TOOL_REGISTRY.filter((tool) => {
      const matchesCategory =
        category === "All" ||
        tool.category === category;

      const matchesSearch =
        tool.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        tool.description
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function toggleTool(id: string) {
    if (agent.tools.includes(id)) {
      setAgent((prev) => ({
        ...prev,
        tools: prev.tools.filter(
          (t) => t !== id
        ),
        tool_configs: Object.fromEntries(
          Object.entries(prev.tool_configs ?? {}).filter(
            ([toolId]) => toolId !== id
          )
        ),
      }));
    } else {
      setAgent((prev) => ({
        ...prev,
        tools: [...prev.tools, id],
        tool_configs: {
          ...(prev.tool_configs ?? {}),
          [id]: prev.tool_configs?.[id] ?? {
            timeout: 60,
            retries: 3,
            rate_limit: "Unlimited",
            api_key: "",
            config_json: '{\n  "headless": true,\n  "cache": false\n}',
          },
        },
      }));
    }
  }

  function updateToolConfig(
    toolId: string,
    patch: {
      timeout?: number;
      retries?: number;
      rate_limit?: string;
      api_key?: string;
      config_json?: string;
    }
  ) {
    setAgent((prev) => ({
      ...prev,
      tool_configs: {
        ...(prev.tool_configs ?? {}),
        [toolId]: {
          ...(prev.tool_configs?.[toolId] ?? {}),
          ...patch,
        },
      },
    }));
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>

        <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          Step 3
        </div>

        <h2 className="mt-5 text-5xl font-black">
          Tool Marketplace
        </h2>

        <p className="mt-3 max-w-4xl text-lg text-zinc-500">
          Install capabilities for this AI Worker.
          Think of tools like apps that extend
          what your agent can actually do in
          the real world.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">

        {/* LEFT SIDEBAR */}

        <div className="space-y-6">

          <div className="rounded-3xl border border-white/10 bg-[#0C111A] p-6">

            <div className="relative">

              <Search
                className="absolute left-4 top-4 text-zinc-500"
                size={18}
              />

              <input
                placeholder="Search tools..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 outline-none focus:border-cyan-500"
              />

            </div>

            <div className="mt-8 space-y-2">

              {TOOL_CATEGORIES.map((cat) => (

                <button
                  key={cat}
                  onClick={() =>
                    setCategory(cat)
                  }
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition ${
                    category === cat
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "hover:bg-white/5"
                  }`}
                >

                  <span>{cat}</span>

                  <span className="text-xs text-zinc-500">

                    {
                      TOOL_REGISTRY.filter(
                        (t) =>
                          cat === "All" ||
                          t.category === cat
                      ).length
                    }

                  </span>

                </button>

              ))}

            </div>

          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-6">

            <h3 className="font-bold">

              Installed

            </h3>

            <div className="mt-5 text-5xl font-black text-cyan-400">

              {agent.tools.length}

            </div>

            <p className="mt-2 text-zinc-500">

              Tools enabled for this worker.

            </p>

          </div>

        </div>

        {/* TOOL GRID */}

              <div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTools.map((tool) => {
              const Icon = tool.icon;

              const installed = agent.tools.includes(tool.id);

              const hasDependencies =
                tool.requires &&
                tool.requires.length > 0;

              const missingDependencies =
                tool.requires?.filter(
                  (dependency) =>
                    !agent.tools.includes(dependency)
                ) ?? [];

              return (
                <div
                  key={tool.id}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                    installed
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-[#0C111A] hover:border-cyan-500/40 hover:-translate-y-1"
                  }`}
                >
                  {/* Premium Badge */}

                  {tool.premium && (
                    <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                      PRO
                    </div>
                  )}

                  {/* Header */}

                  <div className="p-7">

                    <div className="flex items-center justify-between">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">

                        <Icon
                          size={28}
                          className="text-cyan-400"
                        />

                      </div>

                      {installed ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black">
                          <Check size={18} />
                        </div>
                      ) : (
                        <div className="rounded-full border border-white/10 p-2">
                          <Zap
                            size={18}
                            className="text-zinc-500"
                          />
                        </div>
                      )}

                    </div>

                    <h3 className="mt-6 text-2xl font-bold">

                      {tool.name}

                    </h3>

                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-zinc-500">

                      {tool.description}

                    </p>

                    <div className="mt-6 flex items-center justify-between">

                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-zinc-400">

                        {tool.category}

                      </span>

                      {hasDependencies && (
                        <span className="flex items-center gap-2 text-xs text-yellow-400">

                          <Lock size={14} />

                          {tool.requires?.length} dependency

                        </span>
                      )}

                    </div>

                    {/* Dependencies */}

                    {hasDependencies && (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">

                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">

                          Dependencies

                        </div>

                        <div className="space-y-2">

                          {tool.requires?.map((dependency) => {
                            const ok =
                              agent.tools.includes(dependency);

                            return (
                              <div
                                key={dependency}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm">

                                  {dependency}

                                </span>

                                {ok ? (
                                  <Check
                                    size={16}
                                    className="text-green-400"
                                  />
                                ) : (
                                  <Lock
                                    size={16}
                                    className="text-yellow-400"
                                  />
                                )}
                              </div>
                            );
                          })}

                        </div>

                      </div>
                    )}

                    {/* Actions */}

                    <div className="mt-8 flex gap-3">

                      <button
                        onClick={() => toggleTool(tool.id)}
                        disabled={
                          !installed &&
                          missingDependencies.length > 0
                        }
                        className={`flex-1 rounded-2xl py-4 font-bold transition ${
                          installed
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : missingDependencies.length > 0
                            ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                            : "bg-cyan-500 text-black hover:bg-cyan-400"
                        }`}
                      >
                        {installed
                          ? "Remove"
                          : "Install"}
                      </button>

                      <button className="rounded-2xl border border-white/10 px-5 transition hover:border-cyan-500">

                        Details

                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

                  </div>
      
                {/* INSTALLED TOOLS */}

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#0C111A]">

            <div className="border-b border-white/10 px-8 py-6">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-2xl font-black">

                    Installed Tools

                  </h3>

                  <p className="mt-2 text-zinc-500">

                    Configure the tools this worker can use during execution.

                  </p>

                </div>

                <div className="rounded-2xl bg-cyan-500/10 px-5 py-3">

                  <span className="text-2xl font-black text-cyan-400">

                    {agent.tools.length}

                  </span>

                </div>

              </div>

            </div>

            {agent.tools.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-24">

                <Boxes
                  size={60}
                  className="text-zinc-700"
                />

                <h4 className="mt-6 text-2xl font-bold">

                  No tools installed

                </h4>

                <p className="mt-3 max-w-lg text-center text-zinc-500">

                  Install tools from the marketplace above.
                  Every installed tool becomes available to your
                  AI Worker while executing workflows.

                </p>

              </div>

            ) : (

              <div className="divide-y divide-white/5">

                {agent.tools.map((toolId) => {

                  const tool =
                    TOOL_REGISTRY.find(
                      (t) => t.id === toolId
                    );

                  if (!tool) return null;

                  const Icon = tool.icon;
                  const currentConfig = agent.tool_configs?.[tool.id] ?? {
                    timeout: 60,
                    retries: 3,
                    rate_limit: "Unlimited",
                    api_key: "",
                    config_json: '{\n  "headless": true,\n  "cache": false\n}',
                  };

                  return (

                    <div
                      key={tool.id}
                      className="grid gap-8 p-8 xl:grid-cols-[320px_1fr]"
                    >

                      {/* INFO */}

                      <div>

                        <div className="flex items-center gap-5">

                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">

                            <Icon
                              className="text-cyan-400"
                              size={28}
                            />

                          </div>

                          <div>

                            <h4 className="text-xl font-bold">

                              {tool.name}

                            </h4>

                            <p className="text-sm text-zinc-500">

                              {tool.category}

                            </p>

                          </div>

                        </div>

                        <p className="mt-6 leading-7 text-zinc-400">

                          {tool.description}

                        </p>

                      </div>

                      {/* CONFIG */}

                      <div className="grid gap-6 md:grid-cols-2">

                        <div>

                          <label className="mb-2 block text-sm font-semibold text-zinc-400">

                            Timeout (seconds)

                          </label>

                          <input
                            type="number"
                            value={currentConfig.timeout ?? 60}
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                timeout: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-500"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-semibold text-zinc-400">

                            Retry Attempts

                          </label>

                          <input
                            type="number"
                            value={currentConfig.retries ?? 3}
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                retries: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-500"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-semibold text-zinc-400">

                            Rate Limit

                          </label>

                          <input
                            value={currentConfig.rate_limit ?? "Unlimited"}
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                rate_limit: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-500"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-semibold text-zinc-400">

                            API Key

                          </label>

                          <input
                            value={currentConfig.api_key ?? ""}
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                api_key: e.target.value,
                              })
                            }
                            placeholder="••••••••••••••••"
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-500"
                          />

                        </div>

                        <div className="md:col-span-2">

                          <label className="mb-2 block text-sm font-semibold text-zinc-400">

                            Additional Configuration

                          </label>

                          <textarea
                            rows={4}
                            value={
                              currentConfig.config_json ??
                              '{\n  "headless": true,\n  "cache": false\n}'
                            }
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                config_json: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-sm outline-none focus:border-cyan-500"
                          />

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

                  </div>
                {/* TOOL SUMMARY */}

          <div className="mt-10 grid gap-6 lg:grid-cols-4">

            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Installed
              </div>

              <div className="mt-3 text-5xl font-black text-cyan-400">
                {agent.tools.length}
              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0C111A] p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Estimated RAM
              </div>

              <div className="mt-3 text-5xl font-black">

                {(agent.tools.length * 0.4).toFixed(1)} GB

              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0C111A] p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Avg Runtime
              </div>

              <div className="mt-3 text-5xl font-black">

                {(agent.tools.length * 2.4).toFixed(1)} s

              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0C111A] p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                API Calls
              </div>

              <div className="mt-3 text-5xl font-black">

                {agent.tools.length * 3}

              </div>

            </div>

          </div>

          {/* GENERATED PERMISSIONS */}

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#0C111A]">

            <div className="border-b border-white/10 px-8 py-6">

              <div className="flex items-center gap-3">

                <Shield className="text-cyan-400" />

                <h3 className="text-2xl font-black">

                  Auto Generated Permissions

                </h3>

              </div>

            </div>

            <div className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">

              {[
                "Internet Access",
                "External APIs",
                "Filesystem",
                "Database",
                "Image Processing",
                "Browser Automation",
                "Shell Commands",
                "Email",
                "Webhooks",
              ].map((permission) => {

                const enabled =
                  permission === "Internet Access"
                    ? agent.tools.includes("browser") ||
                      agent.tools.includes("firecrawl")
                    : permission === "Browser Automation"
                    ? agent.tools.includes("playwright")
                    : permission === "Database"
                    ? agent.tools.includes("supabase") ||
                      agent.tools.includes("postgres")
                    : permission === "Filesystem"
                    ? agent.tools.includes("filesystem")
                    : permission === "Image Processing"
                    ? agent.tools.includes("vision") ||
                      agent.tools.includes("ocr")
                    : permission === "Shell Commands"
                    ? agent.tools.includes("terminal")
                    : permission === "Email"
                    ? agent.tools.includes("email")
                    : permission === "Webhooks"
                    ? agent.tools.includes("webhook")
                    : true;

                return (

                  <div
                    key={permission}
                    className={`flex items-center justify-between rounded-2xl border p-5 ${
                      enabled
                        ? "border-green-500/20 bg-green-500/10"
                        : "border-white/10 bg-black/20"
                    }`}
                  >

                    <span>

                      {permission}

                    </span>

                    {enabled ? (

                      <Check
                        size={18}
                        className="text-green-400"
                      />

                    ) : (

                      <Lock
                        size={18}
                        className="text-zinc-600"
                      />

                    )}

                  </div>

                );

              })}

            </div>

          </div>

          {/* EXECUTION PIPELINE */}

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#0C111A] p-8">

            <h3 className="text-2xl font-black">

              Execution Pipeline

            </h3>

            <p className="mt-2 text-zinc-500">

              Approximate execution order based on the currently installed tools.

            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">

              <div className="rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black">
                Input
              </div>

              {agent.tools.map((toolId) => {

                const tool = TOOL_REGISTRY.find(
                  (t) => t.id === toolId
                );

                if (!tool) return null;

                return (

                  <div key={`${tool.id}-pipeline`} className="contents">
                    <div className="text-zinc-600">
                      →
                    </div>

                    <div
                      className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4"
                    >

                      {tool.name}

                    </div>
                  </div>

                );

              })}

              <div className="text-zinc-600">
                →
              </div>

              <div className="rounded-2xl bg-green-500 px-5 py-4 font-bold text-black">
                Output
              </div>

            </div>

          </div>

          {/* READY */}

          <div className="mt-10 rounded-3xl border border-green-500/20 bg-gradient-to-b from-green-500/10 to-transparent p-8">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-3xl font-black">

                  {agent.tools.length === 0
                    ? "No Tools Installed"
                    : "Worker Ready"}

                </h3>

                <p className="mt-3 max-w-3xl text-zinc-400">

                  {agent.tools.length === 0
                    ? "This AI Worker currently cannot interact with the outside world. Install tools to give it real-world capabilities."
                    : "Excellent. Your AI Worker now has the capabilities required to perform real-world tasks. Continue to the Workflow Builder to define how these tools work together."}

                </p>

              </div>

              <div className={`flex h-28 w-28 items-center justify-center rounded-full ${
                agent.tools.length === 0
                  ? "bg-red-500/10"
                  : "bg-green-500/10"
              }`}>

                {agent.tools.length === 0 ? (

                  <Lock
                    size={50}
                    className="text-red-400"
                  />

                ) : (

                  <Check
                    size={50}
                    className="text-green-400"
                  />

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}