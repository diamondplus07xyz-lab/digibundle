import React, { useState, useMemo, useEffect } from 'react';
import { 
  Menu, X, Lock, Shield, Settings, PackagePlus, Receipt, Save, Check, Plus, Trash2, 
  Search, Edit3, Film, Video, ExternalLink, Download, Upload, Eye, EyeOff, QrCode, CheckCircle2,
  FolderOpen, AlertCircle, RefreshCw, Filter, CreditCard, Image as ImageIcon,
  Smartphone, Key, CheckCircle, Activity, Globe, Palette, AlertTriangle, ChevronRight,
  Clock, Hash, FileCheck, HelpCircle, MessageCircle, BarChart3, Users,
  TrendingUp, Tag, Layers, Share2, Copy, Flame, Mail, ShoppingBag, Wrench, BellRing,
  Play, Pause, Zap, CheckCircle as CheckCircleIcon, XCircle, Power, LogOut, Bot, Brain,
  Server, Database, ShieldCheck, ChevronDown, UserCheck
} from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';
import { pushCloudStoreData } from '../utils/cloudSync';
import { 
  computeSHA256, 
  verifyAdminPasscode, 
  sanitizeInput, 
  checkLockoutStatus, 
  recordFailedAttempt, 
  clearFailedAttempts,
  MAX_LOGIN_ATTEMPTS,
  INACTIVITY_TIMEOUT_MS,
  DEFAULT_ADMIN_HASH
} from '../utils/security';
import GooglePlayConsolePublisher from './GooglePlayConsolePublisher';
import SearchConsoleManager from './SearchConsoleManager';
import MaintenanceScreen from './MaintenanceScreen';
import TrafficAnalytics from './TrafficAnalytics';
import ActivityLogsDashboard from './ActivityLogsDashboard';
import SessionManagerDashboard from './SessionManagerDashboard';
import SessionWarningModal from './SessionWarningModal';
import BrandLogo from './BrandLogo';
import SyncStatusBadge from './SyncStatusBadge';
import ConflictAlertBanner from './ConflictAlertBanner';
import { realtimeSync } from '../utils/realtimeSync';
import { createAuditLogEntry } from '../utils/auditLogger';
import { 
  createAdminSession, 
  validateCurrentSession, 
  updateSessionHeartbeat, 
  terminateSession, 
  terminateAllOtherSessions, 
  terminateAllSessions, 
  performAdminLogout, 
  getCurrentSessionId, 
  getSessionTimeoutMinutes, 
  getAllSessions 
} from '../utils/sessionManager';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig, 
  bundles, 
  onUpdateBundles, 
  orders = [],
  onUpdateOrders,
  visitorStats,
  activityLogs: externalActivityLogs = [],
  onUpdateActivityLogs
}) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  
  // Side Menu Active Tab: 'bundles' | 'announcement' | 'offer' | 'maintenance' | 'orders' | 'analytics' | 'visitors' | 'branding' | 'gateways' | 'logs' | 'sessions'
  const [activeTab, setActiveTab] = useState('bundles');
  const [isMobileAdminMenuOpen, setIsMobileAdminMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Active Session & Security State
  const [currentSessionId, setCurrentSessionIdState] = useState(() => getCurrentSessionId());
  const [activeSessionsCount, setActiveSessionsCount] = useState(1);
  const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
  const [warningSecondsRemaining, setWarningSecondsRemaining] = useState(60);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState(Date.now());

  // Filter & Search states
  const [bundleSearch, setBundleSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [videoFilter, setVideoFilter] = useState('all');

  // Orders verification filter: 'all' | 'pending' | 'verified' | 'rejected'
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Editing state for a single bundle
  const [editingBundle, setEditingBundle] = useState(null);
  const [testVideoActive, setTestVideoActive] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  const [showMaintenancePreview, setShowMaintenancePreview] = useState(false);

  // Delete confirmation modal state
  const [bundleToDelete, setBundleToDelete] = useState(null);

  // New admin passcode input in settings
  const [newPasscode, setNewPasscode] = useState('');
  const [showPasscodeText, setShowPasscodeText] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  // Config editing state
  const [storeConfig, setStoreConfig] = useState(() => ({
    ...config,
    storeName: config?.storeName || 'DigiBundle',
    logo: config?.logo || '/logo.png',
    footerLogo: config?.footerLogo || config?.logo || '/logo-dark.png',
    favicon: config?.favicon || '/brand-icon.png',
    masterVaultThumbnail: config?.masterVaultThumbnail || "https://i.ibb.co/Lzvn9hTm/sheru-bhai-mega-reels-bundle-ad.png",
    adminPasscode: config?.adminPasscode || DEFAULT_ADMIN_HASH,
    whatsappNumber: config?.whatsappNumber || '917017324978',
    supportEmail: config?.supportEmail || 'support@digibundle.in',
    bannerText: config?.bannerText || 'LIMITED TIME OFFER: 2,50,000+ Ready Reels Pack at Flat 95% OFF! Instant Google Drive Access in 5 Seconds',
    showTopBanner: config?.showTopBanner !== false,
    showPurchasePopup: config?.showPurchasePopup !== false,
    maintenanceMode: config?.maintenanceMode === true,
    maintenanceTitle: config?.maintenanceTitle || "We're Making Things Better.",
    maintenanceMessage: config?.maintenanceMessage || "Our team is currently performing scheduled high-performance upgrades, optimizing database queries, and hardening system security to deliver an ultra-fast experience.",
    maintenanceEstimatedTime: config?.maintenanceEstimatedTime || '15 - 20 Minutes',
    maintenanceProgress: config?.maintenanceProgress ?? 68,
    maintenanceReopenTimestamp: config?.maintenanceReopenTimestamp || '',
    maintenanceTasks: config?.maintenanceTasks || {
      server: 'completed',
      database: 'in_progress',
      security: 'pending'
    },
    googleAnalyticsId: config?.googleAnalyticsId || '',
    gatewayMode: config?.gatewayMode || 'single',
    activeGateway: config?.activeGateway || 'upi_qr',
    enabledGateways: config?.enabledGateways || ['upi_qr', 'razorpay'],
    upiGateway: config?.upiGateway || {
      enabled: true,
      upiId: config?.upiId || 'digibundle@upi',
      payeeName: config?.upiName || 'DigiBundle'
    },
    paypal: config?.paypal || {
      enabled: false,
      clientId: '',
      clientSecret: '',
      mode: 'live',
      currency: 'USD',
      exchangeRate: 85
    },
    specialOffer: config?.specialOffer || {
      enabled: true,
      title: '1,50,000+ Ultimate Creator Reels Mega Bundle',
      subtitle: 'Unlock 3 Massive Multi-Part Cloud Folders + Bonus Viral Audio Tracks with Lifetime Access!',
      price: 199,
      originalPrice: 2999,
      badge: 'EXCLUSIVE CREATOR DEAL',
      thumbnail: 'https://i.ibb.co/Lzvn9hTm/sheru-bhai-mega-reels-bundle-ad.png',
      clipCount: '1,50,000+ Reels',
      driveLinks: [
        { id: 'link-1', label: 'Drive Folder Part 1 (Motivation, AI & Finance)', url: 'https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU' },
        { id: 'link-2', label: 'Drive Folder Part 2 (Fitness, Luxury, Anime & Devotional)', url: 'https://drive.google.com/drive/folders/1XZ00wKCxPruEpTyDmRxtLzP3GxPG3N1W' },
        { id: 'link-3', label: 'Bonus Cloud Folder (5,000+ Trending MP3 Audios)', url: 'https://drive.google.com/drive/folders/1zReKMy4EctgGD2MWsL6SS25qXhQwjlPq' }
      ]
    },
    cashfree: config?.cashfree || {
      enabled: false,
      appId: '',
      secretKey: '',
      environment: 'production'
    },
    razorpay: config?.razorpay || {
      enabled: false,
      keyId: '',
      keySecret: ''
    },
    googleSearchConsoleTag: config?.googleSearchConsoleTag || '',
    seoTitle: config?.seoTitle || 'DigiBundle | 2,50,000+ Ready-to-Post HD Reels Bundles',
    seoDescription: config?.seoDescription || 'Get 2,50,000+ ready-to-post 1080p Full HD watermark-free reels bundles with instant Google Drive cloud links at just ₹29. Instagram, Shorts & Facebook.',
    seoKeywords: config?.seoKeywords || 'reels bundle, viral reels, instagram reels pack, motivation reels, ai fitness reels, digibundle download, watermark free reels 1080p',
    canonicalUrl: config?.canonicalUrl || 'https://digibundle.vercel.app',
    allowRobotsIndex: config?.allowRobotsIndex !== false
  }));

  // Keep storeConfig in sync with parent config
  useEffect(() => {
    if (config) {
      setStoreConfig(prev => ({
        ...prev,
        ...config,
        showTopBanner: config.showTopBanner !== false,
        showPurchasePopup: config.showPurchasePopup !== false,
        maintenanceMode: config.maintenanceMode === true,
        maintenanceTitle: config.maintenanceTitle || prev.maintenanceTitle || "We're Making Things Better.",
        maintenanceMessage: config.maintenanceMessage || prev.maintenanceMessage || "Our team is currently performing scheduled high-performance upgrades, optimizing database queries, and hardening system security to deliver an ultra-fast experience.",
        maintenanceEstimatedTime: config.maintenanceEstimatedTime || prev.maintenanceEstimatedTime || '15 - 20 Minutes',
        maintenanceProgress: config.maintenanceProgress !== undefined ? config.maintenanceProgress : (prev.maintenanceProgress ?? 68),
        maintenanceReopenTimestamp: config.maintenanceReopenTimestamp !== undefined ? config.maintenanceReopenTimestamp : (prev.maintenanceReopenTimestamp || ''),
        maintenanceTasks: config.maintenanceTasks || prev.maintenanceTasks || {
          server: 'completed',
          database: 'in_progress',
          security: 'pending'
        },
        googleAnalyticsId: config.googleAnalyticsId || '',
        googleSearchConsoleTag: config.googleSearchConsoleTag !== undefined ? config.googleSearchConsoleTag : (prev.googleSearchConsoleTag || ''),
        seoTitle: config.seoTitle || prev.seoTitle || '',
        seoDescription: config.seoDescription || prev.seoDescription || '',
        seoKeywords: config.seoKeywords || prev.seoKeywords || '',
        canonicalUrl: config.canonicalUrl || prev.canonicalUrl || 'https://digibundle.vercel.app',
        allowRobotsIndex: config.allowRobotsIndex !== undefined ? config.allowRobotsIndex : (prev.allowRobotsIndex !== false),
        gatewayMode: config.gatewayMode || prev.gatewayMode || 'single',
        activeGateway: config.activeGateway || prev.activeGateway || 'upi_qr',
        enabledGateways: config.enabledGateways || prev.enabledGateways || ['upi_qr', 'razorpay'],
        razorpay: { enabled: false, keyId: '', keySecret: '', mode: 'live', ...(config.razorpay || {}) },
        cashfree: { enabled: false, appId: '', secretKey: '', environment: 'production', ...(config.cashfree || {}) },
        paypal: { enabled: false, clientId: '', clientSecret: '', mode: 'live', currency: 'USD', exchangeRate: 85, ...(config.paypal || {}) },
        upiGateway: { enabled: true, upiId: config.upiId || 'digibundle@upi', payeeName: config.upiName || 'DigiBundle', ...(config.upiGateway || {}) },
        playStore: config.playStore || prev.playStore
      }));
    }
  }, [config]);

  // Activity Logs state (Stored persistently and synced across PC & Mobile)
  const [activityLogs, setActivityLogs] = useState(() => {
    if (externalActivityLogs && externalActivityLogs.length > 0) return externalActivityLogs;
    const saved = localStorage.getItem('cheap_reels_activity_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log-1',
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        type: 'SYSTEM',
        title: 'Admin Console Initialized',
        detail: 'Logged in to DigiBundle Administration Center.'
      }
    ];
  });

  useEffect(() => {
    if (externalActivityLogs && externalActivityLogs.length > 0) {
      setActivityLogs(externalActivityLogs);
    }
  }, [externalActivityLogs]);

  const [logSearch, setLogSearch] = useState('');

  // Sync logs to localStorage
  useEffect(() => {
    localStorage.setItem('cheap_reels_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Helper to add activity log with full audit trail metadata
  const addLog = (typeOrCategory, title, detail, options = {}) => {
    let cat = 'ADMIN';
    const rawType = String(typeOrCategory || 'ADMIN').toUpperCase();
    if (rawType.includes('SECURITY') || rawType.includes('ALERT') || rawType.includes('LOCKOUT')) {
      cat = 'SECURITY';
    } else if (rawType === 'USER' || rawType === 'CUSTOMER') {
      cat = 'USER';
    } else if (rawType === 'SYSTEM') {
      cat = 'SYSTEM';
    } else {
      cat = 'ADMIN';
    }

    const newLog = createAuditLogEntry({
      category: cat,
      eventName: options.eventName || rawType,
      title,
      detail,
      actorType: options.actorType || 'Admin',
      actorId: options.actorId || 'admin_master',
      targetEntity: options.targetEntity || rawType,
      targetId: options.targetId || '',
      status: options.status || (cat === 'SECURITY' && (rawType.includes('ALERT') || rawType.includes('FAILED')) ? 'Failed' : 'Success'),
      metadata: options.metadata || {},
      ip: options.ip || ''
    });

    const updated = [newLog, ...(activityLogs || [])].slice(0, 300);
    setActivityLogs(updated);
    if (onUpdateActivityLogs) {
      onUpdateActivityLogs(updated);
    }
    return newLog;
  };

  // New Bundle Modal State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newBundleData, setNewBundleData] = useState({
    title: '',
    category: 'ai',
    categoryLabel: 'AI Reels',
    price: 39,
    originalPrice: 799,
    clipCount: '1,000+ Reels',
    badge: 'POPULAR',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    videoPreview: '',
    driveLink: 'https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU',
    features: ['1080p Full HD MP4', 'No Watermark', 'Google Drive Instant Access']
  });

  const showNotification = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3500);
  };

  // Brute force lockout timer check
  useEffect(() => {
    const checkLock = () => {
      const status = checkLockoutStatus();
      if (status.isLocked) {
        setLockoutRemaining(status.remainingSeconds);
      } else {
        setLockoutRemaining(0);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live session health check, remote revocation detection & idle timeout monitor
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // 1. Check if current session was revoked remotely from another device
      const currId = getCurrentSessionId();
      if (currId) {
        const validation = validateCurrentSession(currId);
        if (!validation.valid && validation.reason === 'SESSION_TERMINATED') {
          handleLogout({
            reason: validation.details || 'Session terminated remotely from another device.',
            type: 'SESSION_TERMINATED_REMOTELY',
            closeModal: true
          });
          showNotification('Security Notice: Your session was terminated remotely.');
          return;
        }
      }

      // 2. Refresh active sessions badge count
      const allSess = getAllSessions();
      const activeCount = allSess.filter(s => s.status === 'active').length;
      setActiveSessionsCount(activeCount || 1);

      // 3. Idle timeout & Inactivity Warning calculation
      const timeoutMinutes = getSessionTimeoutMinutes();
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const idleMs = Date.now() - lastActivityTimestamp;

      // Inactivity Warning window (starts 60 seconds before expiration)
      const warningThresholdMs = Math.max(30000, timeoutMs - 60000);

      if (idleMs >= timeoutMs) {
        setIsSessionWarningOpen(false);
        handleLogout({
          reason: `Session automatically logged out after ${timeoutMinutes} minutes of inactivity.`,
          type: 'SESSION_TIMEOUT',
          closeModal: true
        });
        showNotification('Session expired due to inactivity. Please log in again.');
      } else if (idleMs >= warningThresholdMs) {
        const secsLeft = Math.max(1, Math.ceil((timeoutMs - idleMs) / 1000));
        setWarningSecondsRemaining(secsLeft);
        setIsSessionWarningOpen(true);
      } else {
        setIsSessionWarningOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivityTimestamp]);

  // User activity reset listeners with throttled session heartbeat
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastHeartbeat = 0;
    const handleActivity = () => {
      const now = Date.now();
      setLastActivityTimestamp(now);
      // Throttle session heartbeat to once per 15s to prevent storage churn
      if (now - lastHeartbeat > 15000) {
        lastHeartbeat = now;
        const currId = getCurrentSessionId();
        if (currId) {
          updateSessionHeartbeat(currId);
        }
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
    };
  }, [isAuthenticated]);

  // Extend Session Handler (from warning modal)
  const handleExtendSession = () => {
    const now = Date.now();
    setLastActivityTimestamp(now);
    setIsSessionWarningOpen(false);
    const currId = getCurrentSessionId();
    if (currId) {
      updateSessionHeartbeat(currId);
    }
    showNotification('Session extended successfully.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode) return;

    const trimmed = passcode.trim();
    // Validate passcode first - valid admin master passwords clear lockout immediately
    const isValid = await verifyAdminPasscode(trimmed, config?.adminPasscode || storeConfig?.adminPasscode);
    if (isValid) {
      clearFailedAttempts();
      setLockoutRemaining(0);

      // Create new authenticated session with automatic session rotation (Session Fixation Guard)
      const inputHash = await computeSHA256(passcode.trim());
      try {
        sessionStorage.setItem('cheap_reels_admin_auth_token', inputHash || DEFAULT_ADMIN_HASH);
      } catch (e) {}
      const newSession = createAdminSession({ adminId: 'admin_master' });
      setCurrentSessionIdState(newSession.id);
      setLastActivityTimestamp(Date.now());
      setIsAuthenticated(true);
      setAuthError('');
      setPasscode('');

      addLog('AUTH', 'Admin Login', `Administrator authenticated successfully (SHA-256 Verified). Session: ${newSession.id.slice(0, 16)}...`, {
        targetEntity: 'AdminSession',
        targetId: newSession.id,
        metadata: {
          sessionId: newSession.id,
          device: newSession.deviceType,
          browser: newSession.browser,
          os: newSession.os
        }
      });
    } else {
      const result = recordFailedAttempt();
      if (result.isLocked) {
        setLockoutRemaining(result.remainingSeconds);
        setAuthError(`Security Alert: Maximum 5 attempts exceeded. Console locked for 15 minutes.`);
        addLog('SECURITY_ALERT', 'Brute-Force Lockout', '5 failed login attempts detected. Console locked for 15 minutes.', {
          status: 'Failed'
        });
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - result.attempts;
        setAuthError(`Incorrect passcode. ${remaining} attempt(s) remaining before security lockout.`);
        addLog('SECURITY_ALERT', 'Failed Login Attempt', `Incorrect passcode attempt (${result.attempts}/${MAX_LOGIN_ATTEMPTS}).`, {
          status: 'Failed'
        });
      }
    }
  };

  const handleLogout = (options = {}) => {
    const reason = options.reason || 'Administrator logged out of console.';
    const logEvent = options.type === 'SESSION_TIMEOUT' 
      ? 'Auto Logout' 
      : options.type === 'SESSION_TERMINATED_REMOTELY' 
        ? 'Session Terminated Remotely' 
        : 'Admin Logout';

    addLog('AUTH', logEvent, reason, {
      status: options.type === 'SESSION_TIMEOUT' ? 'Warning' : 'Success',
      targetEntity: 'AdminSession',
      targetId: currentSessionId || ''
    });

    performAdminLogout(reason);
    try {
      sessionStorage.removeItem('cheap_reels_admin_auth_token');
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentSessionIdState(null);
    setPasscode('');
    setIsMobileAdminMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsSessionWarningOpen(false);

    if (onClose && options.closeModal !== false) {
      onClose();
    }
    showNotification('Logged out successfully.');
  };

  const handleSaveStoreConfig = (updatedOverride) => {
    const toSave = updatedOverride || storeConfig;
    setStoreConfig(toSave);
    try {
      localStorage.setItem('cheap_reels_config_v2', JSON.stringify(toSave));
    } catch (e) {}
    onSaveConfig(toSave);
    try {
      realtimeSync.pushUpdate({ config: toSave, bundles, orders, visitorStats, activityLogs, updateType: 'CONFIG_UPDATED' });
    } catch (e) {
      console.warn('Auto realtime cloud sync failed:', e);
    }
    addLog('BRANDING', 'Store Config Saved', `Saved settings: Store Name "${toSave.storeName}".`);
    showNotification('Settings saved & broadcast in real time to all devices!');
  };

  // Toggle Header Offer on/off immediately
  const handleToggleOffer = () => {
    const currentlyEnabled = storeConfig.specialOffer?.enabled !== false;
    const updated = {
      ...storeConfig,
      specialOffer: {
        ...storeConfig.specialOffer,
        enabled: !currentlyEnabled
      }
    };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    addLog('OFFER', !currentlyEnabled ? 'Offer Enabled' : 'Offer Disabled', `Header Special Offer is now ${!currentlyEnabled ? 'Active' : 'Ended'}.`);
    showNotification(!currentlyEnabled ? 'Offer Activated on Website!' : 'Offer Ended & Removed from Website!');
  };

  // Control Announcement Bar: RUN / STOP
  const handleSetTopBannerState = (enable) => {
    const updated = {
      ...storeConfig,
      showTopBanner: enable
    };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    addLog('ANNOUNCEMENT', enable ? 'Announcement Bar Started' : 'Announcement Bar Stopped', `Top announcement bar is now ${enable ? 'RUNNING & VISIBLE' : 'STOPPED & HIDDEN'}.`);
    showNotification(enable ? 'Announcement Bar is now RUNNING!' : 'Announcement Bar is now STOPPED!');
  };

  // Save Announcement Text
  const handleSaveAnnouncementText = (e) => {
    e.preventDefault();
    handleSaveStoreConfig();
    addLog('ANNOUNCEMENT', 'Announcement Text Updated', `New text: "${storeConfig.bannerText}"`);
    showNotification('Announcement text updated & saved!');
  };

  // Control Purchase Popups: RUN / STOP
  const handleSetPurchasePopupState = (enable) => {
    const updated = {
      ...storeConfig,
      showPurchasePopup: enable
    };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    addLog('POPUP', enable ? 'Purchase Popups Enabled' : 'Purchase Popups Disabled', `Live purchase popups are now ${enable ? 'RUNNING' : 'STOPPED'}.`);
    showNotification(enable ? 'Purchase Popups are now RUNNING!' : 'Purchase Popups are now STOPPED!');
  };

  // Control Maintenance Mode: ON / OFF (USER REQUESTED REAL WORKING TURN ON & TURN OFF)
  const handleSetMaintenanceMode = (enable) => {
    const updated = {
      ...storeConfig,
      maintenanceMode: enable
    };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    addLog('MAINTENANCE', enable ? 'Maintenance Mode Activated' : 'Maintenance Mode Deactivated', `Website is now ${enable ? 'UNDER MAINTENANCE (LOCKED)' : 'LIVE & ACCESSIBLE'}.`);
    showNotification(enable ? 'Maintenance Mode ACTIVATED! Visitors see maintenance screen.' : 'Maintenance Mode TURNED OFF! Website is now LIVE.');
  };

  // Save Maintenance Details
  const handleSaveMaintenanceSettings = (e) => {
    e.preventDefault();
    handleSaveStoreConfig();
    showNotification('Maintenance settings saved!');
  };

  // Connect Google Analytics (USER REQUESTED: NO CODE COPY-PASTE)
  const handleSaveGoogleAnalytics = (e) => {
    e.preventDefault();
    const gaId = (storeConfig.googleAnalyticsId || '').trim();
    const updated = {
      ...storeConfig,
      googleAnalyticsId: gaId
    };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    addLog('INTEGRATION', 'Google Analytics Updated', gaId ? `Connected GA4 ID: ${gaId}` : 'Google Analytics Disconnected');
    showNotification(gaId ? `Google Analytics ${gaId} Connected! Tracking is now active.` : 'Google Analytics Disconnected.');
  };

  // Send Test GA Event
  const handleSendTestGAEvent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'admin_test_event', {
        event_category: 'Admin',
        event_label: 'Google Analytics Verification Test'
      });
      showNotification('Test event sent to Google Analytics dataLayer!');
    } else {
      showNotification('Google Analytics not loaded yet. Make sure GA4 ID is saved.');
    }
  };

  // QR PAYMENT VERIFICATION WORKFLOW (USER REQUESTED)
  const handleVerifyOrder = (orderId) => {
    const updated = (orders || []).map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'VERIFIED',
          verifiedAt: new Date().toISOString(),
          driveLinkUnlocked: true
        };
      }
      return ord;
    });
    if (onUpdateOrders) onUpdateOrders(updated);
    try {
      localStorage.setItem('cheap_reels_orders', JSON.stringify(updated));
    } catch (e) {}
    try {
      realtimeSync.pushUpdate({ orders: updated, config: storeConfig, bundles, visitorStats, activityLogs, updateType: 'ORDERS_UPDATED' });
    } catch (e) {}
    addLog('ORDERS', 'Payment Verified & Approved', `Order #${orderId} marked as Verified. Added to real verified revenue.`);
    showNotification(`Order #${orderId} verified & approved! Synchronized across all devices.`);
  };

  const handleRejectOrder = (orderId) => {
    const updated = (orders || []).map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'REJECTED',
          rejectedAt: new Date().toISOString()
        };
      }
      return ord;
    });
    if (onUpdateOrders) onUpdateOrders(updated);
    try {
      localStorage.setItem('cheap_reels_orders', JSON.stringify(updated));
    } catch (e) {}
    try {
      realtimeSync.pushUpdate({ orders: updated, config: storeConfig, bundles, visitorStats, activityLogs, updateType: 'ORDERS_UPDATED' });
    } catch (e) {}
    addLog('ORDERS', 'Payment Rejected', `Order #${orderId} marked as Rejected.`);
    showNotification(`Order #${orderId} marked as rejected.`);
  };

  // Header Logo Upload Handler
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const updated = { ...storeConfig, logo: base64Url };
      setStoreConfig(updated);
      handleSaveStoreConfig(updated);
      addLog('BRANDING', 'Header Logo Uploaded', 'New website header brand logo uploaded.');
      showNotification('New header logo uploaded & applied!');
    };
    reader.readAsDataURL(file);
  };

  // Footer Logo Upload Handler
  const handleFooterLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const updated = { ...storeConfig, footerLogo: base64Url };
      setStoreConfig(updated);
      handleSaveStoreConfig(updated);
      addLog('BRANDING', 'Footer Logo Uploaded', 'New website footer logo uploaded.');
      showNotification('New footer logo uploaded & applied!');
    };
    reader.readAsDataURL(file);
  };

  // Favicon Upload Handler
  const handleFaviconUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Favicon file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const updated = { ...storeConfig, favicon: base64Url };
      setStoreConfig(updated);
      handleSaveStoreConfig(updated);

      let faviconLink = document.getElementById('site-favicon');
      if (!faviconLink) {
        faviconLink = document.querySelector("link[rel*='icon']");
      }
      if (faviconLink) {
        faviconLink.href = base64Url;
      }

      addLog('BRANDING', 'Favicon Updated', 'New browser tab favicon icon uploaded.');
      showNotification('Favicon updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Master Vault Thumbnail Upload Handler
  const handleMasterVaultThumbnailUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const updated = { ...storeConfig, masterVaultThumbnail: base64Url };
      setStoreConfig(updated);
      handleSaveStoreConfig(updated);

      const updatedBundles = bundles.map(b => 
        b.id === 'bundle-mega-all-in-one' ? { ...b, thumbnail: base64Url } : b
      );
      onUpdateBundles(updatedBundles);

      addLog('BRANDING', 'Master Vault Thumbnail Updated', 'All-In-One Master Vault thumbnail photo updated.');
      showNotification('Master Vault thumbnail updated!');
    };
    reader.readAsDataURL(file);
  };

  // Image Upload handler for Bundle or Offer
  const handleImageFileUpload = (e, target = 'bundle') => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      if (target === 'bundle' && editingBundle) {
        setEditingBundle(prev => ({ ...prev, thumbnail: base64Url }));
        showNotification('Photo uploaded! Click "Save Changes" below.');
      } else if (target === 'new_bundle') {
        setNewBundleData(prev => ({ ...prev, thumbnail: base64Url }));
        showNotification('Photo uploaded for new bundle!');
      } else if (target === 'offer') {
        setStoreConfig(prev => ({
          ...prev,
          specialOffer: {
            ...prev.specialOffer,
            thumbnail: base64Url
          }
        }));
        showNotification('Offer banner image uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Admin Passcode Update Handler with SHA-256 Hashing & Multi-Device Session Revocation
  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      alert('Please enter a valid passcode.');
      return;
    }
    const hashedPasscode = await computeSHA256(newPasscode.trim());
    const updated = { ...storeConfig, adminPasscode: hashedPasscode };
    setStoreConfig(updated);
    handleSaveStoreConfig(updated);
    setNewPasscode('');

    // Automatically revoke all other active sessions across all devices for security
    const { terminatedCount } = terminateAllOtherSessions(currentSessionId, 'Revoked automatically following passcode update');
    
    addLog('SECURITY', 'Passcode Changed', `Admin access passcode was cryptographically hashed with SHA-256 and updated.${terminatedCount > 0 ? ` Revoked ${terminatedCount} other active session(s).` : ''}`, {
      targetEntity: 'AdminSecurity',
      metadata: { terminatedCount }
    });
    showNotification(`Passcode updated! ${terminatedCount > 0 ? `${terminatedCount} other device session(s) revoked for security.` : ''}`);
  };

  // Track active bundle editing for concurrent edit conflict prevention
  useEffect(() => {
    if (editingBundle) {
      realtimeSync.setActiveFormTracker({ type: 'bundle', isDirty: true, id: editingBundle.id });
    } else {
      realtimeSync.setActiveFormTracker(null);
    }
    return () => realtimeSync.setActiveFormTracker(null);
  }, [editingBundle]);

  // Bundle Actions with Sanitization & Real-Time Sync
  const handleSaveBundleEdit = (e) => {
    e.preventDefault();
    if (!editingBundle) return;

    const sanitizedBundle = {
      ...editingBundle,
      title: sanitizeInput(editingBundle.title),
      subtitle: sanitizeInput(editingBundle.subtitle),
      category: sanitizeInput(editingBundle.category),
      badge: sanitizeInput(editingBundle.badge || ''),
      thumbnail: sanitizeInput(editingBundle.thumbnail),
      videoPreview: sanitizeInput(editingBundle.videoPreview || ''),
      driveLink: sanitizeInput(editingBundle.driveLink || '')
    };

    const updatedBundles = bundles.map(b => 
      b.id === sanitizedBundle.id ? sanitizedBundle : b
    );
    onUpdateBundles(updatedBundles);
    try {
      realtimeSync.pushUpdate({ config: storeConfig, bundles: updatedBundles, orders, visitorStats, activityLogs, updateType: 'BUNDLES_UPDATED' });
    } catch (err) {}
    addLog('BUNDLES', 'Bundle Updated', `Updated bundle "${sanitizedBundle.title}" (ID: ${sanitizedBundle.id}).`);
    showNotification(`Bundle "${sanitizedBundle.title.substring(0, 24)}..." saved & broadcast in real time!`);
    realtimeSync.setActiveFormTracker(null);
    setEditingBundle(null);
  };

  const handleConfirmDelete = () => {
    if (!bundleToDelete) return;
    const updatedBundles = bundles.filter(b => b.id !== bundleToDelete.id);
    onUpdateBundles(updatedBundles);
    try {
      realtimeSync.pushUpdate({ config: storeConfig, bundles: updatedBundles, orders, visitorStats, activityLogs, updateType: 'BUNDLES_UPDATED' });
    } catch (err) {}
    addLog('BUNDLES', 'Bundle Deleted', `Deleted bundle "${bundleToDelete.title}" (ID: ${bundleToDelete.id}).`);
    showNotification(`Bundle "${bundleToDelete.title.substring(0, 24)}..." deleted & auto-synced!`);
    setBundleToDelete(null);
  };

  const handleDuplicateBundle = (bundleToDup) => {
    if (!bundleToDup) return;
    const duplicatedId = 'bundle-' + Date.now();
    const duplicated = {
      ...bundleToDup,
      id: duplicatedId,
      title: `${bundleToDup.title} (Copy)`,
    };
    const updatedBundles = [duplicated, ...bundles];
    onUpdateBundles(updatedBundles);
    try {
      realtimeSync.pushUpdate({ config: storeConfig, bundles: updatedBundles, orders, visitorStats, activityLogs, updateType: 'BUNDLES_UPDATED' });
    } catch (err) {}
    addLog('BUNDLES', 'Bundle Duplicated', `Duplicated "${bundleToDup.title}" as ID: ${duplicatedId}.`);
    showNotification('Bundle duplicated successfully & synchronized!');
    setEditingBundle(duplicated);
  };

  const handleCreateBundle = (e) => {
    e.preventDefault();
    if (!newBundleData.title.trim()) {
      alert('Please enter bundle title');
      return;
    }

    const newId = 'bundle-' + Date.now();
    const created = {
      ...newBundleData,
      id: newId,
      rating: 4.85,
      reviewsCount: 120,
      links: [{ label: 'Bundle Access Link', url: newBundleData.driveLink }]
    };

    const updatedBundles = [created, ...bundles];
    onUpdateBundles(updatedBundles);
    try {
      realtimeSync.pushUpdate({ config: storeConfig, bundles: updatedBundles, orders, visitorStats, activityLogs, updateType: 'BUNDLES_UPDATED' });
    } catch (err) {}
    addLog('BUNDLES', 'Bundle Created', `Published new bundle "${created.title}" (ID: ${created.id}).`);
    showNotification('New bundle published & synchronized across all devices!');
    setIsAddingNew(false);
  };

  // Special Offer Drive Links Handlers
  const handleAddOfferDriveLink = () => {
    const newId = 'link-' + Date.now();
    setStoreConfig(prev => ({
      ...prev,
      specialOffer: {
        ...prev.specialOffer,
        driveLinks: [
          ...(prev.specialOffer?.driveLinks || []),
          { id: newId, label: `Drive Folder Part ${(prev.specialOffer?.driveLinks?.length || 0) + 1}`, url: '' }
        ]
      }
    }));
  };

  const handleUpdateOfferDriveLink = (id, field, value) => {
    setStoreConfig(prev => ({
      ...prev,
      specialOffer: {
        ...prev.specialOffer,
        driveLinks: (prev.specialOffer?.driveLinks || []).map(dl => 
          dl.id === id ? { ...dl, [field]: value } : dl
        )
      }
    }));
  };

  const handleRemoveOfferDriveLink = (id) => {
    setStoreConfig(prev => ({
      ...prev,
      specialOffer: {
        ...prev.specialOffer,
        driveLinks: (prev.specialOffer?.driveLinks || []).filter(dl => dl.id !== id)
      }
    }));
  };

  // REAL REVENUE & PAYMENT APPS ANALYTICS (ONLY VERIFIED PAYMENTS COUNT AS REAL REVENUE)
  const revenueStats = useMemo(() => {
    const allOrders = orders || [];
    const verifiedOrders = allOrders.filter(ord => 
      ord.status === 'VERIFIED' || ord.status === 'COMPLETED'
    );
    const pendingOrders = allOrders.filter(ord => 
      ord.status !== 'VERIFIED' && ord.status !== 'COMPLETED' && ord.status !== 'REJECTED'
    );
    const rejectedOrders = allOrders.filter(ord => ord.status === 'REJECTED');

    const verifiedRevenue = verifiedOrders.reduce((sum, ord) => {
      return sum + (Number(ord.total) || Number(ord.amount) || 0);
    }, 0);

    const pendingRevenue = pendingOrders.reduce((sum, ord) => {
      return sum + (Number(ord.total) || Number(ord.amount) || 0);
    }, 0);

    const appBreakdown = {
      phonepe: 0,
      gpay: 0,
      paytm: 0,
      other: 0
    };

    allOrders.forEach(ord => {
      const app = (ord.paymentApp || '').toLowerCase();
      if (app.includes('phonepe')) appBreakdown.phonepe++;
      else if (app.includes('google') || app.includes('gpay')) appBreakdown.gpay++;
      else if (app.includes('paytm')) appBreakdown.paytm++;
      else appBreakdown.other++;
    });

    return {
      verifiedRevenue,
      pendingRevenue,
      totalOrders: allOrders.length,
      verifiedCount: verifiedOrders.length,
      pendingCount: pendingOrders.length,
      rejectedCount: rejectedOrders.length,
      appBreakdown
    };
  }, [orders]);

  // Filtered orders for table
  const displayedOrders = useMemo(() => {
    const all = orders || [];
    if (orderStatusFilter === 'pending') {
      return all.filter(o => o.status !== 'VERIFIED' && o.status !== 'COMPLETED' && o.status !== 'REJECTED');
    }
    if (orderStatusFilter === 'verified') {
      return all.filter(o => o.status === 'VERIFIED' || o.status === 'COMPLETED');
    }
    if (orderStatusFilter === 'rejected') {
      return all.filter(o => o.status === 'REJECTED');
    }
    return all;
  }, [orders, orderStatusFilter]);

  // Filtered bundles for table (excludes Master Vault which has its dedicated hero offer editor)
  const filteredBundles = useMemo(() => {
    return (bundles || []).slice(0, 50).filter(bundle => {
      if (bundle.id === 'bundle-mega-all-in-one' || bundle.category === 'mega' || (bundle.title && bundle.title.toLowerCase().includes('master vault'))) {
        return false;
      }

      const matchesSearch = 
        bundle.title.toLowerCase().includes(bundleSearch.toLowerCase()) ||
        bundle.id.toLowerCase().includes(bundleSearch.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || bundle.category === categoryFilter;
      
      let matchesVideo = true;
      if (videoFilter === 'with_video') {
        matchesVideo = Boolean(bundle.videoPreview && bundle.videoPreview.trim());
      } else if (videoFilter === 'without_video') {
        matchesVideo = !bundle.videoPreview || !bundle.videoPreview.trim();
      }

      return matchesSearch && matchesCategory && matchesVideo;
    });
  }, [bundles, bundleSearch, categoryFilter, videoFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
      
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-70 bg-emerald-600 text-white font-black px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-emerald-400 animate-slideDown max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="break-words">{saveToast}</span>
        </div>
      )}

      {!isAuthenticated ? (
        /* ======================================================== */
        /* ADMIN AUTHENTICATION LOGIN SCREEN                        */
        /* ======================================================== */
        <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 text-center text-slate-900 overflow-hidden bg-white mx-4">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            DigiBundle Admin Console
          </h3>
          <p className="text-xs text-slate-600 mt-1 mb-6 font-medium">
            Enter your secure administrator passcode to manage catalog, orders, alerts & settings.
          </p>

          {lockoutRemaining > 0 && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-2xl mb-4 text-xs font-bold text-center space-y-1 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto" />
              <p className="text-xs font-black uppercase tracking-wider text-rose-900">Security Lockout Active</p>
              <p className="text-[11px] text-rose-700">5 incorrect passcode attempts detected.</p>
              <p className="text-rose-950 font-mono text-sm pt-0.5 font-black">
                🔒 Locked: {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder={lockoutRemaining > 0 ? "Console Locked" : "Enter Passcode"}
                value={passcode}
                disabled={lockoutRemaining > 0}
                onChange={(e) => setPasscode(e.target.value)}
                className={`w-full px-4 py-3 border rounded-2xl text-slate-900 text-sm font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  lockoutRemaining > 0 ? 'bg-slate-200 cursor-not-allowed opacity-60' : 'bg-slate-100 border-slate-200'
                }`}
                autoFocus={lockoutRemaining === 0}
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={lockoutRemaining > 0}
              className={`w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-md transition ${
                lockoutRemaining > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {lockoutRemaining > 0 ? 'Locked (Wait for timer)' : 'Unlock Console'}
            </button>
          </form>

          {/* Enterprise Security Badge */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>SHA-256 Encrypted • Brute-Force Guard • 15m Auto-Timeout</span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* AUTHENTICATED ADMIN CONSOLE: 100% RESPONSIVE (MOBILE & PC) */
        /* ======================================================== */
        <div className="relative w-full h-full sm:h-[92vh] sm:max-w-6xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
          
          {/* MOBILE SIDE MENU DRAWER (FOR PHONES & TABLETS) */}
          {isMobileAdminMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
              <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileAdminMenuOpen(false)}
              />
              <div className="relative w-72 max-w-[85vw] bg-slate-900 h-full shadow-2xl flex flex-col z-10 p-3 sm:p-4 border-r border-slate-800 animate-slideRight">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 bg-slate-950/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 p-1 border border-slate-700/60 flex items-center justify-center shadow-xs">
                      <img src={storeConfig.favicon || storeConfig.logo || "/brand-icon.png"} alt={storeConfig.storeName || "DigiBundle"} className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight flex items-center gap-1">
                        <span>Digi</span>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic">Bundle</span>
                      </h4>
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Admin Console</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileAdminMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Vertical Nav List */}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {[
                    { id: 'bundles', name: 'Reels Bundles', count: Math.min(50, bundles.length), icon: PackagePlus },
                    { id: 'orders', name: 'Orders & Verify QR', count: orders.filter(o => o.status === 'PENDING_VERIFICATION').length, icon: Receipt, alert: orders.some(o => o.status === 'PENDING_VERIFICATION') },
                    { id: 'playstore', name: 'Google Play Console', icon: Smartphone },
                    { id: 'searchconsole', name: 'Google Search Console & SEO', icon: Search },
                    { id: 'announcement', name: 'Announcement & Popups', icon: BellRing },
                    { id: 'maintenance', name: 'Maintenance Mode', icon: Wrench, alert: storeConfig.maintenanceMode },
                    { id: 'analytics', name: 'Google Analytics 4', icon: BarChart3 },
                    { id: 'visitors', name: 'Real Visitors Traffic', icon: Users },
                    { id: 'branding', name: 'Branding & Passcode', icon: Palette },
                    { id: 'gateways', name: 'Payment Gateways', icon: CreditCard },
                    { id: 'logs', name: 'Activity Audit Logs', count: activityLogs.length, icon: Activity },
                    { id: 'sessions', name: 'Sessions & Security', count: activeSessionsCount, icon: ShieldCheck }
                  ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md font-black'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span>{tab.name}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                        {tab.alert && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2.5 border-t border-slate-800 space-y-2 text-center">
                  <div className="text-[11px] text-slate-400">
                    Status: <strong className={storeConfig.maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}>
                      {storeConfig.maintenanceMode ? 'Maintenance Mode' : 'Store Live Online'}
                    </strong>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auto-Sync Active (Mobile & PC)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLogout({ reason: 'Admin clicked Logout Admin in Mobile Drawer' })}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP-ONLY LEFT VERTICAL SIDEBAR */}
          <div className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
            
            {/* Top Brand Bar (Desktop) */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 shadow-lg flex items-center justify-center shrink-0 group">
                  <img src={storeConfig.favicon || storeConfig.logo || "/brand-icon.png"} alt={storeConfig.storeName || "DigiBundle"} className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white leading-tight tracking-tight flex items-center gap-1.5">
                    <span>Digi</span>
                    <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic">Bundle</span>
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Admin Portal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Desktop) */}
            <nav className="flex flex-col p-2 sm:p-3 gap-1 shrink-0">
              {/* 1. Bundles */}
              <button
                onClick={() => setActiveTab('bundles')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'bundles'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 shrink-0" />
                  <span>Reels Bundles</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'bundles' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {Math.min(50, bundles.length)}
                </span>
              </button>

              {/* 2. Orders & Revenue (WITH QR PAYMENT VERIFICATION) */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Orders & Verify QR</span>
                </div>
                {revenueStats.pendingCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {revenueStats.pendingCount} Pending
                  </span>
                ) : (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'orders' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              {/* 3. Top Announcement & Popups */}
              <button
                onClick={() => setActiveTab('announcement')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'announcement'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 shrink-0" />
                  <span>Announcements & Popups</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  storeConfig.showTopBanner ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {storeConfig.showTopBanner ? 'RUNNING' : 'STOPPED'}
                </span>
              </button>

              {/* 5. Website Maintenance Mode (CLEAR TURN ON / TURN OFF CONTROLS) */}
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'maintenance'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 shrink-0" />
                  <span>Maintenance Mode</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  storeConfig.maintenanceMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
                }`}>
                  {storeConfig.maintenanceMode ? 'LOCKED' : 'LIVE'}
                </span>
              </button>

              {/* 6. Google Analytics Integration (USER REQUESTED: NO CODE COPY-PASTE) */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Google Analytics</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  storeConfig.googleAnalyticsId ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {storeConfig.googleAnalyticsId ? 'CONNECTED' : 'OFF'}
                </span>
              </button>

              {/* 7. Traffic Analytics & Real Visitors */}
              <button
                onClick={() => setActiveTab('visitors')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'visitors'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Traffic Analytics</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Real-Time Analytics" />
              </button>

              {/* 8. Branding, Logos & Passcode */}
              <button
                onClick={() => setActiveTab('branding')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'branding'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Palette className="w-4 h-4 shrink-0" />
                <span>Branding & Logos</span>
              </button>

              {/* 9. Payment Gateways */}
              <button
                onClick={() => setActiveTab('gateways')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'gateways'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Payment Gateways</span>
              </button>

              {/* 10. Activity Logs */}
              <button
                onClick={() => setActiveTab('logs')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Activity Logs</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'logs' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {activityLogs.length}
                </span>
              </button>

              {/* 11. Google Play Console */}
              <button
                onClick={() => setActiveTab('playstore')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'playstore'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Google Play Console</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  activeTab === 'playstore' ? 'bg-slate-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  TWA
                </span>
              </button>

              {/* Google Search Console & SEO Hub */}
              <button
                onClick={() => setActiveTab('searchconsole')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'searchconsole'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Google Search Console</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  activeTab === 'searchconsole' ? 'bg-slate-950 text-blue-300' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  SEO
                </span>
              </button>

              {/* 12. Sessions & Security Management */}
              <button
                onClick={() => setActiveTab('sessions')}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'sessions'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Sessions & Security</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === 'sessions' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeSessionsCount}
                </span>
              </button>

            </nav>

            {/* Bottom Quick Status */}
            <div className="hidden md:block p-3.5 mt-auto border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Store Status:</span>
                <span className={`font-bold ${storeConfig.maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {storeConfig.maintenanceMode ? '● Maintenance' : '● Live Online'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleLogout({ reason: 'Admin clicked Log Out on sidebar' })}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* MAIN CONTENT AREA: 100% RESPONSIVE PADDING & SCROLL  */}
          {/* ==================================================== */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            
            {/* 1. Mobile-Only Single Sleek Top Bar (ONLY 1 MENU BUTTON) */}
            <div className="md:hidden bg-slate-900 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileAdminMenuOpen(true)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer relative"
                  title="Open Admin Menu"
                >
                  <Menu className="w-5 h-5" />
                  {revenueStats.pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-slate-900" />
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{storeConfig.storeName}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-md">
                    {activeTab === 'bundles' ? '📦 Bundles' : 
                     activeTab === 'orders' ? '📑 Orders' :
                     activeTab === 'playstore' ? '📱 Play Store' :
                     activeTab === 'searchconsole' ? '🔍 Google SEO' :
                     activeTab === 'gateways' ? '💳 Gateways' :
                     activeTab === 'visitors' ? '👥 Visitors' :
                     activeTab === 'announcement' ? '🔔 Alerts' :
                     activeTab === 'maintenance' ? '🛠️ Mode' :
                     activeTab === 'branding' ? '🎨 Branding' : 
                     activeTab === 'sessions' ? '🛡️ Sessions' : '⚙️ Admin'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <SyncStatusBadge isMobile={true} />
                <button
                  type="button"
                  onClick={() => handleSaveStoreConfig()}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLogout({ reason: 'Admin clicked Logout on Mobile Header' })}
                  className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Desktop-Only Header Area */}
            <div className="hidden md:flex px-6 py-3.5 bg-white border-b border-slate-200 items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {activeTab === 'bundles' && 'Reels Bundles Management'}
                  {activeTab === 'orders' && 'QR Payment Verification & Verified Revenue'}
                  {activeTab === 'playstore' && 'Google Play Console Publishing & Android TWA Hub'}
                  {activeTab === 'searchconsole' && 'Google Search Console & SEO Indexing Hub'}
                  {activeTab === 'announcement' && 'Announcement Bar & Live Purchase Popups'}
                  {activeTab === 'maintenance' && 'Website Maintenance Mode Controls'}
                  {activeTab === 'analytics' && 'Google Analytics 4 Direct Integration (No Code Needed)'}
                  {activeTab === 'visitors' && 'Real-Time Visitors & Store Traffic'}
                  {activeTab === 'branding' && 'Website Logos, Master Vault, Email & Passcode'}
                  {activeTab === 'gateways' && 'Payment Gateway Settings'}
                  {activeTab === 'logs' && 'System Activity Audit Logs'}
                  {activeTab === 'sessions' && 'Active Sessions & Authentication Security Guard'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  All modifications sync instantly in real time across PC, mobile, tablets and live website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SyncStatusBadge isMobile={false} />

                <button
                  type="button"
                  onClick={() => handleSaveStoreConfig()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-xs hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>

                {/* ADMIN PROFILE MENU & QUICK LOGOUT */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700"
                    title="Admin Profile & Session Security"
                  >
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-black text-slate-950">
                      V
                    </div>
                    <span>Vivek (Admin)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fadeIn space-y-1">
                      <div className="p-2.5 border-b border-slate-800 space-y-0.5">
                        <div className="font-black text-white flex items-center justify-between">
                          <span>admin_master</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">SUPER ADMIN</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Session: {currentSessionId ? currentSessionId.slice(0, 18) + '...' : 'Active'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('sessions');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Active Sessions ({activeSessionsCount})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Manage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('branding');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-bold cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Security & Passcode</span>
                      </button>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout({ reason: 'Admin clicked Secure Logout in Profile Menu' });
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 transition font-black cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-rose-400" />
                            <span>Secure Logout</span>
                          </div>
                          <span className="text-[10px] text-rose-400">Exit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conflict Alert Banner (If concurrent device edits detected) */}
            <ConflictAlertBanner 
              onApplyRemoteUpdate={(remoteData) => {
                if (remoteData?.bundles) onUpdateBundles(remoteData.bundles);
                if (remoteData?.config) setStoreConfig(prev => ({ ...prev, ...remoteData.config }));
                setEditingBundle(null);
                showNotification('Remote updates applied from cloud!');
              }}
              onKeepLocalEdits={() => {
                showNotification('Kept local edits.');
              }}
            />

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 md:pb-6 space-y-6">
              
              {/* ==================================================== */}
              {/* TAB 1: BUNDLES CATALOG                               */}
              {/* ==================================================== */}
              {activeTab === 'bundles' && (
                <div className="space-y-4">
                  {/* Search & Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search title, niche or bundle ID..."
                          value={bundleSearch}
                          onChange={(e) => setBundleSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      >
                        <option value="all">All Niches</option>
                        <option value="ai">AI Reels</option>
                        <option value="motivation">Motivation</option>
                        <option value="aesthetic">Aesthetic</option>
                        <option value="fitness">Fitness & Gym</option>
                        <option value="sanatan">Sanatan / Devotional</option>
                        <option value="cars">Luxury & Cars</option>
                        <option value="finance">Finance & Crypto</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add New Bundle</span>
                    </button>
                  </div>

                  {/* Mobile Bundles Cards View (sm:hidden) */}
                  <div className="sm:hidden space-y-2.5">
                    {filteredBundles.map((b) => (
                      <div key={b.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 shrink-0">
                            <img 
                              src={b.thumbnail} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate">{b.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{b.categoryLabel || b.category}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{b.clipCount} clips</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-900">₹{b.price}</span>
                              <span className="text-[10px] text-slate-400 line-through">₹{b.originalPrice}</span>
                              {b.videoPreview && b.videoPreview.trim() ? (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Demo</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingBundle(b)}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                            title="Edit Bundle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBundleToDelete(b)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                            title="Delete Bundle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bundles Table (Desktop: hidden sm:block) */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                            <th className="px-3 py-2.5">Photo</th>
                            <th className="px-3 py-2.5">Title & Niche</th>
                            <th className="px-3 py-2.5">Price</th>
                            <th className="px-3 py-2.5">Clips</th>
                            <th className="px-3 py-2.5">Demo Video</th>
                            <th className="px-3 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredBundles.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50 transition">
                              <td className="px-3 py-2">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 shrink-0">
                                  <img 
                                    src={b.thumbnail} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'; }}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2 max-w-xs">
                                <span className="font-bold text-slate-900 line-clamp-1 block">{b.title}</span>
                                <span className="text-[10px] text-amber-700 font-semibold">{b.categoryLabel || b.category}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className="font-black text-slate-900">₹{b.price}</span>
                                <span className="text-[10px] text-slate-400 line-through ml-1">₹{b.originalPrice}</span>
                              </td>
                              <td className="px-3 py-2 font-bold text-slate-600 text-[11px]">
                                {b.clipCount}
                              </td>
                              <td className="px-3 py-2">
                                {b.videoPreview && b.videoPreview.trim() ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Video className="w-2.5 h-2.5 text-emerald-600" />
                                    Custom Link
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    <Play className="w-2.5 h-2.5 text-slate-500" />
                                    Auto Sample
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setEditingBundle(b)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition cursor-pointer"
                                    title="Edit Bundle"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setBundleToDelete(b)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                                    title="Delete Bundle"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: ORDERS, QR VERIFICATION & VERIFIED REVENUE    */}
              {/* ==================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  
                  {/* Revenue Cards (ONLY VERIFIED PAYMENTS COUNT AS REAL REVENUE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border-2 border-emerald-300 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Verified Real Revenue</span>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="text-3xl font-black text-slate-950 mt-1">
                        ₹{revenueStats.verifiedRevenue.toLocaleString()}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {revenueStats.verifiedCount} Verified Paid Order(s)
                        </span>
                      </div>
                      {revenueStats.pendingRevenue > 0 && (
                        <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-amber-700 font-semibold">
                          + ₹{revenueStats.pendingRevenue.toLocaleString()} pending bank verification
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Approvals</span>
                      <h4 className="text-2xl font-black text-amber-600 mt-1">
                        {revenueStats.pendingCount}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-bold">Awaiting UTR confirmation</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Payment Modes</span>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                          PhonePe: {revenueStats.appBreakdown.phonepe}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                          GPay: {revenueStats.appBreakdown.gpay}
                        </span>
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded font-bold text-[10px]">
                          Paytm: {revenueStats.appBreakdown.paytm}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Total Submissions</span>
                      <h4 className="text-2xl font-black text-slate-900 mt-1">
                        {revenueStats.totalOrders}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-bold">Total checkout transactions</span>
                    </div>
                  </div>

                  {/* QR Payment Verification Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setOrderStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          orderStatusFilter === 'all'
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All Orders ({orders.length})
                      </button>

                      <button
                        onClick={() => setOrderStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                          orderStatusFilter === 'pending'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Pending Verification ({revenueStats.pendingCount})</span>
                      </button>

                      <button
                        onClick={() => setOrderStatusFilter('verified')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                          orderStatusFilter === 'verified'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified & Paid ({revenueStats.verifiedCount})</span>
                      </button>

                      <button
                        onClick={() => setOrderStatusFilter('rejected')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          orderStatusFilter === 'rejected'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        Rejected ({revenueStats.rejectedCount})
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      Check your bank account/UPI app for incoming UTR before clicking 'Verify & Approve'.
                    </span>
                  </div>

                  {/* Mobile Orders Cards View (sm:hidden) */}
                  <div className="sm:hidden space-y-3">
                    {displayedOrders.length === 0 ? (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                        No orders found under this status filter.
                      </div>
                    ) : (
                      displayedOrders.map((ord) => {
                        const isVerified = ord.status === 'VERIFIED' || ord.status === 'COMPLETED';
                        const isRejected = ord.status === 'REJECTED';
                        const isPending = !isVerified && !isRejected;
                        const payApp = ord.paymentApp || 'UPI QR';
                        const customerPhone = ord.whatsapp || ord.customerPhone || '';
                        const bundleTitle = ord.items?.[0]?.title || 'Reels Bundle';
                        const driveUrl = ord.items?.[0]?.driveLink || 'https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU';
                        const sendLinkWaUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(
                          `🎉 *ORDER VERIFIED & APPROVED!* 🎉\n\n` +
                          `Hello *${ord.name || 'Customer'}*,\n` +
                          `Your payment of *₹${ord.total || ord.amount}* (UTR: ${ord.utr}) for *${bundleTitle}* has been verified by the DigiBundle admin.\n\n` +
                          `📁 *YOUR OFFICIAL GOOGLE DRIVE FOLDER ACCESS:*\n${driveUrl}\n\n` +
                          `Enjoy your 1080p Full HD watermark-free reels!`
                        )}`;

                        return (
                          <div key={ord.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <div>
                                <span className="font-mono text-[11px] font-bold text-slate-500">#{ord.id}</span>
                                <h5 className="font-bold text-xs text-slate-900">{ord.name || 'Customer'}</h5>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isVerified ? 'bg-emerald-100 text-emerald-800' :
                                isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {isVerified ? '✓ VERIFIED' : isRejected ? '✕ REJECTED' : '⏳ PENDING'}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-[11px]">Bundle:</span>
                                <span className="font-bold text-slate-800 truncate max-w-[180px]">{bundleTitle}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-[11px]">Amount & App:</span>
                                <span className="font-black text-slate-900">₹{ord.total || ord.amount} <span className="text-[10px] font-semibold text-purple-700">({payApp})</span></span>
                              </div>
                              <div className="flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-600">UTR:</span>
                                <span className="font-mono text-xs font-black text-amber-800 select-all">{ord.utr || 'N/A'}</span>
                              </div>
                              {customerPhone && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500">WhatsApp:</span>
                                  <span className="font-mono text-slate-700">{customerPhone}</span>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectOrder(ord.id)}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyOrder(ord.id)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                                  >
                                    Verify & Approve
                                  </button>
                                </>
                              )}
                              {isVerified && customerPhone && (
                                <a
                                  href={sendLinkWaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Send Drive Link</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Orders & Verification Table (Desktop: hidden sm:block) */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600">
                            <th className="px-3 py-2.5">Order ID & Status</th>
                            <th className="px-3 py-2.5">Customer</th>
                            <th className="px-3 py-2.5">Bundle(s)</th>
                            <th className="px-3 py-2.5">Amount</th>
                            <th className="px-3 py-2.5">Payment App</th>
                            <th className="px-3 py-2.5">UTR Reference</th>
                            <th className="px-3 py-2.5 text-right">Admin Verification & Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {displayedOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                                No orders found under this status filter.
                              </td>
                            </tr>
                          ) : (
                            displayedOrders.map((ord) => {
                              const isVerified = ord.status === 'VERIFIED' || ord.status === 'COMPLETED';
                              const isRejected = ord.status === 'REJECTED';
                              const isPending = !isVerified && !isRejected;

                              const payApp = ord.paymentApp || 'UPI QR';
                              const customerPhone = ord.whatsapp || ord.customerPhone || '';
                              const bundleTitle = ord.items?.[0]?.title || 'Reels Bundle';
                              const driveUrl = ord.items?.[0]?.driveLink || 'https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU';

                              const sendLinkWaUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(
                                `🎉 *ORDER VERIFIED & APPROVED!* 🎉\n\n` +
                                `Hello *${ord.name || 'Customer'}*,\n` +
                                `Your payment of *₹${ord.total || ord.amount}* (UTR: ${ord.utr}) for *${bundleTitle}* has been verified by the DigiBundle admin.\n\n` +
                                `📁 *YOUR OFFICIAL GOOGLE DRIVE FOLDER ACCESS:*\n` +
                                `${driveUrl}\n\n` +
                                `Enjoy your 1080p Full HD watermark-free reels! Need more packs? Visit: http://localhost:5173/`
                              )}`;

                              return (
                                <tr key={ord.id} className={`hover:bg-slate-50 transition ${isPending ? 'bg-amber-50/20' : ''}`}>
                                  {/* Order ID & Status */}
                                  <td className="px-3 py-2.5">
                                    <span className="font-mono text-[11px] text-amber-800 font-bold block">#{ord.id}</span>
                                    {isVerified ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <CheckCircle className="w-2.5 h-2.5" /> Verified & Paid
                                      </span>
                                    ) : isRejected ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                                        <XCircle className="w-2.5 h-2.5" /> Rejected
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                        <Clock className="w-2.5 h-2.5 text-amber-700" /> Pending Verification
                                      </span>
                                    )}
                                  </td>

                                  {/* Customer Info */}
                                  <td className="px-3 py-2.5">
                                    <span className="font-bold text-slate-900 block">{ord.name || 'Customer'}</span>
                                    <span className="text-[11px] text-slate-500 font-mono">{customerPhone || 'No phone'}</span>
                                  </td>

                                  {/* Bundles */}
                                  <td className="px-3 py-2.5 max-w-xs">
                                    <span className="line-clamp-1 font-bold text-slate-800">
                                      {ord.items?.map(it => it.title).join(', ')}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">
                                      {ord.items?.length || 1} Bundle(s)
                                    </span>
                                  </td>

                                  {/* Amount */}
                                  <td className="px-3 py-2.5 font-black text-slate-950 text-sm">
                                    ₹{ord.total || ord.amount}
                                  </td>

                                  {/* Payment App */}
                                  <td className="px-3 py-2.5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      payApp.toLowerCase().includes('phonepe') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                      payApp.toLowerCase().includes('google') || payApp.toLowerCase().includes('gpay') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      payApp.toLowerCase().includes('paytm') ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                      'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                      {payApp}
                                    </span>
                                  </td>

                                  {/* UTR with 1-click Copy */}
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {ord.utr || '—'}
                                      </span>
                                      {ord.utr && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(ord.utr);
                                            showNotification(`Copied UTR: ${ord.utr}`);
                                          }}
                                          className="text-[10px] font-bold text-amber-600 hover:text-amber-800 underline cursor-pointer"
                                          title="Copy UTR to verify in Bank/UPI App"
                                        >
                                          Copy
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  {/* Admin Actions */}
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5 justify-end">
                                      {isPending && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleVerifyOrder(ord.id)}
                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[11px] inline-flex items-center gap-1 transition shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                                            title="Click to approve payment & add to verified revenue"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Verify & Approve</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleRejectOrder(ord.id)}
                                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                                            title="Reject invalid/unpaid UTR"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Reject</span>
                                          </button>
                                        </>
                                      )}

                                      {isVerified && customerPhone && (
                                        <a
                                          href={sendLinkWaUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[11px] inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                          title="Send official Google Drive folder link to customer on WhatsApp"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          <span>Send Drive Link</span>
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: ANNOUNCEMENT BAR & PURCHASE POPUP CONTROLS     */}
              {/* ==================================================== */}
              {activeTab === 'announcement' && (
                <div className="max-w-3xl space-y-6">
                  
                  {/* CARD 1: TOP HEADER ANNOUNCEMENT BAR */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-amber-500" />
                          <h4 className="text-base font-black text-slate-900">
                            Top Header Announcement Bar
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Visible at the very top of every page with countdown timer.
                        </p>
                      </div>

                      {/* Status & RUN / STOP Control Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetTopBannerState(true)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                            storeConfig.showTopBanner
                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>RUN / START</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetTopBannerState(false)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                            !storeConfig.showTopBanner
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
                          }`}
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>STOP / PAUSE</span>
                        </button>
                      </div>
                    </div>

                    {/* Announcement Text Form */}
                    <form onSubmit={handleSaveAnnouncementText} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                          Announcement Text (Editable)
                        </label>
                        <textarea
                          rows={2}
                          value={storeConfig.bannerText}
                          onChange={(e) => setStoreConfig({ ...storeConfig, bannerText: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Enter announcement text..."
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Status: <strong className={storeConfig.showTopBanner ? 'text-emerald-600' : 'text-rose-600'}>
                            {storeConfig.showTopBanner ? '● Currently Live on Site' : '■ Currently Hidden / Paused'}
                          </strong>
                        </span>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Save Announcement Text
                        </button>
                      </div>
                    </form>

                    {/* Live Preview */}
                    <div className="pt-3 border-t border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Live Storefront Preview
                      </span>
                      <div className="bg-slate-950 text-white text-xs py-2 px-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-center">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                        <span className="line-clamp-1">{storeConfig.bannerText}</span>
                        <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0">
                          Ends in: 14:52
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: LIVE CUSTOMER PURCHASE POPUP */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-amber-500" />
                          <h4 className="text-base font-black text-slate-900">
                            Live Verified Purchases Feed (Side-Scrollable Strip)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Side-scrollable customer purchases strip displayed between Hero &amp; Catalog on Mobile &amp; PC.
                        </p>
                      </div>

                      {/* RUN / STOP Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetPurchasePopupState(true)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                            storeConfig.showPurchasePopup
                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>RUN / ENABLE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetPurchasePopupState(false)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                            !storeConfig.showPurchasePopup
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
                          }`}
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>STOP / DISABLE</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Current Real Purchase Count: <strong className="text-emerald-700">{orders.length} order(s)</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Displays verified customer purchases in a smooth side-scrollable horizontal track on both Mobile &amp; PC.
                        </span>
                      </div>

                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                        storeConfig.showPurchasePopup ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {storeConfig.showPurchasePopup ? '● Feed Active' : '■ Feed Stopped'}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 5: WEBSITE MAINTENANCE MODE (PROMINENT ON & OFF) */}
              {/* ==================================================== */}
              {activeTab === 'maintenance' && (
                <div className="max-w-3xl space-y-6">
                  
                  {/* Status Banner with Clear Turn ON and Turn OFF Buttons & Preview */}
                  <div className={`p-5 sm:p-6 rounded-3xl border-2 flex flex-col gap-4 shadow-sm transition-all ${
                    storeConfig.maintenanceMode
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Wrench className={`w-6 h-6 ${storeConfig.maintenanceMode ? 'text-rose-600' : 'text-emerald-600'}`} />
                          <h4 className="text-lg font-black tracking-tight">
                            {storeConfig.maintenanceMode 
                              ? '⚠️ MAINTENANCE MODE IS CURRENTLY ON (Website is Locked)' 
                              : '✅ WEBSITE IS CURRENTLY LIVE & ONLINE'}
                          </h4>
                        </div>
                        <p className="text-xs opacity-90 max-w-xl">
                          {storeConfig.maintenanceMode
                            ? 'Public visitors see the dark luxury maintenance screen with live countdown, progress bar, 3 task status indicators, and WhatsApp/Email support.'
                            : 'All visitors can freely browse reels bundles, watch previews, and complete purchases.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setShowMaintenancePreview(true)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          title="Preview how maintenance screen appears to visitors"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Preview Screen</span>
                        </button>

                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          storeConfig.maintenanceMode ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                        }`}>
                          {storeConfig.maintenanceMode ? 'MAINTENANCE ON' : 'SITE LIVE'}
                        </span>
                      </div>
                    </div>

                    {/* TWO EXPLICIT WORKING BUTTONS: TURN ON & TURN OFF */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        data-testid="turn-off-maintenance-btn"
                        onClick={() => handleSetMaintenanceMode(false)}
                        className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                          !storeConfig.maintenanceMode
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                            : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-300'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>🟢 Turn OFF Maintenance & Go Live Now</span>
                      </button>

                      <button
                        type="button"
                        data-testid="turn-on-maintenance-btn"
                        onClick={() => handleSetMaintenanceMode(true)}
                        className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                          storeConfig.maintenanceMode
                            ? 'bg-rose-600 text-white ring-4 ring-rose-500/30'
                            : 'bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-300'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        <span>🔴 Turn ON Maintenance Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Page Customizer Form */}
                  <form onSubmit={handleSaveMaintenanceSettings} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h5 className="text-sm font-black text-slate-900 tracking-tight">
                          Configure Premium Maintenance Screen
                        </h5>
                        <p className="text-xs text-slate-500">
                          Control headlines, live countdown timer, upgrade progress %, and status cards.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMaintenancePreview(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </button>
                    </div>

                    {/* 1. Hero Content: Headline & Subtitle */}
                    <div className="space-y-4">
                      <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        1. Hero Content & Copy
                      </h6>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Maintenance Main Heading
                        </label>
                        <input
                          type="text"
                          value={storeConfig.maintenanceTitle || ''}
                          onChange={(e) => setStoreConfig({ ...storeConfig, maintenanceTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          placeholder="We're Making Things Better."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Supporting Explanation Text
                        </label>
                        <textarea
                          rows={3}
                          value={storeConfig.maintenanceMessage || ''}
                          onChange={(e) => setStoreConfig({ ...storeConfig, maintenanceMessage: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed"
                          placeholder="Our team is currently performing scheduled high-performance upgrades, optimizing database queries, and hardening system security to deliver an ultra-fast experience."
                        />
                      </div>
                    </div>

                    {/* 2. Reopening Countdown & Datetime */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          2. Live Countdown & Reopening Time
                        </h6>
                        <span className="text-[11px] font-semibold text-slate-500">Real-time sync</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Expected Reopening Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={(() => {
                              if (!storeConfig.maintenanceReopenTimestamp) return '';
                              try {
                                const d = new Date(storeConfig.maintenanceReopenTimestamp);
                                if (isNaN(d.getTime())) return '';
                                const pad = (n) => String(n).padStart(2, '0');
                                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                              } catch {
                                return '';
                              }
                            })()}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStoreConfig({
                                ...storeConfig,
                                maintenanceReopenTimestamp: val ? new Date(val).toISOString() : ''
                              });
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          />
                          {/* Quick preset buttons */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-bold">Quick ETA:</span>
                            {[
                              { label: '+30m', hours: 0.5 },
                              { label: '+2h', hours: 2 },
                              { label: '+6h', hours: 6 },
                              { label: '+24h', hours: 24 }
                            ].map(preset => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  const d = new Date(Date.now() + preset.hours * 60 * 60 * 1000);
                                  setStoreConfig({
                                    ...storeConfig,
                                    maintenanceReopenTimestamp: d.toISOString(),
                                    maintenanceEstimatedTime: preset.label === '+30m' ? '30 Minutes' : `${preset.hours} Hours`
                                  });
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setStoreConfig({ ...storeConfig, maintenanceReopenTimestamp: '' })}
                              className="px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Estimated Return Display Text (Badge)
                          </label>
                          <input
                            type="text"
                            value={storeConfig.maintenanceEstimatedTime || ''}
                            onChange={(e) => setStoreConfig({ ...storeConfig, maintenanceEstimatedTime: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            placeholder="15 - 20 Minutes / 2 Hours"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Shown on the countdown card badge as estimated completion.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Progress Percentage Bar */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          3. Overall Upgrade Progress Percentage
                        </h6>
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {storeConfig.maintenanceProgress ?? 68}%
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={storeConfig.maintenanceProgress ?? 68}
                          onChange={(e) => setStoreConfig({ ...storeConfig, maintenanceProgress: Number(e.target.value) })}
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={storeConfig.maintenanceProgress ?? 68}
                          onChange={(e) => setStoreConfig({ ...storeConfig, maintenanceProgress: Number(e.target.value) })}
                          className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center"
                        />
                      </div>

                      {/* Live Mini Preview Bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, storeConfig.maintenanceProgress ?? 68))}%` }}
                        />
                      </div>
                    </div>

                    {/* 4. Three Task Status Selectors */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        4. Individual Maintenance Task Statuses
                      </h6>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Server Infrastructure */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Server className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Server Infrastructure</span>
                          </div>
                          <select
                            value={storeConfig.maintenanceTasks?.server || 'completed'}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              maintenanceTasks: {
                                ...(storeConfig.maintenanceTasks || {}),
                                server: e.target.value
                              }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                          >
                            <option value="completed">Completed ✅</option>
                            <option value="in_progress">In Progress ⏳</option>
                            <option value="pending">Pending 🕒</option>
                          </select>
                        </div>

                        {/* Database Optimization */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Database className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Database Optimization</span>
                          </div>
                          <select
                            value={storeConfig.maintenanceTasks?.database || 'in_progress'}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              maintenanceTasks: {
                                ...(storeConfig.maintenanceTasks || {}),
                                database: e.target.value
                              }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                          >
                            <option value="completed">Completed ✅</option>
                            <option value="in_progress">In Progress ⏳</option>
                            <option value="pending">Pending 🕒</option>
                          </select>
                        </div>

                        {/* Security Improvements */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                            <span>Security Improvements</span>
                          </div>
                          <select
                            value={storeConfig.maintenanceTasks?.security || 'pending'}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              maintenanceTasks: {
                                ...(storeConfig.maintenanceTasks || {}),
                                security: e.target.value
                              }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                          >
                            <option value="completed">Completed ✅</option>
                            <option value="in_progress">In Progress ⏳</option>
                            <option value="pending">Pending 🕒</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 5. Contact Channels */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        5. Support Contacts Configured for Maintenance Visitors
                      </h6>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Support WhatsApp Number
                          </label>
                          <input
                            type="text"
                            value={storeConfig.whatsappNumber || ''}
                            onChange={(e) => setStoreConfig({ ...storeConfig, whatsappNumber: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            placeholder="7017324978"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Support Email Address
                          </label>
                          <input
                            type="email"
                            value={storeConfig.supportEmail || ''}
                            onChange={(e) => setStoreConfig({ ...storeConfig, supportEmail: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            placeholder="support@digibundle.in"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowMaintenancePreview(true)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Maintenance Screen</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Save className="w-4 h-4 text-emerald-400" />
                        <span>Save & Deploy Maintenance Settings</span>
                      </button>
                    </div>
                  </form>

                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 6: GOOGLE ANALYTICS INTEGRATION (NO CODE COPY)   */}
              {/* ==================================================== */}
              {activeTab === 'analytics' && (
                <div className="max-w-2xl bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-5 h-5 text-amber-500" />
                      <h4 className="text-base font-black text-slate-900">
                        Google Analytics 4 (GA4) Direct Connection
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Connect your Google Analytics Measurement ID here. DigiBundle automatically loads the official tracking code across the whole website—<strong>zero code copy-pasting required</strong>!
                    </p>
                  </div>

                  {/* Status Card */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    storeConfig.googleAnalyticsId 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${
                        storeConfig.googleAnalyticsId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`} />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">
                          {storeConfig.googleAnalyticsId ? 'Google Analytics Connected & Active' : 'Not Connected'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {storeConfig.googleAnalyticsId ? `Measurement ID: ${storeConfig.googleAnalyticsId}` : 'No tracking ID saved'}
                        </span>
                      </div>
                    </div>

                    {storeConfig.googleAnalyticsId && (
                      <button
                        type="button"
                        onClick={handleSendTestGAEvent}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Send Test Event
                      </button>
                    )}
                  </div>

                  {/* Connect Form */}
                  <form onSubmit={handleSaveGoogleAnalytics} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                        Google Analytics Measurement ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. G-1234567890"
                        value={storeConfig.googleAnalyticsId || ''}
                        onChange={(e) => setStoreConfig({ ...storeConfig, googleAnalyticsId: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Find this in your Google Analytics dashboard under: <strong>Admin → Data Streams → Web Stream → Measurement ID (starts with G-)</strong>.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {storeConfig.googleAnalyticsId ? (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...storeConfig, googleAnalyticsId: '' };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                            showNotification('Google Analytics disconnected.');
                          }}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Disconnect
                        </button>
                      ) : <div />}

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-xs hover:brightness-105 transition cursor-pointer"
                      >
                        Connect & Save ID
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 7: REAL WEBSITE TRAFFIC & VISITORS               */}
              {/* ==================================================== */}
              {activeTab === 'visitors' && (
                <TrafficAnalytics 
                  visitorStats={visitorStats} 
                  onSyncWithCloud={handleSaveStoreConfig} 
                />
              )}

              {/* ==================================================== */}
              {/* TAB 8: BRANDING, LOGOS, MASTER VAULT & PASSCODE      */}
              {/* ==================================================== */}
              {activeTab === 'branding' && (
                <div className="max-w-3xl bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                          Official Design System
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                          Vector & Retina Ready
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        Store Branding, Logos & Assets
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        High-definition brand identity, custom logo overrides, favicon synchronizer, and passcode security.
                      </p>
                    </div>

                    <a
                      href="/social-share.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Social Card</span>
                    </a>
                  </div>

                  {/* Brand Overview & Active Assets Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 1. Brand Icon */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center mb-2">
                        <img src={storeConfig.favicon || "/brand-icon.png"} alt="Brand Icon" className="w-10 h-10 object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">Brand Icon</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5">512x512 PNG / SVG</span>
                    </div>

                    {/* 2. Light Logo */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-full h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center mb-2 px-2">
                        <img src={storeConfig.logo || "/logo.png"} alt="Light Logo" className="max-h-8 max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">Light Logo</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5">For Light Header</span>
                    </div>

                    {/* 3. Dark Logo */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-full h-12 rounded-xl bg-slate-950 p-1 border border-slate-800 shadow-xs flex items-center justify-center mb-2 px-2">
                        <img src={storeConfig.footerLogo || "/logo-dark.png"} alt="Dark Logo" className="max-h-8 max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-white">Dark Logo</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Transparent PNG</span>
                    </div>

                    {/* 4. Brand Palette */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center text-center justify-between">
                      <div className="flex items-center gap-1.5 my-auto">
                        <span className="w-5 h-5 rounded-full bg-[#7C3AED] shadow-xs" title="Electric Violet (#7C3AED)"></span>
                        <span className="w-5 h-5 rounded-full bg-[#EC4899] shadow-xs" title="Vibrant Magenta (#EC4899)"></span>
                        <span className="w-5 h-5 rounded-full bg-[#FDE047] shadow-xs" title="Gold (#FDE047)"></span>
                        <span className="w-5 h-5 rounded-full bg-[#020617] shadow-xs" title="Midnight Slate (#020617)"></span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">Brand Palette</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5">SaaS Color System</span>
                    </div>
                  </div>

                  {/* 1. Website Header Logo Configuration (Dynamic URL + Upload) */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Website Header Logo (Light Version)
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Dynamic Logo
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-40 h-16 bg-white rounded-2xl border border-amber-300 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
                        <img 
                          src={storeConfig.logo || '/logo.png'} 
                          alt="Store Logo" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                        />
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <input
                          type="text"
                          value={storeConfig.logo || ''}
                          onChange={(e) => {
                            const updated = { ...storeConfig, logo: e.target.value };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                          }}
                          placeholder="Logo image URL or file path (e.g. /logo.png or https://...)"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                        />

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...storeConfig, logo: '/logo.png' };
                              setStoreConfig(updated);
                              handleSaveStoreConfig(updated);
                              showNotification('Logo reset to default!');
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Reset Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Website Footer Logo Configuration (Dynamic URL + Upload) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Website Footer Logo (Dark Version)
                      </label>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Dynamic Logo
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-40 h-16 bg-slate-950 rounded-2xl border border-slate-300 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
                        <img 
                          src={storeConfig.footerLogo || '/logo-dark.png'} 
                          alt="Footer Logo" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/logo-dark.png'; }}
                        />
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <input
                          type="text"
                          value={storeConfig.footerLogo || ''}
                          onChange={(e) => {
                            const updated = { ...storeConfig, footerLogo: e.target.value };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                          }}
                          placeholder="Footer logo image URL or file path (e.g. /logo-dark.png or https://...)"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                        />

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFooterLogoUpload}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...storeConfig, footerLogo: '/logo-dark.png' };
                              setStoreConfig(updated);
                              handleSaveStoreConfig(updated);
                              showNotification('Footer logo reset to default!');
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Reset Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Browser Tab Favicon Icon Configuration (Dynamic URL + Upload) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Browser Tab Favicon Icon
                      </label>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Dynamic Icon
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-300 flex items-center justify-center p-1.5 shadow-sm shrink-0 overflow-hidden">
                        <img 
                          src={storeConfig.favicon || '/brand-icon.png'} 
                          alt="Favicon" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/brand-icon.png'; }}
                        />
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <input
                          type="text"
                          value={storeConfig.favicon || ''}
                          onChange={(e) => {
                            const updated = { ...storeConfig, favicon: e.target.value };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                          }}
                          placeholder="Favicon image URL or file path (e.g. /brand-icon.png or https://...)"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                        />

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFaviconUpload}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...storeConfig, favicon: '/brand-icon.png' };
                              setStoreConfig(updated);
                              handleSaveStoreConfig(updated);
                              showNotification('Favicon reset to default!');
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Reset Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. All-In-One Master Vault Thumbnail Upload */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      All-In-One Master Vault Thumbnail Photo
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-28 h-20 bg-slate-950 rounded-xl border border-amber-300 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                        <img 
                          src={storeConfig.masterVaultThumbnail || "https://i.ibb.co/Lzvn9hTm/sheru-bhai-mega-reels-bundle-ad.png"} 
                          alt="Master Vault" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1.5 flex-1 w-full">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload Master Vault Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMasterVaultThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-600 block">
                          Displayed 100% clean on the Master Vault card with NO text covering it.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Support Email (support@digibundle.in) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Store Support Email
                    </label>
                    <input
                      type="email"
                      value={storeConfig.supportEmail || 'support@digibundle.in'}
                      onChange={(e) => setStoreConfig({ ...storeConfig, supportEmail: e.target.value })}
                      placeholder="support@digibundle.in"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* 6. Admin Passcode Change */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Change Admin Login Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPasscodeText(!showPasscodeText)}
                        className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                      >
                        {showPasscodeText ? 'Hide Passcode' : 'Show Passcode'}
                      </button>
                    </div>

                    <form onSubmit={handleUpdatePasscode} className="flex gap-2">
                      <input
                        type={showPasscodeText ? "text" : "password"}
                        placeholder="Enter new admin passcode"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Update Passcode
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 9: PAYMENT GATEWAYS CONTROLS & ROUTING           */}
                {/* ==================================================== */}
                {activeTab === 'gateways' && (
                  <div className="space-y-6 max-w-4xl">
                    {/* Header info card */}
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 rounded-3xl text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Multi-Gateway Payment Switcher</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          Payment Gateway Routing & Credentials
                        </h4>
                        <p className="text-xs text-white/90 mt-1 max-w-xl font-medium">
                          Choose whether <strong>only 1 payment gateway</strong> should be active at a time or <strong>multiple gateways together</strong> so customers can select Razorpay, Cashfree, PayPal, or UPI QR at checkout.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleSaveStoreConfig();
                          addLog('GATEWAYS', 'Payment Gateways Saved', `Mode: ${storeConfig.gatewayMode}, Active: ${storeConfig.activeGateway}`);
                        }}
                        className="px-5 py-2.5 bg-slate-950 text-amber-400 hover:bg-slate-900 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Gateways</span>
                      </button>
                    </div>

                    {/* ==================================================== */}
                    {/* 1. GATEWAY MODE SWITCHER (SINGLE vs MULTIPLE)        */}
                    {/* ==================================================== */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <span>Gateway Selection Mode</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ek time pe ek gateway on hona chahiye ya multiple? Choose below:
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1: Single Gateway Mode */}
                        <div 
                          onClick={() => {
                            const updated = { ...storeConfig, gatewayMode: 'single' };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                            addLog('GATEWAYS', 'Gateway Mode Changed', 'Switched to Single Gateway Mode.');
                            showNotification('Single Gateway Mode Activated! Only 1 gateway will be active at checkout.');
                          }}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                            storeConfig.gatewayMode === 'single'
                              ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-400/20'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  storeConfig.gatewayMode === 'single' ? 'border-amber-600 bg-amber-600' : 'border-slate-400'
                                }`}>
                                  {storeConfig.gatewayMode === 'single' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span>Single Gateway Mode</span>
                              </span>
                              <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                                1 Active Only
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Ek time pe sirf <strong>ek payment gateway</strong> active rahega. Checkout pe customer ko direct wahi gateway dikhega bina choose kiye.
                            </p>
                          </div>

                          {storeConfig.gatewayMode === 'single' && (
                            <div className="mt-4 pt-3 border-t border-amber-200/80">
                              <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                                Choose which 1 gateway is active:
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: 'upi_qr', name: 'Direct UPI QR', sub: '0% Fee • Instant' },
                                  { id: 'razorpay', name: 'Razorpay', sub: 'UPI, Cards, Netbanking' },
                                  { id: 'cashfree', name: 'Cashfree', sub: 'Fast PG Checkout' },
                                  { id: 'paypal', name: 'PayPal', sub: 'International • USD' }
                                ].map((gw) => (
                                  <button
                                    key={gw.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = { ...storeConfig, activeGateway: gw.id };
                                      setStoreConfig(updated);
                                      handleSaveStoreConfig(updated);
                                      addLog('GATEWAYS', 'Active Gateway Changed', `Active Gateway set to ${gw.name}`);
                                      showNotification(`${gw.name} is now your exclusive active payment gateway!`);
                                    }}
                                    className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                                      storeConfig.activeGateway === gw.id
                                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-bold'
                                    }`}
                                  >
                                    <p className="truncate">{gw.name}</p>
                                    <p className={`text-[9px] truncate ${storeConfig.activeGateway === gw.id ? 'text-slate-950 font-bold' : 'text-slate-400 font-normal'}`}>
                                      {gw.sub}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Option 2: Multiple Gateways Mode */}
                        <div 
                          onClick={() => {
                            const updated = { ...storeConfig, gatewayMode: 'multiple' };
                            setStoreConfig(updated);
                            handleSaveStoreConfig(updated);
                            addLog('GATEWAYS', 'Gateway Mode Changed', 'Switched to Multiple Gateways Mode.');
                            showNotification('Multiple Gateways Mode Activated! Customer can choose gateway at checkout.');
                          }}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                            storeConfig.gatewayMode === 'multiple'
                              ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-400/20'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  storeConfig.gatewayMode === 'multiple' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                                }`}>
                                  {storeConfig.gatewayMode === 'multiple' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span>Multiple Gateways Mode</span>
                              </span>
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                Customer Choice
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Ek time pe <strong>multiple gateways</strong> active rahenge. Customer checkout ke time pe Razorpay, Cashfree, PayPal ya UPI QR me se apni pasand ka gateway choose kar sakega.
                            </p>
                          </div>

                          {storeConfig.gatewayMode === 'multiple' && (
                            <div className="mt-4 pt-3 border-t border-emerald-200/80">
                              <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                                Toggle gateways available at checkout:
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: 'upi_qr', name: 'Direct UPI QR' },
                                  { id: 'razorpay', name: 'Razorpay' },
                                  { id: 'cashfree', name: 'Cashfree' },
                                  { id: 'paypal', name: 'PayPal' }
                                ].map((gw) => {
                                  const enabledList = storeConfig.enabledGateways || ['upi_qr'];
                                  const isEnabled = enabledList.includes(gw.id);
                                  return (
                                    <button
                                      key={gw.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        let nextList = [...enabledList];
                                        if (isEnabled) {
                                          if (nextList.length <= 1) {
                                            alert('At least 1 gateway must remain enabled.');
                                            return;
                                          }
                                          nextList = nextList.filter(x => x !== gw.id);
                                        } else {
                                          nextList.push(gw.id);
                                        }
                                        const updated = { ...storeConfig, enabledGateways: nextList };
                                        setStoreConfig(updated);
                                        handleSaveStoreConfig(updated);
                                        addLog('GATEWAYS', 'Gateway Toggled', `${gw.name} ${!isEnabled ? 'ENABLED' : 'DISABLED'} for checkout.`);
                                        showNotification(`${gw.name} ${!isEnabled ? 'Enabled' : 'Disabled'} for checkout!`);
                                      }}
                                      className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                                        isEnabled
                                          ? 'bg-emerald-600 text-white border-emerald-700 font-black shadow-xs'
                                          : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100 font-bold opacity-70'
                                      }`}
                                    >
                                      <span>{gw.name}</span>
                                      <span className="text-[10px] font-black">{isEnabled ? '✓ ON' : 'OFF'}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ==================================================== */}
                    {/* 2. GATEWAY 1: RAZORPAY CONFIGURATION PANEL           */}
                    {/* ==================================================== */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>Razorpay Payment Gateway</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                storeConfig.razorpay?.keyId ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {storeConfig.razorpay?.keyId ? 'Keys Configured' : 'Keys Needed'}
                              </span>
                            </h5>
                            <p className="text-xs text-slate-500">Supports UPI, Credit/Debit Cards, NetBanking, and PayLater</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = storeConfig.razorpay?.mode || 'live';
                              const nextMode = cur === 'live' ? 'test' : 'live';
                              setStoreConfig({
                                ...storeConfig,
                                razorpay: { ...storeConfig.razorpay, mode: nextMode }
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              storeConfig.razorpay?.mode === 'test'
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-blue-100 border-blue-300 text-blue-900'
                            }`}
                          >
                            Mode: {storeConfig.razorpay?.mode === 'test' ? '🧪 Test Sandbox' : '⚡ Live Production'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Razorpay Key ID
                          </label>
                          <input
                            type="text"
                            placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                            value={storeConfig.razorpay?.keyId || ''}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              razorpay: { ...storeConfig.razorpay, keyId: e.target.value.trim() }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Razorpay Key Secret
                          </label>
                          <div className="relative">
                            <input
                              type={showRazorpaySecret ? 'text' : 'password'}
                              placeholder="Enter Razorpay Key Secret"
                              value={storeConfig.razorpay?.keySecret || ''}
                              onChange={(e) => setStoreConfig({
                                ...storeConfig,
                                razorpay: { ...storeConfig.razorpay, keySecret: e.target.value.trim() }
                              })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        💡 <strong>How to get keys:</strong> Login to <strong>dashboard.razorpay.com</strong> &gt; Settings &gt; API Keys &gt; Generate Key. Paste the Key ID and Secret above.
                      </p>
                    </div>

                    {/* ==================================================== */}
                    {/* 3. GATEWAY 2: CASHFREE CONFIGURATION PANEL           */}
                    {/* ==================================================== */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>Cashfree Payment Gateway</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                storeConfig.cashfree?.appId ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {storeConfig.cashfree?.appId ? 'Configured' : 'Credentials Needed'}
                              </span>
                            </h5>
                            <p className="text-xs text-slate-500">Supports direct UPI auto-redirect, credit/debit cards, and wallets</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = storeConfig.cashfree?.environment || 'production';
                              const nextEnv = cur === 'production' ? 'sandbox' : 'production';
                              setStoreConfig({
                                ...storeConfig,
                                cashfree: { ...storeConfig.cashfree, environment: nextEnv }
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              storeConfig.cashfree?.environment === 'sandbox'
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-purple-100 border-purple-300 text-purple-900'
                            }`}
                          >
                            Env: {storeConfig.cashfree?.environment === 'sandbox' ? '🧪 Sandbox' : '⚡ Production'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Cashfree App ID / Client ID
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Cashfree App ID"
                            value={storeConfig.cashfree?.appId || ''}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              cashfree: { ...storeConfig.cashfree, appId: e.target.value.trim() }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Cashfree Secret Key
                          </label>
                          <div className="relative">
                            <input
                              type={showCashfreeSecret ? 'text' : 'password'}
                              placeholder="Enter Cashfree Secret Key"
                              value={storeConfig.cashfree?.secretKey || ''}
                              onChange={(e) => setStoreConfig({
                                ...storeConfig,
                                cashfree: { ...storeConfig.cashfree, secretKey: e.target.value.trim() }
                              })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCashfreeSecret(!showCashfreeSecret)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showCashfreeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        💡 <strong>How to get keys:</strong> Login to <strong>merchant.cashfree.com</strong> &gt; Developers &gt; API Keys &gt; Generate API Keys.
                      </p>
                    </div>

                    {/* ==================================================== */}
                    {/* 4. GATEWAY 3: PAYPAL CONFIGURATION PANEL             */}
                    {/* ==================================================== */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-black">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>PayPal Global Gateway</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                storeConfig.paypal?.clientId ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {storeConfig.paypal?.clientId ? 'Configured' : 'Client ID Needed'}
                              </span>
                            </h5>
                            <p className="text-xs text-slate-500">For international customers paying via USD or global debit/credit cards</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = storeConfig.paypal?.mode || 'live';
                              const nextMode = cur === 'live' ? 'sandbox' : 'live';
                              setStoreConfig({
                                ...storeConfig,
                                paypal: { ...storeConfig.paypal, mode: nextMode }
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              storeConfig.paypal?.mode === 'sandbox'
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-sky-100 border-sky-300 text-sky-900'
                            }`}
                          >
                            Mode: {storeConfig.paypal?.mode === 'sandbox' ? '🧪 Sandbox' : '⚡ Live PayPal'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            PayPal Client ID
                          </label>
                          <input
                            type="text"
                            placeholder="Enter PayPal REST API Client ID"
                            value={storeConfig.paypal?.clientId || ''}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              paypal: { ...storeConfig.paypal, clientId: e.target.value.trim() }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            1 USD = INR (Rate)
                          </label>
                          <input
                            type="number"
                            placeholder="85"
                            value={storeConfig.paypal?.exchangeRate || 85}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              paypal: { ...storeConfig.paypal, exchangeRate: Number(e.target.value) || 85 }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          PayPal Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showPaypalSecret ? 'text' : 'password'}
                            placeholder="Enter PayPal Client Secret"
                            value={storeConfig.paypal?.clientSecret || ''}
                            onChange={(e) => setStoreConfig({
                              ...storeConfig,
                              paypal: { ...storeConfig.paypal, clientSecret: e.target.value.trim() }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        💡 <strong>How to get keys:</strong> Login to <strong>developer.paypal.com</strong> &gt; Dashboard &gt; Apps &amp; Credentials &gt; Create App &gt; Copy Client ID &amp; Secret.
                      </p>
                    </div>

                    {/* ==================================================== */}
                    {/* 5. GATEWAY 4: DIRECT UPI QR CONFIGURATION            */}
                    {/* ==================================================== */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <span>Direct UPI QR Mode (0% Commission)</span>
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              No Middleman
                            </span>
                          </h5>
                          <p className="text-xs text-slate-500">Customer scans your UPI QR code, pays directly into your bank, and submits UTR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Your UPI ID (VPA) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={storeConfig.upiId || 'digibundle@upi'}
                            onChange={(e) => setStoreConfig({ 
                              ...storeConfig, 
                              upiId: e.target.value.trim(),
                              upiGateway: { ...storeConfig.upiGateway, upiId: e.target.value.trim() }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Payee / Merchant Display Name
                          </label>
                          <input
                            type="text"
                            value={storeConfig.upiName || 'DigiBundle'}
                            onChange={(e) => setStoreConfig({ 
                              ...storeConfig, 
                              upiName: e.target.value,
                              upiGateway: { ...storeConfig.upiGateway, payeeName: e.target.value }
                            })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          handleSaveStoreConfig();
                          addLog('GATEWAYS', 'Payment Settings Saved', `Mode: ${storeConfig.gatewayMode}, Active: ${storeConfig.activeGateway}`);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Payment Gateway Settings</span>
                      </button>
                    </div>

                  </div>
                )}

              {/* ==================================================== */}
              {/* TAB 10: ADVANCED SYSTEM ACTIVITY LOGS & AUDIT TRAIL   */}
              {/* ==================================================== */}
              {activeTab === 'logs' && (
                <ActivityLogsDashboard
                  logs={activityLogs}
                  onUpdateLogs={setActivityLogs}
                  onAddLog={addLog}
                />
              )}

              {/* ==================================================== */}
              {/* TAB 11: GOOGLE PLAY CONSOLE PUBLISHING HUB           */}
              {/* ==================================================== */}
              {activeTab === 'playstore' && (
                <GooglePlayConsolePublisher
                  storeConfig={storeConfig}
                  onUpdateConfig={(updated) => {
                    setStoreConfig(prev => ({ ...prev, ...updated }));
                  }}
                  onSaveConfig={handleSaveStoreConfig}
                  addLog={addLog}
                />
              )}

              {/* ==================================================== */}
              {/* TAB: GOOGLE SEARCH CONSOLE & SEO HUB                 */}
              {/* ==================================================== */}
              {activeTab === 'searchconsole' && (
                <SearchConsoleManager
                  storeConfig={storeConfig}
                  onUpdateConfig={(updated) => {
                    setStoreConfig(prev => ({ ...prev, ...updated }));
                  }}
                  onSaveConfig={handleSaveStoreConfig}
                  addLog={addLog}
                />
              )}

              {/* ==================================================== */}
              {/* TAB 12: ACTIVE SESSIONS & AUTHENTICATION SECURITY    */}
              {/* ==================================================== */}
              {activeTab === 'sessions' && (
                <SessionManagerDashboard
                  onLogoutCurrent={handleLogout}
                  onAddLog={addLog}
                />
              )}

            </div>

            {/* Mobile Bottom Navigation Bar (md:hidden) */}
            <div className="md:hidden bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-around shrink-0 z-20">
              <button
                type="button"
                onClick={() => setActiveTab('bundles')}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'bundles' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PackagePlus className="w-5 h-5" />
                <span className="text-[10px]">Bundles</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition cursor-pointer relative ${
                  activeTab === 'orders' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-5 h-5" />
                <span className="text-[10px]">Orders</span>
                {revenueStats.pendingCount > 0 && (
                  <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gateways')}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'gateways' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px]">Gateways</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('visitors')}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'visitors' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px]">Traffic</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileAdminMenuOpen(true)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition cursor-pointer ${
                  isMobileAdminMenuOpen ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px]">Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL-CONTROL PRO REELS BUNDLE STUDIO MODAL               */}
      {/* ======================================================== */}
      {editingBundle && (() => {
        const discountPct = Math.max(0, Math.round((((editingBundle.originalPrice || 0) - (editingBundle.price || 0)) / (editingBundle.originalPrice || 1)) * 100));
        const testVideoData = parseVideoUrl(editingBundle.videoPreview, editingBundle.category);
        const currentLinks = editingBundle.links && editingBundle.links.length > 0 
          ? editingBundle.links 
          : [{ label: 'Bundle Access Link', url: editingBundle.driveLink || '' }];
        const currentFeatures = editingBundle.features && editingBundle.features.length > 0
          ? editingBundle.features
          : ['1080p Full HD MP4', 'No Watermark', 'Google Drive Instant Access'];

        const handleAddLink = () => {
          setEditingBundle({
            ...editingBundle,
            links: [...currentLinks, { label: `Drive Link Part ${currentLinks.length + 1}`, url: '' }]
          });
        };

        const handleUpdateLink = (idx, field, val) => {
          const updated = currentLinks.map((l, i) => i === idx ? { ...l, [field]: val } : l);
          setEditingBundle({
            ...editingBundle,
            links: updated,
            driveLink: idx === 0 && field === 'url' ? val : (updated[0]?.url || editingBundle.driveLink)
          });
        };

        const handleRemoveLink = (idx) => {
          const updated = currentLinks.filter((_, i) => i !== idx);
          setEditingBundle({
            ...editingBundle,
            links: updated,
            driveLink: updated[0]?.url || ''
          });
        };

        const handleAddFeature = () => {
          setEditingBundle({
            ...editingBundle,
            features: [...currentFeatures, '']
          });
        };

        const handleUpdateFeature = (idx, val) => {
          const updated = currentFeatures.map((f, i) => i === idx ? val : f);
          setEditingBundle({
            ...editingBundle,
            features: updated
          });
        };

        const handleRemoveFeature = (idx) => {
          const updated = currentFeatures.filter((_, i) => i !== idx);
          setEditingBundle({
            ...editingBundle,
            features: updated
          });
        };

        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col">
              
              {/* Studio Header */}
              <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-white">Full Control Bundle Studio</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                        {discountPct}% OFF
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">ID: {editingBundle.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDuplicateBundle(editingBundle)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                    title="Duplicate / Clone Bundle"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBundleToDelete(editingBundle);
                      setEditingBundle(null);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                    title="Delete Bundle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBundle(null);
                      setTestVideoActive(false);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Studio Body Scrollable Form */}
              <form onSubmit={handleSaveBundleEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50 text-slate-900">
                
                {/* 1. Title & Subtitle */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Basic Details & Description</span>
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Bundle Title</label>
                    <input
                      type="text"
                      value={editingBundle.title}
                      onChange={(e) => setEditingBundle({ ...editingBundle, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Subtitle / Marketing Hook</label>
                    <input
                      type="text"
                      value={editingBundle.subtitle || ''}
                      onChange={(e) => setEditingBundle({ ...editingBundle, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. Complete 1,000+ Reels ready to upload with no watermark..."
                    />
                  </div>
                </div>

                {/* 2. Category & Niche Selection */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Niche & Category Placement</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Category (Filter Key)</label>
                      <select
                        value={editingBundle.category || 'aesthetic'}
                        onChange={(e) => {
                          const catVal = e.target.value;
                          const labelMap = {
                            'aesthetic': 'Aesthetic Reels',
                            'motivation': 'Motivational Reels',
                            'ai-avatar': 'AI Avatars',
                            'fitness': 'Fitness & Gym',
                            'luxury': 'Luxury Lifestyle',
                            'finance': 'Trading & Finance',
                            'devotional': 'Bhakti & Sanatan',
                            'anime': 'Anime Edits',
                            'humor': 'Funny & Memes',
                            'tech': 'Tech & Gadgets',
                            'educational': 'Facts & Infographics'
                          };
                          setEditingBundle({
                            ...editingBundle,
                            category: catVal,
                            categoryLabel: labelMap[catVal] || editingBundle.categoryLabel || catVal
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="aesthetic">Aesthetic & Nature</option>
                        <option value="motivation">Motivational & Mindset</option>
                        <option value="ai-avatar">AI Reels & Avatars</option>
                        <option value="fitness">Gym & Fitness</option>
                        <option value="luxury">Luxury Cars & Lifestyle</option>
                        <option value="finance">Crypto, Stocks & Trading</option>
                        <option value="devotional">Sanatan & Bhakti</option>
                        <option value="anime">Anime & 3D Edits</option>
                        <option value="humor">Funny & Memes</option>
                        <option value="tech">Gadgets & Tech</option>
                        <option value="educational">Infographics & Facts</option>
                        <option value="other">Other / Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Category Label (Display Badge)</label>
                      <input
                        type="text"
                        value={editingBundle.categoryLabel || ''}
                        onChange={(e) => setEditingBundle({ ...editingBundle, categoryLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        placeholder="e.g. Motivational Reels"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Pricing, Clips & Social Proof */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Pricing, Badge & Clips Count</span>
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={editingBundle.price}
                        onChange={(e) => setEditingBundle({ ...editingBundle, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={editingBundle.originalPrice}
                        onChange={(e) => setEditingBundle({ ...editingBundle, originalPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-600"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-800 mb-1">Clips Count</label>
                      <input
                        type="text"
                        value={editingBundle.clipCount || ''}
                        onChange={(e) => setEditingBundle({ ...editingBundle, clipCount: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-bold"
                        placeholder="e.g. 1,000+ Reels"
                      />
                    </div>
                  </div>

                  {/* Badge Preset Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Card Badge</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['🔥 BESTSELLER', '⚡ TRENDING', '💎 VIP EXCLUSIVE', '⭐ POPULAR', '🚀 NEW LAUNCH'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setEditingBundle({ ...editingBundle, badge: b })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            editingBundle.badge === b 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editingBundle.badge || ''}
                      onChange={(e) => setEditingBundle({ ...editingBundle, badge: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-700"
                      placeholder="Custom Badge (e.g. 🔥 BESTSELLER)"
                    />
                  </div>

                  {/* Rating & Reviews */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Rating (Out of 5.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="3"
                        max="5"
                        value={editingBundle.rating || 4.85}
                        onChange={(e) => setEditingBundle({ ...editingBundle, rating: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Reviews Count</label>
                      <input
                        type="number"
                        value={editingBundle.reviewsCount || 100}
                        onChange={(e) => setEditingBundle({ ...editingBundle, reviewsCount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Thumbnail Image & Upload */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <span>Thumbnail Image & Direct Upload</span>
                  </h5>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-slate-300 shadow-xs">
                      <img src={editingBundle.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, 'bundle')}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingBundle.thumbnail}
                        onChange={(e) => setEditingBundle({ ...editingBundle, thumbnail: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Demo Video Studio & In-Modal Live Tester */}
                <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-2xl border border-amber-300 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-amber-600" />
                      <span>Demo Video Studio (Google Drive / MP4)</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setTestVideoActive(!testVideoActive)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                        testVideoActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-200/80 hover:bg-amber-300 text-amber-900'
                      }`}
                    >
                      {testVideoActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-amber-900" />}
                      <span>{testVideoActive ? 'Hide Test Player' : 'Test Video Playback'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/... or direct .mp4 link"
                    value={editingBundle.videoPreview || ''}
                    onChange={(e) => setEditingBundle({ ...editingBundle, videoPreview: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-amber-950"
                  />
                  <p className="text-[11px] text-slate-600">
                    💡 <strong>Tip:</strong> Paste any Google Drive link or direct MP4 link. On the storefront, videos play smoothly inline without any annoying Drive redirects or watermarks.
                  </p>

                  {/* In-Modal Live Video Tester */}
                  {testVideoActive && (
                    <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2 text-xs text-slate-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live In-Modal Video Tester</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Type: {testVideoData.type}
                        </span>
                      </div>
                      <div className="relative w-full aspect-[9/16] max-h-72 bg-black rounded-xl overflow-hidden mx-auto border border-slate-800">
                        {testVideoData.hasVideo ? (
                          <video
                            src={testVideoData.url}
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            No valid video link entered
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Customer Delivery Google Drive Links (Multi-Link Cloud Delivery) */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      <span>Customer Google Drive Delivery Links ({currentLinks.length})</span>
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Add Folder Link</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Buyers receive these links immediately on the payment confirmation page and in their order history.
                  </p>

                  <div className="space-y-2.5">
                    {currentLinks.map((link, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.label || ''}
                            onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                            placeholder={`e.g. Drive Link Part ${idx + 1}`}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                          {currentLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 cursor-pointer"
                              title="Delete this link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={link.url || ''}
                          onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-amber-900"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Features & Bullet Points */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span>Features & Included Perks ({currentFeatures.length})</span>
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {currentFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                          placeholder="Feature bullet..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Studio Footer Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateBundle(editingBundle)}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone as New</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBundleToDelete(editingBundle);
                        setEditingBundle(null);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBundle(null);
                        setTestVideoActive(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Sync Everywhere</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ======================================================== */}
      {bundleToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Confirm Deletion</h4>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong className="text-slate-900">"{bundleToDelete.title}"</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBundleToDelete(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Delete Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD NEW BUNDLE MODAL                                     */}
      {/* ======================================================== */}
      {isAddingNew && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <h4 className="text-sm sm:text-base font-black text-slate-900">Add New Reels Bundle</h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBundle} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Bundle Title</label>
                <input
                  type="text"
                  placeholder="e.g. 1,000+ AI Luxury & Fitness Reels"
                  value={newBundleData.title}
                  onChange={(e) => setNewBundleData({ ...newBundleData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newBundleData.price}
                    onChange={(e) => setNewBundleData({ ...newBundleData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Original (₹)</label>
                  <input
                    type="number"
                    value={newBundleData.originalPrice}
                    onChange={(e) => setNewBundleData({ ...newBundleData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Clips Count</label>
                  <input
                    type="text"
                    value={newBundleData.clipCount}
                    onChange={(e) => setNewBundleData({ ...newBundleData, clipCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Google Drive Link */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Google Drive Delivery Link</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newBundleData.driveLink}
                  onChange={(e) => setNewBundleData({ ...newBundleData, driveLink: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-amber-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Publish Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Maintenance Mode Live Preview Modal */}
      {showMaintenancePreview && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950">
          <div className="fixed top-4 right-4 z-[10000] flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold backdrop-blur-md">
              ⚡ Live Preview Mode
            </span>
            <button
              type="button"
              onClick={() => setShowMaintenancePreview(false)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-2xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            >
              <X className="w-4 h-4" />
              <span>Close Preview</span>
            </button>
          </div>
          <MaintenanceScreen
            config={storeConfig}
            onUnlockAdmin={() => setShowMaintenancePreview(false)}
            onTurnOffMaintenance={() => {
              handleSetMaintenanceMode(false);
              setShowMaintenancePreview(false);
            }}
          />
        </div>
      )}

      {/* Inactivity Session Expiration Warning Modal */}
      <SessionWarningModal
        isOpen={isSessionWarningOpen}
        remainingSeconds={warningSecondsRemaining}
        onExtend={handleExtendSession}
        onLogout={() => handleLogout({ reason: 'Admin chose Logout Now from Inactivity Warning Modal', type: 'SESSION_TIMEOUT' })}
      />

    </div>
  );
}
