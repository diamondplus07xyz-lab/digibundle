import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  Power, 
  Key, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  Lock, 
  Activity, 
  Check, 
  Copy, 
  Radio
} from 'lucide-react';
import { verifyAdminPasscode } from '../utils/security';
import BrandLogo from './BrandLogo';

export default function MaintenanceScreen({ config, onUnlockAdmin, onTurnOffMaintenance }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Dynamic SEO & 503 Service Unavailable Meta Tags Injection
  useEffect(() => {
    const prevTitle = document.title;
    const storeName = config?.storeName || 'DigiBundle';
    document.title = `[Maintenance] System Upgrade in Progress — ${storeName}`;

    // Inject <meta name="robots" content="noindex, nofollow" />
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const createdRobots = !robotsMeta;
    let prevRobotsContent = '';
    if (robotsMeta) {
      prevRobotsContent = robotsMeta.getAttribute('content') || '';
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'noindex, nofollow';
      document.head.appendChild(robotsMeta);
    }

    // Inject simulated HTTP 503 Service Unavailable and dynamic Retry-After meta headers
    const reopenMs = config?.maintenanceReopenTimestamp ? new Date(config.maintenanceReopenTimestamp).getTime() : 0;
    const secondsRemaining = reopenMs && !isNaN(reopenMs) ? Math.max(60, Math.floor((reopenMs - Date.now()) / 1000)) : 7200;

    const retryMeta = document.createElement('meta');
    retryMeta.httpEquiv = 'Retry-After';
    retryMeta.content = String(secondsRemaining);
    retryMeta.id = 'maintenance-retry-meta';
    document.head.appendChild(retryMeta);

    const statusMeta = document.createElement('meta');
    statusMeta.httpEquiv = 'status';
    statusMeta.content = '503 Service Unavailable';
    statusMeta.id = 'maintenance-status-503-meta';
    document.head.appendChild(statusMeta);

    return () => {
      document.title = prevTitle;
      if (createdRobots && robotsMeta?.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      } else if (robotsMeta) {
        robotsMeta.setAttribute('content', prevRobotsContent || 'index, follow');
      }
      const existingRetry = document.getElementById('maintenance-retry-meta');
      if (existingRetry && existingRetry.parentNode) {
        existingRetry.parentNode.removeChild(existingRetry);
      }
      const existingStatus = document.getElementById('maintenance-status-503-meta');
      if (existingStatus && existingStatus.parentNode) {
        existingStatus.parentNode.removeChild(existingStatus);
      }
    };
  }, [config?.storeName, config?.maintenanceReopenTimestamp]);

  // Live Timer tick every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic countdown
  const countdown = useMemo(() => {
    let targetTime = null;
    if (config?.maintenanceReopenTimestamp) {
      const parsed = new Date(config.maintenanceReopenTimestamp).getTime();
      if (!isNaN(parsed)) {
        targetTime = parsed;
      }
    }

    // Fallback: 2 hours from first load if not set
    if (!targetTime) {
      targetTime = now + (2 * 60 * 60 * 1000);
    }

    const diff = Math.max(0, targetTime - now);
    const isCompleted = diff <= 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isCompleted, diff };
  }, [config?.maintenanceReopenTimestamp, now]);

  // Progress percentage (0 - 100)
  const progressPercent = Math.min(100, Math.max(5, Number(config?.maintenanceProgress ?? 68)));

  // Tasks configuration
  const tasks = {
    server: config?.maintenanceTasks?.server || 'completed',
    database: config?.maintenanceTasks?.database || 'in_progress',
    security: config?.maintenanceTasks?.security || 'pending'
  };

  // Support Contacts
  const whatsappNumber = config?.whatsappNumber || '7017324978';
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const finalWaNumber = cleanNumber.startsWith('91') && cleanNumber.length === 12 ? cleanNumber : `91${cleanNumber}`;
  const whatsappUrl = `https://wa.me/${finalWaNumber}?text=${encodeURIComponent("Hi Admin, I was visiting DigiBundle but the site is undergoing scheduled maintenance. Please notify me once it's back live!")}`;
  const supportEmail = config?.supportEmail || 'support@digibundle.in';

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter admin passcode');
      return;
    }
    setIsVerifying(true);
    setAuthError('');
    try {
      const isValid = await verifyAdminPasscode(passcode.trim(), config?.adminPasscode);
      if (isValid) {
        setIsUnlocked(true);
        setAuthError('');
      } else {
        setAuthError('Invalid administrator passcode.');
      }
    } catch {
      setAuthError('Authentication verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs shadow-emerald-500/10">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Completed</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs shadow-amber-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>In Progress</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Queued</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans antialiased">
      
      {/* Background Cybernetic Ambient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      <div className="absolute -top-32 -left-32 w-96 sm:w-[520px] h-96 sm:h-[520px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-1/4 -right-32 w-96 sm:w-[560px] h-96 sm:h-[560px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <BrandLogo 
              variant="dark"
              customSrc={config?.footerLogo}
              alt={config?.storeName || "DigiBundle"}
              size="lg"
            />
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {config?.storeName || "DigiBundle"}
          </span>
        </div>

        {/* Live Status Pill & Admin Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg text-[11px] sm:text-xs font-bold text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="tracking-wide">UPGRADING SYSTEMS</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            aria-label="Admin Portal"
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer backdrop-blur-md"
            title="Administrator Access"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 my-auto relative z-10 text-center flex flex-col items-center">
        
        {/* Animated Maintenance Core Graphic */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          {/* Outer glowing pulsing orb */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-violet-500/20 blur-xl animate-pulse" />
          
          {/* Concentric rotating SVG cyber rings */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-3xl bg-slate-900/70 border border-white/10 shadow-2xl backdrop-blur-xl">
            {/* SVG rotating gear/orbital animation */}
            <svg className="absolute inset-0 w-full h-full p-2 animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-cyan-500/40" fill="none" />
              <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" className="text-indigo-400/40" fill="none" />
              <circle cx="50" cy="6" r="3" className="fill-cyan-400" />
              <circle cx="94" cy="50" r="3" className="fill-indigo-400" />
            </svg>

            {/* Central icon */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/25 to-violet-600/20 border border-white/15 flex items-center justify-center shadow-inner">
              <Server className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" />
            </div>

            {/* Mini badge icon */}
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            </div>
          </div>
        </div>

        {/* System Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-md shadow-sm">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>SYSTEM UPGRADE IN PROGRESS</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight sm:leading-tight">
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {config?.maintenanceTitle || "We're Making Things Better."}
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8 font-normal">
          {config?.maintenanceMessage || "Our team is currently performing scheduled high-performance upgrades, optimizing database queries, and hardening system security to deliver an ultra-fast experience."}
        </p>

        {/* Live Progress Bar Section */}
        <div className="w-full max-w-lg bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl mb-8 text-left">
          <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Overall Upgrade Progress</span>
            </div>
            <span className="text-cyan-400 font-bold font-mono text-sm">{progressPercent}%</span>
          </div>

          {/* Track and Fill */}
          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden relative p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer beam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] [background-size:200%_100%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Stage: Finalizing deployment & cache warm-up</span>
            <span className="text-slate-400">Target ETA: {config?.maintenanceEstimatedTime || "Shortly"}</span>
          </div>
        </div>

        {/* Live Countdown Timer Section */}
        <div className="w-full max-w-lg mb-8">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Estimated Reopening Countdown</span>
          </div>

          {countdown.isCompleted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center backdrop-blur-md shadow-lg animate-fadeIn flex items-center justify-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <div>
                <p className="text-sm sm:text-base font-black">We're Almost Back!</p>
                <p className="text-xs text-emerald-400/80 font-normal">Final verification checks are completing. The site will go live in moments.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
              {/* Days */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-md shadow-lg shadow-black/30">
                <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {String(countdown.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Days
                </div>
              </div>

              {/* Hours */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-md shadow-lg shadow-black/30">
                <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {String(countdown.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Hours
                </div>
              </div>

              {/* Minutes */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-md shadow-lg shadow-black/30">
                <div className="text-2xl sm:text-4xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  {String(countdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Minutes
                </div>
              </div>

              {/* Seconds */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-md shadow-lg shadow-black/30">
                <div className="text-2xl sm:text-4xl font-extrabold text-indigo-400 font-mono tracking-tight">
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Seconds
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3 Maintenance Status Indicators */}
        <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          {/* Server Infrastructure */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between shadow-md hover:border-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Server Infrastructure</h4>
                <p className="text-[10px] text-slate-400">Edge CDN nodes</p>
              </div>
            </div>
            <div className="mt-1">
              {getStatusBadge(tasks.server)}
            </div>
          </div>

          {/* Database Optimization */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between shadow-md hover:border-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Database Optimization</h4>
                <p className="text-[10px] text-slate-400">Cache & query sync</p>
              </div>
            </div>
            <div className="mt-1">
              {getStatusBadge(tasks.database)}
            </div>
          </div>

          {/* Security Improvements */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between shadow-md hover:border-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Security Improvements</h4>
                <p className="text-[10px] text-slate-400">Zero-Trust & SSL</p>
              </div>
            </div>
            <div className="mt-1">
              {getStatusBadge(tasks.security)}
            </div>
          </div>
        </div>

        {/* Support & Actions Section */}
        <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950 shrink-0" />
            <span>Chat on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 font-bold text-xs transition duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer backdrop-blur-md"
          >
            {copiedEmail ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Email Copied!</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Contact via Email</span>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 text-center text-xs text-slate-400 relative z-20 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} {config?.storeName || 'DigiBundle'}. All systems operational & secure.</p>
        
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Cloud Storage: Active
          </span>
          <button 
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="hover:text-slate-300 underline underline-offset-4 cursor-pointer"
          >
            Owner Login
          </button>
        </div>
      </footer>

      {/* Admin Passcode Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Administrator Access</h3>
                  <p className="text-[11px] text-slate-400">Verify credentials to unlock</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setAuthError('');
                  setPasscode('');
                }}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Enter admin passcode..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setAuthError('');
                    }}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {authError && (
                    <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Unlock</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Admin Credentials Verified!</span>
                </div>

                <p className="text-xs text-slate-300">
                  Choose an action below to manage the store or restore visitor access immediately:
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminModal(false);
                      if (onTurnOffMaintenance) {
                        onTurnOffMaintenance();
                      } else if (onUnlockAdmin) {
                        onUnlockAdmin();
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                    <span>Turn OFF Maintenance & Go Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminModal(false);
                      if (onUnlockAdmin) onUnlockAdmin();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition cursor-pointer"
                  >
                    Open Admin Control Console
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
