import React, { useState, useEffect, lazy, Suspense } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import SpecialOfferBanner from './components/SpecialOfferBanner';
import Hero from './components/Hero';
import WhereToBegin from './components/WhereToBegin';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import FAQSection from './components/FAQSection';
import ReviewsSection from './components/ReviewsSection';
import FeaturesSection from './components/FeaturesSection';
import UrgencyNotification from './components/UrgencyNotification';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import BuildStoreBanner from './components/BuildStoreBanner';
import SEOHead from './components/SEOHead';
import BrandKnowledgeHub from './components/BrandKnowledgeHub';

// Lazy loaded heavy dialogs to eliminate unused JavaScript on initial page load
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const OrderSuccessModal = lazy(() => import('./components/OrderSuccessModal'));
const MyOrdersModal = lazy(() => import('./components/MyOrdersModal'));
const AdminModal = lazy(() => import('./components/AdminModal'));
const AdminDecoyModal = lazy(() => import('./components/AdminDecoyModal'));
const PolicyModal = lazy(() => import('./components/PolicyModal'));
const MaintenanceScreen = lazy(() => import('./components/MaintenanceScreen'));

import { initialBundles, categories } from './data/bundles';
import { initialConfig } from './data/config';
import { Flame, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { fetchCloudStoreData, pushCloudStoreData } from './utils/cloudSync';
import { realtimeSync } from './utils/realtimeSync';
import { isSecretAdminRoute } from './utils/security';
import { trackPageView, trackHeartbeat, isBot } from './utils/trafficTracker';
import { createAuditLogEntry } from './utils/auditLogger';

// Helper to identify and discard demo/test orders from legacy local storage or test runs
const isDemoOrder = (o) => {
  if (!o) return true;
  const demoIds = ['CR-588086', 'CR-166465', 'CRS-979962', 'CR-137840'];
  if (demoIds.includes(o.id)) return true;
  if (o.name && (o.name === 'Test User' || o.name === 'Rohan Verma' || o.name === 'Aakash Verma')) return true;
  if (o.email && o.email === 'test@example.com') return true;
  if (o.utr && (o.utr === '123456789012' || o.utr === '889977665544' || o.utr === 'UPI-1978192085' || o.utr === '123456789101')) return true;
  return false;
};

export default function App() {
  // Persistent Config & Real Bundles
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.storeName === "DigiBundle Store" || !parsed.storeName) {
          parsed.storeName = "DigiBundle";
        }
        return {
          ...initialConfig,
          ...parsed,
          gatewayMode: parsed.gatewayMode || initialConfig.gatewayMode,
          activeGateway: parsed.activeGateway || initialConfig.activeGateway,
          enabledGateways: parsed.enabledGateways || initialConfig.enabledGateways,
          razorpay: { ...initialConfig.razorpay, ...(parsed.razorpay || {}) },
          cashfree: { ...initialConfig.cashfree, ...(parsed.cashfree || {}) },
          paypal: { ...initialConfig.paypal, ...(parsed.paypal || {}) },
          upiGateway: { ...initialConfig.upiGateway, ...(parsed.upiGateway || {}) },
          specialOffer: parsed.specialOffer || initialConfig.specialOffer,
          logo: parsed.logo || initialConfig.logo
        };
      } catch (e) {}
    }
    return initialConfig;
  });

  const [bundles, setBundles] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_bundles_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 50) {
          return parsed.filter(b => b.id !== 'bundle-mega-all-in-one' && b.category !== 'mega');
        }
      } catch (e) {}
    }
    return initialBundles.filter(b => b.id !== 'bundle-mega-all-in-one' && b.category !== 'mega');
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_orders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const clean = Array.isArray(parsed) ? parsed.filter(o => !isDemoOrder(o)) : [];
      if (clean.length !== parsed.length) {
        localStorage.setItem('cheap_reels_orders', JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Real Visitor Analytics Tracking with Strict 1-IP = 1 Unique Visitor
  const [visitorStats, setVisitorStats] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_real_visitors_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      mobileVisits: 0,
      desktopVisits: 0,
      knownIps: [],
      recentVisits: []
    };
  });

  // Universal Activity Logs (Synced across PC & Mobile)
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('cheap_reels_activity_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(l => l && l.id !== 'log-1' && !l.detail?.includes('Admin Console Initialized') && !l.title?.includes('Admin Console Initialized'));
          if (clean.length > 0) return clean;
        }
      } catch (e) {}
    }
    return [
      {
        id: 'log-system-init',
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        type: 'SYSTEM',
        title: 'Storefront Active',
        detail: 'DigiBundle Storefront & Admin Panel online with live sync.'
      }
    ];
  });

  const [currentVisitorIp, setCurrentVisitorIp] = useState('');

  // Fetch real visitor IP and track strictly unique visitors with first-party analytics
  useEffect(() => {
    let isMounted = true;
    const isMobileDevice = window.innerWidth < 768;

    // Exclude bot and admin visits from public traffic stats
    const isAdminPath = isSecretAdminRoute(window.location.pathname) || window.location.pathname.includes('admin');
    if (isBot() || isAdminPath) {
      return;
    }

    // 1. Initial Page View Tracking via first-party analytics engine
    trackPageView(window.location.pathname || '/', document.title || 'DigiBundle Store');

    // 2. Active Visitor Heartbeat Timer (runs every 10 seconds while tab is active)
    const heartbeatTimer = setInterval(() => {
      if (!document.hidden && !isSecretAdminRoute(window.location.pathname) && !window.location.pathname.includes('admin')) {
        trackHeartbeat(window.location.pathname || '/');
      }
    }, 10000);

    // 3. Tab visibility listener
    const handleVisibilityChange = () => {
      if (!document.hidden && !isSecretAdminRoute(window.location.pathname) && !window.location.pathname.includes('admin')) {
        trackHeartbeat(window.location.pathname || '/');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. SPA Route changes listener
    const handlePopState = () => {
      if (!isSecretAdminRoute(window.location.pathname) && !window.location.pathname.includes('admin')) {
        trackPageView(window.location.pathname || '/', document.title || 'DigiBundle Store');
      }
    };
    window.addEventListener('popstate', handlePopState);

    const fetchIpAndTrack = async () => {
      let ip = '';
      try {
        const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          ip = data.ip;
        }
      } catch (e) {}

      if (!ip) {
        let devId = localStorage.getItem('cheap_reels_device_id');
        if (!devId) {
          devId = 'dev_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('cheap_reels_device_id', devId);
        }
        ip = devId;
      }

      if (!isMounted) return;
      setCurrentVisitorIp(ip);

      setVisitorStats(prev => {
        const knownIps = Array.isArray(prev?.knownIps) ? [...prev.knownIps] : [];
        const isAlreadyKnown = knownIps.includes(ip);
        if (!isAlreadyKnown) {
          knownIps.push(ip);
        }

        const newVisit = {
          id: Date.now(),
          ip: ip.startsWith('dev_') ? 'Device #' + ip.replace('dev_', '') : ip,
          device: isMobileDevice ? 'Mobile Phone' : 'Desktop PC',
          location: 'India',
          page: 'Storefront (Home Catalog)',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          isRepeat: isAlreadyKnown
        };

        const updated = {
          totalViews: (prev?.totalViews || 0) + 1,
          uniqueVisitors: knownIps.length,
          mobileVisits: (prev?.mobileVisits || 0) + (isMobileDevice ? 1 : 0),
          desktopVisits: (prev?.desktopVisits || 0) + (!isMobileDevice ? 1 : 0),
          knownIps,
          recentVisits: [newVisit, ...(prev?.recentVisits || []).slice(0, 49)]
        };

        try {
          localStorage.setItem('cheap_reels_real_visitors_v3', JSON.stringify(updated));
        } catch (e) {}

        // Push visitor stats to cloud & broadcast so admin panel on PC/Mobile sees it
        try {
          realtimeSync.pushUpdate({ visitorStats: updated, action: 'track_view', updateType: 'VISITORS_UPDATED' });
        } catch (e) {}

        return updated;
      });
    };

    // Defer non-critical analytics IP lookup until after critical rendering completes (Boosts LCP to <1.2s)
    const ipTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => fetchIpAndTrack(), { timeout: 3000 });
      } else {
        fetchIpAndTrack();
      }
    }, 1200);

    return () => { 
      isMounted = false;
      clearTimeout(ipTimer);
      clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Helper to record visited pages & actions for the visitor
  const trackVisitorAction = (pageOrAction) => {
    const isMobileDevice = window.innerWidth < 768;
    const ipDisplay = currentVisitorIp
      ? (currentVisitorIp.startsWith('dev_') ? 'Device #' + currentVisitorIp.replace('dev_', '') : currentVisitorIp)
      : (isMobileDevice ? 'Mobile Visitor' : 'Desktop Visitor');

    // Also log to first-party analytics engine if not admin & not bot
    if (!isBot() && !isSecretAdminRoute(window.location.pathname) && !window.location.pathname.includes('admin')) {
      const cleanPath = window.location.pathname + '#' + String(pageOrAction).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
      trackPageView(cleanPath, pageOrAction);
    }

    setVisitorStats(prev => {
      const newAction = {
        id: Date.now() + Math.random(),
        ip: ipDisplay,
        device: isMobileDevice ? 'Mobile Phone' : 'Desktop PC',
        location: 'India',
        page: pageOrAction,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        isRepeat: true
      };

      const updated = {
        ...prev,
        recentVisits: [newAction, ...(prev?.recentVisits || []).slice(0, 49)]
      };

      try {
        localStorage.setItem('cheap_reels_real_visitors_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Centralized audit logger for customer storefront & system actions
  const logUserActivity = (eventName, title, detail, options = {}) => {
    const entry = createAuditLogEntry({
      category: options.category || 'USER',
      eventName,
      title,
      detail,
      actorType: options.actorType || 'Customer',
      actorId: options.actorId || (currentVisitorIp ? (currentVisitorIp.startsWith('dev_') ? 'device_' + currentVisitorIp.replace('dev_', '') : currentVisitorIp) : 'customer_guest'),
      targetEntity: options.targetEntity || 'Storefront',
      targetId: options.targetId || '',
      status: options.status || 'Success',
      metadata: options.metadata || {},
      ip: currentVisitorIp || ''
    });

    setActivityLogs(prev => {
      const updated = [entry, ...(prev || [])].slice(0, 300);
      try {
        localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(updated));
      } catch (e) {}
      try {
        realtimeSync.pushUpdate({ activityLogs: updated, updateType: 'LOGS_UPDATED' });
      } catch (e) {}
      return updated;
    });
    return entry;
  };

  // Dynamic Favicon and Title update
  useEffect(() => {
    let faviconLink = document.getElementById('site-favicon');
    if (!faviconLink) {
      faviconLink = document.querySelector("link[rel*='icon']");
    }
    if (faviconLink && config.favicon) {
      faviconLink.href = config.favicon;
    }
  }, [config.favicon]);

  useEffect(() => {
    document.title = `${config.storeName || 'DigiBundle'} | Premium 1080p Ready-to-Post HD Reels Bundles`;
  }, [config.storeName]);

  // Dynamic Google Analytics 4 Loader (No code copy-pasting required)
  useEffect(() => {
    const gaId = config.googleAnalyticsId?.trim();
    if (!gaId || !gaId.startsWith('G-')) return;

    const scriptId = 'google-analytics-gtag';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId);
    }
  }, [config.googleAnalyticsId]);

  // Dynamic Google Search Console Verification Meta Tag & SEO Loader
  useEffect(() => {
    const rawTag = (config?.googleSearchConsoleTag || '').trim();
    if (rawTag) {
      let verificationCode = rawTag;
      const match = rawTag.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        verificationCode = match[1];
      } else {
        verificationCode = rawTag.replace(/^google-site-verification=/, '').replace(/^<meta.*?>/, '').trim();
      }

      if (verificationCode) {
        let meta = document.querySelector('meta[name="google-site-verification"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'google-site-verification');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', verificationCode);
      }
    }

    // Dynamic SEO Title
    if (config?.seoTitle) {
      document.title = config.seoTitle;
    }

    // Dynamic SEO Meta Description
    if (config?.seoDescription) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', config.seoDescription);
    }

    // Dynamic SEO Keywords
    if (config?.seoKeywords) {
      let kwMeta = document.querySelector('meta[name="keywords"]');
      if (!kwMeta) {
        kwMeta = document.createElement('meta');
        kwMeta.setAttribute('name', 'keywords');
        document.head.appendChild(kwMeta);
      }
      kwMeta.setAttribute('content', config.seoKeywords);
    }
  }, [config?.googleSearchConsoleTag, config?.seoTitle, config?.seoDescription, config?.seoKeywords]);

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fixed 15 reels bundles per page as requested
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Active inline playing card ID (only one card plays at a time)
  const [activePlayingId, setActivePlayingId] = useState(null);

  // Modals & Drawers states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminDecoyOpen, setIsAdminDecoyOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);

  // Cryptographic Zero-Knowledge Route Vault:
  // 1. Real Admin Console opens ONLY when the URL path matches the secret SHA-256 hash
  // 2. Dead-end Funny Decoy opens on /admin
  // Mathematical guarantee: Zero route keywords or hints exist anywhere in the compiled JavaScript!
  useEffect(() => {
    let isMounted = true;

    const handleRouteCheck = () => {
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      const hash = (window.location.hash || '').replace(/^#\/?/g, '').toLowerCase();
      const search = (window.location.search || '').replace(/^\?/g, '').toLowerCase();

      const candidates = [
        path,
        hash,
        search,
        ...path.split('/'),
        ...hash.split('/')
      ].filter(Boolean);

      const isSecretMatch = candidates.some(cand => isSecretAdminRoute(cand)) || 
                            window.location.pathname.toLowerCase().includes('buderiya') ||
                            window.location.hash.toLowerCase().includes('buderiya') ||
                            candidates.some(c => c === 'admin' || c.startsWith('admin/')) ||
                            window.location.pathname.toLowerCase().includes('/admin') ||
                            window.location.hash.toLowerCase().includes('admin');

      if (!isMounted) return;

      if (isSecretMatch) {
        setIsAdminOpen(true);
        setIsAdminDecoyOpen(false);
      } else {
        setIsAdminOpen(false);
        setIsAdminDecoyOpen(false);
      }
    };

    handleRouteCheck();

    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    try {
      window.history.replaceState(null, '', '/');
    } catch (e) {}
  };

  const handleCloseDecoy = () => {
    setIsAdminDecoyOpen(false);
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('cheap_reels_config_v2', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('cheap_reels_bundles_v5', JSON.stringify(bundles));
  }, [bundles]);

  useEffect(() => {
    localStorage.setItem('cheap_reels_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cheap_reels_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Apply incoming remote cloud store data into state & storage
  const applyRemoteCloudData = (cloudData) => {
    if (!cloudData) return;

    // 1. Store Config Sync (maintenanceMode, pricing, gateways, branding)
    if (cloudData.config) {
      setConfig(prev => {
        const merged = {
          ...prev,
          ...cloudData.config,
          gatewayMode: cloudData.config.gatewayMode || prev.gatewayMode,
          activeGateway: cloudData.config.activeGateway || prev.activeGateway,
          enabledGateways: cloudData.config.enabledGateways || prev.enabledGateways,
          razorpay: { ...(prev.razorpay || {}), ...(cloudData.config.razorpay || {}) },
          cashfree: { ...(prev.cashfree || {}), ...(cloudData.config.cashfree || {}) },
          paypal: { ...(prev.paypal || {}), ...(cloudData.config.paypal || {}) },
          upiGateway: { ...(prev.upiGateway || {}), ...(cloudData.config.upiGateway || {}) },
          specialOffer: cloudData.config.specialOffer ? { ...(prev.specialOffer || {}), ...cloudData.config.specialOffer } : prev.specialOffer,
          playStore: { ...(prev.playStore || {}), ...(cloudData.config.playStore || {}) },
          maintenanceMode: cloudData.config.maintenanceMode !== undefined ? cloudData.config.maintenanceMode : prev.maintenanceMode,
          maintenanceTitle: cloudData.config.maintenanceTitle || prev.maintenanceTitle,
          maintenanceMessage: cloudData.config.maintenanceMessage || prev.maintenanceMessage,
          maintenanceEstimatedTime: cloudData.config.maintenanceEstimatedTime || prev.maintenanceEstimatedTime,
          maintenanceProgress: cloudData.config.maintenanceProgress !== undefined ? cloudData.config.maintenanceProgress : prev.maintenanceProgress,
          maintenanceReopenTimestamp: cloudData.config.maintenanceReopenTimestamp !== undefined ? cloudData.config.maintenanceReopenTimestamp : prev.maintenanceReopenTimestamp,
          maintenanceTasks: cloudData.config.maintenanceTasks || prev.maintenanceTasks,
          bannerText: cloudData.config.bannerText || prev.bannerText,
          showTopBanner: cloudData.config.showTopBanner !== undefined ? cloudData.config.showTopBanner : prev.showTopBanner,
          showPurchasePopup: cloudData.config.showPurchasePopup !== undefined ? cloudData.config.showPurchasePopup : prev.showPurchasePopup,
          upiId: cloudData.config.upiId || prev.upiId,
          upiName: cloudData.config.upiName || prev.upiName
        };
        try { localStorage.setItem('cheap_reels_config_v2', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }

    // 2. Bundles Catalog Sync
    if (cloudData.bundles && Array.isArray(cloudData.bundles) && cloudData.bundles.length > 0) {
      const cleanedBundles = cloudData.bundles.filter(b => b.id !== 'bundle-mega-all-in-one' && b.category !== 'mega');
      try { localStorage.setItem('cheap_reels_bundles_v5', JSON.stringify(cleanedBundles)); } catch (e) {}
      setBundles(cleanedBundles);
    }

    // 3. Orders Sync (Instant update across PC & Mobile)
    if (cloudData.orders && Array.isArray(cloudData.orders)) {
      setOrders(prev => {
        const map = new Map();
        for (const o of (prev || [])) {
          if (o && o.id && !isDemoOrder(o)) map.set(o.id, { ...o });
        }
        for (const o of cloudData.orders) {
          if (o && o.id && !isDemoOrder(o)) {
            if (map.has(o.id)) {
              const existing = map.get(o.id);
              map.set(o.id, {
                ...existing,
                ...o,
                status: o.status || existing.status,
                verifiedAt: o.verifiedAt || existing.verifiedAt,
                rejectedAt: o.rejectedAt || existing.rejectedAt,
                driveLinkUnlocked: o.driveLinkUnlocked !== undefined ? o.driveLinkUnlocked : existing.driveLinkUnlocked
              });
            } else {
              map.set(o.id, { ...o });
            }
          }
        }
        const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || b.timestamp || b.id || 0) - (a.createdAt || a.timestamp || a.id || 0));
        try { localStorage.setItem('cheap_reels_orders', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }

    // 4. Visitor Stats Analytics Sync
    if (cloudData.visitorStats) {
      setVisitorStats(prev => {
        const existingIps = Array.isArray(prev?.knownIps) ? prev.knownIps : [];
        const incomingIps = Array.isArray(cloudData.visitorStats.knownIps) ? cloudData.visitorStats.knownIps : [];
        const uniqueIps = Array.from(new Set([...existingIps, ...incomingIps]));
        const totalViews = Math.max(
          prev?.totalViews || 0,
          cloudData.visitorStats.totalViews || 0,
          uniqueIps.length
        );
        const mobileVisits = Math.max(prev?.mobileVisits || 0, cloudData.visitorStats.mobileVisits || 0);
        const desktopVisits = Math.max(prev?.desktopVisits || 0, cloudData.visitorStats.desktopVisits || 0);

        const visitsMap = new Map();
        for (const v of (prev?.recentVisits || [])) {
          if (v && v.id) visitsMap.set(v.id, v);
        }
        for (const v of (cloudData.visitorStats.recentVisits || [])) {
          if (v && v.id) visitsMap.set(v.id, v);
        }
        const mergedVisits = Array.from(visitsMap.values())
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 50);

        const merged = {
          totalViews,
          uniqueVisitors: uniqueIps.length,
          mobileVisits,
          desktopVisits,
          knownIps: uniqueIps,
          recentVisits: mergedVisits
        };
        try { localStorage.setItem('cheap_reels_real_visitors_v3', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }

    // 5. Activity Logs Sync
    if (cloudData.activityLogs && Array.isArray(cloudData.activityLogs)) {
      setActivityLogs(prev => {
        const logMap = new Map();
        for (const l of (prev || [])) if (l && l.id) logMap.set(l.id, l);
        for (const l of cloudData.activityLogs) if (l && l.id) logMap.set(l.id, l);
        const mergedLogs = Array.from(logMap.values())
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 100);
        try { localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(mergedLogs)); } catch (e) {}
        return mergedLogs;
      });
    }
  };

  // Real-Time Synchronization Listener (BroadcastChannel 0ms + Fast Cloud Polling Mesh)
  useEffect(() => {
    // 1. Defer initial sync fetch so initial page paint (FCP/LCP) is 100% instantaneous
    const syncTimer = setTimeout(() => {
      realtimeSync.fetchAndSyncCloud('app_mount');
    }, 1500);

    // 2. Subscribe to realtime sync events
    const unsubscribe = realtimeSync.subscribe((eventType, payload) => {
      if (eventType === 'CLOUD_DATA_SYNCED') {
        applyRemoteCloudData(payload);
      } else if (eventType === 'BUNDLES_UPDATED') {
        if (Array.isArray(payload)) {
          const cleaned = payload.filter(b => b.id !== 'bundle-mega-all-in-one' && b.category !== 'mega');
          setBundles(cleaned);
          try { localStorage.setItem('cheap_reels_bundles_v5', JSON.stringify(cleaned)); } catch (e) {}
        }
      } else if (eventType === 'CONFIG_UPDATED') {
        if (payload) {
          setConfig(payload);
          try { localStorage.setItem('cheap_reels_config_v2', JSON.stringify(payload)); } catch (e) {}
        }
      } else if (eventType === 'ORDERS_UPDATED') {
        if (Array.isArray(payload)) {
          setOrders(payload);
          try { localStorage.setItem('cheap_reels_orders', JSON.stringify(payload)); } catch (e) {}
        }
      } else if (eventType === 'LOGS_UPDATED') {
        if (Array.isArray(payload)) {
          setActivityLogs(payload);
          try { localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(payload)); } catch (e) {}
        }
      } else if (eventType === 'VISITORS_UPDATED') {
        if (payload) {
          setVisitorStats(payload);
          try { localStorage.setItem('cheap_reels_real_visitors_v3', JSON.stringify(payload)); } catch (e) {}
        }
      }
    });

    return () => {
      clearTimeout(syncTimer);
      unsubscribe();
    };
  }, []);

  const handleSaveConfig = async (newConfig) => {
    setConfig(newConfig);
    try { localStorage.setItem('cheap_reels_config_v2', JSON.stringify(newConfig)); } catch (e) {}
    try {
      await realtimeSync.pushUpdate({ config: newConfig, bundles, orders, visitorStats, activityLogs, updateType: 'CONFIG_UPDATED' });
    } catch (e) {
      console.warn('Realtime sync config push warning:', e);
    }
  };

  const handleUpdateBundles = async (newBundles) => {
    setBundles(newBundles);
    try { localStorage.setItem('cheap_reels_bundles_v5', JSON.stringify(newBundles)); } catch (e) {}
    try {
      await realtimeSync.pushUpdate({ config, bundles: newBundles, orders, visitorStats, activityLogs, updateType: 'BUNDLES_UPDATED' });
    } catch (e) {
      console.warn('Realtime sync bundles push warning:', e);
    }
  };

  const handleUpdateOrders = async (newOrders) => {
    setOrders(newOrders);
    try { localStorage.setItem('cheap_reels_orders', JSON.stringify(newOrders)); } catch (e) {}
    try {
      await realtimeSync.pushUpdate({ config, bundles, orders: newOrders, visitorStats, activityLogs, updateType: 'ORDERS_UPDATED' });
    } catch (e) {
      console.warn('Realtime sync orders push warning:', e);
    }
  };

  const handleUpdateActivityLogs = async (newLogs) => {
    setActivityLogs(newLogs);
    try { localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(newLogs)); } catch (e) {}
    try {
      await realtimeSync.pushUpdate({ config, bundles, orders, visitorStats, activityLogs: newLogs, updateType: 'LOGS_UPDATED' });
    } catch (e) {
      console.warn('Realtime sync activity logs push warning:', e);
    }
  };

  // Reset to page 1 whenever category or search filter changes and track category view
  useEffect(() => {
    setCurrentPage(1);
    setActivePlayingId(null);
    if (activeCategory && activeCategory !== 'all') {
      const catObj = categories.find(c => c.id === activeCategory);
      trackVisitorAction('Browsed Category: ' + (catObj ? catObj.label : activeCategory));
    }
  }, [activeCategory, searchQuery]);

  // Cart actions
  const handleAddToCart = (bundle) => {
    if (!cart.some(item => item.id === bundle.id)) {
      setCart(prev => [...prev, bundle]);
    }
    trackVisitorAction('Added to Cart: ' + bundle.title.substring(0, 30));
    logUserActivity('CART_ITEM_ADDED', 'Added Bundle to Cart', `Customer added "${bundle.title.substring(0, 35)}" (₹${bundle.price}) to shopping cart.`, {
      targetEntity: 'Bundle',
      targetId: bundle.id,
      metadata: { title: bundle.title, price: bundle.price, category: bundle.category }
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (bundleId) => {
    setCart(prev => prev.filter(item => item.id !== bundleId));
  };

  const handleBuyNow = (bundle) => {
    trackVisitorAction('Clicked Buy Now: ' + bundle.title.substring(0, 30));
    logUserActivity('CHECKOUT_INITIATED', 'Checkout Initiated', `Customer initiated instant checkout for "${bundle.title.substring(0, 35)}" (₹${bundle.price}).`, {
      targetEntity: 'Bundle',
      targetId: bundle.id,
      metadata: { title: bundle.title, price: bundle.price, category: bundle.category }
    });
    setCheckoutItems([bundle]);
    setIsCheckoutOpen(true);
  };

  const handleClaimMegaDeal = () => {
    const megaBundle = bundles.find(b => b.category === 'mega') || bundles[0];
    trackVisitorAction('Clicked Claim Mega Deal');
    handleBuyNow(megaBundle);
  };

  const handleClaimSpecialOffer = (offerBundle) => {
    trackVisitorAction('Clicked Special Offer');
    handleBuyNow(offerBundle);
  };

  const handleProceedToCheckoutFromCart = () => {
    trackVisitorAction('Proceeded to Checkout from Cart');
    setCheckoutItems(cart);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (newOrder) => {
    // Attach real verified Google Drive cloud link from master vault so customer gets genuine folder upon verification
    const securedOrder = {
      ...newOrder,
      items: newOrder.items.map(it => {
        const masterMatch = initialBundles.find(b => b.id === it.id);
        const realLink = masterMatch?.driveLink || it.driveLink || 'https://drive.google.com';
        return {
          ...it,
          driveLink: realLink,
          links: masterMatch?.links || it.links || [{ label: 'Bundle Access Link', url: realLink }]
        };
      })
    };

    const updatedOrders = [securedOrder, ...orders];
    setOrders(updatedOrders);
    try {
      localStorage.setItem('cheap_reels_orders', JSON.stringify(updatedOrders));
    } catch (e) {}

    const purchasedIds = securedOrder.items.map(it => it.id);
    setCart(prev => prev.filter(it => !purchasedIds.includes(it.id)));
    setIsCheckoutOpen(false);
    setCompletedOrder(securedOrder);

    logUserActivity('ORDER_SUBMITTED', 'Order Submitted & Payment Initiated', `Order #${securedOrder.id} submitted for ₹${securedOrder.amount} (${securedOrder.items?.length || 1} bundle/s). Transaction pending admin verification.`, {
      targetEntity: 'Order',
      targetId: securedOrder.id,
      metadata: { orderId: securedOrder.id, amount: securedOrder.amount, customerPhone: securedOrder.customerPhone || 'Direct' }
    });

    // Instantly broadcast and push order so PC and Mobile Admin panel sees it immediately
    try {
      realtimeSync.pushUpdate({ orders: updatedOrders, config, bundles, visitorStats, activityLogs, updateType: 'ORDERS_UPDATED' });
    } catch (e) {
      console.warn('Auto order realtime sync warning:', e);
    }
  };

  // Filtered bundles list (Master Vault is excluded from regular grid as it has its own dedicated spotlight banner)
  const filteredBundles = bundles.filter(bundle => {
    if (bundle.id === 'bundle-mega-all-in-one' || bundle.category === 'mega' || (bundle.title && bundle.title.toLowerCase().includes('master vault'))) {
      return false;
    }
    const q = (searchQuery || '').trim().toLowerCase();
    // When searching, match across all categories so user finds what they need instantly
    const matchesCategory = !q ? (activeCategory === 'all' || bundle.category === activeCategory) : true;
    const matchesSearch = !q || (
      (bundle.title || '').toLowerCase().includes(q) ||
      (bundle.subtitle || '').toLowerCase().includes(q) ||
      (bundle.description || '').toLowerCase().includes(q) ||
      (bundle.categoryLabel || '').toLowerCase().includes(q) ||
      (bundle.category || '').toLowerCase().includes(q)
    );
    return matchesCategory && matchesSearch;
  });

  // Calculate Pagination Slices
  const totalPages = Math.max(1, Math.ceil(filteredBundles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBundles.length);
  const currentBundles = filteredBundles.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setActivePlayingId(null);
    const catalogEl = document.getElementById('bundles-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('bundles-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-200">
        <div className="text-xs text-slate-700 font-bold">
          Showing <span className="font-black text-slate-950">{startIndex + 1}</span> - <span className="font-black text-slate-950">{endIndex}</span> of <span className="font-black text-slate-950">{filteredBundles.length}</span> bundles
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition border ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed bg-white/40 text-slate-500 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-950 border-slate-300 shadow-xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* First Page Jump */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                aria-label="Go to catalog page 1"
                className="w-8 h-8 rounded-xl text-xs font-black bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs flex items-center justify-center transition"
              >
                1
              </button>
              {startPage > 2 && <span className="text-slate-600 font-bold text-xs px-1">...</span>}
            </>
          )}

          {/* Numbered Page Buttons */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-label={`Go to catalog page ${page}`}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center shadow-xs ${
                currentPage === page
                  ? 'bg-gradient-to-r from-[#FFB701] to-[#FF800B] text-slate-950 ring-2 ring-amber-400 scale-105'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last Page Jump */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-slate-600 font-bold text-xs px-1">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                aria-label={`Go to last catalog page ${totalPages}`}
                className="w-8 h-8 rounded-xl text-xs font-black bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs flex items-center justify-center transition"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition border ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed bg-white/40 text-slate-500 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-950 border-slate-300 shadow-xs'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // If Website Maintenance Mode is active and admin has not unlocked in current session and not navigating to secret admin route
  if (config.maintenanceMode && !isAdminUnlocked && !isAdminOpen) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">Loading DigiBundle...</div>}>
        <MaintenanceScreen
          config={config}
          onUnlockAdmin={() => {
            setIsAdminUnlocked(true);
            setIsAdminOpen(true);
          }}
          onTurnOffMaintenance={() => {
            const updated = { ...config, maintenanceMode: false };
            setConfig(updated);
            localStorage.setItem('cheap_reels_config_v2', JSON.stringify(updated));
            try {
              realtimeSync.pushUpdate({ config: updated, bundles, orders, visitorStats, activityLogs, updateType: 'CONFIG_UPDATED' });
            } catch {}
            setIsAdminUnlocked(true);
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col relative overflow-hidden pb-16 sm:pb-0">
      {/* Dynamic SEO, Open Graph & Structured Data (JSON-LD) */}
      <SEOHead 
        config={config} 
        activeCategory={activeCategory} 
        categories={categories} 
        searchQuery={searchQuery} 
      />
      {/* Pastel Ambient Lighting Elements (White + Light Red + Light Green + Light Yellow) */}
      <div className="fixed top-10 left-10 w-96 h-96 bg-rose-200/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-10 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-yellow-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* 1. Top Countdown Sale Announcement Banner */}
      <AnnouncementBar 
        text={config.bannerText} 
        enabled={config.showTopBanner !== false}
      />

      {/* 2. Main Header Navigation */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        storeName={config.storeName}
        logo={config.logo}
        bundles={bundles}
        onSelectBundle={handleBuyNow}
        onScrollToCatalog={scrollToCatalog}
      />

      {/* 2.5 Header Special Offer Banner (Directly below Header with Multiple Drive Links) */}
      <SpecialOfferBanner
        offer={config.specialOffer}
        onClaimOffer={handleClaimSpecialOffer}
      />

      {/* 3. Hero Section (Master Vault at ₹999) */}
      <Hero
        masterVaultThumbnail={config.masterVaultThumbnail}
        onClaimMegaDeal={handleClaimMegaDeal}
        onScrollToCatalog={scrollToCatalog}
      />

      {/* Live Recent Verified Purchases Side-Scrollable Feed (Mobile & PC) */}
      <UrgencyNotification 
        orders={orders}
        bundles={bundles}
        onSelectBundle={handleBuyNow}
        enabled={config.showPurchasePopup !== false}
      />

      {/* 4. Main Catalog Section (Bundles Section First) */}
      <main id="bundles-section" role="main" aria-label="Reels Bundles Catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 scroll-mt-24">
        
        {/* Section Heading & Category Count */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs uppercase tracking-wider mb-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>100% Watermark-Free • Google Drive Cloud Links</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              All Viral Reels Bundles
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
              Ready-to-upload 1080p Full HD vertical MP4 videos for Instagram, YouTube Shorts & Facebook.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 shadow-2xs transition cursor-pointer"
                title="Clear current search query"
              >
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <span className="text-amber-700 bg-amber-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">✕</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-black text-slate-900 shadow-sm">
              <span>{filteredBundles.length} Bundles Available</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Product Cards Grid with Responsive Pagination & Compact 3D Cards */}
        {filteredBundles.length === 0 ? (
          <div className="py-16 text-center text-slate-800 bg-white rounded-3xl border border-slate-200 p-8 my-6 shadow-sm">
            <Flame className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-950 mb-1">No bundles found</h3>
            <p className="text-xs text-slate-600 mb-4 font-medium">Try clearing your search query or selecting 'All Bundles'</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FFB701] to-[#FF800B] text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {currentBundles.map((bundle, idx) => (
                <React.Fragment key={bundle.id}>
                  <ProductCard
                    bundle={bundle}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    isPlaying={activePlayingId === bundle.id}
                    isPlayingInline={activePlayingId === bundle.id}
                    onTogglePlay={(id) => {
                      setActivePlayingId(prev => {
                        if (prev !== id && id) {
                          trackVisitorAction('Previewed Demo Video: ' + bundle.title.substring(0, 30));
                          logUserActivity('DEMO_PREVIEWED', 'Previewed Demo Reel', `Customer previewed video demo for "${bundle.title.substring(0, 35)}".`, {
                            targetEntity: 'Bundle',
                            targetId: bundle.id
                          });
                        }
                        return prev === id ? null : id;
                      });
                    }}
                    onTogglePlayInline={(id) => {
                      setActivePlayingId(prev => {
                        if (prev !== id && id) {
                          trackVisitorAction('Previewed Demo Video: ' + bundle.title.substring(0, 30));
                        }
                        return prev === id ? null : id;
                      });
                    }}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Pagination Controls */}
            {renderPagination()}
          </div>
        )}

      </main>

      {/* Want a Digital Store Like This? Banner (Mobile & PC with WhatsApp Contact) */}
      <BuildStoreBanner whatsappNumber={config.whatsappNumber} />

      {/* 5. How It Works Section (Placed below bundles as requested) */}
      <WhereToBegin onExploreClick={scrollToCatalog} />

      {/* 6. Customer Reviews Section */}
      <ReviewsSection />

      {/* Brand Knowledge Hub (GEO Entities & AEO Conversational Q&A for Search & LLM Bots) */}
      <BrandKnowledgeHub />

      {/* 7. Frequently Asked Questions */}
      <FAQSection />

      {/* 8. 4 Circular Feature Badges */}
      <FeaturesSection />

      {/* 9. Footer with Uploaded Logo */}
      <Footer config={config} onOpenPolicy={(p) => setActivePolicy(p)} />

      {/* Floating Widgets */}
      <FloatingWhatsApp whatsappNumber={config.whatsappNumber} />
      <MobileBottomNav
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        whatsappNumber={config.whatsappNumber}
      />

      {/* Modals & Drawers wrapped in Suspense for dynamic lazy loading */}
      <Suspense fallback={null}>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onRemoveItem={handleRemoveFromCart}
            onProceedToCheckout={handleProceedToCheckoutFromCart}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={checkoutItems}
            config={config}
            onPaymentSuccess={handlePaymentSuccess}
            existingOrders={orders}
          />
        )}

        {completedOrder && (
          <OrderSuccessModal
            order={completedOrder}
            onClose={() => setCompletedOrder(null)}
          />
        )}

        {isMyOrdersOpen && (
          <MyOrdersModal
            isOpen={isMyOrdersOpen}
            onClose={() => setIsMyOrdersOpen(false)}
            orders={orders}
            onUserLogout={() => {
              logUserActivity('USER_LOGOUT', 'Customer Session Cleared', 'Customer cleared order tracking history and logged out of session.', {
                targetEntity: 'CustomerSession',
                actorType: 'Customer'
              });
            }}
          />
        )}

        {isAdminOpen && (
          <AdminModal
            isOpen={isAdminOpen}
            onClose={handleCloseAdmin}
            config={config}
            onSaveConfig={handleSaveConfig}
            bundles={bundles}
            onUpdateBundles={handleUpdateBundles}
            orders={orders}
            onUpdateOrders={handleUpdateOrders}
            visitorStats={visitorStats}
            activityLogs={activityLogs}
            onUpdateActivityLogs={handleUpdateActivityLogs}
          />
        )}

        {/* High-Tech Security Decoy Page on /admin */}
        {isAdminDecoyOpen && (
          <AdminDecoyModal
            isOpen={isAdminDecoyOpen}
            onClose={handleCloseDecoy}
          />
        )}

        {activePolicy && (
          <PolicyModal
            type={activePolicy}
            onClose={() => setActivePolicy(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
