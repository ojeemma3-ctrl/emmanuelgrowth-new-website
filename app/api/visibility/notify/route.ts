import { notifyLead } from '../../../../lib/visibility/notify';
import { json, readJson, readTicket, str } from '../../../../lib/visibility/server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Sends the lead notification once the result is ready. Nothing is stored.
export async function POST(request: Request) {
  const body = await readJson(request, 8_000);
  const ticket = await readTicket(body?.ticket);
  if (!body || !ticket) return json({ error: 'expired' }, 401);
  const email = str(body.email, 200);
  if (!EMAIL.test(email)) return json({ error: 'invalid' }, 400);
  const statuses: Record<string, string> = {};
  if (body.statuses && typeof body.statuses === 'object') {
    for (const [area, status] of Object.entries(body.statuses as Record<string, unknown>).slice(0, 10)) statuses[str(area, 40)] = str(status, 40);
  }
  const sent = await notifyLead({
    businessName: ticket.name,
    mapsUrl: ticket.placeId ? `https://www.google.com/maps/place/?q=place_id:${ticket.placeId}` : undefined,
    email,
    whatsapp: str(body.whatsapp, 30) || undefined,
    statuses,
  });
  return json({ sent });
}
