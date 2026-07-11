"use client";

import { useReportWizard } from "../store";

import ProgressBar from "./ProgressBar";

import Step1Welcome from "./Step1Welcome";
import Step2BusinessType from "./Step2BusinessType";
import Step3Website from "./Step3Website";
import Step4BusinessInfo from "./Step4BusinessInfo";
import Step5Goals from "./Step5Goals";
import Step6Industry from "./Step6Industry";
import Step7Challenges from "./Step7Challenges";
import Step8MarketingChannels from "./Step8MarketingChannels";
import Step9Competitor from "./Step9Competitor";
import Step10Loading from "./Step10Loading";
import Step11Teaser from "./Step11Teaser";
import Step12Contact from "./Step12Contact";


export default function Wizard() {
  const { step } = useReportWizard();

  const TOTAL_STEPS = 12;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#05070B]">

      {step > 0 && (
        <ProgressBar
          current={step}
          total={TOTAL_STEPS}
        />
      )}

    {step === 0 && <Step1Welcome />}
    {step === 1 && <Step2BusinessType />}          
    {step === 2 && <Step3Website />}
    {step === 3 && <Step4BusinessInfo />}
    {step === 4 && <Step5Goals />}
    {step === 5 && <Step6Industry />}
    {step === 6 && <Step7Challenges />}
    {step === 7 && <Step8MarketingChannels />}
    {step === 8 && <Step9Competitor />}
    {step === 9 && <Step10Loading />}
    {step === 10 && <Step11Teaser />}
    {step === 11 && <Step12Contact />}

    </div>
  );
}