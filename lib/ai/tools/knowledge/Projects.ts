import { knowledgeMemory } from "./Memory"

export const ProjectKnowledge = {
  list() {
    return knowledgeMemory.listProjects()
  },
  get(id: string) {
    return knowledgeMemory.getProject(id)
  },
  upsert(input: Record<string, any>) {
    return knowledgeMemory.upsertProject({
      id: input.id,
      name: String(input.name || input.title || "Untitled Project"),
      clientId: input.clientId,
      description: input.description,
      status: input.status,
      tags: Array.isArray(input.tags) ? input.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
      summary: input.summary,
    })
  },
}
