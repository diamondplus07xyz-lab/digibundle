import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const isDemoOrder = (o) => {
  if (!o) return true;
  const demoIds = ['CR-588086', 'CR-166465', 'CRS-979962', 'CR-137840'];
  if (demoIds.includes(o.id)) return true;
  if (o.name && (o.name === 'Test User' || o.name === 'Rohan Verma' || o.name === 'Aakash Verma')) return true;
  if (o.email && o.email === 'test@example.com') return true;
  if (o.utr && (o.utr === '123456789012' || o.utr === '889977665544' || o.utr === 'UPI-1978192085' || o.utr === '123456789101')) return true;
  return false;
};

function mergeOrders(existing = [], incoming = []) {
  const map = new Map();
  for (const o of existing) {
    if (o && o.id && !isDemoOrder(o)) map.set(o.id, { ...o });
  }
  for (const o of incoming) {
    if (o && o.id && !isDemoOrder(o)) {
      if (map.has(o.id)) {
        const prev = map.get(o.id);
        map.set(o.id, {
          ...prev,
          ...o,
          status: o.status || prev.status,
          verifiedAt: o.verifiedAt || prev.verifiedAt,
          rejectedAt: o.rejectedAt || prev.rejectedAt,
          driveLinkUnlocked: o.driveLinkUnlocked !== undefined ? o.driveLinkUnlocked : prev.driveLinkUnlocked
        });
      } else {
        map.set(o.id, { ...o });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.createdAt || b.timestamp || b.id || 0) - (a.createdAt || a.timestamp || a.id || 0));
}

function mergeVisitorStats(existing = {}, incoming = {}) {
  const existingIps = Array.isArray(existing.knownIps) ? existing.knownIps : [];
  const incomingIps = Array.isArray(incoming.knownIps) ? incoming.knownIps : [];
  const uniqueIps = Array.from(new Set([...existingIps, ...incomingIps]));

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

function mergeActivityLogs(existing = [], incoming = []) {
  const logMap = new Map();
  for (const l of existing) {
    if (l && l.id) logMap.set(l.id, l);
  }
  for (const l of incoming) {
    if (l && l.id) logMap.set(l.id, l);
  }
  return Array.from(logMap.values())
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 100);
}

function devSyncPlugin() {
  return {
    name: 'dev-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /api/video: Google Drive Native MP4 Streaming
        if (req.url && (req.url === '/api/video' || req.url.startsWith('/api/video?'))) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const parsedReqUrl = new URL(req.url, 'http://localhost');
          let fileId = parsedReqUrl.searchParams.get('id');
          const customUrl = parsedReqUrl.searchParams.get('url');

          if (!fileId && customUrl) {
            const match = customUrl.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/);
            if (match && match[1]) fileId = match[1];
          }

          if (!fileId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing Google Drive file id' }));
            return;
          }

          const streamDrive = (targetUrl, hops = 0) => {
            if (hops > 5) {
              res.statusCode = 502;
              res.end('Too many redirects');
              return;
            }

            const https = require('https');
            const headers = {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            };
            if (req.headers.range) {
              headers['Range'] = req.headers.range;
            }

            https.get(targetUrl, { headers }, (driveRes) => {
              if (driveRes.statusCode === 301 || driveRes.statusCode === 302 || driveRes.statusCode === 303 || driveRes.statusCode === 307) {
                const nextLoc = driveRes.headers.location;
                if (nextLoc) return streamDrive(nextLoc, hops + 1);
              }

              res.statusCode = driveRes.statusCode === 206 ? 206 : 200;
              res.setHeader('Content-Type', driveRes.headers['content-type'] || 'video/mp4');
              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              if (driveRes.headers['content-length']) res.setHeader('Content-Length', driveRes.headers['content-length']);
              if (driveRes.headers['content-range']) res.setHeader('Content-Range', driveRes.headers['content-range']);

              driveRes.pipe(res);
            }).on('error', (err) => {
              res.statusCode = 500;
              res.end(err.message);
            });
          };

          streamDrive(`https://drive.google.com/uc?export=download&id=${fileId}`);
          return;
        }

        if (req.url && (req.url === '/api/sync' || req.url.startsWith('/api/sync?'))) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const filePath = path.resolve(process.cwd(), 'public/data/store_config.json');

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, source: 'local_file', data: JSON.parse(data) }));
                return;
              }
            } catch (e) {}
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, error: 'Config file not found' }));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                let current = {};
                if (fs.existsSync(filePath)) {
                  try {
                    current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                  } catch (e) {}
                }

                const updated = {
                  version: '2.0',
                  updatedAt: Date.now(),
                  config: parsed.config ? { ...(current.config || {}), ...parsed.config } : (current.config || {}),
                  bundles: (Array.isArray(parsed.bundles) && parsed.bundles.length > 0) ? parsed.bundles : (current.bundles || []),
                  orders: mergeOrders(current.orders || [], parsed.orders || []),
                  visitorStats: mergeVisitorStats(current.visitorStats || {}, parsed.visitorStats || {}),
                  activityLogs: mergeActivityLogs(current.activityLogs || [], parsed.activityLogs || [])
                };

                fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'Saved locally in public/data/store_config.json', updatedAt: updated.updatedAt, data: updated }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devSyncPlugin(),
  ],
})
