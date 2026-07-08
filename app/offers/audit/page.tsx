import { OfferLayout } from '@/components/offers/offer-layout'
import { LeadCaptureForm } from '@/components/offers/lead-capture-form'

const SEO_AUDIT_DATA = {
  title: 'SEO Audit',
  subtitle: 'Professional SEO Analysis',
  heroDescription: 'Get a comprehensive audit of your website\'s SEO performance. Understand your biggest opportunities, competitive gaps, and a clear roadmap to dominate search results.',
  
  problemStatement: 'You\'re losing potential customers on Google. Your website ranks poorly, your competitors dominate the search results, and you don\'t know why. Without a clear SEO strategy, you\'re leaving money on the table every single day.',
  
  promise: 'We\'ll uncover exactly what\'s holding back your search visibility. You\'ll get a detailed, actionable roadmap to fix your SEO and start ranking for the keywords that drive real revenue.',
  
  forList: [
    'Your website gets minimal organic traffic',
    'You want to understand your SEO gaps',
    'You\'re ready to invest in SEO improvements',
    'You want a clear, data-driven strategy',
    'You need competitive insights',
  ],
  
  notForList: [
    'You already rank #1 for all keywords',
    'You\'re not interested in organic growth',
    'You don\'t have a website yet',
    'You\'re looking for quick shortcuts',
  ],

  deliverables: [
    'Full website SEO audit (technical, on-page, off-page)',
    'Competitive analysis (top 5 competitors)',
    'Keyword gap analysis',
    'Content performance assessment',
    'Backlink profile analysis',
    'Technical SEO audit report',
    'Priority-ranked action plan',
    '30-day implementation guide',
  ],

  processSteps: [
    {
      step: 1,
      title: 'Initial Consultation',
      description: 'We understand your business, goals, and current SEO situation.',
    },
    {
      step: 2,
      title: 'In-Depth Analysis',
      description: 'We audit your website, analyze competitors, and identify opportunities.',
    },
    {
      step: 3,
      title: 'Report Generation',
      description: 'We create a comprehensive, easy-to-understand audit report.',
    },
    {
      step: 4,
      title: 'Strategy Call',
      description: 'We walk you through findings and answer all your questions.',
    },
  ],

  timeline: '5-7 business days',
  pricingRange: '$497 - $997',

  faqs: [
    {
      question: 'What\'s included in the SEO audit?',
      answer: 'The audit covers technical SEO (site speed, mobile, indexing), on-page optimization (keywords, content, meta tags), off-page factors (backlinks, authority), and a competitive analysis against your top 5 competitors.',
    },
    {
      question: 'How long does the audit take?',
      answer: 'Usually 5-7 business days from start to finish. We deliver a detailed report and schedule a strategy call to review findings.',
    },
    {
      question: 'Can you guarantee rankings?',
      answer: 'No. SEO takes time and depends on many factors. However, our audit identifies the exact actions that will improve your rankings, and we provide implementation guidance.',
    },
    {
      question: 'What if I don\'t like the results?',
      answer: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with the audit quality, we\'ll refund your investment.',
    },
    {
      question: 'Do you offer implementation services?',
      answer: 'Yes! After the audit, many clients hire us to implement the recommendations. We offer fixed-price implementation packages.',
    },
    {
      question: 'What\'s the next step after the audit?',
      answer: 'Many clients choose our SEO Optimization package to implement the recommendations. Others manage it themselves using our implementation guide.',
    },
  ],
}

export default function SeoAuditPage() {
  return (
    <OfferLayout
      title={SEO_AUDIT_DATA.title}
      subtitle={SEO_AUDIT_DATA.subtitle}
      heroDescription={SEO_AUDIT_DATA.heroDescription}
      problemStatement={SEO_AUDIT_DATA.problemStatement}
      promise={SEO_AUDIT_DATA.promise}
      forList={SEO_AUDIT_DATA.forList}
      notForList={SEO_AUDIT_DATA.notForList}
      deliverables={SEO_AUDIT_DATA.deliverables}
      processSteps={SEO_AUDIT_DATA.processSteps}
      timeline={SEO_AUDIT_DATA.timeline}
      pricingRange={SEO_AUDIT_DATA.pricingRange}
      faqs={SEO_AUDIT_DATA.faqs}
      ctaSection={
        <div className="flex flex-col items-center justify-center gap-6">
          <LeadCaptureForm
            title="Get Your SEO Audit"
            subtitle="Fill out the form below to get started"
            source="audit"
            isPaid={true}
          />
        </div>
      }
    />
  )
}
