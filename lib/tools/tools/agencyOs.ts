import { Tool } from "../types"
import * as cheerio from "cheerio"

type JsonRecord = Record<string, any>

function withProtocol(rawUrl: string): string {
  const value = rawUrl.trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function extractEmails(text: string): string[] {
  return uniq((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((v) => v.toLowerCase()))
}

function extractPhones(text: string): string[] {
  return uniq(text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [])
}

function detectSocialLinks($: cheerio.CheerioAPI): Record<string, string[]> {
  const map: Record<string, string[]> = {
    linkedin: [],
    facebook: [],
    instagram: [],
    x: [],
    threads: [],
    youtube: [],
  }

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").trim()
    if (!href) return

    if (/linkedin\.com/i.test(href)) map.linkedin.push(href)
    if (/facebook\.com/i.test(href)) map.facebook.push(href)
    if (/instagram\.com/i.test(href)) map.instagram.push(href)
    if (/(twitter\.com|x\.com)/i.test(href)) map.x.push(href)
    if (/threads\.net/i.test(href)) map.threads.push(href)
    if (/youtube\.com|youtu\.be/i.test(href)) map.youtube.push(href)
  })

  return {
    linkedin: uniq(map.linkedin),
    facebook: uniq(map.facebook),
    instagram: uniq(map.instagram),
    x: uniq(map.x),
    threads: uniq(map.threads),
    youtube: uniq(map.youtube),
  }
}

async function fetchSiteSnapshot(rawUrl: string) {
  const url = withProtocol(rawUrl)
  if (!url) {
    throw new Error("Missing website URL")
  }

  const startedAt = Date.now()
  const response = await fetch(url, {
    headers: {
      "User-Agent": "IgnitiaAgencyOSBot/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const elapsedMs = Date.now() - startedAt
  const $ = cheerio.load(html)

  const title = toText($("title").first().text())
  const description = toText($("meta[name='description']").attr("content"))
  const h1Count = $("h1").length
  const h2Count = $("h2").length
  const links = $("a[href]").map((_, el) => $(el).attr("href") ?? "").get()
  const images = $("img").length
  const imagesWithoutAlt = $("img:not([alt]), img[alt='']").length

  const bodyText = $("body").text().replace(/\s+/g, " ").trim()
  const emails = extractEmails(html)
  const phones = extractPhones(html)
  const social = detectSocialLinks($)

  return {
    url,
    html,
    $, 
    headers: Object.fromEntries(response.headers.entries()),
    timing: {
      responseMs: elapsedMs,
      htmlBytes: Buffer.byteLength(html, "utf8"),
    },
    page: {
      title,
      description,
      h1Count,
      h2Count,
      links,
      images,
      imagesWithoutAlt,
      emails,
      phones,
      social,
      bodyText,
    },
  }
}

function detectTech(html: string, headers: Record<string, string>) {
  const checks: Array<[string, RegExp]> = [
    ["Next.js", /_next\/|next\.js/i],
    ["React", /react|__REACT_DEVTOOLS_GLOBAL_HOOK__/i],
    ["Vue", /vue(?:\.runtime|\.js)?/i],
    ["WordPress", /wp-content|wp-includes|wordpress/i],
    ["Shopify", /cdn\.shopify\.com|shopify/i],
    ["Google Analytics", /gtag\(|googletagmanager\.com/i],
    ["Meta Pixel", /connect\.facebook\.net\/en_US\/fbevents\.js|fbq\(/i],
    ["Cloudflare", /cloudflare/i],
  ]

  const frameworks = checks
    .filter(([, regex]) => regex.test(html))
    .map(([name]) => name)

  const server = headers.server ?? ""
  const poweredBy = headers["x-powered-by"] ?? ""

  return {
    detected: uniq(frameworks),
    server,
    poweredBy,
    cdn: /cloudflare|fastly|akamai/i.test(`${server} ${poweredBy}`),
  }
}

function buildSwot(text: string) {
  const lower = text.toLowerCase()
  const strengths = [
    "Clear service pages and discoverable navigation",
    "Visible contact and trust signals",
  ]
  const weaknesses = [
    "Inconsistent conversion CTA placement",
    "Opportunity to strengthen technical SEO metadata",
  ]
  const opportunities = [
    "Launch AI-assisted lead qualification workflow",
    "Build industry-specific content clusters for organic growth",
  ]
  const threats = [
    "Competitors with stronger local SEO and review footprint",
    "Rising ad acquisition costs without conversion optimization",
  ]

  if (!/contact|call|book|quote/.test(lower)) {
    weaknesses.push("Low contact intent signals on key pages")
  }
  if (/blog|insights|resources/.test(lower)) {
    strengths.push("Has educational content foundation for SEO scaling")
  }

  return { strengths: uniq(strengths), weaknesses: uniq(weaknesses), opportunities: uniq(opportunities), threats: uniq(threats) }
}

const businessResearch: Tool = {
  name: "business_research",
  description: "Researches a business website and returns SWOT plus AI opportunities",
  async run(input) {
    const website = toText(input.website || input.url)
    const businessName = toText(input.businessName) || "Unknown Business"

    const snapshot = await fetchSiteSnapshot(website)
    const swot = buildSwot(snapshot.page.bodyText)

    return {
      businessName,
      website: snapshot.url,
      summary: {
        title: snapshot.page.title,
        description: snapshot.page.description,
      },
      swot,
      aiOpportunities: [
        "AI chatbot for lead capture and qualification",
        "Automated follow-up sequence based on inquiry type",
        "AI-generated proposal drafts using audit data",
      ],
      researchReport: {
        contactSignals: {
          emails: snapshot.page.emails,
          phones: snapshot.page.phones,
          socials: snapshot.page.social,
        },
      },
    }
  },
}

const leadFinder: Tool = {
  name: "lead_finder",
  description: "Extracts lead contact signals and returns qualified lead candidates",
  async run(input) {
    const website = toText(input.website || input.url)
    const businessType = toText(input.businessType || input.industry || "services")
    const location = toText(input.location || "")

    const snapshot = await fetchSiteSnapshot(website)

    const leads = [
      {
        company: snapshot.page.title || "Lead Candidate",
        source: "website",
        industry: businessType,
        location,
        website: snapshot.url,
        emails: snapshot.page.emails,
        phones: snapshot.page.phones,
        socials: snapshot.page.social,
        qualificationScore: Math.max(40, 85 - (snapshot.page.emails.length === 0 ? 20 : 0) - (snapshot.page.phones.length === 0 ? 15 : 0)),
      },
    ]

    return {
      totalQualified: leads.length,
      leads,
    }
  },
}

const websiteAuditorPro: Tool = {
  name: "website_auditor_pro",
  description: "Runs a broad website audit for SEO, accessibility, UX, metadata and broken links",
  async run(input) {
    const website = toText(input.website || input.url)
    const snapshot = await fetchSiteSnapshot(website)

    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(snapshot.html)
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(snapshot.html)
    const hasRobots = /<meta[^>]+name=["']robots["']/i.test(snapshot.html)
    const brokenLinkCandidates = snapshot.page.links.filter((link) => /^#/.test(link) || /javascript:void\(0\)/i.test(link))

    const seoScore = Math.max(0, 100 - (snapshot.page.title ? 0 : 20) - (snapshot.page.description ? 0 : 20) - (hasCanonical ? 0 : 12) - (snapshot.page.h1Count === 1 ? 0 : 10) - Math.min(18, snapshot.page.imagesWithoutAlt * 2))
    const accessibilityScore = Math.max(0, 100 - Math.min(35, snapshot.page.imagesWithoutAlt * 5) - (hasViewport ? 0 : 15))
    const uxScore = Math.max(0, 100 - (snapshot.page.h1Count === 0 ? 20 : 0) - (snapshot.page.links.length < 5 ? 15 : 0))

    return {
      website: snapshot.url,
      checks: {
        seo: {
          title: !!snapshot.page.title,
          description: !!snapshot.page.description,
          canonical: hasCanonical,
          robots: hasRobots,
          h1Count: snapshot.page.h1Count,
        },
        accessibility: {
          imagesWithoutAlt: snapshot.page.imagesWithoutAlt,
          viewportMeta: hasViewport,
        },
        ux: {
          linkCount: snapshot.page.links.length,
          ctaSignals: (snapshot.page.bodyText.match(/book|contact|quote|get started|request demo/gi) ?? []).length,
        },
        speed: {
          responseMs: snapshot.timing.responseMs,
          htmlBytes: snapshot.timing.htmlBytes,
        },
        metadata: {
          title: snapshot.page.title,
          description: snapshot.page.description,
        },
        brokenLinks: brokenLinkCandidates,
      },
      scores: {
        seo: seoScore,
        accessibility: accessibilityScore,
        ux: uxScore,
        overall: Math.round((seoScore + accessibilityScore + uxScore) / 3),
      },
      pdfPayload: {
        template: "website-audit-professional-v1",
        generatedAt: new Date().toISOString(),
      },
    }
  },
}

const competitorIntelligence: Tool = {
  name: "competitor_intelligence",
  description: "Compares a target website to competitor websites",
  async run(input) {
    const targetWebsite = toText(input.website || input.url)
    const competitors = Array.isArray(input.competitors) ? input.competitors.map((c: unknown) => toText(c)).filter(Boolean) : []

    const target = await fetchSiteSnapshot(targetWebsite)
    const competitorSummaries = [] as JsonRecord[]

    for (const competitor of competitors.slice(0, 5)) {
      try {
        const snapshot = await fetchSiteSnapshot(competitor)
        competitorSummaries.push({
          website: snapshot.url,
          title: snapshot.page.title,
          hasMetaDescription: !!snapshot.page.description,
          linkCount: snapshot.page.links.length,
          contentLength: snapshot.page.bodyText.length,
        })
      } catch (error) {
        competitorSummaries.push({
          website: competitor,
          error: error instanceof Error ? error.message : "Failed to fetch competitor",
        })
      }
    }

    return {
      target: {
        website: target.url,
        title: target.page.title,
        hasMetaDescription: !!target.page.description,
        contentLength: target.page.bodyText.length,
      },
      competitors: competitorSummaries,
      gapSummary: {
        seoGaps: ["Metadata depth", "Internal linking consistency"],
        contentGaps: ["Case studies", "Service comparison pages"],
        featureGaps: ["Instant quote flow", "Self-serve scheduling"],
        pricingSignals: ["Add transparent entry pricing or package examples"],
      },
    }
  },
}

const securityAudit: Tool = {
  name: "security_audit",
  description: "Checks key web security headers and cookie safety signals",
  async run(input) {
    const website = withProtocol(toText(input.website || input.url))
    if (!website) throw new Error("Missing website URL")

    const response = await fetch(website, { cache: "no-store" })
    const headers = Object.fromEntries(response.headers.entries())

    const requiredHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
    ]

    const missingHeaders = requiredHeaders.filter((header) => !headers[header])
    const cors = headers["access-control-allow-origin"] || "not-set"
    const hasSecureCookies = /secure/i.test(headers["set-cookie"] ?? "")

    const securityScore = Math.max(0, 100 - missingHeaders.length * 12 - (cors === "*" ? 15 : 0) - (hasSecureCookies ? 0 : 10))

    return {
      website,
      securityScore,
      headers,
      findings: {
        missingHeaders,
        cors,
        hasSecureCookies,
        ssl: website.startsWith("https://"),
      },
      recommendations: [
        "Add strict Content-Security-Policy with nonce/hash strategy",
        "Enforce HSTS with includeSubDomains and preload when ready",
        "Restrict CORS origins to trusted domains",
      ],
    }
  },
}

const techStackAnalyzer: Tool = {
  name: "tech_stack_analyzer",
  description: "Detects frameworks, analytics and hosting/CDN hints from HTML and headers",
  async run(input) {
    const website = toText(input.website || input.url)
    const snapshot = await fetchSiteSnapshot(website)

    return {
      website: snapshot.url,
      technologies: detectTech(snapshot.html, snapshot.headers),
      analytics: {
        hasGTM: /googletagmanager\.com/i.test(snapshot.html),
        hasGA: /gtag\(/i.test(snapshot.html),
        hasMetaPixel: /fbq\(/i.test(snapshot.html),
      },
    }
  },
}

const performanceOptimization: Tool = {
  name: "performance_optimization",
  description: "Returns performance baseline and prioritized optimization recommendations",
  async run(input) {
    const website = toText(input.website || input.url)
    const snapshot = await fetchSiteSnapshot(website)

    const jsAssets = (snapshot.html.match(/<script\b[^>]*src=/gi) ?? []).length
    const cssAssets = (snapshot.html.match(/<link\b[^>]*rel=["']stylesheet["']/gi) ?? []).length
    const imageAssets = snapshot.page.images

    const score = Math.max(0, 100 - Math.round(snapshot.timing.responseMs / 40) - Math.max(0, jsAssets - 10) * 2 - Math.max(0, imageAssets - 30))

    return {
      website: snapshot.url,
      baseline: {
        responseMs: snapshot.timing.responseMs,
        htmlBytes: snapshot.timing.htmlBytes,
        jsAssets,
        cssAssets,
        imageAssets,
      },
      score,
      recommendations: [
        "Compress and lazy-load below-the-fold images",
        "Reduce third-party scripts and defer non-critical JS",
        "Enable long-lived caching for static assets",
        "Inline critical CSS for above-the-fold rendering",
      ],
    }
  },
}

const seoStrategy: Tool = {
  name: "seo_strategy",
  description: "Creates keyword and technical SEO strategy from site snapshot",
  async run(input) {
    const website = toText(input.website || input.url)
    const snapshot = await fetchSiteSnapshot(website)

    const industry = toText(input.industry || "general")

    return {
      website: snapshot.url,
      strategy: {
        primaryKeywords: [
          `${industry} services near me`,
          `best ${industry} company`,
          `${industry} quote`,
          `${industry} expert`,
        ],
        contentClusters: [
          `${industry} cost guides`,
          `${industry} case studies`,
          `${industry} comparison pages`,
        ],
        internalLinkingPlan: [
          "Service page -> case study -> contact page",
          "Blog article -> service page -> quote form",
        ],
        technicalRecommendations: [
          "Ensure one H1 per page and semantic heading hierarchy",
          "Add schema.org Organization and Service markup",
          "Improve metadata uniqueness across primary pages",
        ],
      },
      currentSignals: {
        title: snapshot.page.title,
        hasDescription: !!snapshot.page.description,
        h1Count: snapshot.page.h1Count,
      },
    }
  },
}

const contentWriter: Tool = {
  name: "content_writer",
  description: "Generates structured content drafts for marketing channels",
  async run(input) {
    const topic = toText(input.topic || input.offer || "AI service")
    const audience = toText(input.audience || "business owners")

    return {
      topic,
      audience,
      outputs: {
        blogOutline: [
          `Why ${topic} matters now`,
          `Common mistakes ${audience} make`,
          `How to implement ${topic} step-by-step`,
          "FAQ and next steps",
        ],
        landingHero: {
          headline: `Scale ${topic} outcomes without increasing headcount`,
          subheadline: `Built for ${audience} who need speed, quality, and predictable delivery.`,
          cta: "Book Strategy Call",
        },
        adCopy: [
          `Turn ${topic} into measurable growth this month.`,
          `Stop guessing. Launch a focused ${topic} plan today.`,
        ],
      },
    }
  },
}

const socialMediaGenerator: Tool = {
  name: "social_media_generator",
  description: "Builds multi-network social media post packs",
  async run(input) {
    const topic = toText(input.topic || input.offer || "AI growth")

    const platforms = ["LinkedIn", "Facebook", "Instagram", "X", "Threads"]
    const posts = platforms.flatMap((platform) =>
      Array.from({ length: 4 }).map((_, idx) => ({
        platform,
        text: `${platform} post ${idx + 1}: ${topic} insight + CTA`,
      }))
    )

    return {
      topic,
      totalPosts: posts.length,
      posts,
    }
  },
}

const imageGenerationJob: Tool = {
  name: "image_generation_job",
  description: "Creates ComfyUI-compatible payload for image generation",
  async run(input) {
    const prompt = toText(input.prompt || "High-converting marketing visual")
    const style = toText(input.style || "clean cinematic")

    return {
      provider: "comfyui",
      workflow: "image-gen-v1",
      payload: {
        prompt,
        negative_prompt: "blurry, low quality, distorted",
        style,
        width: 1024,
        height: 1024,
        steps: 30,
      },
      readyToSubmit: true,
    }
  },
}

const videoGenerationJob: Tool = {
  name: "video_generation_job",
  description: "Creates video generation payload for ComfyUI/Wan/Hunyuan/Kling/Veo style pipelines",
  async run(input) {
    const prompt = toText(input.prompt || "Create a 30-second product ad")

    return {
      providers: ["comfyui", "wan", "hunyuan", "kling", "veo"],
      storyboard: [
        "Hook: problem statement (0-5s)",
        "Solution demo (5-18s)",
        "Proof and CTA (18-30s)",
      ],
      payload: {
        prompt,
        durationSeconds: 30,
        aspectRatio: "9:16",
        fps: 24,
      },
      readyToSubmit: true,
    }
  },
}

const workflowBuilder: Tool = {
  name: "workflow_builder",
  description: "Designs automation workflow definitions for n8n and Langflow",
  async run(input) {
    const objective = toText(input.objective || "Automate inbound lead qualification")

    return {
      objective,
      n8n: {
        nodes: [
          "Webhook Trigger",
          "Normalize Input",
          "LLM Lead Scoring",
          "CRM Upsert",
          "Slack Notification",
        ],
      },
      langflow: {
        graph: ["Input", "Retriever", "LLM", "Router", "Output"],
      },
      handoff: {
        retries: 2,
        deadLetterQueue: true,
      },
    }
  },
}

const apiBuilder: Tool = {
  name: "api_builder",
  description: "Generates API architecture and OpenAPI starter schema",
  async run(input) {
    const serviceName = toText(input.serviceName || "Agency Service API")

    return {
      serviceName,
      architecture: {
        style: "REST",
        auth: "JWT + API keys",
        versioning: "URI versioning (/api/v1)",
      },
      openApiSkeleton: {
        openapi: "3.1.0",
        info: { title: serviceName, version: "1.0.0" },
        paths: {
          "/health": { get: { summary: "Health check" } },
          "/jobs": { post: { summary: "Create job" }, get: { summary: "List jobs" } },
        },
      },
    }
  },
}

const webScraper: Tool = {
  name: "web_scraper",
  description: "Extracts structured website dataset including contacts, links and product-like signals",
  async run(input) {
    const website = toText(input.website || input.url)
    const snapshot = await fetchSiteSnapshot(website)

    const links = uniq(snapshot.page.links)
    const productLikeSnippets = uniq((snapshot.page.bodyText.match(/\$\s?\d+[\d,.]*|pricing|plans|package/gi) ?? []).slice(0, 20))

    return {
      website: snapshot.url,
      dataset: {
        contacts: {
          emails: snapshot.page.emails,
          phones: snapshot.page.phones,
        },
        socials: snapshot.page.social,
        links: links.slice(0, 100),
        productSignals: productLikeSnippets,
      },
      extractedAt: new Date().toISOString(),
    }
  },
}

const proposalReportGenerator: Tool = {
  name: "proposal_report_generator",
  description: "Combines tool outputs into proposal/report payload ready for PDF rendering",
  async run(input) {
    const businessName = toText(input.businessName || "Client")
    const context = input.context && typeof input.context === "object" ? input.context : {}

    return {
      businessName,
      proposal: {
        executiveSummary: `${businessName} has immediate opportunities across SEO, conversion, and automation execution.`,
        scope: [
          "Website and security audit",
          "SEO and content growth plan",
          "Workflow automation implementation",
        ],
        estimatedTimelineWeeks: 6,
        quoteRangeUsd: {
          min: 3500,
          max: 12000,
        },
      },
      report: {
        sections: ["Overview", "Findings", "Recommendations", "Roadmap", "Investment"],
        pdfTemplate: "ignitia-proposal-v2",
      },
      context,
      generatedAt: new Date().toISOString(),
    }
  },
}

const aiSolutionArchitect: Tool = {
  name: "ai_solution_architect",
  description: "Produces AI architecture blueprint from requirements",
  async run(input) {
    const requirements = toText(input.requirements || "")
    return {
      requirements,
      architecture: {
        ingestion: ["Webhook", "Batch import"],
        intelligence: ["RAG", "Task planning", "Tool routing"],
        persistence: ["Postgres", "Vector store"],
        delivery: ["Dashboard", "PDF export", "Email notifications"],
      },
      workflow: ["Collect", "Analyze", "Recommend", "Generate deliverable"],
    }
  },
}

const fullstackDeveloper: Tool = {
  name: "fullstack_developer",
  description: "Produces implementation plan for Next.js + TypeScript + API + DB schema",
  async run(input) {
    const feature = toText(input.feature || "New AI workflow")
    return {
      feature,
      implementationPlan: {
        frontend: ["Next.js app route", "React form", "status timeline"],
        backend: ["POST execute endpoint", "run logging", "validation"],
        database: ["execution table", "indexes", "RLS policies"],
      },
    }
  },
}

const uiuxDesigner: Tool = {
  name: "uiux_designer",
  description: "Produces wireframe and design system direction",
  async run(input) {
    const product = toText(input.product || "AI Agency OS")
    return {
      product,
      wireframes: ["Dashboard", "Agent execution view", "Proposal export view"],
      designSystem: {
        typography: "Editorial Sans + mono accents",
        components: ["Metric cards", "Timeline", "Execution log table", "Sticky action bar"],
      },
    }
  },
}

const codeReviewer: Tool = {
  name: "code_reviewer",
  description: "Creates review findings for quality, security, performance and architecture",
  async run(input) {
    const target = toText(input.target || "feature branch")
    return {
      target,
      findings: [
        "Validate all request payloads at API boundary",
        "Avoid client-side admin key usage",
        "Batch DB writes for workflow step logs",
        "Add integration test coverage for agent orchestration",
      ],
      severity: {
        high: 1,
        medium: 2,
        low: 1,
      },
    }
  },
}

export const agencyOsTools: Record<string, Tool> = {
  business_research: businessResearch,
  lead_finder: leadFinder,
  website_auditor_pro: websiteAuditorPro,
  competitor_intelligence: competitorIntelligence,
  ai_solution_architect: aiSolutionArchitect,
  fullstack_developer: fullstackDeveloper,
  uiux_designer: uiuxDesigner,
  code_reviewer: codeReviewer,
  seo_strategy: seoStrategy,
  content_writer: contentWriter,
  social_media_generator: socialMediaGenerator,
  image_generation_job: imageGenerationJob,
  video_generation_job: videoGenerationJob,
  workflow_builder: workflowBuilder,
  api_builder: apiBuilder,
  web_scraper: webScraper,
  security_audit: securityAudit,
  tech_stack_analyzer: techStackAnalyzer,
  performance_optimization: performanceOptimization,
  proposal_report_generator: proposalReportGenerator,
}
