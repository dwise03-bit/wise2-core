# Harborline Auto Ritual — Acceptance Run

**Input:** “I’m starting a premium mobile detailing company on Long Island.”

**Production assumptions:** The service comes to homes and workplaces; the primary conversion is a booking request; the brand is independent and does not claim certification, named clients, or service-area coverage beyond Long Island. No crown or crown-like elements.

## 01 — Project Summary

Harborline Auto Ritual is a premium, appointment-led mobile detailing service. The site should make meticulous care feel calm and tangible rather than loud automotive spectacle.

## 02 — Brand DNA

Audience: owners who value their vehicles and convenient professional care. Tone: composed, exacting, coastal, confident. Palette: salt-white, graphite, deep Atlantic blue, restrained warm brass. Materials: wet clearcoat, brushed aluminum, clean microfiber, dark rubber, weathered marina timber. Typography: high-contrast editorial serif for moments of care; neutral grotesk for service and booking clarity.

## 03 — Cinematic World

A quiet pre-dawn waterfront driveway/work bay after rain. The vehicle is not racing; it is being restored under carefully controlled work lights. Beaded water, reflections, equipment order, and the blue horizon establish care, place, and scale. Foreground: blurred wet aluminum and droplets. Midground: technician’s gloved hands and paintwork. Background: softened marina lights and a subtle Atlantic sky.

## 04 — Color + Material System

Base surfaces are graphite #151A1E and salt #E9E6DE. Atlantic blue #123A53 carries key interface states; brass #A77A42 is sparse detail only. UI panels use slightly blue-black translucent glass with a fine brushed-metal border, not arbitrary frosted cards. Images prioritize real paint, water, towel pile, chrome, and rubber texture.

## 05 — Lighting System

Cool blue-hour ambient fill meets a neutral 4300K work light on the vehicle. Warm marina practicals sit far in the background. Reflections show the light source shape; shadows remain soft but real. CTA panels use a stable dark backing for contrast.

## 06 — Typography Direction

Use an elegant, restrained editorial serif for the promise and service ritual names; use an accessible modern sans for scope, schedules, and forms. Headlines are spacious rather than oversized. Never render type into image assets.

## 07 — Website Architecture

1. Hero / booking entry
2. What the ritual restores (paint, cabin, protection)
3. Three service paths
4. The mobile process and preparation
5. Detail evidence / material close-ups
6. Request-an-appointment CTA and service-area note

## 08 — Hero Specification

**Scene:** dark graphite coupe at the edge of a covered waterfront driveway, a hand guiding a soft light across a water-beaded door. **Camera:** eye-height, 35mm cinematic wide-normal feel from the front-left; vehicle occupies the right 55%, left 35% remains low-detail copy-safe darkness. **Depth:** water droplets foreground, vehicle/hands midground, marina/horizon background. **CTA:** left-bottom, in normal flow under headline. **Desktop:** 16:9, safe copy x=7–38%, y=22–72%. **Mobile:** dedicated 9:16 crop, vertical vehicle detail from y=32–82%, headline on dark sky/work-bay field y=10–28%, button below in document flow. **Motion:** a 5-second reflection drift and two slow droplets; static poster is fully sufficient.

## 09 — Section-by-Section Visual Plan

| Section | Scene | Narrative job | UI relation |
|---|---|---|---|
| Restores | macro of paint correction light revealing clarity | turns “detail” into visible proof | three service links sit on a matte graphite band below, not on the macro |
| Service paths | three controlled work-bay moments: exterior, interior, protection | differentiates a booking choice | panels borrow graphite, brass hairline, and blue focus state |
| Process | equipment case, deionized-water setup, protected driveway floor | builds logistical confidence without claims | numbered steps follow the physical sequence |
| Evidence | towel fibers, tire sidewall, metallic flake under reflection | makes craft tactile | horizontal scroll on mobile with text captions |

## 10 — Visual Board

- Master hero: blue-hour waterfront detailing bay, copy-safe left field.
- Environment: coastal driveway, marina lights, no racing or urban neon.
- Material palette: paint, chrome, water, microfiber, brushed aluminum, rubber.
- Interface: quiet technical-luxury controls, visible labels, stable contrast.
- Transition: a paint reflection becomes a dark graphite section field; no literal portal.
- Mobile: vertical macro + negative sky/work-bay space, not a cropped desktop frame.

## 11 — Asset Inventory

### MUST HAVE

| Asset ID | Purpose | Section | Ratio / resolution | Variant | Motion / method | Dependencies |
|---|---|---|---|---|---|---|
| harborline-hero-master-v01 | primary visual | Hero | 16:9 / 3840×2160 | desktop | static / image-generation or photography | brand mark |
| harborline-hero-mobile-v01 | re-composed hero | Hero | 9:16 / 2160×3840 | mobile | static / image-generation or photography | hero art direction |
| harborline-services-triptych-v01 | service differentiation | Services | 3×4 / 2400×3200 each | all | static / photography | service names |
| harborline-process-kit-v01 | process proof | Process | 4:3 / 3000×2250 | desktop/tablet | static / photography | actual kit confirmation |

### SHOULD HAVE

| Asset ID | Purpose | Section | Ratio / resolution | Variant | Motion / method | Dependencies |
|---|---|---|---|---|---|---|
| harborline-hero-ambient-v01 | subtle reflection loop | Hero | 16:9 / 3840×2160 | desktop | animated / video-generation | approved master frame |
| harborline-materials-detail-v01 | craft detail carousel | Evidence | 4:5 / 2400×3000 | mobile | static / photography | none |

### OPTIONAL

| Asset ID | Purpose | Section | Ratio / resolution | Variant | Motion / method | Dependencies |
|---|---|---|---|---|---|---|
| harborline-transition-reflection-v01 | section dissolve | Transition | 16:9 / 1920×1080 | desktop | animated / compositing | hero and graphite section |

## 12 — Image Generation Prompts

**harborline-hero-master-v01:** A graphite luxury coupe receiving meticulous mobile detailing in a covered waterfront driveway on Long Island at blue hour; out-of-focus rain droplets and wet brushed-aluminum cart in foreground, gloved technician’s hand guiding a soft inspection light across water-beaded driver door in midground, restrained marina practicals and Atlantic horizon deep in background. Eye-height front-left camera, 35mm lens feeling, vehicle held in right 55% of frame, low-detail graphite negative space on left 35% for website headline and CTA. Cool blue ambient sky, neutral work light, sparse warm marina lights, believable clearcoat reflections, microfiber and rubber material detail, atmospheric depth. 4K hyper-realistic cinematic photography, controlled contrast, physically plausible lighting and scale, 16:9. No text, logo, UI, crown/crown-like motif, racing pose, neon, lens flare, stock-photo smiles, clutter, impossible reflections.

**harborline-hero-mobile-v01:** Vertical close crop of the same scene, vehicle door and inspection-light reflection occupying lower-middle/right, blue-black sky/work-bay negative space at top for headline, gloved hand entering from lower edge, marina lights softly distant. 9:16, realistic wet paint and aluminum, no text or UI; retain all negatives above.

## 13 — Motion System

Hero loop: 5 seconds, a work-light reflection moves 8–12cm across the panel and one droplet tracks downward; one slow ease-in-out cycle, muted, no autoplay audio. Section reveal: opacity/translate 16px only. Service hover: a restrained inspection-light sweep at 250ms. Reduced motion: static poster, no parallax, no sweep.

## 14 — Video / Flow Prompts

**harborline-hero-ambient-v01:** Starting frame is the approved desktop hero with the light reflection at the front third of the driver door. Over five seconds, camera remains locked; technician gently sweeps the inspection light across the panel, highlights move realistically with curved clearcoat, two droplets slowly travel, distant marina practicals remain stable. End at a reflection position compatible with the starting frame for a soft crossfade loop. No text, no UI, no fast cuts, no additional people or vehicles.

## 15 — Responsive / Mobile System

Desktop exposes the full car and left copy-safe field. Tablet tightens the vehicle while keeping headline against a 45% dark veil. Mobile uses the dedicated vertical asset; avoid masking the wide asset. Main buttons are 48px minimum height in normal flow; image overlays never block the booking action. Supply `srcset` for desktop/mobile stills and use an explicit-dimension poster.

## 16 — UI Integration Rules

Navigation is a near-opaque graphite bar that picks up the horizon blue; panels are material siblings of the equipment case and car trim. Use a brass hairline only to signal crafted detail, not as decorative framing. Forms use solid surfaces, persistent labels, keyboard focus in accessible Atlantic blue, and no animated fields.

## 17 — Negative / Exclusion List

No crowns/crown-like symbols, generic racing imagery, nightclub neon, exaggerated water splashes, floating dashboards, artificial cityscapes, stock-model poses, unsupported eco/cerification claims, embedded generated text, or cluttered detailing equipment.

## 18 — Implementation Handoff

Use a semantic hero `section` with image `picture` sources for desktop/mobile and copy in DOM. Place CTA and booking form in flow. CSS motion only for transform/opacity; use a poster unless media query and connection budget permit video. Lazy-load below-fold imagery, reserve dimensions, respect `prefers-reduced-motion`, and expose real focus styles. Asset file names follow manifest IDs.

## 19 — QA Checklist

Pass the package checklist with particular checks for headline contrast on both crops, no unsupported Long Island coverage claims, reflection/light realism, a usable booking path before decorative content, and a static mobile experience that retains the brand mood.

## 20 — Next Build Action

Approve the Harborline creative direction, then produce the two hero stills and confirm the actual service list before implementing the booking form and service copy.

## Locked Decisions

None yet.

## Production Assumptions

The waterfront setting is an art-direction cue, not a claim about the business’s exact location or facilities. The service list and booking provider require confirmation.
