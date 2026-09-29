# CC Craft & Create — Quick Start Guide

**Last Updated**: 2026-08-21  
**Client**: CC Craft & Create Studio  
**Website Launch Target**: 2026-08-28 (7 days)  

---

## What You're Getting (The Full WISE² Package)

### 1. **Website** — E-commerce Site
- Custom Next.js website with CC branding
- Product catalog with 12+ products
- Shopping cart + checkout
- Stripe payment processing
- Mobile-responsive design
- SEO-optimized

### 2. **Dashboard** — Order Management
- View all orders and customer data
- Approve/manage customer proofs
- Track production status
- Analytics (sales, trends, popular products)
- Email notifications

### 3. **Creative Studio** — Design Tools
- Access to WISE² Creative Studio
- Design templates for your products
- Proof generation and export (PDF, PNG)
- Customer design upload portal

### 4. **Automation** — Workflow
- Automated email notifications (order received, proof ready, ready for pickup)
- SMS notifications (optional)
- Order status tracking (customer-facing)
- Approval workflow automation

### 5. **Analytics** — Business Intelligence
- Sales tracking
- Popular products
- Seasonal trends
- Customer lifetime value
- Revenue reports

---

## Website Structure

### Navigation
```
Home → Shop → Occasions → Business → Gallery → About CC → Contact → Cart
```

### Key Pages

| Page | Purpose | Status |
|------|---------|--------|
| **Home** | Hero, value props, featured products | TODO |
| **Shop** | All products (filterable) | TODO |
| **Occasions** | Browse by event type (birthday, memorial, etc.) | TODO |
| **Business** | B2B packages and bulk orders | TODO |
| **Gallery** | Customer showcase/testimonials | TODO |
| **About** | CC's story, contact info | TODO |
| **Order** | Custom order form | TODO |
| **Cart** | Checkout flow | TODO |

---

## Brand Identity (LOCKED)

### Colors
- **Purple** (#6D2DBD) — Primary
- **Lavender** (#B785D3) — Secondary
- **Gold** (#D4AF37) — CTA buttons
- **Dark** (#29233D) — Text
- **White** (#FFFFFF) — Background

### Typography
- **Headers**: Lora Bold
- **Body**: Poppins
- **Accents**: Great Vibes (script)

### Key Messages
- **Slogan**: "THE MATHIS: C + C = WISE — When It Comes to Crafting and Creating"
- **Tagline**: "Crafted for the Moment. Created for the Memory."
- **CTA**: "ORDER YOURS TODAY" / "SHOP NOW"

---

## Products (12-Item Catalog)

### Party & Events
1. Personalized Drink Labels
2. Chip Bags & Candy Wrappers
3. Water Bottle Labels
4. Party Packages

### Memorials & Keepsakes
5. Memorial Cards
6. Memory Boxes

### Business & Branding
7. Custom Business Labels
8. Event Branding Packages

### School & Staff Appreciation
9. Teacher Appreciation Gifts
10. Nurse Appreciation Packages

### Church & Community
11. Church Event Materials
12. Nonprofit Event Packages

**Plus**: Custom Design Service & Bulk Order Program

---

## Deployment Timeline

### Week 1: Website Launch
- **Day 1-2**: Set up project, brand colors, typography
- **Day 3**: Build home page
- **Day 4**: Build shop + product pages
- **Day 5**: Integrate Stripe
- **Day 6**: Testing & QA
- **Day 7**: LAUNCH

### Week 2: Dashboard + Automation
- Order management system
- Email notifications
- Approval workflow

### Week 3: Creative Studio Access
- Grant CC access
- Create design templates
- Set up customer design portal

### Week 4: Growth + Analytics
- Instagram integration
- Email sequences
- Analytics dashboard

---

## Important Information (To Be Provided by CC)

- [ ] CC's phone number
- [ ] CC's email address
- [ ] Business address / pickup location
- [ ] Hours of operation
- [ ] Stripe account (or set up for you)
- [ ] High-quality product photos (at least 3 per product)
- [ ] Profile photo for "About CC" section
- [ ] Backup contact info
- [ ] Social media handles (Instagram, Facebook, etc.)

---

## Domain & Hosting

**Current Setup**:
- **Host**: 173.208.147.165 (WISE² server)
- **Domain**: To be determined (cc.wise2.net or custom domain)
- **SSL**: Automatic (Let's Encrypt)
- **Backups**: Daily automated backups

**Domain Options**:
1. **cc.wise2.net** — Subdomain (easy, instant)
2. **ccraftandcreate.com** — Custom domain (point DNS to WISE²)
3. **craftandcreate.shop** — Custom domain (point DNS to WISE²)

---

## Payment Processing (Stripe)

**Setup**:
- WISE² sets up Stripe integration
- CC receives Stripe account login
- Weekly or monthly payouts to CC's bank account
- WISE² takes [TBD]% commission or flat $[TBD]/month

**How It Works**:
1. Customer adds products to cart
2. Checkout → Stripe payment form
3. Payment processes securely
4. CC receives order notification
5. Customer can track order status
6. CC ships/delivers product
7. Payout to CC's account

**Test Card** (for testing):
- Number: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

---

## Communication & Support

**Slack Channel**: `#cc-craft-create-support`  
**Email**: dwise03@gmail.com  
**Weekly Sync**: Thursdays 2pm UTC  

**Response Times**:
- Critical issues: Within 2 hours
- Normal requests: Within 24 hours
- Feedback: Within 48 hours

---

## Success Metrics (Week 1 Launch)

By 2026-08-28, we measure success by:

✅ Website live on production domain  
✅ 5+ products visible in shop  
✅ Stripe integrated and tested  
✅ First test order completed  
✅ HTTPS active + SEO meta tags  
✅ Mobile-responsive design verified  
✅ CC can log in to dashboard  

**Bonus**:
✅ First real customer order  
✅ Email notifications working  
✅ Customer tracking page working  

---

## Security & Privacy

**Your Data**:
- Customer data stored securely in PostgreSQL
- Payment data never stored (Stripe handles it)
- Daily automated backups
- HTTPS encryption on all pages
- GDPR compliant

**Your Account**:
- Password-protected admin dashboard
- Two-factor authentication (optional)
- Audit logs of all orders/changes
- Secure API keys (never exposed)

---

## Getting Started Now

### For CC:
1. **Send us**: Your contact info, product photos, profile photo
2. **Approve**: Brand spec, product catalog, website layout
3. **Answer questions**: We'll have a few setup questions
4. **Test**: You'll get a private beta link to test everything

### For WISE²:
1. **Set up**: Next.js project, database, Stripe
2. **Build**: Website pages, dashboard, automation
3. **Deploy**: To production server
4. **Train**: Walk CC through everything

---

## FAQ

**Q: How long does it take to process an order?**  
A: We aim for 3-5 business days design → approval → production ready

**Q: Can customers upload custom designs?**  
A: Yes! Dashboard has a design upload portal

**Q: What if I need to change prices or add products?**  
A: You can manage it from the dashboard (or just ask us)

**Q: How do I get paid?**  
A: Stripe pays you weekly or monthly to your bank account

**Q: What if something breaks?**  
A: Email us or Slack — we'll fix it within 2 hours

**Q: Can I see customer data / analytics?**  
A: Yes — full dashboard with sales, trends, customer info

**Q: What about taxes / accounting?**  
A: You're responsible for business taxes (we just handle the orders)

**Q: Can I use my own domain?**  
A: Yes! Point DNS to our server, we'll set up SSL

---

## Next Steps

1. **TODAY**: Review this guide + DEPLOYMENT_PLAN.md
2. **TODAY**: Approve BRAND_SPEC.md
3. **TOMORROW**: Provide business info + product photos
4. **TOMORROW**: Start website build
5. **DAY 3**: Show you homepage mockup for feedback
6. **DAY 5**: Full website ready for testing
7. **DAY 7**: LAUNCH 🚀

---

## Documents You Should Read

- **DEPLOYMENT_PLAN.md** — Full timeline and technical details
- **BRAND_SPEC.md** — Design system and brand guidelines (LOCKED)
- **PRODUCT_CATALOG.md** — All 12+ products with pricing
- **assets/** — All brand images and PDF guide

---

**Ready to launch?**

📧 Email: dwise03@gmail.com  
💬 Slack: #cc-craft-create-support  
📞 Call: [CC's phone number - TBD]  

Let's build something amazing. ✨

---

**Updated**: 2026-08-21  
**Owner**: dwise (WISE² Founder)  
**Status**: ⏳ Ready to Begin
