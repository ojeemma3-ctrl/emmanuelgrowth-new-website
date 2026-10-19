'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { CONTACT_TOPICS, HELP_LINK, PLAN_LINKS } from '../../lib/check-config';
import { offerFor, type Offer } from '../../lib/check-offers';
import { BASELINE_LABEL, displayPriority, fixSteps, formatCount, isMeasured } from '../../lib/check-standard';
import { useHomeInteractions } from '../home/HomeInteractions';
import { contactEmail, whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { competitorArea, consistencyArea, contactArea, notChecked, profileArea, reviewStats, searchArea, speedArea, speedNote, topFixes, UNFAIR_COMPARISON, websiteArea, type Area, type RuleResult, type Status } from './findings';
import type { CheckState } from './InstantCheck';
import { Icon, Ring, StatusChip, StepBar, type IconName } from './ui';
import type { Contact } from './ContactFields';

// WhatsApp number from site config, shown on the PDF cover as +44 7575 416197.
const whatsappDisplay = `+${whatsappNumber.slice(0, 2)} ${whatsappNumber.slice(2, 6)} ${whatsappNumber.slice(6)}`;

// "Download PDF": the browser's own print window, where the visitor picks "Save as PDF".
// The PDF is made in the visitor's browser; nothing is sent to a server. Closed area sections
// are opened for printing and closed again afterwards; the file name follows the page title.
function printReport(business: string) {
  const closed = [...document.querySelectorAll<HTMLDetailsElement>('.ic-area:not([open])')];
  const title = document.title;
  closed.forEach((d) => { d.open = true; });
  document.title = `Visibility check - ${business} - ${new Date().toISOString().slice(0, 10)}`;
  window.addEventListener('afterprint', () => {
    closed.forEach((d) => { d.open = false; });
    document.title = title;
  }, { once: true });
  window.print();
}

function PdfButton({ business }: { business: string }) {
  return (
    <div className="ic-pdf">
      <button className="button button-dark" type="button" onClick={() => printReport(business)}><Icon name="download" size={18} />Download PDF</button>
      <p className="ic-hint">Opens your browser’s print window. Choose “Save as PDF” as the printer.</p>
    </div>
  );
}

// Small tag next to a fix: a plan page, or the contact box with a topic. In the PDF: "Covered by: …".
function OfferTag({ offer }: { offer: Offer | null }) {
  const { openContact } = useHomeInteractions();
  if (!offer) return null;
  return (
    <span className="ic-offer">
      {offer.kind === 'link'
        ? <a className="ic-offer-tag" href={offer.href}>{offer.label}</a>
        : <button className="ic-offer-tag" type="button" aria-haspopup="dialog" onClick={() => openContact(offer.topic)}>{offer.label}</button>}
      <span className="ic-offer-print">Covered by: {offer.covers}</span>
    </span>
  );
}

// "How to fix this": free steps, collapsed by default, on screen only.
function FixSteps({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const steps = fixSteps[id];
  if (!steps?.length) return null;
  return (
    <div className="ic-howto">
      <button className="ic-howto-toggle" type="button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)}>
        How to fix this <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <ol className="ic-howto-steps" id={listId} hidden={!open}>
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
    </div>
  );
}

// Closing block, after the Top 3 and at the end of the report.
function ClosingBlock({ realWebsite, id }: { realWebsite: boolean; id: string }) {
  const { openContact } = useHomeInteractions();
  return (
    <section className="ic-block ic-closing" aria-labelledby={id}>
      {realWebsite ? (
        <p className="ic-closing-text"><strong id={id}>These fixes work together.</strong> A faster website, more reviews and quicker replies each help. Together they turn searches into customers.</p>
      ) : (
        <p className="ic-closing-text"><strong id={id}>A simple website is the first step,</strong> then reviews and quick replies.</p>
      )}
      <p className="ic-closing-contact">Questions about this report? Email {contactEmail} or WhatsApp {whatsappDisplay}.</p>
      <div className="ic-closing-actions">
        {realWebsite
          ? <a className="button button-growth" href={HELP_LINK}>See how I can help <Arrow /></a>
          : <a className="button button-growth" href={PLAN_LINKS.getFound}>See how I build it <Arrow /></a>}
        <button className="button button-outline" type="button" aria-haspopup="dialog" onClick={() => openContact(CONTACT_TOPICS.personalReview)}>Get a free personal review</button>
        <button className="ic-closing-talk" type="button" aria-haspopup="dialog" onClick={() => openContact()}>Talk to me directly</button>
      </div>
    </section>
  );
}

// Switch to true once the /guides/[rule-id] pages exist; until then there is no "Learn how" link.
const GUIDES_PUBLISHED = false;


// Only rules we actually measured count towards "checks passed".
const measured = (r: RuleResult) => r.rule.mode === 'automatic' && isMeasured(r.status);

function ProgressItem({ label, state }: { label: string; state: 'waiting' | 'done' | 'skipped' | 'failed' }) {
  const text = { waiting: 'Checking…', done: 'Done', skipped: 'Not applicable', failed: 'Could not check' }[state];
  return <li className={`ic-progress-item is-${state}`}><span aria-hidden="true" />{label}<em>{text}</em></li>;
}

function Finding({ result }: { result: RuleResult }) {
  const { rule, status, value } = result;
  return (
    <div className="ic-finding">
      <div className="ic-finding-head">
        <strong>{rule.label}</strong>
        <StatusChip status={status} />
      </div>
      <dl>
        <dt>What we found</dt>
        <dd>{value}</dd>
        <dt>Why it matters</dt>
        <dd>{rule.why}</dd>
        {displayPriority(rule, status) ? (
          <>
            <dt>Priority and effort</dt>
            <dd>{displayPriority(rule, status)} · {rule.effort} (rough estimate)</dd>
          </>
        ) : null}
      </dl>
      {rule.mode === 'automatic' ? <p className="ic-baseline">Good means: {rule.thresholds.good.toLowerCase()}.{rule.baseline ? ` ${BASELINE_LABEL}` : ''}</p> : null}
      {rule.note ? <p className="ic-baseline">{rule.note}</p> : null}
      {GUIDES_PUBLISHED ? <a className="ic-learn" href={`/guides/${rule.id}`}>Learn how <Arrow /></a> : null}
    </div>
  );
}

function AreaCard({ area }: { area: Area }) {
  return (
    <details className="ic-area">
      <summary>
        <span className="ic-area-head">
          <strong>{area.title}</strong>
          <StatusChip status={area.status} />
        </span>
        <span className="ic-area-line">{area.line}</span>
      </summary>
      <div className="ic-area-body">
        {area.results.length ? (
          <>
            {area.results.map((r) => <Finding result={r} key={r.rule.id} />)}
            {area.extra.length ? (
              <>
                <h4>Also found</h4>
                <ul>{area.extra.map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            ) : null}
          </>
        ) : (
          <>
            <h4>What we found</h4>
            <ul>{area.found.map((f) => <li key={f}>{f}</li>)}</ul>
            <h4>Why it matters</h4>
            <p>{area.why}</p>
          </>
        )}
      </div>
    </details>
  );
}

type TileData = { title: string; icon: IconName; status: Status | null; statusLabel?: string; figure: string; passed: number; total: number; problems?: number; attention?: number; sources: string[] };

// "1 problem, 6 checks passed": issues first, then passes.
function countLine(t: TileData) {
  const parts = [
    t.problems ? `${t.problems} problem${t.problems === 1 ? '' : 's'}` : '',
    t.attention ? `${t.attention} need${t.attention === 1 ? 's' : ''} attention` : '',
    `${t.passed} check${t.passed === 1 ? '' : 's'} passed`,
  ].filter(Boolean);
  return parts.join(', ');
}

// Bar colour follows the share of checks passed, so one problem among many passes isn't shown as red.
const ratioClass = (share: number) => (share >= 0.8 ? 'is-good' : share >= 0.5 ? 'is-attention' : 'is-problem');

function Tile({ tile }: { tile: TileData }) {
  const share = tile.total ? tile.passed / tile.total : 0;
  return (
    <article className="ic-tile">
      <div className="ic-tile-head">
        <span className="ic-tile-title"><Icon name={tile.icon} />{tile.title}</span>
        {tile.status ? <StatusChip status={tile.status} label={tile.statusLabel} /> : null}
      </div>
      <p className="ic-tile-figure">{tile.figure}</p>
      {tile.total ? (
        <>
          <div className={`ic-bar ${ratioClass(share)}`} aria-hidden="true"><span style={{ width: `${Math.round(share * 100)}%` }} /></div>
          <p className="ic-tile-count">{countLine(tile)}</p>
        </>
      ) : null}
      {tile.sources.length ? <p className="ic-source">{tile.sources.join(' · ')}</p> : null}
    </article>
  );
}

export function ResultView({ check, ticket, headingRef, onCompare, restored = false, onNewCheck, contact }: {
  check: CheckState;
  restored?: boolean; // shown again from this tab's saved copy
  onNewCheck: () => void;
  onCompare?: (keyword: string) => Promise<void>;
  ticket: string | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  contact: Contact | null; // from step 1, in memory only; null after a refresh or when contact isn't required
}) {
  const business = check.businessName;
  const profile = check.profile;
  const hasWebsite = Boolean(check.website);
  const noRealWebsite = !hasWebsite || Boolean(check.social);
  const site = check.site.state === 'done' ? check.site.data : null;
  const speed = check.speed.state === 'done' ? check.speed.data : null;
  const competitorRows = check.competitors.state === 'done' ? check.competitors.data : null;
  const allDone = [check.competitors, check.site, check.speed].every((l) => l.state !== 'waiting');
  const [nearbyView, setNearbyView] = useState<'table' | 'cards'>('table');
  const [reachedReport, setReachedReport] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [comparing, setComparing] = useState(false);
  const skippedReason = check.competitors.state === 'skipped' ? check.competitors.reason : check.competitors.state === 'failed' ? 'failed' : null;

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const areas: Area[] = [
    profileArea(profile, check.social),
    competitorArea(profile, check.competitors),
    websiteArea(check.site, hasWebsite, check.social, Boolean(profile)),
    contactArea(site, profile),
    searchArea(site),
    speedArea(check.speed, today),
    consistencyArea(profile, site),
  ].filter((a): a is Area => Boolean(a));
  const byId = Object.fromEntries(areas.map((a) => [a.id, a])) as Record<string, Area | undefined>;

  // With no real website, the "No website found" section replaces the website card.
  const cards = noRealWebsite ? areas.filter((a) => a.id !== 'website') : areas;
  const fixes = topFixes(areas);
  const stats = profile && competitorRows?.rows.length ? reviewStats(profile.reviewCount ?? 0, competitorRows.rows) : null;

  const allResults = areas.flatMap((a) => a.results).filter(measured);
  const passed = allResults.filter((r) => r.status === 'Good').length;
  const working = allResults.filter((r) => r.status === 'Good');
  const toFix = allResults.filter((r) => r.status === 'Problem' || r.status === 'Needs attention');
  // Without a Google profile there is no website rule, so the website line is listed on its own.
  const websiteNote = noRealWebsite && !profile ? byId.website?.line : undefined;

  const counts = (area?: Area) => {
    const m = (area?.results ?? []).filter(measured);
    return { passed: m.filter((r) => r.status === 'Good').length, total: m.length, problems: m.filter((r) => r.status === 'Problem').length, attention: m.filter((r) => r.status === 'Needs attention').length };
  };
  const value = (area: Area | undefined, ruleId: string) => area?.results.find((r) => r.rule.id === ruleId)?.value;

  const websiteArea_ = byId.website;
  const speedArea_ = byId.speed;
  const sum = (a: ReturnType<typeof counts>, b: ReturnType<typeof counts>) => ({ passed: a.passed + b.passed, total: a.total + b.total, problems: a.problems + b.problems, attention: a.attention + b.attention });
  const websiteCounts = sum(counts(websiteArea_), counts(speedArea_));
  const worse = (a?: Status, b?: Status): Status | null => {
    const rank: Record<string, number> = { Problem: 3, 'Needs attention': 2, Good: 1, 'Couldn’t check': 0, 'Couldn’t compare fairly': 0, 'Not checked automatically': 0 };
    if (!a && !b) return null;
    if (!a) return b ?? null;
    if (!b) return a;
    return rank[a] >= rank[b] ? a : b;
  };

  const tiles: TileData[] = [
    {
      title: 'Google profile', icon: 'pin', status: profile ? byId.profile?.status ?? null : 'Problem',
      figure: profile ? byId.profile?.line ?? '' : 'No Google business profile was selected.',
      ...counts(byId.profile), sources: profile ? ['From Google Maps'] : [],
    },
    {
      title: 'Reviews', icon: 'star', status: byId.reviews?.status ?? null,
      figure: profile ? (stats && stats.fair ? `${formatCount(profile.reviewCount ?? 0)} reviews, typically ${formatCount(stats.typical)} nearby${profile.rating ? ` · rated ${profile.rating}` : ''}` : `${formatCount(profile.reviewCount ?? 0)} reviews${profile.rating ? ` · rated ${profile.rating}` : ''}`) : 'No Google profile to read reviews from.',
      ...counts(byId.reviews), sources: profile ? ['From Google Maps'] : [],
    },
    noRealWebsite ? {
      title: 'Website', icon: 'globe', status: 'Needs attention',
      figure: byId.website?.line ?? 'No website found.', passed: 0, total: 0,
      sources: check.social && profile ? ['From Google Maps'] : [],
    } : {
      title: 'Website', icon: 'globe', status: worse(websiteArea_?.status, speedArea_?.status),
      figure: [websiteArea_ ? websiteArea_.line : 'Checking your website…', speed?.scores.performance !== undefined ? `Mobile speed ${speed.scores.performance} out of 100. ${speedNote(speed, today)}` : null, site ? `Page tested: ${site.finalUrl}` : null].filter(Boolean).join(' '),
      ...websiteCounts,
      sources: [site ? 'From your website' : null, speed?.scores.performance !== undefined ? 'From Google PageSpeed' : null].filter((x): x is string => Boolean(x)),
    },
    noRealWebsite || !byId.contact ? {
      title: 'Contact', icon: 'phone', status: 'Couldn’t check', statusLabel: noRealWebsite ? 'No website' : 'Couldn’t check',
      figure: noRealWebsite ? 'There’s no website to check for contact buttons.' : 'We couldn’t read your website for contact links.', passed: 0, total: 0, sources: [],
    } : {
      title: 'Contact', icon: 'phone', status: byId.contact.status,
      figure: byId.contact.status === 'Good' ? `Tap to call, WhatsApp or book: ${value(byId.contact, 'contact-links')}.` : value(byId.contact, 'contact-links') ?? '',
      ...counts(byId.contact), sources: ['From your website'],
    },
    noRealWebsite || !byId.search ? {
      title: 'AI readiness', icon: 'spark', status: 'Couldn’t check', statusLabel: noRealWebsite ? 'No website' : 'Couldn’t check',
      figure: noRealWebsite ? 'AI assistants have no website of yours to read.' : 'We couldn’t read your website for these signals.', passed: 0, total: 0, sources: [],
    } : {
      title: 'AI readiness', icon: 'spark', status: byId.search.status,
      figure: `AI assistants: ${value(byId.search, 'search-ai-crawlers') ?? '–'}. Business details markup: ${value(byId.search, 'search-schema') ?? '–'}.`,
      ...counts(byId.search), sources: ['From your website'],
    },
  ];

  // Bring the result into view and move focus to it once, when it first appears.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);

  // Step bar: "Full report" is done once the visitor has scrolled to it.
  useEffect(() => {
    const report = document.getElementById('ic-full');
    if (!report || reachedReport || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setReachedReport(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(report);
    return () => observer.disconnect();
  }, [reachedReport]);

  // Send the lead once, when every check has finished (not when a saved result is shown again).
  // The visitor never sees an error from this.
  const leadSent = useRef(false);
  useEffect(() => {
    if (!allDone || !contact || !ticket || leadSent.current) return;
    leadSent.current = true;
    const body = {
      ticket, ...contact, consent: true,
      statuses: Object.fromEntries(areas.map((a) => [a.title, a.status])),
      topFixes: fixes.map((f) => f.text),
    };
    void fetch('/api/visibility/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => undefined);
  });

  return (
    <div className="ic-page ic-results">
      <section className="ic-print-cover" aria-hidden="true">
          <div className="ic-print-brand">
            <Image src="/favicon.svg" alt="" width={56} height={56} />
            <span>EMMANUEL <b>GROWTH</b></span>
          </div>
          <p className="ic-print-kicker">Visibility check report</p>
          <h1>{business}</h1>
          {profile ? <p>{profile.address}</p> : null}
          <p>{today}</p>
          <p className="ic-print-note">Automated checks of public information</p>
          <div className="ic-print-contact">
            <p>Questions about this report?</p>
            <p>Email: {contactEmail}</p>
            <p>WhatsApp: {whatsappDisplay}</p>
          </div>
        </section>

      <StepBar steps={[
        { label: 'Your business', state: 'done' },
        { label: 'Your results', state: reachedReport ? 'done' : 'current', href: '#ic-top' },
        { label: 'Full report', state: reachedReport ? 'done' : 'upcoming', href: '#ic-full' },
      ]} />

      <div className="ic-result-actions">
        {restored ? <p className="ic-hint">Showing your saved results from earlier in this tab.</p> : null}
        <button className="vc-back" type="button" onClick={onNewCheck}>Start a new check</button>
      </div>

      <header className="ic-hero ic-result-hero" id="ic-top">
        <div className="ic-result-main">
          <p className="ic-hero-label">Automated checks of public information on {today}</p>
          <h1 tabIndex={-1} ref={headingRef}>{business}</h1>
          {profile ? (
            <>
              <ul className="ic-chips" aria-label="From your Google profile">
                {profile.category ? <li>{profile.category}</li> : null}
                {profile.businessStatus === 'OPERATIONAL' ? <li>Operating</li> : null}
              </ul>
              <p className="ic-address"><Icon name="pin" size={16} />{profile.address}</p>
              {profile.mapsUrl ? <a className="ic-maps-link" href={profile.mapsUrl} target="_blank" rel="noreferrer">View on Maps <Icon name="external" size={14} /></a> : null}
            </>
          ) : <p className="ic-address">Entered by you, not selected from Google.</p>}
        </div>
        <div className="ic-result-score">
          <Ring passed={passed} total={allResults.length} />
          <div>
            <p><strong>{passed} of {allResults.length} checks passed</strong>{allDone ? '' : ' so far'}</p>
            <p className="ic-score-note">Counts only the checks we could run automatically.</p>
          </div>
        </div>
      </header>

      {!allDone ? (
        <ul className="ic-progress" aria-live="polite" aria-label="Checks running">
          <ProgressItem label="Google business profile" state={profile ? 'done' : 'skipped'} />
          <ProgressItem label="Nearby businesses" state={check.competitors.state} />
          <ProgressItem label="Website checks" state={check.site.state} />
          <ProgressItem label="Website speed (Google PageSpeed)" state={check.speed.state} />
        </ul>
      ) : null}

      <section className="ic-block" aria-labelledby="ic-fixes">
        <h2 id="ic-fixes">Top 3 fixes</h2>
        {allDone ? (
          fixes.length ? (
            <ol className="ic-fix-cards">
              {fixes.map((f, i) => (
                <li className="ic-fix-card" key={f.key}>
                  <div className="ic-fix-meta">
                    <span className="ic-fix-num" aria-hidden="true">{i + 1}</span>
                    {f.priority ? <span className={`ic-priority is-${f.priority.toLowerCase().replace(' ', '-')}`}>{f.priority}</span> : null}
                  </div>
                  <p className="ic-fix-text">{f.text}</p>
                  {f.rule ? <p className="ic-fix-effort">Effort: {f.rule.effort} (rough estimate)</p> : null}
                  <OfferTag offer={offerFor(f.key === 'reviews' || f.key === 'website' ? f.key : f.rule?.id ?? f.key, !noRealWebsite)} />
                  <FixSteps id={f.rule?.id ?? f.key} />
                </li>
              ))}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>
        ) : <p className="ic-hint">Working out your top fixes as the checks finish…</p>}
      </section>

      {allDone ? <ClosingBlock realWebsite={!noRealWebsite} id="ic-closing-top" /> : null}

      {allDone ? (
        <section className="ic-block" aria-labelledby="ic-statuses">
          <h2 id="ic-statuses">Area statuses</h2>
          <ul className="ic-status-list">
            {areas.map((a) => <li key={a.id}><span>{a.title}</span><StatusChip status={a.status} /></li>)}
          </ul>
        </section>
      ) : null}

      {profile && onCompare && (skippedReason === 'generic_category' || skippedReason === 'too_few' || skippedReason === 'failed') ? (
        <section className="ic-block ic-panel ic-neutral" aria-labelledby="ic-compare-skip">
          <h2 id="ic-compare-skip">Nearby businesses on Google</h2>
          <p>{skippedReason === 'generic_category' ? 'Couldn’t compare: your Google category is very general.' : skippedReason === 'failed' ? 'Couldn’t compare: the nearby search didn’t respond.' : 'Couldn’t compare: we found fewer than 3 similar businesses nearby.'} Tell us what you do and we’ll search for similar businesses near you.</p>
          <form className="ic-compare-form" onSubmit={async (e) => { e.preventDefault(); if (!keyword.trim()) return; setComparing(true); await onCompare(keyword.trim()); setComparing(false); }}>
            <label htmlFor="ic-keyword">What do you do? (for example plumber, spa, restaurant)</label>
            <div className="ic-compare-row">
              <div className="ic-field"><Icon name="search" /><input id="ic-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={40} autoComplete="off" /></div>
              <button className="button button-dark" type="submit" disabled={comparing}>{comparing ? 'Searching…' : 'Compare'}</button>
            </div>
          </form>
        </section>
      ) : null}

      <>
          <div className="ic-full-head" id="ic-full">
            <h2>Your full report</h2>
            <PdfButton business={business} />
          </div>

        <section className="ic-block" aria-labelledby="ic-overview">
          <h2 id="ic-overview">At a glance</h2>
          <div className="ic-tiles">{tiles.map((t) => <Tile tile={t} key={t.title} />)}</div>
        </section>

        {allDone && (working.length || toFix.length || websiteNote) ? (
          <section className="ic-block ic-split" aria-label="What’s working and what to fix">
            <div className="ic-split-col is-working">
              <h2><Icon name="check" />What’s working</h2>
              {working.length ? <ul>{working.map((r) => <li key={r.rule.id}><strong>{r.rule.label}:</strong> {r.value}</li>)}</ul> : <p>Nothing passed in the checks we could run.</p>}
            </div>
            <div className="ic-split-col is-fix">
              <h2><Icon name="alert" />What to fix</h2>
              {toFix.length || websiteNote ? (
                <ul>
                  {websiteNote ? <li><strong>Website:</strong> {websiteNote} <OfferTag offer={offerFor('website', false)} /><FixSteps id="gbp-website" /></li> : null}
                  {toFix.map((r) => <li key={r.rule.id}><strong>{r.rule.label}:</strong> {r.value} <StatusChip status={r.status} /> <OfferTag offer={offerFor(r.rule.id, !noRealWebsite)} /><FixSteps id={r.rule.id} /></li>)}
                </ul>
              ) : <p>Nothing to fix in the checks we could run.</p>}
            </div>
          </section>
        ) : null}

        {noRealWebsite ? (
          <section className="ic-block ic-panel" aria-labelledby="ic-no-website">
            <h2 id="ic-no-website">No website found</h2>
            {check.social ? <p>{profile ? `Your Google profile links to ${check.social}, not a website.` : `The address you gave is a ${check.social} page, not a website.`} {check.social} can be a good place to show your work, so we skipped the website checks and speed test rather than test {check.social}’s own site.</p> : <p>We didn’t find a website for this business, so the website checks were skipped.</p>}
            <p>Customers can still find you on Google Maps. A website helps by giving Google and AI assistants a page to read about your services and location, and by giving customers one place to see your work, prices and contact options. It may also make it easier for people who find you elsewhere to get in touch.</p>
          </section>
        ) : null}

        {competitorRows && profile && competitorRows.rows.length && stats ? (
          <section className="ic-block ic-panel" aria-labelledby="ic-compare">
            <div className="ic-panel-head">
              <div>
                <h2 id="ic-compare">Nearby businesses on Google</h2>
                <p>Similar businesses nearby typically have <strong>{formatCount(stats.typical)} reviews</strong> (from {formatCount(stats.min)} to {formatCount(stats.max)}). {stats.fair ? `By review count, ${profile.name} ranks ${stats.rank} of ${stats.of}.` : null}</p>
              {stats.fair ? null : <p className="ic-unfair"><StatusChip status="Couldn’t compare fairly" /> {UNFAIR_COMPARISON}</p>}
              </div>
              <div className="ic-toggle" role="group" aria-label="Show nearby businesses as">
                <button type="button" aria-pressed={nearbyView === 'table'} onClick={() => setNearbyView('table')}><Icon name="table" size={16} />Table</button>
                <button type="button" aria-pressed={nearbyView === 'cards'} onClick={() => setNearbyView('cards')}><Icon name="cards" size={16} />Cards</button>
              </div>
            </div>
            <p className="ic-source">From Google Maps · one search for “{competitorRows.query}”, shown as Google returned them</p>
            {nearbyView === 'table' ? (
              <div className="ic-table-wrap">
                <table className="ic-table">
                  <thead><tr><th scope="col">Business</th><th scope="col">Rating</th><th scope="col">Reviews</th><th scope="col">Website listed</th></tr></thead>
                  <tbody>
                    <tr className="is-you"><th scope="row">{profile.name} <span className="ic-you">You</span></th><td>{profile.rating ?? '–'}</td><td>{formatCount(profile.reviewCount ?? 0)}</td><td>{profile.website ? (check.social ? `${check.social} page` : 'Yes') : 'No'}</td></tr>
                    {competitorRows.rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.rating ?? '–'}</td><td>{formatCount(r.reviewCount ?? 0)}</td><td>{r.hasWebsite ? 'Yes' : 'No'}</td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="ic-nearby-cards">
                <li className="is-you"><strong>{profile.name} <span className="ic-you">You</span></strong><span>Rating {profile.rating ?? '–'}</span><span>{formatCount(profile.reviewCount ?? 0)} reviews</span><span>Website: {profile.website ? (check.social ? `${check.social} page` : 'Yes') : 'No'}</span></li>
                {competitorRows.rows.map((r) => <li key={r.name}><strong>{r.name}</strong><span>Rating {r.rating ?? '–'}</span><span>{formatCount(r.reviewCount ?? 0)} reviews</span><span>Website: {r.hasWebsite ? 'Yes' : 'No'}</span></li>)}
              </ul>
            )}
          </section>
        ) : null}

        <section className="ic-block" aria-labelledby="ic-areas-title" id="ic-areas">
          <h2 id="ic-areas-title">Every check, by area</h2>
          <p className="ic-hint" id="ic-areas-hint">Open an area to see what we found, why it matters and how much effort it takes.</p>
          <div className="ic-areas">{cards.map((a) => <AreaCard area={a} key={a.id} />)}</div>
        </section>

        <section className="ic-block ic-panel ic-neutral" aria-labelledby="ic-not-checked">
          <h2 id="ic-not-checked">Not checked here</h2>
          <p>These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
        </section>

          <PdfButton business={business} />
        </>

      {allDone ? <ClosingBlock realWebsite={!noRealWebsite} id="ic-closing-end" /> : null}

      <div className="ic-cta">
        <button className="vc-back" type="button" onClick={onNewCheck}>Start a new check</button>
      </div>
    </div>
  );
}
