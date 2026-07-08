import { getTemplateById } from "./Templates"
import { buildReportDocument } from "./ReportBuilder"
import type { DocumentTool } from "./DocumentTypes"

export const PDF: DocumentTool = {
  name: "pdf_generator",
  description: "Generate a PDF-ready document package",
  async run(input) {
    const template = getTemplateById(input.templateId || input.template)
    return buildReportDocument(input, "pdf", template)
  },
}
