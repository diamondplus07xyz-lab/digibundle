import React from 'react';
import { X, ShieldAlert, FileText, RefreshCw, HelpCircle } from 'lucide-react';

export default function PolicyModal({ type, onClose }) {
  if (!type) return null;

  const contentMap = {
    refund: {
      title: '7-Day Replacement & Refund Policy',
      icon: RefreshCw,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            At <strong>DigiBundle</strong>, we strive to deliver top quality vertical video bundles instantly. Because our products are non-tangible, irrevocable digital goods delivered via cloud storage, refunds are governed strictly under the following terms:
          </p>
          <h4 className="font-bold text-white text-sm">1. Eligible Refund Scenarios:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Corrupted, broken, or unplayable video files that our support team cannot fix within 48 hours.</li>
            <li>Inaccessible Google Drive links or missing folders that remain unresolved after reporting.</li>
            <li>Accidental duplicate transaction charges for the same order.</li>
          </ul>
          <h4 className="font-bold text-white text-sm">2. Non-Refundable Scenarios:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>"Change of mind" after the Google Drive link has already been opened or downloaded.</li>
            <li>Social media algorithm performance, view counts, or channel monetization decisions made by third-party platforms (Instagram/YouTube/TikTok).</li>
          </ul>
          <p>
            To request technical support or link replacement, message our official WhatsApp support with your Order ID.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service & Licensing',
      icon: FileText,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            By purchasing digital assets from DigiBundle, you agree to the following terms:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Digital Delivery:</strong> All purchases grant non-exclusive access to hosted cloud folders (Google Drive). You are responsible for downloading and archiving copies for your personal or commercial use.</li>
            <li><strong>Commercial & Resell Rights:</strong> Customers are granted rights to edit, re-purpose, remix, and upload these video clips across their social media handles (Instagram Reels, YouTube Shorts, Facebook, TikTok).</li>
            <li><strong>Platform Compliance:</strong> Users agree to abide by the Community Guidelines and Terms of Service of the respective platforms on which they post. DigiBundle is an independent digital provider and is not affiliated with Instagram, Meta, YouTube, or Google.</li>
          </ul>
        </div>
      )
    },
    about: {
      title: 'About DigiBundle',
      icon: HelpCircle,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>DigiBundle</strong> is India's most affordable digital asset repository for content creators, agencies, affiliate marketers, and theme page owners.
          </p>
          <p>
            We curate, organize, and optimize high-definition 1080x1920 vertical video clips across 130+ viral niches so creators don't have to spend 6+ hours editing every single day.
          </p>
          <p>
            Our mission is simple: <strong>High Quality at Unbeatable Low Prices (starting from just ₹19).</strong>
          </p>
        </div>
      )
    }
  };

  const item = contentMap[type] || contentMap.about;
  const IconComponent = item.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {item.body}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
