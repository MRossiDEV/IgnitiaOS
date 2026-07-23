// ======================================================
// /api/v1/intelligence/settings/workflows
// ======================================================
// GET  — list workflows connected as Intelligence data sources,
//        each with its parent workflow's name/status and last run.
// POST — connect an existing automation workflow (body: { workflowId, label? }).

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

// Pulls the "Scrape Real Estate Listings" node's own output (portal,
// listingsFound/New/Changed) out of a run's node_results, if present —
// this is the useful-at-a-glance info, not just the overall run status.
function extractScrapeSummary(run: any) {
  const scrapeResult = (run?.node_results ?? []).find((r: any) => r.type === "data.scrapeListings");
  if (!scrapeResult?.output) return null;

  const { portal, listingsFound, listingsNew, listingsChanged } = scrapeResult.output;
  return { portal, listingsFound, listingsNew, listingsChanged };
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("re_connected_workflows")
    .select("id, label, created_at, workflow:workflows(id, name, status, updated_at)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const connections = await Promise.all(
    (data ?? []).map(async (row: any) => {
      const runs = row.workflow ? await WorkflowService.listRuns(row.workflow.id, 1) : [];
      const lastRun = runs[0] ?? null;
      return { ...row, lastRun, scrapeSummary: extractScrapeSummary(lastRun) };
    })
  );

  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.workflowId) {
    return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
  }

  const workflow = await WorkflowService.get(body.workflowId);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("re_connected_workflows")
    .insert({ workflow_id: body.workflowId, label: body.label ?? null })
    .select("id, label, created_at")
    .single();

  if (error) {
    const message = /duplicate key/i.test(error.message) ? "That workflow is already connected." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ connection: { ...data, workflow } }, { status: 201 });
}
