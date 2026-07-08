import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

type Status = "queued" | "running" | "blocked" | "done" | "cancelled";
type Priority = "low" | "medium" | "high" | "critical";

const VALID_STATUS: Status[] = ["queued", "running", "blocked", "done", "cancelled"];
const VALID_PRIORITY: Priority[] = ["low", "medium", "high", "critical"];

interface RouteContext {
  params: {
    id: string;
    taskId: string;
  };
}

function maybeStatus(value: unknown): Status | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return VALID_STATUS.includes(value as Status) ? (value as Status) : undefined;
}

function maybePriority(value: unknown): Priority | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return VALID_PRIORITY.includes(value as Priority) ? (value as Priority) : undefined;
}

function maybeDueAt(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          {
            success: false,
            error: "title cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      updates.title = title;
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim() || null;
    }

    if (body.description === null) {
      updates.description = null;
    }

    const status = maybeStatus(body.status);

    if (typeof body.status !== "undefined" && !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    if (status) {
      updates.status = status;
    }

    const priority = maybePriority(body.priority);

    if (typeof body.priority !== "undefined" && !priority) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid priority",
        },
        {
          status: 400,
        }
      );
    }

    if (priority) {
      updates.priority = priority;
    }

    const dueAt = maybeDueAt(body.due_at);

    if (typeof body.due_at !== "undefined" && typeof dueAt === "undefined") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid due_at",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof dueAt !== "undefined") {
      updates.due_at = dueAt;
    }

    if (typeof body.execution_notes === "string") {
      updates.execution_notes = body.execution_notes.trim() || null;
    }

    if (body.execution_notes === null) {
      updates.execution_notes = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields provided",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("agent_tasks")
      .update(updates)
      .eq("id", params.taskId)
      .eq("agent_id", params.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      task: data,
    });
  } catch (error) {
    console.error("/api/v1/agents/[id]/tasks/[taskId] PUT failed", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { error } = await supabaseAdmin
      .from("agent_tasks")
      .delete()
      .eq("id", params.taskId)
      .eq("agent_id", params.id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("/api/v1/agents/[id]/tasks/[taskId] DELETE failed", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      {
        status: 500,
      }
    );
  }
}
