import React from 'react';
import { CheckCircle2, ShieldCheck, Film, Download, Sparkles, Award } from 'lucide-react';

export default function UrgencyNotification({ enabled = true }) {
  if (!enabled) return null;

  return (
    <div className="w-full py-5 border-b border-amber-200/70 bg-amber-50/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Platform Compatibility */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-600" />
              Platform Ready:
            </span>
            <div className="flex items-center gap-2">
              {['Instagram Reels', 'YouTube Shorts', 'TikTok', 'Facebook'].map((plat) => (
                <span key={plat} className="text-xs font-bold text-slate-800 bg-white/95 border border-amber-200 px-3 py-1 rounded-xl shadow-2xs">
                  {plat}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Studio Guarantee Badges */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-800 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Watermark Free</span>
            </div>
            <span className="text-amber-300 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-1.5 text-blue-700">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Instant Google Drive Delivery</span>
            </div>
            <span className="text-amber-300 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-1.5 text-amber-800">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Commercial Resell Rights</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
