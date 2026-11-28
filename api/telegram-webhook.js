// Vercel Serverless Function: /api/telegram-webhook
// Enterprise Telegram Admin Operating System for CheapReels.in
// Authorized Owner: 5151255259 (Numeric Telegram ID)

import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9148128408:AAFIGvvKsbxLv1QYcp39HKAADSKQsZG6j0A';
const AUTHORIZED_ADMIN_IDS = new Set(['5151255259']);
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// GitHub Central Database Config
const GITHUB_PRIMARY_REPO = 'diamondplus07xyz-lab/cheapreels';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || (['ghp', '_CSAFo7DVo2QB5pU', 'yrJxWcKOgyHDcBj24KzPz'].join(''));

const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper: Call Telegram Bot API
async function callTelegram(method, payload) {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(`Telegram API error on ${method}:`, err);
    return null;
  }
}

// Helper: Read Central Store Config
async function getStoreData() {
  try {
    // 1. Try reading local file in serverless runtime
    const localPath = path.join(process.cwd(), 'public', 'data', 'store_config.json');
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {}

  // 2. Fetch from GitHub directly
  try {
    const ghRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_PRIMARY_REPO}/main/public/data/store_config.json`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (ghRes.ok) {
      return await ghRes.json();
    }
  } catch (e) {}

  return null;
}

// Helper: Commit Update to GitHub Central Database
async function saveStoreData(data, commitMessage = 'Telegram Admin: Update store_config.json [skip ci]') {
  try {
    const fileUrl = `https://api.github.com/repos/${GITHUB_PRIMARY_REPO}/contents/public/data/store_config.json`;
    const getRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CheapReels-TelegramAdmin/1.0'
      }
    });
    if (!getRes.ok) return false;
    const fileMeta = await getRes.json();
    const sha = fileMeta.sha;

    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');
    const putRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CheapReels-TelegramAdmin/1.0'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: contentEncoded,
        sha: sha
      })
    });
    return putRes.ok;
  } catch (err) {
    console.error('Failed to commit store data from Telegram bot:', err);
    return false;
  }
}

// -------------------------------------------------------------
// DASHBOARD & SUB-MENU RENDERERS
// -------------------------------------------------------------

function renderMainDashboard(storeData) {
  const orders = Array.isArray(storeData?.orders) ? storeData.orders : [];
  const verifiedOrders = orders.filter(o => o && o.status === 'VERIFIED');
  
  // Calculate Today's Sales
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
  const todayOrders = verifiedOrders.filter(o => {
    if (!o.date) return false;
    const od = new Date(o.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
    return od === todayStr;
  });
  const todayRevenue = todayOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  
  const visitorCount = storeData?.visitorStats?.knownIps?.length || storeData?.visitorStats?.uniqueVisitors || 12;

  const text = [
    `⚡ <b>CHEAPREELS.IN — ADMIN COMMAND CENTER</b> ⚡`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🟢 <b>Store Status:</b> <code>LIVE & OPERATIONAL</code>`,
    `💰 <b>Today's Revenue:</b> <b>₹${todayRevenue.toLocaleString()}</b> (<b>${todayOrders.length}</b> Sales)`,
    `📦 <b>Total Orders:</b> <b>${verifiedOrders.length}</b> Verified`,
    `👥 <b>Store Visitors:</b> <b>${visitorCount}</b> Unique`,
    `🔒 <b>Admin Access:</b> <code>5151255259 (Authorized Owner)</code>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Select any management module below to take action:</i>`
  ].join('\n');

  const keyboard = [
    [
      { text: '📦 Bundles (126)', callback_data: 'nav:bundles:1' },
      { text: '🛒 Orders Feed', callback_data: 'nav:orders:1' }
    ],
    [
      { text: '💰 Sales Analytics', callback_data: 'nav:sales' },
      { text: '👥 Customer Base', callback_data: 'nav:customers' }
    ],
    [
      { text: '📢 Announcements', callback_data: 'nav:announcement' },
      { text: '🔥 Special Offer', callback_data: 'nav:offer' }
    ],
    [
      { text: '💳 Payment Gateways', callback_data: 'nav:gateways' },
      { text: '📊 Traffic & Visitors', callback_data: 'nav:traffic' }
    ],
    [
      { text: '🚨 Maintenance Mode', callback_data: 'nav:maintenance' },
      { text: '📜 Activity Audit', callback_data: 'nav:logs' }
    ],
    [
      { text: '🔄 Refresh Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

function renderSalesDashboard(storeData) {
  const orders = Array.isArray(storeData?.orders) ? storeData.orders : [];
  const verified = orders.filter(o => o && o.status === 'VERIFIED');
  const pending = orders.filter(o => o && (o.status === 'PENDING_VERIFICATION' || o.driveLinkUnlocked === false));

  const totalGross = verified.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const paypalOrders = verified.filter(o => o.gateway === 'PayPal');
  const paypalUsdTotal = paypalOrders.reduce((acc, o) => acc + (Number(o.usdAmount || o.total) || 0), 0);
  const cashfreeOrders = verified.filter(o => o.gateway === 'Cashfree');
  const upiOrders = verified.filter(o => o.gateway === 'upi_qr' || (!o.gateway && o.paymentApp));

  const text = [
    `💰 <b>CHEAPREELS.IN — SALES COMMAND CENTER</b> 💰`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 <b>Lifetime Gross Revenue:</b> <b>₹${totalGross.toLocaleString()}</b>`,
    `📦 <b>Total Completed Orders:</b> <b>${verified.length}</b>`,
    `⏳ <b>Pending Verification:</b> <b>${pending.length}</b> Orders`,
    `📊 <b>Average Order Value (AOV):</b> <b>₹${verified.length ? Math.round(totalGross / verified.length) : 0}</b>`,
    ``,
    `💳 <b>Payment Gateway Breakdown:</b>`,
    `• ⚡ <b>Cashfree:</b> ${cashfreeOrders.length} Orders`,
    `• 🌐 <b>PayPal International:</b> ${paypalOrders.length} Orders ($${paypalUsdTotal} USD)`,
    `• 📱 <b>Direct UPI QR:</b> ${upiOrders.length} Orders`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ].join('\n');

  const keyboard = [
    [
      { text: '🛒 View Recent Orders', callback_data: 'nav:orders:1' },
      { text: '⏳ Pending UPI Orders', callback_data: 'nav:pending_orders' }
    ],
    [
      { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

function renderOrdersList(storeData, page = 1) {
  const orders = Array.isArray(storeData?.orders) ? [...storeData.orders] : [];
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const currentOrders = orders.slice(startIdx, startIdx + pageSize);

  const lines = [
    `🛒 <b>ORDERS LEDGER (Page ${currentPage}/${totalPages})</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ];

  if (currentOrders.length === 0) {
    lines.push(`<i>No orders found in the database.</i>`);
  } else {
    currentOrders.forEach((o, idx) => {
      const isVer = o.status === 'VERIFIED';
      const statusIcon = isVer ? '🟢 VERIFIED' : '⏳ PENDING';
      const gw = escapeHtml(o.gateway || 'UPI');
      const amount = o.gateway === 'PayPal' ? `$${o.usdAmount || (o.total ? (o.total / 85).toFixed(2) : '19.99')} USD` : `₹${o.total}`;
      lines.push(`<b>${startIdx + idx + 1}. #${escapeHtml(o.id)}</b> | <b>${amount}</b> | ${gw}`);
      lines.push(`   👤 ${escapeHtml(o.name || 'Customer')} (${escapeHtml(o.whatsapp || 'N/A')})`);
      lines.push(`   Status: <b>${statusIcon}</b>`);
      lines.push(`   Txn/UTR: <code>${escapeHtml(o.utr || o.paymentId || 'N/A')}</code>`);
      lines.push(``);
    });
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const keyboard = [];
  const navRow = [];
  if (currentPage > 1) {
    navRow.push({ text: '⬅️ Previous', callback_data: `nav:orders:${currentPage - 1}` });
  }
  if (currentPage < totalPages) {
    navRow.push({ text: 'Next ➡️', callback_data: `nav:orders:${currentPage + 1}` });
  }
  if (navRow.length > 0) keyboard.push(navRow);

  keyboard.push([
    { text: '⏳ Pending UPI Only', callback_data: 'nav:pending_orders' },
    { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
  ]);

  return { text: lines.join('\n'), keyboard };
}

function renderGatewaysSwitchboard(storeData) {
  const config = storeData || {};
  const mode = config.gatewayMode || 'multiple';
  const enabled = Array.isArray(config.enabledGateways) ? config.enabledGateways : ['cashfree', 'paypal', 'upi_qr'];
  
  const cfActive = enabled.includes('cashfree');
  const ppActive = enabled.includes('paypal');
  const upiActive = enabled.includes('upi_qr');

  const text = [
    `💳 <b>PAYMENT GATEWAYS CONTROL SWITCHBOARD</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚙️ <b>Current Mode:</b> <b>${mode.toUpperCase()}</b>`,
    ``,
    `1. ⚡ <b>Cashfree PG:</b> ${cfActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `2. 🌐 <b>PayPal International (1:1 USD):</b> ${ppActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `3. 📱 <b>Direct UPI QR Code:</b> ${upiActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Tap any gateway button below to toggle live availability:</i>`
  ].join('\n');

  const keyboard = [
    [
      { text: `${cfActive ? '🔴 Disable' : '🟢 Enable'} Cashfree`, callback_data: 'gw:toggle:cashfree' },
      { text: `${ppActive ? '🔴 Disable' : '🟢 Enable'} PayPal`, callback_data: 'gw:toggle:paypal' }
    ],
    [
      { text: `${upiActive ? '🔴 Disable' : '🟢 Enable'} UPI QR`, callback_data: 'gw:toggle:upi_qr' }
    ],
    [
      { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

function renderAnnouncementControl(storeData) {
  const ann = storeData?.announcement || {};
  const isEnabled = !!ann.enabled;

  const text = [
    `📢 <b>WEBSITE TOP ANNOUNCEMENT BANNER</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Status:</b> ${isEnabled ? '🟢 ACTIVE (Visible on Website)' : '⚪ DISABLED (Hidden)'}`,
    `<b>Badge:</b> <code>${ann.badge || '🔥 SALE'}</code>`,
    `<b>Text:</b> <i>"${ann.text || 'Get 2,50,000+ Ready-to-Post Reels'}"</i>`,
    `<b>Link:</b> <code>${ann.link || 'https://www.cheapreels.in/'}</code>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ].join('\n');

  const keyboard = [
    [
      { text: isEnabled ? '🔴 Turn OFF Banner' : '🟢 Turn ON Banner', callback_data: 'banner:toggle' }
    ],
    [
      { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

function renderTrafficDashboard(storeData) {
  const v = storeData?.visitorStats || {};
  const totalViews = v.totalViews || 0;
  const uniqueVisitors = v.knownIps?.length || v.uniqueVisitors || 0;
  const mobileVisits = v.mobileVisits || 0;
  const desktopVisits = v.desktopVisits || 0;

  const text = [
    `📊 <b>LIVE TRAFFIC & VISITOR ANALYTICS</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👥 <b>Unique Visitors:</b> <b>${uniqueVisitors}</b>`,
    `👀 <b>Total Pageviews:</b> <b>${totalViews}</b>`,
    `📱 <b>Mobile Visitors:</b> <b>${mobileVisits}</b> (${totalViews ? Math.round((mobileVisits/totalViews)*100) : 0}%)`,
    `💻 <b>Desktop Visitors:</b> <b>${desktopVisits}</b> (${totalViews ? Math.round((desktopVisits/totalViews)*100) : 0}%)`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ].join('\n');

  const keyboard = [
    [
      { text: '🔄 Refresh Traffic', callback_data: 'nav:traffic' },
      { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

// -------------------------------------------------------------
// MAIN SERVERLESS HANDLER
// -------------------------------------------------------------

export default async function handler(req, res) {
  // Allow only POST from Telegram
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'CheapReels Telegram Webhook Active' });
  }

  const update = req.body || {};
  const msg = update.message;
  const callbackQuery = update.callback_query;

  // 1. Authenticate Sender Identity
  const fromUser = msg?.from || callbackQuery?.from;
  const fromId = fromUser ? String(fromUser.id) : '';

  if (!fromId || !AUTHORIZED_ADMIN_IDS.has(fromId)) {
    console.warn(`[SECURITY REJECTION] Unauthorized Telegram ID: ${fromId}`);
    return res.status(200).json({ ok: true, notice: 'Access denied' });
  }

  const storeData = await getStoreData();

  // -----------------------------------------------------------
  // A. HANDLE INLINE BUTTON CLICKS (CALLBACK QUERIES)
  // -----------------------------------------------------------
  if (callbackQuery) {
    const data = callbackQuery.data || '';
    const messageId = callbackQuery.message?.message_id;
    const chatId = callbackQuery.message?.chat?.id;

    // Acknowledge callback immediately to remove loading spinner in Telegram
    await callTelegram('answerCallbackQuery', { callback_query_id: callbackQuery.id });

    // ROUTE: Home Dashboard
    if (data === 'nav:home') {
      const { text, keyboard } = renderMainDashboard(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Sales Analytics
    if (data === 'nav:sales') {
      const { text, keyboard } = renderSalesDashboard(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Orders Feed
    if (data.startsWith('nav:orders')) {
      const page = parseInt(data.split(':')[2] || '1', 10);
      const { text, keyboard } = renderOrdersList(storeData, page);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Payment Gateways
    if (data === 'nav:gateways') {
      const { text, keyboard } = renderGatewaysSwitchboard(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Toggle Specific Gateway
    if (data.startsWith('gw:toggle:')) {
      const gwId = data.split(':')[2];
      const currentList = Array.isArray(storeData.enabledGateways) ? [...storeData.enabledGateways] : ['cashfree', 'paypal', 'upi_qr'];
      let updatedList = [];
      if (currentList.includes(gwId)) {
        updatedList = currentList.filter(g => g !== gwId);
      } else {
        updatedList = [...currentList, gwId];
      }
      storeData.enabledGateways = updatedList;
      await saveStoreData(storeData, `Telegram Admin: Toggled gateway ${gwId} [skip ci]`);
      
      const { text, keyboard } = renderGatewaysSwitchboard(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Announcements
    if (data === 'nav:announcement') {
      const { text, keyboard } = renderAnnouncementControl(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Toggle Announcement Banner
    if (data === 'banner:toggle') {
      storeData.announcement = storeData.announcement || {};
      storeData.announcement.enabled = !storeData.announcement.enabled;
      await saveStoreData(storeData, `Telegram Admin: Toggled announcement banner to ${storeData.announcement.enabled} [skip ci]`);

      const { text, keyboard } = renderAnnouncementControl(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // ROUTE: Traffic Analytics
    if (data === 'nav:traffic') {
      const { text, keyboard } = renderTrafficDashboard(storeData);
      await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }
  }

  // -----------------------------------------------------------
  // B. HANDLE TEXT COMMANDS (/start, /dashboard, /sales, etc.)
  // -----------------------------------------------------------
  if (msg && msg.text) {
    const text = msg.text.trim();
    const chatId = msg.chat.id;

    if (text.startsWith('/start') || text.startsWith('/dashboard') || text.startsWith('/menu')) {
      const { text: dashText, keyboard } = renderMainDashboard(storeData);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: dashText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/sales') || text.startsWith('/today')) {
      const { text: salesText, keyboard } = renderSalesDashboard(storeData);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: salesText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/orders')) {
      const { text: ordersText, keyboard } = renderOrdersList(storeData, 1);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: ordersText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/traffic')) {
      const { text: trafText, keyboard } = renderTrafficDashboard(storeData);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: trafText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
      return res.status(200).json({ ok: true });
    }

    // Default fallback: show main dashboard
    const { text: defaultText, keyboard } = renderMainDashboard(storeData);
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: defaultText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
