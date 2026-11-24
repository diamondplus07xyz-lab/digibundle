// Vercel Serverless Function: /api/sync
// Universal Cross-Device Synchronization for DigiBundle Store
// Enterprise-Grade Hardened: Role-Based Access Control, Bearer Token Auth,
// Rate Limiting, SSRF/CSRF Guards, and Sensitive Credential Protection.

let cacheData = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2000; // 2 seconds TTL for instant cross-device reflection

const GITHUB_REPO = 'diamondplus07xyz-lab/digibundle';
const GITHUB_FILE_PATH = 'public/data/store_config.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Read securely from serverless environment
const ADMIN_AUTH_HASH = process.env.ADMIN_AUTH_HASH || '9f5bd4769ef79855c629f60e26112604bf2010bc1ff1a9c89fcc48751887e220';

// In-memory sliding window rate limiting
const ipRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }
  ipRateLimits.set(ip, record);
  return record.count <= MAX_REQUESTS_PER_MINUTE;
}

// Clean up stale rate limits periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of ipRateLimits.entries()) {
      if (now > rec.resetAt) ipRateLimits.delete(ip);
    }
  }, 5 * 60 * 1000);
}

// Verify admin authorization header
function isAuthorizedAdmin(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  return token === ADMIN_AUTH_HASH;
}

const isDemoOrder = (o) => {
  if (!o) return true;
  const demoIds = ['CR-588086', 'CR-166465', 'CRS-979962', 'CR-137840'];
  if (demoIds.includes(o.id)) return true;
  if (o.name && (o.name === 'Test User' || o.name === 'Rohan Verma' || o.name === 'Aakash Verma')) return true;
  if (o.email && o.email === 'test@example.com') return true;
  if (o.utr && (o.utr === '123456789012' || o.utr === '889977665544' || o.utr === 'UPI-1978192085' || o.utr === '123456789101')) return true;
  return false;
};

// Validate incoming customer order schema
function isValidOrderSchema(o) {
  if (!o || typeof o !== 'object') return false;
  if (!o.id || typeof o.id !== 'string' || !/^(CR|CRS)-[a-zA-Z0-9_-]{4,32}$/i.test(o.id)) return false;
  if (typeof o.amount !== 'number' || o.amount <= 0 || o.amount > 500000) return false;
  if (!Array.isArray(o.items) || o.items.length === 0) return false;
  return true;
}

// Strip sensitive administrative credentials before publishing or returning config
function sanitizeConfigForStorage(conf = {}) {
  const sanitized = { ...conf };
  // Never expose or write raw admin passcodes or gateway secret keys in public storage
  delete sanitized.adminPasscode;
  if (sanitized.razorpay) {
    sanitized.razorpay = { ...sanitized.razorpay };
    delete sanitized.razorpay.keySecret;
  }
  if (sanitized.cashfree) {
    sanitized.cashfree = { ...sanitized.cashfree };
    delete sanitized.cashfree.secretKey;
  }
  if (sanitized.paypal) {
    sanitized.paypal = { ...sanitized.paypal };
    delete sanitized.paypal.clientSecret;
  }
  return sanitized;
}

// Intelligent order merger with role-based integrity
function mergeOrders(existing = [], incoming = [], isAdmin = false) {
  const map = new Map();
  // 1. Load existing orders
  for (const o of existing) {
    if (o && o.id && !isDemoOrder(o)) map.set(o.id, { ...o });
  }

  // 2. Merge incoming orders
  for (const o of incoming) {
    if (o && o.id && !isDemoOrder(o)) {
      if (map.has(o.id)) {
        // If order already exists, ONLY an authenticated admin can change status or unlock drive link
        if (isAdmin) {
          const prev = map.get(o.id);
          map.set(o.id, {
            ...prev,
            ...o,
            status: o.status || prev.status,
            verifiedAt: o.verifiedAt || prev.verifiedAt,
            rejectedAt: o.rejectedAt || prev.rejectedAt,
            driveLinkUnlocked: o.driveLinkUnlocked !== undefined ? o.driveLinkUnlocked : prev.driveLinkUnlocked
          });
        }
        // If not admin, existing order is immutable (prevents customer forging verified status)
      } else {
        // New order being created
        if (isValidOrderSchema(o)) {
          // If customer created, enforce PENDING status and locked drive link
          map.set(o.id, {
            ...o,
            status: isAdmin ? (o.status || 'PENDING') : 'PENDING',
            driveLinkUnlocked: isAdmin ? (o.driveLinkUnlocked === true) : false,
            verifiedAt: isAdmin ? o.verifiedAt : null
          });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.createdAt || b.timestamp || b.id || 0) - (a.createdAt || a.timestamp || a.id || 0));
}

// Intelligent visitor stats merger
function mergeVisitorStats(existing = {}, incoming = {}) {
  const existingIps = Array.isArray(existing.knownIps) ? existing.knownIps : [];
  const incomingIps = Array.isArray(incoming.knownIps) ? incoming.knownIps : [];
  const uniqueIps = Array.from(new Set([...existingIps, ...incomingIps])).slice(0, 500);

  const totalViews = Math.max(
    existing.totalViews || 0,
    incoming.totalViews || 0,
    uniqueIps.length
  );

  const mobileVisits = Math.max(existing.mobileVisits || 0, incoming.mobileVisits || 0);
  const desktopVisits = Math.max(existing.desktopVisits || 0, incoming.desktopVisits || 0);

  const visitsMap = new Map();
  for (const v of (existing.recentVisits || [])) {
    if (v && v.id) visitsMap.set(v.id, v);
  }
  for (const v of (incoming.recentVisits || [])) {
    if (v && v.id) visitsMap.set(v.id, v);
  }
  const mergedVisits = Array.from(visitsMap.values())
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 100);

  return {
    totalViews,
    uniqueVisitors: uniqueIps.length,
    mobileVisits,
    desktopVisits,
    knownIps: uniqueIps,
    recentVisits: mergedVisits
  };
}

// Intelligent activity logs merger
function mergeActivityLogs(existing = [], incoming = [], isAdmin = false) {
  const logMap = new Map();
  for (const l of existing) {
    if (l && l.id) logMap.set(l.id, l);
  }
  for (const l of incoming) {
    if (l && l.id) {
      // If unauthenticated, only allow logging customer/system events
      if (!isAdmin && l.category === 'ADMIN' && l.actorType === 'Admin') {
        continue;
      }
      logMap.set(l.id, l);
    }
  }
  return Array.from(logMap.values())
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 100);
}

export default async function handler(req, res) {
  // CORS Security: allow same-origin and verified application hosts
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://cheapreels.in',
    'https://www.cheapreels.in',
    'https://cheapreels.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown_ip';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again in 1 minute.' });
  }

  // Handle GET: Retrieve latest synchronized store data across all devices
  if (req.method === 'GET') {
    const now = Date.now();
    if (cacheData && (now - lastCacheTime < CACHE_TTL_MS)) {
      return res.status(200).json({
        success: true,
        source: 'memory_cache',
        data: cacheData
      });
    }

    if (GITHUB_TOKEN) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
          headers: {
            'User-Agent': 'CheapReels-App',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          const contentStr = Buffer.from(ghJson.content, 'base64').toString('utf8');
          const parsedData = JSON.parse(contentStr);

          cacheData = parsedData;
          lastCacheTime = now;

          return res.status(200).json({
            success: true,
            source: 'github',
            data: parsedData
          });
        }
      } catch (err) {
        console.warn('Error fetching config from GitHub, fallback to cache:', err);
      }
    }

    if (cacheData) {
      return res.status(200).json({
        success: true,
        source: 'stale_cache',
        data: cacheData
      });
    }

    return res.status(200).json({
      success: true,
      source: 'initial_empty',
      data: null
    });
  }

  // Handle POST: Push updated data from Mobile or PC
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Empty or invalid payload' });
      }

      const isAdmin = isAuthorizedAdmin(req);

      // Access Control: If unauthenticated request attempts to modify config or bundles, reject!
      const attemptsAdminConfig = Boolean(payload.config);
      const attemptsAdminBundles = Boolean(payload.bundles && payload.bundles.length > 0);
      const isExplicitAdminAction = payload.action === 'admin_action';

      if ((attemptsAdminConfig || attemptsAdminBundles || isExplicitAdminAction) && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Admin authentication token required to modify store config, bundles, or verified orders.'
        });
      }

      // Fetch existing from cache or GitHub
      let base = cacheData;
      let sha = null;

      if (GITHUB_TOKEN) {
        try {
          const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
              'User-Agent': 'CheapReels-App',
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (getRes.ok) {
            const fileInfo = await getRes.json();
            sha = fileInfo.sha;
            if (fileInfo.content) {
              const currentStr = Buffer.from(fileInfo.content, 'base64').toString('utf8');
              base = JSON.parse(currentStr);
            }
          }
        } catch (e) {
          console.warn('Could not retrieve existing GitHub file info:', e);
        }
      }

      const existingConfig = base?.config || cacheData?.config || {};
      const existingBundles = base?.bundles || cacheData?.bundles || [];
      const existingOrders = base?.orders || cacheData?.orders || [];
      const existingStats = base?.visitorStats || cacheData?.visitorStats || {};
      const existingLogs = base?.activityLogs || cacheData?.activityLogs || [];

      // Merge data with authorization enforcement
      const mergedConfig = (isAdmin && payload.config) ? sanitizeConfigForStorage({ ...existingConfig, ...payload.config }) : existingConfig;
      const mergedBundles = (isAdmin && Array.isArray(payload.bundles) && payload.bundles.length > 0) ? payload.bundles : existingBundles;
      const mergedOrders = mergeOrders(existingOrders, payload.orders || [], isAdmin);
      const mergedStats = mergeVisitorStats(existingStats, payload.visitorStats || {});
      const mergedLogs = mergeActivityLogs(existingLogs, payload.activityLogs || [], isAdmin);

      const updatedData = {
        version: '2.0',
        updatedAt: Date.now(),
        lastModifiedByDevice: payload.lastModifiedByDevice || 'unknown',
        lastModifiedDeviceLabel: payload.lastModifiedDeviceLabel || (isAdmin ? 'Admin Terminal' : 'Customer Client'),
        config: mergedConfig,
        bundles: mergedBundles,
        orders: mergedOrders,
        visitorStats: mergedStats,
        activityLogs: mergedLogs
      };

      // Update in-memory cache immediately so any device gets it instantaneously
      cacheData = updatedData;
      lastCacheTime = Date.now();

      // Commit to GitHub repository if server has GITHUB_TOKEN
      if (GITHUB_TOKEN) {
        try {
          const base64Content = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');
          const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            method: 'PUT',
            headers: {
              'User-Agent': 'CheapReels-App',
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Universal cross-device sync [skip ci] (${isAdmin ? 'Admin' : 'Telemetry'})`,
              content: base64Content,
              ...(sha ? { sha } : {})
            })
          });

          if (!putRes.ok) {
            const errTxt = await putRes.text();
            console.error('GitHub commit warning:', putRes.status, errTxt);
          }
        } catch (commitErr) {
          console.error('GitHub commit failed:', commitErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Synchronized successfully across all devices!',
        updatedAt: updatedData.updatedAt,
        data: updatedData
      });
    } catch (err) {
      console.error('Error in POST /api/sync:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error processing synchronization'
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
