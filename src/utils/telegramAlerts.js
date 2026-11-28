/**
 * Real-time Telegram Bot Notification Service for CheapReels.in
 * Sends instant alerts for:
 * 1. New Orders & Customer Sales with full payment & contact details
 * 2. High-Intent Checkout visits (Live Leads)
 * 3. Connection Test Messages
 * 
 * Runs asynchronously via fetch with zero main-thread blocking.
 */

import { getBundleUsdPrice } from './geoPricing';

const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getFormattedTime = () => {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Low-level Telegram API dispatcher
 */
export const sendTelegramMessage = async (botToken, chatId, text) => {
  if (!botToken || !chatId) {
    return { success: false, error: 'Bot Token or Chat ID is missing' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const endpoint = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      // Use keepalive if supported to ensure completion even during navigation
      keepalive: true,
      signal: AbortSignal.timeout(8000)
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true, result: data.result };
    } else {
      return { success: false, error: data.description || 'Telegram API returned an error' };
    }
  } catch (err) {
    console.warn('[Telegram Alerts] Dispatch warning:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Format and send a New Order / Sale Alert
 */
export const sendTelegramOrderAlert = async (order, config) => {
  const tgConfig = config?.telegramAlerts;
  if (!tgConfig || !tgConfig.enabled || tgConfig.notifyOnSale === false) return;
  if (!tgConfig.botToken || !tgConfig.chatId) return;

  const customerName = escapeHtml(order.customerName || order.name || 'Direct Customer');
  const customerPhone = escapeHtml(order.customerPhone || order.whatsapp || 'Not provided');
  const customerEmail = escapeHtml(order.customerEmail || order.email || 'Not provided');
  const customerLocation = escapeHtml([order.city, order.state].filter(Boolean).join(', '));
  const totalAmount = order.amount !== undefined ? order.amount : (order.total || 49);

  let paymentMethodLabel = '📱 Direct UPI QR';
  if (order.gateway) {
    if (order.gateway.toLowerCase().includes('cashfree')) {
      paymentMethodLabel = '⚡ Cashfree Auto Gateway';
    } else if (order.gateway.toLowerCase().includes('razorpay')) {
      paymentMethodLabel = '💳 Razorpay PG';
    } else if (order.gateway.toLowerCase().includes('paypal')) {
      paymentMethodLabel = '🌐 PayPal International';
    } else if (order.paymentApp) {
      paymentMethodLabel = `📱 UPI (${escapeHtml(order.paymentApp)})`;
    }
  } else if (order.paymentMethod) {
    paymentMethodLabel = escapeHtml(order.paymentMethod);
  }

  const isPaypalOrder = order.gateway === 'PayPal' || Boolean(order.usdAmount);
  const itemsList = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((it, idx) => {
        const isGta = String(it.id || '').includes('gta') || String(it.title || '').toLowerCase().includes('gta') || it.id === 'bundle-127';
        const priceTag = isPaypalOrder ? (isGta ? '$19.99 USD' : `$${getBundleUsdPrice(it)} USD`) : `₹${it.price || 49}`;
        return `  ${idx + 1}. <b>${escapeHtml(it.title || 'Reel Bundle')}</b> (${priceTag})`;
      }).join('\n')
    : `  1. <b>${escapeHtml(order.bundleTitle || 'HD Reels Bundle')}</b> (${isPaypalOrder ? `$${order.usdAmount || 19.99} USD` : `₹${totalAmount}`})`;

  const utrOrTxn = escapeHtml(order.utr || order.transactionId || order.paymentId || order.referenceId || 'Auto Verified');

  const message = [
    `💰 <b>NEW SALE RECEIVED — CHEAPREELS.IN</b> 💰`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 <b>Order ID:</b> <code>#${escapeHtml(order.id)}</code>`,
    `💵 <b>Total Amount:</b> <b>${order.usdAmount ? `$${order.usdAmount} USD (₹${totalAmount})` : `₹${totalAmount}`}</b>`,
    `💳 <b>Payment Mode:</b> ${paymentMethodLabel}`,
    `🔢 <b>UTR / Txn Ref:</b> <code>${utrOrTxn}</code>`,
    ``,
    `👤 <b>Customer Details:</b>`,
    `• <b>Name:</b> ${customerName}`,
    `• <b>WhatsApp / Phone:</b> <code>${customerPhone}</code>`,
    `• <b>Email:</b> ${customerEmail}`,
    customerLocation ? `• <b>Location:</b> ${customerLocation}` : null,
    ``,
    `🛍️ <b>Purchased Bundles:</b>`,
    itemsList,
    ``,
    `⏰ <b>Date & Time:</b> ${getFormattedTime()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>Access link delivery dispatched to customer!</i>`
  ].filter(line => line !== null).join('\n');

  return sendTelegramMessage(tgConfig.botToken, tgConfig.chatId, message);
};

// Throttle intent alerts so opening checkout multiple times doesn't spam
let lastCheckoutAlertTime = 0;
let lastAlertBundleId = '';

/**
 * Format and send a Checkout Intent Alert (Lead Notification)
 */
export const sendTelegramCheckoutIntentAlert = async ({ items, totalAmount, visitorIp, isMobile, config }) => {
  const tgConfig = config?.telegramAlerts;
  if (!tgConfig || !tgConfig.enabled || tgConfig.notifyOnCheckout === false) return;
  if (!tgConfig.botToken || !tgConfig.chatId) return;

  const now = Date.now();
  const currentBundleKey = (items || []).map(i => i.id).join('-');

  // Throttle: don't send duplicate alerts within 45 seconds for same items
  if (currentBundleKey === lastAlertBundleId && (now - lastCheckoutAlertTime) < 45000) {
    return;
  }
  lastCheckoutAlertTime = now;
  lastAlertBundleId = currentBundleKey;

  const bundleNames = Array.isArray(items) && items.length > 0
    ? items.map(i => escapeHtml(i.title || 'Reel Bundle')).join(', ')
    : 'Featured HD Reels Bundle';

  const deviceText = isMobile ? '📱 Mobile Phone' : '💻 Desktop PC';

  const message = [
    `👀 <b>CUSTOMER ON CHECKOUT PAGE!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ <b>Reel Bundle:</b> ${bundleNames}`,
    `💵 <b>Cart Value:</b> <b>₹${totalAmount}</b>`,
    `📱 <b>Device:</b> ${deviceText}`,
    `🌐 <b>Visitor IP:</b> <code>${escapeHtml(visitorIp || 'Active Visitor')}</code>`,
    `⏰ <b>Time:</b> ${getFormattedTime()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👉 <i>Customer is currently choosing payment method (UPI / Gateway)...</i>`
  ].join('\n');

  return sendTelegramMessage(tgConfig.botToken, tgConfig.chatId, message);
};

/**
 * Send a Test Notification from Admin Panel to verify Bot Setup
 */
export const sendTelegramTestAlert = async (botToken, chatId, storeName = 'Cheap Reels') => {
  const message = [
    `🚀 <b>TELEGRAM NOTIFICATIONS ACTIVE!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ <b>Connection Status:</b> Successfully Connected!`,
    `🏪 <b>Store:</b> ${storeName} (cheapreels.in)`,
    `⏰ <b>Test Time:</b> ${getFormattedTime()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>Whenever a customer purchases or enters checkout, instant alerts with full customer name, phone, and payment details will arrive here in real time!</i>`
  ].join('\n');

  return sendTelegramMessage(botToken, chatId, message);
};
