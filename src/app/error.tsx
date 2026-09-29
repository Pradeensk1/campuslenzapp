'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log exception safely to console
    console.error('Campus Lenz Runtime Error Boundary:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        const keysToClear = [
          'cl_auto_reload_enabled',
          'cl_auto_reload_interval',
          'cl_auto_reload_mode',
          'campuslenz_currentUser',
          'campuslenz_posts',
          'campuslenz_colleges'
        ];
        keysToClear.forEach(k => localStorage.removeItem(k));
        window.location.href = '/';
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-center text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Client Safe Mode Active
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            We encountered a temporary hiccup
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Campus Lenz caught an unexpected client render state. Your data is secure and unharmed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Campus Feed</span>
          </Link>
        </div>

        {/* Secondary Clean Recovery */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition font-medium underline underline-offset-4"
          >
            Reset Local Session & Reload
          </button>

          {/* Technical Diagnostics (Collapsible) */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-slate-500 hover:text-slate-400 transition"
          >
            {showDetails ? 'Hide Diagnostic Info' : 'Show Diagnostic Info'}
          </button>

          {showDetails && (
            <div className="w-full text-left p-3 rounded-xl bg-black/50 border border-slate-800 font-mono text-[10px] text-amber-200/90 break-all space-y-1">
              <div><strong>Message:</strong> {error.message || 'Unknown render exception'}</div>
              {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
