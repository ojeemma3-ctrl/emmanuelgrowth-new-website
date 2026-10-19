import { errorType, shortSummary, upsertVisibilityContact } from '../../../../lib/visibility/brevo';
import { readContact } from '../../../../lib/visibility/contact';
import { notifyLead } from '../../../../lib/visibility/notify';
import { json, readJson, readTicket, str, takeLimit } from '../../../../lib/visibility/server';

const TWO_HOURS = 2 * 60 * 60 * 1000;

// Called once when a check completes: re-checks the contact and consent, then sends the lead
// notification (contact, channel, business, Maps link, area statuses, Top 3). Nothing is stored here.
// The visitor never sees an error from this route; it only reports whether the notification went out.
export async function POST(request: Request) {
  const body = await readJson(request, 8_000);
  if (!body) return json({ error: 'invalid' }, 400);
  if (str(body.company_url)) return json({ error: 'invalid' }, 400); // honeypot
  const ticket = await readTicket(body.ticket, TWO_HOURS);
  if (!ticket) return json({ error: 'expired' }, 401);
  const checked = readContact(body);
  if ('error' in checked) return json({ error: checked.error }, 400);

  const limit = await takeLimit(request, 'unlock');
  if (!limit.ok) return json({ error: 'busy' }, 429);

  const statuses: Record<string, string> = {};
  if (body.statuses && typeof body.statuses === 'object') {
    for (const [area, status] of Object.entries(body.statuses as Record<string, unknown>).slice(0, 10)) statuses[str(area, 40)] = str(status, 40);
  }
  const topFixes = Array.isArray(body.topFixes) ? body.topFixes.slice(0, 3).map((f) => str(f, 160)).filter(Boolean) : [];
  const { contact } = checked;

  // Brevo contact first; any failure is logged by type only and never shown to the visitor.
  try {
    await upsertVisibilityContact(contact, { businessName: ticket.name, websiteUrl: ticket.website, summary: shortSummary(statuses, topFixes), personalReview: false });
  } catch (error) {
    console.error('visibility_brevo_failed', errorType(error));
  }

  const sent = await notifyLead({
    businessName: ticket.name,
    mapsUrl: ticket.placeId ? `https://www.google.com/maps/place/?q=place_id:${ticket.placeId}` : undefined,
    channel: contact.channel,
    email: contact.email,
    whatsapp: contact.whatsapp,
    statuses,
    topFixes,
  });
  return json({ ok: true, sent });
}
