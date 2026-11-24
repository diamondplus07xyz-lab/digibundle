import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  Eye,
  Clock,
  Compass,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Calendar,
  Radio,
  Layers,
  Sparkles,
  ExternalLink,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { computeAnalyticsMetrics } from '../utils/trafficTracker';

// Flag helper
const countryFlag = (code) => {
  if (!code || code === 'GLOBAL') return '🌐';
  const c = code.toUpperCase();
  if (c === 'IN') return '🇮🇳';
  if (c === 'US') return '🇺🇸';
  if (c === 'GB') return '🇬🇧';
  if (c === 'CA') return '🇨🇦';
  if (c === 'AU') return '🇦🇺';
  if (c === 'AE') return '🇦🇪';
  if (c === 'SG') return '🇸🇬';
  if (c === 'DE') return '🇩🇪';
  if (c === 'FR') return '🇫🇷';
  if (c === 'BR') return '🇧🇷';
  if (c === 'PK') return '🇵🇰';
  if (c === 'BD') return '🇧🇩';
  if (c === 'NP') return '🇳🇵';
  return '🌐';
};

// Relative time helper
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function TrafficAnalytics({ visitorStats, onSyncWithCloud }) {
  const [timeRange, setTimeRange] = useState('all'); // 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'all'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(6);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Compute metrics from real recorded analytics
  const metrics = useMemo(() => {
    return computeAnalyticsMetrics(timeRange);
  }, [timeRange, refreshTrigger]);

  // Auto-refresh countdown every second
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          setRefreshTrigger((c) => c + 1);
          setLastRefreshedAt(new Date());
          return 6;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((c) => c + 1);
    setLastRefreshedAt(new Date());
    setRefreshCountdown(6);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Safe percentage helper
  const pct = (val, total) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* 1. REAL-TIME VISITORS PULSE RADAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Visitor Radar
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  Real-Time Heartbeat
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                Website Traffic & Visitor Analytics
              </h2>
            </div>
          </div>

          {/* Controls: Auto-refresh & Manual Refresh */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              Auto-Refresh: {autoRefresh ? `Live (${refreshCountdown}s)` : 'Paused'}
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Live Visitor Count Banner */}
        <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Online Right Now
              </span>
              <div className="text-3xl font-black text-emerald-400 flex items-baseline gap-1.5">
                {metrics.activeVisitorsCount}
                <span className="text-xs font-semibold text-slate-400">visitors</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 font-medium">
                Active in last 5 minutes
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Today's Visitors
              </span>
              <div className="text-3xl font-black text-amber-400 flex items-baseline gap-1.5">
                {metrics.todayVisitors}
                <span className="text-xs font-semibold text-slate-400">unique</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Yesterday: {metrics.yesterdayVisitors} unique
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Avg Engagement Time
              </span>
              <div className="text-3xl font-black text-indigo-300">
                {metrics.avgEngagementTime}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Bounce Rate: {metrics.bounceRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Active Visitors Table / List */}
        <div className="relative mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Active Visitors on Site ({metrics.liveVisitorsList.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Auto-updating every 5-10s
            </span>
          </div>

          {metrics.liveVisitorsList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Radio className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-300">
                No visitors active on the website in the last 5 minutes.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                Strict zero-fake data active: As soon as a real customer visits any page on your website, their active session, live URL, device, and location will light up here instantly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden bg-black/30">
              {metrics.liveVisitorsList.map((v) => (
                <div
                  key={v.visitorId}
                  className="p-3.5 hover:bg-white/5 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shrink-0 mt-1 sm:mt-0 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          {v.visitorId}
                        </span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          {v.device === 'Mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                          ) : v.device === 'Tablet' ? (
                            <Tablet className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {v.device}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{v.browser} ({v.os})</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <span>{countryFlag(v.countryCode)}</span>
                          <span>{v.country}</span>
                          <span className="text-[10px] text-slate-400">({v.city})</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Live on:
                        </span>
                        <span className="text-slate-200 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {v.currentPage}
                        </span>
                        {v.landingPage && (
                          <>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-400">
                              Landed via: <span className="text-slate-300 font-mono">{v.landingPage}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="self-end md:self-center shrink-0 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {formatRelativeTime(v.lastActive)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. TIME RANGE FILTERS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Analytics Time Filter:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' },
            { id: 'all', label: 'All Time' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimeRange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. WEBSITE TRAFFIC OVERVIEW GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unique Visitors</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {metrics.uniqueVisitors.toLocaleString()}
          </h4>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Strict distinct visitors (no duplicates)
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Page Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {metrics.totalPageViews.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
            Total impressions in range
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sessions</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {metrics.totalSessions.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
            30-minute visitor windows
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bounce Rate</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {metrics.bounceRate}%
          </h4>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
            Single-page visits
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Today's Visitors
          </span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {metrics.todayVisitors.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">Since 12:00 AM today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Yesterday's Visitors
          </span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {metrics.yesterdayVisitors.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">Full previous day</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Last 7 Days
          </span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {metrics.last7DaysVisitors.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">Weekly visitors</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Last 30 Days (Monthly)
          </span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {metrics.last30DaysVisitors.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">Monthly visitors</span>
        </div>
      </div>

      {/* New vs Returning Breakdown Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Visitor Loyalty: New vs Returning Visitors
          </span>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              New: {metrics.newVisitorsCount} ({pct(metrics.newVisitorsCount, metrics.uniqueVisitors)}%)
            </span>
            <span className="text-indigo-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Returning: {metrics.returningVisitorsCount} ({pct(metrics.returningVisitorsCount, metrics.uniqueVisitors)}%)
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct(metrics.newVisitorsCount, metrics.uniqueVisitors)}%` }}
            title={`New Visitors: ${metrics.newVisitorsCount}`}
          />
          <div
            className="bg-indigo-500 transition-all duration-500"
            style={{ width: `${pct(metrics.returningVisitorsCount, metrics.uniqueVisitors)}%` }}
            title={`Returning Visitors: ${metrics.returningVisitorsCount}`}
          />
        </div>
      </div>

      {/* 4. TRAFFIC ANALYTICS CHARTS (INTERACTIVE SVG TIME SERIES) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              Traffic Analytics Chart Over Time
            </h3>
            <p className="text-[11px] text-slate-500">
              {timeRange === 'today' || timeRange === 'yesterday'
                ? 'Hourly distribution of visitors & page views'
                : 'Daily distribution of visitors & page views'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              <span className="text-slate-700">Unique Visitors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-600" />
              <span className="text-slate-700">Page Views</span>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Display */}
        {metrics.chartData.length === 0 || metrics.chartData.every((d) => d.views === 0) ? (
          <div className="py-12 text-center text-slate-400">
            <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-600">No chart traffic recorded in this date range.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Real visits will plot hourly and daily curves here automatically.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-56 w-full flex items-end gap-1.5 sm:gap-2 pt-6 px-1">
              {metrics.chartData.map((d, idx) => {
                const maxVal = Math.max(
                  ...metrics.chartData.map((b) => Math.max(b.views, b.visitors, 1))
                );
                const viewHeight = Math.max(Math.round((d.views / maxVal) * 100), d.views > 0 ? 8 : 2);
                const visitorHeight = Math.max(Math.round((d.visitors / maxVal) * 100), d.visitors > 0 ? 8 : 2);

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      <div>{d.label}</div>
                      <div className="text-amber-400">{d.visitors} Visitors</div>
                      <div className="text-indigo-300">{d.views} Page Views</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                      {/* Visitors bar */}
                      <div
                        className="w-1/2 max-w-[14px] bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm group-hover:brightness-110 transition-all duration-300"
                        style={{ height: `${visitorHeight}%` }}
                      />
                      {/* Views bar */}
                      <div
                        className="w-1/2 max-w-[14px] bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-sm group-hover:brightness-110 transition-all duration-300"
                        style={{ height: `${viewHeight}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100 px-1 overflow-x-auto">
              {metrics.chartData.map((d, i) => {
                // Show every nth label on mobile to avoid overcrowding
                const showLabel =
                  metrics.chartData.length <= 12 ||
                  i === 0 ||
                  i === metrics.chartData.length - 1 ||
                  i % Math.ceil(metrics.chartData.length / 8) === 0;

                return (
                  <span key={i} className={`text-center ${showLabel ? 'visible' : 'invisible'}`}>
                    {d.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. TRAFFIC SOURCES & DEVICE / GEOGRAPHY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" />
              Traffic Sources & Channels
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {metrics.trafficSources.length} Channels Recorded
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.trafficSources.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{s.count} visits</span>
                    <span className="text-slate-400 text-[10px] w-8 text-right font-medium">{s.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.max(s.percentage, s.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Country Breakdown */}
        <div className="space-y-4">
          {/* Device Distribution */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-purple-500" />
              Device Type Distribution
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <Smartphone className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-purple-800 uppercase">Mobile</span>
                <div className="text-lg font-black text-purple-950 mt-0.5">
                  {metrics.devices.Mobile}
                </div>
                <span className="text-[10px] text-purple-700 font-semibold">
                  {pct(metrics.devices.Mobile, metrics.totalPageViews)}%
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Monitor className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Desktop</span>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  {metrics.devices.Desktop}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {pct(metrics.devices.Desktop, metrics.totalPageViews)}%
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <Tablet className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-blue-800 uppercase">Tablet</span>
                <div className="text-lg font-black text-blue-950 mt-0.5">
                  {metrics.devices.Tablet}
                </div>
                <span className="text-[10px] text-blue-700 font-semibold">
                  {pct(metrics.devices.Tablet, metrics.totalPageViews)}%
                </span>
              </div>
            </div>
          </div>

          {/* Country-wise Visitors */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Globe className="w-4 h-4 text-emerald-500" />
              Country & Regional Visitors
            </h3>

            {metrics.countries.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">No geographical data recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {metrics.countries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{countryFlag(c.countryCode)}</span>
                      <span className="font-bold text-slate-800">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{c.count} visits</span>
                      <span className="text-slate-400 text-[10px] font-medium w-8 text-right">{c.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. TOP PAGES PERFORMANCE TABLE */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              Top Pages Performance
            </h3>
            <p className="text-[11px] text-slate-500">
              Page views, unique visitors, avg engagement, landing & exit pages
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {metrics.topPages.length} Pages Tracked
          </span>
        </div>

        {metrics.topPages.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center font-medium">
            Waiting for page navigation events to be recorded...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Page / URL</th>
                  <th className="py-2.5 px-3 text-right">Page Views</th>
                  <th className="py-2.5 px-3 text-right">Unique Visitors</th>
                  <th className="py-2.5 px-3 text-right">Avg Engagement</th>
                  <th className="py-2.5 px-3 text-right">Landings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.topPages.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{p.page}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{p.title}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {p.pageViews.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                      {p.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {p.avgEngagementFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {p.landingCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. FIRST-PARTY PRIVACY & INTEGRITY BADGE */}
      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold">100% First-Party Privacy & Anti-Fabrication Guarantee:</strong>
          <p className="text-[11px] text-emerald-900/90 mt-0.5 leading-relaxed">
            All analytics metrics above are strictly computed from real, non-bot storefront visitors. Zero simulated traffic, zero random numbers, and zero third-party cookie trackers. Admin visits from the owner are automatically filtered out.
          </p>
        </div>
      </div>
    </div>
  );
}
