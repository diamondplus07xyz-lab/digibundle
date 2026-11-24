import React, { useState } from 'react';

/**
 * Premium BrandLogo Component for DigiBundle
 * Features:
 * - High-DPI Vector Crispness (SVG native + fallback)
 * - Automatic light and dark variant styling
 * - Zero background seams or clipping
 * - Graceful fallback to uploaded custom logo from storeConfig
 */
export default function BrandLogo({
  variant = 'light', // 'light' | 'dark' | 'icon'
  customSrc = null,
  alt = 'DigiBundle',
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showBadge = true,
  onClick = null
}) {
  const [imgError, setImgError] = useState(false);

  // Height mappings for consistent scale across headers, footers & admin
  const sizeClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-10',
    lg: 'h-10 sm:h-12',
    xl: 'h-12 sm:h-16'
  }[size] || 'h-8 sm:h-10';

  // If icon-only is requested
  if (variant === 'icon') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/brand-icon.png"
          alt={alt}
          width={40}
          height={40}
          className={`${sizeClasses} w-auto aspect-square object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105`}
          onError={(e) => {
            e.currentTarget.src = '/brand-icon.svg';
          }}
        />
      </div>
    );
  }

  // Determine logo source
  let logoSrc = customSrc;
  if (!logoSrc || imgError) {
    if (imgError) {
      logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';
    } else {
      logoSrc = variant === 'dark' ? '/logo-dark.webp' : '/logo.webp';
    }
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={logoSrc}
        alt={alt}
        width={200}
        height={40}
        style={{ aspectRatio: '5 / 1' }}
        className={`${sizeClasses} w-auto max-w-[210px] sm:max-w-[280px] object-contain drop-shadow-sm transition-transform duration-200 hover:scale-[1.02]`}
        onError={() => {
          if (!imgError) {
            setImgError(true);
          }
        }}
      />
    </div>
  );
}
