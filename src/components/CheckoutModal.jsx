import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, QrCode, Copy, Check, ArrowRight, AlertCircle, Lock, MessageCircle, 
  ShoppingBag, CreditCard, ShieldCheck, Globe, Zap, ExternalLink, Sparkles,
  ChevronRight, RefreshCw, Smartphone, HelpCircle, CheckCircle2, RotateCcw,
  User, Mail, MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { calculateCartPricing } from '../utils/pricing';
import { validateUtr, checkOrderRateLimit, recordOrderSubmission, sanitizeInput } from '../utils/security';
import { initialBundles } from '../data/bundles';
import { calculateUsdTotal, isGtaItem, isInternationalVisitor, getBundleUsdPrice, getUserCurrency, getItemPriceDisplay, calculateLocalTotal } from '../utils/geoPricing';
import { t } from '../utils/i18n';
import BrandLogo from './BrandLogo';

// Comprehensive Indian States & International List for mandatory customer checkout details
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi (NCR)', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other / Union Territory',
  'International / Outside India'
];

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  items = [], 
  config = {}, 
  onPaymentSuccess,
  existingOrders = []
}) {
  // Prepopulate from saved customer details if available for seamless checkout
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('cheap_reels_cust_name') || ''; } catch (e) { return ''; }
  });
  const [whatsapp, setWhatsapp] = useState(() => {
    try { return localStorage.getItem('cheap_reels_cust_phone') || ''; } catch (e) { return ''; }
  });
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('cheap_reels_cust_email') || ''; } catch (e) { return ''; }
  });
  const [customerState, setCustomerState] = useState(() => {
    try { return localStorage.getItem('cheap_reels_cust_state') || ''; } catch (e) { return ''; }
  });
  const [city, setCity] = useState(() => {
    try { return localStorage.getItem('cheap_reels_cust_city') || ''; } catch (e) { return ''; }
  });
  const [utr, setUtr] = useState('');
  const [paymentApp, setPaymentApp] = useState('PhonePe');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1: Details & Order Review, 2: Payment Method, 3: Failed (if error)
  const [processingGateway, setProcessingGateway] = useState(null); // 'upi_qr' | 'razorpay' | 'cashfree' | 'paypal' | null
  const isProcessing = Boolean(processingGateway);
  const [error, setError] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  // Helper to safely cancel or reset any pending payment gateway processing
  const cancelOrResetProcessing = (reason = '') => {
    setProcessingGateway(null);
    if (reason) {
      console.log('[Checkout PG] Cleared processing spinner:', reason);
    }
  };

  // Determine available gateways based on admin setting (single vs multiple)
  const gatewayMode = config?.gatewayMode || 'single';
  const rawActive = config?.activeGateway || 'upi_qr';
  const isIntl = isInternationalVisitor();
  
  // Available list of gateways
  const availableGateways = useMemo(() => {
    // For international visitors, PayPal is strictly guaranteed as primary gateway
    if (isIntl) {
      return ['paypal'];
    }
    if (gatewayMode === 'single') {
      return [rawActive];
    }
    const enabled = config?.enabledGateways || ['upi_qr'];
    return enabled.length > 0 ? enabled : ['upi_qr'];
  }, [gatewayMode, rawActive, config?.enabledGateways, isIntl]);

  // Selected gateway in checkout
  const [selectedGateway, setSelectedGateway] = useState(() => {
    if (isInternationalVisitor()) return 'paypal';
    return availableGateways[0] || 'upi_qr';
  });

  // Switching gateways immediately clears any spinner or error
  const handleSelectGateway = (gw) => {
    cancelOrResetProcessing('switched gateway tab to ' + gw);
    setError('');
    setSelectedGateway(gw);
  };

  // Keep selectedGateway valid when availableGateways changes
  useEffect(() => {
    if (isIntl) {
      if (selectedGateway !== 'paypal') setSelectedGateway('paypal');
      return;
    }
    if (!availableGateways.includes(selectedGateway)) {
      setSelectedGateway(availableGateways[0] || 'upi_qr');
    }
  }, [availableGateways, selectedGateway, isIntl]);

  // 1. Safety auto-reset: no gateway should spin indefinitely (>15 seconds without user feedback)
  useEffect(() => {
    if (!processingGateway) return;
    const safetyTimer = setTimeout(() => {
      cancelOrResetProcessing('Safety timeout after 15s');
      setError('Payment window took too long to complete. You can retry or choose another payment method.');
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [processingGateway]);

  // 2. Window focus & postMessage listener to detect modal/popup cancellation
  useEffect(() => {
    const handleWindowMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (
          data &&
          (data.name === 'CF_MODAL_CLOSED' ||
           data.type === 'CASHFREE_MODAL_CLOSED' ||
           data.code === 'MODAL_CLOSED' ||
           data.event === 'close' ||
           data.status === 'CANCELLED' ||
           data.type === 'rzp_payment_cancel')
        ) {
          cancelOrResetProcessing('Gateway modal dismissed via window postMessage');
        }
      } catch (e) {}
    };

    const handleWindowFocus = () => {
      // When user returns to tab after closing a payment popup/modal
      if (processingGateway) {
        const cfFrame = document.querySelector('iframe[src*="cashfree"], iframe[name*="cashfree"], .cf-modal, #cf-checkout-modal');
        if (!cfFrame) {
          setTimeout(() => {
            cancelOrResetProcessing('Window refocused with no active modal iframe');
          }, 1200);
        }
      }
    };

    const handlePageShow = () => {
      // Restored from bfcache (e.g. user pressed back button from PayPal)
      cancelOrResetProcessing('Page restored from bfcache');
    };

    window.addEventListener('message', handleWindowMessage);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('message', handleWindowMessage);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [processingGateway]);

  if (!isOpen || !items || items.length === 0) return null;

  const { subtotal, discount, finalTotal, comboBadge, nextTierMessage } = calculateCartPricing(items);
  const total = finalTotal;

  // Calculate original value to highlight massive savings
  const originalTotal = items.reduce((acc, it) => acc + (Number(it.originalPrice) || Number(it.price) * 10 || 599), 0);
  const totalSavings = Math.max(0, originalTotal - total);

  const upiId = config?.upiId || config?.upiGateway?.upiId || '';
  const payeeName = config?.upiName || config?.upiGateway?.payeeName || config?.storeName || 'Cheap Reels';
  const rawSupport = (config?.whatsappNumber || '7017324978').replace(/\D/g, '');
  const supportPhone = rawSupport.length === 10 ? `91${rawSupport}` : (rawSupport || '917017324978');
  const supportEmail = config?.supportEmail || 'reelscheap@gmail.com';
  
  // PayPal International Dynamic Dollar Pricing (GTA 6: $19.99 USD, other items 1:1 USD)
  const calculatedUsd = calculateUsdTotal(items, total);
  const usdDisplay = calculatedUsd.toFixed(2).replace(/\.00$/, '');
  const usdAmount = Number(calculatedUsd).toFixed(2);
  const activeCurrency = getUserCurrency();
  const localTotal = calculateLocalTotal(items);
  const localTotalFormatted = activeCurrency.format(localTotal);
  const localOrigFormatted = activeCurrency.format(Math.round(localTotal * 2.5));
  const localDiscountFormatted = activeCurrency.format(Math.round(localTotal * 1.5));

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR&tn=${encodeURIComponent('CheapReelsBundle')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (कृपया अपना पूरा नाम दर्ज करें).');
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    const isIntl = isInternationalVisitor();
    if (isIntl) {
      if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 16) {
        setError('Please enter a valid phone/WhatsApp number with country code (7 to 16 digits).');
        return;
      }
    } else {
      if (!cleanPhone || (cleanPhone.length !== 10 && (cleanPhone.length < 10 || cleanPhone.length > 13))) {
        setError('Please enter a valid 10-digit Indian WhatsApp number (10 अंकों का व्हाट्सएप नंबर).');
        return;
      }
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (कृपया सही ईमेल आईडी दर्ज करें).');
      return;
    }

    if (!customerState) {
      setError('Please select your state (कृपया अपना राज्य चुनें).');
      return;
    }

    const cleanCity = (city || '').trim();
    if (!cleanCity || cleanCity.length < 2) {
      setError('Please enter your city (कृपया अपना शहर दर्ज करें).');
      return;
    }

    // Save customer details in localStorage for future convenience
    try {
      localStorage.setItem('cheap_reels_cust_name', cleanName);
      localStorage.setItem('cheap_reels_cust_phone', cleanPhone);
      localStorage.setItem('cheap_reels_cust_email', cleanEmail);
      localStorage.setItem('cheap_reels_cust_state', customerState);
      localStorage.setItem('cheap_reels_cust_city', cleanCity);
    } catch (err) {}

    setError('');
    setStep(2);
  };

  // 1. UPI QR Payment Verification & WhatsApp Dispatch
  const handleVerifyUpiPayment = () => {
    // Check order rate limit
    const rateCheck = checkOrderRateLimit();
    if (!rateCheck.allowed) {
      setError(rateCheck.error);
      return;
    }

    // Validate UTR strictly (12 digits, non-repeating, non-duplicate)
    const utrResult = validateUtr(utr, existingOrders);
    if (!utrResult.valid) {
      setError(utrResult.error);
      return;
    }

    const cleanUtr = utrResult.cleanUtr;
    setError('');
    setProcessingGateway('upi_qr');

    setTimeout(() => {
      setProcessingGateway(null);
      recordOrderSubmission();
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Attach verified Google Drive links from master vault
      const securedItems = items.map(it => {
        const master = initialBundles.find(b => b.id === it.id);
        const link = master?.driveLink || it.driveLink || 'https://drive.google.com';
        return {
          ...it,
          driveLink: link,
          links: master?.links || it.links || [{ label: 'Bundle Access Link', url: link }]
        };
      });

      // Clean WhatsApp message
      const bundleTitles = securedItems.map(it => `  • ${it.title} (₹${it.price})`).join('\n\n');
      const waText = 
        `🎉 *NEW ORDER PAYMENT VERIFICATION REQUEST* 🎉\n\n` +
        `Hello *${config?.storeName || 'Cheap Reels'}* Team,\n` +
        `I have completed payment for my reels order via UPI. Please verify my UTR and dispatch my Google Drive link.\n\n` +
        `══════════════════════\n` +
        `📋 *CUSTOMER & ORDER INFO*\n` +
        `══════════════════════\n` +
        `🆔 *Order ID:* #${orderId}\n` +
        `👤 *Name:* ${name || 'Customer'}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `📧 *Email:* ${email || 'Not provided'}\n` +
        `📍 *Location:* ${city ? `${city}, ` : ''}${customerState || 'India'}\n` +
        `💳 *Paid Via:* ${paymentApp} (UPI QR)\n` +
        `💰 *Amount Paid:* ₹${total}\n` +
        `🔢 *12-Digit UTR / Ref No:* ${cleanUtr}\n` +
        `⏰ *Time:* ${currentTime}\n\n` +
        `══════════════════════\n` +
        `🛒 *PURCHASED REELS BUNDLE(S):*\n` +
        `══════════════════════\n` +
        `${bundleTitles}\n\n` +
        `══════════════════════\n` +
        `_Please verify this UTR with your bank account and send me the official Google Drive folder link. Thank you!_`;

      const whatsappRedirectUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(waText)}`;

      const order = {
        id: orderId,
        name: (name || 'Customer').trim(),
        whatsapp,
        email: (email || supportEmail).trim(),
        state: customerState || '',
        city: (city || '').trim(),
        total,
        items: securedItems,
        gateway: 'upi_qr',
        paymentApp: paymentApp,
        utr: cleanUtr,
        status: 'PENDING_VERIFICATION',
        driveLinkUnlocked: false,
        whatsappUrl: whatsappRedirectUrl,
        date: new Date().toISOString()
      };

      onPaymentSuccess(order);
    }, 1000);
  };

  // 2. Razorpay Payment Handler
  const handleRazorpayPayment = () => {
    setProcessingGateway('razorpay');
    setError('');

    const keyId = config?.razorpay?.keyId;

    const completeRazorpayOrder = (paymentId) => {
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const order = {
        id: orderId,
        name: (name || 'Customer').trim(),
        whatsapp,
        email: (email || supportEmail).trim(),
        state: customerState || '',
        city: (city || '').trim(),
        total,
        items,
        gateway: 'Razorpay',
        paymentApp: 'Razorpay PG',
        paymentId: paymentId || ('pay_' + Math.random().toString(36).substring(2, 12)),
        utr: paymentId || ('RZP-' + Math.floor(10000000 + Math.random() * 90000000)),
        status: 'VERIFIED',
        driveLinkUnlocked: true,
        date: new Date().toISOString()
      };
      setProcessingGateway(null);
      onPaymentSuccess(order);
    };

    if (keyId) {
      const loadScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      loadScript().then((loaded) => {
        if (!loaded || !window.Razorpay) {
          completeRazorpayOrder();
          return;
        }

        try {
          const options = {
            key: keyId,
            amount: total * 100, // in paise
            currency: 'INR',
            name: config?.storeName || 'Cheap Reels',
            description: items.map(i => i.title).join(', ').substring(0, 100),
            image: config?.logo || '/brand-icon.png',
            prefill: {
              name: name || 'Customer',
              email: email || 'customer@cheapreels.com',
              contact: whatsapp
            },
            theme: {
              color: '#7C3AED'
            },
            handler: function (response) {
              completeRazorpayOrder(response.razorpay_payment_id);
            },
            modal: {
              ondismiss: function () {
                setProcessingGateway(null);
                setFailedReason('Payment was cancelled before authorization was complete.');
                setError('Payment was cancelled. You can retry or choose another payment method.');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            setProcessingGateway(null);
            setFailedReason(response.error?.description || 'Your bank or payment app declined the transaction.');
            setError(response.error?.description || 'Payment failed or was declined.');
          });
          rzp.open();
        } catch (err) {
          setProcessingGateway(null);
          setFailedReason('Unable to open payment gateway. Please retry or choose UPI QR.');
          setError('Unable to open Razorpay gateway. Please retry or choose UPI QR.');
        }
      }).catch(() => {
        setProcessingGateway(null);
        setError('Failed to load Razorpay. Please retry or choose UPI QR.');
      });
    } else {
      // Simulation / Test mode
      setTimeout(() => {
        completeRazorpayOrder();
      }, 1200);
    }
  };

  // Helper to dynamically load Cashfree Web Checkout SDK v3
  const loadCashfreeSdk = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Cashfree) {
        resolve(window.Cashfree);
        return;
      }
      let attempts = 0;
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Cashfree) {
          clearInterval(interval);
          resolve(window.Cashfree);
        } else if (attempts >= 25) { // 2.5 seconds
          clearInterval(interval);
          const existingScript = document.querySelector('script[src*="cashfree"]');
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            script.onload = () => {
              if (window.Cashfree) resolve(window.Cashfree);
              else reject(new Error('Cashfree SDK loaded but could not initialize.'));
            };
            script.onerror = () => reject(new Error('Unable to connect to Cashfree payment gateway SDK. Please check your internet connection or ad blocker.'));
            document.head.appendChild(script);
          } else {
            reject(new Error('Unable to connect to Cashfree payment gateway SDK. Please check your internet connection or ad blocker.'));
          }
        }
        attempts++;
      }, 100);
    });
  };

  // 3. Cashfree Payment Handler with Instant Google Drive Unlock & Pre-Storage
  const handleCashfreePayment = async () => {
    const cleanPhone = whatsapp.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number to receive your Google Drive access links');
      return;
    }

    setProcessingGateway('cashfree');
    setError('');

    const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
    const customerName = (name || 'Customer').trim();
    const customerEmail = (email || supportEmail || 'reelscheap@gmail.com').trim();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.cheapreels.in';
    const returnUrl = `${currentOrigin}/?cf_order_id=${encodeURIComponent(orderId)}`;

    // Attach verified Google Drive links from master vault
    const securedItems = items.map(it => {
      const master = initialBundles.find(b => b.id === it.id);
      const link = master?.driveLink || it.driveLink || 'https://drive.google.com';
      return {
        ...it,
        driveLink: link,
        links: master?.links || it.links || [{ label: 'Bundle Access Link', url: link }]
      };
    });

    const pendingOrder = {
      id: orderId,
      name: customerName,
      whatsapp: cleanPhone,
      email: customerEmail,
      state: customerState || '',
      city: (city || '').trim(),
      total,
      items: securedItems,
      gateway: 'Cashfree',
      paymentApp: 'Cashfree PG',
      paymentId: orderId,
      utr: orderId,
      status: 'PENDING_VERIFICATION',
      driveLinkUnlocked: false,
      date: new Date().toISOString()
    };

    // Store pending order in localStorage BEFORE checkout so mobile redirects instantly recover everything
    try {
      localStorage.setItem('cheap_reels_pending_cf_order', JSON.stringify(pendingOrder));
      const existingOrders = JSON.parse(localStorage.getItem('cheap_reels_orders') || '[]');
      localStorage.setItem('cheap_reels_orders', JSON.stringify([pendingOrder, ...existingOrders.filter(o => o.id !== orderId)]));
    } catch (e) {}

    try {
      // 1. Create order on Cashfree serverless backend
      const res = await fetch('/api/cashfree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: total,
          customerName,
          customerEmail,
          customerPhone: cleanPhone,
          customerState: customerState || '',
          customerCity: (city || '').trim(),
          returnUrl,
          items: securedItems.map(i => ({ id: i.id, title: i.title, price: i.price, driveLink: i.driveLink }))
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success || !data.payment_session_id) {
        throw new Error(data?.error || 'Failed to initialize Cashfree payment session');
      }

      // 2. Load SDK and trigger Cashfree Checkout Modal / Redirect
      const CashfreeSdk = await loadCashfreeSdk();
      const isProd = config?.cashfree?.environment !== 'sandbox';
      const cashfree = CashfreeSdk({ mode: isProd ? 'production' : 'sandbox' });
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: isMobile ? '_self' : '_modal'
      }).then((result) => {
        setProcessingGateway(null);
        if (result && result.error) {
          console.warn('Cashfree payment notice:', result.error);
          if (result.error.code !== 'MODAL_CLOSED') {
            setError(result.error.message || 'Cashfree payment was cancelled or incomplete.');
          }
        } else if (result && result.paymentDetails) {
          // Cashfree confirmed payment inside modal
          const verifiedOrder = {
            ...pendingOrder,
            status: 'VERIFIED',
            driveLinkUnlocked: true,
            paymentId: result.paymentDetails?.paymentMessage || ('CF-' + Date.now().toString(36).toUpperCase()),
            utr: result.paymentDetails?.referenceId || orderId,
            date: new Date().toISOString()
          };
          try {
            localStorage.removeItem('cheap_reels_pending_cf_order');
          } catch (e) {}
          onPaymentSuccess(verifiedOrder);
        }
      }).catch((checkoutErr) => {
        console.warn('Cashfree modal checkout error:', checkoutErr);
        setProcessingGateway(null);
        setError('Cashfree payment modal was closed or interrupted. You can retry or choose another method.');
      }).finally(() => {
        setProcessingGateway(null);
      });
    } catch (err) {
      console.error('Cashfree PG error:', err);
      setProcessingGateway(null);
      setError(err.message || 'Cashfree gateway is temporarily busy. You can also pay via Direct UPI QR.');
    }
  };

  // 4. PayPal Payment Handler (Enterprise Live Multi-Currency Integration)
  const handlePaypalPayment = async () => {
    setProcessingGateway('paypal');
    setError('');

    const cleanName = (name || 'Customer').trim();
    const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, '') : '';
    const cleanEmail = (email || supportEmail || 'reelscheap@gmail.com').trim();
    const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);

    // Attach verified Google Drive links from master vault
    const securedItems = items.map(it => {
      const master = initialBundles.find(b => b.id === it.id);
      const link = master?.driveLink || it.driveLink || 'https://drive.google.com';
      return {
        ...it,
        driveLink: link
      };
    });

    const pendingOrder = {
      id: orderId,
      name: cleanName,
      whatsapp: cleanPhone,
      email: cleanEmail,
      state: customerState || '',
      city: (city || '').trim(),
      total,
      usdAmount,
      items: securedItems,
      gateway: 'PayPal',
      paymentApp: `PayPal ($${usdDisplay} USD)`,
      paymentId: orderId,
      utr: orderId,
      status: 'PENDING_VERIFICATION',
      driveLinkUnlocked: false,
      date: new Date().toISOString()
    };

    // Save pending order before redirect for instantaneous fulfillment upon return
    try {
      localStorage.setItem('cheap_reels_pending_paypal_order', JSON.stringify(pendingOrder));
      const existingOrders = JSON.parse(localStorage.getItem('cheap_reels_orders') || '[]');
      localStorage.setItem('cheap_reels_orders', JSON.stringify([pendingOrder, ...existingOrders.filter(o => o.id !== orderId)]));
    } catch (e) {}

    try {
      const res = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          orderId,
          usdAmount,
          inrTotal: total,
          customerName: cleanName,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          customerState: customerState || '',
          customerCity: (city || '').trim(),
          items: securedItems.map(i => ({ id: i.id, title: i.title, price: i.price, driveLink: i.driveLink })),
          returnUrl: `${window.location.origin}/?paypal_return=true&order_id=${orderId}`,
          cancelUrl: `${window.location.origin}/?paypal_cancel=true`
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success || !data.approveUrl) {
        throw new Error(data?.error || 'Failed to initiate PayPal checkout session');
      }

      // Redirect customer to official PayPal live checkout page
      window.location.href = data.approveUrl;
    } catch (err) {
      console.warn('PayPal live API connection notice:', err);
      setProcessingGateway(null);
      setError(err.message || 'PayPal connection was cancelled or unavailable. Please retry or choose UPI QR.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 my-auto text-slate-900 transition-all">
        
        {/* ==================================================== */}
        {/* TOP MODAL HEADER WITH BRAND & 256-BIT ENCRYPTION   */}
        {/* ==================================================== */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <BrandLogo variant="light" size="sm" alt={config?.storeName} />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition cursor-pointer shadow-2xs"
            title="Close Checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* STEPPER PROGRESS INDICATOR                           */}
        {/* ==================================================== */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              1
            </span>
            <span className={`font-bold text-[11px] ${step === 1 ? 'text-purple-700' : 'text-slate-600'}`}>
              Details & Order
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              2
            </span>
            <span className={`font-bold text-[11px] ${step === 2 ? 'text-purple-700' : 'text-slate-600'}`}>
              Pay & Authorize
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 3 ? 'bg-rose-500 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              3
            </span>
            <span className={`font-bold text-[11px] ${step === 3 ? 'text-rose-600' : 'text-slate-500'}`}>
              {step === 3 ? 'Failed / Retry' : 'Confirmation'}
            </span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MODAL BODY (STEP 1 / STEP 2 / STEP 3)                */}
        {/* ==================================================== */}
        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
          
          {/* STEP 1: CUSTOMER DETAILS & ORDER SUMMARY */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Summary Breakdown Box */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Order Summary ({items.length} Bundle{items.length > 1 ? 's' : ''})
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {items.reduce((acc, it) => acc + (typeof it.clipCount === 'number' ? it.clipCount : (parseInt(String(it.clipCount || '').replace(/\D/g, ''), 10) || 1000)), 0).toLocaleString()}+ Reels
                  </span>
                </div>

                {/* Items List Preview */}
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 truncate">{(it.title || '').replace(/&amp;/g, '&')}</p>
                        <p className="text-[10px] text-slate-500">
                          {typeof it.clipCount === 'string' && it.clipCount.includes('Reel') 
                            ? it.clipCount 
                            : `${(typeof it.clipCount === 'number' ? it.clipCount : (parseInt(String(it.clipCount || '').replace(/\D/g, ''), 10) || 1000)).toLocaleString()}+ Clips`} • 1080p Full HD
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {isIntl ? (
                          <span className="font-black text-purple-700 font-mono">{getItemPriceDisplay(it).formattedPrice}</span>
                        ) : (
                          <>
                            <span className="font-black text-slate-900">₹{it.price}</span>
                            {it.originalPrice && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                ₹{it.originalPrice}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Pricing Table */}
                <div className="pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('originalValue')}:</span>
                    <span className="line-through text-slate-400 font-medium">
                      {isIntl ? localOrigFormatted : `₹${originalTotal}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t('promotionalDiscount')}:</span>
                    <span>
                      {isIntl ? `-${localDiscountFormatted}` : `-₹${Math.max(0, originalTotal - subtotal)}`}
                    </span>
                  </div>

                  {discount > 0 && !isIntl && (
                    <div className="flex justify-between items-center text-purple-700 font-bold bg-purple-50 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        {comboBadge || 'Combo Discount'}
                      </span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>{t('delivery')}:</span>
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">
                      {isIntl ? t('freeDelivery') : 'FREE (₹0)'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST & Platform Charges:</span>
                    <span className="font-bold text-slate-700 uppercase text-[10px]">INCLUDED</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-300/80 font-black text-slate-900">
                    <div>
                      <span className="text-sm">{t('totalPayable')}</span>
                      <span className="block text-[10px] font-bold text-emerald-600">
                        {isIntl ? '🎉 Direct PayPal Checkout' : `🎉 You Save ₹${totalSavings} Total!`}
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl text-purple-700 font-mono">
                      {isIntl ? localTotalFormatted : `₹${total}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details Form (All Fields Required) */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>{isIntl ? t('step1Title') : 'Customer Details / ग्राहक की जानकारी'}</span>
                  </span>
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    * All fields required
                  </span>
                </div>

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isIntl ? t('fullName') : 'Full Name / आपका पूरा नाम'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name (e.g. Rahul Sharma)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                {/* 2. WhatsApp Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isIntl ? t('whatsapp') : 'WhatsApp Mobile Number / व्हाट्सएप नंबर'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl shadow-2xs overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-transparent">
                    <span className="inline-flex items-center px-3 bg-slate-100 text-slate-700 font-bold text-xs border-r border-slate-300 select-none">
                      {isInternationalVisitor() ? '🌍 Int\'l' : '🇮🇳 +91'}
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={isInternationalVisitor() ? 16 : 10}
                      placeholder={isInternationalVisitor() ? 'e.g. 12025550192 (with country code)' : 'Enter 10-digit number (e.g. 9876543210)'}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50/50 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Google Drive folder will be sent to this WhatsApp number right after payment.
                  </p>
                </div>

                {/* 3. Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isIntl ? t('email') : 'Email Address / ईमेल आईडी'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email (e.g. rahul@gmail.com)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Order invoice & backup Google Drive link will be sent to this email.
                  </p>
                </div>

                {/* 4. State & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isIntl ? t('stateLabel') : 'State / राज्य'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        required
                        value={customerState}
                        onChange={(e) => setCustomerState(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                      >
                        <option value="">{isInternationalVisitor() ? 'Select State / Country' : 'Select State'}</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isInternationalVisitor() ? 'City / Town' : 'City / शहर'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City (e.g. Mumbai, Delhi, Jaipur)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-2 py-2 text-center text-[10px] text-slate-600 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span className="font-bold block">Instant Delivery</span>
                  <span className="text-[9px] text-slate-400">Within 5 Seconds</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <span className="font-bold block">No Watermark</span>
                  <span className="text-[9px] text-slate-400">100% Full HD 1080p</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Lock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="font-bold block">Secure Checkout</span>
                  <span className="text-[9px] text-slate-400">{isIntl ? 'Encrypted PayPal / Card' : 'Encrypted UPI/PG'}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
              >
                <span>{isIntl ? `${t('continueToPayPal')} (${localTotalFormatted})` : `${t('continueToPayment')} (₹${total})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD INTERFACE */}
          {step === 2 && (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Total Payable Reminder Banner with Full Customer Details */}
              <div className={`p-3.5 rounded-2xl space-y-2 border transition-colors ${
                selectedGateway === 'paypal'
                  ? 'bg-sky-50/80 border-sky-200'
                  : 'bg-purple-50/70 border-purple-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block">Total Payable:</span>
                    {selectedGateway === 'paypal' ? (
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-black text-sky-700 font-mono">{localTotalFormatted}</span>
                        {activeCurrency.code !== 'USD' && (
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-full border border-sky-300/60">
                            ≈ ${usdDisplay} USD via PayPal
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-black text-purple-900">₹{total}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 block">WhatsApp:</span>
                    <span className="text-xs font-black text-slate-800">{isIntl ? whatsapp : `+91 ${whatsapp}`}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="truncate max-w-[200px]"><b>Name:</b> {name}</span>
                  <span className="truncate max-w-[220px]"><b>Email:</b> {email}</span>
                </div>
                {(city || customerState) && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    <span>{[city, customerState].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* GATEWAYS SELECTION (IF MULTIPLE ENABLED) */}
              {availableGateways.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Choose Payment Gateway:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableGateways.includes('upi_qr') && (
                      <button
                        type="button"
                        onClick={() => handleSelectGateway('upi_qr')}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          selectedGateway === 'upi_qr'
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">UPI QR Code</p>
                          <p className="text-[10px] text-slate-500 font-medium">0% Fee • GPay, PhonePe, Paytm</p>
                        </div>
                      </button>
                    )}

                    {availableGateways.includes('razorpay') && (
                      <button
                        type="button"
                        onClick={() => handleSelectGateway('razorpay')}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          selectedGateway === 'razorpay'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">Razorpay</p>
                          <p className="text-[10px] text-slate-500 font-medium">Cards, Netbanking, UPI</p>
                        </div>
                      </button>
                    )}

                    {availableGateways.includes('cashfree') && (
                      <button
                        type="button"
                        onClick={() => handleSelectGateway('cashfree')}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          selectedGateway === 'cashfree'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">Cashfree</p>
                          <p className="text-[10px] text-slate-500 font-medium">Fast PG Checkout</p>
                        </div>
                      </button>
                    )}

                    {availableGateways.includes('paypal') && (
                      <button
                        type="button"
                        onClick={() => handleSelectGateway('paypal')}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          selectedGateway === 'paypal'
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Globe className="w-5 h-5 text-sky-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">PayPal</p>
                          <p className="text-[10px] text-sky-700 font-bold font-mono">${usdDisplay} USD</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 1: DIRECT UPI QR CODE */}
              {selectedGateway === 'upi_qr' && (
                <div className="space-y-4">
                  {/* QR Code Container */}
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 text-center space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                      Scan QR with any UPI App
                    </span>

                    <div className="bg-white p-3.5 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-sm border border-slate-200">
                      <QRCodeSVG
                        value={upiUri}
                        size={168}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Copy UPI ID Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 shadow-2xs">
                      <span>UPI ID: {upiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 text-purple-700 hover:text-purple-900 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* 1-Tap Mobile UPI App Triggers */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Or Tap Directly To Pay (Mobile Apps):
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <a
                          href={`phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 text-white text-[11px] font-bold shadow-xs hover:bg-purple-800 transition"
                        >
                          PhonePe
                        </a>
                        <a
                          href={`gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-300 text-[11px] font-bold shadow-xs hover:bg-slate-50 transition"
                        >
                          Google Pay
                        </a>
                        <a
                          href={`paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-[11px] font-bold shadow-xs hover:bg-sky-600 transition"
                        >
                          Paytm
                        </a>
                        <a
                          href={upiUri}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xs hover:bg-black transition"
                        >
                          Other UPI
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Which UPI App dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Which UPI App did you pay from?
                    </label>
                    <select
                      value={paymentApp}
                      onChange={(e) => setPaymentApp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="PhonePe">PhonePe</option>
                      <option value="Google Pay">Google Pay (GPay)</option>
                      <option value="Paytm">Paytm</option>
                      <option value="BHIM UPI">BHIM UPI</option>
                      <option value="Cred">CRED UPI</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                      <option value="Other Bank App">Other Bank UPI App</option>
                    </select>
                  </div>

                  {/* 12-Digit UTR Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        12-Digit UTR / UPI Reference Number <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUtrHelp(!showUtrHelp)}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Where to find UTR?</span>
                      </button>
                    </div>

                    {showUtrHelp && (
                      <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1 mb-2 animate-fadeIn">
                        <p className="font-bold">How to find your 12-digit UTR:</p>
                        <p>1. Open your payment confirmation screen in PhonePe / GPay / Paytm.</p>
                        <p>2. Look for <strong>"UTR"</strong>, <strong>"UPI Ref ID"</strong>, or <strong>"Transaction Reference"</strong>.</p>
                        <p>3. It is always an exact 12-digit number (e.g. <code>423190871234</code>).</p>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="Enter 12-digit UTR (e.g. 432198765432)"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          utr.length === 12 
                            ? 'border-emerald-500 text-emerald-900 focus:ring-emerald-500 bg-emerald-50/30' 
                            : 'border-slate-300 text-slate-900 focus:ring-purple-600'
                        }`}
                      />
                      <span className={`absolute right-3 top-2.5 text-[10px] font-bold ${
                        utr.length === 12 ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {utr.length}/12
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyUpiPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    {processingGateway === 'upi_qr' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying UTR Reference...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Submit UTR (₹{total})</span>
                      </>
                    )}
                  </button>

                  {processingGateway === 'upi_qr' && (
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => cancelOrResetProcessing('User cancelled UPI')}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1 py-1 px-3 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Verification</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: RAZORPAY */}
              {selectedGateway === 'razorpay' && (
                <div className="p-5 bg-blue-50/60 border border-blue-200/90 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Pay via Razorpay Secure Gateway
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Supports Debit Cards, Credit Cards, Netbanking (50+ Banks), UPI Apps, and Mobile Wallets with instant automated verification.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
                    <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">Visa / Mastercard</span>
                    <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">RuPay</span>
                    <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">UPI / QR</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {processingGateway === 'razorpay' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{total} via Razorpay</span>
                      </>
                    )}
                  </button>

                  {processingGateway === 'razorpay' && (
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => cancelOrResetProcessing('User cancelled Razorpay')}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1 py-1 px-3 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel & Choose Another Method</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 3: CASHFREE */}
              {selectedGateway === 'cashfree' && (
                <div className="p-5 bg-emerald-50/60 border border-emerald-200/90 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Pay via Cashfree Payments
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Fast 1-click checkout with Indian cards, UPI autopay, and netbanking.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCashfreePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {processingGateway === 'cashfree' ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting to Cashfree...</span>
                      </div>
                    ) : (
                      <span>Proceed to Cashfree (₹{total})</span>
                    )}
                  </button>

                  {processingGateway === 'cashfree' && (
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => cancelOrResetProcessing('User cancelled Cashfree')}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1 py-1 px-3 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel & Choose Another Method</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 4: PAYPAL */}
              {selectedGateway === 'paypal' && (
                <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      PayPal International Checkout
                    </h4>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-sky-700 font-mono">${usdDisplay} USD</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      International Customers: <strong className="text-slate-800">${usdDisplay} USD</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePaypalPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#0070BA] hover:bg-[#003087] text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {processingGateway === 'paypal' ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting to PayPal...</span>
                      </div>
                    ) : (
                      <span>Pay ${usdDisplay} USD via PayPal</span>
                    )}
                  </button>

                  {processingGateway === 'paypal' && (
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => cancelOrResetProcessing('User cancelled PayPal')}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1 py-1 px-3 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel & Choose Another Method</span>
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    🔒 Official 256-bit encrypted checkout. Supports PayPal balance, Visa, Mastercard, American Express &amp; International Cards.
                  </p>
                </div>
              )}

              {/* Back to Step 1 Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Order & Customer Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT FAILED SCREEN */}
          {step === 3 && (
            <div className="py-6 px-4 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-md">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Payment Could Not Be Completed
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {failedReason || 'The payment session was cancelled or declined by your bank/gateway. Don’t worry, no funds were deducted.'}
                </p>
              </div>

              {/* Preserved Order Details */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between text-slate-500">
                  <span>Preserved Cart Items:</span>
                  <span className="font-bold text-slate-800">{items.length} Bundles</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Amount:</span>
                  <span className="font-bold text-purple-700">₹{total}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Customer Phone:</span>
                  <span className="font-bold text-slate-800">+91 {whatsapp}</span>
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    cancelOrResetProcessing('Retry from failed screen');
                    setError('');
                    setStep(2); // Safely return to Payment selection
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Payment (Choose UPI or Card)</span>
                </button>

                <a
                  href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello Cheap Reels Support, I need help with checkout for amount ${isIntl ? `$${calculatedUsd} USD` : `₹${total}`}. My WhatsApp is ${whatsapp}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Contact WhatsApp Support</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
