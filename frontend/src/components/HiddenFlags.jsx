import { useEffect } from 'react';

// Hidden element flag
export function HiddenElementFlag() {
  return (
    <p style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
      FLAG{'{invisible_but_here}'}
    </p>
  );
}

// Base64 encoded flag in footer
export function Base64Flag() {
  return (
    <div style={{ display: 'none' }}>
      RkxBR3tCYXNlNjRfZm9yX3RoZV93aW59
    </div>
  );
}

// Initialize hidden flags on app load
export function initializeHiddenFlags() {
  // This will be called when app loads
  if (typeof window !== 'undefined') {
    // Add to window object (visible in console)
    window.__hiddenFlag = "FLAG{window_object_inspection}";
  }
}

