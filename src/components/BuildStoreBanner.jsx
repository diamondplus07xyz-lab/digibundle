import React from 'react';
import { MessageCircle, Rocket, CheckCircle2, ArrowRight, Smartphone, Zap, ShieldCheck, Code2 } from 'lucide-react';

export default function BuildStoreBanner({ whatsappNumber = '917017324978' }) {
  const digits = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const cleanNumber = digits.length === 10 ? `91${digits}` : (digits || '917017324978');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hello%20Vivek,%20I%20want%20to%20build%20a%20digital%20store%20website%20like%20DigiBundle!%20Please%20share%20details.`;

  return (
    <section 
      aria-label="Build Your Own Store"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-20"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-10 border border-amber-500/30 shadow-2xl">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Content & Badges */}
          <div className="flex-1 text-center lg:text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider mb-3.5 shadow-xs">
              <Rocket className="w-3.5 h-3.5 text-amber-400" />
              <span>Get Your Own Digital Store in 24 Hours</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Want a Website &amp; Digital Store <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                Just Like DigiBundle?
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Launch your own high-earning reels &amp; digital products store! Get 100% automated UPI QR payments, 
              complete Admin Panel, pre-loaded 50+ viral HD reels bundles, and instant Google Drive cloud delivery. Crafted with precision — Made by Vivek Singh.
            </p>

            {/* Highlights Grid */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs text-slate-200 font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Direct UPI QR</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secret Admin Control Panel</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ready in 24 Hours</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mobile &amp; PC Ready</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
                <Code2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Made by Vivek Singh</span>
              </span>
            </div>
          </div>

          {/* Right: WhatsApp Direct Action Card */}
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center sm:items-end gap-3">
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-98 cursor-pointer ring-2 ring-emerald-400/50 group"
            >
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>
              <span>WhatsApp: +91 7017324978</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available on WhatsApp &bull; Fast Response Guaranteed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
