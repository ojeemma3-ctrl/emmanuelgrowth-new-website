'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { BASELINE_LABEL } from '../../lib/check-standard';
import { whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { competitorArea, consistencyArea, contactArea, notChecked, profileArea, reviewStats, searchArea, speedArea, topFixes, websiteArea, type Area, type RuleResult, type Status } from './findings';
import type { CheckState } from './InstantCheck';
import { Icon, Ring, StatusChip, StepBar, type IconName } from './ui';

// Switch to true once the /guides/[rule-id] pages exist. Until then "Learn how" opens WhatsApp.
const GUIDES_PUBLISHED = false;

const wa = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

// Only rules we actually measured count towards "checks passed".
const measured = (r: RuleResult) => r.rule.mode === 'automatic' && r.status !== 'Couldn’t check' && r.status !== 'Not checked automatically';

function ProgressItem({ label, state }: { label: string; state: 'waiting' | 'done' | 'skipped' | 'failed' }) {
  const text = { waiting: 'Checking…', done: 'Done', skipped: 'Not applicable', failed: 'Could not check' }[state];
  return <li className={`ic-progress-item is-${state}`}><span aria-hidden="true" />{label}<em>{text}</em></li>;
}

function Finding({ result, business }: { result: RuleResult; business: string }) {
  const { rule, status, value } = result;
  const learnHref = GUIDES_PUBLISHED ? `/guides/${rule.id}` : wa(`Hi Emmanuel, I ran the visibility check for ${business}. Could you explain how to fix: ${rule.label}?`);
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
        {status === 'Problem' || status === 'Needs attention' ? (
          <>
            <dt>Priority and effort</dt>
            <dd>{rule.priority} · {rule.effort} (rough estimate)</dd>
          </>
        ) : null}
      </dl>
      {rule.mode === 'automatic' ? <p className="ic-baseline">Good means: {rule.thresholds.good.toLowerCase()}.{rule.baseline ? ` ${BASELINE_LABEL}` : ''}</p> : null}
      {rule.note ? <p className="ic-baseline">{rule.note}</p> : null}
      <a className="ic-learn" href={learnHref} {...(GUIDES_PUBLISHED ? {} : { target: '_blank', rel: 'noreferrer' })}>Learn how <Arrow /></a>
    </div>
  );
}

function AreaCard({ area, business }: { area: Area; business: string }) {
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
            {area.results.map((r) => <Finding result={r} business={business} key={r.rule.id} />)}
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

export function ResultView({ check, ticket, contact, headingRef, whatsappHref, onCompare, restored = false, onNewCheck }: {
  check: CheckState;
  restored?: boolean; // shown again from this tab's saved copy: no notification is sent
  onNewCheck: () => void;
  onCompare?: (keyword: string) => Promise<void>;
  ticket: string | null;
  contact: { email: string; whatsapp: string };
  headingRef: RefObject<HTMLHeadingElement | null>;
  whatsappHref: string;
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

  const areas: Area[] = [
    profileArea(profile, check.social),
    competitorArea(profile, check.competitors),
    websiteArea(check.site, hasWebsite, check.social, Boolean(profile)),
    contactArea(site, profile),
    searchArea(site),
    speedArea(check.speed),
    consistencyArea(profile, site),
  ].filter((a): a is Area => Boolean(a));
  const byId = Object.fromEntries(areas.map((a) => [a.id, a])) as Record<string, Area | undefined>;

  // With no real website, the "No website found" section replaces the website card.
  const cards = noRealWebsite ? areas.filter((a) => a.id !== 'website') : areas;
  const fixes = topFixes(areas);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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
    const rank: Record<string, number> = { Problem: 3, 'Needs attention': 2, Good: 1, 'Couldn’t check': 0, 'Not checked automatically': 0 };
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
      figure: profile ? (stats ? `${profile.reviewCount ?? 0} reviews, typically ${stats.typical} nearby${profile.rating ? ` · rated ${profile.rating}` : ''}` : `${profile.reviewCount ?? 0} reviews${profile.rating ? ` · rated ${profile.rating}` : ''}`) : 'No Google profile to read reviews from.',
      ...counts(byId.reviews), sources: profile ? ['From Google Maps'] : [],
    },
    noRealWebsite ? {
      title: 'Website', icon: 'globe', status: 'Needs attention',
      figure: byId.website?.line ?? 'No website found.', passed: 0, total: 0,
      sources: check.social && profile ? ['From Google Maps'] : [],
    } : {
      title: 'Website', icon: 'globe', status: worse(websiteArea_?.status, speedArea_?.status),
      figure: [websiteArea_ ? websiteArea_.line : 'Checking your website…', speed?.scores.performance !== undefined ? `Mobile speed ${speed.scores.performance} out of 100.` : null, site ? `Page tested: ${site.finalUrl}` : null].filter(Boolean).join(' '),
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

  useEffect(() => {
    const report = document.getElementById('ic-areas');
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

  // Bring the result into view and move focus to it once, when it first appears.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);

  // Send the lead notification once, when every check has finished.
  const notified = useRef(restored);
  useEffect(() => {
    if (!allDone || !ticket || notified.current) return;
    notified.current = true;
    const statuses = Object.fromEntries(areas.map((a) => [a.title, a.status]));
    void fetch('/api/visibility/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket, email: contact.email, whatsapp: contact.whatsapp, statuses }) }).catch(() => undefined);
  });

  return (
    <div className="ic-page ic-results">
      <StepBar steps={[
        { label: 'Your business', state: 'done' },
        { label: 'Your results', state: 'current', href: '#ic-top' },
        { label: 'Full report', state: reachedReport ? 'done' : 'upcoming', href: '#ic-areas' },
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
                    {f.rule ? <span className={`ic-priority is-${f.rule.priority.toLowerCase().replace(' ', '-')}`}>{f.rule.priority}</span> : null}
                  </div>
                  <p className="ic-fix-text">{f.text}</p>
                  {f.rule ? <p className="ic-fix-effort">Effort: {f.rule.effort} (rough estimate)</p> : null}
                  <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. Could you do this for me: ${f.text}?`)} target="_blank" rel="noreferrer">Want me to do this for you?</a>
                </li>
              ))}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>
        ) : <p className="ic-hint">Working out your top fixes as the checks finish…</p>}
      </section>

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
                {websiteNote ? <li><strong>Website:</strong> {websiteNote}</li> : null}
                {toFix.map((r) => <li key={r.rule.id}><strong>{r.rule.label}:</strong> {r.value} <StatusChip status={r.status} /></li>)}
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
          <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. We don’t have a website yet. Could you build one for us?`)} target="_blank" rel="noreferrer">Want me to build it?</a>
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

      {competitorRows && profile && competitorRows.rows.length && stats ? (
        <section className="ic-block ic-panel" aria-labelledby="ic-compare">
          <div className="ic-panel-head">
            <div>
              <h2 id="ic-compare">Nearby businesses on Google</h2>
              <p>Similar businesses nearby typically have <strong>{stats.typical} reviews</strong> (from {stats.min} to {stats.max}). By review count, {profile.name} ranks {stats.rank} of {stats.of}.</p>
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
                  <tr className="is-you"><th scope="row">{profile.name} <span className="ic-you">You</span></th><td>{profile.rating ?? '–'}</td><td>{profile.reviewCount ?? 0}</td><td>{profile.website ? (check.social ? `${check.social} page` : 'Yes') : 'No'}</td></tr>
                  {competitorRows.rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.rating ?? '–'}</td><td>{r.reviewCount ?? 0}</td><td>{r.hasWebsite ? 'Yes' : 'No'}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="ic-nearby-cards">
              <li className="is-you"><strong>{profile.name} <span className="ic-you">You</span></strong><span>Rating {profile.rating ?? '–'}</span><span>{profile.reviewCount ?? 0} reviews</span><span>Website: {profile.website ? (check.social ? `${check.social} page` : 'Yes') : 'No'}</span></li>
              {competitorRows.rows.map((r) => <li key={r.name}><strong>{r.name}</strong><span>Rating {r.rating ?? '–'}</span><span>{r.reviewCount ?? 0} reviews</span><span>Website: {r.hasWebsite ? 'Yes' : 'No'}</span></li>)}
            </ul>
          )}
        </section>
      ) : null}

      <section className="ic-block" aria-labelledby="ic-areas-title" id="ic-areas">
        <h2 id="ic-areas-title">Full report</h2>
        <p className="ic-hint" id="ic-areas-hint">Open an area to see what we found, why it matters and how much effort it takes.</p>
        <div className="ic-areas">{cards.map((a) => <AreaCard area={a} business={business} key={a.id} />)}</div>
      </section>

      <section className="ic-block ic-panel ic-neutral" aria-labelledby="ic-not-checked">
        <h2 id="ic-not-checked">Not checked here</h2>
        <p>These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
      </section>

      <div className="ic-cta">
        <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. Could you do these fixes for me?`)} target="_blank" rel="noreferrer">Want me to do this for you?</a>
        <a className="button button-growth" href={whatsappHref} target="_blank" rel="noreferrer">Want me to walk you through these fixes? Message me on WhatsApp <Arrow /></a>
        <button className="vc-back" type="button" onClick={onNewCheck}>Start a new check</button>
      </div>
    </div>
  );
}
