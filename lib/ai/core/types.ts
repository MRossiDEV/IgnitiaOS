// ======================================================
// IgnitiaOS
// Core Types
// ======================================================

import { WebsiteData } from "@/lib/ai/collectors/website/types";
import type { PlaceData } from "@/lib/ai/collectors/business/types";

import { SEOAudit } from "@/lib/ai/specialists/seo/types";
import { ContentAudit } from "@/lib/ai/specialists/content/types";
import { UXAudit } from "@/lib/ai/specialists/ux/types";



// ======================================================
// BUSINESS
// ======================================================

export interface BusinessMemory {

    name: string;
    website: string;
    industry: string;
    businessType: string;
    city: string;
    country: string;
    goal: string;
    challenge: string;
    competitorUrls?: string[]; 
}



// ======================================================
// COLLECTED DATA
// ======================================================

export interface CollectedMemory {
    website: WebsiteData;
    business: PlaceData | null;   // <-- add this
    google: Record<string, any>;
    social: Record<string, any>;
    competitors: { competitors: any[] };
}



// ======================================================
// AI ANALYSIS
// ======================================================

export interface AnalysisMemory {

    // Website

    website?: any;

    // Marketing

    seo?: SEOAudit;

    content?: ContentAudit;

    ux?: UXAudit;

    conversion?: any;

    branding?: any;

    copywriting?: any;

    social?: any;

    google?: any;

    reputation?: any;

    competitors?: any;

    // Technical

    performance?: any;

    accessibility?: any;

    trust?: any;

    analytics?: any;

    // Sales

    crm?: any;

    sales?: any;

    email?: any;

    strategy?: any;

}



// ======================================================
// METADATA
// ======================================================

export interface MetadataMemory {

    startedAt?: Date;

    finishedAt?: Date;

    duration?: number;

    totalTokens?: number;

    inputTokens?: number;

    outputTokens?: number;

    specialistsExecuted?: string[];
    report?: Record<string, any>;

}



// ======================================================
// COMPLETE REPORT MEMORY
// ======================================================

export interface ReportMemory {

    reportId: string;

    createdAt: Date;

    business: BusinessMemory;

    collected: CollectedMemory;

    analysis: AnalysisMemory;

    metadata: MetadataMemory;

}



// ======================================================
// AGENT TYPES
// ======================================================

export type AgentStatus =
    | "idle"
    | "running"
    | "completed"
    | "failed";

export interface AgentContext {

    reportId: string;

}

export interface AgentUsage {

    inputTokens: number;

    outputTokens: number;

    totalTokens: number;

}

export interface AgentRunOptions<TInput, TOutput> {

    name: string;

    description?: string;

    prompt: string;

    schema: object;

    input: TInput;

    model?: string;

    temperature?: number;

    retries?: number;

    context: AgentContext;

}

export interface AgentResult<T> {

    success: boolean;

    agent: string;

    duration: number;

    model: string;

    usage?: AgentUsage;

    data: T;

    error?: string;

}