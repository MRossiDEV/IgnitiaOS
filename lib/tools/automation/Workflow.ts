import { knowledgeMemory } from "../knowledge/Memory"
import type { AutomationJob } from "./AutomationTypes"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function buildAutomationWorkflow(input: Record<string, any>) {
  const title = normalizeText(input.title || input.name || input.workflow || "Automation Workflow")
  const steps = Array.isArray(input.steps)
    ? input.steps.map((step: unknown, index: number) => ({
        id: `step-${index + 1}`,
        title: typeof step === "string" ? step : String((step as any)?.title || `Step ${index + 1}`),
        action: typeof step === "object" && step ? (step as Record<string, any>).action || "unknown" : "unknown",
        data: typeof step === "object" && step ? step : { value: step },
      }))
    : []

  const workflow = {
    id: input.id || `wf-${Math.random().toString(36).slice(2, 10)}`,
    title,
    description: normalizeText(input.description || ""),
    steps,
    createdAt: new Date().toISOString(),
  }

  knowledgeMemory.upsertDocument({
    id: workflow.id,
    title: workflow.title,
    namespace: "documents",
    content: JSON.stringify(workflow, null, 2),
    metadata: { type: "automation_workflow" },
  })

  return workflow
}

export function workflowToJob(workflow: Record<string, any>, channel: AutomationJob["channel"] = "workflow"): AutomationJob {
  return {
    channel,
    status: "queued",
    title: normalizeText(workflow.title || workflow.name || "Automation Workflow"),
    payload: workflow,
    metadata: {
      workflowId: workflow.id,
      steps: Array.isArray(workflow.steps) ? workflow.steps.length : 0,
    },
    createdAt: new Date().toISOString(),
  }
}
