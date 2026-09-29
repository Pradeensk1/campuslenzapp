'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Compass,
  Home,
  MessageSquare,
  Search,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl text-center space-y-6">
        {/* Liquid Glass 404 Hero Card */}
        <div className="p-8 md:p-10 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_16px_50px_rgba(7,80,128,0.12)] space-y-6 relative overflow-hidden">
          {/* Subtle liquid glow decoration */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#1687D4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#0875BD]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1687D4]" />
            <span>404 &bull; Page Not Found</span>
          </div>

          {/* Big Number & Message */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-[#075080] drop-shadow-xs">
              404
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">
              Looking for something on Campus?
            </h2>
            <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
              The page or resource you are looking for has been moved, renamed, or does not exist yet. Let&apos;s get you back on track!
            </p>
          </div>

          {/* Search bar inside 404 */}
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges, reviews, students, topics..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 focus:border-[#1687D4] focus:ring-2 focus:ring-[#1687D4]/20 outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400 shadow-xs transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#1687D4] hover:bg-[#075080] text-white text-xs font-bold shadow-xs transition"
            >
              Search
            </button>
          </form>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <Link
              href="/"
              className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 hover:border-[#8CCCF5] transition-all duration-200 group shadow-xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Home className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#1687D4] transition truncate">
                  Campus Feed
                </div>
                <div className="text-[10px] text-slate-500 truncate">Back to home</div>
              </div>
            </Link>

            <Link
              href="/explore"
              className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 hover:border-[#8CCCF5] transition-all duration-200 group shadow-xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#1687D4] transition truncate">
                  Explore Colleges
                </div>
                <div className="text-[10px] text-slate-500 truncate">Compare rankings</div>
              </div>
            </Link>

            <Link
              href="/connect"
              className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 hover:border-[#8CCCF5] transition-all duration-200 group shadow-xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#1687D4] transition truncate">
                  Connect Hub
                </div>
                <div className="text-[10px] text-slate-500 truncate">DMs & discussions</div>
              </div>
            </Link>

            <Link
              href="/search"
              className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 hover:border-[#8CCCF5] transition-all duration-200 group shadow-xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Search className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#1687D4] transition truncate">
                  Global Search
                </div>
                <div className="text-[10px] text-slate-500 truncate">Find everything</div>
              </div>
            </Link>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200/80 bg-white/60 hover:bg-white text-slate-700 text-xs font-bold shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1687D4] hover:bg-[#075080] text-white text-xs font-bold shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
