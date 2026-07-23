/**
 * Template Form Modal Component
 * 
 * Modal for creating and editing templates
 */

"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Template, CreateTemplateInput, UpdateTemplateInput, TemplateType, OutputFormat } from '@/lib/ai/models/template'
import { TEMPLATE_TYPE_LABELS, TEMPLATE_TYPE_DESCRIPTIONS, OUTPUT_FORMAT_LABELS, AI_MODELS } from '@/lib/ai/models/template'

interface TemplateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: Template
  onSubmit: (data: CreateTemplateInput | UpdateTemplateInput) => Promise<void>
  isLoading?: boolean
}

export function TemplateFormModal({
  open,
  onOpenChange,
  template,
  onSubmit,
  isLoading = false,
}: TemplateFormModalProps) {
  const [name, setName] = useState('')
  const [templateType, setTemplateType] = useState<TemplateType>('custom')
  const [industry, setIndustry] = useState('')
  const [promptTemplate, setPromptTemplate] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [temperature, setTemperature] = useState('0.7')
  const [maxTokens, setMaxTokens] = useState('2000')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown')
  const [error, setError] = useState<string>('')

  const isEditMode = !!template

  useEffect(() => {
    if (template) {
      setName(template.name)
      setTemplateType(template.template_type)
      setIndustry(template.industry || '')
      setPromptTemplate(template.prompt_template)
      setSystemPrompt(template.system_prompt || '')
      setModel(template.model)
      setTemperature(template.temperature.toString())
      setMaxTokens(template.max_tokens.toString())
      setOutputFormat(template.output_format)
    } else {
      setName('')
      setTemplateType('custom')
      setIndustry('')
      setPromptTemplate('')
      setSystemPrompt('')
      setModel('gpt-4')
      setTemperature('0.7')
      setMaxTokens('2000')
      setOutputFormat('markdown')
    }
    setError('')
  }, [template, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    if (!promptTemplate.trim()) {
      setError('Prompt template is required')
      return
    }

    const tempValue = parseFloat(temperature)
    if (isNaN(tempValue) || tempValue < 0 || tempValue > 2) {
      setError('Temperature must be between 0 and 2')
      return
    }

    const tokensValue = parseInt(maxTokens)
    if (isNaN(tokensValue) || tokensValue < 1 || tokensValue > 4000) {
      setError('Max tokens must be between 1 and 4000')
      return
    }

    try {
      const data: CreateTemplateInput | UpdateTemplateInput = {
        name: name.trim(),
        template_type: templateType,
        industry: industry.trim() || undefined,
        prompt_template: promptTemplate.trim(),
        system_prompt: systemPrompt.trim() || undefined,
        model,
        temperature: tempValue,
        max_tokens: tokensValue,
        output_format: outputFormat,
      }

      await onSubmit(data)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your template for report generation'
              : 'Create a new AI template for report generation'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* BASIC TAB */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium Report Template"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Template Type */}
              <div className="space-y-2">
                <Label htmlFor="templateType">Template Type</Label>
                <Select value={templateType} onValueChange={(value) => setTemplateType(value as TemplateType)} disabled={isLoading}>
                  <SelectTrigger id="templateType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_report">Free Report</SelectItem>
                    <SelectItem value="paid_report">Paid Report</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {TEMPLATE_TYPE_DESCRIPTIONS[templateType]}
                </p>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Hospitality, SaaS, E-commerce"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Prompt Template */}
              <div className="space-y-2">
                <Label htmlFor="promptTemplate">Prompt Template</Label>
                <Textarea
                  id="promptTemplate"
                  placeholder="Enter your AI prompt template here..."
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  disabled={isLoading}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{business_name}'}, {'{industry}'}, etc. for placeholders
                </p>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Define the AI behavior and context..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              {/* AI Model */}
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel} disabled={isLoading}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = deterministic, 2 = creative
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    1-4000 tokens
                  </p>
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)} disabled={isLoading}>
                  <SelectTrigger id="outputFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
