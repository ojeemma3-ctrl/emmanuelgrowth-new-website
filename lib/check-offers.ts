// Small offer tags shown next to a fix in the report. Edit labels and links here.
// Free-fix-only items (category, photos, hours, name/address/phone consistency and the rest) get no tag.
import { CONTACT_TOPICS, PLAN_LINKS } from './check-config';

export type Offer =
  | { kind: 'link'; label: string; covers: string; href: string }
  | { kind: 'contact'; label: string; covers: string; topic: string };

const getMoreReviews: Offer = { kind: 'link', label: 'Get More Reviews', covers: 'Get More Reviews', href: PLAN_LINKS.getMoreReviews };
const convertEnquiries: Offer = { kind: 'link', label: 'Convert Enquiries', covers: 'Convert Enquiries', href: PLAN_LINKS.convertEnquiries };
const simpleWebsite: Offer = { kind: 'link', label: 'A simple website', covers: 'Get Found', href: PLAN_LINKS.getFound };
const askMe: Offer = { kind: 'contact', label: 'Ask me about this', covers: CONTACT_TOPICS.websiteImprovements, topic: CONTACT_TOPICS.websiteImprovements };

// Technical items on an existing website.
const WEBSITE_TECH = new Set(['speed-mobile', 'web-description', 'web-h1', 'web-open-graph', 'search-schema', 'web-title']);

// id: a rule id (e.g. "reviews-rating") or a Top 3 fix key (e.g. "reviews", "website").
// realWebsite: the business has a website that isn't just a social or link-in-bio page.
export function offerFor(id: string, realWebsite: boolean): Offer | null {
  if (id === 'reviews' || id === 'reviews-count' || id === 'reviews-rating') return getMoreReviews;
  if (id === 'contact-links') return convertEnquiries;
  if ((id === 'website' || id === 'gbp-website') && !realWebsite) return simpleWebsite;
  if (WEBSITE_TECH.has(id) && realWebsite) return askMe;
  return null;
}
