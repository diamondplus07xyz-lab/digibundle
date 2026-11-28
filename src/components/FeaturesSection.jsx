import React from 'react';
import { Trophy, CreditCard, DollarSign, Gauge } from 'lucide-react';
import { isInternationalVisitor, getUserCurrency } from '../utils/geoPricing';
import { t } from '../utils/i18n';

export default function FeaturesSection() {
  const isIntl = isInternationalVisitor();
  const currency = getUserCurrency();
  const minFormatted = currency.format(currency.minPrice);
  const masterFormatted = currency.format(currency.masterPrice);

  const features = [
    {
      icon: Trophy,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      icon: CreditCard,
      title: t('feature4Title'),
      desc: isIntl 
        ? t('feature4Desc')
        : 'Multiple secure options: Direct UPI QR, PhonePe, Google Pay, Paytm, Cards, and Netbanking.',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      icon: DollarSign,
      title: `${t('startingAt')} ${minFormatted}`,
      desc: `${t('startingAt')} ${minFormatted}. ${t('getMasterPack')} (${masterFormatted}).`,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      icon: Gauge,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  ];

  return (
    <section className="py-14 sm:py-16 border-b border-slate-400/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${feat.bgColor} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
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
