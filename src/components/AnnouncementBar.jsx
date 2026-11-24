import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

export default function AnnouncementBar({ text, enabled = true }) {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 52);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!enabled) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b border-amber-400/70 text-slate-950 text-[11px] sm:text-xs md:text-sm font-semibold py-2 px-3 text-center shadow-xs relative overflow-hidden flex flex-wrap items-center justify-center gap-2">
      <span className="flex items-center gap-1.5 font-black tracking-wide">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 fill-orange-500 animate-pulse shrink-0" />
        <span className="text-slate-950 font-bold break-words">
          {text || "✨ DIGIBUNDLE STUDIO: 50 Handcrafted 1080p Reels Bundles • 100% Watermark-Free • Lifetime Cloud Access"}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 bg-slate-950 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black text-amber-300 border border-slate-900 shadow-xs shrink-0">
        <Clock className="w-3 h-3 text-amber-400" />
        Ends in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
