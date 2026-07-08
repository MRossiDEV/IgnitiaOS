"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, Target, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LeadEvaluationMetrics {
  estimatedValue: number
  seriousnessScore: number
  actionScore: number
  overallRank: number
  insights: string[]
  recommendation: "high-priority" | "medium-priority" | "low-priority"
}

interface EvaluatedLead {
  id: string
  name?: string
  email: string
  company?: string
  status: string
  metrics: LeadEvaluationMetrics
}

export function LeadAIEvaluation() {
  const [open, setOpen] = useState(false)
  const [evaluatedLeads, setEvaluatedLeads] = useState<EvaluatedLead[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [selectedLead, setSelectedLead] = useState<EvaluatedLead | null>(null)

  const handleEvaluate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/leads/evaluate", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate leads")
      }

      const data = await response.json()
      setEvaluatedLeads(data.evaluatedLeads)
      setSummary(data.summary)
      setOpen(true)
      toast.success("Lead evaluation complete!")
    } catch (error) {
      console.error("Error evaluating leads:", error)
      toast.error("Failed to evaluate leads")
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "high-priority":
        return "bg-red-100 text-red-900"
      case "medium-priority":
        return "bg-amber-100 text-amber-900"
      case "low-priority":
        return "bg-gray-100 text-gray-900"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <>
      <Button
        onClick={handleEvaluate}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            AI Evaluate Leads
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Lead AI Evaluation Report</DialogTitle>
          </DialogHeader>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-700">
                      {summary.highPriority}
                    </div>
                    <p className="text-sm text-red-600">High Priority</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-700">
                      {summary.mediumPriority}
                    </div>
                    <p className="text-sm text-amber-600">Medium Priority</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {summary.lowPriority}
                    </div>
                    <p className="text-sm text-gray-600">Low Priority</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rankings Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[5%]">Rank</TableHead>
                  <TableHead className="w-[20%]">Lead Name</TableHead>
                  <TableHead className="w-[20%]">Company</TableHead>
                  <TableHead className="w-[12%]">Est. Value</TableHead>
                  <TableHead className="w-[12%]">Seriousness</TableHead>
                  <TableHead className="w-[12%]">Action Score</TableHead>
                  <TableHead className="w-[10%]">Overall</TableHead>
                  <TableHead className="w-[9%]">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluatedLeads.map((lead, index) => (
                  <TableRow
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell className="font-medium">{lead.name || lead.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.company || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        ${lead.metrics.estimatedValue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress
                          value={lead.metrics.seriousnessScore}
                          className="h-2"
                        />
                        <span className={`text-xs font-semibold ${getScoreColor(lead.metrics.seriousnessScore)}`}>
                          {lead.metrics.seriousnessScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress
                          value={lead.metrics.actionScore}
                          className="h-2"
                        />
                        <span className={`text-xs font-semibold ${getScoreColor(lead.metrics.actionScore)}`}>
                          {lead.metrics.actionScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-lg font-bold ${getScoreColor(lead.metrics.overallRank)}`}>
                        {lead.metrics.overallRank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRecommendationColor(lead.metrics.recommendation)}`}
                      >
                        {lead.metrics.recommendation.replace("-", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Lead Details Modal */}
          {selectedLead && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {selectedLead.name || selectedLead.email}
                  </h3>
                  {selectedLead.company && (
                    <p className="text-sm text-blue-700">{selectedLead.company}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase">
                    Estimated Value
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedLead.metrics.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase">
                    Overall Rank
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedLead.metrics.overallRank}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                    Seriousness Score
                  </p>
                  <Progress
                    value={selectedLead.metrics.seriousnessScore}
                    className="h-3"
                  />
                  <p className="text-sm font-semibold mt-1">
                    {selectedLead.metrics.seriousnessScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                    Action Score
                  </p>
                  <Progress
                    value={selectedLead.metrics.actionScore}
                    className="h-3"
                  />
                  <p className="text-sm font-semibold mt-1">
                    {selectedLead.metrics.actionScore}%
                  </p>
                </div>
              </div>

              {selectedLead.metrics.insights.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                    Key Insights
                  </p>
                  <ul className="space-y-1">
                    {selectedLead.metrics.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
