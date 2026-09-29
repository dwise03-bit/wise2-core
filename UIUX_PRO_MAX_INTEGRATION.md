# UI/UX Pro Max Integration Guide

**Date Integrated:** July 17, 2026  
**Version:** 2.11.0  
**Status:** ✅ Integrated into WISE² + Local Claude Code

---

## 📋 What's Been Integrated

### 7 Design Skills Installed
All skills are now available in both WISE² and your local Claude Code setup:

| Skill | Purpose |
|-------|---------|
| **ui-ux-pro-max** | Primary skill: 84 UI styles, 192 color palettes, 74 font pairings, 98 UX guidelines, 104 icons, 16 motion presets, 25 chart types across 22 tech stacks |
| **design** | Comprehensive design: brand identity, design tokens, UI styling, logo generation, corporate identity programs, HTML presentations, banner design, icon design, social photos |
| **design-system** | Token architecture, component specs, spacing/typography scales, strategic slide generation |
| **ui-styling** | shadcn/ui + Tailwind CSS: responsive layouts, accessible components, dark mode, custom themes |
| **brand** | Brand voice, visual identity, messaging frameworks, asset management, consistency |
| **slides** | Strategic HTML presentations with Chart.js, design tokens, responsive layouts |
| **banner-design** | Social media, ads, website heroes, print banners (minimalist, gradient, bold, 3D, glassmorphism, neon, etc.) |

### Search CLI Tools
All Python scripts are ready to use:

```bash
# Search by domain
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "gradient buttons" --domain style

# Search by tech stack
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "dark mode" --stack nextjs

# Generate design system with design dials
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "modern saas" --design-system --variance 8 --motion 5 --density 6
```

---

## 📍 File Locations

### WISE² Project
```
/home/dwise/wise2-core/
├── .claude/skills/
│   ├── ui-ux-pro-max/          # Main skill
│   ├── design/                 # Design skill
│   ├── design-system/          # Design system skill
│   ├── ui-styling/             # Tailwind + shadcn/ui
│   ├── brand/                  # Brand framework
│   ├── slides/                 # Presentation skill
│   └── banner-design/          # Banner creation
└── tools/ui-ux-pro-max/
    ├── src/                    # Source data & scripts
    ├── cli/                    # CLI installer
    └── skill.json              # Manifest
```

### Local Claude Code
```
~/.claude/skills/
├── ui-ux-pro-max/              # Main skill
├── design/
├── design-system/
├── ui-styling/
├── brand/
├── slides/
└── banner-design/

~/tools/ui-ux-pro-max/
├── src/                        # Source data & scripts
├── cli/                        # CLI installer
└── skill.json                  # Manifest
```

---

## 🚀 Quick Start

### In Claude Code (claude.ai/code)
1. Click **Settings → Skills**
2. Search for `ui-ux-pro-max`, `design`, `ui-styling`, `brand`, or `slides`
3. Enable the skills you want
4. Start using them:
   - "Design a landing page with glassmorphism style"
   - "Generate a color palette for a fintech app"
   - "Create a design system with these tokens"
   - "Design social media banners"

### Search CLI from Terminal
```bash
# Main search tool (local)
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "<query>" [--domain <domain>] [--stack <stack>]

# Examples:
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "dashboard layout" --domain ux
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "animated buttons" --domain style --stack react
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "dark mode colors" --domain color --stack nextjs
```

---

## 🔍 Available Search Domains

| Domain | Use Case | Returns |
|--------|----------|---------|
| **style** | UI design patterns (glassmorphism, brutalism, minimalism) | Styles + AI prompts + CSS keywords |
| **color** | Color palettes by product type | Hex codes + design system recommendations |
| **typography** | Font pairings | Google Fonts combinations + import code |
| **chart** | Data visualization | Chart types + library recommendations |
| **ux** | Best practices & anti-patterns | Guidelines + dos/don'ts |
| **icons** | Icon sets & usage | Import code for Phosphor, Heroicons, Lucide |
| **react** | React/Next.js patterns | Performance optimization tips |
| **web** | App interface guidelines | iOS/Android/web conventions |
| **gsap** | Animation patterns | GSAP code snippets by intensity tier |
| **google-fonts** | Font lookup | Font specs + pairing suggestions |
| **product** | Product type guidance | SaaS, e-commerce, portfolio recommendations |
| **landing** | Landing page structure | CTA strategies + section templates |

---

## 🎨 Design Dials (Advanced)

Generate customized design recommendations with control over aesthetics:

```bash
python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "modern fintech app" \
  --design-system \
  --variance 8 \
  --motion 6 \
  --density 5
```

- **--variance** (1-10): minimal/centered → bold/asymmetric
- **--motion** (1-10): static → highly animated (attaches GSAP snippets)
- **--density** (1-10): spacious → dense/dashboard (adjusts spacing tokens)

---

## 🏗️ Tech Stack Support

All 22 stacks covered:

**Frontend Frameworks:** React, Next.js, Vue, Nuxt, Svelte, Astro  
**Mobile:** SwiftUI, React Native, Flutter, Jetpack Compose  
**UI Frameworks:** shadcn/ui, Tailwind CSS, HTML/CSS  
**Game/3D:** Three.js  
**Enterprise:** Angular, Laravel, JavaFX, WPF, WinUI, Avalonia, Uno Platform, UWP

---

## 📚 Skill Documentation

Each skill has comprehensive SKILL.md with:
- Full search capability documentation
- Usage examples
- Stack-specific guidelines
- Color palettes (192 included)
- Animation patterns (16 GSAP presets)
- Component examples

View skill docs:
```bash
cat ~/.claude/skills/ui-ux-pro-max/SKILL.md | less
cat ~/.claude/skills/design/SKILL.md | less
cat ~/.claude/skills/brand/SKILL.md | less
```

---

## 🔗 Integration Points with WISE²

### Current Integration
- ✅ Skills installed in `.claude/skills/` for Claude Code access
- ✅ Source data available in `tools/ui-ux-pro-max/` for programmatic access
- ✅ Search CLI ready for use in deployment/automation scripts

### Recommended Next Steps
1. **Add UI Component Library** — Use `ui-styling` + `design-system` for WISE² frontend
2. **Brand Guidelines** — Leverage `brand` skill for consistent branding
3. **Design Tokens** — Generate tokens with `design-system` skill for your app's theme
4. **Landing Pages** — Use `slides` + `banner-design` for marketing materials
5. **Automation** — Integrate search CLI into CI/CD for design consistency checks

---

## 🔄 Sync & Updates

### Source of Truth
Location: `/home/dwise/wise2-core/tools/ui-ux-pro-max/src/ui-ux-pro-max/`

If you modify data files (`*.csv`), run sync:
```bash
cd ~/tools/ui-ux-pro-max/cli
npm run sync:assets      # Mirrors src/ → cli/assets/ AND to .claude/skills/
npm run check:assets     # Verify sync (no npm install needed)
```

### Manual Updates
1. Update CSV files in `src/ui-ux-pro-max/data/`
2. Run sync commands above
3. Restart Claude Code to reload skills

---

## 📖 Reference Documentation

Each skill includes detailed references:

| File | Content |
|------|---------|
| `SKILL.md` | Main documentation + usage guide |
| `references/` | Deep-dive guides (10+ docs per skill) |
| `templates/` | Starter templates for common tasks |
| `assets/` | Bundled resources (~564KB total) |

---

## ✅ Verification Checklist

- [x] 7 skills copied to WISE² project
- [x] 7 skills copied to local Claude Code
- [x] Source data & CLI tools installed locally
- [x] Search CLI functional and tested
- [x] Skills visible in Claude Code settings
- [x] All 22 tech stacks supported
- [x] Design dials (variance/motion/density) available

---

## 🎯 Next Steps

1. **Enable in Claude Code:** Go to Settings → Skills, enable the UI/UX skills
2. **Try a Search Query:** `python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "glass morphism" --domain style`
3. **Use in WISE² Design:** Reference the skills when building new UI components
4. **Integrate into WISE² Frontend:** Use design tokens + component specs from `design-system` skill

---

## 📞 Support

- **Skill Docs:** View full documentation in each `.claude/skills/<skill>/SKILL.md`
- **Search Help:** `python3 ~/tools/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py --help`
- **Original Repo:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Version:** 2.11.0

---

**Last Updated:** July 17, 2026  
**Integration Status:** Complete ✅
