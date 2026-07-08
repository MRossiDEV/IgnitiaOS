// app/api/v1/agents/[id]/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";



interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    const { data: toolRows, error: toolsError } = await supabaseAdmin
      .from("agent_tools")
      .select(
        `
          enabled,
          configuration,
          tools (
            id,
            slug,
            name,
            category,
            description,
            icon,
            color,
            is_active,
            sort_order
          )
        `
      )
      .eq("agent_id", id)
      .order("created_at", { ascending: true });

    if (toolsError) {
      return NextResponse.json(
        {
          success: false,
          error: toolsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const { data: agent, error } = await supabaseAdmin
      .from("ai_agents")
      .select('*')
      .eq("id", id)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || "Agent not found",
        },
        {
          status: error ? 500 : 404,
        }
      );
    }

    const runs = agent.agent_runs ?? [];

    const tools = (toolRows ?? [])
      .map((row: any) => {
        const tool = Array.isArray(row.tools) ? row.tools[0] : row.tools;

        if (!tool) {
          return null;
        }

        return {
          id: tool.id,
          slug: tool.slug,
          name: tool.name,
          category: tool.category,
          description: tool.description,
          icon: tool.icon,
          color: tool.color,
          is_active: tool.is_active,
          sort_order: tool.sort_order,
          enabled: Boolean(row.enabled),
          configuration:
            row.configuration && typeof row.configuration === "object"
              ? row.configuration
              : null,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const categoryCompare = String(a.category ?? "").localeCompare(
          String(b.category ?? "")
        );

        if (categoryCompare !== 0) return categoryCompare;

        return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      });

    const stats = {
      total_runs: runs.length,

      success_runs: runs.filter(
        (r: any) => r.status === "success"
      ).length,

      failed_runs: runs.filter(
        (r: any) => r.status === "failed"
      ).length,

      avg_duration:
        runs.length > 0
          ? Math.round(
              runs.reduce(
                (sum: number, r: any) =>
                  sum + (r.duration_ms ?? 0),
                0
              ) / runs.length
            )
          : 0,

      total_tokens: runs.reduce(
        (sum: number, r: any) =>
          sum + (r.total_tokens ?? 0),
        0
      ),

      total_cost: Number(
        runs
          .reduce(
            (sum: number, r: any) =>
              sum + Number(r.total_cost ?? 0),
            0
          )
          .toFixed(4)
      ),
    };

    return NextResponse.json({
      success: true,
      agent,
      tools,
      recent_runs: runs
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 20),
      stats,
    });
  } catch (err: unknown) {
    console.error("/api/v1/agents/[id] GET failed:", err);

    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = params
    const body = await req.json()

    const payload = { ...body, updated_at: new Date().toISOString() }

    const { data, error } = await supabaseAdmin
      .from("ai_agents")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase Update Error:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, message: "Agent not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, agent: data })
  } catch (err: any) {
    console.error("/api/v1/agents/[id] PUT failed:", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}