// Where else customers may see a business's name, address and phone, by country.
// Used by the visibility check (Consistency area link) and the /guides/listings page.
// Fees, rules and sign-up steps for these directories have NOT been checked: the guide says so.
// Edit the lists here. Up to 8 country entries each; the core listings apply to every country.

export type ListingTier = 'core' | 'local' | 'hospitality';
export type Listing = { name: string; domain: string; why: string; tier: ListingTier };
export type CountryListings = { label: string; entries: Listing[]; note?: string };

export const CORE_LISTINGS: Listing[] = [
  { name: 'Google Business Profile', domain: 'business.google.com', why: 'Your details on Google Search and Google Maps, where customers may look for you first.', tier: 'core' },
  { name: 'Apple Business Connect', domain: 'business.apple.com', why: 'Your details in Apple Maps and when people search on an iPhone.', tier: 'core' },
  { name: 'Bing Places', domain: 'bingplaces.com', why: 'Your details on Bing search and Bing Maps.', tier: 'core' },
  { name: 'Facebook Page', domain: 'facebook.com', why: 'Customers may check your Facebook page for opening hours and contact details.', tier: 'core' },
];

// For restaurants, cafés, bars and places to stay only (see isHospitality).
export const HOSPITALITY_LISTINGS: Listing[] = [
  { name: 'Tripadvisor', domain: 'tripadvisor.com', why: 'Visitors may compare places to eat and stay here.', tier: 'hospitality' },
];

export const LISTINGS_BY_COUNTRY: Record<'GB' | 'NG' | 'US' | 'FR', CountryListings> = {
  GB: {
    label: 'United Kingdom',
    entries: [
      { name: 'Yell', domain: 'yell.com', why: 'A UK directory that customers may use to find local services.', tier: 'local' },
      { name: 'Yelp UK', domain: 'yelp.co.uk', why: 'Reviews and contact details that customers may check before getting in touch.', tier: 'local' },
      { name: 'FreeIndex', domain: 'freeindex.co.uk', why: 'A UK directory of local services with customer reviews.', tier: 'local' },
      { name: 'Thomson Local', domain: 'thomsonlocal.com', why: 'A UK directory of local businesses and trades.', tier: 'local' },
      { name: 'Scoot', domain: 'scoot.co.uk', why: 'A UK directory of local businesses.', tier: 'local' },
    ],
  },
  NG: {
    label: 'Nigeria',
    entries: [
      { name: 'VConnect', domain: 'vconnect.com', why: 'A Nigerian directory that customers may use to find local services.', tier: 'local' },
      { name: 'BusinessList Nigeria', domain: 'businesslist.com.ng', why: 'A Nigerian directory with contact details and opening hours.', tier: 'local' },
      { name: 'Finelib', domain: 'finelib.com', why: 'A Nigerian business directory.', tier: 'local' },
      { name: 'Connect Nigeria', domain: 'connectnigeria.com', why: 'A Nigerian directory and business community.', tier: 'local' },
    ],
    note: 'In Nigeria, customers may also find and message businesses on Instagram and WhatsApp Business, so check that your name, address and phone match there too.',
  },
  US: {
    label: 'United States',
    entries: [
      { name: 'Yelp', domain: 'yelp.com', why: 'Reviews and contact details that customers may check before getting in touch.', tier: 'local' },
      { name: 'Foursquare', domain: 'foursquare.com', why: 'A places app and directory that lists local businesses.', tier: 'local' },
    ],
  },
  FR: {
    label: 'France',
    // TODO: add French directories once chosen and checked.
    entries: [],
  },
};

export type CountryCode = keyof typeof LISTINGS_BY_COUNTRY;
export const isListedCountry = (code?: string | null): code is CountryCode => Boolean(code && code.toUpperCase() in LISTINGS_BY_COUNTRY);
// A country is only offered (guide buttons, report links) once it has its own entries. France has none yet,
// so French visitors get the main listings without a France option.
// TODO(owner): add checked French directories to LISTINGS_BY_COUNTRY.FR.entries to show France again.
export const hasCountryEntries = (code?: string | null): code is CountryCode => isListedCountry(code) && LISTINGS_BY_COUNTRY[code.toUpperCase() as CountryCode].entries.length > 0;

// Google place types for food, drink and places to stay.
const HOSPITALITY_TYPES = new Set(['restaurant', 'cafe', 'coffee_shop', 'bar', 'pub', 'wine_bar', 'bakery', 'meal_takeaway', 'meal_delivery', 'hotel', 'lodging', 'motel', 'hostel', 'guest_house', 'bed_and_breakfast', 'resort_hotel', 'inn', 'night_club']);
export const isHospitality = (type?: string | null) => Boolean(type && (HOSPITALITY_TYPES.has(type) || type.endsWith('_restaurant')));

// The list for a country: core first, then country entries, then hospitality ones when they apply.
// Unknown or missing countries get the core list only.
export function listingsFor(country?: string | null, hospitality = false) {
  const code = country?.toUpperCase();
  const local = hasCountryEntries(code) ? LISTINGS_BY_COUNTRY[code] : null;
  return {
    code: local ? (code as CountryCode) : null,
    label: local?.label ?? null,
    note: local?.note,
    entries: [...CORE_LISTINGS, ...(local?.entries ?? []), ...(hospitality ? HOSPITALITY_LISTINGS : [])],
  };
}

// Link from the report: the country from the Google profile, plus the hospitality flag.
export function listingsGuideHref(country?: string | null, categoryType?: string | null) {
  const params = new URLSearchParams();
  if (hasCountryEntries(country)) params.set('country', country.toUpperCase());
  if (isHospitality(categoryType)) params.set('type', 'hospitality');
  const query = params.toString();
  return `/guides/listings${query ? `?${query}` : ''}`;
}

export const LISTINGS_LINE = 'Your name, address and phone should also match on other listings customers use (Apple, Bing, Facebook and local directories). We can’t check those automatically.';
