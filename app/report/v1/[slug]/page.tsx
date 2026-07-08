"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ReportPageProps } from "./lib/types";
import { useReport } from "./hooks/useReport";
import {
  HeroSection,
  ScoreGridSection,
  AuditSection,
  SeoSection,
  OpportunitiesSection,
  RoadmapSection,
  ImpactSection,
  CtaSection,
} from "./components";

export default function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = use(params);
  const { loading, report } = useReport(resolvedParams?.slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center text-white">
        <Loader2 className="animate-spin h-12 w-12 text-cyan-400" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center text-white">
        Report not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <HeroSection report={report} />
      <ScoreGridSection report={report} />
      <AuditSection report={report} />
      <SeoSection report={report} />
      <OpportunitiesSection report={report} />
      <RoadmapSection report={report} />
      <ImpactSection report={report} />
      <CtaSection />
    </main>
  );
}