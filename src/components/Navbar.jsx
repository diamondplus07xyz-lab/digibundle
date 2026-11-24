import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShoppingBag, Search, PackageCheck, Menu, X, ArrowRight, MessageCircle, HelpCircle, Star, Sparkles, FolderOpen, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  onOpenMyOrders, 
  searchQuery, 
  setSearchQuery,
  storeName,
  logo,
  bundles = [],
  onSelectBundle,
  onScrollToCatalog
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);

  // Close dropdowns on outside click or tap
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setShowMobileDropdown(false);
      }
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setShowDesktopDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Compute live search matches
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return bundles.filter(b => {
      if (b.id === 'bundle-mega-all-in-one' || b.category === 'mega') return false;
      return (
        (b.title || '').toLowerCase().includes(q) ||
        (b.subtitle || '').toLowerCase().includes(q) ||
        (b.categoryLabel || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q)
      );
    });
  }, [bundles, searchQuery]);

  // Form submission handler (Enter key on keyboard or "View All" button)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowMobileDropdown(false);
    setShowDesktopDropdown(false);

    // Dismiss virtual keyboard on mobile devices
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    if (onScrollToCatalog) {
      onScrollToCatalog();
    } else {
      const el = document.getElementById('bundles-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (hash) => {
    setIsMobileMenuOpen(false);
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-amber-200/90 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-6">
            
            {/* Left: Mobile Menu Toggle Button (Mobile Only) + Brand Logo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-slate-950 bg-amber-100/70 hover:bg-amber-200/70 border border-amber-200 rounded-xl transition cursor-pointer"
                title="Open Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Brand Logo - Official Custom Uploaded Logo */}
              <div 
                className="flex items-center cursor-pointer select-none py-1 group" 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="bg-white/95 hover:bg-white px-3 py-1.5 rounded-2xl shadow-xs border border-amber-200/80 flex items-center transition-all group-hover:scale-105">
                  <BrandLogo 
                    variant="light"
                    customSrc="/logo.png"
                    alt={storeName || "DigiBundle"}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-200/80 shadow-xs">
              <a
                href="#bundles-section"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-900 hover:bg-white/80 transition"
              >
                All Bundles
              </a>

              <a
                href="#how-it-works-section"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-900 hover:bg-white/80 transition"
              >
                How It Works
              </a>

              <a
                href="#reviews-section"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-900 hover:bg-white/80 transition"
              >
                Reviews
              </a>

              <a
                href="#faq-section"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-900 hover:bg-white/80 transition"
              >
                FAQ
              </a>
            </nav>

            {/* Search Bar (Desktop) */}
            <div ref={desktopSearchRef} className="flex-1 max-w-xs hidden lg:block relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search viral niches, titles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDesktopDropdown(true);
                  }}
                  onFocus={() => setShowDesktopDropdown(true)}
                  className="w-full bg-white border border-amber-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition shadow-inner font-medium"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowDesktopDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Desktop Live Search Dropdown */}
              {showDesktopDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl border border-amber-200 shadow-2xl p-3 z-50 animate-fadeIn overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2 pb-1.5 border-b border-amber-100">
                    <span>Matches for "{searchQuery}"</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                      {searchResults.length} {searchResults.length === 1 ? 'bundle' : 'bundles'}
                    </span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {searchResults.slice(0, 4).map((bundle) => (
                        <div
                          key={bundle.id}
                          onClick={() => {
                            setShowDesktopDropdown(false);
                            if (onSelectBundle) onSelectBundle(bundle);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/80 border border-transparent hover:border-amber-200 transition cursor-pointer group"
                        >
                          <img
                            src={bundle.thumbnail || "/logo.png"}
                            alt={bundle.title}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-amber-200 bg-amber-50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                              {bundle.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                              <span>{bundle.clipsCount || 1000}+ Clips</span>
                              <span className="text-amber-700 font-black">₹{bundle.price || 29}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 shrink-0" />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full mt-2 py-2 px-3 glow-amber-btn text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View All {searchResults.length} Bundles in Catalog ↓</span>
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs font-bold text-slate-800">No bundles match "{searchQuery}"</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Try searching 'Gym', 'Anime', 'Car', or 'AI'</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions: My Orders & Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={onOpenMyOrders}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-xl transition shadow-xs cursor-pointer shrink-0"
                title="Track and re-download past purchases"
              >
                <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="inline text-[11px] sm:text-xs">My Orders</span>
              </button>

              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 glow-amber-btn rounded-xl font-black text-xs sm:text-sm cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4 shrink-0 text-white fill-white" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-slate-950 text-amber-300 font-black text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Header Search Bar */}
          <div ref={mobileSearchRef} className="lg:hidden pb-2.5 pt-0.5 relative">
            <form onSubmit={handleSearchSubmit} action="#" className="relative">
              <Search className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Search viral niches, titles, bundles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMobileDropdown(true);
                }}
                onFocus={() => setShowMobileDropdown(true)}
                className="w-full bg-white border border-amber-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition shadow-inner font-semibold"
              />
              {searchQuery ? (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowMobileDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-xs text-slate-400 hover:text-slate-700 bg-amber-100 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </form>

            {/* Mobile Live Interactive Search Dropdown */}
            {showMobileDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-xl rounded-2xl border border-amber-200 shadow-2xl p-3 z-50 animate-fadeIn max-w-full text-slate-900">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2 pb-1.5 border-b border-amber-100">
                  <span>Results for "{searchQuery}"</span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {searchResults.length} {searchResults.length === 1 ? 'bundle' : 'bundles'}
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {searchResults.slice(0, 4).map((bundle) => (
                      <div
                        key={bundle.id}
                        onClick={() => {
                          setShowMobileDropdown(false);
                          if (document.activeElement) document.activeElement.blur();
                          if (onSelectBundle) {
                            onSelectBundle(bundle);
                          } else {
                            handleSearchSubmit();
                          }
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/80 transition cursor-pointer active:scale-[0.99]"
                      >
                        <img
                          src={bundle.thumbnail || "/logo.png"}
                          alt={bundle.title}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-amber-200 bg-amber-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {bundle.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-bold">
                            <span>{bundle.clipsCount || 1000}+ Clips</span>
                            <span className="text-amber-700 font-black">₹{bundle.price || 29}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 glow-amber-btn text-[10px] font-black rounded-lg shrink-0 shadow-2xs"
                        >
                          Buy
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full mt-2 py-2.5 px-3 glow-amber-btn active:scale-[0.98] text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View All {searchResults.length} Bundles in Catalog ↓</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs font-bold text-slate-800">No bundles match "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try quick searches below:</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2.5">
                      {['Motivation', 'Anime', 'Gym', 'AI', 'Car'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-slate-800 text-[11px] font-bold rounded-lg border border-amber-200 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ==================================================== */}
      {/* MOBILE SIDE MENU DRAWER                               */}
      {/* ==================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white border-r border-amber-200 h-full shadow-2xl flex flex-col z-10 animate-slideRight text-slate-900">
            
            {/* Drawer Top */}
            <div className="p-4 border-b border-amber-200 flex items-center justify-between bg-amber-50/70">
              <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-amber-200/80 flex items-center">
                <BrandLogo 
                  variant="light" 
                  customSrc="/logo.png" 
                  alt={storeName || "DigiBundle"} 
                  size="sm" 
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white border border-amber-200 text-slate-600 hover:text-slate-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => handleNavClick('#bundles-section')}
                className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  All Reels Bundles
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMyOrders();
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-600" />
                  My Orders & Downloads
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  Cart ({cartCount})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="pt-2 border-t border-amber-100">
                <button
                  onClick={() => handleNavClick('#how-it-works-section')}
                  className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-slate-900 flex items-center justify-between transition-colors"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('#reviews-section')}
                  className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-slate-900 flex items-center justify-between transition-colors"
                >
                  <span>Customer Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('#faq-section')}
                  className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-slate-900 flex items-center justify-between transition-colors"
                >
                  <span>FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* WhatsApp Support Link */}
              <div className="pt-4">
                <a
                  href="https://wa.me/917017324978?text=Hello%20DigiBundle%20Support"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-4 border-t border-amber-200 bg-amber-50/50 text-[11px] text-slate-500 text-center font-semibold">
              Instant Google Drive Cloud Delivery
            </div>

          </div>
        </div>
      )}
    </>
  );
}
