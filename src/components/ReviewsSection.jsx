import React from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ReviewsSection() {
  const reviews = [
    {
      name: 'Aman Sharma',
      city: 'Delhi',
      role: 'Instagram Creator',
      text: 'Bhai sach me reels ki quality ek number hai! 1080p full HD aur bina kisi watermark ke hai. 3 din me Instagram reach 5x ho gayi. Worth every rupee!',
      rating: 5,
      avatar: 'AS',
      badgeBg: 'bg-indigo-100 text-indigo-700 border border-indigo-200'
    },
    {
      name: 'Pooja Verma',
      city: 'Mumbai',
      role: 'Fashion & Lifestyle Page',
      text: 'Sabse best baat ye hai ki payment ke baad direct Google Drive link WhatsApp pe mil gaya. Video editing ka pura jhanjhat khatam ho gaya.',
      rating: 5,
      avatar: 'PV',
      badgeBg: 'bg-rose-100 text-rose-700 border border-rose-200'
    },
    {
      name: 'Rohan Mehta',
      city: 'Jaipur',
      role: 'Digital Marketer',
      text: 'Master Vault pack liya tha ₹999 me, itna massive content mila hai ki 1 saal tak roz 3 vertical reels aaram se post kar sakta hu bina rukawat!',
      rating: 5,
      avatar: 'RM',
      badgeBg: 'bg-amber-100 text-amber-800 border border-amber-300'
    },
    {
      name: 'Sneha Patel',
      city: 'Ahmedabad',
      role: 'YouTube Shorts Creator',
      text: 'AI Reels aur Motivation bundle dono mast hain. YouTube Shorts pe upload karne ke baad views aur subscribers bahut fast badh rahe hain!',
      rating: 5,
      avatar: 'SP',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    }
  ];

  return (
    <section id="reviews-section" className="py-16 sm:py-20 border-b border-amber-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 mb-3 shadow-2xs">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
            Loved By Over 15,000+ Creators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
            See what Indian video creators and digital marketers say about DigiBundle.
          </p>
        </div>

        {/* 4 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white/95 border border-amber-200 hover:border-amber-400 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-slate-900"
            >
              <div>
                {/* 5 Stars & Verified Buyer */}
                <div className="flex items-center justify-between gap-1 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-medium">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-amber-100">
                <div className={`w-10 h-10 rounded-full ${rev.badgeBg} flex items-center justify-center font-black text-xs shrink-0`}>
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950 leading-tight">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
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
