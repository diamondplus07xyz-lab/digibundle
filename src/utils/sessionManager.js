// Enterprise-grade Session Management & Authentication Security for DigiBundle
// Manages multi-device admin sessions, idle timeouts, session rotation, and secure revocation

import { pushCloudStoreData } from './cloudSync';

export const DEFAULT_IDLE_TIMEOUT_MINS = 15;
export const SESSION_STORAGE_KEY = 'digibundle_admin_sessions';
export const CURRENT_SESSION_ID_KEY = 'digibundle_current_session_id';
export const SESSION_TIMEOUT_CONFIG_KEY = 'digibundle_session_timeout_mins';
export const AUTH_COOKIE_NAME = 'digibundle_auth_session';

/**
 * Detects device type, browser, and operating system from navigator
 */
export function detectDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  // Device Type
  let deviceType = 'Desktop';
  if (/iPad|Tablet/i.test(ua) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // Browser
  let browser = 'Web Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  // Operating System
  let os = 'Unknown OS';
  if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os, userAgent: ua.slice(0, 150) };
}

/**
 * Generates a cryptographically strong random session ID
 */
export function generateSessionId() {
  const timestamp = Date.now();
  let rand = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    rand = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    rand = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  }
  return `sess_${timestamp}_${rand}`;
}

/**
 * Sets secure authentication cookie
 */
export function setAuthCookie(sessionId, maxAgeSeconds = 7 * 86400) {
  try {
    if (typeof document !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(sessionId)}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict${secureFlag}`;
    }
  } catch (e) {}
}

/**
 * Clears authentication cookie
 */
export function clearAuthCookie() {
  try {
    if (typeof document !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
    }
  } catch (e) {}
}

/**
 * Gets configured idle timeout in minutes (default: 15)
 */
export function getSessionTimeoutMinutes() {
  try {
    const saved = localStorage.getItem(SESSION_TIMEOUT_CONFIG_KEY);
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 5 && num <= 240) {
      return num;
    }
  } catch (e) {}
  return DEFAULT_IDLE_TIMEOUT_MINS;
}

/**
 * Sets configured idle timeout in minutes
 */
export function setSessionTimeoutMinutes(mins) {
  try {
    const valid = Math.max(5, Math.min(240, parseInt(mins, 10) || DEFAULT_IDLE_TIMEOUT_MINS));
    localStorage.setItem(SESSION_TIMEOUT_CONFIG_KEY, valid.toString());
    return valid;
  } catch (e) {
    return DEFAULT_IDLE_TIMEOUT_MINS;
  }
}

/**
 * Retrieves all stored admin sessions
 */
export function getAllSessions() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves sessions array to local storage and syncs to cloud
 */
export function saveSessions(sessions, syncToCloud = true) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    if (syncToCloud) {
      try {
        pushCloudStoreData({ adminSessions: sessions });
      } catch (e) {}
    }
  } catch (e) {}
}

/**
 * Returns current session ID from sessionStorage or fallback localStorage
 */
export function getCurrentSessionId() {
  try {
    const fromSession = sessionStorage.getItem(CURRENT_SESSION_ID_KEY);
    if (fromSession) return fromSession;
    return localStorage.getItem(CURRENT_SESSION_ID_KEY) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Sets current session ID in sessionStorage & localStorage
 */
export function setCurrentSessionId(sessionId) {
  try {
    if (sessionId) {
      sessionStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);
      localStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);
      setAuthCookie(sessionId);
    } else {
      sessionStorage.removeItem(CURRENT_SESSION_ID_KEY);
      localStorage.removeItem(CURRENT_SESSION_ID_KEY);
      clearAuthCookie();
    }
  } catch (e) {}
}

/**
 * Creates a new active admin session, rotating old credentials and registering this device
 */
export function createAdminSession(options = {}) {
  const sessionId = generateSessionId();
  const info = detectDeviceInfo();
  const now = Date.now();

  const newSession = {
    id: sessionId,
    adminId: options.adminId || 'admin_master',
    role: 'SUPER_ADMIN',
    deviceType: options.deviceType || info.deviceType,
    browser: options.browser || info.browser,
    os: options.os || info.os,
    userAgent: info.userAgent,
    ip: options.ip || (typeof localStorage !== 'undefined' ? localStorage.getItem('digibundle_visitor_ip') || 'Localhost / Direct' : 'Localhost / Direct'),
    status: 'active',
    createdAt: new Date(now).toISOString(),
    createdEpoch: now,
    lastActiveAt: now,
    lastActiveEpoch: now,
    expiresAtEpoch: now + (getSessionTimeoutMinutes() * 60 * 1000)
  };

  // Get existing sessions and mark this device's old session as terminated (Session Fixation Prevention)
  const existing = getAllSessions();
  const currentId = getCurrentSessionId();
  
  const updated = [
    newSession,
    ...existing.map(s => {
      if (s.id === currentId && s.status === 'active') {
        return { ...s, status: 'terminated', terminatedReason: 'Session rotated upon new login' };
      }
      return s;
    })
  ].slice(0, 30); // Keep last 30 sessions for audit trail

  saveSessions(updated, true);
  setCurrentSessionId(sessionId);

  return newSession;
}

/**
 * Updates the last active heartbeat of the current session
 */
export function updateSessionHeartbeat(sessionId) {
  if (!sessionId) return;
  try {
    const sessions = getAllSessions();
    const now = Date.now();
    const timeoutMs = getSessionTimeoutMinutes() * 60 * 1000;
    
    let hasChanged = false;
    const updated = sessions.map(s => {
      if (s.id === sessionId && s.status === 'active') {
        hasChanged = true;
        return {
          ...s,
          lastActiveAt: now,
          lastActiveEpoch: now,
          expiresAtEpoch: now + timeoutMs
        };
      }
      return s;
    });

    if (hasChanged) {
      saveSessions(updated, false); // Local update only to minimize cloud spam
    }
  } catch (e) {}
}

/**
 * Checks if the current session is valid and active, or if it has been terminated or expired
 */
export function validateCurrentSession(sessionId) {
  if (!sessionId) return { valid: false, reason: 'NO_SESSION' };

  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    return { valid: false, reason: 'SESSION_NOT_FOUND' };
  }

  if (session.status === 'terminated') {
    return { valid: false, reason: 'SESSION_TERMINATED', details: session.terminatedReason || 'Session terminated remotely.' };
  }

  const now = Date.now();
  const timeoutMs = getSessionTimeoutMinutes() * 60 * 1000;
  const lastActive = session.lastActiveEpoch || session.createdEpoch || 0;

  if (now - lastActive > timeoutMs) {
    // Mark as expired in list
    terminateSession(sessionId, 'Session expired due to inactivity');
    return { valid: false, reason: 'SESSION_EXPIRED', details: 'Session expired due to inactivity' };
  }

  return { valid: true, session };
}

/**
 * Terminates a single session by ID
 */
export function terminateSession(sessionId, reason = 'Terminated by Admin') {
  if (!sessionId) return;

  const sessions = getAllSessions();
  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        status: 'terminated',
        terminatedAt: new Date().toISOString(),
        terminatedEpoch: Date.now(),
        terminatedReason: reason
      };
    }
    return s;
  });

  saveSessions(updated, true);

  // If the terminated session is this device's current session, purge local tokens
  if (getCurrentSessionId() === sessionId) {
    setCurrentSessionId(null);
  }
}

/**
 * Terminates all other active sessions except the specified current session ID
 */
export function terminateAllOtherSessions(currentSessionId, reason = 'Terminated via "Logout From All Other Devices"') {
  const sessions = getAllSessions();
  const now = Date.now();

  let terminatedCount = 0;
  const updated = sessions.map(s => {
    if (s.id !== currentSessionId && s.status === 'active') {
      terminatedCount++;
      return {
        ...s,
        status: 'terminated',
        terminatedAt: new Date(now).toISOString(),
        terminatedEpoch: now,
        terminatedReason: reason
      };
    }
    return s;
  });

  saveSessions(updated, true);
  return { terminatedCount };
}

/**
 * Terminates all sessions across all devices (including current)
 */
export function terminateAllSessions(reason = 'Terminated via "Logout From All Devices"') {
  const sessions = getAllSessions();
  const now = Date.now();

  const updated = sessions.map(s => {
    if (s.status === 'active') {
      return {
        ...s,
        status: 'terminated',
        terminatedAt: new Date(now).toISOString(),
        terminatedEpoch: now,
        terminatedReason: reason
      };
    }
    return s;
  });

  saveSessions(updated, true);
  setCurrentSessionId(null);
}

/**
 * Securely logs out the current admin session, clears storage, and returns redirect path
 */
export function performAdminLogout(reason = 'Admin Manual Logout') {
  const currentId = getCurrentSessionId();
  if (currentId) {
    terminateSession(currentId, reason);
  }
  setCurrentSessionId(null);
  clearAuthCookie();
  try {
    sessionStorage.removeItem('digibundle_admin_auth_token');
    sessionStorage.clear();
  } catch (e) {}

  return { loggedOut: true };
}

/**
 * Clears customer order session and credentials
 */
export function clearCustomerSession() {
  try {
    localStorage.removeItem('digibundle_customer_phone');
    localStorage.removeItem('digibundle_order_history');
    sessionStorage.removeItem('digibundle_customer_temp');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
