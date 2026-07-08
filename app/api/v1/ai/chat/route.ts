import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/services/ai.service";

export async function GET() {
  return NextResponse.json({
    status: "online",
    provider: "anthropic",
  });
}

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    console.log(
      "REQUEST BODY:",
      JSON.stringify(body, null, 2)
    );

    const messages =
      body.messages || [];

    if (!messages.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No messages provided",
        },
        {
          status: 400,
        }
      );
    }

    const reply =
      await generateText(messages);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error(
      "================================"
    );

    console.error(
      "AI CHAT ERROR"
    );

    console.error(error);

    console.error(
      error?.message
    );

    console.error(
      error?.stack
    );

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}