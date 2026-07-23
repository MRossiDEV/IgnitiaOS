// ======================================================
// POST /api/v1/automation/workflows/[id]/run
// ======================================================
// Streams live progress as newline-delimited JSON (NDJSON) so
// the canvas can show a running log instead of waiting for the
// whole workflow to finish. Each line is one of:
//   { type: "event", event: ExecutionEvent }   node-start / node-result
//   { type: "done", run: WorkflowRun }         final persisted run
//   { type: "error", error: string }           run failed to even start

import { NextRequest } from "next/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (line: object) => controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));

      try {
        const run = await WorkflowService.run(id, "manual", undefined, (event) => send({ type: "event", event }));
        send({ type: "done", run });
      } catch (err: any) {
        send({ type: "error", error: err.message ?? "Run failed." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
