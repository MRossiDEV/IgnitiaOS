// ======================================================
// Data Source Nodes — Uruguay Real Estate Intelligence MVP
// lib/automation/nodes/dataSources.ts
// ======================================================
// One node per ACCESS PATTERN, not per source — most of the
// 50+ sources from the sourcing doc reuse an existing generic
// node (Scrape Real Estate Listings, MercadoLibre Search,
// Website Collector + AI Extractor) configured differently.
// These cover the access patterns nothing else handles yet: a
// dedicated CasasWeb API client, generic CSV/ZIP download+parse,
// a generic ingest for anything that isn't a property listing,
// WFS/GeoJSON GIS layers, Google Trends, and geocoding.

import JSZip from "jszip";
import Papa from "papaparse";
import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { getPath } from "../pathCompare";
import { supabaseAdmin } from "@/lib/supabase/server";

const USER_AGENT = "Mozilla/5.0 (compatible; IgnitiaOSBot/1.0; +https://ignitia.ai/bot)";

export const dataSourceNodes: Record<string, NodeTypeDefinition> = {
  "data.casasWebSearch": {
    type: "data.casasWebSearch",
    category: "data",
    label: "CasasWeb Search",
    description:
      "Queries CasasWeb's REST API (api.casasweb.com) for property listings. I couldn't verify the exact endpoint/response shape live (no confirmed access to the API docs) — this node is deliberately generic: set the path and query params yourself once you've checked https://api.casasweb.com/openapi.json, and use Items path to point at wherever the listings array lives in the response. Outputs { items: [...], count }, each item best-effort mapped (externalId/url/price/address if guessable) plus the full { raw } — reshape with Transform Data before Market Timeline: Ingest Listings.",
    configFields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://api.casasweb.com" },
      { key: "path", label: "Endpoint path", type: "text", placeholder: "/v1/properties (check the OpenAPI spec)" },
      {
        key: "queryParams",
        label: "Query params (JSON)",
        type: "textarea",
        placeholder: '{"price_min":50000,"price_max":200000,"zone":"Montevideo"}',
      },
      { key: "itemsPath", label: "Items path in response (dot path, optional)", type: "text", placeholder: "results" },
      { key: "apiKey", label: "API token (optional — defaults to CASASWEB_TOKEN env var)", type: "text" },
      { key: "maxResults", label: "Max results", type: "number" },
      { key: "delayMs", label: "Delay between pages (ms)", type: "number" },
    ],
    async execute(input, config) {
      const baseUrl = config.baseUrl || "https://api.casasweb.com";
      const path = config.path || "/v1/properties";
      const apiKey = config.apiKey || process.env.CASASWEB_TOKEN;
      const maxResults = Number(config.maxResults) || 50;
      const delayMs = Number(config.delayMs) || 500;
      const pageSize = Math.min(50, maxResults);
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      let queryParams: Record<string, any> = {};
      if (config.queryParams) {
        try {
          queryParams = JSON.parse(config.queryParams);
        } catch {
          throw new Error("CasasWeb Search: queryParams is not valid JSON.");
        }
      }

      const items: any[] = [];
      let page = 1;

      while (items.length < maxResults) {
        const params = new URLSearchParams({
          ...Object.fromEntries(Object.entries(queryParams).map(([k, v]) => [k, String(v)])),
          page: String(page),
          limit: String(pageSize),
        });
        const url = `${baseUrl.replace(/\/$/, "")}${path}?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(
            `CasasWeb Search: request failed (${res.status}). Check the path/queryParams against the OpenAPI spec, and confirm CASASWEB_TOKEN or the apiKey field if this is 401/403.`
          );
        }

        const data = await res.json();
        const rawItems: any[] = config.itemsPath
          ? getPath(data, config.itemsPath)
          : data.results ?? data.items ?? data.data ?? (Array.isArray(data) ? data : []);

        if (!Array.isArray(rawItems) || rawItems.length === 0) break;

        for (const item of rawItems) {
          items.push({
            externalId: item.id ?? item.external_id ?? item.uuid,
            url: item.url ?? item.permalink ?? item.link,
            title: item.title ?? item.name,
            price: item.price ?? item.precio,
            currency: item.currency ?? item.moneda,
            address: item.address ?? item.direccion,
            city: item.city ?? item.ciudad,
            neighborhood: item.zone ?? item.barrio ?? item.neighborhood,
            raw: item,
          });
        }

        if (rawItems.length < pageSize || items.length >= maxResults) break;
        page++;
        await sleep(delayMs);
      }

      return { output: { items: items.slice(0, maxResults), count: Math.min(items.length, maxResults) } };
    },
  },

  "data.downloadDataset": {
    type: "data.downloadDataset",
    category: "data",
    label: "Download Dataset (CSV/ZIP)",
    description:
      "Downloads a CSV file (optionally packed inside a ZIP) and parses it into rows — covers INE/BCU CSV exports, Intendencia de Montevideo building-permit ZIPs, InsideAirbnb CSV downloads, DNC padron CSVs, and similar. A .zip URL has every .csv file inside it parsed and concatenated; a plain .csv URL is parsed directly. Outputs { rows: [...], count, fileNames }. Feed the result into Market Timeline: Ingest Dataset to store it.",
    configFields: [
      { key: "url", label: "Dataset URL", type: "text", placeholder: "https://... .csv or .zip" },
      { key: "delimiter", label: "CSV delimiter (optional, auto-detected if blank)", type: "text", placeholder: "," },
    ],
    async execute(input, config) {
      const url = resolveTemplate(config.url ?? "", input);
      if (!url) throw new Error("Download Dataset: a URL is required.");

      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) throw new Error(`Download Dataset: fetch failed (${res.status}) for ${url}`);

      const buffer = Buffer.from(await res.arrayBuffer());
      const isZip = url.toLowerCase().endsWith(".zip") || buffer.subarray(0, 2).toString("hex") === "504b";

      const rows: any[] = [];
      const fileNames: string[] = [];

      if (isZip) {
        const zip = await JSZip.loadAsync(buffer);
        for (const [name, entry] of Object.entries(zip.files)) {
          if (entry.dir || !name.toLowerCase().endsWith(".csv")) continue;
          const text = await entry.async("text");
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter: config.delimiter || "" });
          fileNames.push(name);
          for (const row of parsed.data as any[]) rows.push({ ...row, _sourceFile: name });
        }
      } else {
        const text = buffer.toString("utf-8");
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter: config.delimiter || "" });
        fileNames.push(url.split("/").pop() ?? url);
        for (const row of parsed.data as any[]) rows.push(row);
      }

      return { output: { rows, count: rows.length, fileNames } };
    },
  },

  "data.ingestDataset": {
    type: "data.ingestDataset",
    category: "data",
    label: "Market Timeline: Ingest Dataset",
    description:
      "Writes rows into the generic external-datasets bucket (re_external_datasets), tagged by source name — used for CSV/GIS/Trends data that doesn't fit the property-listings shape. Expects input to be { rows / features / trends / items: [...] } or a bare array. Every run appends a fresh batch (no diffing, unlike the listings ingest) — this is intentionally a simple catch-all for now; promote a source to its own table once its shape stabilizes. Outputs { source, count }.",
    configFields: [
      { key: "source", label: "Source name (for storage)", type: "text", placeholder: "ine-iai-compraventa" },
    ],
    async execute(input, config) {
      const source = config.source || "unknown-source";
      const items = Array.isArray(input) ? input : input?.rows ?? input?.features ?? input?.trends ?? input?.items;
      if (!Array.isArray(items)) {
        throw new Error("Market Timeline: Ingest Dataset: input must be an array, or { rows/features/trends/items: [...] }.");
      }

      const capturedAt = new Date().toISOString();
      const payload = items.map((row: any, index: number) => ({
        source,
        captured_at: capturedAt,
        row_index: index,
        data: row,
      }));

      if (payload.length > 0) {
        const { error } = await supabaseAdmin.from("re_external_datasets").insert(payload);
        if (error) throw new Error(`Market Timeline: Ingest Dataset: ${error.message}`);
      }

      return { output: { source, count: payload.length } };
    },
  },

  "data.gisFetch": {
    type: "data.gisFetch",
    category: "data",
    label: "GIS Layer Fetch (WFS)",
    description:
      "Fetches a GeoJSON feature collection from a WFS GetFeature endpoint (e.g. IDEuy layers) — covers vector GIS layers without needing shapefile/DXF parsing libraries. Direct .shp/.dxf downloads (like the Catastro parcelario files) aren't parsed by this node yet; that needs a dedicated geometry-parsing library as a follow-up. Outputs { features: [...], count }. Feed into Market Timeline: Ingest Dataset to store it.",
    configFields: [
      { key: "wfsUrl", label: "WFS base URL", type: "text", placeholder: "https://www.ide.gub.uy/geoserver/wfs" },
      { key: "typeName", label: "Layer name (typeName)", type: "text", placeholder: "ideuy:vialidad" },
      { key: "maxFeatures", label: "Max features", type: "number" },
    ],
    async execute(_input, config) {
      if (!config.wfsUrl) throw new Error("GIS Layer Fetch: a WFS base URL is required.");
      if (!config.typeName) throw new Error("GIS Layer Fetch: a layer name (typeName) is required.");

      const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: config.typeName,
        outputFormat: "application/json",
        count: String(config.maxFeatures || 500),
      });
      const url = `${config.wfsUrl.replace(/\/$/, "")}?${params.toString()}`;

      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) {
        throw new Error(
          `GIS Layer Fetch: request failed (${res.status}). Confirm the layer name via that WFS's GetCapabilities endpoint.`
        );
      }

      const data = await res.json();
      const features = data.features ?? [];
      return { output: { features, count: features.length } };
    },
  },

  "data.googleTrends": {
    type: "data.googleTrends",
    category: "data",
    label: "Google Trends",
    description:
      "Fetches Google Trends interest-over-time for a search term. UNOFFICIAL — Google has no public Trends API; this calls the same internal endpoints the trends.google.com website itself uses, which can change or start rate-limiting without notice (I couldn't live-verify this while building it). On failure it returns a stub result rather than failing the whole workflow. Outputs { keyword, geo, timeframe, trends: [{date, value}], _stub? }.",
    configFields: [
      { key: "keyword", label: "Search term", type: "text", placeholder: "{{field}} supported" },
      { key: "geo", label: "Region code (optional)", type: "text", placeholder: "UY" },
      { key: "timeframe", label: "Timeframe", type: "text", placeholder: "today 12-m" },
    ],
    async execute(input, config) {
      const keyword = resolveTemplate(config.keyword ?? "", input);
      if (!keyword) throw new Error("Google Trends: a search term is required.");
      const geo = config.geo || "";
      const timeframe = config.timeframe || "today 12-m";

      try {
        const exploreRes = await fetch("https://trends.google.com/trends/api/explore", {
          method: "POST",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            hl: "es",
            tz: "180",
            req: JSON.stringify({ comparisonItem: [{ keyword, geo, time: timeframe }], category: 0, property: "" }),
          }),
        });
        if (!exploreRes.ok) throw new Error(`explore request failed (${exploreRes.status})`);

        const exploreText = (await exploreRes.text()).replace(/^\)\]\}',?\n/, "");
        const exploreData = JSON.parse(exploreText);
        const widget = exploreData.widgets?.find((w: any) => w.id === "TIMESERIES");
        if (!widget) throw new Error("no TIMESERIES widget in explore response");

        const widgetParams = new URLSearchParams({
          req: JSON.stringify(widget.request),
          token: widget.token,
          tz: "180",
        });
        const dataRes = await fetch(
          `https://trends.google.com/trends/api/widgetdata/multiline?${widgetParams.toString()}`,
          { headers: { "User-Agent": USER_AGENT } }
        );
        if (!dataRes.ok) throw new Error(`widgetdata request failed (${dataRes.status})`);

        const dataText = (await dataRes.text()).replace(/^\)\]\}',?\n/, "");
        const parsed = JSON.parse(dataText);
        const trends = (parsed.default?.timelineData ?? []).map((point: any) => ({
          date: point.formattedAxisTime ?? point.time,
          value: point.value?.[0] ?? null,
        }));

        return { output: { keyword, geo, timeframe, trends } };
      } catch (error: any) {
        return {
          output: {
            keyword,
            geo,
            timeframe,
            trends: [],
            _stub: true,
            _stubNote: `Google Trends fetch failed (${error.message}) — this uses an unofficial, undocumented endpoint that may have changed.`,
          },
        };
      }
    },
  },

  "data.geocodeProperties": {
    type: "data.geocodeProperties",
    category: "data",
    label: "Geocode Properties",
    description:
      "Finds re_properties rows missing lat/lng, geocodes their address via OpenStreetMap Nominatim (free, default, respects its 1 req/sec usage policy) or the Google Geocoding API, and updates lat/lng plus neighborhood directly on the property — neighborhood comes from the geocoder's own address breakdown (Nominatim's suburb/neighbourhood/quarter, or Google's neighborhood/sublocality address component), only filled in if the property doesn't already have one. Padrón/socioeconomic-index tagging isn't built yet — that needs the Catastro dataset's real schema confirmed first (see the periodic official-sources workflow). Outputs { scanned, geocoded, failed, provider }.",
    configFields: [
      {
        key: "provider",
        label: "Provider",
        type: "select",
        options: [
          { value: "osm", label: "OpenStreetMap (Nominatim, free)" },
          { value: "google", label: "Google Geocoding API" },
        ],
      },
      {
        key: "googleApiKey",
        label: "Google API key (optional — defaults to GOOGLE_PLACES_API_KEY env var)",
        type: "text",
      },
      { key: "limit", label: "Max properties per run", type: "number" },
      { key: "delayMs", label: "Delay between requests (ms, min ~1100 for Nominatim)", type: "number" },
    ],
    async execute(_input, config) {
      const provider = config.provider || "osm";
      const limit = Number(config.limit) || 50;
      const delayMs = Number(config.delayMs) || (provider === "google" ? 200 : 1100);
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const { data: properties, error } = await supabaseAdmin
        .from("re_properties")
        .select("id, address, city, neighborhood")
        .is("lat", null)
        .not("address", "is", null)
        .limit(limit);

      if (error) throw new Error(`Geocode Properties: ${error.message}`);

      let geocoded = 0;
      let failed = 0;

      for (const property of properties ?? []) {
        await sleep(delayMs);
        const query = [property.address, property.city, "Uruguay"].filter(Boolean).join(", ");

        try {
          let lat: number | undefined;
          let lng: number | undefined;
          let neighborhood: string | undefined;

          if (provider === "google") {
            const apiKey = config.googleApiKey || process.env.GOOGLE_PLACES_API_KEY;
            if (!apiKey) {
              throw new Error("Google Geocoding requires an API key (googleApiKey field or GOOGLE_PLACES_API_KEY env var).");
            }
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
            );
            const json = await res.json();
            const result = json.results?.[0];
            if (!result) throw new Error("no geocode result");
            lat = result.geometry?.location?.lat;
            lng = result.geometry?.location?.lng;
            neighborhood = result.address_components?.find((c: any) =>
              c.types?.includes("neighborhood") || c.types?.includes("sublocality")
            )?.long_name;
          } else {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=1`,
              { headers: { "User-Agent": USER_AGENT } }
            );
            const json = await res.json();
            const result = json[0];
            if (!result) throw new Error("no geocode result");
            lat = Number(result.lat);
            lng = Number(result.lon);
            neighborhood = result.address?.suburb || result.address?.neighbourhood || result.address?.quarter;
          }

          if (lat == null || lng == null) throw new Error("no coordinates in geocode result");

          await supabaseAdmin
            .from("re_properties")
            .update({ lat, lng, ...(!property.neighborhood && neighborhood ? { neighborhood } : {}) })
            .eq("id", property.id);

          geocoded++;
        } catch {
          failed++;
        }
      }

      return { output: { scanned: (properties ?? []).length, geocoded, failed, provider } };
    },
  },

  "data.computeNeighborhoodMetrics": {
    type: "data.computeNeighborhoodMetrics",
    category: "data",
    label: "Compute Neighborhood Metrics",
    description:
      "Aggregates re_properties by city+neighborhood into median price, median price/m², estimated rental yield, inventory count, and average time on market, then upserts re_neighborhoods (current) and appends a re_neighborhood_snapshots row (historical time series) per zone. Rental yield needs both sale- and rent-tagged listings in the same zone — most existing rows have operation='unknown' until the ingestion nodes are updated to tag it going forward, so expect nulls there at first. Days on market is computed across all listings (active ones counted through today, sold/delisted ones through their last-seen date), not just completed sales, so there's a number from day one instead of waiting months for listings to close. Outputs { zonesProcessed }.",
    configFields: [
      { key: "minListingsPerZone", label: "Min listings per zone to compute (skip sparse zones)", type: "number" },
    ],
    async execute(_input, config) {
      const minListings = Number(config.minListingsPerZone) || 3;

      const { data: properties, error } = await supabaseAdmin
        .from("re_properties")
        .select("city, neighborhood, price, area_m2, operation, status, first_seen_at, last_seen_at")
        .not("neighborhood", "is", null)
        .not("price", "is", null);

      if (error) throw new Error(`Compute Neighborhood Metrics: ${error.message}`);

      function median(nums: number[]): number | null {
        if (nums.length === 0) return null;
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      }

      const groups = new Map<string, any[]>();
      for (const p of properties ?? []) {
        const key = `${p.city ?? ""}|||${p.neighborhood}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
      }

      let zonesProcessed = 0;
      const now = Date.now();

      for (const [key, rows] of groups) {
        if (rows.length < minListings) continue;
        const [city, neighborhood] = key.split("|||");

        const activeRows = rows.filter((r) => r.status === "active");
        const saleRows = activeRows.filter((r) => r.operation === "sale");
        const rentRows = activeRows.filter((r) => r.operation === "rent");
        const priceBasis = saleRows.length > 0 ? saleRows : activeRows;

        const medianPrice = median(priceBasis.map((r) => Number(r.price)).filter((n) => !Number.isNaN(n)));
        const pricePerM2Values = priceBasis
          .filter((r) => r.area_m2 && Number(r.area_m2) > 0)
          .map((r) => Number(r.price) / Number(r.area_m2));
        const medianPricePerM2 = median(pricePerM2Values);

        const medianSale = median(saleRows.map((r) => Number(r.price)).filter((n) => !Number.isNaN(n)));
        const medianRent = median(rentRows.map((r) => Number(r.price)).filter((n) => !Number.isNaN(n)));
        const rentalYield = medianSale && medianRent ? ((medianRent * 12) / medianSale) * 100 : null;

        const domDays = rows.map((r) => {
          const end = r.status === "active" ? now : new Date(r.last_seen_at).getTime();
          const start = new Date(r.first_seen_at).getTime();
          return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = domDays.length ? domDays.reduce((a, b) => a + b, 0) / domDays.length : null;

        const inventoryCount = activeRows.length;

        const { data: neighborhoodRow, error: upsertError } = await supabaseAdmin
          .from("re_neighborhoods")
          .upsert(
            {
              name: neighborhood,
              city: city || "Unknown",
              median_price: medianPrice,
              median_price_per_m2: medianPricePerM2,
              inventory_count: inventoryCount,
              avg_days_on_market: avgDaysOnMarket,
              rental_yield: rentalYield,
            },
            { onConflict: "name,city" }
          )
          .select("id")
          .single();

        if (upsertError || !neighborhoodRow) continue;

        await supabaseAdmin.from("re_neighborhood_snapshots").insert({
          neighborhood_id: neighborhoodRow.id,
          median_price: medianPrice,
          median_price_per_m2: medianPricePerM2,
          inventory_count: inventoryCount,
          avg_days_on_market: avgDaysOnMarket,
          rental_yield: rentalYield,
          raw: { sampleSize: rows.length, saleSampleSize: saleRows.length, rentSampleSize: rentRows.length },
        });

        zonesProcessed++;
      }

      return { output: { zonesProcessed } };
    },
  },
};
