import React from 'react';
import { Trophy, CreditCard, DollarSign, Gauge } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Trophy,
      title: '1080p HD Quality',
      desc: 'Crystal-clear 1080x1920 Full HD vertical video format. 100% watermark and logo free.',
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      icon: CreditCard,
      title: 'Easy UPI & Card Payments',
      desc: 'Multiple secure options: Direct UPI QR, PhonePe, Google Pay, Paytm, Cards, and Netbanking.',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: DollarSign,
      title: 'Affordable Pricing',
      desc: 'Individual packs start at just ₹29. Unlock all 50 packs with the Master Vault deal.',
      bgColor: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      icon: Gauge,
      title: 'Instant 5-Sec Delivery',
      desc: 'Direct official Google Drive link unlocked automatically right after checkout.',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }
  ];

  return (
    <section className="py-14 sm:py-16 border-b border-amber-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white/95 rounded-2xl p-5 border border-amber-200 shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-200 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${feat.bgColor} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
