import React from 'react';

/** La Abejita de WordHive (el mismo icono que la app) junto al nombre. */
export function BrandLogo({ size = 36 }) {
  return (
    <span className="brand-logo">
      <img src="/logo.svg" alt="" width={size} height={size} className="brand-logo__icon" />
      <span className="brand-logo__name">WordHive</span>
    </span>
  );
}
