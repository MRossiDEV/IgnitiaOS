/**
 * Template Model
 * 
 * Types and interfaces for AI template management
 */

export type TemplateType = 'free_report' | 'paid_report' | 'email' | 'custom'
export type OutputFormat = 'markdown' | 'html' | 'json'

export interface Template {
  id: string
  organization_id: string
  name: string
  template_type: TemplateType
  industry?: string
  prompt_template: string
  system_prompt?: string
  model: string
  temperature: number
  max_tokens: number
  output_format: OutputFormat
  placeholders: string[]
  custom_sections: Record<string, any>[]
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface CreateTemplateInput {
  name: string
  template_type: TemplateType
  industry?: string
  prompt_template: string
  system_prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  output_format?: OutputFormat
  placeholders?: string[]
  custom_sections?: Record<string, any>[]
}

export interface UpdateTemplateInput {
  name?: string
  template_type?: TemplateType
  industry?: string
  prompt_template?: string
  system_prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  output_format?: OutputFormat
  placeholders?: string[]
  custom_sections?: Record<string, any>[]
  is_active?: boolean
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  free_report: 'Free Report',
  paid_report: 'Paid Report',
  email: 'Email',
  custom: 'Custom',
}

export const TEMPLATE_TYPE_DESCRIPTIONS: Record<TemplateType, string> = {
  free_report: 'Template for free report generation',
  paid_report: 'Template for premium paid reports',
  email: 'Email content template',
  custom: 'Custom template for other purposes',
}

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  markdown: 'Markdown',
  html: 'HTML',
  json: 'JSON',
}

export const AI_MODELS = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']
