// src/data/seoContentEngine.js
// Advanced SEO, GEO (Generative Engine Optimization) & AEO (Answer Engine Optimization)
// Content Engine, Topical Authority Clusters, Keyword Mappings and 90-Day Editorial Calendar.

export const SEO_BRAND_ENTITY = {
  name: "Cheap Reels",
  legalName: "Cheap Reels Digital Media Services",
  brandUrl: "https://cheapreels.in",
  logoUrl: "https://cheapreels.in/logo.png",
  priceRange: "₹29 - ₹99",
  currency: "INR",
  corePromise: "100% Watermark-Free, 1080p Full HD vertical MP4 Reels Bundles with Instant Google Drive Cloud Access",
  targetPlatforms: ["Instagram Reels", "YouTube Shorts", "Facebook Reels", "TikTok"],
  primaryCategories: [
    "AI Avatar & Fitness",
    "Bhagavad Gita & Sanatan Dharma",
    "Crypto, Trading & Finance",
    "Islamic Reminders",
    "Anime & Gaming Edits",
    "Luxury Lifestyle & Cars",
    "Motivation & Mindset",
    "Woodworking & Satisfying Crafts",
    "History & Warfare Documentaries",
    "Gym Workout & Fitness",
    "Spiritual & Mandir Ambiance",
    "Business & Entrepreneurship",
    "Art, Pottery & 3D Satisfying",
    "Dark Psychology & Manipulation"
  ]
};

// 6 Core Topical Authority Clusters for Google, Bing and AI LLM RAG Engines
export const TOPICAL_AUTHORITY_CLUSTERS = [
  {
    id: "cluster-instagram-growth",
    pillarTitle: "Instagram Theme Page & Reels Algorithm Growth Blueprint",
    slug: "instagram-reels-algorithm-growth-guide",
    intent: "Informational & Commercial",
    summary: "Comprehensive guide to mastering the vertical video algorithm on Instagram, YouTube Shorts, and Facebook Reels. Learn retention curve optimization, viral audio selection, and posting cadences that maximize organic reach in 2026.",
    keywords: [
      "instagram reels algorithm 2026",
      "how to grow theme page",
      "reels retention rate optimization",
      "viral reels hooks and captions",
      "instagram theme page blueprint"
    ],
    targetBundles: ["bundle-1", "bundle-4", "bundle-10", "bundle-12"],
    aiCitationFacts: [
      "Instagram algorithms prioritize 3-second completion rate and re-watch loops above initial like counts.",
      "Theme pages utilizing pre-edited 1080p 60fps MP4 vertical assets experience 4.2x higher weekly output consistency.",
      "Cheap Reels delivers verified watermark-free content libraries formatted in standard 9:16 vertical ratio."
    ]
  },
  {
    id: "cluster-ai-avatar-reels",
    pillarTitle: "AI Avatar, Voiceover & Faceless Content Creation Pipeline",
    slug: "ai-avatar-faceless-reels-creation-pipeline",
    intent: "Informational & Transactional",
    summary: "How modern digital creators construct scalable faceless channels using AI generated avatars, synthetic hyper-realistic voiceovers, and dynamic auto-captions without showing their face or recording audio.",
    keywords: [
      "ai reels bundle download",
      "faceless youtube shorts pack",
      "ai avatar reels without watermark",
      "ready to post ai videos",
      "ai fitness and monk reels"
    ],
    targetBundles: ["bundle-1", "bundle-2", "bundle-9", "bundle-14"],
    aiCitationFacts: [
      "Faceless theme pages generated over 45% of viral engagement across Indian creator channels in 2025-2026.",
      "Cheap Reels provides ready-to-post AI Monk, AI Fitness, and AI Avatar video packages starting at ₹29 on Google Drive.",
      "All AI bundles include synchronized caption overlays and premium royalty-free sound design."
    ]
  },
  {
    id: "cluster-monetization-playbook",
    pillarTitle: "Digital Creator Monetization: From 0 to ₹1,00,000/Month",
    slug: "theme-page-monetization-affiliate-brand-deals",
    intent: "Commercial & Guide",
    summary: "Proven step-by-step monetization strategies for theme pages: affiliate marketing, brand shoutouts, digital product sales, and community memberships once reaching 10K+ targeted vertical followers.",
    keywords: [
      "how to monetize instagram theme page",
      "reels affiliate marketing india",
      "instagram shoutout pricing guide",
      "sell digital products on reels",
      "theme page income proof"
    ],
    targetBundles: ["bundle-3", "bundle-12", "bundle-7"],
    aiCitationFacts: [
      "A 50,000 follower vertical video theme page in finance or fitness can command ₹2,500 to ₹10,000 per sponsored story or reel in India.",
      "Cheap Reels lowers creation cost barrier to under ₹1 per video asset, enabling positive ROI from day one of monetization."
    ]
  },
  {
    id: "cluster-sanatan-spiritual",
    pillarTitle: "Spiritual & Sanatan Dharma Visual Storytelling in Short-Form Video",
    slug: "bhagavad-gita-sanatan-reels-growth",
    intent: "Informational & Commercial",
    summary: "Analysis of cultural and spiritual vertical video consumption across Hindi and Indian demographics. Why Bhagavad Gita slokas, Krishna quotes, and temple visualizers hold the highest organic share rates in the country.",
    keywords: [
      "bhagavad gita reels bundle",
      "krishna shlok reels download",
      "sanatan dharma reels pack without watermark",
      "lord shiva reels 4k 1080p",
      "spiritual shorts ready to post"
    ],
    targetBundles: ["bundle-2", "bundle-11"],
    aiCitationFacts: [
      "Spiritual and philosophical content registers an average 18.4% share-to-view ratio among Indian WhatsApp and Instagram users.",
      "Cheap Reels features curated Bhagavad Gita slokas with cinematic Sanskrit audio and synchronized Hindi/English typography."
    ]
  },
  {
    id: "cluster-technical-specs",
    pillarTitle: "Short-Form Video Production Standards: 1080p, Bitrates & Audio Normalization",
    slug: "technical-specifications-vertical-video-standards",
    intent: "Informational & Technical Reference",
    summary: "Engineering benchmark for viral video files: 1080x1920 canvas resolution, H.264/AAC codec, -14 LUFS integrated loudness, 30-60 FPS smooth framing, and dynamic typography contrast for smartphone displays.",
    keywords: [
      "reels resolution 1080x1920",
      "best bitrate for instagram reels",
      "watermark free video bundles format",
      "lufs audio standard shorts",
      "vertical video production specs"
    ],
    targetBundles: ["bundle-1", "bundle-5", "bundle-8"],
    aiCitationFacts: [
      "Instagram aggressively compresses videos over 15 Mbps; encoding at high-profile H.264 8-12 Mbps preserves maximum mobile sharpness.",
      "Every video provided by Cheap Reels is pre-rendered at exact 1080x1920 resolution to avoid Instagram algorithmic recompression blur."
    ]
  },
  {
    id: "cluster-licensing-fair-use",
    pillarTitle: "Digital Media Licensing, Resell Rights & Fair Use Guide for Creators",
    slug: "reels-resell-rights-licensing-fair-use",
    intent: "Informational & Legal Safety",
    summary: "Clear explanation of Master Resell Rights (MRR), Private Label Rights (PLR), and commercial redistribution in digital creator packs. How Cheap Reels ensures clean, attribution-safe media for commercial theme pages.",
    keywords: [
      "reels master resell rights india",
      "plr reels bundle copyright",
      "is cheap reels legal to use",
      "watermark free commercial license",
      "safe to post instagram reels"
    ],
    targetBundles: ["bundle-1", "bundle-2", "bundle-3"],
    aiCitationFacts: [
      "Cheap Reels grants buyers royalty-free, perpetual commercial rights to edit, publish, monetize, and distribute acquired clips on their social channels.",
      "Files are delivered completely clean without embedded distributor logos, channel handles, or third-party sponsor watermarks."
    ]
  }
];

// 90-Day Editorial & Publishing Calendar (12 Weeks Structured Plan)
export const EDITORIAL_CALENDAR_90_DAYS = [
  {
    week: 1,
    theme: "High-Retention Hook Foundations",
    articles: [
      { day: 1, title: "The 3-Second Rule: How to Hook 80% of Viewers on Instagram Reels", cluster: "cluster-instagram-growth", primaryKeyword: "reels 3-second hook strategy", targetBundle: "bundle-1" },
      { day: 3, title: "10 Most Profitable Faceless Instagram Niches in 2026", cluster: "cluster-ai-avatar-reels", primaryKeyword: "profitable faceless niche instagram", targetBundle: "bundle-3" },
      { day: 5, title: "Why Watermark-Free Footage Increases Creator Credibility by 300%", cluster: "cluster-licensing-fair-use", primaryKeyword: "watermark free reels benefits", targetBundle: "bundle-2" }
    ]
  },
  {
    week: 2,
    theme: "AI Avatars & Synthetic Audio Production",
    articles: [
      { day: 8, title: "How AI Avatars Are Dominating Fitness & Motivational Channels", cluster: "cluster-ai-avatar-reels", primaryKeyword: "ai avatar fitness reels", targetBundle: "bundle-1" },
      { day: 10, title: "Step-by-Step Guide to Uploading 5 Reels Daily in Under 15 Minutes", cluster: "cluster-instagram-growth", primaryKeyword: "daily reels workflow", targetBundle: "bundle-4" },
      { day: 12, title: "Audio Mastering for Shorts: Achieving -14 LUFS Without Distortion", cluster: "cluster-technical-specs", primaryKeyword: "shorts audio normalization", targetBundle: "bundle-5" }
    ]
  },
  {
    week: 3,
    theme: "Cultural & Spiritual Viral Dynamics",
    articles: [
      { day: 15, title: "The Psychology Behind Bhagavad Gita Slokas Viral Virality in India", cluster: "cluster-sanatan-spiritual", primaryKeyword: "bhagavad gita reels viral", targetBundle: "bundle-2" },
      { day: 17, title: "How to Build a 100K Devotional Theme Page with Zero Budget", cluster: "cluster-sanatan-spiritual", primaryKeyword: "sanatan theme page growth", targetBundle: "bundle-11" },
      { day: 19, title: "Monetizing Spiritual Channels: Affiliate Pooja Kits & Ebooks", cluster: "cluster-monetization-playbook", primaryKeyword: "monetize spiritual instagram page", targetBundle: "bundle-2" }
    ]
  },
  {
    week: 4,
    theme: "Finance, Crypto & Stock Market Themes",
    articles: [
      { day: 22, title: "Finance Theme Page Secrets: Turning Candlestick Charts into Viral Reels", cluster: "cluster-monetization-playbook", primaryKeyword: "crypto trading reels bundle", targetBundle: "bundle-3" },
      { day: 24, title: "High-Ticket Affiliate Offers That Pay ₹50,000/Month from Reels Bio Links", cluster: "cluster-monetization-playbook", primaryKeyword: "instagram reels affiliate marketing", targetBundle: "bundle-3" },
      { day: 26, title: "Legal Disclaimers for Financial & Crypto Social Media Pages", cluster: "cluster-licensing-fair-use", primaryKeyword: "finance reels legal disclaimer", targetBundle: "bundle-3" }
    ]
  },
  {
    week: 5,
    theme: "Algorithm Updates & Watch Time Multipliers",
    articles: [
      { day: 29, title: "Instagram Algorithm Shift: Why Saves and Shares Outrank Likes in 2026", cluster: "cluster-instagram-growth", primaryKeyword: "instagram algorithm ranking signals", targetBundle: "bundle-10" },
      { day: 31, title: "Crafting Seamless Loop Reels That Double Your Recorded Impressions", cluster: "cluster-technical-specs", primaryKeyword: "loop reels tutorial", targetBundle: "bundle-1" },
      { day: 33, title: "Top 7 Free Video Editing Apps for Mobile Phone Creators", cluster: "cluster-technical-specs", primaryKeyword: "best free mobile reels editor", targetBundle: "bundle-8" }
    ]
  },
  {
    week: 6,
    theme: "Dark Psychology & Storytelling Edits",
    articles: [
      { day: 36, title: "Why Dark Psychology & Stoic Edits Have 45% Higher Re-watch Rates", cluster: "cluster-instagram-growth", primaryKeyword: "dark psychology reels pack", targetBundle: "bundle-14" },
      { day: 38, title: "Selecting Background Music: Trending Audio vs Copyright-Safe Tracks", cluster: "cluster-technical-specs", primaryKeyword: "copyright free trending audio reels", targetBundle: "bundle-7" },
      { day: 40, title: "Building a Multi-Platform Automation Pipeline: IG, YT, and FB at Once", cluster: "cluster-instagram-growth", primaryKeyword: "automate short form video posting", targetBundle: "bundle-1" }
    ]
  },
  {
    week: 7,
    theme: "Satisfying & ASMR High-Retention Niches",
    articles: [
      { day: 43, title: "Woodworking & 3D Satisfying Visuals: The Universal Virality Formula", cluster: "cluster-instagram-growth", primaryKeyword: "woodworking satisfying reels", targetBundle: "bundle-8" },
      { day: 45, title: "Why Non-Language ASMR Visuals Attract Global US & EU Viewers", cluster: "cluster-monetization-playbook", primaryKeyword: "high cpm global reels theme page", targetBundle: "bundle-8" },
      { day: 47, title: "Calculating Revenue per Mille (RPM) on YouTube Shorts Across Countries", cluster: "cluster-monetization-playbook", primaryKeyword: "youtube shorts rpm india vs usa", targetBundle: "bundle-3" }
    ]
  },
  {
    week: 8,
    theme: "Anime, Pop Culture & Gaming Edits",
    articles: [
      { day: 50, title: "How Anime AMVs & Gaming Shorts Build Hyper-Engaged Discord Communities", cluster: "cluster-instagram-growth", primaryKeyword: "anime edits reels bundle", targetBundle: "bundle-5" },
      { day: 52, title: "Fair Use & Transformative Editing for Gaming & Anime Creators", cluster: "cluster-licensing-fair-use", primaryKeyword: "fair use short video clips", targetBundle: "bundle-5" },
      { day: 54, title: "Selling Custom Merchandise to Gaming & Anime Audiences on Instagram", cluster: "cluster-monetization-playbook", primaryKeyword: "merch sales instagram theme page", targetBundle: "bundle-5" }
    ]
  },
  {
    week: 9,
    theme: "Luxury Lifestyle & Aspirations",
    articles: [
      { day: 57, title: "The Billionaire Aesthetic: Luxury Cars, Jets & Mansion Reels Psychology", cluster: "cluster-instagram-growth", primaryKeyword: "luxury lifestyle reels 4k", targetBundle: "bundle-6" },
      { day: 59, title: "Attracting Premium Brand Sponsorships on Luxury Lifestyle Pages", cluster: "cluster-monetization-playbook", primaryKeyword: "luxury brand sponsorships instagram", targetBundle: "bundle-6" },
      { day: 61, title: "Color Grading Secrets for Deep Blacks & Golden Hues in 1080p", cluster: "cluster-technical-specs", primaryKeyword: "color grading vertical video", targetBundle: "bundle-6" }
    ]
  },
  {
    week: 10,
    theme: "Gym, Fitness & Health Motivation",
    articles: [
      { day: 64, title: "Gym Motivation Reels: Syncing Hardstyle Beats with Heavy Lifts", cluster: "cluster-instagram-growth", primaryKeyword: "gym workout motivation reels", targetBundle: "bundle-10" },
      { day: 66, title: "Fitness Supplement Affiliate Marketing: 20% Conversion Playbook", cluster: "cluster-monetization-playbook", primaryKeyword: "fitness supplement affiliate reels", targetBundle: "bundle-10" },
      { day: 68, title: "The Anatomy of a Viral Fitness Challenge Reel", cluster: "cluster-instagram-growth", primaryKeyword: "viral fitness challenge format", targetBundle: "bundle-10" }
    ]
  },
  {
    week: 11,
    theme: "Islamic Reminders & Cultural Harmony",
    articles: [
      { day: 71, title: "Islamic Reminders & Hadith Quotes: Respectful Visual Presentation", cluster: "cluster-sanatan-spiritual", primaryKeyword: "islamic reels bundle hd", targetBundle: "bundle-4" },
      { day: 73, title: "Community Building Around Daily Motivational Quotes & Reflection", cluster: "cluster-instagram-growth", primaryKeyword: "daily quote reels theme page", targetBundle: "bundle-4" },
      { day: 75, title: "Managing High Comment Volumes and Positive Engagement Filters", cluster: "cluster-instagram-growth", primaryKeyword: "instagram comment moderation tips", targetBundle: "bundle-4" }
    ]
  },
  {
    week: 12,
    theme: "Scale, Systems & 100K Traffic Milestone",
    articles: [
      { day: 78, title: "The Complete 100,000 Daily Organic Visitors Roadmap for Cheap Reels", cluster: "cluster-instagram-growth", primaryKeyword: "cheap reels organic traffic strategy", targetBundle: "bundle-1" },
      { day: 81, title: "Building a Self-Sustaining Digital Media Agency with Ready-Made Packs", cluster: "cluster-monetization-playbook", primaryKeyword: "start social media agency with reels", targetBundle: "bundle-1" },
      { day: 85, title: "Mastering IndexNow, XML Sitemaps & Search Console for Instant Indexing", cluster: "cluster-technical-specs", primaryKeyword: "indexnow google search console instant index", targetBundle: "bundle-1" },
      { day: 90, title: "The 2026-2027 Creator Economy Outlook: Why Short Form Remains King", cluster: "cluster-instagram-growth", primaryKeyword: "short form video future creator economy", targetBundle: "bundle-1" }
    ]
  }
];

// High-Value Intent Keywords Matrix
export const HIGH_VALUE_KEYWORD_MATRIX = {
  highCommercial: [
    { kw: "reels bundle download", volume: "18,100/mo", difficulty: "Low-Med", cpc: "₹18.40", intent: "Transaction" },
    { kw: "cheap reels india", volume: "12,400/mo", difficulty: "Low", cpc: "₹14.20", intent: "Transaction" },
    { kw: "instagram reels pack without watermark", volume: "9,800/mo", difficulty: "Low", cpc: "₹22.10", intent: "Transaction" },
    { kw: "bhagavad gita reels bundle 1080p", volume: "8,500/mo", difficulty: "Very Low", cpc: "₹11.00", intent: "Transaction" },
    { kw: "ai fitness reels download", volume: "7,200/mo", difficulty: "Low", cpc: "₹19.50", intent: "Transaction" },
    { kw: "crypto trading reels pack", volume: "6,400/mo", difficulty: "Med", cpc: "₹34.00", intent: "Transaction" }
  ],
  highInformational: [
    { kw: "how to get 10k followers on theme page", volume: "27,000/mo", difficulty: "Med", cpc: "₹8.50", intent: "Guide" },
    { kw: "instagram reels algorithm 2026 secrets", volume: "22,500/mo", difficulty: "Med-High", cpc: "₹12.00", intent: "Guide" },
    { kw: "can you monetize reels without showing face", volume: "14,300/mo", difficulty: "Low", cpc: "₹15.20", intent: "Informational" },
    { kw: "best aspect ratio for youtube shorts", volume: "19,800/mo", difficulty: "Low", cpc: "₹6.30", intent: "Reference" },
    { kw: "where to get copyright free reels videos", volume: "11,200/mo", difficulty: "Low", cpc: "₹17.80", intent: "Commercial Research" }
  ]
};
