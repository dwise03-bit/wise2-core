# WISE² Client Intake Form — Next.js Implementation Design

**Date:** 2026-06-26  
**Version:** 1.0  
**Status:** Design Approved

---

## Executive Summary

Convert the static WISE² client intake form (HTML/CSS) into a Next.js page at `/intake` with real-time form validation, file upload capability, and seamless Formspree integration. The form maintains the existing dark blue/cyan design system and all 13 data-collection sections.

**Key features:**
- Single-page form (no multi-step wizard)
- Real-time validation with user-friendly error messages
- File upload API endpoint for business assets
- Formspree submission for email delivery
- Fully responsive design (desktop, tablet, mobile)
- Success/error feedback to user

---

## Architecture & File Structure

### New Files

```
/home/ubuntu/wise-defense-saas/dashboard/
├── app/
│   ├── intake/
│   │   └── page.tsx                    # Main intake form page (route: /intake)
│   └── api/
│       └── intake/
│           └── upload/
│               └── route.ts            # File upload endpoint (POST /api/intake/upload)
├── components/
│   └── IntakeForm.tsx                  # Intake form component (client-side)
└── lib/
    └── intake-validation.ts            # Validation rules & functions
```

### Design Decisions

- **Route:** `/intake` on the dashboard (matches existing page structure)
- **Client component:** `'use client'` directive for form interactivity
- **No new dependencies:** Uses existing Tailwind CSS, no form libraries
- **File storage:** Local disk (`/public/uploads/intake/`) with timestamp-prefixed filenames
- **Form submission:** Direct POST to Formspree (URLs to uploaded files included in payload)

---

## Form Component Structure

### State Management

```typescript
// formData: all 13 sections of intake information
const [formData, setFormData] = useState({
  // Section 01: Contact Information
  full_name: '',
  company_name: '',
  job_title: '',
  phone: '',
  email: '',
  business_address: '',
  website: '',

  // Section 02: About Your Business
  business_description: '',
  products_services: '',
  target_audience: '',
  unique_value: '',

  // Section 03: Services Requested
  services: [] as string[],             // checkbox array
  other_service: '',

  // Section 04: Project Information
  project_description: '',
  primary_goal: '',
  examples_like: '',
  avoid: '',

  // Section 05: Branding
  current_assets: [] as string[],       // checkbox array

  // Section 06: Website Information
  current_website: '',
  domain_name: '',
  hosting_company: '',
  website_needs: [] as string[],        // checkbox array

  // Section 07: Social Media
  facebook: '',
  instagram: '',
  tiktok: '',
  linkedin: '',
  youtube: '',
  other_social: '',

  // Section 08: Business Assets
  files: null as FileList | null,

  // Section 09: Login / Access Information
  domain_registrar: '',
  hosting_provider: '',
  website_platform: '',
  google_email: '',
  meta_business: '',
  stripe_email: '',
  other_access: '',

  // Section 10: Timeline & Budget
  start_date: '',
  completion_date: '',
  budget: '',
  deadline_details: '',

  // Section 11: Preferred Communication
  communication: [] as string[],        // checkbox array

  // Section 12: Additional Information
  additional_info: '',

  // Section 13: Client Approval
  client_name: '',
  approval_date: '',
  agreement: false,
});

// errors: validation error messages keyed by field name
const [errors, setErrors] = useState<Record<string, string>>({});

// UI state
const [uploading, setUploading] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [submitError, setSubmitError] = useState('');
```

### Event Handlers

**`handleInputChange(e: ChangeEvent)`**
- Updates state for text/email/url/date inputs
- Runs validation on that field in real-time
- Updates error state if validation fails

**`handleCheckboxChange(name: string, value: string, isChecked: boolean)`**
- Adds/removes value from checkbox array
- Validates array is not empty (for required checkboxes like "Services")

**`handleFileChange(e: ChangeEvent)`**
- Stores FileList from input
- Validates file count (max 5), types (pdf, doc, docx, jpg, png, gif), sizes (max 5MB each)
- Shows validation errors immediately

**`handleSubmit(e: FormEvent)`**
- Prevents default form submission
- Validates entire form
- If valid:
  - Uploads files to `/api/intake/upload`
  - Receives file URLs in response
  - Submits form data + file URLs to Formspree
  - Shows success message
- If invalid:
  - Scrolls to first error
  - Shows validation summary
  - Does not submit

---

## Validation Strategy

### Required Fields

These fields must be filled:
- Full Name (Section 01)
- Company Name (Section 01)
- Phone Number (Section 01)
- Email Address (Section 01)
- Project Description (Section 04)
- Services (at least one checkbox, Section 03)
- Client Name (Section 13)
- Approval Date (Section 13)
- Agreement checkbox (Section 13)

### Format Validation

| Field Type | Validation Rule | Error Message |
|---|---|---|
| Email | Must contain `@` and domain | "Please enter a valid email address" |
| Phone | Numbers and optional `+`, `-`, `()` spaces | "Please enter a valid phone number" |
| URL (website, social media) | Must start with `https://` or `http://` | "Please enter a valid URL" |
| Date | Must be a valid date | "Please enter a valid date" |
| Checkbox arrays (services, communication, assets) | At least one checked (if required) | "Please select at least one option" |

### File Validation

- **Max files:** 5
- **Max size per file:** 5MB
- **Allowed types:** `.pdf`, `.doc`, `.docx`, `.jpg`, `.png`, `.gif`
- **Error message:** "File too large (max 5MB)" or "File type not allowed"

### Real-Time Feedback

- As user types, field is validated continuously
- Field border turns red if invalid
- Error message appears below field
- Field border turns green when valid (optional, for positive feedback)
- User cannot submit form if any required field is invalid

### On Submit

- All fields are validated one final time
- If any errors found:
  - Form does not submit
  - Page scrolls to first error
  - Error summary shown: "Please fix the highlighted fields"
- If no errors:
  - Proceed to file upload and submission

---

## File Upload API Endpoint

### Endpoint: `POST /api/intake/upload`

**Request:**
```
Content-Type: multipart/form-data
Body: FormData with key "files" containing File[] array
```

**Response (Success):**
```json
{
  "success": true,
  "urls": [
    "/uploads/intake/1719374400000-logo.png",
    "/uploads/intake/1719374400001-brandguide.pdf"
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File too large (max 5MB)"
}
```

### Validation in Endpoint

- **File count:** Max 5 files
- **File size:** Max 5MB per file
- **File type:** Only `.pdf`, `.doc`, `.docx`, `.jpg`, `.png`, `.gif` allowed
- **Return 400** if validation fails
- **Return 500** if disk write fails

### File Storage

- **Directory:** `/public/uploads/intake/`
- **Filename pattern:** `[timestamp]-[original-filename]`
  - Example: `1719374400000-company-logo.png`
  - Timestamp prevents filename collisions
- **Accessible via:** `/uploads/intake/[filename]` (public URL)

### Error Handling

- **Invalid file type:** Return 400 with message "File type not allowed"
- **File too large:** Return 400 with message "File too large (max 5MB)"
- **Too many files:** Return 400 with message "Maximum 5 files allowed"
- **Disk write error:** Return 500 with message "File upload failed, please try again"
- **Form component:** Shows user-friendly error toast/banner

---

## Form Submission Flow

### Step 1: User Clicks "Submit Client Intake"

Form component's `handleSubmit()` is triggered.

### Step 2: Validate All Fields

All form fields are validated using the validation rules from Section 4.

**If validation fails:**
- Set error state with all field errors
- Scroll to first invalid field
- Display error banner: "Please fix the highlighted fields"
- Stop process, return to user

**If validation passes:**
- Continue to Step 3

### Step 3: Upload Files (if any)

If user selected files:
- Set `uploading` state to `true` (show "Uploading files..." indicator)
- Create FormData with files
- POST to `/api/intake/upload`
- Wait for response

**If upload fails:**
- Show error message: "File upload failed. Please try again."
- Reset `uploading` state
- Stop process, return to user

**If upload succeeds:**
- Store returned file URLs in form data
- Continue to Step 4

### Step 4: Submit to Formspree

Construct form submission:
```javascript
{
  full_name: formData.full_name,
  company_name: formData.company_name,
  // ... all form fields
  file_urls: urls,  // array of uploaded file URLs from Step 3
}
```

POST to Formspree endpoint (from `.env.local`):
```
https://formspree.io/f/[YOUR_FORMSPREE_ID]
```

**If submission fails:**
- Show error message: "Submission failed. Please try again or contact support."
- Reset form state (keep data)
- Stop process, return to user

**If submission succeeds:**
- Continue to Step 5

### Step 5: Show Success Message

- Set `submitted` state to `true`
- Display success overlay:
  - ✅ "Thank you! We received your intake form"
  - "We'll review your information and contact you within 2 business days"
  - Button: "Return to home" (navigates to `/`)
  - Button: "Submit another form" (clears form, stays on `/intake`)

---

## Styling & Design System

### Color Palette (from original CSS)

```css
--bg: #02070d;                 /* Dark navy background */
--panel: rgba(4, 18, 33, 0.82); /* Semi-transparent panel */
--blue: #00aeff;               /* Bright cyan accent */
--blue2: #007bff;              /* Darker blue for gradients */
--text: #eef8ff;               /* Light text */
--muted: #91c8e8;              /* Muted text for labels */
--line: rgba(0, 174, 255, 0.55); /* Border color */
```

### Components

**Hero Section:**
- Centered badge with "W²" logo
- Large title: "WISE² Client Information Form"
- Tagline: "One Platform. Infinite Knowledge. Unlimited Creation."
- Subtitle: "Fill this out so we can understand your business, your project, and what needs to be built."
- Gradient background, blue glow effect

**Form Panels (13 sections):**
- Bordered container with semi-transparent background
- Section heading in uppercase, blue, letter-spaced
- Form fields organized in grid (2 columns on desktop, 1 on mobile)
- Error message in red below invalid field
- Border highlight on invalid/focused fields

**Input Fields:**
- 12px padding
- Blue border (default), brighter on focus
- Rounded corners (10px)
- Dark background
- Light text color

**Checkboxes:**
- Grid layout: 3 columns on desktop, 1 on mobile
- Padded container with subtle border
- Inline label + checkbox

**Textarea:**
- Min-height: 95px
- Resizable vertically

**File Upload:**
- Standard HTML `<input type="file" multiple>`
- Accept: `.pdf,.doc,.docx,.jpg,.png,.gif`
- Max 5 files shown in input

**Submit Button:**
- Full width
- Gradient blue background
- Uppercase text, bold, letter-spaced
- Glow shadow effect
- Hover: brightness increase

**Error Messages:**
- Red text, positioned below field
- Font-size: 12px
- Max-width: match field width

**Success Overlay:**
- Modal/overlay centered on screen
- Checkmark icon, large headline
- Success message text
- Buttons: "Return home", "Submit another form"

### Responsive Design

**Desktop (1024px+):**
- Max-width: 1180px
- Form fields in 2-column grid
- Full horizontal padding

**Tablet (768px - 1023px):**
- Form fields in 1-column grid
- Reduced padding
- Maintained readability

**Mobile (< 768px):**
- Single column layout
- Form fields full width
- Larger touch targets for inputs
- Reduced font sizes for headings
- Checkbox grid: 1 column instead of 3

**Implementation:** Tailwind CSS responsive classes (`grid-cols-2 md:grid-cols-1`, `p-7 md:p-4`, etc.)

---

## Error Handling & Edge Cases

### Network Errors

- **File upload fails:** Show toast: "Failed to upload files. Please check your connection and try again."
- **Formspree submission fails:** Show toast: "Submission failed. Please try again or contact support@wise2.net"
- **User can retry** without losing form data

### Validation Edge Cases

- **User clears all services checkboxes:** Show error "Please select at least one service"
- **User enters future date for "Approval Date":** Allow (user may be pre-filling)
- **User uploads 0 files:** Allow (file upload is optional)
- **User enters phone without area code:** Allow if it has numbers (flexible validation)
- **User navigates away before submit:** Browser warning (optional, using `beforeunload` event)

### Success Confirmation

- After successful Formspree submission, show overlay (not a separate page)
- User can submit another form or return home
- No page reload required

---

## Testing Strategy

### Manual Testing Checklist

- [ ] All 13 form sections render correctly
- [ ] Real-time validation triggers on each field type
- [ ] Error messages appear and disappear correctly
- [ ] Checkbox groups work (add/remove values)
- [ ] File upload accepts valid files, rejects invalid ones
- [ ] Submit is disabled if required fields are empty
- [ ] Successful submission shows overlay
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Formspree receives all data correctly
- [ ] File URLs appear in Formspree email

### No unit tests required (per CLAUDE.md guidelines).

---

## Dependencies & Environment

### New Dependencies

None — uses existing packages:
- `next` 16.2.7
- `react` 19.2.4
- `tailwind` (already configured)

### Environment Variables

Requires Formspree ID in `.env.local`:
```
NEXT_PUBLIC_FORMSPREE_ID=xxxxxxxx
```

(or hardcode in page if not sensitive)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- File upload API support required
- FormData API required
- ES6+ JavaScript

---

## Success Criteria

✅ Form renders at `/intake`  
✅ All 13 sections visible and functional  
✅ Real-time validation works for all field types  
✅ File upload endpoint accepts/rejects files correctly  
✅ Successful submission shows success message  
✅ Formspree receives all data + file URLs  
✅ Form is responsive on all device sizes  
✅ Error messages are user-friendly  
✅ TypeScript compilation succeeds (`npx tsc --noEmit`)

---

## Timeline & Scope

**Scope:** Build `/intake` page with form validation and file upload  
**Out of scope:** Email templates, admin dashboard for viewing submissions, file storage cleanup  
**Estimated size:** Small to medium (2-4 implementation tasks)

---

## Handoff Notes

- Original static HTML/CSS at `/home/ubuntu/Desktop/wise2.net/` (for reference)
- Formspree ID must be configured before deployment
- File upload directory (`/public/uploads/intake/`) must have write permissions
- Test file upload on production VPS before going live
