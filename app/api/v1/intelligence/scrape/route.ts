// ======================================================
// /api/v1/intelligence/scrape
// ======================================================
// Triggers every workflow connected via the Property Intelligence
// settings panel (re_connected_workflows) — usually workflows built
// around the "Scrape Real Estate Listings" node. This route has no
// portal/URL logic of its own: which site(s), pagination, selectors,
// and extraction schema all live in each workflow's node config.
//
// GET  — Vercel Cron's trigger (see vercel.json). Vercel issues a
//        GET request and, if CRON_SECRET is set in the project's
//        env vars, adds "Authorization: Bearer <CRON_SECRET>"
//        automatically — that's Vercel's own mechanism, not ours.
// POST — manual/external trigger, following the same
//        x-ignitia-scheduler-secret header convention as
//        app/api/v1/social/instagram/scheduler/route.ts.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

function isAuthorizedCron(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) return true;
  return req.headers.get("authorization") === `Bearer ${configuredSecret}`;
}

function isAuthorizedManual(req: NextRequest) {
  const configuredSecret = process.env.INTELLIGENCE_SCHEDULER_SECRET;
  if (!configuredSecret) return true;
  return req.headers.get("x-ignitia-scheduler-secret") === configuredSecret;
}

async function runConnectedWorkflows() {
  const { data: connections, error } = await supabaseAdmin
    .from("re_connected_workflows")
    .select("id, workflow_id");

  if (error) throw new Error(`Failed to load connected workflows: ${error.message}`);
  if (!connections || connections.length === 0) {
    throw new Error(
      "No workflows connected yet. Open Property Intelligence's settings panel and connect one built " +
        "around the 'Scrape Real Estate Listings' node."
    );
  }

  const results = await Promise.all(
    connections.map(async (c) => {
      try {
        const run = await WorkflowService.run(c.workflow_id, "cron");
        return { workflowId: c.workflow_id, success: true, runId: run.id, status: run.status };
      } catch (err: any) {
        return { workflowId: c.workflow_id, success: false, error: err.message };
      }
    })
  );

  return { triggered: results.length, results };
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runConnectedWorkflows();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedManual(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized scheduler request" }, { status: 401 });
  }

  try {
    const result = await runConnectedWorkflows();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
