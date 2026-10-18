// Shared server helpers for the visibility check API routes.
import { env as workerEnv } from 'cloudflare:workers';

type EnvRecord = Record<string, string | undefined>;

export function getEnv(name: string): string | undefined {
  const value = (workerEnv as unknown as EnvRecord)[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export const config = {
  // Global number of full checks per UTC day. Override with VISIBILITY_DAILY_CAP.
  dailyCap: () => {
    const raw = Number(getEnv('VISIBILITY_DAILY_CAP'));
    return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 40;
  },
  perIpChecks: 3,
  perIpAutocomplete: 120,
  perIpPreviews: 20,
};

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function clientIp(request: Request) {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
}

// Reads a small JSON body; rejects anything over the limit.
export async function readJson(request: Request, maxBytes = 8_000): Promise<Record<string, unknown> | null> {
  const text = await request.text().catch(() => '');
  if (!text || text.length > maxBytes) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export const str = (value: unknown, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const today = () => new Date().toISOString().slice(0, 10);

/*
 * Daily limits. IMPORTANT: this hosting has no shared storage bound (no KV or D1), so these
 * counters live in the memory of each server instance. They reset when an instance restarts and
 * are not shared between instances, so the global cap is a soft limit. Set a hard daily quota on
 * the Places API and PageSpeed API in Google Cloud Console as the real cost ceiling.
 * IPs are hashed with the date before use, so no raw IP address is kept.
 */
const counters = new Map<string, number>();
let counterDay = today();

function rollDay() {
  const day = today();
  if (day !== counterDay) {
    counters.clear();
    counterDay = day;
  }
}

export type LimitKind = 'check' | 'autocomplete' | 'preview';

export async function takeLimit(request: Request, kind: LimitKind): Promise<{ ok: true } | { ok: false; reason: 'daily_cap' | 'ip_limit' }> {
  rollDay();
  const ipKey = `${kind}:${await sha256Hex(`${counterDay}:${clientIp(request)}`)}`;
  const ipCount = counters.get(ipKey) ?? 0;
  const ipMax = kind === 'check' ? config.perIpChecks : kind === 'autocomplete' ? config.perIpAutocomplete : config.perIpPreviews;
  if (kind === 'check') {
    const globalCount = counters.get('global:check') ?? 0;
    if (globalCount >= config.dailyCap()) return { ok: false, reason: 'daily_cap' };
  }
  if (ipCount >= ipMax) return { ok: false, reason: 'ip_limit' };
  counters.set(ipKey, ipCount + 1);
  if (kind === 'check') counters.set('global:check', (counters.get('global:check') ?? 0) + 1);
  return { ok: true };
}

// Cloudflare Turnstile, only when both keys are configured.
export function turnstileSiteKey() {
  return getEnv('TURNSTILE_SECRET_KEY') ? getEnv('TURNSTILE_SITE_KEY') : undefined;
}

export async function verifyTurnstile(token: string, request: Request) {
  const secret = getEnv('TURNSTILE_SECRET_KEY');
  if (!secret || !getEnv('TURNSTILE_SITE_KEY')) return true;
  if (!token) return false;
  try {
    const body = new FormData();
    body.set('secret', secret);
    body.set('response', token);
    body.set('remoteip', clientIp(request));
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await res.json() as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/*
 * Signed check tickets. /start issues one after the business is confirmed and limits pass;
 * the other check routes only run for a valid ticket. Nothing is stored server-side.
 */
export type Ticket = {
  placeId?: string;
  name: string;
  town?: string;
  category?: string;
  categoryType?: string;
  website?: string;
  social?: string; // platform name when the "website" is a social or link-in-bio page
  exp: number;
};

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function signingKey() {
  const secret = getEnv('VISIBILITY_SIGNING_SECRET') ?? `${getEnv('GOOGLE_PLACES_API_KEY') ?? ''}:${getEnv('PAGESPEED_API_KEY') ?? ''}:visibility-check`;
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signTicket(ticket: Omit<Ticket, 'exp'>) {
  const payload = new TextEncoder().encode(JSON.stringify({ ...ticket, exp: Date.now() + 30 * 60 * 1000 }));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await signingKey(), payload));
  return `${b64url(payload)}.${b64url(sig)}`;
}

export async function readTicket(value: unknown): Promise<Ticket | null> {
  if (typeof value !== 'string' || value.length > 4000) return null;
  const [payloadPart, sigPart] = value.split('.');
  if (!payloadPart || !sigPart) return null;
  try {
    const payload = fromB64url(payloadPart);
    const valid = await crypto.subtle.verify('HMAC', await signingKey(), fromB64url(sigPart), payload);
    if (!valid) return null;
    const ticket = JSON.parse(new TextDecoder().decode(payload)) as Ticket;
    return ticket.exp > Date.now() ? ticket : null;
  } catch {
    return null;
  }
}
