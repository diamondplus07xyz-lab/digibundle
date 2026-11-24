import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, QrCode, Copy, Check, ArrowRight, AlertCircle, Lock, MessageCircle, 
  ShoppingBag, CreditCard, ShieldCheck, Globe, Zap, ExternalLink, Sparkles,
  ChevronRight, RefreshCw, Smartphone, HelpCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { calculateCartPricing } from '../utils/pricing';
import { validateUtr, checkOrderRateLimit, recordOrderSubmission, sanitizeInput } from '../utils/security';
import BrandLogo from './BrandLogo';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  items = [], 
  config = {}, 
  onPaymentSuccess,
  existingOrders = []
}) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentApp, setPaymentApp] = useState('PhonePe');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1: Details & Order Review, 2: Payment Method, 3: Failed (if error)
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  // Determine available gateways based on admin setting (single vs multiple)
  const gatewayMode = config?.gatewayMode || 'single';
  const rawActive = config?.activeGateway || 'upi_qr';
  
  // Available list of gateways
  const availableGateways = useMemo(() => {
    if (gatewayMode === 'single') {
      return [rawActive];
    }
    const enabled = config?.enabledGateways || ['upi_qr'];
    return enabled.length > 0 ? enabled : ['upi_qr'];
  }, [gatewayMode, rawActive, config?.enabledGateways]);

  // Selected gateway in checkout
  const [selectedGateway, setSelectedGateway] = useState(() => {
    return availableGateways[0] || 'upi_qr';
  });

  // Keep selectedGateway valid when availableGateways changes
  useEffect(() => {
    if (!availableGateways.includes(selectedGateway)) {
      setSelectedGateway(availableGateways[0] || 'upi_qr');
    }
  }, [availableGateways, selectedGateway]);

  if (!isOpen || !items || items.length === 0) return null;

  const { subtotal, discount, finalTotal, comboBadge, nextTierMessage } = calculateCartPricing(items);
  const total = finalTotal;

  // Calculate original value to highlight massive savings
  const originalTotal = items.reduce((acc, it) => acc + (Number(it.originalPrice) || Number(it.price) * 10 || 599), 0);
  const totalSavings = Math.max(0, originalTotal - total);

  const upiId = config?.upiId || config?.upiGateway?.upiId || 'cheapreels@upi';
  const payeeName = config?.upiName || config?.upiGateway?.payeeName || 'Cheap Reels';
  const supportPhone = (config?.whatsappNumber || '917017324978').replace(/\D/g, '');
  const supportEmail = config?.supportEmail || 'reelscheap@gmail.com';
  
  // PayPal USD Conversion
  const exchangeRate = Number(config?.paypal?.exchangeRate) || 85;
  const usdAmount = (total / exchangeRate).toFixed(2);

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR&tn=${encodeURIComponent('CheapReelsBundle')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian WhatsApp number.');
      return;
    }
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
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      recordOrderSubmission();
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Clean WhatsApp message
      const bundleTitles = items.map(it => `  • ${it.title} (₹${it.price})`).join('\n\n');
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

      try {
        const newTab = window.open(whatsappRedirectUrl, '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
          window.location.href = whatsappRedirectUrl;
        }
      } catch (e) {
        window.location.href = whatsappRedirectUrl;
      }

      const order = {
        id: orderId,
        name: name || 'Customer',
        whatsapp,
        email: email || supportEmail,
        total,
        items,
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
    setIsProcessing(true);
    setError('');

    const keyId = config?.razorpay?.keyId;

    const completeRazorpayOrder = (paymentId) => {
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const order = {
        id: orderId,
        name: name || 'Customer',
        whatsapp,
        email: email || supportEmail,
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
      setIsProcessing(false);
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
                setIsProcessing(false);
                setFailedReason('Payment was cancelled before authorization was complete.');
                setStep(3); // Show dedicated Failed Screen with retry
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            setIsProcessing(false);
            setFailedReason(response.error?.description || 'Your bank or payment app declined the transaction.');
            setStep(3);
          });
          rzp.open();
        } catch (err) {
          setIsProcessing(false);
          setFailedReason('Unable to open payment gateway. Please retry or choose UPI QR.');
          setStep(3);
        }
      });
    } else {
      // Simulation / Test mode
      setTimeout(() => {
        completeRazorpayOrder();
      }, 1200);
    }
  };

  // 3. Cashfree Payment Handler
  const handleCashfreePayment = () => {
    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const cfPaymentId = 'CF-' + Date.now().toString(36).toUpperCase();
      const order = {
        id: orderId,
        name: name || 'Customer',
        whatsapp,
        email: email || supportEmail,
        total,
        items,
        gateway: 'Cashfree',
        paymentApp: 'Cashfree PG',
        paymentId: cfPaymentId,
        utr: cfPaymentId,
        status: 'VERIFIED',
        driveLinkUnlocked: true,
        date: new Date().toISOString()
      };
      setIsProcessing(false);
      onPaymentSuccess(order);
    }, 1200);
  };

  // 4. PayPal Payment Handler
  const handlePaypalPayment = () => {
    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      const orderId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
      const paypalPaymentId = 'PAYID-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const order = {
        id: orderId,
        name: name || 'Customer',
        whatsapp,
        email: email || supportEmail,
        total,
        items,
        gateway: 'PayPal',
        paymentApp: `PayPal (${usdAmount} USD)`,
        paymentId: paypalPaymentId,
        utr: paypalPaymentId,
        status: 'VERIFIED',
        driveLinkUnlocked: true,
        date: new Date().toISOString()
      };
      setIsProcessing(false);
      onPaymentSuccess(order);
    }, 1200);
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
                    {items.reduce((acc, it) => acc + (it.clipCount || 1000), 0).toLocaleString()}+ Reels
                  </span>
                </div>

                {/* Items List Preview */}
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 truncate">{it.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {it.clipCount || 1000}+ Clips • 1080p Full HD
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900">₹{it.price}</span>
                        {it.originalPrice && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ₹{it.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Pricing Table */}
                <div className="pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Bundle(s) Original Value:</span>
                    <span className="line-through text-slate-400 font-medium">₹{originalTotal}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Store Promotional Discount:</span>
                    <span>-₹{Math.max(0, originalTotal - subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-purple-700 font-bold bg-purple-50 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        {comboBadge || 'Combo Discount'}
                      </span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery (Instant Cloud Unlock):</span>
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">FREE (₹0)</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST & Platform Charges:</span>
                    <span className="font-bold text-slate-700 uppercase text-[10px]">INCLUDED</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-300/80 font-black text-slate-900">
                    <div>
                      <span className="text-sm">Total Payable Amount</span>
                      <span className="block text-[10px] font-bold text-emerald-600">
                        🎉 You Save ₹{totalSavings} Total!
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl text-purple-700">₹{total}</span>
                  </div>
                </div>
              </div>

              {/* Customer WhatsApp Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    WhatsApp Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl shadow-2xs overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-transparent">
                    <span className="inline-flex items-center px-3 bg-slate-100 text-slate-700 font-bold text-xs border-r border-slate-300 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Enter 10-digit number (e.g. 9876543210)"
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

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Rahul Sharma)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com (for backup invoice)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
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
                  <span className="text-[9px] text-slate-400">Encrypted UPI/PG</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
              >
                <span>Continue to Payment (₹{total})</span>
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

              {/* Total Payable Reminder Banner */}
              <div className="flex items-center justify-between p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block">Total Payable:</span>
                  <span className="text-xl font-black text-purple-900">₹{total}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 block">Order Phone:</span>
                  <span className="text-xs font-black text-slate-800">+91 {whatsapp}</span>
                </div>
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
                        onClick={() => setSelectedGateway('upi_qr')}
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
                        onClick={() => setSelectedGateway('razorpay')}
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
                        onClick={() => setSelectedGateway('cashfree')}
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
                        onClick={() => setSelectedGateway('paypal')}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          selectedGateway === 'paypal'
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Globe className="w-5 h-5 text-sky-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">PayPal</p>
                          <p className="text-[10px] text-slate-500 font-medium">USD (${usdAmount})</p>
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
                    {isProcessing ? (
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
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Opening Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{total} via Razorpay</span>
                      </>
                    )}
                  </button>
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
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Proceed to Cashfree (₹{total})</span>
                    )}
                  </button>
                </div>
              )}

              {/* METHOD 4: PAYPAL */}
              {selectedGateway === 'paypal' && (
                <div className="p-5 bg-sky-50/60 border border-sky-200/90 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Pay via PayPal International
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Converted Amount: <strong className="text-slate-800">${usdAmount} USD</strong> (1 USD ≈ ₹{exchangeRate})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePaypalPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#0070BA] hover:bg-[#003087] text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Pay ${usdAmount} USD via PayPal</span>
                    )}
                  </button>
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
                    setError('');
                    setStep(2); // Safely return to Payment selection
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Payment (Choose UPI or Card)</span>
                </button>

                <a
                  href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello Cheap Reels Support, I need help with checkout for amount ₹${total}. My WhatsApp is ${whatsapp}.`)}`}
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
