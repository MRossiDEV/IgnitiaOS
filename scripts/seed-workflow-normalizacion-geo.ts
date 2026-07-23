// ======================================================
// Seed workflow: Normalización y georreferenciación
// scripts/seed-workflow-normalizacion-geo.ts
// ======================================================
// Geocodes re_properties rows missing lat/lng (OSM Nominatim by
// default, free) and fills in neighborhood from the geocoder's
// own address breakdown when the property doesn't already have
// one. Padrón/socioeconomic-index tagging isn't included — that
// needs the Catastro dataset's real schema confirmed first (see
// the periodic official-sources workflow), not guessed at here.
// Meant to run after the ingestion workflows (#1/#2), manually in
// sequence for now — there's no cross-workflow chaining yet.
//
// Usage: npx tsx scripts/seed-workflow-normalizacion-geo.ts

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { WorkflowService } from "@/lib/services/WorkflowService";
import type { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";

const nodes: WorkflowNode[] = [
  { id: "trigger-manual-1", type: "trigger.manual", position: { x: 40, y: 160 }, data: { label: "Manual Trigger", config: {} } },
  {
    id: "geocode-1",
    type: "data.geocodeProperties",
    position: { x: 380, y: 160 },
    data: {
      label: "Geocode Properties",
      config: { provider: "osm", googleApiKey: "", limit: "50", delayMs: "1100" },
    },
  },
  {
    id: "notify-1",
    type: "communication.internalNotification",
    position: { x: 760, y: 160 },
    data: {
      label: "Internal Notification",
      config: {
        recipient: "",
        title: "Georreferenciación completada",
        body: "Escaneadas: {{scanned}} · Geocodificadas: {{geocoded}} · Fallidas: {{failed}} (proveedor: {{provider}})",
      },
    },
  },
];

const edges: WorkflowEdge[] = [
  { id: "e-trigger-geocode", source: "trigger-manual-1", target: "geocode-1" },
  { id: "e-geocode-notify", source: "geocode-1", target: "notify-1" },
];

async function main() {
  const workflow = await WorkflowService.create({
    name: "Normalización y georreferenciación",
    description:
      "Geocodifica direcciones de re_properties (OSM Nominatim por defecto, o Google) y completa el barrio desde el propio resultado del geocodificador cuando falta.",
  });

  await WorkflowService.save(workflow.id, { nodes, edges });

  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Open it at /admin/automation/${workflow.id}`);
  console.log("");
  console.log("Notes:");
  console.log("  - Run this AFTER workflows #1/#2 have ingested some listings, otherwise there's nothing to geocode yet");
  console.log("  - Default provider is OSM Nominatim (free, no key) — it's rate-limited to ~1 req/sec, which is why delayMs defaults to 1100");
  console.log("  - Switch provider to \"google\" and it'll use GOOGLE_PLACES_API_KEY automatically if that env var is a valid Geocoding-enabled key, or paste a dedicated key in googleApiKey");
  console.log("  - Padrón catastral / índice socioeconómico tagging is NOT included — needs the Catastro dataset's real column names confirmed first (workflow #2's TODOs)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
