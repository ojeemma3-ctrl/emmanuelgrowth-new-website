'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Competitor, Preview, Profile, Suggestion } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';
import { REQUIRE_CONTACT_BEFORE_REPORT } from '../../lib/check-config';
import { formatCount } from '../../lib/check-standard';
import { Arrow } from '../home/shared';
import { BusinessSearch } from './BusinessSearch';
import { checkContact, CONTACT_FIELD_IDS, ContactFields, initialContact, withBusinessCountry, type Contact, type ContactState } from './ContactFields';
import { findCountry } from './CountryPhone';
import type { Outcome } from './findings';
import { ResultView } from './ResultView';
import { clearResult, loadResult, saveResult } from './saved';
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
  daily_cap: 'Today’s limit for free checks has been reached. Please come back tomorrow.',
  ip_limit: 'You’ve reached today’s limit for free checks. Please come back tomorrow.',
  not_configured: 'The automatic check isn’t switched on yet. Please message me on WhatsApp instead.',
  verification: 'Please complete the verification and try again.',
  bad_website: 'That website address can’t be checked. Please check it and try again.',
  invalid: 'Please check the form and try again.',
  keyword: 'For “What do you do?”, please use a few words with letters and numbers only, for example plumber or hair salon.',
  expired: 'This check has expired. Please start again.',
  consent: 'Please tick the box so I can contact you about your check.',
  email: 'That email address doesn’t look right. Please check it.',
  whatsapp: 'That WhatsApp number doesn’t look right. Please check it and the country.',
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

type StepEntry = { vcStep: 'business' | 'results' };
const currentStep = () => (history.state as StepEntry | null)?.vcStep;
const markStep = (vcStep: StepEntry['vcStep'], push: boolean) => {
  const entry = { ...(history.state ?? {}), vcStep };
  if (push) history.pushState(entry, '', window.location.pathname + window.location.search);
  else history.replaceState(entry, '');
};
const isFinished = (c: CheckState) => [c.competitors, c.site, c.speed].every((l) => l.state !== 'waiting');

// The finished public result is kept in this browser tab for up to 2 hours (see saved.ts).
// The visitor's contact (step 1) lives in memory only and is never saved in the browser.
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
  const [contactState, setContactState] = useState<ContactState>(() => initialContact());
  const [contactError, setContactError] = useState<{ field: 'whatsapp' | 'email' | 'consent'; message: string } | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  // On load: show a result saved in this tab in the last 2 hours, without calling Google or PageSpeed
  // (so it doesn't count against the daily limits). Back from the results goes to the business step.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const saved = loadResult();
      if (!saved) {
        markStep('business', false);
        return;
      }
      setCheck(saved.check);
      setTicket(saved.ticket);
      setRestored(true);
      if (currentStep() === 'business') {
        setStage('form'); // reloaded on the business step: stay there, with a link back to the results
        return;
      }
      setStage('running');
      if (currentStep() !== 'results') {
        markStep('business', false);
        markStep('results', true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Back and Forward move between the business step and the results. Entries without a step
  // (for example an in-page link) are ignored, so they never reset the check.
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const step = (event.state as StepEntry | null)?.vcStep;
      if (step === 'business') setStage('form');
      if (step === 'results') {
        setCheck((c) => c ?? loadResult()?.check ?? null);
        setStage('running');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Save the public result once every check has finished, and again after a keyword comparison.
  useEffect(() => {
    if (check && isFinished(check)) saveResult(check, ticket);
  }, [check, ticket]);

  const showResults = () => {
    setStage('running');
    markStep('results', true);
  };

  const startNewCheck = () => {
    clearResult();
    setCheck(null);
    setTicket(null);
    setRestored(false);
    setContact(null);
    setContactError(null);
    setContactState((st) => ({ ...initialContact(), country: st.country }));
    setPreview(null);
    setManual(false);
    setError('');
    setTurnstileToken('');
    setSessionToken(newToken());
    setStage('form');
    markStep('business', true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Turnstile only when the server has both keys.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/visibility/config').then((r) => r.json()).then((c: { turnstileSiteKey?: string | null; country?: string | null }) => {
      if (cancelled) return;
      if (c.turnstileSiteKey) setTurnstileKey(c.turnstileSiteKey);
      // Until a business is picked, the phone country follows the visitor's country.
      const visitor = findCountry(c.country);
      if (visitor) setContactState((st) => (st.countryTouched ? st : { ...st, country: visitor }));
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
    if (data.place) {
      setPreview(data.place);
      setContactState((st) => withBusinessCountry(st, data.place?.countryCode));
    }
    else setError(errorText[data.error ?? ''] ?? 'That business couldn’t be loaded. Please try again.');
  };

  const onUnavailable = useCallback(() => {
    setSearchUnavailable(true);
    setManual(true);
  }, []);

  const runChecks = async (ticket: string, base: CheckState) => {
    setCheck(base);
    setTicket(ticket);
    setRestored(false);
    setStage('running');
    markStep('results', true);
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
    if (inFlight.current) return; // ignore double clicks and repeated Enter while a check is starting or running
    setError('');
    const form = new FormData(event.currentTarget);
    const keyword = String(form.get('keyword') ?? '').trim();
    if (!formRef.current?.reportValidity()) return;
    if (!manual && !preview) {
      setError('Please pick your business from the suggestions, or choose “My business isn’t listed”.');
      return;
    }
    let visitor: Contact | null = null;
    if (REQUIRE_CONTACT_BEFORE_REPORT) {
      const checked = checkContact(contactState);
      if (!checked.ok) {
        setContactError({ field: checked.field, message: checked.error });
        document.getElementById(CONTACT_FIELD_IDS[checked.field])?.focus();
        return;
      }
      setContactError(null);
      if (checked.country && checked.country.code !== contactState.country.code) setContactState({ ...contactState, country: checked.country });
      visitor = checked.contact;
    }
    if (turnstileKey && !turnstileToken) {
      setError(errorText.verification);
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    const payload = {
      mode: manual ? 'manual' : 'place',
      placeId: preview?.placeId,
      name: String(form.get('manualName') ?? ''),
      town: String(form.get('manualTown') ?? ''),
      website: String(form.get('manualWebsite') ?? ''),
      keyword,
      ...(visitor ? { channel: visitor.channel, email: visitor.email, whatsapp: visitor.whatsapp, consent: true, tips: visitor.tips } : {}),
      company_url: String(form.get('company_url') ?? ''),
      turnstileToken,
    };
    const data = await post<{ ticket?: string; profile?: Profile | null; website?: string | null; social?: string | null }>('start', payload);
    setSubmitting(false);
    if (!data.ticket) {
      inFlight.current = false;
      setError(errorText[data.error ?? ''] ?? 'Something went wrong. Please try again.');
      return;
    }
    setContact(visitor);
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
    inFlight.current = false;
  };

  if (stage === 'running' && check) {
    const onCompare = async (keyword: string) => {
      if (!ticket) return;
      const d = await post<{ competitors?: Competitor[]; query?: string }>('competitors', { ticket, keyword });
      setCheck((c) => (c ? { ...c, competitors: d.skipped ? { state: 'skipped', reason: d.skipped } : d.error ? { state: 'failed', reason: d.error } : { state: 'done', data: { rows: d.competitors ?? [], query: d.query } } } : c));
    };
    return <ResultView check={check} ticket={ticket} headingRef={resultsRef} onCompare={onCompare} restored={restored} onNewCheck={startNewCheck} contact={contact} onContact={setContact} />;
  }

  return (
    <div className="ic-page">
      <StepBar steps={[{ label: 'Your business', state: 'current' }, { label: 'Your results', state: 'upcoming' }, { label: 'Full report', state: 'upcoming' }]} />

      <header className="ic-hero">
        <p className="ic-hero-label">Step 1 of 3 · Your business</p>
        <h1>See how your business shows up online.</h1>
        <p>Find your business to run automated checks of your public Google profile and website, then see the top fixes in plain words. Your report appears on this page, and you can save it as a PDF.</p>
        {check && isFinished(check) ? (
          <div className="ic-resume">
            <button className="button button-dark" type="button" onClick={showResults}>Back to your results for {check.businessName} <Arrow /></button>
            <button className="vc-back" type="button" onClick={startNewCheck}>Start a new check</button>
          </div>
        ) : null}
      </header>

      <form className="ic-card ic-form" ref={formRef} onSubmit={onSubmit} noValidate={false}>
        {!manual ? (
          preview ? (
            <div className="ic-confirm" role="group" aria-labelledby="ic-confirm-title">
              <p className="ic-confirm-title" id="ic-confirm-title">Is this you?</p>
              <strong>{preview.name}</strong>
              <span className="ic-confirm-line"><Icon name="pin" size={16} />{preview.address}</span>
              <span className="ic-confirm-line"><Icon name="star" size={16} />{[preview.category, preview.rating ? `${preview.rating} from ${formatCount(preview.reviewCount ?? 0)} reviews on Google` : 'No rating yet'].filter(Boolean).join(' · ')}</span>
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
            {searchUnavailable ? <p className="ic-hint">Business search isn’t available right now, so please enter your details. The check will still look at your website.</p> : null}
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

        <label htmlFor="ic-what">What do you do? (optional)</label>
        <div className="ic-field"><Icon name="search" /><input id="ic-what" name="keyword" type="text" maxLength={40} autoComplete="off" aria-describedby="ic-what-hint" /></div>
        <p className="ic-hint" id="ic-what-hint">For example plumber, hair salon or restaurant. The check uses it to compare you with similar businesses nearby.</p>
        <div className="ic-honeypot" aria-hidden="true">
          <label htmlFor="ic-company-url">Leave this empty</label>
          <input id="ic-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
        </div>
        {REQUIRE_CONTACT_BEFORE_REPORT ? <ContactFields value={contactState} onChange={(next) => { setContactState(next); setContactError(null); }} error={contactError} /> : null}

        {turnstileKey ? <div ref={turnstileRef} className="ic-turnstile" /> : null}

        {error ? <p className="ic-error" role="alert">{error}</p> : null}
        <button className="button button-growth ic-submit" type="submit" disabled={submitting} aria-disabled={submitting}>
          {submitting ? 'Starting your check…' : 'Show my report'} <Arrow />
        </button>
        <p className="vc-note">Automated checks of public information only. I don’t store the Google data or page content the check looks at. <Link href="/privacy-policy">Privacy policy</Link></p>
      </form>
    </div>
  );
}
