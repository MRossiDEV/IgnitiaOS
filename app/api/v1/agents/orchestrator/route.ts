import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

import {
  COLLECTION_AGENTS,
  SNAPSHOT_AGENTS,
  PREMIUM_AGENTS,
} from "@/lib/agents/report-agents";

async function runAgent(
  reportId: string,
  endpoint: string,
  agentName: string
) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const started = new Date();

  const { data: log } = await supabaseAdmin
    .from("report_agent_runs")
    .insert({
      report_id: reportId,
      agent: agentName,
      status: "running",
      started_at: started,
    })
    .select()
    .single();

  try {
    const response = await fetch(`${appUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const json = await response.json();

    await supabaseAdmin
      .from("report_agent_runs")
      .update({
        status: "completed",
        response: json,
        finished_at: new Date(),
        duration_ms: Date.now() - started.getTime(),
      })
      .eq("id", log.id);

    return json;
  } catch (err: any) {
    await supabaseAdmin
      .from("report_agent_runs")
      .update({
        status: "failed",
        error: err.message,
        finished_at: new Date(),
        duration_ms: Date.now() - started.getTime(),
      })
      .eq("id", log.id);

    throw err;
  }
}

async function executeAgents(
  reportId: string,
  agents: typeof COLLECTION_AGENTS
) {
  for (const agent of agents.sort((a, b) => a.order - b.order)) {
    await runAgent(reportId, agent.endpoint, agent.name);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const reportId = body.reportId;

    const stage =
      body.stage || "snapshot";

    if (!reportId) {
      return NextResponse.json(
        {
          error: "Missing reportId",
        },
        {
          status: 400,
        }
      );
    }

    await supabaseAdmin
      .from("reports")
      .update({
        status: "running",
      })
      .eq("id", reportId);

    switch (stage) {
      case "snapshot":
        await executeAgents(reportId, COLLECTION_AGENTS);
        await executeAgents(reportId, SNAPSHOT_AGENTS);

        await supabaseAdmin
          .from("reports")
          .update({
            snapshot_completed: true,
            snapshot_generated_at: new Date(),
            status: "snapshot_complete",
          })
          .eq("id", reportId);

        break;

      case "premium":
        await executeAgents(reportId, PREMIUM_AGENTS);

        await supabaseAdmin
          .from("reports")
          .update({
            premium_completed: true,
            premium_generated_at: new Date(),
            status: "completed",
          })
          .eq("id", reportId);

        break;

      default:
        return NextResponse.json(
          {
            error: "Invalid stage",
          },
          {
            status: 400,
          }
        );
    }

    return NextResponse.json({
      success: true,
      reportId,
      stage,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}