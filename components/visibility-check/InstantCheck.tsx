'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Competitor, Preview, Profile, Suggestion } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';
import { whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { BusinessSearch } from './BusinessSearch';
import type { Outcome } from './findings';
import { ResultView } from './ResultView';
import { Icon, StepBar } from './ui';

type Stage = 'form' | 'running';
type Load<T> = Outcome<T>;

export type CheckState = {
  businessName: string;
  profile: Profile | null;
  website: string | null;
  social: string | null; // platform name when the "website" is a social or link-in-bio page
  competitors: Load<{ rows: Competitor[]; query?: string }>;
  site: Load<WebsiteReport>;
  speed: Load<PageSpeedReport>;
};

const errorText: Record<string, string> = {
  daily_cap: 'We’ve reached today’s limit for free checks. Please come back tomorrow.',
  ip_limit: 'You’ve reached today’s limit for free checks. Please come back tomorrow.',
  not_configured: 'The automatic check isn’t switched on yet. Please message us on WhatsApp instead.',
  verification: 'Please complete the verification and try again.',
  bad_website: 'That website address can’t be checked. Please check it and try again.',
  invalid: 'Please check the form: a valid email and the consent box are needed.',
  expired: 'This check has expired. Please start again.',
  upstream: 'Google didn’t respond just now. Please try again in a minute.',
};

const newToken = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }) => string };
  }
}

async function post<T>(path: string, body: unknown): Promise<T & { error?: string; skipped?: string }> {
  const res = await fetch(`/api/visibility/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json().catch(() => ({ error: 'upstream' }));
}

// Everything lives in memory for this page view only: nothing is stored in the browser.
export function InstantCheck() {
  const [stage, setStage] = useState<Stage>('form');
  const [sessionToken, setSessionToken] = useState(newToken);
  const [manual, setManual] = useState(false);
  const [searchUnavailable, setSearchUnavailable] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [check, setCheck] = useState<CheckState | null>(null);
  const [contact, setContact] = useState({ email: '', whatsapp: '' });
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  // Turnstile only when the server has both keys.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/visibility/config').then((r) => r.json()).then((c: { turnstileSiteKey?: string | null }) => {
      if (!cancelled && c.turnstileSiteKey) setTurnstileKey(c.turnstileSiteKey);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!turnstileKey || !turnstileRef.current || stage !== 'form') return;
    const el = turnstileRef.current;
    const render = () => window.turnstile?.render(el, { sitekey: turnstileKey, callback: setTurnstileToken, 'expired-callback': () => setTurnstileToken('') });
    if (window.turnstile) { render(); return; }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [turnstileKey, stage]);

  const onPick = async (s: Suggestion) => {
    setError('');
    setPreviewLoading(true);
    const data = await post<{ place?: Preview }>('place', { placeId: s.placeId, sessionToken });
    setPreviewLoading(false);
    setSessionToken(newToken()); // the preview call ends the autocomplete session
    if (data.place) setPreview(data.place);
    else setError(errorText[data.error ?? ''] ?? 'We couldn’t load that business. Please try again.');
  };

  const onUnavailable = useCallback(() => {
    setSearchUnavailable(true);
    setManual(true);
  }, []);

  const runChecks = async (ticket: string, base: CheckState) => {
    setCheck(base);
    setStage('running');
    const update = (patch: Partial<CheckState>) => setCheck((c) => (c ? { ...c, ...patch } : c));
    const toLoad = <T,>(data: { error?: string; skipped?: string }, value: () => T): Load<T> => (data.skipped ? { state: 'skipped', reason: data.skipped } : data.error ? { state: 'failed', reason: data.error } : { state: 'done', data: value() });
    await Promise.all([
      post<{ competitors?: Competitor[]; query?: string }>('competitors', { ticket }).then((d) => update({ competitors: toLoad(d, () => ({ rows: d.competitors ?? [], query: d.query })) })),
      post<{ report?: WebsiteReport }>('website', { ticket }).then((d) => update({ site: toLoad(d, () => d.report as WebsiteReport) })),
      post<{ report?: PageSpeedReport }>('pagespeed', { ticket }).then((d) => update({ speed: toLoad(d, () => d.report as PageSpeedReport) })),
    ]);
    return ticket;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const whatsapp = String(form.get('whatsapp') ?? '').trim();
    if (!formRef.current?.reportValidity()) return;
    if (!manual && !preview) {
      setError('Please pick your business from the suggestions, or choose “My business isn’t listed”.');
      return;
    }
    if (turnstileKey && !turnstileToken) {
      setError(errorText.verification);
      return;
    }
    setSubmitting(true);
    const payload = {
      mode: manual ? 'manual' : 'place',
      placeId: preview?.placeId,
      name: String(form.get('manualName') ?? ''),
      town: String(form.get('manualTown') ?? ''),
      website: String(form.get('manualWebsite') ?? ''),
      email,
      whatsapp,
      consent: form.get('consent') === 'on',
      company_url: String(form.get('company_url') ?? ''),
      turnstileToken,
    };
    const data = await post<{ ticket?: string; profile?: Profile | null; website?: string | null; social?: string | null }>('start', payload);
    setSubmitting(false);
    if (!data.ticket) {
      setError(errorText[data.error ?? ''] ?? 'Something went wrong. Please try again.');
      return;
    }
    setContact({ email, whatsapp });
    const base: CheckState = {
      businessName: data.profile?.name ?? payload.name,
      profile: data.profile ?? null,
      website: data.website ?? null,
      social: data.social ?? null,
      competitors: { state: 'waiting' },
      site: { state: 'waiting' },
      speed: { state: 'waiting' },
    };
    await runChecks(data.ticket, base);
    setTicket(data.ticket);
  };

  const [ticket, setTicket] = useState<string | null>(null);

  if (stage === 'running' && check) {
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Emmanuel, I ran the visibility check for ${check.businessName}. Could you walk me through the fixes?`)}`;
    return <ResultView check={check} ticket={ticket} contact={contact} headingRef={resultsRef} whatsappHref={whatsappHref} />;
  }

  return (
    <div className="ic-page">
      <StepBar steps={[{ label: 'Your business', state: 'current' }, { label: 'Your results', state: 'upcoming' }, { label: 'Full report', state: 'upcoming' }]} />

      <header className="ic-hero">
        <p className="ic-hero-label">Step 1 of 3 · Your business</p>
        <h1>See how your business shows up online.</h1>
        <p>Find your business and we’ll run automated checks of your public Google profile and website, then show you the top fixes in plain words.</p>
      </header>

      <form className="ic-card ic-form" ref={formRef} onSubmit={onSubmit} noValidate={false}>
        {!manual ? (
          preview ? (
            <div className="ic-confirm" role="group" aria-labelledby="ic-confirm-title">
              <p className="ic-confirm-title" id="ic-confirm-title">Is this you?</p>
              <strong>{preview.name}</strong>
              <span className="ic-confirm-line"><Icon name="pin" size={16} />{preview.address}</span>
              <span className="ic-confirm-line"><Icon name="star" size={16} />{[preview.category, preview.rating ? `${preview.rating} from ${preview.reviewCount ?? 0} reviews on Google` : 'No rating yet'].filter(Boolean).join(' · ')}</span>
              <button className="vc-back" type="button" onClick={() => setPreview(null)}>Not me, search again</button>
            </div>
          ) : (
            <>
              <BusinessSearch sessionToken={sessionToken} onPick={onPick} onUnavailable={onUnavailable} />
              {previewLoading ? <p className="ic-hint" aria-live="polite">Loading business details…</p> : null}
              <button className="vc-back" type="button" onClick={() => setManual(true)}>My business isn’t listed</button>
            </>
          )
        ) : (
          <fieldset className="ic-manual">
            <legend>Your business</legend>
            {searchUnavailable ? <p className="ic-hint">Business search isn’t available right now, so please enter your details. We’ll still check your website.</p> : null}
            <div className="ic-grid-2">
              <div>
                <label htmlFor="ic-name">Business name</label>
                <div className="ic-field"><Icon name="building" /><input id="ic-name" name="manualName" required maxLength={120} autoComplete="organization" /></div>
              </div>
              <div>
                <label htmlFor="ic-town">Town</label>
                <div className="ic-field"><Icon name="pin" /><input id="ic-town" name="manualTown" required maxLength={80} autoComplete="address-level2" /></div>
              </div>
            </div>
            <label htmlFor="ic-website">Website (optional)</label>
            <div className="ic-field"><Icon name="globe" /><input id="ic-website" name="manualWebsite" maxLength={300} inputMode="url" placeholder="yourbusiness.co.uk" /></div>
            {searchUnavailable ? null : <button className="vc-back" type="button" onClick={() => setManual(false)}>Search Google instead</button>}
          </fieldset>
        )}

        <div className="ic-fields ic-grid-2">
          <div>
            <label htmlFor="ic-email">Email</label>
            <div className="ic-field"><Icon name="mail" /><input id="ic-email" name="email" type="email" required maxLength={200} autoComplete="email" /></div>
          </div>
          <div>
            <label htmlFor="ic-whatsapp">WhatsApp (optional)</label>
            <div className="ic-field"><Icon name="phone" /><input id="ic-whatsapp" name="whatsapp" type="tel" maxLength={30} autoComplete="tel" placeholder="+44 7…" /></div>
          </div>
        </div>
        <div className="ic-honeypot" aria-hidden="true">
          <label htmlFor="ic-company-url">Leave this empty</label>
          <input id="ic-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="ic-consent">
          <input type="checkbox" name="consent" required aria-labelledby="ic-consent-text" />
          <span id="ic-consent-text">I agree that Emmanuel Growth can contact me about my visibility check. <Link href="/privacy-policy" target="_blank">Privacy policy</Link></span>
        </label>

        {turnstileKey ? <div ref={turnstileRef} className="ic-turnstile" /> : null}

        {error ? <p className="ic-error" role="alert">{error}</p> : null}
        <button className="button button-growth ic-submit" type="submit" disabled={submitting}>
          {submitting ? 'Starting your check…' : manual ? 'Run my check' : preview ? 'Yes, this is me. Run my check' : 'Run my check'} <Arrow />
        </button>
        <p className="vc-note">Automated checks of public information only. We don’t store the Google data or page content we look at.</p>
      </form>
    </div>
  );
}
