"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, MessageSquare, Shield, Plus, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TemplateTable } from "@/components/admin/template-table"
import { TemplateFormModal } from "@/components/admin/template-form-modal"
import { useToast } from "@/hooks/use-toast"
import type { Template, CreateTemplateInput, UpdateTemplateInput } from "@/lib/models/template"

export default function ContentTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/templates", {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error("Failed to load templates")
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (template?: Template) => {
    setSelectedTemplate(template)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedTemplate(undefined)
  }

  const handleCreateTemplate = async (data: CreateTemplateInput | UpdateTemplateInput) => {
    try {
      setIsSubmitting(true)

      if (selectedTemplate) {
        // Update template
        const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error("Failed to update template")
        }

        const { template } = await response.json()
        setTemplates(templates.map(t => t.id === template.id ? template : t))
        
        toast({
          title: "Success",
          description: "Template updated successfully",
        })
      } else {
        // Create template
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create template")
        }

        const { template } = await response.json()
        setTemplates([template, ...templates])
        
        toast({
          title: "Success",
          description: "Template created successfully",
        })
      }

      handleCloseModal()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (template: Template) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      setTemplates(templates.filter(t => t.id !== template.id))
      
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700">AI Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage templates for report generation</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* TEMPLATES TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${templates.length} ${templates.length === 1 ? "template" : "templates"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <TemplateTable
              templates={templates}
              onEdit={(template) => handleOpenModal(template)}
              onDelete={handleDeleteTemplate}
            />
          )}
        </CardContent>
      </Card>

      {/* BENEFITS */}
      <Card>
        <CardHeader>
          <CardTitle>How Templates Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
            <div>
              <p className="font-medium text-sm">Create Once, Use Many Times</p>
              <p className="text-xs text-muted-foreground">
                Define a template and reuse it for multiple reports with different inputs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
            <div>
              <p className="font-medium text-sm">Customizable for Industries</p>
              <p className="text-xs text-muted-foreground">
                Tailor prompts for different industries to get more relevant results
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
            <div>
              <p className="font-medium text-sm">Control Quality with Parameters</p>
              <p className="text-xs text-muted-foreground">
                Adjust model, temperature, and tokens to fine-tune output quality
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
            <div>
              <p className="font-medium text-sm">Multiple Output Formats</p>
              <p className="text-xs text-muted-foreground">
                Generate reports in Markdown, HTML, or JSON formats
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* TEMPLATE FORM MODAL */}
      <TemplateFormModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        template={selectedTemplate}
        onSubmit={handleCreateTemplate}
        isLoading={isSubmitting}
      />
    </div>
  )
}

