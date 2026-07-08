import { ToolExecutor } from "@/lib/runtime/registry";

export * from "./BrowserTool";
export * from "./BrowserActions";
export * from "./BrowserCookies";
export * from "./BrowserDOM";
export * from "./BrowserDownloads";
export * from "./BrowserForms";
export * from "./BrowserNavigation";
export * from "./BrowserNetwork";
export * from "./BrowserScreenshots";
export * from "./BrowserSession";
export * from "./BrowserStorage";
export * from "./BrowserTypes";
export * from "./BrowserUtils";
export * from "./BrowserVision";
export * from "./SessionManager";
export * from "./types";
export * from "./constants";

export const BrowserTool: ToolExecutor = {
  name: "Browser",

  description:
    "Website inspection tool",

  version: "1.0.0",

  async execute({
    memory,
    node,
  }) {
    const page =
      memory.getVariable("page");

    if (page) {
      return page;
    }

    const website =
      node.config?.url ??
      memory.getVariable("website");

    if (!website) {
      throw new Error(
        "Missing website"
      );
    }

    return {
      url: website,
    };
  },
};