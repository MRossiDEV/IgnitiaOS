import { aiconn } from "@/ai/aiconn";

const BASE_SYSTEM_PROMPT = `
You are Ignitia AI.

You help manage:

- Lead generation
- Sales
- CRM
- Marketing
- Website generation
- Funnel creation
- Relocation campaigns
- Real estate campaigns

Always provide structured business-focused answers.

When possible return:

1. Strategy
2. Execution Plan
3. Recommended Actions
4. Automation Opportunities
`;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentPromptContext = {
  name?: string;
  category?: string | null;
  description?: string | null;
  system_prompt?: string | null;
};

function buildSystemPrompt(context?: AgentPromptContext): string {
  if (!context) {
    return BASE_SYSTEM_PROMPT;
  }

  const details: string[] = [];

  if (context.name) {
    details.push(`Agent Name: ${context.name}`);
  }

  if (context.category) {
    details.push(`Category: ${context.category}`);
  }

  if (context.description) {
    details.push(`Description: ${context.description}`);
  }

  return [
    BASE_SYSTEM_PROMPT.trim(),
    "",
    "Active Agent Context:",
    ...(details.length > 0 ? details : ["- Agent details not provided."]),
    "",
    "Agent-specific Instructions:",
    context.system_prompt?.trim() ||
      "Respond as a focused specialist for this selected agent.",
  ].join("\n");
}

async function generateTextWithSystem(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  try {
    const response = await aiconn.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return text;
  } catch (error) {
    console.error("GENERATE TEXT ERROR:", error);
    throw error;
  }
}

export async function generateText(
  messages: ChatMessage[]
): Promise<string> {
  return generateTextWithSystem(messages, BASE_SYSTEM_PROMPT);
}

export async function generateTextForAgent(
  messages: ChatMessage[],
  context: AgentPromptContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  return generateTextWithSystem(messages, systemPrompt);
}