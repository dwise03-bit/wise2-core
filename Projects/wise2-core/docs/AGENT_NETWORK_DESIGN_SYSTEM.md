# WISE² Agent Network Design System

**Source**: ScreenRecording_10-03-2026 (Everyday Trader UI)  
**Version**: 1.0  
**Status**: Production Design

---

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Navy Black | #050607 | Primary background |
| Primary Accent | Neon Cyan | #00D9FF | Highlights, active states, connections |
| Secondary Accent | Neon Magenta | #FF00FF | Highlights, alerts |
| Tertiary Accent | Gold | #C4A369 | Success, secondary highlights |
| Grid | Cyan (20%) | rgba(0, 217, 255, 0.2) | Background grid pattern |
| Text Primary | White | #FFFFFF | Body text |
| Text Secondary | Gray | #999999 | Secondary text |

## Typography

- **Font Family**: System sans-serif (SF Pro Display, -apple-system)
- **Headline**: 24px, Bold, Letter-spacing: -0.5px
- **Subheading**: 16px, Semibold
- **Body**: 14px, Regular
- **Caption**: 12px, Regular, Color: Text Secondary
- **Code**: Monospace, 12px

## Components

### 1. Profile Carousel (Story Ring)
- **Circular container** with gradient border (2-4px)
- **Gradient colors**: Red → Magenta → Orange → Yellow
- **Size**: 64px diameter
- **Inner image**: 56px diameter
- **Label**: Below ring, 12px body text
- **Add button**: White "+" on gray circle (32px)

### 2. Agent/Role Card
- **Width**: 320px
- **Background**: Dark blue (rgba(50, 100, 200, 0.1))
- **Border**: 1px solid rgba(0, 217, 255, 0.3)
- **Padding**: 16px
- **Sections**:
  - Title with icon (TECH · Knowledge Hygiene)
  - Description text
  - "THE LADDER" section with automation levels
  - "THE HUMAN" role description
  - "DONE BY" agent assignment
  - "THE SOP" numbered steps (01-04)
- **Text color**: #FFFFFF
- **Accent color**: #00D9FF for labels

### 3. Network Graph Node
- **Variants**:
  - **User node**: Circular icon with person symbol, 48px
  - **Agent node**: Icon + label, 40px
  - **Process node**: Document/action icon, 40px
- **Border**: 2px solid #00D9FF or #FF00FF
- **Background**: Slightly lighter navy
- **Label**: 12px body text below or beside

### 4. Connection Lines
- **Type**: Dotted or solid line
- **Color**: #00D9FF (primary) or #FF00FF (secondary)
- **Width**: 1-2px
- **Style**: Straight or curved bezier paths

### 5. Sidebar Navigation
- **Width**: 240px
- **Background**: #050607 with subtle border
- **Menu item height**: 36px
- **Active state**: Left border (3px) in #00D9FF
- **Icon + label**: 14px body text
- **Hover state**: Background rgba(0, 217, 255, 0.1)

### 6. Detail Panel (Center)
- **Width**: 320-400px
- **Background**: Dark blue (rgba(50, 100, 200, 0.05))
- **Border**: 1px solid rgba(0, 217, 255, 0.2)
- **Sections**: Stacked vertically with 8px spacing
- **Search bar**: 32px height, icon on left

### 7. Grid Background
- **Pattern**: Square grid, 20px spacing
- **Color**: rgba(0, 217, 255, 0.1)
- **Position**: Behind network graph, full viewport

## Layout Patterns

### 3-Column Layout
```
┌─────────────────────────────────────┐
│ Header (Stories, Search, Filters)   │
├──────────────┬──────────────┬───────┤
│  Sidebar     │ Detail Panel │ Graph │
│  (240px)     │ (320px)      │ Flex  │
│              │              │       │
└──────────────┴──────────────┴───────┘
```

### Responsive Breakpoints
- **Desktop**: Full 3-column (1200px+)
- **Tablet**: 2-column, hide sidebar in drawer (768px-1199px)
- **Mobile**: 1-column, stacked (< 768px)

## Interaction Patterns

### Network Graph
- **Hover node**: Highlight connected nodes, brighten label
- **Click node**: Show detail panel on left
- **Drag**: Pan the graph
- **Wheel**: Zoom in/out
- **Double-click**: Focus on node and its connections

### Cards
- **Hover**: Brighten border, slight scale (1.02x)
- **Click**: Expand or navigate to details

### Sidebar
- **Hover menu item**: Background highlight
- **Click menu item**: Active border + navigate
- **Scroll**: Smooth scroll with custom scrollbar

## Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Shadows
- **Light**: 0 2px 8px rgba(0, 0, 0, 0.15)
- **Medium**: 0 4px 16px rgba(0, 0, 0, 0.25)
- **Heavy**: 0 8px 32px rgba(0, 0, 0, 0.35)

---

## Assets Extracted

From video frame analysis:
- Circular profile borders (gradient rings)
- Network graph node system
- Agent hierarchy visualization
- Role/responsibility cards
- SOP step indicators
- Grid background pattern
- Monospace code display for workflows

---

## Next Steps

1. **Build React components** for each element
2. **Create network graph library** integration (D3.js or Vis.js)
3. **Implement sidebar navigation**
4. **Add detail panels**
5. **Connect to real agent/workflow data**
6. **Test on multiple devices**
