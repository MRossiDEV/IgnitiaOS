import type { DocumentChart } from "./DocumentTypes"

export function normalizeChart(chart: DocumentChart) {
  const seriesTotals = chart.series.map((entry) => ({
    name: entry.name,
    total: entry.data.reduce((sum, value) => sum + value, 0),
  }))

  return {
    ...chart,
    seriesTotals,
    hasData: chart.series.some((entry) => entry.data.length > 0),
  }
}

export function chartToMarkdown(chart: DocumentChart) {
  const normalized = normalizeChart(chart)

  const rows = normalized.labels.map((label, index) => {
    const values = normalized.series.map((series) => series.data[index] ?? 0)
    return `| ${label} | ${values.join(" | ")} |`
  })

  return [
    `### ${chart.title}`,
    "",
    `Type: ${chart.type}`,
    "",
    `| Label | ${chart.series.map((series) => series.name).join(" | ")} |`,
    `| --- | ${chart.series.map(() => "---").join(" | ")} |`,
    ...rows,
  ].join("\n")
}
