import React, { useState, useEffect } from 'react';
import { Clock, FolderOpen, ArrowRight, ShoppingBag, ShieldCheck, DownloadCloud } from 'lucide-react';
import { initialConfig } from '../data/config';

export default function SpecialOfferBanner({ offer, onClaimOffer }) {
  const currentOffer = offer || initialConfig.specialOffer;
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 35);

  const isDefaultImage = !currentOffer?.thumbnail || currentOffer.thumbnail.includes('sheru-bhai-mega-reels-bundle-ad') || currentOffer.thumbnail.includes('special-offer');
  const mobileImgSrc = isDefaultImage ? '/special-offer-mobile.webp' : currentOffer.thumbnail;
  const desktopImgSrc = isDefaultImage ? '/special-offer.webp' : currentOffer.thumbnail;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentOffer || currentOffer.enabled === false) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const discountPercent = Math.round(
    (((currentOffer.originalPrice || 2999) - (currentOffer.price || 199)) / (currentOffer.originalPrice || 2999)) * 100
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 border-2 border-amber-400 shadow-2xl text-white p-3.5 sm:p-6 lg:p-8">
        
        {/* Decorative background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-6 lg:gap-8">
          
          {/* Left: Auto-Fit Photo (Compact on Mobile, Large on Desktop) */}
          <div className="w-full lg:w-[420px] xl:w-[460px] h-36 sm:h-56 lg:h-80 bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-amber-400/30 shadow-2xl relative group">
            {/* Ambient blurred backdrop so letterbox areas fill seamlessly */}
            <img
              src={mobileImgSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width={480}
              height={360}
              className="absolute inset-0 w-full h-full object-cover blur-lg scale-125 opacity-50 pointer-events-none"
            />
            {/* Foreground image - 100% visible, sharp, no text covering */}
            <picture className="relative z-10 flex items-center justify-center max-w-full max-h-full">
              <source media="(max-width: 640px)" srcSet={mobileImgSrc} type="image/webp" />
              <source srcSet={desktopImgSrc} type="image/webp" />
              <img
                src={desktopImgSrc}
                alt={currentOffer.title || "Special Offer"}
                width={720}
                height={540}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
              />
            </picture>
          </div>

          {/* Right/Middle: Title, Subtitle, Multiple Drive Links Indicator & Timer */}
          <div className="w-full flex-1 text-center lg:text-left space-y-2 sm:space-y-3">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                {currentOffer.badge || "EXCLUSIVE CREATOR DEAL"}
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                Deal Ends in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-white leading-snug sm:leading-tight">
              {currentOffer.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
              {currentOffer.subtitle}
            </p>

            {/* Multiple Drive Folders Included Indicator */}
            <div className="pt-0.5 sm:pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1.5 sm:mb-2">
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                Includes {currentOffer.driveLinks?.length || 3} Multi-Part Cloud Drive Folders
              </span>

              {/* Multiple Drive Links Pill Previews (Visible on sm/desktop, condensed on mobile) */}
              {currentOffer.driveLinks && currentOffer.driveLinks.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1.5 justify-center lg:justify-start">
                  {currentOffer.driveLinks.map((lnk, idx) => (
                    <span key={idx} className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/10 text-slate-200">
                      📁 {lnk.label || `Folder Part ${idx + 1}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Claim CTA Button */}
            <div className="pt-1.5 sm:pt-3 flex flex-row items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-2xl sm:text-4xl font-black text-amber-400">₹{currentOffer.price}</span>
                <span className="text-xs sm:text-base font-semibold text-slate-400 line-through">₹{currentOffer.originalPrice}</span>
                <span className="text-[10px] sm:text-xs font-black text-emerald-400 bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-emerald-500/30">
                  {discountPercent}% OFF
                </span>
              </div>

              <button
                onClick={() => onClaimOffer && onClaimOffer({
                  id: 'special-offer-banner',
                  title: currentOffer.title,
                  category: 'mega',
                  clipCount: currentOffer.clipCount || '1,50,000+ Reels',
                  price: currentOffer.price,
                  originalPrice: currentOffer.originalPrice,
                  badge: currentOffer.badge,
                  thumbnail: currentOffer.thumbnail,
                  driveLink: currentOffer.driveLinks?.[0]?.url || 'https://drive.google.com',
                  driveLinks: currentOffer.driveLinks || []
                })}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl shadow-amber-500/30 transition-all cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
                <span>Claim Deal</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
