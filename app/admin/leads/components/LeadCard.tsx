"use client"

import { Lead } from "@/lib/ai/models/lead"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Phone, Mail, Clock, Flame, AlertCircle, MoreVertical, Calendar, Plus, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

interface LeadCardProps {
  lead: Lead
  onUpdate: (lead: Lead) => void
}

export function LeadCardComponent({ lead, onUpdate }: LeadCardProps) {
  const router = useRouter()
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue =
    lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date()

  // Check if not contacted in 48 hours
  const notContactedIn48h =
    (!lead.lastContactedAt || new Date(lead.lastContactedAt) < new Date(Date.now() - 48 * 60 * 60 * 1000)) &&
    lead.status !== "lost" &&
    lead.status !== "converted"

  const priorityConfig = {
    hot: { color: "destructive", icon: Flame, label: "Hot" },
    warm: { color: "default", icon: Clock, label: "Warm" },
    cold: { color: "secondary", icon: Clock, label: "Cold" },
  }

  const priority = lead.priority ? priorityConfig[lead.priority] : null

  const handleQuickAction = async (action: string, e: React.MouseEvent) => {
    e.stopPropagation()

    switch (action) {
      case "call":
        if (lead.phone) {
          window.location.href = `tel:${lead.phone}`
        }
        break
      case "email":
        window.location.href = `mailto:${lead.email}`
        break
      case "view":
        router.push(`/admin/leads/${lead.id}`)
        break
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note")
      return
    }

    setIsAddingNote(true)
    try {
      const updatedNotes = lead.notes ? `${lead.notes}\n---\n${noteText}` : noteText
      
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      const data = await response.json()
      onUpdate(data.lead)
      toast.success("Note added ✅")
      setShowNoteDialog(false)
      setNoteText("")
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add note")
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleConvertToOrder = async () => {
    setIsConverting(true)
    try {
      // First, update lead status to converted
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "converted" }),
      })

      if (!response.ok) {
        throw new Error("Failed to convert lead")
      }

      const data = await response.json()
      onUpdate(data.lead)

      // Redirect to create order with lead info pre-filled
      router.push(`/admin/orders/new?leadId=${lead.id}&name=${encodeURIComponent(lead.name || '')}&email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company || '')}&estimatedValue=${lead.estimatedValue || 0}`)
      
      toast.success("Lead converted! Creating order...")
      setShowConvertDialog(false)
    } catch (error) {
      console.error("Error converting lead:", error)
      toast.error("Failed to convert lead")
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-grab active:cursor-grabbing
        bg-white rounded-xl shadow-md p-4 
        hover:shadow-xl transition-all border
        ${isOverdue ? "border-l-4 border-l-red-500 border-red-300" : "border-gray-200"}
        ${notContactedIn48h ? "bg-amber-50 border-l-4 border-l-amber-500" : ""}
        ${priority?.color === "destructive" ? "border-l-4 border-l-orange-500" : ""}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <h3
                className="text-base font-semibold text-purple-700 truncate cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/admin/leads/${lead.id}`)
                }}
              >
                {lead.name || "Unnamed Lead"}
              </h3>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{lead.name}</h4>
                {lead.lastContactedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last contacted:{" "}
                    {formatDistanceToNow(new Date(lead.lastContactedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
                {lead.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2">
                    {lead.notes}
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
          {lead.company && (
            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {priority && (
            <Badge variant={priority.color as any} className="text-xs">
              <priority.icon className="w-3 h-3 mr-1" />
              {priority.label}
            </Badge>
          )}
          {notContactedIn48h && (
            <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-900 animate-pulse">
              <AlertCircle className="w-3 h-3 mr-1" />
              No Contact 48h
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate text-xs">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {lead.source}
          </Badge>
          {lead.industry && (
            <Badge variant="outline" className="text-xs">
              {lead.industry}
            </Badge>
          )}
        </div>
        {lead.estimatedValue && (
          <span className="font-semibold text-green-600">
            ${lead.estimatedValue.toLocaleString()}
          </span>
        )}
      </div>

      {/* Timeline Info */}
      {(lead.lastContactedAt || lead.nextFollowUpAt) && (
        <div className="space-y-1 mb-3 text-xs">
          {lead.lastContactedAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>
                Last contact:{" "}
                {formatDistanceToNow(new Date(lead.lastContactedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
          {lead.nextFollowUpAt && (
            <div
              className={`flex items-center gap-2 ${
                isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                Follow-up:{" "}
                {formatDistanceToNow(new Date(lead.nextFollowUpAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <button
          onClick={(e) => handleQuickAction("email", e)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
        {lead.phone && (
          <button
            onClick={(e) => handleQuickAction("call", e)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleQuickAction("view", e)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setShowNoteDialog(true)
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Add Note
            </DropdownMenuItem>
            {lead.status !== "converted" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConvertDialog(true)
                }}
                className="text-green-700"
              >
                Convert to Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Add Note to {lead.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={isAddingNote || !noteText.trim()}
              >
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Order Dialog */}
        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Convert Lead to Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Lead Details:</p>
                <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                  <p><span className="font-semibold">Name:</span> {lead.name}</p>
                  <p><span className="font-semibold">Email:</span> {lead.email}</p>
                  {lead.company && <p><span className="font-semibold">Company:</span> {lead.company}</p>}
                  {lead.estimatedValue && <p><span className="font-semibold">Est. Value:</span> ${lead.estimatedValue.toLocaleString()}</p>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This will move the lead to "converted" status and open the order creation form.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConvertDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConvertToOrder}
                disabled={isConverting}
                className="bg-green-700 hover:bg-green-800"
              >
                {isConverting ? "Converting..." : "Convert to Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
