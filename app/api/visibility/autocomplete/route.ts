import { autocomplete, PlacesError } from '../../../../lib/visibility/places';
import { json, readJson, str, takeLimit } from '../../../../lib/visibility/server';

export async function POST(request: Request) {
  const body = await readJson(request, 2_000);
  const input = str(body?.input, 120);
  const sessionToken = str(body?.sessionToken, 64);
  if (input.length < 3 || !/^[\w-]{8,64}$/.test(sessionToken)) return json({ suggestions: [] });
  const limit = await takeLimit(request, 'autocomplete');
  if (!limit.ok) return json({ error: 'busy' }, 429);
  try {
    return json({ suggestions: await autocomplete(input, sessionToken) });
  } catch (error) {
    return json({ error: error instanceof PlacesError ? error.kind : 'upstream' }, 502);
  }
}
