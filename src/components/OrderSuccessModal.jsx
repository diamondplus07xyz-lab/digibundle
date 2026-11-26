import React, { useState, useEffect } from 'react';
import { 
  Clock, MessageCircle, AlertTriangle, ExternalLink, Check, Copy, X, 
  ShieldAlert, Package, CheckCircle2, Sparkles, FolderOpen, RefreshCw, Lock, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BrandLogo from './BrandLogo';

export default function OrderSuccessModal({ order: initialOrder, onClose, config = {} }) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Keep state updated if prop changes
  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Real-Time Status Poller for Pending UPI QR Orders
  // Checks every 3 seconds whether the order was verified by Admin
  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'VERIFIED') return;

    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem('cheap_reels_orders');
        if (raw) {
          const orders = JSON.parse(raw);
          const found = orders.find(o => o.id === currentOrder.id);
          if (found && found.status === 'VERIFIED') {
            setCurrentOrder(found);
            // Confetti celebration when newly verified!
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.55 }
            });
          }
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  // Initial confetti on verified orders
  useEffect(() => {
    if (currentOrder && (currentOrder.status === 'VERIFIED' || currentOrder.driveLinkUnlocked)) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, []);

  if (!currentOrder) return null;

  const isPending = currentOrder.status === 'PENDING_VERIFICATION' || currentOrder.driveLinkUnlocked === false;
  const isVerified = !isPending;

  const supportPhone = (config?.whatsappNumber || currentOrder.whatsappNumber || '').replace(/\D/g, '');
  const storeName = config?.storeName || 'Cheap Reels';
  const whatsappUrl = currentOrder.whatsappUrl || (supportPhone ? 
    `https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello ${storeName}, my order ID is #${currentOrder.id} and UTR is ${currentOrder.utr}. Please verify and send my Google Drive link.`)}` : '#');

  const handleCopyUtr = () => {
    navigator.clipboard.writeText(currentOrder.utr || '');
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(currentOrder.id || '');
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const formattedDate = new Date(currentOrder.date || Date.now()).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-slate-100 my-auto">
        
        {/* ==================================================== */}
        {/* TOP STATUS HEADER WITH ANIMATED RADAR/CHECK ICON     */}
        {/* ==================================================== */}
        <div className={`p-6 text-center text-white relative transition-colors ${
          isPending 
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700' 
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Badge Icon */}
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-xl bg-white/20 backdrop-blur-md">
            {isPending ? (
              <>
                <Clock className="w-8 h-8 text-amber-200 animate-pulse relative z-10" />
                <span className="absolute inset-0 rounded-2xl bg-amber-400/30 animate-ping" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-9 h-9 text-white relative z-10" />
                <Sparkles className="w-4 h-4 text-emerald-200 absolute -top-1 -right-1 animate-bounce" />
              </>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {isPending ? 'Payment Submitted — Verification Pending' : 'Payment Confirmed & Verified!'}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-white/90 font-medium">
            <span>Order Reference:</span>
            <span className="font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/20 flex items-center gap-1">
              #{currentOrder.id}
              <button onClick={handleCopyOrderId} className="hover:text-amber-200 cursor-pointer ml-1" title="Copy Order ID">
                {copiedOrderId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              </button>
            </span>
          </div>

          {/* Pending Auto-poller live status chip */}
          {isPending && (
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-[10px] font-bold text-amber-100">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
              <span>Live Auto-Sync: Page unlocks automatically upon verification</span>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* MODAL BODY                                           */}
        {/* ==================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* 1. TRANSACTION SUMMARY TABLE */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
              <span className="font-semibold">Transaction / UTR Reference:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                <span>{currentOrder.utr || currentOrder.paymentId || 'N/A'}</span>
                {currentOrder.utr && (
                  <button onClick={handleCopyUtr} className="text-slate-400 hover:text-white cursor-pointer ml-1" title="Copy UTR">
                    {copiedUtr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="font-semibold">Amount Paid:</span>
              <span className="font-black text-white text-sm">
                {currentOrder.gateway === 'PayPal' ? `$${Math.round(currentOrder.total)} USD` : `₹${currentOrder.total}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="font-semibold">Customer WhatsApp:</span>
              <span className="font-bold text-slate-200">+91 {currentOrder.whatsapp}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="font-semibold">Date & Time:</span>
              <span className="font-medium text-slate-300">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="font-semibold">Payment Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                isPending 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isPending ? 'Pending Verification' : 'Verified & Live'}
              </span>
            </div>
          </div>

          {/* 2. PENDING STATE SPECIFIC INSTRUCTIONS & WHATSAPP CHAT */}
          {isPending && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-300">
                    Drive Link Protected Pending UTR Match
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Your 12-digit UTR has been logged. Our verification team reviews incoming UPI credits 24/7. To instantly dispatch your link, click the WhatsApp button below.
                  </p>
                </div>
              </div>

              {/* Big WhatsApp Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp to Speed Up Verification</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-[11px] text-amber-300/80 text-center font-medium">
                🔒 Once approved by admin, this screen automatically switches to green and unlocks your Google Drive folder instantly.
              </p>
            </div>
          )}

          {/* 3. VERIFIED STATE SPECIFIC GOOGLE DRIVE UNLOCK */}
          {isVerified && (
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  Your Google Drive Folder Access is Unlocked!
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click below to open and save all 1080p watermark-free reels directly to your Google Drive.
                </p>
              </div>

              <a
                href={currentOrder.items[0]?.driveLink || "https://drive.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Open Google Drive Folder</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}

          {/* 4. PURCHASED ITEMS & DIRECT DRIVE LINKS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Purchased Reels Bundles ({currentOrder.items.length})
            </h4>
            <div className="space-y-2">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{(item.title || '').replace(/&amp;/g, '&')}</p>
                    <p className="text-[11px] text-slate-400">
                      {typeof item.clipCount === 'string' && item.clipCount.includes('Reel')
                        ? item.clipCount
                        : `${(typeof item.clipCount === 'number' ? item.clipCount : (parseInt(String(item.clipCount || '').replace(/\D/g, ''), 10) || 1000)).toLocaleString()}+ Reels`} • 1080p Full HD • Watermark-Free
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-amber-400 block">
                      {currentOrder.gateway === 'PayPal' ? `$${item.price} USD` : `₹${item.price}`}
                    </span>
                    {isVerified && item.driveLink && (
                      <a 
                        href={item.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 mt-0.5"
                      >
                        <span>Drive</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close / Done Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Done / Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
