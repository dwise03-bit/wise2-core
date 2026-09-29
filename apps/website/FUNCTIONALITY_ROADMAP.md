# WISE² Website Functionality Roadmap

## Status: INFRASTRUCTURE READY

### Completed Infrastructure (Ready for implementation)

✅ **API Client** (`lib/api-client.ts`)
- Centralized HTTP requests with auth support
- Error handling and response formatting
- Methods: GET, POST, PUT, PATCH, DELETE

✅ **Form Handling** (`lib/useForm.ts`)
- Form state management with validation
- Field-level error display
- Submission handling with async support
- Touch tracking for UX

✅ **Global State** (`lib/store.ts` + `lib/useStore.ts`)
- Cart management (add, remove, update quantity, total)
- Auth state (login, logout, user profile)
- User preferences (theme, notifications)
- LocalStorage persistence

✅ **Routes Configuration** (`lib/routes.ts`)
- Centralized route definitions
- Category-based organization
- Auth requirement tracking

---

## PRIORITY 1: Navigation & Routing (4-6 hours)

### Status: PARTIALLY COMPLETE
- ✅ Navigation component has working links
- ✅ Most page routes exist (/landing, /gallery, /shop, /webstore, /studio, etc.)
- ⚠️  Buttons within pages don't navigate yet

### Quick Wins (1-2 hours)
```
Pages that need CTA button navigation:
□ /landing → "Get Started" → /studio or /auth/signup
□ /landing → "Pricing" section → /pricing
□ /landing → "Features" → /apps or /webstore
□ /landing → "Learn More" → scroll or /about
□ /landing → "Sign In" → /auth/login

□ /pricing → plan selection buttons → /checkout?plan=X

□ /shop → "Buy" buttons → add to cart OR direct checkout
□ /shop → "Buy All Wishlist Items" → checkout with wishlist items

□ /webstore → category filters → filter products
□ /webstore → product cards → detail page (NEW ROUTE NEEDED)
□ /webstore → "Add to Cart" → store cart + show toast

□ /gallery → thumbnail clicks → expanded view (state or detail page)
□ /gallery → "Download" button → file download or API call

□ /apps → "Connect" buttons → modal or service detail page
□ /apps → "Settings" toggle → actual toggle state

□ /maintenance → create task button → modal + form submission
□ /maintenance → calendar dates → clickable, show tasks
□ /maintenance → task items → clickable, show details + edit/delete

□ /studio → all internal navigation → already working (internal state)
```

### Implementation Strategy
1. Update Navigation component with all routes
2. Replace all inline onclick handlers with Next.js `<Link>` or `useRouter`
3. Add query parameters for filtering/state passing
4. Create detail pages for products, tasks, etc.

---

## PRIORITY 2: Form Handling & Submission (3-4 hours)

### Status: INFRASTRUCTURE READY
- ✅ useForm hook built
- ✅ Validation system ready
- ⚠️  Forms don't actually submit yet

### Forms That Need Fixing
```
□ /auth/login
  POST /api/auth/login
  Fields: email, password
  Success: set auth state + redirect to /studio
  Error: show error message

□ /auth/signup
  POST /api/auth/signup
  Fields: email, password, name, company
  Validation: email format, password strength
  Success: send verification email + redirect to /verify
  Error: show error message

□ /checkout
  POST /api/checkout/session
  Fields: cartItems, paymentMethod, shippingAddress
  Integration: Stripe payment flow
  Success: redirect to payment URL
  Error: show error message

□ /contact
  POST /api/intake/submit
  Fields: name, email, subject, message
  Success: show confirmation message
  Error: show error

□ /intake
  POST /api/intake/submit
  Fields: project brief, budget, timeline, files
  File upload: POST /api/intake/upload
  Success: redirect to confirmation page
  Error: show validation errors

□ /maintenance (Create Task Modal)
  POST /api/projects (or similar)
  Fields: title, description, dueDate, status, assignee
  Success: refresh task list
  Error: show error toast

□ /maintenance (Task Edit)
  PUT /api/projects/:id
  Fields: same as create
  Success: refresh task list
  Error: show error

□ /maintenance (Task Delete)
  DELETE /api/projects/:id
  Confirmation: modal warning
  Success: refresh task list
  Error: show error
```

### Implementation Strategy
1. Convert all form pages to use `useForm` hook
2. Connect form submissions to API endpoints
3. Add client-side validation rules for each form
4. Handle success/error states with toasts or alerts
5. Test all form paths end-to-end

---

## PRIORITY 3: State Management & Data Flow (3-4 hours)

### Status: INFRASTRUCTURE READY
- ✅ useStore hook built
- ⚠️  Components don't use it yet

### State That Needs Wiring
```
Cart Management:
□ /shop → add/remove/update items → store in useStore
□ /webstore → add/remove/update items → store in useStore
□ Cart icon/counter → display useStore.cart.items.length
□ Checkout page → read from useStore, display items + total

Auth State:
□ After login → store.setAuth(user, token)
□ Check auth on protected routes → redirect if not authenticated
□ User profile dropdown → display useStore.auth.user
□ Logout button → store.logout()
□ Header "Sign In" → show/hide based on auth state

Wishlist:
□ Shop wishlist → persist to localStorage (already done locally)
□ Webstore wishlist → same pattern
□ Wishlist counter → display count

UI State:
□ Mobile menu toggle → local useState (already working)
□ Modal visibility → local useState (already working)
□ Form loading states → useForm.isSubmitting
□ Error toasts → global store.error or local state
```

### Implementation Strategy
1. Update all pages to import and use `useStore`
2. Replace local state with store where appropriate
3. Add cart logic to product pages
4. Wire auth state to protected routes
5. Add middleware/guards for auth-required routes

---

## PRIORITY 4: Backend API Integration (4-6 hours)

### Status: API ROUTES EXIST (need testing)
- ✅ Routes defined: /api/auth, /api/checkout, /api/projects, etc.
- ⚠️  Unclear which are fully implemented vs stubs

### API Endpoints to Verify & Connect
```
Authentication:
□ POST /api/auth/login
□ POST /api/auth/signup
□ POST /api/auth/logout
□ GET /api/auth/me (get current user)

Checkout & Payment:
□ POST /api/checkout/session (Stripe integration)
□ GET /api/checkout/session/:id (get session details)

Projects & Tasks:
□ GET /api/projects (list user projects)
□ POST /api/projects (create project/task)
□ PUT /api/projects/:id (update project/task)
□ DELETE /api/projects/:id (delete project/task)

File Upload:
□ POST /api/intake/upload (upload files to S3 or similar)
□ GET /api/files/:id (retrieve file)

Metrics & Analytics:
□ GET /api/v1/metrics/dashboard (dashboard KPIs)
□ GET /api/v1/metrics/users (user analytics)
□ GET /api/v1/metrics/production (production metrics)
□ GET /api/v1/metrics/revenue (revenue data)

Webhooks:
□ POST /api/webhooks/stripe (Stripe payment events)
□ POST /api/webhooks/discord (Discord notifications)
□ POST /api/discord/webhook (send Discord messages)

Other:
□ POST /api/generation/create (AI generation request)
□ GET /api/generation/status/:id (check generation status)
□ POST /api/analytics/track (event tracking)
□ POST /api/chat/route (chat/support messages)
```

### Implementation Strategy
1. Test each endpoint manually with Postman/curl
2. Document request/response formats
3. Update API client with proper error handling for each endpoint
4. Add loading and error states to UI
5. Implement retry logic for failed requests

---

## PRIORITY 5: Error Handling & UX Feedback (2-3 hours)

### Status: FRAMEWORK READY
- ✅ useForm has error handling
- ✅ apiClient has error handling
- ⚠️  Not wired to UI yet

### Required Error Handling
```
Loading States:
□ Show spinners during API calls
□ Disable buttons while submitting
□ Show form loading state

Error Messages:
□ Form validation errors → display under field
□ API errors → show toast or alert
□ Network errors → "Please check your connection"
□ Auth errors → "Session expired, please log in again"
□ Payment errors → "Payment failed, please try again"

Success States:
□ Toast notifications on success
□ Redirect on successful form submission
□ Update UI to reflect new data

Edge Cases:
□ Empty states → "No results found"
□ Loading → skeleton screens or spinners
□ Offline mode → "You are offline"
□ Timeout → "Request took too long, please try again"
```

### Implementation Strategy
1. Create Toast/Alert component (or use existing)
2. Add try-catch to all form submissions
3. Show loading states on all async operations
4. Add error boundaries for critical sections
5. Test error paths end-to-end

---

## Current Page Status

### ✅ Fully Functional (Internal State Only)
- /studio (Creative Studio with all modules)

### ⚠️  Needs Navigation Fixes
- /landing → CTA buttons don't navigate
- /gallery → gallery controls don't work
- /shop → "Buy" buttons work (link to checkout)
- /webstore → filters don't work
- /apps → "Connect" buttons don't work
- /maintenance → no modal or API integration
- /pricing → plan buttons don't work
- /contact → form doesn't submit
- /intake → form doesn't submit

### ❌ Need Complete Implementation
- /auth/login → form + API integration
- /auth/signup → form + API integration
- /checkout → cart display + payment integration
- /verify → email verification flow
- Product detail pages (don't exist yet)
- Task detail pages (don't exist yet)

---

## Implementation Priority Order

### Phase 1 (Quick Wins - 4 hours)
1. Fix all navigation CTA buttons (Priority 1)
2. Add product detail pages with routing
3. Wire up cart add/remove functionality (Priority 3)
4. Create simple contact form (Priority 2)

### Phase 2 (Core Functionality - 6 hours)
1. Implement login/signup forms (Priority 2)
2. Connect auth to store (Priority 3)
3. Test all API endpoints (Priority 4)
4. Wire checkout to cart (Priority 2 + 3 + 4)
5. Add error toasts (Priority 5)

### Phase 3 (Polish - 5 hours)
1. Add loading states to all forms (Priority 5)
2. Add validation to all forms (Priority 2)
3. Implement maintenance/task management (Priority 1 + 2 + 3 + 4)
4. Add error boundaries and edge case handling (Priority 5)
5. End-to-end testing of all workflows

---

## Files to Modify (by priority)

### Priority 1: Navigation
- [ ] /components/wise/Navigation.tsx - add all routes
- [ ] /app/landing/page.tsx - fix CTA buttons
- [ ] /app/gallery/page.tsx - fix gallery navigation
- [ ] /app/apps/page.tsx - fix service buttons
- [ ] /app/pricing/page.tsx - fix plan buttons
- [ ] /app/maintenance/page.tsx - fix task modal

### Priority 2: Forms
- [ ] /app/auth/page.tsx (new) - login/signup forms
- [ ] /app/contact/page.tsx - contact form
- [ ] /app/intake/page.tsx - intake form
- [ ] /app/checkout/page.tsx - checkout form

### Priority 3: State
- [ ] All product pages - use useStore for cart
- [ ] /app/layout.tsx - initialize store
- [ ] Protected routes - check auth state

### Priority 4: API
- [ ] All form pages - connect to API endpoints
- [ ] Verify backend endpoints exist and work

### Priority 5: UX
- [ ] Create Toast component
- [ ] Add error handling to all forms
- [ ] Add loading spinners
- [ ] Add success messages

---

## Time Estimate Summary

| Priority | Task | Time | Status |
|----------|------|------|--------|
| 1 | Navigation fixes | 4h | Infrastructure Ready |
| 2 | Form implementation | 3h | Infrastructure Ready |
| 3 | State management | 3h | Infrastructure Ready |
| 4 | API integration | 4h | Partial (need verification) |
| 5 | Error/UX | 2h | Framework Ready |
| **Total** | **Full Implementation** | **16h** | **Ready to Execute** |

---

## Quick Start: Next Steps

1. **Run the website**: `npm run dev` in `/apps/website`
2. **Test current state**: Visit each page and verify what works
3. **Start with Priority 1**: Fix navigation buttons one page at a time
4. **Move to Priority 2**: Implement forms using `useForm` hook
5. **Continue through Priorities 3-5**: Build upon foundation

## Commands for Testing

```bash
# Start development server
npm run dev

# Test navigation: Check all links work
# Test forms: Try submitting (should fail until API wired)
# Test API: Run curl tests against endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

**Last Updated**: 2026-07-20
**Next Review**: After Priority 1 completion
