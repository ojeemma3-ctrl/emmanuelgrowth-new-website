// Turns raw check results into plain-English findings, area statuses and the top 3 fixes.
// Wording rules: factual, no statistics, no predictions, no fear language.
import type { Competitor, Profile } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';

export type Status = 'Good' | 'Needs attention' | 'Problem' | 'Couldn’t check';

// Each fix carries an issue key so the Top 3 never lists the same issue twice.
export type Fix = { key: string; text: string; weight: number };

export type Area = {
  id: string;
  title: string;
  status: Status;
  line: string;
  found: string[];
  why: string;
  fix: string;
  fixes: Fix[];
};

// Result of a check that may have been skipped or failed.
export type Outcome<T> = { state: 'waiting' } | { state: 'done'; data: T } | { state: 'skipped'; reason: string } | { state: 'failed'; reason: string };

const weight: Record<Status, number> = { Problem: 3, 'Needs attention': 2, Good: 0, 'Couldn’t check': 0 };
const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined);
const monthsSince = (iso?: string) => (iso ? (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24 * 30.4) : Infinity);

function couldntCheck(id: string, title: string, line: string, found: string[]): Area {
  return { id, title, status: 'Couldn’t check', line, found, why: 'We only report on what we could actually check.', fix: 'You can run the check again later, or ask us to look at it by hand.', fixes: [] };
}

export function profileArea(profile: Profile | null, social: string | null): Area {
  if (!profile) {
    return {
      id: 'profile', title: 'Google business profile', status: 'Problem',
      line: 'No Google business profile was selected for this check.',
      found: ['You told us your business isn’t listed on Google, so there was no profile to check.'],
      why: 'A Google business profile is how many local customers find you on Google Search and Maps.',
      fix: 'Create or claim your free Google business profile and add your category, phone, website, hours and photos.',
      fixes: [{ key: 'gbp', text: 'Create or claim your free Google business profile so you can appear on Google Maps.', weight: 3 }],
    };
  }
  const missing: string[] = [];
  if (!profile.phone) missing.push('phone number');
  if (!profile.hasOpeningHours) missing.push('opening hours');
  if (profile.photoCount === 0) missing.push('photos');
  const noRealWebsite = !profile.website || Boolean(social);
  const fewPhotos = profile.photoCount > 0 && profile.photoCount < 5;
  const staleReviews = (profile.reviewCount ?? 0) > 0 && monthsSince(profile.latestReviewDate) > 3;
  const noReviews = !profile.reviewCount;
  const closed = profile.businessStatus && profile.businessStatus !== 'OPERATIONAL';
  const gaps = missing.length + (noRealWebsite ? 1 : 0);

  let status: Status = 'Good';
  if (closed || gaps >= 2) status = 'Problem';
  else if (gaps || fewPhotos || staleReviews || noReviews) status = 'Needs attention';

  const fixes: Fix[] = [];
  if (closed) fixes.push({ key: 'closed', text: 'Your Google profile is not marked as open. Check its business status is correct.', weight: 3 });
  if (missing.length) fixes.push({ key: 'profile-details', text: `Add your ${missing.join(', ')} to your Google business profile.`, weight: missing.length >= 2 ? 3 : 2 });
  if (noRealWebsite) fixes.push({ key: 'website', text: social ? `Your Google profile links to ${social}, not a website. Add a simple website and link to it from your profile.` : 'Add a simple website and list it on your Google profile.', weight: 2 });
  if (noReviews) fixes.push({ key: 'reviews', text: 'Ask your recent customers for a Google review to start building trust.', weight: 2 });
  else if (staleReviews) fixes.push({ key: 'reviews', text: 'Ask recent customers for a Google review so your profile shows fresh feedback.', weight: 2 });
  if (fewPhotos) fixes.push({ key: 'photos', text: 'Add more photos of your work, team and premises to your Google profile.', weight: 1 });

  const shownMissing = [...missing, ...(noRealWebsite ? [social ? `website (it links to ${social})` : 'website'] : [])];
  return {
    id: 'profile', title: 'Google business profile', status,
    line: status === 'Good' ? 'Your profile has the main details customers look for.' : closed ? 'Your profile is not marked as open.' : shownMissing.length ? `Missing: ${shownMissing.join(', ')}.` : 'Your profile is set up, with a few things to improve.',
    found: [
      `Name: ${profile.name}`,
      `Category: ${profile.category ?? 'not set'}`,
      `Address: ${profile.address || 'not shown'}`,
      `Phone: ${profile.phone ?? 'missing'}`,
      `Website listed: ${profile.website ? (social ? `a ${social} page, not a website` : 'Yes') : 'No'}`,
      `Opening hours: ${profile.hasOpeningHours ? 'present' : 'missing'}`,
      `Photos: ${profile.photosCapped ? '10 or more' : profile.photoCount}`,
      `Rating: ${profile.rating ? `${profile.rating} from ${profile.reviewCount ?? 0} reviews` : 'no rating yet'}`,
      `Status: ${profile.businessStatus ? profile.businessStatus.replace(/_/g, ' ').toLowerCase() : 'not shown'}`,
      `Latest review (of the reviews Google returned): ${formatDate(profile.latestReviewDate) ?? 'none returned'}`,
    ],
    why: 'Your Google profile is often the first thing local customers see, and complete details give them more reasons to choose you.',
    fix: fixes.length ? fixes.map((f) => f.text).join(' ') : 'Keep your profile up to date and keep adding photos and replying to reviews.',
    fixes,
  };
}

const median = (values: number[]) => {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function competitorArea(profile: Profile | null, outcome: Outcome<{ rows: Competitor[]; query?: string }>): Area | null {
  if (!profile || outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed') return couldntCheck('competitors', 'Compared with nearby businesses', 'We couldn’t run the nearby search this time.', ['Google’s search didn’t respond for this part of the check.']);
  const rows = outcome.data.rows;
  const query = outcome.data.query;
  const counts = rows.map((r) => r.reviewCount ?? 0);
  const med = median(counts);
  const own = profile.reviewCount ?? 0;
  const ratings = rows.map((r) => r.rating).filter((r): r is number => typeof r === 'number');
  const medRating = median(ratings);
  const withSite = rows.filter((r) => r.hasWebsite).length;
  let status: Status = 'Good';
  if (own === 0 && med > 0) status = 'Problem';
  else if (own < med || (profile.rating && ratings.length && profile.rating < medRating - 0.2)) status = 'Needs attention';
  return {
    id: 'competitors', title: 'Compared with nearby businesses', status,
    line: rows.length ? `You have ${own} reviews. The ${rows.length} similar businesses we found have a middle value of ${med}.` : 'We did not find similar businesses nearby to compare with.',
    found: [
      query ? `We searched Google for “${query}”.` : 'We searched Google for similar businesses nearby.',
      ratings.length ? `Their middle rating is ${medRating}. Yours is ${profile.rating ?? 'not shown'}.` : 'No ratings were returned for them.',
      `${withSite} of ${rows.length} list a website on Google. You ${profile.website ? 'do' : 'do not'}.`,
    ],
    why: 'Customers often compare a few local options side by side before they get in touch.',
    fix: 'Ask every happy customer for a review, reply to the reviews you get, and keep your profile details complete.',
    fixes: status === 'Good' ? [] : [{ key: 'reviews', text: 'Ask every happy customer for a Google review, with a simple link they can tap.', weight: weight[status] }],
  };
}

// Responses that usually mean the site blocked our automated visit, not that the site is broken.
const BLOCKED_STATUSES = new Set([401, 403, 405, 406, 429, 503]);

export function websiteArea(outcome: Outcome<WebsiteReport>, hasWebsite: boolean, social: string | null, fromProfile: boolean): Area | null {
  if (social) {
    const line = fromProfile ? `Your Google profile links to ${social}, not a website.` : `The address you gave is a ${social} page, not a website.`;
    return {
      id: 'website', title: 'Website basics', status: 'Problem', line,
      found: [line, 'Website checks and the speed test were skipped, because they would test the platform’s own site rather than yours.'],
      why: 'A simple website gives customers one place to see your services, work and contact options.',
      fix: 'Add a simple website and link to it from your Google profile.',
      fixes: [{ key: 'website', text: `${line} Add a simple website and link to it from your profile.`, weight: 2 }],
    };
  }
  if (!hasWebsite) {
    return {
      id: 'website', title: 'Website basics', status: 'Problem',
      line: 'No website was found to check.',
      found: ['There is no website on your Google profile, and none was entered.'],
      why: 'A simple website gives customers somewhere to check what you do and how to reach you.',
      fix: 'Add a simple, phone-friendly website and list it on your Google profile.',
      fixes: [{ key: 'website', text: 'Add a simple, phone-friendly website and list it on your Google profile.', weight: 3 }],
    };
  }
  if (outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed') return couldntCheck('website', 'Website basics', 'We couldn’t run the website checks this time.', ['The website check didn’t complete.']);
  const site = outcome.data;
  if (!site.reachable) {
    if (site.error || (site.status && BLOCKED_STATUSES.has(site.status))) {
      return couldntCheck('website', 'Website basics', 'We couldn’t load your website for this check. Some sites block automated visits.', [
        `Address checked: ${site.url}`,
        `Result: ${site.error ? site.error.replace(/_/g, ' ') : `status ${site.status}`}`,
      ]);
    }
    return {
      id: 'website', title: 'Website basics', status: 'Problem',
      line: 'Your website returned an error page.',
      found: [`Address checked: ${site.url}`, `Result: status ${site.status}`],
      why: 'If the page shows an error for us, it may show one for some customers too.',
      fix: 'Check your website address is correct and that the home page loads on a phone.',
      fixes: [{ key: 'site-error', text: 'Your website returned an error page. Check the address and that the home page loads on a phone.', weight: 3 }],
    };
  }
  const fixes: Fix[] = [];
  if (!site.https) fixes.push({ key: 'https', text: 'Switch your website to a secure https address.', weight: 3 });
  else if (site.httpRedirectsToHttps === false) fixes.push({ key: 'https-redirect', text: 'Make the plain http address forward to your secure https page.', weight: 1 });
  if (site.noindex) fixes.push({ key: 'noindex', text: 'Your home page is set to “noindex”, which asks search engines not to list it. Remove that setting.', weight: 3 });
  if (!site.hasViewport) fixes.push({ key: 'viewport', text: 'Add a mobile viewport setting so your site fits phone screens.', weight: 2 });
  if (!site.title) fixes.push({ key: 'title', text: 'Add a page title that says what you do and where.', weight: 2 });
  if (!site.metaDescription) fixes.push({ key: 'meta-description', text: 'Add a short description for search results that says what you do and where.', weight: 1 });
  if (!site.h1s.length) fixes.push({ key: 'h1', text: 'Add one clear main heading that says what you do.', weight: 1 });
  if (!site.openGraph.title || !site.openGraph.image) fixes.push({ key: 'open-graph', text: 'Add sharing tags (Open Graph) so links to your site show a title and image.', weight: 1 });
  const top = Math.max(0, ...fixes.map((f) => f.weight));
  const status: Status = top >= 3 ? 'Problem' : top >= 2 || fixes.length >= 3 ? 'Needs attention' : 'Good';
  return {
    id: 'website', title: 'Website basics', status,
    line: status === 'Good' ? 'The basic set-up search engines and phones need is in place.' : `${fixes.length} thing${fixes.length === 1 ? '' : 's'} to tidy up.`,
    found: [
      `Address checked: ${site.finalUrl}${site.redirectCount ? ` (after ${site.redirectCount} redirect${site.redirectCount === 1 ? '' : 's'})` : ''}`,
      `Secure https: ${yesNo(site.https)}${site.httpRedirectsToHttps === undefined ? '' : ` · http forwards to https: ${yesNo(site.httpRedirectsToHttps)}`}`,
      `Page title: ${site.title ?? 'missing'}`,
      `Search description: ${site.metaDescription ? 'present' : 'missing'}`,
      `Main headings (H1): ${site.h1s.length ? site.h1s.join(' · ') : 'none found'}`,
      `Mobile viewport: ${site.hasViewport ? 'present' : 'missing'}`,
      `Canonical address: ${site.canonical ?? 'not set'}`,
      `Asks search engines not to list it (noindex): ${yesNo(site.noindex)}`,
      `Sharing tags (Open Graph): title ${yesNo(site.openGraph.title)}, description ${yesNo(site.openGraph.description)}, image ${yesNo(site.openGraph.image)}`,
    ],
    why: 'These basics help your site show properly in search results and on phones.',
    fix: fixes.length ? fixes.map((f) => f.text).join(' ') : 'Nothing urgent here.',
    fixes,
  };
}

export function contactArea(site: WebsiteReport | null): Area | null {
  if (!site?.reachable) return null;
  const fixes: Fix[] = [];
  if (!site.telLinks) fixes.push({ key: 'tap-to-call', text: 'Add a tap-to-call button to your website.', weight: 2 });
  if (!site.whatsappLinks) fixes.push({ key: 'whatsapp', text: 'Add a WhatsApp button so customers can message you in one tap.', weight: 1 });
  if (!site.hasContactForm && !site.mailtoLinks) fixes.push({ key: 'contact-form', text: 'Add a simple contact form or email link.', weight: 1 });
  const status: Status = !site.telLinks && !site.whatsappLinks ? 'Problem' : fixes.length ? 'Needs attention' : 'Good';
  return {
    id: 'contact', title: 'Ways to contact you on your website', status,
    line: status === 'Good' ? 'Customers can call, message or write to you from your website.' : status === 'Problem' ? 'We found no tap-to-call or WhatsApp link.' : 'Some quick contact options are missing.',
    found: [
      `Tap-to-call links: ${site.telLinks}`,
      `WhatsApp links: ${site.whatsappLinks}`,
      `Email links: ${site.mailtoLinks}`,
      `Contact form: ${site.hasContactForm ? 'found' : 'not found'}`,
      `Social links: ${site.socialLinks.length ? site.socialLinks.join(', ') : 'none found'}`,
    ],
    why: 'The easier it is to get in touch, the more interested visitors actually reach you.',
    fix: fixes.length ? fixes.map((f) => f.text).join(' ') : 'Nothing urgent here.',
    fixes,
  };
}

export function searchArea(site: WebsiteReport | null): Area | null {
  if (!site?.reachable) return null;
  const hasBusinessSchema = site.schemaTypes.some((t) => /LocalBusiness|Organization|Store|Service|Contractor|Restaurant|Salon|Clinic|Dentist|Plumber|Electrician|Business/.test(t));
  const blockedBots = Object.entries(site.aiCrawlers).filter(([, r]) => r === 'blocked').map(([b]) => b);
  const fixes: Fix[] = [];
  if (site.robotsTxt.blocksAll) fixes.push({ key: 'robots-block', text: 'Your robots.txt blocks all search engines. Remove the “Disallow: /” rule for everyone.', weight: 3 });
  if (!site.sitemap.found) fixes.push({ key: 'sitemap', text: 'Add a sitemap.xml so search engines can find all your pages.', weight: 1 });
  if (!hasBusinessSchema) fixes.push({ key: 'schema', text: 'Add LocalBusiness structured data with your name, address, phone and hours.', weight: 2 });
  if (blockedBots.length) fixes.push({ key: 'ai-crawlers', text: `Decide whether you want AI assistants to read your site. Your robots.txt currently blocks ${blockedBots.join(', ')}.`, weight: 1 });
  const top = Math.max(0, ...fixes.map((f) => f.weight));
  const status: Status = top >= 3 ? 'Problem' : top >= 2 ? 'Needs attention' : 'Good';
  const describe = (r: string) => (r === 'blocked' ? 'blocked' : r === 'allowed' ? 'allowed' : 'not mentioned (general rules apply)');
  return {
    id: 'search', title: 'Search engines and AI assistants', status,
    line: status === 'Good' ? 'Search engines and AI assistants can read your site.' : 'A few signals that help search engines understand you are missing.',
    found: [
      `robots.txt: ${site.robotsTxt.found ? 'found' : 'not found'}${site.robotsTxt.blocksAll ? ' (blocks all crawlers)' : ''}`,
      `sitemap.xml: ${site.sitemap.found ? 'found' : 'not found'}`,
      `Structured data types: ${site.schemaTypes.length ? site.schemaTypes.join(', ') : 'none found'}`,
      ...Object.entries(site.aiCrawlers).map(([bot, rule]) => `${bot}: ${describe(rule)}`),
    ],
    why: 'Clear signals help Google and AI assistants understand what you do and where you work.',
    fix: fixes.length ? fixes.map((f) => f.text).join(' ') : 'Nothing urgent here.',
    fixes,
  };
}

export function speedArea(outcome: Outcome<PageSpeedReport>): Area | null {
  if (outcome.state === 'waiting' || outcome.state === 'skipped') return null;
  if (outcome.state === 'failed' || outcome.data.scores.performance === undefined) {
    return couldntCheck('speed', 'Website speed on a phone', 'Google’s speed test was unavailable this time.', ['Google PageSpeed didn’t return a result for this check.']);
  }
  const psi = outcome.data;
  const perf = psi.scores.performance as number;
  const status: Status = perf >= 90 ? 'Good' : perf >= 50 ? 'Needs attention' : 'Problem';
  return {
    id: 'speed', title: 'Website speed on a phone', status,
    line: `Google’s mobile test scored performance ${perf} out of 100.`,
    found: [
      `Scores out of 100: performance ${perf}, accessibility ${psi.scores.accessibility ?? '–'}, best practices ${psi.scores.bestPractices ?? '–'}, SEO ${psi.scores.seo ?? '–'}`,
      ...psi.metrics.map((m) => `${m.plain}: ${m.value}`),
      ...(psi.opportunities.length ? [`Biggest suggested improvements: ${psi.opportunities.join('; ')}`] : []),
    ],
    why: 'A page that loads slowly on a phone is easy to give up on.',
    fix: psi.opportunities.length ? `Start with: ${psi.opportunities.join('; ')}.` : 'Keep images small and avoid heavy add-ons.',
    fixes: status === 'Good' ? [] : [{ key: 'speed', text: `Speed up your website on phones${psi.opportunities[0] ? `, starting with: ${psi.opportunities[0].toLowerCase()}` : ''}.`, weight: weight[status] }],
  };
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
  const fixes: Fix[] = [];
  if (phoneMatch === false) fixes.push({ key: 'phone-mismatch', text: 'The phone number on your website does not match your Google profile. Use the same number on both.', weight: 3 });
  if (phoneMatch === undefined) fixes.push({ key: 'tap-to-call', text: 'Show your phone number on your website as a tap-to-call link, matching your Google profile.', weight: 1 });
  if (nameMatch === false) fixes.push({ key: 'name-mismatch', text: 'Use the same business name on your website as on your Google profile.', weight: 2 });
  const top = Math.max(0, ...fixes.map((f) => f.weight));
  const status: Status = top >= 3 ? 'Problem' : top >= 2 ? 'Needs attention' : 'Good';
  return {
    id: 'consistency', title: 'Consistency between Google and your website', status,
    line: status === 'Good' ? 'Your name and phone number look consistent.' : 'Your details differ, or we could not compare them.',
    found: [
      `Google phone: ${googlePhone ?? 'not listed'}`,
      `Phone numbers found on your website: ${site.phonesFound.length ? site.phonesFound.join(', ') : 'none found as links or structured data'}`,
      `Phone matches: ${phoneMatch === undefined ? 'could not compare' : yesNo(phoneMatch)}`,
      `Business name on your website: ${site.namesFound.length ? site.namesFound.slice(0, 3).join(' · ') : 'not found'}`,
      `Name matches Google: ${nameMatch === undefined ? 'could not compare' : yesNo(nameMatch)}`,
    ],
    why: 'Matching details everywhere help customers and search engines trust they have found the right business.',
    fix: fixes.length ? fixes.map((f) => f.text).join(' ') : 'Nothing urgent here.',
    fixes,
  };
}

// Highest-weight fixes first; only one fix per issue key.
export function topFixes(areas: Area[]) {
  const seen = new Set<string>();
  return areas
    .flatMap((a, ai) => a.fixes.map((f, fi) => ({ ...f, order: ai * 10 + fi })))
    .sort((a, b) => b.weight - a.weight || a.order - b.order)
    .filter((f) => (seen.has(f.key) ? false : (seen.add(f.key), true)))
    .slice(0, 3)
    .map((f) => f.text);
}

export const notChecked = ['Instagram', 'Facebook', 'TikTok', 'How quickly you reply to enquiries', 'How you follow up with customers', 'Your sales data'];
