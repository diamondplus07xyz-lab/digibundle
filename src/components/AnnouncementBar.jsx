import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';
import { t, detectUserLanguage } from '../utils/i18n';

export default function AnnouncementBar({ text, enabled = true }) {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 52);
  const lang = detectUserLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!enabled) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayText = lang === 'en' ? (text || t('announcement')) : t('announcement');

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-white text-[11px] sm:text-xs md:text-sm font-medium py-2 px-3 text-center shadow-sm relative overflow-hidden flex flex-wrap items-center justify-center gap-2">
      <span className="flex items-center gap-1.5 font-bold tracking-wide">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
        <span className="text-white font-semibold break-words">
          {displayText}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 border border-slate-800 shrink-0">
        <Clock className="w-3 h-3 text-amber-400" />
        {t('endsIn')}: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
