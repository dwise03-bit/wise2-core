# WISE² QA Gates 2-5 Testing Plan

**Document:** Complete functionality, performance, security, and UAT verification  
**Status:** Ready for execution  
**Effort:** 4-6 hours total  
**Prerequisites:** Backend deployed, database running, frontend dev server running

---

## QUICK START

```bash
# Terminal 1: Start backend API
cd /services/api && npm start

# Terminal 2: Start frontend
cd /apps/website && npm run dev

# Terminal 3: Run tests
cd /apps/website && npm run test:e2e  # or manual testing per below
```

---

## QA GATE 2: FUNCTIONALITY TESTING

### 2.1 Backend API Endpoints (25 endpoints)

#### Auth Endpoints (6)

**POST /api/v1/auth/signup**
```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@wise2.net",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```
- [ ] Returns 201 with user + tokens
- [ ] Creates user in database
- [ ] Hashes password (not stored plaintext)
- [ ] Rejects duplicate email with 400
- [ ] Rejects weak password with 400

**POST /api/v1/auth/login**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@wise2.net",
    "password": "TestPass123!"
  }'
```
- [ ] Returns 200 with tokens
- [ ] Returns 401 for wrong password
- [ ] Returns 401 for non-existent email
- [ ] AccessToken is valid JWT
- [ ] RefreshToken is valid JWT

**POST /api/v1/auth/refresh**
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```
- [ ] Returns 200 with new access token
- [ ] Returns 401 for expired refresh token
- [ ] New token is valid JWT

**POST /api/v1/auth/logout** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```
- [ ] Returns 200
- [ ] Invalidates refresh token
- [ ] Subsequent requests with old token fail 401

**GET /api/v1/auth/profile** (requires auth)
```bash
curl http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>"
```
- [ ] Returns 200 with user profile
- [ ] Returns 401 without token
- [ ] Returns 401 with invalid token

**PUT /api/v1/auth/profile** (requires auth)
```bash
curl -X PUT http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```
- [ ] Returns 200 with updated profile
- [ ] Updates only specified fields
- [ ] Returns 401 without auth

---

#### Payment Endpoints (7)

**GET /api/v1/payments/products** (no auth)
```bash
curl http://localhost:3001/api/v1/payments/products
```
- [ ] Returns 200 with product list
- [ ] Each product has: id, name, price, description
- [ ] Prices are numbers > 0

**GET /api/v1/payments/products/:productId** (no auth)
```bash
curl http://localhost:3001/api/v1/payments/products/1
```
- [ ] Returns 200 with product details
- [ ] Returns 404 for non-existent product

**POST /api/v1/payments/create-order** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/payments/create-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "1", "quantity": 2},
      {"productId": "2", "quantity": 1}
    ]
  }'
```
- [ ] Returns 201 with order
- [ ] Order has status "pending"
- [ ] Order has total = sum(quantity × price)
- [ ] Returns 401 without auth
- [ ] Returns 400 for invalid product IDs

**GET /api/v1/payments/orders** (requires auth)
```bash
curl http://localhost:3001/api/v1/payments/orders \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with order list
- [ ] Only returns user's own orders
- [ ] Each order shows: id, items, total, status, date

**GET /api/v1/payments/orders/:orderId** (requires auth)
```bash
curl http://localhost:3001/api/v1/payments/orders/abc123 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 for user's order
- [ ] Returns 404 for non-existent order
- [ ] Returns 403 for other user's order

**POST /api/v1/payments/confirm** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/payments/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "abc123"}'
```
- [ ] Returns 200 with updated order
- [ ] Order status changes to "completed"
- [ ] Returns 404 for non-existent order

**POST /api/v1/payments/cancel/:orderId** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/payments/cancel/abc123 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with cancelled order
- [ ] Order status = "cancelled"
- [ ] Can't cancel completed order (400)

---

#### File Storage Endpoints (11)

**POST /api/v1/files/upload-url** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/files/upload-url \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "photo.jpg",
    "contentType": "image/jpeg",
    "size": 2048576
  }'
```
- [ ] Returns 200 with signed S3 URL
- [ ] URL is valid for 15+ minutes
- [ ] URL includes bucket, key, signature

**POST /api/v1/files/confirm** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/files/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "xyz789",
    "url": "https://s3.../photo.jpg"
  }'
```
- [ ] Returns 200 with file metadata
- [ ] File marked as "confirmed"
- [ ] File appears in /files list

**GET /api/v1/files** (requires auth)
```bash
curl http://localhost:3001/api/v1/files \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with file list
- [ ] Only user's files shown
- [ ] Each file has: id, name, size, url, uploadedAt

**GET /api/v1/files/:fileId** (requires auth)
```bash
curl http://localhost:3001/api/v1/files/xyz789 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with file details
- [ ] Returns 404 for non-existent file
- [ ] Returns 403 for other user's file

**DELETE /api/v1/files/:fileId** (requires auth)
```bash
curl -X DELETE http://localhost:3001/api/v1/files/xyz789 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 204 (no content)
- [ ] File deleted from database
- [ ] File no longer in /files list
- [ ] Returns 404 for non-existent file

**POST /api/v1/files/showcase** (requires auth)
```bash
curl -X POST http://localhost:3001/api/v1/files/showcase \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "xyz789",
    "title": "Client Project 1",
    "description": "Beautiful design work",
    "featured": true
  }'
```
- [ ] Returns 201 with showcase asset
- [ ] Asset linked to file
- [ ] Featured = true makes it appear in public gallery

**GET /api/v1/files/showcase** (requires auth)
```bash
curl http://localhost:3001/api/v1/files/showcase \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with user's showcase assets
- [ ] Only user's assets shown
- [ ] Includes: id, title, description, fileUrl, featured

**GET /api/v1/files/showcase/featured** (no auth)
```bash
curl http://localhost:3001/api/v1/files/showcase/featured
```
- [ ] Returns 200 with public featured assets
- [ ] Only featured = true assets shown
- [ ] No user auth required
- [ ] Can be cached/indexed

**GET /api/v1/files/showcase/:assetId** (requires auth)
```bash
curl http://localhost:3001/api/v1/files/showcase/asset123 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 200 with asset details
- [ ] Increments view count
- [ ] Returns 404 for non-existent asset

**PUT /api/v1/files/showcase/:assetId** (requires auth)
```bash
curl -X PUT http://localhost:3001/api/v1/files/showcase/asset123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"featured": false}'
```
- [ ] Returns 200 with updated asset
- [ ] Updates specified fields only
- [ ] Returns 403 for other user's asset

**DELETE /api/v1/files/showcase/:assetId** (requires auth)
```bash
curl -X DELETE http://localhost:3001/api/v1/files/showcase/asset123 \
  -H "Authorization: Bearer <token>"
```
- [ ] Returns 204
- [ ] Asset deleted
- [ ] Returns 403 for other user's asset

---

### 2.2 Frontend Functionality

#### Form Hook (useForm)

**Test File:** `/apps/website/lib/useForm.ts`

- [ ] Form initializes with empty values
- [ ] `handleChange` updates field value
- [ ] Validation rules execute on blur
- [ ] Invalid email rejected
- [ ] Empty required fields rejected
- [ ] `handleSubmit` calls onSubmit callback
- [ ] Submit disabled until form valid
- [ ] Errors display under fields
- [ ] Errors clear when valid

**Test Case:**
```tsx
const form = useForm({
  initialValues: { email: '', password: '' },
  validationRules: {
    email: (v) => !v.includes('@') ? 'Invalid email' : null,
    password: (v) => v.length < 8 ? 'Min 8 chars' : null,
  },
  onSubmit: async (values) => ({ success: true }),
})

// Should fail validation
form.handleChange('email', 'invalid')
form.handleBlur('email')
assert(form.formState.email.error === 'Invalid email')

// Should pass validation
form.handleChange('email', 'user@example.com')
form.handleBlur('email')
assert(form.formState.email.error === null)
```

---

#### Store (useStore)

**Test File:** `/apps/website/lib/store.ts`

**Cart Operations:**
- [ ] addToCart increases cart.items
- [ ] cart.total updates correctly
- [ ] removeFromCart removes item
- [ ] updateCart changes quantity
- [ ] cart persists in localStorage
- [ ] cart restores on page reload

**Auth Operations:**
- [ ] setAuth stores user + token
- [ ] getAuth returns stored user
- [ ] logout clears user + token
- [ ] auth persists across pages
- [ ] auth clears on logout

**Test Case:**
```tsx
const store = useStore()

// Test cart
store.addToCart({ id: '1', name: 'Product', price: 29.99, quantity: 2 })
assert(store.cart.items.length === 1)
assert(store.cart.total === 59.98)

// Test persistence
localStorage shows cart data
Page reload
assert(store.cart.total === 59.98)

// Test auth
store.setAuth({ id: 'user1', email: 'user@example.com' }, 'token123')
assert(store.auth.user.email === 'user@example.com')
store.logout()
assert(store.auth.user === null)
```

---

#### Navigation & Routing

**Test Routes:**
- [ ] /landing → displays hero, features, CTA
- [ ] /gallery → displays image grid
- [ ] /apps → displays Google integrations
- [ ] /webstore → displays product catalog
- [ ] /shop → displays products with wishlist
- [ ] /maintenance → displays calendar + tasks
- [ ] /studio → displays Creative Studio pages
- [ ] /dashboard → displays KPIs + charts
- [ ] All links in header navigate correctly
- [ ] Page refreshes maintain state (cart, auth)

---

### 2.3 Golden Path Workflows

#### User Registration & Login
```
1. User opens /landing
2. Clicks "Sign Up"
3. Fills signup form (email, password, name)
4. Form validates input
5. Clicks "Create Account"
6. API creates user → returns tokens
7. Redirects to /dashboard
8. Dashboard shows user profile
9. Header shows user name + avatar
```

**Checklist:**
- [ ] Signup form appears
- [ ] Email validation works
- [ ] Password validation works (min 8 chars)
- [ ] Submit button enabled when valid
- [ ] Success message appears
- [ ] User redirected to dashboard
- [ ] User profile displays correctly
- [ ] Logout works
- [ ] Can login with email/password
- [ ] Sessions persist across pages

---

#### Product Purchase Workflow
```
1. User logs in
2. Navigates to /shop
3. Browses products
4. Clicks "Add to Cart"
5. Cart updates with product
6. Clicks "Checkout"
7. Fills shipping form
8. Fills payment form
9. Submits order
10. Sees order confirmation
11. Order appears in order history
```

**Checklist:**
- [ ] Product list loads
- [ ] Add to cart adds item
- [ ] Cart counter updates
- [ ] Cart page shows items + total
- [ ] Cart persists on page reload
- [ ] Checkout form appears
- [ ] Form validates required fields
- [ ] Submit creates order via API
- [ ] Confirmation page shows order #
- [ ] Order visible in user's order history
- [ ] Can view order details

---

#### File Upload Workflow
```
1. User navigates to /studio/client-showcase
2. Drags photo/video into upload zone
3. File validates (type, size)
4. Gets signed S3 URL from API
5. Uploads to S3
6. Confirms upload with API
7. File appears in gallery
8. Can preview full-screen
9. Can download file
10. Can delete file
```

**Checklist:**
- [ ] Upload zone appears
- [ ] Drag-drop works
- [ ] File type validation (jpg, png, mp4, etc.)
- [ ] File size validation (max 100MB)
- [ ] Progress bar shows during upload
- [ ] Success message after upload
- [ ] File appears in gallery thumbnail
- [ ] Can click thumbnail to preview
- [ ] Preview modal displays full-size
- [ ] Download button works
- [ ] Delete removes file permanently

---

## QA GATE 3: PERFORMANCE TESTING

### Targets

- **Page Load Time:** < 3 seconds
- **API Response:** < 500ms
- **Lighthouse Score:** ≥ 90 (all pages)
- **Database Queries:** < 100ms

### Testing

```bash
# Lighthouse audit
npm run lighthouse

# Check API response time
time curl http://localhost:3001/api/v1/auth/profile

# Monitor database queries
curl http://localhost:3001/api/v1/payments/products # measure response
```

**Checklist:**
- [ ] /landing loads < 2s
- [ ] /dashboard loads < 3s
- [ ] /shop loads < 3s
- [ ] Auth endpoints < 200ms
- [ ] Product list < 300ms
- [ ] File operations < 500ms
- [ ] Lighthouse score ≥ 90
- [ ] No layout shifts (CLS < 0.1)
- [ ] No console errors

---

## QA GATE 4: SECURITY TESTING

**Checklist:**
- [ ] No hardcoded secrets in code
- [ ] Environment variables used for all keys
- [ ] SQL queries parameterized (no injection)
- [ ] XSS protection on form inputs
- [ ] CSRF tokens on state-changing forms
- [ ] Auth required for /api/v1/* endpoints
- [ ] User can't access other users' data
- [ ] Invalid tokens rejected (401)
- [ ] Expired tokens rejected (401)
- [ ] Passwords hashed (bcrypt)
- [ ] No sensitive data in logs
- [ ] HTTPS enforced in production

**Test Cases:**
```bash
# Unauthorized access blocked
curl http://localhost:3001/api/v1/auth/profile
# Should return 401

# Invalid token rejected
curl -H "Authorization: Bearer invalid" \
  http://localhost:3001/api/v1/auth/profile
# Should return 401

# User can't access other user's data
# Login as user1, try to delete user2's file
# Should return 403
```

---

## QA GATE 5: USER ACCEPTANCE TESTING (UAT)

### User Story 1: Freelancer Uploads Portfolio

**As a** freelancer  
**I want to** upload photos/videos of my work  
**So that** potential clients can see my portfolio

**Acceptance Criteria:**
- [ ] Can upload multiple files at once
- [ ] Files display in gallery with thumbnails
- [ ] Can preview full-screen
- [ ] Can mark as "featured" (public)
- [ ] Featured items appear in public showcase
- [ ] Can delete unwanted files

**Test Path:**
1. Login as freelancer
2. Go to Client Showcase
3. Upload 3 photos (drag-drop)
4. Verify all appear in gallery
5. Click one to preview
6. Mark 2 as featured
7. Logout & view public showcase
8. Verify featured items visible
9. Delete one item
10. Verify deleted

---

### User Story 2: Customer Purchases Product

**As a** customer  
**I want to** purchase products from the shop  
**So that** I can access premium features

**Acceptance Criteria:**
- [ ] Can browse product catalog
- [ ] Can add products to cart
- [ ] Can view cart with totals
- [ ] Can checkout
- [ ] Can enter shipping info
- [ ] Can confirm payment
- [ ] Receive order confirmation
- [ ] Can view order history

**Test Path:**
1. Go to /shop (no login)
2. Browse products
3. Add 2 products to cart
4. Click checkout
5. Login (or create account)
6. Enter shipping address
7. Enter payment info
8. Submit order
9. See confirmation page
10. Go to /dashboard → orders
11. Verify order appears
12. Click order → see details

---

### User Story 3: Manager Tracks Maintenance Tasks

**As a** operations manager  
**I want to** schedule maintenance tasks  
**So that** systems stay healthy

**Acceptance Criteria:**
- [ ] Can create recurring tasks
- [ ] Tasks appear on calendar
- [ ] Can mark task complete
- [ ] Next occurrence auto-schedules
- [ ] Get notifications before task
- [ ] Can reschedule task
- [ ] Can view task history

**Test Path:**
1. Go to /maintenance
2. Create task: "Database Backup" (daily, 2pm)
3. Verify on calendar today
4. Mark complete
5. Verify next day's task created
6. Create alert 15min before
7. Reschedule to 3pm
8. Verify calendar updated
9. View task history → see all runs

---

## SIGN-OFF TEMPLATE

When all gates pass, fill this out:

```markdown
# QA Sign-Off

**Date:** 2026-07-20  
**Tested By:** [Your Name]  
**Device:** Mac Safari | Chrome | Firefox  

## Gates Status
- [x] Gate 1: Code Quality — 0 errors
- [x] Gate 2: Functionality — All 25 endpoints + 3 workflows
- [x] Gate 3: Performance — Lighthouse ≥ 90
- [x] Gate 4: Security — All checks passed
- [x] Gate 5: UAT — 3 user stories verified

## Issues Found
None

## Ready for Production
✅ YES — All gates passing, no blockers
```

---

**Next Step:** Execute this plan and report results. Start with a few API endpoints, then move to frontend workflows.
