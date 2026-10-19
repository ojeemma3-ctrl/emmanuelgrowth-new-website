import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js/min';
import { notifyLead } from '../../../../lib/visibility/notify';
import { json, readJson, readTicket, str, takeLimit } from '../../../../lib/visibility/server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TWO_HOURS = 2 * 60 * 60 * 1000;

// Unlocks the full report: checks the chosen contact and consent, then sends the lead notification.
// Nothing is stored. Only the chosen contact (email or WhatsApp) is required.
export async function POST(request: Request) {
  const body = await readJson(request, 8_000);
  if (!body) return json({ error: 'invalid' }, 400);
  if (str(body.company_url)) return json({ error: 'invalid' }, 400); // honeypot
  // The result is kept in the visitor's tab for up to 2 hours, so the ticket may be unlocked that long after it expires.
  const ticket = await readTicket(body.ticket, TWO_HOURS);
  if (!ticket) return json({ error: 'expired' }, 401);
  if (body.consent !== true) return json({ error: 'consent' }, 400);

  const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'email';
  const email = str(body.email, 200);
  const whatsapp = str(body.whatsapp, 20);
  if (channel === 'email' && !EMAIL.test(email)) return json({ error: 'email' }, 400);
  let phone: string | undefined;
  if (channel === 'whatsapp') {
    if (!/^\+[1-9]\d{6,14}$/.test(whatsapp) || !isValidPhoneNumber(whatsapp)) return json({ error: 'whatsapp' }, 400);
    phone = parsePhoneNumberWithError(whatsapp).number; // E.164
  }

  const limit = await takeLimit(request, 'unlock');
  if (!limit.ok) return json({ error: 'busy' }, 429);

  const statuses: Record<string, string> = {};
  if (body.statuses && typeof body.statuses === 'object') {
    for (const [area, status] of Object.entries(body.statuses as Record<string, unknown>).slice(0, 10)) statuses[str(area, 40)] = str(status, 40);
  }
  const topFixes = Array.isArray(body.topFixes) ? body.topFixes.slice(0, 3).map((f) => str(f, 160)).filter(Boolean) : [];

  const sent = await notifyLead({
    businessName: ticket.name,
    mapsUrl: ticket.placeId ? `https://www.google.com/maps/place/?q=place_id:${ticket.placeId}` : undefined,
    channel,
    email: channel === 'email' ? email : undefined,
    whatsapp: phone,
    statuses,
    topFixes,
  });
  return json({ unlocked: true, sent });
}
