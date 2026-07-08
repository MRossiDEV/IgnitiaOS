import { BrowserTool } from "@/lib/tools/browser";
import { FirecrawlTool } from "@/lib/tools/firecrawl";
import { LLMTool } from "@/lib/tools/llm";
import { ReportTool } from "@/lib/tools/report";
import { DatabaseTool } from "@/lib/tools/database";
import { EmailTool } from "@/lib/tools/email";
import { VisionTool } from "@/lib/tools/vision";
import { PlaywrightTool } from "@/lib/tools/playwright";
import { FilesystemTool } from "@/lib/tools/filesystem";
import { HttpTool } from "@/lib/tools/http";
import { TerminalTool } from "@/lib/tools/terminal";
import { ConditionTool } from "@/lib/tools/condition";
import { LoopTool } from "@/lib/tools/loop";
import { MergeTool } from "@/lib/tools/merge";
import { TriggerTool } from "@/lib/tools/trigger";

export interface ToolExecutionInput {
  node: any;

  context: any;

  memory: any;
}

export interface ToolExecutor {
  name: string;

  description: string;

  version: string;

  execute(
    input: ToolExecutionInput
  ): Promise<any>;
}

export const ToolRegistry: Record<
  string,
  ToolExecutor
> = {

  trigger: TriggerTool,

  browser: BrowserTool,

  playwright: PlaywrightTool,

  firecrawl: FirecrawlTool,

  vision: VisionTool,

  llm: LLMTool,

  database: DatabaseTool,

  filesystem: FilesystemTool,

  http: HttpTool,

  terminal: TerminalTool,

  report: ReportTool,

  email: EmailTool,

  condition: ConditionTool,

  merge: MergeTool,

  loop: LoopTool,

};

export function registerTool(
  type: string,
  tool: ToolExecutor
) {
  ToolRegistry[type] = tool;
}

export function getTool(type: string) {
  const tool = ToolRegistry[type];

  if (!tool) {
    throw new Error(
      `Tool "${type}" is not registered.`
    );
  }

  return tool;
}

export function getAllTools() {
  return Object.entries(ToolRegistry).map(
    ([id, tool]) => ({
      id,

      name: tool.name,

      description: tool.description,

      version: tool.version,
    })
  );
}