import Hero from "./Hero";
import Opportunity from "./Opportunity";
import EarningsCalculator from "./EarningsCalculator";
import ServicesGrid from "./ServicesGrid";
import HowItWorks from "./HowItWorks";
import PartnerLevels from "./PartnerLevels";
import ComparisonTable from "./ComparisonTable";
import FAQ from "./FAQ";
import CTA from "./CTA";


export default function AffiliatePage() {
  return (
    <main className="bg-black text-white">

      <Hero />

      <Opportunity />

      <EarningsCalculator />

      <ServicesGrid />

      <HowItWorks />

      <PartnerLevels />

      <ComparisonTable />

      <FAQ />

      <CTA />

    </main>
  );
}