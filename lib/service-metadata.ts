import type { Metadata } from 'next';

// Page metadata for the service pages: unique title and description, canonical URL and the site's og image
// (public/og.png is 1672x941).
export function serviceMetadata(path: string, title: string, description: string): Metadata {
  const image = { url: '/og.png', width: 1672, height: 941, alt: 'Emmanuel Growth' };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, siteName: 'Emmanuel Growth', title, description, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}
