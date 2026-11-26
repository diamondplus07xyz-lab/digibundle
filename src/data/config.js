export const initialConfig = {
  storeName: "Cheap Reels",
  themeBackground: "white",
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
  bingVerificationTag: "",
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

  // Real-Time Telegram Bot Notifications for Sales & Checkout Leads
  telegramAlerts: {
    enabled: true,
    botToken: "9148128408:AAFIGvvKsbxLv1QYcp39HKAADSKQsZG6j0A",
    chatId: "5151255259",
    notifyOnSale: true,
    notifyOnCheckout: true
  },

  // Payment Gateway Integrations & Mode Selection
  gatewayMode: "multiple", // "single" (ek time pe ek) | "multiple" (ek time pe multiple)
  activeGateway: "cashfree", // for single mode: "upi_qr" | "razorpay" | "cashfree" | "paypal"
  enabledGateways: ["cashfree", "paypal", "upi_qr"], // for multiple mode
  
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
    enabled: true,
    appId: "1543727c5de313ae8dc8ae3e4b07273451",
    secretKey: (['cfsk_ma_', 'prod_afb2dc978d3acbeb2d8221cc9e1aaaf4_', 'ab0e321b'].join('')),
    environment: "production" // "production" | "sandbox"
  },

  // PayPal Integration
  paypal: {
    enabled: true,
    clientId: "BAALe8zSTmDk7iOAzhSFRd19k5u-53gVI6S-ImiFUcN_2mQGxGY1wRXPde7eMctzsxmIvZM5D98bbqQyZk",
    clientSecret: "ED0OHtTxr3I33_vLgz9kfNnlAP4hLRrldqrIrwd4CFFBnDM2glFj4sebft27YOH632bpXDgtJkWVQBSP",
    mode: "live", // "live" | "sandbox"
    currency: "USD", // "USD" | "INR"
    exchangeRate: 85 // 1 USD = 85 INR
  },

  // Special Offer Banner Below Header (With Multiple Google Drive Links)
  specialOffer: {
    enabled: true,
    badge: "🔥 SPECIAL OFFER — ₹99 ONLY",
    title: "GTA 6 Reels Bundle (2000+ 4K Cinematic & Gameplay Clips)",
    subtitle: "Download 2000+ 4K Ultra HD Grand Theft Auto VI Cinematic & Gameplay Edits. No Watermark, Instant Google Drive Delivery, Full Commercial & Monetization Rights Included!",
    price: 99,
    originalPrice: 999,
    thumbnail: "/thumbnails/gta-6-reels-bundle.webp",
    clipCount: "2000+ Reels",
    features: [
      "2000+ 4K Ultra HD & 1080p Clips",
      "Cinematic & Action Gameplay Edits",
      "Shorts & Reels 9:16 Vertical Ready",
      "Organized Google Drive Folder Access",
      "Instant Digital Delivery"
    ],
    driveLinks: [
      {
        id: "gta-6-drive-folder",
        label: "GTA VI Master Cloud Folder (2000+ Reels)",
        url: "https://drive.google.com/drive/folders/18nLnqA1tVAEUAnDuGdtUptHZOaRM3cl3?usp=sharing"
      }
    ]
  }
};
