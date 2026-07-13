import { runAgent } from "../engine/runner";

import {
  SEOSchema,
  SEOOutput,
} from "../engine/schemas";

import {
  AgentContext,
  AgentResult,
} from "../engine/types";

import { seoPrompt } from "../prompts/seo";


export interface SEOAgentInput {

  businessName: string;
  website?: string;
  industry?: string;
  businessType?: string;
  country?: string;
  city?: string;
  primaryGoal?: string;
}


export async function seoAgent(
  input: SEOAgentInput,
  context: AgentContext,
): Promise<AgentResult<SEOOutput>> {

  return runAgent<SEOAgentInput, SEOOutput>({
    
    name: "SEO Specialist",
    description: "Analyzes search visibility, SEO opportunities and keyword strategy.",
    prompt: seoPrompt,
    schema: SEOSchema,
    input,
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    retries: 2,
    context,
  });
}