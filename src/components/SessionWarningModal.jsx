import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

export default function SessionWarningModal({ isOpen, remainingSeconds, onExtend, onLogout }) {
  const [seconds, setSeconds] = useState(remainingSeconds || 60);

  useEffect(() => {
    setSeconds(remainingSeconds || 60);
  }, [remainingSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 text-center space-y-5">
        
        {/* Animated Warning Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8 animate-pulse text-amber-400" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Security Inactivity Guard
          </span>
          <h3 className="text-xl font-black text-white">Your Session is About to Expire</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            You have been inactive for some time. For security reasons, your administrative session will be automatically terminated.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase text-slate-400">Auto-Logout In</div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onExtend}
            className="w-full flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In (Extend)</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
