// Lead notification for the visibility check.
//
// NOT CONNECTED YET. This hosting has no email-sending binding, and the existing contact route
// adds a Brevo contact rather than sending an email, so there is no email pattern to reuse.
// Brevo is intentionally not connected for this check yet. Plug a transport into `send` below
// (for example Brevo's transactional email API or Cloudflare Email Routing) when ready.
// Until then leads are NOT delivered; only the error type is logged, never the lead details.

export type Lead = {
  businessName: string;
  mapsUrl?: string;
  email: string;
  whatsapp?: string;
  statuses: Record<string, string>;
};

export function formatLead(lead: Lead) {
  return [
    `New visibility check: ${lead.businessName}`,
    lead.mapsUrl ? `Google Maps: ${lead.mapsUrl}` : 'Google Maps: (not listed / not selected)',
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp || '(not given)'}`,
    '',
    'Area statuses:',
    ...Object.entries(lead.statuses).map(([area, status]) => `- ${area}: ${status}`),
  ].join('\n');
}

async function send(subject: string, text: string): Promise<void> {
  void subject;
  void text;
  throw new Error('notification_not_configured');
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
