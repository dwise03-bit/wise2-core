# WISE² Revenue Mode Design

## Goal
Turn the existing wise2.net homepage into a revenue-producing service funnel while preserving the current WISE² visual system, navigation, proof sections, and product storytelling.

## Revenue offers
- WISE² Quick Start — $99 one-time: business audit, action plan, consultation/intake.
- WISE² Launch — $299 one-time: premium one-page website/landing page, mobile optimization, lead form.
- WISE² Business Build — from $799 one-time: website, branding, automation/AI, and business-system setup.
- WISE² Care — $49/month.
- WISE² Growth — $99/month.

## Add-ons
- Logo/Brand Refresh — $149.
- AI Lead Assistant — $199 setup.
- Booking/Lead Automation — $149.
- Business Phone/AI setup — $199+.
- Additional website pages — $75/page.

## Homepage integration
Keep `ScrollcraftHomepage` as the homepage source of truth. Add a revenue layer after proof and before the existing feature/closing sections. The new section must use the current black/charcoal, ice-blue/silver visual language and existing motion patterns.

Update hero CTAs so the primary action is service-oriented. Preserve existing business proof and WISE² operating-system positioning.

## Conversion flow
1. Visitor sees WISE² proof and the clear service promise.
2. Visitor selects Quick Start, Launch, or Business Build.
3. One-time packages route through `/checkout?product=service&plan=<PLAN_ID>`.
4. Recurring plans route through the same checkout entry with service subscription plan IDs.
5. Free audit CTA routes to the existing `/audit` experience.
6. Checkout uses the existing `/api/checkout` bridge to the WISE² billing backend.

## Checkout behavior
Extend the current checkout page to understand service product plan IDs and render the correct one-time or monthly summary. Preserve digital-twin and platform checkout behavior.

Plan IDs:
- SERVICE_QUICK_START — $99 one-time
- SERVICE_LAUNCH — $299 one-time
- SERVICE_BUSINESS_BUILD — $799 one-time starting price
- SERVICE_CARE — $49 monthly
- SERVICE_GROWTH — $99 monthly

For service one-time plans, send `billingCycle: one_time` to the existing checkout API. For Care/Growth, send `billingCycle: monthly`.

## Visual constraints
- Do not replace the WISE² homepage design.
- No black-and-gold redesign.
- Reuse `#050607`, `#0A0E12`, `#8EDBFF`, `#DCE7EF`, white, and current border/motion patterns.
- Keep responsive behavior and reduced-motion support.

## Safety and scope
- Do not modify billing backend implementation in this slice.
- Do not hardcode Stripe secrets or payment-provider credentials.
- Existing backend must resolve the new plan IDs before production checkout can collect money; frontend should surface backend errors cleanly until that mapping exists.
- Preserve all current public routes and existing checkout product behavior.

## Acceptance criteria
- Homepage clearly exposes three service packages and two recurring plans.
- Each package has a working route into checkout or audit.
- Checkout displays correct service plan name, price, cadence, and description.
- Existing platform/digital-twin flows remain supported.
- TypeScript/build checks pass for the website app.
