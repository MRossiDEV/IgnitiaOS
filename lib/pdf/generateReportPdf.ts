// ======================================================
// Generate Report PDF
// lib/pdf/generateReportPdf.ts
// ======================================================
// Renders ReportDocument to a Buffer. Pure function, no I/O.

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "./ReportDocument";
import { prepareReportPdfData } from "./prepareReportPdfData";
import { AssembledReport } from "@/lib/ai/report-builder";
import { ReportMemory } from "@/lib/ai/core/types";

export async function generateReportPdf(
  report: AssembledReport,
  business: ReportMemory["business"]
): Promise<Buffer> {
  const data = prepareReportPdfData(report, business);
  const buffer = await renderToBuffer(React.createElement(ReportDocument, { data }));
  return buffer;
}
