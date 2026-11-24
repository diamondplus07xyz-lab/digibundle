export const initialConfig = {
  storeName: "Cheap Reels",
  tagline: "India's Most Affordable Ready-to-Post HD Reels Store",
  logo: "/logo.png",
  footerLogo: "/logo-dark.png",
  favicon: "/brand-icon.png",
  upiId: "cheapreels@upi",
  upiName: "Cheap Reels",
  whatsappNumber: "917017324978",
  supportEmail: "reelscheap@gmail.com",
  bannerText: "LIMITED TIME OFFER: 2,50,000+ Ready Reels Pack at Flat 95% OFF! Instant Google Drive Access in 5 Seconds",
  showTopBanner: true,
  showPurchasePopup: true,
  googleDriveDemoFolder: "https://drive.google.com/drive/folders/1ExampleReelsFolderDemoLink",
  
  // Google Search Console & SEO Configuration
  googleSearchConsoleTag: '<meta name="google-site-verification" content="52iB3jq7O_eOpTnutctWvgYo0yqXIIKMWIpZDpVwyZw" />',
  seoTitle: 'Cheap Reels | 2,50,000+ Ready-to-Post HD Reels Bundles',
  seoDescription: 'Get 2,50,000+ ready-to-post 1080p Full HD watermark-free reels bundles with instant Google Drive cloud links at just ₹29. Instagram, Shorts & Facebook.',
  seoKeywords: 'reels bundle, viral reels, instagram reels pack, motivation reels, ai fitness reels, cheap reels download, watermark free reels 1080p',
  canonicalUrl: 'https://www.cheapreels.in',
  allowRobotsIndex: true,

  // Maintenance Mode Controls (Premium SaaS Experience)
  maintenanceMode: false,
  maintenanceTitle: "We're Making Things Better.",
  maintenanceMessage: "Our team is currently performing scheduled high-performance upgrades, optimizing database queries, and hardening system security to deliver an ultra-fast experience.",
  maintenanceEstimatedTime: "15 - 20 Minutes",
  maintenanceProgress: 68,
  maintenanceReopenTimestamp: "",
  maintenanceTasks: {
    server: "completed",
    database: "in_progress",
    security: "pending"
  },

  // Google Analytics 4 Integration (No code pasting needed)
  googleAnalyticsId: "",

  // Payment Gateway Integrations & Mode Selection
  gatewayMode: "single", // "single" (ek time pe ek) | "multiple" (ek time pe multiple)
  activeGateway: "upi_qr", // for single mode: "upi_qr" | "razorpay" | "cashfree" | "paypal"
  enabledGateways: ["upi_qr", "razorpay", "cashfree"], // for multiple mode
  
  // Direct UPI QR
  upiGateway: {
    enabled: true,
    upiId: "cheapreels@upi",
    payeeName: "Cheap Reels"
  },

  // Razorpay Integration
  razorpay: {
    enabled: false,
    keyId: "",
    keySecret: "",
    mode: "live" // "live" | "test"
  },

  // Cashfree Integration
  cashfree: {
    enabled: false,
    appId: "",
    secretKey: "",
    environment: "production" // "production" | "sandbox"
  },

  // PayPal Integration
  paypal: {
    enabled: false,
    clientId: "",
    clientSecret: "",
    mode: "live", // "live" | "sandbox"
    currency: "USD", // "USD" | "INR"
    exchangeRate: 85 // 1 USD = 85 INR
  },

  // Special Offer Banner Below Header (With Multiple Google Drive Links)
  specialOffer: {
    enabled: true,
    badge: "EXCLUSIVE CREATOR DEAL",
    title: "1,50,000+ Ultimate Creator Reels Mega Bundle",
    subtitle: "Unlock 3 Massive Multi-Part Cloud Folders + Bonus Viral Audio Tracks with Lifetime Access!",
    price: 199,
    originalPrice: 2999,
    thumbnail: "/special-offer.webp",
    clipCount: "1,50,000+ Reels",
    features: [
      "3 Dedicated Google Drive Folders Included",
      "100% Watermark-free 1080p Full HD MP4",
      "Bonus: 5,000+ Trending Background MP3s"
    ],
    driveLinks: [
      {
        id: "link-1",
        label: "Drive Folder Part 1 (Motivation, AI & Finance)",
        url: "https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU"
      },
      {
        id: "link-2",
        label: "Drive Folder Part 2 (Fitness, Luxury, Anime & Devotional)",
        url: "https://drive.google.com/drive/folders/1XZ00wKCxPruEpTyDmRxtLzP3GxPG3N1W"
      },
      {
        id: "link-3",
        label: "Bonus Cloud Folder (5,000+ Trending MP3 Audios)",
        url: "https://drive.google.com/drive/folders/1zReKMy4EctgGD2MWsL6SS25qXhQwjlPq"
      }
    ]
  }
};
