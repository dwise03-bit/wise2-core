# WISE TOUCH - Organized Chaos Command Center

A premium SaaS operating system for controlling your entire business. Think Apple, Linear, Palantir, and Tesla UI combined with cyberpunk industrial aesthetic.

## Overview

WISE TOUCH is a comprehensive dashboard and control center that brings together:

- **Dashboard** — Real-time business metrics, KPIs, and system status
- **AI Intelligence** — Multi-model AI system (Claude, GPT-4, local Ollama)
- **Business Module** — CRM, invoicing, customers, appointments, marketing
- **Deployments** — Docker containers, Kubernetes, service orchestration
- **Infrastructure** — Server monitoring, Raspberry Pi control, system resources
- **Cyber Security** — Threat monitoring, compliance, security alerts
- **Communications** — Email, SMS, Discord, Slack integration
- **Analytics** — Beautiful charts, live graphs, KPIs
- **Projects** — Kanban, timeline, files, Git integration
- **Automation** — Node-RED, n8n, cron jobs, AI agents

## Tech Stack

- **Next.js 16** — React 19 app framework
- **React 19** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Recharts** — Data visualization
- **Socket.io** — Real-time communication
- **Lucide React** — Beautiful icons

## Design System

### Colors

- **Primary Background**: `#050505` (pure black)
- **Secondary Panels**: `#111111`
- **Cards**: `#1A1A1A`
- **Chrome/Text**: `#9CA3AF`
- **Electric Blue Accent**: `#0094FF`
- **Status Good**: `#10B981`
- **Status Warning**: `#F59E0B`
- **Status Critical**: `#EF4444`

### Typography

- **Display**: 3.5rem, Black, -0.02em spacing
- **Heading**: 2rem, Bold, -0.01em spacing
- **Subheading**: 1.25rem, Semibold
- **Body**: 0.875rem, Regular, 1.5 line height
- **Caption**: 0.75rem, Medium

### Components

- **HUD Panels** — Glass-morphic panels with blue glow
- **Stat Cards** — Metric display with trends
- **Charts** — Area, bar, line, pie charts
- **Status Indicators** — Online/Offline/Warning states
- **Animated Borders** — Electric blue glowing borders

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
cd wise-touch
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and URLs.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home
│   ├── ai/                # AI page
│   ├── deployments/       # Deployments page
│   ├── infrastructure/    # Infrastructure page
│   └── ...
├── components/
│   ├── layout/            # Sidebar, Topbar, MainLayout
│   ├── common/            # Cards, HUDPanel, StatCard
│   ├── dashboard/         # Dashboard components
│   ├── ai/                # AI components
│   ├── business/          # Business module components
│   └── infrastructure/    # Infrastructure components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and constants
│   └── design-tokens.ts   # Color, spacing, animation tokens
├── services/              # API and external services
├── store/                 # State management (Zustand)
├── styles/                # Global styles
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Key Features

### Dashboard
- Real-time metrics and KPIs
- Business status overview
- Revenue charts
- Customer distribution
- Deployment load monitoring
- System status indicators
- Active alerts
- AI suggestions

### AI Intelligence Center
- Multi-model support (Claude, GPT-4, Ollama)
- Real-time chat interface
- Token usage tracking
- Model latency monitoring
- Prompt library
- Cost estimation

### Deployments
- Container status monitoring
- CPU/Memory tracking
- Service orchestration
- Restart/Stop/Start controls
- Deployment history
- 24-hour load charts

### Infrastructure
- Server monitoring
- Raspberry Pi control
- Real-time metrics
- Temperature monitoring
- SSH access
- Reboot controls
- System resource tracking

## Customization

### Changing Colors

Edit `src/lib/design-tokens.ts` or `tailwind.config.ts`:

```typescript
// Change primary accent color
const COLORS = {
  blue: {
    electric: '#0094FF',  // Your color here
    light: '#5BC0FF',
    dark: '#0056CC',
  },
}
```

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add `page.tsx` with your component
3. Update sidebar navigation in `src/components/layout/Sidebar.tsx`

### Custom Hooks

Add reusable hooks in `src/hooks/`:

```typescript
export function useMetrics() {
  const [metrics, setMetrics] = useState(null)
  // Your hook logic
  return metrics
}
```

## Performance

- **Image Optimization** — Next.js automatic image optimization
- **Code Splitting** — Automatic route-based splitting
- **CSS-in-JS** — Tailwind CSS for optimal file sizes
- **Animation Performance** — GPU-accelerated Framer Motion
- **Real-time Updates** — Socket.io for efficient WebSocket communication

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t wise-touch .
docker run -p 3000:3000 wise-touch
```

### Self-Hosted

```bash
npm run build
npm start
```

## Contributing

This is a premium SaaS operating system. Design and feature consistency are critical.

Before adding features:
1. Review the design system in `src/lib/design-tokens.ts`
2. Use existing components from `src/components/common/`
3. Follow TypeScript strict mode
4. Ensure responsive design at all breakpoints
5. Test animations on lower-end devices

## License

Proprietary — WISE² Organization

## Support

For issues, feature requests, or questions:
- Email: support@wisetouch.io
- Docs: https://docs.wisetouch.io

---

**Built by** Daniel Wise  
**Version** 1.0.0  
**Status** Production Ready  
**Last Updated** July 2026

> "Knowledge is the superpower" — WISE² Philosophy
