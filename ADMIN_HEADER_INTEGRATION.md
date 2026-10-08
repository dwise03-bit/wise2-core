# Admin Header Integration Guide

## Option 1: React Component Integration (Recommended)

Add the AdminHeader component to your Next.js layout for a native React integration:

### Step 1: Import the component in your layout

```tsx
// app/layout.tsx (or your root layout)
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AdminHeader />
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Ensure the component is available

The component file should be at: `/components/admin/AdminHeader.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

export function AdminHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('blakkhail-admin-token');
    const user = localStorage.getItem('blakkhail-admin-user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setUserEmail(userData.email);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('blakkhail-admin-token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(() => {
        localStorage.removeItem('blakkhail-admin-token');
        localStorage.removeItem('blakkhail-admin-user');
        setIsAuthenticated(false);
        setUserEmail('');
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 9999,
      padding: '1rem 2rem',
      background: 'rgba(0, 0, 0, 0.9)',
      borderLeft: '2px solid #e8c56b',
      borderBottom: '2px solid #e8c56b',
      borderRadius: '0 0 0 8px'
    }}>
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#e8c56b', fontSize: '0.875rem', fontWeight: 700 }}>
            ✓ {userEmail}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#e8c56b',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            LOGOUT
          </button>
        </div>
      ) : (
        <a
          href="/blakkhail-admin-tv-login.html"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#e8c56b',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}
        >
          🔐 Admin Login
        </a>
      )}
    </div>
  );
}
```

---

## Option 2: HTML Injection (Quick Implementation)

If you want immediate integration without modifying the layout, add this script to your layout:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* ... existing head content ... */}
      </head>
      <body>
        {/* Inject admin header */}
        <script dangerouslySetInnerHTML={{
          __html: `
            fetch("/admin-header.html")
              .then(r => r.text())
              .then(html => {
                const el = document.createElement("div");
                el.innerHTML = html;
                document.body.appendChild(el);
              })
              .catch(err => console.error("Failed to load admin header:", err));
          `
        }} />
        
        {children}
      </body>
    </html>
  );
}
```

---

## Option 3: Nginx-Level Injection

If you want to inject it without modifying the Next.js code, update your Nginx configuration:

```nginx
# In your blakkhail.com server block
location / {
    proxy_pass http://your-nextjs-server;
    # ... other proxy settings ...
    
    # Inject admin header into HTML responses
    sub_filter '</body>' '<script>fetch("/admin-header.html").then(r=>r.text()).then(h=>{const e=document.createElement("div");e.innerHTML=h;document.body.appendChild(e)}).catch(()=>{})</script></body>';
    sub_filter_once on;
    proxy_set_header Accept-Encoding "";
}
```

---

## Features

✅ Fixed position (top-right corner)  
✅ Shows "🔐 Admin Login" when logged out  
✅ Shows email in green badge when logged in  
✅ One-click logout  
✅ Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A)  
✅ Responsive design (mobile-friendly)  
✅ Gold & black Blakkhail branding  
✅ Auto-syncs across tabs  

---

## Testing

After integration, test:

1. **Login:** Navigate to `/blakkhail-admin-tv-login.html` and log in
2. **Button State:** Button should show your email in green
3. **Keyboard:** Press Ctrl+Shift+A to go to dashboard
4. **Logout:** Click button to logout
5. **Persistence:** Button state persists across page reloads

---

## API Endpoints Used

- `POST /api/auth/login` - Authenticate
- `POST /api/auth/verify` - Check session
- `POST /api/auth/logout` - Clear session

All endpoints handle CORS automatically via Nginx proxy.

---

## Troubleshooting

**Button not showing?**
- Check browser console for errors
- Verify localStorage is enabled
- Ensure `/admin-header.html` exists and is accessible

**Login not working?**
- Test with curl: `curl -X POST https://blakkhail.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"blakkhail@gmail.com","password":"Piffcity"}'`
- Check Nginx is proxying `/api/` to admin service
- Verify admin service is running on port 3011

**Styling issues?**
- Clear browser cache
- Check z-index conflicts (admin header uses z-index: 9999)
- Verify CSS is being applied (inspect with DevTools)

---

## Production Deployment

The admin header is already deployed to production at:
- Service: `https://blakkhail.com/api/` (Nginx proxy to port 3011)
- Login: `https://blakkhail.com/blakkhail-admin-tv-login.html`
- Dashboard: `https://blakkhail.com/blakkhail-admin-dashboard.html`

Choose one of the integration methods above to add the button to your storefront.
