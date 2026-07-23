"use client";

// ======================================================
// Admin: Automation — Workflow Canvas Editor
// app/admin/automation/[id]/page.tsx
// ======================================================
// Real drag-and-drop canvas using @xyflow/react. Components
// only render/capture input/call actions — execution logic
// lives in lib/automation/, persistence in WorkflowService,
// both behind the /api/v1/automation/* routes.
//
// Requires: npm install @xyflow/react

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  NodeResizeControl,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Trash2, Terminal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ------------------------------------------------------
// Types
// ------------------------------------------------------

interface ConfigFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface NodeTypeDef {
  type: string;
  category: "input" | "ai" | "crm" | "communication" | "logic" | "data" | "system" | "human";
  label: string;
  description: string;
  configFields: ConfigFieldDef[];
  outputHandles?: string[];
  inputHandles?: string[];
}

interface NodeRunResult {
  nodeId: string;
  type: string;
  status: "success" | "error" | "skipped" | "paused";
  output?: any;
  error?: string;
  durationMs: number;
}

interface PendingRequest {
  message: string;
  kind: "approval" | "text" | "reject-approve";
  options?: string[];
}

type ExecutionEvent =
  | { type: "node-start"; nodeId: string; nodeType: string }
  | { type: "node-result"; result: NodeRunResult };

type StreamLine =
  | { type: "event"; event: ExecutionEvent }
  | { type: "done"; run: any }
  | { type: "error"; error: string };

interface LogLine {
  ts: number;
  text: string;
  level: "info" | "success" | "error" | "warn";
}

const CATEGORY_COLORS: Record<string, string> = {
  input: "#A78BFA",
  ai: "#34D9B4",
  crm: "#60A5FA",
  communication: "#FBBF24",
  logic: "#F472B6",
  data: "#38BDF8",
  system: "#9CA3AF",
  human: "#F472B6",
};

const STATUS_COLORS: Record<string, string> = {
  running: "#38BDF8",
  success: "#34D9B4",
  error: "#F87171",
  skipped: "#6B7280",
  paused: "#FBBF24",
};

const LOG_LEVEL_COLORS: Record<LogLine["level"], string> = {
  info: "text-zinc-400",
  success: "text-emerald-400",
  error: "text-red-400",
  warn: "text-amber-400",
};

// Reads a fetch() Response whose body is newline-delimited JSON,
// calling onLine for each parsed line as it arrives (not buffered
// until the response finishes) — this is what makes the log "live".
async function readNdjsonStream(res: Response, onLine: (line: StreamLine) => void) {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        onLine(JSON.parse(line));
      } catch {
        // ignore malformed line
      }
    }
  }
  if (buffer.trim()) {
    try {
      onLine(JSON.parse(buffer));
    } catch {
      // ignore malformed trailing line
    }
  }
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K tok`;
  return `${n} tok`;
}

function formatCost(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.0001) return "<$0.0001";
  return `$${usd.toFixed(4)}`;
}

// ------------------------------------------------------
// Dark theme overrides for React Flow's own chrome
// ------------------------------------------------------

function CanvasThemeStyles() {
  return (
    <style jsx global>{`
      .react-flow__renderer {
        background: transparent;
      }
      .react-flow__controls {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: none;
      }
      .react-flow__controls-button {
        background: transparent;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        fill: #eef3ff;
        color: #eef3ff;
      }
      .react-flow__controls-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .react-flow__attribution {
        background: transparent;
        color: rgba(255, 255, 255, 0.25);
      }
      .react-flow__edge-path {
        stroke: rgba(255, 255, 255, 0.3);
      }
      .react-flow__edge.selected .react-flow__edge-path,
      .react-flow__edge:hover .react-flow__edge-path {
        stroke: #6ee7ff;
      }
      .react-flow__handle {
        border: 1px solid rgba(0, 0, 0, 0.4);
      }
    `}</style>
  );
}

// ------------------------------------------------------
// Custom node renderer
// ------------------------------------------------------

// ComfyUI-style layout: every node has the same in-left/out-right
// structure, and every setting lives in the node body itself — no side
// panel. A node with no declared inputHandles/outputHandles gets one
// unlabeled connector per side (the existing single-edge behavior, just
// repositioned); a node that declares named handles gets one labeled row
// per handle, stacked vertically down that side. Config fields render as
// compact inline widgets below the connectors, matching how ComfyUI packs
// widgets into the node body.
function AutomationNode({ data }: NodeProps) {
  const d = data as any;
  const color = CATEGORY_COLORS[d.category] ?? "#9CA3AF";
  const statusColor = d.status ? STATUS_COLORS[d.status] : undefined;

  const inputs: string[] = d.inputHandles && d.inputHandles.length > 0 ? d.inputHandles : ["__default__"];
  const outputs: string[] = d.outputHandles && d.outputHandles.length > 0 ? d.outputHandles : ["__default__"];
  const configFields: ConfigFieldDef[] = d.configFields ?? [];
  const config = d.config ?? {};

  const updateConfig = (key: string, value: string) => d.onConfigChange?.(key, value);

  return (
    <div
      className="relative w-full h-full min-w-[220px] min-h-[90px] rounded-lg shadow-lg flex flex-col"
      style={{
        border: `2px solid ${statusColor ?? color}`,
        background: "#0d1117",
        boxShadow: `0 4px 14px rgba(0,0,0,0.45), 0 0 0 1px ${(statusColor ?? color)}22`,
      }}
    >
      <NodeResizeControl position="bottom-right" minWidth={220} minHeight={90} style={{ background: "transparent", border: "none" }}>
        <div
          style={{
            position: "absolute",
            right: 3,
            bottom: 3,
            width: 10,
            height: 10,
            cursor: "nwse-resize",
            borderRight: `2px solid ${color}aa`,
            borderBottom: `2px solid ${color}aa`,
          }}
        />
      </NodeResizeControl>

      <div
        className="px-2.5 py-1.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {d.category}
        </span>
        <button
          onClick={() => d.onDelete?.()}
          title="Delete node"
          className="nodrag shrink-0 rounded p-0.5 text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="px-2.5 py-2 text-[13px] font-semibold text-zinc-100 flex items-center gap-1.5">
        {d.label}
        {d.status && (
          <span
            className={`text-[10px] ${d.status === "running" ? "animate-pulse" : ""}`}
            style={{ color: statusColor }}
          >
            {d.status === "running"
              ? "●"
              : d.status === "success"
              ? "✓"
              : d.status === "error"
              ? "✗"
              : d.status === "paused"
              ? "⏸"
              : "—"}
          </span>
        )}
      </div>

      {d.lastUsage && (
        <div className="px-2.5 pb-1.5 -mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
          <span title={`${d.lastUsage.inputTokens} in / ${d.lastUsage.outputTokens} out · ${d.lastUsage.model}`}>
            🪙 {formatTokens(d.lastUsage.totalTokens)} · {formatCost(d.lastUsage.costUsd)}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 pb-2.5 pt-1">
        <div className="flex flex-col gap-2">
          {inputs.map((handle) => (
            <div key={handle} className="flex items-center gap-1.5" style={{ marginLeft: -6 }}>
              <Handle
                type="target"
                position={Position.Left}
                id={handle === "__default__" ? undefined : handle}
                style={{ background: color, border: "1px solid #0d1117", position: "relative", transform: "none" }}
              />
              {handle !== "__default__" && <span className="text-[9px] text-zinc-500">{handle}</span>}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {outputs.map((handle) => (
            <div key={handle} className="flex items-center gap-1.5" style={{ marginRight: -6 }}>
              {handle !== "__default__" && <span className="text-[9px] text-zinc-500">{handle}</span>}
              <Handle
                type="source"
                position={Position.Right}
                id={handle === "__default__" ? undefined : handle}
                style={{ background: color, border: "1px solid #0d1117", position: "relative", transform: "none" }}
              />
            </div>
          ))}
        </div>
      </div>

      {configFields.length > 0 && (
        <div
          className="flex flex-col gap-2 px-2.5 pb-2.5 pt-2 flex-1 min-h-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {configFields.map((field) => (
            <div key={field.key} className={field.type === "textarea" ? "flex flex-col flex-1 min-h-0" : "shrink-0"}>
              <label className="block text-[9px] text-zinc-500 mb-0.5">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={config[field.key] ?? ""}
                  onChange={(e) => updateConfig(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="nodrag nowheel w-full flex-1 min-h-[48px] text-[11px] rounded border border-white/10 bg-white/5 text-white placeholder:text-zinc-600 px-1.5 py-1 resize-none"
                />
              ) : field.type === "select" ? (
                <select
                  className="nodrag w-full h-6 text-[11px] rounded border border-white/10 bg-white/5 text-white px-1"
                  value={config[field.key] ?? ""}
                  onChange={(e) => updateConfig(field.key, e.target.value)}
                >
                  <option value="" className="bg-[#0d1117]">
                    —
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0d1117]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "boolean" ? (
                <input
                  type="checkbox"
                  className="nodrag accent-cyan-500"
                  checked={config[field.key] === "true"}
                  onChange={(e) => updateConfig(field.key, e.target.checked ? "true" : "false")}
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={config[field.key] ?? ""}
                  onChange={(e) => updateConfig(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="nodrag w-full h-6 text-[11px] rounded border border-white/10 bg-white/5 text-white placeholder:text-zinc-600 px-1.5"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { automation: AutomationNode };

// ------------------------------------------------------
// Page
// ------------------------------------------------------

export default function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  );
}

function WorkflowEditor() {
  const params = useParams();
  const workflowId = params.id as string;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodeTypeDefs, setNodeTypeDefs] = useState<NodeTypeDef[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [pausedRun, setPausedRun] = useState<{ runId: string; pendingRequest: PendingRequest } | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resuming, setResuming] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) =>
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    if (showLog) logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logLines, showLog]);

  const appendLog = useCallback((text: string, level: LogLine["level"] = "info") => {
    setLogLines((lines) => [...lines, { ts: Date.now(), text, level }]);
  }, []);

  const nodeLabelById = useMemo(
    () => new Map(nodes.map((n) => [n.id, (n.data as any).label as string])),
    [nodes]
  );

  // Load workflow + node type registry
  useEffect(() => {
    fetch(`/api/v1/automation/workflows/${workflowId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.workflow) {
          setWorkflowName(data.workflow.name);
          setNodes(
            (data.workflow.nodes ?? []).map((n: any) => ({
              id: n.id,
              type: "automation",
              position: n.position,
              ...(n.width ? { width: n.width } : {}),
              ...(n.height ? { height: n.height } : {}),
              data: { ...n.data, nodeType: n.type },
            }))
          );
          setEdges(data.workflow.edges ?? []);
        }
      });

    fetch("/api/v1/automation/node-types")
      .then((r) => r.json())
      .then((data) => setNodeTypeDefs(data.nodeTypes ?? []));
  }, [workflowId, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const typeStr = event.dataTransfer.getData("application/nodetype");
      if (!typeStr) return;

      const def = nodeTypeDefs.find((d) => d.type === typeStr);
      if (!def) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const id = `${def.type}-${Date.now()}`;
      const newNode: Node = {
        id,
        type: "automation",
        position,
        data: {
          label: def.label,
          category: def.category,
          nodeType: def.type,
          config: {},
          outputHandles: def.outputHandles,
          inputHandles: def.inputHandles,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodeTypeDefs, screenToFlowPosition, setNodes]
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, key: string, value: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, [key]: value } } } : n
        )
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/v1/automation/workflows/${workflowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          nodes: nodes.map((n) => ({
            id: n.id,
            type: (n.data as any).nodeType,
            position: n.position,
            ...(n.width ? { width: n.width } : {}),
            ...(n.height ? { height: n.height } : {}),
            data: { label: (n.data as any).label, config: (n.data as any).config ?? {} },
          })),
          edges: edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          })),
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const applyRunResult = (run: any) => {
    const resultsByNode = new Map<string, NodeRunResult>(
      run.node_results.map((r: NodeRunResult) => [r.nodeId, r])
    );

    setNodes((nds) =>
      nds.map((n) => {
        const result = resultsByNode.get(n.id);
        if (!result) return n;
        const usage = result.output?._usage;
        return { ...n, data: { ...n.data, status: result.status, ...(usage ? { lastUsage: usage } : {}) } };
      })
    );

    if (run.status === "paused" && run.pending_request) {
      setPausedRun({ runId: run.id, pendingRequest: run.pending_request });
    } else {
      setPausedRun(null);
    }

    if (run.status === "failed") {
      setRunError(run.error ?? "Workflow run failed.");
    }
  };

  const handleStreamLine = useCallback(
    (line: StreamLine) => {
      if (line.type === "event") {
        const event = line.event;
        if (event.type === "node-start") {
          const label = nodeLabelById.get(event.nodeId) ?? event.nodeType;
          appendLog(`▶ Running ${label}...`, "info");
          setNodes((nds) =>
            nds.map((n) => (n.id === event.nodeId ? { ...n, data: { ...n.data, status: "running" } } : n))
          );
        } else {
          const r = event.result;
          const label = nodeLabelById.get(r.nodeId) ?? r.type;
          const usage = r.output?._usage;
          const usageSuffix = usage ? ` · ${formatTokens(usage.totalTokens)} · ${formatCost(usage.costUsd)}` : "";
          const suffix = r.durationMs ? ` (${r.durationMs}ms)` : "";
          if (r.status === "success") appendLog(`✓ ${label} completed${suffix}${usageSuffix}`, "success");
          else if (r.status === "error") appendLog(`✗ ${label} failed: ${r.error}`, "error");
          else if (r.status === "skipped") appendLog(`⏭ ${label} skipped`, "warn");
          else if (r.status === "paused") appendLog(`⏸ ${label} paused — waiting for input`, "warn");
          setNodes((nds) =>
            nds.map((n) =>
              n.id === r.nodeId
                ? { ...n, data: { ...n.data, status: r.status, ...(usage ? { lastUsage: usage } : {}) } }
                : n
            )
          );
        }
      } else if (line.type === "done") {
        appendLog(`Run ${line.run.status}.`, line.run.status === "failed" ? "error" : "success");
        applyRunResult(line.run);
      } else {
        appendLog(`Error: ${line.error}`, "error");
        setRunError(line.error);
      }
    },
    [nodeLabelById, appendLog, setNodes]
  );

  const run = async () => {
    setRunning(true);
    setRunError(null);
    setPausedRun(null);
    setLogLines([]);
    setShowLog(true);
    try {
      await save(); // always run the saved version
      appendLog("Starting run...", "info");
      const res = await fetch(`/api/v1/automation/workflows/${workflowId}/run`, {
        method: "POST",
      });

      if (!res.ok || !res.body) {
        setRunError("Run failed to start.");
        return;
      }

      await readNdjsonStream(res, handleStreamLine);
    } finally {
      setRunning(false);
    }
  };

  const resumeRun = async (output: any, branch?: string) => {
    if (!pausedRun) return;
    setResuming(true);
    setRunError(null);
    setShowLog(true);
    try {
      appendLog("Resuming run...", "info");
      const res = await fetch(
        `/api/v1/automation/workflows/${workflowId}/runs/${pausedRun.runId}/resume`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ output, branch }),
        }
      );

      if (!res.ok || !res.body) {
        setRunError("Resume failed to start.");
        return;
      }

      setResumeText("");
      await readNdjsonStream(res, handleStreamLine);
    } finally {
      setResuming(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, NodeTypeDef[]> = {};
    for (const def of nodeTypeDefs) {
      if (!groups[def.category]) groups[def.category] = [];
      groups[def.category].push(def);
    }
    return groups;
  }, [nodeTypeDefs]);

  // Always resolve category/outputHandles/configFields from the live
  // node-type registry rather than from whatever got persisted on the
  // node — save() only stores {label, config}, and older saved workflows
  // may carry stale category strings from before the 8-category taxonomy
  // existed. Also injects the per-node onConfigChange/onDelete callbacks
  // the node body needs to edit its own settings and remove itself, now
  // that there's no side panel doing that from outside.
  const displayNodes = useMemo(() => {
    if (nodeTypeDefs.length === 0) return nodes;
    return nodes.map((n) => {
      const def = nodeTypeDefs.find((d) => d.type === (n.data as any).nodeType);
      if (!def) return n;
      return {
        ...n,
        data: {
          ...n.data,
          category: def.category,
          outputHandles: def.outputHandles,
          inputHandles: def.inputHandles,
          configFields: def.configFields,
          onConfigChange: (key: string, value: string) => updateNodeConfig(n.id, key, value),
          onDelete: () => deleteNode(n.id),
        },
      };
    });
  }, [nodes, nodeTypeDefs, updateNodeConfig, deleteNode]);

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100">
      <CanvasThemeStyles />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="max-w-[280px] font-semibold bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/40"
        />
        <div className="flex items-center gap-2.5">
          {runError && <span className="text-xs text-red-400">{runError}</span>}
          <Button
            variant="outline"
            onClick={() => setShowLog((v) => !v)}
            className={`gap-1.5 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white ${
              showLog ? "border-cyan-500/40 text-cyan-300" : ""
            }`}
          >
            <Terminal size={15} />
            Log{logLines.length > 0 ? ` (${logLines.length})` : ""}
          </Button>
          <Button
            variant="outline"
            onClick={save}
            disabled={saving}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={run} disabled={running} className="bg-cyan-500 text-black font-semibold hover:bg-cyan-400">
            {running ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {pausedRun && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-amber-400/20 bg-amber-400/10 text-sm text-amber-200">
          <span>⏸ {pausedRun.pendingRequest.message}</span>
          <div className="flex items-center gap-2">
            {pausedRun.pendingRequest.kind === "reject-approve" ? (
              <>
                <Button
                  variant="outline"
                  disabled={resuming}
                  onClick={() => resumeRun({ approved: false }, "rejected")}
                  className="border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 hover:text-red-200"
                >
                  Reject
                </Button>
                <Button
                  disabled={resuming}
                  onClick={() => resumeRun({ approved: true }, "approved")}
                  className="bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
                >
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Input
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Reply..."
                  className="w-[220px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                />
                <Button
                  disabled={resuming || !resumeText.trim()}
                  onClick={() => resumeRun({ reply: resumeText })}
                  className="bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
                >
                  {resuming ? "Sending..." : "Send"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        <div className="w-[220px] border-r border-white/10 bg-white/[0.02] p-3 overflow-y-auto">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
            Nodes — drag onto canvas
          </p>
          <p className="text-[11px] text-zinc-600 mb-2.5">
            Click a connection to remove it. Select a node and press Delete, or use the trash icon.
          </p>
          {Object.entries(grouped).map(([category, defs]) => {
            const isOpen = !!openCategories[category];
            return (
              <div key={category} className="mb-1.5">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between gap-1.5 py-1 hover:brightness-125 transition-all"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: CATEGORY_COLORS[category] }}
                  >
                    {category} <span className="text-zinc-600 normal-case font-normal">({defs.length})</span>
                  </span>
                  <ChevronDown
                    size={12}
                    className="text-zinc-500 transition-transform shrink-0"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                {isOpen && (
                  <div className="mt-1.5">
                    {defs.map((def) => (
                      <div
                        key={def.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/nodetype", def.type);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        title={def.description}
                        className="rounded-md px-2 py-1.5 mb-1.5 text-xs text-zinc-200 hover:text-white hover:brightness-125 transition-all cursor-grab"
                        style={{
                          border: `1px solid ${CATEGORY_COLORS[category]}66`,
                          borderLeft: `3px solid ${CATEGORY_COLORS[category]}`,
                          background: `${CATEGORY_COLORS[category]}14`,
                        }}
                      >
                        {def.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#050505]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeClick={(_, edge) => setEdges((eds) => eds.filter((e) => e.id !== edge.id))}
            deleteKeyCode={["Backspace", "Delete"]}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="rgba(255,255,255,0.08)" gap={18} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      {showLog && (
        <div className="h-52 border-t border-white/10 bg-black flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Run Log</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLogLines([])}
                className="text-[11px] text-zinc-500 hover:text-white px-2 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowLog(false)}
                className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-0.5">
            {logLines.length === 0 ? (
              <p className="text-zinc-600">No run yet — click Run to see live progress here.</p>
            ) : (
              logLines.map((line, i) => (
                <div key={i} className={LOG_LEVEL_COLORS[line.level]}>
                  <span className="text-zinc-600">{new Date(line.ts).toLocaleTimeString()}</span> {line.text}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
