import { runTool } from "@/lib/tools/runner"

type ToolCall = {
  tool: string
  input: Record<string, any>
} | null

function extractEmail(message: string): string | null {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
  return match?.[0] ?? null
}

function extractUrl(message: string): string | null {
  const directUrl = message.match(/https?:\/\/[^\s)]+/i)

  if (directUrl?.[0]) {
    return directUrl[0]
  }

  const withDomain = message.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[\w\-./?%&=]*)?/i)

  return withDomain?.[0] ?? null
}

function fakeLLMDecision(message: string, _agent: any): ToolCall {
  const lower = message.toLowerCase()

  if (
    lower.includes("seo audit") ||
    lower.includes("website audit") ||
    lower.includes("audit this landing page") ||
    lower.includes("conversion bottleneck") ||
    lower.includes("conversion audit")
  ) {
    const focus =
      lower.includes("seo")
        ? "seo"
        : lower.includes("conversion")
          ? "conversion"
          : "general"

    const url = extractUrl(message)

    return {
      tool: "website_audit",
      input: {
        url: url ?? "",
        focus,
      },
    }
  }

  if (
    lower.includes("search lead") ||
    lower.includes("find lead") ||
    lower.includes("prospect")
  ) {
    return {
      tool: "search_leads",
      input: {
        query: message,
      },
    }
  }

  if (
    lower.includes("create lead") ||
    lower.includes("add lead") ||
    lower.includes("new lead")
  ) {
    return {
      tool: "create_lead",
      input: {
        name: "Generated Lead",
        email: extractEmail(message) || "lead@example.com",
        source: "agent",
        notes: message,
      },
    }
  }

  if (
    lower.includes("send email") ||
    lower.includes("email this") ||
    lower.includes("mail ")
  ) {
    return {
      tool: "send_email",
      input: {
        to: extractEmail(message) || "test@example.com",
        subject: "Agent Follow-up",
        body: message,
      },
    }
  }

  return null
}

function fakeFinalLLMResponse(
  message: string,
  toolResult: Awaited<ReturnType<typeof runTool>> | null
): string {
  if (!toolResult) {
    return [
      "I analyzed your request and did not need to call a tool.",
      "",
      `Request: ${message}`,
      "",
      "If you want tool execution, include clear intents like 'SEO audit', 'conversion audit', 'search leads', 'create lead', or 'send email'.",
    ].join("\n")
  }

  if (!toolResult.success) {
    return [
      `I attempted to run '${toolResult.tool}' but it failed.`,
      `Error: ${toolResult.error || "Unknown error"}`,
      `Duration: ${toolResult.duration} ms`,
    ].join("\n")
  }

  if (toolResult.tool === "website_audit") {
    const data = (toolResult.data ?? {}) as {
      focus?: string
      url?: string
      title?: string
      metrics?: {
        seoScore?: number
        conversionScore?: number
      }
      findings?: {
        seo?: string[]
        conversion?: string[]
      }
      topFixes?: string[]
    }

    const seoFindings = data.findings?.seo ?? []
    const conversionFindings = data.findings?.conversion ?? []
    const topFixes = data.topFixes ?? []

    return [
      "Website audit complete.",
      `Focus: ${data.focus ?? "general"}`,
      `URL: ${data.url ?? "-"}`,
      `Page title: ${data.title || "-"}`,
      `SEO score: ${data.metrics?.seoScore ?? 0}/100`,
      `Conversion score: ${data.metrics?.conversionScore ?? 0}/100`,
      "",
      "SEO findings:",
      ...(seoFindings.length > 0 ? seoFindings.map((f) => `- ${f}`) : ["- No major SEO issues detected by this quick audit."]),
      "",
      "Conversion findings:",
      ...(conversionFindings.length > 0
        ? conversionFindings.map((f) => `- ${f}`)
        : ["- No major conversion issues detected by this quick audit."]),
      "",
      "Top 5 fixes:",
      ...(topFixes.length > 0
        ? topFixes.slice(0, 5).map((f, i) => `${i + 1}. ${f}`)
        : ["1. Add explicit SEO and conversion signals for a deeper audit."]),
      "",
      `Execution time: ${toolResult.duration} ms`,
      "",
      `Original request: ${message}`,
    ].join("\n")
  }

  return [
    `Executed tool: ${toolResult.tool}`,
    `Duration: ${toolResult.duration} ms`,
    "",
    "Result:",
    JSON.stringify(toolResult.data ?? {}, null, 2),
  ].join("\n")
}

export async function runAgent(agent: any, message: string) {
  // 1. Ask LLM what to do (simplified version)
  const toolCall = await fakeLLMDecision(message, agent)

  let toolResult = null

  // 2. Execute tool if needed
  if (toolCall?.tool) {
    toolResult = await runTool(
      toolCall.tool,
      toolCall.input
    )
  }

  // 3. Final response
  return await fakeFinalLLMResponse(message, toolResult)
}