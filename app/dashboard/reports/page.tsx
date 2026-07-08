/**
 * User Report Dashboard
 * 
 * Shows past reports, status, and upsell opportunities
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, RefreshCw, Zap } from 'lucide-react'

interface Report {
  id: string
  business_name: string
  industry: string
  status: 'pending' | 'generating' | 'delivered' | 'failed'
  created_at: string
  pdf_url?: string
  html_report_url?: string
  kpi_data?: Record<string, any>
}

interface UpsellOpportunity {
  id: string
  report_id: string
  service_type: 'premium_analysis' | 'consulting' | 'managed_automation'
  service_description?: string
  upsell_price?: number
  email_sent_at?: string
  converted: boolean
}

export default function ReportDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [upsells, setUpsells] = useState<UpsellOpportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 5000) // Poll for updates
    return () => clearInterval(interval)
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/user/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setUpsells(data.upsells)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}/regenerate`, {
        method: 'POST',
      })
      fetchReports()
    } catch (error) {
      console.error('Failed to regenerate report:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Your KPI Reports
          </h1>
          <p className="text-slate-600">
            View and manage your automated KPI reports
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-6 mb-8">
          {reports.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-12 text-center">
                <p className="text-slate-600 mb-4">
                  No reports yet. Generate your first KPI report.
                </p>
                <Button asChild>
                  <a href="/industries/restaurant">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{report.business_name}</CardTitle>
                      <CardDescription>
                        {report.industry} • {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* KPI Highlights */}
                    {report.kpi_data && (
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(report.kpi_data)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="bg-slate-50 p-3 rounded">
                              <p className="text-sm text-slate-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-lg font-semibold text-slate-900">
                                {typeof value === 'number'
                                  ? value.toFixed(2)
                                  : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Status Messages */}
                    {report.status === 'pending' && (
                      <div className="bg-blue-50 p-3 rounded flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <p className="text-sm text-blue-800">
                          Your report is being generated. This usually takes 2-5 minutes.
                        </p>
                      </div>
                    )}

                    {report.status === 'failed' && (
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-sm text-red-800 mb-3">
                          Report generation failed. Please try again.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRegenerate(report.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {report.pdf_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={report.pdf_url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRegenerate(report.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upsell Opportunities */}
        {upsells.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Recommended Services
            </h2>
            <div className="grid gap-6">
              {upsells
                .filter((u) => !u.converted)
                .map((upsell) => (
                  <Card
                    key={upsell.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-blue-900">
                            <Zap className="w-5 h-5 inline mr-2 text-yellow-500" />
                            {upsell.service_type === 'premium_analysis'
                              ? 'Premium Deep Dive Analysis'
                              : upsell.service_type === 'consulting'
                              ? 'Expert Consulting'
                              : 'Managed Automation'}
                          </CardTitle>
                          <CardDescription className="text-blue-800 mt-2">
                            {upsell.service_description ||
                              'Get personalized insights and implementation strategies'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900">
                            ${upsell.upsell_price || 500}
                          </div>
                          <p className="text-sm text-blue-700">one-time</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Learn More & Upgrade
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Generating...' },
    generating: { variant: 'secondary', label: 'In Progress' },
    delivered: { variant: 'default', label: 'Ready' },
    failed: { variant: 'destructive', label: 'Failed' },
  }

  const config = variants[status] || variants.pending

  return <Badge variant={config.variant}>{config.label}</Badge>
}
