// Smoke test that crawls the site with real clicks, at 1440px and 390px.
// Usage: npm run smoke -- <base url>        e.g. npm run smoke -- http://localhost:4173
// Options (after the URL): --only=1440 or --only=390, --pages=/,/get-found
//
// For every page: the page must load (the made-up URL must return 404) with no console errors. Then every visible
// internal link is clicked on a freshly loaded page and must land on the expected URL (path, query and #hash)
// with a page that renders its main content, again with no console errors. Buttons that open something are
// clicked too: the contact box (must open a dialog), the tabs (must become selected), the tabs' Next button,
// the phone menu (must expand) and FAQ questions (must open).
// Uses the Chrome installed on this computer (playwright-core, no browser download); set CHROME_PATH to use
// another Chrome or Chromium. Exits with code 1 if anything fails.
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) || process.env.SMOKE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Give a base URL, for example: npm run smoke -- http://localhost:4173');
  process.exit(2);
}
const option = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const PAGES = option('pages')?.split(',') ?? [
  '/', '/get-found', '/get-more-reviews', '/convert-enquiries', '/complete-system', '/visibility-check',
  '/privacy-policy', '/cookie-policy', '/terms-of-use', '/guides/listings', '/this-page-does-not-exist',
];
const NOT_FOUND = '/this-page-does-not-exist';
const VIEWPORTS = [
  { name: '1440', viewport: { width: 1440, height: 900 } },
  { name: '390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
].filter((v) => !option('only') || v.name === option('only'));

const origin = new URL(base).origin;
const results = [];
const record = (ok, viewport, label, detail = '') => {
  results.push({ ok, viewport, label, detail });
  if (!ok) console.log(`FAIL [${viewport}] ${label}  ${detail}`);
};

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });

// Console errors and uncaught exceptions, collected per check.
function watch(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().split('\n')[0].slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(`uncaught: ${String(e.message).split('\n')[0].slice(0, 200)}`));
  return { take: () => errors.splice(0, errors.length) };
}

async function load(page, path) {
  const res = await page.goto(`${base}${path}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(400); // let the client code start (hydration, prefetch)
  const reject = page.getByRole('button', { name: 'Reject analytics' });
  if (await reject.isVisible().catch(() => false)) await reject.click();
  return res;
}

const pathOf = (u) => { const x = new URL(u); return x.pathname + x.search; };

// Every visible same-site link on the page, once per distinct href (first visible occurrence).
async function linksOn(page) {
  return page.evaluate((siteOrigin) => {
    const seen = new Set();
    const out = [];
    document.querySelectorAll('a[href]').forEach((a, index) => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('mailto:') || raw.startsWith('tel:') || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== siteOrigin) return;
      const r = a.getBoundingClientRect();
      const visible = r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden' && !a.closest('[inert], [aria-hidden="true"]');
      const inMenu = !!a.closest('#site-nav');
      if (!visible && !inMenu) return;
      if (seen.has(raw)) return;
      seen.add(raw);
      out.push({ raw, index, text: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50), inMenu });
    });
    return out;
  }, origin);
}

async function openMenuIfNeeded(page, link) {
  if (await link.isVisible()) return;
  const menu = page.locator('.menu-button');
  if (await menu.isVisible().catch(() => false)) { await menu.click(); await page.waitForTimeout(200); }
}

async function checkLink(page, w, from, link) {
  const label = `${from} → link "${link.text || link.raw}" (${link.raw})`;
  try {
    await load(page, from);
    w.take();
    const el = page.locator('a[href]').nth(link.index);
    await openMenuIfNeeded(page, el);
    const href = await el.evaluate((a) => a.href);
    const expected = new URL(href);
    const before = page.url();
    const samePage = pathOf(before) === pathOf(href);
    if (await el.evaluate((a) => a.classList.contains('skip-link'))) {
      // Skip links only appear on keyboard focus: use them the way a keyboard user does.
      await el.focus();
      await page.keyboard.press('Enter');
    } else {
      await el.scrollIntoViewIfNeeded();
      await el.click();
    }
    if (samePage) {
      // In-page anchor: the hash must change to the target, and the target must exist.
      if (expected.hash) {
        await page.waitForFunction((h) => location.hash === h, expected.hash, { timeout: 5000 });
        const id = decodeURIComponent(expected.hash.slice(1));
        const exists = await page.evaluate((x) => !!document.getElementById(x), id);
        if (!exists) throw new Error(`no element with id "${id}"`);
      }
    } else {
      await page.waitForURL((u) => pathOf(u.toString()) === pathOf(href) && u.hash === expected.hash, { timeout: 15000 });
      await page.locator('main').first().waitFor({ state: 'attached', timeout: 15000 });
      await page.waitForLoadState('load');
      await page.waitForTimeout(300);
      const ok = await page.evaluate(() => !!document.querySelector('main h1, main h2') && !/this page could not be found|application error/i.test(document.body.innerText));
      if (!ok) throw new Error(`target page did not render (now at ${pathOf(page.url())})`);
    }
    const errors = w.take();
    if (errors.length) throw new Error(`console: ${errors.join(' | ')}`);
    record(true, w.name, label);
  } catch (error) {
    record(false, w.name, label, `${String(error.message).split('\n')[0]} (now at ${pathOf(page.url())}${new URL(page.url()).hash})`);
  }
}

// Buttons that open something. Each check starts from a fresh page.
async function checkButtons(page, w, from) {
  const checks = [];
  const count = (sel) => page.locator(sel).evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().width > 0).length);
  await load(page, from);
  const dialogButtons = await count('main button[aria-haspopup="dialog"], header button[aria-haspopup="dialog"], footer button[aria-haspopup="dialog"]');
  for (let i = 0; i < dialogButtons; i++) {
    checks.push({ label: `contact button #${i + 1}`, run: async () => {
      const b = page.locator('button[aria-haspopup="dialog"]').filter({ visible: true }).nth(i);
      const text = (await b.textContent())?.trim().slice(0, 40);
      await b.scrollIntoViewIfNeeded(); await b.click();
      await page.getByRole('dialog', { name: /how would you like to talk|personal review/i }).first().waitFor({ state: 'visible', timeout: 5000 });
      return `"${text}" opened the contact box`;
    } });
  }
  if (await count('.ot-tab')) {
    for (let i = 0; i < 3; i++) {
      checks.push({ label: `tab #${i + 1}`, run: async () => {
        const t = page.locator('.ot-tab').nth(i);
        await t.scrollIntoViewIfNeeded(); await t.click();
        await page.waitForFunction((n) => document.querySelectorAll('.ot-tab')[n]?.getAttribute('aria-selected') === 'true', i, { timeout: 3000 });
        return 'selected';
      } });
    }
    checks.push({ label: 'tabs Next button', run: async () => {
      const first = await page.locator('.ot-tab[aria-selected="true"]').textContent();
      const n = page.locator('.ot-next'); await n.scrollIntoViewIfNeeded(); await n.click();
      await page.waitForFunction((f) => document.querySelector('.ot-tab[aria-selected="true"]')?.textContent !== f, first, { timeout: 3000 });
      return 'moved to the next tab';
    } });
  }
  if (await count('.menu-button')) {
    checks.push({ label: 'phone menu button', run: async () => {
      await page.locator('.menu-button').click();
      await page.waitForFunction(() => document.querySelector('.menu-button')?.getAttribute('aria-expanded') === 'true', null, { timeout: 3000 });
      return 'menu opened';
    } });
  }
  if (await count('.faq-list summary')) {
    checks.push({ label: 'FAQ question', run: async () => {
      const s = page.locator('.faq-list summary').first(); await s.scrollIntoViewIfNeeded(); await s.click();
      await page.waitForFunction(() => document.querySelector('.faq-list details')?.open === true, null, { timeout: 3000 });
      return 'opened';
    } });
  }
  for (const check of checks) {
    const label = `${from} → ${check.label}`;
    try {
      await load(page, from);
      w.take();
      const detail = await check.run();
      const errors = w.take();
      if (errors.length) throw new Error(`console: ${errors.join(' | ')}`);
      record(true, w.name, label, detail);
    } catch (error) {
      record(false, w.name, label, String(error.message).split('\n')[0]);
    }
  }
}

for (const v of VIEWPORTS) {
  const context = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch });
  const page = await context.newPage();
  const w = { name: v.name, ...watch(page) };
  for (const path of PAGES) {
    // 1. The page itself.
    try {
      w.take();
      const res = await load(page, path);
      const status = res?.status();
      const wanted = path === NOT_FOUND ? 404 : 200;
      if (status !== wanted) throw new Error(`status ${status}, expected ${wanted}`);
      const errors = w.take().filter((e) => !(path === NOT_FOUND && /404|not found/i.test(e)));
      if (errors.length) throw new Error(`console: ${errors.join(' | ')}`);
      record(true, v.name, `${path} loads (${status})`);
    } catch (error) {
      record(false, v.name, `${path} loads`, String(error.message).split('\n')[0]);
      continue;
    }
    // 2. Every internal link on it, and the buttons that open something.
    const links = await linksOn(page);
    for (const link of links) await checkLink(page, w, path, link);
    if (path !== NOT_FOUND) await checkButtons(page, w, path);
  }
  await context.close();
}
await browser.close();

const failed = results.filter((r) => !r.ok);
for (const v of VIEWPORTS) {
  const mine = results.filter((r) => r.viewport === v.name);
  console.log(`[${v.name}px] ${mine.length - mine.filter((r) => !r.ok).length} passed, ${mine.filter((r) => !r.ok).length} failed`);
}
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed in total (${base})`);
process.exit(failed.length ? 1 : 0);
