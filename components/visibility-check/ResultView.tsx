'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { Arrow } from '../home/shared';
import { competitorArea, consistencyArea, contactArea, notChecked, profileArea, searchArea, speedArea, topFixes, websiteArea, type Area } from './findings';
import type { CheckState } from './InstantCheck';

const statusClass = { Good: 'is-good', 'Needs attention': 'is-attention', Problem: 'is-problem' } as const;

function ProgressItem({ label, state }: { label: string; state: 'waiting' | 'done' | 'skipped' | 'failed' }) {
  const text = { waiting: 'Checking…', done: 'Done', skipped: 'Not applicable', failed: 'Could not check' }[state];
  return <li className={`ic-progress-item is-${state}`}><span aria-hidden="true" />{label}<em>{text}</em></li>;
}

function AreaCard({ area }: { area: Area }) {
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
        <h4>What we found</h4>
        <ul>{area.found.map((f) => <li key={f}>{f}</li>)}</ul>
        <h4>Why it matters</h4>
        <p>{area.why}</p>
        <h4>How to fix it</h4>
        <p>{area.fix}</p>
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
  const hasWebsite = Boolean(check.website);
  const site = check.site.state === 'done' ? check.site.data : null;
  const speed = check.speed.state === 'done' ? check.speed.data : null;
  const competitorRows = check.competitors.state === 'done' ? check.competitors.data : null;
  const allDone = [check.competitors, check.site, check.speed].every((l) => l.state !== 'waiting');

  const areas: Area[] = [
    profileArea(check.profile),
    competitorArea(check.profile, competitorRows?.rows ?? null, competitorRows?.query),
    check.site.state === 'waiting' ? null : websiteArea(site, hasWebsite),
    contactArea(site),
    searchArea(site),
    speedArea(speed),
    consistencyArea(check.profile, site),
  ].filter((a): a is Area => Boolean(a));

  const fixes = topFixes(areas);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

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
      <h1 className="vc-title" tabIndex={-1} ref={headingRef}>{check.businessName}</h1>

      <ul className="ic-progress" aria-live="polite" aria-label="Check progress">
        <ProgressItem label="Google business profile" state={check.profile ? 'done' : 'skipped'} />
        <ProgressItem label="Nearby businesses" state={check.competitors.state} />
        <ProgressItem label="Website checks" state={check.site.state} />
        <ProgressItem label="Website speed (Google PageSpeed)" state={check.speed.state} />
      </ul>

      {!hasWebsite ? <p className="ic-callout">No website was found for this business, so the website checks were skipped. Your Google profile and the comparison are below.</p> : null}

      <section className="ic-block" aria-labelledby="ic-fixes">
        <h2 id="ic-fixes">Top 3 fixes</h2>
        {allDone ? (
          fixes.length ? <ol className="ic-fixes">{fixes.map((f) => <li key={f}>{f}</li>)}</ol> : <p>We didn’t find anything urgent in these checks.</p>
        ) : <p className="ic-hint">Working out your top fixes as the checks finish…</p>}
      </section>

      <section className="ic-block" aria-labelledby="ic-areas">
        <h2 id="ic-areas">By area</h2>
        <div className="ic-areas">{areas.map((a) => <AreaCard area={a} key={a.id} />)}</div>
      </section>

      {competitorRows && check.profile && competitorRows.rows.length ? (
        <section className="ic-block" aria-labelledby="ic-compare">
          <h2 id="ic-compare">Nearby businesses on Google</h2>
          <p className="ic-hint">From one Google search for “{competitorRows.query}”. Shown as Google returned them.</p>
          <div className="ic-table-wrap">
            <table className="ic-table">
              <thead><tr><th scope="col">Business</th><th scope="col">Rating</th><th scope="col">Reviews</th><th scope="col">Website listed</th></tr></thead>
              <tbody>
                <tr className="is-you"><th scope="row">{check.profile.name} (you)</th><td>{check.profile.rating ?? '–'}</td><td>{check.profile.reviewCount ?? 0}</td><td>{check.profile.website ? 'Yes' : 'No'}</td></tr>
                {competitorRows.rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.rating ?? '–'}</td><td>{r.reviewCount ?? 0}</td><td>{r.hasWebsite ? 'Yes' : 'No'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {check.speed.state === 'failed' ? <p className="ic-hint">Google’s speed test didn’t finish this time, so speed isn’t included.</p> : null}

      <section className="ic-block" aria-labelledby="ic-not-checked">
        <h2 id="ic-not-checked">Not checked here</h2>
        <p>These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
      </section>

      <div className="ic-cta">
        <a className="button button-growth" href={whatsappHref} target="_blank" rel="noreferrer">Want me to walk you through these fixes? Message me on WhatsApp <Arrow /></a>
      </div>
    </div>
  );
}
