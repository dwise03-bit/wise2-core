# Lexi's Inks × WISE² Demo

A complete, production-ready business operating system demo for a custom pen business built with Next.js, Tailwind CSS, and localStorage for demo data.

## 🎨 Features

### Public Site
- ✅ **Landing Page** - Hero with pen showcase, value props, CTA
- ✅ **Gallery** - Browse custom pen designs  
- ✅ **Custom Order Builder** - 3-step order form with pen colors, toppers, themes, personalization
- ✅ **Order Confirmation** - Real-time order confirmation page
- ✅ **About & Contact** - Brand storytelling pages
- ✅ **Track Order** - Look up order status by email/ID

### Business Dashboard (Owner Portal)
**Login: `demo@lexisinks.com` / Password: `demo123`**

- ✅ **Overview Dashboard** - Revenue, order count, customer metrics, recent orders
- ✅ **Orders Management** - Full order list with filtering by status (new, pending-deposit, in-progress, ready, completed)
- ✅ **Customer CRM** - All customers, order history, revenue per customer, VIP status tracking
- ✅ **Inventory Tracker** - Track pens, beads, toppers, crystals, charms, packaging with low-stock alerts
- ✅ **Growth Automations** - Pre-configured message sequences (order received, deposit due, order ready, review request)
- ✅ **AI Assistant (Lexi)** - AI-powered suggestions for captions, thank-you messages, product descriptions, follow-up ideas
- ✅ **Business Settings** - Profile, billing, team management

## 📊 Demo Data

The app ships with fully seeded demo data:
- **86 total orders** with varied statuses
- **15+ customers** with order history
- **$2,450+ revenue** metrics
- **Realistic inventory** across all product types
- **Automated message suggestions** for common scenarios

## 🚀 Quick Start

### Installation

```bash
cd apps/lexis-inks-demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (or specify `PORT=3001 npm run dev` for port 3001).

### Demo Flow

1. **Visit the homepage** → Explore pen gallery and value props
2. **Click "Design Your Pen"** → 3-step custom order builder
   - Step 1: Customer info + personalization
   - Step 2: Pen color, topper, theme selection
   - Step 3: Quantity, special notes, submit
3. **Confirm order** → Order confirmation page appears
4. **Go to Dashboard** → Login with `demo@lexisinks.com` / `demo123`
5. **See the order** → New order appears in Orders list + Customer CRM
6. **Explore features** → Inventory, Automations, AI Assistant

## 🎯 Key Pages

| Route | Purpose | Demo Access |
|-------|---------|-------------|
| `/` | Landing page | Public |
| `/gallery` | Pen showcase | Public |
| `/custom-order` | Order builder | Public |
| `/order-confirmation` | Confirmation | Public (after order) |
| `/dashboard` | Main overview | Login required |
| `/dashboard/orders` | Order management | Login required |
| `/dashboard/customers` | CRM | Login required |
| `/dashboard/inventory` | Stock tracking | Login required |
| `/dashboard/automations` | Message sequences | Login required |
| `/dashboard/ai` | Lexi AI assistant | Login required |

## 🎨 Brand Colors

- **Navy**: `#0a1f3d` (primary background)
- **Electric Blue**: `#0066ff` (primary action)
- **Cyan**: `#00d4ff` (accent glow)
- **White**: `#ffffff` (text on dark)
- **Silver**: `#e8e8e8` (accents)

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + custom brand theme
- **Data**: localStorage (demo mode - no backend needed)
- **Auth**: Simple demo login (client-side)
- **TypeScript**: Full type safety

## 🔧 Architecture

```
src/app/
├── page.tsx                 # Landing page
├── layout.tsx               # Root layout with branding
├── globals.css              # Tailwind config
├── custom-order/
│   └── page.tsx             # Order builder (3-step form)
├── order-confirmation/
│   └── page.tsx             # Order confirmation
└── dashboard/
    ├── page.tsx             # Overview dashboard
    ├── orders/page.tsx      # Orders management
    ├── customers/page.tsx   # Customer CRM
    ├── inventory/page.tsx   # Inventory tracker
    ├── automations/page.tsx # Message automation
    └── ai/page.tsx          # Lexi AI assistant
```

## 💾 Data Storage

All data is stored in **localStorage** for demo purposes:
- `orders` - Array of order objects with customer info, selections, pricing
- `customers` - Array of customer objects with contact info and VIP status
- `dashboardAuth` - Authentication token (simple flag)

On first visit, demo data is automatically seeded with 86 sample orders and 15+ customers.

## 📋 Demo Credentials

- **Email**: `demo@lexisinks.com`
- **Password**: `demo123`

## 🎬 Usage Scenarios

### Scenario 1: Customer Purchase Journey
1. Land on homepage, browse gallery
2. Click pen design to customize
3. Fill out 3-step order form
4. See confirmation with order ID
5. Can later track order status

### Scenario 2: Business Owner Check-in
1. Login to dashboard (`demo@lexisinks.com` / `demo123`)
2. See top-level metrics (revenue, orders, customers)
3. Review recent orders and their statuses
4. Check inventory levels
5. Get AI suggestions for thank-you messages
6. Set up automated follow-up sequences

### Scenario 3: Customer Relationship Management
1. View all customers with order history
2. See total revenue per customer
3. Identify VIP customers
4. Track repeat purchases
5. Plan follow-ups and campaigns

## ✅ Production Checklist

- [ ] Connect to real database (replace localStorage)
- [ ] Set up Stripe/PayPal payments
- [ ] Add email integration for automations
- [ ] Implement real authentication (Supabase Auth)
- [ ] Add file upload for product photos
- [ ] Configure email notifications
- [ ] Set up SMS/WhatsApp automations
- [ ] Add analytics/reporting
- [ ] Deploy to production hosting
- [ ] Set up backup/disaster recovery

## 🚢 Deployment

The app is ready to deploy to:
- Vercel (with `vercel deploy`)
- Netlify (with `netlify deploy`)
- Any Node.js hosting (with `npm run build && npm run start`)

Before deploying, replace localStorage with a real database backend.

## 📖 Documentation

See the Lexis Inks WISE² Master Package for:
- Brand guidelines
- Product specifications
- Business model details
- Marketing templates
- Customer journey maps

## 🤝 Support

This demo is part of the WISE² ecosystem. For more info, visit https://wise2.net

---

**Built with WISE²** — Empowering small businesses with big dreams.
