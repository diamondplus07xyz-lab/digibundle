/**
 * Advanced Activity Logs & Audit Trail Engine
 * DigiBundle Storefront & Admin Security Infrastructure
 * 
 * Immutability, zero dummy data, anti-injection, sensitive data redaction,
 * CSV export, detailed JSON inspection, and multi-dimensional filtering.
 */

import { getDeviceType, getBrowser, getOS } from './trafficTracker';

// Redact sensitive patterns (passwords, hashes, OTPs, auth tokens, secret keys)
export function redactSensitiveData(data) {
  if (typeof data === 'string') {
    return data
      .replace(/1Vivek@singh/gi, '[REDACTED_PASSCODE]')
      .replace(/(?:password|passcode|secret|token|otp|cvv|card)\s*[:=]\s*["']?([^"',;\s]+)["']?/gi, '$1: [REDACTED]')
      .replace(/\b[0-9]{12,19}\b/g, (match) => {
        // Redact potential credit card numbers while preserving short order IDs or UTRs
        if (match.length >= 16) return match.slice(0, 4) + ' **** **** ' + match.slice(-4);
        return match;
      });
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => redactSensitiveData(item));
    }
    const cleanObj = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('passcode') ||
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('hash') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('otp')
      ) {
        cleanObj[key] = '[REDACTED_CREDENTIAL]';
      } else {
        cleanObj[key] = redactSensitiveData(val);
      }
    }
    return cleanObj;
  }

  return data;
}

// Create an Audit Log Entry with Full Metadata
export function createAuditLogEntry({
  category = 'ADMIN', // 'ADMIN' | 'USER' | 'SYSTEM' | 'SECURITY'
  eventName = 'GENERIC_ACTION',
  title = '',
  detail = '',
  actorType = 'Admin', // 'Admin' | 'Customer' | 'System' | 'Guest'
  actorId = 'admin_master',
  targetEntity = 'System', // 'Bundle' | 'Order' | 'StoreConfig' | 'Maintenance' | 'Auth' | 'Security'
  targetId = '',
  status = 'Success', // 'Success' | 'Failed' | 'Warning'
  metadata = {},
  ip = ''
}) {
  const timestamp = Date.now();
  const time = new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const device = getDeviceType();
  const browser = getBrowser();
  const os = getOS();

  // Redact details & metadata for security compliance
  const sanitizedTitle = typeof title === 'string' ? redactSensitiveData(title) : 'Audit Event';
  const sanitizedDetail = typeof detail === 'string' ? redactSensitiveData(detail) : '';
  const sanitizedMetadata = redactSensitiveData(metadata || {});

  return {
    id: 'log_' + timestamp + '_' + Math.random().toString(36).substring(2, 7),
    timestamp,
    time,
    category: String(category).toUpperCase(),
    eventName: String(eventName).toUpperCase(),
    title: sanitizedTitle,
    detail: sanitizedDetail,
    actorType,
    actorId: actorId || (actorType === 'Admin' ? 'admin_master' : 'visitor_guest'),
    targetEntity,
    targetId: String(targetId || ''),
    status: status === 'Failed' ? 'Failed' : (status === 'Warning' ? 'Warning' : 'Success'),
    device,
    browser,
    os,
    ip: ip || (typeof window !== 'undefined' ? (localStorage.getItem('cheap_reels_device_id') || 'Client') : '127.0.0.1'),
    metadata: sanitizedMetadata,
    immutable: true
  };
}

// Compute Audit Statistics
export function computeAuditStats(logs = []) {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  let totalActivities = logs.length;
  let todayActivities = 0;
  let adminActivities = 0;
  let userActivities = 0;
  let systemActivities = 0;
  let securityEvents = 0;
  let failedActions = 0;

  logs.forEach(l => {
    if (!l) return;
    const ts = l.timestamp || 0;
    if (ts >= todayMs) todayActivities++;

    const cat = (l.category || l.type || '').toUpperCase();
    const actor = (l.actorType || '').toLowerCase();
    const stat = (l.status || '').toLowerCase();

    if (cat === 'SECURITY' || cat.includes('SECURITY_ALERT') || cat.includes('LOCKOUT')) {
      securityEvents++;
    }

    if (cat === 'ADMIN' || actor === 'admin' || ['BRANDING', 'OFFER', 'ANNOUNCEMENT', 'MAINTENANCE', 'ORDERS', 'AUTH', 'CATALOG'].includes(cat)) {
      adminActivities++;
    } else if (cat === 'USER' || actor === 'customer' || actor === 'user' || cat === 'STOREFRONT') {
      userActivities++;
    } else if (cat === 'SYSTEM') {
      systemActivities++;
    }

    if (stat === 'failed' || cat.includes('ALERT') || (l.title && l.title.toLowerCase().includes('failed'))) {
      failedActions++;
    }
  });

  return {
    totalActivities,
    todayActivities,
    adminActivities,
    userActivities,
    systemActivities,
    securityEvents,
    failedActions
  };
}

// Multi-Dimensional Filter for Logs
export function filterAuditLogs(logs = [], {
  search = '',
  category = 'ALL',
  actorType = 'ALL',
  status = 'ALL',
  dateRange = 'ALL', // 'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'ALL'
  sortOrder = 'NEWEST' // 'NEWEST' | 'OLDEST'
}) {
  if (!Array.isArray(logs)) return [];

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const yesterdayStart = todayMs - 86400000;
  const yesterdayEnd = todayMs;
  const sevenDaysAgo = now - 7 * 86400000;
  const thirtyDaysAgo = now - 30 * 86400000;

  const q = search.trim().toLowerCase();

  const filtered = logs.filter(l => {
    if (!l) return false;

    // 1. Search Query Match
    if (q) {
      const matchSearch =
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.detail && l.detail.toLowerCase().includes(q)) ||
        (l.eventName && l.eventName.toLowerCase().includes(q)) ||
        (l.actorId && l.actorId.toLowerCase().includes(q)) ||
        (l.targetId && l.targetId.toLowerCase().includes(q)) ||
        (l.ip && l.ip.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q));

      if (!matchSearch) return false;
    }

    // 2. Category Match
    if (category !== 'ALL') {
      const cat = (l.category || l.type || '').toUpperCase();
      if (category === 'ADMIN') {
        const isAdminCat = cat === 'ADMIN' || ['BRANDING', 'OFFER', 'ANNOUNCEMENT', 'MAINTENANCE', 'ORDERS', 'AUTH', 'CATALOG'].includes(cat);
        if (!isAdminCat) return false;
      } else if (category === 'USER') {
        const isUserCat = cat === 'USER' || cat === 'STOREFRONT' || l.actorType === 'Customer';
        if (!isUserCat) return false;
      } else if (category === 'SYSTEM') {
        if (cat !== 'SYSTEM') return false;
      } else if (category === 'SECURITY') {
        if (cat !== 'SECURITY' && !cat.includes('SECURITY_ALERT') && !cat.includes('LOCKOUT')) return false;
      }
    }

    // 3. Actor Type Match
    if (actorType !== 'ALL') {
      const actor = (l.actorType || '').toUpperCase();
      if (actor !== actorType.toUpperCase()) return false;
    }

    // 4. Status Match
    if (status !== 'ALL') {
      const s = (l.status || '').toUpperCase();
      if (status === 'SUCCESS' && s !== 'SUCCESS') return false;
      if (status === 'FAILED' && s !== 'FAILED') return false;
      if (status === 'WARNING' && s !== 'WARNING') return false;
    }

    // 5. Date Range Match
    const ts = l.timestamp || 0;
    if (dateRange === 'TODAY') {
      if (ts < todayMs) return false;
    } else if (dateRange === 'YESTERDAY') {
      if (ts < yesterdayStart || ts >= yesterdayEnd) return false;
    } else if (dateRange === '7D') {
      if (ts < sevenDaysAgo) return false;
    } else if (dateRange === '30D') {
      if (ts < thirtyDaysAgo) return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    return sortOrder === 'OLDEST' ? timeA - timeB : timeB - timeA;
  });

  return filtered;
}

// Export Filtered Logs to CSV File (RFC 4180 Compliant)
export function exportLogsToCSV(logs = [], filename = 'cheap_reels_audit_logs.csv') {
  if (!Array.isArray(logs) || logs.length === 0) {
    alert('No audit logs available to export in current filter.');
    return false;
  }

  const headers = [
    'Log ID',
    'Timestamp (Epoch)',
    'Time (IST)',
    'Category',
    'Event Name',
    'Title',
    'Detail',
    'Actor Type',
    'Actor ID',
    'Target Entity',
    'Target ID',
    'Status',
    'Device',
    'Browser',
    'Operating System',
    'IP / Device ID',
    'Metadata'
  ];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const str = typeof field === 'object' ? JSON.stringify(field) : String(field);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = logs.map(l => [
    escapeCSV(l.id),
    escapeCSV(l.timestamp),
    escapeCSV(l.time),
    escapeCSV(l.category || l.type || 'ADMIN'),
    escapeCSV(l.eventName || l.type || 'ACTION'),
    escapeCSV(l.title),
    escapeCSV(l.detail),
    escapeCSV(l.actorType || 'Admin'),
    escapeCSV(l.actorId || 'admin_master'),
    escapeCSV(l.targetEntity || 'System'),
    escapeCSV(l.targetId || ''),
    escapeCSV(l.status || 'Success'),
    escapeCSV(l.device || 'Desktop'),
    escapeCSV(l.browser || 'Browser'),
    escapeCSV(l.os || 'OS'),
    escapeCSV(l.ip || 'Client'),
    escapeCSV(l.metadata || {})
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

// Export Logs to JSON File
export function exportLogsToJSON(logs = [], filename = 'cheap_reels_audit_logs.json') {
  if (!Array.isArray(logs) || logs.length === 0) {
    alert('No audit logs available to export in current filter.');
    return false;
  }

  const jsonContent = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
