import type { Metadata } from 'next';

// The site's share image (public/og.jpg, 1200x630, about 95 KB). Used by the root layout and every page below.
export const SHARE_IMAGE = { url: '/og.jpg', width: 1200, height: 630, alt: 'Emmanuel Growth' };

// Page metadata for the service pages and the other public pages: unique title and description, canonical URL,
// and Open Graph / Twitter tags with the same title, description and URL, plus the share image.
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, siteName: 'Emmanuel Growth', title, description, images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  };
}

export const serviceMetadata = pageMetadata;
