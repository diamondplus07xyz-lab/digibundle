import React from 'react';
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { isInternationalVisitor } from '../utils/geoPricing';

export default function Footer({ config = {}, onOpenPolicy }) {
  const isIntl = isInternationalVisitor();
  const footerLogo = config.footerLogo || config.logo;
  const supportEmail = config.supportEmail || "reelscheap@gmail.com";
  const rawNumber = (config.whatsappNumber || '7017324978').replace(/\D/g, '');
  const tenDigit = rawNumber.slice(-10) || '7017324978';
  const whatsappDisplay = `+91 ${tenDigit}`;
  const whatsappUrl = `https://wa.me/91${tenDigit}`;

  return (
    <footer role="contentinfo" className="bg-slate-950 border-t border-slate-800 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 shadow-2xl relative z-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          {/* Col 1: Brand & Uploadable Footer Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BrandLogo 
                variant="dark" 
                customSrc={footerLogo} 
                alt={config.storeName || 'Cheap Reels'} 
                size="md" 
              />
            </div>
            <p className="text-slate-300 leading-relaxed text-xs font-medium">
              India's favorite digital store for 1080p Full HD vertical video reels bundles with instant Google Drive cloud delivery.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Watermark-Free & Instant Unlock</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Popular Niches
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Master All-In-One Vault</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Gym, Fitness & Motivation</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Sanatan & Spiritual Reels</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">Luxury Cars & Supercar Edits</a></li>
              <li><a href="#bundles-section" className="hover:text-amber-400 transition">AI Niches & Avatars</a></li>
            </ul>
          </div>

          {/* Col 3: Support & Policy */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <button onClick={() => onOpenPolicy('refund')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  7-Day Replacement Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  Terms of Service & Licensing
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-amber-400 transition text-left cursor-pointer">
                  About Cheap Reels
                </button>
              </li>
              <li className="pt-1 flex items-center gap-1.5 font-semibold text-white">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                  WhatsApp: {whatsappDisplay}
                </a>
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
            <p className="text-xs text-slate-300 mb-2 font-medium">
              {isIntl ? 'Instant global checkout via international payment gateways:' : 'Instant automated checkout via all Indian UPI apps:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {isIntl ? (
                <>
                  <span className="px-2.5 py-1 bg-slate-900 text-sky-300 rounded-lg font-bold text-[11px] border border-slate-800">PayPal</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-emerald-300 rounded-lg font-bold text-[11px] border border-slate-800">Visa / Mastercard</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-indigo-300 rounded-lg font-bold text-[11px] border border-slate-800">Global Instant Unlock</span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 bg-slate-900 text-purple-300 rounded-lg font-bold text-[11px] border border-slate-800">PhonePe</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-blue-300 rounded-lg font-bold text-[11px] border border-slate-800">Google Pay</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-cyan-300 rounded-lg font-bold text-[11px] border border-slate-800">Paytm</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-amber-300 rounded-lg font-bold text-[11px] border border-slate-800">Direct UPI QR</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright - Clean, nothing below 2026 Cheap Reels */}
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} {config.storeName || 'Cheap Reels'}. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
