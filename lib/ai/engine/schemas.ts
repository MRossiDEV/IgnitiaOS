import { z } from "zod";

/* ============================================================
   COMMON
============================================================ */
export const ScoreSchema = z.number().int().min(0).max(100);
export const StringArraySchema = z
  .array(z.string().min(1))
  .default([]);

/* ============================================================
   WEBSITE AGENT
============================================================ */
export const WebsiteSchema = z.object({
  score: ScoreSchema,
  summary: z.string(),
  strengths: StringArraySchema,
  weaknesses: StringArraySchema,
  quickWins: StringArraySchema,
});

export type WebsiteOutput = z.infer<typeof WebsiteSchema>;

/* ============================================================
   SEO AGENT
============================================================ */
export const SEOSchema = z.object({
  score: ScoreSchema,

  issues: StringArraySchema,
  recommendations: StringArraySchema,
  keywords: StringArraySchema,
});

export type SEOOutput = z.infer<typeof SEOSchema>;

/* ============================================================
   GOOGLE BUSINESS AGENT
============================================================ */
export const GoogleSchema = z.object({
  score: ScoreSchema,
  visibility: z.string(),
  strengths: StringArraySchema,
  recommendations: StringArraySchema,
});

export type GoogleOutput = z.infer<typeof GoogleSchema>;

/* ============================================================
   COMPETITOR AGENT
============================================================ */
export const CompetitorSchema = z.object({
  score: ScoreSchema,
  strengths: StringArraySchema,
  weaknesses: StringArraySchema,
  opportunities: StringArraySchema,
});

export type CompetitorOutput = z.infer<
  typeof CompetitorSchema
>;

/* ============================================================
   CONVERSION AGENT
============================================================ */
export const ConversionSchema = z.object({
  score: ScoreSchema,
  frictionPoints: StringArraySchema,
  recommendations: StringArraySchema,
  quickWins: StringArraySchema,
});

export type ConversionOutput = z.infer<
  typeof ConversionSchema
>;

/* ============================================================
   STRATEGY AGENT
============================================================ */
export const StrategySchema = z.object({
  estimatedGrowth: z.string(),
  roadmap: StringArraySchema,
  priorities: StringArraySchema,
  recommendedServices: StringArraySchema,
});

export type StrategyOutput = z.infer<
  typeof StrategySchema
>;

/* ============================================================
   EXECUTIVE AGENT
============================================================ */
export const ExecutiveSchema = z.object({
  overallScore: ScoreSchema,
  summary: z.string(),
  executivePreview: StringArraySchema,
  strengths: StringArraySchema,
  opportunities: StringArraySchema,
  quickWins: StringArraySchema,
  recommendedServices: StringArraySchema,
  estimatedGrowth: z.string(),
});

export type ExecutiveOutput = z.infer<
  typeof ExecutiveSchema
>;

/* ============================================================
   COMPLETE PIPELINE
============================================================ */
export const PipelineSchema = z.object({
  website: WebsiteSchema.optional(),
  seo: SEOSchema.optional(),
  google: GoogleSchema.optional(),
  competitor: CompetitorSchema.optional(),
  conversion: ConversionSchema.optional(),
  strategy: StrategySchema.optional(),
  executive: ExecutiveSchema.optional(),
});

export type PipelineResults = z.infer<
  typeof PipelineSchema
>;