'use client';

// "Send my report to": WhatsApp or email (one only), consent and the optional tips box.
// The values live in memory only (React state) and are never saved in the browser.
import Link from 'next/link';
import { parsePhoneNumberWithError, validatePhoneNumberLength } from 'libphonenumber-js/min';
import { CountryPhone, findCountry, type Country } from './CountryPhone';
import { Icon } from './ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Channel = 'whatsapp' | 'email';
export type ContactState = {
  channel: Channel;
  channelTouched: boolean; // the visitor chose a channel, so a picked business no longer changes it
  country: Country;
  countryTouched: boolean;
  phone: string;
  email: string;
  consent: boolean;
  tips: boolean;
};
export type Contact = { channel: Channel; email?: string; whatsapp?: string; tips: boolean };

export const defaultChannel = (businessCountry?: string | null): Channel => (businessCountry === 'NG' ? 'whatsapp' : 'email');

export function initialContact(visitorCountry?: string | null): ContactState {
  return {
    channel: 'email', channelTouched: false,
    country: findCountry(visitorCountry) ?? findCountry('GB')!, countryTouched: false,
    phone: '', email: '', consent: false, tips: false,
  };
}

// After a business is picked: WhatsApp for Nigeria, otherwise email, and the phone country follows
// the business, unless the visitor already changed them.
export function withBusinessCountry(state: ContactState, businessCountry?: string | null): ContactState {
  const country = findCountry(businessCountry);
  return {
    ...state,
    channel: state.channelTouched ? state.channel : defaultChannel(businessCountry),
    country: !state.countryTouched && country ? country : state.country,
  };
}

// Friendly checks, then the number in international format (E.164), e.g. +2348012345678.
export function checkPhone(raw: string, country: Country): { error: string } | { e164: string; country?: Country } {
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

export type ContactCheck = { ok: true; contact: Contact; country?: Country } | { ok: false; field: 'whatsapp' | 'email' | 'consent'; error: string };

export function checkContact(state: ContactState): ContactCheck {
  if (state.channel === 'whatsapp') {
    const result = checkPhone(state.phone, state.country);
    if ('error' in result) return { ok: false, field: 'whatsapp', error: result.error };
    if (!state.consent) return { ok: false, field: 'consent', error: 'Please tick the box so we can send you your report.' };
    return { ok: true, contact: { channel: 'whatsapp', whatsapp: result.e164, tips: state.tips }, country: result.country };
  }
  const value = state.email.trim();
  if (!value || !EMAIL.test(value)) {
    return { ok: false, field: 'email', error: value ? 'That email address doesn’t look right. Check it, for example you@yourbusiness.com.' : 'Please enter your email address.' };
  }
  if (!state.consent) return { ok: false, field: 'consent', error: 'Please tick the box so we can send you your report.' };
  return { ok: true, contact: { channel: 'email', email: value, tips: state.tips } };
}

export const CONTACT_FIELD_IDS = { whatsapp: 'ic-contact-whatsapp', email: 'ic-contact-email', consent: 'ic-contact-consent' } as const;

export function ContactFields({ value, onChange, error }: {
  value: ContactState;
  onChange: (next: ContactState) => void;
  error?: { field: 'whatsapp' | 'email' | 'consent'; message: string } | null;
}) {
  const set = (patch: Partial<ContactState>) => onChange({ ...value, ...patch });
  const errorId = 'ic-contact-error';
  const fieldError = error && error.field !== 'consent' ? error : null;
  return (
    <div className="ic-contact">
      <fieldset className="ic-channel">
        <legend>Send my report to</legend>
        <div className="ic-channel-options">
          <label className={value.channel === 'whatsapp' ? 'is-on' : undefined}>
            <input type="radio" name="channel" value="whatsapp" checked={value.channel === 'whatsapp'} onChange={() => set({ channel: 'whatsapp', channelTouched: true })} />
            <Icon name="chat" size={16} />WhatsApp
          </label>
          <label className={value.channel === 'email' ? 'is-on' : undefined}>
            <input type="radio" name="channel" value="email" checked={value.channel === 'email'} onChange={() => set({ channel: 'email', channelTouched: true })} />
            <Icon name="mail" size={16} />Email
          </label>
        </div>
      </fieldset>

      {value.channel === 'whatsapp' ? (
        <div>
          <label htmlFor={CONTACT_FIELD_IDS.whatsapp}>WhatsApp number</label>
          <CountryPhone
            inputId={CONTACT_FIELD_IDS.whatsapp}
            country={value.country}
            onCountry={(c) => set({ country: c, countryTouched: true })}
            value={value.phone}
            onValue={(v) => set({ phone: v })}
            invalid={fieldError?.field === 'whatsapp'}
            describedBy={fieldError?.field === 'whatsapp' ? errorId : 'ic-contact-phone-hint'}
          />
          <p className="ic-hint" id="ic-contact-phone-hint">Choose your country, then type your number. We save it in international format, for example {value.country.dial} …</p>
        </div>
      ) : (
        <div>
          <label htmlFor={CONTACT_FIELD_IDS.email}>Email address</label>
          <div className="ic-field">
            <Icon name="mail" />
            <input
              id={CONTACT_FIELD_IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={200}
              placeholder="you@yourbusiness.com"
              value={value.email}
              onChange={(e) => set({ email: e.target.value })}
              aria-invalid={fieldError?.field === 'email' || undefined}
              aria-describedby={fieldError?.field === 'email' ? errorId : undefined}
            />
          </div>
        </div>
      )}
      {fieldError ? <p className="ic-field-error" id={errorId} role="alert"><Icon name="alert" size={16} />{fieldError.message}</p> : null}

      <label className="ic-consent">
        <input
          id={CONTACT_FIELD_IDS.consent}
          type="checkbox"
          name="consent"
          checked={value.consent}
          onChange={(e) => set({ consent: e.target.checked })}
          aria-invalid={error?.field === 'consent' || undefined}
          aria-describedby={error?.field === 'consent' ? 'ic-consent-error' : undefined}
        />
        <span>I agree that Emmanuel Growth can contact me about my visibility check. <Link href="/privacy-policy" target="_blank">Privacy policy</Link></span>
      </label>
      {error?.field === 'consent' ? <p className="ic-field-error" id="ic-consent-error" role="alert"><Icon name="alert" size={16} />{error.message}</p> : null}
      <label className="ic-consent">
        <input type="checkbox" name="tips" checked={value.tips} onChange={(e) => set({ tips: e.target.checked })} />
        <span>Send me occasional tips.</span>
      </label>
    </div>
  );
}
