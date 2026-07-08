// app/admin/agents/new/steps/Step4Workflow.tsx

"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  Play,
  Globe,
  Brain,
  Database,
  Mail,
  FileText,
  GitBranch,
  GitMerge,
  Repeat,
  CheckCircle2,
  ArrowRight,
  Workflow,
  Plus,
  Trash2,
  GripVertical,
  Save,
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
    workflow?: Array<{
      id: string;
      type: string;
      title: string;
      config?: {
        timeout?: number;
        prompt?: string;
        input_variable?: string;
        output_variable?: string;
        advanced_config?: string;
      };
    }>;
}

interface Props {
  agent: AgentDefinition;
  setAgent: Dispatch<SetStateAction<AgentDefinition>>;
  onSave?: () => void;
  saving?: boolean;
}

interface WorkflowNode {
  id: string;
  type: string;
  title: string;
  description: string;
  color: string;
  icon: any;
}

const NODE_LIBRARY: WorkflowNode[] = [
  {
    id: "trigger",
    type: "trigger",
    title: "Trigger",
    description: "Workflow starts here",
    color: "bg-green-500",
    icon: Play,
  },
  {
    id: "browser",
    type: "browser",
    title: "Browser",
    description: "Open a website",
    color: "bg-blue-500",
    icon: Globe,
  },
  {
    id: "llm",
    type: "llm",
    title: "AI Model",
    description: "Think using the selected model",
    color: "bg-purple-500",
    icon: Brain,
  },
  {
    id: "database",
    type: "database",
    title: "Database",
    description: "Read / Write SQL",
    color: "bg-yellow-500",
    icon: Database,
  },
  {
    id: "email",
    type: "email",
    title: "Email",
    description: "Send Email",
    color: "bg-pink-500",
    icon: Mail,
  },
  {
    id: "report",
    type: "report",
    title: "Generate Report",
    description: "Create final report",
    color: "bg-cyan-500",
    icon: FileText,
  },
  {
    id: "condition",
    type: "condition",
    title: "Condition",
    description: "IF / ELSE",
    color: "bg-orange-500",
    icon: GitBranch,
  },
  {
    id: "merge",
    type: "merge",
    title: "Merge",
    description: "Merge branches",
    color: "bg-indigo-500",
    icon: GitMerge,
  },
  {
    id: "loop",
    type: "loop",
    title: "Loop",
    description: "Repeat execution",
    color: "bg-red-500",
    icon: Repeat,
  },
];

export default function Step4Workflow({
  agent,
  setAgent,
  onSave,
  saving = false,
}: Props) {
  const workflow = agent.workflow ?? [];

  function addNode(node: WorkflowNode) {
    setAgent((prev) => ({
      ...prev,
      workflow: [
        ...(prev.workflow ?? []),
        {
          id: crypto.randomUUID(),
          type: node.type,
          title: node.title,
          config: {
            timeout: 60,
            prompt: "",
            input_variable: "",
            output_variable: "",
            advanced_config: '{\n  "cache": true,\n  "retries": 3,\n  "headless": true\n}',
          },
        },
      ],
    }));
  }

  function removeNode(id: string) {
    setAgent((prev) => ({
      ...prev,
      workflow: (prev.workflow ?? []).filter(
        (n: any) => n.id !== id
      ),
    }));
  }

  const estimatedTime = useMemo(() => {
    return workflow.length * 2.4;
  }, [workflow]);

  function updateNode(
    nodeId: string,
    updater: (node: any) => any
  ) {
    setAgent((prev) => ({
      ...prev,
      workflow: (prev.workflow ?? []).map((node: any) =>
        node.id === nodeId ? updater(node) : node
      ),
    }));
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>

        <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">

          Step 4

        </div>

        <h2 className="mt-5 text-3xl font-bold">

          Workflow Builder

        </h2>

        <p className="mt-3 max-w-4xl text-sm text-zinc-400">

          Build how your AI Worker thinks.
          Each node performs one task.
          Together they become an autonomous agent.

        </p>

      </div>

      <div className="grid gap-8 xl:grid-cols-[340px_1fr]">

        {/* NODE LIBRARY */}

        <aside className="rounded-2xl border border-white/10 bg-white/5">

          <div className="border-b border-white/10 p-6">

            <div className="flex items-center gap-3">

              <Workflow className="text-cyan-400" />

              <h3 className="text-2xl font-black">

                Node Library

              </h3>

            </div>

          </div>

          <div className="space-y-3 p-6">

            {NODE_LIBRARY.map((node) => {

              const Icon = node.icon;

              return (

                <button
                  key={node.id}
                  onClick={() => addNode(node)}
                  className="group flex w-full items-center gap-5 rounded-2xl border border-white/10 p-5 transition hover:border-cyan-500 hover:bg-cyan-500/5"
                >

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${node.color}`}
                  >

                    <Icon size={22} />

                  </div>

                  <div className="flex-1 text-left">

                    <div className="font-bold">

                      {node.title}

                    </div>

                    <div className="mt-1 text-sm text-zinc-500">

                      {node.description}

                    </div>

                  </div>

                  <Plus
                    size={18}
                    className="text-zinc-500 transition group-hover:text-cyan-400"
                  />

                </button>

              );

            })}

          </div>

        </aside>

        {/* WORKFLOW CANVAS */}

        <section className="rounded-2xl border border-white/10 bg-white/5">

          <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">

            <div>

              <h3 className="text-2xl font-black">

                Workflow Canvas

              </h3>

              <p className="mt-2 text-zinc-500">

                Build your execution pipeline.

              </p>

            </div>

            <div className="rounded-xl bg-cyan-500/10 px-4 py-2">

              <span className="font-bold text-cyan-400">

                {workflow.length} Nodes

              </span>

            </div>

          </div>

                  <div className="p-8">
                  {workflow.length === 0 ? (

              <div className="flex min-h-[600px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10">

                <Workflow
                  size={70}
                  className="text-zinc-700"
                />

                <h3 className="mt-8 text-3xl font-black">

                  Empty Workflow

                </h3>

                <p className="mt-3 max-w-xl text-center text-zinc-500">

                  Start by adding a Trigger node from the left panel,
                  then continue adding Browser, AI, Database and other
                  nodes to build your autonomous workflow.

                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {workflow.map(
                  (
                    node: any,
                    index: number
                  ) => {

                    const definition =
                      NODE_LIBRARY.find(
                        (n) =>
                          n.type === node.type
                      );

                    if (!definition) return null;

                    const Icon =
                      definition.icon;

                    return (

                      <div
                        key={node.id}
                        className="relative"
                      >

                        {/* CONNECTION */}

                        {index > 0 && (

                          <div className="absolute -top-5 left-9 flex h-5 items-center">

                            <ArrowRight
                              className="text-cyan-400"
                              size={18}
                            />

                          </div>

                        )}

                        <div className="group flex items-center gap-6 rounded-2xl border border-white/10 bg-black/20 p-6 transition hover:border-cyan-500">

                          {/* DRAG */}

                          <button className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:border-cyan-500">

                            <GripVertical
                              size={18}
                            />

                          </button>

                          {/* ICON */}

                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${definition.color}`}
                          >

                            <Icon size={26} />

                          </div>

                          {/* INFO */}

                          <div className="flex-1">

                            <h3 className="text-xl font-bold">

                              {definition.title}

                            </h3>

                            <p className="mt-2 text-zinc-500">

                              {
                                definition.description
                              }

                            </p>

                          </div>

                          {/* STATUS */}

                          <div className="rounded-full bg-green-500/10 p-3">

                            <CheckCircle2
                              className="text-green-400"
                              size={20}
                            />

                          </div>

                          {/* REMOVE */}

                          <button
                            onClick={() =>
                              removeNode(
                                node.id
                              )
                            }
                            className="rounded-xl border border-red-500/20 p-3 text-red-400 transition hover:bg-red-500/10"
                          >

                            <Trash2
                              size={18}
                            />

                          </button>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

                  </div>
                {/* NODE CONFIGURATION */}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5">

            <div className="border-b border-white/10 px-8 py-6">

              <h3 className="text-2xl font-black">
                Node Configuration
              </h3>

              <p className="mt-2 text-zinc-500">
                Configure how every node behaves during execution.
              </p>

            </div>

            <div className="divide-y divide-white/5">

              {workflow.map((node: any) => {

                const definition = NODE_LIBRARY.find(
                  (n) => n.type === node.type
                );

                if (!definition) return null;

                return (

                  <div
                    key={node.id}
                    className="grid gap-8 p-8 lg:grid-cols-[280px_1fr]"
                  >

                    {/* LEFT */}

                    <div>

                      <div className="flex items-center gap-4">

                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${definition.color}`}
                        >
                          <definition.icon size={22} />
                        </div>

                        <div>

                          <h4 className="text-xl font-bold">
                            {definition.title}
                          </h4>

                          <p className="text-sm text-zinc-500">
                            {definition.description}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="grid gap-6 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Display Name
                        </label>

                        <input
                          value={node.title}
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              title: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-500"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Timeout (sec)
                        </label>

                        <input
                          type="number"
                          value={node.config?.timeout ?? 60}
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              config: {
                                ...(current.config ?? {}),
                                timeout: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-500"
                        />

                      </div>

                      <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Prompt / Instructions
                        </label>

                        <textarea
                          rows={5}
                          value={node.config?.prompt ?? ""}
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              config: {
                                ...(current.config ?? {}),
                                prompt: e.target.value,
                              },
                            }))
                          }
                          placeholder="Instructions specific to this node..."
                          className="w-full rounded-xl border border-white/10 bg-black/20 p-4 outline-none transition focus:border-cyan-500"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Input Variable
                        </label>

                        <input
                          value={node.config?.input_variable ?? ""}
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              config: {
                                ...(current.config ?? {}),
                                input_variable: e.target.value,
                              },
                            }))
                          }
                          placeholder="{{website}}"
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-500"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Output Variable
                        </label>

                        <input
                          value={node.config?.output_variable ?? ""}
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              config: {
                                ...(current.config ?? {}),
                                output_variable: e.target.value,
                              },
                            }))
                          }
                          placeholder="{{crawl_result}}"
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-500"
                        />

                      </div>

                      <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-zinc-400">
                          Advanced Configuration (JSON)
                        </label>

                        <textarea
                          rows={6}
                          value={
                            node.config?.advanced_config ??
                            '{\n  "cache": true,\n  "retries": 3,\n  "headless": true\n}'
                          }
                          onChange={(e) =>
                            updateNode(node.id, (current) => ({
                              ...current,
                              config: {
                                ...(current.config ?? {}),
                                advanced_config: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-sm outline-none transition focus:border-cyan-500"
                        />

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

          {/* WORKFLOW VARIABLES */}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="text-2xl font-black">

              Workflow Variables

            </h3>

            <p className="mt-2 text-zinc-500">

              Variables generated by one node can be consumed by any following node.

            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              {[
                "{{website}}",
                "{{company_name}}",
                "{{html}}",
                "{{markdown}}",
                "{{screenshot}}",
                "{{seo_score}}",
                "{{performance}}",
                "{{brand_analysis}}",
                "{{database_result}}",
                "{{report}}",
              ].map((variable) => (

                <div
                  key={variable}
                  className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300"
                >
                  {variable}
                </div>

              ))}

            </div>

                  </div>
                {/* EXECUTION ANALYSIS */}

          <div className="mt-10 grid gap-6 lg:grid-cols-4">

            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Nodes
              </div>

              <div className="mt-3 text-3xl font-bold text-cyan-400">
                {workflow.length}
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Estimated Runtime
              </div>

              <div className="mt-3 text-3xl font-bold">
                {estimatedTime.toFixed(1)}s
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                AI Calls
              </div>

              <div className="mt-3 text-3xl font-bold">
                {
                  workflow.filter(
                    (n: any) => n.type === "llm"
                  ).length
                }
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

              <div className="text-sm uppercase tracking-widest text-zinc-500">
                Complexity
              </div>

              <div className="mt-3 text-3xl font-bold">

                {workflow.length < 5
                  ? "Low"
                  : workflow.length < 10
                  ? "Med"
                  : "High"}

              </div>

            </div>

          </div>

          {/* EXECUTION PREVIEW */}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5">

            <div className="border-b border-white/10 px-8 py-6">

              <h3 className="text-2xl font-black">

                Execution Preview

              </h3>

              <p className="mt-2 text-zinc-500">

                This is how your AI Worker will execute.

              </p>

            </div>

            <div className="space-y-4 p-8">

              {workflow.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-zinc-500">

                  Add workflow nodes to preview execution.

                </div>

              ) : (

                workflow.map(
                  (
                    node: any,
                    index: number
                  ) => {

                    const definition =
                      NODE_LIBRARY.find(
                        (n) =>
                          n.type === node.type
                      );

                    if (!definition) return null;

                    const Icon =
                      definition.icon;

                    return (

                      <div
                        key={node.id}
                        className="flex items-center gap-5 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${definition.color}`}
                        >

                          <Icon size={18} />

                        </div>

                        <div className="flex-1">

                          <div className="font-bold">

                            Step {index + 1}

                          </div>

                          <div className="text-zinc-500">

                            {definition.title}

                          </div>

                        </div>

                        <CheckCircle2
                          className="text-green-400"
                          size={20}
                        />

                      </div>

                    );

                  }
                )

              )}

            </div>

          </div>

          {/* VALIDATION */}

          <div className="mt-10 rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/10 to-transparent p-8">

            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-3xl font-black">

                  Workflow Validation

                </h3>

                <p className="mt-3 max-w-3xl text-zinc-400">

                  Your workflow is analyzed before deployment to ensure
                  all required nodes are present.

                </p>

                <div className="mt-8 space-y-3">

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      className="text-green-400"
                      size={18}
                    />

                    Trigger node detected

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      className="text-green-400"
                      size={18}
                    />

                    Workflow structure valid

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      className="text-green-400"
                      size={18}
                    />

                    Ready for Runtime configuration

                  </div>

                </div>

              </div>

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-500/10">

                <CheckCircle2
                  size={52}
                  className="text-green-400"
                />

              </div>

            </div>

          </div>

          <div className="mt-6 flex justify-end">

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <Save size={16} />

              {saving ? "Saving..." : "Save Agent to Database"}

            </button>

          </div>

        </section>

      </div>

    </div>

  );

}