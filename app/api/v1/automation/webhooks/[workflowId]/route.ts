// ======================================================
// POST /api/v1/automation/webhooks/[workflowId]
// ======================================================
// Generic inbound trigger for Webhook / Form Submission input
// nodes. The request body becomes the output of every such
// trigger node found in the workflow.

import { NextRequest, NextResponse } from "next/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

const TRIGGER_TYPES = new Set(["input.webhook", "input.formSubmission"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  try {
    const body = await request.json().catch(() => ({}));

    const workflow = await WorkflowService.get(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
    }

    const rootInput: Record<string, any> = {};
    for (const node of workflow.nodes) {
      if (TRIGGER_TYPES.has(node.type)) rootInput[node.id] = body;
    }

    const run = await WorkflowService.run(workflowId, "webhook", rootInput);
    return NextResponse.json({ run });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
