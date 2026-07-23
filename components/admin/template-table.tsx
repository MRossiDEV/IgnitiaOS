/**
 * Template Table Component
 * 
 * Displays templates in a table with edit/delete actions
 */

"use client"

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import type { Template } from '@/lib/ai/models/template'
import { TEMPLATE_TYPE_LABELS } from '@/lib/ai/models/template'

interface TemplateTableProps {
  templates: Template[]
  isLoading?: boolean
  onEdit?: (template: Template) => void
  onDelete?: (template: Template) => void
  onView?: (template: Template) => void
}

export function TemplateTable({
  templates,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}: TemplateTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<Template | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Loading templates...
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No templates found. Create your first template to get started.
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      template.template_type === 'free_report'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : template.template_type === 'paid_report'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : template.template_type === 'email'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {TEMPLATE_TYPE_LABELS[template.template_type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {template.industry || '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {template.model}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={template.is_active ? 'default' : 'secondary'}
                    className={
                      template.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  v{template.version}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(template.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onView?.(template)}
                        className="cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit?.(template)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(template)}
                        className="cursor-pointer text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete?.(deleteConfirm)
                  setDeleteConfirm(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
