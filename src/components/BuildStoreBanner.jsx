import React from 'react';
import { 
  MessageCircle, Sparkles, CheckCircle2, ArrowRight, Smartphone, 
  Zap, ShieldCheck, Rocket, DollarSign, Laptop, Star, Code2, Award, Heart
} from 'lucide-react';

export default function BuildStoreBanner({ whatsappNumber = '917017324978' }) {
  const digits = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const cleanNumber = digits.length === 10 ? `91${digits}` : (digits || '917017324978');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hello%20Vivek%20Singh,%20I%20want%20to%20build%20a%20digital%20store%20website%20like%20DigiBundle!%20Please%20share%20demo%20and%20pricing.`;

  return (
    <section 
      aria-label="Build Your Own Digital Store"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-20"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#031d28] to-[#042421] text-white p-6 sm:p-10 lg:p-12 border-2 border-emerald-400/50 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.35)] group hover:border-sky-400/70 transition-all duration-300">
        
        {/* Ambient background glows: Green + Sky Blue */}
        <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-sky-500/25 rounded-full blur-[130px] pointer-events-none group-hover:bg-sky-500/35 transition-all duration-500" />
        <div className="absolute -bottom-28 -left-28 w-[420px] h-[420px] bg-emerald-500/25 rounded-full blur-[130px] pointer-events-none group-hover:bg-emerald-500/35 transition-all duration-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Creator Credential & Features */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Top Developer Badge - Made by Vivek Singh */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-400/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Made by <strong className="text-white underline decoration-emerald-400 font-black">Vivek Singh</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-300 font-extrabold normal-case">Full-Stack Digital Architect</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Want a Website &amp; Digital Store{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent inline-block drop-shadow-md">
                Just Like DigiBundle?
              </span>
            </h2>

            {/* Description with Developer Reference */}
            <p className="mt-4 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Launch your own high-earning digital reels business built personally by <strong className="text-white font-bold">Vivek Singh</strong>! 
              Get 100% automated direct UPI QR payments, full Admin control console, pre-loaded 2,50,000+ HD viral reels, and instant Google Drive delivery.
            </p>

            {/* 4 Feature Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-sky-900/40 backdrop-blur-sm flex items-center gap-3 hover:border-emerald-400/50 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Direct UPI QR (0% Fees)</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">100% payments go straight to your bank</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-sky-900/40 backdrop-blur-sm flex items-center gap-3 hover:border-sky-400/50 transition">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Full Admin Control Panel</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">Control prices, add bundles &amp; track sales</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-sky-900/40 backdrop-blur-sm flex items-center gap-3 hover:border-teal-400/50 transition">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Instant 5-Sec Drive Delivery</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">Automated access unlock for customers</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-sky-900/40 backdrop-blur-sm flex items-center gap-3 hover:border-purple-400/50 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Ready in 24 Hours</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">Complete store launch by Vivek Singh</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Developer Profile & WhatsApp Action Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border-2 border-emerald-400/40 shadow-2xl relative flex flex-col justify-between hover:border-sky-400/60 transition-all">
              
              {/* Developer Profile Header */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-sky-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                      VS
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                      <span>Vivek Singh</span>
                      <Award className="w-4 h-4 text-emerald-400" />
                    </h4>
                    <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                      Lead Full-Stack Developer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                </div>
              </div>

              {/* What Vivek Singh Provides */}
              <div className="py-4 space-y-2.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Store Setup Includes:
                </span>
                
                <ul className="space-y-1.5 text-xs text-slate-200 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                    <span>Custom Domain &amp; Free High-Speed Hosting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                    <span>Your Own UPI QR (Direct Bank Settlements)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                    <span>Pre-loaded 2,50,000+ HD Vertical Reels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                    <span>1-Year Technical &amp; Setup Support by Vivek</span>
                  </li>
                </ul>
              </div>

              {/* WhatsApp Action Button with Glow */}
              <div className="pt-2 space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 glow-primary-btn text-slate-950 rounded-2xl font-black text-sm sm:text-base cursor-pointer group shadow-xl"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </div>
                  <span>Contact Vivek Singh on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </a>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Direct WhatsApp &bull; <strong className="text-white">+91 7017324978</strong></span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
