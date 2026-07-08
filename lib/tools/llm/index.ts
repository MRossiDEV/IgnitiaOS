import { ToolExecutor } from "@/lib/runtime/registry";

export const LLMTool: ToolExecutor = {
  name: "LLM",

  description:
    "AI reasoning engine",

  version: "1.0.0",

  async execute({
    node,
    context,
    memory,
  }) {
    const prompt =
      node.config?.prompt ??
      "Analyze this website";

    const markdown =
      memory.getVariable(
        "markdown"
      ) ?? "";

    const completion =
      await context.openai.chat.completions.create(
        {
          model: "gpt-5.5",

          messages: [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: markdown.slice(
                0,
                12000
              ),
            },
          ],
        }
      );

    const response =
      completion.choices[0]
        ?.message?.content ?? "";

    memory.setVariable(
      "analysis",
      response
    );

    return {
      analysis: response,
    };
  },
};