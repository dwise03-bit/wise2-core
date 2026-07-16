'use client';

import { usePathname } from 'next/navigation';

// Pages that render their own <footer> and must not get the shared site footer on top of it.
const PAGES_WITH_OWN_FOOTER = ['/'];

export function SiteFooter() {
  const pathname = usePathname();

  if (PAGES_WITH_OWN_FOOTER.includes(pathname)) {
    return null;
  }

  return (
    <footer className="bg-wise-surface border-t border-wise-subtle py-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-bold mb-4">WISE²</h3>
            <p className="text-sm text-wise-muted">AI-powered brand operating system</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-wise-muted">
              <li><a href="/#sound-labs" className="hover:text-wise-primary transition-colors">Sound Labs</a></li>
              <li><a href="/#" className="hover:text-wise-primary transition-colors">Pricing</a></li>
              <li><a href="/#" className="hover:text-wise-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-wise-muted">
              <li><a href="#" className="hover:text-wise-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-wise-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-wise-primary transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-wise-muted">
              <li><a href="#" className="hover:text-wise-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-wise-primary transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-wise-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-wise-subtle pt-8 text-center text-sm text-wise-muted">
          <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
