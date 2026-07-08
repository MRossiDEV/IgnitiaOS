import { OfferLayout } from '@/components/offers/offer-layout'
import { LeadCaptureForm } from '@/components/offers/lead-capture-form'

const OPTIMIZATION_DATA = {
  title: 'SEO Optimization Program',
  subtitle: 'Implementation & Results',
  heroDescription: 'Ready to take action? We\'ll implement everything from your audit and drive measurable results. From keyword optimization to technical fixes, we handle it all.',
  
  problemStatement: 'You have the audit report and know what needs to be done. But implementing SEO changes is complex, time-consuming, and requires ongoing optimization. You need someone to actually make it happen.',
  
  promise: 'We\'ll implement your entire SEO strategy, monitor performance daily, and continuously optimize for better rankings and traffic. You get the results without the headaches.',
  
  forList: [
    'You completed an SEO audit',
    'You want hands-on implementation',
    'You need ongoing optimization',
    'You want to focus on your core business',
    'You\'re ready to invest in results',
  ],
  
  notForList: [
    'You want quick SEO fixes',
    'You prefer doing it yourself',
    'You have a tight budget',
    'You need results in 30 days',
  ],

  deliverables: [
    'Complete SEO strategy implementation',
    'On-page content optimization (50+ pages)',
    'Technical SEO fixes and improvements',
    'Internal linking structure optimization',
    'Monthly performance reports',
    'Quarterly strategy adjustments',
    'Daily monitoring and alerts',
    '3-month optimization roadmap',
  ],

  processSteps: [
    {
      step: 1,
      title: 'Kickoff & Planning',
      description: 'We align on priorities, timeline, and success metrics.',
    },
    {
      step: 2,
      title: 'Technical Implementation',
      description: 'We handle all technical SEO fixes and optimizations.',
    },
    {
      step: 3,
      title: 'Content Optimization',
      description: 'We optimize your top pages for target keywords.',
    },
    {
      step: 4,
      title: 'Monitoring & Iteration',
      description: 'We track results and continuously improve performance.',
    },
  ],

  timeline: '3 months minimum',
  pricingRange: '$2,500 - $7,500/month',

  faqs: [
    {
      question: 'Do I need an audit first?',
      answer: 'Not necessarily, but we recommend it. If you don\'t have one, we can run a quick analysis as part of our kickoff.',
    },
    {
      question: 'How long before we see results?',
      answer: 'Most clients see improved rankings in 30-60 days. Significant traffic increases typically appear within 3-6 months.',
    },
    {
      question: 'What if my content is poor?',
      answer: 'We\'ll help rewrite and optimize your content. We can either do it or guide your team through the process.',
    },
    {
      question: 'Can you do this if I use a website builder?',
      answer: 'Yes, though some platforms limit technical SEO. We\'ll work within your platform\'s constraints.',
    },
    {
      question: 'What\'s the minimum commitment?',
      answer: 'We require a 3-month minimum commitment to properly implement and measure results.',
    },
    {
      question: 'What happens when we cancel?',
      answer: 'We\'ll provide a comprehensive handoff guide. All work is yours to keep.',
    },
  ],
}

export default function OptimizationOfferPage() {
  return (
    <OfferLayout
      title={OPTIMIZATION_DATA.title}
      subtitle={OPTIMIZATION_DATA.subtitle}
      heroDescription={OPTIMIZATION_DATA.heroDescription}
      problemStatement={OPTIMIZATION_DATA.problemStatement}
      promise={OPTIMIZATION_DATA.promise}
      forList={OPTIMIZATION_DATA.forList}
      notForList={OPTIMIZATION_DATA.notForList}
      deliverables={OPTIMIZATION_DATA.deliverables}
      processSteps={OPTIMIZATION_DATA.processSteps}
      timeline={OPTIMIZATION_DATA.timeline}
      pricingRange={OPTIMIZATION_DATA.pricingRange}
      faqs={OPTIMIZATION_DATA.faqs}
      ctaSection={
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-full max-w-xl">
            <LeadCaptureForm
              title="Schedule a Strategy Call"
              subtitle="Let's discuss your specific needs"
              source="optimization"
              isPaid={false}
            />
          </div>
        </div>
      }
    />
  )
}
