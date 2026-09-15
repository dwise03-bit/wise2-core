# WISE² Command Center GPT — Knowledge Base Seed Content

This document contains initial knowledge base content to seed the Hermes instance and provide context to the GPT.

## About WISE²

WISE² (Wise Operating System Evolution) is an AI-native business operating system providing one synchronized experience across cloud infrastructure, VPS deployments, Raspberry Pi edge nodes, and mobile devices.

### Core Mission
Building Empires. Changing Culture. Together.

### Brand Identity
- **Primary Colors**: Dark Navy (#050607), Cyan (#00D9FF), Neon Green (#00FF7F), Gold (#C4A369)
- **Tagline**: "Building Empires. Changing Culture. Together."
- **Vision**: Intelligent tools for real-world businesses

## Key Features

### 1. Revenue Command Center
Real-time dashboard showing:
- Today's revenue metrics
- Active jobs and technicians
- Outstanding AR (Accounts Receivable)
- Margin alerts
- Business health metrics

**API Endpoints**:
- `GET /api/command-center/revenue/today` — Today's revenue
- `GET /api/command-center/jobs/today` — Active jobs
- `GET /api/command-center/techs/utilization` — Technician utilization
- `GET /api/command-center/estimates/open` — Open estimates
- `GET /api/command-center/ar/outstanding` — Outstanding AR
- `GET /api/command-center/margins/alerts` — Margin alerts

### 2. Dashboard Integration
Accessible at https://dashboard.wise2.net

Features:
- Real-time KPIs and metrics
- Technician schedules
- Call/job tracking
- Integration with voice systems
- Permission engine (role-based access control)

### 3. Discord Integration
WISE² bot provides 40+ commands across multiple categories:
- Contractor OS (13 commands)
- Academy (7 commands)
- Sales (8 commands)
- Control (12 commands)

Features:
- Rich embeds with metrics
- Action buttons for quick decisions
- Real-time alerts
- Response logging

### 4. GPT Command Center
AI-powered assistant providing:
- Business insights and recommendations
- Real-time data access
- Context-aware responses
- Integration with company systems

**Key Endpoints**:
- `GET /api/command-center/gpt/link` — GPT metadata and access URL
- `GET /api/command-center/gpt/context` — Pre-loaded business context
- `GET /api/command-center/dashboard` — Complete dashboard data

## API Documentation

### Base URL
`https://api.wise2.net`

### Authentication
All endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All responses return JSON with standard structure:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Success message if applicable",
  "timestamp": "2026-09-15T06:50:00Z"
}
```

## Database Schema

### Core Tables
- `users` — System users and administrators
- `tenants` — Multi-tenant organizations
- `jobs` — Service jobs and work orders
- `technicians` — Field service technicians
- `calls` — Customer calls and interactions
- `invoices` — Billing and revenue
- `appointments` — Scheduled appointments

## System Architecture

### Microservices
1. **API Server** (Port 3010) — NestJS backend with all business logic
2. **Dashboard** (Port 3022) — Next.js React admin interface
3. **Website** (Port 3001) — Public-facing landing site
4. **Redis** (Port 6379) — Caching and session management
5. **PostgreSQL** (Port 5432) — Primary data store

### Infrastructure
- **VPS**: 173.208.147.165 (Ubuntu 24.04)
- **Docker Compose**: Orchestrates all services
- **Nginx**: Reverse proxy and SSL termination
- **Hermes**: AI knowledge base and context engine (Port 3012)

## Common Questions

### How do I access the GPT?
1. Visit https://dashboard.wise2.net
2. Look for the GPT Widget in the dashboard
3. Click "Open GPT" to launch in a new tab
4. Or visit: https://chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4-wise2-command-center

### How does the GPT access my business data?
The GPT has access to:
- Real-time revenue and job metrics
- Technician schedules and utilization
- Customer call history
- Business health indicators
- Permission and role information

All data is provided through secure API endpoints that require authentication.

### What can the GPT help with?
- Revenue analysis and forecasting
- Business health recommendations
- Technician scheduling advice
- Customer relationship insights
- Operational efficiency analysis
- Decision support for business issues

### How is my data protected?
- All API calls require JWT authentication
- Multi-tenant isolation enforced at database level
- Data encrypted in transit (HTTPS)
- Access logged for audit trails
- Role-based access control limits data visibility

## Integrations

### Discord
WISE² bot connects to Discord for:
- Real-time notifications
- Command-based data access
- Rich embeds with metrics
- Action buttons for quick decisions

### Hermes Knowledge Base
Provides:
- Documentation and FAQs
- Contextual information for GPT
- Dynamic instruction generation
- Persistent memory for learnings

### Stripe (Future)
Payment processing for:
- Subscription management
- Invoice generation
- Revenue tracking

## Support & Contact

**Website**: https://wise2.net  
**Dashboard**: https://dashboard.wise2.net  
**API Docs**: https://api.wise2.net/api-docs  
**Discord**: [WISE² Bot](https://discord.com)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-15 | Initial GPT Command Center release |

---

**Last Updated**: 2026-09-15  
**Maintained By**: WISE² Core Team
