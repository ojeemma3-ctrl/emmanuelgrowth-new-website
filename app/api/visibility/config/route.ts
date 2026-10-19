import { json, turnstileSiteKey, visitorCountry } from '../../../../lib/visibility/server';

// Public, non-secret settings the form needs.
export async function GET(request: Request) {
  return json({ turnstileSiteKey: turnstileSiteKey() ?? null, country: visitorCountry(request) });
}
