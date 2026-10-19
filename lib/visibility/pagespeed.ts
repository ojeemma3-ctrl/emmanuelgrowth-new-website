// PageSpeed Insights (mobile). Key from PAGESPEED_API_KEY; the response is summarised, not stored.
import { getEnv } from './server';

export type PageSpeedReport = {
  scores: { performance?: number; accessibility?: number; bestPractices?: number; seo?: number };
  metrics: { label: string; value: string; plain: string }[];
  opportunities: string[];
  testedAt?: string; // when Google ran the test (ISO), shown next to the score
};

export class PageSpeedError extends Error {
  constructor(public kind: 'upstream' | 'timeout') {
    super(kind);
  }
}

const METRICS: [string, string, string][] = [
  ['largest-contentful-paint', 'Largest Contentful Paint', 'How long until the main content shows'],
  ['first-contentful-paint', 'First Contentful Paint', 'How long until anything appears'],
  ['total-blocking-time', 'Total Blocking Time', 'How long the page is too busy to respond to taps'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift', 'How much the page jumps around while loading'],
  ['speed-index', 'Speed Index', 'How quickly the page looks complete'],
];

export async function runPageSpeed(url: string): Promise<PageSpeedReport> {
  const params = new URLSearchParams({ url, strategy: 'mobile' });
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach((c) => params.append('category', c));
  const key = getEnv('PAGESPEED_API_KEY');
  if (key) params.set('key', key);
  let res: Response;
  try {
    res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, { signal: AbortSignal.timeout(60_000) });
  } catch {
    throw new PageSpeedError('timeout');
  }
  if (!res.ok) throw new PageSpeedError('upstream');
  type Audit = { title?: string; score?: number | null; displayValue?: string; details?: { type?: string; overallSavingsMs?: number } };
  const data = await res.json() as { lighthouseResult?: { fetchTime?: string; categories?: Record<string, { score?: number | null }>; audits?: Record<string, Audit> } };
  const lh = data.lighthouseResult;
  const score = (id: string) => {
    const s = lh?.categories?.[id]?.score;
    return typeof s === 'number' ? Math.round(s * 100) : undefined;
  };
  const audits = lh?.audits ?? {};
  return {
    testedAt: lh?.fetchTime ?? new Date().toISOString(),
    scores: { performance: score('performance'), accessibility: score('accessibility'), bestPractices: score('best-practices'), seo: score('seo') },
    metrics: METRICS.filter(([id]) => audits[id]?.displayValue).map(([id, label, plain]) => ({ label, value: audits[id].displayValue as string, plain })),
    opportunities: Object.values(audits)
      .filter((a) => a.details?.type === 'opportunity' && typeof a.score === 'number' && a.score < 0.9 && (a.details.overallSavingsMs ?? 0) > 0)
      .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
      .slice(0, 3)
      .map((a) => a.title ?? '')
      .filter(Boolean),
  };
}
