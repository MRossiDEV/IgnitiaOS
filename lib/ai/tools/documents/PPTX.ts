import { getTemplateById } from "./Templates"
import { buildReportDocument } from "./ReportBuilder"
import type { DocumentTool } from "./DocumentTypes"

export const PPTX: DocumentTool = {
  name: "pptx_generator",
  description: "Generate a presentation-ready slide deck package",
  async run(input) {
    const template = getTemplateById(input.templateId || input.template)
    return buildReportDocument(input, "pptx", template)
  },
}
