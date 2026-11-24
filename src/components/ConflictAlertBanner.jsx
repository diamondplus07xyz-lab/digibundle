import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { realtimeSync } from '../utils/realtimeSync';

export default function ConflictAlertBanner({ onApplyRemoteUpdate, onKeepLocalEdits }) {
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    const unsubscribe = realtimeSync.subscribeStatus((status) => {
      setConflict(status.activeConflict);
    });
    return () => unsubscribe();
  }, []);

  if (!conflict) return null;

  const handleResolve = (action) => {
    if (action === 'remote') {
      if (onApplyRemoteUpdate) onApplyRemoteUpdate(conflict.incomingData);
    } else {
      if (onKeepLocalEdits) onKeepLocalEdits();
    }
    realtimeSync.clearActiveConflict();
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-400/40 px-4 py-3 text-slate-900 shadow-xs animate-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Concurrent Device Update Detected
              </h4>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-bold">
                CONFLICT GUARD
              </span>
            </div>
            <p className="text-xs text-amber-900">
              {conflict.message || 'Another device recently modified this data. Choose which version to keep:'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleResolve('keep')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            title="Keep what you have typed in this browser"
          >
            <Check className="w-3.5 h-3.5 text-slate-600" />
            <span>Keep My Local Edits</span>
          </button>

          <button
            type="button"
            onClick={() => handleResolve('remote')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 rounded-xl text-xs font-black transition shadow-xs cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            title="Discard local edits and load latest updates from other device"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Latest from Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
}
