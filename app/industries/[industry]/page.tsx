/**
 * Industry Landing Page
 * 
 * Shows industry-specific KPI report offering
 * Includes: Hero, KPI list, testimonials, CTA, pricing
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface IndustryPageProps {
  params: {
    industry: string
  }
}

// Industry-specific content
const INDUSTRY_CONFIGS: Record<string, any> = {
  restaurant: {
    displayName: 'Restaurant',
    hero: 'Get Your Restaurant\'s Performance Report in 5 Minutes',
    subtitle: 'Understand your key metrics, identify gaps, and get actionable growth opportunities.',
    kpis: [
      'Average Customer Spend',
      'Table Turnover Rate',
      'Food Cost Percentage',
      'Labor Cost Analysis',
      'Peak Hours Optimization',
      'Menu Performance Breakdown',
    ],
    price: 50,
    premiumPrice: 100,
    testimonials: [
      {
        name: 'John Martinez',
        role: 'Owner, Mario\'s Trattoria',
        quote: 'Within days of using Ignitia AI, I discovered my afternoon service was losing money.',
        improvement: '+15% Profit Margin',
      },
    ],
  },
  ecommerce: {
    displayName: 'E-commerce',
    hero: 'Optimize Your Store with AI-Powered Analytics',
    subtitle: 'Discover revenue leaks, product opportunities, and customer insights.',
    kpis: [
      'Conversion Rate',
      'Average Order Value',
      'Cart Abandonment Rate',
      'Customer Lifetime Value',
      'Product Performance',
      'Traffic Source ROI',
    ],
    price: 50,
    premiumPrice: 100,
    testimonials: [
      {
        name: 'Sarah Chen',
        role: 'CEO, Fashion Boutique Co',
        quote: 'This report showed us exactly which products to push and which to discontinue.',
        improvement: '+32% Revenue',
      },
    ],
  },
  realestate: {
    displayName: 'Real Estate',
    hero: 'Benchmark Your Real Estate Business Against Market Standards',
    subtitle: 'Understand your sales pipeline, closing rates, and market positioning.',
    kpis: [
      'Average Deal Size',
      'Sales Cycle Length',
      'Closing Rate',
      'Lead Source Performance',
      'Market Share Analysis',
      'Commission Optimization',
    ],
    price: 100,
    premiumPrice: 250,
    testimonials: [
      {
        name: 'Michael Thompson',
        role: 'Principal, Twin City Realty',
        quote: 'The benchmarking analysis helped us improve our closing rate by 18%.',
        improvement: '+18% Closing Rate',
      },
    ],
  },
}

export default function IndustryLandingPage({ params }: IndustryPageProps) {
  const industry = params.industry.toLowerCase()
  const config = INDUSTRY_CONFIGS[industry]
  const [showForm, setShowForm] = useState(false)

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Industry Not Found</CardTitle>
            <CardDescription>
              The industry "{industry}" is not currently available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Ignitia AI
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {config.hero}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              {config.subtitle}
            </p>
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              Get Your Report Now • ${config.price}
            </Button>
            <p className="text-sm text-slate-400 mt-4">
              Takes 5 minutes. No credit card required for snapshot report.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-8 border border-blue-500/30">
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="text-6xl font-bold text-blue-400 mb-2">
                  ${config.price}
                </div>
                <p className="text-slate-300">Quick Snapshot Report</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-slate-700">
        <h2 className="text-3xl font-bold mb-12 text-center">
          What You'll Get In Your Report
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {config.kpis.map((kpi: string, i: number) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{kpi}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Detailed analysis with benchmarking
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-slate-700">
        <h2 className="text-3xl font-bold mb-12 text-center">
          See What Others Discovered
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {config.testimonials.map((testimonial: any, i: number) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {testimonial.improvement}
                  </div>
                  <p className="text-slate-300 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-slate-700 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-slate-300 mb-8">
          Your industry-specific KPI report is just a few clicks away.
        </p>
        <Button
          size="lg"
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
        >
          Generate Your Report Now
        </Button>
        <div className="mt-8 space-y-2 text-sm text-slate-400">
          <p>✓ Instant analysis of your website</p>
          <p>✓ Automated KPI calculations</p>
          <p>✓ PDF delivered to your inbox</p>
        </div>
      </section>

      {/* Report Generation Form Modal */}
      {showForm && (
        <ReportGenerationModal
          industry={industry}
          onClose={() => setShowForm(false)}
          basePrice={config.price}
          premiumPrice={config.premiumPrice}
        />
      )}
    </div>
  )
}

/**
 * Report Generation Modal Component
 */
function ReportGenerationModal({
  industry,
  onClose,
  basePrice,
  premiumPrice,
}: {
  industry: string
  onClose: () => void
  basePrice: number
  premiumPrice: number
}) {
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">
              {step === 'form' ? 'Your Report Details' : 'Checkout'}
            </CardTitle>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <ReportForm
              industry={industry}
              isPremium={isPremium}
              onPremiumToggle={setIsPremium}
              onSubmit={async (data) => {
                setLoading(true)
                try {
                  // Submit form and proceed to payment
                  const response = await fetch('/api/reports/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...data,
                      industry,
                      report_type: isPremium ? 'blueprint' : 'snapshot',
                      premium: isPremium,
                    }),
                  })

                  if (response.ok) {
                    setStep('payment')
                  }
                } finally {
                  setLoading(false)
                }
              }}
              loading={loading}
            />
          ) : (
            <PaymentForm
              amount={isPremium ? premiumPrice : basePrice}
              onClose={onClose}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Report Generation Form
 */
function ReportForm({
  industry,
  isPremium,
  onPremiumToggle,
  onSubmit,
  loading,
}: {
  industry: string
  isPremium: boolean
  onPremiumToggle: (value: boolean) => void
  onSubmit: (data: any) => Promise<void>
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) =>
            setFormData({ ...formData, company_name: e.target.value })
          }
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          placeholder="Your company name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          placeholder="https://yourcompany.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          placeholder="you@company.com"
          required
        />
      </div>

      <div className="border-t border-slate-700 pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => onPremiumToggle(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-white">
            Upgrade to Premium Report (+$50)
          </span>
        </label>
        {isPremium && (
          <p className="text-sm text-slate-400 mt-2">
            Includes deep analysis, competitor benchmarking, and growth roadmap
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  )
}

/**
 * Payment Form
 */
function PaymentForm({
  amount,
  onClose,
}: {
  amount: number
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-700 p-4 rounded">
        <div className="flex justify-between mb-2">
          <span className="text-slate-300">Total Amount:</span>
          <span className="text-white font-bold text-lg">${amount}</span>
        </div>
      </div>

      <Button
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Complete Payment with Stripe
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={onClose}
      >
        Cancel
      </Button>
    </div>
  )
}
