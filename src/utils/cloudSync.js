/**
 * Cross-Device Cloud Sync Utility for DigiBundle Store
 * Keeps Admin Panel changes, Orders, Visitor Analytics, and Reels Bundles
 * in 100% sync across PC, Mobile, and all visitors safely via backend API.
 * 
 * SECURITY HARDENED:
 * - Zero hardcoded personal access tokens or credentials in client bundles.
 * - Authenticated admin session tokens passed via Authorization headers.
 * - All writes securely handled by serverless /api/sync endpoint.
 */

// Helper to retrieve the current admin authentication token from session storage
export function getAdminAuthToken() {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem('cheap_reels_admin_auth_token') || '';
  } catch (e) {
    return '';
  }
}

/**
 * Fetch latest store data (config, bundles, orders, visitorStats, activityLogs) from Cloud
 */
export async function fetchCloudStoreData() {
  // 1. Try Vercel Serverless Sync endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/sync', {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    // Sync API unavailable, trying static fallback
  }

  // 2. Try static /data/store_config.json (Edge CDN)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/data/store_config.json?v=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data) {
        return data;
      }
    }
  } catch (err) {
    // Static config fetch failed
  }

  return null;
}

/**
 * Push updated configuration, bundles, orders, and visitor stats to Cloud safely via /api/sync
 */
export async function pushCloudStoreData({ config, bundles, orders, visitorStats, activityLogs, action, lastModifiedByDevice, lastModifiedDeviceLabel }) {
  const adminToken = getAdminAuthToken();

  const payload = {
    version: '2.0',
    updatedAt: Date.now(),
    ...(config ? { config } : {}),
    ...(bundles ? { bundles } : {}),
    ...(orders ? { orders } : {}),
    ...(visitorStats ? { visitorStats } : {}),
    ...(activityLogs ? { activityLogs } : {}),
    action: action || (config || bundles ? 'admin_action' : 'sync_update'),
    ...(lastModifiedByDevice ? { lastModifiedByDevice } : {}),
    ...(lastModifiedDeviceLabel ? { lastModifiedDeviceLabel } : {})
  };

  let apiSuccess = false;
  let returnedData = null;

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const resJson = await res.json();
      if (resJson.success) {
        apiSuccess = true;
        returnedData = resJson.data;
      }
    } else {
      console.warn(`Sync API returned status: ${res.status}`);
    }
  } catch (err) {
    console.warn('POST /api/sync network error:', err);
  }

  return { success: apiSuccess, updatedAt: payload.updatedAt, data: returnedData };
}
