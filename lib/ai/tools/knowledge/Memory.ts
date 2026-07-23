import { createEmbedding } from "./Embeddings"
import type { KnowledgeDocument, KnowledgeEmbedding, KnowledgeNamespace, KnowledgePrompt, KnowledgeProject, KnowledgeClient } from "./KnowledgeTypes"

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function now() {
  return new Date().toISOString()
}

class KnowledgeMemoryStore {
  private embeddings = new Map<string, KnowledgeEmbedding>()
  private projects = new Map<string, KnowledgeProject>()
  private clients = new Map<string, KnowledgeClient>()
  private prompts = new Map<string, KnowledgePrompt>()
  private documents = new Map<string, KnowledgeDocument>()

  upsertEmbedding(namespace: KnowledgeNamespace, text: string, metadata: Record<string, any> = {}) {
    const id = createId("emb")
    const embedding: KnowledgeEmbedding = {
      id,
      text,
      vector: createEmbedding(text),
      namespace,
      metadata,
      createdAt: now(),
    }

    this.embeddings.set(id, embedding)
    return embedding
  }

  listEmbeddings(namespace?: KnowledgeNamespace) {
    return [...this.embeddings.values()].filter((embedding) => !namespace || embedding.namespace === namespace)
  }

  getEmbedding(id: string) {
    return this.embeddings.get(id)
  }

  upsertProject(project: Partial<KnowledgeProject> & Pick<KnowledgeProject, "name">) {
    const id = project.id || createId("proj")
    const existing = this.projects.get(id)
    const record: KnowledgeProject = {
      id,
      name: project.name,
      clientId: project.clientId ?? existing?.clientId,
      description: project.description ?? existing?.description,
      status: project.status ?? existing?.status ?? "active",
      tags: project.tags ?? existing?.tags ?? [],
      summary: project.summary ?? existing?.summary,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    }

    this.projects.set(id, record)
    return record
  }

  listProjects() {
    return [...this.projects.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  getProject(id: string) {
    return this.projects.get(id)
  }

  upsertClient(client: Partial<KnowledgeClient> & Pick<KnowledgeClient, "name">) {
    const id = client.id || createId("client")
    const existing = this.clients.get(id)
    const record: KnowledgeClient = {
      id,
      name: client.name,
      industry: client.industry ?? existing?.industry,
      website: client.website ?? existing?.website,
      email: client.email ?? existing?.email,
      status: client.status ?? existing?.status ?? "lead",
      notes: client.notes ?? existing?.notes,
      tags: client.tags ?? existing?.tags ?? [],
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    }

    this.clients.set(id, record)
    return record
  }

  listClients() {
    return [...this.clients.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  getClient(id: string) {
    return this.clients.get(id)
  }

  upsertPrompt(prompt: Partial<KnowledgePrompt> & Pick<KnowledgePrompt, "name" | "category" | "description" | "prompt">) {
    const id = prompt.id || createId("prompt")
    const existing = this.prompts.get(id)
    const record: KnowledgePrompt = {
      id,
      name: prompt.name,
      category: prompt.category,
      description: prompt.description,
      prompt: prompt.prompt,
      tags: prompt.tags ?? existing?.tags ?? [],
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    }

    this.prompts.set(id, record)
    return record
  }

  listPrompts() {
    return [...this.prompts.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  getPrompt(id: string) {
    return this.prompts.get(id)
  }

  upsertDocument(document: Partial<KnowledgeDocument> & Pick<KnowledgeDocument, "title" | "namespace" | "content">) {
    const id = document.id || createId("doc")
    const embedding = this.upsertEmbedding(document.namespace, document.content, {
      title: document.title,
      documentId: id,
    })
    const existing = this.documents.get(id)
    const record: KnowledgeDocument = {
      id,
      title: document.title,
      namespace: document.namespace,
      content: document.content,
      metadata: document.metadata ?? existing?.metadata ?? {},
      embeddingId: embedding.id,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    }

    this.documents.set(id, record)
    return record
  }

  listDocuments(namespace?: KnowledgeNamespace) {
    return [...this.documents.values()].filter((document) => !namespace || document.namespace === namespace)
  }

  getDocument(id: string) {
    return this.documents.get(id)
  }

  reset() {
    this.embeddings.clear()
    this.projects.clear()
    this.clients.clear()
    this.prompts.clear()
    this.documents.clear()
  }
}

export const knowledgeMemory = new KnowledgeMemoryStore()
