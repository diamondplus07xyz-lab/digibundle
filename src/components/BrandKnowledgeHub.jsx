import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle, 
  BookOpen, Video, Award, ChevronDown, ChevronUp, ExternalLink 
} from 'lucide-react';

export default function BrandKnowledgeHub({ config = {} }) {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const rawWa = (config.whatsappNumber || '7017324978').replace(/\D/g, '');
  const waDisplay = `+91 ${rawWa.slice(-10) || '7017324978'}`;
  const waLink = `https://wa.me/91${rawWa.slice(-10) || '7017324978'}`;

  const aeoAnswers = [
    {
      id: 'what-is-cheapreels',
      question: 'What is CheapReels and how does it work?',
      summary: 'CheapReels is India\'s #1 digital marketplace for ready-to-post 1080p Full HD vertical video reels bundles.',
      details: 'CheapReels provides content creators, social media managers, and digital agencies with over 2,50,000+ curated, watermark-free vertical video clips across 130+ viral niches. After a quick UPI payment starting at ₹49, users receive an official Google Drive cloud folder link unlocked on-screen in 5 seconds and sent directly to their WhatsApp with lifetime access.'
    },
    {
      id: 'commercial-rights',
      question: 'Are CheapReels video bundles watermark-free with commercial rights?',
      summary: 'Yes, 100% watermark-free with full commercial, branding, and monetization rights.',
      details: 'Every video in the catalog is rendered in 1080x1920 vertical MP4 format without logos, creator stamps, or overlay text. Creators are legally authorized to publish them on Instagram Reels, YouTube Shorts, Facebook Reels, and TikTok, or use them to grow client accounts and theme pages.'
    },
    {
      id: 'google-drive-delivery',
      question: 'How does Google Drive instant delivery work after payment?',
      summary: 'Instant on-screen unlock within 5 seconds + automated WhatsApp delivery.',
      details: 'When you complete checkout via UPI QR code, PhonePe, Google Pay, or Paytm, our real-time verification engine unlocks your permanent Google Drive access folder immediately. You can download videos individually or sync the entire folder directly to your Google Drive account without downloading to your phone storage.'
    },
    {
      id: 'viral-niches',
      question: 'Which niches and categories are available in CheapReels bundles?',
      summary: '130+ high-engagement niches including AI Videos, Motivation, Luxury, Fitness, and Devotional.',
      details: 'Popular categories include AI Cat & Dog funny reels, AI Fitness Avatars, Space Aesthetics, Luxury Cars & Supercars, Sanatan Dharma & Spiritual, Hindi/English Motivational Quotes, Anime & Cartoon clips, Art & ASMR, and Trading/Crypto reels.'
    },
    {
      id: 'refund-policy',
      question: 'What is the refund and replacement policy for digital downloads?',
      summary: '100% active link guarantee with 7-day link replacement warranty.',
      details: `Because all products are delivered as immediate digital access cloud folders, we provide a 7-day guarantee: if any cloud link is broken or file corrupted, our support team refreshes or replaces the folder within 1 hour via WhatsApp (${waDisplay}) or email (${config.supportEmail || 'reelscheap@gmail.com'}).`
    }
  ];

  return (
    <section id="brand-knowledge-hub" className="py-14 sm:py-20 border-b border-slate-300 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with AI Search Badge */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Knowledge & AI Search Transparency Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Know About CheapReels
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2">
            Verifiable entity specifications, licensing terms, and answers to common creator questions.
          </p>
        </div>

        {/* 3-Column Entity Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          
          {/* Card 1: What We Offer */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">2,50,000+ Ready Reels</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curated vertical videos rendered in pristine 1080x1920 MP4 resolution. Pre-edited with viral background audio, ready to schedule and post in seconds.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero watermarks or logos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>130+ viral creator niches</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Commercial & resell rights</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Delivery & Access */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Instant Cloud Delivery</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated Google Drive cloud links unlock immediately upon payment. No waiting, no manual file transfers, and no expiration dates.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>5-second instant on-screen unlock</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Automated WhatsApp backup link</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Permanent lifetime cloud access</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Trust & Support */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Trust & Direct Support</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trusted by 10,000+ Indian creators, agency owners, and digital marketers with genuine human support via WhatsApp and email.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct WhatsApp: <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 underline decoration-emerald-500/40">{waDisplay}</a></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Official Email: {config.supportEmail || 'Verified Helpdesk'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>7-Day link replacement warranty</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Conversational Answer Engine (AEO) Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-black text-white">
              Frequently Asked Creator & Search Questions
            </h3>
            <p className="text-xs text-slate-400">
              Direct, transparent answers designed for creators and AI search assistants.
            </p>
          </div>

          {aeoAnswers.map((item, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div 
                key={item.id}
                className="bg-slate-800/60 border border-slate-700/70 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setActiveAccordion(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 hover:bg-slate-800 transition cursor-pointer"
                >
                  <span className="font-extrabold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
                    <span className="text-amber-400 font-mono text-xs">Q:</span>
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 border-t border-slate-700/50 space-y-2 animate-fadeIn">
                    <p className="font-bold text-amber-300">
                      {item.summary}
                    </p>
                    <p className="leading-relaxed text-slate-300">
                      {item.details}
                    </p>
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
