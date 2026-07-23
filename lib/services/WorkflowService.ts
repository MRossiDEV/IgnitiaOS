// ======================================================
// Workflow Service — the ONLY file that writes to
// workflows and workflow_runs
// lib/services/WorkflowService.ts
// ======================================================

import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";
import { executeWorkflow, NodeRunResult, ExecutionSnapshot, ExecutionEvent } from "@/lib/automation/executeWorkflow";

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: string;
  trigger_source: string | null;
  node_results: NodeRunResult[];
  error: string | null;
  paused_node_id: string | null;
  pending_request: Record<string, any> | null;
  execution_snapshot: ExecutionSnapshot | null;
  started_at: string;
  finished_at: string | null;
}

export class WorkflowService {
  static async list(): Promise<Workflow[]> {
    const { data, error } = await supabaseAdmin
      .from("workflows")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to list workflows: ${error.message}`);
    return data ?? [];
  }

  static async get(id: string): Promise<Workflow | null> {
    const { data, error } = await supabaseAdmin
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  }

  static async create(input: {
    name: string;
    description?: string;
  }): Promise<Workflow> {
    const { data, error } = await supabaseAdmin
      .from("workflows")
      .insert({
        name: input.name,
        description: input.description ?? null,
        nodes: [],
        edges: [],
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(`Failed to create workflow: ${error?.message}`);
    return data;
  }

  static async save(
    id: string,
    input: {
      name?: string;
      description?: string;
      category?: string;
      nodes?: WorkflowNode[];
      edges?: WorkflowEdge[];
      status?: string;
    }
  ): Promise<Workflow> {
    // nodes/edges are optional so a metadata-only edit (name/description/
    // category from the workflow list) can't accidentally wipe the canvas —
    // only include them in the update when the caller actually provided them.
    const { data, error } = await supabaseAdmin
      .from("workflows")
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.nodes !== undefined ? { nodes: input.nodes } : {}),
        ...(input.edges !== undefined ? { edges: input.edges } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new Error(`Failed to save workflow: ${error?.message}`);
    return data;
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("workflows").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete workflow: ${error.message}`);
  }

  static async run(
    id: string,
    triggerSource = "manual",
    rootInput?: Record<string, any>,
    onEvent?: (event: ExecutionEvent) => void
  ): Promise<WorkflowRun> {
    const workflow = await this.get(id);
    if (!workflow) throw new Error("Workflow not found.");

    const { data: runRow, error: insertError } = await supabaseAdmin
      .from("workflow_runs")
      .insert({ workflow_id: id, status: "running", trigger_source: triggerSource })
      .select("*")
      .single();

    if (insertError || !runRow) {
      throw new Error(`Failed to start workflow run: ${insertError?.message}`);
    }

    const { results, success, paused } = await executeWorkflow(workflow.nodes, workflow.edges, {
      rootInput,
      onEvent,
    });

    const { data: updatedRun, error: updateError } = await supabaseAdmin
      .from("workflow_runs")
      .update({
        status: paused ? "paused" : success ? "completed" : "failed",
        node_results: results,
        error: !paused && !success ? results.find((r) => r.status === "error")?.error ?? "Unknown error" : null,
        paused_node_id: paused?.nodeId ?? null,
        pending_request: paused?.pendingRequest ?? null,
        execution_snapshot: paused?.snapshot ?? null,
        finished_at: paused ? null : new Date().toISOString(),
      })
      .eq("id", runRow.id)
      .select("*")
      .single();

    if (updateError || !updatedRun) {
      throw new Error(`Failed to save workflow run result: ${updateError?.message}`);
    }

    return updatedRun;
  }

  static async resume(
    id: string,
    runId: string,
    resumeInput: { output: any; branch?: string },
    onEvent?: (event: ExecutionEvent) => void
  ): Promise<WorkflowRun> {
    const workflow = await this.get(id);
    if (!workflow) throw new Error("Workflow not found.");

    const { data: runRow, error: fetchError } = await supabaseAdmin
      .from("workflow_runs")
      .select("*")
      .eq("id", runId)
      .eq("workflow_id", id)
      .single();

    if (fetchError || !runRow) throw new Error("Workflow run not found.");
    if (runRow.status !== "paused" || !runRow.paused_node_id || !runRow.execution_snapshot) {
      throw new Error("This workflow run is not paused.");
    }

    const { results, success, paused } = await executeWorkflow(workflow.nodes, workflow.edges, {
      resume: {
        snapshot: runRow.execution_snapshot,
        resumeNodeId: runRow.paused_node_id,
        resumeOutput: resumeInput.output,
        resumeBranch: resumeInput.branch,
      },
      onEvent,
    });

    const { data: updatedRun, error: updateError } = await supabaseAdmin
      .from("workflow_runs")
      .update({
        status: paused ? "paused" : success ? "completed" : "failed",
        node_results: results,
        error: !paused && !success ? results.find((r) => r.status === "error")?.error ?? "Unknown error" : null,
        paused_node_id: paused?.nodeId ?? null,
        pending_request: paused?.pendingRequest ?? null,
        execution_snapshot: paused?.snapshot ?? null,
        finished_at: paused ? null : new Date().toISOString(),
      })
      .eq("id", runId)
      .select("*")
      .single();

    if (updateError || !updatedRun) {
      throw new Error(`Failed to save workflow run result: ${updateError?.message}`);
    }

    return updatedRun;
  }

  static async listRuns(workflowId: string, limit = 20): Promise<WorkflowRun[]> {
    const { data, error } = await supabaseAdmin
      .from("workflow_runs")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list workflow runs: ${error.message}`);
    return data ?? [];
  }
}
