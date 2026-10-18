import { competitors, PlacesError } from '../../../../lib/visibility/places';
import { json, readJson, readTicket } from '../../../../lib/visibility/server';

export async function POST(request: Request) {
  const ticket = await readTicket((await readJson(request, 6_000))?.ticket);
  if (!ticket) return json({ error: 'expired' }, 401);
  if (!ticket.placeId || !ticket.category || !ticket.town) return json({ skipped: 'no_category' });
  try {
    return json({ competitors: await competitors(ticket.category, ticket.town, ticket.placeId), query: `${ticket.category} in ${ticket.town}` });
  } catch (error) {
    return json({ error: error instanceof PlacesError ? error.kind : 'upstream' }, 502);
  }
}
