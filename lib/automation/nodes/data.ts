// ======================================================
// Data Nodes
// lib/automation/nodes/data.ts
// ======================================================
// Set Variable / Transform / Merge / Template all operate on
// the node's `input` object directly — there's no separate
// global-variables store in this executor, so "setting a
// variable" means merging a field onto the data flowing forward.

import * as cheerio from "cheerio";
import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { getPath } from "../pathCompare";
import { supabaseAdmin } from "@/lib/supabase/server";
import { aiProvider } from "@/lib/ai/provider";
import { estimateCost } from "@/lib/ai/core/tokenTracker";
import { MODEL_OPTIONS } from "./aiUsage";
import { ingestListings } from "@/lib/market-timeline/ingest";
import { ScrapedListing } from "@/lib/market-timeline/diff";

export const dataNodes: Record<string, NodeTypeDefinition> = {
  "data.setVariable": {
    type: "data.setVariable",
    category: "data",
    label: "Set Variable",
    description:
      "Adds/overwrites a field on the data flowing through the workflow. Outputs everything from its input, plus your key set to the resolved value. Reference it downstream with {{yourKey}}.",
    configFields: [
      { key: "key", label: "Key", type: "text" },
      { key: "value", label: "Value", type: "text", placeholder: "{{field}} supported" },
    ],
    async execute(input, config) {
      if (!config.key) throw new Error("Set Variable: key is required.");
      return { output: { ...input, [config.key]: resolveTemplate(config.value ?? "", input) } };
    },
  },

  "data.transform": {
    type: "data.transform",
    category: "data",
    label: "Transform Data",
    description:
      "Reshapes the input into a new object using a {outputKey: \"dot.path\"} mapping. Outputs exactly the keys your mapping defines — reference each with {{outputKey}} downstream (e.g. {{fullName}} for the example mapping above).",
    configFields: [
      {
        key: "mapping",
        label: "Mapping (JSON)",
        type: "textarea",
        placeholder: '{"fullName":"name","emailAddress":"email"}',
      },
    ],
    async execute(input, config) {
      if (!config.mapping) throw new Error("Transform Data: a mapping is required.");
      let mapping: Record<string, string>;
      try {
        mapping = JSON.parse(config.mapping);
      } catch {
        throw new Error("Transform Data: mapping is not valid JSON.");
      }

      const output: Record<string, any> = {};
      for (const [outputKey, path] of Object.entries(mapping)) {
        output[outputKey] = getPath(input, path);
      }
      return { output };
    },
  },

  "data.merge": {
    type: "data.merge",
    category: "data",
    label: "Merge Data",
    description:
      "Flattens the {sourceNodeId: output} shape produced when a node has multiple incoming edges into a single object. Use this whenever a node needs fields from two different branches — connect both branches here first, then reference each branch's fields downstream by name, e.g. {{summary}} and {{email}}.",
    configFields: [],
    async execute(input) {
      const isKeyedBySource =
        input && typeof input === "object" && !Array.isArray(input) &&
        Object.values(input).every((v) => v && typeof v === "object");

      if (!isKeyedBySource) return { output: input };
      return { output: Object.assign({}, ...Object.values(input)) };
    },
  },

  "data.template": {
    type: "data.template",
    category: "data",
    label: "Template",
    description:
      "Renders {{field}} placeholders against the upstream output. Outputs { text: string } — reference the rendered text downstream with {{text}}, e.g. as an Email node's Body.",
    configFields: [
      { key: "template", label: "Template", type: "textarea", placeholder: "Hello {{name}}, your report for {{website}} is ready." },
    ],
    async execute(input, config) {
      return { output: { text: resolveTemplate(config.template ?? "", input) } };
    },
  },

  "data.search": {
    type: "data.search",
    category: "data",
    label: "Search",
    description:
      "Unified search across data sources. Only 'Leads' is wired to a real source today. Outputs { results: [...] } (an array of matching rows). Reference {{results}} downstream, or feed it into a Loop node to process each match.",
    configFields: [
      {
        key: "source",
        label: "Source",
        type: "select",
        options: [
          { value: "leads", label: "Leads" },
          { value: "vectorDb", label: "Vector DB (stub)" },
          { value: "documents", label: "Documents (stub)" },
        ],
      },
      { key: "field", label: "Field to search (leads only)", type: "text", placeholder: "name" },
      { key: "query", label: "Query", type: "text", placeholder: "{{field}} supported" },
      { key: "limit", label: "Limit", type: "number" },
    ],
    async execute(input, config) {
      const query = resolveTemplate(config.query ?? "", input);

      if (config.source !== "leads") {
        return {
          output: { results: [], _stub: true, _stubNote: `Search source "${config.source}" is not wired up yet.` },
        };
      }

      const field = config.field || "name";
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .ilike(field, `%${query}%`)
        .limit(config.limit ?? 10);

      if (error) throw new Error(`Search: ${error.message}`);
      return { output: { results: data ?? [] } };
    },
  },

  "data.scrapeListings": {
    type: "data.scrapeListings",
    category: "data",
    label: "Scrape Real Estate Listings",
    description:
      "Scrapes ANY listings portal you configure here — no hardcoded site or URL. Paginates your search-results URL, follows each listing's link, and extracts fields with Claude using your own JSON schema, then ingests the results into the Market Timeline (re_properties/re_property_snapshots — only genuinely new/changed listings get a new snapshot). Runs requests sequentially with a delay between them to be a reasonable citizen of the target site — review its ToS/robots.txt before scheduling this for real. Outputs { portal, pagesScraped, listingsFound, listingsNew, listingsChanged, _usage }.",
    configFields: [
      { key: "portal", label: "Portal name (for storage)", type: "text", placeholder: "casasweb" },
      {
        key: "searchUrlTemplate",
        label: "Search results URL ({{page}} = page number)",
        type: "text",
        placeholder: "https://example.com/search?page={{page}}",
      },
      { key: "maxPages", label: "Max pages to scan", type: "number" },
      {
        key: "listingLinkSelector",
        label: "CSS selector for each listing's link (on the search page)",
        type: "text",
        placeholder: ".listing-card a",
      },
      { key: "baseUrl", label: "Base URL (to resolve relative links, optional)", type: "text" },
      { key: "maxListings", label: "Max listings to process per run", type: "number" },
      { key: "delayMs", label: "Delay between requests (ms)", type: "number" },
      {
        key: "extractionSchema",
        label: "Field extraction JSON schema (sent to Claude per listing page)",
        type: "textarea",
        placeholder:
          '{"type":"object","properties":{"address":{"type":"string"},"price":{"type":"number"},"bedrooms":{"type":"number"},"bathrooms":{"type":"number"},"areaM2":{"type":"number"},"description":{"type":"string"},"agencyName":{"type":"string"}},"required":["address"]}',
      },
      {
        key: "model",
        label: "Model",
        type: "select",
        options: [{ value: "", label: "Default (Claude Sonnet 5)" }, ...MODEL_OPTIONS],
      },
    ],
    async execute(input, config) {
      const started = Date.now();
      const portal = config.portal || "unknown-portal";
      if (!config.searchUrlTemplate) throw new Error("Scrape Real Estate Listings: a search results URL is required.");
      if (!config.listingLinkSelector) {
        throw new Error("Scrape Real Estate Listings: a listing link CSS selector is required.");
      }
      if (!config.extractionSchema) {
        throw new Error("Scrape Real Estate Listings: a field extraction schema is required.");
      }

      let schema: any;
      try {
        schema = JSON.parse(config.extractionSchema);
      } catch {
        throw new Error("Scrape Real Estate Listings: extractionSchema is not valid JSON.");
      }

      const maxPages = Number(config.maxPages) || 1;
      const maxListings = Number(config.maxListings) || 50;
      const delayMs = Number(config.delayMs) || 500;
      const baseUrl = config.baseUrl || config.searchUrlTemplate;
      const userAgent = "Mozilla/5.0 (compatible; IgnitiaOSBot/1.0; +https://ignitia.ai/bot)";

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      async function fetchHtml(url: string): Promise<string> {
        const res = await fetch(url, { headers: { "User-Agent": userAgent } });
        if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
        return res.text();
      }

      // 1. Walk the search-results pages, collecting detail-page URLs.
      const detailUrls = new Set<string>();
      for (let page = 1; page <= maxPages && detailUrls.size < maxListings; page++) {
        const searchUrl = resolveTemplate(config.searchUrlTemplate, { ...input, page });
        const html = await fetchHtml(searchUrl);
        const $ = cheerio.load(html);
        $(config.listingLinkSelector).each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          try {
            detailUrls.add(new URL(href, baseUrl).toString());
          } catch {
            // ignore malformed href
          }
        });
        if (page < maxPages) await sleep(delayMs);
      }

      const urls = Array.from(detailUrls).slice(0, maxListings);

      // 2. Visit each detail page and extract fields with Claude.
      const listings: ScrapedListing[] = [];
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let lastModel = config.model || "claude-sonnet-5";

      for (const url of urls) {
        await sleep(delayMs);
        let html: string;
        try {
          html = await fetchHtml(url);
        } catch {
          continue; // skip listings that fail to fetch, don't fail the whole run
        }

        const $ = cheerio.load(html);
        const pageText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000);

        const result = await aiProvider.run({
          name: "Scrape Real Estate Listings (workflow)",
          prompt: "Extract the requested real estate listing fields from this page's text content.",
          schema,
          input: { url, text: pageText },
          model: config.model || undefined,
          context: { reportId: "automation" },
        });

        if (!result.success) continue; // skip listings Claude couldn't parse

        totalInputTokens += result.usage?.inputTokens ?? 0;
        totalOutputTokens += result.usage?.outputTokens ?? 0;
        lastModel = result.model;

        const extracted = result.data as Record<string, any>;
        listings.push({
          portal,
          externalId: url,
          url,
          address: extracted.address,
          city: extracted.city,
          neighborhood: extracted.neighborhood,
          price: extracted.price,
          currency: extracted.currency,
          bedrooms: extracted.bedrooms,
          bathrooms: extracted.bathrooms,
          areaM2: extracted.areaM2,
          agencyName: extracted.agencyName,
          description: extracted.description,
          photoCount: extracted.photoCount,
          raw: extracted,
        });
      }

      const summary = await ingestListings(portal, listings);

      return {
        output: {
          portal,
          pagesScraped: maxPages,
          ...summary,
          _usage: {
            model: lastModel,
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
            costUsd: estimateCost(
              { inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
              lastModel
            ),
            durationMs: Date.now() - started,
          },
        },
      };
    },
  },

  "data.mercadoLibreSearch": {
    type: "data.mercadoLibreSearch",
    category: "data",
    label: "MercadoLibre Search",
    description:
      "Searches MercadoLibre's public listings API (works for any category — real estate, vehicles, general goods — not hardcoded to one). Authenticates automatically using the MERCADOLIBRE_TOKEN env var if set; the Access token field below only needs a value if you want to override that for this node. Outputs { items: [...], count, siteId } where each item has { externalId, url, title, price, currency, city, state, thumbnail, raw }. Reshape items with a Transform Data node before feeding them into Market Timeline: Ingest Listings. NOTE: I couldn't live-verify the current response shape while building this (my own test request got blocked) — if fields come back named differently than expected, check {{raw}} on each item and adjust your downstream Transform Data mapping.",
    configFields: [
      {
        key: "siteId",
        label: "Site (country)",
        type: "select",
        options: [
          { value: "MLA", label: "Argentina" },
          { value: "MLM", label: "Mexico" },
          { value: "MLB", label: "Brazil" },
          { value: "MCO", label: "Colombia" },
          { value: "MLC", label: "Chile" },
          { value: "MPE", label: "Peru" },
          { value: "MLU", label: "Uruguay" },
          { value: "MPA", label: "Panama" },
          { value: "MEC", label: "Ecuador" },
          { value: "MCR", label: "Costa Rica" },
          { value: "MGT", label: "Guatemala" },
          { value: "MHN", label: "Honduras" },
          { value: "MNI", label: "Nicaragua" },
          { value: "MRD", label: "Dominican Republic" },
          { value: "MBO", label: "Bolivia" },
          { value: "MPY", label: "Paraguay" },
          { value: "MSV", label: "El Salvador" },
          { value: "MLV", label: "Venezuela" },
        ],
      },
      { key: "query", label: "Search query (optional)", type: "text", placeholder: "{{field}} supported" },
      {
        key: "categoryId",
        label: "Category id (optional)",
        type: "text",
        placeholder: "e.g. MLA1459 — find via https://api.mercadolibre.com/sites/{site}/categories",
      },
      { key: "priceMin", label: "Min price (optional)", type: "number" },
      { key: "priceMax", label: "Max price (optional)", type: "number" },
      {
        key: "extraFilters",
        label: "Extra filters (JSON query params — zone/state ids, operation type, rooms, etc.)",
        type: "textarea",
        placeholder: '{"state":"TUxBUFNBTjcxNTBa"}',
      },
      {
        key: "accessToken",
        label: "Access token override (optional — defaults to the MERCADOLIBRE_TOKEN env var)",
        type: "text",
      },
      { key: "maxResults", label: "Max results", type: "number" },
      { key: "delayMs", label: "Delay between pages (ms)", type: "number" },
    ],
    async execute(input, config) {
      const siteId = config.siteId || "MLA";
      const maxResults = Number(config.maxResults) || 50;
      const delayMs = Number(config.delayMs) || 500;
      const limit = Math.min(50, maxResults);
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      let extraFilters: Record<string, any> = {};
      if (config.extraFilters) {
        try {
          extraFilters = JSON.parse(config.extraFilters);
        } catch {
          throw new Error("MercadoLibre Search: extraFilters is not valid JSON.");
        }
      }

      const baseParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(extraFilters)) baseParams[key] = String(value);

      const query = resolveTemplate(config.query ?? "", input);
      if (query) baseParams.q = query;
      if (config.categoryId) baseParams.category = config.categoryId;
      if (config.priceMin || config.priceMax) {
        baseParams.price = `${config.priceMin || "*"}-${config.priceMax || "*"}`;
      }

      const accessToken = config.accessToken || process.env.MERCADOLIBRE_TOKEN;

      const items: any[] = [];
      let offset = 0;

      while (items.length < maxResults) {
        const params = new URLSearchParams({ ...baseParams, offset: String(offset), limit: String(limit) });
        const url = `https://api.mercadolibre.com/sites/${siteId}/search?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; IgnitiaOSBot/1.0; +https://ignitia.ai/bot)",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(
            `MercadoLibre Search: request failed (${res.status}). If this is 401/403, register an app at ` +
              "developers.mercadolibre.com and set the Access token field."
          );
        }

        const data = await res.json();
        const results = data.results ?? [];
        if (results.length === 0) break;

        for (const item of results) {
          items.push({
            externalId: item.id,
            url: item.permalink,
            title: item.title,
            price: item.price,
            currency: item.currency_id,
            city: item.address?.city_name ?? item.location?.city?.name,
            state: item.address?.state_name ?? item.location?.state?.name,
            thumbnail: item.thumbnail,
            raw: item,
          });
        }

        offset += limit;
        const total = data.paging?.total ?? offset;
        if (offset >= total || items.length >= maxResults) break;
        await sleep(delayMs);
      }

      return { output: { items: items.slice(0, maxResults), count: Math.min(items.length, maxResults), siteId } };
    },
  },

  "data.ingestListings": {
    type: "data.ingestListings",
    category: "data",
    label: "Market Timeline: Ingest Listings",
    description:
      "Writes an array of listings into the Market Timeline (re_properties/re_property_snapshots) — only genuinely new/changed listings get a new snapshot. Expects input to be { items: [...] } or a bare array, with fields named portal-agnostically: externalId (or id/url), url, address, city, neighborhood, price, currency, bedrooms, bathrooms, areaM2, agencyName, description, photoCount. Use a Transform Data node upstream to rename fields from whatever your source (e.g. MercadoLibre Search) actually returns. Outputs { portal, listingsFound, listingsNew, listingsChanged }.",
    configFields: [{ key: "portal", label: "Portal name (for storage)", type: "text", placeholder: "mercadolibre" }],
    async execute(input, config) {
      const portal = config.portal || "unknown-portal";
      const items = Array.isArray(input) ? input : input?.items;
      if (!Array.isArray(items)) {
        throw new Error("Market Timeline: Ingest Listings: input must be an array or { items: [...] }.");
      }

      const listings: ScrapedListing[] = items.map((item: any) => ({
        portal,
        externalId: String(item.externalId ?? item.id ?? item.url),
        url: item.url,
        address: item.address,
        city: item.city,
        neighborhood: item.neighborhood,
        price: item.price,
        currency: item.currency,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        areaM2: item.areaM2,
        agencyName: item.agencyName,
        description: item.description,
        photoCount: item.photoCount,
        raw: item.raw ?? item,
      }));

      const summary = await ingestListings(portal, listings);
      return { output: { portal, ...summary } };
    },
  },
};
