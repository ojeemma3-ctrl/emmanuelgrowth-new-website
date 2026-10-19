// Server-side check of "Send my report to": one channel, a valid email or WhatsApp number, and consent.
import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js/min';
import { str } from './server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type VisitorContact = { channel: 'whatsapp' | 'email'; email?: string; whatsapp?: string; tips: boolean };

export function readContact(body: Record<string, unknown>): { contact: VisitorContact } | { error: 'consent' | 'email' | 'whatsapp' } {
  const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'email';
  if (channel === 'email') {
    const email = str(body.email, 200);
    if (!EMAIL.test(email)) return { error: 'email' };
    if (body.consent !== true) return { error: 'consent' };
    return { contact: { channel, email, tips: body.tips === true } };
  }
  const whatsapp = str(body.whatsapp, 20);
  if (!/^\+[1-9]\d{6,14}$/.test(whatsapp) || !isValidPhoneNumber(whatsapp)) return { error: 'whatsapp' };
  if (body.consent !== true) return { error: 'consent' };
  return { contact: { channel, whatsapp: parsePhoneNumberWithError(whatsapp).number, tips: body.tips === true } };
}
