// ======================================================
// Automation Types
// lib/automation/types.ts
// ======================================================
// Single source of truth for the node/workflow shapes used
// by nodeTypes.ts, executeWorkflow.ts, and WorkflowService.ts.

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "boolean";
  options?: ConfigFieldOption[];
  placeholder?: string;
}

export interface PendingRequest {
  /** What to show a human (or the resuming caller) while paused. */
  message: string;
  /** Shapes the resume UI: approve/reject buttons, free text, etc. */
  kind: "approval" | "text" | "reject-approve";
  options?: string[];
}

export interface NodeExecuteResult {
  output: any;
  /** Set to route to a specific outgoing handle (e.g. "true"/"false"). */
  branch?: string;
  /** Set to stop the run here until a resume call supplies the output. */
  pause?: boolean;
  pendingRequest?: PendingRequest;
}

export interface NodeTypeDefinition {
  type: string;
  category: string;
  label: string;
  description: string;
  configFields: ConfigFieldDef[];
  outputHandles?: string[];
  /**
   * Named target connectors (e.g. ["input", "systemPrompt"]) for nodes that
   * accept dedicated inputs beyond the generic data flow — a node with
   * inputHandles set receives `input` keyed by handle id (e.g.
   * `input.systemPrompt`) instead of the plain upstream-output shape.
   * Nodes that omit this keep the existing behavior untouched.
   */
  inputHandles?: string[];
  execute: (input: any, config: Record<string, any>) => Promise<NodeExecuteResult>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  /** User-resized dimensions (bottom-right drag handle on the canvas), if set. */
  width?: number;
  height?: number;
  data?: {
    label?: string;
    config?: Record<string, any>;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}
