import { buildCompetitorResearchProfile } from "./ResearchTool"
import type { Tool } from "../types"

export const CompetitorResearch: Tool = {
  name: "competitor_research",
  description: "Research competitors and compare market signals",
  async run(input) {
    return buildCompetitorResearchProfile(input)
  },
}
