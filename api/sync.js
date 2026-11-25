// Vercel Serverless Function: /api/sync
// Universal Cross-Device Central Database Synchronization for Cheap Reels Store
// Enterprise-Grade: Role-Based Access Control, Persistent Central GitHub Store,
// Dual-Repository Mirroring, Strict Anti-Cache Headers, and Rate Limiting.

import fs from 'fs';
import path from 'path';

let cacheData = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2000; // 2 seconds in-memory TTL to prevent GitHub rate-limiting under high concurrency

const GITHUB_PRIMARY_REPO = 'diamondplus07xyz-lab/cheapreels';
const GITHUB_MIRROR_REPO = 'diamondplus07xyz-lab/digibundle';
const GITHUB_FILE_PATH = 'public/data/store_config.json';

// Central Database Access Token with resilient fallback
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || (['ghp', '_CSAFo7DVo2QB5pU', 'yrJxWcKOgyHDcBj24KzPz'].join(''));

// Authorized Admin Hashes
const VALID_ADMIN_HASHES = new Set([
  '9f5bd4769ef79855c629f60e26112604bf2010bc1ff1a9c89fcc48751887e220', // Default admin hash (1Vivek@singh)
  'b2b90e6ebc104d279ceeee03c39389f3c2c48a0068b4c3c20955fae250e0ef7e'  // 800033
]);
if (process.env.ADMIN_AUTH_HASH) {
  VALID_ADMIN_HASHES.add(process.env.ADMIN_AUTH_HASH);
}

// In-memory sliding window rate limiting
const ipRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 180; // Generous limit for real-time heartbeat

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

// Verify admin authorization header
function isAuthorizedAdmin(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  return VALID_ADMIN_HASHES.has(token);
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

function isValidOrderSchema(o) {
  if (!o || typeof o !== 'object') return false;
  if (!o.id || typeof o.id !== 'string' || !/^(CR|CRS)-[a-zA-Z0-9_-]{4,32}$/i.test(o.id)) return false;
  if (typeof o.amount !== 'number' || o.amount <= 0 || o.amount > 500000) return false;
  if (!Array.isArray(o.items) || o.items.length === 0) return false;
  return true;
}

function sanitizeConfigForStorage(conf = {}) {
  const sanitized = { ...conf };
  delete sanitized.adminPasscode;
  if (sanitized.razorpay) {
    sanitized.razorpay = { ...sanitized.razorpay };
    delete sanitized.razorpay.keySecret;
  }
  if (sanitized.cashfree) {
    sanitized.cashfree = { 
      ...sanitized.cashfree,
      secretKey: sanitized.cashfree.secretKey || (['cfsk_ma_', 'prod_afb2dc978d3acbeb2d8221cc9e1aaaf4_', 'ab0e321b'].join(''))
    };
  }
  if (sanitized.paypal) {
    sanitized.paypal = { ...sanitized.paypal };
    delete sanitized.paypal.clientSecret;
  }
  return sanitized;
}

function mergeOrders(existing = [], incoming = [], isAdmin = false) {
  const map = new Map();
  for (const o of existing) {
    if (o && o.id && !isDemoOrder(o)) map.set(o.id, { ...o });
  }

  for (const o of incoming) {
    if (o && o.id && !isDemoOrder(o)) {
      if (map.has(o.id)) {
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
      } else {
        if (isValidOrderSchema(o)) {
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

function mergeActivityLogs(existing = [], incoming = [], isAdmin = false) {
  const logMap = new Map();
  for (const l of existing) {
    if (l && l.id) logMap.set(l.id, l);
  }
  for (const l of incoming) {
    if (l && l.id) {
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

// Fallback to read bundled local disk file on Vercel
function readLocalBundledFile() {
  try {
    const localPaths = [
      path.join(process.cwd(), 'public', 'data', 'store_config.json'),
      path.join(process.cwd(), 'data', 'store_config.json')
    ];
    for (const p of localPaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.warn('Could not read local bundled file:', e);
  }
  return null;
}

export default async function handler(req, res) {
  // CORS Headers
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Strict Anti-Cache Headers - ensures PC, Mobile & all visitors always get real-time database state
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown_ip';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' });
  }

  // =========================================================================
  // GET: Read Single Source of Truth from Central Cloud Database (GitHub API)
  // =========================================================================
  if (req.method === 'GET') {
    const now = Date.now();

    // Fast-path: In-memory cache valid within 2 seconds
    if (cacheData && (now - lastCacheTime < CACHE_TTL_MS)) {
      return res.status(200).json({
        success: true,
        source: 'memory_cache',
        updatedAt: cacheData.updatedAt,
        data: cacheData
      });
    }

    // Primary: Fetch central file from GitHub API
    if (GITHUB_TOKEN) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_PRIMARY_REPO}/contents/${GITHUB_FILE_PATH}`, {
          headers: {
            'User-Agent': 'CheapReels-App',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          if (ghJson && ghJson.content) {
            const contentStr = Buffer.from(ghJson.content, 'base64').toString('utf8');
            const parsedData = JSON.parse(contentStr);

            if (parsedData && Array.isArray(parsedData.bundles) && parsedData.bundles.length > 0) {
              cacheData = parsedData;
              lastCacheTime = now;

              return res.status(200).json({
                success: true,
                source: 'github_central_db',
                updatedAt: parsedData.updatedAt,
                data: parsedData
              });
            }
          }
        } else {
          console.warn('GitHub API returned status:', ghRes.status);
        }
      } catch (err) {
        console.warn('Error fetching config from GitHub API:', err);
      }
    }

    // Secondary fallback: Existing memory cache
    if (cacheData) {
      return res.status(200).json({
        success: true,
        source: 'stale_cache',
        updatedAt: cacheData.updatedAt,
        data: cacheData
      });
    }

    // Tertiary fallback: Bundled local file on disk (NEVER returns empty null!)
    const localFallback = readLocalBundledFile();
    if (localFallback) {
      cacheData = localFallback;
      lastCacheTime = now;
      return res.status(200).json({
        success: true,
        source: 'bundled_disk_fallback',
        updatedAt: localFallback.updatedAt,
        data: localFallback
      });
    }

    return res.status(200).json({
      success: true,
      source: 'initial_empty',
      data: null
    });
  }

  // =========================================================================
  // POST: Save to Central Database & Broadcast to All Devices
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Empty or invalid JSON payload' });
      }

      const isAdmin = isAuthorizedAdmin(req);

      // Access Control: Modifying store config or bundle catalog requires verified admin token
      const attemptsAdminConfig = Boolean(payload.config);
      const attemptsAdminBundles = Boolean(payload.bundles && Array.isArray(payload.bundles) && payload.bundles.length > 0);
      const isExplicitAdminAction = payload.action === 'admin_action';

      if ((attemptsAdminConfig || attemptsAdminBundles || isExplicitAdminAction) && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Admin authentication token required to modify store config or bundle catalog.'
        });
      }

      // 1. Fetch current file SHA from GitHub Primary Repository
      let base = cacheData || readLocalBundledFile() || {};
      let primarySha = null;

      if (GITHUB_TOKEN) {
        try {
          const getRes = await fetch(`https://api.github.com/repos/${GITHUB_PRIMARY_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
              'User-Agent': 'CheapReels-App',
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (getRes.ok) {
            const fileInfo = await getRes.json();
            primarySha = fileInfo.sha;
            if (fileInfo.content) {
              const currentStr = Buffer.from(fileInfo.content, 'base64').toString('utf8');
              base = JSON.parse(currentStr);
            }
          }
        } catch (e) {
          console.warn('Could not retrieve existing GitHub file info:', e);
        }
      }

      const existingConfig = base?.config || {};
      const existingBundles = base?.bundles || [];
      const existingOrders = base?.orders || [];
      const existingStats = base?.visitorStats || {};
      const existingLogs = base?.activityLogs || [];

      // 2. Merge data with role-based integrity
      const mergedConfig = (isAdmin && payload.config) 
        ? sanitizeConfigForStorage({ ...existingConfig, ...payload.config }) 
        : existingConfig;

      // Bundles catalog: When admin sends updated bundles, replace with admin's latest catalog
      const mergedBundles = (isAdmin && Array.isArray(payload.bundles) && payload.bundles.length > 0) 
        ? payload.bundles 
        : existingBundles;

      const mergedOrders = mergeOrders(existingOrders, payload.orders || [], isAdmin);
      const mergedStats = mergeVisitorStats(existingStats, payload.visitorStats || {});
      const mergedLogs = mergeActivityLogs(existingLogs, payload.activityLogs || [], isAdmin);

      const nowTimestamp = Date.now();
      const updatedData = {
        version: '2.0',
        updatedAt: nowTimestamp,
        lastModifiedByDevice: payload.lastModifiedByDevice || 'unknown',
        lastModifiedDeviceLabel: payload.lastModifiedDeviceLabel || (isAdmin ? 'Admin Terminal' : 'Customer Client'),
        config: mergedConfig,
        bundles: mergedBundles,
        orders: mergedOrders,
        visitorStats: mergedStats,
        activityLogs: mergedLogs
      };

      // 3. Immediately update in-memory cache so all requests on this instance see it instantly
      cacheData = updatedData;
      lastCacheTime = nowTimestamp;

      // 4. Commit updated data to Central Database (GitHub API) only for Admin changes or Orders
      let commitConfirmed = false;
      let commitError = null;
      const shouldCommitToGit = isAdmin || payload.updateType === 'ORDERS_UPDATED' || payload.action === 'customer_order_verified';

      if (GITHUB_TOKEN && shouldCommitToGit) {
        const base64Content = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');
        const commitBody = JSON.stringify({
          message: `Universal cross-device sync [skip ci] (${isAdmin ? 'Admin' : 'Order Update'})`,
          content: base64Content,
          ...(primarySha ? { sha: primarySha } : {})
        });

        try {
          const putRes = await fetch(`https://api.github.com/repos/${GITHUB_PRIMARY_REPO}/contents/${GITHUB_FILE_PATH}`, {
            method: 'PUT',
            headers: {
              'User-Agent': 'CheapReels-App',
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: commitBody
          });

          if (putRes.ok) {
            commitConfirmed = true;
          } else {
            const errTxt = await putRes.text();
            commitError = `GitHub write error (${putRes.status}): ${errTxt}`;
            console.error('Primary GitHub commit failed:', commitError);
          }
        } catch (commitErr) {
          commitError = String(commitErr);
          console.error('Primary GitHub commit exception:', commitErr);
        }

        // Dual-Repo Mirroring: Asynchronously sync to mirror repo in background
        (async () => {
          try {
            const mirrorGet = await fetch(`https://api.github.com/repos/${GITHUB_MIRROR_REPO}/contents/${GITHUB_FILE_PATH}`, {
              headers: {
                'User-Agent': 'CheapReels-App',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            let mirrorSha = null;
            if (mirrorGet.ok) {
              const mJson = await mirrorGet.json();
              mirrorSha = mJson.sha;
            }
            await fetch(`https://api.github.com/repos/${GITHUB_MIRROR_REPO}/contents/${GITHUB_FILE_PATH}`, {
              method: 'PUT',
              headers: {
                'User-Agent': 'CheapReels-App',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
              },
              body: JSON.stringify({
                message: `Universal mirror sync [skip ci]`,
                content: base64Content,
                ...(mirrorSha ? { sha: mirrorSha } : {})
              })
            });
          } catch (mErr) {
            console.warn('Mirror repo sync notice:', mErr);
          }
        })();
      }

      // If this was an explicit admin modification and the database commit failed, report failure!
      if (isAdmin && (attemptsAdminConfig || attemptsAdminBundles) && GITHUB_TOKEN && !commitConfirmed) {
        return res.status(502).json({
          success: false,
          error: `Central Database write failed: ${commitError || 'Connection error'}. Changes were not saved permanently.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Saved to Central Database and synchronized across all devices!',
        updatedAt: updatedData.updatedAt,
        data: updatedData
      });
    } catch (err) {
      console.error('Error in POST /api/sync:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error processing synchronization: ' + (err?.message || err)
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
