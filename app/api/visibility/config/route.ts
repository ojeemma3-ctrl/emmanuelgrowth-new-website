import { json, turnstileSiteKey } from '../../../../lib/visibility/server';

// Public, non-secret settings the form needs.
export async function GET() {
  return json({ turnstileSiteKey: turnstileSiteKey() ?? null });
}
