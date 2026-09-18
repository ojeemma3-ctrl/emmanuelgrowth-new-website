import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ['', 1],
    ['privacy-policy', 0.4],
    ['cookie-policy', 0.4],
    ['terms-of-use', 0.4],
  ].map(([path, priority]) => ({
    url: `https://emmanuelgrowth.com/${path}`,
    changeFrequency: 'monthly' as const,
    priority: priority as number,
  }));
}
