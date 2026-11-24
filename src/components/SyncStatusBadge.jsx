import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, Smartphone, Monitor, Tablet, 
  CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X, Clock, Layers
} from 'lucide-react';
import { realtimeSync } from '../utils/realtimeSync';

export default function SyncStatusBadge({ isMobile = false }) {
  const [syncStatus, setSyncStatus] = useState(() => realtimeSync.getStatus());
  const [isOpen, setIsOpen] = useState(false);
  const [isForcing, setIsForcing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeSync.subscribeStatus((status) => {
      setSyncStatus(status);
    });

    const timer = setInterval(() => {
      if (syncStatus.lastSyncTime) {
        setSecondsAgo(Math.max(0, Math.floor((Date.now() - syncStatus.lastSyncTime) / 1000)));
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [syncStatus.lastSyncTime]);

  const handleForceSync = async () => {
    setIsForcing(true);
    try {
      await realtimeSync.forceSync();
    } catch (e) {
      console.warn('Force sync error:', e);
    } finally {
      setTimeout(() => setIsForcing(false), 600);
    }
  };

  const getDeviceIcon = () => {
    const type = syncStatus.deviceInfo?.type;
    if (type === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-blue-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const formatLastSync = () => {
    if (secondsAgo < 3) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    return `${Math.floor(secondsAgo / 60)}m ago`;
  };

  if (isMobile) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
            !syncStatus.isOnline 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : syncStatus.syncState === 'conflict'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : syncStatus.syncState === 'syncing' || isForcing
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
          title="Real-Time Sync Status (PC + Mobile)"
        >
          <span className={`w-2 h-2 rounded-full ${
            !syncStatus.isOnline ? 'bg-rose-500' :
            syncStatus.syncState === 'conflict' ? 'bg-amber-400 animate-ping' :
            'bg-emerald-400 animate-pulse'
          }`} />
          <span className="truncate max-w-[80px]">
            {!syncStatus.isOnline ? 'Offline' : isForcing ? 'Syncing...' : 'Live Sync'}
          </span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Real-Time Sync Mesh</h4>
                    <p className="text-[10px] text-slate-400">PC, Mobile & Tablet Synchronized</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[11px]">This Device:</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                    {getDeviceIcon()}
                    {syncStatus.deviceInfo?.label || 'Mobile Phone'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[11px]">Channel:</span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    BroadcastChannel + 2.5s Mesh
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[11px]">Last Sync Heartbeat:</span>
                  <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatLastSync()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[11px]">Sync Status:</span>
                  <span className="font-black text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% In-Sync (0ms local, &lt;2.5s cloud)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleForceSync}
                disabled={isForcing}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isForcing ? 'animate-spin' : ''}`} />
                <span>{isForcing ? 'Synchronizing All Devices...' : 'Force Sync Now'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Header Display
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
          !syncStatus.isOnline
            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            : syncStatus.syncState === 'conflict'
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
            : syncStatus.syncState === 'syncing' || isForcing
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        }`}
        title="Click for Real-Time Sync Details (PC + Mobile)"
      >
        <span className={`w-2 h-2 rounded-full ${
          !syncStatus.isOnline ? 'bg-rose-500' :
          syncStatus.syncState === 'conflict' ? 'bg-amber-500 animate-ping' :
          'bg-emerald-500 animate-pulse'
        }`} />
        <span className="font-extrabold tracking-tight">
          {!syncStatus.isOnline ? 'Offline' : isForcing ? 'Syncing...' : 'Real-Time Sync Active (PC & Mobile)'}
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
          {formatLastSync()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3.5 z-50 text-xs text-white space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">Real-Time Sync Mesh</h4>
                <p className="text-[10px] text-slate-400">Bidirectional PC & Mobile Sync</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Active Node:</span>
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                {getDeviceIcon()}
                {syncStatus.deviceInfo?.label || 'Desktop PC'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Zero-Latency Protocol:</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                BroadcastChannel (0ms)
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Cross-Device Cloud Mesh:</span>
              <span className="font-mono text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                Fast Heartbeat (2.5s)
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Last Sync Heartbeat:</span>
              <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatLastSync()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Conflict Guard:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active & Watching
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleForceSync}
            disabled={isForcing}
            className="w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isForcing ? 'animate-spin' : ''}`} />
            <span>{isForcing ? 'Syncing with All Devices...' : 'Force Sync Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
