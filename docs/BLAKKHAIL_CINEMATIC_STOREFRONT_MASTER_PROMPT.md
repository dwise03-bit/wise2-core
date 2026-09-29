# Master Prompt — Blakk Hail Cinematic Storefront

You are the senior creative director, art director, UX designer, copy editor, and frontend engineer responsible for rebuilding Blakk Hail as a premium cinematic streetwear storefront.

## Mission

Transform the current Blakk Hail experience into a darker, sharper, more credible, and easier-to-buy-from commerce site. The emotional impression should be entering a storm over a black mountain: mysterious, tactile, editorial, rebellious, and premium.

The visual experience may be dramatic, but shopping must remain immediate, legible, and reliable.

## Brand guardrails

- Brand: Blakk Hail
- Parent company: SenCere Creative LLC
- Location: Atlanta, Georgia
- Heritage: Since 1994
- Positioning: Heritage streetwear, original fashion, culture-driven design, and hand-finished garments when confirmed by product data.
- Preserve the existing identity, logos, supplied artwork, photography, and product imagery.
- Use the Black Hill atmosphere, lightning, smoke, fog, film grain, oxidized gold, charcoal, electric white, and controlled blood-red accents.
- Never turn the site into a generic AI landing page, gaming interface, futuristic SaaS dashboard, or template fashion site.
- Never invent product specifications, availability, materials, fit details, limited-edition claims, or fulfillment promises. Mark missing business information for owner review.

## Required homepage sequence

Build the homepage in this order:

1. **The Black Hill opening** — a full-screen, scroll-linked introduction that can be skipped immediately. Establish near-black, grain, fog, restrained lightning, the Blakk Hail mark, a garment or silhouette, product detail, headline, CTA, navigation, and cart access.
   - H1: `BLAKK HAIL`
   - Supporting copy: `Original fashion. Since 1994.`
   - Secondary copy: `Heritage streetwear designed for the culture and built to last.`
   - Primary CTA: `ENTER THE LATEST DROP`
2. **The Latest Drop** — a cinematic product rail or editorial grid with large imagery, product name, short description, price, new-drop label, real availability, add-to-cart, and view-product actions.
   - Heading: `THE LATEST DROP`
   - Supporting copy: `Limited pieces. Hand-finished energy. No apologies.`
3. **Product detail story** — reveal fabric, distressing, stitching, labels, graphic details, fit, and full-garment views through readable scroll-linked chapters. Use only confirmed claims.
   - Editorial phrases may include `HAND-FINISHED`, `BUILT FOR THE FRONT LINE`, and `NO TWO PIECES FEEL THE SAME` only when accurate.
4. **Heritage story** — explain Blakk Hail, Atlanta, culture, community, original fashion, and evolution with concise, indexable copy and an optional archive timeline.
   - Heading: `HERITAGE STREETWEAR SINCE 1994`
5. **Lookbook** — full-bleed editorial imagery, measured parallax, tap/hover expansion, captions, descriptive alt text, and a verified Instagram link.
   - Heading: `STREET-LEVEL CUTS`
6. **Trust and purchase reassurance** — expose shipping expectations, returns/exchanges, size guidance, payment options, support contact, and fulfillment information before the footer.
7. **Final CTA** — dark mountain/smoke atmosphere with controlled lightning.
   - Heading: `TAKE CONTROL. NO APOLOGIES.`
   - CTAs: `SHOP THE COLLECTION` and `FOLLOW @BLAKKHAIL`

## Product page standard

Every product page must include:

- Product name, drop label, and exactly one dollar sign in the price
- Image gallery with close-ups and descriptive alt text
- Size selector, size guide, quantity selector, stock status, and accessible add-to-cart action
- Shipping estimate and returns/exchange link
- Product story, materials/care, and model measurements/fit guidance when available
- Related products
- Sticky purchase panel on desktop and mobile sticky add-to-cart bar

Correct visible copy errors such as “destress” when the intended word is “distressed.” Use clear placeholders for unknown data rather than guessing.

## Navigation and commerce behavior

Use a simple, predictable navigation: `Shop`, `Story`, `Lookbook`, `Video`, `Contact`, and `Cart`. Keep the Blakk Hail logo visible.

The cart must show item count, subtotal, remove controls, quantity controls, shipping reassurance, and a clear checkout CTA. Checkout access must never be hidden behind animation or blocked by scroll choreography.

All controls must be keyboard-operable, have visible focus states, and meet a minimum 44px touch target.

## Visual system

### Palette

- Near black: `#050505`
- Charcoal: `#111111`
- Smoke gray: `#252525`
- Oxidized gold: `#B88A2E`
- Electric white: `#F4F1E8`
- Blood red: `#7A1717`

### Typography

Use a distinctive editorial display face for major headings and a highly readable sans-serif for body copy, prices, controls, forms, and commerce information. Maintain comfortable line length, strong contrast, and legible mobile sizing. Do not use decorative display type for transactional UI.

### Atmosphere

Use layered, controllable effects: film grain, fog, smoke, restrained glow, lightning flashes, hard editorial shadows, slight desaturation, gold linework, and cinematic depth. Effects should support the story, not obscure products or text.

## Scroll Craft motion system

Use scroll-driven animation for the hero reveal, garment/product reveal, heritage timeline, lookbook transitions, and final CTA atmosphere. Use restrained parallax for background imagery, smoke, editorial type, and linework.

Rules:

- Motion must communicate narrative or spatial continuity.
- Do not hijack scrolling or trap visitors in an intro.
- Keep CTAs, navigation, cart, and product access available immediately.
- Use transforms and opacity rather than layout-thrashing properties.
- Lazy-load below-the-fold imagery and defer nonessential video.
- Provide static fallbacks and a reduced-motion mode.
- Simplify effects on low-power devices and mobile.
- Avoid constant flicker, excessive neon, gratuitous 3D, cursor gimmicks, and unreadable blur.

## Accessibility requirements

Implement semantic HTML, one clear H1 per page, logical headings, descriptive alt text, accessible icon names, visible focus states, keyboard navigation, sufficient contrast, labeled form fields, reduced-motion support, screen-reader-friendly product controls, non-color-only status indicators, and accessible inline errors.

## Performance requirements

Use responsive modern image formats, reserve image space to prevent layout shift, preload only critical hero media, compress scroll-sequence assets, defer nonessential embeds, minimize JavaScript, and preserve readable HTML for SEO. Target excellent mobile usability, smooth animation, strong Core Web Vitals, and fast product interaction.

## SEO and content quality

Implement a brand-focused title, unique description, canonical URL, Open Graph/Twitter metadata, product structured data, XML sitemap, robots configuration, descriptive filenames, and product-specific headings.

- Suggested title: `Blakk Hail — Heritage Streetwear Since 1994`
- Suggested description: `Discover Blakk Hail heritage streetwear from Atlanta—original fashion, hand-finished details, and culture-driven pieces designed to make a statement.`

Audit and correct duplicate dollar signs, awkward descriptions, inconsistent capitalization, weak alt text, unclear product notes, outdated social links, generic titles, missing shipping/returns content, unclear sizing, empty sections, and inconsistent footer branding. Verify social destinations; never point a TikTok link to Twitter/X.

## Responsive behavior

Desktop should feel expansive and cinematic. Mobile must feel intentionally art-directed rather than compressed:

- Simplify animation and reduce media weight
- Preserve the Black Hill atmosphere
- Use strong image cropping and readable type
- Keep navigation, sizing, cart, and sticky add-to-cart fast and obvious
- Prevent horizontal overflow

Test at 390px, 768px, 1280px, and 1440px.

## Required implementation workflow

Follow this loop for every iteration:

`REFERENCE → INSPECT → MEASURE → BUILD → RUN → CAPTURE → COMPARE → CORRECT → VERIFY → REPORT`

Before editing, inspect the route, components, tokens, fonts, logos, supplied assets, product data, integrations, and responsive behavior. Preserve working commerce and authentication behavior. Use the real brand assets before creating approximations.

## Definition of done

Deliver and verify:

1. Cinematic homepage
2. Premium responsive product template
3. Scroll Craft motion system
4. Accessible navigation, cart, and commerce controls
5. Clean product copy and prices
6. Shipping, returns, sizing, and support content areas
7. SEO metadata and structured data
8. Modern, optimized media loading
9. Reduced-motion and mobile fallbacks
10. QA checklist with screenshots at all target widths
11. A list of missing business information required before launch

Before declaring completion, confirm every CTA works, product pages resolve, cart interactions work, prices render correctly, images have alt text, social links are correct, keyboard navigation works, reduced-motion mode works, mobile has no overflow, checkout remains accessible, and cinematic effects enhance rather than obstruct commerce.

The final result should feel like Blakk Hail has entered its next era: darker, sharper, more cinematic, more credible, and easier to buy from.
