import fetch from 'node-fetch';
import { initialBundles, categories } from '../src/data/bundles.js';

const DOMAIN = 'https://www.cheapreels.in';
const HOST = 'www.cheapreels.in';
const KEY = '8f2c3a5e7d9b41a6b0c2e4f6a8d13579';
const KEY_LOCATION = `${DOMAIN}/${KEY}.txt`;

async function submitIndexNow() {
  const urlList = [
    `${DOMAIN}/`,
    `${DOMAIN}/sitemap.xml`,
    `${DOMAIN}/sitemap-products.xml`,
    `${DOMAIN}/sitemap-pages.xml`,
    `${DOMAIN}/sitemap-categories.xml`,
    `${DOMAIN}/sitemap-content.xml`,
    `${DOMAIN}/pricing`,
    `${DOMAIN}/how-it-works`,
    `${DOMAIN}/reviews`,
    `${DOMAIN}/faq`,
    `${DOMAIN}/about`,
    `${DOMAIN}/contact`,
    `${DOMAIN}/privacy.html`,
    `${DOMAIN}/terms`,
    `${DOMAIN}/refund`
  ];

  // Add categories
  for (const cat of categories) {
    if (cat.id && cat.id !== 'all') {
      urlList.push(`${DOMAIN}/#category-${cat.id}`);
    }
  }

  // Add all bundles
  for (const bundle of initialBundles) {
    urlList.push(`${DOMAIN}/#bundle-${bundle.id}`);
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  console.log(`Submitting ${urlList.length} URLs to IndexNow (Bing / Yandex)...`);

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      console.log(`[IndexNow] ${ep} responded: ${res.status} ${res.statusText}`);
      if (res.status === 200 || res.status === 202) {
        console.log(`[SUCCESS] ${urlList.length} URLs queued for instant indexing on Bing!`);
      } else {
        const text = await res.text();
        console.log(`[Response Body]: ${text}`);
      }
    } catch (err) {
      console.error(`[Error submitting to ${ep}]:`, err.message);
    }
  }
}

submitIndexNow();
