import { supabaseAdmin } from "@/lib/supabase/server"
import { runTool, ToolExecutionResult } from "@/lib/tools/runner"

export type AgentExecutionRequest = {
  agentSlug: string
  input: Record<string, any>
}

type DbAgent = {
  id: string
  name: string
  slug: string
  category: string | null
  tools: any
}

type AgentExecutionResponse = {
  success: boolean
  agent: {
    id: string
    name: string
    slug: string
    department: string | null
  }
  tools: ToolExecutionResult[]
  output: Record<string, any>
  durationMs: number
  runId?: string
}

function safeObject(input: unknown): Record<string, any> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {}
  }
  return input as Record<string, any>
}

function parseTools(tools: any): string[] {
  if (Array.isArray(tools)) {
    return tools.filter((tool) => typeof tool === "string")
  }
  return []
}

async function resolveAssignedToolSlugs(agentId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("agent_tools")
    .select(
      `
        enabled,
        tools (slug)
      `
    )
    .eq("agent_id", agentId)

  if (error) {
    return []
  }

  return (data ?? [])
    .filter((row: any) => Boolean(row?.enabled))
    .map((row: any) => {
      const tool = Array.isArray(row.tools) ? row.tools[0] : row.tools
      return typeof tool?.slug === "string" ? tool.slug : null
    })
    .filter((slug: string | null): slug is string => Boolean(slug))
}

async function resolveAgent(slug: string): Promise<DbAgent> {
  const { data, error } = await supabaseAdmin
    .from("ai_agents")
    .select("id,name,slug,category,tools")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    throw new Error(`Agent not found: ${slug}`)
  }

  return data as DbAgent
}

export async function executeAgentBySlug(
  request: AgentExecutionRequest,
  options?: {
    persistRun?: boolean
  }
): Promise<AgentExecutionResponse> {
  const startedAt = Date.now()
  const persistRun = options?.persistRun ?? true

  const agent = await resolveAgent(request.agentSlug)
  const input = safeObject(request.input)
  const assignedToolSlugs = await resolveAssignedToolSlugs(agent.id)
  const toolNames = assignedToolSlugs.length > 0 ? assignedToolSlugs : parseTools(agent.tools)

  if (toolNames.length === 0) {
    throw new Error(`Agent ${request.agentSlug} has no configured tools`)
  }

  let runId: string | undefined

  if (persistRun) {
    const { data } = await supabaseAdmin
      .from("ai_agent_executions")
      .insert({
        agent_slug: agent.slug,
        agent_name: agent.name,
        department: agent.category,
        status: "running",
        input,
      })
      .select("id")
      .single()

    runId = data?.id
  }

  const toolResults: ToolExecutionResult[] = []

  for (const toolName of toolNames) {
    const toolInput = {
      ...input,
      context: {
        previousResults: toolResults,
        agent: {
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
        },
      },
    }

    const result = await runTool(toolName, toolInput)
    toolResults.push(result)

    if (!result.success) {
      if (persistRun && runId) {
        await supabaseAdmin
          .from("ai_agent_executions")
          .update({
            status: "failed",
            tool_results: toolResults,
            error: result.error || `Tool failed: ${toolName}`,
            duration_ms: Date.now() - startedAt,
          })
          .eq("id", runId)
      }

      throw new Error(result.error || `Tool execution failed: ${toolName}`)
    }
  }

  const output = {
    final: toolResults[toolResults.length - 1]?.data ?? null,
    resultsByTool: Object.fromEntries(
      toolResults.map((result) => [result.tool, result.data ?? null])
    ),
  }

  const durationMs = Date.now() - startedAt

  if (persistRun && runId) {
    await supabaseAdmin
      .from("ai_agent_executions")
      .update({
        status: "completed",
        tool_results: toolResults,
        output,
        duration_ms: durationMs,
      })
      .eq("id", runId)
  }

  return {
    success: true,
    agent: {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      department: agent.category,
    },
    tools: toolResults,
    output,
    durationMs,
    runId,
  }
}

export async function executeWorkflowBySlug(
  workflowSlug: string,
  input: Record<string, any>
) {
  const startedAt = Date.now()

  const { data: workflow, error } = await supabaseAdmin
    .from("ai_workflow_templates")
    .select("slug,name,agent_slugs")
    .eq("slug", workflowSlug)
    .single()

  if (error || !workflow) {
    throw new Error(`Workflow template not found: ${workflowSlug}`)
  }

  const agentSlugs = Array.isArray(workflow.agent_slugs)
    ? workflow.agent_slugs.filter((slug) => typeof slug === "string")
    : []

  if (agentSlugs.length === 0) {
    throw new Error(`Workflow ${workflowSlug} has no agent slugs configured`)
  }

  const { data: runRow } = await supabaseAdmin
    .from("ai_workflow_runs")
    .insert({
      workflow_slug: workflow.slug,
      status: "running",
      input,
    })
    .select("id")
    .single()

  const workflowRunId = runRow?.id as string | undefined
  const stepResults: Array<Record<string, any>> = []

  try {
    for (const agentSlug of agentSlugs) {
      const result = await executeAgentBySlug(
        {
          agentSlug,
          input,
        },
        {
          persistRun: true,
        }
      )

      stepResults.push({
        agentSlug,
        success: true,
        runId: result.runId,
        durationMs: result.durationMs,
        output: result.output,
      })
    }

    const output = {
      workflow: workflow.slug,
      steps: stepResults,
      completedAt: new Date().toISOString(),
    }

    if (workflowRunId) {
      await supabaseAdmin
        .from("ai_workflow_runs")
        .update({
          status: "completed",
          step_results: stepResults,
          output,
          duration_ms: Date.now() - startedAt,
        })
        .eq("id", workflowRunId)
    }

    return {
      success: true,
      workflow: workflow.slug,
      workflowRunId,
      durationMs: Date.now() - startedAt,
      stepResults,
      output,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow execution failed"

    if (workflowRunId) {
      await supabaseAdmin
        .from("ai_workflow_runs")
        .update({
          status: "failed",
          step_results: stepResults,
          error: message,
          duration_ms: Date.now() - startedAt,
        })
        .eq("id", workflowRunId)
    }

    throw error
  }
}
