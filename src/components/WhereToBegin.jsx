import React from 'react';
import { Sparkles, CreditCard, Download, Rocket, ArrowRight } from 'lucide-react';

export default function WhereToBegin({ onExploreClick }) {
  const steps = [
    {
      num: '01',
      icon: Sparkles,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      title: 'Choose Your Niche',
      desc: 'Browse through 50 premium viral curated categories including Fitness, Luxury, Anime, Motivation, Art & more.'
    },
    {
      num: '02',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      title: 'Easy 1-Click Payment',
      desc: 'Pay securely using PhonePe, Google Pay, Paytm, UPI QR, or Cards with zero extra fees.'
    },
    {
      num: '03',
      icon: Download,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      title: 'Instant Drive Link',
      desc: 'Get your official Google Drive download folder instantly on screen and WhatsApp right after checkout.'
    },
    {
      num: '04',
      icon: Rocket,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200',
      title: 'Post & Grow',
      desc: 'Download 1080p watermark-free vertical MP4 videos, upload to Reels & Shorts, and grow your pages!'
    }
  ];

  return (
    <section id="how-it-works-section" className="py-16 sm:py-20 border-t border-b border-amber-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Simple Process</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
          How It Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-12 font-medium">
          Get your ready-to-post HD reels bundles in 4 simple steps.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-white/95 border border-amber-200 hover:border-amber-400 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center shadow-md hover:shadow-xl hover:shadow-amber-500/10 group"
              >
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl ${step.bgColor} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200`}>
                  <Icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>

                {/* Step Number */}
                <span className="text-xs font-black text-amber-600 tracking-widest uppercase mb-1">
                  Step {step.num}
                </span>

                {/* Step Title */}
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {onExploreClick && (
          <div className="mt-10">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-amber-50 text-slate-800 hover:text-slate-950 border border-amber-200 hover:border-amber-300 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <span>Explore All Bundles Now</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
