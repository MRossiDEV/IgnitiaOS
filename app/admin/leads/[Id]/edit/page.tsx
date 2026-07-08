"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { UUID } from "crypto"

interface Lead {
  id: string
  name?: string
  email: string
  phone?: string
  company?: string
  status: string
  source: string
  priority?: string
  notes?: string
  estimatedValue?: number
  lastContactedAt?: string
  createdAt: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  
  console.log("LeadDetailPage params:", params)
  console.log("LeadDetailPage id:", params.Id)

  // Load lead from API
  useEffect(() => {
    async function loadLead(Id: string) {
      try {
        setLoading(true)

        const response = await fetch(`/api/leads/${params.Id}`)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load lead")
        }

        setLead(data.lead)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load lead")
      } finally {
        setLoading(false)
      }
    }

    loadLead(id)
  }, [id, searchParams])

  const handleConvertToOrder = async () => {
    if (!lead) return

    setIsConverting(true)
    try {
      // Redirect to create order with lead info pre-filled
      router.push(
        `/admin/orders/new?leadId=${lead.id}&name=${encodeURIComponent(lead.name || "")}&email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company || "")}&estimatedValue=${lead.estimatedValue || 0}`
      )
      toast.success("Creating order from lead...")
      setShowConvertDialog(false)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to create order")
    } finally {
      setIsConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading lead...</p>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-500">{error || "Lead not found"}</p>
        <Button onClick={() => router.push("/admin/leads")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.push("/admin/leads")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Leads
      </Button>

      {/* Lead Status Alert */}
      {lead.status === "converted" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Lead Converted!</h3>
            <p className="text-sm text-green-800 mt-1">
              This lead has been successfully moved to "Converted" status.
            </p>
          </div>
        </div>
      )}

      {/* Lead Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl text-purple-700">
                {lead.name || "Unnamed Lead"}
              </CardTitle>
              {lead.company && (
                <p className="text-muted-foreground mt-1">{lead.company}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                {lead.status}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <a
                href={`mailto:${lead.email}`}
                className="text-lg text-purple-600 hover:underline"
              >
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="text-lg text-purple-600 hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <p className="text-lg font-medium capitalize">{lead.source}</p>
            </div>
            {lead.priority && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <p className="text-lg font-medium capitalize">{lead.priority}</p>
              </div>
            )}
          </div>

          {/* Value Information */}
          {lead.estimatedValue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Estimated Value</p>
              <p className="text-2xl font-bold text-blue-700">
                ${lead.estimatedValue.toLocaleString()}
              </p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Created</p>
              <p>{new Date(lead.createdAt).toLocaleDateString()}</p>
            </div>
            {lead.lastContactedAt && (
              <div>
                <p className="font-medium text-muted-foreground">Last Contacted</p>
                <p>{new Date(lead.lastContactedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {lead.status !== "converted" && (
              <Button
                onClick={() => setShowConvertDialog(true)}
                className="bg-green-700 hover:bg-green-800"
              >
                Convert to Order
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/admin/leads")}>
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Convert to Order Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Lead Details:</p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Name:</span> {lead.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {lead.email}
                </p>
                {lead.company && (
                  <p>
                    <span className="font-semibold">Company:</span> {lead.company}
                  </p>
                )}
                {lead.estimatedValue && (
                  <p>
                    <span className="font-semibold">Est. Value:</span> $
                    {lead.estimatedValue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This will open the order creation form with this lead's information pre-filled.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertToOrder}
              disabled={isConverting}
              className="bg-green-700 hover:bg-green-800"
            >
              {isConverting ? "Converting..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
