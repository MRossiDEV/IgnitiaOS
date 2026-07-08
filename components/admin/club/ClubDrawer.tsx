"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CheckCheck, Loader2, Search, Send, Sparkles } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar: string | null;
  status: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function createAssistantGreeting(agent: Agent): ChatMessage {
  return {
    id: `welcome-${agent.id}`,
    role: "assistant",
    content: `Hi, I am ${agent.name}${
      agent.category ? ` (${agent.category})` : ""
    }. Send me your request and I will work only as this agent.`,
    createdAt: new Date().toISOString(),
  };
}

function formatClock(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ClubDrawer() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? agents[0] ?? null,
    [agents, selectedAgentId]
  );

  const visibleAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return agents;
    }

    return agents.filter((agent) => {
      const haystack = `${agent.name} ${agent.category ?? ""} ${agent.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [agents, query]);

  const selectedMessages = useMemo(() => {
    if (!selectedAgent) {
      return [];
    }

    return conversations[selectedAgent.id] ?? [createAssistantGreeting(selectedAgent)];
  }, [conversations, selectedAgent]);

  useEffect(() => {
    void loadAgents();
  }, []);

  useEffect(() => {
    if (!selectedAgent) {
      return;
    }

    setConversations((current) => {
      if (current[selectedAgent.id]) {
        return current;
      }

      return {
        ...current,
        [selectedAgent.id]: [createAssistantGreeting(selectedAgent)],
      };
    });
  }, [selectedAgent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages, sending]);

  async function loadAgents() {
    try {
      setLoadingAgents(true);
      setAgentsError(null);

      const response = await fetch("/api/v1/agents", {
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? payload?.error ?? "Failed to load agents");
      }

      const loadedAgents: Agent[] = Array.isArray(payload?.agents) ? payload.agents : [];

      setAgents(loadedAgents);

      if (loadedAgents.length > 0) {
        setSelectedAgentId((current) => current ?? loadedAgents[0].id);
      }
    } catch (error) {
      console.error(error);
      setAgentsError(error instanceof Error ? error.message : "Failed to load agents");
    } finally {
      setLoadingAgents(false);
    }
  }

  async function sendMessage() {
    const content = draft.trim();

    if (!content || !selectedAgent || sending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const currentConversation = conversations[selectedAgent.id] ?? [
      createAssistantGreeting(selectedAgent),
    ];

    const nextConversation = [...currentConversation, userMessage];

    setConversations((current) => ({
      ...current,
      [selectedAgent.id]: nextConversation,
    }));

    setDraft("");
    setSending(true);

    try {
      const response = await fetch("/api/v1/agents/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          messages: nextConversation.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? payload?.message ?? "Chat request failed");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: payload?.reply ?? "No response generated.",
        createdAt: new Date().toISOString(),
      };

      setConversations((current) => ({
        ...current,
        [selectedAgent.id]: [...(current[selectedAgent.id] ?? []), assistantMessage],
      }));
    } catch (error) {
      console.error(error);

      const failureMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Request failed: ${error.message}`
            : "Request failed. Please try again.",
        createdAt: new Date().toISOString(),
      };

      setConversations((current) => ({
        ...current,
        [selectedAgent.id]: [...(current[selectedAgent.id] ?? []), failureMessage],
      }));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#080c16] text-white">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">Agents Club</h2>
            <p className="text-[11px] text-zinc-400">Intra-platform conversations by agent</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Professional Mode
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents"
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[25%] min-w-[160px] border-r border-white/10 bg-[#0b1220]">
          <div className="h-full overflow-y-auto p-2">
            {loadingAgents ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : agentsError ? (
              <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                <p>{agentsError}</p>
                <button
                  onClick={loadAgents}
                  className="rounded-lg border border-red-400/40 px-2.5 py-1 font-medium hover:bg-red-500/10"
                >
                  Retry
                </button>
              </div>
            ) : visibleAgents.length === 0 ? (
              <p className="p-3 text-xs text-zinc-500">No agents found.</p>
            ) : (
              visibleAgents.map((agent) => {
                const latest = conversations[agent.id]?.at(-1);
                const isActive = selectedAgent?.id === agent.id;

                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`mb-1.5 w-full rounded-xl border p-2.5 text-left transition ${
                      isActive
                        ? "border-cyan-400/50 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                          <Bot className="h-4 w-4 text-cyan-300" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-semibold">{agent.name}</p>
                          <span className="text-[10px] text-zinc-500">
                            {latest ? formatClock(latest.createdAt) : ""}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-zinc-400">
                          {latest?.content ?? agent.description ?? "Start a conversation"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#0a101d]">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            {selectedAgent ? (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{selectedAgent.name}</p>
                  <p className="truncate text-[11px] text-zinc-400">
                    {selectedAgent.category ?? "General"} · {selectedAgent.status}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                  <CheckCheck className="h-3.5 w-3.5" />
                  online
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-400">Select an agent to start</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-3">
              {selectedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-sm bg-emerald-500 text-black"
                        : "rounded-bl-sm border border-white/10 bg-white/5 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        message.role === "user" ? "text-black/60" : "text-zinc-500"
                      }`}
                    >
                      {formatClock(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-white/10 p-2.5">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                disabled={!selectedAgent || sending}
                placeholder={selectedAgent ? `Message ${selectedAgent.name}` : "Select an agent"}
                className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
              />

              <button
                onClick={sendMessage}
                disabled={!selectedAgent || !draft.trim() || sending}
                className="rounded-xl bg-emerald-500 p-2.5 text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
