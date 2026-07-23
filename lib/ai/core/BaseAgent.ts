// ======================================================
// IgnitiaOS
// Base Agent
// ======================================================

import { runAgent } from "./agentRunner";
import { ReportMemory } from "./types";
import { AgentResult, AgentRunOptions } from "./types";

export abstract class BaseAgent<TInput, TOutput >{
    abstract readonly id:string;
    abstract readonly name:string;
    abstract readonly description:string;
    abstract readonly prompt:string;
    abstract readonly schema:object;
    model:string = "claude-sonnet-5";
    temperature:number = 0.2;
    /**
     * Extract only the information
     * needed by this specialist.
     */
    protected abstract buildInput(
        memory:ReportMemory
    ):TInput;

    /**
     * Store the result
     * back into shared memory.
     */
    protected abstract saveResult(
        memory:ReportMemory,
        result:TOutput
    ):void;

    async execute(
        memory:ReportMemory
    ):Promise<AgentResult<TOutput>>{
        const result = await runAgent<

                TInput,

                TOutput

            >({
                name:
                    this.name,
                description:
                    this.description,
                prompt:
                    this.prompt,
                schema:
                    this.schema,
                model:
                    this.model,
                temperature:
                    this.temperature,
                input:
                    this.buildInput(
                        memory
                    ),

                context: {
                    reportId: memory.reportId
                },
            });

        // Record token usage for this specialist into per-report memory so
        // the report's total cost can be computed later (concurrency-safe,
        // unlike the global tokenTracker map).
        if(result.usage){
            const usageByAgent = ((memory.metadata as Record<string, any>).usageByAgent ??= []);
            usageByAgent.push({
                agent: this.name,
                model: result.model,
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
                totalTokens: result.usage.totalTokens,
            });
        }

        if(result.success){
            this.saveResult(
                memory,
                result.data
            );
        } else {
            // Record why this specialist produced nothing so the caller can
            // surface a real reason (e.g. billing, model access) instead of a
            // generic "no analysis" message. PipelineRunner does not propagate
            // per-task failures, so this is how they reach the report.
            const errors = ((memory.metadata as Record<string, any>).agentErrors ??= []);
            errors.push({ agent: this.name, error: result.error });
        }

        return result;
    }
}