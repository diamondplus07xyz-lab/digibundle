import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, CheckCircle } from 'lucide-react';
import { calculateCartPricing } from '../utils/pricing';
import { getItemPriceDisplay, calculateUsdTotal, isInternationalVisitor } from '../utils/geoPricing';

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onProceedToCheckout }) {
  if (!isOpen) return null;

  const { subtotal, discount, finalTotal, comboBadge, nextTierMessage, itemsCount } = calculateCartPricing(cartItems);
  const isIntl = isInternationalVisitor();
  const totalUsd = calculateUsdTotal(cartItems, finalTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header - Clean */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-slate-900">Your Cart ({cartItems.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Smart Combo Deal Banner */}
          {cartItems.length > 0 && (
            <div className={`px-4 py-2.5 border-b text-xs font-bold flex items-center gap-2 ${
              discount > 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {discount > 0 ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="flex-1">{comboBadge || nextTierMessage}</span>
            </div>
          )}

          {/* Cart Items List - 100% Clean, No Bonus / Upsells */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Add viral reels bundles to get started</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Browse Bundles
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{item.clipCount}</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      {isIntl ? (
                        <span className="text-sm font-black text-sky-700">{getItemPriceDisplay(item, true).formattedPrice}</span>
                      ) : (
                        <>
                          <span className="text-sm font-black text-slate-950">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-[11px] text-slate-400 line-through">₹{item.originalPrice}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout - Clean with Combo Savings Breakdown */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600 font-bold">
                  <span>Subtotal ({itemsCount} items)</span>
                  <span>{isIntl ? `$${totalUsd} USD` : `₹${subtotal}`}</span>
                </div>
                {discount > 0 && !isIntl && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Combo Discount
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 text-sm">
                  <span className="text-xs font-black text-slate-900 uppercase">Total Payable</span>
                  <div className="flex items-baseline gap-2">
                    {discount > 0 && !isIntl && (
                      <span className="text-xs text-slate-400 line-through">₹{subtotal}</span>
                    )}
                    {isIntl ? (
                      <span className="text-xl font-black text-sky-700 font-mono">${totalUsd} USD</span>
                    ) : (
                      <span className="text-xl font-black text-slate-950">₹{finalTotal}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 active:scale-98 text-slate-950 font-black rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
