import type { DocumentTemplate } from "./DocumentTypes"

export const DocumentTemplates: DocumentTemplate[] = [
  {
    id: "website-audit-report",
    name: "Website Audit Report",
    description: "Client-ready website audit with findings and recommendations",
    category: "report",
    format: "pdf",
    sections: [
      { id: "summary", title: "Executive Summary", content: "Summarize the audit outcomes." },
      { id: "findings", title: "Findings", content: "List the most important issues and opportunities." },
      { id: "recommendations", title: "Recommendations", content: "List prioritized next steps." },
    ],
  },
  {
    id: "strategy-brief",
    name: "Strategy Brief",
    description: "Concise planning brief for client and internal use",
    category: "strategy",
    format: "markdown",
    sections: [
      { id: "objective", title: "Objective", content: "State the goal." },
      { id: "plan", title: "Plan", content: "Define the execution steps." },
      { id: "risks", title: "Risks", content: "Note blockers and assumptions." },
    ],
  },
  {
    id: "proposal-deck",
    name: "Proposal Deck",
    description: "Sales proposal deck for client presentations",
    category: "presentation",
    format: "pptx",
    sections: [
      { id: "context", title: "Context", content: "Business background and opportunity." },
      { id: "solution", title: "Solution", content: "Recommended system and approach." },
      { id: "timeline", title: "Timeline", content: "Phases, milestones, and deliverables." },
    ],
  },
]

export function getTemplateById(templateId?: string) {
  if (!templateId) return undefined
  return DocumentTemplates.find((template) => template.id === templateId)
}
