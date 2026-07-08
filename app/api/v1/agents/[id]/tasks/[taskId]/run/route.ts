import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateTextForAgent } from "@/services/ai.service";

interface RouteContext {
  params: {
    id: string;
    taskId: string;
  };
}

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const { data: agent, error: agentError } = await supabaseAdmin
      .from("ai_agents")
      .select("id,name,category,description,system_prompt,status")
      .eq("id", params.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        {
          success: false,
          error: agentError?.message || "Agent not found",
        },
        {
          status: 404,
        }
      );
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from("agent_tasks")
      .select("*")
      .eq("id", params.taskId)
      .eq("agent_id", params.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        {
          success: false,
          error: taskError?.message || "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    const runPrompt = [
      `You are ${agent.name}, an operational AI worker for real business execution.`,
      "Execute the task below in a practical way and return a concise execution report.",
      "",
      `Task title: ${task.title}`,
      `Priority: ${task.priority}`,
      `Status: ${task.status}`,
      `Due date: ${task.due_at ?? "not set"}`,
      `Description: ${task.description ?? "No description"}`,
      `Execution notes: ${task.execution_notes ?? "No notes"}`,
      "",
      "Your response must include:",
      "1) Immediate actions taken now",
      "2) Real-world deliverables produced",
      "3) Blockers and dependencies",
      "4) Next step with owner and ETA",
    ].join("\n");

    const reply = await generateTextForAgent(
      [
        {
          role: "user",
          content: runPrompt,
        },
      ],
      {
        name: agent.name,
        category: agent.category,
        description: agent.description,
        system_prompt: agent.system_prompt,
      }
    );

    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from("agent_tasks")
      .update({
        status: "running",
        last_run_at: new Date().toISOString(),
        last_run_result: reply,
      })
      .eq("id", params.taskId)
      .eq("agent_id", params.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      execution: reply,
    });
  } catch (error) {
    console.error("/api/v1/agents/[id]/tasks/[taskId]/run POST failed", error);

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
