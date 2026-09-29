# WISE² Core — Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-07-11

### Added

#### WISE² Sound Labs Website
- Complete Sound Labs service page at `/sound-labs` route
- 10 production-ready React components with Framer Motion animations:
  - **SoundLabsHero** — Cinematic hero with animated waveforms
  - **AudioShowcase** — Interactive demo player with filters
  - **OutcomeGrid** — Four value proposition cards
  - **PackageSelector** — Pricing packages (Starter/Business/Premium/Monthly)
  - **DeliverablesSignalChain** — Service deliverables visualization
  - **ProductionJourney** — Five-step production process
  - **AudienceGrid** — Nine target audience segments
  - **SoundLabsFAQ** — Nine expandable FAQ items
  - **ProjectIntake** — Lead capture form with 10 fields
  - **SoundLabsFinalCTA** — End-page call-to-action
- Editable content configuration (`src/lib/sound-labs-data.ts`)
- Full responsive design (320px–1440px+)
- WCAG accessibility compliance
- SEO metadata with Open Graph data
- Enterprise visual identity (neon blue, chrome text, HUD panels)

#### Interactive Deployment Infrastructure
- **install-sound-labs.sh** — 8-step interactive installer
  - Prerequisite checks (SSH, Docker, Git)
  - Configuration wizard with validation
  - SSH connection verification
  - Docker image building
  - Container deployment & health checks
  - Config auto-save for reuse
  - Post-install summary with browser launch
- **DEPLOY_WEBSITE.sh** — Quick redeployment script
  - Automated code pull, build, and deploy
  - Verification checks
- **setup-nginx.sh** — Nginx reverse proxy configuration
  - Domain routing setup
  - SSL/HTTPS preparation

#### Documentation
- **INSTALLATION_INDEX.md** — Master overview of all tools
- **INSTALLER_README.md** — Detailed installation guide + troubleshooting
- **FIX_WISE2NET.md** — Domain setup & nginx configuration  
- **SOUND_LABS_GUIDE.md** — Features, editing guide, integration tasks
- **INSTALLER_SUMMARY.txt** — Quick start reference
- **ENTERPRISE_MIGRATION_PLAN.md** — Phase-based enterprise migration strategy

#### Infrastructure & DevOps
- Updated `docker-compose.prod.yml` with:
  - Website service (wise-touch) — Port 3001
  - API service — Port 3101
  - Dashboard — Port 3000
  - PostgreSQL with health checks
  - Redis cache
  - Network isolation (wise2-network)
- Dockerfile for wise-touch website:
  - Multi-stage builds
  - Node.js 20-alpine base
  - Production-optimized build
  - Auto-restart on failure
- Fixed port mappings and service dependencies

#### Enterprise Standards
- **CODEOWNERS** — Code ownership definitions
- Standardized repository structure
- Prepared for enterprise organization migration

### Changed

#### Next.js Website
- Fixed TypeScript syntax errors in Sound Labs components
- Corrected apostrophe escaping in data configuration
- Improved Docker build process
- Enhanced sidebar navigation with Sound Labs link
- Updated layout components for better integration

#### Docker & Deployment
- Simplified docker-compose configuration for clarity
- Improved service health checks
- Better error handling in deployment scripts
- Enhanced logging and monitoring hooks

### Fixed

#### TypeScript & Build Issues
- Fixed quote escaping in OutcomeGrid component (apostrophes in strings)
- Fixed sound-labs-data.ts string formatting
- Resolved Turbopack timeout issues on ARM systems
- Fixed null-check error in wiseos.ts socket handling

#### Deployment
- Fixed Dockerfile to properly handle pnpm workspace resolution
- Corrected docker-compose.prod.yml merge conflicts
- Fixed port mappings (3001:3000 for website)
- Added proper network configuration

### Security
- Added security scanning recommendations
- Prepared for Dependabot integration
- Documented secrets handling in deployment

### Infrastructure
- Added nginx reverse proxy configuration
- Prepared SSL/HTTPS setup with Let's Encrypt
- Implemented health checks for all services
- Added monitoring hooks for deployment tracking

---

## [1.0.0] - 2026-07-11

### Initial Release
- WISE² Sound Labs website deployed to production
- Interactive installer for automated deployment
- Complete documentation suite
- Docker-based deployment infrastructure
- Enterprise-ready repository structure

---

## Deployment Status

### ✅ Production Services
- **API Server** — Deployed (Port 3101)
- **Dashboard** — Deployed (Port 3000)
- **Website (Sound Labs)** — Deployed (Port 3001)
- **Database** — PostgreSQL running
- **Cache** — Redis operational
- **DNS** — wise2.net configured → 173.208.147.165

### 🟡 Pending Setup
- Nginx reverse proxy (domain routing)
- SSL/HTTPS configuration
- Form backend integration
- Real audio demos

---

## Next Steps

1. Complete enterprise repository standardization
2. Audit code quality and dependencies
3. Migrate to enterprise GitHub organization
4. Set up comprehensive CI/CD pipelines
5. Implement monitoring and alerting
6. Document all APIs and services

---

## Links

- [Installation Guide](INSTALLER_README.md)
- [Sound Labs Guide](wise-touch/SOUND_LABS_GUIDE.md)
- [Enterprise Migration Plan](ENTERPRISE_MIGRATION_PLAN.md)
- [Deployment Status](DEPLOYMENT_STATUS.md)

---

**Repository:** wise2-core  
**Organization:** WISE²  
**License:** All rights reserved  
**Maintained By:** WISE² Development Team
