import React from 'react';
import { 
  Check, ArrowRight, Download, MessageCircle, ShoppingBag, 
  Sparkles, ShieldCheck, Film, Layers, Play, Zap, Flame, Star
} from 'lucide-react';

export default function Hero({ onClaimMegaDeal, onScrollToCatalog }) {
  return (
    <section className="relative pt-10 pb-16 sm:pt-20 sm:pb-24 border-b border-amber-200/70 overflow-hidden">
      {/* Decorative gradient glow mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-300/30 via-yellow-300/25 to-orange-300/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Creative Studio Headline */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Studio Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-amber-300 text-xs font-black text-amber-900 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="tracking-wide">DIGIBUNDLE DIGITAL STUDIO</span>
              <span className="text-amber-300">•</span>
              <span className="text-amber-700 font-extrabold">50 Curated 4K &amp; HD Packs</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
              Viral Vertical Video Assets.{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent inline-block drop-shadow-xs">
                Built for Creators Who Want to Win.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-700 font-medium max-w-2xl leading-relaxed">
              Stop wasting 5+ hours daily editing. Access 50 premium, watermark-free vertical reels collections formatted in crisp 1080p for Instagram Reels, YouTube Shorts &amp; TikTok.
            </p>

            {/* 4 Studio Advantage Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 bg-white/95 border border-amber-200/80 backdrop-blur-sm p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">1080p Studio Quality</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">100% Watermark &amp; Logo Free</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/95 border border-amber-200/80 backdrop-blur-sm p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Instant Google Drive Sync</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Lifetime Cloud Access &amp; Updates</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/95 border border-amber-200/80 backdrop-blur-sm p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Commercial Rights (MRR)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Post on client pages or monetize</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/95 border border-amber-200/80 backdrop-blur-sm p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Packs Start @ ₹29</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">No subscriptions &bull; Pay once</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onClaimMegaDeal}
                className="w-full sm:w-auto px-8 py-4 glow-amber-btn rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-xl text-white"
              >
                <Sparkles className="w-4 h-4 fill-white text-white shrink-0" />
                <span>Get All-Access Master Pass (₹999)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={onScrollToCatalog}
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-amber-50 text-slate-800 hover:text-slate-950 font-bold rounded-2xl text-sm border border-amber-200 hover:border-amber-300 shadow-xs transition cursor-pointer text-center"
              >
                Explore 50 Curated Bundles
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.9 / 5.0 Rating</span>
              <span className="text-slate-400">&bull;</span>
              <span>Trusted by 15,000+ Indian creators &amp; agencies</span>
            </div>

          </div>

          {/* Right Column: Master Vault Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white/95 p-6 sm:p-8 border-2 border-amber-300 shadow-[0_20px_50px_rgba(245,158,11,0.18)] backdrop-blur-xl group hover:border-amber-400 transition-all duration-300 text-slate-900">
              
              {/* Top VIP Pill */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    VIP
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-950 leading-tight">DigiBundle Master Vault</h3>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">All 50 Packs Included</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  90% OFF DEAL
                </span>
              </div>

              {/* Showcase Highlights Graphic Box */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-50/70 via-yellow-50 to-orange-50/40 p-5 border border-amber-200/80 shadow-inner space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Complete Digital Vault
                  </span>
                  <span className="text-xs font-bold text-slate-500">2,50,000+ Files</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] shadow-2xs">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Formats</span>
                    <span className="font-black text-slate-900">1080x1920 MP4</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] shadow-2xs">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Delivery</span>
                    <span className="font-black text-emerald-700">Instant Drive Link</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] shadow-2xs">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Watermarks</span>
                    <span className="font-black text-blue-700">100% Logo-Free</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] shadow-2xs">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">License</span>
                    <span className="font-black text-purple-700">Commercial MRR</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {['AI Avatars', 'Motivation', 'Gym/Fitness', 'Sanatan/Spiritual', 'Anime', 'Supercars', 'Luxury'].map((tag) => (
                    <span key={tag} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md text-slate-700 border border-amber-200/80 shadow-2xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="flex items-center justify-between bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    One-Time Lifetime Access
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-slate-950">₹999</span>
                    <span className="text-sm font-semibold text-slate-400 line-through">₹9,999</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-1 rounded-xl">
                    Save ₹9,000
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Zero Monthly Fees</p>
                </div>
              </div>

              {/* Instant Claim Button */}
              <button
                onClick={onClaimMegaDeal}
                className="w-full py-4 px-6 glow-amber-btn rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all text-white"
              >
                <ShoppingBag className="w-4 h-4 fill-white text-white" />
                <span>Instant Unlock Master Vault (₹999)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
