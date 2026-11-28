import React from 'react';
import { Compass, CreditCard, Download, Rocket } from 'lucide-react';
import { isInternationalVisitor } from '../utils/geoPricing';

export default function WhereToBegin() {
  const isIntl = isInternationalVisitor();
  const steps = [
    {
      num: '1',
      icon: Compass,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      title: 'Choose Your Niche',
      desc: 'Browse through 50+ curated viral bundles including Fitness, Luxury, AI, Motivation, Cars & more.'
    },
    {
      num: '2',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      title: 'Easy 1-Click Payment',
      desc: isIntl 
        ? 'Pay securely via PayPal or Cards with zero extra fees.'
        : 'Pay securely using PhonePe, Google Pay, Paytm, UPI QR, or Cards with zero extra fees.'
    },
    {
      num: '3',
      icon: Download,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      title: 'Instant Drive Link',
      desc: 'Get your official Google Drive download folder instantly on screen and WhatsApp right after checkout.'
    },
    {
      num: '4',
      icon: Rocket,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200',
      title: 'Post & Grow',
      desc: 'Download 1080p watermark-free vertical MP4 videos, upload to Reels & Shorts, and grow your pages!'
    }
  ];

  return (
    <section id="how-it-works-section" className="py-14 sm:py-18 border-t border-b border-slate-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Header */}
        <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
          How It Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-800 max-w-xl mx-auto mb-10 font-semibold">
          Get your ready-to-post HD reels bundles in 4 simple steps.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 flex flex-col items-center shadow-md hover:shadow-xl"
              >
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl ${step.bgColor} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>

                {/* Step Number */}
                <span className="text-xl font-black text-slate-900 mb-1">
                  Step {step.num}
                </span>

                {/* Step Title */}
                <h3 className="text-sm font-bold text-slate-800 mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
