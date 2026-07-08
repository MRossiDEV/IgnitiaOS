-- ============================================================================
-- REPORTS (MASTER)
-- ============================================================================

alter table public.reports

add column if not exists report_slug text,
add column if not exists business_name text,
add column if not exists business_website text,
add column if not exists business_email text,
add column if not exists business_phone text,

add column if not exists industry text,

add column if not exists country text,
add column if not exists state text,
add column if not exists city text,
add column if not exists address text,

add column if not exists overall_score integer default 0,

add column if not exists snapshot_completed boolean default false,
add column if not exists premium_completed boolean default false,

add column if not exists snapshot_generated_at timestamptz,
add column if not exists premium_generated_at timestamptz,

add column if not exists status text default 'queued';

create unique index if not exists idx_reports_slug
on reports(report_slug);

create index if not exists idx_reports_status
on reports(status);

-- ============================================================================
-- RAW DATA COLLECTED
-- ============================================================================

create table if not exists public.report_sources (

    id uuid primary key default gen_random_uuid(),

    report_id uuid not null references reports(id) on delete cascade,

    website_html text,

    homepage_title text,

    homepage_description text,

    screenshot_desktop text,

    screenshot_mobile text,

    technologies jsonb default '{}',

    pages jsonb default '[]',

    headers jsonb default '{}',

    dns jsonb default '{}',

    ssl jsonb default '{}',

    performance jsonb default '{}',

    security jsonb default '{}',

    accessibility jsonb default '{}',

    social jsonb default '{}',

    google_business jsonb default '{}',

    metadata jsonb default '{}',

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index if not exists idx_report_sources_report
on report_sources(report_id);

-- ============================================================================
-- FREE SNAPSHOT
-- ============================================================================

create table if not exists public.report_snapshot (

    id uuid primary key default gen_random_uuid(),

    report_id uuid not null references reports(id) on delete cascade,

    website_score integer default 0,

    seo_score integer default 0,

    google_score integer default 0,

    social_score integer default 0,

    branding_score integer default 0,

    ai_score integer default 0,

    overall_score integer default 0,

    executive_summary text,

    quick_wins jsonb default '[]',

    opportunities jsonb default '[]',

    estimated_lost_revenue numeric,

    estimated_monthly_leads integer,

    strengths jsonb default '[]',

    weaknesses jsonb default '[]',

    recommendations jsonb default '[]',

    generated_at timestamptz default now()

);

create unique index if not exists idx_snapshot_report
on report_snapshot(report_id);

-- ============================================================================
-- PREMIUM BLUEPRINT
-- ============================================================================

create table if not exists public.report_blueprint (

    id uuid primary key default gen_random_uuid(),

    report_id uuid not null references reports(id) on delete cascade,

    competitors jsonb default '[]',

    keyword_research jsonb default '{}',

    marketing_strategy jsonb default '{}',

    sales_strategy jsonb default '{}',

    seo_strategy jsonb default '{}',

    automation_plan jsonb default '{}',

    roadmap_30 jsonb default '[]',

    roadmap_60 jsonb default '[]',

    roadmap_90 jsonb default '[]',

    proposal jsonb default '{}',

    roi_projection jsonb default '{}',

    presentation_url text,

    pdf_url text,

    generated_at timestamptz default now()

);

create unique index if not exists idx_blueprint_report
on report_blueprint(report_id);

-- ============================================================================
-- AGENT EXECUTION LOG
-- ============================================================================

create table if not exists public.report_agent_runs (

    id uuid primary key default gen_random_uuid(),

    report_id uuid not null references reports(id) on delete cascade,

    agent text not null,

    status text default 'queued',

    started_at timestamptz,

    finished_at timestamptz,

    duration_ms integer,

    tokens_input integer default 0,

    tokens_output integer default 0,

    estimated_cost numeric(10,4) default 0,

    retries integer default 0,

    error text,

    response jsonb,

    created_at timestamptz default now()

);

create index if not exists idx_agent_runs_report
on report_agent_runs(report_id);

create index if not exists idx_agent_runs_status
on report_agent_runs(status);

create index if not exists idx_agent_runs_agent
on report_agent_runs(agent);