'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { HELP_LINK, PLAN_LINKS } from '../../lib/check-config';
import { offerFor, type Offer } from '../../lib/check-offers';
import { LISTINGS_LINE, listingsGuideHref } from '../../lib/listings-by-country';
import { BASELINE_LABEL, displayPriority, fixSteps, formatCount, isMeasured } from '../../lib/check-standard';
import { useHomeInteractions } from '../home/HomeInteractions';
import { contactEmail, whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { competitorArea, consistencyArea, contactArea, domainOf, notChecked, profileArea, reviewStats, searchArea, speedArea, topFixes, UNFAIR_COMPARISON, websiteArea, type Area, type RuleResult, type Status } from './findings';
import type { CheckState } from './InstantCheck';
import { Icon, Ring, StatusChip, StepBar, type IconName } from './ui';
import type { Contact } from './ContactFields';
import { PersonalReview } from './PersonalReview';
import { PrintReport } from './PrintReport';

// WhatsApp number from site config, shown on the PDF cover as +44 7575 416197.
const whatsappDisplay = `+${whatsappNumber.slice(0, 2)} ${whatsappNumber.slice(2, 6)} ${whatsappNumber.slice(6)}`;

// "Download PDF": the browser's own print window, where the visitor picks "Save as PDF".
// The PDF is made in the visitor's browser; nothing is sent to a server. The file name follows the page title.
function printReport(business: string) {
  const title = document.title;
  document.title = `Visibility check - ${business} - ${new Date().toISOString().slice(0, 10)}`;
  window.addEventListener('afterprint', () => { document.title = title; }, { once: true });
  window.print();
}

// Small tag next to a fix: a plan page, or the contact box with a topic. In the PDF: "Covered by: …".
function OfferTag({ offer }: { offer: Offer | null }) {
  const { openContact } = useHomeInteractions();
  if (!offer) return null;
  return (
    <span className="ic-offer">
      {offer.kind === 'link'
        ? <Link className="ic-offer-tag" href={offer.href}>{offer.label}</Link>
        : <button className="ic-offer-tag" type="button" aria-haspopup="dialog" onClick={() => openContact(offer.topic)}>{offer.label}</button>}
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
        How to fix this <Icon name="chevron" size={16} />
      </button>
      <ol className="ic-howto-steps" id={listId} hidden={!open}>
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
    </div>
  );
}

// Closing block at the end of the report.
function ClosingBlock({ realWebsite, onPersonalReview }: { realWebsite: boolean; onPersonalReview: () => void }) {
  const { openContact } = useHomeInteractions();
  return (
    <section className="ic-closing" aria-labelledby="ic-closing-title">
      {realWebsite ? (
        <p className="ic-closing-text"><strong id="ic-closing-title">These fixes work together.</strong> A faster website, more reviews and quicker replies each help. Together they turn searches into customers.</p>
      ) : (
        <p className="ic-closing-text"><strong id="ic-closing-title">A simple website is the first step,</strong> then reviews and quick replies.</p>
      )}
      <div className="ic-closing-actions">
        <button className="button button-growth" type="button" aria-haspopup="dialog" onClick={onPersonalReview}>Get a free personal review <Arrow /></button>
        {realWebsite
          ? <Link className="button button-outline" href={HELP_LINK}>See how I can help</Link>
          : <Link className="button button-outline" href={PLAN_LINKS.getFound}>See how I build it</Link>}
        <button className="button button-outline" type="button" aria-haspopup="dialog" onClick={() => openContact()}>Talk to me directly</button>
      </div>
    </section>
  );
}

// Only rules we actually measured count towards "checks passed".
const measured = (r: RuleResult) => r.rule.mode === 'automatic' && isMeasured(r.status);
const needsWork = (s: Status) => s === 'Problem' || s === 'Needs attention';

function ProgressItem({ label, state }: { label: string; state: 'waiting' | 'done' | 'skipped' | 'failed' }) {
  const text = { waiting: 'Checking…', done: 'Done', skipped: 'Not applicable', failed: 'Could not check' }[state];
  return <li className={`ic-progress-item is-${state}`}><span aria-hidden="true" />{label}<em>{text}</em></li>;
}

// "Page tested: example.com", never the full address inline (it's in the title and the link).
function PageTested({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <p className="ic-tested">
      <span>Page tested:</span>
      <a href={url} target="_blank" rel="noreferrer" title={url}><span>{domainOf(url)}</span><Icon name="external" size={14} /></a>
    </p>
  );
}

// One finding: name left, value, status chip far right; why it matters and the free fix expand inline.
function Row({ result, realWebsite }: { result: RuleResult; realWebsite: boolean }) {
  const [open, setOpen] = useState(false);
  const moreId = useId();
  const { rule, status, value } = result;
  const fixable = needsWork(status);
  const steps = fixable ? fixSteps[rule.id] : undefined;
  const priority = displayPriority(rule, status);
  const manual = rule.mode === 'manual';
  return (
    <li className="ic-row">
      <div className="ic-row-main">
        <span className="ic-name"><strong>{rule.displayName}</strong>{rule.technicalName ? <small className="ic-tech">{rule.technicalName}</small> : null}</span>
        <span className="ic-row-value">{value === status ? '' : value}</span>
        <StatusChip status={status} />
      </div>
      <button className="ic-row-toggle" type="button" aria-expanded={open} aria-controls={moreId} onClick={() => setOpen(!open)}>
        {fixable ? 'Why it matters and how to fix' : 'Why it matters'} <Icon name="chevron" size={16} />
      </button>
      <div className="ic-row-more" id={moreId} hidden={!open}>
        <p>{rule.why}</p>
        {manual ? <p className="ic-baseline">{rule.measured}</p> : null}
        {priority ? <p className="ic-row-meta"><span>Priority: <strong>{priority}</strong></span><span>Effort: {rule.effort} (rough estimate)</span></p> : null}
        {steps?.length ? (
          <>
            <p className="ic-row-sub">How to fix this</p>
            <ol className="ic-howto-steps">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </>
        ) : null}
        {!manual ? <p className="ic-baseline">Good means: {rule.thresholds.good.toLowerCase()}.{rule.baseline ? ` ${BASELINE_LABEL}` : ''}</p> : null}
        {rule.note ? <p className="ic-baseline">{rule.note}</p> : null}
        {fixable ? <OfferTag offer={offerFor(rule.id, realWebsite)} /> : null}
      </div>
    </li>
  );
}

// "Email links: 2" → a compact label / value pair.
function Details({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <dl className="ic-details">
      {lines.map((line) => {
        const at = line.indexOf(': ');
        return at > 0
          ? <div key={line}><dt>{line.slice(0, at)}</dt><dd>{line.slice(at + 2)}</dd></div>
          : <div key={line}><dd>{line}</dd></div>;
      })}
    </dl>
  );
}

export type Fix = ReturnType<typeof topFixes>[number];
type CardId = 'profile' | 'reviews' | 'website' | 'contact' | 'consistency' | 'ai';
export type Card = {
  id: CardId;
  title: string;
  icon: IconName;
  status: Status;
  statusLabel?: string;
  line: string;
  rows: RuleResult[];
  details: string[];
  text: string[]; // plain paragraphs when there are no rule rows
  pageTested?: string;
  waiting?: boolean;
  extra?: ReactNode; // nearby businesses, keyword comparison
};
type Filter = 'all' | 'attention' | 'good';

const rowMatches = (r: RuleResult, filter: Filter) => filter === 'all' || (filter === 'attention' ? needsWork(r.status) : r.status === 'Good');

function AreaCard({ card, open, onToggle, filter, realWebsite }: { card: Card; open: boolean; onToggle: () => void; filter: Filter; realWebsite: boolean }) {
  const bodyId = useId();
  const rows = card.rows.filter((r) => rowMatches(r, filter));
  return (
    <section className={`ic-acard${open ? ' is-open' : ''}`} id={`ic-area-${card.id}`} aria-labelledby={`${bodyId}-title`}>
      <h3 className="ic-acard-heading">
        <button className="ic-acard-head" type="button" aria-expanded={open} aria-controls={bodyId} onClick={onToggle} disabled={card.waiting}>
          <span className="ic-acard-icon" aria-hidden="true"><Icon name={card.icon} size={20} /></span>
          <span className="ic-acard-text">
            <span className="ic-acard-title" id={`${bodyId}-title`}>{card.title}</span>
            {card.waiting ? <span className="ic-skel ic-skel-line" aria-hidden="true" /> : <span className="ic-acard-line">{card.line}</span>}
          </span>
          {card.waiting ? <span className="ic-status is-unknown">Checking…</span> : <StatusChip status={card.status} label={card.statusLabel} />}
          {card.waiting ? null : <span className="ic-chevron" aria-hidden="true"><Icon name="chevron" size={20} /></span>}
        </button>
      </h3>
      {card.waiting ? (
        <div className="ic-acard-body" aria-hidden="true">
          <div className="ic-skel ic-skel-row" />
          <div className="ic-skel ic-skel-row" />
        </div>
      ) : (
        <div className="ic-acard-body" id={bodyId} hidden={!open}>
          <PageTested url={card.pageTested} />
          {card.text.map((t) => <p className="ic-acard-p" key={t}>{t}</p>)}
          {rows.length ? <ul className="ic-rows">{rows.map((r) => <Row result={r} key={r.rule.id} realWebsite={realWebsite} />)}</ul> : null}
          {filter === 'all' ? <Details lines={card.details} /> : null}
          {filter === 'all' ? card.extra : null}
        </div>
      )}
    </section>
  );
}

// Horizontal bars of review counts, most first, with the visitor's business highlighted.
function ReviewBars({ items }: { items: { name: string; count: number; you?: boolean }[] }) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...sorted.map((i) => i.count));
  return (
    <ul className="ic-bars" aria-label="Google reviews, most first">
      {sorted.map((i) => (
        <li key={i.name} className={i.you ? 'is-you' : undefined}>
          <span className="ic-bars-name"><span title={i.name}>{i.name}</span>{i.you ? <span className="ic-you">You</span> : null}</span>
          <span className="ic-bars-track" aria-hidden="true"><span style={{ width: `${Math.max(1.5, (i.count / max) * 100)}%` }} /></span>
          <span className="ic-bars-count">{formatCount(i.count)}</span>
        </li>
      ))}
    </ul>
  );
}

const SECTIONS = [
  { id: 'ic-summary', label: 'Summary' },
  { id: 'ic-area-profile', label: 'Google' },
  { id: 'ic-area-reviews', label: 'Reviews' },
  { id: 'ic-area-website', label: 'Website' },
  { id: 'ic-area-contact', label: 'Contact' },
  { id: 'ic-area-ai', label: 'AI' },
];

// Sticky bar of section chips: scrolls to the section and highlights the one in view.
function SectionBar({ onOpen }: { onOpen: (id: string) => void }) {
  const [current, setCurrent] = useState(SECTIONS[0].id);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = (barRef.current?.getBoundingClientRect().bottom ?? 140) + 24;
      let active = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) active = s.id;
      }
      // At the very bottom the last sections can't reach the line: highlight the last one that's on screen.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const visible = SECTIONS.filter((s) => (document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity) < window.innerHeight);
        if (visible.length) active = visible[visible.length - 1].id;
      }
      setCurrent(active);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Keep the highlighted chip visible inside the bar on narrow screens (horizontal scroll only).
  useEffect(() => {
    const bar = barRef.current?.querySelector('ol');
    const chip = bar?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!bar || !chip) return;
    const left = chip.offsetLeft - 16;
    const right = chip.offsetLeft + chip.offsetWidth + 16 - bar.clientWidth;
    if (bar.scrollLeft > left) bar.scrollLeft = left;
    else if (bar.scrollLeft < right) bar.scrollLeft = right;
  }, [current]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    onOpen(id);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    setCurrent(id);
  };

  return (
    <nav className="ic-sectionbar" aria-label="Report sections" ref={barRef}>
      <ol>
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined} onClick={(e) => go(e, s.id)}>{s.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ResultView({ check, ticket, headingRef, onCompare, restored = false, onNewCheck, contact, onContact }: {
  check: CheckState;
  restored?: boolean; // shown again from this tab's saved copy
  onNewCheck: () => void;
  onCompare?: (keyword: string) => Promise<void>;
  ticket: string | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  contact: Contact | null; // from step 1, in memory only; null after a refresh or when contact isn't required
  onContact: (c: Contact) => void; // contact given in the personal review dialog (memory only)
}) {
  const business = check.businessName;
  const profile = check.profile;
  const hasWebsite = Boolean(check.website);
  const noRealWebsite = !hasWebsite || Boolean(check.social);
  const competitorRows = check.competitors.state === 'done' ? check.competitors.data : null;
  const allDone = [check.competitors, check.site, check.speed].every((l) => l.state !== 'waiting');
  const site = check.site.state === 'done' ? check.site.data : null;
  const [nearbyView, setNearbyView] = useState<'table' | 'cards'>('table');
  const [reachedReport, setReachedReport] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [comparing, setComparing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [openCards, setOpenCards] = useState<Partial<Record<CardId, boolean>>>({});
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

  const fixes = topFixes(areas);
  const stats = profile && competitorRows?.rows.length ? reviewStats(profile.reviewCount ?? 0, competitorRows.rows) : null;
  const allResults = areas.flatMap((a) => a.results).filter(measured);
  const passed = allResults.filter((r) => r.status === 'Good').length;

  const worse = (a?: Status, b?: Status): Status => {
    const rank: Record<string, number> = { Problem: 3, 'Needs attention': 2, Good: 1, 'Couldn’t check': 0, 'Couldn’t compare fairly': 0, 'Not checked automatically': 0 };
    if (!a) return b ?? 'Couldn’t check';
    if (!b) return a;
    return rank[a] >= rank[b] ? a : b;
  };
  const fromArea = (area: Area) => ({ status: area.status, line: area.line, rows: area.results, details: area.extra, text: area.results.length ? [] : area.found, pageTested: area.pageTested });
  const siteWaiting = !noRealWebsite && check.site.state === 'waiting';

  // Nearby businesses on Google (inside the Reviews card): bars, then the table or cards.
  const nearby = competitorRows && profile && competitorRows.rows.length && stats ? (
    <div className="ic-nearby">
      <div className="ic-nearby-head">
        <div>
          <h4>Nearby businesses on Google</h4>
          <p>Similar businesses nearby typically have <strong className="ic-num">{formatCount(stats.typical)} reviews</strong> (from <span className="ic-num">{formatCount(stats.min)}</span> to <span className="ic-num">{formatCount(stats.max)}</span>). {stats.fair ? `By review count, ${profile.name} ranks ${stats.rank} of ${stats.of}.` : null}</p>
          {stats.fair ? null : <p className="ic-unfair"><StatusChip status="Couldn’t compare fairly" /> {UNFAIR_COMPARISON}</p>}
        </div>
      </div>
      <ReviewBars items={[{ name: profile.name, count: profile.reviewCount ?? 0, you: true }, ...competitorRows.rows.map((r) => ({ name: r.name, count: r.reviewCount ?? 0 }))]} />
      <div className="ic-nearby-tools">
        <p className="ic-source">From Google Maps · one search for “{competitorRows.query}”</p>
        <div className="ic-toggle" role="group" aria-label="Show nearby businesses as">
          <button type="button" aria-pressed={nearbyView === 'table'} onClick={() => setNearbyView('table')}><Icon name="table" size={16} />Table</button>
          <button type="button" aria-pressed={nearbyView === 'cards'} onClick={() => setNearbyView('cards')}><Icon name="cards" size={16} />Cards</button>
        </div>
      </div>
      {nearbyView === 'table' ? (
        <div className="ic-table-wrap">
          <table className="ic-table">
            <caption className="sr-only">Nearby businesses, in the order Google returned them</caption>
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
    </div>
  ) : null;

  // Keyword rerun when the nearby comparison couldn't run (inside the Reviews card).
  const compareForm = profile && onCompare && (skippedReason === 'generic_category' || skippedReason === 'too_few' || skippedReason === 'failed') ? (
    <form className="ic-compare-form" onSubmit={async (e) => { e.preventDefault(); if (!keyword.trim()) return; setComparing(true); await onCompare(keyword.trim()); setComparing(false); }}>
      <p>{skippedReason === 'generic_category' ? 'Couldn’t compare: your Google category is very general.' : skippedReason === 'failed' ? 'Couldn’t compare: the nearby search didn’t respond.' : 'Couldn’t compare: we found fewer than 3 similar businesses nearby.'} Tell us what you do and we’ll search for similar businesses near you.</p>
      <label htmlFor="ic-keyword">What do you do? (for example plumber, spa, restaurant)</label>
      <div className="ic-compare-row">
        <div className="ic-field"><Icon name="search" /><input id="ic-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={40} autoComplete="off" /></div>
        <button className="button button-dark" type="submit" disabled={comparing}>{comparing ? 'Searching…' : 'Compare'}</button>
      </div>
    </form>
  ) : null;

  const noWebsiteText = check.social
    ? [`${profile ? `Your Google profile links to ${check.social}, not a website.` : `The address you gave is a ${check.social} page, not a website.`} ${check.social} can be a good place to show your work, so we skipped the website checks and speed test rather than test ${check.social}’s own site.`]
    : ['We didn’t find a website for this business, so the website checks were skipped.'];
  noWebsiteText.push('Customers can still find you on Google Maps. A website helps by giving Google and AI assistants a page to read about your services and location, and by giving customers one place to see your work, prices and contact options. It may also make it easier for people who find you elsewhere to get in touch.');

  const unavailable = (id: CardId, title: string, icon: IconName, line: string, label: string): Card => ({ id, title, icon, status: 'Couldn’t check', statusLabel: label, line, rows: [], details: [], text: [] });

  const websiteCard = (): Card => {
    if (noRealWebsite) return { id: 'website', title: 'Website', icon: 'globe', status: 'Needs attention', line: byId.website?.line ?? 'No website found.', rows: [], details: [], text: noWebsiteText, extra: <OfferTag offer={offerFor('website', false)} /> };
    if (check.site.state === 'waiting' || check.speed.state === 'waiting') return { ...unavailable('website', 'Website', 'globe', '', ''), waiting: true };
    const w = byId.website;
    const s = byId.speed;
    const perf = check.speed.state === 'done' ? check.speed.data.scores.performance : undefined;
    return {
      id: 'website', title: 'Website', icon: 'globe',
      status: worse(w?.status, s?.status),
      line: [w?.line, perf !== undefined ? `Mobile speed ${perf} out of 100.` : null].filter(Boolean).join(' '),
      rows: [...(w?.results ?? []), ...(s?.results ?? [])],
      details: [...(w?.extra ?? []), ...(s?.extra ?? [])],
      text: [...(w && !w.results.length ? w.found : []), ...(s && !s.results.length ? s.found : [])],
      pageTested: w?.pageTested,
    };
  };

  const siteCard = (id: CardId, title: string, icon: IconName, area: Area | undefined, noSite: string, couldnt: string): Card => {
    if (noRealWebsite) return unavailable(id, title, icon, noSite, 'No website');
    if (siteWaiting) return { ...unavailable(id, title, icon, '', ''), waiting: true };
    if (!area) return unavailable(id, title, icon, couldnt, 'Couldn’t check');
    return { id, title, icon, ...fromArea(area) };
  };

  // Consistency: after the Google-versus-website comparison, one line about other listings and the guide link.
  const withListings = (card: Card): Card => (card.waiting ? card : {
    ...card,
    extra: <p className="ic-listings">{LISTINGS_LINE} <a href={listingsGuideHref(profile?.countryCode, profile?.categoryType)}>See where to check <Arrow /></a></p>,
  });

  const cards: Card[] = [
    profile
      ? { id: 'profile', title: 'Google profile', icon: 'pin', ...fromArea(byId.profile as Area), text: [] }
      : { id: 'profile', title: 'Google profile', icon: 'pin', ...fromArea(byId.profile as Area), text: [...(byId.profile?.found ?? []), byId.profile?.why ?? ''].filter(Boolean), extra: <FixSteps id="gbp" /> },
    !profile
      ? unavailable('reviews', 'Reviews', 'star', 'No Google profile to read reviews from.', 'No profile')
      : byId.reviews
        ? { id: 'reviews', title: 'Reviews', icon: 'star', ...fromArea(byId.reviews), extra: <>{nearby}{compareForm}</> }
        : { ...unavailable('reviews', 'Reviews', 'star', '', ''), waiting: true },
    websiteCard(),
    siteCard('contact', 'Contact', 'phone', byId.contact, 'There’s no website to check for contact buttons.', 'We couldn’t read your website for contact links.'),
    !profile
      ? unavailable('consistency', 'Consistency', 'building', 'There’s no Google profile to compare your details with.', 'No profile')
      : withListings(siteCard('consistency', 'Consistency', 'building', byId.consistency, 'There’s no website to compare with your Google profile.', 'We couldn’t read your website to compare your details.')),
    siteCard('ai', 'AI readiness', 'spark', byId.search, 'AI assistants have no website of yours to read.', 'We couldn’t read your website for these signals.'),
  ];

  // Problem and Needs attention areas start open; Good and unchecked areas start closed.
  const isOpen = (card: Card) => (filter !== 'all' ? true : openCards[card.id] ?? needsWork(card.status));
  const toggle = (card: Card) => setOpenCards((o) => ({ ...o, [card.id]: !isOpen(card) }));
  const openSection = (sectionId: string) => {
    const card = cards.find((c) => `ic-area-${c.id}` === sectionId);
    if (card && !card.waiting) setOpenCards((o) => ({ ...o, [card.id]: true }));
  };
  const visibleCards = cards.filter((c) => filter === 'all' || c.waiting || c.rows.some((r) => rowMatches(r, filter)) || (!c.rows.length && rowMatches({ status: c.status } as RuleResult, filter)));
  const counts = {
    attention: cards.reduce((n, c) => n + c.rows.filter((r) => needsWork(r.status)).length, 0),
    good: cards.reduce((n, c) => n + c.rows.filter((r) => r.status === 'Good').length, 0),
  };

  // Bring the result into view and move focus to it once, when it first appears.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);

  // Step bar: "Full report" is done once the visitor has scrolled to the area cards.
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

  const closeReview = useCallback(() => setReviewOpen(false), []);

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
      <PrintReport
        business={business}
        address={profile?.address}
        today={today}
        cards={cards}
        fixes={fixes}
        passed={passed}
        total={allResults.length}
        realWebsite={!noRealWebsite}
        nearby={stats && competitorRows && profile ? { query: competitorRows.query, ...stats, items: [{ name: profile.name, count: profile.reviewCount ?? 0, you: true }, ...competitorRows.rows.map((r) => ({ name: r.name, count: r.reviewCount ?? 0 }))] } : null}
        speedTestedAt={check.speed.state === 'done' ? check.speed.data.testedAt : undefined}
        logo="/favicon.svg"
        contactEmail={contactEmail}
        whatsapp={whatsappDisplay}
      />

      <StepBar steps={[
        { label: 'Your business', state: 'done' },
        { label: 'Your results', state: reachedReport ? 'done' : 'current', href: '#ic-summary' },
        { label: 'Full report', state: reachedReport ? 'done' : 'upcoming', href: '#ic-areas' },
      ]} />

      <div className="ic-result-actions">
        {restored ? <p className="ic-hint">Showing your saved results from earlier in this tab.</p> : null}
        <button className="vc-back" type="button" onClick={onNewCheck}>Start a new check</button>
      </div>

      <header className="ic-hero ic-result-hero" id="ic-summary">
        <div className="ic-result-main">
          <p className="ic-hero-label">Automated checks of public information on {today}</p>
          <h1 tabIndex={-1} ref={headingRef}>{business}</h1>
          {profile ? (
            <>
              <ul className="ic-chips" aria-label="From your Google profile">
                {profile.category ? <li>{profile.category}</li> : null}
                {profile.businessStatus === 'OPERATIONAL' ? <li>Operating</li> : null}
                {profile.rating ? <li className="ic-num">Rated {profile.rating} · {formatCount(profile.reviewCount ?? 0)} reviews</li> : null}
              </ul>
              <p className="ic-address"><Icon name="pin" size={16} />{profile.address}</p>
            </>
          ) : <p className="ic-address">Entered by you, not selected from Google.</p>}
          <div className="ic-hero-actions">
            {profile?.mapsUrl ? <a className="ic-maps-link" href={profile.mapsUrl} target="_blank" rel="noreferrer">View on Maps <Icon name="external" size={14} /></a> : null}
            <button className="button button-growth ic-pdf-button" type="button" onClick={() => printReport(business)} title="Opens your browser’s print window. Choose “Save as PDF” as the printer."><Icon name="download" size={18} />Download PDF</button>
          </div>
        </div>
        <div className="ic-result-score">
          <Ring passed={passed} total={allResults.length} />
          <div>
            <p><strong className="ic-num">{passed} of {allResults.length} checks passed</strong>{allDone ? '' : ' so far'}</p>
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
                  <div className="ic-fix-actions">
                    <OfferTag offer={offerFor(f.key === 'reviews' || f.key === 'website' ? f.key : f.rule?.id ?? f.key, !noRealWebsite)} />
                    <FixSteps id={f.rule?.id ?? f.key} />
                  </div>
                </li>
              ))}
            </ol>
          ) : <p>We didn’t find anything urgent in these checks.</p>
        ) : (
          <div className="ic-fix-cards" aria-hidden="true">
            {[0, 1, 2].map((i) => <div className="ic-fix-card ic-fix-skel" key={i}><div className="ic-skel ic-skel-chip" /><div className="ic-skel ic-skel-row" /><div className="ic-skel ic-skel-line" /></div>)}
          </div>
        )}
        {allDone ? null : <p className="ic-hint">Working out your top fixes as the checks finish…</p>}
      </section>

      <SectionBar onOpen={openSection} />

      <section className="ic-block ic-areas-block" aria-labelledby="ic-areas-title" id="ic-areas">
        <div className="ic-areas-head">
          <h2 id="ic-areas-title">Every check, by area</h2>
          <div className="ic-filters" role="group" aria-label="Show checks">
            <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
            <button type="button" aria-pressed={filter === 'attention'} onClick={() => setFilter('attention')}>Needs attention <span className="ic-num">{counts.attention}</span></button>
            <button type="button" aria-pressed={filter === 'good'} onClick={() => setFilter('good')}>Good <span className="ic-num">{counts.good}</span></button>
          </div>
        </div>
        <div className="ic-acards">
          {visibleCards.map((c) => <AreaCard key={c.id} card={c} open={isOpen(c)} onToggle={() => toggle(c)} filter={filter} realWebsite={!noRealWebsite} />)}
          {!visibleCards.length ? <p className="ic-hint">Nothing here for this filter.</p> : null}
        </div>
      </section>

      <section className="ic-panel ic-neutral" aria-labelledby="ic-not-checked">
        <h2 id="ic-not-checked">Not checked here</h2>
        <p>These need a person to look at, so this automated check doesn’t cover them: {notChecked.join(', ')}.</p>
      </section>

      {allDone ? <ClosingBlock realWebsite={!noRealWebsite} onPersonalReview={() => setReviewOpen(true)} /> : null}

      <div className="ic-cta">
        <button className="vc-back" type="button" onClick={onNewCheck}>Start a new check</button>
      </div>

      <PersonalReview
        open={reviewOpen}
        onClose={closeReview}
        ticket={ticket}
        contact={contact}
        onContact={onContact}
        businessName={business}
        businessCountry={profile?.countryCode}
        summary={() => ({ statuses: Object.fromEntries(areas.map((a) => [a.title, a.status])), topFixes: fixes.map((f) => f.text) })}
      />
    </div>
  );
}
