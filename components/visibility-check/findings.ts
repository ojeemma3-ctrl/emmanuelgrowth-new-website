// Applies the visibility check standard (lib/check-standard.ts) to the raw check results.
// All thresholds, wording for "why it matters", priorities and effort live in the standard;
// this file only measures values and picks the status each rule's thresholds give.
import { areaTitles, BASELINE_LABEL, displayPriority, effortOrder, formatCount, isMeasured, limits, priorityOrder, ruleById, type AreaId, type Priority, type Rule, type Status } from '../../lib/check-standard';
import { isGenericCategory } from '../../lib/visibility/category';
import type { Competitor, Profile } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';

export type { Status };

export type Fix = { key: string; text: string; ruleId?: string; area: string; severity: number; priority: number; effort: number; label: Priority | null };

export type RuleResult = { rule: Rule; status: Status; value: string };

export type Area = {
  id: string;
  title: string;
  status: Status;
  line: string;
  found: string[]; // plain lines, used when an area has no rule results (e.g. couldn't check)
  results: RuleResult[];
  extra: string[]; // context lines shown with the rule findings (address checked, other scores...)
  why: string;
  fix: string;
  fixes: Fix[];
};

export type Outcome<T> = { state: 'waiting' } | { state: 'done'; data: T } | { state: 'skipped'; reason: string } | { state: 'failed'; reason: string };

const severity: Record<Status, number> = { Problem: 2, 'Needs attention': 1, Good: 0, 'Couldn’t check': 0, 'Couldn’t compare fairly': 0, 'Not checked automatically': 0 };
const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined);

const result = (id: string, status: Status, value: string): RuleResult => ({ rule: ruleById[id], status, value });
const manual = (id: string): RuleResult => result(id, 'Not checked automatically', 'Not checked automatically');

function fixFromRule(rule: Rule, status: Status, area: string): Fix {
  const label = displayPriority(rule, status);
  return { key: rule.issue ?? rule.id, ruleId: rule.id, text: rule.action, area, severity: severity[status], priority: priorityOrder[label ?? rule.priority], effort: effortOrder[rule.effort] ?? 9, label };
}

function buildArea(id: AreaId, results: RuleResult[], line: (status: Status) => string): Area {
  const checked = results.filter((r) => r.rule.mode === 'automatic' && isMeasured(r.status));
  const worst = checked.reduce<Status>((acc, r) => (severity[r.status] > severity[acc] ? r.status : acc), 'Good');
  const status: Status = checked.length ? worst : 'Couldn’t check';
  const failing = checked.filter((r) => r.status === 'Problem' || r.status === 'Needs attention');
  const fixes: Fix[] = failing.map((r) => fixFromRule(r.rule, r.status, id));
  return {
    id,
    title: areaTitles[id],
    status,
    line: line(status),
    results,
    extra: [],
    found: results.map((r) => `${r.rule.displayName}: ${r.value}${r.rule.mode === 'automatic' && isMeasured(r.status) ? ` (${r.status})` : ''}`),
    why: (failing[0] ?? results[0]).rule.why,
    fix: failing.length ? failing.map((r) => r.rule.action).join('. ') + '.' : 'Nothing urgent here.',
    fixes,
  };
}

function couldntCheck(id: AreaId, line: string, found: string[]): Area {
  return { id, title: areaTitles[id], status: 'Couldn’t check', line, found, results: [], extra: [], why: 'We only report on what we could actually check.', fix: 'You can run the check again later.', fixes: [] };
}

// Google business profile
export function profileArea(profile: Profile | null, social: string | null): Area {
  if (!profile) {
    return {
      id: 'profile', title: areaTitles.profile, status: 'Problem', results: [], extra: [],
      line: 'No Google business profile was selected for this check.',
      found: ['You told us your business isn’t listed on Google, so there was no profile to check.'],
      why: 'A Google business profile is how many local customers find you on Google Search and Maps.',
      fix: 'Create or claim your free Google business profile.',
      fixes: [{ key: 'gbp', text: 'Create or claim your free Google business profile', area: 'profile', severity: 2, priority: 0, effort: 4, label: 'Fix first' }],
    };
  }
  const operational = !profile.businessStatus || profile.businessStatus === 'OPERATIONAL';
  const photos = profile.photoCount;
  const results: RuleResult[] = [
    result('gbp-status', operational ? 'Good' : 'Problem', profile.businessStatus ? profile.businessStatus.replace(/_/g, ' ').toLowerCase() : 'not shown'),
    result('gbp-category', !profile.category ? 'Problem' : isGenericCategory(profile.categoryType, profile.category) ? 'Needs attention' : 'Good', !profile.category ? 'not set' : isGenericCategory(profile.categoryType, profile.category) ? `“${profile.category}” is very general` : profile.category),
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

export const UNFAIR_COMPARISON = 'The nearby businesses are much larger or smaller than yours, so this comparison may not be fair.';

// A comparison is fair only when this business's review count is within ten times the nearby median, either way.
export const fairComparison = (own: number, typical: number) => (typical > 0 ? own >= typical / 10 && own <= typical * 10 : own === 0);

// Reviews: count compared with nearby businesses, rating, recent review.
export function competitorArea(profile: Profile | null, outcome: Outcome<{ rows: Competitor[]; query?: string }>): Area | null {
  if (!profile || outcome.state === 'waiting') return null;
  const own = profile.reviewCount ?? 0;
  let countResult: RuleResult;
  let typical: number | undefined;
  let fair = false;
  if (outcome.state === 'done' && outcome.data.rows.length) {
    typical = median(outcome.data.rows.map((r) => r.reviewCount ?? 0));
    fair = fairComparison(own, typical);
    const ratio = typical > 0 ? own / typical : 1;
    if (!fair) {
      // The table is still shown, but the count isn't rated against businesses of a very different size.
      countResult = result('reviews-count', 'Couldn’t compare fairly', `You have ${formatCount(own)} reviews; similar businesses nearby typically have ${formatCount(typical)}. ${UNFAIR_COMPARISON}`);
    } else {
      let status: Status = 'Good';
      if (own < limits.reviewsFloor || ratio < limits.reviewsQuarterOfTypical) status = 'Problem';
      else if (ratio < limits.reviewsHalfOfTypical) status = 'Needs attention';
      countResult = result('reviews-count', status, `${formatCount(own)} reviews; similar businesses nearby typically have ${formatCount(typical)}`);
    }
  } else {
    const reason = outcome.state === 'skipped' ? outcome.reason : outcome.state === 'failed' ? 'failed' : 'too_few';
    countResult = result('reviews-count', 'Couldn’t check', reason === 'generic_category'
      ? `Couldn’t compare: your Google category is very general. You have ${formatCount(own)} reviews.`
      : reason === 'failed'
        ? `Couldn’t compare: the nearby search didn’t respond. You have ${formatCount(own)} reviews.`
        : `Couldn’t compare: we found fewer than 3 similar businesses nearby. You have ${formatCount(own)} reviews.`);
  }
  const results: RuleResult[] = [
    countResult,
    result('reviews-rating', profile.rating && profile.rating >= limits.ratingGood ? 'Good' : 'Needs attention', profile.rating ? `${profile.rating}` : 'no rating yet'),
    result('reviews-recent', 'Not checked automatically', formatDate(profile.latestReviewDate) ? `Among the reviews Google returned, the newest is ${formatDate(profile.latestReviewDate)}. Check your profile for newer ones.` : 'Google returned no reviews to look at. Check your profile for recent ones.'),
    manual('reviews-owner-replies'),
  ];
  const area = buildArea('reviews', results, () => (typical === undefined
    ? `You have ${formatCount(own)} reviews.`
    : fair
      ?`You have ${formatCount(own)} reviews. Similar businesses nearby typically have ${formatCount(typical)}.`
      : `You have ${formatCount(own)} reviews. ${UNFAIR_COMPARISON}`));
  // One review fix at most, and only when it's warranted: under 10 reviews, a rating under 4.5,
  // or a fair comparison where the count is below half the nearby median.
  const askForReviews = own < limits.reviewsFloor
    || (profile.rating !== undefined && profile.rating < limits.ratingGood)
    || (typical !== undefined && fair && own < typical * limits.reviewsHalfOfTypical);
  // Under 10 reviews with an unfair comparison has no failing rule, so it gets a "Next" fix of its own.
  const strongest = [...area.fixes].sort((a, b) => b.severity - a.severity || a.priority - b.priority)[0]
    ?? fixFromRule(ruleById['reviews-count'], 'Needs attention', 'reviews');
  const ask = ruleById['reviews-count'];
  area.fixes = askForReviews ? [{ ...strongest, key: 'reviews', ruleId: ask.id, text: ask.action, effort: effortOrder[ask.effort] ?? 9 }] : [];
  return area;
}

// Responses that usually mean the site blocked our automated visit, not that the site is broken.
const BLOCKED_STATUSES = new Set([401, 403, 405, 406, 429, 503]);

export function websiteArea(outcome: Outcome<WebsiteReport>, hasWebsite: boolean, social: string | null, fromProfile: boolean): Area | null {
  if (social) {
    const line = fromProfile ? `Your Google profile links to ${social}, not a website.` : `The address you gave is a ${social} page, not a website.`;
    return {
      id: 'website', title: areaTitles.website, status: 'Needs attention', line, results: [], extra: [],
      found: [line, 'Website checks and the speed test were skipped, because they would test the platform’s own site rather than yours.'],
      why: ruleById['gbp-website'].why,
      fix: `${ruleById['gbp-website'].action}.`,
      fixes: [fixFromRule(ruleById['gbp-website'], 'Needs attention', 'website')],
    };
  }
  if (!hasWebsite) {
    return {
      id: 'website', title: areaTitles.website, status: 'Needs attention', line: 'No website was found to check.', results: [], extra: [],
      found: ['There is no website on your Google profile, and none was entered.'],
      why: ruleById['gbp-website'].why,
      fix: `${ruleById['gbp-website'].action}.`,
      fixes: [fixFromRule(ruleById['gbp-website'], 'Needs attention', 'website')],
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
      id: 'website', title: areaTitles.website, status: 'Problem', line: 'Your website returned an error page.', results: [], extra: [],
      found: [`Address checked: ${site.url}`, `Result: status ${site.status}`],
      why: 'If the page shows an error for us, it may show one for some customers too.',
      fix: 'Check your website address is correct and that the home page loads on a phone.',
      fixes: [{ key: 'site-error', text: 'Check your website address and that the home page loads', area: 'website', severity: 2, priority: 0, effort: 4, label: 'Fix first' }],
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
  area.extra.unshift(`Page tested: ${site.finalUrl}${site.redirectCount ? ` (after ${site.redirectCount} redirect${site.redirectCount === 1 ? '' : 's'})` : ''}`);
  return area;
}

export function contactArea(site: WebsiteReport | null, profile: Profile | null = null): Area | null {
  if (!site?.reachable) return null;
  const googlePhone = profile?.internationalPhone ?? profile?.phone;
  const phoneAsText = googlePhone ? site.textPhones.some((p) => phonesMatch(p, googlePhone)) : false;
  const ways = [site.telLinks && `${site.telLinks} tap-to-call`, site.whatsappLinks && `${site.whatsappLinks} WhatsApp`, site.bookingLinks && `${site.bookingLinks} booking`].filter(Boolean);
  const formOnly = !ways.length && site.hasContactForm;
  const FORM_ONLY = 'We found a contact form, but no one-tap way to call, message or book.';
  const missing = formOnly
    ? `${FORM_ONLY} Page tested: ${site.finalUrl}. Links added by scripts may not be visible to our check.`
    : `We didn’t find a tap-to-call, WhatsApp or booking link on ${site.finalUrl}. Links added by scripts may not be visible to our check.`;
  const results = [result('contact-links', ways.length ? 'Good' : 'Needs attention', ways.length ? `${ways.join(', ')} link${ways.length === 1 ? '' : 's'} on ${site.finalUrl}` : `${missing}${phoneAsText ? ' Your phone number does appear as plain text on the page.' : ''}`)];
  const area = buildArea('contact', results, (status) => (status === 'Good' ? 'Customers can reach you in one tap from your website.' : formOnly ? FORM_ONLY : 'We found no one-tap way to call, message or book.'));
  area.extra.push(`Page tested: ${site.finalUrl}`, `Email links: ${site.mailtoLinks}`, `Contact form: ${site.hasContactForm ? 'found' : 'not found'}`, `Social links: ${site.socialLinks.length ? site.socialLinks.join(', ') : 'none found'}`);
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

// "Scored 47 on 19 October 2026. Scores can vary between tests."
export function speedNote(psi: PageSpeedReport, fallbackDate: string) {
  return `Scored ${psi.scores.performance} on ${formatDate(psi.testedAt) ?? fallbackDate}. Scores can vary between tests.`;
}

export function speedArea(outcome: Outcome<PageSpeedReport>, fallbackDate: string): Area | null {
  if (outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed' || outcome.data.scores.performance === undefined) {
    return couldntCheck('speed', 'Google’s speed test was unavailable this time.', ['Google PageSpeed didn’t return a result for this check.']);
  }
  const psi = outcome.data;
  const perf = psi.scores.performance as number;
  const status: Status = perf >= limits.speedGood ? 'Good' : perf >= limits.speedAttention ? 'Needs attention' : 'Problem';
  const note = speedNote(psi, fallbackDate);
  const area = buildArea('speed', [result('speed-mobile', status, `${perf} out of 100. ${note}`)], () => `Google’s mobile test scored performance ${perf} out of 100. ${note}`);
  area.extra.push(
    `Other scores out of 100: accessibility ${psi.scores.accessibility ?? '–'}, best practices ${psi.scores.bestPractices ?? '–'}, SEO ${psi.scores.seo ?? '–'}`,
    ...psi.metrics.map((m) => `${m.plain}: ${m.value}`),
    ...(psi.opportunities.length ? [`Biggest suggested improvements: ${psi.opportunities.join('; ')}`] : []),
  );
  return area;
}

// Phone numbers: digits only, international prefix (+ or 00) and the national leading 0 removed,
// then two numbers match when one ends with the other (so +33 5 62… matches 05 62…).
const nationalDigits = (s: string) => s.replace(/\D/g, '').replace(/^00/, '').replace(/^0+/, '');
export function phonesMatch(a: string, b: string) {
  const x = nationalDigits(a);
  const y = nationalDigits(b);
  if (x.length < 7 || y.length < 7) return false;
  return x.endsWith(y) || y.endsWith(x);
}
const simplify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/\b(ltd|limited|llc|inc|plc|the)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function consistencyArea(profile: Profile | null, site: WebsiteReport | null): Area | null {
  if (!profile || !site?.reachable) return null;
  const googlePhone = profile.internationalPhone ?? profile.phone;
  const sitePhones = [...site.phonesFound, ...site.textPhones];
  const phoneMatch = googlePhone && sitePhones.length ? sitePhones.some((p) => phonesMatch(p, googlePhone)) : undefined;
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
  area.extra.push(
    `Google phone: ${googlePhone ?? 'not listed'}`,
    `Phone numbers found on ${site.finalUrl}: ${sitePhones.length ? sitePhones.slice(0, 6).join(', ') : 'none found in links, structured data or page text'}`,
    `Google address: ${profile.address || 'not shown'}`,
    `Business name on your website: ${site.namesFound.length ? site.namesFound.slice(0, 3).join(' · ') : 'not found'}`,
  );
  return area;
}

// Top 3: Problem before Needs attention, then priority, then quickest effort.
// One fix per issue, and at most one per area unless there aren't enough areas to fill three.
export function topFixes(areas: Area[]) {
  const sorted = areas
    .flatMap((a, ai) => a.fixes.map((f, fi) => ({ ...f, order: ai * 10 + fi })))
    .sort((a, b) => b.severity - a.severity || a.priority - b.priority || a.effort - b.effort || a.order - b.order);
  const picked: typeof sorted = [];
  const issues = new Set<string>();
  const usedAreas = new Set<string>();
  for (const pass of [true, false]) {
    for (const f of sorted) {
      if (picked.length >= 3) break;
      if (issues.has(f.key) || (pass && usedAreas.has(f.area))) continue;
      picked.push(f);
      issues.add(f.key);
      usedAreas.add(f.area);
    }
  }
  return picked
    .sort((a, b) => b.severity - a.severity || a.priority - b.priority || a.effort - b.effort || a.order - b.order)
    .map((f) => ({ key: f.key, text: f.text, rule: f.ruleId ? ruleById[f.ruleId] : undefined, priority: f.label }));
}

// Nearby comparison summary: typical (median) review count, range and this business's rank by reviews.
export function reviewStats(ownCount: number, rows: Competitor[]) {
  const counts = rows.map((r) => r.reviewCount ?? 0);
  const typical = median(counts);
  const rank = 1 + counts.filter((c) => c > ownCount).length;
  return { typical, min: Math.min(...counts), max: Math.max(...counts), rank, of: counts.length + 1, fair: fairComparison(ownCount, typical) };
}

export const baselineLabel = BASELINE_LABEL;

export const notChecked = ['Instagram', 'Facebook', 'TikTok', 'How quickly you reply to enquiries', 'How you follow up with customers', 'Your sales data'];
