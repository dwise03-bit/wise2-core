# Hermes Website Builder — Integration Guide

Hermes has been fully integrated into wise2. This document explains all access points and usage.

## Overview

Hermes automates website creation with 5 core capabilities:
- **Design-to-Code** — Convert screenshots → HTML/CSS
- **Site Generator** — Build complete websites from specs
- **Component Scaffolding** — Auto-generate reusable components
- **Deployment** — Deploy to Vercel, Netlify, GitHub Pages, VPS
- **Optimization** — Image compression, font subsetting, CSS/JS minification

---

## 1. Discord Bot Access

### Command
```
!website [subcommand]
```

### Subcommands

| Command | Purpose |
|---------|---------|
| `!website` | Show help menu |
| `!website status` | Check Hermes service health |
| `!website jobs` | List recent build jobs |
| `!website help` | Full documentation |
| `!website api` | API endpoint reference |

### Example
```
!website help
```
→ Returns full Hermes documentation with features, web interface URL, and API docs link

---

## 2. REST API Access

### Base URL
```
/api/v1/hermes
```

### Authentication
All endpoints except `/status` require Bearer token authentication.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/hermes/jobs
```

### Public Endpoints

#### GET `/api/v1/hermes/status`
Check service health (no auth required)

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "hermes-website-builder",
    "status": "operational",
    "capabilities": [...],
    "version": "1.0.0",
    "uptime": 12345
  }
}
```

#### GET `/api/v1/hermes/docs`
Full API documentation (no auth required)

### Protected Endpoints

#### GET `/api/v1/hermes/jobs`
List all build jobs (last 50, most recent first)

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/hermes/jobs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "jobs": [
      {
        "id": "hermes-1721234567890-abc123",
        "type": "design-to-code",
        "status": "processing",
        "createdAt": "2026-07-17T12:00:00Z",
        "updatedAt": "2026-07-17T12:00:05Z"
      }
    ]
  }
}
```

#### GET `/api/v1/hermes/jobs/:id`
Get specific job details

#### POST `/api/v1/hermes/design-to-code`
Convert design screenshot to HTML/CSS

**Body Parameters:**
- `imageUrl` (string, optional) — URL to design image
- `imageBase64` (string, optional) — Base64-encoded image data
- `format` (string) — `html-css` | `react` | `vue` (default: `html-css`)
- `responsive` (boolean) — Generate responsive design (default: `true`)

#### POST `/api/v1/hermes/site-generator`
Generate complete website from specification

**Body Parameters:**
- `spec` (string, optional) — Markdown specification document
- `name` (string) — Project name (default: `my-website`)
- `pages` (array) — List of page names
- `designTokens` (object, optional) — Custom design tokens

#### POST `/api/v1/hermes/component`
Generate a reusable UI component

**Body Parameters:**
- `description` (string, required) — Component description
- `type` (string) — `button` | `card` | `form` | `modal` | etc
- `framework` (string) — `vanilla` | `react` | `vue` (default: `vanilla`)

#### POST `/api/v1/hermes/deploy`
Deploy website to hosting provider

**Body Parameters:**
- `target` (string, required) — `vercel` | `netlify` | `github-pages` | `vps`
- `domain` (string, optional) — Custom domain
- `credentials` (object) — Provider-specific credentials
- `sslEnabled` (boolean) — Enable SSL (default: `true`)

---

## 3. Web Interface

A dedicated web app for Hermes website builder is available:
- **Path:** `http://localhost:3000/hermes` (when deployed)
- **Features:**
  - Visual design-to-code converter
  - Spec → website generator wizard
  - Component gallery and generator
  - Job history and results
  - Code editor and preview

---

## 4. File Locations

| Component | Path |
|-----------|------|
| Bot commands | `/services/bot/index.js` |
| API routes | `/services/api/src/routes/hermes.ts` |
| Server setup | `/services/api/src/server.ts` |
| Agent definition | `~/.claude/agents/hermes-website-builder.md` |

---

## 5. Testing

### Test Discord Bot
```bash
!website help
!website status
!website api
```

### Test API Status
```bash
curl http://localhost:3000/api/v1/hermes/status
```

### Test Full Flow
```bash
# 1. Create job
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/design.png"}' \
  http://localhost:3000/api/v1/hermes/design-to-code

# 2. Check status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/hermes/jobs/{jobId}
```

---

**Hermes is now accessible via Discord bot, REST API, and web interface.**
