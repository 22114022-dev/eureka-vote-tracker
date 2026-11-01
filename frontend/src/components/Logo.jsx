import React from 'react';

// Sprout growing out of a live pulse line: "KHNN" + real-time tracking.
export default function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Euréka 2026 KHNN">
      <rect width="64" height="64" rx="16" fill="#14152b" />
      <line x1="32" y1="42" x2="32" y2="24" stroke="#2dd4bf" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 33 C21 33 16 27 16 19 C25 19 31 24 32 33Z" fill="#2dd4bf" />
      <path d="M32 27 C43 27 48 21 48 11 C39 11 33 17 32 27Z" fill="#c084fc" />
      <polyline
        points="7,50 20,50 26,43 32,57 38,46 43,50 57,50"
        fill="none"
        stroke="#ec4899"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
