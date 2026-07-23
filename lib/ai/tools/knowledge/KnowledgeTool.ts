import { createEmbedding } from "./Embeddings"
import { knowledgeMemory } from "./Memory"
import { vectorSearch } from "./VectorSearch"
import { ClientKnowledge } from "./Clients"
import { PromptLibrary } from "./PromptLibrary"
import { ProjectKnowledge } from "./Projects"
import type { KnowledgeNamespace } from "./KnowledgeTypes"
import type { Tool } from "../types"

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function toNamespace(value: unknown): KnowledgeNamespace {
  const candidate = normalizeText(value).toLowerCase()
  if (candidate === "projects" || candidate === "clients" || candidate === "prompts" || candidate === "documents" || candidate === "notes") {
    return candidate
  }
  return "notes"
}

function maybeStore(memoryLike: unknown, key: string, value: any) {
  if (memoryLike && typeof memoryLike === "object" && typeof (memoryLike as any).setVariable === "function") {
    ;(memoryLike as any).setVariable(key, value)
  }
}

export const KnowledgeTool: Tool = {
  name: "knowledge_tool",
  description: "Store, search, and retrieve projects, clients, prompts, documents, and embeddings",
  async run(input) {
    const action = normalizeText(input.action || input.operation || "search").toLowerCase()

    if (action === "reset") {
      knowledgeMemory.reset()
      return { success: true, action }
    }

    if (action === "upsert_project") {
      const project = ProjectKnowledge.upsert(input)
      maybeStore(input.memory, "project", project)
      return { success: true, action, project }
    }

    if (action === "upsert_client") {
      const client = ClientKnowledge.upsert(input)
      maybeStore(input.memory, "client", client)
      return { success: true, action, client }
    }

    if (action === "upsert_prompt") {
      const prompt = PromptLibrary.upsert(input)
      maybeStore(input.memory, "prompt", prompt)
      return { success: true, action, prompt }
    }

    if (action === "upsert_document") {
      const document = knowledgeMemory.upsertDocument({
        id: input.id,
        title: String(input.title || input.name || "Untitled Document"),
        namespace: toNamespace(input.namespace || input.collection || "documents"),
        content: String(input.content || input.text || input.body || ""),
        metadata: input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {},
      })
      maybeStore(input.memory, "document", document)
      return { success: true, action, document }
    }

    if (action === "search") {
      const namespace = toNamespace(input.namespace || input.collection || "notes")
      const query = normalizeText(input.query || input.text || input.prompt || input.search || "")

      if (!query) {
        throw new Error("Missing query for knowledge search")
      }

      const queryVector = createEmbedding(query)
      const topK = Number(input.topK || input.top_k || 5)

      const candidates = knowledgeMemory.listEmbeddings(namespace)
      const results = vectorSearch(queryVector, candidates, topK)

      const payload = {
        query,
        namespace,
        count: results.length,
        results: results.map((result) => ({
          score: Number(result.score.toFixed(4)),
          id: result.item.id,
          text: result.item.text,
          metadata: result.item.metadata,
          createdAt: result.item.createdAt,
        })),
      }

      maybeStore(input.memory, "knowledgeResults", payload)
      return payload
    }

    if (action === "list_projects") {
      return { action, projects: ProjectKnowledge.list() }
    }

    if (action === "list_clients") {
      return { action, clients: ClientKnowledge.list() }
    }

    if (action === "list_prompts") {
      return { action, prompts: PromptLibrary.list() }
    }

    if (action === "index_text") {
      const namespace = toNamespace(input.namespace || "documents")
      const text = normalizeText(input.text || input.content || input.body || "")

      if (!text) {
        throw new Error("Missing text to index")
      }

      const embedding = knowledgeMemory.upsertEmbedding(namespace, text, {
        source: input.source || "manual",
        title: input.title,
      })

      maybeStore(input.memory, "embedding", embedding)
      return { action, embedding }
    }

    const searchQuery = normalizeText(input.query || input.text || input.prompt || "")

    if (searchQuery) {
      const result = vectorSearch(createEmbedding(searchQuery), knowledgeMemory.listEmbeddings(), Number(input.topK || 5))
      return {
        action: "search",
        query: searchQuery,
        count: result.length,
        results: result.map((entry) => ({
          score: Number(entry.score.toFixed(4)),
          id: entry.item.id,
          namespace: entry.item.namespace,
          text: entry.item.text,
          metadata: entry.item.metadata,
        })),
      }
    }

    return {
      action,
      projects: ProjectKnowledge.list(),
      clients: ClientKnowledge.list(),
      prompts: PromptLibrary.list(),
      documents: knowledgeMemory.listDocuments(),
    }
  },
}
