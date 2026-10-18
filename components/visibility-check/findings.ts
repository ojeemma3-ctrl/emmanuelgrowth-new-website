// Applies the visibility check standard (lib/check-standard.ts) to the raw check results.
// All thresholds, wording for "why it matters", priorities and effort live in the standard;
// this file only measures values and picks the status each rule's thresholds give.
import { areaTitles, BASELINE_LABEL, limits, ruleById, type AreaId, type Rule, type Status } from '../../lib/check-standard';
import type { Competitor, Profile } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';

export type { Status };

export type Fix = { key: string; text: string; weight: number };

export type RuleResult = { rule: Rule; status: Status; value: string };

export type Area = {
  id: string;
  title: string;
  status: Status;
  line: string;
  found: string[];
  results: RuleResult[];
  why: string;
  fix: string;
  fixes: Fix[];
};

export type Outcome<T> = { state: 'waiting' } | { state: 'done'; data: T } | { state: 'skipped'; reason: string } | { state: 'failed'; reason: string };

const severity: Record<Status, number> = { Problem: 2, 'Needs attention': 1, Good: 0, 'Couldn’t check': 0, 'Not checked automatically': 0 };
const priorityWeight = { 'Fix first': 3, Next: 2, Later: 1 } as const;
const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined);
const daysSince = (iso?: string) => (iso ? (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24) : Infinity);

const result = (id: string, status: Status, value: string): RuleResult => ({ rule: ruleById[id], status, value });
const manual = (id: string): RuleResult => result(id, 'Not checked automatically', 'Not checked automatically');

function buildArea(id: AreaId, results: RuleResult[], line: (status: Status) => string): Area {
  const checked = results.filter((r) => r.rule.mode === 'automatic' && r.status !== 'Couldn’t check' && r.status !== 'Not checked automatically');
  const worst = checked.reduce<Status>((acc, r) => (severity[r.status] > severity[acc] ? r.status : acc), 'Good');
  const status: Status = checked.length ? worst : 'Couldn’t check';
  const failing = checked.filter((r) => r.status === 'Problem' || r.status === 'Needs attention');
  const fixes = failing.map((r) => ({ key: r.rule.issue ?? r.rule.id, text: r.rule.action, weight: priorityWeight[r.rule.priority] * 10 + severity[r.status] }));
  return {
    id,
    title: areaTitles[id],
    status,
    line: line(status),
    results,
    found: results.map((r) => `${r.rule.label}: ${r.value}${r.rule.mode === 'automatic' && r.status !== 'Couldn’t check' ? ` (${r.status})` : ''}`),
    why: (failing[0] ?? results[0]).rule.why,
    fix: failing.length ? failing.map((r) => r.rule.action).join('. ') + '.' : 'Nothing urgent here.',
    fixes,
  };
}

function couldntCheck(id: AreaId, line: string, found: string[]): Area {
  return { id, title: areaTitles[id], status: 'Couldn’t check', line, found, results: [], why: 'We only report on what we could actually check.', fix: 'You can run the check again later.', fixes: [] };
}

// Google business profile
export function profileArea(profile: Profile | null, social: string | null): Area {
  if (!profile) {
    return {
      id: 'profile', title: areaTitles.profile, status: 'Problem', results: [],
      line: 'No Google business profile was selected for this check.',
      found: ['You told us your business isn’t listed on Google, so there was no profile to check.'],
      why: 'A Google business profile is how many local customers find you on Google Search and Maps.',
      fix: 'Create or claim your free Google business profile.',
      fixes: [{ key: 'gbp', text: 'Create or claim your free Google business profile', weight: 32 }],
    };
  }
  const operational = !profile.businessStatus || profile.businessStatus === 'OPERATIONAL';
  const photos = profile.photoCount;
  const results: RuleResult[] = [
    result('gbp-status', operational ? 'Good' : 'Problem', profile.businessStatus ? profile.businessStatus.replace(/_/g, ' ').toLowerCase() : 'not shown'),
    result('gbp-category', profile.category ? 'Good' : 'Problem', profile.category ?? 'not set'),
    result('gbp-hours', profile.hasOpeningHours ? 'Good' : 'Needs attention', profile.hasOpeningHours ? 'listed' : 'missing'),
    result('gbp-phone', profile.phone ? 'Good' : 'Problem', profile.phone ?? 'missing'),
    result('gbp-website', profile.website && !social ? 'Good' : 'Needs attention', !profile.website ? 'no website listed' : social ? `links to ${social}, not a website` : profile.website),
    result('gbp-photos', photos >= limits.photosGood ? 'Good' : photos > 0 ? 'Needs attention' : 'Problem', profile.photosCapped ? '10 or more' : String(photos)),
    manual('gbp-description'),
    manual('gbp-videos'),
    manual('gbp-total-photos'),
  ];
  return buildArea('profile', results, (status) => (status === 'Good' ? 'Your profile has the main details customers look for.' : 'Your profile is set up, with a few things to improve.'));
}

const median = (values: number[]) => {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Reviews: count compared with nearby businesses, rating, recent review.
export function competitorArea(profile: Profile | null, outcome: Outcome<{ rows: Competitor[]; query?: string }>): Area | null {
  if (!profile || outcome.state === 'waiting') return null;
  const own = profile.reviewCount ?? 0;
  let countResult: RuleResult;
  let typical: number | undefined;
  if (outcome.state === 'done' && outcome.data.rows.length) {
    typical = median(outcome.data.rows.map((r) => r.reviewCount ?? 0));
    const ratio = typical > 0 ? own / typical : 1;
    let status: Status = 'Good';
    if (own < limits.reviewsFloor || ratio < limits.reviewsQuarterOfTypical) status = 'Problem';
    else if (ratio < limits.reviewsHalfOfTypical) status = 'Needs attention';
    countResult = result('reviews-count', status, `${own} reviews; similar businesses nearby typically have ${typical}`);
  } else if (outcome.state === 'done') {
    countResult = result('reviews-count', own < limits.reviewsFloor ? 'Problem' : 'Good', `${own} reviews; no similar businesses were found to compare with`);
  } else {
    countResult = result('reviews-count', 'Couldn’t check', `${own} reviews; we couldn’t run the nearby comparison`);
  }
  const days = daysSince(profile.latestReviewDate);
  const results: RuleResult[] = [
    countResult,
    result('reviews-rating', profile.rating && profile.rating >= limits.ratingGood ? 'Good' : 'Needs attention', profile.rating ? `${profile.rating}` : 'no rating yet'),
    result('reviews-recent', days <= limits.recentReviewDays ? 'Good' : 'Needs attention', formatDate(profile.latestReviewDate) ? `newest returned review ${formatDate(profile.latestReviewDate)}` : 'no reviews returned'),
    manual('reviews-owner-replies'),
  ];
  return buildArea('reviews', results, () => (typical !== undefined ? `You have ${own} reviews. Similar businesses nearby typically have ${typical}.` : `You have ${own} reviews.`));
}

// Responses that usually mean the site blocked our automated visit, not that the site is broken.
const BLOCKED_STATUSES = new Set([401, 403, 405, 406, 429, 503]);

export function websiteArea(outcome: Outcome<WebsiteReport>, hasWebsite: boolean, social: string | null, fromProfile: boolean): Area | null {
  if (social) {
    const line = fromProfile ? `Your Google profile links to ${social}, not a website.` : `The address you gave is a ${social} page, not a website.`;
    return {
      id: 'website', title: areaTitles.website, status: 'Needs attention', line, results: [],
      found: [line, 'Website checks and the speed test were skipped, because they would test the platform’s own site rather than yours.'],
      why: ruleById['gbp-website'].why,
      fix: `${ruleById['gbp-website'].action}.`,
      fixes: [{ key: 'website', text: ruleById['gbp-website'].action, weight: 21 }],
    };
  }
  if (!hasWebsite) {
    return {
      id: 'website', title: areaTitles.website, status: 'Needs attention', line: 'No website was found to check.', results: [],
      found: ['There is no website on your Google profile, and none was entered.'],
      why: ruleById['gbp-website'].why,
      fix: `${ruleById['gbp-website'].action}.`,
      fixes: [{ key: 'website', text: ruleById['gbp-website'].action, weight: 21 }],
    };
  }
  if (outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed') return couldntCheck('website', 'We couldn’t run the website checks this time.', ['The website check didn’t complete.']);
  const site = outcome.data;
  if (!site.reachable) {
    if (site.error || (site.status && BLOCKED_STATUSES.has(site.status))) {
      return couldntCheck('website', 'We couldn’t load your website for this check. Some sites block automated visits.', [`Address checked: ${site.url}`, `Result: ${site.error ? site.error.replace(/_/g, ' ') : `status ${site.status}`}`]);
    }
    return {
      id: 'website', title: areaTitles.website, status: 'Problem', line: 'Your website returned an error page.', results: [],
      found: [`Address checked: ${site.url}`, `Result: status ${site.status}`],
      why: 'If the page shows an error for us, it may show one for some customers too.',
      fix: 'Check your website address is correct and that the home page loads on a phone.',
      fixes: [{ key: 'site-error', text: 'Check your website address and that the home page loads', weight: 32 }],
    };
  }
  const results: RuleResult[] = [
    result('web-https', site.https ? 'Good' : 'Problem', `${site.https ? 'yes' : 'no'}${site.httpRedirectsToHttps === false ? ' (plain http doesn’t forward to https)' : ''}`),
    result('web-mobile', site.hasViewport ? 'Good' : 'Needs attention', site.hasViewport ? 'mobile viewport set' : 'no mobile viewport'),
    result('web-title', site.title ? 'Good' : 'Needs attention', site.title ?? 'missing'),
    result('web-description', site.metaDescription ? 'Good' : 'Needs attention', site.metaDescription ? 'present' : 'missing'),
    result('web-h1', site.h1Count === 1 ? 'Good' : 'Needs attention', site.h1Count ? `${site.h1Count} found${site.h1s[0] ? ` (“${site.h1s[0]}”)` : ''}` : 'none found'),
    result('web-open-graph', site.openGraph.title && site.openGraph.image ? 'Good' : 'Needs attention', `title ${yesNo(site.openGraph.title)}, image ${yesNo(site.openGraph.image)}`),
  ];
  const area = buildArea('website', results, (status) => (status === 'Good' ? 'The basic set-up search engines and phones need is in place.' : 'A few basics to tidy up.'));
  area.found.unshift(`Address checked: ${site.finalUrl}${site.redirectCount ? ` (after ${site.redirectCount} redirect${site.redirectCount === 1 ? '' : 's'})` : ''}`);
  return area;
}

export function contactArea(site: WebsiteReport | null): Area | null {
  if (!site?.reachable) return null;
  const ways = [site.telLinks && `${site.telLinks} tap-to-call`, site.whatsappLinks && `${site.whatsappLinks} WhatsApp`, site.bookingLinks && `${site.bookingLinks} booking`].filter(Boolean);
  const results = [result('contact-links', ways.length ? 'Good' : 'Needs attention', ways.length ? `${ways.join(', ')} link${ways.length === 1 ? '' : 's'}` : 'none found')];
  const area = buildArea('contact', results, (status) => (status === 'Good' ? 'Customers can reach you in one tap from your website.' : 'We found no one-tap way to call, message or book.'));
  area.found.push(`Email links: ${site.mailtoLinks}`, `Contact form: ${site.hasContactForm ? 'found' : 'not found'}`, `Social links: ${site.socialLinks.length ? site.socialLinks.join(', ') : 'none found'}`);
  return area;
}

export function searchArea(site: WebsiteReport | null): Area | null {
  if (!site?.reachable) return null;
  const b = site.businessSchema;
  const details = [['name', b.name], ['address', b.address], ['phone', b.phone], ['hours', b.hours], ['website', b.website], ['image', b.image], ['social links', b.socialLinks]] as const;
  const missingDetails = details.filter(([, present]) => !present).map(([name]) => name);
  const blockedBots = Object.entries(site.aiCrawlers).filter(([, r]) => r === 'blocked').map(([bot]) => bot);
  const blocked = site.robotsTxt.blocksAll || site.noindex;
  const results: RuleResult[] = [
    result('search-indexable', blocked ? 'Problem' : 'Good', site.robotsTxt.blocksAll ? 'robots.txt blocks all crawlers' : site.noindex ? 'page set to noindex' : `not blocked${site.robotsTxt.found ? '' : ' (no robots.txt found)'}`),
    result('search-sitemap', site.sitemap.found ? 'Good' : 'Needs attention', site.sitemap.found ? 'found' : 'not found'),
    result('search-schema', b.found && !missingDetails.length ? 'Good' : 'Needs attention', b.found ? (missingDetails.length ? `present, missing: ${missingDetails.join(', ')}` : 'present with all seven details') : 'not found'),
    result('search-ai-crawlers', blockedBots.length ? 'Needs attention' : 'Good', blockedBots.length ? `blocked: ${blockedBots.join(', ')}` : 'none blocked'),
  ];
  return buildArea('search', results, (status) => (status === 'Good' ? 'Search engines and AI assistants can read your site.' : 'A few signals that help search engines understand you are missing.'));
}

export function speedArea(outcome: Outcome<PageSpeedReport>): Area | null {
  if (outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed' || outcome.data.scores.performance === undefined) {
    return couldntCheck('speed', 'Google’s speed test was unavailable this time.', ['Google PageSpeed didn’t return a result for this check.']);
  }
  const psi = outcome.data;
  const perf = psi.scores.performance as number;
  const status: Status = perf >= limits.speedGood ? 'Good' : perf >= limits.speedAttention ? 'Needs attention' : 'Problem';
  const area = buildArea('speed', [result('speed-mobile', status, `${perf} out of 100`)], () => `Google’s mobile test scored performance ${perf} out of 100.`);
  area.found.push(
    `Other scores out of 100: accessibility ${psi.scores.accessibility ?? '–'}, best practices ${psi.scores.bestPractices ?? '–'}, SEO ${psi.scores.seo ?? '–'}`,
    ...psi.metrics.map((m) => `${m.plain}: ${m.value}`),
    ...(psi.opportunities.length ? [`Biggest suggested improvements: ${psi.opportunities.join('; ')}`] : []),
  );
  return area;
}

const digits = (s: string) => s.replace(/\D/g, '');
const lastNine = (s: string) => digits(s).slice(-9);
const simplify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/\b(ltd|limited|llc|inc|plc|the)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function consistencyArea(profile: Profile | null, site: WebsiteReport | null): Area | null {
  if (!profile || !site?.reachable) return null;
  const googlePhone = profile.internationalPhone ?? profile.phone;
  const phoneMatch = googlePhone && site.phonesFound.length ? site.phonesFound.some((p) => lastNine(p) === lastNine(googlePhone)) : undefined;
  const name = simplify(profile.name);
  const nameMatch = name ? site.namesFound.some((n) => simplify(n).includes(name) || name.includes(simplify(n))) : undefined;
  const addressMatch = site.addressCheck?.found;
  const parts = [
    `name ${nameMatch === undefined ? 'not found on the site' : nameMatch ? 'matches' : 'differs'}`,
    `address ${addressMatch === undefined ? 'not compared' : addressMatch ? 'found on the site' : 'not found on the site'}`,
    `phone ${phoneMatch === undefined ? 'not found on the site' : phoneMatch ? 'matches' : 'differs'}`,
  ];
  const allMatch = nameMatch === true && addressMatch === true && phoneMatch === true;
  const area = buildArea('consistency', [result('consistency-nap', allMatch ? 'Good' : 'Needs attention', parts.join(', '))], (status) => (status === 'Good' ? 'Your name, address and phone match.' : 'Your details differ, or some are missing from your website.'));
  area.found.push(
    `Google phone: ${googlePhone ?? 'not listed'}`,
    `Phone numbers found on your website: ${site.phonesFound.length ? site.phonesFound.join(', ') : 'none found as links or structured data'}`,
    `Google address: ${profile.address || 'not shown'}`,
    `Business name on your website: ${site.namesFound.length ? site.namesFound.slice(0, 3).join(' · ') : 'not found'}`,
  );
  return area;
}

// Highest priority first; one fix per issue.
export function topFixes(areas: Area[]) {
  const seen = new Set<string>();
  return areas
    .flatMap((a, ai) => a.fixes.map((f, fi) => ({ ...f, order: ai * 10 + fi })))
    .sort((a, b) => b.weight - a.weight || a.order - b.order)
    .filter((f) => (seen.has(f.key) ? false : (seen.add(f.key), true)))
    .slice(0, 3)
    .map((f) => f.text);
}

export const baselineLabel = BASELINE_LABEL;

export const notChecked = ['Instagram', 'Facebook', 'TikTok', 'How quickly you reply to enquiries', 'How you follow up with customers', 'Your sales data'];
