import { isGenericCategory, MIN_COMPARABLE } from '../../../../lib/visibility/category';
import { competitors, PlacesError } from '../../../../lib/visibility/places';
import { json, readJson, readTicket, str, takeLimit } from '../../../../lib/visibility/server';

// Nearby comparison. Default: same primary type only, and only when the category is specific.
// With a keyword ("What do you do?"), searches that keyword in the same town instead.
export async function POST(request: Request) {
  const body = await readJson(request, 6_000);
  const ticket = await readTicket(body?.ticket);
  if (!ticket) return json({ error: 'expired' }, 401);
  if (!ticket.placeId || !ticket.town) return json({ skipped: 'no_category' });
  const rerun = str(body?.keyword, 40);
  const keyword = rerun || ticket.keyword;
  try {
    if (keyword) {
      if (!/^[\p{L}\p{N}][\p{L}\p{N} '&-]{1,39}$/u.test(keyword)) return json({ error: 'invalid' }, 400);
      // A rerun from the results page is an extra search; the step 1 keyword is part of the check already counted.
      if (rerun) {
        const limit = await takeLimit(request, 'preview');
        if (!limit.ok) return json({ error: 'busy' }, 429);
      }
      const query = `${keyword} in ${ticket.town}`;
      const rows = await competitors(query, ticket.placeId);
      return rows.length >= MIN_COMPARABLE ? json({ competitors: rows, query, keyword }) : json({ skipped: 'too_few', query });
    }
    if (!ticket.category || isGenericCategory(ticket.categoryType, ticket.category)) return json({ skipped: 'generic_category' });
    const query = `${ticket.category} in ${ticket.town}`;
    const rows = await competitors(query, ticket.placeId, ticket.categoryType);
    return rows.length >= MIN_COMPARABLE ? json({ competitors: rows, query }) : json({ skipped: 'too_few', query });
  } catch (error) {
    return json({ error: error instanceof PlacesError ? error.kind : 'upstream' }, 502);
  }
}
