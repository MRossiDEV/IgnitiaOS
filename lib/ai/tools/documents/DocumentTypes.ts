import type { Tool } from "../types"

export type DocumentFormat = "pdf" | "docx" | "xlsx" | "pptx" | "markdown"

export type DocumentSection = {
  id: string
  title: string
  content: string | Record<string, any> | Array<Record<string, any>>
}

export type DocumentChartType = "bar" | "line" | "pie" | "area" | "table"

export type DocumentChart = {
  id: string
  title: string
  type: DocumentChartType
  labels: string[]
  series: Array<{
    name: string
    data: number[]
  }>
}

export type DocumentTemplate = {
  id: string
  name: string
  description: string
  category: string
  format: DocumentFormat
  sections: DocumentSection[]
}

export type DocumentArtifact = {
  format: DocumentFormat
  fileName: string
  mimeType: string
  content: string
  title: string
  metadata: Record<string, any>
}

export type DocumentToolInput = Record<string, any>

