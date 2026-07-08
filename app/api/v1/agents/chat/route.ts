import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateTextForAgent, type ChatMessage } from "@/services/ai.service";

type ChatRequestBody = {
  agentId?: string;
  messages?: ChatMessage[];
};

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeMessage = value as ChatMessage;

  return (
    (maybeMessage.role === "user" || maybeMessage.role === "assistant") &&
    typeof maybeMessage.content === "string" &&
    maybeMessage.content.trim().length > 0
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const agentId = typeof body.agentId === "string" ? body.agentId : "";

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: "agentId is required",
        },
        {
          status: 400,
        }
      );
    }

    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages.filter(isValidMessage).slice(-30);

    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one valid message is required",
        },
        {
          status: 400,
        }
      );
    }

    const { data: agent, error } = await supabaseAdmin
      .from("ai_agents")
      .select("id,name,category,description,system_prompt,status")
      .eq("id", agentId)
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

    if (agent.status && agent.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: `${agent.name} is not active right now`,
        },
        {
          status: 400,
        }
      );
    }

    const reply = await generateTextForAgent(messages, {
      name: agent.name,
      category: agent.category,
      description: agent.description,
      system_prompt: agent.system_prompt,
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
      },
      reply,
    });
  } catch (error) {
    console.error("/api/v1/agents/chat POST failed", error);

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
