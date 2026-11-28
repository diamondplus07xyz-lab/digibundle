import React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CheapReels Application Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Something went wrong</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mb-6 leading-relaxed">
            We encountered a temporary display issue. Please reload the page to restore your secure shopping session.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <a
              href="https://wa.me/919409890675?text=Hello%20CheapReels%20Support%2C%20I%20need%20help%20with%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition border border-slate-700 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp Support
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
