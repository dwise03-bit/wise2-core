/**
 * Skip Link Component
 * Allows keyboard users to jump directly to main content
 * Follows WCAG 2.1 Level A accessibility guidelines
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}
