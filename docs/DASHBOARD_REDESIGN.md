# WISE² Dashboard Redesign Specification

**Version**: 1.0  
**Status**: Design Complete, Ready for Implementation  
**Target**: Raspberry Pi 3B+ (Performance Optimized)  

---

## Design System

### Color Palette
```css
Primary Background:    #050505 (Pure Black)
Primary Accent:        #39FF14 (Neon Green)
Primary Hover:         #4CFF3D
Primary Active:        #2FD910
Secondary Accent:      #BFC4C9 (Chrome)
Dark Surface:          #0D1117
Darker Surface:        #131922
Text Primary:          #FFFFFF
Text Secondary:        #C9CED6
Text Muted:            #8D98A5
Border Subtle:         rgba(255,255,255,0.08)
```

### Typography
```
Display Font:  "Beyond The Mountains"
Body Font:     "Rajdhani"
Mono Font:     "Fira Code"

Sizes:
  H1:  76px (6xl)
  H2:  49px (4xl)
  H3:  39px (3xl)
  H4:  25px (xl)
  Body: 16px (base)
  Small: 13px (sm)
```

### Spacing & Layout
```
Base Unit: 4px
Padding: 24px (cards), 12px (inputs)
Gaps: 16px (grid), 8px (compact)
Border Radius: 8px (sm), 12px (base), 24px (lg)
```

---

## Dashboard Modules

### 1. System Health Dashboard

**Location**: Top of main dashboard  
**Purpose**: Real-time system status overview

**Components**:
```
┌─────────────────────────────────────────────┐
│  SYSTEM HEALTH                    [Last 5m] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   CPU    │  │   RAM    │  │  DISK    │ │
│  │   23%    │  │   45%    │  │   62%    │ │
│  │ 🟢 Good  │  │ 🟢 Good  │  │ 🟡 High  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Network  │  │Database  │  │  Cache   │ │
│  │ 12Mbps   │  │ 342MB    │  │  156MB   │ │
│  │ 🟢 Good  │  │ 🟢 Good  │  │ 🟢 Good  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
```

**Design Details**:
- Each metric is a card with live gauge
- Green/Yellow/Red indicators
- Smooth animations on value changes
- Click to expand for detailed breakdown
- Responsive: 2x3 grid on desktop, 1x6 on mobile

**CSS Classes**:
```css
.system-health {
  background: var(--wise-surface);
  border: 1px solid var(--wise-border-subtle);
  padding: var(--wise-space-6);
  border-radius: var(--wise-radius-base);
}

.health-card {
  background: linear-gradient(135deg, 
    var(--wise-surface-2) 0%, 
    var(--wise-surface) 100%);
  border: 1px solid var(--wise-border-subtle);
  padding: var(--wise-space-4);
  border-radius: var(--wise-radius-sm);
  transition: all var(--wise-duration-base);
}

.health-card:hover {
  border-color: var(--wise-primary);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.1);
}

.metric-value {
  font-size: var(--wise-text-2xl);
  font-weight: bold;
  color: var(--wise-primary);
}

.metric-status {
  font-size: var(--wise-text-sm);
  margin-top: var(--wise-space-2);
}

.status-good { color: #22C55E; }
.status-warning { color: #F59E0B; }
.status-critical { color: #E53935; }
```

---

### 2. Key Metrics Dashboard

**Location**: Below System Health  
**Purpose**: Business KPIs and performance indicators

**Layout**:
```
┌──────────────────────────────────────────────┐
│ KEY METRICS - This Month                     │
├──────────────────────────────────────────────┤
│                                              │
│ Total Revenue    Active Customers  Avg Value│
│ $124,560         +18 new         $4,250     │
│ ↑ 12% from last   ↑ 8% growth     ↑ 3%     │
│                                              │
│ Tasks Completed  Response Time   Conversion │
│ 847              2.3s avg        18%        │
│ ↑ 23%            ↓ -400ms        ↑ 2%      │
│                                              │
└──────────────────────────────────────────────┘
```

**Features**:
- 6-card grid (responsive to 2x3, 1x6)
- Live updating numbers
- Trend indicators (↑ green, ↓ red)
- Percentage change from previous period
- Click to drill into detailed analytics

---

### 3. Business Intelligence

**Location**: Main content area  
**Purpose**: Charts, trends, and analytics

**Sections**:

#### 3a. Revenue Trend
```
┌──────────────────────────────────┐
│ Revenue (Last 30 Days)    [Chart]│
├──────────────────────────────────┤
│                                  │
│        ╱╲          ╱╲            │ $120k
│       ╱  ╲        ╱  ╲           │
│      ╱    ╲      ╱    ╲╲         │ $80k
│     ╱      ╲    ╱      ╲╲        │
│    ╱        ╲╱          ╲╲__     │ $40k
│   ╱                          ╲   │
│  ─────────────────────────────  │ $0
│  W1    W2    W3    W4    Today   │
│                                  │
│ Total: $124,560  ↑12% vs month   │
└──────────────────────────────────┘
```

#### 3b. Customer Distribution
```
┌──────────────────────────────────┐
│ Customers by Type                │
├──────────────────────────────────┤
│                                  │
│ Enterprise  ███████░░  42%       │
│ Mid-Market  ████░░░░░░  28%      │
│ Small Biz   ██░░░░░░░░  18%      │
│ Startup     ██░░░░░░░░  12%      │
│                                  │
└──────────────────────────────────┘
```

#### 3c. Pipeline Status
```
┌──────────────────────────────────┐
│ Sales Pipeline                   │
├──────────────────────────────────┤
│                                  │
│ Lead        $340k  →  Propose    │
│             (12 deals)            │
│ Proposal    $180k  →  Negotiate  │
│             (8 deals)             │
│ Negotiate   $240k  →  Close      │
│             (6 deals)             │
│ Won         $645k  ✓              │
│             (28 deals)            │
│                                  │
└──────────────────────────────────┘
```

**Chart Library**: Chart.js with WISE² theme  
**Animations**: Smooth transitions (300ms)  
**Interactivity**: Hover to show exact values

---

### 4. Customer CRM Interface

**Location**: Sidebar or separate section  
**Purpose**: Quick customer management

**Features**:
```
┌─────────────────────────────────────┐
│ CUSTOMERS                    [+New] │
├─────────────────────────────────────┤
│ Search... [Filter] [Sort ▼]         │
├─────────────────────────────────────┤
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Acme Corp               ⭐⭐⭐⭐⭐│   │
│ │ Contact: John Smith           │   │
│ │ Status: Active Customer       │   │
│ │ Last contact: 2 hours ago     │   │
│ │ Value: $45,200/year           │   │
│ │                               │   │
│ │ [View] [Edit] [Email] [Call]  │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ TechStart Inc               ⭐⭐⭐  │   │
│ │ Contact: Sarah Johnson        │   │
│ │ Status: Active Customer       │   │
│ │ Last contact: 1 week ago      │   │
│ │ Value: $18,000/year           │   │
│ │                               │   │
│ │ [View] [Edit] [Email] [Call]  │   │
│ └───────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Features**:
- Quick access to top customers
- Search and filtering
- Star ratings for VIP status
- Last interaction timestamp
- Quick action buttons
- Sorted by revenue/activity

---

### 5. Recent Activity

**Location**: Right sidebar  
**Purpose**: Event stream and notifications

```
┌──────────────────────────────┐
│ RECENT ACTIVITY              │
├──────────────────────────────┤
│                              │
│ 🔔 Invoice #INV-2891        │
│    Paid - $12,500            │
│    2 hours ago               │
│                              │
│ 📞 Call logged with Acme     │
│    Sales discussion          │
│    4 hours ago               │
│                              │
│ ✅ Task: Q3 Planning        │
│    Completed                 │
│    1 day ago                 │
│                              │
│ 📧 Email sent to Sarah      │
│    Proposal follow-up        │
│    2 days ago                │
│                              │
└──────────────────────────────┘
```

---

### 6. Settings Panel

**Location**: Collapsible bottom or dedicated page  
**Purpose**: System configuration

**Options**:
```
┌─────────────────────────────────────┐
│ SETTINGS                     [Close] │
├─────────────────────────────────────┤
│                                     │
│ ▼ System                            │
│   □ Dark Mode (enabled)             │
│   □ Auto-refresh (5 min)            │
│   □ Sound notifications (enabled)   │
│                                     │
│ ▼ Network                           │
│   IP Address: 192.168.1.100         │
│   Hostname: wise.local              │
│   Status: Connected (Ethernet)      │
│                                     │
│ ▼ Backup                            │
│   Last Backup: Today 2:00 AM        │
│   Next Backup: Tomorrow 2:00 AM     │
│   [Backup Now] [Restore]            │
│                                     │
│ ▼ Users                             │
│   Admin (you)                       │
│   [Add User] [Manage Roles]         │
│                                     │
└─────────────────────────────────────┘
```

---

## Layout & Navigation

### Main Dashboard Layout
```
┌────────────────────────────────────────────────────────┐
│ WISE² Enterprise Command Center        [user] [menu]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌─────────────┐ ┌──────────────────────────────────┐  │
│ │ Sidebar     │ │ Main Content Area                │  │
│ │             │ │                                  │  │
│ │ • Dashboard │ │ ┌─────────────────────────────┐  │  │
│ │ • Customers │ │ │ System Health               │  │  │
│ │ • Sales     │ │ └─────────────────────────────┘  │  │
│ │ • Analytics │ │                                  │  │
│ │ • Tasks     │ │ ┌─────────────────────────────┐  │  │
│ │ • Settings  │ │ │ Key Metrics                 │  │  │
│ │             │ │ └─────────────────────────────┘  │  │
│ │ [WISE² Logo]│ │                                  │  │
│ │             │ │ ┌─────────────────────────────┐  │  │
│ │             │ │ │ Business Intelligence       │  │  │
│ │             │ │ │ (Charts, Trends)            │  │  │
│ │             │ │ │                             │  │  │
│ │             │ │ │ [Revenue Chart]             │  │  │
│ │             │ │ │ [Pipeline Chart]            │  │  │
│ │             │ │ └─────────────────────────────┘  │  │
│ │             │ │                                  │  │
│ └─────────────┘ └──────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Navigation Sidebar

**Design**:
- Fixed left sidebar (250px wide on desktop, collapsed on mobile)
- Logo at top with WISE² branding
- Main navigation links
- Settings at bottom
- Hover effects with neon green glow

**Navigation Items**:
1. Dashboard (home icon) - default view
2. Customers (people icon) - CRM interface
3. Sales (chart icon) - pipeline & forecasting
4. Analytics (chart line icon) - detailed reporting
5. Tasks (check icon) - task management
6. Settings (gear icon) - system configuration

---

## Responsive Design

### Desktop (1280px+)
- Full sidebar (250px)
- 2-3 column grid layout
- Full charts and visualizations
- All modules visible

### Tablet (768px-1279px)
- Collapsed sidebar (60px icons only)
- 2-column layout
- Slightly smaller charts
- Stacked cards

### Mobile (< 768px)
- Hamburger menu (overlay sidebar)
- 1-column layout
- Vertical card stacking
- Simplified charts (key metrics only)
- Touch-friendly buttons (48px+ height)

---

## Animation & Transitions

### Entrance Animations
```css
.dashboard-card {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Effects
```css
.interactive-element {
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
}

.interactive-element:hover {
  border-color: var(--wise-primary);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  transform: translateY(-2px);
}
```

### Loading States
```css
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent,
    rgba(57, 255, 20, 0.1),
    transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

---

## Accessibility

### WCAG AA Compliance
- ✅ Contrast ratio 7:1+ for text
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Focus indicators (2px outline)
- ✅ Semantic HTML (nav, main, section, article)
- ✅ ARIA labels on icons
- ✅ Alt text for charts/images

### Keyboard Shortcuts
```
? - Help
D - Dashboard
C - Customers
S - Sales
A - Analytics
T - Tasks
Ctrl+S - Save
Escape - Close menu
```

---

## Performance Optimizations

### For Raspberry Pi 3B+
- ✅ Lazy load charts (render on demand)
- ✅ Virtual scrolling for long lists
- ✅ CSS containment for performance
- ✅ Preload critical resources
- ✅ Debounce search/filter inputs
- ✅ Cache computed values
- ✅ Minimize re-renders (React memoization)
- ✅ Image optimization (WebP with fallback)

### Target Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3s

---

## Implementation Roadmap

### Phase 1: Core Layout (2-3 hours)
1. Sidebar navigation
2. Main layout grid
3. Header with branding
4. Responsive behavior

### Phase 2: System Health Module (1-2 hours)
1. Health card components
2. Live metric updates
3. Status indicators
4. Animations

### Phase 3: Dashboard Widgets (2-3 hours)
1. Key metrics cards
2. Chart components
3. Activity stream
4. Customer list

### Phase 4: Polish & Optimization (1-2 hours)
1. Performance tuning
2. Animation refinement
3. Mobile responsiveness
4. Accessibility verification

---

## Design Assets

### Colors (CSS Variables)
All available in `packages/design-system/design-tokens.css`

### Icons
- Phosphor Icons (recommended)
- Or Material Design Icons
- All icons: 24px base size, scalable

### Fonts
- Beyond The Mountains: Display headings
- Rajdhani: Body and UI text
- Fira Code: Code and monospace

---

## Testing Checklist

- [ ] Desktop (1280px, 1920px)
- [ ] Tablet (768px, 1024px)
- [ ] Mobile (375px, 414px)
- [ ] Dark mode (primary aesthetic)
- [ ] Light mode (fallback)
- [ ] Keyboard navigation
- [ ] Screen reader (NVDA/JAWS)
- [ ] Touch interactions
- [ ] Performance (< 3s load)
- [ ] Accessibility (WCAG AA)

---

## Next Steps

1. **Implement Core Layout** - Build sidebar and grid system
2. **Add System Health Module** - Create metric cards and gauges
3. **Integrate Charts** - Use Chart.js for visualizations
4. **Build Customer CRM** - Create customer list interface
5. **Polish & Optimize** - Refine animations and performance
6. **Testing** - Full QA across devices
7. **Deploy** - Push to production

---

**This design is optimized for Raspberry Pi 3B+ while maintaining enterprise-grade aesthetics and functionality.**
