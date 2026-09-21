# Vibecoded Design Tells Integration

**Source**: https://github.com/JCarterJohnson/vibecoded-design-tells  
**Purpose**: Research-backed detection of AI-generated content tells across UI, text, and code  
**Status**: ✅ Integrated into `.claude/skills/`

---

## What This Is

A comprehensive study (3.2M Reddit posts analyzed) that identifies the visual, textual, and code-level patterns people recognize as "AI slop." Packaged as three Claude skills for removing these tells during development.

## Skills Integrated

All three skills are now available in this project:

### 1. **unslop-ui** — Remove AI-Generated Design Tells
Detects and removes visual patterns that flag a website as AI-built:
- shadcn/Tailwind defaults
- AI purple gradients  
- Centered hero + 3-card layout
- Cream+serif+sage "tasteful default"
- Gradient hero text, neon glow, emoji icons

**Use for**: SENCERE website, dashboard UIs, landing pages

```bash
# Run scanner on codebase
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website/app/sencere
```

### 2. **unslop-text** — Remove AI-Written Prose Tells
Detects and removes textual patterns that flag writing as AI-generated:
- Em dash cadence ("It's not just X, it's Y")
- Leftover assistant boilerplate
- Sycophantic openers
- "Delve" / "leverage" diction
- Generic "in conclusion" wraps

**Use for**: Marketing copy, documentation, blog posts, product descriptions

### 3. **unslop-code** — Remove AI-Generated Code Tells
Detects code patterns that flag source code as AI-written:
- Chat artifact leftover (explanatory text in code)
- Placeholder comments ("TODO: add error handling")
- Emoji in code
- Swallowed errors (try/catch that silently fails)
- Narrating comments ("This function does X")
- Hallucinated API calls

**Use for**: Code reviews, PR checks, new feature validation

---

## Integration with WISE² Quality Gates

### Design (Visual Quality)

The **WISE2_VISUAL_QUALITY_STANDARD.md** now has a companion scanner. Before launch:

```bash
# Scan SENCERE website
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py \
  apps/website/app/sencere \
  apps/website/components/sencere \
  --severity high
```

Exit code = number of high-severity findings. Use in CI:

```yaml
- name: "Visual Quality: AI Tell Detection"
  run: python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website/app/sencere --severity high
```

### Text (Content Quality)

Use **unslop-text** skill before publishing marketing, documentation, or product copy:

```
/unslop-text -- [paste text to audit]
```

### Code (Development Quality)

Use **unslop-code** skill in code review:

```
/unslop-code -- review this change for AI tells
```

---

## Key Findings (Research Summary)

- **46,971 on-topic posts** scanned from AI/SaaS subreddits (2020–2026)
- **Top visual tells** (by Reddit complaints):
  1. Shadcn/Tailwind defaults (26% of comments)
  2. AI purple gradient (23%)
  3. Centered hero + 3-card layout (18%)
  4. Cream+serif+sage "tasteful default" (8% — new 2026 tell)
- **No single prescribed look** — the skill removes tells but forces deliberate choice

---

## SENCERE Application

The SENCERE website has already been designed to **avoid these tells**:
- ✅ Custom dark/gothic aesthetic (not shadcn defaults)
- ✅ Navy + cyan + neon palette (not AI purple)
- ✅ Editorial layout with asymmetry (not centered hero)
- ✅ Custom fonts and spacing (not cream+serif)

**Verification**: Run scanner to confirm:

```bash
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py \
  apps/website/app/sencere \
  apps/website/components/sencere
```

Expected: Zero or very-low vibe score (no tells detected).

---

## Using the Skills

### In Claude Code

The skills are installed and ready. Use them when:

1. **Building/reviewing a website**: `/unslop-ui` (auto-triggers)
2. **Writing marketing/product copy**: `/unslop-text`
3. **Code review**: `/unslop-code`

### Standalone (No Claude Needed)

```bash
# Full report
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py ./your-project

# Only high-severity
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py ./your-project --severity high

# JSON output (for CI)
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py ./your-project --json
```

---

## CI Integration (Recommended)

Add to `.github/workflows/` or your CI config:

```yaml
- name: "Design Quality: AI Tell Detection"
  run: |
    python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py \
      apps/website/app/sencere \
      apps/website/components/sencere \
      --severity high
  continue-on-error: true  # Gate but don't block (advisory)

- name: "Code Quality: AI Tell Detection"
  run: |
    python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py \
      apps/website \
      packages/api/src \
      --severity high
  continue-on-error: true
```

---

## Reference Files

- **tells.md** — Full ranked catalog with fixes
- **choosing-a-look.md** — Deliberate design method (not prescriptive)
- **devibe_scan.py** — Standalone Python scanner (no dependencies)

All in: `clients/vibecoded-design-tells/skill/references/`

---

## What This Does NOT Do

- ❌ Impose a single "good" look (that would just become the next default)
- ❌ Enforce fashion trends or aesthetic taste
- ❌ Catch genuinely bad design (only AI tells)
- ❌ Require you to follow the recommendations (includes `unslop-ignore` escapes)

---

**Next Step**: Run the scanner against SENCERE to verify zero tells, then add to CI gate.
