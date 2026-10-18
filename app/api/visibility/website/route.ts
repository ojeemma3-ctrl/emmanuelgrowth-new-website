import { json, readJson, readTicket } from '../../../../lib/visibility/server';
import { checkWebsite } from '../../../../lib/visibility/website';

export async function POST(request: Request) {
  const ticket = await readTicket((await readJson(request, 6_000))?.ticket);
  if (!ticket) return json({ error: 'expired' }, 401);
  if (!ticket.website) return json({ skipped: 'no_website' });
  return json({ report: await checkWebsite(ticket.website) });
}
