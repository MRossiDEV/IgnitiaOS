// ======================================================
// Execute Workflow
// lib/automation/executeWorkflow.ts
// ======================================================
// Runs a node graph in topological layers (Kahn's algorithm,
// batched instead of one-at-a-time): every node in a layer has
// no dependency on any other node in that same layer, so they
// run concurrently via Promise.all. Branching (a condition node
// disables its non-matching outgoing edge) and skip-cascading
// (a node fed only by disabled edges is skipped, and cascades
// its own outgoing edges) both still apply between layers.
//
// A node may also pause the run instead of finishing it (see
// pendingRequest in ./types) — used by Request Approval, Wait
// For Reply, and most Human modes. When a layer produces a
// pause, execution stops after that layer and returns an
// execution snapshot that WorkflowService.resume() can replay
// from later.

import { WorkflowNode, WorkflowEdge, PendingRequest } from "./types";
import { nodeRegistry } from "./nodeTypes";

export interface NodeRunResult {
  nodeId: string;
  type: string;
  status: "success" | "error" | "skipped" | "paused";
  output?: any;
  error?: string;
  durationMs: number;
}

export interface ExecutionSnapshot {
  outputs: Record<string, any>;
  disabledEdges: string[];
  processedNodeIds: string[];
  results: NodeRunResult[];
}

export interface PausedState {
  nodeId: string;
  pendingRequest?: PendingRequest;
  snapshot: ExecutionSnapshot;
}

export interface WorkflowRunResult {
  results: NodeRunResult[];
  success: boolean;
  paused?: PausedState;
}

export interface ResumeInput {
  snapshot: ExecutionSnapshot;
  resumeNodeId: string;
  /** The output to substitute for the paused node, e.g. an approval decision. */
  resumeOutput: any;
  /** Set to route the paused node's outgoing edges (e.g. "approved"/"rejected"). */
  resumeBranch?: string;
}

/** Live progress events for streaming a run's status to the UI as it happens. */
export type ExecutionEvent =
  | { type: "node-start"; nodeId: string; nodeType: string }
  | { type: "node-result"; result: NodeRunResult };

export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options?: {
    rootInput?: Record<string, any>;
    resume?: ResumeInput;
    onEvent?: (event: ExecutionEvent) => void;
  }
): Promise<WorkflowRunResult> {
  const emit = (event: ExecutionEvent) => options?.onEvent?.(event);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, WorkflowEdge[]>();
  const outgoing = new Map<string, WorkflowEdge[]>();

  for (const edge of edges) {
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    incoming.get(edge.target)!.push(edge);
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source)!.push(edge);
  }

  const baseIndegree = new Map<string, number>();
  for (const node of nodes) baseIndegree.set(node.id, 0);
  for (const edge of edges) {
    baseIndegree.set(edge.target, (baseIndegree.get(edge.target) ?? 0) + 1);
  }

  // Cycle check against the full graph (Kahn's algorithm, single-node steps).
  {
    const probe = new Map(baseIndegree);
    const queue = nodes.filter((n) => (probe.get(n.id) ?? 0) === 0).map((n) => n.id);
    const seen: string[] = [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      seen.push(id);
      for (const edge of outgoing.get(id) ?? []) {
        probe.set(edge.target, (probe.get(edge.target) ?? 0) - 1);
        if (probe.get(edge.target) === 0) queue.push(edge.target);
      }
    }
    if (seen.length < nodes.length) {
      return {
        success: false,
        results: [
          {
            nodeId: "graph",
            type: "graph",
            status: "error",
            error: "Workflow graph contains a cycle — can't execute.",
            durationMs: 0,
          },
        ],
      };
    }
  }

  const outputs = new Map<string, any>();
  const results: NodeRunResult[] = [];
  const disabledEdges = new Set<string>();
  const remainingIndegree = new Map(baseIndegree);
  const processed = new Set<string>();
  let frontier: string[];

  if (options?.resume) {
    const { snapshot, resumeNodeId, resumeOutput, resumeBranch } = options.resume;
    for (const [id, output] of Object.entries(snapshot.outputs)) outputs.set(id, output);
    for (const id of snapshot.disabledEdges) disabledEdges.add(id);
    results.push(...snapshot.results);

    // Replay indegree decrements for every already-processed node, in order,
    // to reconstruct exactly the frontier that exists right after this point.
    // This also catches nodes that only depended on a non-paused sibling from
    // the same layer as the paused node — those must re-enter the frontier
    // here too, not just descendants of the paused node itself.
    const nextFrontier = new Set<string>();
    for (const id of snapshot.processedNodeIds) {
      processed.add(id);
      for (const edge of outgoing.get(id) ?? []) {
        remainingIndegree.set(edge.target, (remainingIndegree.get(edge.target) ?? 0) - 1);
        if (
          (remainingIndegree.get(edge.target) ?? 0) <= 0 &&
          !processed.has(edge.target) &&
          edge.target !== resumeNodeId
        ) {
          nextFrontier.add(edge.target);
        }
      }
    }

    // The paused node itself now resolves with the supplied resume output.
    const resumeNode = nodeMap.get(resumeNodeId);
    outputs.set(resumeNodeId, resumeOutput);
    processed.add(resumeNodeId);
    const resumeResult: NodeRunResult = {
      nodeId: resumeNodeId,
      type: resumeNode?.type ?? "unknown",
      status: "success",
      output: resumeOutput,
      durationMs: 0,
    };
    results.push(resumeResult);
    emit({ type: "node-result", result: resumeResult });
    if (resumeBranch) {
      for (const edge of outgoing.get(resumeNodeId) ?? []) {
        if (edge.sourceHandle && edge.sourceHandle !== resumeBranch) disabledEdges.add(edge.id);
      }
    }
    for (const edge of outgoing.get(resumeNodeId) ?? []) {
      remainingIndegree.set(edge.target, (remainingIndegree.get(edge.target) ?? 0) - 1);
      if ((remainingIndegree.get(edge.target) ?? 0) <= 0 && !processed.has(edge.target)) {
        nextFrontier.add(edge.target);
      }
    }
    frontier = Array.from(nextFrontier);
  } else {
    frontier = nodes.filter((n) => (remainingIndegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  }

  let pausedState: PausedState | undefined;

  while (frontier.length > 0 && !pausedState) {
    const layerResults = await Promise.all(
      frontier.map(async (nodeId) => {
        const node = nodeMap.get(nodeId);
        if (!node) return null;

        emit({ type: "node-start", nodeId, nodeType: node.type });

        const incomingEdges = incoming.get(nodeId) ?? [];
        const isSkipped =
          incomingEdges.length > 0 && incomingEdges.every((e) => disabledEdges.has(e.id));

        if (isSkipped) {
          const result: NodeRunResult = { nodeId, type: node.type, status: "skipped", durationMs: 0 };
          emit({ type: "node-result", result });
          return { nodeId, node, result };
        }

        const definition = nodeRegistry[node.type];
        if (!definition) {
          const result: NodeRunResult = {
            nodeId,
            type: node.type,
            status: "error",
            error: `Unknown node type: ${node.type}`,
            durationMs: 0,
          };
          emit({ type: "node-result", result });
          return { nodeId, node, result };
        }

        let input: any = options?.rootInput?.[nodeId] ?? {};
        if (definition.inputHandles && definition.inputHandles.length > 0) {
          // Named-connector node (e.g. AI Agent's "systemPrompt" input): key
          // by target handle instead of source node id, regardless of how
          // many edges are connected — each declared handle maps to whatever
          // is wired into it, undefined if nothing is.
          const keyed: Record<string, any> = { ...input };
          for (const edge of incomingEdges) {
            const handle = edge.targetHandle || definition.inputHandles[0];
            keyed[handle] = outputs.get(edge.source);
          }
          input = keyed;
        } else if (incomingEdges.length === 1) {
          input = outputs.get(incomingEdges[0].source) ?? {};
        } else if (incomingEdges.length > 1) {
          input = {};
          for (const edge of incomingEdges) {
            input[edge.source] = outputs.get(edge.source);
          }
        }

        const started = Date.now();
        try {
          const executeResult = await definition.execute(input, node.data?.config ?? {});
          const durationMs = Date.now() - started;
          const result: NodeRunResult = executeResult.pause
            ? { nodeId, type: node.type, status: "paused", output: executeResult.output, durationMs }
            : { nodeId, type: node.type, status: "success", output: executeResult.output, durationMs };
          emit({ type: "node-result", result });
          return { nodeId, node, result, executeResult };
        } catch (error: any) {
          const result: NodeRunResult = {
            nodeId,
            type: node.type,
            status: "error",
            error: error.message ?? "Unknown error",
            durationMs: Date.now() - started,
          };
          emit({ type: "node-result", result });
          return { nodeId, node, result };
        }
      })
    );

    const nextFrontierCandidates = new Set<string>();

    for (const entry of layerResults) {
      if (!entry) continue;
      const { nodeId, node, result } = entry;
      processed.add(nodeId);
      results.push(result);

      if (result.status === "error" || result.status === "skipped") {
        for (const edge of outgoing.get(nodeId) ?? []) disabledEdges.add(edge.id);
      } else if (result.status === "paused") {
        // NOTE: only the first paused node in a layer becomes the resumable
        // point (pausedState). If a second node in the same layer also
        // pauses, it's left in a "paused" result with no output — an edge
        // case (two simultaneous pause-worthy nodes with no dependency
        // between them) rare enough to leave as a known limitation rather
        // than building multi-point resume for it.
        if (!pausedState) {
          pausedState = { nodeId, pendingRequest: entry.executeResult?.pendingRequest, snapshot: null as any };
        }
        // Don't advance the frontier past a paused node.
        continue;
      } else {
        outputs.set(nodeId, result.output);
        if (entry.executeResult?.branch) {
          for (const edge of outgoing.get(nodeId) ?? []) {
            if (edge.sourceHandle && edge.sourceHandle !== entry.executeResult.branch) {
              disabledEdges.add(edge.id);
            }
          }
        }
      }

      for (const edge of outgoing.get(nodeId) ?? []) {
        remainingIndegree.set(edge.target, (remainingIndegree.get(edge.target) ?? 0) - 1);
        if ((remainingIndegree.get(edge.target) ?? 0) <= 0 && !processed.has(edge.target)) {
          nextFrontierCandidates.add(edge.target);
        }
      }
    }

    if (pausedState) break;
    frontier = Array.from(nextFrontierCandidates);
  }

  if (pausedState) {
    pausedState.snapshot = {
      outputs: Object.fromEntries(outputs),
      disabledEdges: Array.from(disabledEdges),
      processedNodeIds: Array.from(processed).filter((id) => id !== pausedState!.nodeId),
      results: results.filter((r) => r.nodeId !== pausedState!.nodeId),
    };
    return { results, success: true, paused: pausedState };
  }

  const success = results.every((r) => r.status !== "error");
  return { results, success };
}
