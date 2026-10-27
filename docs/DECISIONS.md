# Decisions

## Visibility check
- A free lead magnet. Flow: business name (Google suggestions) → best way to reach you (WhatsApp or Email,
  one only; country selector with SVG flags) → consent → full report on screen plus Save as PDF. No lock or gate.
- "Get a free personal review" is a separate request that flags the lead (PERSONAL_REVIEW in Brevo + owner email).
- Results survive Back and refresh (sessionStorage, up to 2 hours). Contact details are never stored there.
- No overall percentage: the report shows a count of checks passed.
- Thresholds are labelled "our baseline" (Google publishes no minimums).
- Social and link-in-bio links are not websites.
- A too-general Google category skips the competitor comparison (the visitor can rerun it with a keyword).
- Huge size gaps (under a tenth or over ten times the nearby median) are shown but not rated
  ("Couldn't compare fairly").
- Review recency isn't reliable: Places returns at most 5 reviews, chosen by relevance.

## Offers (EUR, early-client prices for the first 5 businesses)
- Get Found: €97/month, 3-month minimum. A simple one-page landing page only (not a full website), Google
  profile set up, improved and checked monthly, call and WhatsApp buttons, up to 3 update requests a month.
- Custom websites (5 to 10 pages) are quoted separately on request ("Tell me what you need" under the home
  pricing cards opens the contact box with "Website improvements"). No website price is shown yet.
- Still undecided: what happens to the landing page if a client cancels Get Found, and what the 3 monthly
  update requests cover (TODO(owner) in app/get-found/page.tsx and lib/pricing-config.ts).
- Get More Reviews: €97/month. Review requests, one tap to Google or Trustpilot, reply help, monthly summary.
- Convert Enquiries (early access): from €197/month plus usage. One inbox for WhatsApp, Instagram, Facebook and
  website chat on GoHighLevel; AI first reply and follow-up. Setup fee quoted on request. Don't promise TikTok.
- Complete system (early access): from €297/month plus usage.
- AI and messaging usage billed separately by volume.
- Nigeria: payment by message; price fixed in EUR, invoiced at that day's rate.

## Open decisions (owner)
- Does Get Found include Google profile work?
- Are reviews and enquiry handling sold without a website?
- Setup fee amount for the concierge (conciergeSetupFee in lib/pricing-config.ts, currently null).

## Privacy (26 Oct 2026)
- Retention: contact form and visibility check details are kept for 24 months after our last contact, then
  deleted; anyone can ask for deletion sooner. Set by the owner.

## Framework and testing (27 Oct 2026)
- vinext 1.3.1 with React 19.3.1, react-server-dom-webpack 19.3.1 and @vitejs/plugin-rsc 0.5.38, all pinned
  exactly; package-lock.json is committed so Cloudflare builds the same versions. vinext 1.0.0-beta.3 shipped a
  production bundle where Link imported navigateClientSide from a chunk that did not export it, so links between
  pages did nothing on the live site.
- `npm run smoke -- <url>` crawls every page at 1440px and 390px with real clicks (links, contact box, tabs,
  menu, FAQ) and fails on a wrong URL, a page that doesn't render or any console error. Run it on the Cloudflare
  preview before merging to main.
- Local production check: `npm run build`, then `npx vite preview --port 4173` (runs the Worker in workerd).
  `vinext start` runs on Node and can't load cloudflare:workers.

## SEO (27 Oct 2026)
- Only emmanuelgrowth.com and www.emmanuelgrowth.com are indexable. Any other host (*.workers.dev, previews,
  local) gets "X-Robots-Tag: noindex, nofollow" and a robots.txt that disallows everything (proxy.ts).
- Share image: public/og.jpg, 1200x630, about 95 KB (SHARE_IMAGE in lib/service-metadata.ts). The old 1672x941
  og.png is in _archive/public/.
- Every public page has its own title, description, canonical and Open Graph / Twitter tags (pageMetadata).
  The 404 page (app/not-found.tsx) is noindex with a neutral title and no canonical or share tags.

## Infrastructure
- Google Cloud project "Emmanuel Growth" on a free trial (about 90 days from 18 Oct 2026).
- Two keys, restricted to Places API (New) and PageSpeed Insights. €5 budget alert.
- Keys live only in .env.local until going live (then Cloudflare secrets).
- Brevo: the contact form uses its own list (ID 7); the check uses the list "Visibility check"
  (BREVO_VISIBILITY_LIST_ID). WhatsApp-only contacts use the SMS attribute and are SMS-blacklisted (no SMS marketing).

## Site structure (24 Oct 2026)
- Get More Reviews lives at /get-more-reviews; /build-trust is a permanent redirect (next.config.ts). Use
  /get-more-reviews everywhere.
- The Complete system has its own page, /complete-system; its status (early access, waitlist) comes from
  lib/pricing-config.ts. No launch date is promised.
- Service pages: primary action is the free visibility check, secondary is a free personal review (contact box).
- Example visuals use one invented hotel, Harbour Hotel. No real brands. The home hero dashboard and the
  service page heroes show a visible "Example" label; the home tab graphics do not (since 27 Oct 2026). Every
  graphic's screen-reader text starts with "Example:".

## Home tabs section (27 Oct 2026)
- Headlines without quotation marks. No "Example" label in the tab panel.
- The panel always has the tallest tab's height (invisible copies of all three texts share its grid cell), so it
  never jumps; text and graphic are vertically centred in their halves with equal padding.
- No hard line between the white text half and the band-coloured graphic half: a ~110px horizontal fade (vertical
  on phones), and the ruled texture fades in too.
- Get Found graphic: the Google search, then a one-page landing page card for Harbour Hotel (Rooms in the city
  centre; Open every day, Free parking, Breakfast included; Call, WhatsApp, Book a room; "Your landing page").
  Its loop is 11.2s (FOUND_LOOP_MS in OfferCards.tsx) and its tab's progress bar uses the same length; the other
  tabs stay at 9.6s. Reduced motion shows only the finished landing page. The service page hero uses the same graphic.
- The home hero visual sits in HeroVisualFrame (position, crop, fades); replace HeroVisual with an image or video
  without touching the frame.
- WhatsApp number: one setting, OWNER.whatsapp in lib/check-config.ts.

## Colour system (final, 26 Oct 2026)
- Black #0B0C0E, white, lime #C6F135, deep green #10331A, pale green band #EEF4E4. No other hues.
  Supporting tints: band border #DCE6CC, box tint #F5F8EF, tint border #E3EBD6. Tokens in :root at the top of
  app/globals.css: --ink, --lime, --green-deep, --band, --band-border, --tint, --tint-border.
- Lime is never text on a light background. It is used for buttons, the active tab, status chips with dark text,
  and as the glyph inside a deep green chip.
- Home and service pages: sections after the hero alternate pale band / white by position (the closing CTA's outer
  background too; its black card is unchanged). Boxes on a band are white with a band border; boxes on white are
  tinted with a tint border. The home tab panel is a white box; its example area keeps the ruled texture on the band.
- Round chips (numbers, ticks, crosses, steps, the tab icon) are deep green with a lime glyph. Small labels on light
  are deep green.
- Hero gradient (home and service pages): dark top, deep calm greens in the middle (#10331A, #1F4A27, #4A7339,
  #A7C28C), pale end #E6EFD9 to white. Same height as before.
- Buttons are flat: solid fill, no raised edge or press-down movement.
- Visibility check page: pale band background, deep green step chips with a lime number, black hero card. The
  report layout and the A4 PDF are unchanged (PDF pages compared pixel for pixel).

## Service pages (26 Oct 2026)
- One template (components/home/ServicePage.tsx) for all four pages, sections in a fixed order: hero, Why it
  matters, What you get, How it works, Who it's for / What this is not, plan card, FAQ, closing CTA.
- Service pages are real pages, never pop-ups. A new page opens at the top instantly with a 200ms fade
  (components/RouteTransition.tsx); smooth scrolling is kept for in-page anchors; no fade with reduced motion.
- "What you get" lists only the plan's features from lib/pricing-config.ts. The build fails if a feature is
  missing, extra, or has no plain-English line in lib/included-lines.ts. New features need the owner's approval.
- "Why it matters" uses plain reasoning only: no statistics without a cited, current public source.
- "What this is not" states only what the project confirms (for example: no guaranteed rankings; we never
  write, buy or fake reviews; AI handles first steps and people stay in control; TikTok isn't included).
- Early access and the waitlist come from the plan's status in the config. No start date is shown.
- "How it works" on each service page shows that service's own steps (what happens for the business's customers),
  built only from the plan's items; the generic three steps stay on the home page only.
- Custom website offer: a visible block (CustomWebsiteCard.tsx) under the home pricing cards and as its own
  section after "What you get" on /get-found. Its button opens the contact box with "Website improvements".
  No price is shown. Not on other pages.
- Service page sections alternate band / white by position, so an extra section keeps the rhythm.
- FAQ answers come from the config, docs and CLAUDE.md; unknown facts stay general with a TODO(owner).
  FAQPage structured data is built from the same text as the page.

## Button logic
- Offer tags (lib/check-offers.ts) map to plan pages:
  - reviews and rating → Get More Reviews (/get-more-reviews)
  - no one-tap contact → Convert Enquiries (/convert-enquiries, early access)
  - no website or only a social link → A simple landing page (/get-found)
  - speed and page settings on an existing site → "Ask me about this" opens the contact box prefilled
    with "Website improvements"
  - category, photos, hours, name/address/phone consistency → no tag (free fix only)
- Closing block adapts: with a website, "See how I can help" (/#pricing); without, "See how I build it"
  (/get-found). Both add "Get a free personal review" and "Talk to me directly".
