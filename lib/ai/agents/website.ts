import { runAgent } from "../engine/runner";

import {
  WebsiteSchema,
  WebsiteOutput,
} from "../engine/schemas";

import {
  AgentContext,
  AgentResult,
} from "../engine/types";

import { websitePrompt } from "../prompts/website";


export interface WebsiteAgentInput {
  businessName: string;
  website?: string;
  industry?: string;
  businessType?: string;
  country?: string;
  city?: string;
}


export async function websiteAgent(
  input: WebsiteAgentInput,
  context: AgentContext,
): Promise<AgentResult<WebsiteOutput>> {

  return runAgent<WebsiteAgentInput, WebsiteOutput>({
    name: "Website Auditor",
    description: "Analyzes website quality, UX, trust and conversion potential.",
    prompt: websitePrompt,
    schema: WebsiteSchema,
    input,
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    retries: 2,
    context,
  });
}