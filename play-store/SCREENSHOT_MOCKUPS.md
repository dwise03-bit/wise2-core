# WISE² Field Tech - Screenshot Mockups (1080×1920)

## Workflow Story Arc
**DISPATCH → EQUIPMENT SCAN → LIVE FIELDPIECE DATA → AI DIAGNOSIS → JOB DOCUMENTATION**

Each screenshot shows one step of the technician's workflow from job assignment to service report completion.

---

## Screenshot 1: DISPATCH HOME SCREEN

**Title**: "Your Jobs, Ready to Go"

```
┌─────────────────────────────────────────┐
│         WISE² FIELD TECH                │
│    🚀 3 jobs today | 👤 dwise           │
├─────────────────────────────────────────┤
│                                         │
│  📍 URGENT - 09:15 AM                   │
│  ┌─────────────────────────────────┐   │
│  │ Acme Building - HVAC Service    │   │
│  │ 2847 Industrial Blvd, Suite 401 │   │
│  │ Carrier 5T Split | No Cool      │   │
│  │                                 │   │
│  │ [📍 Navigate] [▶ Start Job]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⏰ 10:30 AM                            │
│  ┌─────────────────────────────────┐   │
│  │ Smith Residence - Service Call  │   │
│  │ 1422 Oak Street                 │   │
│  │ Trane Packaged | Noise/Vibration│   │
│  │                                 │   │
│  │ [📍 Navigate] [▶ Start Job]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⏰ 14:00 PM                            │
│  ┌─────────────────────────────────┐   │
│  │ Premier Health Clinic - Maint   │   │
│  │ 5500 Medical Plaza Drive        │   │
│  │ Lennox 10T Rooftop | Quarterly  │   │
│  │                                 │   │
│  │ [📍 Navigate] [▶ Start Job]     │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ [📋 Jobs] [🔧 Tools] [📊 Reports] [👤]│
└─────────────────────────────────────────┘
```

**Design notes:**
- Black background (#0a0e1a)
- Job cards on charcoal (#1a1f2e) with left electric blue accent bar
- URGENT flag in red (#d63031)
- Icon buttons in electric blue (#00d4ff)
- WISE² IMP small avatar in top-right corner (optional: "3 unread messages" badge)
- Bottom navigation bar with 4 icons (Jobs, Tools, Reports, Profile)

---

## Screenshot 2: EQUIPMENT SCAN

**Title**: "Point & Capture - Instant Data"

```
┌─────────────────────────────────────────┐
│  < Back   SCAN EQUIPMENT NAMEPLATE  ✓   │
├─────────────────────────────────────────┤
│                                         │
│       📷 Camera View (Live)             │
│    ┌─────────────────────────────┐     │
│    │  [Equipment Photo Frame]    │     │
│    │  + blue targeting reticle   │     │
│    │  "Point at equipment"       │     │
│    │  "nameplate / data sticker" │     │
│    └─────────────────────────────┘     │
│                                         │
│              [📷 CAPTURE]               │
│                                         │
│        or select from gallery           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         🎯 DATA EXTRACTED               │
│                                         │
│  Model:        24ABC060J08             │
│  Serial:       XYZ7890123              │
│  Type:         Outdoor Condenser       │
│  Compressor:   Scroll                  │
│  Refrigerant:  R-410A                  │
│  Tonnage:      5 Ton                   │
│                                         │
│  ✓ Confidence: 98%                     │
│                                         │
│    [✎ Edit Data] [✓ Confirm]            │
│                                         │
└─────────────────────────────────────────┘
```

**Design notes:**
- Top section: Live camera feed with targeting crosshairs
- Blue reticle and "Point at nameplate" guidance text
- Bottom section: Extracted data in labeled rows
- Green checkmark + confidence score
- Edit and Confirm buttons in electric blue

---

## Screenshot 3: LIVE FIELDPIECE DATA (HUD-Style)

**Title**: "Real-Time Readings - Live Manifold"

```
┌─────────────────────────────────────────┐
│  < Back   FIELDPIECE LIVE DATA    📡 ✓  │
├─────────────────────────────────────────┤
│                                         │
│  Device: Fieldpiece AnalyzerSM |✓      │
│  Status: Connected | LIVE              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ HIGH PRESSURE        420 PSI       │ │
│  │ 🔷 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 500     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ LOW PRESSURE         85 PSI        │ │
│  │ 🔷 ┄┄┄┄┄┄ 150                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ SUCTION TEMP         42°F         │ │
│  │ 🔷 ┄┄┄┄ 60                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ DISCHARGE TEMP       120°F ⚠️     │ │
│  │ 🔷 ┄┄┄┄┄┄┄┄ 140                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ SUPERHEAT            18°F ✓       │ │
│  │ Calculated from readings         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⚠️ ALERT: Discharge temp high         │
│     Possible: Restricted return air    │
│                                         │
│    [💾 Save Reading] [🤖 Get Help]     │
│                                         │
└─────────────────────────────────────────┘
```

**Design notes:**
- Black background with charcoal data boxes
- Electric blue bars showing readings with scale
- Red ⚠️ icon for out-of-spec values (yellow for caution)
- Green ✓ for normal readings
- "ALERT" box at bottom with diagnostic hint
- Buttons: Save Reading, Get Help (opens AI assistant)

---

## Screenshot 4: AI DIAGNOSIS RECOMMENDATION

**Title**: "WISE² IMP Diagnosis - What's Wrong?"

```
┌─────────────────────────────────────────┐
│  < Back   WISE² IMP DIAGNOSIS      🤖   │
├─────────────────────────────────────────┤
│                                         │
│  📊 ANALYSIS BASED ON:                  │
│  • Live Fieldpiece readings             │
│  • Equipment data (Carrier 5T)          │
│  • Customer symptom: "No cool air"      │
│  • Airflow test: Low CFM reading        │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🎯 LIKELY CAUSES (Highest → Lowest)    │
│                                         │
│  1️⃣ RESTRICTED INDOOR COIL             │
│  Confidence: 82%                        │
│  Symptoms match: Low superheat,         │
│  high discharge temp, low airflow       │
│                                         │
│  2️⃣ DIRTY/CLOGGED FILTER               │
│  Confidence: 76%                        │
│  Quick fix: Check filter first          │
│                                         │
│  3️⃣ BLOWER MOTOR ISSUE                 │
│  Confidence: 61%                        │
│  Test: Manual fan speed check           │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  💡 NEXT STEPS:                         │
│  ✓ Verify/replace filter                │
│  ✓ Check indoor coil for ice/blockage   │
│  ✓ Measure blower volts & continuity    │
│                                         │
│  [📚 Get Manual] [✎ Save Notes]         │
│  [✓ Issue Found] [❓ Not Sure]           │
│                                         │
└─────────────────────────────────────────┘
```

**Design notes:**
- Black background with charcoal information boxes
- Electric blue icons and section headers
- Numbered list with confidence percentages
- Color-coded by probability (high = blue, medium = yellow)
- Reference documentation link
- "Issue Found" and "Not Sure" buttons for feedback

---

## Screenshot 5: SERVICE REPORT COMPLETION

**Title**: "Professional Report - Ready to Send"

```
┌─────────────────────────────────────────┐
│  < Back   SERVICE REPORT COMPLETE  ✓    │
├─────────────────────────────────────────┤
│                                         │
│  📄 SERVICE SUMMARY                     │
│                                         │
│  Customer: Acme Building HVAC           │
│  Date: August 23, 2026 | 09:15 - 11:45 │
│  Technician: Daniel (dwise)             │
│  Equipment: Carrier 5-Ton Split         │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🔧 ISSUE FOUND & RESOLVED              │
│  Indoor coil ice buildup detected.      │
│  Cleaned coil, verified airflow,        │
│  system restored to full capacity.      │
│                                         │
│  📊 KEY READINGS                        │
│  • High Pressure: 420 PSI ✓             │
│  • Low Pressure: 85 PSI ✓               │
│  • Superheat: 18°F ✓                    │
│  • Subcooling: 12°F ✓                   │
│                                         │
│  📸 DOCUMENTATION (5 photos)            │
│  [▶ Before] [▶ After] [▶ Coil]          │
│  [▶ Wiring] [▶ Equipment]               │
│                                         │
│  💬 NOTES:                              │
│  "System fully operational. Customer    │
│  satisfied. Recommend quarterly         │
│  maintenance to prevent ice buildup."   │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🤖 WISE² IMP SAYS:                     │
│  "Great job! Report looks professional. │
│   Ready to email?"                      │
│                                         │
│  [📧 Email] [💾 Save] [🔄 Revise]      │
│                                         │
└─────────────────────────────────────────┘
```

**Design notes:**
- Clean professional summary format
- Black background with charcoal sections
- Electric blue section headers
- Photo thumbnail gallery (clickable to expand)
- AI assistant message at bottom offering to send
- Email/Save/Revise buttons in prominent electric blue
- All key data visible at a glance

---

## Design System Reference

All screenshots use:

**Colors:**
- Background: `#0a0e1a` (black)
- Sections: `#1a1f2e` (charcoal)
- Borders: `#2d3142` (gunmetal)
- Primary accent: `#00d4ff` (electric blue)
- Alert/Priority: `#d63031` (red)
- Text: `#e8eef5` (light gray)
- Text dim: `#8b95a8` (medium gray)

**Typography:**
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- Headlines: 18-24px, bold, electric blue
- Body text: 14-16px, light gray
- Labels: 12-14px, uppercase, medium gray

**Components:**
- Cards: Charcoal background with left electric blue accent bar
- Buttons: Electric blue text on black background (not filled)
- Icons: Emoji or thin-line SVG (1-2px stroke)
- Bars/Progress: Thin electric blue lines with subtle gradient effect
- Alerts: Red icon + text, charcoal background box

---

## Production Notes for Screenshot Creation

### Desktop Design Tool Approach
If using Figma / Adobe XD / Sketch:
1. Set artboard to 1080×1920 (9:16 aspect ratio)
2. Import the icon as 96×96px (shown at that size on Android)
3. Apply the color system (6 colors total)
4. Use system fonts or open-source equivalents (Inter, Roboto)
5. Export each screenshot as PNG at 100% scale

### React Native Mock Approach
If building in React Native:
1. Screenshot the app at 1080×1920 resolution
2. Apply the visual design system via Tailwind/styling
3. Populate with realistic data from the JSON mockups above
4. Ensure Android status bar + navigation bar visible (system-provided)

### Recommended Sequence
1. Create Figma mockups with the layouts above
2. Share with product/design team for review
3. Iterate on copy/visual emphasis
4. Export high-res PNG files (1080×1920 each)
5. Name files: `screenshot_1_dispatch.png`, `screenshot_2_scan.png`, etc.
6. Upload to Google Play Console in order (1→5)

---

## Key Visual Priorities Per Screenshot

| Screenshot | Primary Message | Secondary Message | Visual Focus |
|-----------|-----------------|-------------------|--------------|
| 1. Dispatch | "See all jobs at a glance" | "One tap to start" | Job cards + priority flag |
| 2. Scan | "Photo → instant data" | "No manual typing" | Camera + extracted data |
| 3. Fieldpiece | "Live readings streamed" | "Easy to read HUD" | Data gauges + alerts |
| 4. Diagnosis | "AI makes sense of it" | "Multiple likely causes" | Ranked causes + confidence % |
| 5. Report | "Professional output ready" | "Email instantly" | Summary + photos + AI message |

This sequence tells the complete workflow story in 5 frames.
