import type { Tool } from "../types"

export type KnowledgeNamespace = "projects" | "clients" | "prompts" | "documents" | "notes"

export type KnowledgeEmbedding = {
  id: string
  text: string
  vector: number[]
  namespace: KnowledgeNamespace
  metadata: Record<string, any>
  createdAt: string
}

export type KnowledgeProject = {
  id: string
  name: string
  clientId?: string
  description?: string
  status: "active" | "paused" | "archived"
  tags: string[]
  summary?: string
  createdAt: string
  updatedAt: string
}

export type KnowledgeClient = {
  id: string
  name: string
  industry?: string
  website?: string
  email?: string
  status: "lead" | "active" | "inactive"
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type KnowledgePrompt = {
  id: string
  name: string
  category: string
  description: string
  prompt: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type KnowledgeDocument = {
  id: string
  title: string
  namespace: KnowledgeNamespace
  content: string
  metadata: Record<string, any>
  embeddingId: string
  createdAt: string
  updatedAt: string
}

export type KnowledgeSearchResult<T = any> = {
  score: number
  item: T
}

export type KnowledgeToolInput = Record<string, any>

