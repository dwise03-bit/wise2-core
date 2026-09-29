# WISE² Branding Implementation Guide v2.0
**STATUS: 🔒 LOCKED 2026-09-13**

## Quick Start

All new pages/components must use this structure:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --wise-dark: #050607;
      --wise-darker: #0a0f1a;
      --wise-blue: #00D9FF;
      --wise-gold: #C4A369;
      --wise-green: #00FF7F;
      --wise-gray-light: #D1D5DB;
    }
    
    body {
      background: var(--wise-dark);
      color: var(--wise-gray-light);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .header {
      background: linear-gradient(135deg, var(--wise-dark) 0%, var(--wise-darker) 100%);
      border-bottom: 3px solid var(--wise-blue);
      padding: 20px;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: var(--wise-blue);
    }
    
    .tagline {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--wise-green);
    }
    
    .cta-primary {
      background: var(--wise-blue);
      color: var(--wise-dark);
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
    }
    
    .cta-secondary {
      background: var(--wise-gold);
      color: var(--wise-dark);
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
    }
    
    .status-success {
      color: var(--wise-green);
    }
    
    .card {
      background: rgba(10, 15, 26, 0.5);
      border: 1px solid rgba(0, 217, 255, 0.2);
      border-radius: 8px;
      padding: 20px;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">WISE²</div>
    <div class="tagline">BUILD DIFFERENT</div>
  </header>
  
  <!-- Page content here -->
</body>
</html>
```

---

## File-by-File Implementation

### 1. **Homepage** (`apps/website/src/pages/index.tsx`)

Add:
```tsx
// Header component with logo
<header style={{ background: '#050607', borderBottom: '3px solid #00D9FF' }}>
  <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.2em', color: '#00D9FF' }}>
    WISE²
  </div>
  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#00FF7F' }}>
    BUILD DIFFERENT
  </div>
</header>

// Hero section
<section style={{ background: '#050607', padding: '60px 40px' }}>
  <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 700, textTransform: 'uppercase' }}>
    BUILDING EMPIRES.<br/>
    <span style={{ color: '#00FF7F' }}>CHANGING CULTURE.</span><br/>
    TOGETHER.
  </h1>
  
  <p style={{ color: '#D1D5DB', fontSize: '16px', marginBottom: '30px' }}>
    One platform for software, automation, communications, infrastructure, AI, and real-world results.
  </p>
  
  <button style={{ background: '#00D9FF', color: '#050607', padding: '12px 24px', fontWeight: 600 }}>
    BOOK A BUSINESS AUDIT →
  </button>
</section>
```

### 2. **Navigation** (all pages)

Update nav background:
```css
nav {
  background: #050607;
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
}

nav a {
  color: #D1D5DB;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

nav a:hover {
  color: #00D9FF;
}
```

### 3. **Dashboard** (`apps/dashboard/`)

Replace all colors:
```css
/* Old → New */
body { background: white; } /* → #050607 */
h1 { color: #333; } /* → #D1D5DB */
button { background: #0066cc; } /* → #00D9FF */
.success { color: #10b981; } /* → #00FF7F */
.error { color: #ef4444; } /* → #FF4444 */
```

### 4. **Cards & Components**

All cards use:
```css
.card {
  background: rgba(10, 15, 26, 0.5);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 8px;
}

.card.success {
  border-left: 4px solid #00FF7F;
}

.card.critical {
  border-left: 4px solid #FF4444;
}
```

### 5. **Email Templates**

```html
<table width="100%" style="background: #050607; color: #D1D5DB; padding: 20px;">
  <tr>
    <td align="center">
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 0.15em; color: #00D9FF;">
        WISE²
      </div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #00FF7F;">
        BUILD DIFFERENT
      </div>
    </td>
  </tr>
  <!-- Email content -->
  <tr>
    <td>
      <a href="#" style="background: #00D9FF; color: #050607; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 6px; font-weight: 600;">
        CALL TO ACTION
      </a>
    </td>
  </tr>
</table>
```

### 6. **Admin UI** (`apps/admin/`)

Replace header:
```tsx
<header style={{ 
  background: 'linear-gradient(135deg, #050607 0%, #0a0f1a 100%)',
  borderBottom: '3px solid #00D9FF',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}}>
  <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.2em', color: '#00D9FF' }}>
    WISE² ADMIN
  </div>
  <nav style={{ display: 'flex', gap: '30px' }}>
    <a href="/admin" style={{ color: '#D1D5DB', textDecoration: 'none', textTransform: 'uppercase' }}>Dashboard</a>
    <a href="/admin/users" style={{ color: '#D1D5DB', textDecoration: 'none', textTransform: 'uppercase' }}>Users</a>
  </nav>
</header>
```

---

## Color Application Reference

### Text Colors
```css
/* Primary text */
color: #D1D5DB; /* Light gray on dark bg */

/* Headings */
color: white; /* Or use --wise-blue for emphasis */

/* Links/CTAs */
color: #00D9FF; /* Cyan */

/* Success/Active */
color: #00FF7F; /* Neon green */

/* Error */
color: #FF4444; /* Red */
```

### Background Colors
```css
/* Main background */
background: #050607; /* Dark navy */

/* Secondary background */
background: #0a0f1a; /* Darker charcoal */

/* Card background */
background: rgba(10, 15, 26, 0.5); /* Transparent overlay */

/* Button primary */
background: #00D9FF; /* Cyan */

/* Button secondary */
background: #C4A369; /* Gold */
```

### Border Colors
```css
/* Header border */
border-bottom: 3px solid #00D9FF; /* Cyan */

/* Card border */
border: 1px solid rgba(0, 217, 255, 0.2); /* Light cyan */

/* Success card */
border-left: 4px solid #00FF7F; /* Neon green */

/* Critical card */
border-left: 4px solid #FF4444; /* Red */
```

---

## Component Checklist

Every component must have:

- [ ] Dark navy background (`#050607`)
- [ ] Cyan/green accent colors
- [ ] Uppercase headers with letter-spacing
- [ ] Proper contrast ratios (WCAG AA)
- [ ] WISE² logo in header or footer
- [ ] "BUILD DIFFERENT" tagline where appropriate
- [ ] Mobile responsive (buttons, text, spacing)
- [ ] Hover states on all interactive elements

---

## Pages to Update (Priority Order)

### 🔴 Critical (This Week)
1. ✅ Homepage (`/`)
2. ✅ blakkhail launch audit
3. Dashboard (`/dashboard`)
4. Admin UI (`/admin`)

### 🟠 High (Next Week)
5. Pricing page (`/pricing`)
6. Services page (`/services`)
7. Contact page (`/contact`)
8. Email templates (all)

### 🟡 Medium (Later)
9. Blog/content pages
10. Mobile app UI
11. API documentation
12. Help/support pages

---

## Testing Checklist

For each page, verify:

- [ ] Colors match hex values exactly
- [ ] Logo is visible and centered
- [ ] Hero message is prominent (if applicable)
- [ ] Buttons are clickable and styled correctly
- [ ] Text contrast is readable (WCAG AA minimum)
- [ ] Responsive on mobile (375px width)
- [ ] Dark mode looks correct
- [ ] No console errors

---

## Quick Copy-Paste Snippets

### Header
```html
<header style="background: linear-gradient(135deg, #050607 0%, #0a0f1a 100%); border-bottom: 3px solid #00D9FF; padding: 20px;">
  <div style="font-size: 32px; font-weight: 900; letter-spacing: 0.2em; color: #00D9FF;">WISE²</div>
  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #00FF7F;">BUILD DIFFERENT</div>
</header>
```

### Primary Button
```html
<button style="background: #00D9FF; color: #050607; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
  BUTTON TEXT
</button>
```

### Card
```html
<div style="background: rgba(10, 15, 26, 0.5); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 8px; padding: 20px;">
  Card content here
</div>
```

### Status Indicator
```html
<span style="color: #00FF7F; font-weight: 600;">✅ READY</span>
```

---

## Files Modified

Track branding updates in this section:

| File | Status | Date | Notes |
|------|--------|------|-------|
| `docs/brand-guidelines.md` | ✅ Complete | 2026-09-13 | Master brand spec |
| `blakkhail_launch_audit.html` | ✅ Complete | 2026-09-13 | Audit with dark theme |
| Homepage (apps/website) | 🔄 In Progress | 2026-09-13 | Hero section to update |
| Dashboard (apps/dashboard) | ⏳ Pending | — | All colors need update |
| Admin UI (apps/admin) | ⏳ Pending | — | Header/nav needs update |

---

**Last Updated**: 2026-09-13  
**Owner**: dwise03@gmail.com  
**Status**: 🔒 LOCKED FOR PRODUCTION
