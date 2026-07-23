import { knowledgeMemory } from "./Memory"

const DEFAULT_PROMPTS = [
  {
    name: "Website Audit Summary",
    category: "reporting",
    description: "Summarize website audit findings into client-ready language",
    prompt: "Summarize the findings, explain impact, and list next actions in a clear executive format.",
    tags: ["audit", "report", "summary"],
  },
  {
    name: "Lead Qualification",
    category: "sales",
    description: "Classify whether a lead is worth pursuing",
    prompt: "Classify this lead by intent, budget, and fit. Return next step recommendations.",
    tags: ["sales", "lead", "qualification"],
  },
  {
    name: "Proposal Draft",
    category: "sales",
    description: "Build a concise proposal structure",
    prompt: "Create a proposal draft with scope, deliverables, timeline, assumptions, and investment.",
    tags: ["proposal", "sales", "delivery"],
  },
]

for (const prompt of DEFAULT_PROMPTS) {
  if (!knowledgeMemory.listPrompts().some((item) => item.name === prompt.name)) {
    knowledgeMemory.upsertPrompt(prompt)
  }
}

export const PromptLibrary = {
  list() {
    return knowledgeMemory.listPrompts()
  },
  get(id: string) {
    return knowledgeMemory.getPrompt(id)
  },
  search(query: string) {
    const normalized = query.trim().toLowerCase()
    return knowledgeMemory.listPrompts().filter((prompt) => {
      const haystack = [prompt.name, prompt.category, prompt.description, prompt.prompt, prompt.tags.join(" ")].join(" ").toLowerCase()
      return haystack.includes(normalized)
    })
  },
  upsert(input: Record<string, any>) {
    return knowledgeMemory.upsertPrompt({
      id: input.id,
      name: String(input.name || "Untitled Prompt"),
      category: String(input.category || "general"),
      description: String(input.description || ""),
      prompt: String(input.prompt || input.content || ""),
      tags: Array.isArray(input.tags) ? input.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
    })
  },
}
