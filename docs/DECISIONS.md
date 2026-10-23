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
- Get Found: €97/month, 3-month minimum. Simple website, Google profile set up and checked monthly,
  call and WhatsApp buttons, up to 3 update requests a month.
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
- Privacy retention period.

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
- Example visuals use one invented hotel, Harbour Hotel, always labelled Example. No real brands.
- The home hero visual sits in HeroVisualFrame (position, crop, fades); replace HeroVisual with an image or video
  without touching the frame.
- WhatsApp number: one setting, OWNER.whatsapp in lib/check-config.ts.

## Button logic
- Offer tags (lib/check-offers.ts) map to plan pages:
  - reviews and rating → Get More Reviews (/get-more-reviews)
  - no one-tap contact → Convert Enquiries (/convert-enquiries, early access)
  - no website or only a social link → A simple website (/get-found)
  - speed and page settings on an existing site → "Ask me about this" opens the contact box prefilled
    with "Website improvements"
  - category, photos, hours, name/address/phone consistency → no tag (free fix only)
- Closing block adapts: with a website, "See how I can help" (/#pricing); without, "See how I build it"
  (/get-found). Both add "Get a free personal review" and "Talk to me directly".
