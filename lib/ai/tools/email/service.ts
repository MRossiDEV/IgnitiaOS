/**
 * Email Delivery & Lead Nurturing Service
 * 
 * Handles:
 * - Report delivery emails
 * - Upsell opportunity emails
 * - Automated lead nurturing sequences
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailContext {
  to: string
  subject: string
  template: string
  variables: Record<string, any>
}

/**
 * Send Report Delivery Email
 */
export async function sendReportDeliveryEmail(reportId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get report details
    const { data: report } = await supabase
      .from('reports')
      .select(`
        *,
        user_profiles(email, full_name)
      `)
      .eq('id', reportId)
      .single()

    if (!report || !report.user_profiles) {
      throw new Error('Report not found')
    }

    const { email, full_name } = report.user_profiles

    // Build email
    const emailContent = `
    <h1>Your ${report.industry.toUpperCase()} KPI Report is Ready! 🎉</h1>
    
    <p>Hi ${full_name},</p>
    
    <p>Your automated KPI analysis for <strong>${report.business_name}</strong> has been completed.</p>
    
    <h2>Your Key Metrics:</h2>
    <ul>
    ${Object.entries(report.kpi_data || {})
      .slice(0, 5)
      .map(([key, value]) => `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`)
      .join('')}
    </ul>
    
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports/${reportId}" style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">View Full Report</a></p>
    
    <hr />
    
    <h2>Ready to Unlock More Insights? 📊</h2>
    <p>Our Premium Analysis includes:</p>
    <ul>
      <li>Deep-dive benchmarking against industry leaders</li>
      <li>Personalized growth roadmap</li>
      <li>Implementation timeline and quick wins</li>
    </ul>
    
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/upsell?report=${reportId}" style="background-color: #16a34a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Upgrade to Premium ($500)</a></p>
    
    <hr />
    
    <p>
      Best regards,<br/>
      <strong>Ignitia AI Team</strong>
    </p>
    `

    // Send via Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'reports@ignitia.ai',
      to: email,
      subject: `Your ${report.industry} KPI Report is Ready`,
      html: emailContent,
    })

    // Log email sent
    await supabase
      .from('upsell_opportunities')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('report_id', reportId)

    return { success: true, email }
  } catch (error) {
    console.error('Error sending report delivery email:', error)
    throw error
  }
}

/**
 * Send Upsell Email
 */
export async function sendUpsellEmail(upsellId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get upsell opportunity
    const { data: upsell } = await supabase
      .from('upsell_opportunities')
      .select(`
        *,
        reports(business_name, kpi_data),
        auth.users(email)
      `)
      .eq('id', upsellId)
      .single()

    if (!upsell) {
      throw new Error('Upsell opportunity not found')
    }

    const { service_type, service_description, upsell_price } = upsell
    const userEmail = upsell.auth?.users?.email

    if (!userEmail) {
      throw new Error('User email not found')
    }

    // Determine service details
    const serviceDetails: Record<string, any> = {
      premium_analysis: {
        title: 'Premium Deep Dive Analysis',
        description:
          'Get detailed benchmarking, competitor analysis, and a personalized growth roadmap.',
        features: [
          'Benchmarking against top 25% of industry businesses',
          'Competitive analysis and market positioning',
          'Detailed growth roadmap with 90-day plan',
          'Implementation support and guidance',
        ],
      },
      consulting: {
        title: 'Expert Consulting',
        description:
          'Work directly with our KPI optimization experts to implement your growth strategy.',
        features: [
          '1-on-1 consulting session with specialist',
          'Custom implementation roadmap',
          '30 days of follow-up support',
          'Performance tracking and optimization',
        ],
      },
      managed_automation: {
        title: 'Managed Automation',
        description:
          'Let us handle your ongoing KPI reporting and optimization on a monthly basis.',
        features: [
          'Monthly automated KPI reports',
          'Trend analysis and alerts',
          'Performance optimization recommendations',
          'Dedicated account manager',
        ],
      },
    }

    const details = serviceDetails[service_type] || {}

    const emailContent = `
    <h1>${details.title}</h1>
    
    <p>Hi there,</p>
    
    <p>${details.description}</p>
    
    <h2>What's Included:</h2>
    <ul>
    ${details.features.map((feature: string) => `<li>✓ ${feature}</li>`).join('')}
    </ul>
    
    <h2>Investment</h2>
    <p style="font-size: 24px; font-weight: bold; color: #2563eb;">$${upsell_price}</p>
    <p style="color: #666;">One-time investment to accelerate your growth</p>
    
    <p style="margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout?upsell=${upsellId}" style="background-color: #2563eb; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold;">Get Started Now</a>
    </p>
    
    <hr style="margin: 40px 0;" />
    
    <p style="color: #666; font-size: 12px;">
      This is a limited-time offer. After your free report analysis, we're offering our premium services to help you implement the recommendations.
    </p>
    `

    // Send via Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'reports@ignitia.ai',
      to: userEmail,
      subject: `${details.title} - Exclusive Offer for You`,
      html: emailContent,
    })

    // Update tracking
    await supabase
      .from('upsell_opportunities')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', upsellId)

    return { success: true, email: userEmail }
  } catch (error) {
    console.error('Error sending upsell email:', error)
    throw error
  }
}

/**
 * Send Lead Nurture Email
 */
export async function sendLeadNurtureEmail(sequenceId: string, stepNumber: number) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get sequence
    const { data: sequence } = await supabase
      .from('lead_nurture_sequences')
      .select(`
        *,
        leads(email, company_name)
      `)
      .eq('id', sequenceId)
      .single()

    if (!sequence || !sequence.leads) {
      throw new Error('Sequence not found')
    }

    const { email, company_name } = sequence.leads

    // Define nurture sequences
    const nurtureCopies: Record<string, Record<number, any>> = {
      post_report: {
        1: {
          subject: 'Your Next Step: Implementing Your KPI Insights',
          content: `
            <p>Hi ${company_name},</p>
            <p>Now that you have your KPI report, the next step is implementation.</p>
            <p>Many of our clients report 15-30% improvements within 60 days of acting on these insights.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/consulting">Talk to a consultant</a></p>
          `,
        },
        2: {
          subject: 'See How Others Improved 24% in 90 Days',
          content: `
            <p>Hi ${company_name},</p>
            <p>One of our clients in your industry made strategic changes based on their KPI analysis.</p>
            <p>They improved revenue by 24% in just 3 months.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/case-study">Read their story</a></p>
          `,
        },
        3: {
          subject: 'Final Offer: Monthly KPI Monitoring',
          content: `
            <p>Hi ${company_name},</p>
            <p>Last email: Our most popular service is monthly KPI monitoring and optimization.</p>
            <p>Stay ahead with automated reports and proactive recommendations.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing">Learn more</a></p>
          `,
        },
      },
    }

    const copies = nurtureCopies[sequence.sequence_type] || {}
    const copy = copies[stepNumber] || { subject: 'Update', content: 'Content' }

    // Send via Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'reports@ignitia.ai',
      to: email,
      subject: copy.subject,
      html: copy.content,
    })

    // Update sequence
    await supabase
      .from('lead_nurture_sequences')
      .update({
        emails_sent: sequence.emails_sent + 1,
        current_step: stepNumber,
        last_email_sent_at: new Date().toISOString(),
        next_email_scheduled_at:
          stepNumber < 3
            ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            : null,
      })
      .eq('id', sequenceId)

    return { success: true, email }
  } catch (error) {
    console.error('Error sending nurture email:', error)
    throw error
  }
}

/**
 * Schedule automated emails
 * This should be called by a background job scheduler
 */
export async function scheduleAutomatedEmails() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find emails to send
    const { data: sequences } = await supabase
      .from('lead_nurture_sequences')
      .select('*')
      .eq('status', 'active')
      .lt(
        'next_email_scheduled_at',
        new Date().toISOString()
      )

    if (sequences) {
      for (const sequence of sequences) {
        await sendLeadNurtureEmail(sequence.id, sequence.current_step + 1)
      }
    }

    return { processed: sequences?.length || 0 }
  } catch (error) {
    console.error('Error scheduling automated emails:', error)
    throw error
  }
}

// NOTE: Legacy nodemailer-based helpers (sendLeadConfirmationEmail,
// sendOrderConfirmationEmail, sendInternalLeadNotification) were removed from
// here because the fragment was corrupted and unused. Use `sendEmail` from
// ./sendEmail together with the SMTP transport in ./smtp for those flows.
// See PHASE 7 in ROADMAP.md.
