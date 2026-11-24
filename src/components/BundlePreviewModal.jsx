import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, CheckCircle, FolderOpen, Zap, Volume2, VolumeX, ExternalLink, Film, VideoOff } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';

export default function BundlePreviewModal({ bundle, onClose, onBuyNow }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!bundle) return null;

  const videoData = parseVideoUrl(bundle.videoPreview);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-lg"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile Player Mockup */}
        <div className="w-full md:w-5/12 bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div className="w-[200px] h-[370px] sm:w-[220px] sm:h-[410px] rounded-[36px] border-4 border-slate-700 bg-black relative overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Phone notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-20" />

            {/* CONDITIONAL VIDEO / GDRIVE / PLACEHOLDER RENDER */}
            {videoData.type === 'gdrive' ? (
              <iframe
                src={videoData.embedUrl}
                title={bundle.title}
                className="absolute inset-0 w-full h-full border-0 bg-black pt-5"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : videoData.type === 'direct' ? (
              <>
                <video
                  ref={videoRef}
                  src={videoData.url}
                  poster={bundle.thumbnail}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                {/* Direct video player controls */}
                <div className="relative z-10 flex items-center justify-between text-[10px] text-white/90 p-4 pt-7">
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-white/20">
                    1080x1920 HD
                  </span>
                  <span className="bg-red-500/90 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    Direct Clip
                  </span>
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="relative z-10 self-center p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
                </button>

                <div className="relative z-10 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="text-[11px] text-slate-300">Live Video Preview</span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-yellow-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </>
            ) : videoData.type === 'iframe' ? (
              <iframe
                src={videoData.url}
                title={bundle.title}
                className="absolute inset-0 w-full h-full border-0 bg-black pt-5"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              /* NO VIDEO PREVIEW SET YET - SHOW CLEAN COVER WITH NOTICE */
              <div className="relative w-full h-full flex flex-col justify-between p-4 pt-7">
                <img
                  src={bundle.thumbnail}
                  alt={bundle.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

                <div className="relative z-10 flex items-center justify-between text-[10px] text-white">
                  <span className="bg-black/70 px-2 py-0.5 rounded-full border border-white/20">
                    9:16 Vertical
                  </span>
                  <span className="bg-emerald-500/80 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase">
                    1080p Full HD
                  </span>
                </div>

                <div className="relative z-10 text-center my-auto p-2">
                  <div className="w-12 h-12 bg-indigo-600/30 border border-indigo-500/50 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                    <Film className="w-6 h-6 text-indigo-300" />
                  </div>
                  <p className="text-xs font-bold text-white">Official Bundle Artwork</p>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Add Google Drive video link in Admin Panel to auto-stream video here.
                  </p>
                </div>

                <div className="relative z-10 text-center text-[10px] text-emerald-400 font-semibold bg-black/60 py-1.5 px-2 rounded-lg border border-emerald-500/30">
                  ⚡ 100% Watermark-Free Files
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            {videoData.type === 'gdrive' 
              ? '⚡ Playing live from Google Drive file link' 
              : videoData.type === 'direct' 
              ? '⚡ Direct high-speed MP4 video stream'
              : '⚡ Instant Google Drive folder access post-purchase'}
          </p>
        </div>

        {/* Modal Right Side: Details & Buy */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/30">
                {bundle.clipCount}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Instant Google Drive Delivery
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
              {bundle.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              {bundle.subtitle}
            </p>

            {/* Google Drive Links Included */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Google Drive Access Links ({bundle.links ? bundle.links.length : 1} Part):</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Verified Active</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {bundle.links && bundle.links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs">{link.label}</span>
                    <span className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                      <span>Drive Folder</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Checklist */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bundle Specifications:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bundle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Checkout trigger */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">₹{bundle.price}</span>
                <span className="text-sm text-slate-400 line-through">₹{bundle.originalPrice}</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold">Instant UPI QR • Lifetime Access</p>
            </div>

            <button
              onClick={() => {
                onClose();
                onBuyNow(bundle);
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy (₹{bundle.price})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
