// ======================================================
// Token Tracker
// ======================================================

import { AgentUsage } from "./types";



const usage = new Map<

    string,

    AgentUsage

>();



export function registerUsage(

    agent:string,

    data:AgentUsage

){

    usage.set(agent,data);

}



export function getUsage(

    agent:string

){

    return usage.get(agent);

}



export function getAllUsage(){

    return [...usage.entries()];

}



export function getTotalTokens(){

    let total = 0;

    for(const [,item] of usage){

        total += item.totalTokens;

    }

    return total;

}



export function clearUsage(){

    usage.clear();

}



// ======================================================
// Cost calculator
// ======================================================
// Per-model pricing in USD per 1,000,000 tokens. Keep these in sync with
// Anthropic's current pricing (https://www.anthropic.com/pricing). The
// pipeline defaults to claude-sonnet-5.

export interface ModelPricing {
    inputPerMTok: number;
    outputPerMTok: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
    "claude-sonnet-5": { inputPerMTok: 3, outputPerMTok: 15 },
    "claude-opus-4-8": { inputPerMTok: 15, outputPerMTok: 75 },
    "claude-haiku-4-5-20251001": { inputPerMTok: 1, outputPerMTok: 5 },
};

export const DEFAULT_PRICING: ModelPricing =
    MODEL_PRICING["claude-sonnet-5"];

export function getPricing(model?: string): ModelPricing {
    return (model && MODEL_PRICING[model]) || DEFAULT_PRICING;
}

/**
 * Estimated USD cost for a single usage record on a given model.
 */
export function estimateCost(
    tokens: { inputTokens: number; outputTokens: number },
    model?: string
): number {
    const price = getPricing(model);
    const input = (tokens.inputTokens / 1_000_000) * price.inputPerMTok;
    const output = (tokens.outputTokens / 1_000_000) * price.outputPerMTok;
    return input + output;
}

export interface UsageRecord extends AgentUsage {
    agent?: string;
    model?: string;
}

export interface UsageSummary {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    model?: string;
    byAgent: {
        agent: string;
        model?: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        cost: number;
    }[];
}

/**
 * Rolls a set of per-agent usage records into totals + estimated cost.
 * Used to cost a single report run.
 */
export function summarizeUsage(records: UsageRecord[]): UsageSummary {
    const byAgent = records.map((r) => ({
        agent: r.agent ?? "unknown",
        model: r.model,
        inputTokens: r.inputTokens ?? 0,
        outputTokens: r.outputTokens ?? 0,
        totalTokens: r.totalTokens ?? (r.inputTokens ?? 0) + (r.outputTokens ?? 0),
        cost: estimateCost(
            { inputTokens: r.inputTokens ?? 0, outputTokens: r.outputTokens ?? 0 },
            r.model
        ),
    }));

    const inputTokens = byAgent.reduce((s, r) => s + r.inputTokens, 0);
    const outputTokens = byAgent.reduce((s, r) => s + r.outputTokens, 0);
    const totalTokens = byAgent.reduce((s, r) => s + r.totalTokens, 0);
    const cost = byAgent.reduce((s, r) => s + r.cost, 0);

    return {
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        model: records[0]?.model,
        byAgent,
    };
}