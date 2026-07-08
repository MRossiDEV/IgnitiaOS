'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const leadFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  company: z.string().min(2, { message: 'Company must be at least 2 characters' }),
  website: z.string().url({ message: 'Please enter a valid website URL' }),
  industry: z.string().min(1, { message: 'Please select an industry' }),
  primaryGoal: z.string().min(5, { message: 'Please describe your primary goal' }),
})

export type LeadFormData = z.infer<typeof leadFormSchema>

interface LeadFormProps {
  title: string
  subtitle: string
  source: 'audit' | 'optimization' | 'automation'
  onSuccess?: () => void
  isPaid?: boolean
}

export function LeadCaptureForm({ title, subtitle, source, onSuccess, isPaid }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      website: '',
      industry: '',
      primaryGoal: '',
    },
  })

  async function onSubmit(data: LeadFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create lead
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company,
          website: data.website,
          industry: data.industry,
          primaryGoal: data.primaryGoal,
          source,
          metadata: {
            formSubmissionTime: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          },
        }),
      })

      if (!leadResponse.ok) {
        throw new Error('Failed to create lead')
      }

      const lead = await leadResponse.json()

      // If paid offer, create payment session
      if (isPaid) {
        const paymentResponse = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            source,
            amount: 497, // SEO Audit price - can be made dynamic
          }),
        })

        if (!paymentResponse.ok) {
          throw new Error('Failed to create payment session')
        }

        const paymentSession = await paymentResponse.json()
        window.location.href = paymentSession.paymentUrl
        return
      }

      setSuccess(true)
      form.reset()
      onSuccess?.()

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Lead form error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto border-blue-200 bg-white shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold">✓ Great! We've received your information.</p>
            <p className="text-sm mt-1">We'll follow up with you within 24 hours.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@company.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website *</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://yourcompany.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SaaS, E-commerce, Agency" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's your main goal? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you want to achieve..."
                      className="min-h-24 resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isPaid ? (
                'Continue to Payment'
              ) : (
                'Submit'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center pt-4">
              We respect your privacy. Your information is secure and will never be shared.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
