# Ignitia AI Agent Tool OS

Ignitia AI should expose tools as deliverable-producing capabilities, not end-user SaaS features. The cleanest implementation is a small set of core primitives that every agent can compose.

## Core tool groups

| Core tool                   | What it does                                                                       | Current code paths                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Browser OS                  | Open websites, navigate tabs, click, fill, capture screenshots, extract page state | `browser`, `playwright`, `firecrawl`, `website_crawler`                                                                     |
| Research & Search Engine    | Search the web and research companies, competitors, and prospects                  | `business_research`, `competitor_intelligence`, `search_leads`, `lead_finder`, `web_scraper`                                |
| Website Intelligence Engine | Turn a site into structured audit data for SEO, UX, security, and performance      | `website_audit`, `website_auditor_pro`, `tech_stack_analyzer`, `security_audit`, `performance_optimization`, `seo_strategy` |
| AI Generation Engine        | Generate, summarize, classify, rewrite, and reason                                 | `llm`, `content_writer`, `social_media_generator`, `ai_solution_architect`, `code_reviewer`                                 |
| Media Studio                | Produce images, video, and creative assets                                         | `image_generation_job`, `video_generation_job`                                                                              |
| Document & Report Engine    | Produce branded reports, proposals, PDFs, and other client deliverables            | `report`, `proposal_report_generator`                                                                                       |
| Knowledge & Memory Engine   | Store and retrieve project context, client history, and prior outputs              | `memory` layer in runtime, plus report and workflow artifacts                                                               |
| Automation Engine           | Execute workflows, send notifications, and call external systems                   | `workflow_builder`, `api_builder`, `trigger`, `email`, `http`, `terminal`                                                   |
| Developer Studio            | Read/write files, run code, inspect repositories, and validate changes             | `filesystem`, `terminal`, `http`, `database`, `browser`, `playwright`                                                       |
| Business Operations Engine  | Handle leads, reporting, CRM-like actions, and operational data                    | `search_leads`, `create_lead`, `send_email`, `database`, reports and workflows                                              |

## Minimum v1 contract

Each tool should have:

1. A stable `id` used by agents and API calls.
2. A human-readable `name` and `description`.
3. A strict input schema.
4. Structured JSON output for downstream agents.
5. A clear failure mode with actionable error text.

## Suggested implementation order

1. Finalize the catalog and keep `app/api/v1/tools` as the discovery endpoint.
2. Harden Browser OS, Website Intelligence, and Document & Report first, because those are the highest-value agency deliverables.
3. Add Research and AI Generation next so every specialist agent can work from a shared reasoning layer.
4. Finish Automation, Developer Studio, and Business Operations for execution and delivery.

## Practical rule

If a tool does not produce a reusable artifact, a structured response, or an executed action, it should not be a core tool.
