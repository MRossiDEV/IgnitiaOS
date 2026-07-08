'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Phone, ChevronRight, Users } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  last_contacted_at: string | null
}

interface LeadsNotContactedProps {
  leads: Lead[]
  isLoading?: boolean
}

export function LeadsNotContactedWidget({ leads, isLoading }: LeadsNotContactedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-slate-100 text-slate-800'
      case 'qualified':
        return 'bg-green-100 text-green-800'
      case 'converted':
        return 'bg-green-200 text-green-900'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getDaysSinceContact = (lastContactedAt: string | null) => {
    if (!lastContactedAt) return 'Never'
    const days = Math.floor(
      (Date.now() - new Date(lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Leads Not Contacted (48h+)</CardTitle>
          <Phone className="w-5 h-5 text-orange-500" />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {leads.length} leads need follow-up contact
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-slate-100 rounded" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>All leads have been contacted recently!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                      <span className="text-xs font-medium text-orange-600">
                        {getDaysSinceContact(lead.last_contacted_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Added: {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
        {leads.length > 0 && (
          <Link href="/admin/leads">
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Leads
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
