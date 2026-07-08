"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Bot, User, Plus, Trash2, Play, Pencil, X, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Tab = "chat" | "tasks" | "memory" | "prompts";

type TaskStatus = "queued" | "running" | "blocked" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "critical";

type AgentTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  execution_notes: string | null;
  last_run_at: string | null;
  last_run_result: string | null;
  created_at: string;
  updated_at: string;
};

type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  executionNotes: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STATUS_OPTIONS: TaskStatus[] = ["queued", "running", "blocked", "done", "cancelled"];
const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high", "critical"];

function toInputDate(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toDueAtIso(dateValue: string) {
  if (!dateValue.trim()) {
    return null;
  }

  return new Date(`${dateValue}T09:00:00.000Z`).toISOString();
}

function getStatusClass(status: TaskStatus) {
  if (status === "done") return "border-green-400/30 bg-green-500/10 text-green-300";
  if (status === "running") return "border-cyan-400/30 bg-cyan-500/10 text-cyan-300";
  if (status === "blocked") return "border-amber-400/30 bg-amber-500/10 text-amber-300";
  if (status === "cancelled") return "border-zinc-500/30 bg-zinc-600/10 text-zinc-300";
  return "border-violet-400/30 bg-violet-500/10 text-violet-300";
}

function getPriorityClass(priority: TaskPriority) {
  if (priority === "critical") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (priority === "high") return "border-orange-400/30 bg-orange-500/10 text-orange-300";
  if (priority === "medium") return "border-blue-400/30 bg-blue-500/10 text-blue-300";
  return "border-zinc-500/30 bg-zinc-600/10 text-zinc-300";
}

function getTaskDraftFromMessage(content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    return "";
  }

  const firstSentence = trimmed.split(/[\n.!?]/).find((segment) => segment.trim().length > 0);
  const rawTitle = (firstSentence ?? trimmed).trim();

  if (rawTitle.length <= 72) {
    return rawTitle;
  }

  return `${rawTitle.slice(0, 69)}...`;
}

function defaultTaskForm(): TaskFormState {
  return {
    title: "",
    description: "",
    status: "queued",
    priority: "medium",
    dueAt: "",
    executionNotes: "",
  };
}

export default function ChatPanel() {
  const params = useParams<{ id: string }>();
  const agentId = params?.id ?? "";

  const [agentName, setAgentName] = useState<string>("Agent");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<TaskFormState>(defaultTaskForm);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch agent name and seed greeting
  useEffect(() => {
    if (!agentId || !UUID_REGEX.test(agentId)) {
      setMessages([
        { role: "assistant", content: "Hi, I'm your assistant. How can I help you today?" },
      ]);
      return;
    }

    let cancelled = false;

    async function loadAgent() {
      try {
        const response = await fetch(`/api/v1/agents/${agentId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const json = await response.json().catch(() => null);

        if (cancelled) {
          return;
        }

        if (json?.success && json.agent?.name) {
          setAgentName(json.agent.name);
          setMessages([
            { role: "assistant", content: `Hi, I'm ${json.agent.name}. How can I help you today?` },
          ]);
          return;
        }

        setMessages([
          { role: "assistant", content: "Hi, I'm your assistant. How can I help you today?" },
        ]);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setMessages([
          { role: "assistant", content: "Hi, I'm your assistant. How can I help you today?" },
        ]);
      }
    }

    void loadAgent();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadTasks() {
    if (!agentId || !UUID_REGEX.test(agentId)) {
      setTasks([]);
      return;
    }

    setTasksLoading(true);
    setTasksError(null);

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/tasks`, {
        cache: "no-store",
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setTasksError(json?.error || "Failed to load tasks.");
        setTasks([]);
        return;
      }

      setTasks(Array.isArray(json.tasks) ? json.tasks : []);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to load tasks.");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    if (tab !== "tasks") {
      return;
    }

    void loadTasks();
  }, [tab, agentId]);

  async function sendMessage() {
    if (!input.trim() || !agentId) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messages: updatedMessages }),
      });

      const data = await res.json();

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.reply || data.error || "No response returned.",
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

  async function createTask() {
    if (!agentId || !UUID_REGEX.test(agentId) || !taskForm.title.trim()) {
      return;
    }

    setSavingTaskId("new");
    setTasksError(null);

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || null,
          status: taskForm.status,
          priority: taskForm.priority,
          due_at: toDueAtIso(taskForm.dueAt),
          execution_notes: taskForm.executionNotes.trim() || null,
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success || !json.task) {
        setTasksError(json?.error || "Failed to create task.");
        return;
      }

      setTasks((current) => [json.task as AgentTask, ...current]);
      setTaskForm(defaultTaskForm());
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to create task.");
    } finally {
      setSavingTaskId(null);
    }
  }

  function startEditing(task: AgentTask) {
    setEditingTaskId(task.id);
    setEditingForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueAt: toInputDate(task.due_at),
      executionNotes: task.execution_notes ?? "",
    });
  }

  async function updateTask(taskId: string, payload: Record<string, unknown>) {
    setSavingTaskId(taskId);
    setTasksError(null);

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success || !json.task) {
        setTasksError(json?.error || "Failed to update task.");
        return null;
      }

      const updated = json.task as AgentTask;

      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));

      return updated;
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to update task.");
      return null;
    } finally {
      setSavingTaskId(null);
    }
  }

  async function saveEditedTask(taskId: string) {
    if (!editingForm.title.trim()) {
      setTasksError("Task title is required.");
      return;
    }

    const updated = await updateTask(taskId, {
      title: editingForm.title.trim(),
      description: editingForm.description.trim() || null,
      status: editingForm.status,
      priority: editingForm.priority,
      due_at: toDueAtIso(editingForm.dueAt),
      execution_notes: editingForm.executionNotes.trim() || null,
    });

    if (updated) {
      setEditingTaskId(null);
      setEditingForm(defaultTaskForm());
    }
  }

  async function deleteTask(taskId: string) {
    setSavingTaskId(taskId);
    setTasksError(null);

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setTasksError(json?.error || "Failed to delete task.");
        return;
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setEditingForm(defaultTaskForm());
      }
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to delete task.");
    } finally {
      setSavingTaskId(null);
    }
  }

  async function runTaskNow(taskId: string) {
    setRunningTaskId(taskId);
    setTasksError(null);

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/tasks/${taskId}/run`, {
        method: "POST",
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success || !json.task) {
        setTasksError(json?.error || "Failed to run task.");
        return;
      }

      const updated = json.task as AgentTask;

      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to run task.");
    } finally {
      setRunningTaskId(null);
    }
  }

  const taskStats = {
    total: tasks.length,
    running: tasks.filter((task) => task.status === "running").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    done: tasks.filter((task) => task.status === "done").length,
  };

  return (
    <article className="col-span-2 row-span-2 flex h-full flex-col rounded-lg border border-white/10 bg-black/30 overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-cyan-400" />
          <div>
            <p className="text-xs font-semibold">{agentName}</p>
            <p className="text-[10px] text-zinc-500">AI Chat</p>
          </div>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
      </div>

      {/* TABS */}
      <div className="flex border-b border-white/10">
        {(["chat", "tasks", "memory", "prompts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
              tab === t
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">

        {/* CHAT */}
        {tab === "chat" && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    m.role === "user"
                      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-zinc-400"
                  }`}>
                    {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>

                  <div className={`max-w-[78%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-500 text-black"
                      : "border border-white/10 bg-black/40 text-zinc-300"
                  }`}>
                    {m.content}

                    {m.role === "assistant" && (
                      <div className="mt-1.5 flex gap-2 border-t border-white/10 pt-1.5 text-[10px] text-zinc-500">
                        <button
                          onClick={() => navigator.clipboard.writeText(m.content)}
                          className="hover:text-zinc-300 transition"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            const draftTitle = getTaskDraftFromMessage(m.content);

                            setTaskForm((current) => ({
                              ...current,
                              title: draftTitle,
                              description: m.content,
                            }));

                            setTab("tasks");
                          }}
                          className="hover:text-zinc-300 transition"
                        >
                          Create Task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Bot size={12} className="text-zinc-400" />
                  </div>
                  <div className="flex gap-1 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-2">
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
                  placeholder={`Ask ${agentName}...`}
                  className="flex-1 resize-none rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-cyan-500 px-3 text-black transition hover:bg-cyan-400 disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === "tasks" && (
          <div className="h-full overflow-y-auto p-3 space-y-3">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Task Operations</p>
                <button
                  onClick={() => setTaskForm(defaultTaskForm())}
                  className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition"
                >
                  Clear Form
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-md border border-white/10 bg-black/40 p-2">
                  <p className="text-zinc-500">Total</p>
                  <p className="text-zinc-100 text-sm font-semibold">{taskStats.total}</p>
                </div>
                <div className="rounded-md border border-cyan-400/20 bg-cyan-500/10 p-2">
                  <p className="text-cyan-300/80">Running</p>
                  <p className="text-cyan-300 text-sm font-semibold">{taskStats.running}</p>
                </div>
                <div className="rounded-md border border-amber-400/20 bg-amber-500/10 p-2">
                  <p className="text-amber-300/80">Blocked</p>
                  <p className="text-amber-300 text-sm font-semibold">{taskStats.blocked}</p>
                </div>
                <div className="rounded-md border border-green-400/20 bg-green-500/10 p-2">
                  <p className="text-green-300/80">Done</p>
                  <p className="text-green-300 text-sm font-semibold">{taskStats.done}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Create Task</p>
              <input
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Task title"
                className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
              />
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="What should the agent execute in real life?"
                className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
              />

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={taskForm.status}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      status: event.target.value as TaskStatus,
                    }))
                  }
                  className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      priority: event.target.value as TaskPriority,
                    }))
                  }
                  className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={taskForm.dueAt}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      dueAt: event.target.value,
                    }))
                  }
                  className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                />
              </div>

              <textarea
                rows={2}
                value={taskForm.executionNotes}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    executionNotes: event.target.value,
                  }))
                }
                placeholder="Execution notes (channels, owners, constraints)"
                className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
              />

              <button
                onClick={createTask}
                disabled={savingTaskId === "new" || !taskForm.title.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-40"
              >
                {savingTaskId === "new" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add Task
              </button>
            </div>

            {tasksError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                {tasksError}
              </div>
            )}

            {tasksLoading && (
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-zinc-400">Loading tasks...</div>
            )}

            {!tasksLoading && tasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-xs text-zinc-500">
                No tasks yet. Create a task to start real-world execution workflows for this agent.
              </div>
            )}

            {!tasksLoading &&
              tasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const isSavingThisTask = savingTaskId === task.id;
                const isRunningThisTask = runningTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{task.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${getStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => runTaskNow(task.id)}
                          disabled={isRunningThisTask}
                          className="inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40"
                        >
                          {isRunningThisTask ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                          Run
                        </button>

                        {!isEditing && (
                          <button
                            onClick={() => startEditing(task)}
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 transition hover:border-white/20 hover:text-zinc-100"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>
                        )}

                        {isEditing && (
                          <button
                            onClick={() => {
                              setEditingTaskId(null);
                              setEditingForm(defaultTaskForm());
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 transition hover:border-white/20 hover:text-zinc-100"
                          >
                            <X size={11} />
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          disabled={isSavingThisTask}
                          className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {!isEditing && task.description && (
                      <p className="text-zinc-400 leading-relaxed">{task.description}</p>
                    )}

                    {!isEditing && (
                      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
                        <span>Due: {task.due_at ? new Date(task.due_at).toLocaleDateString() : "Not set"}</span>
                        <span>Updated: {new Date(task.updated_at).toLocaleString()}</span>
                        <span>Last run: {task.last_run_at ? new Date(task.last_run_at).toLocaleString() : "Never"}</span>
                      </div>
                    )}

                    {isEditing && (
                      <div className="space-y-2 rounded-md border border-white/10 bg-black/40 p-2.5">
                        <input
                          value={editingForm.title}
                          onChange={(event) =>
                            setEditingForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                        />

                        <textarea
                          rows={3}
                          value={editingForm.description}
                          onChange={(event) =>
                            setEditingForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={editingForm.status}
                            onChange={(event) =>
                              setEditingForm((current) => ({
                                ...current,
                                status: event.target.value as TaskStatus,
                              }))
                            }
                            className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <select
                            value={editingForm.priority}
                            onChange={(event) =>
                              setEditingForm((current) => ({
                                ...current,
                                priority: event.target.value as TaskPriority,
                              }))
                            }
                            className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                          >
                            {PRIORITY_OPTIONS.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>

                          <input
                            type="date"
                            value={editingForm.dueAt}
                            onChange={(event) =>
                              setEditingForm((current) => ({
                                ...current,
                                dueAt: event.target.value,
                              }))
                            }
                            className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={editingForm.executionNotes}
                          onChange={(event) =>
                            setEditingForm((current) => ({
                              ...current,
                              executionNotes: event.target.value,
                            }))
                          }
                          placeholder="Execution notes"
                          className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-400/40"
                        />

                        <button
                          onClick={() => saveEditedTask(task.id)}
                          disabled={isSavingThisTask || !editingForm.title.trim()}
                          className="inline-flex items-center gap-1 rounded-md bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-40"
                        >
                          {isSavingThisTask ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
                          Save Changes
                        </button>
                      </div>
                    )}

                    {task.last_run_result && !isEditing && (
                      <div className="rounded-md border border-cyan-400/20 bg-cyan-500/5 p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-cyan-300/80">Last Execution Report</p>
                        <p className="mt-1 whitespace-pre-wrap text-zinc-300 leading-relaxed">
                          {task.last_run_result}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* MEMORY */}
        {tab === "memory" && (
          <div className="space-y-2 overflow-y-auto h-full p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Business Memory</p>
            {[
              { label: "Company", value: "Ignitia AI — Lead Gen · Landing Pages · AI Automation" },
              { label: "Markets", value: "Uruguay · Argentina · Mexico · USA" },
              { label: "Capabilities", value: "Funnels · Ads · OSINT · Sales Systems" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs">
                <p className="text-cyan-400 mb-0.5">{item.label}</p>
                <p className="text-zinc-400">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* PROMPTS */}
        {tab === "prompts" && (
          <div className="space-y-2 overflow-y-auto h-full p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Prompt Library</p>
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
                className="w-full rounded-lg border border-white/10 bg-black/30 p-2.5 text-left text-xs text-zinc-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white"
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </div>
    </article>
  );
}
