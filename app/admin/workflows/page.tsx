/**
 * Workflows Page
 * View and manage delivery workflows
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function WorkflowsPage() {
  const workflows = [
    {
      id: '1',
      orderId: '1',
      type: 'SEO Audit',
      status: 'in_progress',
      currentStep: 2,
      totalSteps: 5,
      steps: ['Crawl Website', 'Analyze SEO', 'Competitor Analysis', 'Generate Report', 'Review & QA']
    },
    {
      id: '2',
      orderId: '2',
      type: 'Content Optimization',
      status: 'pending_input',
      currentStep: 0,
      totalSteps: 5,
      steps: ['Analyze Content', 'Generate Content', 'Optimize SEO', 'Client Review', 'Implement']
    }
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'bg-slate-50 text-slate-700',
      in_progress: 'bg-blue-50 text-blue-700',
      completed: 'bg-green-50 text-green-700',
      failed: 'bg-red-50 text-red-700'
    }
    return colors[status] || 'bg-slate-50'
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Delivery Workflows</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage internal delivery processes</p>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.type}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Order #{workflow.orderId}</p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.split('_').join(' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-slate-600">{workflow.currentStep}/{workflow.totalSteps}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Steps:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {workflow.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded text-center ${
                        idx < workflow.currentStep
                          ? 'bg-green-100 text-green-700'
                          : idx === workflow.currentStep
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
