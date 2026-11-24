import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp({ whatsappNumber }) {
  const number = (whatsappNumber || '917895317940').replace(/\D/g, '');
  const message = encodeURIComponent('Hello! I have a question about Cheap Reels Store bundles.');
  const whatsappUrl = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Owner on WhatsApp"
      className="hidden sm:flex fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl shadow-emerald-500/30 items-center gap-2 transition hover:scale-110 active:scale-95 group"
      title="Chat with Owner on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white text-emerald-500 group-hover:rotate-12 transition-transform" />
      <span className="hidden sm:inline font-bold text-xs text-slate-950">
        WhatsApp Help
      </span>
    </a>
  );
}
