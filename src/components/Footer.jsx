import React from 'react';
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer({ config, onOpenPolicy }) {
  const footerLogo = config.footerLogo || config.logo || "/logo-dark.png";
  const supportEmail = config.supportEmail || "support@digibundle.in";

  return (
    <footer className="bg-slate-950 border-t-4 border-amber-400 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 shadow-2xl relative z-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          {/* Col 1: Brand & Uploadable Footer Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-white/40 inline-flex items-center">
                <BrandLogo 
                  variant="light" 
                  customSrc="/logo.png" 
                  alt={config.storeName || 'DigiBundle'} 
                  size="md" 
                />
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              India's favorite digital store for 1080p Full HD vertical video reels bundles with instant Google Drive cloud delivery.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Watermark-Free & Instant Unlock</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Popular Niches
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Master All-In-One Vault</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Gym, Fitness &amp; Motivation</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Sanatan &amp; Spiritual Reels</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Luxury Cars &amp; Supercar Edits</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">AI Niches &amp; Avatars</a></li>
            </ul>
          </div>

          {/* Col 3: Support & Policy */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onOpenPolicy('refund')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  7-Day Replacement Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  Terms of Service &amp; Licensing
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  About DigiBundle
                </button>
              </li>
              <li className="pt-1 flex items-center gap-1.5 font-semibold text-white">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: +{config.whatsappNumber || '917017324978'}</span>
              </li>
              <li className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a href={`mailto:${supportEmail}`} className="hover:underline">{supportEmail}</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Apps */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Supported Payment Modes
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              Instant automated checkout via all Indian UPI apps:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-slate-900 text-purple-300 rounded-lg font-bold text-[11px] border border-slate-800">PhonePe</span>
              <span className="px-2.5 py-1 bg-slate-900 text-blue-300 rounded-lg font-bold text-[11px] border border-slate-800">Google Pay</span>
              <span className="px-2.5 py-1 bg-slate-900 text-cyan-300 rounded-lg font-bold text-[11px] border border-slate-800">Paytm</span>
              <span className="px-2.5 py-1 bg-slate-900 text-amber-300 rounded-lg font-bold text-[11px] border border-slate-800">Direct UPI QR</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Made By Vivek Singh (Zero Admin Links) */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} {config.storeName || 'DigiBundle'}. All rights reserved.</p>
          
          <div className="flex items-center gap-2 text-xs font-semibold bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-amber-400/40 text-slate-200 shadow-sm">
            <span>Made with <span className="text-rose-500">❤️</span> by</span>
            <span className="text-amber-400 font-black tracking-wide">Vivek Singh</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
