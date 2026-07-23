# IgnitiaAI — Build Roadmap to Market-Ready Product

> **Source of truth for remaining work.** Derived from an inspection of the real
> code in `lib/ai/**` on 2026-07-14, mapped onto the locked Build Order.
>
> **Project Rule:** Do not redesign. Do not optimize. Do not refactor. **Finish.** Then improve.
>
> **Definition of Done (per item):** ✓ Code compiles ✓ Database updated ✓ UI connected ✓ Feature tested ✓ Pipeline works.

---

## Legend
- `[x]` Done and verified
- `[~]` Partially built / exists but broken or incomplete
- `[ ]` Not started

---

## Current State Summary (2026-07-14)

The AI layer has **two overlapping architectures** from an incomplete migration:

1. **Report Pipeline (canonical, keep this one):**
   `core/types.ts` → `ReportMemory`, `core/memory.ts` → `AIMemory` (static manager),
   `core/registry.ts` → `registry` + `PipelineTask`, `core/BaseAgent.ts`, `core/agentRunner.ts`,
   `collectors/**`, `specialists/**`, `pipeline/runPipeline.ts`.

2. **Workflow Runtime Engine (legacy, incompletely migrated from `lib/runtime`):**
   `core/engine.ts`, `core/context.ts`, `core/executor.ts`, `core/orchestrator.ts`, and the
   node-style tools under `tools/{database,llm,playwright,report,trigger,web/browser,firecrawl}/index.ts`.
   These import deleted modules (`@/lib/runtime/registry`, `core/runner`, `core/schemas`) and **do not compile**.

**Decision required (see Phase 0):** the runtime engine must either be re-wired to the canonical
core or removed. No third architecture may be introduced.

### Compilation status
- Whole-project typecheck (`npx tsc --noEmit`) currently reports errors **only from the incomplete
  migration** listed in Phase 0. The rest of `lib/ai` compiles.
- Already fixed during inspection:
  - `tools/email/service.ts` — removed a corrupted spliced-in fragment (was 144 parse errors).
  - Removed 9 redundant `export type XxxTool = Tool` aliases that collided with the real tool
    consts (`ai, automation, business, developer, documents, knowledge, media, research, website-intelligence`).
  - Fixed the 4 self-referencing tool annotations (`AutomationTool`, `BusinessTool`, `DeveloperTool`, `KnowledgeTool`) to `: Tool`.
  - `specialists/content/agent.ts` — `AIMemory` → `ReportMemory`.
  - `tools/web/extractTitles.ts` — removed ES2018-only regex `s` flag.
  - `tools/web/crawlWebsite.ts` — `WebsiteSnapshot` → `WebsiteData`.
  - `pipeline/runPipeline.ts` — rewired to `AIMemory.create()`, registry collectors, class specialists.

---

# PHASE 0 — FIX COMPILE / FLOW ERRORS (blocker for everything)

> Nothing else can reach "Done" until the AI layer type-checks clean.

## 0.1 Resolve the dual-architecture conflict ✅ DONE (2026-07-14)
- [x] **Decision:** Keep only the canonical Report Pipeline. Deleted the unused generic
      workflow-graph engine; re-pointed the agent executor to the canonical tool runner.
- [x] `core/engine.ts` — **deleted.** `WorkflowEngine` was imported by nothing (only self-reference)
      and depended on nonexistent `WorkflowMemory`/`ToolRegistry`. Dead code from the conflicting architecture.
- [x] `core/context.ts` — **deleted.** `RuntimeContext` was consumed only by the deleted `engine.ts`.
- [x] `core/executor.ts` — **kept + fixed.** It is the Agency-OS agent executor and already uses the
      canonical tool registry; corrected its import from `@/lib/ai/core/runner` (missing) to the
      existing `@/lib/ai/tools/runner` (`runTool`, `ToolExecutionResult`).
- [x] `core/orchestrator.ts` — **confirmed canonical.** Already uses `AIMemory` + `registry` + `ReportMemory`; no change needed.
- Result: `engine`/`context`/`executor`/`orchestrator` all type-check clean.
- Note: the Agency-OS API routes still import the stale `@/lib/agency-os/executor` path — re-point them
  to `@/lib/ai/core/executor` when addressing route/compile errors (Phase 5 / route fixes).

## 0.2 Fix deleted-module imports (leftover from `lib/runtime` → `lib/ai/core` move)
- [ ] `tools/database/index.ts` — `@/lib/runtime/registry` (missing `ToolExecutor`) + implicit-`any` on `{node, context, memory}`.
- [ ] `tools/llm/index.ts` — same missing registry + implicit-any params.
- [ ] `tools/playwright/index.ts` — same.
- [ ] `tools/report/index.ts` — same.
- [ ] `tools/trigger/index.ts` — same.
- [ ] `tools/web/browser/index.ts` — same.
- [ ] `tools/firecrawl/index.ts` — same.
- [ ] Provide a real `ToolExecutor` type + registry in the canonical core, or convert these to the
      `Tool` shape used by `tools/registry.ts`.

## 0.3 Fix orphaned old-structure references
- [ ] `memory/temporary.ts` — imports missing `../core/schemas`.
- [ ] `tools/generate/freeReport.ts` — imports missing `../memory/temporary`, `../agents/website`, `../agents/seo`, `../engine/types`. (Superseded by `workflows/freeReport.ts` + `pipeline/runPipeline.ts` — likely delete.)
- [ ] `tools/web/crawler/analyzer.ts` — imports missing `../engine/runner`, `../memory/temporary`, `../engine/types`.
- [ ] `tools/web/crawler/crawler.ts` — imports missing `../memory/temporary`.

## 0.4 Fix social publishing imports
- [ ] `tools/social/instagram-publishing.ts` — `@/lib/social/instagram-graph` (deleted). Move dependency into `lib/ai/tools/social/` or restore.
- [ ] `tools/tools/instagramPublisher.ts` — `@/lib/tools/types`, `@/lib/social/instagram-publishing` (wrong paths) + implicit-any `input`.
- [ ] `tools/tools/socialPublisher.ts` — `@/lib/tools/types`, `@/lib/tools/tools/instagramPublisher` (wrong paths) + implicit-any `input`.

## 0.5 Email service dependencies
- [ ] `tools/email/service.ts` uses `resend` — **not in package.json**. Either `npm i resend` or
      rewrite to use the already-present `nodemailer` transport in `tools/email/smtp.ts` + `sendEmail.ts`.
- [ ] Fix Supabase query typing in `service.ts` (`.select("... auth.users(email)")` produces `ParserError` types on `service_type`, `upsell_price`, `auth`). Use typed row casts.
- [ ] Rebuild the removed legacy templates cleanly (lead confirmation, order confirmation, internal notification) — see Phase 7.

## 0.6 Gate
- [ ] `npx tsc --noEmit` → **0 errors** across the project.
- [ ] `npm run lint` → clean (or agreed baseline).

---

# PHASE 1 — AI FOUNDATION

## 1. Core (`lib/ai/core`)
- [x] Shared Memory — `memory.ts` (`AIMemory` manager over `ReportMemory`).
- [x] BaseAgent — `BaseAgent.ts`.
- [x] agentRunner — `agentRunner.ts`.
- [x] Registry — `registry.ts` (`AIRegistry` + `registry`, `PipelineTask`).
- [x] Pipeline Runner — `pipeline/runPipeline.ts` (fixed; runs collectors + specialists).
- [~] AI Logging — `logger.ts` exists; **verify wired into `agentRunner` + pipeline**.
- [~] Token Tracking — `tokenTracker.ts` exists; **verify populated into `ReportMemory.metadata`**.
- [~] Error Handling — per-agent `AgentResult.success/error` exists; **add pipeline-level try/catch + retry policy verification**.

**Deliverable:** A stable AI execution engine.
**DoD:** run `runPipeline(reportId, url)` end-to-end against a live URL, produce populated `ReportMemory`.

---

## 2. Tools (`lib/ai/tools`)

### Website (`tools/web`)
- [x] Crawl Website — `crawlWebsite.ts`
- [x] Download HTML — `downloadHTML.ts`
- [x] Extract Text — `extractText.ts`
- [x] Extract Metadata — `extractMeta.ts`
- [x] Extract Headings — `extractHeadings.ts`
- [x] Extract Links — `extractLinks.ts`
- [x] Extract Images — `extractImages.ts`
- [x] Extract Scripts — `extractScripts.ts`
- [x] Extract CSS — `extractStylesheet.ts`
- [x] Extract Forms — `extractForms.ts`
- [x] Detect Technologies — `detectTechnologies.ts`
- [x] Extract Language / Titles — `extractLanguage.ts`, `extractTitles.ts`
- [ ] **Verify** each extractor against 3 real-world sites; confirm output matches `WebsiteData`.

### Business (`tools/research`, `tools/business`)
- [~] Google Search — `research/GoogleSearch.ts` exists; **needs API key wiring + live test**.
- [ ] Google Maps — not present. Build under `tools/research` or `tools/business`.
- [~] Business Profile Lookup — `research/CompanyResearch.ts` exists; **verify**.

### Utilities (`tools/documents`, `tools/media`)
- [~] PDF Reader — `documents/PDF.ts` exists; **verify read path (not just build)**.
- [ ] OCR — not present. Add.
- [~] Screenshot — `tools/web/browser/BrowserScreenshots.ts`; **verify**.
- [x] Markdown Export — `documents/Markdown.ts`.
- [ ] HTML Cleaner — add dedicated cleaner (currently implicit in extractors).

**Deliverable:** Reusable non-AI toolkit.
**DoD:** every tool callable via `tools/registry.ts` and returns typed output.

---

## 3. Collectors (`lib/ai/collectors`)
- [x] Website Collector — `collectors/website/websiteCollector.ts` (registry-registered).
- [ ] Business Collector — create `collectors/business/` (registers `stage: "collector"`).
- [ ] Google Business Collector — create `collectors/google/`.
- [ ] Social Collector — create `collectors/social/`.
- [ ] Competitor Collector — create `collectors/competitors/`.
- [ ] Wire all into `collectors/index.ts` (currently only website is imported).
- [ ] Extend `CollectedMemory` in `core/types.ts` if new shapes are needed (no breaking changes).

**Deliverable:** Complete business dataset.
**DoD:** `registry.getCollectors()` returns all 5, each populates its `ReportMemory.collected.*` slot.

---

# PHASE 2 — SPECIALISTS (`lib/ai/specialists`)

> Every specialist: `definition.ts` + `prompt.ts` + `schema.ts` + `types.ts` + `agent.ts` (extends `BaseAgent`, uses `ReportMemory`) + `index.ts`. **Structured JSON only.**

### Website
- [ ] Website Audit — create `specialists/website/`.

### Marketing
- [x] SEO — `specialists/seo/` (canonical reference implementation).
- [x] Content — `specialists/content/` (fixed to `ReportMemory`).
- [~] UX/UI — `specialists/ux/` exists; **verify `agent.ts` uses `ReportMemory`, wire into pipeline**.
- [ ] Branding — create.
- [ ] Social Media — create.
- [ ] Copywriting — create.

### Sales
- [ ] Conversion
- [ ] CTA Analysis
- [ ] Lead Generation
- [ ] CRM

### UX
- [ ] UX (consolidate with UX/UI above)
- [ ] Accessibility — analyzer exists in `tools/website-intelligence/AccessibilityAnalyzer.ts`; wrap as specialist.
- [ ] Mobile Experience
- [ ] Navigation

### Technical
- [ ] Performance — `tools/website-intelligence/PerformanceAnalyzer.ts` exists; wrap as specialist.
- [ ] Security
- [ ] Trust Signals
- [ ] Analytics

### Business
- [ ] Google Business
- [ ] Reputation
- [ ] Competitor — `tools/research/CompetitorResearch.ts` exists; wrap as specialist.
- [ ] Positioning

- [ ] For each new specialist: add its slot to `AnalysisMemory` in `core/types.ts` (slots already exist for most) and register in the pipeline specialist list.

**Deliverable:** Complete business intelligence.
**DoD:** each specialist returns schema-valid JSON saved into `ReportMemory.analysis.*`.

---

# PHASE 3 — REPORT BUILDER

> Present but incomplete: `tools/report/index.ts` (broken, Phase 0), `tools/documents/ReportBuilder.ts`, `workflows/freeReport.ts`.

## Builder
- [ ] Assemble Report — from `ReportMemory` → report object.
- [ ] Merge Results — combine all `analysis.*` sections.
- [ ] Calculate Scores — per-specialist + overall (reuse `tools/website-intelligence/WebsiteScore.ts`).
- [ ] Generate Charts — `tools/documents/Charts.ts`.
- [ ] Executive Dashboard section.
- [ ] Opportunities extraction.
- [ ] Quick Wins extraction.
- [ ] Recommended Services (feeds Phase 8).

**Deliverable:** Complete report object.
**DoD:** `buildReport(memory)` returns a persisted-ready object with scores, opportunities, services.

---

# PHASE 4 — DATABASE (Supabase)

> `tools/database/index.ts` exists (broken, Phase 0). Supabase client used across `lib/supabase/**`.

## Reports
- [ ] Save Report
- [ ] Save Specialist Results
- [ ] Save Scores
- [ ] Save Opportunities

## CRM
- [ ] Create CRM Record
- [ ] Update CRM
- [ ] Activities
- [ ] Follow Ups
- [ ] Proposal Status

- [ ] Define/verify Supabase schema + migrations for `reports`, specialist results, scores, opportunities, CRM tables.
- [ ] Type the Supabase client (generated types) to remove `ParserError` typings (see Phase 0.5).

**Deliverable:** Persistent reports.
**DoD:** running the pipeline writes a full report + CRM record; re-readable by ID.

---

# PHASE 5 — ADMIN (`app/admin`)

> Admin app exists but has pre-existing type errors in several pages (outside `lib/ai`; fix before "Done").

## Dashboard
- [ ] Report List
- [ ] Filters
- [ ] Search

## Lead
- [ ] Detail Page
- [ ] CRM Panel
- [ ] Activity Timeline

## Views
- [ ] Table
- [ ] Kanban (dnd-kit already a dependency)

## Notifications
- [ ] Toasts (radix toast already present)

- [ ] Fix admin page compile errors: `admin/agents/[id]/edit`, `admin/campaigns/new`, `admin/clients`, `admin/revenue`, `admin/payments`, marketing components, etc.

**Deliverable:** Internal operating system.
**DoD:** admin can browse, filter, open a lead, and see the report + CRM.

---

# PHASE 6 — REPORT UI (`app/report`)

> `app/report/v1/[slug]` exists with section components (e.g. `ScoreGridSection`).

## Customer Report
- [ ] Overview
- [ ] Scores
- [ ] Opportunities
- [ ] Specialist Sections
- [ ] Recommended Services

## Export
- [ ] PDF (`tools/documents/PDF.ts`)
- [ ] Share Link
- [ ] Print

**Deliverable:** Customer-ready report.
**DoD:** public report renders from a saved report ID and exports to PDF.

---

# PHASE 7 — EMAIL (`lib/ai/tools/email`)

> `smtp.ts` + `sendEmail.ts` (nodemailer) are clean. `service.ts` needs Phase 0.5 work.

## SMTP
- [ ] Templates (report, proposal, follow-up, lead confirmation, order confirmation, internal notification)
- [ ] Proposal Emails
- [ ] Report Emails
- [ ] Follow-up Emails
- [ ] Standardize on one transport (nodemailer OR resend — not both).

**Deliverable:** Automated communication.
**DoD:** each email type sends via the chosen transport and logs delivery.

---

# PHASE 8 — SERVICES

Each specialist recommends a service (SEO → SEO Optimization; Conversion → Landing Page Optimization;
Brand → Brand Refresh; Google Business → GB Optimization).

- [ ] Service catalog data model.
- [ ] Map each specialist output → recommended service(s).
- [ ] Surface in Report Builder (Phase 3) + Report UI (Phase 6).

**Deliverable:** Sales recommendations.
**DoD:** report shows tailored service recommendations per specialist finding.

---

# PHASE 9 — CLIENT PORTAL

- [ ] Login (Supabase auth already wired)
- [ ] Reports (client-scoped list)
- [ ] Downloads
- [ ] Messages

**Deliverable:** Customer access.
**DoD:** a client logs in and sees only their reports/downloads/messages.

---

# PHASE 10 — AUTOMATION (`lib/ai/tools/automation`)

> `automation/` toolkit exists (Scheduler, Workflow, Email, Slack, WhatsApp, N8N, Webhooks).

- [ ] Scheduled Reports (`automation/Scheduler.ts`)
- [ ] Email Sequences (`tools/email/service.ts` nurture logic exists — wire to scheduler)
- [ ] Reminder Engine
- [ ] Proposal Generator

**Deliverable:** Hands-free workflow.
**DoD:** a scheduled job runs the pipeline, emails the report, and schedules follow-ups.

---

# PHASE 11 — IGNITIA AI TEAM

Each department becomes a reusable AI worker (built on `BaseAgent` + `tools/registry.ts`).

- Marketing: SEO, Content, Brand, Social
- Sales: CRM, Lead Qualification, Outreach
- Support: Knowledge Base, Documentation (`tools/knowledge/**` exists)
- Operations: Reports, Monitoring

**Deliverable:** IgnitiaOS internal AI workforce.
**DoD:** each worker invocable independently and via orchestrator.

---

# MARKET-READY GATES (cross-cutting, required before launch)

- [ ] **Type-safe:** `npx tsc --noEmit` clean (Phase 0 gate).
- [ ] **Lint/format:** `npm run lint` clean.
- [ ] **Env/config:** all required keys documented (`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*` / `RESEND_API_KEY`, search API keys). Validate via `@t3-oss/env-nextjs`.
- [ ] **Secrets:** no keys committed; `.env.example` present.
- [ ] **Auth & RLS:** Supabase row-level security on all report/CRM/client tables.
- [ ] **Tests:** pipeline integration test + at least one per specialist schema.
- [ ] **Error/observability:** logging + token tracking persisted; failed-agent handling verified.
- [ ] **Rate limiting & cost caps** on AI calls.
- [ ] **Build:** `npm run build` succeeds; deploy to staging.
- [ ] **E2E smoke:** submit a URL → pipeline → saved report → admin view → customer report → PDF → email.

---

## Recommended Execution Order
1. **Phase 0** (unblock compilation) — must be first.
2. **Phase 1** verification (logging, tokens, error handling).
3. **Phase 3 + 4** (report object + persistence) so there is something to render.
4. **Phase 6** (report UI) + **Phase 5** (admin) in parallel.
5. **Phase 2** specialists incrementally (each adds report value independently).
6. **Phases 7 → 8 → 9 → 10 → 11**.

> Finish one item to its Definition of Done before starting the next. No feature creep.
