import { buildMarketResearchReport } from "./ResearchTool"
import type { Tool } from "../types"

export const MarketResearch: Tool = {
  name: "market_research",
  description: "Create a market research brief from search, news, and community signals",
  async run(input) {
    return buildMarketResearchReport(input)
  },
}
