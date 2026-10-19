# WISE² IMP Website Companion

This package is the browser adapter for the **existing** IMP task engine at `../wise-imp-desktop/src/companion-core.js`. It is not a replacement desktop pet or a production deployment.

## Current implementation

`createWebsiteCompanion({ navigate, getPage, onStatus, confirmAction })` returns a TaskEngine with one browser-safe, verified skill: `website.navigate`.

```js
import { createWebsiteCompanion } from './companion.js';

const imp = createWebsiteCompanion({
  navigate: path => window.history.pushState({}, '', path),
  getPage: () => window.location.pathname,
  onStatus: task => console.log(task.status, task.detail),
  confirmAction: async () => false
});

await imp.run('website.navigate', { path: '/products' });
```

In a SPA, call your framework's router in `navigate` and let it update the page before verification. The code above changes history but does not mount a new page.

## Next integration gates

1. Identify the production website's framework, layout, router, CSP, and build/deploy process.
2. Reuse **approved IMP sprite assets** from the existing desktop package. Provide a browser animation adapter for idle, flying, landing, thinking, speaking, working, success, and error; keep pointer interactions accessible.
3. Mount a persistent floating character once in the site's root layout. Lazy-load the chat panel and respect reduced-motion settings.
4. Add page-specific public knowledge and verified navigation/contact/demo actions. Do not invent prices or results.
5. Provide authenticated owner mode through a server-side authorization layer. Never expose desktop filesystem, application launching, credentials, or internal skill endpoints to anonymous visitors.
6. Test mobile, keyboard/screen-reader interaction, route changes, and failure recovery. Run production build and smoke tests before deployment.

No live deployment, AI endpoint, or production tests have been performed yet.
