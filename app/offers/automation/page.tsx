import { OfferLayout } from '@/components/offers/offer-layout'
import { LeadCaptureForm } from '@/components/offers/lead-capture-form'

const AUTOMATION_DATA = {
  title: 'Business Automation Program',
  subtitle: 'Systems & Workflows',
  heroDescription: 'Automate your customer journey, sales follow-ups, and repetitive tasks. Save time, increase consistency, and scale without hiring.',
  
  problemStatement: 'Your team is overwhelmed with manual tasks. Leads fall through the cracks, follow-ups are inconsistent, and your sales process doesn\'t scale. You\'re burning time on work that could be automated.',
  
  promise: 'We\'ll design and build custom automation workflows for your business. From lead qualification to customer onboarding, your business will run on autopilot.',
  
  forList: [
    'You have manual processes that drain time',
    'Leads often fall through the cracks',
    'You want to scale without hiring',
    'You need consistent customer experience',
    'You\'re ready to invest in systems',
  ],
  
  notForList: [
    'You have no digital products or services',
    'Your business is fully manual by design',
    'You need immediate results',
    'You don\'t have a CRM in place',
  ],

  deliverables: [
    'Process audit and workflow mapping',
    'Custom automation design for 5+ workflows',
    'Lead qualification automation',
    'Customer onboarding automation',
    'Follow-up sequence automation',
    'Reporting and analytics setup',
    'Zapier/Make.com integration setup',
    'Staff training and documentation',
  ],

  processSteps: [
    {
      step: 1,
      title: 'Process Discovery',
      description: 'We map out your current processes and identify automation opportunities.',
    },
    {
      step: 2,
      title: 'Workflow Design',
      description: 'We design custom workflows tailored to your business.',
    },
    {
      step: 3,
      title: 'Integration & Setup',
      description: 'We build and test all workflows in your existing tools.',
    },
    {
      step: 4,
      title: 'Training & Optimization',
      description: 'We train your team and continuously optimize performance.',
    },
  ],

  timeline: '2-3 weeks',
  pricingRange: '$1,500 - $4,000',

  faqs: [
    {
      question: 'What tools do you use for automation?',
      answer: 'We primarily use Zapier and Make.com for integrations. We also set up native automations in your CRM, email platform, and other tools.',
    },
    {
      question: 'Will this work with our current tools?',
      answer: 'Usually yes! We work with most popular tools like Salesforce, HubSpot, Pipedrive, Stripe, Google Sheets, and more.',
    },
    {
      question: 'What if something breaks?',
      answer: 'We provide 30 days of free support and debugging. After that, we offer ongoing support packages.',
    },
    {
      question: 'Can I modify workflows later?',
      answer: 'Absolutely. We\'ll document everything so your team can make changes, or we can help with modifications.',
    },
    {
      question: 'How much time will this save?',
      answer: 'Most clients save 10-30 hours per week. We\'ll analyze your processes and give you a specific estimate.',
    },
    {
      question: 'Do you offer ongoing support?',
      answer: 'Yes! We offer $200-500/month maintenance and optimization packages for clients who want ongoing help.',
    },
  ],
}

export default function AutomationOfferPage() {
  return (
    <OfferLayout
      title={AUTOMATION_DATA.title}
      subtitle={AUTOMATION_DATA.subtitle}
      heroDescription={AUTOMATION_DATA.heroDescription}
      problemStatement={AUTOMATION_DATA.problemStatement}
      promise={AUTOMATION_DATA.promise}
      forList={AUTOMATION_DATA.forList}
      notForList={AUTOMATION_DATA.notForList}
      deliverables={AUTOMATION_DATA.deliverables}
      processSteps={AUTOMATION_DATA.processSteps}
      timeline={AUTOMATION_DATA.timeline}
      pricingRange={AUTOMATION_DATA.pricingRange}
      faqs={AUTOMATION_DATA.faqs}
      ctaSection={
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-full max-w-xl">
            <LeadCaptureForm
              title="Schedule an Automation Review"
              subtitle="Let's see what we can automate for you"
              source="automation"
              isPaid={false}
            />
          </div>
        </div>
      }
    />
  )
}
