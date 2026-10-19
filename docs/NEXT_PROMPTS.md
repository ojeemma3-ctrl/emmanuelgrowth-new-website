# Next prompts

"Run the next item" = the first item below not marked DONE. Mark an item DONE (with the commit) when finished.

---

## Item 1: Prompt 4, new checks

Add new checks to the visibility check in three steps. Commit locally after each step (never push), run lint and
build, and if anything breaks, revert that step and say so. STOP after step 1 for review.

Rules for all checks:
- Group each check under an existing area (Google profile, reviews, website basics, contact, search and AI, speed,
  consistency). No new top-level areas.
- Add each rule to lib/check-standard.ts with: what we found, why it matters, how to fix (3 to 5 free steps),
  priority and effort. Keep the honesty rules ("our baseline", no promises, no fear wording).
- Keep the safe-fetching rules (lib/visibility/safe-fetch.ts: public addresses only, redirect and size limits).
  Total fetch budget for the new checks: 20 seconds per check.
- If a page is built by scripts and the HTML has too little to judge, mark the check "Couldn't check reliably"
  instead of failing it.
- Name the exact page tested in each finding.

Step 1: search engine signals and tracking.
- "Allowed to appear in Google": noindex (meta and X-Robots-Tag), robots.txt rules for the page, canonical pointing
  elsewhere, whether the page is listed in the sitemap. Never say "indexed" (we can't see Google's index).
- Detect Google Analytics, Google Tag Manager, Meta Pixel and a Google site verification tag. Caveat in the wording:
  tags loaded only after cookie consent may not be visible to the check.

Step 2: contact and AI readiness.
- Detect a contact form, a chat widget and a booking tool.
- Main text present without scripts (enough readable text in the HTML).
- LocalBusiness data: also check sameAs and services or areaServed.
- Local relevance: does the page title and main heading mention the town and the service?

Step 3: accessibility, legal links, position snapshot.
- Accessibility score from PageSpeed: 90+ Good, 70 to 89 Needs attention, under 70 Problem.
- Privacy policy link present; for sites in France, also a legal notice ("mentions légales") link.
- Search position snapshot behind ENABLE_POSITION_SNAPSHOT (default false): at most 2 Places Text Search (New)
  requests per check, requesting only the place ID field so the cheapest SKU applies; label results "approximate";
  per-IP and daily caps.

---

## Item 2: polish and A4 PDF layout
Tidy wording to plain English across the report and make the PDF a proper A4 document of about 6 pages: cover page,
review bars, no repeated sections, sensible page breaks. Keep "Save as PDF" (browser print, no new dependencies).
Show desktop, phone and PDF before committing.

## Item 3: plan detail pages
Proper pages for each plan (Get Found, Get More Reviews, Convert Enquiries, Complete system) using
lib/pricing-config.ts for prices and terms. The Complete system currently links to /#services. Update the
pricing "See what's included" links and the report's offer tags to the new pages.

## Item 4: go live checklist
Add Google and Brevo secrets in Cloudflare, connect the domain, set CHECK_DAILY_CAP and CHECK_LIMIT_PER_IP_PER_DAY,
set a real VISIBILITY_SIGNING_SECRET, add Turnstile keys (and mention Turnstile in the cookie policy, with the
owner's OK), set a quota cap on Places API in Google Cloud, confirm the privacy retention period, and test a fake lead
end to end on the live site.
