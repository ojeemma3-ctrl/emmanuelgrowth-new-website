# Emmanuel Growth website

emmanuelgrowth.com: a Next.js 16 site (vinext + Vite) on Cloudflare for Emmanuel Growth: done-for-you websites,
review systems and enquiry handling for small local businesses, plus content on AI tools and marketing.
Owner: Emmanuel, a student with limited time. Keep everything simple and quick. Windows; Claude desktop app, Code tab.

## Start of every session
Read docs/STATUS.md, docs/DECISIONS.md and docs/NEXT_PROMPTS.md. Tell Emmanuel in 5 lines where we are, then wait.
"Run the next item" means the first open item in docs/NEXT_PROMPTS.md.

## Rules
- Work in small steps; stop for review where asked. Ask before big changes.
- Commit locally after each step. Never push. Run `npm run lint` and `npm run build` before committing.
- Don't delete files: move them to `_archive/`.
- Ask before changing legal wording (privacy, cookies, terms). Never invent a retention period.
- Keys only in `.env.local` (git-ignored). Never put keys in files, commits or chat.
- Don't invent prices or numbers. No fake testimonials, statistics, logos or awards.
- No fear wording or fake scarcity. Say "helps" and "may", not promises.
- Don't mention specific cities or industries on the main pages.
- Never use the word "verified" about the check's findings.

## Design
- Near-black, white, light grey; one lime green used sparingly (primary buttons, small accents, never a full-width
  background); dark text on lime. Tokens live in app/globals.css (`--black`, `--surface`, `--grey`, `--green`, ...).
- Status colours always with a label or icon, never colour alone: Good green, Needs attention amber,
  Problem red, Couldn't check grey.
- No emoji icons (inline SVG only; country flags are SVG files in public/flags). Mobile first, 16px minimum text,
  WCAG AA, keyboard accessible, respect reduced motion.

## Key files
- Visibility check page: app/visibility-check/page.tsx; UI in components/visibility-check/
  (InstantCheck = form + flow, ResultView = report + PDF, ContactFields, CountryPhone, PersonalReview, findings.ts, saved.ts)
- API routes: app/api/visibility/ (config, autocomplete, place, start, competitors, website, pagespeed, complete, review)
- lib/check-standard.ts: every rule, thresholds, wording, priorities, effort and the free "How to fix this" steps
- lib/check-config.ts: REQUIRE_CONTACT_BEFORE_REPORT, HELP_LINK, plan links, contact topics, owner contact details
- lib/check-offers.ts: which fix gets which offer tag
- lib/pricing-config.ts: plans, prices, terms, button labels and links (home page pricing section)
- lib/visibility/: server helpers and daily limits (server.ts), Google Places (places.ts), safe fetch, website and
  PageSpeed checks, contact validation (contact.ts), Brevo (brevo.ts), owner email (notify.ts)
- Contact form + Brevo: app/api/contact/route.ts (separate list, don't change)
- Legal: app/privacy-policy/page.tsx, app/cookie-policy/page.tsx, app/terms-of-use/page.tsx
- Brand/brief: BRIEF.md, DESIGN.md

## Env variables (names only; values go in .env.local or Cloudflare)
GOOGLE_PLACES_API_KEY, PAGESPEED_API_KEY, VISIBILITY_SIGNING_SECRET, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY,
CHECK_DAILY_CAP, CHECK_LIMIT_PER_IP_PER_DAY, BREVO_API_KEY, BREVO_VISIBILITY_LIST_ID, BREVO_SENDER_EMAIL,
VISIBILITY_NOTIFY_EMAIL.

## Practical notes
- Dev server: localhost:5173 (launch config "emmanuelgrowth-website" in the studio root .claude/launch.json).
- Bash heredocs on this machine can strip backslashes: write multi-line scripts with the file tool instead.
- Known TypeScript errors in InstantCheck.tsx and app/api/contact/route.ts predate this work; lint and build pass.
