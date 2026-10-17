# Agent Network Dashboard Component Library

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2026-10-08

## Overview

The Agent Network Dashboard is a comprehensive visualization system for the WISE² Everyday Trader feature. It displays a hierarchical network of 37 AI agents, their relationships, roles, automation levels, and standard operating procedures.

**Extracted from**: ScreenRecording_10-03-2026 19-06-42  
**Design System**: See [AGENT_NETWORK_DESIGN_SYSTEM.md](../../../docs/AGENT_NETWORK_DESIGN_SYSTEM.md)

## Components

### 1. **AgentNetworkDashboard**
Main component that orchestrates the full interface.

```tsx
import { AgentNetworkDashboard } from '@/components/AgentNetwork';

export default function Page() {
  return <AgentNetworkDashboard />;
}
```

**Features**:
- 3-column responsive layout
- Profile carousel header
- Sidebar navigation
- Detail panel
- Network graph visualization
- Full interactivity

### 2. **AgentNetworkGraph**
Canvas-based network visualization with ring hierarchy.

```tsx
import { AgentNetworkGraph } from '@/components/AgentNetwork';

interface AgentNode {
  id: string;
  name: string;
  type: 'hub' | 'ring1' | 'ring2' | 'ring3' | 'ring4';
  role: string;
  status: 'active' | 'idle' | 'error';
  connections: string[];
}

<AgentNetworkGraph
  agents={agentList}
  selectedAgent={selectedId}
  onAgentSelect={(id) => setSelected(id)}
  interactive
/>
```

**Interactions**:
- **Click**: Select agent
- **Hover**: Highlight connections
- **Pan**: Drag to move (future)
- **Zoom**: Scroll to zoom (future)

### 3. **AgentCard**
Displays detailed agent information including role, automation ladder, and SOP.

```tsx
import { AgentCard } from '@/components/AgentNetwork';

<AgentCard
  id="agent-tech"
  category="TECH"
  title="Knowledge Hygiene"
  description="A part-time knowledge-base janitor..."
  ladder={{
    humanLed: "You set what 'healthy' means...",
    humanAssisted: "It lists broken links...",
    fullyAutonomous: "It walks every file..."
  }}
  humanRole="You set the rules and review scores..."
  doneBy={{
    agent: "Markdown Auditor",
    type: "AI agent",
    ratio: "1:1"
  }}
  sop={[
    { step: 1, description: "Walk every markdown file..." },
    { step: 2, description: "Flag broken wiki-links..." },
  ]}
  selected
  onClick={() => handleSelect()}
/>
```

**Sections**:
- Category & Title
- Description
- THE LADDER (automation progression)
- THE HUMAN (human role in workflow)
- DONE BY (agent assignment)
- THE SOP (standard operating procedure steps)

### 4. **ProfileCarousel**
Instagram-style story ring carousel for user/profile selection.

```tsx
import { ProfileCarousel } from '@/components/AgentNetwork';

<ProfileCarousel
  profiles={[
    {
      id: 'profile1',
      name: 'Your story',
      imageUrl: '/images/user.jpg',
      gradient: 'red',
      isStory: true
    },
    // ... more profiles
  ]}
  onProfileSelect={(id) => setProfile(id)}
  onAddStory={() => createNewStory()}
/>
```

**Features**:
- Circular gradient borders (4 colors: red, magenta, orange, yellow)
- Horizontal scroll
- Selection state
- Add story button

## Design System

### Colors
```css
--color-bg-primary: #050607;
--color-accent-cyan: #00D9FF;
--color-accent-magenta: #FF00FF;
--color-accent-gold: #C4A369;
--color-text-primary: #FFFFFF;
--color-text-secondary: #999999;
--color-status-active: #00D9FF;
--color-status-idle: #666666;
--color-status-error: #FF4444;
```

### Layout Grid
```
┌────────────────────────────────────┐
│ ProfileCarousel (Full Width)        │
├────────────────┬──────────┬────────┤
│ Sidebar (240px)│ Detail   │ Graph  │
│                │ (360px)  │ (flex) │
│                │          │        │
└────────────────┴──────────┴────────┘
```

### Responsive Breakpoints
- **Desktop**: Full 3-column (1200px+)
- **Tablet**: 2-column, sidebar in drawer (768px-1199px)
- **Mobile**: 1-column, stacked (< 768px)

## Usage Example

```tsx
import React, { useState } from 'react';
import { AgentNetworkDashboard } from '@/components/AgentNetwork';

export default function AgentNetworkPage() {
  return (
    <div>
      <AgentNetworkDashboard />
    </div>
  );
}
```

## Data Structure

### Agent Node
```typescript
interface AgentNode {
  id: string;           // Unique identifier
  name: string;         // Agent name
  type: RingType;       // 'hub' | 'ring1' | 'ring2' | 'ring3' | 'ring4'
  role: string;         // Role label (e.g., "Data Agent")
  status: StatusType;   // 'active' | 'idle' | 'error'
  connections: string[]; // Array of connected agent IDs
}
```

### Profile
```typescript
interface Profile {
  id: string;
  name: string;
  imageUrl: string;
  gradient: 'red' | 'magenta' | 'orange' | 'yellow';
  isStory?: boolean;
}
```

### Agent Card Data
```typescript
interface AgentCardProps {
  id: string;
  category: string;       // e.g., "TECH"
  title: string;          // e.g., "Knowledge Hygiene"
  description: string;
  ladder: {
    humanLed: string;
    humanAssisted: string;
    fullyAutonomous: string;
  };
  humanRole: string;      // Description of human's role
  doneBy: {
    agent: string;        // Agent name
    type: string;         // "AI agent" or role type
    ratio?: string;       // e.g., "1:1"
  };
  sop: Array<{
    step: number;
    description: string;
  }>;
  selected?: boolean;
  onClick?: () => void;
}
```

## Styling

Each component has a `.module.css` file with:
- Component-specific styles
- Dark theme colors (#050607 background)
- Neon accents (#00D9FF cyan, #FF00FF magenta)
- Responsive utilities
- Hover/active states

### CSS Modules
- `AgentNetworkDashboard.module.css` - Main layout
- `AgentNetworkGraph.module.css` - Canvas graph
- `AgentCard.module.css` - Card styling
- `ProfileCarousel.module.css` - Carousel styling

## Performance Considerations

- **Canvas Rendering**: Uses native Canvas API for performance
- **Lazy Loading**: Detail panels load on demand
- **Memoization**: Components use React.memo where appropriate
- **Debounced Updates**: Hover/interaction handlers are throttled

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Future Enhancements

- [ ] Real-time agent status updates via WebSocket
- [ ] Drag-to-pan graph interactions
- [ ] Scroll-to-zoom graph
- [ ] Agent filtering/search
- [ ] Connection animation
- [ ] Export network as SVG
- [ ] Agent performance metrics
- [ ] SOP execution history

## Integration

Add to main dashboard:

```tsx
import { AgentNetworkDashboard } from '@/components/AgentNetwork';

export default function Dashboard() {
  return (
    <div>
      <h1>WISE² Agent Network</h1>
      <AgentNetworkDashboard />
    </div>
  );
}
```

## File Structure

```
src/components/AgentNetwork/
├── AgentNetworkDashboard.tsx
├── AgentNetworkDashboard.module.css
├── AgentNetworkGraph.tsx
├── AgentNetworkGraph.module.css
├── AgentCard.tsx
├── AgentCard.module.css
├── ProfileCarousel.tsx
├── ProfileCarousel.module.css
├── index.ts
└── README.md
```

## Resources

- **Design System**: `docs/AGENT_NETWORK_DESIGN_SYSTEM.md`
- **Source Video**: `/Users/danielwise/Downloads/ScreenRecording_10-03-2026 19-06-42_1.MP4`
- **Frames**: Extracted to `scratchpad/frame_*.jpg`
