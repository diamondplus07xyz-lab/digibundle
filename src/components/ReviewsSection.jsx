import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { isInternationalVisitor, getUserCurrency } from '../utils/geoPricing';
import { t } from '../utils/i18n';

export default function ReviewsSection() {
  const isIntl = isInternationalVisitor();
  const currency = getUserCurrency();
  const gtaFormatted = currency.format(currency.gtaPrice);
  const reviews = [
    {
      name: 'Aman Sharma',
      city: isIntl ? 'New York, US' : 'Delhi',
      role: 'Instagram Creator',
      text: isIntl 
        ? 'Truly impressed by the video quality! 1080p Full HD without watermarks. My social reach jumped 5x in 3 days. Worth every dollar!' 
        : 'Bhai sach me reels ki quality ek number hai! 1080p full HD aur bina kisi watermark ke hai. 3 din me Instagram reach 5x ho gayi. Worth every rupee!',
      rating: 5,
      avatar: 'AS',
      badgeBg: 'bg-indigo-100 text-indigo-700'
    },
    {
      name: 'Pooja Verma',
      city: isIntl ? 'London, UK' : 'Mumbai',
      role: 'Fashion & Lifestyle Page',
      text: isIntl
        ? 'Best part is that right after payment, instant Google Drive access unlocked immediately. Saves hundreds of hours of video editing.'
        : 'Sabse best baat ye hai ki payment ke baad direct Google Drive link WhatsApp pe mil gaya. Video editing ka pura jhanjhat khatam ho gaya.',
      rating: 5,
      avatar: 'PV',
      badgeBg: 'bg-rose-100 text-rose-700'
    },
    {
      name: 'Rohan Mehta',
      city: isIntl ? 'Toronto, CA' : 'Jaipur',
      role: 'Digital Marketer',
      text: isIntl
        ? `Purchased the GTA 6 4K Cinematic Reels bundle for ${gtaFormatted}, received massive crisp quality content ready to post daily all year round!`
        : 'GTA 6 4K Cinematic Reels bundle liya tha ₹99 me, itna massive aur crisp content mila hai ki 1 saal tak roz vertical gaming reels aaram se post kar sakta hu!',
      rating: 5,
      avatar: 'RM',
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    {
      name: 'Sneha Patel',
      city: isIntl ? 'Sydney, AU' : 'Ahmedabad',
      role: 'YouTube Shorts Creator',
      text: isIntl
        ? 'The AI Reels and Motivation packs are fantastic. Gaining subscribers and views much faster on YouTube Shorts and Instagram Reels!'
        : 'AI Reels aur Motivation bundle dono mast hain. YouTube Shorts pe upload karne ke baad views aur subscribers bahut fast badh rahe hain!',
      rating: 5,
      avatar: 'SP',
      badgeBg: 'bg-emerald-100 text-emerald-700'
    }
  ];

  return (
    <section id="reviews-section" className="py-14 sm:py-20 border-b border-slate-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-white mb-3 shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
            Loved By Over 15,000+ Creators
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold max-w-xl mx-auto">
            See what Indian video creators and digital marketers say about Cheap Reels.
          </p>
        </div>

        {/* 4 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl hover:border-slate-300 transition-all duration-200"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-medium">
                  "{rev.text}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${rev.badgeBg} flex items-center justify-center font-black text-xs shrink-0`}>
                  {rev.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {rev.name}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {rev.role} • {rev.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
