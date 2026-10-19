// Lead notification for the visibility check, emailed to the owner when a check completes
// (and when a personal review is requested), through Brevo's transactional email API.
// Needs BREVO_API_KEY and a verified sender (BREVO_SENDER_EMAIL). If sending fails, only the
// error type is logged, never the lead details, and the visitor sees nothing.

import { emailOwner } from './brevo';

export type Lead = {
  businessName: string;
  mapsUrl?: string;
  channel: 'whatsapp' | 'email';
  email?: string;
  whatsapp?: string; // international format, e.g. +2348012345678
  statuses: Record<string, string>;
  topFixes: string[];
};

export function formatLead(lead: Lead) {
  return [
    `New visibility check: ${lead.businessName}`,
    lead.mapsUrl ? `Google Maps: ${lead.mapsUrl}` : 'Google Maps: (not listed / not selected)',
    `Send the report by: ${lead.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}`,
    lead.channel === 'whatsapp' ? `WhatsApp: ${lead.whatsapp}` : `Email: ${lead.email}`,
    '',
    'Area statuses:',
    ...Object.entries(lead.statuses).map(([area, status]) => `- ${area}: ${status}`),
    '',
    'Top 3 fixes:',
    ...(lead.topFixes.length ? lead.topFixes.map((fix, i) => `${i + 1}. ${fix}`) : ['(none)']),
  ].join('\n');
}

async function send(subject: string, text: string): Promise<void> {
  await emailOwner(subject, text);
}

export async function notifyLead(lead: Lead) {
  try {
    await send(`Visibility check: ${lead.businessName}`, formatLead(lead));
    return true;
  } catch (error) {
    console.error('visibility_notify_failed', error instanceof Error ? error.message : 'unknown_error');
    return false;
  }
}
