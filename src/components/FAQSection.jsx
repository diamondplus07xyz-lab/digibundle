import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'DigiBundle — what is it?',
      a: 'DigiBundle is India\'s #1 digital store for ready-to-post 1080p Full HD vertical reels bundles. We provide 2,50,000+ vertical videos across 50 curated viral niches with direct Google Drive access at flat 95% discount.'
    },
    {
      q: 'What kinds of Reels bundles can I buy here?',
      a: 'We cover 50 curated popular categories including Fitness & Gym, Luxury Lifestyle, Devotional/Sanatan, Anime, Motivation & Mindset, Comedy & Memes, Art & Craft, and Tech videos.'
    },
    {
      q: 'Are the reels 100% watermark-free with no logos?',
      a: 'Yes, 100%! Every single video is rendered in crisp 1080x1920 Full HD MP4 vertical format without any logos, watermarks, or creator names. You can upload them directly or edit them with your own branding.'
    },
    {
      q: 'How and when do I get my Google Drive link?',
      a: 'Immediately after completing your payment via UPI QR, Cashfree, or Razorpay, your official Google Drive download folder is unlocked on your screen in 5 seconds and also sent to your WhatsApp number.'
    },
    {
      q: 'Do I get lifetime access and future updates?',
      a: 'Yes! Once you purchase a bundle, the Google Drive folder is yours with lifetime access. You can download clips on your PC or smartphone anytime without expiration.'
    },
    {
      q: 'Can I use these reels for client pages and commercial use?',
      a: 'Absolutely! All bundles include full commercial use rights. You can use them to grow your own pages, monetize Instagram theme pages, or post for your clients.'
    }
  ];

  return (
    <section id="faq-section" className="py-16 sm:py-20 border-b border-amber-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Everything you need to know about our reels bundles and instant delivery.
          </p>
        </div>

        {/* 2-Column Clean Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white/95 rounded-2xl p-5 sm:p-6 text-slate-900 border border-amber-200 shadow-md transition-all duration-200 hover:border-amber-400 flex flex-col justify-between"
              >
                <div>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left font-extrabold text-sm sm:text-base text-slate-950 hover:text-amber-700 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-3 pt-3 border-t border-amber-100 animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
