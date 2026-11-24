import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  ShieldAlert,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Server,
  Radio,
  FileSpreadsheet,
  FileCode,
  X,
  Check
} from 'lucide-react';
import {
  filterAuditLogs,
  computeAuditStats,
  exportLogsToCSV,
  exportLogsToJSON
} from '../utils/auditLogger';

export default function ActivityLogsDashboard({ logs = [], onUpdateLogs, onAddLog }) {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detailed Log Inspector Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Pulse refresh
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshCountdown(5);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Compute Overall KPI Statistics
  const stats = useMemo(() => {
    return computeAuditStats(logs);
  }, [logs]);

  // Normalize and Filter Logs
  const normalizedLogs = useMemo(() => {
    return (logs || []).map((l, idx) => {
      if (!l) return null;
      // Normalization for legacy format
      const cat = (l.category || l.type || 'ADMIN').toUpperCase();
      const eventName = l.eventName || l.type || 'EVENT';
      const actorType = l.actorType || (cat === 'USER' || cat === 'STOREFRONT' ? 'Customer' : (cat === 'SYSTEM' ? 'System' : 'Admin'));
      const status = l.status || (cat.includes('ALERT') || (l.title && l.title.toLowerCase().includes('failed')) ? 'Failed' : 'Success');
      const timestamp = l.timestamp || (typeof l.id === 'string' && l.id.startsWith('log-') ? Number(l.id.replace('log-', '')) : Date.now() - (idx * 60000));

      return {
        ...l,
        category: cat,
        eventName,
        actorType,
        status,
        timestamp,
        time: l.time || new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        actorId: l.actorId || (actorType === 'Admin' ? 'admin_master' : 'visitor_guest'),
        targetEntity: l.targetEntity || (cat === 'ORDERS' ? 'Order' : (cat === 'CATALOG' ? 'Bundle' : 'System')),
        targetId: l.targetId || '',
        device: l.device || 'Desktop',
        browser: l.browser || 'Web Browser',
        os: l.os || 'Windows',
        ip: l.ip || 'Local',
        metadata: l.metadata || {}
      };
    }).filter(Boolean);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return filterAuditLogs(normalizedLogs, {
      search: searchTerm,
      category: categoryFilter,
      actorType: actorFilter,
      status: statusFilter,
      dateRange: dateRangeFilter,
      sortOrder
    });
  }, [normalizedLogs, searchTerm, categoryFilter, actorFilter, statusFilter, dateRangeFilter, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, actorFilter, statusFilter, dateRangeFilter, sortOrder]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Export handlers
  const handleExportCSV = () => {
    const success = exportLogsToCSV(filteredLogs, `digibundle_audit_logs_${Date.now()}.csv`);
    if (success && onAddLog) {
      onAddLog('ADMIN', 'Audit Logs Exported (CSV)', `Administrator exported ${filteredLogs.length} audit log records as CSV.`, {
        eventName: 'LOGS_EXPORTED',
        targetEntity: 'AuditLog',
        metadata: { format: 'CSV', count: filteredLogs.length }
      });
    }
  };

  const handleExportJSON = () => {
    const success = exportLogsToJSON(filteredLogs, `digibundle_audit_logs_${Date.now()}.json`);
    if (success && onAddLog) {
      onAddLog('ADMIN', 'Audit Logs Exported (JSON)', `Administrator exported ${filteredLogs.length} audit log records as JSON.`, {
        eventName: 'LOGS_EXPORTED',
        targetEntity: 'AuditLog',
        metadata: { format: 'JSON', count: filteredLogs.length }
      });
    }
  };

  const copyPayloadToClipboard = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'ADMIN':
      case 'AUTH':
      case 'BRANDING':
      case 'OFFER':
      case 'ANNOUNCEMENT':
      case 'MAINTENANCE':
      case 'CATALOG':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'USER':
      case 'STOREFRONT':
      case 'ORDERS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECURITY':
      case 'SECURITY_ALERT':
      case 'LOCKOUT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'SYSTEM':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Failed
        </span>
      );
    }
    if (status === 'Warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Success
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. REAL-TIME AUDIT STREAM HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Shield className="w-6 h-6 animate-pulse" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Audit Trail
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  Immutable First-Party Storage
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                System Activity & Audit Logs
              </h2>
            </div>
          </div>

          {/* Action Controls: Auto-Refresh, Refresh, Export */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
              <span>{autoRefresh ? `Live (${refreshCountdown}s)` : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition active:scale-95 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* 2. OVERVIEW KPI METRIC CARDS */}
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Activities
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalActivities.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">All audit events</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Today's Logs
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {stats.todayActivities.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Since midnight</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Admin Actions
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {stats.adminActivities.toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-300/80">Config & catalog</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              User Actions
            </span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {stats.userActivities.toLocaleString()}
            </div>
            <span className="text-[10px] text-blue-300/80">Customer orders/cart</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Security Events
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {stats.securityEvents.toLocaleString()}
            </div>
            <span className="text-[10px] text-rose-300/80">Lockouts & alerts</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Failed Actions
            </span>
            <div className="text-2xl font-black text-red-400 mt-1">
              {stats.failedActions.toLocaleString()}
            </div>
            <span className="text-[10px] text-red-300/80">Alerts & errors</span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-DIMENSIONAL SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, title, detail, actor ID, target ID, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: '7D', label: 'Last 7 Days' },
              { id: '30D', label: 'Last 30 Days' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateRangeFilter(d.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateRangeFilter === d.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="ADMIN">Admin Actions</option>
                <option value="USER">User / Customer</option>
                <option value="SECURITY">Security & Alerts</option>
                <option value="SYSTEM">System & Cloud Sync</option>
              </select>
            </div>

            {/* Actor Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Actor:</span>
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Actors</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
                <option value="System">System</option>
                <option value="Guest">Guest</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILED">Failed / Alerts Only</option>
                <option value="WARNING">Warnings</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              Showing <span className="text-slate-900 font-extrabold">{filteredLogs.length}</span> of {logs.length} logs
            </span>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. AUDIT LOG FEED / TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {currentLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-6">
            <Activity className="w-10 h-10 mx-auto mb-2.5 opacity-40 text-slate-500" />
            <p className="text-sm font-bold text-slate-800">No activity logs found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No audit records match your search query or active filter settings.
            </p>
            {(searchTerm || categoryFilter !== 'ALL' || actorFilter !== 'ALL' || statusFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('ALL');
                  setActorFilter('ALL');
                  setStatusFilter('ALL');
                  setDateRangeFilter('ALL');
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentLogs.map((log) => {
              const catBadge = getCategoryBadgeClass(log.category);
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 hover:bg-slate-50/90 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs cursor-pointer group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Category Icon Badge */}
                    <div className="mt-0.5 shrink-0">
                      {log.category === 'SECURITY' ? (
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : log.category === 'USER' ? (
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                          <User className="w-4 h-4" />
                        </div>
                      ) : log.category === 'SYSTEM' ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                          <Server className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Event Title & Detail */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${catBadge}`}>
                          {log.category}
                        </span>

                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.eventName}
                        </span>

                        <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition">
                          {log.title}
                        </h4>

                        {getStatusBadge(log.status)}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {log.detail}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.actorType}: <span className="font-mono text-[10px] text-slate-600">{log.actorId}</span>
                        </span>

                        {log.targetEntity && (
                          <span className="flex items-center gap-1">
                            <span className="text-slate-300">•</span>
                            <span>Target:</span>
                            <span className="font-mono font-bold text-slate-700">
                              {log.targetEntity} {log.targetId ? `(#${log.targetId})` : ''}
                            </span>
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <span className="text-slate-300">•</span>
                          {log.device === 'Mobile' ? (
                            <Smartphone className="w-3 h-3 text-purple-500" />
                          ) : log.device === 'Tablet' ? (
                            <Tablet className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Monitor className="w-3 h-3 text-emerald-500" />
                          )}
                          <span>{log.device}</span>
                          <span className="text-[10px] text-slate-400">({log.browser})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Timestamp & Inspect button */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.time}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 group-hover:text-amber-600 bg-slate-100 group-hover:bg-amber-50 px-2 py-1 rounded-lg border border-slate-200 group-hover:border-amber-200 transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-bold text-[11px]">
              Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. DETAILED AUDIT LOG INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      {selectedLog.id}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {selectedLog.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {selectedLog.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Event Description Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Event Description & Detail
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {selectedLog.detail}
                </p>
              </div>

              {/* Actor & Target Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Actor Information
                  </span>
                  <div className="space-y-1 font-medium text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actor Type:</span>
                      <strong className="text-slate-900">{selectedLog.actorType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actor ID:</span>
                      <span className="font-mono text-slate-900">{selectedLog.actorId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP / Device:</span>
                      <span className="font-mono text-slate-900">{selectedLog.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Client Engine:</span>
                      <span className="text-slate-900">{selectedLog.browser} ({selectedLog.os})</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Target & Execution
                  </span>
                  <div className="space-y-1 font-medium text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Entity:</span>
                      <strong className="text-slate-900">{selectedLog.targetEntity || 'System'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target ID:</span>
                      <span className="font-mono text-slate-900">{selectedLog.targetId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Result Status:</span>
                      {getStatusBadge(selectedLog.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="font-mono text-slate-900">{selectedLog.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Metadata Payload Inspector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    Complete Audit Record Payload (JSON)
                  </span>

                  <button
                    type="button"
                    onClick={copyPayloadToClipboard}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 max-h-48">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>

              {/* Immutable Audit Seal */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-emerald-900">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold">
                  Immutable First-Party Audit Trail Record. Modification or deletion via admin interface is prohibited by security policy.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
