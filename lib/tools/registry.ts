import { searchLeads } from "./tools/searchLeads"
import { createLead } from "./tools/createLead"
import { sendEmail } from "./tools/sendEmail"
import { websiteAudit } from "./tools/websiteAudit"
import { agencyOsTools } from "./tools/agencyOs"
import { WebsiteIntelligenceTool } from "./website-intelligence"
import { BackgroundRemoval, ImageGeneration, ImageEditing, Upscaler, VideoGeneration } from "./media"
import { DocumentTool } from "./documents"
import { KnowledgeTool } from "./knowledge"
import { AutomationTool } from "./automation"
import { DeveloperTool } from "./developer"
import { BusinessTool } from "./business"
import {
  BingSearch,
  CompanyResearch,
  CompetitorResearch,
  GoogleSearch,
  MarketResearch,
  NewsSearch,
  RedditSearch,
  ResearchTool,
  YouTubeSearch,
} from "./research"
import {
  AITool,
  Chat,
  Classification,
  Rewrite,
  Summarize,
  Translation,
} from "./ai"

export const tools = {
  search_leads: searchLeads,
  create_lead: createLead,
  send_email: sendEmail,
  website_audit: websiteAudit,
  website_intelligence: WebsiteIntelligenceTool,
  research_tool: ResearchTool,
  google_search: GoogleSearch,
  bing_search: BingSearch,
  reddit_search: RedditSearch,
  youtube_search: YouTubeSearch,
  company_research: CompanyResearch,
  competitor_research: CompetitorResearch,
  news_search: NewsSearch,
  market_research: MarketResearch,
  ai_tool: AITool,
  ai_chat: Chat,
  ai_summarize: Summarize,
  ai_rewrite: Rewrite,
  ai_classification: Classification,
  ai_translation: Translation,
  image_generation: ImageGeneration,
  image_editing: ImageEditing,
  upscaler: Upscaler,
  background_removal: BackgroundRemoval,
  video_generation: VideoGeneration,
  document_tool: DocumentTool,
  knowledge_tool: KnowledgeTool,
  automation_tool: AutomationTool,
  developer_tool: DeveloperTool,
  business_tool: BusinessTool,
  ...agencyOsTools,
}