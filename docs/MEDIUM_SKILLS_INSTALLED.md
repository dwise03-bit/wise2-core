# 5 Claude Skills for Non-Ugly AI UIs — Installation Guide

**Article**: [5 Claude Skills That Fix Claude's Ugly UI](https://divadsanders.medium.com/5-claude-skills-that-fix-claudes-ugly-ui-ai-web-design-ec9cd27bf5fe) by Divad Sanders  
**Installed**: 2026-09-21  
**Status**: ✅ All 5 skills ready to use

---

## The 5 Skills

### 1. **TasteSkill** — Layout & Design Direction
**Location**: `.claude/skills/taste-skill/`  
**Repo**: https://github.com/leonxlnx/taste-skill  
**Purpose**: Infers design direction (layout, motion, density) before writing code instead of defaulting to generic templates.

**13 Variants Included**:
- `taste-skill` (default)
- `taste-skill-v1` (legacy)
- `gpt-taste-skill` (GPT/Codex tuned)
- `redesign-skill` (audit & upgrade)
- `soft-skill` (calm, softer contrast)
- `minimalist-ui` (Notion/Linear-inspired)
- `brutalist-ui` (Swiss typography)
- `output-skill` (blocks placeholders)
- `stitch-skill` (Google Stitch bridge)
- `image-to-code-skill` (reference → frontend)
- `imagegen-frontend-web` (image-only)
- `image-to-code-mobile` (image-only)
- `brandkit` (brand boards)

**When to Use**: Your builds look generic or same-as-everything-else

---

### 2. **img2threejs** — Photo to 3D Web Models
**Location**: `.claude/skills/img2threejs/`  
**Repo**: https://github.com/img2threejs/img2threejs  
**Purpose**: Converts a single reference photo into a procedural Three.js model with geometry, materials, lighting, and animation.

**Pipeline**:
1. Blockout (rough shapes)
2. Structural (frame)
3. Form (refined geometry)
4. Material (surface properties)
5. Surface (texture & detail)
6. Lighting (how it reads)
7. Interaction (animation)
8. Optimization (performance)

**When to Use**: Building 3D product demos, portfolio pieces, interactive elements

---

### 3. **Impeccable** — Remove Default AI Aesthetics
**Location**: `.claude/skills/impeccable/`  
**Purpose**: 23 commands to catch & fix the 5 default tells (Inter font, purple gradients, card stacks, gray-on-color text, rounded icon tiles).

**Key Commands**:
- `/impeccable init` — scan tokens & write product brief
- `/critique` — score current build
- `/colorize` — add brand-aware color
- `/bolder` or `/quieter` — adjust design intensity
- Live Mode — click components in browser to adjust

**When to Use**: You already built something; want to fix weak parts or remove defaults

---

### 4. **Playwright CLI** — Browser Testing & Verification
**Installation**: `npm install -g @playwright/cli@latest`  
**Purpose**: Gives Claude full browser access to test flows, click buttons, fill fields, take screenshots, read results.

**Commands**:
```bash
playwright-cli open https://yoursite.com --headed
playwright-cli type "test@email.com"
playwright-cli press Enter
playwright-cli screenshot
playwright-cli show  # live dashboard
```

**When to Use**: Shipping code you haven't actually watched run; need verification that forms/flows work

---

### 5. **Awesome Design** — 60+ Design System Templates
**Location**: `.claude/skills/awesome-design/`  
**Repo**: https://github.com/bergside/awesome-design-skills  
**Purpose**: Curated design systems (60+) packaged as SKILL.md + DESIGN.md files. Each includes type scale, color palette, spacing, component states, WCAG 2.2 AA accessibility.

**Categories**:
- Glassmorphism, neumorphism, claymorphism (soft depth)
- Brutalism, industrial, neobrutalism (raw, high-contrast)
- Editorial, publication, luxury (magazine-grade)
- Retro, vintage, Tetris, Pac-Man, Sega (playful)
- Dashboard, enterprise, corporate, shadcn (clean product)

**When to Use**: Need a specific aesthetic quickly (brutalist, luxury, glassmorphism, etc.)

---

## Already Installed (Complements the 5)

### **unslop-ui** (vibecoded-design-tells)
**Location**: `.clients/vibecoded-design-tells/skill/`  
**Purpose**: Deterministic scanner + build mode to detect & remove AI tells (tells database grounded in 3.2M Reddit posts).

**Audit Mode**:
```bash
python3 scripts/devibe_scan.py <path>                 # full report
python3 scripts/devibe_scan.py <path> --severity high # high-signal only
python3 scripts/devibe_scan.py <path> --json          # CI gates (exit code = findings)
```

**When to Use**: Any UI build/review; need CI-gated design verification

---

## Quick Start: Which One First?

| Goal | Skill | Command |
|------|-------|---------|
| Builds look generic | TasteSkill | Use `/taste-skill` in Claude Code |
| Fix weak existing site | Impeccable | Use `/impeccable init` then `/critique` |
| Verify code actually works | Playwright CLI | Use `playwright-cli open` |
| Need specific aesthetic | Awesome Design | Use skill by name (e.g., `/brutalism`) |
| Generate 3D from photo | img2threejs | Use skill or ask Claude to generate |

---

## Key Files

- **TasteSkill variants**: `.claude/skills/taste-skill/*.md`
- **Awesome Design systems**: `.claude/skills/awesome-design/skills/`
- **unslop-ui scanner**: `.clients/vibecoded-design-tells/scripts/devibe_scan.py`
- **unslop-ui references**: `.clients/vibecoded-design-tells/skill/references/` (tells database, choosing-a-look process)

---

## Next Steps

1. **Test on your next build**: Use TasteSkill or Awesome Design for new projects
2. **Audit existing UIs**: Run `devibe_scan.py` on current pages
3. **Set CI gates**: Add Playwright or unslop-ui scanner to deployment pipeline
4. **Combine**: Use TasteSkill + Impeccable + unslop-ui together for strongest results

---

**Source**: [Medium article by Divad Sanders](https://divadsanders.medium.com/5-claude-skills-that-fix-claudes-ugly-ui-ai-web-design-ec9cd27bf5fe)
