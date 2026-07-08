"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Play,
  Save,
  ScrollText,
  Shield,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Visibility = "private" | "internal" | "public";
type Reasoning = "low" | "medium" | "high";
type ResponseFormat = "Markdown" | "JSON" | "HTML" | "Plain Text";

type AgentTool = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  enabled: boolean;
  configurationText: string;
};

type KnowledgeSource = {
  id: string;
  type: string;
  name: string;
  value: string;
};

type PeerAgent = {
  id: string;
  name: string;
  category?: string | null;
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
  total_tokens?: number;
  total_cost?: number;
};

type PromptSettings = {
  useRawPrompt: boolean;
  rawPrompt: string;
  role: string;
  mission: string;
  rules: string;
  knowledge: string;
  outputFormat: string;
  examples: string;
  avoid: string;
};

type AgentSettings = {
  identity: {
    internalName: string;
    bannerImage: string;
    role: string;
    department: string;
    shortDescription: string;
    biography: string;
  };
  ai: {
    topP: number;
    creativity: number;
    responseLength: string;
    language: string;
    timezone: string;
  };
  personality: {
    tone: string;
    communicationStyle: string[];
    confidence: number;
    humor: number;
    emojiUsage: string;
    greetingStyle: string;
    signature: string;
    catchphrase: string;
  };
  prompt: PromptSettings;
  permissions: Record<string, boolean>;
  memory: {
    rememberConversations: boolean;
    rememberProjects: boolean;
    rememberClients: boolean;
    rememberPreferences: boolean;
    maximumMemory: number;
    vectorSearch: boolean;
    knowledgeBase: string;
  };
  knowledge: KnowledgeSource[];
  workflow: {
    canDelegate: boolean;
    canCallOtherAgents: boolean;
    canExecuteAutomatically: boolean;
    needsApproval: boolean;
    maxIterations: number;
    timeoutSeconds: number;
    retryCount: number;
  };
  collaboration: {
    allowedAgentIds: string[];
  };
  limits: {
    dailyRequests: number;
    monthlyBudget: number;
    maxTokens: number;
    maxApiCalls: number;
    maxImages: number;
    maxBrowserSessions: number;
  };
  theme: {
    accentColor: string;
    background: string;
    theme: string;
    particleEffect: string;
    avatarAnimation: string;
    voice: string;
  };
};

type AgentFormState = {
  name: string;
  title: string;
  slug: string;
  avatar: string;
  version: string;
  status: string;
  visibility: Visibility;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  reasoning: Reasoning;
  responseFormat: ResponseFormat;
  personalityPreset: string;
  settings: AgentSettings;
  tools: AgentTool[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type TestResult = {
  durationMs: number;
  at: string;
};

const SECTION_NAV = [
  { id: "identity", label: "Identity", icon: Bot },
  { id: "ai", label: "AI", icon: Brain },
  { id: "personality", label: "Personality", icon: Sparkles },
  { id: "prompt", label: "Prompt", icon: ScrollText },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "memory", label: "Memory", icon: Database },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "workflow", label: "Workflow", icon: Clock3 },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "limits", label: "Limits", icon: BarChart3 },
  { id: "theme", label: "Theme", icon: Sparkles },
  { id: "testing", label: "Testing", icon: Play },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
] as const;

const PROVIDERS = {
  openai: ["gpt-5.5", "gpt-5.5-mini", "gpt-5", "o4"],
  anthropic: ["claude-opus", "claude-sonnet", "claude-haiku"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash"],
  ollama: ["llama3.3", "qwen3", "deepseek-r1", "mistral"],
} as const;

const PERMISSION_GROUPS = [
  {
    title: "Core Access",
    items: [
      ["internet", "Internet"],
      ["filesystem", "Filesystem"],
      ["database", "Database"],
      ["emails", "Emails"],
      ["apiCalls", "API Calls"],
    ],
  },
  {
    title: "Execution",
    items: [
      ["automation", "Automation"],
      ["git", "Git"],
      ["terminal", "Terminal"],
      ["deleteFiles", "Delete Files"],
    ],
  },
  {
    title: "Media",
    items: [
      ["imageGeneration", "Image Generation"],
      ["videoGeneration", "Video Generation"],
    ],
  },
] as const;

const KNOWLEDGE_TYPES = [
  "Company Docs",
  "PDF",
  "Website",
  "Markdown",
  "Git Repository",
  "Supabase",
  "Notion",
  "Google Drive",
];

const COMMUNICATION_STYLES = [
  "Professional",
  "Friendly",
  "Executive",
  "Technical",
  "Playful",
  "Strategic",
  "Concise",
  "Persuasive",
];

const DEFAULT_SETTINGS: AgentSettings = {
  identity: {
    internalName: "",
    bannerImage: "",
    role: "",
    department: "",
    shortDescription: "",
    biography: "",
  },
  ai: {
    topP: 1,
    creativity: 60,
    responseLength: "balanced",
    language: "English",
    timezone: "UTC",
  },
  personality: {
    tone: "Professional",
    communicationStyle: ["Professional", "Strategic", "Concise"],
    confidence: 75,
    humor: 10,
    emojiUsage: "none",
    greetingStyle: "Direct",
    signature: "",
    catchphrase: "",
  },
  prompt: {
    useRawPrompt: true,
    rawPrompt: "",
    role: "",
    mission: "",
    rules: "",
    knowledge: "",
    outputFormat: "",
    examples: "",
    avoid: "",
  },
  permissions: {
    internet: true,
    filesystem: false,
    database: false,
    emails: false,
    apiCalls: true,
    automation: false,
    git: false,
    terminal: false,
    imageGeneration: false,
    videoGeneration: false,
    deleteFiles: false,
  },
  memory: {
    rememberConversations: true,
    rememberProjects: true,
    rememberClients: false,
    rememberPreferences: true,
    maximumMemory: 500,
    vectorSearch: false,
    knowledgeBase: "default",
  },
  knowledge: [],
  workflow: {
    canDelegate: false,
    canCallOtherAgents: false,
    canExecuteAutomatically: false,
    needsApproval: true,
    maxIterations: 4,
    timeoutSeconds: 120,
    retryCount: 2,
  },
  collaboration: {
    allowedAgentIds: [],
  },
  limits: {
    dailyRequests: 100,
    monthlyBudget: 250,
    maxTokens: 8000,
    maxApiCalls: 50,
    maxImages: 10,
    maxBrowserSessions: 4,
  },
  theme: {
    accentColor: "#22d3ee",
    background: "Aurora",
    theme: "Neon",
    particleEffect: "Pulse Grid",
    avatarAnimation: "Float",
    voice: "Default",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;
}

function composeStructuredPrompt(prompt: PromptSettings) {
  const blocks = [
    ["Role", prompt.role],
    ["Mission", prompt.mission],
    ["Rules", prompt.rules],
    ["Knowledge", prompt.knowledge],
    ["Output format", prompt.outputFormat],
    ["Examples", prompt.examples],
    ["Do not", prompt.avoid],
  ]
    .filter(([, value]) => value.trim().length > 0)
    .map(([title, value]) => `${title}:\n${value.trim()}`);

  return blocks.join("\n\n");
}

function buildSystemPrompt(prompt: PromptSettings) {
  if (prompt.useRawPrompt) {
    return prompt.rawPrompt.trim();
  }

  return composeStructuredPrompt(prompt);
}

function normalizeKnowledgeSources(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as KnowledgeSource[];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id
            : `knowledge-${index + 1}`,
        type: typeof item.type === "string" ? item.type : "Website",
        name: typeof item.name === "string" ? item.name : "",
        value: typeof item.value === "string" ? item.value : "",
      };
    })
    .filter((item): item is KnowledgeSource => Boolean(item));
}

function normalizeTools(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as AgentTool[];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || typeof item.id !== "string") {
        return null;
      }

      const configuration = isRecord(item.configuration) ? item.configuration : null;

      return {
        id: item.id,
        slug: typeof item.slug === "string" ? item.slug : item.id,
        name: typeof item.name === "string" ? item.name : item.id,
        category: typeof item.category === "string" ? item.category : "General",
        description: typeof item.description === "string" ? item.description : "",
        enabled: Boolean(item.enabled),
        configurationText: JSON.stringify(configuration ?? {}, null, 2),
      };
    })
    .filter((item): item is AgentTool => Boolean(item));
}

function normalizeSettings(rawAgent: Record<string, unknown>, tools: AgentTool[]): AgentFormState {
  const rawSettings = isRecord(rawAgent.settings) ? rawAgent.settings : {};
  const identity = isRecord(rawSettings.identity) ? rawSettings.identity : {};
  const ai = isRecord(rawSettings.ai) ? rawSettings.ai : {};
  const personality = isRecord(rawSettings.personality) ? rawSettings.personality : {};
  const prompt = isRecord(rawSettings.prompt) ? rawSettings.prompt : {};
  const memory = isRecord(rawSettings.memory) ? rawSettings.memory : {};
  const workflow = isRecord(rawSettings.workflow) ? rawSettings.workflow : {};
  const collaboration = isRecord(rawSettings.collaboration) ? rawSettings.collaboration : {};
  const limits = isRecord(rawSettings.limits) ? rawSettings.limits : {};
  const theme = isRecord(rawSettings.theme) ? rawSettings.theme : {};
  const permissions = isRecord(rawSettings.permissions) ? rawSettings.permissions : {};

  const promptSections = {
    ...DEFAULT_SETTINGS.prompt,
    useRawPrompt:
      typeof prompt.useRawPrompt === "boolean"
        ? prompt.useRawPrompt
        : true,
    rawPrompt:
      typeof prompt.rawPrompt === "string"
        ? prompt.rawPrompt
        : typeof rawAgent.system_prompt === "string"
        ? rawAgent.system_prompt
        : "",
    role: typeof prompt.role === "string" ? prompt.role : "",
    mission: typeof prompt.mission === "string" ? prompt.mission : "",
    rules: typeof prompt.rules === "string" ? prompt.rules : "",
    knowledge: typeof prompt.knowledge === "string" ? prompt.knowledge : "",
    outputFormat: typeof prompt.outputFormat === "string" ? prompt.outputFormat : "",
    examples: typeof prompt.examples === "string" ? prompt.examples : "",
    avoid: typeof prompt.avoid === "string" ? prompt.avoid : "",
  };

  return {
    name: typeof rawAgent.name === "string" ? rawAgent.name : "",
    title:
      typeof rawAgent.title === "string"
        ? rawAgent.title
        : typeof identity.role === "string"
        ? identity.role
        : "",
    slug:
      typeof rawAgent.slug === "string" && rawAgent.slug.trim().length > 0
        ? rawAgent.slug
        : slugify(typeof rawAgent.name === "string" ? rawAgent.name : "agent"),
    avatar: typeof rawAgent.avatar === "string" ? rawAgent.avatar : "",
    version: typeof rawAgent.version === "string" ? rawAgent.version : "1.0.0",
    status: typeof rawAgent.status === "string" ? rawAgent.status : "active",
    visibility:
      rawAgent.visibility === "private" || rawAgent.visibility === "public"
        ? rawAgent.visibility
        : "internal",
    provider: typeof rawAgent.provider === "string" ? rawAgent.provider : "openai",
    model: typeof rawAgent.model === "string" ? rawAgent.model : "gpt-5",
    temperature: toNumber(rawAgent.temperature, 0.7),
    maxTokens: toNumber(rawAgent.max_tokens, 4000),
    reasoning:
      rawAgent.reasoning === "low" || rawAgent.reasoning === "high"
        ? rawAgent.reasoning
        : "medium",
    responseFormat:
      rawAgent.response_format === "JSON" ||
      rawAgent.response_format === "HTML" ||
      rawAgent.response_format === "Plain Text"
        ? rawAgent.response_format
        : "Markdown",
    personalityPreset:
      typeof rawAgent.personality_preset === "string"
        ? rawAgent.personality_preset
        : "analyst",
    settings: {
      identity: {
        ...DEFAULT_SETTINGS.identity,
        internalName:
          typeof identity.internalName === "string" ? identity.internalName : "",
        bannerImage:
          typeof identity.bannerImage === "string" ? identity.bannerImage : "",
        role: typeof identity.role === "string" ? identity.role : "",
        department:
          typeof identity.department === "string"
            ? identity.department
            : typeof rawAgent.category === "string"
            ? rawAgent.category
            : "",
        shortDescription:
          typeof identity.shortDescription === "string"
            ? identity.shortDescription
            : typeof rawAgent.description === "string"
            ? rawAgent.description
            : "",
        biography: typeof identity.biography === "string" ? identity.biography : "",
      },
      ai: {
        ...DEFAULT_SETTINGS.ai,
        topP: toNumber(ai.topP, 1),
        creativity: toNumber(ai.creativity, 60),
        responseLength:
          typeof ai.responseLength === "string" ? ai.responseLength : "balanced",
        language: typeof ai.language === "string" ? ai.language : "English",
        timezone: typeof ai.timezone === "string" ? ai.timezone : "UTC",
      },
      personality: {
        ...DEFAULT_SETTINGS.personality,
        tone: typeof personality.tone === "string" ? personality.tone : "Professional",
        communicationStyle: toStringArray(
          personality.communicationStyle,
          DEFAULT_SETTINGS.personality.communicationStyle
        ),
        confidence: toNumber(personality.confidence, 75),
        humor: toNumber(personality.humor, 10),
        emojiUsage:
          typeof personality.emojiUsage === "string" ? personality.emojiUsage : "none",
        greetingStyle:
          typeof personality.greetingStyle === "string"
            ? personality.greetingStyle
            : "Direct",
        signature: typeof personality.signature === "string" ? personality.signature : "",
        catchphrase:
          typeof personality.catchphrase === "string" ? personality.catchphrase : "",
      },
      prompt: promptSections,
      permissions: {
        ...DEFAULT_SETTINGS.permissions,
        ...Object.fromEntries(
          Object.entries(permissions).map(([key, value]) => [key, Boolean(value)])
        ),
      },
      memory: {
        ...DEFAULT_SETTINGS.memory,
        rememberConversations: Boolean(memory.rememberConversations ?? true),
        rememberProjects: Boolean(memory.rememberProjects ?? true),
        rememberClients: Boolean(memory.rememberClients ?? false),
        rememberPreferences: Boolean(memory.rememberPreferences ?? true),
        maximumMemory: toNumber(memory.maximumMemory, 500),
        vectorSearch: Boolean(memory.vectorSearch ?? false),
        knowledgeBase:
          typeof memory.knowledgeBase === "string" ? memory.knowledgeBase : "default",
      },
      knowledge: normalizeKnowledgeSources(rawSettings.knowledge),
      workflow: {
        ...DEFAULT_SETTINGS.workflow,
        canDelegate: Boolean(workflow.canDelegate ?? false),
        canCallOtherAgents: Boolean(workflow.canCallOtherAgents ?? false),
        canExecuteAutomatically: Boolean(workflow.canExecuteAutomatically ?? false),
        needsApproval: Boolean(workflow.needsApproval ?? true),
        maxIterations: toNumber(workflow.maxIterations, 4),
        timeoutSeconds: toNumber(workflow.timeoutSeconds, 120),
        retryCount: toNumber(workflow.retryCount, 2),
      },
      collaboration: {
        allowedAgentIds: toStringArray(collaboration.allowedAgentIds),
      },
      limits: {
        ...DEFAULT_SETTINGS.limits,
        dailyRequests: toNumber(limits.dailyRequests, 100),
        monthlyBudget: toNumber(limits.monthlyBudget, 250),
        maxTokens: toNumber(limits.maxTokens, 8000),
        maxApiCalls: toNumber(limits.maxApiCalls, 50),
        maxImages: toNumber(limits.maxImages, 10),
        maxBrowserSessions: toNumber(limits.maxBrowserSessions, 4),
      },
      theme: {
        ...DEFAULT_SETTINGS.theme,
        accentColor:
          typeof theme.accentColor === "string" ? theme.accentColor : "#22d3ee",
        background: typeof theme.background === "string" ? theme.background : "Aurora",
        theme: typeof theme.theme === "string" ? theme.theme : "Neon",
        particleEffect:
          typeof theme.particleEffect === "string" ? theme.particleEffect : "Pulse Grid",
        avatarAnimation:
          typeof theme.avatarAnimation === "string" ? theme.avatarAnimation : "Float",
        voice: typeof theme.voice === "string" ? theme.voice : "Default",
      },
    },
    tools,
  };
}

function sectionCardClass() {
  return "rounded-2xl border border-white/10 bg-[#0a0d12]/92 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm";
}

function fieldClass() {
  return "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-black/40";
}

function textareaClass() {
  return "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-black/40";
}

function labelClass() {
  return "text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500";
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
        checked
          ? "border-cyan-400/60 bg-cyan-500/10"
          : "border-white/10 bg-black/20 hover:border-white/20"
      }`}
    >
      <div>
        <div className="text-sm font-medium leading-tight text-white">{label}</div>
        {description ? <div className="mt-1 text-xs text-zinc-500">{description}</div> : null}
      </div>
      <div
        className={`h-5 w-10 rounded-full border transition ${
          checked ? "border-cyan-300 bg-cyan-400/20" : "border-white/10 bg-white/5"
        }`}
      >
        <div
          className={`mt-[2px] h-3.5 w-3.5 rounded-full bg-white transition ${
            checked ? "translate-x-[20px]" : "translate-x-[2px]"
          }`}
        />
      </div>
    </button>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-1.5 text-xl font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-xs text-zinc-500">{helper}</div> : null}
    </div>
  );
}

export default function EditAgentPage({
  mode = "page",
}: {
  mode?: "page" | "embedded";
}) {
  const params = useParams<{ id: string }>();
  const agentId = params?.id;
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentFormState | null>(null);
  const [peerAgents, setPeerAgents] = useState<PeerAgent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<ChatMessage[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (!agentId) {
      setLoadError("Agent ID is missing from the URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadEditor() {
      try {
        setLoading(true);
        setLoadError(null);

        const [detailRes, toolsRes, agentsRes] = await Promise.all([
          fetch(`/api/v1/agents/${agentId}`, { cache: "no-store" }),
          fetch(`/api/v1/agents/${agentId}/tools`, { cache: "no-store" }),
          fetch("/api/v1/agents", { cache: "no-store" }),
        ]);

        const detailJson = await detailRes.json();
        const toolsJson = await toolsRes.json();
        const agentsJson = await agentsRes.json();

        if (!detailRes.ok || !detailJson?.success || !detailJson?.agent) {
          throw new Error(detailJson?.error ?? "Unable to load agent settings.");
        }

        const normalizedTools = normalizeTools(toolsJson?.tools);
        const nextAgent = normalizeSettings(detailJson.agent as Record<string, unknown>, normalizedTools);

        if (!cancelled) {
          setAgent(nextAgent);
          setStats(detailJson.stats ?? null);
          setRecentRuns(Array.isArray(detailJson.recent_runs) ? detailJson.recent_runs : []);
          setPeerAgents(
            Array.isArray(agentsJson?.agents)
              ? agentsJson.agents
                  .filter((item: unknown) => isRecord(item) && item.id !== agentId)
                  .map((item) => ({
                    id: String(item.id),
                    name: typeof item.name === "string" ? item.name : "Unnamed Agent",
                    category: typeof item.category === "string" ? item.category : null,
                  }))
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load agent settings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEditor();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const enabledTools = useMemo(
    () => agent?.tools.filter((tool) => tool.enabled) ?? [],
    [agent?.tools]
  );

  const groupedTools = useMemo(() => {
    return (agent?.tools ?? []).reduce<Record<string, AgentTool[]>>((groups, tool) => {
      const category = tool.category || "General";
      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(tool);
      return groups;
    }, {});
  }, [agent?.tools]);

  const systemPromptPreview = useMemo(() => {
    return agent ? buildSystemPrompt(agent.settings.prompt) : "";
  }, [agent]);

  function updateAgent(patch: Partial<AgentFormState>) {
    setAgent((current) => (current ? { ...current, ...patch } : current));
  }

  function updateSettings<K extends keyof AgentSettings>(
    key: K,
    patch: Partial<AgentSettings[K]>
  ) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          [key]: {
            ...current.settings[key],
            ...patch,
          },
        },
      };
    });
  }

  function updatePrompt(patch: Partial<PromptSettings>) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          prompt: {
            ...current.settings.prompt,
            ...patch,
          },
        },
      };
    });
  }

  function toggleCommunicationStyle(style: string) {
    setAgent((current) => {
      if (!current) return current;

      const styles = current.settings.personality.communicationStyle;
      const exists = styles.includes(style);

      return {
        ...current,
        settings: {
          ...current.settings,
          personality: {
            ...current.settings.personality,
            communicationStyle: exists
              ? styles.filter((item) => item !== style)
              : [...styles, style],
          },
        },
      };
    });
  }

  function updatePermission(key: string, next: boolean) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          permissions: {
            ...current.settings.permissions,
            [key]: next,
          },
        },
      };
    });
  }

  function toggleTool(toolId: string) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        tools: current.tools.map((tool) =>
          tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
        ),
      };
    });
  }

  function updateToolConfiguration(toolId: string, configurationText: string) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        tools: current.tools.map((tool) =>
          tool.id === toolId ? { ...tool, configurationText } : tool
        ),
      };
    });
  }

  function addKnowledgeSource() {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          knowledge: [
            ...current.settings.knowledge,
            {
              id: `knowledge-${crypto.randomUUID()}`,
              type: "Website",
              name: "",
              value: "",
            },
          ],
        },
      };
    });
  }

  function updateKnowledgeSource(
    id: string,
    patch: Partial<KnowledgeSource>
  ) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          knowledge: current.settings.knowledge.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        },
      };
    });
  }

  function removeKnowledgeSource(id: string) {
    setAgent((current) => {
      if (!current) return current;

      return {
        ...current,
        settings: {
          ...current.settings,
          knowledge: current.settings.knowledge.filter((item) => item.id !== id),
        },
      };
    });
  }

  function toggleAllowedAgent(peerId: string) {
    setAgent((current) => {
      if (!current) return current;

      const currentIds = current.settings.collaboration.allowedAgentIds;
      const exists = currentIds.includes(peerId);

      return {
        ...current,
        settings: {
          ...current.settings,
          collaboration: {
            allowedAgentIds: exists
              ? currentIds.filter((id) => id !== peerId)
              : [...currentIds, peerId],
          },
        },
      };
    });
  }

  function scrollToSection(sectionId: string) {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function saveAgent() {
    if (!agentId || !agent) {
      return false;
    }

    const trimmedName = agent.name.trim();

    if (!trimmedName) {
      setSaveError("Agent name is required before saving.");
      return false;
    }

    const parsedTools = [] as Array<{
      id: string;
      enabled: true;
      configuration: Record<string, unknown>;
    }>;

    try {
      for (const tool of enabledTools) {
        const parsed = tool.configurationText.trim().length
          ? JSON.parse(tool.configurationText)
          : {};

        if (!isRecord(parsed)) {
          throw new Error(`${tool.name} configuration must be a JSON object.`);
        }

        parsedTools.push({
          id: tool.id,
          enabled: true,
          configuration: parsed,
        });
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Invalid tool configuration JSON.");
      return false;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const payload = {
        name: trimmedName,
        title: agent.title.trim(),
        slug: agent.slug.trim() || slugify(trimmedName),
        avatar: agent.avatar.trim(),
        version: agent.version.trim() || "1.0.0",
        status: agent.status,
        visibility: agent.visibility,
        provider: agent.provider,
        model: agent.model,
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
        reasoning: agent.reasoning,
        response_format: agent.responseFormat,
        personality_preset: agent.personalityPreset,
        category: agent.settings.identity.department.trim(),
        description: agent.settings.identity.shortDescription.trim(),
        system_prompt: buildSystemPrompt(agent.settings.prompt),
        settings: agent.settings,
      };

      const [agentRes, toolsRes] = await Promise.all([
        fetch(`/api/v1/agents/${agentId}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch(`/api/v1/agents/${agentId}/tools`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tools: parsedTools }),
        }),
      ]);

      const agentJson = await agentRes.json();
      const toolsJson = await toolsRes.json();

      if (!agentRes.ok || !agentJson?.success) {
        throw new Error(agentJson?.message ?? "Failed to update agent settings.");
      }

      if (!toolsRes.ok || !toolsJson?.success) {
        throw new Error(toolsJson?.error ?? "Failed to update tool assignments.");
      }

      setAgent((current) =>
        current
          ? {
              ...current,
              slug: payload.slug,
              tools: normalizeTools(toolsJson.tools),
            }
          : current
      );
      setSaveSuccess(new Date().toLocaleTimeString());
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to update agent settings."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    if (!agentId || !agent || !testInput.trim()) {
      return;
    }

    const saved = await saveAgent();

    if (!saved) {
      return;
    }

    const nextMessages = [
      ...testMessages,
      { role: "user" as const, content: testInput.trim() },
    ];

    setTesting(true);
    setTestError(null);
    setTestMessages(nextMessages);
    setTestInput("");

    try {
      const start = performance.now();
      const res = await fetch("/api/v1/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: nextMessages,
        }),
      });

      const json = await res.json();
      const durationMs = Math.round(performance.now() - start);

      if (!res.ok || !json?.success || typeof json.reply !== "string") {
        throw new Error(json?.error ?? "Agent test failed.");
      }

      setTestMessages([
        ...nextMessages,
        { role: "assistant", content: json.reply },
      ]);
      setLastTestResult({ durationMs, at: new Date().toISOString() });
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "Agent test failed.");
      setTestMessages((current) => current.slice(0, -1));
      setTestInput(nextMessages[nextMessages.length - 1]?.content ?? "");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-zinc-400">Loading agent settings...</span>
      </div>
    );
  }

  if (loadError || !agent) {
    return (
      <div className="space-y-4 p-6 text-white">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError ?? "Agent not found."}
        </div>
        <Link href="/admin/agents">
          <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>
      </div>
    );
  }

  const isEmbedded = mode === "embedded";

  return (
    <div className={isEmbedded ? "text-white" : "min-h-screen bg-[#050505] px-3 py-4 text-white md:px-5"}>
      <div className={isEmbedded ? "space-y-4" : "mx-auto max-w-[1440px] space-y-4"}>
        <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#07090d] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div
            className="relative overflow-hidden border-b border-white/10"
            style={{
              background:
                agent.settings.identity.bannerImage.trim().length > 0
                  ? `linear-gradient(180deg, rgba(4,8,14,0.35), rgba(4,8,14,0.9)), url(${agent.settings.identity.bannerImage}) center/cover`
                  : "linear-gradient(180deg, rgba(10,12,18,0.96), rgba(6,8,12,1))",
            }}
          >
            <div className="flex flex-col w-full gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-[200px] w-auto items-center justify-center overflow-hidden border border-white/15">
                 
                    <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
              
                </div>

                <div className="p-4 w-full">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{agent.name || "Untitled Agent"}</h1>
                    <h2 className="text-xl tracking-tight text-cyan-400 md:text-2xl">{agent.title || "Untitled Agent"}</h2>
                    <p className="mt-1.5 max-w-3xl text-sm text-zinc-400">
                      Treat this agent like an operator in your AI agency: identity, brain, permissions, knowledge, workflow, and runtime limits are configured from one surface.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{agent.settings.identity.role || "No role"}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{agent.settings.identity.department || "No department"}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 capitalize">{agent.status}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{enabledTools.length} tools enabled</span>
                  </div>
                  <div className="flex mt-2 justify-end gap-1">
                    <Button
                      onClick={saveAgent}
                      disabled={saving}
                      className="h-9 bg-cyan-500 px-3 text-black hover:bg-cyan-400"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {(saveError || saveSuccess) && (
            <div className="border-b border-white/10 px-4 py-2.5 md:px-5">
              {saveError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {saveError}
                </div>
              ) : null}
              {!saveError && saveSuccess ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  Settings saved at {saveSuccess}.
                </div>
              ) : null}
            </div>
          )}

          <div className="grid gap-4 p-3 md:grid-cols-[200px_minmax(0,1fr)] md:p-4">
            <aside className="top-4 h-fit rounded-2xl border border-white/10 bg-[#0b0e14] p-2 md:sticky">
              <div className="mb-2 px-2.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Sections
              </div>
              <div className="space-y-1">
                {SECTION_NAV.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5 text-cyan-300" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-4">
              <section
                id="identity"
                ref={(node) => {
                  sectionRefs.current.identity = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className={labelClass()}>Identity</div>
                    <h2 className="mt-2 text-2xl font-semibold">Profile and positioning</h2>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Agent Name</label>
                    <input
                      value={agent.name}
                      onChange={(event) => updateAgent({ name: event.target.value })}
                      className={fieldClass()}
                      placeholder="Ignitia Research Lead"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Title</label>
                    <input
                      value={agent.title}
                      onChange={(event) => updateAgent({ title: event.target.value })}
                      className={fieldClass()}
                      placeholder="Agent Title"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Slug</label>
                    <input
                      value={agent.slug}
                      onChange={(event) => updateAgent({ slug: event.target.value })}
                      className={fieldClass()}
                      placeholder="ignitia-research-lead"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Version</label>
                    <input
                      value={agent.version}
                      onChange={(event) => updateAgent({ version: event.target.value })}
                      className={fieldClass()}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Avatar URL</label>
                    <input
                      value={agent.avatar}
                      onChange={(event) => updateAgent({ avatar: event.target.value })}
                      className={fieldClass()}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Banner Image URL</label>
                    <input
                      value={agent.settings.identity.bannerImage}
                      onChange={(event) => updateSettings("identity", { bannerImage: event.target.value })}
                      className={fieldClass()}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Role</label>
                    <input
                      value={agent.settings.identity.role}
                      onChange={(event) => updateSettings("identity", { role: event.target.value })}
                      className={fieldClass()}
                      placeholder="Strategy Director"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Department</label>
                    <input
                      value={agent.settings.identity.department}
                      onChange={(event) => updateSettings("identity", { department: event.target.value })}
                      className={fieldClass()}
                      placeholder="Research"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Status</label>
                    <select
                      value={agent.status}
                      onChange={(event) => updateAgent({ status: event.target.value })}
                      className={fieldClass()}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Visibility</label>
                    <select
                      value={agent.visibility}
                      onChange={(event) => updateAgent({ visibility: event.target.value as Visibility })}
                      className={fieldClass()}
                    >
                      <option value="private">Hidden</option>
                      <option value="internal">Internal</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Short Description</label>
                    <textarea
                      rows={4}
                      value={agent.settings.identity.shortDescription}
                      onChange={(event) => updateSettings("identity", { shortDescription: event.target.value })}
                      className={textareaClass()}
                      placeholder="What this agent does in one sharp paragraph."
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Biography</label>
                    <textarea
                      rows={4}
                      value={agent.settings.identity.biography}
                      onChange={(event) => updateSettings("identity", { biography: event.target.value })}
                      className={textareaClass()}
                      placeholder="Internal narrative, working style, and context for the team."
                    />
                  </div>
                </div>
              </section>

              <section
                id="ai"
                ref={(node) => {
                  sectionRefs.current.ai = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>AI Configuration</div>
                  <h2 className="mt-2 text-2xl font-semibold">Model behavior and generation controls</h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className={labelClass()}>LLM Provider</label>
                    <select
                      value={agent.provider}
                      onChange={(event) => {
                        const nextProvider = event.target.value;
                        const nextModel = PROVIDERS[nextProvider as keyof typeof PROVIDERS]?.[0] ?? agent.model;
                        updateAgent({ provider: nextProvider, model: nextModel });
                      }}
                      className={fieldClass()}
                    >
                      {Object.keys(PROVIDERS).map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Model</label>
                    <select
                      value={agent.model}
                      onChange={(event) => updateAgent({ model: event.target.value })}
                      className={fieldClass()}
                    >
                      {(PROVIDERS[agent.provider as keyof typeof PROVIDERS] ?? [agent.model]).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Reasoning Level</label>
                    <select
                      value={agent.reasoning}
                      onChange={(event) => updateAgent({ reasoning: event.target.value as Reasoning })}
                      className={fieldClass()}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Temperature</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={agent.temperature}
                      onChange={(event) => updateAgent({ temperature: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Top P</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={agent.settings.ai.topP}
                      onChange={(event) => updateSettings("ai", { topP: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Max Tokens</label>
                    <input
                      type="number"
                      min="256"
                      step="256"
                      value={agent.maxTokens}
                      onChange={(event) => updateAgent({ maxTokens: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Creativity</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={agent.settings.ai.creativity}
                      onChange={(event) => updateSettings("ai", { creativity: Number(event.target.value) })}
                      className="mt-4 w-full accent-cyan-400"
                    />
                    <div className="mt-2 text-xs text-zinc-500">{agent.settings.ai.creativity}%</div>
                  </div>
                  <div>
                    <label className={labelClass()}>Response Length</label>
                    <select
                      value={agent.settings.ai.responseLength}
                      onChange={(event) => updateSettings("ai", { responseLength: event.target.value })}
                      className={fieldClass()}
                    >
                      <option value="short">Short</option>
                      <option value="balanced">Balanced</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Response Format</label>
                    <select
                      value={agent.responseFormat}
                      onChange={(event) => updateAgent({ responseFormat: event.target.value as ResponseFormat })}
                      className={fieldClass()}
                    >
                      <option value="Markdown">Markdown</option>
                      <option value="JSON">JSON</option>
                      <option value="HTML">HTML</option>
                      <option value="Plain Text">Plain Text</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Language</label>
                    <input
                      value={agent.settings.ai.language}
                      onChange={(event) => updateSettings("ai", { language: event.target.value })}
                      className={fieldClass()}
                      placeholder="English"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Timezone</label>
                    <input
                      value={agent.settings.ai.timezone}
                      onChange={(event) => updateSettings("ai", { timezone: event.target.value })}
                      className={fieldClass()}
                      placeholder="America/Montevideo"
                    />
                  </div>
                </div>
              </section>

              <section
                id="personality"
                ref={(node) => {
                  sectionRefs.current.personality = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Personality</div>
                  <h2 className="mt-2 text-2xl font-semibold">Tone, confidence, and communication profile</h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Tone</label>
                    <input
                      value={agent.settings.personality.tone}
                      onChange={(event) => updateSettings("personality", { tone: event.target.value })}
                      className={fieldClass()}
                      placeholder="Executive"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Greeting Style</label>
                    <input
                      value={agent.settings.personality.greetingStyle}
                      onChange={(event) => updateSettings("personality", { greetingStyle: event.target.value })}
                      className={fieldClass()}
                      placeholder="Direct"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className={labelClass()}>Communication Style</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COMMUNICATION_STYLES.map((style) => {
                      const active = agent.settings.personality.communicationStyle.includes(style);

                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleCommunicationStyle(style)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            active
                              ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                              : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/20"
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className={labelClass()}>Confidence</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={agent.settings.personality.confidence}
                      onChange={(event) => updateSettings("personality", { confidence: Number(event.target.value) })}
                      className="mt-4 w-full accent-cyan-400"
                    />
                    <div className="mt-2 text-xs text-zinc-500">{agent.settings.personality.confidence}%</div>
                  </div>
                  <div>
                    <label className={labelClass()}>Humor</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={agent.settings.personality.humor}
                      onChange={(event) => updateSettings("personality", { humor: Number(event.target.value) })}
                      className="mt-4 w-full accent-cyan-400"
                    />
                    <div className="mt-2 text-xs text-zinc-500">{agent.settings.personality.humor}%</div>
                  </div>
                  <div>
                    <label className={labelClass()}>Emoji Usage</label>
                    <select
                      value={agent.settings.personality.emojiUsage}
                      onChange={(event) => updateSettings("personality", { emojiUsage: event.target.value })}
                      className={fieldClass()}
                    >
                      <option value="none">None</option>
                      <option value="light">Light</option>
                      <option value="frequent">Frequent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Signature</label>
                    <input
                      value={agent.settings.personality.signature}
                      onChange={(event) => updateSettings("personality", { signature: event.target.value })}
                      className={fieldClass()}
                      placeholder="Ignitia Strategy Office"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Catchphrase</label>
                    <input
                      value={agent.settings.personality.catchphrase}
                      onChange={(event) => updateSettings("personality", { catchphrase: event.target.value })}
                      className={fieldClass()}
                      placeholder="Precision before speed."
                    />
                  </div>
                </div>
              </section>

              <section
                id="prompt"
                ref={(node) => {
                  sectionRefs.current.prompt = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className={labelClass()}>System Prompt</div>
                    <h2 className="mt-2 text-2xl font-semibold">Core instructions and operating rules</h2>
                  </div>
                  <ToggleRow
                    label="Use raw prompt editor"
                    description="Keep a single large prompt instead of structured fields."
                    checked={agent.settings.prompt.useRawPrompt}
                    onChange={(next) => updatePrompt({ useRawPrompt: next })}
                  />
                </div>

                {agent.settings.prompt.useRawPrompt ? (
                  <div>
                    <label className={labelClass()}>Raw System Prompt</label>
                    <textarea
                      rows={12}
                      value={agent.settings.prompt.rawPrompt}
                      onChange={(event) => updatePrompt({ rawPrompt: event.target.value })}
                      className={textareaClass()}
                      placeholder="Define the full operating prompt for this agent."
                    />
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {[
                      ["Role", "role"],
                      ["Mission", "mission"],
                      ["Rules", "rules"],
                      ["Knowledge", "knowledge"],
                      ["Output Format", "outputFormat"],
                      ["Examples", "examples"],
                      ["Do Not", "avoid"],
                    ].map(([label, key]) => (
                      <div key={key} className={key === "rules" || key === "examples" ? "lg:col-span-2" : ""}>
                        <label className={labelClass()}>{label}</label>
                        <textarea
                          rows={key === "rules" || key === "examples" ? 5 : 4}
                          value={agent.settings.prompt[key as keyof PromptSettings] as string}
                          onChange={(event) => updatePrompt({ [key]: event.target.value } as Partial<PromptSettings>)}
                          className={textareaClass()}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className={labelClass()}>Compiled Prompt Preview</div>
                  <pre className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{systemPromptPreview || "No prompt content yet."}</pre>
                </div>
              </section>

              <section
                id="tools"
                ref={(node) => {
                  sectionRefs.current.tools = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className={labelClass()}>Tool Permissions</div>
                    <h2 className="mt-2 text-2xl font-semibold">Enable capabilities and tune per-tool JSON</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-400">
                    {enabledTools.length} enabled
                  </div>
                </div>

                <div className="space-y-5">
                  {Object.entries(groupedTools).map(([category, tools]) => (
                    <div key={category} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 text-sm font-semibold text-white">{category}</div>
                      <div className="space-y-3">
                        {tools.map((tool) => (
                          <div key={tool.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <div className="text-sm font-semibold text-white">{tool.name}</div>
                                <div className="mt-1 text-xs text-zinc-500">{tool.description || tool.slug}</div>
                              </div>
                              <ToggleRow
                                label={tool.enabled ? "Enabled" : "Disabled"}
                                checked={tool.enabled}
                                onChange={() => toggleTool(tool.id)}
                              />
                            </div>
                            {tool.enabled ? (
                              <div className="mt-4">
                                <label className={labelClass()}>Configuration JSON</label>
                                <textarea
                                  rows={5}
                                  value={tool.configurationText}
                                  onChange={(event) => updateToolConfiguration(tool.id, event.target.value)}
                                  className={`${textareaClass()} font-mono text-xs`}
                                />
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="permissions"
                ref={(node) => {
                  sectionRefs.current.permissions = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Permissions</div>
                  <h2 className="mt-2 text-2xl font-semibold">Operational boundaries and explicit access</h2>
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 text-sm font-semibold text-white">{group.title}</div>
                      <div className="space-y-3">
                        {group.items.map(([key, label]) => (
                          <ToggleRow
                            key={key}
                            label={label}
                            checked={Boolean(agent.settings.permissions[key])}
                            onChange={(next) => updatePermission(key, next)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="memory"
                ref={(node) => {
                  sectionRefs.current.memory = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Memory</div>
                  <h2 className="mt-2 text-2xl font-semibold">Retention policy and knowledge behavior</h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  <ToggleRow
                    label="Remember conversations"
                    checked={agent.settings.memory.rememberConversations}
                    onChange={(next) => updateSettings("memory", { rememberConversations: next })}
                  />
                  <ToggleRow
                    label="Remember projects"
                    checked={agent.settings.memory.rememberProjects}
                    onChange={(next) => updateSettings("memory", { rememberProjects: next })}
                  />
                  <ToggleRow
                    label="Remember clients"
                    checked={agent.settings.memory.rememberClients}
                    onChange={(next) => updateSettings("memory", { rememberClients: next })}
                  />
                  <ToggleRow
                    label="Remember preferences"
                    checked={agent.settings.memory.rememberPreferences}
                    onChange={(next) => updateSettings("memory", { rememberPreferences: next })}
                  />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className={labelClass()}>Maximum Memory</label>
                    <input
                      type="number"
                      min="0"
                      value={agent.settings.memory.maximumMemory}
                      onChange={(event) => updateSettings("memory", { maximumMemory: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Knowledge Base</label>
                    <input
                      value={agent.settings.memory.knowledgeBase}
                      onChange={(event) => updateSettings("memory", { knowledgeBase: event.target.value })}
                      className={fieldClass()}
                      placeholder="ignitia-default"
                    />
                  </div>
                  <div className="pt-6">
                    <ToggleRow
                      label="Vector Search"
                      checked={agent.settings.memory.vectorSearch}
                      onChange={(next) => updateSettings("memory", { vectorSearch: next })}
                    />
                  </div>
                </div>
              </section>

              <section
                id="knowledge"
                ref={(node) => {
                  sectionRefs.current.knowledge = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className={labelClass()}>Knowledge Sources</div>
                    <h2 className="mt-2 text-2xl font-semibold">Attach documents, URLs, and internal systems</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-black/20 text-white hover:bg-white/10"
                    onClick={addKnowledgeSource}
                  >
                    Add Source
                  </Button>
                </div>

                <div className="space-y-4">
                  {agent.settings.knowledge.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-6 text-sm text-zinc-500">
                      No knowledge sources attached yet.
                    </div>
                  ) : null}

                  {agent.settings.knowledge.map((source) => (
                    <div key={source.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[180px_1fr_1fr_100px]">
                      <select
                        value={source.type}
                        onChange={(event) => updateKnowledgeSource(source.id, { type: event.target.value })}
                        className={fieldClass()}
                      >
                        {KNOWLEDGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <input
                        value={source.name}
                        onChange={(event) => updateKnowledgeSource(source.id, { name: event.target.value })}
                        className={fieldClass()}
                        placeholder="Source label"
                      />
                      <input
                        value={source.value}
                        onChange={(event) => updateKnowledgeSource(source.id, { value: event.target.value })}
                        className={fieldClass()}
                        placeholder="URL, path, repo, or identifier"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                        onClick={() => removeKnowledgeSource(source.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="workflow"
                ref={(node) => {
                  sectionRefs.current.workflow = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Workflow</div>
                  <h2 className="mt-2 text-2xl font-semibold">Delegation, approvals, and execution safeguards</h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  <ToggleRow
                    label="Can delegate"
                    checked={agent.settings.workflow.canDelegate}
                    onChange={(next) => updateSettings("workflow", { canDelegate: next })}
                  />
                  <ToggleRow
                    label="Can call other agents"
                    checked={agent.settings.workflow.canCallOtherAgents}
                    onChange={(next) => updateSettings("workflow", { canCallOtherAgents: next })}
                  />
                  <ToggleRow
                    label="Can execute automatically"
                    checked={agent.settings.workflow.canExecuteAutomatically}
                    onChange={(next) => updateSettings("workflow", { canExecuteAutomatically: next })}
                  />
                  <ToggleRow
                    label="Needs approval"
                    checked={agent.settings.workflow.needsApproval}
                    onChange={(next) => updateSettings("workflow", { needsApproval: next })}
                  />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className={labelClass()}>Max Iterations</label>
                    <input
                      type="number"
                      min="1"
                      value={agent.settings.workflow.maxIterations}
                      onChange={(event) => updateSettings("workflow", { maxIterations: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Timeout (seconds)</label>
                    <input
                      type="number"
                      min="10"
                      value={agent.settings.workflow.timeoutSeconds}
                      onChange={(event) => updateSettings("workflow", { timeoutSeconds: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Retry Count</label>
                    <input
                      type="number"
                      min="0"
                      value={agent.settings.workflow.retryCount}
                      onChange={(event) => updateSettings("workflow", { retryCount: Number(event.target.value) })}
                      className={fieldClass()}
                    />
                  </div>
                </div>
              </section>

              <section
                id="collaboration"
                ref={(node) => {
                  sectionRefs.current.collaboration = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Collaboration</div>
                  <h2 className="mt-2 text-2xl font-semibold">Choose which peer agents this operator can involve</h2>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {peerAgents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-6 text-sm text-zinc-500">
                      No peer agents available yet.
                    </div>
                  ) : null}
                  {peerAgents.map((peer) => {
                    const enabled = agent.settings.collaboration.allowedAgentIds.includes(peer.id);

                    return (
                      <button
                        key={peer.id}
                        type="button"
                        onClick={() => toggleAllowedAgent(peer.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          enabled
                            ? "border-cyan-400/60 bg-cyan-500/10"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">{peer.name}</div>
                          {enabled ? <CheckCircle2 className="h-4 w-4 text-cyan-300" /> : null}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">{peer.category || "General"}</div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                id="limits"
                ref={(node) => {
                  sectionRefs.current.limits = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Limits</div>
                  <h2 className="mt-2 text-2xl font-semibold">Budgets, throughput, and browser ceilings</h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["dailyRequests", "Daily Requests"],
                    ["monthlyBudget", "Monthly Budget"],
                    ["maxTokens", "Max Tokens"],
                    ["maxApiCalls", "Max API Calls"],
                    ["maxImages", "Max Images"],
                    ["maxBrowserSessions", "Max Browser Sessions"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className={labelClass()}>{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={agent.settings.limits[key as keyof AgentSettings["limits"]]}
                        onChange={(event) =>
                          updateSettings("limits", {
                            [key]: Number(event.target.value),
                          } as Partial<AgentSettings["limits"]>)
                        }
                        className={fieldClass()}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="theme"
                ref={(node) => {
                  sectionRefs.current.theme = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Visual Theme</div>
                  <h2 className="mt-2 text-2xl font-semibold">Character styling for the operator profile</h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className={labelClass()}>Accent Color</label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="color"
                        value={agent.settings.theme.accentColor}
                        onChange={(event) => updateSettings("theme", { accentColor: event.target.value })}
                        className="h-12 w-16 rounded-xl border border-white/10 bg-black/30"
                      />
                      <input
                        value={agent.settings.theme.accentColor}
                        onChange={(event) => updateSettings("theme", { accentColor: event.target.value })}
                        className={fieldClass()}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass()}>Background</label>
                    <input
                      value={agent.settings.theme.background}
                      onChange={(event) => updateSettings("theme", { background: event.target.value })}
                      className={fieldClass()}
                      placeholder="Aurora"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Theme</label>
                    <input
                      value={agent.settings.theme.theme}
                      onChange={(event) => updateSettings("theme", { theme: event.target.value })}
                      className={fieldClass()}
                      placeholder="Neon"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Particle Effect</label>
                    <input
                      value={agent.settings.theme.particleEffect}
                      onChange={(event) => updateSettings("theme", { particleEffect: event.target.value })}
                      className={fieldClass()}
                      placeholder="Pulse Grid"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Avatar Animation</label>
                    <input
                      value={agent.settings.theme.avatarAnimation}
                      onChange={(event) => updateSettings("theme", { avatarAnimation: event.target.value })}
                      className={fieldClass()}
                      placeholder="Float"
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Voice</label>
                    <input
                      value={agent.settings.theme.voice}
                      onChange={(event) => updateSettings("theme", { voice: event.target.value })}
                      className={fieldClass()}
                      placeholder="Default"
                    />
                  </div>
                </div>
              </section>

              <section
                id="testing"
                ref={(node) => {
                  sectionRefs.current.testing = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Testing</div>
                  <h2 className="mt-2 text-2xl font-semibold">Embedded sandbox against the live agent chat endpoint</h2>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 text-sm font-semibold text-white">Ask this agent</div>
                    <div className="space-y-3">
                      <div className="max-h-[360px] space-y-3 overflow-auto rounded-2xl border border-white/10 bg-black/25 p-4">
                        {testMessages.length === 0 ? (
                          <div className="text-sm text-zinc-500">No test messages yet.</div>
                        ) : null}
                        {testMessages.map((message, index) => (
                          <div
                            key={`${message.role}-${index}`}
                            className={`rounded-2xl px-4 py-3 text-sm ${
                              message.role === "user"
                                ? "ml-auto max-w-[85%] bg-cyan-500/10 text-cyan-100"
                                : "max-w-[92%] bg-white/5 text-zinc-200"
                            }`}
                          >
                            <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                              {message.role}
                            </div>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        ))}
                      </div>

                      <textarea
                        rows={4}
                        value={testInput}
                        onChange={(event) => setTestInput(event.target.value)}
                        className={textareaClass()}
                        placeholder="Ask this agent to draft, analyze, or reason."
                      />

                      {testError ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                          {testError}
                        </div>
                      ) : null}

                      <div className="flex justify-end">
                        <Button
                          onClick={runTest}
                          disabled={testing || !testInput.trim()}
                          className="text-black"
                          style={{ backgroundColor: agent.settings.theme.accentColor }}
                        >
                          {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                          {testing ? "Running..." : "Run Test"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-white">Execution details</div>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <div>Prompt mode: {agent.settings.prompt.useRawPrompt ? "Raw" : "Structured"}</div>
                        <div>Enabled tools: {enabledTools.length}</div>
                        <div>Memory profile: {agent.settings.memory.knowledgeBase}</div>
                        <div>
                          Last run: {lastTestResult ? `${lastTestResult.durationMs} ms` : "No runs yet"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-white">Tool surface</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {enabledTools.length === 0 ? (
                          <span className="text-sm text-zinc-500">No enabled tools.</span>
                        ) : null}
                        {enabledTools.map((tool) => (
                          <span key={tool.id} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-white">Prompt preview</div>
                      <pre className="mt-3 max-h-[220px] overflow-auto whitespace-pre-wrap text-xs text-zinc-400">
                        {systemPromptPreview || "No prompt configured yet."}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="statistics"
                ref={(node) => {
                  sectionRefs.current.statistics = node;
                }}
                className={sectionCardClass(agent.settings.theme.accentColor)}
              >
                <div className="mb-6">
                  <div className={labelClass()}>Statistics</div>
                  <h2 className="mt-2 text-2xl font-semibold">Operational signals and recent execution history</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Jobs Completed" value={String(stats?.total_runs ?? 0)} />
                  <StatCard
                    label="Success Rate"
                    value={
                      stats && stats.total_runs > 0
                        ? `${Math.round((stats.success_runs / stats.total_runs) * 100)}%`
                        : "0%"
                    }
                  />
                  <StatCard label="Average Time" value={`${stats?.avg_duration ?? 0} ms`} />
                  <StatCard label="Total Cost" value={`$${Number(stats?.total_cost ?? 0).toFixed(2)}`} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 text-sm font-semibold text-white">Recent Logs</div>
                  <div className="space-y-3">
                    {recentRuns.length === 0 ? (
                      <div className="text-sm text-zinc-500">No recent runs recorded.</div>
                    ) : null}
                    {recentRuns.slice(0, 8).map((run, index) => (
                      <div key={`${run.created_at ?? index}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 md:grid-cols-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Status</div>
                          <div className="mt-1 text-sm capitalize text-white">{run.status ?? "unknown"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Created</div>
                          <div className="mt-1 text-sm text-white">{run.created_at ? new Date(run.created_at).toLocaleString() : "-"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Duration</div>
                          <div className="mt-1 text-sm text-white">{run.duration_ms ?? 0} ms</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Tokens / Cost</div>
                          <div className="mt-1 text-sm text-white">
                            {(run.total_tokens ?? 0).toLocaleString()} / ${Number(run.total_cost ?? 0).toFixed(3)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
