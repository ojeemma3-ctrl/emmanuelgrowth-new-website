# DESIGN.md — Emmanuel Growth Website Visual System

> **Purpose**
>
> This file is the single source of truth for how the Emmanuel Growth website looks and behaves.
>
> It adapts the **discipline and level of specificity** of the 9x visual system to Emmanuel Growth's own brand. It must not copy 9x identity, colours, logo, or exact brand signature.
>
> Codex must follow this file before making any visual decision. Do not invent colours, font roles, spacing values, radii, shadows, card treatments, section rhythms, or responsive behaviour outside this system without first proposing the change.

---

# 1. Brand in one paragraph

Emmanuel Growth is a modern marketing operations business that helps businesses:

1. **Get found**
2. **Convert more enquiries**
3. **Retain customers**
4. **Build trust**

The website should feel:

- premium
- clean
- practical
- calm
- warm
- modern
- confident
- easy to understand

It should **not** feel like:

- a software dashboard
- a generic AI agency
- a chatbot product
- a loud digital-marketing template
- a futuristic technology company
- a creative-production portfolio

The site should communicate:

> **We understand the business problem first. Then we use the right system to solve it.**

---

# 2. Design principles

## 2.1 Clarity before decoration

A visitor should understand what Emmanuel Growth does within approximately 10 seconds.

Design must support comprehension.

If an effect, visual, animation, card, icon, or section does not improve:
- understanding
- trust
- conversion
- perceived quality

question whether it belongs.

## 2.2 Premium through restraint

Premium does **not** mean more effects.

Premium comes from:
- strong hierarchy
- exact spacing
- clean alignment
- generous whitespace
- high-quality typography
- subtle borders
- controlled colour
- clear content grouping
- deliberate visual rhythm

## 2.3 Flat, editorial, structured

Use:
- flat surfaces
- crisp borders
- generous padding
- large clear type
- disciplined grids
- simple editorial layouts

Avoid:
- glassmorphism
- glowing UI
- heavy shadows
- fake depth
- neon effects
- unnecessary gradients
- excessive rounded cards
- decorative blobs without purpose

## 2.4 One system only

All sections must feel like they belong to one website.

Do not change:
- heading style
- card style
- button style
- corner radius
- spacing logic
- border treatment
- icon style

from section to section.

## 2.5 Business outcomes before technology

Lead with:
- getting found
- faster replies
- more enquiries converted
- more reviews
- better follow-up
- repeat customers

Technology is explained only after the business outcome is clear.

---

# 3. Colour system

Reference colours by token name in implementation.

## 3.1 Core brand colours

| Token | Hex | Use |
|---|---|---|
| `brand/forest` | `#1A3A1A` | Primary dark section, primary button, strong text accents |
| `brand/growth` | `#7DC429` | Signature accent, selected highlights, active states |
| `brand/leaf` | `#F0F4E8` | Main warm page canvas |
| `brand/ink` | `#0A1F0A` | Primary text on light backgrounds |
| `brand/sage` | `#8AAB8A` | Secondary text, captions, muted details |
| `brand/deep-growth` | `#2A5A10` | Secondary green, hover/active depth |

## 3.2 Supporting neutrals

| Token | Hex | Use |
|---|---|---|
| `neutral/paper` | `#F8FAF4` | Alternate light section / card surface |
| `neutral/white` | `#FFFFFF` | Cards and high-contrast surfaces only |
| `neutral/text` | `#2A3A2A` | Softer body text |
| `neutral/line` | `#DDE5D4` | Borders and dividers |
| `neutral/line-soft` | `#E8EEE2` | Quiet separators |
| `neutral/muted` | `#617061` | Secondary text where sage is too low contrast |

## 3.3 Colour hierarchy

Default page composition:

- page canvas: `brand/leaf`
- main text: `brand/ink`
- cards: `neutral/white` or `neutral/paper`
- dark sections: `brand/forest`
- accent: `brand/growth`
- borders: `neutral/line`

## 3.4 Accent rule

`brand/growth` is an accent.

Use it for:
- selected words
- small labels
- active states
- tiny indicators
- one important icon
- CTA emphasis where useful
- diagram progress points

Do **not**:
- fill large sections with bright growth green
- colour every heading green
- make all buttons growth green
- turn the page into a neon-green interface

## 3.5 Dark-section rule

On `brand/forest`:

- main heading: `#FFFFFF` or `brand/leaf`
- body copy: `#DCE8D5`
- secondary text: `#B9C9B4`
- border: `rgba(255,255,255,0.16)`
- accent: `brand/growth`

## 3.6 Section rhythm

Do not alternate colours mechanically.

Preferred rhythm:

1. warm light hero
2. warm light introduction
3. light service section
4. dark / forest conversion section
5. light service section
6. light journey / proof section
7. dark final CTA
8. compact footer

The page should feel composed, not striped.

## 3.7 Not defined

Do not introduce:
- purple
- cyan
- electric blue
- bright red
- orange
- pink
- random grey systems

unless a future approved campaign specifically requires them.

---

# 4. Typography

## 4.1 Typefaces

Two typefaces. No additions in V1.

| Role | Typeface | Weight |
|---|---|---|
| Display & headings | **Oswald** | 700 display/h1, 600 h2–h4 |
| Body, navigation, captions, buttons, labels | **Inter** | 400 body, 500 medium, 600 semibold |

This pairing is the Emmanuel Growth signature.

Oswald provides:
- directness
- authority
- character

Inter provides:
- readability
- modern UI clarity
- calm professionalism

Do not use Oswald for long body copy.

## 4.2 Web type scale

Values are:

**font-size / line-height / letter-spacing**

### Desktop ≥ 1200px

| Role | Spec |
|---|---|
| `display` | **72 / 76 / -1.6px** — Oswald 700 |
| `h1` | **56 / 62 / -1.0px** — Oswald 700 |
| `h2` | **44 / 50 / -0.6px** — Oswald 600 |
| `h3` | **30 / 36 / -0.3px** — Oswald 600 |
| `h4` | **22 / 28 / -0.1px** — Oswald 600 |
| `body-lg` | **20 / 31 / -0.15px** — Inter 400 |
| `body` | **16 / 26 / -0.05px** — Inter 400 |
| `body-sm` | **14 / 22 / 0** — Inter 400 |
| `quote` | **24 / 34 / -0.2px** — Inter 600 |
| `kicker` | **12 / 16 / +1.4px** — Inter 600 UPPERCASE |
| `caption` | **12 / 18 / +0.1px** — Inter 500 |
| `button` | **15 / 20 / 0** — Inter 600 |
| `nav` | **14 / 20 / 0** — Inter 500 |

### Tablet 768–1199px

| Role | Spec |
|---|---|
| `display` | **60 / 64 / -1.2px** |
| `h1` | **48 / 54 / -0.8px** |
| `h2` | **38 / 44 / -0.5px** |
| `h3` | **28 / 34 / -0.2px** |
| `h4` | **21 / 27 / 0** |
| `body-lg` | **19 / 30 / -0.1px** |
| `body` | **16 / 26 / 0** |
| `body-sm` | **14 / 22 / 0** |
| `kicker` | **12 / 16 / +1.3px** |

### Mobile ≤ 767px

| Role | Spec |
|---|---|
| `display` | **46 / 50 / -0.8px** |
| `h1` | **40 / 44 / -0.6px** |
| `h2` | **32 / 38 / -0.3px** |
| `h3` | **26 / 32 / -0.1px** |
| `h4` | **20 / 26 / 0** |
| `body-lg` | **18 / 29 / 0** |
| `body` | **16 / 26 / 0** |
| `body-sm` | **14 / 21 / 0** |
| `kicker` | **11 / 15 / +1.2px** |

## 4.3 Typography rules

- Apply type **by role**. Never insert random in-between sizes.
- Hero display copy should normally be 2–3 lines maximum.
- H2 section headings should normally remain under 3 lines.
- Body paragraph width: **620–720px maximum**.
- Hero support copy width: **520–620px maximum**.
- Do not center long paragraphs.
- Most service copy is left aligned.
- Kickers are always uppercase with positive tracking.
- Large headings use tight tracking.
- Avoid using growth green for every heading.
- Use emphasis through size, weight and spacing before colour.
- Do not use all-caps for long headings.

---

# 5. Spacing system

## 5.1 Spacing scale

Use only:

`0, 4, 8, 12, 16, 20, 24, 32, 48, 60, 80, 120`

Tokens:

| Token | px |
|---|---:|
| `space/0` | 0 |
| `space/1` | 4 |
| `space/2` | 8 |
| `space/3` | 12 |
| `space/4` | 16 |
| `space/5` | 20 |
| `space/6` | 24 |
| `space/7` | 32 |
| `space/8` | 48 |
| `space/9` | 60 |
| `space/10` | 80 |
| `space/11` | 120 |

Do not use arbitrary 27px, 37px, 54px, etc.

## 5.2 Section spacing

### Desktop

- standard section top/bottom: `120px`
- compact section: `80px`
- hero top: `120px`
- hero bottom: `120px`
- final CTA: `96–120px`
- footer vertical: `48–60px`

### Tablet

- standard section: `80px`
- compact section: `60px`
- hero: `80–96px`

### Mobile

- standard section: `64px`
- compact section: `48px`
- hero: `64–80px`

## 5.3 Internal spacing

Common relationships:

- kicker → heading: `12px`
- heading → intro copy: `20–24px`
- body paragraph → CTA: `32px`
- CTA button gap: `12px`
- card title → body: `12px`
- card body → action: `24px`
- icon → label: `12px`
- list-item vertical gap: `12–16px`
- service content → visual: `48–80px`

## 5.4 No manual nudging

All spacing must come from:
- flex gap
- grid gap
- padding tokens
- margin tokens

Avoid one-off pixel nudges.

---

# 6. Container and page geometry

## 6.1 Main container

Desktop:
- max width: **1200px**
- width: `calc(100% - 96px)`
- horizontal gutter: **48px minimum**

Large desktop ≥ 1440px:
- max width remains **1200px**
- do not stretch content simply because screen is wider

Tablet:
- horizontal gutter: **32px**

Mobile:
- horizontal gutter: **20px**

## 6.2 Narrow content widths

Use:

- `content/narrow`: **620px**
- `content/read`: **720px**
- `content/medium`: **880px**
- `content/full`: **1200px**

## 6.3 Grid

Use a 12-column conceptual grid.

Common section patterns:

- 6 / 6 — balanced content + visual
- 5 / 7 — shorter text + dominant demonstration
- 7 / 5 — dominant story + smaller support visual
- 4 / 8 — small label/intro + large content region
- full width — hero statements, journey, final CTA

Desktop column gap:
- **24–32px**

Tablet:
- **24px**

Mobile:
- single column

## 6.4 Alignment

Primary vertical alignment should be:
- top aligned for editorial/service sections
- center aligned only where the content requires it

Do not center everything vertically by default.

---

# 7. Border radius

Use restrained curves.

| Token | px | Use |
|---|---:|---|
| `radius/none` | 0 | Dividers / square blocks |
| `radius/sm` | 4 | Tiny controls / labels |
| `radius/md` | 6 | Small buttons / inputs |
| `radius/lg` | 8 | Standard buttons / cards |
| `radius/xl` | 12 | Large visuals / media |
| `radius/pill` | 999 | Selected chips / avatars only |

Rules:

- Most cards: `8px`
- Large media / demos: `12px`
- Do not use 24–40px bubbly cards.
- Do not round every section container.
- Full-width sections generally stay square.

---

# 8. Borders, shadows and depth

## 8.1 Borders

All structural borders are:

- **1px solid**

Light:
- `neutral/line`

Dark:
- `rgba(255,255,255,0.16)`

## 8.2 Shadows

Default: **none**

The system is flat.

If a visual needs separation:
1. use spacing
2. use border
3. use surface colour
4. only then consider an extremely subtle shadow

No large blurred shadows.

## 8.3 Blur

No backdrop blur in V1.

No frosted glass.

---

# 9. Navigation

## 9.1 Desktop nav

Height:
- **72px**

Container:
- max width `1200px`
- horizontal gutter follows page container

Layout:
- brand left
- links center/right
- CTA right

Gap:
- nav links: `28–32px`
- link to CTA: `24px`

Typography:
- `nav` role

## 9.2 Logo

Keep the Emmanuel Growth mark compact.

Suggested visual size:
- icon: **34–38px**
- wordmark aligned vertically to icon

Do not oversize the logo.

## 9.3 Sticky behaviour

Sticky navigation is allowed.

If sticky:
- use solid or 96% opaque background
- retain 1px bottom border
- no blur required
- do not animate the nav excessively

## 9.4 Mobile nav

- 64px height
- brand left
- menu button right
- simple slide/drop panel
- no complex drawer animation
- CTA remains visible inside menu

---

# 10. Buttons

## 10.1 Primary

- fill: `brand/forest`
- text: `#FFFFFF`
- font: Inter 600 / `button`
- radius: `8px`
- padding: **14px 20px**
- minimum height: **48px**
- border: none

Hover:
- fill: `brand/deep-growth`

## 10.2 Accent

- fill: `brand/growth`
- text: `brand/ink`
- same geometry as primary

Use selectively.

## 10.3 Outline

- fill: transparent or `neutral/white`
- text: `brand/ink`
- border: `1px neutral/line`
- radius: `6px`
- padding: **13px 18px**
- minimum height: **46px**

Hover:
- background: `neutral/paper`

## 10.4 Text link

- Inter 600
- underline or arrow cue on hover
- no fake button border

## 10.5 Button rules

- maximum 2 CTAs in a major section
- only one visually dominant CTA
- use short labels
- no oversized pill buttons everywhere
- do not use icon-only CTAs for critical actions

---

# 11. Kicker / eyebrow system

Kickers help create editorial structure.

Style:
- Inter 600
- 12px / 16px
- uppercase
- +1.4px tracking
- colour: `brand/deep-growth`
- dark background: `brand/growth`

Spacing:
- kicker → heading: `12px`

Optional small marker:
- 6px circle or 16px line
- never decorative overload

Examples:
- `HOW WE HELP`
- `GET FOUND`
- `CONVERT`
- `FOLLOW UP`
- `HOW IT WORKS`

---

# 12. Cards

Cards are supporting components, not the entire website.

## 12.1 Standard card

- background: `neutral/white`
- border: `1px neutral/line`
- radius: `8px`
- padding desktop: `28–32px`
- padding mobile: `24px`
- no shadow

## 12.2 Feature card

Use only where multiple equal items need comparison.

- padding: `32px`
- gap: `20–24px`
- icon max: `24px`
- title: h4 or strong body
- copy: body-sm/body

## 12.3 Demo / visual card

- radius: `12px`
- border: 1px
- overflow hidden
- background chosen for content
- padding: `24–32px`
- should have a clear business meaning

## 12.4 Card rules

Do not:
- place every paragraph in a card
- stack cards inside cards
- use random card sizes
- add shadows for “premium”
- use oversized icons

---

# 13. Hero

## 13.1 Layout

Desktop:
- 12-column grid
- text: 6 columns
- visual: 6 columns
- min visual width: ~500px where viewport allows

Tablet:
- 7 / 5 or stacked depending on content

Mobile:
- stack
- text first
- visual second

## 13.2 Hero geometry

Top/bottom padding:
- desktop: `120px`
- tablet: `80–96px`
- mobile: `64–80px`

Heading max-width:
- **760px**

Supporting text max-width:
- **600px**

CTA row:
- margin-top: `32px`
- gap: `12px`

## 13.3 Hero content

Headline:

> Get found.  
> Convert more enquiries.  
> Get more reviews.

The hero should be understandable before animation starts.

## 13.4 Hero visual

Do not use random stock photography.

Preferred future visual:
- simple customer journey
- real website / lead flow
- short AI Lead Concierge demo
- controlled multi-channel enquiry illustration

Until ready:
- use a deliberate visual frame
- label it internally as placeholder
- do not show “placeholder” text publicly

---

# 14. Service-section system

Each main offer should follow the same information hierarchy, but the layout may alternate to create rhythm.

## 14.1 Offer anatomy

1. kicker
2. outcome heading
3. problem statement
4. solution statement
5. service list
6. CTA
7. explanatory visual

## 14.2 Desktop layout

Preferred:
- text: 5 columns
- visual: 7 columns

Alternate:
- visual: 7 columns
- text: 5 columns

Do not alternate purely for decoration. Use the direction that reads naturally.

## 14.3 Offer text width

- max: `520px`

## 14.4 Service list

Use simple rows.

Each row:
- small check / dot
- one short service item
- gap: `12px`

Avoid giant icon grids.

---

# 15. AI Lead Concierge emphasis

This is the current lead offer.

Give it stronger prominence without turning the website into a chatbot product page.

## 15.1 Preferred dark section

The Convert section may use:
- `brand/forest` background
- light heading
- growth-green accent
- pale border treatment

This gives it a visual peak.

## 15.2 Demonstration layout

Show a simple sequence:

1. enquiry arrives
2. first response
3. details captured
4. lead qualified
5. booking / human handoff

Possible channels:
- website
- WhatsApp where supported
- Instagram where supported
- Facebook where supported

Do not imply unsupported integrations.

## 15.3 Chat demo styling

If a chat preview is used:

- clean white/leaf message surface
- no fake iPhone chrome unless necessary
- customer messages and business replies visually distinct
- human handoff clearly visible
- minimal metadata
- no giant “AI” badge
- no glowing bot icon

## 15.4 Language

Lead with:

> Do not let good leads disappear.

Not:

> AI-powered omnichannel automation.

---

# 16. Journey diagram

Core journey:

**GET FOUND → SEND A MESSAGE → BECOME A CUSTOMER → LEAVE A REVIEW → COME BACK**

## 16.1 Desktop

Can be horizontal.

Each stage:
- small label
- one simple icon
- one short explanation maximum

Gap:
- `24–32px`

Connectors:
- 1px line or simple arrow

## 16.2 Mobile

Stack vertically.

Do not shrink the full desktop flow into unreadable tiny boxes.

---

# 17. Proof / demonstration

Until real customer proof exists:

Use:
- working demos
- real Emmanuel Growth website work
- real automation flows
- real screenshots
- labelled concepts

Do not use:
- fabricated logos
- fake testimonials
- fake numbers
- fake case studies
- fake “trusted by” strips

A smaller honest proof section is better than a large fake one.

---

# 18. About section

Keep short.

Preferred geometry:
- 5 / 7 or 4 / 8 split
- optional founder image
- small biography
- practical experience
- no long CV

Heading:

> Simple marketing systems for real businesses.

About copy must strengthen trust, not interrupt the sales journey.

---

# 19. Final CTA

Preferred dark section.

Desktop:
- centered or 7/5 split
- max heading width ~760px
- max supporting copy ~620px

Padding:
- `96–120px`

Use one clear CTA.

No complicated form inside the CTA unless approved.

---

# 20. Forms

## 20.1 V1 form style

- label above field
- 48–52px input height
- 8px radius
- 1px border
- white surface
- 16px Inter
- strong visible focus state

## 20.2 Field spacing

- label → field: `8px`
- field group → next group: `20px`
- form section gap: `24–32px`

## 20.3 Error states

If required, define with accessible text and icon.

Do not invent a full semantic colour system unless implementation needs it.

---

# 21. Icons

Preferred icon style:
- simple outline
- 20–24px
- ~1.5px stroke
- rounded or neutral line caps
- visually consistent set

Do not mix:
- filled emoji
- 3D icons
- outline icons
- cartoon illustrations

on the same page.

---

# 22. Decorative system

Use sparingly.

Allowed:
- very faint grid
- subtle line pattern
- small dots
- simple directional arrows
- light diagram connectors

Maximum:
- one decorative pattern per major composition

Do not add decoration simply because a section feels empty.

Whitespace is allowed.

---

# 23. Motion

Motion should support understanding.

## 23.1 Default durations

- micro hover: `160–220ms`
- standard reveal: `450–650ms`
- section/visual entrance: `600–800ms`
- sequence stagger: `60–100ms`

## 23.2 Default movement

- vertical reveal distance: `12–20px`
- scale effects: max `0.98 → 1`
- no dramatic zooms

## 23.3 Easing

Preferred:
- `power2.out`
- `power3.out`
- CSS equivalent cubic-bezier where GSAP is not needed

## 23.4 Good uses of GSAP

- hero text reveal
- service visual progression
- message-flow demonstration
- journey connector progression
- subtle section entrance

## 23.5 Avoid

- scroll-jacking
- excessive pinned sections
- perpetual loops
- 3D rotation for decoration
- parallax everywhere
- long intro animations before content appears

## 23.6 Accessibility

Respect `prefers-reduced-motion`.

All content must remain understandable with animation disabled.

---

# 24. Responsive breakpoints

Use:

| Name | Range |
|---|---|
| `mobile` | 0–767px |
| `tablet` | 768–1199px |
| `desktop` | 1200px+ |
| `wide` | 1440px+ |

Do not add many custom breakpoints unless a real layout problem requires one.

## 24.1 Responsive rules

### Desktop
- full grid
- generous section spacing
- side-by-side service compositions

### Tablet
- reduce type scale
- retain 2-column layout where comfortable
- simplify complex visuals

### Mobile
- single-column reading order
- text first
- visual second
- full-width buttons where helpful
- reduce section spacing
- preserve generous inner padding
- avoid tiny cards
- journey becomes vertical
- nav becomes menu

---

# 25. Mobile quality standard

Mobile is a primary experience.

Check:

- headline does not create awkward single-word lines
- buttons remain easy to tap
- no horizontal overflow
- visuals are legible
- cards keep at least 20–24px internal padding
- text never touches screen edge
- service lists remain readable
- CTA remains clear
- animation remains lightweight

Target quality should hold on modern Android and iPhone screens.

---

# 26. Accessibility

Required:

- semantic HTML
- correct heading order
- visible focus states
- keyboard navigation
- meaningful alt text
- form labels
- adequate contrast
- minimum useful touch target ~44px
- reduced-motion support

Never rely on colour alone to communicate meaning.

---

# 27. Performance

The premium feeling must not come from a heavy page.

Rules:

- optimize images
- lazy-load below-the-fold media
- use SVG for simple diagrams/icons
- avoid autoplay video unless justified
- keep third-party scripts minimal
- use GSAP only where it improves experience
- no heavy 3D libraries in V1

---

# 28. Website voice

Use:

- simple English
- short sentences
- one idea at a time
- calm confidence
- practical language

Prefer:

> Make it easier for customers to find you.

> Do not let good leads disappear.

> Ask happy customers for reviews.

> Stay in touch after the sale.

Avoid:

> Leverage intelligent omnichannel automation to accelerate revenue conversion.

No:
- hype
- jargon
- empty superlatives
- fake urgency
- AI-sounding filler

---

# 29. Explicit V1 exclusions

Do not create:

- Brunnet commercial section
- AI creative service section
- cinematic advertising section
- huge creative portfolio
- pricing table unless later approved
- fake client logos
- fake testimonials
- fake metrics
- giant software dashboard
- 3D hero
- glassmorphism
- oversized pill-card system
- random gradients
- robot illustrations
- AI brain graphics
- generic stock business imagery

---

# 30. Implementation rules for Codex

1. Read `CODEX_CONSTITUTION.md`.
2. Read `BRIEF.md`.
3. Read this `DESIGN.md`.
4. Inspect existing project files and assets before editing.
5. Use design tokens in CSS variables or equivalent theme definitions.
6. Do not scatter raw brand values through components.
7. Reuse components.
8. Reuse spacing roles.
9. Reuse typography roles.
10. Do not invent a new component style because one section is difficult.
11. Preserve the restrained visual language.
12. Do not add sections not present in the brief without approval.
13. Do not invent proof.
14. Do not invent integrations.
15. Do not invent service capabilities.
16. Keep the code easy for a non-engineer founder to maintain.
17. Prefer CSS Grid/Flexbox over manual positioning.
18. Avoid absolute positioning for major responsive layouts.
19. Test desktop, tablet and mobile.
20. Quality is judged by the rendered page, not by code volume.

---

# 31. Design QA checklist

Before calling the website complete, verify:

## Typography
- [ ] only Oswald + Inter used
- [ ] role-based type sizes
- [ ] headings use correct tracking
- [ ] body widths controlled
- [ ] no random font sizes

## Spacing
- [ ] only approved spacing tokens
- [ ] sections have enough breathing room
- [ ] card padding consistent
- [ ] no manual pixel nudging

## Layout
- [ ] content stays within 1200px
- [ ] clear alignment
- [ ] service text and visuals feel balanced
- [ ] mobile stacks intentionally

## Components
- [ ] buttons consistent
- [ ] radius restrained
- [ ] borders consistent
- [ ] cards not overused
- [ ] no heavy shadows

## Colour
- [ ] growth green used sparingly
- [ ] no unapproved colours
- [ ] dark sections maintain contrast

## Business clarity
- [ ] Get Found is clear
- [ ] Convert is clear
- [ ] Reviews / Follow-Up is clear
- [ ] AI Lead Concierge has extra emphasis without taking over the entire brand
- [ ] no Brunnet / AI creative section

## Trust
- [ ] no invented testimonials
- [ ] no fake client logos
- [ ] no fabricated results
- [ ] demos are labelled honestly

## Mobile
- [ ] no overflow
- [ ] buttons easy to tap
- [ ] visuals readable
- [ ] nav works
- [ ] journey stacks correctly

## Motion
- [ ] motion supports comprehension
- [ ] reduced-motion supported
- [ ] page still works without animation

---

# 32. Final design rule

The website should feel like:

> **A serious, modern marketing partner that understands where businesses lose customers and builds simple systems to fix those gaps.**

Not:

> **An AI tool company trying to impress visitors with technology.**

The final page should be clean enough to trust, clear enough to understand quickly, and polished enough to show a paying prospect.
