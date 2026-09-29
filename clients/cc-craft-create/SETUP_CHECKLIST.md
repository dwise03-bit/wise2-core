# CC Craft & Create — Setup Checklist

**Status**: 🚀 Ready to Launch  
**Target**: 2026-08-28 (7 days)  
**Owner**: dwise  

---

## Pre-Launch Phase (Days 0-1)

### Project Setup
- [ ] Create Next.js project in `clients/cc-craft-create/website`
- [ ] Initialize Git repository
- [ ] Set up environment variables (.env.local)
- [ ] Install dependencies:
  - [ ] React 18+
  - [ ] Next.js 14+
  - [ ] Tailwind CSS
  - [ ] React Hook Form
  - [ ] Stripe.js
  - [ ] Resend (email)
  - [ ] @stripe/react-stripe-js

### Database Setup
- [ ] Create PostgreSQL database (`cc_craft_create`)
- [ ] Create users, products, orders, customers tables (see DEPLOYMENT_PLAN.md)
- [ ] Set up connection pool
- [ ] Test connection from app

### Stripe Setup
- [ ] Create Stripe account (use WISE² or CC's new account)
- [ ] Add API keys to .env
- [ ] Create 5 test products in Stripe dashboard
- [ ] Test payment flow with 4242 4242 4242 4242
- [ ] Set up webhook for order notifications
- [ ] Configure payout schedule

### Domain & Hosting
- [ ] Decide domain: cc.wise2.net vs custom
- [ ] If custom: Get DNS settings from registrar
- [ ] Point DNS to 173.208.147.165 (if custom domain)
- [ ] Set up Let's Encrypt SSL certificate
- [ ] Configure nginx reverse proxy
- [ ] Test HTTPS works

---

## Design & Brand Phase (Days 1-2)

### Tailwind Configuration
- [ ] Add CC color tokens to tailwind.config.js
- [ ] Create CSS variables in globals.css
- [ ] Set up font imports (Lora, Poppins, Great Vibes)
- [ ] Test fonts load correctly
- [ ] Create reusable component classes

### Component Library
- [ ] Button component (primary, secondary)
- [ ] Card component
- [ ] Navigation component
- [ ] Form input component
- [ ] Hero section component
- [ ] Product grid component
- [ ] Footer component
- [ ] Test components render with CC colors

### Brand Assets
- [ ] Extract logo from brand PDF
- [ ] Optimize all PNGs to WebP
- [ ] Compress images (80% quality)
- [ ] Create responsive image sizes (320px, 640px, 1200px)
- [ ] Place in public/images/
- [ ] Test images load on all breakpoints

---

## Homepage Build (Days 2-3)

### Page Structure
- [ ] Create app/page.tsx (Home page)
- [ ] Create Header component with navigation
- [ ] Create Footer component with contact
- [ ] Test layout on mobile, tablet, desktop

### Hero Section
- [ ] Add hero image (use CC showcase PNG)
- [ ] Add headline: "Crafted for the Moment. Created for the Memory."
- [ ] Add subheadline
- [ ] Add CTA button (gold, "ORDER YOURS TODAY")
- [ ] Test responsive design

### Value Propositions (3-column)
- [ ] "High-Quality Printing"
- [ ] "Fast Turnaround"
- [ ] "Made with Love"
- [ ] Add icons/images
- [ ] Test on mobile (stack to 1 column)

### Featured Products Section
- [ ] Show top 4 products
- [ ] Product card with image, title, price, "Add to Cart"
- [ ] Query database for products
- [ ] Test images load correctly
- [ ] Add "View All" link to shop

### By Occasion Section
- [ ] Create 6-item grid (birthdays, showers, graduations, memorials, holidays, events)
- [ ] Add images for each
- [ ] Make clickable → filters shop by occasion
- [ ] Test on mobile (2-column grid)

### About CC Section
- [ ] Add photo (placeholder until CC provides)
- [ ] Add headline: "Nurse. Entrepreneur. Creator."
- [ ] Add copy: CC's story
- [ ] Add "Learn More" button
- [ ] Test text readability

### Customer Reviews Section
- [ ] Add 3 testimonials (placeholder until CC gets real ones)
- [ ] Customer name, quote, image
- [ ] Carousel or static grid
- [ ] Test mobile layout

### Final CTA Section
- [ ] Headline: "Your Dream. Our Creation."
- [ ] Copy: Short value prop
- [ ] CTA button: "START YOUR ORDER"
- [ ] Test button click goes to order page

### SEO & Meta Tags
- [ ] Set meta title
- [ ] Set meta description
- [ ] Add og:image, og:title, og:description
- [ ] Add JSON-LD schema (Organization)
- [ ] Test with OpenGraph debugger

### Homepage QA
- [ ] ✅ All sections render correctly
- [ ] ✅ Images load (check DevTools Network)
- [ ] ✅ Colors match brand spec
- [ ] ✅ Typography matches brand spec
- [ ] ✅ Buttons are clickable
- [ ] ✅ Mobile responsive (test at 375px, 768px, 1200px)
- [ ] ✅ No console errors
- [ ] ✅ Lighthouse score > 80

---

## Shop Page Build (Days 3-4)

### Product List Page
- [ ] Create app/shop/page.tsx
- [ ] Query all products from database
- [ ] Display in 4-column grid (responsive: 2 col tablet, 1 col mobile)
- [ ] Show: image, title, description, price, category tag
- [ ] Add "Add to Cart" button to each

### Filtering & Search
- [ ] Add category filter (party, memorial, business, school, church, custom)
- [ ] Add occasion filter
- [ ] Add price filter (optional: $0-50, $50-100, $100+)
- [ ] Add search box (by product name)
- [ ] Make filters work (update URL + re-query)

### Sorting
- [ ] Add sort dropdown: Price (low→high), Price (high→low), Newest, Popular
- [ ] Implement sorting in SQL query
- [ ] Test each sort option

### Individual Product Page
- [ ] Create app/shop/[id]/page.tsx
- [ ] Show large product image
- [ ] Show title, description, price, category, occasion
- [ ] Show specs (size, material, MOQ, lead time)
- [ ] Quantity selector (1-100+)
- [ ] "Add to Cart" button
- [ ] Customer reviews (placeholder)
- [ ] Related products section

### Pagination
- [ ] Show 12 products per page
- [ ] Add pagination controls (1, 2, 3... Next)
- [ ] Make pagination work
- [ ] Test with 15+ products

### Shop Page QA
- [ ] ✅ All products display
- [ ] ✅ Images load
- [ ] ✅ Filtering works
- [ ] ✅ Search works
- [ ] ✅ Sorting works
- [ ] ✅ Mobile responsive
- [ ] ✅ Individual product pages load
- [ ] ✅ SEO meta tags on product pages

---

## Cart & Checkout (Days 4-5)

### Shopping Cart
- [ ] Create cart state (Context API or Zustand)
- [ ] "Add to Cart" button adds to cart
- [ ] Show cart count in header
- [ ] Create app/cart/page.tsx
- [ ] Display cart items: image, title, quantity, price, subtotal
- [ ] Edit quantity or remove items
- [ ] Show subtotal + shipping estimate
- [ ] "Proceed to Checkout" button

### Checkout Page
- [ ] Create app/checkout/page.tsx
- [ ] Customer info form (name, email, phone, address)
- [ ] Shipping options (local pickup, delivery, etc.)
- [ ] Order notes / customization field
- [ ] Stripe payment element
- [ ] Order summary (items, subtotal, shipping, total)
- [ ] "Place Order" button

### Payment Processing
- [ ] Integrate Stripe.js
- [ ] Handle card input
- [ ] Create payment intent on server
- [ ] Confirm payment on client
- [ ] Handle success/error responses
- [ ] Create order record in database
- [ ] Clear cart after successful payment

### Order Confirmation
- [ ] Create app/order-confirmation/[id]/page.tsx
- [ ] Show order number
- [ ] Show order details (items, total, shipping)
- [ ] Show expected delivery date
- [ ] Add "Track Your Order" button
- [ ] Email confirmation to customer

### Checkout QA
- [ ] ✅ Add to cart works
- [ ] ✅ Cart count updates
- [ ] ✅ Cart page shows items
- [ ] ✅ Edit quantity works
- [ ] ✅ Remove item works
- [ ] ✅ Checkout form validates
- [ ] ✅ Stripe payment works (test card)
- [ ] ✅ Order saved to database
- [ ] ✅ Confirmation email sent
- [ ] ✅ Mobile responsive

---

## Custom Order & Other Pages (Days 5-6)

### Occasions Page
- [ ] Create app/occasions/page.tsx
- [ ] Show 6 occasion categories with images
- [ ] Each occasion links to filtered shop
- [ ] Test filters work

### Business Page
- [ ] Create app/business/page.tsx
- [ ] Show B2B packages (Small, Medium, Large Party)
- [ ] Custom bulk order info
- [ ] Contact form for custom quotes
- [ ] Link to Custom Order page

### Custom Order Page
- [ ] Create app/custom-order/page.tsx
- [ ] Customer upload design file (image)
- [ ] Text description of order
- [ ] Photo references (optional)
- [ ] Quantity, occasion, date needed
- [ ] Submit form → email to CC
- [ ] Show confirmation

### Gallery Page
- [ ] Create app/gallery/page.tsx
- [ ] Placeholder for customer showcase
- [ ] Gallery grid with customer photos/testimonials
- [ ] Note: CC to provide photos later

### About Page
- [ ] Create app/about/page.tsx
- [ ] CC's photo
- [ ] CC's story (copy from PROJECT_MASTER.txt)
- [ ] Values/personality section
- [ ] Social media links
- [ ] Email/phone contact

### Contact Page
- [ ] Create app/contact/page.tsx
- [ ] Contact form (name, email, message)
- [ ] Map to pickup location (optional)
- [ ] Hours of operation
- [ ] Email/phone/address
- [ ] Social media links

### Order Tracking Page
- [ ] Create app/orders/[id]/page.tsx (public, no auth needed yet)
- [ ] Show order number, status, timeline
- [ ] Status flow: "Dream" → "Design" → "Approval" → "Production" → "Ready"
- [ ] Show expected delivery date
- [ ] Email sent when status changes

---

## Dashboard Build (Days 6-7 or Phase 2)

### Dashboard Home
- [ ] Create app/dashboard/page.tsx (password protected)
- [ ] KPI tiles: Total Orders, Total Revenue, Customers, Avg Order Value
- [ ] Recent orders table
- [ ] Sales chart (last 7 days)
- [ ] Top products

### Dashboard Orders
- [ ] Create app/dashboard/orders/page.tsx
- [ ] Table: Order #, Customer, Items, Status, Total, Date
- [ ] Click order → view details
- [ ] Update status (Dream, Design, Approval, Production, Ready)
- [ ] Upload proof file
- [ ] Send notification to customer
- [ ] Edit order notes

### Dashboard Customers
- [ ] Create app/dashboard/customers/page.tsx
- [ ] Table: Name, Email, Phone, Orders, Total Spent
- [ ] Search customers
- [ ] View customer order history
- [ ] Send email to customer

### Dashboard Analytics
- [ ] Create app/dashboard/analytics/page.tsx
- [ ] Sales chart (by day/week/month)
- [ ] Revenue by product
- [ ] Revenue by category
- [ ] Revenue by occasion
- [ ] Customer acquisition chart
- [ ] Popular products list

### Dashboard Settings
- [ ] Create app/dashboard/settings/page.tsx
- [ ] Update business info (phone, email, address, hours)
- [ ] Shipping rates
- [ ] Email notification settings
- [ ] Profile photo upload
- [ ] Password change

### Dashboard Auth
- [ ] Create login page (app/dashboard/login)
- [ ] Password-only auth (hashed in database)
- [ ] Session management (cookies/JWT)
- [ ] Logout functionality
- [ ] Protect all dashboard routes

---

## Email Notifications (Days 6-7 or Phase 2)

### Resend Integration
- [ ] Set up Resend account
- [ ] Add API key to .env
- [ ] Test email sending

### Email Templates
- [ ] **New Order** → CC gets notified
- [ ] **Order Confirmation** → Customer confirmation
- [ ] **Proof Ready** → CC uploaded proof
- [ ] **Proof Approved** → Customer approved
- [ ] **Production Ready** → Order ready for pickup/delivery
- [ ] **Shipped** → Order on its way

---

## Final QA & Deployment (Day 7)

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No Eslint warnings
- [ ] Remove all console.log() statements
- [ ] Remove debug code

### Performance
- [ ] Lighthouse score > 80
- [ ] Images optimized
- [ ] CSS minified
- [ ] JS minified
- [ ] No unused imports

### Security
- [ ] Environment variables not exposed
- [ ] Stripe keys secure
- [ ] Database password secure
- [ ] API routes protected
- [ ] SQL injection prevented
- [ ] CORS configured

### Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS Safari, Chrome Android
- [ ] Test at 375px (mobile), 768px (tablet), 1200px (desktop)
- [ ] Test all pages load
- [ ] Test all buttons work
- [ ] Test payment flow (test card)
- [ ] Test order notification emails
- [ ] Test order tracking page

### Deployment
- [ ] Build project (`npm run build`)
- [ ] Start production server (`npm run start`)
- [ ] Verify HTTPS works
- [ ] Verify domain resolves
- [ ] Verify database connection
- [ ] Verify Stripe integration
- [ ] Run Lighthouse
- [ ] Verify all pages load
- [ ] Verify emails send

### Handoff
- [ ] Provide CC with login credentials (dashboard)
- [ ] Provide CC with website URL
- [ ] Send QUICK_START.md to CC
- [ ] Walk CC through dashboard
- [ ] Do first test order together
- [ ] Get approval to go live

### Launch
- [ ] Announce on social media
- [ ] Send launch email
- [ ] Update LinkedIn
- [ ] Mark as LIVE ✅

---

## Post-Launch (Week 2+)

### Monitor
- [ ] Check error logs daily
- [ ] Monitor uptime
- [ ] Monitor database performance
- [ ] Check email delivery

### Feedback Loop
- [ ] Collect CC feedback
- [ ] Fix bugs immediately
- [ ] Make small improvements
- [ ] Document issues

### Phase 2: Dashboard
- [ ] Deploy full dashboard (Week 2)
- [ ] Train CC on analytics
- [ ] Set up email notifications

### Phase 3: Creative Studio
- [ ] Grant CC access (Week 3)
- [ ] Create design templates
- [ ] Train on tools

### Phase 4: Growth
- [ ] Set up Instagram integration (Week 4)
- [ ] Set up email sequences
- [ ] Deploy analytics
- [ ] Celebrate first 5 orders! 🎉

---

## Tracking

### Day 1 (Launch Date: 2026-08-21)
- [ ] Project setup complete
- [ ] Database ready
- [ ] Brand colors configured

### Day 2
- [ ] Homepage mockup ready for CC approval
- [ ] Components built

### Day 3
- [ ] Homepage launched
- [ ] Shop page in progress

### Day 4
- [ ] Shop page complete
- [ ] Cart/checkout in progress

### Day 5
- [ ] Checkout complete
- [ ] Other pages in progress

### Day 6
- [ ] All pages built
- [ ] Full QA starts

### Day 7
- [ ] QA complete
- [ ] LAUNCH 🚀

---

## Success Criteria

✅ Website live at production URL  
✅ Homepage renders correctly  
✅ Shop page shows 5+ products  
✅ Shopping cart works  
✅ Stripe payment processed  
✅ Order saved to database  
✅ Confirmation email sent  
✅ Mobile responsive (375px)  
✅ HTTPS active  
✅ No console errors  
✅ CC can log in to dashboard  
✅ CC approves launch  

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Database connection fails | Pre-test connection, have backup plan |
| Stripe integration broken | Test with test card before launch |
| Images don't load | Compress and test all images first |
| Mobile design breaks | Test at 375px, 768px, 1200px daily |
| Email delivery fails | Test Resend before launch |
| Site goes down | Monitor uptime, have rollback plan |
| CC unhappy with design | Show mockup Day 2, get approval before build |

---

## Resources

- **Brand Guide**: assets/CC_Brand_Guide.pdf
- **Deployment Plan**: DEPLOYMENT_PLAN.md
- **Brand Spec**: docs/BRAND_SPEC.md
- **Product Catalog**: docs/PRODUCT_CATALOG.md
- **Quick Start**: QUICK_START.md (for CC)

---

**Owner**: dwise (WISE² Founder)  
**Status**: 🚀 Ready to Build  
**Target Launch**: 2026-08-28  
**Last Updated**: 2026-08-21
