// Brevo for the visibility check: create or update the visitor as a contact, and email the owner.
// Uses the existing BREVO_API_KEY. Failures never reach the visitor; only the error type is logged.
import { OWNER } from '../check-config';
import { getEnv } from './server';
import type { VisitorContact } from './contact';

const API = 'https://api.brevo.com/v3';

async function brevo(path: string, body: unknown) {
  const key = getEnv('BREVO_API_KEY');
  if (!key) throw new Error('brevo_key_missing');
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json', 'api-key': key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Only Brevo's error code is kept (e.g. brevo_400_invalid_parameter), never the message or payload.
    const data: unknown = await res.json().catch(() => null);
    const raw = (data as { code?: unknown } | null)?.code;
    const code = typeof raw === 'string' ? raw.replace(/\W/g, '').slice(0, 40) : '';
    throw new Error(`brevo_${res.status}${code ? `_${code}` : ''}`);
  }
}

export type VisibilityAttributes = {
  businessName: string;
  websiteUrl?: string;
  summary?: string; // area statuses and Top 3, max 500 characters
  personalReview: boolean;
};

const today = () => new Date().toISOString().slice(0, 10); // VC_DATE, YYYY-MM-DD

function listId() {
  const id = Number(getEnv('BREVO_VISIBILITY_LIST_ID'));
  if (!Number.isInteger(id) || id <= 0) throw new Error('brevo_list_missing');
  return id;
}

// Brevo needs an email or SMS number to identify a contact. WhatsApp-only visitors are identified by
// SMS (the same international number) plus WHATSAPP, and are marked smsBlacklisted so SMS campaigns
// never reach them: they agreed to be contacted about their check, not to SMS marketing.
function identity(contact: VisitorContact, attributes: Record<string, string | boolean>) {
  if (contact.whatsapp) attributes.WHATSAPP = contact.whatsapp;
  if (contact.email) return { email: contact.email };
  attributes.SMS = contact.whatsapp ?? '';
  return { smsBlacklisted: true };
}

// Create or update the visitor after consent and a valid contact. Only the agreed attributes.
export async function upsertVisibilityContact(contact: VisitorContact, a: VisibilityAttributes) {
  const list = listId();
  const attributes: Record<string, string | boolean> = {
    BUSINESS_NAME: a.businessName.slice(0, 120),
    WEBSITE_URL: a.websiteUrl ?? '',
    PREFERRED_CHANNEL: contact.channel === 'whatsapp' ? 'WhatsApp' : 'Email',
    VC_DATE: today(),
    TIPS_CONSENT: contact.tips === true,
    PERSONAL_REVIEW: a.personalReview,
  };
  if (a.summary !== undefined) attributes.VC_SUMMARY = a.summary.slice(0, 500);
  await brevo('/contacts', { ...identity(contact, attributes), attributes, listIds: [list], updateEnabled: true });
}

// Owner notification through Brevo's transactional email API. Sender must be a verified Brevo sender.
export async function emailOwner(subject: string, text: string) {
  const sender = getEnv('BREVO_SENDER_EMAIL') ?? OWNER.email;
  await brevo('/smtp/email', {
    sender: { email: sender, name: 'Visibility check' },
    to: [{ email: getEnv('VISIBILITY_NOTIFY_EMAIL') ?? OWNER.email }],
    subject: subject.slice(0, 150),
    textContent: text,
  });
}

// "Google business profile: Good; … Top 3: 1. …" trimmed to 500 characters.
export function shortSummary(statuses: Record<string, string>, topFixes: string[]) {
  const s = `${Object.entries(statuses).map(([k, v]) => `${k}: ${v}`).join('; ')}. Top 3: ${topFixes.map((f, i) => `${i + 1}. ${f}`).join(' ')}`;
  return s.length > 500 ? `${s.slice(0, 497)}...` : s;
}

export const errorType = (e: unknown) => (e instanceof Error ? e.message : 'unknown_error');
