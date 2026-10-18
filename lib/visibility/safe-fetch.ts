// Fetches public web pages for the website checks with strict limits.
// http/https on standard ports only; blocks localhost, private, link-local and metadata addresses,
// re-checked after every redirect; max 3 redirects, 10 s timeout, 2 MB body cap.

export class FetchBlocked extends Error {
  constructor(public kind: 'bad_url' | 'blocked_host' | 'dns' | 'too_many_redirects' | 'timeout' | 'network') {
    super(kind);
  }
}

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;
const USER_AGENT = 'EmmanuelGrowthVisibilityCheck/1.0 (+https://emmanuelgrowth.com/visibility-check)';

const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.intranet', '.corp'];

function ipv4Private(ip: string) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0 && p[2] === 0)
    || (a === 198 && (b === 18 || b === 19));
}

function ipv6Private(ip: string) {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (v === '::' || v === '::1') return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return ipv4Private(mapped[1]);
  return /^(fc|fd)/.test(v) || /^fe[89ab]/.test(v) || v.startsWith('ff') || v.startsWith('64:ff9b:') || v.startsWith('2001:db8');
}

const isIpv4 = (h: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(h);
const isIpv6 = (h: string) => h.includes(':');

async function resolve(hostname: string, type: 'A' | 'AAAA') {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new FetchBlocked('dns');
  const data = await res.json() as { Answer?: { type: number; data: string }[] };
  const want = type === 'A' ? 1 : 28;
  return (data.Answer ?? []).filter((a) => a.type === want).map((a) => a.data);
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchBlocked('bad_url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new FetchBlocked('bad_url');
  if (url.username || url.password) throw new FetchBlocked('bad_url');
  const standardPort = url.port === '' || (url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443');
  if (!standardPort) throw new FetchBlocked('bad_url');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s)) || host === 'metadata.google.internal') throw new FetchBlocked('blocked_host');
  if (isIpv4(host)) {
    if (ipv4Private(host)) throw new FetchBlocked('blocked_host');
    return url;
  }
  if (isIpv6(host)) {
    if (ipv6Private(host)) throw new FetchBlocked('blocked_host');
    return url;
  }
  if (!host.includes('.')) throw new FetchBlocked('blocked_host');
  const [a, aaaa] = await Promise.all([resolve(host, 'A').catch(() => []), resolve(host, 'AAAA').catch(() => [])]);
  if (!a.length && !aaaa.length) throw new FetchBlocked('dns');
  if (a.some(ipv4Private) || aaaa.some(ipv6Private)) throw new FetchBlocked('blocked_host');
  return url;
}

export type SafeResponse = {
  status: number;
  finalUrl: string;
  redirects: string[];
  contentType: string;
  body: string;
  truncated: boolean;
};

async function readCapped(res: Response, maxBytes: number) {
  if (!res.body) return { text: '', truncated: false };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      chunks.push(value.slice(0, value.byteLength - (size - maxBytes)));
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder().decode(merged), truncated };
}

export async function safeFetch(raw: string, maxBytes = MAX_BYTES): Promise<SafeResponse> {
  const deadline = AbortSignal.timeout(TIMEOUT_MS);
  const redirects: string[] = [];
  let current = await assertPublicUrl(raw);
  for (let hop = 0; ; hop += 1) {
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        redirect: 'manual',
        signal: deadline,
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8' },
      });
    } catch (error) {
      throw new FetchBlocked(deadline.aborted || (error instanceof Error && error.name === 'TimeoutError') ? 'timeout' : 'network');
    }
    const location = res.headers.get('Location');
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop >= MAX_REDIRECTS) throw new FetchBlocked('too_many_redirects');
      await res.body?.cancel();
      redirects.push(current.toString());
      current = await assertPublicUrl(new URL(location, current).toString());
      continue;
    }
    try {
      const { text, truncated } = await readCapped(res, maxBytes);
      return { status: res.status, finalUrl: current.toString(), redirects, contentType: res.headers.get('Content-Type') ?? '', body: text, truncated };
    } catch {
      throw new FetchBlocked(deadline.aborted ? 'timeout' : 'network');
    }
  }
}
