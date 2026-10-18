'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { BASELINE_LABEL } from '../../lib/check-standard';
import { whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { competitorArea, consistencyArea, contactArea, notChecked, profileArea, reviewStats, searchArea, speedArea, topFixes, websiteArea, type Area, type RuleResult } from './findings';
import type { CheckState } from './InstantCheck';

// Switch to true once the /guides/[rule-id] pages exist. Until then "Learn how" opens WhatsApp.
const GUIDES_PUBLISHED = false;

const statusClass = { Good: 'is-good', 'Needs attention': 'is-attention', Problem: 'is-problem', 'Couldn’t check': 'is-unknown', 'Not checked automatically': 'is-unknown' } as const;

const wa = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

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
        <span className={`ic-status ${statusClass[status]}`}>{status}</span>
      </div>
      <dl>
        <dt>What we found</dt>
        <dd>{value}</dd>
        <dt>Why it matters</dt>
        <dd>{rule.why}</dd>
        <dt>Priority and effort</dt>
        <dd>{rule.priority} · {rule.effort} (rough estimate)</dd>
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
          <span className={`ic-status ${statusClass[area.status]}`}>{area.status}</span>
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

export function ResultView({ check, ticket, contact, headingRef, whatsappHref }: {
  check: CheckState;
  ticket: string | null;
  contact: { email: string; whatsapp: string };
  headingRef: RefObject<HTMLHeadingElement | null>;
  whatsappHref: string;
}) {
  const business = check.businessName;
  const hasWebsite = Boolean(check.website);
  const noRealWebsite = !hasWebsite || Boolean(check.social);
  const site = check.site.state === 'done' ? check.site.data : null;
  const competitorRows = check.competitors.state === 'done' ? check.competitors.data : null;
  const allDone = [check.competitors, check.site, check.speed].every((l) => l.state !== 'waiting');

  const areas: Area[] = [
    profileArea(check.profile, check.social),
    competitorArea(check.profile, check.competitors),
    websiteArea(check.site, hasWebsite, check.social, Boolean(check.profile)),
    contactArea(site),
    searchArea(site),
    speedArea(check.speed),
    consistencyArea(check.profile, site),
  ].filter((a): a is Area => Boolean(a));

  // With no real website, the "No website found" section replaces the website card.
  const cards = noRealWebsite ? areas.filter((a) => a.id !== 'website') : areas;
  const fixes = topFixes(areas);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const stats = check.profile && competitorRows?.rows.length ? reviewStats(check.profile.reviewCount ?? 0, competitorRows.rows) : null;

  // Bring the result into view and move focus to it once, when it first appears.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);

  // Send the lead notification once, when every check has finished.
  const notified = useRef(false);
  useEffect(() => {
    if (!allDone || !ticket || notified.current) return;
    notified.current = true;
    const statuses = Object.fromEntries(areas.map((a) => [a.title, a.status]));
    void fetch('/api/visibility/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket, email: contact.email, whatsapp: contact.whatsapp, statuses }) }).catch(() => undefined);
  });

  return (
    <div className="ic-card ic-results">
      <p className="kicker">Automated checks of public information on {today}</p>
      <h1 className="vc-title" tabIndex={-1} ref={headingRef}>{business}</h1>

      <ul className="ic-progress" aria-live="polite" aria-label="Check progress">
        <ProgressItem label="Google business profile" state={check.profile ? 'done' : 'skipped'} />
        <ProgressItem label="Nearby businesses" state={check.competitors.state} />
        <ProgressItem label="Website checks" state={check.site.state} />
        <ProgressItem label="Website speed (Google PageSpeed)" state={check.speed.state} />
      </ul>

      <section className="ic-block" aria-labelledby="ic-fixes">
        <h2 id="ic-fixes">Top 3 fixes</h2>
        {allDone ? (
          fixes.length ? (
            <ol className="ic-fixes">
              {fixes.map((f) => (
                <li key={f.key}>
                  {f.text}
                  <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. Could you do this for me: ${f.text}?`)} target="_blank" rel="noreferrer">Want me to do this for you?</a>
                </li>
              ))}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>
        ) : <p className="ic-hint">Working out your top fixes as the checks finish…</p>}
      </section>

      {noRealWebsite ? (
        <section className="ic-block" aria-labelledby="ic-no-website">
          <h2 id="ic-no-website">No website found</h2>
          {check.social ? <p>{check.profile ? `Your Google profile links to ${check.social}, not a website.` : `The address you gave is a ${check.social} page, not a website.`} {check.social} can be a good place to show your work, so we skipped the website checks and speed test rather than test {check.social}’s own site.</p> : <p>We didn’t find a website for this business, so the website checks were skipped.</p>}
          <p>Customers can still find you on Google Maps. A website helps by giving Google and AI assistants a page to read about your services and location, and by giving customers one place to see your work, prices and contact options. It may also make it easier for people who find you elsewhere to get in touch.</p>
          <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. We don’t have a website yet. Could you build one for us?`)} target="_blank" rel="noreferrer">Want me to build it?</a>
        </section>
      ) : null}

      <section className="ic-block" aria-labelledby="ic-areas">
        <h2 id="ic-areas">By area</h2>
        <div className="ic-areas">{cards.map((a) => <AreaCard area={a} business={business} key={a.id} />)}</div>
      </section>

      {competitorRows && check.profile && competitorRows.rows.length && stats ? (
        <section className="ic-block" aria-labelledby="ic-compare">
          <h2 id="ic-compare">Nearby businesses on Google</h2>
          <p>Similar businesses nearby typically have {stats.typical} reviews (from {stats.min} to {stats.max}). By review count, {check.profile.name} ranks {stats.rank} of {stats.of}.</p>
          <p className="ic-hint">From one Google search for “{competitorRows.query}”. Shown as Google returned them.</p>
          <div className="ic-table-wrap">
            <table className="ic-table">
              <thead><tr><th scope="col">Business</th><th scope="col">Rating</th><th scope="col">Reviews</th><th scope="col">Website listed</th></tr></thead>
              <tbody>
                <tr className="is-you"><th scope="row">{check.profile.name} (you)</th><td>{check.profile.rating ?? '–'}</td><td>{check.profile.reviewCount ?? 0}</td><td>{check.profile.website ? (check.social ? `${check.social} page` : 'Yes') : 'No'}</td></tr>
                {competitorRows.rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.rating ?? '–'}</td><td>{r.reviewCount ?? 0}</td><td>{r.hasWebsite ? 'Yes' : 'No'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="ic-block" aria-labelledby="ic-not-checked">
        <h2 id="ic-not-checked">Not checked here</h2>
        <p>These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
      </section>

      <div className="ic-cta">
        <a className="ic-soft-link" href={wa(`Hi Emmanuel, I ran the visibility check for ${business}. Could you do these fixes for me?`)} target="_blank" rel="noreferrer">Want me to do this for you?</a>
        <a className="button button-growth" href={whatsappHref} target="_blank" rel="noreferrer">Want me to walk you through these fixes? Message me on WhatsApp <Arrow /></a>
      </div>
    </div>
  );
}
