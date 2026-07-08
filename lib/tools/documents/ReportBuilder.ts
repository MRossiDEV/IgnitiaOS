import { DEFAULT_DOCUMENT_AUTHOR, DEFAULT_DOCUMENT_LANGUAGE, DEFAULT_DOCUMENT_TITLE } from "./constants"
import { chartToMarkdown } from "./Charts"
import type { DocumentArtifact, DocumentChart, DocumentSection, DocumentTemplate } from "./DocumentTypes"

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function stringifyContent(content: DocumentSection["content"]): string {
  if (typeof content === "string") {
    return content
  }

  return JSON.stringify(content, null, 2)
}

export function buildReportDocument(input: Record<string, any>, format: DocumentArtifact["format"], template?: DocumentTemplate): DocumentArtifact {
  const title = normalizeText(input.title || input.reportTitle || template?.name || DEFAULT_DOCUMENT_TITLE) || DEFAULT_DOCUMENT_TITLE
  const fileName = normalizeText(input.fileName || input.filename || title).replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)+/g, "").toLowerCase()
  const sections: DocumentSection[] = Array.isArray(input.sections) && input.sections.length > 0
    ? input.sections
    : template?.sections ?? []

  const charts: DocumentChart[] = Array.isArray(input.charts) ? input.charts : []

  const body = [
    `# ${title}`,
    "",
    `Author: ${normalizeText(input.author || DEFAULT_DOCUMENT_AUTHOR) || DEFAULT_DOCUMENT_AUTHOR}`,
    `Language: ${normalizeText(input.language || DEFAULT_DOCUMENT_LANGUAGE) || DEFAULT_DOCUMENT_LANGUAGE}`,
    template ? `Template: ${template.name}` : "",
    "",
    ...sections.map((section) => [
      `## ${section.title}`,
      "",
      stringifyContent(section.content),
      "",
    ].join("\n")),
    ...charts.map((chart) => chartToMarkdown(chart)),
  ]
    .filter(Boolean)
    .join("\n")

  return {
    format,
    fileName: `${fileName || "document"}.${format}`,
    mimeType: format === "markdown" ? "text/markdown" : "application/octet-stream",
    content: body,
    title,
    metadata: {
      author: normalizeText(input.author || DEFAULT_DOCUMENT_AUTHOR) || DEFAULT_DOCUMENT_AUTHOR,
      language: normalizeText(input.language || DEFAULT_DOCUMENT_LANGUAGE) || DEFAULT_DOCUMENT_LANGUAGE,
      templateId: template?.id ?? null,
      source: "Ignitia AI",
      charts: charts.length,
      sections: sections.length,
    },
  }
}
