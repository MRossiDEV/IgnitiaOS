// app/admin/agents/new/steps/Step2Brain.tsx

"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import {
  Brain,
  Cpu,
  Zap,
  DollarSign,
  Sparkles,
  Thermometer,
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
    response_format?: "Markdown" | "JSON" | "HTML" | "Plain Text";
    personality_preset?: "analyst" | "consultant" | "engineer" | "marketing";
}

interface Props {
  agent: AgentDefinition;
  setAgent: Dispatch<SetStateAction<AgentDefinition>>;
}

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    color: "from-green-500 to-emerald-400",
    models: [
      "gpt-5.5",
      "gpt-5.5-mini",
      "gpt-5",
      "o4",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "from-orange-500 to-yellow-400",
    models: [
      "claude-opus",
      "claude-sonnet",
      "claude-haiku",
    ],
  },
  {
    id: "google",
    name: "Google",
    color: "from-blue-500 to-cyan-400",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    color: "from-purple-500 to-pink-500",
    models: [
      "llama3.3",
      "qwen3",
      "deepseek-r1",
      "mistral",
    ],
  },
];

const responseFormats = [
  "Markdown",
  "JSON",
  "HTML",
  "Plain Text",
];

export default function Step2Brain({
  agent,
  setAgent,
}: Props) {
  const provider = useMemo(() => {
    return (
      providers.find((p) => p.id === agent.provider) ??
      providers[0]
    );
  }, [agent.provider]);

  const estimatedCost = useMemo(() => {
    const base =
      agent.max_tokens / 1000;

    return (base * 0.003).toFixed(3);
  }, [agent.max_tokens]);

  return (
    <div className="space-y-8">

        {/* HEADER */}
        <div>

            <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Step 2
            </div>

            <h2 className="mt-5 text-3xl font-bold">

            AI Brain

            </h2>

            <p className="mt-3 max-w-3xl text-sm text-zinc-400">

            Configure the intelligence powering this worker.

            Choose the provider, model, reasoning level and
            instructions.

            </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">

            {/* LEFT */}
            <div className="space-y-8">

            {/* PROVIDER */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

                <div className="mb-8 flex items-center gap-3">

                <Brain className="text-cyan-400" />

                <h3 className="text-2xl font-bold">

                    AI Provider

                </h3>

                </div>

                <div className="grid gap-5 md:grid-cols-2">

                {providers.map((item) => (
                    <button
                    key={item.id}
                    onClick={() =>
                        setAgent((prev) => ({
                        ...prev,
                        provider: item.id,
                        model: item.models[0],
                        }))
                    }
                    className={`rounded-2xl border p-6 text-left transition ${
                        agent.provider === item.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    >
                    <div
                        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color}`}
                    >
                        <Cpu />
                    </div>

                    <h4 className="text-xl font-bold">
                        {item.name}
                    </h4>

                    <p className="mt-2 text-sm text-zinc-500">

                        {item.models.length} available models

                    </p>

                    </button>
                ))}

                </div>

            </div>

            {/* MODEL */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

                <h3 className="mb-8 text-2xl font-bold">

                Model

                </h3>

                <div className="grid gap-4">

                {provider.models.map((model) => (
                    <button
                    key={model}
                    onClick={() =>
                        setAgent((prev) => ({
                        ...prev,
                        model,
                        }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        agent.model === model
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10"
                    }`}
                    >
                    <div className="font-semibold">

                        {model}

                    </div>

                    </button>
                ))}

                </div>

            </div>

            {/* REASONING */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

                <div className="mb-8 flex items-center gap-3">

                <Sparkles className="text-cyan-400" />

                <h3 className="text-2xl font-bold">

                    Reasoning

                </h3>

                </div>

                <div className="grid gap-4 md:grid-cols-3">

                {["low", "medium", "high"].map((level) => (
                    <button
                    key={level}
                    onClick={() =>
                        setAgent((prev) => ({
                        ...prev,
                        reasoning: level as any,
                        }))
                    }
                    className={`rounded-2xl border p-6 capitalize transition ${
                        agent.reasoning === level
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10"
                    }`}
                    >
                    <div className="text-xl font-bold">

                        {level}

                    </div>

                    </button>
                ))}

                </div>

            </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
                    
                    {/* MODEL SETTINGS */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

                <div className="mb-8 flex items-center gap-3">

                <Thermometer className="text-cyan-400" />

                <h3 className="text-2xl font-bold">
                    Model Settings
                </h3>

                </div>

                {/* Temperature */}

                <div>

                <div className="mb-2 flex items-center justify-between">

                    <label className="font-semibold">
                    Temperature
                    </label>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-cyan-400">
                    {agent.temperature.toFixed(1)}
                    </span>

                </div>

                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={agent.temperature}
                    onChange={(e) =>
                    setAgent((prev) => ({
                        ...prev,
                        temperature: Number(e.target.value),
                    }))
                    }
                    className="w-full"
                />

                <p className="mt-2 text-sm text-zinc-500">
                    Lower values produce deterministic answers. Higher values
                    increase creativity.
                </p>

                </div>

                {/* Max Tokens */}

                <div className="mt-8">

                <div className="mb-2 flex items-center justify-between">

                    <label className="font-semibold">
                    Max Tokens
                    </label>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-cyan-400">
                    {agent.max_tokens.toLocaleString()}
                    </span>

                </div>

                <input
                    type="range"
                    min={1000}
                    max={128000}
                    step={1000}
                    value={agent.max_tokens}
                    onChange={(e) =>
                    setAgent((prev) => ({
                        ...prev,
                        max_tokens: Number(e.target.value),
                    }))
                    }
                    className="w-full"
                />

                <p className="mt-2 text-sm text-zinc-500">
                    Maximum amount of output/context tokens allowed.
                </p>

                </div>

            </div>

            {/* RESPONSE FORMAT */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

                <div className="mb-8 flex items-center gap-3">

                <Zap className="text-cyan-400" />

                <h3 className="text-2xl font-bold">
                    Response Format
                </h3>

                </div>

                <div className="grid gap-4">

                {responseFormats.map((format) => (

                    <button
                    key={format}
                    onClick={() =>
                      setAgent((prev) => ({
                        ...prev,
                        response_format: format as AgentDefinition["response_format"],
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      agent.response_format === format
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:border-cyan-500 hover:bg-cyan-500/5"
                    }`}
                    >

                    <div className="font-semibold">
                        {format}
                    </div>

                    </button>

                ))}

                </div>

            </div>

            {/* COST ESTIMATE */}

            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-8">

                <div className="flex items-center gap-3">

                <DollarSign className="text-cyan-400" />

                <h3 className="text-2xl font-bold">
                    Estimated Cost
                </h3>

                </div>

                <div className="mt-8">

                <div className="text-3xl font-bold text-cyan-400">
                    ${estimatedCost}
                </div>

                <p className="mt-3 text-zinc-500">
                    Approximate cost per execution using the current token
                    limit. Final cost depends on the provider and actual
                    usage.
                </p>

                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">

                <div className="flex items-center justify-between">

                    <span className="text-zinc-400">
                    Provider
                    </span>

                    <span className="font-semibold">
                    {provider.name}
                    </span>

                </div>

                <div className="mt-4 flex items-center justify-between">

                    <span className="text-zinc-400">
                    Model
                    </span>

                    <span className="font-semibold">
                    {agent.model}
                    </span>

                </div>

                <div className="mt-4 flex items-center justify-between">

                    <span className="text-zinc-400">
                    Reasoning
                    </span>

                    <span className="font-semibold capitalize">
                    {agent.reasoning}
                    </span>

                </div>

                <div className="mt-4 flex items-center justify-between">

                    <span className="text-zinc-400">
                    Max Tokens
                    </span>

                    <span className="font-semibold">
                    {agent.max_tokens.toLocaleString()}
                    </span>

                </div>

                </div>

            </div>

            </div>

        </div>
      
        {/* SYSTEM PROMPT */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">

            <div className="mb-8 flex items-center gap-3">

            <Brain className="text-cyan-400" />

            <h3 className="text-2xl font-bold">

                System Prompt

            </h3>

            </div>

            <textarea
            rows={18}
            value={agent.system_prompt}
            onChange={(e) =>
                setAgent((prev) => ({
                ...prev,
                system_prompt: e.target.value,
                }))
            }
            placeholder={`You are an expert Website Audit AI.

Your job is to:

• Crawl the website
• Analyze SEO
• Analyze UX/UI
• Analyze Branding
• Analyze Performance
• Detect Technologies
• Generate recommendations

Always produce professional reports.

Never hallucinate.

Only use information that can be verified.`}
            className="w-full rounded-2xl border border-white/10 bg-black/20 p-6 font-mono text-sm outline-none transition focus:border-cyan-500"
            />

        </div>

        {/* PERSONALITY PRESETS */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="mb-8 text-2xl font-bold">

              Personality Presets

            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              <button
                onClick={() =>
                  setAgent((prev) => ({
                    ...prev,
                    personality_preset: "analyst",
                    system_prompt:
                      "You are an analytical AI that always answers objectively with facts and structured reports.",
                  }))
                }
                className={`rounded-2xl border p-6 text-left transition ${
                  agent.personality_preset === "analyst"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-cyan-500"
                }`}
              >

                <div className="text-lg font-bold">

                  📊 Analyst

                </div>

                <p className="mt-2 text-sm text-zinc-500">

                  Objective, structured and data-driven.

                </p>

              </button>

              <button
                onClick={() =>
                  setAgent((prev) => ({
                    ...prev,
                    personality_preset: "consultant",
                    system_prompt:
                      "You are an experienced business consultant focused on improving revenue, conversion and customer acquisition.",
                  }))
                }
                className={`rounded-2xl border p-6 text-left transition ${
                  agent.personality_preset === "consultant"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-cyan-500"
                }`}
              >

                <div className="text-lg font-bold">

                  💼 Consultant

                </div>

                <p className="mt-2 text-sm text-zinc-500">

                  Business focused recommendations.

                </p>

              </button>

              <button
                onClick={() =>
                  setAgent((prev) => ({
                    ...prev,
                    personality_preset: "engineer",
                    system_prompt:
                      "You are an experienced software engineer specialized in architecture, APIs and automation.",
                  }))
                }
                className={`rounded-2xl border p-6 text-left transition ${
                  agent.personality_preset === "engineer"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-cyan-500"
                }`}
              >

                <div className="text-lg font-bold">

                  👨‍💻 Engineer

                </div>

                <p className="mt-2 text-sm text-zinc-500">

                  Technical explanations and solutions.

                </p>

              </button>

              <button
                onClick={() =>
                  setAgent((prev) => ({
                    ...prev,
                    personality_preset: "marketing",
                    system_prompt:
                      "You are a senior marketing strategist specialized in branding, positioning and customer acquisition.",
                  }))
                }
                className={`rounded-2xl border p-6 text-left transition ${
                  agent.personality_preset === "marketing"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-cyan-500"
                }`}
              >

                <div className="text-lg font-bold">

                  🚀 Marketing Expert

                </div>

                <p className="mt-2 text-sm text-zinc-500">

                  Growth and conversion oriented.

                </p>

              </button>

            </div>

        </div>

        {/* PROMPT VARIABLES */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="mb-6 text-2xl font-bold">

              Available Variables

            </h3>

            <div className="flex flex-wrap gap-3">

              {[
                "{{company_name}}",
                "{{website}}",
                "{{industry}}",
                "{{country}}",
                "{{city}}",
                "{{keywords}}",
                "{{competitors}}",
                "{{goal}}",
                "{{report_type}}",
                "{{today}}",
              ].map((variable) => (
                <button
                  key={variable}
                  className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  {variable}
                </button>
              ))}

            </div>

            <p className="mt-6 text-sm text-zinc-500">

              Variables are automatically replaced during execution
              with real values from the workflow.

            </p>

        </div>

    </div>
  );
}