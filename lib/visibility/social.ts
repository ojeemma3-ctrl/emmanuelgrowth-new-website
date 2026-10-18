// Social and link-in-bio hosts are "a page, not a website": the website checks and PageSpeed
// are skipped for them, so we never report on the platform's own site (its robots.txt, speed etc.).
const SOCIAL_HOSTS: [string, string][] = [
  ['instagram.com', 'Instagram'],
  ['facebook.com', 'Facebook'],
  ['fb.com', 'Facebook'],
  ['tiktok.com', 'TikTok'],
  ['x.com', 'X (Twitter)'],
  ['twitter.com', 'X (Twitter)'],
  ['linkedin.com', 'LinkedIn'],
  ['youtube.com', 'YouTube'],
  ['wa.me', 'WhatsApp'],
  ['whatsapp.com', 'WhatsApp'],
  ['linktr.ee', 'Linktree'],
  ['beacons.ai', 'Beacons'],
  ['bio.link', 'Bio.link'],
  ['g.page', 'a Google page'],
  ['business.site', 'a Google Business Site page'],
];

// Returns the platform name when the URL is on a social or link-in-bio host (including www., m. and other subdomains).
export function socialPlatform(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let host: string;
  try {
    host = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return null;
  }
  const match = SOCIAL_HOSTS.find(([domain]) => host === domain || host.endsWith(`.${domain}`));
  return match ? match[1] : null;
}
