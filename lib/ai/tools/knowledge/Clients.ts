import { knowledgeMemory } from "./Memory"

export const ClientKnowledge = {
  list() {
    return knowledgeMemory.listClients()
  },
  get(id: string) {
    return knowledgeMemory.getClient(id)
  },
  upsert(input: Record<string, any>) {
    return knowledgeMemory.upsertClient({
      id: input.id,
      name: String(input.name || input.clientName || "Untitled Client"),
      industry: input.industry,
      website: input.website || input.url,
      email: input.email,
      status: input.status,
      notes: input.notes,
      tags: Array.isArray(input.tags) ? input.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
    })
  },
}
