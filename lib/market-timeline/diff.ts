// ======================================================
// Market Timeline — Diff Engine
// lib/market-timeline/diff.ts
// ======================================================
// Decides whether a freshly-scraped listing represents a real
// change since the last snapshot — this is what keeps
// re_property_snapshots a changelog ("price reduced", "agency
// changed") instead of one identical row per scrape.

import { createHash } from "crypto";

export interface ScrapedListing {
  portal: string;
  externalId: string;
  url: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  lat?: number;
  lng?: number;
  status?: "active" | "sold" | "delisted";
  /** Needed to tell rentals apart from sales for rental-yield metrics.
   *  Defaults to "unknown" at ingest if not provided. */
  operation?: "sale" | "rent";
  agencyName?: string;
  description?: string;
  photoCount?: number;
  raw?: Record<string, any>;
}

export interface PriorSnapshot {
  price?: number | null;
  status?: string | null;
  photoCount?: number | null;
  descriptionHash?: string | null;
  agencyName?: string | null;
}

export interface DiffResult {
  changed: boolean;
  changeSummary: string | null;
}

export function hashDescription(text?: string | null): string | null {
  if (!text) return null;
  return createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}

export function diffListing(listing: ScrapedListing, prior: PriorSnapshot | null): DiffResult {
  if (!prior) return { changed: true, changeSummary: "Listed" };

  const changes: string[] = [];
  const newHash = hashDescription(listing.description);

  if (listing.price != null && prior.price != null && listing.price !== prior.price) {
    changes.push(listing.price < prior.price ? "Price reduced" : "Price increased");
  }
  if (listing.status && prior.status && listing.status !== prior.status) {
    changes.push(`Status changed to ${listing.status}`);
  }
  if (listing.photoCount != null && prior.photoCount != null && listing.photoCount !== prior.photoCount) {
    changes.push("Photos updated");
  }
  if (newHash && prior.descriptionHash && newHash !== prior.descriptionHash) {
    changes.push("Description changed");
  }
  if (listing.agencyName && prior.agencyName && listing.agencyName !== prior.agencyName) {
    changes.push("Agency changed");
  }

  return { changed: changes.length > 0, changeSummary: changes.length ? changes.join(", ") : null };
}
