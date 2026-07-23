// ======================================================
// Tool: Google Places Lookup
// lib/ai/tools/google/placesLookup.ts
// ======================================================
// Rules for tools: no AI, stateless, reusable, small, fast.
// Requires env var: GOOGLE_PLACES_API_KEY

import { PlaceData } from "@/lib/ai/collectors/business/types";

const FIND_PLACE_URL =
  "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
const PLACE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

const DETAIL_FIELDS = [
  "place_id",
  "name",
  "formatted_address",
  "formatted_phone_number",
  "international_phone_number",
  "website",
  "url",
  "rating",
  "user_ratings_total",
  "price_level",
  "business_status",
  "types",
  "opening_hours",
  "photos",
].join(",");

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is not set. Add it to your env file."
    );
  }
  return key;
}

/**
 * Finds a single business via Google Places and returns its full
 * details. Returns null if nothing matches (not an error — a
 * business may simply not have a Google listing).
 */
export async function findPlace(
  query: string
): Promise<PlaceData | null> {
  const apiKey = getApiKey();

  const findUrl = new URL(FIND_PLACE_URL);
  findUrl.searchParams.set("input", query);
  findUrl.searchParams.set("inputtype", "textquery");
  findUrl.searchParams.set("fields", "place_id");
  findUrl.searchParams.set("key", apiKey);

  const findRes = await fetch(findUrl.toString());
  const findJson = await findRes.json();

  if (findJson.status !== "OK" || !findJson.candidates?.length) {
    return null;
  }

  const placeId = findJson.candidates[0].place_id;

  const detailsUrl = new URL(PLACE_DETAILS_URL);
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set("fields", DETAIL_FIELDS);
  detailsUrl.searchParams.set("key", apiKey);

  const detailsRes = await fetch(detailsUrl.toString());
  const detailsJson = await detailsRes.json();

  if (detailsJson.status !== "OK" || !detailsJson.result) {
    return null;
  }

  const result = detailsJson.result;

  const data: PlaceData = {
    placeId: result.place_id ?? placeId,
    name: result.name ?? "",
    formattedAddress: result.formatted_address ?? "",
    phone: result.formatted_phone_number ?? "",
    internationalPhone: result.international_phone_number ?? "",
    website: result.website ?? "",
    googleMapsUrl: result.url ?? "",
    rating: result.rating ?? null,
    userRatingsTotal: result.user_ratings_total ?? null,
    priceLevel: result.price_level ?? null,
    businessStatus: result.business_status ?? "",
    types: result.types ?? [],
    openingHours: result.opening_hours?.weekday_text ?? [],
    photos: (result.photos ?? []).map(
      (photo: any) => photo.photo_reference
    ),
  };

  return data;
}
