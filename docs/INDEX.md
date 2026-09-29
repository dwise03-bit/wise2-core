# WISE² Core Documentation Index

## Getting Started
- [README](./README.md) - Project overview and quick start
- [Development Setup](./guides/DEVELOPMENT_SETUP.md) - Local development environment
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Architecture & Design
- [Architecture Overview](./architecture/ARCHITECTURE.md) - System design and components
- [Architectural Decisions](./architecture/DECISIONS.md) - Key technical decisions and rationale

## API & Integration
- [API Reference](./api/REFERENCE.md) - Complete API documentation
- [Authentication](./api/authentication.md) - Auth mechanisms and token handling
- [Database Schema](./api/database.md) - Data models and relationships

## Operations & Deployment
- [Deployment Guide](./operations/DEPLOYMENT.md) - How to deploy to different environments
- [Environment Configuration](./operations/environment.md) - Setting up env variables
- [Security Policy](./SECURITY.md) - Security guidelines and best practices
- [Changelog](./CHANGELOG.md) - Version history and release notes

## Development Guides
- [TypeScript Setup](./guides/typescript.md) - Type safety and compilation
- [Testing](./guides/testing.md) - Unit and integration tests
- [Linting & Formatting](./guides/code-quality.md) - Code standards

## Directory Structure

```
/docs
  ├── README.md              # Main documentation entry
  ├── CHANGELOG.md           # Version history
  ├── CONTRIBUTING.md        # Contribution guidelines
  ├── SECURITY.md            # Security policy
  ├── INDEX.md               # This file
  ├── /architecture          # System design docs
  │   ├── ARCHITECTURE.md    # System overview
  │   └── DECISIONS.md       # Technical decisions
  ├── /api                   # API documentation
  │   ├── REFERENCE.md       # API endpoints
  │   ├── authentication.md  # Auth guide
  │   └── database.md        # Data model
  ├── /operations            # Deployment & ops
  │   ├── DEPLOYMENT.md      # Deployment guide
  │   └── environment.md     # Environment setup
  └── /guides                # Developer guides
      ├── DEVELOPMENT_SETUP.md
      ├── typescript.md
      ├── testing.md
      └── code-quality.md
```

## Quick Links

### For Developers
- Start here: [Development Setup](./guides/DEVELOPMENT_SETUP.md)
- Before committing: [Code Quality](./guides/code-quality.md)
- Writing tests: [Testing Guide](./guides/testing.md)

### For Operators
- Deploy to production: [Deployment Guide](./operations/DEPLOYMENT.md)
- Configure environment: [Environment Setup](./operations/environment.md)
- Security: [Security Policy](./SECURITY.md)

### For Architects
- System design: [Architecture](./architecture/ARCHITECTURE.md)
- Why decisions: [Decisions Log](./architecture/DECISIONS.md)
- API design: [API Reference](./api/REFERENCE.md)

## Last Updated
Generated: 2026-07-12
