import { ToolExecutor } from "@/lib/runtime/registry";

export const FirecrawlTool: ToolExecutor = {
  name: "Firecrawl",

  description:
    "Website content extraction",

  version: "1.0.0",

  async execute({
    memory,
  }) {
    const html =
      memory.getVariable("html");

    if (!html) {
      throw new Error(
        "No HTML found"
      );
    }

    const markdown = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const result = {
      markdown,
      wordCount:
        markdown.split(" ").length,
    };

    memory.setVariable(
      "markdown",
      markdown
    );

    memory.setVariable(
      "content",
      result
    );

    return result;
  },
};