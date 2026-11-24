import React from 'react';
import { Home, Layers, ShoppingBag, PackageCheck, MessageCircle } from 'lucide-react';

export default function MobileBottomNav({
  cartCount = 0,
  onOpenCart,
  onOpenMyOrders,
  whatsappNumber
}) {
  const number = (whatsappNumber || '917017324978').replace(/\D/g, '');
  const supportUrl = `https://wa.me/${number}?text=${encodeURIComponent('Hello Cheap Reels Support, I have a question about bundles.')}`;

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
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 py-1.5 flex items-center justify-around select-none safe-area-bottom"
    >
      {/* 1. Home */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top of home page"
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <Home className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-bold mt-0.5">Home</span>
      </button>

      {/* 2. Bundles Catalog */}
      <button
        onClick={scrollToBundles}
        aria-label="Browse reels bundles catalog"
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <Layers className="w-5 h-5 text-amber-600" />
        <span className="text-[10px] font-bold mt-0.5">Bundles</span>
      </button>

      {/* 3. Cart with Badge */}
      <button
        onClick={onOpenCart}
        aria-label="Open shopping cart"
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-900 active:scale-95 transition relative cursor-pointer"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4 text-slate-950" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black text-amber-700 mt-0.5">Cart</span>
      </button>

      {/* 4. My Orders / Downloads */}
      <button
        onClick={onOpenMyOrders}
        aria-label="Track past purchases and downloads"
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-slate-950 active:scale-95 transition cursor-pointer"
      >
        <PackageCheck className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-bold mt-0.5">Downloads</span>
      </button>

      {/* 5. WhatsApp Support */}
      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact support on WhatsApp"
        className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-600 active:scale-95 transition cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        <span className="text-[10px] font-bold mt-0.5 text-emerald-700">Support</span>
      </a>
    </nav>
  );
}
