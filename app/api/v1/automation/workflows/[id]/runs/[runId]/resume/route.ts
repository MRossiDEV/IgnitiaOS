// ======================================================
// POST /api/v1/automation/workflows/[id]/runs/[runId]/resume
// ======================================================
// Continues a paused run — used by an admin approving/answering
// a Request Approval / Human node, or by whatever inbound
// channel eventually supplies a Wait For Reply reply. Streams
// live progress as NDJSON, same contract as .../run (see that
// route's header comment for the line shapes).

import { NextRequest } from "next/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  const { id, runId } = await params;
  const body = await request.json().catch(() => ({}));

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (line: object) => controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));

      try {
        const run = await WorkflowService.resume(
          id,
          runId,
          { output: body.output ?? {}, branch: body.branch },
          (event) => send({ type: "event", event })
        );
        send({ type: "done", run });
      } catch (err: any) {
        send({ type: "error", error: err.message ?? "Resume failed." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
