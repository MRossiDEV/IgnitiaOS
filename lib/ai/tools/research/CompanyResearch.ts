import { buildCompanyResearchProfile } from "./ResearchTool"
import type { Tool } from "../types"

export const CompanyResearch: Tool = {
  name: "company_research",
  description: "Research a company across search engines and its website",
  async run(input) {
    return buildCompanyResearchProfile(input)
  },
}
