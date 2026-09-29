# WISE TOUCH // PROMPT SHOP™

AI-native prompt builder with construction/fabrication metaphors.

## Overview

WISE TOUCH Prompt Shop is a responsive web application for creating, mixing, and generating custom AI prompts. The app features a futuristic construction-themed interface with the Build Foreman assistant character.

## Features

- **System Bays Browser** - Browse and select from 12+ prompt systems across 5 categories
- **Hybrid Mixer** - Adjust system influence percentages (must total exactly 100%)
- **Visual DNA Assembly** - Control line style, color palette, lighting, mood, and more
- **Build Management** - Save, load, duplicate, remix, and version your builds
- **Blueprints Marketplace** - Discover and purchase community-created prompts
- **Supply Depot** - Unlock additional systems with packs
- **Build Foreman** - Interactive mascot with contextual reactions
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm or npm

### Installation

```bash
# Install dependencies from root
pnpm install

# Navigate to prompt-shop
cd apps/prompt-shop

# Run development server
pnpm run dev
```

Visit `http://localhost:3002` in your browser.

### Build for Production

```bash
pnpm run build
pnpm run start
```

## Project Structure

```
src/
├── app/                    # Next.js pages and routes
│   ├── page.tsx           # Dashboard / Build Floor
│   ├── systems/           # System Bays / Prompt Browser
│   ├── mixer/             # Hybrid Mixer
│   ├── builds/            # My Builds / Project Yard
│   ├── blueprints/        # Blueprints Marketplace
│   ├── packs/             # Supply Depot
│   └── marketplace/       # Marketplace hub
├── components/            # React components
│   ├── AppShell.tsx
│   ├── ForemanAssistant.tsx
│   ├── InfluenceMixer.tsx
│   ├── SystemBays.tsx
│   └── ...
├── data/                  # Mock data and fixtures
│   └── mockSystems.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   └── store.ts           # Zustand store
└── styles/                # Global styles
    └── globals.css
```

## Design System

### Brand Colors

- **Laser Orange**: `#FF5C00` (Primary accent)
- **Secondary Orange**: `#FF9D00`
- **Burnt Orange**: `#B93400`
- **Machine Black**: `#070707`
- **Graphite**: `#151515`
- **Gunmetal**: `#34383D`
- **Blueprint White**: `#F2F0EA`
- **Cyan**: `#00D9FF` (Technical accents)
- **WISE Green**: `#00FF00` (Ecosystem status)

### UI Language

- Construction/fabrication metaphors
- Blueprint grids and laser measurement lines
- Industrial panels and hazard bands
- Modular machine aesthetics
- Work-light glow effects

## Foreman Assistant

The Build Foreman is an interactive mascot with contextual reactions:

- **Idle**: "Aight, lemme see the blueprints."
- **Low Input**: "Three words? What am I buildin' here, a shed?"
- **Measuring**: "Boss, I need measurements. Gimme somethin' to work with."
- **Perfect Mix**: "There we go. Hundred percent. Now we're up to code."
- **Over Mix**: "Whoa, Picasso. We got [X]%. Math ain't optional on this job."
- **Generating**: "Stand back. Sparks are flyin'."
- **Complete**: "Built. Inspected. Beautiful. Next."

## Influence Mixer

The core interaction: adjust system percentages to total exactly 100%.

- Real-time validation
- Visual progress indicator
- Contextual Foreman reactions
- Save/load/reset functionality
- Visual DNA secondary controls

## API Integration

Currently uses mock data. To integrate with backend:

1. Replace `mockSystems` with API call to `/api/v1/systems`
2. Connect save/load to `/api/v1/builds/{id}`
3. Wire generation to `/api/v1/prompts/generate`
4. Integrate marketplace to `/api/v1/marketplace`

## Deployment

### Docker

```bash
docker build -f apps/prompt-shop/Dockerfile -t wise2-prompt-shop .
docker run -p 3002:3002 wise2-prompt-shop
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up prompt-shop
```

The app is available at `https://wise2.net/prompt-shop` when deployed with nginx reverse proxy.

## Development Guidelines

- Keep components small and focused
- Use TypeScript for type safety
- Respect `prefers-reduced-motion` for animations
- Test responsive behavior on mobile devices
- Follow construction/industrial visual metaphors
- Maintain Foreman personality in messaging

## TODOs

- [ ] Backend integration for systems API
- [ ] User authentication and sessions
- [ ] Persistent build storage (database)
- [ ] AI prompt generation adapter
- [ ] Image generation integration
- [ ] Marketplace payment processing (Stripe)
- [ ] Creator profiles and uploads
- [ ] Rating and review system
- [ ] Search and filtering
- [ ] Advanced analytics
- [ ] Mobile app variant

## License

Proprietary - WISE² Genesis
