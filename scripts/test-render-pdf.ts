// ======================================================
// Test: render a real PDF from fabricated report data
// Usage: npx tsx scripts/test-render-pdf.ts
// ======================================================
// Writes test-output.pdf to the project root — open it and
// check for overlapping text, bad wraps, or cut-off content
// before trusting this in production. (I wrote this code
// carefully against @react-pdf/renderer's API, but couldn't
// execute it myself in the sandbox I built it in — no network
// access there for npm. This is that missing verification step.)

import * as fs from "fs";
import { generateReportPdf } from "@/lib/pdf/generateReportPdf";
import { AssembledReport } from "@/lib/ai/report-builder";
import { ReportMemory } from "@/lib/ai/core/types";

const report: AssembledReport = {
  reportId: "test-123",
  business: {} as any,
  overallScore: 68,
  generatedAt: new Date().toISOString(),
  sections: [
    {
      key: "seo",
      label: "SEO",
      score: 45,
      summary:
        "Your site is technically sound, but you're invisible for the terms your best customers actually search. Closing this gap turns search into a steady, compounding source of qualified traffic.",
      strengths: ["Strong site speed"],
      weaknesses: ["No structured data"],
      opportunities: ["Add schema markup"],
      quickWins: [
        "Missing meta descriptions on key pages",
        "No structured data for rich results",
        "Strong site speed to build on",
      ],
      findings: [],
    },
    {
      key: "conversion",
      label: "Conversion",
      score: 52,
      summary:
        "Visitors arrive interested but hit friction before they convert. Small, targeted changes here pay back fastest.",
      strengths: [],
      weaknesses: [],
      opportunities: [],
      quickWins: [
        "Primary CTA is below the fold",
        "No social proof near decision points",
        "Checkout flow has one unnecessary step",
      ],
      findings: [],
    },
    {
      key: "branding",
      label: "Branding",
      score: 82,
      summary:
        "Branding scores well, but the copy around it doesn't carry the same confidence.",
      strengths: ["Strong visual identity to lean on"],
      weaknesses: [],
      opportunities: [],
      quickWins: [
        "Homepage headline states features, not outcomes",
        "Tone shifts noticeably between pages",
        "Strong visual identity to lean on",
      ],
      findings: [],
    },
    {
      key: "ux",
      label: "User Experience",
      score: 71,
      summary:
        "The proof points that would reassure a hesitant buyer exist, they're just not placed where decisions actually happen.",
      strengths: [],
      weaknesses: [],
      opportunities: [],
      quickWins: [
        "Testimonials live on a page few visitors reach",
        "No trust badges near the primary form",
        "Clear, accessible privacy policy already in place",
      ],
      findings: [],
    },
    {
      key: "copywriting",
      label: "Copywriting",
      score: 58,
      summary: "The messaging is functional but doesn't lead with outcomes.",
      strengths: [],
      weaknesses: [],
      opportunities: [],
      quickWins: ["Tighten the homepage headline"],
      findings: [],
    },
    {
      key: "trust",
      label: "Trust",
      score: 64,
      summary: "Trust signals exist but aren't placed where they'd help most.",
      strengths: [],
      weaknesses: [],
      opportunities: [],
      quickWins: ["Add trust badges near forms"],
      findings: [],
    },
  ],
};

const business: ReportMemory["business"] = {
  name: "Acme Digital",
  website: "acme.example.com",
  industry: "Technology",
  businessType: "",
  city: "Austin",
  country: "USA",
  goal: "",
  challenge: "",
};

generateReportPdf(report, business).then((buffer) => {
  fs.writeFileSync("test-output.pdf", buffer);
  console.log("PDF written:", buffer.length, "bytes -> test-output.pdf");
});
