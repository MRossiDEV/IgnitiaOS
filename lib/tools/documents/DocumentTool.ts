import { DOCX } from "./DOCX"
import { Markdown } from "./Markdown"
import { PDF } from "./PDF"
import { PPTX } from "./PPTX"
import { XLSX } from "./XLSX"
import type { DocumentFormat, DocumentToolInput } from "./DocumentTypes"

function resolveFormat(input: DocumentToolInput): DocumentFormat {
  const format = String(input.format || input.type || "markdown").toLowerCase()
  if (format === "pdf" || format === "docx" || format === "xlsx" || format === "pptx" || format === "markdown") {
    return format
  }
  return "markdown"
}

export const DocumentTool = {
  async run(input: DocumentToolInput) {
    const format = resolveFormat(input)

    switch (format) {
      case "pdf":
        return PDF.run(input)
      case "docx":
        return DOCX.run(input)
      case "xlsx":
        return XLSX.run(input)
      case "pptx":
        return PPTX.run(input)
      case "markdown":
      default:
        return Markdown.run(input)
    }
  },
}
