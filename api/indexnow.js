// Vercel Serverless Function: /api/indexnow
// Instant URL Submission Protocol for Bing, Yandex, Seznam & Naver
// Automatically notifies search engines of created or modified URLs in real time.

export const INDEXNOW_KEY = 'c7f938e210a442d992e5917812903e48';
export const INDEXNOW_HOST = 'cheapreels.in';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let urlList = body?.urlList || [];

    if (body?.url && typeof body.url === 'string') {
      urlList = [body.url];
    }

    if (!Array.isArray(urlList) || urlList.length === 0) {
      urlList = [`https://${INDEXNOW_HOST}/`];
    }

    // Format URLs
    const formattedUrls = urlList.map(u => {
      if (u.startsWith('http')) return u;
      return `https://${INDEXNOW_HOST}${u.startsWith('/') ? '' : '/'}${u}`;
    });

    const payload = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: formattedUrls
    };

    // Submit to IndexNow API (Bing & Participating Search Engines)
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'CheapReels-IndexNow/1.0'
      },
      body: JSON.stringify(payload)
    });

    const isSuccess = indexNowResponse.status === 200 || indexNowResponse.status === 202;

    return res.status(200).json({
      success: isSuccess,
      status: indexNowResponse.status,
      message: isSuccess ? 'URLs submitted to IndexNow search engines!' : 'IndexNow received submission',
      submittedCount: formattedUrls.length,
      urls: formattedUrls
    });
  } catch (err) {
    console.error('IndexNow submission error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
