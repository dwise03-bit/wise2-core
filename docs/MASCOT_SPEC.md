# WISE² Mascot — Character Spec

**Status:** design locked from reference sheet, name and deployment undecided
**Purpose:** keep every future render, animation and sticker on-model

---

## Visual DNA — locked

These seven features appear in all six reference variants. Anything generated
without all seven is off-model:

| # | Feature | Detail |
|---|---|---|
| 1 | **Horns** | Two, curved, matte black, rising through the beanie |
| 2 | **Beanie** | Black ribbed, **gold crown** icon, `W²` or `WISE²` above it |
| 3 | **Ears** | Pointed, elf/imp, set high |
| 4 | **Eyes** | Oversized, electric blue, high specular highlight |
| 5 | **Chain** | Gold rope necklace, worn outside the hoodie |
| 6 | **Hoodie** | Black, **gold `W²`** on the chest |
| 7 | **Tail** | Slim, pointed spade tip |

Build: chibi — head roughly ⅓ of total height, short limbs, small hands.
Skin: near-black with a blue rim light. One variant reads blue-grey; treat
near-black as canon and blue as a lighting state, not a second character.
Default pose: **arms crossed, weight on one hip, slight smirk.** Confident, not
aggressive — this is a mascot, not a villain.

Footwear: black boots or high-tops with gold accents. Bottoms: black joggers.

---

## Palette

⚠️ **The reference art does not match the current brand tokens.** Flagging rather
than silently picking one:

| | Reference art | `docs/BRAND_BIBLE_UPDATED.md` |
|---|---|---|
| Blue | electric cyan-blue, reads ~`#0094FF` | **`#0055FF`** Primary Blue |
| Gold | heavy gold accent throughout | **not in the palette at all** |

Two decisions needed before this ships anywhere:

1. **Re-render the character in `#0055FF`**, or **add the cyan to the brand** as
   a mascot-only accent
2. **Add gold as an official accent token**, or drop it from the character

Gold is doing real work in the art — crown, chain, chest mark, boot trim. Losing
it would change the character materially. Adding it is the more likely call, but
it is a brand decision, not mine.

Note `apps/website/app/login/page.tsx` already uses `#0094FF` and `#00D9FF`,
so the cyan is *already* in the product and diverging from the bible. Worth
settling in one pass.

---

## Naming

Undecided. Candidates that play off the `²`:

- **Deuce** — "squared", street read, one syllable
- **Squared** — literal, works as a handle
- **Bit** — small, digital, pet-like
- **Watt** — W, energy, tech

I'd take **Deuce**. It carries the `²` without explaining it and suits the
crown-and-chain attitude.

---

## Off-model — do not ship

- Missing horns, crown, chain, or chest `W²`
- Realistic or adult proportions — it is chibi
- Snarling, weapons, or menace. Mischief yes, threat no
- Red palette. Blue and gold only
- Any `W²` that is not the official lockup

---

## Where it goes

The `animate-character` skill (`.claude/skills/animate-character/`, Klingai) is
already installed and turns a static render into a CSS sprite sheet — no JS,
~50–150 KB. `ANIMATE_CHARACTER_INTEGRATION.md` already names dashboard mascots as
an intended use.

Likely first animations: **idle breathing**, **wave**, **thinking**, **celebrate**.
Those four cover a dashboard companion.

Precedent for a character component exists in `PiffCityRabbit.tsx`.

---

## Generation prompt

Reusable, for keeping renders on-model:

> Chibi imp mascot, near-black skin with electric blue rim lighting, two curved
> black horns, pointed elf ears, oversized electric blue eyes with bright
> highlights, black ribbed beanie with a small gold crown and "W²", gold rope
> chain, black hoodie with a gold "W²" on the chest, black joggers, black boots
> with gold accents, slim pointed tail. Arms crossed, confident smirk. Dark blue
> neon-city background. Clean vector-illustration style, high contrast.

---

## Open

- [ ] Name
- [ ] Blue: `#0094FF` or `#0055FF`
- [ ] Gold: add to brand tokens or drop
- [ ] Where it lives — dashboard companion, marketing only, or both
- [ ] Source render at print resolution — the reference sheet is a contact sheet,
      not a master asset
