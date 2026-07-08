import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

type ToolAssignmentInput = {
  id?: string;
  tool_id?: string;
  slug?: string;
  enabled?: boolean;
  configuration?: Record<string, unknown> | null;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseToolsInput(value: unknown): ToolAssignmentInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const raw = item.trim();
        if (!raw) return null;

        if (UUID_REGEX.test(raw)) {
          return { id: raw, enabled: true };
        }

        return { slug: raw, enabled: true };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const input = item as ToolAssignmentInput;

      const id = typeof input.id === "string" ? input.id.trim() : "";
      const toolId =
        typeof input.tool_id === "string" ? input.tool_id.trim() : "";
      const slug = typeof input.slug === "string" ? input.slug.trim() : "";

      const configuration =
        input.configuration &&
        typeof input.configuration === "object" &&
        !Array.isArray(input.configuration)
          ? input.configuration
          : null;

      if (id) {
        return {
          id,
          enabled: input.enabled ?? true,
          configuration,
        };
      }

      if (toolId) {
        return {
          id: toolId,
          enabled: input.enabled ?? true,
          configuration,
        };
      }

      if (slug) {
        return {
          slug,
          enabled: input.enabled ?? true,
          configuration,
        };
      }

      return null;
    })
    .filter((item): item is ToolAssignmentInput => Boolean(item));
}

async function fetchAgentTools(agentId: string) {
  const { data: catalogRows, error: catalogError } = await supabaseAdmin
    .from("tools")
    .select(
      "id,slug,name,category,description,icon,color,is_active,sort_order"
    )
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (catalogError) {
    throw new Error(catalogError.message);
  }

  const { data, error } = await supabaseAdmin
    .from("agent_tools")
    .select(
      `
        enabled,
        configuration,
        tool_id
      `
    )
    .eq("agent_id", agentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const assignmentByToolId = new Map<
    string,
    { enabled: boolean; configuration: Record<string, unknown> | null }
  >();

  for (const row of data ?? []) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const toolId = (row as any).tool_id;

    if (typeof toolId !== "string") {
      continue;
    }

    assignmentByToolId.set(toolId, {
      enabled: Boolean((row as any).enabled),
      configuration:
        (row as any).configuration && typeof (row as any).configuration === "object"
          ? (row as any).configuration
          : null,
    });
  }

  return (catalogRows ?? []).map((tool: any) => {
    const assignment = assignmentByToolId.get(tool.id);

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
      enabled: assignment?.enabled ?? false,
      configuration: assignment?.configuration ?? null,
    };
  });
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    const tools = await fetchAgentTools(id);

    return NextResponse.json({
      success: true,
      tools,
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/agents/[id]/tools]", err);

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
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: agentId } = params;

    const body = await req.json();
    const requested = parseToolsInput(body?.tools);

    const idSet = new Set<string>();
    const slugSet = new Set<string>();

    for (const item of requested) {
      if (item.id) {
        idSet.add(item.id);
      }

      if (item.slug) {
        slugSet.add(item.slug);
      }
    }

    const requestedIds = Array.from(idSet).filter((value) => UUID_REGEX.test(value));
    const requestedSlugs = Array.from(slugSet);

    const toolRows: Array<{ id: string; slug: string }> = [];

    if (requestedIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("tools")
        .select("id,slug")
        .in("id", requestedIds);

      if (error) {
        throw new Error(error.message);
      }

      toolRows.push(...((data ?? []) as Array<{ id: string; slug: string }>));
    }

    if (requestedSlugs.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("tools")
        .select("id,slug")
        .in("slug", requestedSlugs);

      if (error) {
        throw new Error(error.message);
      }

      for (const row of (data ?? []) as Array<{ id: string; slug: string }>) {
        if (!toolRows.some((item) => item.id === row.id)) {
          toolRows.push(row);
        }
      }
    }

    const byId = new Map<string, { id: string; slug: string }>();
    const bySlug = new Map<string, { id: string; slug: string }>();

    for (const tool of toolRows) {
      byId.set(tool.id, tool);
      bySlug.set(tool.slug, tool);
    }

    const assignmentMap = new Map<
      string,
      { agent_id: string; tool_id: string; enabled: boolean; configuration: Record<string, unknown> | null }
    >();

    for (const item of requested) {
      const resolved = item.id ? byId.get(item.id) : item.slug ? bySlug.get(item.slug) : null;

      if (!resolved) {
        continue;
      }

      assignmentMap.set(resolved.id, {
        agent_id: agentId,
        tool_id: resolved.id,
        enabled: item.enabled ?? true,
        configuration: item.configuration ?? null,
      });
    }

    const desiredToolIds = Array.from(assignmentMap.keys());

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agent_tools")
      .select("tool_id")
      .eq("agent_id", agentId);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingToolIds = new Set(
      (existingRows ?? [])
        .map((row: any) => row.tool_id)
        .filter((value: unknown): value is string => typeof value === "string")
    );

    const toDelete = Array.from(existingToolIds).filter(
      (toolId) => !desiredToolIds.includes(toolId)
    );

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("agent_tools")
        .delete()
        .eq("agent_id", agentId)
        .in("tool_id", toDelete);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    const upserts = Array.from(assignmentMap.values());

    if (upserts.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("agent_tools")
        .upsert(upserts, { onConflict: "agent_id,tool_id" });

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    }

    const tools = await fetchAgentTools(agentId);

    return NextResponse.json({
      success: true,
      tools,
    });
  } catch (err: unknown) {
    console.error("[PUT /api/v1/agents/[id]/tools]", err);

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
