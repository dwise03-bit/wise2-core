# Dashboard Service

Modern web dashboard for Wise² Core built with Next.js

## Overview

The Dashboard is the primary user interface for Wise² Core, providing:
- Real-time system monitoring
- User management interface
- Configuration and settings
- Analytics and reporting
- Responsive design (desktop/tablet/mobile)

## Technology Stack

- **Framework**: Next.js 16.2+
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

```bash
npm install
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

## Deployment

Runs on port 3000 in production (mapped to 3001 externally via Traefik).

## Architecture

- Pages in `app/` (Next.js 16 App Router)
- Components in `components/`
- API calls via `/app/api/`
- Styling with Tailwind CSS

---

**Service Version**: 2.0 (Latest)
**Owner**: Frontend Team
