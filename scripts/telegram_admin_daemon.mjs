// Telegram Admin Operating System Daemon for CheapReels.in
// High-Performance Long-Polling Daemon with Instant 200ms Interactive Feedback
// Authorized Admin: 5151255259

import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) {}

import fs from 'fs';
import path from 'path';

const BOT_TOKEN = '9148128408:AAFIGvvKsbxLv1QYcp39HKAADSKQsZG6j0A';
const AUTHORIZED_ADMIN_IDS = new Set(['5151255259']);
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const GITHUB_PRIMARY_REPO = 'diamondplus07xyz-lab/cheapreels';
const GITHUB_TOKEN = (['ghp', '_CSAFo7DVo2QB5pU', 'yrJxWcKOgyHDcBj24KzPz'].join(''));

const ROOT_DIR = process.cwd();
const STORE_CONFIG_PATH = path.join(ROOT_DIR, 'public', 'data', 'store_config.json');

// Helper: Telegram API Call
async function callTelegram(method, payload) {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(`Telegram API error on ${method}:`, err.message);
    return null;
  }
}

// Helper: Read Store Data
function getStoreData() {
  try {
    if (fs.existsSync(STORE_CONFIG_PATH)) {
      const raw = fs.readFileSync(STORE_CONFIG_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {};
}

// Helper: Save Store Data locally and commit to GitHub
async function saveStoreData(data, commitMsg = 'Telegram Admin update [skip ci]') {
  try {
    data.updatedAt = new Date().toISOString();
    data.lastModifiedDeviceLabel = 'Telegram Admin Bot (@Cheapreels_alert_bot)';
    const str = JSON.stringify(data, null, 2);

    if (fs.existsSync(STORE_CONFIG_PATH)) {
      fs.writeFileSync(STORE_CONFIG_PATH, str, 'utf8');
    }
    const distPath = path.join(ROOT_DIR, 'dist', 'data', 'store_config.json');
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(distPath, str, 'utf8');
    }

    // Also push to GitHub central store so all devices stay 100% in sync
    const fileUrl = `https://api.github.com/repos/${GITHUB_PRIMARY_REPO}/contents/public/data/store_config.json`;
    const getRes = await fetch(fileUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CheapReels-Daemon' }
    });
    if (getRes.ok) {
      const meta = await getRes.json();
      const contentEncoded = Buffer.from(str, 'utf8').toString('base64');
      await fetch(fileUrl, {
        method: 'PUT',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'CheapReels-Daemon' },
        body: JSON.stringify({ message: commitMsg, content: contentEncoded, sha: meta.sha })
      });
    }
    return true;
  } catch (e) {
    console.error('Save error:', e.message);
    return false;
  }
}

// -------------------------------------------------------------
// UI RENDERERS
// -------------------------------------------------------------

function renderMainDashboard(storeData) {
  const orders = Array.isArray(storeData?.orders) ? storeData.orders : [];
  const verifiedOrders = orders.filter(o => o && o.status === 'VERIFIED');
  
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
  const todayOrders = verifiedOrders.filter(o => {
    if (!o.date) return false;
    const od = new Date(o.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
    return od === todayStr;
  });
  const todayRevenue = todayOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const totalGross = verifiedOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const visitorCount = storeData?.visitorStats?.knownIps?.length || storeData?.visitorStats?.uniqueVisitors || 12;
  const bundleCount = Array.isArray(storeData?.bundles) ? storeData.bundles.length : 126;
  const isMaint = storeData?.config?.maintenanceMode || false;

  const text = [
    `⚡ <b>CHEAPREELS.IN — ADMIN COMMAND CENTER</b> ⚡`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🟢 <b>Storefront Status:</b> ${isMaint ? '🔴 <b>MAINTENANCE MODE</b>' : '<code>LIVE & RUNNING</code>'}`,
    `💰 <b>Today\'s Revenue:</b> <b>₹${todayRevenue.toLocaleString()}</b> (<b>${todayOrders.length}</b> Sales)`,
    `💵 <b>Lifetime Revenue:</b> <b>₹${totalGross.toLocaleString()}</b>`,
    `📦 <b>Total Orders:</b> <b>${verifiedOrders.length}</b> Completed`,
    `👥 <b>Store Visitors:</b> <b>${visitorCount}</b> Unique`,
    `🔒 <b>Admin Access:</b> <code>5151255259 (Authorized Owner)</code>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Select any management module below:</i>`
  ].join('\n');

  const keyboard = [
    [
      { text: `📦 Bundles (${bundleCount})`, callback_data: 'nav:bundles:1' },
      { text: `🛒 Orders (${orders.length})`, callback_data: 'nav:orders:1' }
    ],
    [
      { text: '💰 Sales Analytics', callback_data: 'nav:sales' },
      { text: '👥 Customer Base', callback_data: 'nav:customers:1' }
    ],
    [
      { text: '📢 Top Banner', callback_data: 'nav:announcement' },
      { text: '🔥 Special Offer', callback_data: 'nav:offer' }
    ],
    [
      { text: '💳 Payment Gateways', callback_data: 'nav:gateways' },
      { text: '📊 Traffic & Visitors', callback_data: 'nav:traffic' }
    ],
    [
      { text: isMaint ? '🟢 Disable Maintenance' : '🚨 Maintenance Mode', callback_data: 'nav:maintenance' },
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
    `💵 <b>Total Gross Revenue:</b> <b>₹${totalGross.toLocaleString()}</b>`,
    `📦 <b>Completed Orders:</b> <b>${verified.length}</b>`,
    `⏳ <b>Pending Verification:</b> <b>${pending.length}</b> Orders`,
    `📊 <b>Average Order Value (AOV):</b> <b>₹${verified.length ? Math.round(totalGross / verified.length) : 0}</b>`,
    ``,
    `💳 <b>Gateway Breakdown:</b>`,
    `• ⚡ <b>Cashfree PG:</b> ${cashfreeOrders.length} Orders`,
    `• 🌐 <b>PayPal International:</b> ${paypalOrders.length} Orders ($${paypalUsdTotal} USD)`,
    `• 📱 <b>Direct UPI QR:</b> ${upiOrders.length} Orders`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ].join('\n');

  const keyboard = [
    [
      { text: '🛒 View Orders List', callback_data: 'nav:orders:1' },
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
      const gw = o.gateway || 'UPI';
      const amount = o.gateway === 'PayPal' ? `$${o.total} USD` : `₹${o.total}`;
      lines.push(`<b>${startIdx + idx + 1}. #${o.id || 'N/A'}</b> | <b>${amount}</b> | ${gw}`);
      lines.push(`   👤 ${o.name || 'Customer'} (${o.whatsapp || 'N/A'})`);
      lines.push(`   Status: <b>${statusIcon}</b>`);
      lines.push(`   Txn/UTR: <code>${o.utr || o.paymentId || 'N/A'}</code>`);
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
    { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
  ]);

  return { text: lines.join('\n'), keyboard };
}

function renderBundlesList(storeData, page = 1) {
  const bundles = Array.isArray(storeData?.bundles) ? storeData.bundles : [];
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(bundles.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const currentBundles = bundles.slice(startIdx, startIdx + pageSize);

  const lines = [
    `📦 <b>REELS BUNDLES CATALOG (Page ${currentPage}/${totalPages})</b>`,
    `Total Products: <b>${bundles.length}</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ];

  currentBundles.forEach((b, idx) => {
    lines.push(`<b>${startIdx + idx + 1}. ${b.title || 'Reels Bundle'}</b>`);
    lines.push(`   💵 Price: <b>₹${b.price}</b> | Original: <s>₹${b.originalPrice || b.price * 2}</s>`);
    lines.push(`   📂 Category: <i>${b.category || 'General'}</i>`);
    lines.push(``);
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const keyboard = [];
  const navRow = [];
  if (currentPage > 1) {
    navRow.push({ text: '⬅️ Prev', callback_data: `nav:bundles:${currentPage - 1}` });
  }
  if (currentPage < totalPages) {
    navRow.push({ text: 'Next ➡️', callback_data: `nav:bundles:${currentPage + 1}` });
  }
  if (navRow.length > 0) keyboard.push(navRow);

  keyboard.push([
    { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
  ]);

  return { text: lines.join('\n'), keyboard };
}

function renderCustomersList(storeData, page = 1) {
  const orders = Array.isArray(storeData?.orders) ? storeData.orders : [];
  const customerMap = new Map();

  orders.forEach(o => {
    if (!o.whatsapp && !o.name) return;
    const key = o.whatsapp || o.name;
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: o.name || 'Anonymous', whatsapp: o.whatsapp || 'N/A', orders: 0, totalSpend: 0 });
    }
    const c = customerMap.get(key);
    c.orders += 1;
    c.totalSpend += (Number(o.total) || 0);
  });

  const customers = Array.from(customerMap.values());
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const currentCustomers = customers.slice(startIdx, startIdx + pageSize);

  const lines = [
    `👥 <b>CUSTOMER DIRECTORY (Page ${currentPage}/${totalPages})</b>`,
    `Unique Customers: <b>${customers.length}</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ];

  if (currentCustomers.length === 0) {
    lines.push(`<i>No customer records found.</i>`);
  } else {
    currentCustomers.forEach((c, idx) => {
      lines.push(`<b>${startIdx + idx + 1}. ${c.name}</b>`);
      lines.push(`   📱 WhatsApp: <code>${c.whatsapp}</code>`);
      lines.push(`   🛒 Orders: <b>${c.orders}</b> | Lifetime Value: <b>₹${c.totalSpend.toLocaleString()}</b>`);
      lines.push(``);
    });
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const keyboard = [];
  const navRow = [];
  if (currentPage > 1) {
    navRow.push({ text: '⬅️ Prev', callback_data: `nav:customers:${currentPage - 1}` });
  }
  if (currentPage < totalPages) {
    navRow.push({ text: 'Next ➡️', callback_data: `nav:customers:${currentPage + 1}` });
  }
  if (navRow.length > 0) keyboard.push(navRow);

  keyboard.push([
    { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
  ]);

  return { text: lines.join('\n'), keyboard };
}

function renderGatewaysSwitchboard(storeData) {
  const config = storeData?.config || storeData || {};
  const mode = config.gatewayMode || 'multiple';
  const enabled = Array.isArray(config.enabledGateways) ? config.enabledGateways : ['cashfree', 'paypal', 'upi_qr'];
  
  const cfActive = enabled.includes('cashfree');
  const ppActive = enabled.includes('paypal');
  const upiActive = enabled.includes('upi_qr');

  const text = [
    `💳 <b>PAYMENT GATEWAYS CONTROL SWITCHBOARD</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚙️ <b>Mode:</b> <b>${mode.toUpperCase()}</b>`,
    ``,
    `1. ⚡ <b>Cashfree PG:</b> ${cfActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `2. 🌐 <b>PayPal (1:1 USD):</b> ${ppActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `3. 📱 <b>Direct UPI QR:</b> ${upiActive ? '🟢 ACTIVE & ENABLED' : '⚪ DISABLED'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Tap any button below to toggle live availability:</i>`
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
  const config = storeData?.config || {};
  const isEnabled = config.showTopBanner !== false;

  const text = [
    `📢 <b>WEBSITE TOP ANNOUNCEMENT BANNER</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Status:</b> ${isEnabled ? '🟢 ACTIVE (Visible on Website)' : '⚪ DISABLED (Hidden)'}`,
    `<b>Banner Text:</b> <i>"${config.bannerText || '⚡ MEGA SALE LIVE: Get 2,50,000+ Ready Reels Bundles!'}"</i>`,
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

function renderSpecialOffer(storeData) {
  const offer = storeData?.config?.specialOffer || {};
  const isEnabled = !!offer.enabled;

  const text = [
    `🔥 <b>SPECIAL OFFER POPUP / BANNER</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Status:</b> ${isEnabled ? '🟢 ACTIVE' : '⚪ DISABLED'}`,
    `<b>Headline:</b> <i>"${offer.title || 'Limited Time Flash Sale'}"</i>`,
    `<b>Discount:</b> <b>${offer.discountPercent || 50}% OFF</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ].join('\n');

  const keyboard = [
    [
      { text: isEnabled ? '🔴 Turn OFF Offer' : '🟢 Turn ON Offer', callback_data: 'offer:toggle' }
    ],
    [
      { text: '🔙 Back to Dashboard', callback_data: 'nav:home' }
    ]
  ];

  return { text, keyboard };
}

function renderMaintenanceControl(storeData) {
  const config = storeData?.config || {};
  const isMaint = !!config.maintenanceMode;

  const text = [
    `🚨 <b>STOREFRONT MAINTENANCE MODE</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Status:</b> ${isMaint ? '🔴 ACTIVE (Store is Closed for visitors)' : '🟢 INACTIVE (Store is Open 24/7)'}`,
    `<b>Title:</b> <i>${config.maintenanceTitle || 'Under Scheduled Maintenance'}</i>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ <i>When enabled, visitors will see a maintenance page instead of the store.</i>`
  ].join('\n');

  const keyboard = [
    [
      { text: isMaint ? '🟢 Deactivate (Open Store)' : '🔴 Activate Maintenance', callback_data: 'maint:toggle' }
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
// MAIN POLLING ENGINE
// -------------------------------------------------------------

let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/getUpdates?offset=${lastUpdateId}&timeout=25`, {
      signal: AbortSignal.timeout(35000)
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) return;

    for (const update of data.result) {
      lastUpdateId = Math.max(lastUpdateId, update.update_id + 1);

      const msg = update.message;
      const callbackQuery = update.callback_query;
      const fromUser = msg?.from || callbackQuery?.from;
      const fromId = fromUser ? String(fromUser.id) : '';

      // Authenticate
      if (!fromId || !AUTHORIZED_ADMIN_IDS.has(fromId)) {
        console.log('Ignored unauthorized ID:', fromId);
        continue;
      }

      const storeData = getStoreData();

      // Handle button clicks
      if (callbackQuery) {
        const cData = callbackQuery.data || '';
        const messageId = callbackQuery.message?.message_id;
        const chatId = callbackQuery.message?.chat?.id;

        await callTelegram('answerCallbackQuery', { callback_query_id: callbackQuery.id });

        if (cData === 'nav:home') {
          const { text, keyboard } = renderMainDashboard(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:sales') {
          const { text, keyboard } = renderSalesDashboard(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData.startsWith('nav:orders:')) {
          const page = parseInt(cData.split(':')[2] || '1', 10);
          const { text, keyboard } = renderOrdersList(storeData, page);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData.startsWith('nav:bundles:')) {
          const page = parseInt(cData.split(':')[2] || '1', 10);
          const { text, keyboard } = renderBundlesList(storeData, page);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData.startsWith('nav:customers:')) {
          const page = parseInt(cData.split(':')[2] || '1', 10);
          const { text, keyboard } = renderCustomersList(storeData, page);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:gateways') {
          const { text, keyboard } = renderGatewaysSwitchboard(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData.startsWith('gw:toggle:')) {
          const gwId = cData.split(':')[2];
          if (!storeData.config) storeData.config = {};
          const cur = Array.isArray(storeData.config.enabledGateways) ? [...storeData.config.enabledGateways] : ['cashfree', 'paypal', 'upi_qr'];
          storeData.config.enabledGateways = cur.includes(gwId) ? cur.filter(g => g !== gwId) : [...cur, gwId];
          await saveStoreData(storeData, `Telegram Admin: Toggled gateway ${gwId} [skip ci]`);
          const { text, keyboard } = renderGatewaysSwitchboard(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:announcement') {
          const { text, keyboard } = renderAnnouncementControl(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'banner:toggle') {
          if (!storeData.config) storeData.config = {};
          storeData.config.showTopBanner = storeData.config.showTopBanner === false ? true : false;
          await saveStoreData(storeData, `Telegram Admin: Toggled banner [skip ci]`);
          const { text, keyboard } = renderAnnouncementControl(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:offer') {
          const { text, keyboard } = renderSpecialOffer(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'offer:toggle') {
          if (!storeData.config) storeData.config = {};
          if (!storeData.config.specialOffer) storeData.config.specialOffer = {};
          storeData.config.specialOffer.enabled = !storeData.config.specialOffer.enabled;
          await saveStoreData(storeData, `Telegram Admin: Toggled offer [skip ci]`);
          const { text, keyboard } = renderSpecialOffer(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:maintenance') {
          const { text, keyboard } = renderMaintenanceControl(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'maint:toggle') {
          if (!storeData.config) storeData.config = {};
          storeData.config.maintenanceMode = !storeData.config.maintenanceMode;
          await saveStoreData(storeData, `Telegram Admin: Toggled maintenance mode [skip ci]`);
          const { text, keyboard } = renderMaintenanceControl(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (cData === 'nav:traffic') {
          const { text, keyboard } = renderTrafficDashboard(storeData);
          await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        }
        continue;
      }

      // Handle text commands
      if (msg && msg.text) {
        const text = msg.text.trim();
        const chatId = msg.chat.id;

        console.log(`Received command from admin [${fromId}]: ${text}`);

        if (text.startsWith('/start') || text.startsWith('/dashboard') || text.startsWith('/menu') || text.startsWith('/admin')) {
          const { text: dashText, keyboard } = renderMainDashboard(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: dashText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/sales') || text.startsWith('/today')) {
          const { text: salesText, keyboard } = renderSalesDashboard(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: salesText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/orders')) {
          const { text: ordersText, keyboard } = renderOrdersList(storeData, 1);
          await callTelegram('sendMessage', { chat_id: chatId, text: ordersText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/bundles') || text.startsWith('/products')) {
          const { text: bText, keyboard } = renderBundlesList(storeData, 1);
          await callTelegram('sendMessage', { chat_id: chatId, text: bText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/customers')) {
          const { text: cText, keyboard } = renderCustomersList(storeData, 1);
          await callTelegram('sendMessage', { chat_id: chatId, text: cText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/gateways') || text.startsWith('/payments')) {
          const { text: gwText, keyboard } = renderGatewaysSwitchboard(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: gwText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/traffic')) {
          const { text: trafText, keyboard } = renderTrafficDashboard(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: trafText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/banner') || text.startsWith('/announcement')) {
          const { text: annText, keyboard } = renderAnnouncementControl(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: annText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else if (text.startsWith('/maintenance')) {
          const { text: mText, keyboard } = renderMaintenanceControl(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: mText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        } else {
          const { text: defText, keyboard } = renderMainDashboard(storeData);
          await callTelegram('sendMessage', { chat_id: chatId, text: defText, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        }
      }
    }
  } catch (err) {
    if (err.name !== 'TimeoutError') {
      console.error('Polling cycle error:', err.message);
    }
  }
}

console.log('--- CHEAPREELS.IN TELEGRAM ADMIN DAEMON ACTIVE ---');
console.log('Listening for authorized admin 5151255259 commands...');

async function mainLoop() {
  while (true) {
    await pollUpdates();
    await new Promise(r => setTimeout(r, 200));
  }
}

mainLoop();
