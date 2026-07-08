"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Tab = "chat" | "tasks" | "memory" | "prompts";

export default function AIChatDrawer({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello Mauricio. I am Ignitia AI. How can I help today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.reply || "No response returned",
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: `Error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function quickPrompt(text: string) {
    setInput(text);
    setTab("chat");
  }

  return (
    <div className="flex h-full flex-col bg-black text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Ignitia AI</h3>
          <p className="text-xs text-zinc-500">
            Control Center
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white"
        >
          Close
        </button>
      </div>

      {/* TABS (MAIN STRUCTURE SHIFT) */}
      <div className="flex border-b border-white/10">
        {(["chat", "tasks", "memory", "prompts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              flex-1 py-3 text-xs font-semibold uppercase tracking-wider
              transition
              ${
                tab === t
                  ? "bg-cyan-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden">

        {/* CHAT TAB */}
        {tab === "chat" && (
          <div className="flex flex-col h-full">

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[80%] bg-cyan-500 text-black p-4 rounded-2xl"
                      : "mr-auto max-w-[80%] bg-white/5 border border-white/10 p-4 rounded-2xl"
                  }
                >
                  {m.content}

                  {m.role === "assistant" && (
                    <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                      <button onClick={() => navigator.clipboard.writeText(m.content)}>
                        Copy
                      </button>
                      <button onClick={() => alert("Create Task")}>
                        Create Task
                      </button>
                      <button onClick={() => alert("Run Action")}>
                        Run Action
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[80%] bg-white/5 border border-white/10 p-4 rounded-2xl">
                  Thinking...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Ignitia AI..."
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none"
                />

                <button
                  onClick={sendMessage}
                  className="px-4 rounded-xl bg-cyan-500 text-black"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB (FULL PANEL) */}
        {tab === "tasks" && (
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            <h4 className="font-semibold">Active Tasks</h4>

            {[
              { title: "Landing Page Generated", status: "done" },
              { title: "Market Research Running", status: "running" },
              { title: "Proposal Created", status: "done" },
            ].map((t, i) => (
              <div
                key={i}
                className="border border-white/10 bg-white/5 p-3 rounded-xl"
              >
                {t.status === "done" ? "✓" : "⟳"} {t.title}
              </div>
            ))}
          </div>
        )}

        {/* MEMORY TAB (FULL KNOWLEDGE PANEL) */}
        {tab === "memory" && (
          <div className="p-4 space-y-4 overflow-y-auto h-full">

            <h4 className="font-semibold">Business Memory</h4>

            <div className="border border-white/10 bg-white/5 p-3 rounded-xl">
              <div className="font-semibold">Ignitia AI</div>
              Lead Generation • Landing Pages • AI Automation
            </div>

            <div className="border border-white/10 bg-white/5 p-3 rounded-xl">
              <div className="font-semibold">Markets</div>
              Uruguay • Argentina • Mexico • USA
            </div>

            <div className="border border-white/10 bg-white/5 p-3 rounded-xl">
              <div className="font-semibold">Capabilities</div>
              Funnels • Ads • OSINT • Sales Systems
            </div>
          </div>
        )}

        {/* PROMPTS TAB (NEW SYSTEM) */}
        {tab === "prompts" && (
          <div className="p-4 space-y-3 overflow-y-auto h-full">

            <h4 className="font-semibold">Prompt Library</h4>

            {[
              "Lead Generation System",
              "Cold Outreach Campaign",
              "Sales Proposal Generator",
              "SEO Audit",
              "Relocation Funnel",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => quickPrompt(p)}
                className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}