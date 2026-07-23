import { runAgent } from "../engine/runner";
import { z } from "zod";
import { WebsiteMemory } from "../memory/temporary";
import { AgentContext } from "../engine/types";

const WebsiteAnalysisSchema = z.object({
  summary: z.string(),
  extracted: z.object({
      businessName: z.string().optional(),
      services: z.array(z.string()),
      products: z.array(z.string()),
      callsToAction: z.array(z.string()),
      contacts: z.array(z.string()),
      socialLinks: z.array(z.string()),
    }),
});

export type WebsiteAnalysis = z.infer<typeof WebsiteAnalysisSchema>;

const analyzerPrompt = `
    You are the Website Intelligence Agent inside IgnitiaAI.
    Analyze the crawled website content.
    Your job is NOT to create the final report.
    Your job is to create a clean internal summary that other AI agents will use.

    Extract:
    - Business identity
    - Services offered
    - Products
    - Calls to action
    - Contact information
    - Social links
    - Main value proposition
    - Target customers
    - Important website observations

    Rules:
    - Only use information found in the website content.
    - Do not invent missing data.
    - Keep the summary factual.
    - Return only JSON.

    Format:
    {
        "summary":"",
        "extracted":{
            "businessName":"",
            "services":[],
            "products":[],
            "callsToAction":[],
            "contacts":[],
            "socialLinks":[]
        }
    }`;

export async function analyzeWebsite(
    website: WebsiteMemory,
    context: AgentContext
    ): Promise<WebsiteMemory> {

    const result = await runAgent<WebsiteMemory, WebsiteAnalysis>(
        {
            name: "Website Intelligence Agent",
            description: "Creates temporary website knowledge memory.",
            prompt: analyzerPrompt,
            schema: WebsiteAnalysisSchema,
            input: website,
            model: "claude-sonnet-4-20250514",
            temperature: 0.1,
            retries: 2,
            context,
        });

    if(!result.success){
        return website;
    }

    return {
        ...website,
        extracted: result.data.extracted,
        summary: result.data.summary,
    };
}