// ======================================================
// Seed workflow: Actualización de fuentes oficiales periódicas
// scripts/seed-workflow-fuentes-oficiales.ts
// ======================================================
// INE + BCU + Intendencia de Montevideo (permisos) + Catastro (DNC
// padrones) -> Market Timeline (re_external_datasets), via
// WorkflowService, same as the portal-ingestion workflow.
//
// Every run appends a fresh, timestamped batch per source rather
// than diffing — "combinar con los datos históricos" is satisfied
// at the storage level (nothing gets overwritten, every run's
// captured_at is preserved), but there's no automatic
// change-detection/alerting yet. That needs a per-source natural
// key (INE by period, BCU by indicator+date, permisos by n° de
// trámite, padrones by padrón) which isn't worth hardcoding until
// the real file shapes are confirmed — see the TODOs below.
//
// Usage: npx tsx scripts/seed-workflow-fuentes-oficiales.ts

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { WorkflowService } from "@/lib/services/WorkflowService";
import type { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";

function downloadNode(id: string, x: number, y: number, url: string): WorkflowNode {
  return {
    id,
    type: "data.downloadDataset",
    position: { x, y },
    data: { label: "Download Dataset (CSV/ZIP)", config: { url, delimiter: "" } },
  };
}

function ingestNode(id: string, x: number, y: number, source: string): WorkflowNode {
  return {
    id,
    type: "data.ingestDataset",
    position: { x, y },
    data: { label: "Market Timeline: Ingest Dataset", config: { source } },
  };
}

const nodes: WorkflowNode[] = [
  { id: "trigger-manual-1", type: "trigger.manual", position: { x: 40, y: 340 }, data: { label: "Manual Trigger", config: {} } },

  downloadNode("dl-ine-1", 400, 40, "https://www.ine.gub.uy/tematica/iai-compraventa"),
  ingestNode("ingest-ine-1", 760, 40, "ine-iai-compraventa"),

  downloadNode("dl-bcu-1", 400, 220, "https://www.bcu.gub.uy/"),
  ingestNode("ingest-bcu-1", 760, 220, "bcu-indicadores"),

  downloadNode("dl-permisos-1", 400, 400, "https://datos-abiertos.montevideo.gub.uy/permisos_construccion.zip"),
  ingestNode("ingest-permisos-1", 760, 400, "intendencia-mvd-permisos"),

  downloadNode("dl-catastro-1", 400, 580, "https://catalogodatos.gub.uy/"),
  ingestNode("ingest-catastro-1", 760, 580, "catastro-dnc-padrones"),
];

const edges: WorkflowEdge[] = [
  { id: "e-trigger-ine", source: "trigger-manual-1", target: "dl-ine-1" },
  { id: "e-ine-ingest", source: "dl-ine-1", target: "ingest-ine-1" },

  { id: "e-trigger-bcu", source: "trigger-manual-1", target: "dl-bcu-1" },
  { id: "e-bcu-ingest", source: "dl-bcu-1", target: "ingest-bcu-1" },

  { id: "e-trigger-permisos", source: "trigger-manual-1", target: "dl-permisos-1" },
  { id: "e-permisos-ingest", source: "dl-permisos-1", target: "ingest-permisos-1" },

  { id: "e-trigger-catastro", source: "trigger-manual-1", target: "dl-catastro-1" },
  { id: "e-catastro-ingest", source: "dl-catastro-1", target: "ingest-catastro-1" },
];

async function main() {
  const workflow = await WorkflowService.create({
    name: "Actualización de fuentes oficiales periódicas",
    description:
      "Descarga mensualmente INE (IAI compraventa), BCU (indicadores), Intendencia de Montevideo (permisos de construcción) y Catastro (padrones DNC), e ingesta cada uno en el Market Timeline (re_external_datasets).",
  });

  await WorkflowService.save(workflow.id, { nodes, edges });

  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Open it at /admin/automation/${workflow.id}`);
  console.log("");
  console.log("TODO before running for real:");
  console.log("  - INE: https://www.ine.gub.uy/tematica/iai-compraventa is the landing page, not a direct file — find the real CSV/XLSX download link on that page and update the URL");
  console.log("  - BCU: https://www.bcu.gub.uy/ is the site root — BCU has no official API/clean CSV per the sourcing doc; find the specific report/CSV URL you actually want");
  console.log("  - Intendencia permisos: URL is real and direct (permisos_construccion.zip) — should work as-is");
  console.log("  - Catastro DNC padrones: the sourcing doc's URL was truncated (\"...\") — https://catalogodatos.gub.uy/ is just the catalog root; browse it and paste the real dataset zip/CSV URL");
  console.log("  - Reminder: Download Dataset only parses .csv files inside a zip — if Catastro's parcelario download turns out to be DXF/SHP (not CSV), this node won't parse it; that needs a separate geometry-parsing node (flagged as future work back in the GIS Fetch node)");
  console.log("  - Once satisfied, connect this workflow in Property Intelligence's settings panel so the monthly cron picks it up");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
