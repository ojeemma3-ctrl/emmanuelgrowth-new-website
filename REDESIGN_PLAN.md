# Redesign plan — GoHighLevel-style layout, Emmanuel Growth brand

Reference: gohighlevel.com (layout and rhythm only). We keep our own colours
(forest / ink / growth green), fonts (Oswald + Inter), copy and claims.

Ground rules
- No lime background blocks (green is for accents, buttons and small marks).
- No fake testimonials, statistics, logos, prices or trial offers.
- One name per offer everywhere: Get Found · Convert Enquiries · Get More Reviews.
- Main call to action everywhere: "Get a free visibility check" (opens the contact form for now).

## Homepage order
1. Hero + outcome strip — done (Phase 1)
2. One-line intro: "Three places businesses lose customers."
3. Three offer sections: Get Found, Convert Enquiries, Get More Reviews
4. How it works — 3 steps, no tabs
5. Pricing
6. FAQ
7. Short About
8. Final call to action

## Phase 1 — Header + hero ✅
Dark header, dark two-column hero with example dashboard panel, outcome strip.

## Phase 2 — Intro line + three offer sections ✅
- Full-width sections, image side alternates (right, left, right).
- Each: number, owner's problem as a quote, the fix in 1–2 sentences,
  3 short "what you get" bullets, an image, ONE button "Fix this problem".
- Images are illustrative UI panels built in code (like the hero panel)
  until real photos/screenshots are supplied.
- Nav: Get Found · Convert Enquiries · Get More Reviews · How It Works (+ Pricing in Phase 3).
- Main CTA label becomes "Get a free visibility check" in header, hero and final CTA.

## Phase 3 — How it works + Pricing ✅
- How it works: 3 numbered steps in a row (their "Built to make things easier" rhythm).
- Pricing: three offer cards + one dark highlighted "Complete system" card.
  Each card: large [PRICE] placeholder + "/month", one-line "who it's for",
  divider list of what's included, one full-width button. No "most popular" label.
  All placeholders live in one config object at the top of the pricing file.
- Add "Pricing" to the nav.

## Phase 4 — FAQ, About, final CTA, service pages  ← next
- FAQ accordion, short About, final call-to-action band, footer tidy.
- Carry the same components into /get-found, /convert-enquiries, /build-trust.
- Mobile pass on every page.
