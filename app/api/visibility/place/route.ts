import { PlacesError, preview } from '../../../../lib/visibility/places';
import { json, readJson, str, takeLimit } from '../../../../lib/visibility/server';

// "Is this you?" card: a light Place Details call that closes the autocomplete session.
export async function POST(request: Request) {
  const body = await readJson(request, 2_000);
  const placeId = str(body?.placeId, 300);
  const sessionToken = str(body?.sessionToken, 64);
  if (!/^[\w-]{10,300}$/.test(placeId) || !/^[\w-]{8,64}$/.test(sessionToken)) return json({ error: 'invalid' }, 400);
  const limit = await takeLimit(request, 'preview');
  if (!limit.ok) return json({ error: 'busy' }, 429);
  try {
    return json({ place: await preview(placeId, sessionToken) });
  } catch (error) {
    return json({ error: error instanceof PlacesError ? error.kind : 'upstream' }, 502);
  }
}
