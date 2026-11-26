import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, DownloadCloud, Play, Pause, X, Volume2, VolumeX, AlertCircle, ShoppingBag, ExternalLink } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';
import { getItemPriceDisplay } from '../utils/geoPricing';

export default function ProductCard({ 
  bundle, 
  isPlaying, 
  isPlayingInline,
  onTogglePlay, 
  onTogglePlayInline,
  onAddToCart, 
  onBuyNow 
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Reconcile prop names
  const activePlaying = Boolean(isPlaying ?? isPlayingInline ?? false);
  const togglePlayHandler = onTogglePlay || onTogglePlayInline;

  const discountPercent = Math.round(
    ((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100
  );

  const videoData = parseVideoUrl(bundle.videoPreview);
  const hasVideo = Boolean(videoData?.hasVideo);

  // Ensure HTML5 video plays immediately when card opens
  useEffect(() => {
    if (activePlaying && hasVideo && videoRef.current) {
      setVideoError(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Autoplay deferred or blocked:', err);
        });
      }
    }
  }, [activePlaying, hasVideo]);

  const handlePlayClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (togglePlayHandler) {
      togglePlayHandler(bundle.id);
    }
  };

  const handleStopClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (togglePlayHandler) {
      togglePlayHandler(null);
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden w-full max-w-full ${
      activePlaying 
        ? 'border-rose-500 shadow-xl ring-2 ring-rose-500/20' 
        : 'border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1'
    }`}>
      {/* ======================================================== */}
      {/* PROMINENT AUTO-FIT PHOTO & VIDEO DEMO AREA */}
      {/* ======================================================== */}
      <div 
        style={{ aspectRatio: activePlaying && hasVideo ? '9 / 16' : '16 / 11' }}
        className={`relative w-full bg-slate-950 overflow-hidden transition-all duration-300 ${
          activePlaying && hasVideo ? 'aspect-[9/16]' : 'aspect-[16/11]'
        }`}
      >
        {activePlaying && hasVideo ? (
          /* INLINE ACTIVE VIDEO PLAYER ON THIS CARD - SUPPORTS DIRECT GOOGLE DRIVE EMBED & HTML5 VIDEO */
          <div className="relative w-full h-full bg-black select-none">
            {videoData.fileId ? (
              <iframe
                src={`https://drive.google.com/file/d/${videoData.fileId}/preview`}
                title={bundle.title}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={videoData.url}
                poster={bundle.thumbnail}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                webkit-playsinline="true"
                preload="auto"
                controlsList="nodownload noplaybackrate nofullscreen"
                disablePictureInPicture
                onError={() => {
                  if (videoRef.current && videoData.directStreamUrl && videoRef.current.src !== videoData.directStreamUrl) {
                    videoRef.current.src = videoData.directStreamUrl;
                    videoRef.current.play().catch(() => {});
                  } else {
                    setVideoError(true);
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
                className="w-full h-full object-cover"
              />
            )}
            {videoError && !videoData.fileId && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900/90 text-white text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-xs font-bold">Video preview error</p>
                <button
                  onClick={handlePlayClick}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR THUMBNAIL PHOTO (100% CLEAN - ZERO TEXT OVERLAY) */
          <div 
            className={`w-full h-full relative ${hasVideo ? 'cursor-pointer group/thumb' : ''}`}
            onClick={hasVideo ? handlePlayClick : undefined}
          >
            <img
              src={bundle.thumbnail}
              alt={bundle.title}
              width={400}
              height={275}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-500 ${hasVideo ? 'group-hover/thumb:scale-105' : ''}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/thumbnails/${bundle.id}.jpg`;
              }}
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* COMPACT CARD CONTENT (TIGHT HEIGHT, ZERO WASTED SPACE) */}
      {/* ======================================================== */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between w-full max-w-full">
        <div>
          {/* Row 1: Badges & Highlighted Play Demo Button with Animated Light Beam */}
          <div className="flex items-center justify-between gap-1.5 mb-2 w-full">
            <div className="flex items-center gap-1 flex-wrap max-w-[62%]">
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 truncate">
                {bundle.badge || 'POPULAR'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                <DownloadCloud className="w-2.5 h-2.5 text-slate-500" />
                {bundle.clipCount}
              </span>
            </div>

            {/* Play Demo / Active Controls Row (Cleanly placed below the video ONLY when bundle has a real demo video) */}
            {hasVideo ? (
              activePlaying ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {!videoData.fileId && videoData.type === 'direct' && !videoError && (
                    <button
                      type="button"
                      aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="px-2 py-1 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1 border border-slate-300 cursor-pointer transition active:scale-95 shadow-2xs"
                      title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isMuted ? <VolumeX className="w-3 h-3 text-slate-500" /> : <Volume2 className="w-3 h-3 text-emerald-600" />}
                      <span>{isMuted ? "Sound" : "Mute"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Stop demo video for ${bundle.title}`}
                    onClick={handleStopClick}
                    className="px-2.5 py-1 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-sm"
                    title="Stop Demo Video"
                  >
                    <Pause className="w-2.5 h-2.5 fill-white" />
                    <span>Stop</span>
                  </button>
                </div>
              ) : (
                <div className="play-demo-glow shrink-0">
                  <button
                    type="button"
                    aria-label={`Play demo video for ${bundle.title}`}
                    onClick={handlePlayClick}
                    className="play-demo-glow-inner cursor-pointer active:scale-95"
                    title="Play Demo Video"
                  >
                    <Play className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>Play Demo</span>
                  </button>
                </div>
              )
            ) : null}
          </div>

          {/* Row 2: Title (Compact 2-line clamp with break-words to avoid overflow) */}
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 mb-2 break-words">
            {bundle.title}
          </h3>
        </div>

        {/* Row 3 & 4: Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 w-full">
          {(() => {
            const priceInfo = getItemPriceDisplay(bundle);
            return (
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg font-black text-slate-950">{priceInfo.formattedPrice}</span>
                  <span className="text-[11px] text-slate-500 line-through">{priceInfo.formattedOriginalPrice}</span>
                  {priceInfo.intlNote && (
                    <span className="text-[9px] font-mono text-sky-700 font-bold bg-sky-50 px-1 py-0.2 rounded border border-sky-100">
                      {priceInfo.intlNote}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  {priceInfo.discountPercent}% OFF
                </span>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-1.5 w-full">
            <button
              type="button"
              data-action="add-to-cart"
              data-bundle-id={bundle.id}
              data-price={bundle.price}
              data-title={bundle.title}
              aria-label={`Add ${bundle.title} to cart`}
              onClick={() => onAddToCart(bundle)}
              className="w-full py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold border border-slate-200 flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-3 h-3 text-slate-600" />
              <span>Add</span>
            </button>

            <button
              type="button"
              data-action="buy-now"
              data-bundle-id={bundle.id}
              data-price={bundle.price}
              data-title={bundle.title}
              aria-label={`Buy ${bundle.title} now for ₹${bundle.price}`}
              onClick={() => onBuyNow(bundle)}
              className="w-full py-2 px-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 active:scale-95 text-slate-950 rounded-xl text-[11px] font-black shadow-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 text-slate-950" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
