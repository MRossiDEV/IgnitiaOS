-- ============================================================================
-- MIGRATION: Agency OS Agents + Execution Logs
-- Purpose:
--   1) Seed 20 department agents into public.ai_agents.
--   2) Add execution tables to support real agent/tool runs.
--   3) Add simple workflow templates for orchestration.
--
-- Safe to re-run:
--   - Uses CREATE TABLE IF NOT EXISTS.
--   - Uses WHERE NOT EXISTS by slug for seed records.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Execution logs for individual agent runs
-- --------------------------------------------------------------------------
create table if not exists public.ai_agent_executions (
  id uuid primary key default gen_random_uuid(),
  agent_slug text not null,
  agent_name text,
  department text,
  status text not null default 'running',
  input jsonb not null default '{}'::jsonb,
  tool_results jsonb not null default '[]'::jsonb,
  output jsonb,
  duration_ms integer,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_agent_executions_slug
on public.ai_agent_executions(agent_slug);

create index if not exists idx_ai_agent_executions_status
on public.ai_agent_executions(status);

-- --------------------------------------------------------------------------
-- Workflow templates and run logs for multi-agent orchestration
-- --------------------------------------------------------------------------
create table if not exists public.ai_workflow_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  agent_slugs jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_slug text not null,
  status text not null default 'running',
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  step_results jsonb not null default '[]'::jsonb,
  duration_ms integer,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_workflow_runs_slug
on public.ai_workflow_runs(workflow_slug);

create index if not exists idx_ai_workflow_runs_status
on public.ai_workflow_runs(status);

-- Keep updated_at current for new tables
create or replace function public.touch_updated_at_agency_os()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'touch_ai_agent_executions_updated_at') then
    create trigger touch_ai_agent_executions_updated_at
    before update on public.ai_agent_executions
    for each row execute function public.touch_updated_at_agency_os();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'touch_ai_workflow_templates_updated_at') then
    create trigger touch_ai_workflow_templates_updated_at
    before update on public.ai_workflow_templates
    for each row execute function public.touch_updated_at_agency_os();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'touch_ai_workflow_runs_updated_at') then
    create trigger touch_ai_workflow_runs_updated_at
    before update on public.ai_workflow_runs
    for each row execute function public.touch_updated_at_agency_os();
  end if;
end $$;

-- --------------------------------------------------------------------------
-- Seed workflow templates
-- --------------------------------------------------------------------------
insert into public.ai_workflow_templates (slug, name, description, agent_slugs)
select
  'audit-os-full',
  'Audit OS Full Workflow',
  'Runs a complete audit sequence from discovery to final proposal PDF payload.',
  '[
    "lead-finder-agent",
    "business-research-agent",
    "website-auditor-agent",
    "security-audit-agent",
    "performance-optimization-agent",
    "seo-strategist-agent",
    "technology-stack-analyzer-agent",
    "competitor-intelligence-agent",
    "proposal-report-generator-agent"
  ]'::jsonb
on conflict (slug) do nothing;

insert into public.ai_workflow_templates (slug, name, description, agent_slugs)
select
  'sales-os-fast',
  'Sales OS Fast Workflow',
  'Discovers leads, researches companies, and generates first-touch proposal assets.',
  '[
    "lead-finder-agent",
    "business-research-agent",
    "content-writer-agent",
    "proposal-report-generator-agent"
  ]'::jsonb
on conflict (slug) do nothing;

insert into public.ai_agents (
  name,
  description,
  avatar,
  category,
  status,
  model,
  system_prompt,
  temperature,
  max_tokens,
  icon,
  slug,
  version,
  provider,
  reasoning,
  response_format,
  visibility,
  tools,
  tool_configs,
  workflow,
  personality_preset
)
values
(
  'Business Research Agent',
  'Researches companies, competitors, industry context, SWOT, and AI opportunities.',
  '/images/agents/business-research-agent.png',
  'Discovery Department',
  'active',
  'gpt-5',
  'You are a business research specialist. Build evidence-backed company intelligence and AI opportunity reports.',
  0.3::numeric,
  7000,
  'research',
  'business-research-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["business_research","web_scraper","proposal_report_generator"]'::jsonb,
  '{"business_research":{"timeout":120,"retries":2},"web_scraper":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"business_research"},{"id":"step-2","tool":"web_scraper"},{"id":"step-3","tool":"proposal_report_generator"}]'::jsonb,
  'analyst'
),
(
  'Lead Finder Agent',
  'Finds and enriches qualified local and directory-based leads with contact channels.',
  '/images/agents/lead-finder-agent.png',
  'Discovery Department',
  'active',
  'gpt-5',
  'You are a lead discovery specialist. Deliver structured, contactable and qualified leads.',
  0.2::numeric,
  5000,
  'leads',
  'lead-finder-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["lead_finder","web_scraper"]'::jsonb,
  '{"lead_finder":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"lead_finder"},{"id":"step-2","tool":"web_scraper"}]'::jsonb,
  'analyst'
),
(
  'Website Auditor Agent',
  'Runs SEO, performance, accessibility, UX, mobile, security, speed and metadata checks.',
  '/images/agents/website-auditor-agent.png',
  'Discovery Department',
  'active',
  'gpt-5',
  'You are a flagship website auditor delivering consultant-grade findings and actions.',
  0.2::numeric,
  8000,
  'audit',
  'website-auditor-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["website_auditor_pro","performance_optimization","security_audit","tech_stack_analyzer"]'::jsonb,
  '{"website_auditor_pro":{"timeout":180,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"website_auditor_pro"},{"id":"step-2","tool":"performance_optimization"},{"id":"step-3","tool":"security_audit"}]'::jsonb,
  'consultant'
),
(
  'Competitor Intelligence Agent',
  'Compares SEO, features, pricing, technology and content against competitors.',
  '/images/agents/competitor-intelligence-agent.png',
  'Discovery Department',
  'active',
  'gpt-5',
  'You are a competitor intelligence analyst focused on practical market gaps.',
  0.3::numeric,
  7000,
  'competitor',
  'competitor-intelligence-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["competitor_intelligence","tech_stack_analyzer","proposal_report_generator"]'::jsonb,
  '{"competitor_intelligence":{"timeout":180,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"competitor_intelligence"},{"id":"step-2","tool":"proposal_report_generator"}]'::jsonb,
  'analyst'
),
(
  'AI Solution Architect Agent',
  'Transforms requirements into AI architecture, stack, API and workflow plans.',
  '/images/agents/ai-solution-architect-agent.png',
  'Development Department',
  'active',
  'gpt-5',
  'You are an AI systems architect producing implementation-ready architecture blueprints.',
  0.3::numeric,
  8000,
  'architecture',
  'ai-solution-architect-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["ai_solution_architect","api_builder","workflow_builder"]'::jsonb,
  '{"ai_solution_architect":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"ai_solution_architect"},{"id":"step-2","tool":"api_builder"}]'::jsonb,
  'engineer'
),
(
  'Full Stack Developer Agent',
  'Generates Next.js/React/TypeScript/Tailwind code, APIs and schema drafts.',
  '/images/agents/full-stack-developer-agent.png',
  'Development Department',
  'active',
  'gpt-5',
  'You are a pragmatic full-stack engineer generating production-oriented starter implementations.',
  0.2::numeric,
  9000,
  'code',
  'full-stack-developer-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["fullstack_developer","api_builder"]'::jsonb,
  '{"fullstack_developer":{"timeout":150,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"fullstack_developer"},{"id":"step-2","tool":"api_builder"}]'::jsonb,
  'engineer'
),
(
  'UI/UX Designer Agent',
  'Creates wireframes, design systems, landing pages and dashboard direction.',
  '/images/agents/ui-ux-designer-agent.png',
  'Development Department',
  'active',
  'gpt-5',
  'You are a UI/UX strategist who produces practical design outputs and component guidance.',
  0.5::numeric,
  7000,
  'design',
  'ui-ux-designer-agent',
  '2.1.0',
  'openai',
  'medium',
  'Markdown',
  'internal',
  '["uiux_designer","content_writer"]'::jsonb,
  '{"uiux_designer":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"uiux_designer"}]'::jsonb,
  'consultant'
),
(
  'Code Reviewer Agent',
  'Audits code for bugs, security, performance and architecture quality.',
  '/images/agents/code-reviewer-agent.png',
  'Development Department',
  'active',
  'gpt-5',
  'You are a strict code reviewer focused on correctness, security and maintainability.',
  0.1::numeric,
  6000,
  'review',
  'code-reviewer-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["code_reviewer","security_audit","performance_optimization"]'::jsonb,
  '{"code_reviewer":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"code_reviewer"}]'::jsonb,
  'engineer'
),
(
  'SEO Strategist Agent',
  'Builds keyword plans, internal links, clusters and technical SEO recommendations.',
  '/images/agents/seo-strategist-agent.png',
  'Marketing Department',
  'active',
  'gpt-5',
  'You are an SEO strategist producing execution-ready SEO roadmaps.',
  0.3::numeric,
  7000,
  'seo',
  'seo-strategist-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["seo_strategy","website_auditor_pro","competitor_intelligence"]'::jsonb,
  '{"seo_strategy":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"seo_strategy"}]'::jsonb,
  'marketing'
),
(
  'Content Writer Agent',
  'Produces blogs, landing pages, ads, emails and product copy.',
  '/images/agents/content-writer-agent.png',
  'Marketing Department',
  'active',
  'gpt-5',
  'You are a senior conversion copywriter focused on clarity and intent.',
  0.7::numeric,
  7000,
  'content',
  'content-writer-agent',
  '2.1.0',
  'openai',
  'medium',
  'Markdown',
  'internal',
  '["content_writer","proposal_report_generator"]'::jsonb,
  '{"content_writer":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"content_writer"}]'::jsonb,
  'marketing'
),
(
  'Social Media Agent',
  'Generates multi-platform post batches (LinkedIn/Facebook/Instagram/X/Threads).',
  '/images/agents/social-media-agent.png',
  'Marketing Department',
  'active',
  'gpt-5',
  'You are a social media campaign strategist generating platform-native post sets.',
  0.8::numeric,
  7000,
  'social',
  'social-media-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["social_media_generator","content_writer"]'::jsonb,
  '{"social_media_generator":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"social_media_generator"}]'::jsonb,
  'marketing'
),
(
  'Image Generation Agent',
  'Builds production payloads for ComfyUI-based image generation workflows.',
  '/images/agents/image-generation-agent.png',
  'Marketing Department',
  'active',
  'gpt-5',
  'You are an image generation operator building high-quality prompt and workflow payloads.',
  0.6::numeric,
  6000,
  'image',
  'image-generation-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["image_generation_job","content_writer"]'::jsonb,
  '{"image_generation_job":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"image_generation_job"}]'::jsonb,
  'marketing'
),
(
  'Video Generation Agent',
  'Builds ad/short/explainer generation payloads for ComfyUI and video model stacks.',
  '/images/agents/video-generation-agent.png',
  'Marketing Department',
  'active',
  'gpt-5',
  'You are a video generation operator creating production-ready storyboard and job payloads.',
  0.6::numeric,
  6500,
  'video',
  'video-generation-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["video_generation_job","content_writer"]'::jsonb,
  '{"video_generation_job":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"video_generation_job"}]'::jsonb,
  'marketing'
),
(
  'Workflow Builder Agent',
  'Designs n8n/Langflow AI automation workflows and handoff definitions.',
  '/images/agents/workflow-builder-agent.png',
  'Automation Department',
  'active',
  'gpt-5',
  'You are an automation architect designing resilient workflows for operations.',
  0.4::numeric,
  7000,
  'workflow',
  'workflow-builder-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["workflow_builder","api_builder"]'::jsonb,
  '{"workflow_builder":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"workflow_builder"}]'::jsonb,
  'engineer'
),
(
  'API Builder Agent',
  'Designs REST APIs with auth strategy, docs and SDK starter schemas.',
  '/images/agents/api-builder-agent.png',
  'Automation Department',
  'active',
  'gpt-5',
  'You are an API platform engineer producing practical API contracts.',
  0.3::numeric,
  7000,
  'api',
  'api-builder-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["api_builder","fullstack_developer"]'::jsonb,
  '{"api_builder":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"api_builder"}]'::jsonb,
  'engineer'
),
(
  'Web Scraper Agent',
  'Crawls websites and extracts products, prices, contacts and competitor data.',
  '/images/agents/web-scraper-agent.png',
  'Automation Department',
  'active',
  'gpt-5',
  'You are a scraping specialist delivering clean, structured datasets with provenance.',
  0.2::numeric,
  7000,
  'scraper',
  'web-scraper-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["web_scraper","lead_finder"]'::jsonb,
  '{"web_scraper":{"timeout":180,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"web_scraper"}]'::jsonb,
  'engineer'
),
(
  'Security Audit Agent',
  'Evaluates headers, SSL, CSP, CORS, cookies and basic vulnerability signals.',
  '/images/agents/security-audit-agent.png',
  'Security Department',
  'active',
  'gpt-5',
  'You are a web security auditor focused on practical and prioritized remediation.',
  0.2::numeric,
  7500,
  'security',
  'security-audit-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["security_audit","website_auditor_pro"]'::jsonb,
  '{"security_audit":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"security_audit"}]'::jsonb,
  'analyst'
),
(
  'Technology Stack Analyzer Agent',
  'Detects frameworks, CMS, hosting hints, analytics, libraries and CDN usage.',
  '/images/agents/technology-stack-analyzer-agent.png',
  'Security Department',
  'active',
  'gpt-5',
  'You are a technology profiler focused on accurate stack detection and sales signals.',
  0.1::numeric,
  6500,
  'stack',
  'technology-stack-analyzer-agent',
  '2.1.0',
  'openai',
  'medium',
  'JSON',
  'internal',
  '["tech_stack_analyzer","web_scraper"]'::jsonb,
  '{"tech_stack_analyzer":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"tech_stack_analyzer"}]'::jsonb,
  'analyst'
),
(
  'Performance Optimization Agent',
  'Analyzes Core Web Vitals, assets and caching opportunities with prioritized fixes.',
  '/images/agents/performance-optimization-agent.png',
  'Security Department',
  'active',
  'gpt-5',
  'You are a web performance engineer focused on measurable speed gains.',
  0.2::numeric,
  7000,
  'performance',
  'performance-optimization-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["performance_optimization","website_auditor_pro"]'::jsonb,
  '{"performance_optimization":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"performance_optimization"}]'::jsonb,
  'engineer'
),
(
  'Proposal & Report Generator Agent',
  'Combines all outputs into polished proposals, quotes, executive summaries and PDF payloads.',
  '/images/agents/proposal-report-generator-agent.png',
  'Security Department',
  'active',
  'gpt-5',
  'You are an executive report generator that turns technical findings into client-ready deliverables.',
  0.4::numeric,
  9000,
  'report',
  'proposal-report-generator-agent',
  '2.1.0',
  'openai',
  'high',
  'Markdown',
  'internal',
  '["proposal_report_generator"]'::jsonb,
  '{"proposal_report_generator":{"timeout":120,"retries":2}}'::jsonb,
  '[{"id":"step-1","tool":"proposal_report_generator"}]'::jsonb,
  'consultant'
)
;
