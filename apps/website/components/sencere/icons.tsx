export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.39V15.6a4.6 4.6 0 1 1-3.98-4.56v2.5a2.1 2.1 0 1 0 1.48 2.06V2h2.44a4.28 4.28 0 0 0 3.2 3.9v1.92Z" />
    </svg>
  );
}

export function WiseShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 2 4 6.5v8c0 8.2 5.2 14.4 12 17.5 6.8-3.1 12-9.3 12-17.5v-8L16 2Z"
        fill="#B91C2B"
      />
      <path
        d="M16 2 4 6.5v8c0 8.2 5.2 14.4 12 17.5V2Z"
        fill="#7F1420"
      />
      <path
        d="M9.5 15.5 12 21l2-4.2 2 4.2 2.5-5.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
