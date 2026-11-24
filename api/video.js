// Vercel Serverless Function: /api/video
// Native High-Speed Google Drive Video Streaming with HTTP 206 Range Support
// Enterprise-Grade Hardened: SSRF Protection, Strict Host Whitelisting, Private IP Block, Input Validation.

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Strictly allow only genuine Google Drive content delivery hosts
function isAllowedStreamingUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase();

    // Block private/internal network ranges, loopback, link-local metadata endpoints
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.3') ||
      host.startsWith('169.254.') ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }

    return (
      host === 'drive.google.com' ||
      host === 'drive.usercontent.google.com' ||
      host === 'docs.google.com' ||
      host.endsWith('.googleusercontent.com') ||
      host.endsWith('.drive.google.com')
    );
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS & Security headers
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

  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let fileId = req.query?.id;
  let customUrl = req.query?.url;

  if (!fileId && req.url) {
    try {
      const u = new URL(req.url, 'http://localhost');
      fileId = u.searchParams.get('id');
      customUrl = u.searchParams.get('url');
    } catch (e) {}
  }

  if (!fileId && customUrl) {
    const match = customUrl.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|drive\.usercontent\.google\.com\/download\?id=)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }

  // Strict Google Drive fileId format validation (alphanumeric, dash, underscore, 15 to 100 characters)
  if (!fileId || typeof fileId !== 'string' || !/^[a-zA-Z0-9_-]{15,100}$/.test(fileId)) {
    return res.status(400).json({ error: 'Invalid or missing Google Drive file ID' });
  }

  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

  // Helper to resolve redirects with strict SSRF guard
  function getStream(targetUrl, rangeHeader, hops = 0) {
    if (hops > 5) {
      res.status(502).json({ error: 'Too many redirects from Google Drive' });
      return;
    }

    if (!isAllowedStreamingUrl(targetUrl)) {
      res.status(403).json({ error: 'Access forbidden: Target streaming host not permitted.' });
      return;
    }

    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };

    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader;
    }

    const reqMethod = req.method === 'HEAD' ? 'HEAD' : 'GET';

    const driveReq = client.request(targetUrl, { method: reqMethod, headers: requestHeaders }, (driveRes) => {
      // Handle redirect (Google Drive 301/302/303/307 to drive.usercontent.google.com)
      if (driveRes.statusCode === 301 || driveRes.statusCode === 302 || driveRes.statusCode === 303 || driveRes.statusCode === 307) {
        const nextLocation = driveRes.headers.location;
        if (nextLocation) {
          const resolvedNext = nextLocation.startsWith('http') ? nextLocation : new URL(nextLocation, targetUrl).href;
          return getStream(resolvedNext, rangeHeader, hops + 1);
        }
      }

      // Relay status code (200 or 206 Partial Content)
      const statusCode = driveRes.statusCode === 206 ? 206 : 200;
      res.statusCode = statusCode;

      // Set headers for smooth video playback
      res.setHeader('Content-Type', driveRes.headers['content-type'] || 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

      if (driveRes.headers['content-length']) {
        res.setHeader('Content-Length', driveRes.headers['content-length']);
      }
      if (driveRes.headers['content-range']) {
        res.setHeader('Content-Range', driveRes.headers['content-range']);
      }

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      // Stream data to client
      driveRes.pipe(res);

      driveRes.on('error', (err) => {
        console.error('Drive stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error' });
        }
      });
    });

    driveReq.on('error', (err) => {
      console.error('Request error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to retrieve media stream' });
      }
    });

    driveReq.end();
  }

  getStream(initialUrl, req.headers.range, 0);
}
