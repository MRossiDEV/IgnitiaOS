import type { Tool } from "../../types";

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

export const BrowserTool: Tool = {
  name: "Browser",

  description:
    "Website inspection tool",

  async run(input) {
    const page = input.page;

    if (page) {
      return page;
    }

    const website =
      input.url ?? input.website;

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