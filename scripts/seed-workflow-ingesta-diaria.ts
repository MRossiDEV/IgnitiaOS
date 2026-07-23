// ======================================================
// Seed workflow: Ingesta diaria de portales inmobiliarios
// scripts/seed-workflow-ingesta-diaria.ts
// ======================================================
// Creates a starting-point workflow (CasasWeb + MercadoLibre +
// Gallito + InfoCasas -> Market Timeline) via WorkflowService,
// exactly as if built by hand on the canvas. Several config
// values are deliberately unverified placeholders (portal
// selectors, CasasWeb API path, ML category) — see the printed
// TODOs after it runs.
//
// Usage: npx tsx scripts/seed-workflow-ingesta-diaria.ts

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { WorkflowService } from "@/lib/services/WorkflowService";
import type { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";

const EXTRACTION_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    address: { type: "string" },
    price: { type: "number" },
    currency: { type: "string" },
    bedrooms: { type: "number" },
    bathrooms: { type: "number" },
    areaM2: { type: "number" },
    description: { type: "string" },
    agencyName: { type: "string" },
  },
  required: ["address"],
});

const nodes: WorkflowNode[] = [
  {
    id: "trigger-manual-1",
    type: "trigger.manual",
    position: { x: 40, y: 300 },
    data: { label: "Manual Trigger", config: {} },
  },
  {
    id: "casasweb-search-1",
    type: "data.casasWebSearch",
    position: { x: 400, y: 40 },
    data: {
      label: "CasasWeb Search",
      config: {
        baseUrl: "https://api.casasweb.com",
        path: "/v1/properties",
        queryParams: "{}",
        itemsPath: "",
        apiKey: "",
        maxResults: "100",
        delayMs: "500",
      },
    },
  },
  {
    id: "ingest-casasweb-1",
    type: "data.ingestListings",
    position: { x: 760, y: 40 },
    data: { label: "Market Timeline: Ingest Listings", config: { portal: "casasweb" } },
  },
  {
    id: "ml-search-1",
    type: "data.mercadoLibreSearch",
    position: { x: 400, y: 240 },
    data: {
      label: "MercadoLibre Search",
      config: {
        siteId: "MLU",
        query: "inmuebles",
        categoryId: "",
        priceMin: "",
        priceMax: "",
        extraFilters: "",
        accessToken: "",
        maxResults: "100",
        delayMs: "500",
      },
    },
  },
  {
    id: "ingest-ml-1",
    type: "data.ingestListings",
    position: { x: 760, y: 240 },
    data: { label: "Market Timeline: Ingest Listings", config: { portal: "mercadolibre" } },
  },
  {
    id: "scrape-gallito-1",
    type: "data.scrapeListings",
    position: { x: 400, y: 440 },
    data: {
      label: "Scrape Real Estate Listings",
      config: {
        portal: "gallito",
        searchUrlTemplate: "https://www.gallito.com.uy/inmuebles/?pagina={{page}}",
        maxPages: "3",
        listingLinkSelector: ".listing-card a, .aviso a, article a",
        baseUrl: "https://www.gallito.com.uy",
        maxListings: "50",
        delayMs: "800",
        extractionSchema: EXTRACTION_SCHEMA,
        model: "",
      },
    },
  },
  {
    id: "scrape-infocasas-1",
    type: "data.scrapeListings",
    position: { x: 400, y: 640 },
    data: {
      label: "Scrape Real Estate Listings",
      config: {
        portal: "infocasas",
        searchUrlTemplate: "http://infocasas.com.uy/venta?pagina={{page}}",
        maxPages: "3",
        listingLinkSelector: ".listing-card a, .property-item a, article a",
        baseUrl: "http://infocasas.com.uy",
        maxListings: "50",
        delayMs: "800",
        extractionSchema: EXTRACTION_SCHEMA,
        model: "",
      },
    },
  },
];

const edges: WorkflowEdge[] = [
  { id: "e-trigger-casasweb", source: "trigger-manual-1", target: "casasweb-search-1" },
  { id: "e-casasweb-ingest", source: "casasweb-search-1", target: "ingest-casasweb-1" },
  { id: "e-trigger-ml", source: "trigger-manual-1", target: "ml-search-1" },
  { id: "e-ml-ingest", source: "ml-search-1", target: "ingest-ml-1" },
  { id: "e-trigger-gallito", source: "trigger-manual-1", target: "scrape-gallito-1" },
  { id: "e-trigger-infocasas", source: "trigger-manual-1", target: "scrape-infocasas-1" },
];

async function main() {
  const workflow = await WorkflowService.create({
    name: "Ingesta diaria de portales inmobiliarios",
    description:
      "Escanea CasasWeb (API), MercadoLibre, Gallito e InfoCasas y normaliza/ingesta los listados en el Market Timeline (re_properties/re_property_snapshots).",
  });

  await WorkflowService.save(workflow.id, { nodes, edges });

  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Open it at /admin/automation/${workflow.id}`);
  console.log("");
  console.log("TODO before running for real:");
  console.log("  - CasasWeb Search: confirm `path`/`queryParams`/`itemsPath` against https://api.casasweb.com/openapi.json");
  console.log("  - MercadoLibre Search: replace the free-text `query` with the real Inmuebles categoryId for MLU (GET https://api.mercadolibre.com/sites/MLU/categories)");
  console.log("  - Gallito / InfoCasas: `listingLinkSelector` and the `?pagina=` param are unverified guesses — inspect the real page HTML and fix the selector + pagination param");
  console.log("  - Once satisfied, connect this workflow in Property Intelligence's settings panel so the daily cron picks it up");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
