'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0c1824] text-white flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold">Campus Lenz Encountered an Issue</h2>
          <p className="text-xs text-slate-400">
            A critical application error was caught. You can try refreshing the view.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              Reload Feed
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
