// Turns raw check results into plain-English findings, area statuses and the top 3 fixes.
// Wording rules: factual, no statistics, no predictions, no fear language.
import type { Competitor, Profile } from '../../lib/visibility/places';
import type { PageSpeedReport } from '../../lib/visibility/pagespeed';
import type { WebsiteReport } from '../../lib/visibility/website';

export type Status = 'Good' | 'Needs attention' | 'Problem';

export type Area = {
  id: string;
  title: string;
  status: Status;
  line: string;
  found: string[];
  why: string;
  fix: string;
  fixes: { text: string; weight: number }[];
};

const weight: Record<Status, number> = { Problem: 3, 'Needs attention': 2, Good: 0 };
const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined);
const monthsSince = (iso?: string) => (iso ? (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24 * 30.4) : Infinity);

export function profileArea(profile: Profile | null): Area {
  if (!profile) {
    return {
      id: 'profile', title: 'Google business profile', status: 'Problem',
      line: 'No Google business profile was selected for this check.',
      found: ['You told us your business isn’t listed on Google, so there was no profile to check.'],
      why: 'A Google business profile is how many local customers find you on Google Search and Maps.',
      fix: 'Create or claim your free Google business profile and add your category, phone, website, hours and photos.',
      fixes: [{ text: 'Create or claim your free Google business profile so you can appear on Google Maps.', weight: 3 }],
    };
  }
  const missing: string[] = [];
  if (!profile.phone) missing.push('phone number');
  if (!profile.website) missing.push('website');
  if (!profile.hasOpeningHours) missing.push('opening hours');
  if (profile.photoCount === 0) missing.push('photos');
  const fewPhotos = profile.photoCount > 0 && profile.photoCount < 5;
  const staleReviews = (profile.reviewCount ?? 0) > 0 && monthsSince(profile.latestReviewDate) > 3;
  const noReviews = !profile.reviewCount;
  const closed = profile.businessStatus && profile.businessStatus !== 'OPERATIONAL';

  let status: Status = 'Good';
  if (closed || missing.length >= 2) status = 'Problem';
  else if (missing.length || fewPhotos || staleReviews || noReviews) status = 'Needs attention';

  const fixes: Area['fixes'] = [];
  if (closed) fixes.push({ text: 'Your Google profile is not marked as open. Check its business status is correct.', weight: 3 });
  if (missing.length) fixes.push({ text: `Add your ${missing.join(', ')} to your Google business profile.`, weight: missing.length >= 2 ? 3 : 2 });
  if (noReviews) fixes.push({ text: 'Ask your recent customers for a Google review to start building trust.', weight: 2 });
  else if (staleReviews) fixes.push({ text: 'Ask recent customers for a Google review so your profile shows fresh feedback.', weight: 2 });
  if (fewPhotos) fixes.push({ text: 'Add more photos of your work, team and premises to your Google profile.', weight: 1 });

  return {
    id: 'profile', title: 'Google business profile', status,
    line: status === 'Good' ? 'Your profile has the main details customers look for.' : missing.length ? `Missing: ${missing.join(', ')}.` : closed ? 'Your profile is not marked as open.' : 'Your profile is set up, with a few things to improve.',
    found: [
      `Name: ${profile.name}`,
      `Category: ${profile.category ?? 'not set'}`,
      `Address: ${profile.address || 'not shown'}`,
      `Phone: ${profile.phone ?? 'missing'}`,
      `Website listed: ${yesNo(Boolean(profile.website))}`,
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

export function competitorArea(profile: Profile | null, rows: Competitor[] | null, query?: string): Area | null {
  if (!profile || !rows) return null;
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
    fixes: status === 'Good' ? [] : [{ text: 'Ask every happy customer for a Google review, with a simple link they can tap.', weight: weight[status] }],
  };
}

export function websiteArea(site: WebsiteReport | null, hasWebsite: boolean): Area {
  if (!hasWebsite || !site) {
    return {
      id: 'website', title: 'Website basics', status: 'Problem',
      line: 'No website was found to check.',
      found: ['There is no website on your Google profile, and none was entered.'],
      why: 'A simple website gives customers somewhere to check what you do and how to reach you.',
      fix: 'Add a simple, phone-friendly website and list it on your Google profile.',
      fixes: [{ text: 'Add a simple, phone-friendly website and list it on your Google profile.', weight: 3 }],
    };
  }
  if (!site.reachable) {
    return {
      id: 'website', title: 'Website basics', status: 'Problem',
      line: 'We could not load your website.',
      found: [`Address checked: ${site.url}`, `Result: ${site.error ? site.error.replace(/_/g, ' ') : `status ${site.status}`}`],
      why: 'If the page does not load for us, it may not load for some customers either.',
      fix: 'Check your website address is correct and that the site loads on a phone.',
      fixes: [{ text: 'Your website did not load for us. Check the address and that it works on a phone.', weight: 3 }],
    };
  }
  const fixes: Area['fixes'] = [];
  if (!site.https) fixes.push({ text: 'Switch your website to a secure https address.', weight: 3 });
  else if (site.httpRedirectsToHttps === false) fixes.push({ text: 'Make the plain http address forward to your secure https page.', weight: 1 });
  if (site.noindex) fixes.push({ text: 'Your home page is set to “noindex”, which asks search engines not to list it. Remove that setting.', weight: 3 });
  if (!site.hasViewport) fixes.push({ text: 'Add a mobile viewport setting so your site fits phone screens.', weight: 2 });
  if (!site.title) fixes.push({ text: 'Add a page title that says what you do and where.', weight: 2 });
  if (!site.metaDescription) fixes.push({ text: 'Add a short description for search results that says what you do and where.', weight: 1 });
  if (!site.h1s.length) fixes.push({ text: 'Add one clear main heading that says what you do.', weight: 1 });
  const ogMissing = !site.openGraph.title || !site.openGraph.image;
  if (ogMissing) fixes.push({ text: 'Add sharing tags (Open Graph) so links to your site show a title and image.', weight: 1 });
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
  const fixes: Area['fixes'] = [];
  if (!site.telLinks) fixes.push({ text: 'Add a tap-to-call button to your website.', weight: 2 });
  if (!site.whatsappLinks) fixes.push({ text: 'Add a WhatsApp button so customers can message you in one tap.', weight: 1 });
  if (!site.hasContactForm && !site.mailtoLinks) fixes.push({ text: 'Add a simple contact form or email link.', weight: 1 });
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
  const fixes: Area['fixes'] = [];
  if (site.robotsTxt.blocksAll) fixes.push({ text: 'Your robots.txt blocks all search engines. Remove the “Disallow: /” rule for everyone.', weight: 3 });
  if (!site.sitemap.found) fixes.push({ text: 'Add a sitemap.xml so search engines can find all your pages.', weight: 1 });
  if (!hasBusinessSchema) fixes.push({ text: 'Add LocalBusiness structured data with your name, address, phone and hours.', weight: 2 });
  if (blockedBots.length) fixes.push({ text: `Decide whether you want AI assistants to read your site. Your robots.txt currently blocks ${blockedBots.join(', ')}.`, weight: 1 });
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

export function speedArea(psi: PageSpeedReport | null): Area | null {
  if (!psi || psi.scores.performance === undefined) return null;
  const perf = psi.scores.performance;
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
    fixes: status === 'Good' ? [] : [{ text: `Speed up your website on phones${psi.opportunities[0] ? `, starting with: ${psi.opportunities[0].toLowerCase()}` : ''}.`, weight: weight[status] }],
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
  const fixes: Area['fixes'] = [];
  if (phoneMatch === false) fixes.push({ text: 'The phone number on your website does not match your Google profile. Use the same number on both.', weight: 3 });
  if (phoneMatch === undefined) fixes.push({ text: 'Show your phone number on your website as a tap-to-call link, matching your Google profile.', weight: 1 });
  if (nameMatch === false) fixes.push({ text: 'Use the same business name on your website as on your Google profile.', weight: 2 });
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

export function topFixes(areas: Area[]) {
  return areas
    .flatMap((a, ai) => a.fixes.map((f, fi) => ({ ...f, order: ai * 10 + fi })))
    .sort((a, b) => b.weight - a.weight || a.order - b.order)
    .slice(0, 3)
    .map((f) => f.text);
}

export const notChecked = ['Instagram', 'Facebook', 'TikTok', 'How quickly you reply to enquiries', 'How you follow up with customers', 'Your sales data'];
