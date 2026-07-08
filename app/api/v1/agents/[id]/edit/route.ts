import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function syncAgentTools(agentId: string, value: unknown) {
  if (!Array.isArray(value)) {
    return;
  }

  const raw = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

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

  const desiredIds = tools.map((tool) => tool.id);

  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from("agent_tools")
    .select("tool_id")
    .eq("agent_id", agentId);

  if (existingError) throw existingError;

  const existingIds = (existingRows ?? [])
    .map((row: any) => row.tool_id)
    .filter((item: unknown): item is string => typeof item === "string");

  const toDelete = existingIds.filter((item) => !desiredIds.includes(item));

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("agent_tools")
      .delete()
      .eq("agent_id", agentId)
      .in("tool_id", toDelete);

    if (deleteError) throw deleteError;
  }

  if (desiredIds.length > 0) {
    const rows = desiredIds.map((toolId) => ({
      agent_id: agentId,
      tool_id: toolId,
      enabled: true,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from("agent_tools")
      .upsert(rows, { onConflict: "agent_id,tool_id" });

    if (upsertError) throw upsertError;
  }
}

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await req.json();

    const payload = { ...body, updated_at: new Date().toISOString() };

    const { data: agent, error } = await supabaseAdmin
      .from("ai_agents")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Agent not found." },
        { status: 404 }
      );
    }

    await syncAgentTools(id, body?.tools);

    return NextResponse.json({ success: true, agent });
  } catch (err: any) {
    console.error("[PUT /api/v1/agents/[id]/edit]", err);
    return NextResponse.json(
      { success: false, message: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
