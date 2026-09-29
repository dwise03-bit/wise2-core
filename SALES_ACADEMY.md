# WISE² Sales Academy - Complete Documentation

**Status**: ✅ **PRODUCTION LIVE**  
**Launch Date**: 2026-09-15  
**URL**: https://wise2.net/sales-academy/

---

## Overview

WISE² Sales Academy is a comprehensive sales enablement platform designed to train and enable WISE² sales teams across 3 regional markets. The platform delivers market-specific training content, sales scripts, competitive positioning, and certification programs.

## Features

### 📚 7 Core Training Modules

1. **Sales Academy** - Foundational training on WISE² products and value proposition
2. **Knowledge Base** - Comprehensive product information with 5 tabbed sections
   - Products (Command, AI Phone, Field Tech, HVAC Intelligence)
   - ROI & Value (financial impact metrics)
   - Sales Scripts (proven pitch frameworks)
   - Competitive Positioning (vs competitors)
   - Customer Success (case studies, testimonials)
3. **Offer Map** - 5-tier pricing structure and feature matrix
4. **Cheat Sheet** - Quick-reference sales aids
   - 90-second pitch template
   - 4 objection handlers with counter-arguments
   - ROI metrics and value talking points
5. **Service Playbook** - Deal structure and progression framework
   - 4-week deal flow (Discovery → Audit → Kickoff → Scaling)
   - Positioning guidance
   - Deal size customization (small/mid/large contractors)
6. **Operations Toolkit** - Resources and templates
   - Proposal templates
   - Discovery worksheets
   - Sales frameworks
   - ROI models
   - Negotiation guides
   - Case studies
   - Presentation decks
7. **Role-Plays & Cert** - Interactive training scenarios
   - 4 role-play scenarios (Skeptical Owner, Tech-Savvy CFO, Dispatcher Blocker, Budget Squeeze)
   - 3 certification levels (Foundation, Sales, Expert)
   - Live training schedule

### 🌍 3 Regional Markets

Sales content is customized for each market:
- **🏠 North Carolina** - Largest HVAC market focus
- **🗽 New York City** - Urban/dense market positioning
- **🌊 Long Island** - Suburban contractor focus

Each market gets 7 localized module versions with:
- Market-specific contractor profiles
- Local ROI metrics
- Regional case studies
- Market-appropriate deal structures

### 🎨 Professional Design

- WISE² brand identity (cyan #00D9FF, green #00FF7F, navy #050607)
- Glassmorphic card design with backdrop blur effects
- Responsive layout (desktop/tablet/mobile)
- Dark enterprise theme
- Smooth animations and transitions
- Professional typography (Space Grotesk, Inter)

### 📱 Responsive Architecture

- **Desktop** (800px+): 3-column grid layout for modules
- **Tablet** (768px+): 2-column responsive layout
- **Mobile** (375px+): Single-column stacked layout
- Touch-friendly button sizes
- Readable typography at all sizes

---

## File Structure

```
apps/website/public/sales-academy/
├── index.html                    (Hub page with market selector)
├── nc-knowledge-base.html        (NC Knowledge Base - 5 tabs)
├── nc-cheat-sheet.html           (NC Sales Cheat Sheet)
├── nc-offer-map.html             (NC Pricing & Offers)
├── nc-playbook.html              (NC Deal Playbook)
├── nc-toolkit.html               (NC Resources Toolkit)
├── nc-roleplay.html              (NC Role-Play Scenarios)
├── nc-academy.html               (NC Foundational Academy)
├── nyc-*.html                    (7 NYC market variants)
└── li-*.html                     (7 Long Island market variants)

Total: 22 HTML files
- 1 Hub (index.html)
- 7 Modules × 3 Markets = 21 Content files
```

## Hub Page (index.html)

The hub page serves as the gateway to Sales Academy:

```javascript
// Market structure
const markets = {
  nc: { name: 'North Carolina', modules: [ ... ] },
  nyc: { name: 'New York City', modules: [ ... ] },
  li: { name: 'Long Island', modules: [ ... ] }
};

// Dynamic loading
function loadMarket(market) {
  // Renders 7 module cards for selected market
  // Updates active button state
  // Loads market-specific content
}

// Auto-load NC on page load
loadMarket('nc');
```

**Features**:
- Market button switcher with visual feedback
- Auto-loads North Carolina content on first visit
- Dynamic module card generation
- Responsive grid layout
- Professional hero section with gradient background

## Technical Stack

- **Format**: Plain HTML5 with inline CSS
- **Styling**: CSS3 with CSS variables for theming
- **Interactivity**: Vanilla JavaScript (no frameworks)
- **Colors**: WISE² brand palette locked in CSS variables
- **Typography**: Google Fonts (Space Grotesk, Inter)
- **Deployment**: Static files served via nginx on wise2.net

## Branding Standards

### Color Palette
- **Primary Cyan**: `#00D9FF` (buttons, accents, active states)
- **Accent Green**: `#00FF7F` (titles, headings, highlights)
- **Navy Dark**: `#050607` (background, primary color)
- **Darker Blue**: `#0a0f1a` (card backgrounds)
- **Gold**: `#C4A369` (secondary accent)
- **Gray Light**: `#D1D5DB` (text)

### Typography
- **Headings**: Space Grotesk, Bold (700)
- **Body**: Inter, Regular (400)
- **Accents**: Space Grotesk, Medium (500)

### Design Elements
- Glassmorphic cards with `backdrop-filter: blur(10px)`
- Glowing text shadows on titles
- Smooth transitions (0.3s ease)
- Radial gradient backgrounds
- Hover state elevation (translateY)

## Deployment

### URLs
- Hub: `https://wise2.net/sales-academy/`
- All modules: `https://wise2.net/sales-academy/{market}-{module}.html`

### Navigation
- Linked in main website nav: Header.tsx (line 21)
- Direct access via URL
- No login required
- Static files (zero server overhead)

### Performance
- Page load time: <500ms (static HTML)
- No external API calls
- No database queries
- Fully client-side interactivity
- Cacheable by CDN/browser

## Content Structure

### Knowledge Base (5 Tabs)
```
1. Products
   - WISE² Command (Central OS)
   - AI Phone (Intelligent calling)
   - Field Tech (Mobile dispatch)
   - HVAC Intelligence (Predictive analytics)

2. ROI & Value
   - 3-4x first-year ROI
   - 5+ missed leads recovered/week
   - +3 jobs/techs/week capacity
   - Team retention metrics

3. Sales Scripts
   - Opening framework
   - Problem identification
   - Solution positioning
   - Outcome demonstration

4. Competitive Positioning
   - vs ServiceTitan
   - vs Jobber
   - vs Housecall Pro
   - Unique WISE² advantages

5. Customer Success
   - Case studies by market
   - Testimonials
   - Implementation timelines
   - ROI proofs
```

### Cheat Sheet (Sales Aid)
```
The NC Opportunity
├── Market context (800+ service businesses, $50B annual spend, etc.)
└── Key stats (growth trends, pain points, etc.)

90-Second Pitch
├── Opening: Market positioning
├── Problem: Operational inefficiencies
├── Solution: WISE² system benefits
└── Outcome: Specific ROI metrics

Objection Handlers (4 common objections)
1. "It's too expensive"
   → ROI payback analysis
   
2. "We already have a system"
   → Integration capabilities
   
3. "We're fine with spreadsheets"
   → Scaling limitations
   
4. Budget concerns
   → Flexible pricing tiers
```

### Offer Map (5 Tiers)
```
Tier 1: Audit           ($X/month)
Tier 2: Build           ($X/month)
Tier 3: Scale           ($X/month)
Tier 4: Dominate        ($X/month)
Tier 5: Enterprise      (Custom)

Each tier includes:
- Feature matrix
- Support level
- Customization depth
- Integration scope
- Success guarantee
```

### Playbook (Deal Structure)
```
Week 1: Discovery
├── Initial consultation
├── Pain point identification
├── Solution mapping
└── ROI pre-calc

Week 2: Audit & Proposal
├── System audit
├── Gap analysis
├── Custom proposal
└── Pricing presentation

Week 3-4: Kickoff & Setup
├── Implementation planning
├── Team training
├── Data migration
└── Go-live support

Month 2+: Scaling
├── Performance monitoring
├── Feature enablement
├── Team expansion
└── Continuous optimization
```

### Toolkit (Resources)
```
Templates
├── Proposal templates
├── Contract templates
├── SOW templates
└── MSA templates

Worksheets
├── Discovery worksheets
├── Pain analysis form
├── ROI calculator
└── Implementation checklist

Frameworks
├── Sales process guide
├── Qualification criteria
├── Deal progression model
└── Negotiation tactics

Models
├── ROI calculator
├── NPV analysis
├── Break-even analysis
└── Pricing matrix

Guides
├── Negotiation guide
├── Closing strategies
├── Objection handbook
└── Post-sale playbook

Media
├── Case studies (PDF)
├── Presentation decks
├── Video library
├── One-pagers

Examples
├── Sample proposals
├── Winning email templates
├── Cold outreach examples
└── Follow-up sequences
```

### Role-Play Scenarios (4)
```
Scenario 1: Skeptical Owner
Profile: 20-year veteran, conservative, risk-averse
Challenge: Convincing them to change
Your Job: Build trust, prove value
Success Metric: Commitment to pilot

Scenario 2: Tech-Savvy CFO
Profile: Finance-focused, numbers-driven, skeptical of hype
Challenge: Demonstrating clear ROI
Your Job: Present financial case
Success Metric: Budget approval

Scenario 3: Dispatcher Blocker
Profile: Operational gatekeeper, change-resistant
Challenge: Addressing workflow disruption
Your Job: Show time-saving benefits
Success Metric: Buy-in from team

Scenario 4: Budget Squeeze
Profile: Cash-constrained, profitable but tight
Challenge: Justifying investment
Your Job: Show payback timeline
Success Metric: Phased implementation agreement

Certification Levels:
- Foundation (1-2 weeks): Product knowledge
- Sales (2-4 weeks): Pitch mastery
- Expert (4-8 weeks): Deal closing mastery
```

## Success Metrics

Track adoption and effectiveness:

```
Hub Engagement
├── Sessions per day
├── Average time on hub
├── Module views per session
└── Market-specific traffic

Module Usage
├── Most-viewed modules
├── Completion rates
├── Tab switches (within Knowledge Base)
└── Average time per module

Business Impact
├── Sales team utilization
├── Deal cycle time
├── Win rate by market
├── Average deal size
└── ROI attainment
```

## Maintenance

### Adding New Markets
1. Duplicate `nc-*.html` files to `{market}-*.html`
2. Update market name and content
3. Add to `index.html` markets object
4. Test all 7 modules
5. Deploy and verify

### Updating Content
1. Edit specific `.html` file
2. Maintain brand styling (colors, fonts, layout)
3. Keep responsive design intact
4. Test on desktop/tablet/mobile
5. Commit and deploy

### Version Management
- Each HTML file is independent
- Updates don't require rebuilds
- Instant deployment (static files)
- Browser cache-friendly with query params if needed

## Success Stories

- **Sales Enablement**: Consistent messaging across 3 markets
- **Onboarding**: New reps ramp faster with structured materials
- **Deal Support**: Cheat sheets and scripts increase closing rates
- **Team Confidence**: Certification program builds expertise
- **Market Penetration**: Localized content resonates with regional contractors

## Next Steps

### Phase 2 (Planned)
- Add video modules
- Interactive ROI calculator
- Live chat support
- Sales team progress tracking
- Certification badges

### Phase 3 (Planned)
- Mobile app version
- Offline access
- Team leaderboards
- Manager dashboards
- Integration with CRM

---

**Status**: ✅ Full production deployment complete. Sales Academy is live and ready for sales team use.

**For support**: Contact dwise03@gmail.com or check wise2.net/sales-academy
