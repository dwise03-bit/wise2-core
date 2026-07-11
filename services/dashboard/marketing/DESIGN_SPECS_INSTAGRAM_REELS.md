# Instagram Reels Design Specifications
## Wise² Core Launch Campaign

**Project:** Wise² Core Instagram Reels Video  
**Duration:** 20 seconds  
**Format:** Vertical (1080x1920px @ 60fps)  
**Delivery:** Individual graphics + animated composites  
**Color Grading:** Cool problem → warm solution  

---

## 1. TITLE CARD — "3 Weeks vs 3 Months"
**Duration:** 0-2 seconds  
**Appears:** Full screen, split-screen design

### Specifications
```
Dimensions:     1080x1920px (9:16 vertical)
Format:         PNG with transparency / MP4 animation
Background:     Linear gradient (left to right)
                LEFT: #1a1a1a (dark gray - problem)
                RIGHT: #0d4d99 (professional blue - solution)

Layout (Split Screen):
┌─────────────────┬─────────────────┐
│  LEFT (Messy)   │ RIGHT (Clean)   │
│  Desaturated    │  Vibrant color  │
│  Cool lighting  │  Warm lighting  │
└─────────────────┴─────────────────┘

Text Overlay:
  Style:        Montserrat Bold 700
  Font Size:    96px
  Color:        White (#FFFFFF)
  Position:     Center, vertically centered
  Text:         "3 Weeks vs 3 Months"
  Shadow:       Drop shadow: 0 4px 12px rgba(0,0,0,0.4)
  Animation:    Fade in over 0.5s, hold 1.5s

Secondary Text:
  Style:        Montserrat Regular 400
  Font Size:    32px
  Color:        #CCCCCC
  Position:     Below main text, center
  Text:         "The choice that matters"
  Animation:    Fade in 0.3s after main text
```

### Design Assets
- Background pattern: Subtle diagonal lines (opacity 10%)
- Desk icons/silhouettes (optional, subtle background)

---

## 2. PROBLEM MONTAGE GRAPHICS
**Duration:** 2-5 seconds  
**4 Quick Scenes (1.25s each)**

### Scene Sequence

#### Scene 2A: Debugging (Midnight)
```
Dimensions:     1080x1920px
Background:     Dark room, blue monitor glow
Overlay text:   "Debugging at midnight"
  Style:        Montserrat SemiBold 600
  Font Size:    52px
  Color:        #FF6B6B (red accent)
  Position:     Bottom left, 40px margin
  Shadow:       2px 2px 8px rgba(0,0,0,0.6)

Visual Elements:
  - Close-up of code with red error highlights
  - Clock showing 12:47 AM (top right)
  - Coffee cup (optional, visual interest)
  - Desaturated color grading (desaturation: -40%)
```

#### Scene 2B: Deployment Stress
```
Dimensions:     1080x1920px
Background:     Red/orange warning screen
Overlay text:   "Deployment fails in production"
  Style:        Montserrat SemiBold 600
  Font Size:    52px
  Color:        #FF3333 (bright red)
  Position:     Top center, 60px margin
  Animation:    Pulse effect (scale 1.0 → 1.05)

Visual Elements:
  - Error logs on terminal
  - Red alert indicators
  - Stressed developer (hands on head optional)
  - Color grading: warm reds, desaturated overall
```

#### Scene 2C: Database Down
```
Dimensions:     1080x1920px
Background:     Dark chaos aesthetic
Overlay text:   "Database connection fails"
  Style:        Montserrat SemiBold 600
  Font Size:    52px
  Color:        #FFB900 (warning yellow)
  Position:     Center, 800px from top
  Shadow:       2px 2px 10px rgba(0,0,0,0.7)

Visual Elements:
  - Database icon (spinning, broken)
  - "CONNECTION REFUSED" message
  - Cascading error symbols (↓ ↓ ↓)
  - Cool blue lighting (database aesthetic)
```

#### Scene 2D: Team Meeting Stress
```
Dimensions:     1080x1920px
Background:     Meeting room, professional but stressed
Overlay text:   "Tech debt everywhere"
  Style:        Montserrat SemiBold 600
  Font Size:    52px
  Color:        #FF6B6B (red)
  Position:     Bottom center, 60px margin

Visual Elements:
  - Developer looking overwhelmed
  - Calendar showing 6 months ahead
  - Scattered post-its (metaphor for chaos)
  - Subtle red tint to room
```

### Problem Montage Summary Box (Appears at end of montage)
```
Duration:       Fade in at 4.5s, hold 0.5s
Position:       Bottom 60% of screen
Background:     Semi-transparent dark overlay (rgba(0,0,0,0.7))
Border:         3px solid #FF6B6B
Border-radius:  12px
Padding:        20px

Content (Checklist):
  ❌ 6 months to stable
  ❌ 30-40% tech debt
  ❌ Security gaps
  ❌ Knowledge silos

Style:
  Font:         Montserrat SemiBold 600
  Size:         28px
  Color:        #FFFFFF
  Line Height:  1.6
  Alignment:    Left-aligned, 20px padding
```

---

## 3. SOLUTION REVEAL GRAPHICS
**Duration:** 5-10 seconds  
**Smooth transitions between 6 clips**

### Solution Reveal Animation (Master Graphic)
```
Dimensions:     1080x1920px
Background:     Clean white/light gray (#F8F8F8)
Transition:     Cross-fade from problem (0.5s)

Main Elements:
  1. Wise² Logo (center top)
     Style:     Metallic gray gradient
     Size:      180x180px
     Animation: Fade in + scale (0.8 → 1.0) over 0.5s
     
  2. "WISE² CORE" text
     Font:      Montserrat Bold 700
     Size:      64px
     Color:     #0066CC (brand blue)
     Position:  80px below logo
     Animation: Fade in 0.3s after logo
     
  3. Feature List (appears staggered)
     Font:      Montserrat Regular 400
     Size:      36px
     Items:
       ✓ 7,250 lines of tested code
       ✓ 80%+ coverage enforced
       ✓ 5-minute setup
       ✓ ZERO technical debt
     
     Animations (staggered, 0.2s between each):
       - Checkmark fades in (green #10B981)
       - Text fades in after checkmark
     Position:  Center, 400px from top, 80px spacing
     Color:     #1F2937 (dark text)
     Checkmark: #10B981 (success green)
```

### Solution Montage (6 Quick Scenes)

#### Scene 3A: Code Beauty
```
Dimensions:     1080x1920px
Background:     Dark code editor (#1E1E1E)
Overlay:        Syntax-highlighted code snippet
  Font:         Fira Code 400
  Size:         24px
  Colors:       VS Code theme
  
Text:           "Clean, tested code"
  Font:         Montserrat SemiBold 600
  Size:         44px
  Color:        #4ADE80 (vibrant green)
  Position:     Top right, 40px margin
  
Animation:      Code appears line-by-line (typewriter effect)
```

#### Scene 3B: Tests Passing
```
Dimensions:     1080x1920px
Background:     Terminal black (#0A0E27)
Overlay:        Jest test output

Large checkmarks: ✓ ✓ ✓
  Size:         180px
  Color:        #10B981 (green)
  Position:     Center
  Animation:    Appear one-by-one with satisfying "ding" sound

Text:           "80%+ coverage enforced"
  Font:         Montserrat SemiBold 600
  Size:         48px
  Color:        #10B981
  Position:     Bottom center

Background effect: Subtle green glow around checkmarks
```

#### Scene 3C: Docker Startup
```
Dimensions:     1080x1920px
Background:     Terminal/Docker dashboard
Overlay:        Docker logo + containers spinning

Visual:         3 containers rotating
                - PostgreSQL (blue icon)
                - Redis (red icon)
                - API (purple icon)
                
Text:           "Full stack in seconds"
  Font:         Montserrat SemiBold 600
  Size:         44px
  Color:        #4A90FF (docker blue)
  Position:     Top center

Animation:      Containers spin smoothly (2-3 RPM)
```

#### Scene 3D: Metrics Dashboard
```
Dimensions:     1080x1920px
Background:     Beautiful dashboard UI (Grafana aesthetic)
  Colors:       Dark theme with blue accents

Key Metrics Displayed:
  1. Uptime: "99.9%"
     Font:     Montserrat Bold 700
     Size:     64px
     Color:    #10B981 (green)
     
  2. Response Time: "<200ms"
     Font:     Montserrat Bold 700
     Size:     56px
     Color:    #4ADE80
     
  3. Requests/sec: "1000+"
     Font:     Montserrat Bold 700
     Size:     56px
     Color:    #10B981

Animated:       Numbers count up from 0 (animated counter)
Layout:         3-column grid, centered
Shadow:         Subtle glow around metrics
```

#### Scene 3E: Happy Developer
```
Dimensions:     1080x1920px
Background:     Professional office, good lighting
Image:          Developer smiling at camera
  Positioning:  Center frame, shallow depth of field
  
Overlay:        Semi-transparent brand color box (20% opacity)
Text:           "Ready to ship"
  Font:         Montserrat Bold 700
  Size:         56px
  Color:        #FFFFFF
  Position:     Bottom left, 40px margin
  Shadow:       Drop shadow: 0 4px 12px rgba(0,0,0,0.4)
```

#### Scene 3F: Solution Summary
```
Dimensions:     1080x1920px
Background:     Gradient (light to darker)
                Top:    #F8F8F8
                Bottom: #0066CC (brand blue)

Feature Summary Box:
  Position:     Center, 400px from top
  Width:        900px
  Background:   White with 90% opacity
  Border-radius: 16px
  Padding:      30px
  
Content (animated appearance, staggered):
  "Production-ready infrastructure"
    Font:      Montserrat Bold 700
    Size:      44px
    Color:     #0066CC
    
  "Zero technical debt. Full automation. Enterprise security."
    Font:      Montserrat Regular 400
    Size:      24px
    Color:     #666666
    Margin-top: 15px
    Line-height: 1.6
```

---

## 4. PROOF & CREDIBILITY GRAPHICS
**Duration:** 10-15 seconds  
**Animated appearance sequence**

### Enterprise Logos Section
```
Dimensions:     1080x1920px
Background:     Subtle gradient (#FAFAFA → #FFFFFF)

Section Title:  "Enterprise-Grade Stack"
  Font:         Montserrat SemiBold 600
  Size:         40px
  Color:        #1F2937
  Position:     Top center, 60px margin

Logo Grid (3 columns × 2 rows):
  Logos:        PostgreSQL, Docker, Kubernetes
                Redis, Prometheus, Grafana
  
  Size per logo: 160x160px
  Spacing:       50px horizontal, 60px vertical
  Position:      Center aligned
  
  Animation:     Each logo fades in + scales (0.7 → 1.0)
                Staggered timing (0.15s between each)
                
  Grayscale:     80% opacity initially, full color on appearance
```

### Security Badges Section
```
Dimensions:     1080x1920px
Background:     Light gray (#F5F5F5)

Section Title:  "Enterprise Security"
  Font:         Montserrat SemiBold 600
  Size:         40px
  Color:        #1F2937
  Position:     Top center, 60px margin

Badge Grid (2 columns):
  Badges:
    1. Shield Icon + "RBAC"
    2. Lock Icon + "Encryption"
    3. Audit Icon + "Audit Logs"
    4. Lock Icon + "At Rest & Transit"
  
  Per Badge:
    Size:        160x160px
    Background:  Circular, light blue (#E3F2FD)
    Icon:        Center, 80px size
    Icon Color:  #0066CC
    Text Below:  Montserrat Regular 400, 16px
    
    Animation:   Fade in + rotate (0 → 360°) over 0.8s
```

### Timeline Comparison Graphic
```
Dimensions:     1080x1920px
Background:     White (#FFFFFF)

Section Title:  "Time to Production"
  Font:         Montserrat Bold 700
  Size:         44px
  Color:        #1F2937
  Position:     Top center, 60px margin

Timeline Layout (horizontal bars):

LEFT SIDE (Traditional):
  Title:        "Traditional Build"
  Color:        #EF4444 (red)
  Timer:        "3 MONTHS"
    Size:       80px, Bold
    Color:      #EF4444
  Progress bar: Red, 90% full (representing long wait)
  Subtasks:
    - Architecture: 3 weeks
    - Development: 6 weeks
    - Testing: 2 weeks
    - Deployment: 1 week
  
  Font:         Montserrat Regular 400, 14px
  Color:        #666

RIGHT SIDE (Wise²):
  Title:        "Wise² Core"
  Color:        #10B981 (green)
  Timer:        "3 WEEKS"
    Size:       80px, Bold
    Color:      #10B981
  Progress bar: Green, 100% full (done!)
  Subtitle:     "Production-ready. Ship Monday."
  
  Font:         Montserrat Regular 400, 14px
  Color:        #333

Animation:      Left timer counts up slowly (0 → 3 months visual)
                Right timer counts down fast (3 weeks → DONE)
                Meeting in middle at ~5s mark
                Right side shows completion checkmark
```

---

## 5. CALL-TO-ACTION GRAPHICS
**Duration:** 15-20 seconds  
**Final frame**

### CTA Card (Main Visual)
```
Dimensions:     1080x1920px
Background:     Gradient
                Top:    #0066CC (brand blue)
                Bottom: #003366 (darker blue)

Wise² Logo:
  Size:         240x240px
  Position:     Top center, 80px margin
  Effect:       Subtle glow (box-shadow)
  
Main CTA Text:
  "Ready to ship?"
  Font:         Montserrat Bold 700
  Size:         64px
  Color:        #FFFFFF
  Position:     Center, 600px from top
  Animation:    Fade in + scale 0.8→1.0 over 0.5s

GitHub Button:
  Style:        Rounded rectangle
  Background:   #FFFFFF
  Border-radius: 12px
  Width:        800px
  Height:       80px
  Position:     Center, 300px below main text
  
  Content:      "→ github.com/dwise03-bit/wise2-core"
    Font:       Montserrat SemiBold 600
    Size:       28px
    Color:      #0066CC
    Alignment:  Center
    
  Animation:    Fade in 0.3s after main text
  Hover Effect: Slight scale (1.0 → 1.05) on video viewer interaction

Subtext:
  "Link in bio"
  Font:         Montserrat Regular 400
  Size:         18px
  Color:        #CCCCCC
  Position:     Below button, 20px margin
  
Hashtags:
  "#ProductHunt #OpenSource #GitHub"
  Font:         Montserrat Regular 400
  Size:         16px
  Color:        #BBBBBB
  Position:     Bottom, 40px margin
  
End Frame:
  Duration:     Hold final frame 1 second
  Wise² logo with: "Now Available ✓"
    Font:       Montserrat Bold 700
    Size:       48px
    Color:      #10B981
```

---

## 6. ANIMATED TRANSITIONS & EFFECTS

### Master Transition Specs

| From Scene | To Scene | Transition | Duration | Effect |
|-----------|----------|-----------|----------|--------|
| Title Card | Problem Montage | Cross-fade | 0.5s | Linear |
| Problem 2D | Solution Reveal | Zoom out + fade | 0.8s | Ease-in-out |
| Solution 3A | Solution 3B | Wipe left | 0.4s | Linear |
| Solution 3B | Solution 3C | Cross-fade | 0.3s | Linear |
| Solution 3E | Proof Section | Slide up | 0.6s | Ease-out |
| Timeline | CTA Card | Fade + zoom | 0.8s | Ease-in-out |
| CTA Card | End Frame | Fade | 1.0s | Linear |

### Particle Effects (Optional)
- Problem montage: Subtle red particles (20% opacity)
- Solution scenes: Subtle blue particles (15% opacity)
- Transitions: Light bokeh effect between major sections

---

## 7. COLOR REFERENCE GUIDE

### Primary Colors
```
Brand Blue (Primary):    #0066CC
Brand Dark Blue:         #003366
Brand Light Blue:        #E3F2FD
```

### Accent Colors
```
Success Green:           #10B981
Vibrant Green:           #4ADE80
Error Red:               #EF4444
Warning Yellow:          #FFB900
```

### Neutrals
```
Dark Gray:               #1F2937
Medium Gray:             #666666
Light Gray:              #F5F5F5
Lightest:                #FAFAFA
White:                   #FFFFFF
```

### Semantic
```
Problem (Red tint):      #FF6B6B + desaturation
Solution (Blue tint):    #4A90FF + vibration
Neutral (Dark):          #1A1A1A
```

---

## 8. TYPOGRAPHY SCALE

### Font Family
```
Primary:   Montserrat (Regular 400, SemiBold 600, Bold 700)
Code:      Fira Code (Regular 400)
Fallback:  -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### Size Reference
```
Display (Headlines):     64-96px (Bold 700)
Large (Subheads):        44-56px (SemiBold 600)
Body:                    28-36px (Regular 400)
Small:                   16-24px (Regular 400)
Caption:                 14-18px (Regular 400)
```

---

## 9. DELIVERY SPECIFICATIONS

### File Formats
```
Static Graphics:         PNG (transparent background)
Animations:              MP4 (H.264, AAC audio)
Design Source:           Figma / Adobe XD project file
```

### Export Settings
```
Resolution:              1080x1920px (9:16 vertical)
Frame Rate:              60fps (smooth motion)
Color Space:             sRGB (web-safe)
Compression:             H.264, quality 90%
Audio:                   AAC, 128kbps stereo
```

### Timing Sync
```
Total Duration:          20 seconds
Frame Count:             1200 frames (at 60fps)
Audio Duration:          20 seconds (matches video)
```

---

## 10. DESIGNER CHECKLIST

### Pre-Production
- [ ] Gather all logo assets (PNG, SVG)
- [ ] Confirm color values with brand guide
- [ ] Collect font files (Montserrat, Fira Code)
- [ ] Prepare developer photos for filming
- [ ] Source dashboard/code screenshots

### Design
- [ ] Create master composition file (1080x1920)
- [ ] Design individual graphic cards
- [ ] Set up animation sequences
- [ ] Test color accuracy (check on phone)
- [ ] Verify readability at mobile sizes

### Animation
- [ ] Program fade transitions (0.3-0.8s)
- [ ] Create count-up animations (timers)
- [ ] Design spinning/rotation effects
- [ ] Test smooth playback
- [ ] Sync animations with audio

### Export & QA
- [ ] Export all graphics at 1080x1920
- [ ] Verify MP4 codec and bitrate
- [ ] Test on Instagram preview tool
- [ ] Check audio sync
- [ ] Verify text readability on phone

### Final Delivery
- [ ] Package all files (PSD/XD, PNG exports, MP4)
- [ ] Include design specs (this document)
- [ ] Provide Figma/XD link to team
- [ ] Add notes on animation timing
- [ ] Archive for future repurposing

---

## 11. USAGE RIGHTS & LICENSING

### Assets Used
```
Stock Photos:      [Specify if used]
Icons:             [Fontawesome / Custom / Other]
Music/Audio:       [Epidemic Sound / Stock Music]
Fonts:             Montserrat (Google Fonts - Open Source)
                   Fira Code (GitHub - Open Source)
```

### Reusability
- Wise² logo animation: Reusable for all marketing
- Color palette: Consistency across all materials
- Typography: Use same scale/hierarchy for all video content
- Transitions: Template for future Instagram Reels

---

## 12. ADDITIONAL NOTES

### Designer Tips
1. **Shadows**: Use drop-shadow with 0 4px 12px rgba(0,0,0,0.4) for text
2. **Anti-aliasing**: Enable for all text to ensure clarity at mobile sizes
3. **Color Grading**: Use LUT for consistent color across video clips
4. **Mobile Test**: Always preview on actual phone before delivery
5. **Audio Sync**: Ensure animations hit beats in the soundtrack

### Common Issues to Avoid
- ❌ Text too small (<28px for body, <40px for headlines)
- ❌ Transitions too slow (keep under 0.8s)
- ❌ Cluttered layouts (maximize white space)
- ❌ Misaligned elements (use grids/guides)
- ❌ Low-contrast text on backgrounds

### Iteration Notes
If redesign needed:
- Keep logo consistent
- Maintain color palette
- Use same typography scale
- Follow timing/animation specs
- Test on mobile first

---

**Ready for Designer/Production Team**

Print this document or share as PDF with video production team. All specifications are mobile-optimized and Instagram-compliant.
