import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  LogOut, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  Lock, 
  Activity, 
  X, 
  Copy, 
  Check,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { 
  getAllSessions, 
  getCurrentSessionId, 
  terminateSession, 
  terminateAllOtherSessions, 
  terminateAllSessions, 
  getSessionTimeoutMinutes, 
  setSessionTimeoutMinutes 
} from '../utils/sessionManager';

export default function SessionManagerDashboard({ onLogoutCurrent, onAddLog }) {
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [timeoutMins, setTimeoutMins] = useState(15);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, sessionId: null });
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');

  const refreshSessions = () => {
    const list = getAllSessions();
    setSessions(list);
    setCurrentId(getCurrentSessionId());
    setTimeoutMins(getSessionTimeoutMinutes());
  };

  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const handleCopy = (id) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Session ID copied to clipboard');
    } catch (e) {}
  };

  const handleTimeoutChange = (newMins) => {
    const valid = setSessionTimeoutMinutes(newMins);
    setTimeoutMins(valid);
    if (onAddLog) {
      onAddLog('ADMIN', 'Session Timeout Updated', `Admin session inactivity timeout changed to ${valid} minutes.`, {
        targetEntity: 'SessionSecurity',
        metadata: { timeoutMinutes: valid }
      });
    }
    showToast(`Inactivity timeout set to ${valid} minutes.`);
  };

  // Terminate Single Remote Session
  const handleTerminateSingle = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    terminateSession(sessionId, 'Revoked by administrator from Sessions Dashboard');
    refreshSessions();
    if (onAddLog) {
      onAddLog('ADMIN', 'Session Terminated', `Terminated active session (${session?.deviceType || 'Device'} - ${session?.browser || 'Browser'}).`, {
        targetEntity: 'AdminSession',
        targetId: sessionId,
        metadata: { browser: session?.browser, os: session?.os, ip: session?.ip }
      });
    }
    showToast('Session terminated successfully.');
    setConfirmModal({ isOpen: false, type: null, sessionId: null });
  };

  // Terminate All Other Sessions
  const handleTerminateAllOther = () => {
    const { terminatedCount } = terminateAllOtherSessions(currentId, 'Revoked via "Logout From All Other Devices"');
    refreshSessions();
    if (onAddLog) {
      onAddLog('ADMIN', 'Logout From Other Devices', `Terminated ${terminatedCount} other active session(s) across all remote devices.`, {
        targetEntity: 'AdminSession',
        metadata: { terminatedCount }
      });
    }
    showToast(`Logged out ${terminatedCount} other device(s) successfully.`);
    setConfirmModal({ isOpen: false, type: null, sessionId: null });
  };

  // Terminate All Sessions (Including Current)
  const handleTerminateAll = () => {
    if (onAddLog) {
      onAddLog('ADMIN', 'Logout From All Devices', 'Administrator terminated all active sessions across all devices.', {
        targetEntity: 'AdminSession',
        metadata: { action: 'LOGOUT_ALL_DEVICES' }
      });
    }
    terminateAllSessions('Revoked via "Logout From All Devices"');
    setConfirmModal({ isOpen: false, type: null, sessionId: null });
    if (onLogoutCurrent) {
      onLogoutCurrent({ reason: 'Logged out from all devices' });
    }
  };

  const currentSession = sessions.find(s => s.id === currentId && s.status === 'active');
  const otherActiveSessions = sessions.filter(s => s.id !== currentId && s.status === 'active');
  const pastSessions = sessions.filter(s => s.status === 'terminated').slice(0, 10);

  const getDeviceIcon = (deviceType) => {
    const t = (deviceType || '').toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <Smartphone className="w-5 h-5" />;
    if (t.includes('tablet') || t.includes('ipad')) return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  const formatEpoch = (epoch) => {
    if (!epoch) return 'Just now';
    return new Date(epoch).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast('')} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Sessions & Authentication Security</h2>
              <p className="text-xs text-slate-400">Manage active logged-in devices, session timeouts, and remote revocation</p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {otherActiveSessions.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmModal({ isOpen: true, type: 'terminate_other' })}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Other Devices ({otherActiveSessions.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setConfirmModal({ isOpen: true, type: 'terminate_all' })}
            className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Logout From All Devices</span>
          </button>
        </div>
      </div>

      {/* Security Policies & Timeout Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inactivity Timeout Config */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-900">Inactivity Timeout</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
              {timeoutMins} Mins
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automatically terminates administrator session when no keyboard or mouse activity is detected.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {[5, 15, 30, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => handleTimeoutChange(mins)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  timeoutMins === mins
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Session Fixation Guard */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-slate-900">Session Fixation Guard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Session tokens rotate automatically on every successful login with cryptographically secure random identifiers.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Token Rotation Active</span>
          </div>
        </div>

        {/* Cookie Security Policy */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-900">Cookie Security Policy</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Auth tokens operate with Strict SameSite, Secure flags, and instant cache revocation on session termination.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-200">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>SameSite=Strict & Secure</span>
          </div>
        </div>
      </div>

      {/* 1. CURRENT SESSION (THIS DEVICE) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span>Current Session (This Device)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </h3>

        {currentSession ? (
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-5 border-2 border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  {getDeviceIcon(currentSession.deviceType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{currentSession.browser}</span>
                    <span className="text-xs text-slate-400">on {currentSession.os}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active Now
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1 font-mono">
                    <span>IP / Device: {currentSession.ip || 'Localhost'}</span>
                    <span>•</span>
                    <span>Type: {currentSession.deviceType}</span>
                  </div>
                </div>
              </div>

              {/* Log Out This Device Button */}
              <button
                type="button"
                onClick={() => onLogoutCurrent({ reason: 'Admin clicked Logout This Device' })}
                className="w-full sm:w-auto px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out This Device</span>
              </button>
            </div>

            {/* Session Detail Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-500">Sign-In Time</div>
                <div className="text-slate-200 font-medium text-[11px] truncate">{formatEpoch(currentSession.createdEpoch)}</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-500">Last Activity</div>
                <div className="text-slate-200 font-medium text-[11px] truncate">{formatEpoch(currentSession.lastActiveEpoch)}</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-500">Auto-Logout In</div>
                <div className="text-amber-400 font-black text-[11px]">{timeoutMins} Mins Inactivity</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">Session ID</div>
                  <div className="text-slate-300 font-mono text-[10px] truncate max-w-[100px]">{currentSession.id}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentSession.id)}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy Session ID"
                >
                  {copiedId === currentSession.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No active session metadata found for this device.
          </div>
        )}
      </div>

      {/* 2. OTHER ACTIVE SESSIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>Other Active Logged-In Sessions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {otherActiveSessions.length}
            </span>
          </h3>
        </div>

        {otherActiveSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherActiveSessions.map(sess => (
              <div key={sess.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      {getDeviceIcon(sess.deviceType)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{sess.browser} on {sess.os}</div>
                      <div className="text-[11px] text-slate-500 font-mono">IP: {sess.ip || 'Unknown'} • {sess.deviceType}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmModal({ isOpen: true, type: 'terminate_single', sessionId: sess.id })}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Terminate this session immediately"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Terminate</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Logged In:</span>
                    <span className="text-slate-700 font-medium">{formatEpoch(sess.createdEpoch)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Last Active:</span>
                    <span className="text-slate-700 font-medium">{formatEpoch(sess.lastActiveEpoch)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-xs font-bold text-slate-800">You are only logged in on this device</div>
            <div className="text-[11px] text-slate-400">No other concurrent sessions or devices have access to the admin console.</div>
          </div>
        )}
      </div>

      {/* 3. SESSION AUDIT TRAIL / RECENTLY TERMINATED */}
      {pastSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Recently Revoked Sessions History ({pastSessions.length})
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
            {pastSessions.map(p => (
              <div key={p.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {getDeviceIcon(p.deviceType)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{p.browser} on {p.os}</div>
                    <div className="text-[10px] text-slate-400">{p.terminatedReason || 'Terminated'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                    Terminated
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{formatEpoch(p.terminatedEpoch)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                {confirmModal.type === 'terminate_all' && 'Logout From All Devices?'}
                {confirmModal.type === 'terminate_other' && 'Logout From All Other Devices?'}
                {confirmModal.type === 'terminate_single' && 'Terminate This Remote Session?'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmModal.type === 'terminate_all' && 'This will immediately revoke all active sessions across all devices (including this device). You will need to log in again with your passcode.'}
                {confirmModal.type === 'terminate_other' && 'All other mobile or desktop devices will be instantly logged out and their authentication tokens revoked.'}
                {confirmModal.type === 'terminate_single' && 'The selected device will be immediately disconnected and prevented from accessing the admin console.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: null, sessionId: null })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'terminate_all') handleTerminateAll();
                  else if (confirmModal.type === 'terminate_other') handleTerminateAllOther();
                  else if (confirmModal.type === 'terminate_single') handleTerminateSingle(confirmModal.sessionId);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm & Revoke
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
