import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

type Status = "queued" | "running" | "blocked" | "done" | "cancelled";
type Priority = "low" | "medium" | "high" | "critical";

const VALID_STATUS: Status[] = ["queued", "running", "blocked", "done", "cancelled"];
const VALID_PRIORITY: Priority[] = ["low", "medium", "high", "critical"];

interface RouteContext {
  params: {
    id: string;
  };
}

function normalizeStatus(value: unknown): Status {
  if (typeof value !== "string") {
    return "queued";
  }

  return VALID_STATUS.includes(value as Status) ? (value as Status) : "queued";
}

function normalizePriority(value: unknown): Priority {
  if (typeof value !== "string") {
    return "medium";
  }

  return VALID_PRIORITY.includes(value as Priority) ? (value as Priority) : "medium";
}

function parseDueAt(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { data, error } = await supabaseAdmin
      .from("agent_tasks")
      .select("*")
      .eq("agent_id", params.id)
      .order("created_at", { ascending: false });

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
      tasks: data ?? [],
    });
  } catch (error) {
    console.error("/api/v1/agents/[id]/tasks GET failed", error);

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

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "title is required",
        },
        {
          status: 400,
        }
      );
    }

    const payload = {
      agent_id: params.id,
      title,
      description:
        typeof body.description === "string" && body.description.trim().length > 0
          ? body.description.trim()
          : null,
      status: normalizeStatus(body.status),
      priority: normalizePriority(body.priority),
      due_at: parseDueAt(body.due_at),
      execution_notes:
        typeof body.execution_notes === "string" && body.execution_notes.trim().length > 0
          ? body.execution_notes.trim()
          : null,
    };

    const { data, error } = await supabaseAdmin
      .from("agent_tasks")
      .insert(payload)
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
    console.error("/api/v1/agents/[id]/tasks POST failed", error);

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
