# Status

Last updated: 19 October 2026 (from the code at commit 5621f16). Update this file at the end of each work item.

## Done
- Home page redesign: hero with animated panel, three offer sections, How it works, pricing, FAQ, About, final CTA,
  footer; dark/lime design tokens; contact box (WhatsApp, email, quick message to Brevo list 7).
- Service pages: /get-found, /build-trust (Get More Reviews), /convert-enquiries. Legal pages: privacy, cookies, terms.
- Pricing section from lib/pricing-config.ts: four plans (EUR), early-access tags, plan-prefilled contact box,
  anchors #pricing, #get-found-plan, #get-more-reviews-plan, #convert-enquiries-plan, #complete-system-plan.
- Visibility check (/visibility-check):
  - Step 1: business search (Google Places autocomplete) or manual entry, optional "What do you do?",
    "Best way to reach you" (WhatsApp with SVG-flag country selector, or email), consent, optional tips box.
    Contact and consent are validated before any Google or PageSpeed call.
  - Checks: Google profile, nearby comparison (same type, keyword rerun, fair-comparison rule), website basics,
    contact links, search/AI signals, mobile speed (PageSpeed), name/address/phone consistency.
  - Full report on screen: ring of checks passed, Top 3 fixes, area statuses, tiles, what's working / what to fix,
    nearby table, every check by area, offer tags, "How to fix this" steps, closing block.
  - Save as PDF (browser print, cover page, ~12 pages).
  - Results survive Back and refresh for 2 hours (sessionStorage, no contact details stored).
  - Limits per IP and per day (in memory), signed tickets, honeypot, Turnstile support (keys not set).
  - Brevo contact sync and owner email on completion; free personal review dialog (code done, see Blocked).

## In progress
- Nothing mid-step. Last finished: personal review dialog (5621f16).

## Pending (in order)
1. Finish Brevo setup and test. Owner to create list "Visibility check" and attributes BUSINESS_NAME, WEBSITE_URL,
   PREFERRED_CHANNEL, VC_SUMMARY (text), VC_DATE (date), TIPS_CONSENT, PERSONAL_REVIEW (boolean), WHATSAPP.
   Not created as of 19 Oct 2026: confirm with the owner before testing. Then set env vars and test a fake lead.
2. Prompt 4: new checks (docs/NEXT_PROMPTS.md, item 1).
3. Polish plus a proper A4 PDF layout: about 6 pages, plain-English wording, cover page, review bars,
   no repeated sections.
4. Plan detail pages (the Complete system has no page; its link goes to /#services).
5. Going live: Google and Brevo env secrets in Cloudflare, domain, limits, a quota cap on Places API.
6. Privacy retention period: owner decides (placeholder "[RETENTION PERIOD - owner to decide]" in the policy).
7. Animate the pricing section (later).
8. Maybe social checks with Scrape Creators (later).
9. GoHighLevel setup for Convert Enquiries (later).

## Blocked
- Brevo delivery: BREVO_API_KEY is not in .env.local (the contact form reads it from Cloudflare);
  BREVO_VISIBILITY_LIST_ID and BREVO_SENDER_EMAIL not set; list and attributes not created. Until then the check
  logs `brevo_list_missing` / `brevo_key_missing` and no lead emails are sent.

## Known issues
- Daily limits are in memory per server instance (reset on restart, not shared). Rely on a Google Cloud quota cap.
- PERSONAL_REVIEW is set back to false if the same contact runs a new check (the review email is the reliable record).
- The nearby search occasionally returns a Google error on the first try; the keyword rerun works.
- Website checks read the HTML only; links or text added by scripts may be missed (the report says so).
- Recent reviews can't be checked automatically (Places returns at most 5 reviews).
- Home hero note "Takes about 60 seconds" and the FAQ / How it works wording predate the current check flow.
- Cookie policy doesn't mention the Turnstile script (only loads if Turnstile keys are set).
- VISIBILITY_SIGNING_SECRET is empty locally (a secret is derived from the Google keys); set a real one before launch.
- Pre-existing TypeScript errors in InstantCheck.tsx and app/api/contact/route.ts (build still passes).
