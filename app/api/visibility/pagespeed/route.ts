import { PageSpeedError, runPageSpeed } from '../../../../lib/visibility/pagespeed';
import { assertPublicUrl } from '../../../../lib/visibility/safe-fetch';
import { json, readJson, readTicket } from '../../../../lib/visibility/server';
import { normaliseUrl } from '../../../../lib/visibility/website';

export async function POST(request: Request) {
  const ticket = await readTicket((await readJson(request, 6_000))?.ticket);
  if (!ticket) return json({ error: 'expired' }, 401);
  if (!ticket.website) return json({ skipped: 'no_website' });
  if (ticket.social) return json({ skipped: 'social', platform: ticket.social });
  try {
    const url = await assertPublicUrl(normaliseUrl(ticket.website));
    return json({ report: await runPageSpeed(url.toString()) });
  } catch (error) {
    return json({ error: error instanceof PageSpeedError ? error.kind : 'unreachable' }, 502);
  }
}
