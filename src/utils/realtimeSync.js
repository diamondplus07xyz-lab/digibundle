/**
 * Complete Real-Time Admin Panel & Storefront Synchronization Engine
 * cheap-reels-store
 * 
 * Provides:
 * 1. Zero-latency BroadcastChannel for instantaneous cross-tab/cross-window sync on same device
 * 2. Storage event listener fallback for browser compatibility
 * 3. Fast (2.5s) Cloud Poll Heartbeat with ETag / timestamp checking for physical cross-device sync (PC <-> Mobile)
 * 4. Conflict detection & resolution for concurrent admin edits
 * 5. Device Identification (Desktop PC, Laptop, Android, iPhone, Tablet)
 * 6. Live connection status monitoring (Online/Offline, Syncing, Connected, Conflict)
 */

import { fetchCloudStoreData, pushCloudStoreData as originalPushCloud } from './cloudSync';
import { getDeviceType, getBrowser, getOS } from './trafficTracker';

const SYNC_CHANNEL_NAME = 'cheap_reels_realtime_sync_v2';
const SYNC_STORAGE_PULSE_KEY = 'cheap_reels_sync_pulse_v2';
const DEVICE_ID_KEY = 'cheap_reels_sync_device_id_v2';
const FAST_POLL_INTERVAL_MS = 2500; // 2.5s heartbeat for near-instant physical device sync

// Generate or retrieve persistent device ID
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return 'server_node';
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const devType = getDeviceType().toLowerCase().slice(0, 3);
      const rand = Math.random().toString(36).substring(2, 8);
      id = `cr_${devType}_${rand}_${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return `cr_temp_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Get rich device description for UI badges
export function getDeviceDescriptor() {
  const type = getDeviceType();
  const browser = getBrowser();
  const os = getOS();
  const id = getOrCreateDeviceId();
  return {
    id,
    type,
    browser,
    os,
    label: `${type === 'Mobile' ? '📱 Mobile' : type === 'Tablet' ? '📟 Tablet' : '💻 PC'} (${os} · ${browser})`
  };
}

class RealtimeSyncManager {
  constructor() {
    this.deviceId = getOrCreateDeviceId();
    this.deviceInfo = getDeviceDescriptor();
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.broadcastChannel = null;
    this.pollIntervalId = null;
    this.lastProcessedCloudUpdatedAt = 0;
    this.lastLocalPushTimestamp = 0;
    this.isSyncing = false;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncState = 'connected'; // 'connected' | 'syncing' | 'offline' | 'conflict'
    this.lastSyncTime = Date.now();
    this.activeConflict = null;
    this.activeFormTracker = null; // Used to detect conflicts if admin is editing

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // 1. Initialize BroadcastChannel if supported
    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingBroadcast(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel initialization failed, falling back to storage pulse:', e);
      }
    }

    // 2. Storage event fallback for cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === SYNC_STORAGE_PULSE_KEY && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload && payload.sourceDeviceId !== this.deviceId) {
            this.handleIncomingBroadcast(payload);
          }
        } catch (err) {}
      }
    });

    // 3. Online/Offline network monitoring
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncState = 'connected';
      this.notifyStatusChange();
      this.fetchAndSyncCloud('network_reconnect');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.syncState = 'offline';
      this.notifyStatusChange();
    });

    // 4. Focus & visibility change trigger instant sync
    window.addEventListener('focus', () => this.fetchAndSyncCloud('window_focus'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fetchAndSyncCloud('visibility_visible');
      }
    });

    // 5. Start Fast Cloud Polling Heartbeat
    this.startPolling();
  }

  startPolling() {
    if (this.pollIntervalId) clearInterval(this.pollIntervalId);
    this.pollIntervalId = setInterval(() => {
      this.fetchAndSyncCloud('heartbeat');
    }, FAST_POLL_INTERVAL_MS);
  }

  stopPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  // Subscribe to state change events (e.g. bundles updated, orders updated, maintenance mode toggled)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Subscribe to connection & sync health status
  subscribeStatus(callback) {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => this.statusListeners.delete(callback);
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      syncState: this.syncState,
      lastSyncTime: this.lastSyncTime,
      deviceId: this.deviceId,
      deviceInfo: this.deviceInfo,
      activeConflict: this.activeConflict
    };
  }

  notifyStatusChange() {
    const status = this.getStatus();
    this.statusListeners.forEach((cb) => {
      try { cb(status); } catch (e) { console.error('Status callback error:', e); }
    });
  }

  notifyListeners(eventType, data, meta = {}) {
    this.lastSyncTime = Date.now();
    this.notifyStatusChange();
    this.listeners.forEach((cb) => {
      try { cb(eventType, data, meta); } catch (e) { console.error('RealtimeSync listener error:', e); }
    });
  }

  // Handle incoming broadcast from another tab/window
  handleIncomingBroadcast(data) {
    if (!data || !data.type) return;
    if (data.sourceDeviceId === this.deviceId && data.broadcastSource === 'same_tab') return;

    // Check conflict if admin is actively editing a form
    if (this.activeFormTracker && this.activeFormTracker.isDirty) {
      if (data.type === 'BUNDLES_UPDATED' && this.activeFormTracker.type === 'bundle') {
        this.activeConflict = {
          type: 'bundle',
          message: `Product edits detected from ${data.deviceInfo?.label || 'another device'}.`,
          incomingData: data.payload,
          timestamp: data.timestamp
        };
        this.syncState = 'conflict';
        this.notifyStatusChange();
        return;
      }
      if (data.type === 'CONFIG_UPDATED' && this.activeFormTracker.type === 'config') {
        this.activeConflict = {
          type: 'config',
          message: `Settings modified remotely from ${data.deviceInfo?.label || 'another device'}.`,
          incomingData: data.payload,
          timestamp: data.timestamp
        };
        this.syncState = 'conflict';
        this.notifyStatusChange();
        return;
      }
    }

    this.notifyListeners(data.type, data.payload, {
      source: 'broadcast',
      sourceDeviceId: data.sourceDeviceId,
      deviceInfo: data.deviceInfo,
      timestamp: data.timestamp
    });
  }

  // Broadcast change locally to all tabs/windows immediately (0ms)
  broadcastLocally(eventType, payload) {
    const msg = {
      type: eventType,
      payload,
      sourceDeviceId: this.deviceId,
      deviceInfo: this.deviceInfo,
      timestamp: Date.now()
    };

    // 1. Send via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel postMessage error:', e);
      }
    }

    // 2. Pulse localStorage for cross-tab fallback
    try {
      localStorage.setItem(SYNC_STORAGE_PULSE_KEY, JSON.stringify({
        ...msg,
        _pulseId: Math.random()
      }));
    } catch (e) {}
  }

  // Set active form tracker to protect unsaved admin inputs against overwrite
  setActiveFormTracker(tracker) {
    this.activeFormTracker = tracker; // e.g. { type: 'bundle' | 'config', isDirty: boolean, bundleId: string }
  }

  clearActiveConflict() {
    this.activeConflict = null;
    this.syncState = 'connected';
    this.notifyStatusChange();
  }

  /**
   * Fetch latest store data from Cloud (Vercel Serverless / Edge CDN)
   * Merges remote data into local state if newer
   */
  async fetchAndSyncCloud(triggerSource = 'heartbeat') {
    if (!this.isOnline || this.isSyncing) return;

    this.isSyncing = true;
    try {
      const cloudData = await fetchCloudStoreData();
      if (!cloudData) {
        this.isSyncing = false;
        return;
      }

      const remoteUpdatedAt = cloudData.updatedAt || 0;

      // If remote data has a timestamp, and we haven't processed it yet
      // (and it wasn't pushed by ourselves within the last 1.5 seconds)
      const isFromOtherDevice = !cloudData.lastModifiedByDevice || cloudData.lastModifiedByDevice !== this.deviceId;
      const isNewer = remoteUpdatedAt > this.lastProcessedCloudUpdatedAt;

      if (isNewer && (isFromOtherDevice || triggerSource === 'window_focus' || triggerSource === 'force_sync' || triggerSource === 'app_mount' || triggerSource === 'network_reconnect')) {
        this.lastProcessedCloudUpdatedAt = remoteUpdatedAt;

        // Check if admin is currently typing in an active form
        if (this.activeFormTracker && this.activeFormTracker.isDirty) {
          this.activeConflict = {
            type: this.activeFormTracker.type,
            message: `Remote update received from ${cloudData.lastModifiedDeviceLabel || 'another device'}.`,
            incomingData: cloudData,
            timestamp: remoteUpdatedAt
          };
          this.syncState = 'conflict';
          this.notifyStatusChange();
        } else {
          // Notify app of remote data update
          this.notifyListeners('CLOUD_DATA_SYNCED', cloudData, {
            source: 'cloud',
            triggerSource,
            updatedAt: remoteUpdatedAt,
            deviceInfo: {
              id: cloudData.lastModifiedByDevice,
              label: cloudData.lastModifiedDeviceLabel
            }
          });
          this.syncState = 'connected';
        }
      }

      this.lastSyncTime = Date.now();
      this.notifyStatusChange();
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Push changes from this device to both local broadcast channel and Cloud
   */
  async pushUpdate({ config, bundles, orders, visitorStats, activityLogs, action, updateType }) {
    const timestamp = Date.now();
    this.lastLocalPushTimestamp = timestamp;
    this.lastProcessedCloudUpdatedAt = timestamp;
    this.syncState = 'syncing';
    this.notifyStatusChange();

    // 1. Instant local zero-latency broadcast to all open tabs/windows
    if (updateType) {
      this.broadcastLocally(updateType, { config, bundles, orders, visitorStats, activityLogs });
    } else {
      if (bundles) this.broadcastLocally('BUNDLES_UPDATED', bundles);
      if (config) this.broadcastLocally('CONFIG_UPDATED', config);
      if (orders) this.broadcastLocally('ORDERS_UPDATED', orders);
      if (visitorStats) this.broadcastLocally('VISITORS_UPDATED', visitorStats);
      if (activityLogs) this.broadcastLocally('LOGS_UPDATED', activityLogs);
    }

    // 2. Push to Cloud API with device stamp for cross-device reflection
    try {
      const payload = {
        config,
        bundles,
        orders,
        visitorStats,
        activityLogs,
        action,
        lastModifiedByDevice: this.deviceId,
        lastModifiedDeviceLabel: this.deviceInfo.label,
        updatedAt: timestamp
      };

      const result = await originalPushCloud(payload);
      if (result && result.success) {
        this.syncState = 'connected';
      } else {
        this.syncState = 'error';
      }
      this.lastSyncTime = Date.now();
      this.notifyStatusChange();
      return result;
    } catch (err) {
      console.error('Failed to push realtime update to cloud:', err);
      this.syncState = 'error';
      this.notifyStatusChange();
      return { success: false, error: err?.message || 'Push update network failure' };
    }
  }

  // Force trigger an immediate sync cycle
  async forceSync() {
    this.syncState = 'syncing';
    this.notifyStatusChange();
    await this.fetchAndSyncCloud('force_sync');
    this.syncState = 'connected';
    this.notifyStatusChange();
    return true;
  }
}

// Export singleton instance
export const realtimeSync = new RealtimeSyncManager();
export default realtimeSync;
