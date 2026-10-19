// The A4 PDF ("Download PDF" → the browser's print window). Shown only when printing; the on-screen
// report is separate. Six pages with fixed breaks: cover, summary, Google and reviews, website,
// contact / consistency / AI readiness, next steps. No toggles, buttons or free fix steps.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { offerFor } from '../../lib/check-offers';
import { formatCount, isMeasured, ruleById } from '../../lib/check-standard';
import { domainOf, notChecked, type RuleResult, type Status } from './findings';
import type { Card, Fix } from './ResultView';
import { Ring, StatusChip } from './ui';

const severity: Record<Status, number> = { Problem: 3, 'Needs attention': 2, Good: 1, 'Couldn’t check': 0, 'Couldn’t compare fairly': 0, 'Not checked automatically': 0 };
const longDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined);

// Worst measured status of a group of rows; "Couldn't check" when nothing in it was measured.
function worst(rows: RuleResult[]): Status {
  const measured = rows.filter((r) => r.rule.mode === 'automatic' && isMeasured(r.status));
  return measured.length ? measured.reduce<Status>((a, r) => (severity[r.status] > severity[a] ? r.status : a), 'Good') : 'Couldn’t check';
}

function Rows({ rows }: { rows: RuleResult[] }) {
  if (!rows.length) return null;
  return (
    <table className="icp-rows">
      <thead><tr><th scope="col">Check</th><th scope="col">What we found</th><th scope="col">Status</th></tr></thead>
      <tbody>
        {rows.map(({ rule, status, value }) => (
          <tr key={rule.id}>
            <th scope="row"><strong>{rule.displayName}</strong>{rule.technicalName ? <small>{rule.technicalName}</small> : null}</th>
            <td>{value === status ? '' : value}</td>
            <td><StatusChip status={status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Details({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <dl className="icp-details">
      {lines.map((line) => {
        const at = line.indexOf(': ');
        return <div key={line}>{at > 0 ? <><dt>{line.slice(0, at)}</dt><dd>{line.slice(at + 2)}</dd></> : <dd>{line}</dd>}</div>;
      })}
    </dl>
  );
}

// One area: heading with status, one-line summary, the page tested, rows and context lines.
function Block({ title, status, statusLabel, line, rows = [], details = [], text = [], pageTested, children }: {
  title: string; status: Status; statusLabel?: string; line?: string; rows?: RuleResult[]; details?: string[]; text?: string[]; pageTested?: string; children?: ReactNode;
}) {
  return (
    <section className="icp-block">
      <div className="icp-block-head">
        <h3>{title}</h3>
        <StatusChip status={status} label={statusLabel} />
      </div>
      {line ? <p className="icp-line">{line}</p> : null}
      {pageTested ? <p className="icp-tested">Page tested: <strong>{domainOf(pageTested)}</strong></p> : null}
      {text.map((t) => <p key={t}>{t}</p>)}
      <Rows rows={rows} />
      <Details lines={details} />
      {children}
    </section>
  );
}

function PageHead({ title, business }: { title: string; business: string }) {
  return (
    <header className="icp-head">
      <span>Visibility check · {business}</span>
      <h2>{title}</h2>
    </header>
  );
}

export function PrintReport({ business, address, today, cards, fixes, passed, total, realWebsite, nearby, speedTestedAt, logo, contactEmail, whatsapp }: {
  business: string;
  address?: string;
  today: string;
  cards: Card[];
  fixes: Fix[];
  passed: number;
  total: number;
  realWebsite: boolean;
  nearby: { query?: string; typical: number; min: number; max: number; rank: number; of: number; fair: boolean; items: { name: string; count: number; you?: boolean }[] } | null;
  speedTestedAt?: string;
  logo: string;
  contactEmail: string;
  whatsapp: string;
}) {
  const card = (id: Card['id']) => cards.find((c) => c.id === id) as Card;
  const profile = card('profile');
  const reviews = card('reviews');
  const website = card('website');
  const contact = card('contact');
  const consistency = card('consistency');
  const ai = card('ai');

  // The website card holds website, speed and search rows; the PDF groups them by what they measure.
  const byArea = (c: Card, area: string) => c.rows.filter((r) => r.rule.area === area);
  const basics = byArea(website, 'website');
  const speed = byArea(website, 'speed');
  const searchRows = ai.rows.filter((r) => r.rule.id !== 'search-ai-crawlers');
  const aiRows = ai.rows.filter((r) => r.rule.id === 'search-ai-crawlers');
  const speedDetails = website.details.filter((d) => !d.startsWith('Redirects'));
  const basicsDetails = website.details.filter((d) => d.startsWith('Redirects'));
  const sorted = nearby ? [...nearby.items].sort((a, b) => b.count - a.count) : [];
  const max = Math.max(1, ...sorted.map((i) => i.count));
  const covered = (f: Fix) => offerFor(f.key === 'reviews' || f.key === 'website' ? f.key : f.rule?.id ?? f.key, realWebsite);

  const checked = [
    profile.rows.length ? `Google business profile: read from Google Maps on ${today}.` : null,
    nearby ? `Nearby businesses: one Google Maps search for “${nearby.query}”, compared by review count.` : null,
    website.pageTested ? `Website: the page tested was ${domainOf(website.pageTested)}, read on ${today}. Links added by scripts may not be visible to our check.` : null,
    speed.length ? `Mobile speed: Google PageSpeed Insights, tested on ${longDate(speedTestedAt) ?? today}. Scores can vary between tests.` : null,
    reviews.rows.length ? ruleById['reviews-recent'].measured : null,
  ].filter((x): x is string => Boolean(x));

  return (
    <div className="icp" aria-hidden="true">
      {/* 1. Cover */}
      <section className="icp-page icp-cover">
        <div className="icp-brand">
          <Image src={logo} alt="" width={44} height={44} />
          <span>EMMANUEL <b>GROWTH</b></span>
        </div>
        <div className="icp-cover-main">
          <p className="icp-kicker">Visibility check report</p>
          <h1>{business}</h1>
          {address ? <p>{address}</p> : null}
          <p>{today}</p>
          <p className="icp-cover-note">Automated checks of public information</p>
        </div>
        <div className="icp-cover-contact">
          <p><strong>Emmanuel Growth</strong></p>
          <p>Email: {contactEmail}</p>
          <p>WhatsApp: {whatsapp}</p>
        </div>
      </section>

      {/* 2. Summary */}
      <section className="icp-page">
        <PageHead title="Summary" business={business} />
        <div className="icp-score">
          <Ring passed={passed} total={total} />
          <div>
            <p className="icp-score-big">{passed} of {total} checks passed</p>
            <p>Counts only the checks we could run automatically.</p>
          </div>
        </div>
        <section className="icp-block">
          <h3>Top 3 fixes</h3>
          {fixes.length ? (
            <ol className="icp-top">
              {fixes.map((f, i) => <li key={f.key}><span className="icp-num">{i + 1}</span><span>{f.text}</span>{f.priority ? <em>{f.priority}</em> : null}</li>)}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>}
          <p className="icp-muted">Details and who can help are on the last page.</p>
        </section>
        <section className="icp-block">
          <h3>Area statuses</h3>
          <table className="icp-areas">
            <tbody>
              {cards.map((c) => <tr key={c.id}><th scope="row">{c.title}</th><td>{c.line}</td><td><StatusChip status={c.status} label={c.statusLabel} /></td></tr>)}
            </tbody>
          </table>
        </section>
      </section>

      {/* 3. Google profile and reviews */}
      <section className="icp-page">
        <PageHead title="Google profile and reviews" business={business} />
        <Block title="Google profile" status={profile.status} line={profile.line} rows={profile.rows} text={profile.text} />
        <Block title="Reviews" status={reviews.status} statusLabel={reviews.statusLabel} line={reviews.line} rows={reviews.rows}>
          {nearby ? (
            <div className="icp-nearby">
              <h4>Reviews on Google, nearby businesses</h4>
              <p>Similar businesses nearby typically have {formatCount(nearby.typical)} reviews (from {formatCount(nearby.min)} to {formatCount(nearby.max)}).{nearby.fair ? ` By review count, ${business} ranks ${nearby.rank} of ${nearby.of}.` : ''}</p>
              <ul className="icp-bars">
                {sorted.map((i) => (
                  <li key={i.name} className={i.you ? 'is-you' : undefined}>
                    <span className="icp-bars-name">{i.name}{i.you ? ' (you)' : ''}</span>
                    <span className="icp-bars-track"><span style={{ width: `${Math.max(1.5, (i.count / max) * 100)}%` }} /></span>
                    <span className="icp-bars-count">{formatCount(i.count)}</span>
                  </li>
                ))}
              </ul>
              <p className="icp-muted">From Google Maps · one search for “{nearby.query}”.</p>
            </div>
          ) : null}
        </Block>
      </section>

      {/* 4. Website */}
      <section className="icp-page">
        <PageHead title="Website" business={business} />
        {realWebsite && (basics.length || speed.length || searchRows.length) ? (
          <>
            <Block title="Website basics" status={worst(basics)} rows={basics} details={basicsDetails} pageTested={website.pageTested} text={website.text} />
            {speed.length ? <Block title="Speed on a phone" status={worst(speed)} rows={speed} details={speedDetails} /> : null}
            {searchRows.length ? <Block title="Search readiness" status={worst(searchRows)} rows={searchRows} /> : null}
          </>
        ) : (
          <Block title="Website" status={website.status} statusLabel={website.statusLabel} line={website.line} text={website.text} pageTested={website.pageTested}>
            {!realWebsite && offerFor('website', false) ? <p className="icp-muted">Covered by: {offerFor('website', false)?.covers}</p> : null}
          </Block>
        )}
      </section>

      {/* 5. Contact, consistency and AI readiness */}
      <section className="icp-page">
        <PageHead title="Contact, consistency and AI readiness" business={business} />
        <Block title="Contact" status={contact.status} statusLabel={contact.statusLabel} line={contact.line} rows={contact.rows} details={contact.details} text={contact.text} />
        <Block title="Consistency" status={consistency.status} statusLabel={consistency.statusLabel} line={consistency.line} rows={consistency.rows} details={consistency.details} text={consistency.text} />
        <Block title="AI readiness" status={aiRows.length ? worst(aiRows) : ai.status} statusLabel={aiRows.length ? undefined : ai.statusLabel} line={aiRows.length ? undefined : ai.line} rows={aiRows} text={ai.text} />
      </section>

      {/* 6. Next steps */}
      <section className="icp-page">
        <PageHead title="Next steps" business={business} />
        <section className="icp-block">
          <h3>What I’d fix first</h3>
          {fixes.length ? (
            <ol className="icp-first">
              {fixes.map((f, i) => {
                const offer = covered(f);
                return (
                  <li key={f.key}>
                    <span className="icp-num">{i + 1}</span>
                    <div>
                      <p className="icp-first-title">{f.text}</p>
                      {f.rule ? <p>{f.rule.why}</p> : null}
                      <p className="icp-muted">{[f.priority ? `Priority: ${f.priority}` : null, f.rule ? `Effort: ${f.rule.effort} (rough estimate)` : null, offer ? `Covered by: ${offer.covers}` : null].filter(Boolean).join(' · ')}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>}
        </section>
        <section className="icp-block icp-reach">
          <h3>How to reach me</h3>
          <p>Questions about this report? Email {contactEmail} or WhatsApp {whatsapp}.</p>
        </section>
        <section className="icp-block">
          <h3>Method and limits</h3>
          <p>Automated checks of public information on {today}.</p>
          <ul className="icp-list">{checked.map((c) => <li key={c}>{c}</li>)}</ul>
          <p><strong>Not checked here.</strong> These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
        </section>
        <p className="icp-foot">Thresholds are our baseline; Google publishes no minimums.</p>
      </section>
    </div>
  );
}
