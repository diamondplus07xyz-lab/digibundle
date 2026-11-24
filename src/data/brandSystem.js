/**
 * DigiBundle Official Brand & Design System
 * Enterprise-grade tokens and specifications for consistent branding across Storefront & Admin Portal.
 */

export const BRAND_SYSTEM = {
  identity: {
    brandName: "DigiBundle",
    tradeName: "DigiBundle",
    tagline: "India's Most Affordable Ready-to-Post HD Reels Store",
    promise: "100% Watermark-Free 1080p Full HD Vertical Video Reels with Instant Google Drive Delivery",
    foundedYear: 2026,
    supportEmail: "support@digibundle.in",
    supportPhone: "+91 7017324978"
  },

  colors: {
    // Primary Vibrant Gradients (Video / Reels / Viral theme)
    primary: {
      gradient: "from-purple-600 via-pink-600 to-rose-500",
      start: "#7C3AED",     // Electric Violet
      middle: "#EC4899",    // Vibrant Magenta / Pink
      end: "#F43F5E",       // Coral Rose
      rgb: "124, 58, 237"
    },

    // Secondary Accent (Urgency & Conversions)
    accent: {
      yellow: "#FDE047",    // Electric Gold / Yellow
      amber: "#F59E0B",     // Warm Amber
      gradient: "from-amber-400 to-orange-500"
    },

    // Trust / Verification / Success
    success: {
      emerald: "#10B981",
      emeraldLight: "#34D399",
      gradient: "from-emerald-500 to-teal-600"
    },

    // Backgrounds
    backgrounds: {
      light: "#FFFFFF",
      lightMuted: "#F8FAFC", // Slate-50
      dark: "#020617",       // Slate-950
      darkCard: "#0B0F19",   // Rich Midnight
      darkBorder: "#1E293B"  // Slate-800
    }
  },

  typography: {
    primaryFont: "'Sora', sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    }
  },

  assets: {
    logos: {
      lightMode: "/logo.png",
      lightModeVector: "/logo.svg",
      darkMode: "/logo-dark.png",
      darkModeVector: "/logo-dark.svg"
    },
    icons: {
      master512: "/brand-icon.png",
      masterVector: "/brand-icon.svg",
      pwa192: "/icon-192.png",
      pwa512: "/icon-512.png",
      appleTouch: "/apple-touch-icon.png",
      faviconSvg: "/favicon.svg",
      favicon32: "/favicon-32x32.png",
      favicon16: "/favicon-16x16.png"
    },
    social: {
      ogImage: "/social-share.png",
      dimensions: { width: 1200, height: 630 }
    }
  }
};

export default BRAND_SYSTEM;
