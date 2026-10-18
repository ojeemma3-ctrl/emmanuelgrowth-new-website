// Website checks from public HTML, robots.txt and sitemap.xml. Nothing fetched is stored.
import { FetchBlocked, safeFetch } from './safe-fetch';

export const AI_CRAWLERS = ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'Google-Extended', 'ClaudeBot'] as const;

export type CrawlerRule = 'blocked' | 'allowed' | 'not_mentioned';

export type WebsiteReport = {
  url: string;
  finalUrl: string;
  reachable: boolean;
  status?: number;
  error?: string;
  https: boolean;
  httpRedirectsToHttps?: boolean;
  redirectCount: number;
  title?: string;
  metaDescription?: string;
  h1s: string[];
  h1Count: number;
  hasViewport: boolean;
  canonical?: string;
  noindex: boolean;
  robotsTxt: { found: boolean; blocksAll: boolean };
  sitemap: { found: boolean; source?: 'robots' | 'default' };
  aiCrawlers: Record<string, CrawlerRule>;
  schemaTypes: string[];
  businessSchema: { found: boolean; name: boolean; address: boolean; phone: boolean; hours: boolean; website: boolean; image: boolean; socialLinks: boolean };
  openGraph: { title: boolean; description: boolean; image: boolean };
  telLinks: number;
  mailtoLinks: number;
  whatsappLinks: number;
  bookingLinks: number;
  hasContactForm: boolean;
  socialLinks: string[];
  phonesFound: string[]; // from tel: links and structured data
  textPhones: string[]; // phone-like numbers in the visible page text
  namesFound: string[];
  addressCheck?: { expected: string; found: boolean };
  truncated: boolean;
};

const BUSINESS_TYPE = /LocalBusiness|Organization|Store|Service|Contractor|Restaurant|Salon|Spa|Clinic|Dentist|Plumber|Electrician|Business|Shop|Agency|Practice|Studio|Gym|Cafe|Bakery|Hotel/;
type BusinessSchema = WebsiteReport['businessSchema'];
const emptyBusinessSchema = (): BusinessSchema => ({ found: false, name: false, address: false, phone: false, hours: false, website: false, image: false, socialLinks: false });

const decode = (s: string) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const clean = (s: string) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function attr(tag: string, name: string) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? '') : undefined;
}

function metaContent(html: string, key: 'name' | 'property', value: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if ((attr(tag, key) ?? '').toLowerCase() === value) return attr(tag, 'content');
  }
  return undefined;
}

function collectSchema(node: unknown, types: Set<string>, names: Set<string>, phones: Set<string>, business: BusinessSchema) {
  if (Array.isArray(node)) return node.forEach((n) => collectSchema(n, types, names, phones, business));
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  const t = obj['@type'];
  const typeList = (Array.isArray(t) ? t : [t]).filter((x): x is string => typeof x === 'string');
  typeList.forEach((x) => types.add(x));
  const isBusiness = typeList.some((x) => BUSINESS_TYPE.test(x)) && !typeList.some((x) => /^(WebSite|WebPage|AggregateRating|Review|Offer)$/.test(x));
  if (isBusiness) {
    business.found = true;
    if (typeof obj.name === 'string') { names.add(obj.name); business.name = true; }
    if (obj.address) business.address = true;
    if (obj.telephone) business.phone = true;
    if (obj.openingHours || obj.openingHoursSpecification) business.hours = true;
    if (obj.url) business.website = true;
    if (obj.image || obj.logo) business.image = true;
    if (obj.sameAs) business.socialLinks = true;
  }
  if (typeof obj.telephone === 'string') phones.add(obj.telephone);
  Object.values(obj).forEach((v) => typeof v === 'object' && collectSchema(v, types, names, phones, business));
}

// Looks for the Google address on the page: the postcode if there is one, otherwise the longest word of the street line.
function addressOnPage(pageText: string, expected: string) {
  const text = pageText.toLowerCase().replace(/\s+/g, ' ');
  const postcode = expected.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i)?.[0];
  if (postcode) return text.replace(/\s/g, '').includes(postcode.toLowerCase().replace(/\s/g, ''));
  const words = expected.split(',')[0].toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter((w) => w.length >= 4);
  const key = words.sort((a, b) => b.length - a.length)[0];
  return key ? text.includes(key) : false;
}

function parseRobots(text: string) {
  // Groups of user-agents followed by rules.
  const groups: { agents: string[]; disallowAll: boolean; allowAll: boolean }[] = [];
  const sitemaps: string[] = [];
  let current: { agents: string[]; disallowAll: boolean; allowAll: boolean } | null = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === 'sitemap') { sitemaps.push(value); continue; }
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallowAll: false, allowAll: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === 'disallow' && value === '/') current.disallowAll = true;
    if (field === 'allow' && value === '/') current.allowAll = true;
  }
  const ruleFor = (agent: string): CrawlerRule => {
    const own = groups.find((g) => g.agents.includes(agent.toLowerCase()));
    if (own) return own.disallowAll && !own.allowAll ? 'blocked' : 'allowed';
    return 'not_mentioned';
  };
  const star = groups.find((g) => g.agents.includes('*'));
  return { ruleFor, sitemaps, blocksAll: Boolean(star?.disallowAll && !star.allowAll) };
}

const SOCIAL = [
  ['Facebook', /facebook\.com\//i],
  ['Instagram', /instagram\.com\//i],
  ['TikTok', /tiktok\.com\//i],
  ['LinkedIn', /linkedin\.com\//i],
  ['X / Twitter', /(twitter|x)\.com\//i],
  ['YouTube', /youtube\.com\/|youtu\.be\//i],
] as const;

export function normaliseUrl(raw: string) {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function checkWebsite(rawUrl: string, expectedAddress?: string): Promise<WebsiteReport> {
  const url = normaliseUrl(rawUrl);
  const empty: WebsiteReport = {
    url, finalUrl: url, reachable: false, https: false, redirectCount: 0, h1s: [], h1Count: 0, hasViewport: false, noindex: false,
    robotsTxt: { found: false, blocksAll: false }, sitemap: { found: false }, aiCrawlers: {}, schemaTypes: [], businessSchema: emptyBusinessSchema(),
    openGraph: { title: false, description: false, image: false }, telLinks: 0, mailtoLinks: 0, whatsappLinks: 0, bookingLinks: 0,
    hasContactForm: false, socialLinks: [], phonesFound: [], textPhones: [], namesFound: [], truncated: false,
  };

  let page;
  try {
    page = await safeFetch(url);
  } catch (error) {
    return { ...empty, error: error instanceof FetchBlocked ? error.kind : 'network' };
  }
  const final = new URL(page.finalUrl);
  const html = page.body;
  const origin = final.origin;

  // Does plain http:// end up on https://?
  let httpRedirectsToHttps: boolean | undefined;
  try {
    const plain = await safeFetch(`http://${final.host}/`, 64 * 1024);
    httpRedirectsToHttps = plain.finalUrl.startsWith('https://');
  } catch {
    httpRedirectsToHttps = undefined;
  }

  // robots.txt and sitemap.xml
  let robots = { found: false, blocksAll: false };
  let aiCrawlers: Record<string, CrawlerRule> = {};
  let sitemapUrls: string[] = [];
  try {
    const r = await safeFetch(`${origin}/robots.txt`, 512 * 1024);
    if (r.status === 200 && !/text\/html/i.test(r.contentType)) {
      const parsed = parseRobots(r.body);
      robots = { found: true, blocksAll: parsed.blocksAll };
      aiCrawlers = Object.fromEntries(AI_CRAWLERS.map((bot) => [bot, parsed.ruleFor(bot)]));
      sitemapUrls = parsed.sitemaps;
    }
  } catch { /* treated as not found */ }
  if (!robots.found) aiCrawlers = Object.fromEntries(AI_CRAWLERS.map((bot) => [bot, 'not_mentioned' as CrawlerRule]));

  let sitemap: WebsiteReport['sitemap'] = { found: false };
  for (const [candidate, source] of [...sitemapUrls.slice(0, 1).map((u) => [u, 'robots'] as const), [`${origin}/sitemap.xml`, 'default'] as const]) {
    try {
      const s = await safeFetch(candidate, 256 * 1024);
      if (s.status === 200 && /<(urlset|sitemapindex)\b/i.test(s.body)) {
        sitemap = { found: true, source };
        break;
      }
    } catch { /* try next */ }
  }

  const types = new Set<string>();
  const schemaNames = new Set<string>();
  const phones = new Set<string>();
  const business = emptyBusinessSchema();
  for (const block of html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []) {
    try {
      collectSchema(JSON.parse(block.replace(/^<script\b[^>]*>|<\/script>$/gi, '')), types, schemaNames, phones, business);
    } catch { /* invalid JSON-LD is ignored */ }
  }

  const anchors = (html.match(/<a\b[^>]*>/gi) ?? []).map((tag) => attr(tag, 'href') ?? '');
  const tel = anchors.filter((h) => /^tel:/i.test(h));
  tel.forEach((h) => phones.add(decodeURIComponent(h.replace(/^tel:/i, ''))));
  const robotsMeta = metaContent(html, 'name', 'robots') ?? '';
  const title = clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || undefined;
  const ogSite = metaContent(html, 'property', 'og:site_name');
  const h1All = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []).map(clean).filter(Boolean);
  const h1s = h1All.slice(0, 5);
  const pageText = clean(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' '));
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? []).find((tag) => (attr(tag, 'rel') ?? '').toLowerCase() === 'canonical');
  const forms = html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];

  return {
    url,
    finalUrl: page.finalUrl,
    reachable: page.status >= 200 && page.status < 400,
    status: page.status,
    https: final.protocol === 'https:',
    httpRedirectsToHttps,
    redirectCount: page.redirects.length,
    title,
    metaDescription: metaContent(html, 'name', 'description') || undefined,
    h1s,
    h1Count: h1All.length,
    hasViewport: Boolean(metaContent(html, 'name', 'viewport')),
    canonical: canonicalTag ? attr(canonicalTag, 'href') : undefined,
    noindex: /noindex/i.test(robotsMeta),
    robotsTxt: robots,
    sitemap,
    aiCrawlers,
    schemaTypes: [...types].slice(0, 12),
    businessSchema: business,
    openGraph: {
      title: Boolean(metaContent(html, 'property', 'og:title')),
      description: Boolean(metaContent(html, 'property', 'og:description')),
      image: Boolean(metaContent(html, 'property', 'og:image')),
    },
    telLinks: tel.length,
    mailtoLinks: anchors.filter((h) => /^mailto:/i.test(h)).length,
    whatsappLinks: anchors.filter((h) => /(wa\.me|api\.whatsapp\.com|whatsapp:\/\/)/i.test(h)).length,
    bookingLinks: anchors.filter((h) => /(calendly\.com|booksy\.com|fresha\.com|treatwell\.|setmore\.com|acuityscheduling\.com|simplybook\.|squareup\.com\/appointments|square\.site|opentable\.|resdiary\.|vagaro\.com|timely\.|\/book(ing)?\b)/i.test(h)).length,
    hasContactForm: forms.some((f) => /type\s*=\s*["']?email|<textarea|contact|enquir|message/i.test(f)),
    socialLinks: SOCIAL.filter(([, re]) => anchors.some((h) => re.test(h))).map(([name]) => name),
    phonesFound: [...phones].slice(0, 6),
    textPhones: [...new Set((pageText.match(/(?:\+|00)?\(?\d[\d\s().-]{6,18}\d/g) ?? []).map((p) => p.trim()).filter((p) => { const n = p.replace(/\D/g, '').length; return n >= 7 && n <= 15; }))].slice(0, 12),
    namesFound: [title, ogSite, h1s[0], ...schemaNames].filter((n): n is string => Boolean(n)).slice(0, 6),
    addressCheck: expectedAddress ? { expected: expectedAddress, found: addressOnPage(pageText, expectedAddress) } : undefined,
    truncated: page.truncated,
  };
}
