import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function syncAgentTools(agentId: string, value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return;
  }

  const raw = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (raw.length === 0) {
    return;
  }

  const ids = raw.filter((item) => UUID_REGEX.test(item));
  const slugs = raw.filter((item) => !UUID_REGEX.test(item));

  const tools: Array<{ id: string; slug: string }> = [];

  if (ids.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("tools")
      .select("id,slug")
      .in("id", ids);

    if (error) throw error;

    tools.push(...((data ?? []) as Array<{ id: string; slug: string }>));
  }

  if (slugs.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("tools")
      .select("id,slug")
      .in("slug", slugs);

    if (error) throw error;

    for (const row of (data ?? []) as Array<{ id: string; slug: string }>) {
      if (!tools.some((item) => item.id === row.id)) {
        tools.push(row);
      }
    }
  }

  if (tools.length === 0) {
    return;
  }

  const rows = tools.map((tool) => ({
    agent_id: agentId,
    tool_id: tool.id,
    enabled: true,
  }));

  const { error: upsertError } = await supabaseAdmin
    .from("agent_tools")
    .upsert(rows, { onConflict: "agent_id,tool_id" });

  if (upsertError) throw upsertError;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const timestamp = new Date().toISOString();
    const payload = { ...body, created_at: timestamp, updated_at: timestamp };

    const { data: agent, error } = await supabaseAdmin
      .from("ai_agents")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    if (agent?.id) {
      await syncAgentTools(agent.id, body?.tools);
    }

    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/v1/agents/new]", err);
    return NextResponse.json(
      { success: false, message: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}