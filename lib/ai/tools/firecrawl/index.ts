import type { Tool } from "../types";

export const FirecrawlTool: Tool = {
  name: "Firecrawl",

  description:
    "Website content extraction",

  async run(input) {
    const html = input.html;

    if (!html) {
      throw new Error(
        "No HTML found"
      );
    }

    const markdown = String(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      markdown,
      wordCount:
        markdown.split(" ").length,
    };
  },
};
