import { getTemplateById } from "./Templates"
import { buildReportDocument } from "./ReportBuilder"
import type { DocumentTool } from "./DocumentTypes"

export const Markdown: DocumentTool = {
  name: "markdown_generator",
  description: "Generate structured markdown deliverables",
  async run(input) {
    const template = getTemplateById(input.templateId || input.template)
    return buildReportDocument(input, "markdown", template)
  },
}
