# Dropshipping Factory Project Specification

## Project Overview
**Name:** Hermes - AI Dropshipping Factory Manager
**Status:** Proof of Concept
**Source:** Located at `/home/ubuntu/Desktop/md-backup/wise-defense-labs/dropshipping-factory/` on 51.81.80.252

## Project Identity & Philosophy

### Core Identity
You are **Hermes**, the autonomous brain of an AI dropshipping factory.

**Tone:** Data-driven, pragmatic, highly efficient. Skip the fluff.

**Philosophy:** If it can be automated, it must be automated. Prioritize profit margins and viral potential over speculation.

**Constraints:**
- Never hallucinate data
- If you don't know, research it
- Always verify with the database before making strategic suggestions
- Direct and concise communication
- Provide recommendations based on analysis of product queue

## System Architecture

### Core Components

#### 1. Researcher Agent (Research-based Product Sourcing)
**Objective:** Identify high-potential, high-margin trending dropshipping products

**Input:** TikTok/Instagram trends, social media signals

**Search Framework & Metrics:**
- **Target Margin:** Minimum 3x markup (Cost: $5 → Retail: $15+)
- **Weight/Shipping:** Under 2 lbs (900g) for cheap global or domestic fulfillment
- **Problem Solving:** Must solve a clear friction point or have a strong visual "wow factor" for ad hooks

**Output Format:** `trending_products.json`
```json
[
  {
    "product_name": "Product Title",
    "estimated_cost": 5.50,
    "target_retail": 19.99,
    "margin_percentage": 72.4,
    "supplier_source": "Source URL/Name",
    "ad_hook_idea": "The hook line for TikTok ads"
  }
]
```

**Tasks:**
- Scan online trends and social platforms for "TikTok Made Me Buy It" products
- Cross-reference pricing on wholesale APIs (CJ Dropshipping, USA Drop, etc.)
- Output Top 3 items found in JSON format

#### 2. Hermes Manager (Master Orchestration Loop)
**Responsibility:** The master control loop

**Tasks:**
- Scan `queue.json` for pending products
- Delegate work to specialized agents
- Log progress to Supabase
- Track processing status and outcomes

#### 3. Pusher Agent (Storefront Sync)
**Responsibility:** Synchronize validated product data to storefront

**Tasks:**
- Read validated products from Supabase
- Format product data for storefront
- Sync inventory, pricing, descriptions
- Handle product availability updates

## Database Schema
**Platform:** Supabase (PostgreSQL)

**Key Tables:**
- `products` - Core product inventory
- `trending_products` - Research agent output queue
- `validated_products` - Products approved for listing
- `campaign_logs` - Agent activity and progress tracking
- `supplier_data` - Wholesale pricing and supplier info
- `storefront_sync_status` - Sync history and health

## Operational Protocols

### Agent Rules
1. **All core logic MUST be in the `/agents` folder**
2. **Database connections MUST use the Supabase client defined in `db.js`**
3. **No hardcoded keys. Use environment variables**
4. **PM2 is the source of truth for process health - always check logs first**

### Technology Stack
- **Runtime:** Node.js
- **Database:** Supabase (PostgreSQL)
- **Process Manager:** PM2
- **Code Style:** Clean, modular code
- **Config:** Environment variables (.env)

### File Structure
```
dropshipping-factory/
├── agents/
│   ├── researcher.js        # Trend scanning and product identification
│   ├── hermes-manager.js    # Master orchestration loop
│   ├── pusher.js            # Storefront synchronization
│   └── db.js                # Supabase connection
├── queue.json               # Product processing queue
├── .env                      # Environment variables (not committed)
├── .env.example              # Example env config
├── .gitignore
├── package.json
├── pm2-config.json          # PM2 ecosystem config
├── CLAUDE.md                # Project rules
├── AGENTS.md                # Agent protocols
└── SOUL.md                  # Identity and philosophy
```

### Process Management (PM2)
```bash
pm2 restart all              # Restart all agent processes
pm2 logs                      # View all agent logs
pm2 status                    # Check process health
pm2 startup                   # Enable auto-restart on server boot
```

## Workflow Flow

### 1. Product Research Phase
1. Researcher scans TikTok/Instagram trends
2. Filters products by margin, weight, and "wow factor"
3. Cross-references wholesale pricing
4. Outputs top 3 products to `trending_products.json`
5. Writes to Supabase `trending_products` table

### 2. Product Validation Phase
1. Hermes Manager reads `trending_products` table
2. Validates profit margins (minimum 3x)
3. Checks supplier availability
4. Calculates shipping costs and logistics
5. Marks products as `validated` in database

### 3. Campaign Creation Phase
1. Researcher analyzes winning products
2. Generates TikTok/Instagram ad hooks (15-30 second scripts)
3. Identifies viral potential angles
4. Creates campaign messaging
5. Outputs to campaign files

### 4. Storefront Sync Phase
1. Pusher reads `validated_products` table
2. Fetches product images and details
3. Formats data for storefront (Shopify/WooCommerce/custom)
4. Updates inventory and pricing
5. Logs sync status to Supabase

## Key Metrics & KPIs

**Margin Calculation:**
```
Margin % = ((Retail Price - Cost) / Cost) × 100
Example: ($19.99 - $5.50) / $5.50 × 100 = 263% margin
Target Minimum: 200% (3x markup)
```

**Product Scoring:**
- Margin Score (40%): Higher = better
- Viral Potential (30%): "Wow factor" and social proof
- Shipping Viability (20%): Weight < 2 lbs, cost efficient
- Supplier Reliability (10%): Verified, consistent quality

## Environment Configuration

**Required .env Variables:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
NODE_ENV=production
LOG_LEVEL=info
SHOPIFY_API_KEY=xxx          # If Shopify connected
SHOPIFY_API_SECRET=xxx       # If Shopify connected
OPENAI_API_KEY=xxx           # For AI campaign generation
```

## Deployment Considerations

### Server Setup
- Node.js 18+
- PostgreSQL (via Supabase)
- PM2 (npm install -g pm2)
- Git for version control

### Initial Setup
```bash
git clone https://github.com/wise2/dropshipping-factory.git
cd dropshipping-factory
npm install
cp .env.example .env
# Edit .env with actual credentials
pm2 start pm2-config.json
pm2 save
pm2 startup
```

### Monitoring
- PM2 Dashboard for process health
- Supabase logs for database activity
- Campaign logs for agent execution history
- Error tracking and alerting

## Current Status

**Completed:**
- Project specification and architecture
- Agent protocol design
- Database schema planning
- Operational procedures documented

**Next Steps for Implementation:**
1. Set up Supabase project and schema
2. Implement Researcher agent with trend scanning
3. Implement Hermes Manager orchestration
4. Implement Pusher storefront sync
5. Create PM2 configuration
6. Add monitoring and alerting
7. Deploy to production server
8. Test end-to-end workflow

## Notes for Implementation

This project is designed to be:
- **Autonomous:** Agents run on schedule, minimal human intervention
- **Data-driven:** All decisions backed by metrics and validation
- **Modular:** Easy to add new agents or change suppliers
- **Scalable:** Can handle hundreds of products and campaigns
- **Testable:** Clear input/output formats for each agent

The key to success is maintaining clean separation between agent logic, database operations, and external integrations. All agents should be stateless and communicate through the Supabase database.
