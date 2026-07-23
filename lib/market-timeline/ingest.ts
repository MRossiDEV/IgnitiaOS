// ======================================================
// Market Timeline — Ingest
// lib/market-timeline/ingest.ts
// ======================================================
// Upserts re_properties and appends re_property_snapshots rows
// via the diff engine. The only file that writes to either table.

import { supabaseAdmin } from "@/lib/supabase/server";
import { diffListing, hashDescription, ScrapedListing } from "./diff";

export interface IngestSummary {
  listingsFound: number;
  listingsNew: number;
  listingsChanged: number;
}

export async function ingestListings(portal: string, listings: ScrapedListing[]): Promise<IngestSummary> {
  let listingsNew = 0;
  let listingsChanged = 0;
  const now = new Date().toISOString();

  for (const listing of listings) {
    const { data: existing } = await supabaseAdmin
      .from("re_properties")
      .select("id, price, status, operation, photo_count, description, agency_name")
      .eq("portal", portal)
      .eq("external_id", listing.externalId)
      .maybeSingle();

    if (!existing) {
      const { data: created, error } = await supabaseAdmin
        .from("re_properties")
        .insert({
          portal,
          external_id: listing.externalId,
          url: listing.url,
          address: listing.address ?? null,
          city: listing.city ?? null,
          neighborhood: listing.neighborhood ?? null,
          price: listing.price ?? null,
          currency: listing.currency ?? "USD",
          bedrooms: listing.bedrooms ?? null,
          bathrooms: listing.bathrooms ?? null,
          area_m2: listing.areaM2 ?? null,
          lat: listing.lat ?? null,
          lng: listing.lng ?? null,
          status: listing.status ?? "active",
          operation: listing.operation ?? "unknown",
          agency_name: listing.agencyName ?? null,
          description: listing.description ?? null,
          photo_count: listing.photoCount ?? 0,
          first_seen_at: now,
          last_seen_at: now,
        })
        .select("id")
        .single();

      if (error || !created) {
        console.error("Market Timeline: failed to insert property", error);
        continue;
      }

      await supabaseAdmin.from("re_property_snapshots").insert({
        property_id: created.id,
        price: listing.price ?? null,
        status: listing.status ?? "active",
        operation: listing.operation ?? null,
        photo_count: listing.photoCount ?? 0,
        description_hash: hashDescription(listing.description),
        description_text: listing.description ?? null,
        agency_name: listing.agencyName ?? null,
        change_summary: "Listed",
        raw: listing.raw ?? {},
      });

      listingsNew++;
      continue;
    }

    const diff = diffListing(listing, {
      price: existing.price,
      status: existing.status,
      photoCount: existing.photo_count,
      descriptionHash: hashDescription(existing.description),
      agencyName: existing.agency_name,
    });

    await supabaseAdmin
      .from("re_properties")
      .update({
        price: listing.price ?? existing.price,
        status: listing.status ?? existing.status,
        operation: listing.operation ?? existing.operation,
        photo_count: listing.photoCount ?? existing.photo_count,
        description: listing.description ?? existing.description,
        agency_name: listing.agencyName ?? existing.agency_name,
        last_seen_at: now,
      })
      .eq("id", existing.id);

    if (diff.changed) {
      await supabaseAdmin.from("re_property_snapshots").insert({
        property_id: existing.id,
        price: listing.price ?? null,
        status: listing.status ?? null,
        operation: listing.operation ?? null,
        photo_count: listing.photoCount ?? null,
        description_hash: hashDescription(listing.description),
        description_text: listing.description ?? null,
        agency_name: listing.agencyName ?? null,
        change_summary: diff.changeSummary,
        raw: listing.raw ?? {},
      });
      listingsChanged++;
    }
  }

  return { listingsFound: listings.length, listingsNew, listingsChanged };
}
