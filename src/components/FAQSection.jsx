import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'DigiBundle — what is it?',
      a: 'DigiBundle is India\'s #1 digital store for ready-to-post 1080p Full HD vertical reels bundles. We provide 2,50,000+ vertical videos across 130+ viral niches with direct Google Drive access at flat 95% discount.'
    },
    {
      q: 'What kinds of Reels bundles can I buy here?',
      a: 'We cover 50+ curated premium bundles including Fitness & Gym, Luxury Lifestyle, Devotional/Sanatan, Anime, Motivation & Mindset, Comedy & Memes, Art & Craft, and Tech videos.'
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
    <section id="faq-section" className="py-14 sm:py-20 border-b border-slate-400/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-white mb-3 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-1">
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
                className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-slate-200 shadow-md transition-all duration-200 hover:border-slate-300 flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-label={`Toggle answer for: ${faq.q}`}
                  className="w-full flex items-center justify-between text-left gap-3 group focus:outline-none"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
