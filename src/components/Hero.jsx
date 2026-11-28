import React from 'react';
import { Check, ArrowRight, Download, MessageCircle, ShoppingBag } from 'lucide-react';
import { isInternationalVisitor } from '../utils/geoPricing';

export default function Hero({ onClaimMegaDeal, onScrollToCatalog, masterVaultThumbnail, config = {} }) {
  const isIntl = isInternationalVisitor();
  const isDefaultVault = !masterVaultThumbnail || masterVaultThumbnail.includes('sheru-bhai-mega-reels-bundle-ad');
  const vaultImg = isDefaultVault ? "/special-offer.webp" : masterVaultThumbnail;
  const rawSupport = (config?.whatsappNumber || '7017324978').replace(/\D/g, '');
  const tenDigit = rawSupport.slice(-10) || '7017324978';
  const supportPhone = `+91 ${tenDigit}`;
  const whatsappUrl = `https://wa.me/91${tenDigit}`;

  return (
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Hero Headline & Bullet Points */}
          <div className="lg:col-span-7 text-left">
            
            {/* Top clean pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold text-white mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Google Drive Delivery in 5 Seconds</span>
            </div>

            {/* Main Headline - Reels Bundles highlighted with Yellow */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.15] mb-6">
              Ready-to-Post HD{' '}
              <span className="bg-yellow-300 text-slate-950 px-2.5 py-0.5 rounded-xl shadow-xs inline-block">
                Reels Bundles
              </span>
              <br />
              <span className="text-slate-900 underline decoration-rose-500 decoration-wavy decoration-2">
                To Grow Your Audience
              </span>
            </h1>

            {/* Clean Value Propositions */}
            <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-900 font-semibold">
              <li className="flex items-center gap-2.5 bg-white/95 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <span>100% Watermark-Free 1080p Full HD Vertical Videos (9:16)</span>
              </li>
              <li className="flex items-center gap-2.5 bg-white/95 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                </span>
                <span>Instant Google Drive Download Links Right After Checkout</span>
              </li>
              <li className="flex items-center gap-2.5 bg-white/95 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <span>{isIntl ? 'Starting At Just $10 USD • Lifetime Cloud Access & Regular Additions' : 'Starting At Just ₹49 • Lifetime Cloud Access & Regular Additions'}</span>
              </li>
              <li className="flex items-center gap-2.5 bg-white/95 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-purple-600" />
                </span>
                <span>Direct WhatsApp Support: <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-slate-950 font-black hover:text-purple-600 transition underline decoration-purple-300 underline-offset-2">{supportPhone}</a></span>
              </li>
            </ul>

            {/* Desktop & Mobile Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                data-action="claim-master-vault"
                data-price={isIntl ? "99" : "299"}
                onClick={onClaimMegaDeal}
                aria-label={isIntl ? "Claim All-In-One Master Pack for $99 USD" : "Claim All-In-One Master Pack for ₹299"}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-black text-white font-extrabold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-normal">{isIntl ? 'Get All-In-One Master Pack ($99 USD)' : 'Get All-In-One Master Pack (₹299)'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                data-action="browse-catalog"
                onClick={onScrollToCatalog}
                aria-label="Scroll down to browse all reels bundles"
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl text-sm border border-slate-300 shadow-xs transition cursor-pointer text-center"
              >
                Browse All Bundles
              </button>
            </div>
          </div>

          {/* Right Column - Master Vault Card (Zero Text On Top Of Thumbnail) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-5 sm:p-7 text-slate-900 shadow-xl border border-slate-200 relative">
              
              {/* Clean Photo Container: No text covering the image */}
              <div className="w-full h-52 sm:h-60 bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-200 flex items-center justify-center relative">
                <img
                  src={vaultImg}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={360}
                  className="hidden sm:block absolute inset-0 w-full h-full object-cover blur-md scale-125 opacity-40 pointer-events-none"
                />
                <img
                  src={vaultImg}
                  alt="All-In-One Master Reels Vault"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={360}
                  className="relative max-w-full max-h-full object-contain z-10 transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Title & Info Below Photo (Never on top) */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                  BESTSELLER BUNDLE
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-blue-600" /> Instant Drive Link
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-1">
                All-In-One Master Reels Vault
              </h2>
              <p className="text-xs text-slate-700 mb-4 leading-relaxed font-medium">
                Get full unlocked access to <strong className="text-slate-950 font-black">2,00,000+ vertical videos</strong> across all viral niches with lifetime Google Drive updates.
              </p>

              {/* Price comparison box */}
              <div className="bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Special Bundle Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-950">{isIntl ? '$99 USD' : '₹299'}</span>
                    <span className="text-xs font-semibold text-slate-600 line-through">{isIntl ? '$299 USD' : '₹2,999'}</span>
                  </div>
                </div>
                <div className="bg-emerald-700 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                  {isIntl ? '67% OFF' : '90% OFF'}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                data-action="claim-master-vault"
                data-price={isIntl ? "99" : "299"}
                onClick={onClaimMegaDeal}
                aria-label={isIntl ? "Unlock Master Reels Vault Pack for $99 USD" : "Unlock Master Reels Vault Pack for ₹299"}
                className="w-full py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 fill-slate-950" />
                <span>{isIntl ? 'Instant Unlock Master Pack ($99 USD)' : 'Instant Unlock Master Pack (₹299)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
