# WISE² Open WebUI Knowledge Structure

## Overview

This document outlines the WISE² shared knowledge base structure in Open WebUI v0.11.0, designed to support collaborative AI-assisted work across the business.

## Folder Hierarchy

```
WISE² Master Knowledge (Root)
├── 01 Brand & Identity
│   ├── Logo & Visual Assets
│   ├── Color System
│   ├── Typography
│   └── Brand Voice Guidelines
├── 02 Business Model
│   ├── Packages & Pricing
│   ├── Positioning
│   ├── Customer Segments
│   └── Revenue Model
├── 03 Products & Services
│   ├── Consulting Services
│   ├── Development Services
│   ├── Sound Labs Overview
│   ├── PIFF CITY
│   ├── Wise Shine
│   └── Wise Defense
├── 04 Technical Architecture
│   ├── System Overview
│   ├── API Specifications
│   ├── Database Schema
│   ├── Authentication & Authorization
│   └── Integration Points
├── 05 Deployment & Operations
│   ├── Server Setup
│   ├── Docker & Compose
│   ├── Backup & Recovery
│   ├── Health Checks
│   └── Monitoring
├── 06 Clients
│   ├── [Client Name] Projects
│   ├── Case Studies
│   ├── Testimonials
│   └── Implementation Guides
├── 07 Sales & Pricing
│   ├── Rate Cards
│   ├── Proposal Templates
│   ├── Deal Structures
│   └── Close Strategies
├── 08 Marketing
│   ├── Campaign Plans
│   ├── Content Calendar
│   ├── Landing Page Copy
│   ├── Email Templates
│   └── Social Media Guides
├── 09 Templates & Prompts
│   ├── WISE² Hermes Prompts
│   ├── Sub-Agent Prompts
│   ├── Business Audit Template
│   ├── Proposal Template
│   └── Workflow Variables
├── 10 Standard Operating Procedures
│   ├── Onboarding Checklist
│   ├── Release Process
│   ├── Incident Response
│   ├── Client Handoff
│   └── Security Procedures
├── 11 Security & Compliance
│   ├── Access Control Policy
│   ├── Data Handling
│   ├── Audit Procedures
│   └── Incident Logging
├── 12 PIFF CITY
│   ├── Vision & Strategy
│   ├── Feature Roadmap
│   ├── Content Library
│   └── Partnerships
├── 13 Wise Shine
│   ├── Service Overview
│   ├── Client Guide
│   └── Marketing Assets
├── 14 Wise Defense
│   ├── Service Overview
│   ├── Compliance Requirements
│   └── Client Resources
├── 15 Sound Labs
│   ├── Audio Production Standards
│   ├── Project Templates
│   ├── Equipment & Tools
│   └── Workflow Guides
├── 16 Jingle Lab
│   ├── Music Production Guide
│   ├── Sample Library
│   └── Client Briefs
├── 17 Podcast Music
│   ├── Production Workflow
│   ├── Music Library
│   └── Licensing Info
├── 18 Live Studio
│   ├── Setup & Configuration
│   ├── Broadcasting Guide
│   └── Technical Specs
└── 19 Archive
    ├── Completed Projects
    ├── Historical Decisions
    └── Legacy Documentation
```

## Access Permissions

### Admin Users
- Full read/write access to all folders
- Can create and modify knowledge documents
- Can manage folder permissions
- Can archive outdated documents

### Operators (WISE² Team)
- Read access to all operational folders
- Write access to procedures, templates, and case studies
- No access to security/compliance details
- No access to sensitive client data (unless approved)

### Developers
- Read access to technical architecture
- Write access to API specifications and deployment guides
- Limited access to business/client information
- Full access to code repositories and technical references

### Creative Team
- Full read/write access to marketing, Sound Labs, and PIFF CITY folders
- Read access to brand identity (locked from editing)
- Write access to campaign plans and content calendars

### Sales
- Read access to business model, pricing, and case studies
- Write access to proposal templates and deal structures
- No access to operational procedures or technical details

### Clients (where applicable)
- Read-only access to isolated client-specific folders
- No access to internal WISE² knowledge
- No cross-client visibility

## Document Types

### Reference Documents
- **Purpose**: Authoritative, rarely-changing information
- **Examples**: Brand guidelines, API specs, security policies
- **Update frequency**: Quarterly or when policy changes
- **Lock**: Prevent casual editing; require approval for changes

### Procedure Documents
- **Purpose**: Step-by-step guidance for common tasks
- **Examples**: Onboarding, release process, incident response
- **Update frequency**: As procedures change (typically monthly)
- **Lock**: Mild—team can suggest changes via comments; admin approves

### Case Studies & Project Documentation
- **Purpose**: Completed work, lessons learned, client results
- **Examples**: Project retrospectives, client testimonials, metrics
- **Update frequency**: Ongoing—added as projects complete
- **Lock**: None for team; client-sensitive data marked CONFIDENTIAL

### Prompt Library
- **Purpose**: Reusable prompts for common WISE² workflows
- **Examples**: Business audit template, proposal generator, research query
- **Update frequency**: As new workflows are discovered
- **Lock**: Community editable; admin reviews for quality

### Knowledge Base Articles
- **Purpose**: General information, how-to guides, troubleshooting
- **Examples**: "How to run a business audit", "Troubleshooting deployment issues"
- **Update frequency**: As problems are solved
- **Lock**: None; living documents with version history

## Naming Conventions

### Folders
- Use leading numbers for ordering: `01 Brand & Identity`
- Use title case with single space: `Sound Labs`
- Avoid special characters except hyphens for multi-word names: `client-contracts`

### Files
- Use title case: `Brand Voice Guidelines`
- Include date for time-sensitive docs: `2026-Q3-Campaign-Plan`
- Use version numbers for important docs: `Business Model v2.3`
- Avoid duplicate names across folders

### Metadata Tags
- `#public` — Information safe for public consumption
- `#internal` — WISE² team only
- `#client-confidential` — Marked client-specific
- `#secret` — High sensitivity, restricted access
- `#template` — Reusable workflow
- `#procedure` — Step-by-step guide
- `#reference` — Authoritative source
- `#archive` — Outdated but preserved for history

## Integration with Hermes

### Knowledge Queries
When a Hermes sub-agent needs to reference WISE² knowledge, they:
1. Query the appropriate folder(s)
2. Cite the source document
3. Mark data sensitivity appropriately
4. Update stale knowledge when found

### Knowledge Updates
When new knowledge is created:
1. Place in the appropriate folder
2. Add appropriate metadata tags
3. Link related documents
4. Notify relevant stakeholders of updates

### Knowledge Gaps
When Hermes identifies missing knowledge:
1. Create a placeholder document
2. Mark as `#incomplete`
3. Add to team inbox for prioritization
4. Route to appropriate owner for completion

## Quality Assurance

### Review Cycle
- **Monthly**: Archive outdated documents
- **Quarterly**: Review for accuracy and relevance
- **Annually**: Full audit of all folders and permissions

### Version Control
- Enable version history on all important documents
- Use git for code/technical documentation
- Use document versioning for business documents

### Broken Links and References
- Monthly check for dead links and references
- Update as systems and documentation change
- Archive references to deprecated systems

## Security Considerations

### Data Classification in Knowledge
- **PUBLIC files**: Openly shared, no sensitivity
- **INTERNAL files**: Company strategy, operations
- **CLIENT CONFIDENTIAL**: Specific client implementations, marked with project ID
- **SECRET**: Never stored in shared knowledge; use secure vault instead

### Access Audit Log
- Log who accessed sensitive documents
- Audit permissions quarterly
- Remove access when team members leave

### Backup and Recovery
- Knowledge is backed up daily with the main Open WebUI database
- Recovery is automatic; no manual action required
- Archive important decisions in git for long-term retention

## Getting Started

### For New Team Members
1. Read `01 Brand & Identity` to understand WISE² visual and verbal identity
2. Review `04 Technical Architecture` to understand system design
3. Review `10 Standard Operating Procedures` relevant to your role
4. Bookmark key reference documents for your role

### For Sub-Agents
1. Query WISE² knowledge before generating responses
2. Update knowledge when discovering new information
3. Report knowledge gaps to Hermes
4. Respect data classification and access control

### For Admins
1. Review folder structure quarterly
2. Update permissions as team composition changes
3. Archive completed projects to reduce clutter
4. Promote best practices through documentation

---

**Last Updated**: July 28, 2026  
**Version**: 1.0  
**Owner**: WISE² Platform Operations
