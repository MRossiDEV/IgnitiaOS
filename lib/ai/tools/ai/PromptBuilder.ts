function compact(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function buildPrompt(input: Record<string, any>) {
  const objective = compact(String(input.objective || input.prompt || input.task || ""))
  const audience = compact(String(input.audience || ""))
  const tone = compact(String(input.tone || "professional"))
  const outputFormat = compact(String(input.outputFormat || input.format || "structured markdown"))
  const context = compact(String(input.context || input.background || ""))

  const lines = [
    `Objective: ${objective || "Generate a high-quality response."}`,
    audience ? `Audience: ${audience}` : "",
    `Tone: ${tone}`,
    `Output Format: ${outputFormat}`,
    context ? `Context: ${context}` : "",
    input.constraints ? `Constraints: ${compact(String(input.constraints))}` : "",
    input.examples ? `Examples: ${compact(String(input.examples))}` : "",
  ].filter(Boolean)

  return lines.join("\n")
}
