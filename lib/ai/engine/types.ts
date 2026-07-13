export type AgentStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed";

export interface AgentContext {
  reportId: string;
  
}

export interface AgentRunOptions<TInput, TOutput> {
  name: string;
  description?: string;

  /**
   * System prompt
   */
  prompt: string;

  /**
   * JSON Schema used by GPT Structured Outputs
   */
  schema: object;

  /**
   * Data sent to the model
   */
  input: TInput;

  /**
   * GPT model
   */
  model?: string;

  /**
   * Temperature
   */
  temperature?: number;

  /**
   * Max retries
   */
  retries?: number;

  /**
   * Context shared between agents
   */
  context: AgentContext;
}

export interface AgentUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
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

export interface BaseScores {
  score: number;
}

export interface WebsiteAudit extends BaseScores {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  quickWins: string[];
}

export interface SEOAudit extends BaseScores {
  issues: string[];
  recommendations: string[];
  keywords: string[];
}

export interface GoogleAudit extends BaseScores {
  visibility: string;
  recommendations: string[];
  strengths: string[];
}

export interface CompetitorAudit extends BaseScores {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface ConversionAudit extends BaseScores {
  frictionPoints: string[];
  recommendations: string[];
  quickWins: string[];
}

export interface StrategyAudit {
  estimatedGrowth: string;
  roadmap: string[];
  recommendedServices: string[];
  priorities: string[];
}

export interface ExecutiveSummary {
  overallScore: number;
  summary: string;
  executivePreview: string[];
  strengths: string[];
  opportunities: string[];
  quickWins: string[];
  recommendedServices: string[];
  estimatedGrowth: string;
}