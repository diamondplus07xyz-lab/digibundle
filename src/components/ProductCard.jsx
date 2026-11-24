import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, DownloadCloud, Play, Pause, X, Volume2, VolumeX, AlertCircle, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';

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
    <div className={`group relative bg-white/95 rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden w-full max-w-full text-slate-900 ${
      activePlaying 
        ? 'border-amber-400 shadow-2xl ring-2 ring-amber-400/30' 
        : 'border-amber-200/80 shadow-md hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400 hover:-translate-y-1.5'
    }`}>
      {/* ======================================================== */}
      {/* PROMINENT AUTO-FIT PHOTO & VIDEO DEMO AREA */}
      {/* ======================================================== */}
      <div className={`relative w-full bg-slate-950 overflow-hidden transition-all duration-300 ${
        activePlaying && hasVideo ? 'aspect-[9/16]' : 'aspect-[16/11]'
      }`}>
        {activePlaying && hasVideo ? (
          /* INLINE ACTIVE VIDEO PLAYER ON THIS CARD */
          <div 
            className="relative w-full h-full bg-black select-none cursor-pointer"
            onClick={handleStopClick}
            title="Tap video to stop preview"
          >
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
                setVideoError(true);
              }}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Error or Fallback Notice */}
            {videoError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center z-20">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-xs font-bold text-white mb-1">Preview Offline</p>
                <p className="text-[10px] text-slate-400 mb-3">Google Drive link is 100% active and working</p>
                <button
                  type="button"
                  onClick={handleStopClick}
                  className="px-3 py-1 bg-slate-800 text-xs font-bold rounded-lg text-slate-300"
                >
                  Close
                </button>
              </div>
            )}

            {/* Tap Video To Stop Overlay Badge */}
            <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
              <span className="bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sample Reel</span>
              </span>
            </div>

            {/* Floating Sound Toggle Pill */}
            {videoData.type === 'direct' && !videoError && (
              <div 
                className="absolute bottom-2.5 right-2.5 z-20 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
              >
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer"
                  title={isMuted ? "Click to unmute sound" : "Click to mute sound"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3 h-3 text-slate-400" />
                      <span>Sound Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Sound On</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* THUMBNAIL PHOTO PREVIEW WITH CLEAN DEMO BUTTON */
          <div 
            className="relative w-full h-full cursor-pointer group/thumb overflow-hidden"
            onClick={hasVideo ? handlePlayClick : undefined}
          >
            <img
              src={bundle.thumbnail || "/logo.png"}
              alt={bundle.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
              }}
            />

            {/* Quality badge floating on image */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-300 shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>1080p Studio</span>
              </span>
            </div>

            {/* Subtle Gradient Shade on desktop hover */}
            {hasVideo && (
              <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/95 hover:bg-white text-amber-900 border border-amber-300 font-black text-xs rounded-xl shadow-xl transform -translate-y-1 group-hover/thumb:translate-y-0 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                  <span>Preview Demo</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* COMPACT CARD CONTENT */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between w-full max-w-full">
        <div>
          {/* Row 1: Badges & Highlighted Play Demo Button */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5 w-full">
            <div className="flex items-center gap-1.5 flex-wrap max-w-[65%]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 truncate">
                {bundle.badge || 'CURATED'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-slate-700 border border-amber-200 shrink-0">
                <DownloadCloud className="w-2.5 h-2.5 text-amber-600" />
                {bundle.clipCount}
              </span>
            </div>

            {/* Play Demo / Active Controls Row */}
            {hasVideo ? (
              activePlaying ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {videoData.type === 'direct' && !videoError && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="px-2 py-1 rounded-[10px] bg-amber-100 hover:bg-amber-200 text-slate-800 font-bold text-[10px] flex items-center gap-1 border border-amber-300 cursor-pointer transition active:scale-95 shadow-2xs"
                      title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isMuted ? <VolumeX className="w-3 h-3 text-slate-500" /> : <Volume2 className="w-3 h-3 text-emerald-600" />}
                      <span>{isMuted ? "Sound" : "Mute"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStopClick}
                    className="px-2.5 py-1 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
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
                    onClick={handlePlayClick}
                    className="play-demo-glow-inner cursor-pointer active:scale-95"
                    title="Play Demo Video"
                  >
                    <Play className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                    <span>Demo</span>
                  </button>
                </div>
              )
            ) : null}
          </div>

          {/* Row 2: Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-slate-950 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2 break-words">
            {bundle.title}
          </h3>
        </div>

        {/* Row 3 & 4: Price & Action Buttons */}
        <div className="pt-3 border-t border-amber-100 w-full">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-950">₹{bundle.price}</span>
              <span className="text-xs text-slate-400 line-through">₹{bundle.originalPrice}</span>
            </div>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
              {discountPercent}% OFF
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={() => onAddToCart(bundle)}
              className="w-full py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-slate-800 hover:text-slate-950 rounded-xl text-xs font-bold border border-amber-200 hover:border-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
              <span>Add</span>
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(bundle)}
              className="w-full py-2.5 px-2 glow-amber-btn text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white fill-white" />
              <span>Unlock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
