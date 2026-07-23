// ======================================================
// Business Collector — Types
// lib/ai/collectors/business/types.ts
// ======================================================

export interface PlaceData {
  placeId: string;
  name: string;
  formattedAddress: string;
  phone: string;
  internationalPhone: string;
  website: string;
  googleMapsUrl: string;
  rating: number | null;
  userRatingsTotal: number | null;
  priceLevel: number | null;
  businessStatus: string;
  types: string[];
  openingHours: string[]; // e.g. "Monday: 9:00 AM – 6:00 PM"
  photos: string[]; // Google photo_reference tokens
}
