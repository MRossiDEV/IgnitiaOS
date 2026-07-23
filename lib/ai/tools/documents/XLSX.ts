import { getTemplateById } from "./Templates"
import { buildReportDocument } from "./ReportBuilder"
import type { DocumentTool } from "./DocumentTypes"

export const XLSX: DocumentTool = {
  name: "xlsx_generator",
  description: "Generate an XLSX-ready workbook package",
  async run(input) {
    const template = getTemplateById(input.templateId || input.template)
    return buildReportDocument(input, "xlsx", template)
  },
}
