export type Agent = {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  avatar: string | null;
  icon: string | null;
  category: string | null;
  status: string;
  model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  slug: string | null;
  version: string | null;
  provider: string | null;
  reasoning: string | null;
  response_format: string | null;
  visibility: string | null;
  tools: unknown[] | null;
  workflow: unknown[] | null;
  personality_preset: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type AgentsTab =
  | "overview"
  | "performance"
  | "configuration"
  | "logs";