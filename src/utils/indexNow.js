/**
 * IndexNow Client Utility for DigiBundle
 * Submits updated pages to Bing, Yandex, Seznam & Naver instantaneously
 */

export const INDEXNOW_KEY = 'c7f938e210a442d992e5917812903e48';
export const PRIMARY_HOST = 'digibundle.in';

export async function submitUrlsToIndexNow(urls = []) {
  try {
    const list = Array.isArray(urls) && urls.length > 0 ? urls : [`https://${PRIMARY_HOST}/`];
    const res = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlList: list })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('IndexNow client submission error:', err);
  }
  return { success: false };
}
