// ======================================================
// IgnitiaOS
// Anthropic Provider
// ======================================================

import Anthropic from "@anthropic-ai/sdk";
import { AIProvider } from "@/lib/ai/provider/aiProvider";
import { AgentResult, AgentRunOptions } from "@/lib/ai/core/types";
import { parseClaudeJSON } from "@/lib/ai/core/jsonParser";

export class AnthropicProvider implements AIProvider {

    private client = new Anthropic({ 
            apiKey: process.env.ANTHROPIC_API_KEY
        });

    async run<TInput,TOutput>(

        options:
        AgentRunOptions<
            TInput,
            TOutput
            >
        
    ):Promise<
        AgentResult<TOutput>
    > {

        const start =
            Date.now();

        try {

            const response =
                await this.client.messages.create({
                    model: options.model ?? "claude-3-5-sonnet-latest",
                    max_tokens: 4096,
                    temperature: options.temperature ?? 0.2,
                    system: options.prompt,
                    messages:[{
                            role:"user",
                        content: JSON.stringify(options.input)
                    }]
                });

            const text = response.content[0].type === "text" ? response.content[0].text : "";
            const data = parseClaudeJSON<TOutput>(text);

            return {
                success:true,
                agent: options.name,
                duration: Date.now() - start,
                model: options.model ?? "claude-3-5-sonnet-latest",
                data,
                usage:{
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens
                }
            };
        }

        catch(error:any){

            return {
                success:false,
                agent: options.name,
                duration: Date.now() - start,
                model: options.model ?? "claude-3-5-sonnet-latest",
                data:{} as TOutput,
                error:
                    error.message
            };
        }
    }
}