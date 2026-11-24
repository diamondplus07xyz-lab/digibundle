import React, { useState } from 'react';
import { X, Search, PackageCheck, FolderOpen, ExternalLink, Calendar, AlertCircle, Clock, MessageCircle, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { maskPhoneNumber } from '../utils/security';
import { clearCustomerSession } from '../utils/sessionManager';

export default function MyOrdersModal({ isOpen, onClose, orders, onUserLogout }) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomerLogout = () => {
    clearCustomerSession();
    setQuery('');
    setSearched(false);
    setLogoutMessage('Customer session cleared and logged out securely.');
    if (onUserLogout) {
      onUserLogout();
    }
    setTimeout(() => {
      setLogoutMessage('');
    }, 3000);
  };

  const filteredOrders = orders.filter(order => {
    if (!query.trim()) return false;
    const q = query.trim().toLowerCase();
    return (
      (order.whatsapp && order.whatsapp.includes(q)) ||
      (order.email && order.email.toLowerCase().includes(q)) ||
      (order.id && order.id.toLowerCase().includes(q)) ||
      (order.utr && order.utr.toLowerCase().includes(q))
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-black text-white">Find My Purchased Reels</h3>
              <p className="text-xs text-slate-400">Track orders & check verification status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCustomerLogout}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Clear customer session and order tracking on this device"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logout Toast Notification */}
        {logoutMessage && (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{logoutMessage}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="p-5 border-b border-slate-800">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your WhatsApp Number, UTR, or Order ID"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearched(false);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#FFB701] to-[#FF800B] text-slate-950 font-black rounded-xl text-xs sm:text-sm transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {searched && filteredOrders.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No orders found for this search</p>
              <p className="text-xs text-slate-500 mt-1">
                Make sure you typed the exact WhatsApp number or UTR used during purchase.
              </p>
            </div>
          ) : !searched && orders.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recent Orders On This Device ({orders.length})
              </p>
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderItemCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          ) : searched && filteredOrders.length > 0 ? (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <OrderItemCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <PackageCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">Enter your details to find your reels</p>
              <p className="text-xs text-slate-500 mt-1">
                Your order history and Drive link status are accessible here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderItemCard({ order }) {
  const isPending = order.status === 'PENDING_VERIFICATION' || order.driveLinkUnlocked === false;
  const primaryLink = order.items[0]?.driveLink || "https://drive.google.com";
  const whatsappUrl = order.whatsappUrl || `https://wa.me/917017324978?text=${encodeURIComponent(`Hello, my order is ${order.id} and UTR is ${order.utr}. Please verify and send my Google Drive link.`)}`;

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-amber-400">#{order.id}</span>
          {order.whatsapp && (
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {maskPhoneNumber(order.whatsapp)}
            </span>
          )}
        </div>
        <span className="text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(order.date).toLocaleDateString()}
        </span>
      </div>

      <div>
        <p className="text-xs font-bold text-white mb-1">
          {order.items.length} Bundle(s) (₹{order.total}):
        </p>
        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
          {order.items.map((it, idx) => (
            <li key={idx} className="truncate">
              {it.title} ({it.clipCount})
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
        {isPending ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Clock className="w-3 h-3 animate-pulse" /> UTR Verification Pending
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Verify on WhatsApp</span>
            </a>
          </>
        ) : (
          <>
            <span className="text-[11px] text-emerald-400 font-bold">Payment Verified</span>
            <a
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
