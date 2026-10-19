'use client';

// "Get the full report and PDF": asks only for the contact the visitor chooses (WhatsApp or email),
// plus consent. The contact stays in memory and is sent once to /api/visibility/unlock; it is never
// saved in the browser.
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { parsePhoneNumberWithError, validatePhoneNumberLength } from 'libphonenumber-js/min';
import { Arrow } from '../home/shared';
import { CountryPhone, findCountry, type Country } from './CountryPhone';
import { Icon } from './ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Channel = 'whatsapp' | 'email';

const serverErrors: Record<string, string> = {
  expired: 'This check is too old to unlock. Please start a new check.',
  busy: 'Too many requests just now. Please try again in a minute.',
  consent: 'Please tick the box so we can send you the report.',
  email: 'That email address doesn’t look right. Please check it.',
  whatsapp: 'That WhatsApp number doesn’t look right. Please check it and the country.',
};

// Friendly checks, then the number in international format (E.164), e.g. +2348012345678.
function checkPhone(raw: string, country: Country): { error: string } | { e164: string; country?: Country } {
  const input = raw.trim();
  if (!input) return { error: 'Please enter your WhatsApp number.' };
  if (/[a-z]/i.test(input)) return { error: 'Please use digits only, for example 801 234 5678.' };
  const international = input.startsWith('+') || input.startsWith('00');
  const text = input.startsWith('00') ? `+${input.slice(2)}` : input;
  const length = international ? validatePhoneNumberLength(text) : validatePhoneNumberLength(text, country.code);
  if (length === 'TOO_SHORT') return { error: international ? 'That number looks too short.' : `That number looks too short for ${country.name}.` };
  if (length === 'TOO_LONG') return { error: international ? 'That number looks too long.' : `That number looks too long for ${country.name}.` };
  if (length === 'INVALID_COUNTRY') return { error: 'We don’t recognise that country code. Choose your country from the list instead.' };
  try {
    const phone = international ? parsePhoneNumberWithError(text) : parsePhoneNumberWithError(text, country.code);
    if (!phone.isValid()) {
      return { error: international ? 'That doesn’t look like a valid WhatsApp number. Please check the digits.' : `That doesn’t look like a ${country.name} number. Check the digits, or choose a different country.` };
    }
    return { e164: phone.number, country: phone.country ? findCountry(phone.country) : undefined };
  } catch {
    return { error: 'That doesn’t look like a phone number. Please check the digits.' };
  }
}

export function UnlockForm({ ticket, businessCountry, visitorCountry, summary, onUnlocked }: {
  ticket: string | null;
  businessCountry?: string;
  visitorCountry?: string | null;
  summary: () => { statuses: Record<string, string>; topFixes: string[] };
  onUnlocked: () => void;
}) {
  const [channel, setChannel] = useState<Channel>((businessCountry ?? visitorCountry) === 'NG' ? 'whatsapp' : 'email');
  const [country, setCountry] = useState<Country>(() => findCountry(businessCountry) ?? findCountry(visitorCountry) ?? findCountry('GB')!);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const pick = (next: Channel) => {
    setChannel(next);
    setFieldError('');
    setError('');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    setFieldError('');
    const form = new FormData(event.currentTarget);
    let contact: { email?: string; whatsapp?: string };
    if (channel === 'whatsapp') {
      const result = checkPhone(phone, country);
      if ('error' in result) {
        setFieldError(result.error);
        formRef.current?.querySelector<HTMLInputElement>('#ic-unlock-whatsapp')?.focus();
        return;
      }
      if (result.country && result.country.code !== country.code) setCountry(result.country);
      contact = { whatsapp: result.e164 };
    } else {
      const value = email.trim();
      if (!value || !EMAIL.test(value)) {
        setFieldError(value ? 'That email address doesn’t look right. Check it, for example you@yourbusiness.com.' : 'Please enter your email address.');
        formRef.current?.querySelector<HTMLInputElement>('#ic-unlock-email')?.focus();
        return;
      }
      contact = { email: value };
    }
    if (form.get('consent') !== 'on') {
      setError(serverErrors.consent);
      return;
    }
    if (!ticket) {
      setError(serverErrors.expired);
      return;
    }
    inFlight.current = true;
    setSending(true);
    const res = await fetch('/api/visibility/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, channel, ...contact, consent: true, company_url: String(form.get('company_url') ?? ''), ...summary() }),
    }).then((r) => r.json() as Promise<{ unlocked?: boolean; error?: string }>).catch(() => ({ error: 'network' }) as { unlocked?: boolean; error?: string });
    inFlight.current = false;
    setSending(false);
    if (res.unlocked) onUnlocked();
    else setError(serverErrors[res.error ?? ''] ?? 'Something went wrong. Please try again.');
  };

  const errorId = 'ic-unlock-field-error';
  return (
    <section className="ic-block ic-unlock" id="ic-unlock" aria-labelledby="ic-unlock-title">
      <div className="ic-unlock-intro">
        <h2 id="ic-unlock-title">Get the full report and PDF</h2>
        <p>The full report adds a summary for each area, what’s working and what to fix, the nearby comparison and every check explained, with why it matters and the effort involved.</p>
      </div>

      <form className="ic-card ic-form ic-unlock-form" ref={formRef} onSubmit={onSubmit} noValidate>
        <fieldset className="ic-channel">
          <legend>Send it to me by</legend>
          <div className="ic-channel-options">
            <label className={channel === 'whatsapp' ? 'is-on' : undefined}>
              <input type="radio" name="channel" value="whatsapp" checked={channel === 'whatsapp'} onChange={() => pick('whatsapp')} />
              <Icon name="chat" size={16} />WhatsApp
            </label>
            <label className={channel === 'email' ? 'is-on' : undefined}>
              <input type="radio" name="channel" value="email" checked={channel === 'email'} onChange={() => pick('email')} />
              <Icon name="mail" size={16} />Email
            </label>
          </div>
        </fieldset>

        {channel === 'whatsapp' ? (
          <div>
            <label htmlFor="ic-unlock-whatsapp">WhatsApp number</label>
            <CountryPhone
              country={country}
              onCountry={(c) => { setCountry(c); setFieldError(''); }}
              value={phone}
              onValue={(v) => { setPhone(v); setFieldError(''); }}
              invalid={Boolean(fieldError)}
              describedBy={fieldError ? errorId : 'ic-unlock-phone-hint'}
            />
            <p className="ic-hint" id="ic-unlock-phone-hint">Choose your country, then type your number. We save it in international format, for example {country.dial} …</p>
          </div>
        ) : (
          <div>
            <label htmlFor="ic-unlock-email">Email address</label>
            <div className="ic-field">
              <Icon name="mail" />
              <input
                id="ic-unlock-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={200}
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                aria-invalid={Boolean(fieldError) || undefined}
                aria-describedby={fieldError ? errorId : undefined}
              />
            </div>
          </div>
        )}
        {fieldError ? <p className="ic-field-error" id={errorId} role="alert"><Icon name="alert" size={16} />{fieldError}</p> : null}

        <div className="ic-honeypot" aria-hidden="true">
          <label htmlFor="ic-unlock-company-url">Leave this empty</label>
          <input id="ic-unlock-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="ic-consent">
          <input type="checkbox" name="consent" required aria-labelledby="ic-unlock-consent-text" />
          <span id="ic-unlock-consent-text">I agree that Emmanuel Growth can contact me about my visibility check. <Link href="/privacy-policy" target="_blank">Privacy policy</Link></span>
        </label>

        {error ? <p className="ic-error" role="alert">{error}</p> : null}
        <button className="button button-growth ic-submit" type="submit" disabled={sending} aria-disabled={sending}>
          {sending ? 'Unlocking…' : 'Show my full report'} <Arrow />
        </button>
      </form>
    </section>
  );
}
