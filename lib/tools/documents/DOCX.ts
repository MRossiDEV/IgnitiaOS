import { getTemplateById } from "./Templates"
import { buildReportDocument } from "./ReportBuilder"
import type { DocumentTool } from "./DocumentTypes"

export const DOCX: DocumentTool = {
  name: "docx_generator",
  description: "Generate a DOCX-ready document package",
  async run(input) {
    const template = getTemplateById(input.templateId || input.template)
    return buildReportDocument(input, "docx", template)
  },
}
