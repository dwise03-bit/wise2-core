# Every Day Trader - Standalone Frontend

**🚀 IMPORTANT**: This folder structure is a template. The actual deployment is hosted as a **separate independent GitHub repository**.

## Standalone Repository

**Repository**: `everydaytrader/web`  
**Domain**: everydaytrader.app  
**Status**: Ready for independent deployment

### Quick Start

```bash
# Clone the standalone repository
git clone https://github.com/everydaytrader/web.git

# Install dependencies
cd web
npm install

# Development server (port 3002)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Architecture

Every Day Trader is a completely standalone application:
- ✅ Independent GitHub repository
- ✅ Independent Next.js 14 app
- ✅ Separate deployment pipeline
- ✅ EDT branding (not WISE²)
- ✅ Own domain (everydaytrader.app)
- ✅ Independent CI/CD pipeline

### Features

- Real-time market data (Alpha Vantage + Yahoo Finance)
- AI-powered PLOT AI analysis engine
- Educational candlestick charts
- Live options flow analysis
- Paper trading planner
- Multi-symbol watchlist
- Professional dashboard UI

### API Integration

- **Market Data**: Alpha Vantage API
- **Analysis**: PLOT AI proprietary engine
- **Config**: Public/config.json

### Deployment

Hosted on:
- **Primary**: everydaytrader.app
- **Auto-deploy**: GitHub Actions on push to main
- **Server**: Independent VPS or cloud platform

### Tech Stack

- **Frontend**: Next.js 14.2.35 + React 18
- **Styling**: CSS Modules + custom animations
- **State**: React Hooks (useState, useEffect)
- **API**: Fetch API with fallback strategy
- **Build**: Next.js built-in build system

---

**Note**: This folder in wise2-core is for reference/backup. Primary development happens in the separate `everydaytrader/web` repository.
