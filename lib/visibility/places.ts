// Google Places API (New). Server-side only: the key comes from GOOGLE_PLACES_API_KEY.
import { getEnv } from './server';

const BASE = 'https://places.googleapis.com/v1';

export class PlacesError extends Error {
  constructor(public kind: 'not_configured' | 'upstream' | 'not_found') {
    super(kind);
  }
}

async function call<T>(path: string, init: RequestInit & { fieldMask: string }): Promise<T> {
  const key = getEnv('GOOGLE_PLACES_API_KEY');
  if (!key) throw new PlacesError('not_configured');
  const { fieldMask, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': fieldMask },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) throw new PlacesError('not_found');
  if (!res.ok) throw new PlacesError('upstream');
  return res.json() as Promise<T>;
}

type LocalizedText = { text?: string };

export type Suggestion = { placeId: string; main: string; secondary: string };

export async function autocomplete(input: string, sessionToken: string): Promise<Suggestion[]> {
  type R = { suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: LocalizedText; secondaryText?: LocalizedText } } }[] };
  const data = await call<R>('/places:autocomplete', {
    method: 'POST',
    fieldMask: 'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat',
    body: JSON.stringify({ input, sessionToken, languageCode: 'en' }),
  });
  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
    .slice(0, 5)
    .map((p) => ({ placeId: p.placeId, main: p.structuredFormat?.mainText?.text ?? '', secondary: p.structuredFormat?.secondaryText?.text ?? '' }));
}

export type Preview = { placeId: string; name: string; address: string; category: string; rating?: number; reviewCount?: number };

// "Is this you?" card. Uses the autocomplete session token, which closes the session.
export async function preview(placeId: string, sessionToken: string): Promise<Preview> {
  type R = { id: string; displayName?: LocalizedText; formattedAddress?: string; primaryTypeDisplayName?: LocalizedText; rating?: number; userRatingCount?: number };
  const data = await call<R>(`/places/${encodeURIComponent(placeId)}?languageCode=en&sessionToken=${encodeURIComponent(sessionToken)}`, {
    method: 'GET',
    fieldMask: 'id,displayName,formattedAddress,primaryTypeDisplayName,rating,userRatingCount',
  });
  return { placeId: data.id, name: data.displayName?.text ?? '', address: data.formattedAddress ?? '', category: data.primaryTypeDisplayName?.text ?? '', rating: data.rating, reviewCount: data.userRatingCount };
}

export type Profile = {
  placeId: string;
  name: string;
  address: string;
  town?: string;
  category?: string;
  categoryType?: string;
  phone?: string;
  internationalPhone?: string;
  website?: string;
  hasOpeningHours: boolean;
  photoCount: number;
  photosCapped: boolean;
  rating?: number;
  reviewCount?: number;
  businessStatus?: string;
  latestReviewDate?: string;
  mapsUrl?: string;
};

// Full profile for check A. Only called after the visitor confirms the business.
export async function profile(placeId: string): Promise<Profile> {
  type R = {
    id: string;
    displayName?: LocalizedText;
    formattedAddress?: string;
    addressComponents?: { longText?: string; types?: string[] }[];
    primaryType?: string;
    primaryTypeDisplayName?: LocalizedText;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    photos?: unknown[];
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
    reviews?: { publishTime?: string }[];
    googleMapsUri?: string;
  };
  const data = await call<R>(`/places/${encodeURIComponent(placeId)}?languageCode=en`, {
    method: 'GET',
    fieldMask: 'id,displayName,formattedAddress,addressComponents,primaryType,primaryTypeDisplayName,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,photos,rating,userRatingCount,businessStatus,reviews,googleMapsUri',
  });
  const find = (type: string) => data.addressComponents?.find((c) => c.types?.includes(type))?.longText;
  const reviewDates = (data.reviews ?? []).map((r) => r.publishTime).filter((d): d is string => Boolean(d)).sort();
  const photoCount = data.photos?.length ?? 0;
  return {
    placeId: data.id,
    name: data.displayName?.text ?? '',
    address: data.formattedAddress ?? '',
    town: find('postal_town') ?? find('locality') ?? find('administrative_area_level_2'),
    category: data.primaryTypeDisplayName?.text,
    categoryType: data.primaryType,
    phone: data.nationalPhoneNumber,
    internationalPhone: data.internationalPhoneNumber,
    website: data.websiteUri,
    hasOpeningHours: Boolean(data.regularOpeningHours?.weekdayDescriptions?.length),
    photoCount,
    photosCapped: photoCount >= 10,
    rating: data.rating,
    reviewCount: data.userRatingCount,
    businessStatus: data.businessStatus,
    latestReviewDate: reviewDates.at(-1),
    mapsUrl: data.googleMapsUri,
  };
}

export type Competitor = { name: string; rating?: number; reviewCount?: number; hasWebsite: boolean };

// One Text Search for the same category in the same town.
export async function competitors(category: string, town: string, excludePlaceId?: string): Promise<Competitor[]> {
  type R = { places?: { id: string; displayName?: LocalizedText; rating?: number; userRatingCount?: number; websiteUri?: string }[] };
  const data = await call<R>('/places:searchText', {
    method: 'POST',
    fieldMask: 'places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri',
    body: JSON.stringify({ textQuery: `${category} in ${town}`, languageCode: 'en', pageSize: 10 }),
  });
  return (data.places ?? [])
    .filter((p) => p.id !== excludePlaceId)
    .slice(0, 5)
    .map((p) => ({ name: p.displayName?.text ?? '', rating: p.rating, reviewCount: p.userRatingCount, hasWebsite: Boolean(p.websiteUri) }));
}
