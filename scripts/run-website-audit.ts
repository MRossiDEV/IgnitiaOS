// ======================================================
// Test script: run the Website Audit pipeline end-to-end
// scripts/run-website-audit.ts
// ======================================================
// Usage: npx tsx scripts/run-website-audit.ts
// Requires: npm install dotenv

import "dotenv/config"; // loads .env — use path override below if you use .env.local
// import { config } from "dotenv";
// config({ path: ".env.local" });

import { registerAgents } from "@/lib/ai/bootstrap";
import { AIMemory } from "@/lib/ai/core/memory";
import { PipelineRunner } from "@/lib/ai/core/pipelines";
import { websiteAuditPipeline } from "@/lib/ai/pipeline/website-audit";

async function main() {
  registerAgents();

  const reportId = `test-${Date.now()}`;
  const memory = AIMemory.create(reportId);

  // Swap in a real business + website to test against.
  memory.business.name = "Example Business";
  memory.business.website = "https://example.com";

  const runner = new PipelineRunner();
  await runner.execute(websiteAuditPipeline, memory, true);

  console.log(JSON.stringify(memory.metadata.report, null, 2));

  AIMemory.destroy(reportId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
