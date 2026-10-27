// Smoke test: real clicks on the links and buttons that move between pages.
// Usage: npm run smoke -- <base url>      e.g. npm run smoke -- http://localhost:4173
// Uses the Chrome installed on this computer (playwright-core, no browser download).
// Set CHROME_PATH to use a different Chrome or Chromium. Exits with code 1 if any check fails.
import { chromium } from 'playwright-core';

const base = (process.argv[2] || process.env.SMOKE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Give a base URL, for example: npm run smoke -- http://localhost:4173');
  process.exit(2);
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' },
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const results = [];

async function openHome() {
  const res = await page.goto(`${base}/`, { waitUntil: 'load' });
  if (!res || !res.ok()) throw new Error(`home page returned ${res ? res.status() : 'no response'}`);
  // The cookie banner can sit over the footer; dismiss it the way a visitor would, if it is there.
  const decline = page.getByRole('button', { name: /reject|decline|necessary only/i }).first();
  if (await decline.isVisible().catch(() => false)) await decline.click();
}

// Clicks a link on the home page and checks that the URL changes to `path` and that the new page loads.
async function linkCheck(label, locator, path) {
  try {
    await openHome();
    const link = locator();
    await link.scrollIntoViewIfNeeded();
    const [response] = await Promise.all([
      page.waitForNavigation({ url: (u) => new URL(u).pathname === path, timeout: 10000 }),
      link.click(),
    ]);
    if (!response || !response.ok()) throw new Error(`${path} returned ${response ? response.status() : 'no response'}`);
    await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 10000 });
    results.push({ label, ok: true, detail: `→ ${path} (${response.status()})` });
  } catch (error) {
    results.push({ label, ok: false, detail: `${error.message.split('\n')[0]} (now at ${new URL(page.url()).pathname})` });
  }
}

await linkCheck('Nav: Get a free visibility check', () => page.locator('.site-header .nav-button'), '/visibility-check');
for (const [plan, path] of [['Get Found', '/get-found'], ['Get More Reviews', '/get-more-reviews'], ['Convert Enquiries', '/convert-enquiries'], ['Complete system', '/complete-system']]) {
  await linkCheck(`Pricing: See what's included (${plan})`, () => page.locator(`#pricing .ph-card:has(.ph-name:text-is("${plan}")) .ph-details`), path);
}
await linkCheck('Footer: Get Found', () => page.locator('footer a[href="/get-found"]').first(), '/get-found');

// The contact box is not a page: the button must open it (a dialog), and the page must stay where it is.
try {
  await openHome();
  const button = page.locator('#pricing .cw-button');
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await page.getByRole('dialog').first().waitFor({ state: 'visible', timeout: 5000 });
  results.push({ label: 'Contact box: Tell me what you need', ok: true, detail: 'dialog opened' });
} catch (error) {
  results.push({ label: 'Contact box: Tell me what you need', ok: false, detail: error.message.split('\n')[0] });
}

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}  ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed (${base})`);
process.exit(failed ? 1 : 0);
