import React from 'react';
import { Home, Layers, ShoppingBag, PackageCheck, MessageCircle } from 'lucide-react';

export default function MobileBottomNav({
  cartCount = 0,
  onOpenCart,
  onOpenMyOrders,
  whatsappNumber
}) {
  const number = (whatsappNumber || '917017324978').replace(/\D/g, '');
  const supportUrl = `https://wa.me/${number}?text=${encodeURIComponent('Hello DigiBundle Support, I have a question about bundles.')}`;

  const scrollToBundles = () => {
    const el = document.getElementById('bundles-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-amber-200 shadow-[0_-4px_25px_rgba(245,158,11,0.12)] px-1 py-1.5 flex items-center justify-around select-none safe-area-bottom text-slate-800"
    >
      {/* 1. Home */}
      <button
        onClick={scrollToTop}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <Home className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-bold mt-0.5">Home</span>
      </button>

      {/* 2. Bundles Catalog */}
      <button
        onClick={scrollToBundles}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <Layers className="w-5 h-5 text-amber-600" />
        <span className="text-[10px] font-bold mt-0.5">Bundles</span>
      </button>

      {/* 3. Cart with Badge */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-900 active:scale-95 transition relative cursor-pointer"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full glow-amber-btn flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4 text-white fill-white" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-amber-700">Cart</span>
      </button>

      {/* 4. Track Orders */}
      <button
        onClick={onOpenMyOrders}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <PackageCheck className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-bold mt-0.5">Orders</span>
      </button>

      {/* 5. WhatsApp Support */}
      <a
        href={supportUrl}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-700 active:scale-95 transition cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <span className="text-[10px] font-bold mt-0.5">Chat</span>
      </a>
    </nav>
  );
}
