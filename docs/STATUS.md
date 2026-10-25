# Status

Last updated: 26 October 2026 (privacy retention, page transitions, service pages rebuilt on one template). Update this file at the end of each work item.

## Done
- Home page: dark-to-lime hero with an example dashboard (HeroVisualFrame owns position and fades; HeroVisual is
  the swappable picture), four boxes, a tabbed problem section with looping example graphics (auto-advance,
  Next button), How it works, pricing cards on white, FAQ (now with after-the-check, cancelling, outside the
  UK, who you work with), About with the founder photo, final CTA (visibility check + free personal review).
  All example visuals use one invented hotel (Harbour Hotel), labelled Example.
- WhatsApp shortcut: floating button on phones and a footer link, number from OWNER.whatsapp in lib/check-config.ts.
- Sharing image: public/og.png (1672x941) for Open Graph and Twitter on every page.
- Listings guide: /guides/listings (lib/listings-by-country.ts: core listings + GB, NG, US). France is hidden until it
  has entries (TODO in the same file). In the sitemap.
- Service pages on one template (components/home/ServicePage.tsx): /get-found, /get-more-reviews,
  /convert-enquiries and /complete-system. Sections: hero (880px, matching example graphic, jump boxes), Why it
  matters, What you get (from lib/pricing-config.ts, one line each in lib/included-lines.ts, checked at build
  time), How it works, Who it's for / What this is not, plan card, FAQ (+ FAQPage data), closing CTA. Unique
  metadata via lib/service-metadata.ts. Screenshots: screenshots/service-pages/ (git-ignored).
  /build-trust permanently redirects (308) to /get-more-reviews (next.config.ts). Legal pages: privacy, cookies, terms.
- Page changes open at the top instantly and fade in (components/RouteTransition.tsx); smooth scrolling stays
  for in-page anchors; no fade with reduced motion.
- Privacy policy: retention is 24 months after the last contact, with deletion sooner on request.
- Pricing section from lib/pricing-config.ts: four plans (EUR), early-access tags, plan-prefilled contact box,
  anchors #pricing, #get-found-plan, #get-more-reviews-plan, #convert-enquiries-plan, #complete-system-plan.
- Visibility check (/visibility-check):
  - Step 1: business search (Google Places autocomplete) or manual entry, optional "What do you do?",
    "Best way to reach you" (WhatsApp with SVG-flag country selector, or email), consent, optional tips box.
    Contact and consent are validated before any Google or PageSpeed call.
  - Checks: Google profile, nearby comparison (same type, keyword rerun, fair-comparison rule), website basics,
    contact links, search/AI signals, mobile speed (PageSpeed), name/address/phone consistency.
  - Report on screen (app-like, Inter only, tokens scoped to the check): header card with ring, Top 3 fixes,
    sticky section bar, filter chips (All / Needs attention / Good), one expandable card per area with rows and
    inline "Why it matters and how to fix", nearby review bars + table / cards, skeletons while loading, closing block.
    Plain names per rule (displayName / technicalName in lib/check-standard.ts); no full web addresses inline.
  - Save as PDF: dedicated A4 print layout (components/visibility-check/PrintReport.tsx), 6 fixed pages: cover,
    summary, Google and reviews, website, contact / consistency / AI readiness, next steps. Page numbers in Chrome.
  - Consistency area: one line about other listings with a "See where to check" link to /guides/listings?country=XX
    (country from the Google profile; type=hospitality adds Tripadvisor). The PDF has the line only.
  - Results survive Back and refresh for 2 hours (sessionStorage, no contact details stored).
  - Limits per IP and per day (in memory), signed tickets, honeypot, Turnstile support (keys not set).
  - Brevo contact sync and owner email on completion; free personal review dialog (code done, see Blocked).

## In progress
- Nothing mid-step. Last finished: visibility check redesign (type and tokens, layout, A4 PDF).

## Pending (in order)
1. Finish Brevo setup and test. Owner to create list "Visibility check" and attributes BUSINESS_NAME, WEBSITE_URL,
   PREFERRED_CHANNEL, VC_SUMMARY (text), VC_DATE (date), TIPS_CONSENT, PERSONAL_REVIEW (boolean), WHATSAPP.
   Not created as of 19 Oct 2026: confirm with the owner before testing. Then set env vars and test a fake lead.
2. Prompt 4: new checks (docs/NEXT_PROMPTS.md, item 1).
3. Wording polish across the report (the A4 PDF layout is done).
5. Going live: Google and Brevo env secrets in Cloudflare, domain, limits, a quota cap on Places API.
6. Service page facts for the owner (TODOs in app/<page>/page.tsx and components/home/FAQ.tsx): notice period
   after the minimum term; how customers are added for review requests and which channels are used; what the
   owner does day to day; Convert Enquiries alerts, setup needs and start date; what a Get Found client provides.
7. Privacy policy "Last updated" date: still 18 September 2026; the owner decides whether to change it.
8. Animate the pricing section (later).
9. Maybe social checks with Scrape Creators (later).
10. GoHighLevel setup for Convert Enquiries (later).

## Blocked
- Brevo delivery: local settings are in .env.local (test key, list 8, sender, notify address, Cloudflare Turnstile
  test keys) as of 25 Oct 2026; the owner's end-to-end lead test has not been reported yet.

## Known issues
- Daily limits are in memory per server instance (reset on restart, not shared). Rely on a Google Cloud quota cap.
- PERSONAL_REVIEW is set back to false if the same contact runs a new check (the review email is the reliable record).
- The nearby search occasionally returns a Google error on the first try; the keyword rerun works.
- Website checks read the HTML only; links or text added by scripts may be missed (the report says so).
- Recent reviews can't be checked automatically (Places returns at most 5 reviews).
- Home hero note "Takes about 60 seconds" and the FAQ / How it works wording predate the current check flow.
- Cookie policy doesn't mention the Turnstile script (only loads if Turnstile keys are set).
- VISIBILITY_SIGNING_SECRET is set locally; set a real one in Cloudflare before launch.
- Pre-existing TypeScript errors in InstantCheck.tsx and app/api/contact/route.ts (build still passes).
