// ======================================================
// Seed workflow: Cálculo de métricas clave
// scripts/seed-workflow-metricas-clave.ts
// ======================================================
// Aggregates re_properties into per-zone metrics (median price,
// price/m², rental yield, inventory, days on market) and writes
// both the current state (re_neighborhoods) and a historical
// snapshot (re_neighborhood_snapshots) every run — that snapshot
// table IS the historical metrics feed the dashboards will read.
//
// Meant to run after ingestion (#1/#2) and normalization (#3) —
// manually in sequence for now, no cross-workflow chaining yet.
//
// Usage: npx tsx scripts/seed-workflow-metricas-clave.ts

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { WorkflowService } from "@/lib/services/WorkflowService";
import type { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";

const nodes: WorkflowNode[] = [
  { id: "trigger-manual-1", type: "trigger.manual", position: { x: 40, y: 160 }, data: { label: "Manual Trigger", config: {} } },
  {
    id: "compute-metrics-1",
    type: "data.computeNeighborhoodMetrics",
    position: { x: 380, y: 160 },
    data: { label: "Compute Neighborhood Metrics", config: { minListingsPerZone: "3" } },
  },
  {
    id: "notify-1",
    type: "communication.internalNotification",
    position: { x: 760, y: 160 },
    data: {
      label: "Internal Notification",
      config: {
        recipient: "",
        title: "Métricas de zona actualizadas",
        body: "Zonas procesadas: {{zonesProcessed}}",
      },
    },
  },
];

const edges: WorkflowEdge[] = [
  { id: "e-trigger-metrics", source: "trigger-manual-1", target: "compute-metrics-1" },
  { id: "e-metrics-notify", source: "compute-metrics-1", target: "notify-1" },
];

async function main() {
  const workflow = await WorkflowService.create({
    name: "Cálculo de métricas clave",
    description:
      "Agrega re_properties por zona en precio/m², rentabilidad estimada, inventario y tiempo en mercado — escribe re_neighborhoods (actual) y re_neighborhood_snapshots (historial) en cada corrida.",
  });

  await WorkflowService.save(workflow.id, { nodes, edges });

  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Open it at /admin/automation/${workflow.id}`);
  console.log("");
  console.log("Notes:");
  console.log("  - Run this AFTER #1/#2 (ingestion) and ideally #3 (geocoding) have populated re_properties");
  console.log("  - Rental yield will mostly be null at first: it needs listings tagged operation='sale' or 'rent' in the same zone, and none of the ingestion nodes populate that field yet — a follow-up on CasasWeb Search / MercadoLibre Search / Scrape Real Estate Listings' extraction schemas");
  console.log("  - minListingsPerZone=3 skips zones with too few listings to be a meaningful median — lower it if your data is still sparse, at the cost of noisier numbers");
  console.log("  - Once satisfied, connect this workflow in Property Intelligence's settings panel to run on the same cron as ingestion (or a later one, if you want it to trail behind)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
