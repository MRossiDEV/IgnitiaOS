'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Check } from 'lucide-react'

interface OfferLayoutProps {
  title: string
  subtitle: string
  heroDescription: string
  problemStatement: string
  promise: string
  deliverables: string[]
  processSteps: { step: number; title: string; description: string }[]
  timeline: string
  pricingRange: string
  faqs: { question: string; answer: string }[]
  ctaSection: ReactNode
  notForList?: string[]
  forList?: string[]
}

export function OfferLayout({
  title,
  subtitle,
  heroDescription,
  problemStatement,
  promise,
  deliverables,
  processSteps,
  timeline,
  pricingRange,
  faqs,
  ctaSection,
  notForList,
  forList,
}: OfferLayoutProps) {
  return (
    <div className="w-full overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-24 border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600 underline">Home</a>
              {' / '}
              <span className="text-gray-900 font-medium">{title}</span>
            </div>

            {/* Hero Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-blue-600 font-semibold text-lg">{subtitle}</p>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {title}
                </h1>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                {heroDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROBLEM + PROMISE ================= */}
      <section className="py-20 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">The Problem</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {problemStatement}
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Our Promise</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {promise}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO THIS IS FOR ================= */}
      {(forList || notForList) && (
        <section className="py-20 bg-gray-50 border-b">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Is This Right For You?</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {forList && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-green-600">This IS for you if:</h3>
                  <ul className="space-y-3">
                    {forList.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notForList && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-red-600">This is NOT for you if:</h3>
                  <ul className="space-y-3">
                    {notForList.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <div className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">×</div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= DELIVERABLES ================= */}
      <section className="py-20 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">What You'll Get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {deliverables.map((deliverable, idx) => (
              <Card key={idx} className="border-blue-100 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{deliverable}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROCESS & TIMELINE ================= */}
      <section className="py-20 bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="space-y-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  {idx < processSteps.length - 1 && (
                    <div className="w-1 h-12 bg-blue-200 mt-2 mb-2"></div>
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-2">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-900 font-semibold">Total Timeline: <span className="text-blue-600">{timeline}</span></p>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="py-20 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Investment</h2>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Pricing Range</p>
            <p className="text-4xl font-bold text-gray-900">{pricingRange}</p>
            <p className="text-gray-600 mt-4">Exact pricing depends on your specific needs and complexity</p>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20 bg-blue-50 border-b">
        <div className="max-w-4xl mx-auto px-6">
          {ctaSection}
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-20 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= FOOTER CTA ================= */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Let's unlock your growth potential</p>
          {ctaSection}
        </div>
      </section>
    </div>
  )
}
