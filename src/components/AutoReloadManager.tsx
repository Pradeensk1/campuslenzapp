'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import {
  RefreshCw,
  Zap,
  Globe,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function AutoReloadManager() {
  const router = useRouter();
  const { reloadWebappData } = useApp();

  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(3);
  const [mode, setMode] = useState<'data' | 'full'>('data');
  const [countdown, setCountdown] = useState<number>(3);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isExecutingRef = useRef(false);
  const intervalSecondsRef = useRef(intervalSeconds);
  intervalSecondsRef.current = intervalSeconds;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Load preferences safely from localStorage
  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem('cl_auto_reload_enabled');
      if (savedEnabled !== null) setIsEnabled(savedEnabled === 'true');

      const savedInterval = localStorage.getItem('cl_auto_reload_interval');
      if (savedInterval) {
        const parsed = Number(savedInterval);
        if ([3, 5, 10].includes(parsed)) {
          setIntervalSeconds(parsed);
          setCountdown(parsed);
        }
      }

      // We sanitize mode: always default to 'data' to prevent automated full reload loops
      const savedMode = localStorage.getItem('cl_auto_reload_mode');
      if (savedMode === 'data' || savedMode === 'full') {
        setMode(savedMode);
      }
    } catch {}
  }, []);

  // Save preferences
  const updateSettings = (
    nextEnabled: boolean,
    nextInterval: number,
    nextMode: 'data' | 'full'
  ) => {
    setIsEnabled(nextEnabled);
    setIntervalSeconds(nextInterval);
    setMode(nextMode);
    setCountdown(nextInterval);
    try {
      localStorage.setItem('cl_auto_reload_enabled', String(nextEnabled));
      localStorage.setItem('cl_auto_reload_interval', String(nextInterval));
      localStorage.setItem('cl_auto_reload_mode', nextMode);
    } catch {}
  };

  const isUserTyping = () => {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
    const isEditable = active.getAttribute('contenteditable') === 'true';
    return isInput || isEditable;
  };

  const executeReload = useCallback(async (isManual = false) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsReloading(true);

    if (isManual) {
      setToastMessage('Reloading webapp...');
    }

    try {
      // Manual hard browser reload if mode is 'full'
      if (isManual && modeRef.current === 'full') {
        window.location.reload();
        return;
      }

      // Pause background sync if user is actively typing to avoid interrupting form focus
      if (!isManual && isUserTyping()) {
        return;
      }

      // Live data reload (Supabase cloud sync + client context updates)
      await reloadWebappData();

      // Only refresh Next.js server components on manual reload to prevent AbortError during background polling
      if (isManual) {
        router.refresh();
        setToastMessage('Webapp reloaded live');
        setTimeout(() => setToastMessage(null), 1500);
      }
    } catch (err) {
      console.warn('Auto-reload notice:', err);
      if (isManual) {
        setToastMessage('Reload completed');
        setTimeout(() => setToastMessage(null), 1500);
      }
    } finally {
      setIsReloading(false);
      isExecutingRef.current = false;
      setCountdown(intervalSecondsRef.current);
    }
  }, [reloadWebappData, router]);

  // 1-second countdown ticker (pure state decrement, zero side-effects inside reducer)
  useEffect(() => {
    if (!isEnabled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnabled]);

  // Trigger reload when countdown reaches 0 (decoupled from the ticker state updater)
  useEffect(() => {
    if (countdown === 0 && isEnabled) {
      executeReload(false);
    }
  }, [countdown, isEnabled, executeReload]);

  return (
    <aside
      aria-label="Webapp Auto Reload Controller"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-4 left-3 sm:left-4 z-40 font-sans pointer-events-auto"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Expanded Settings Modal */}
      {isExpanded && (
        <div className="mb-2 w-80 sm:w-88 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </span>
              <span className="text-xs font-black text-slate-900 tracking-tight">
                Webapp Auto-Reload Engine
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isEnabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isEnabled ? `Active (${intervalSeconds}s)` : 'Paused'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Automatically reloads posts, direct messages, communities, and routes every {intervalSeconds} seconds.
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => executeReload(true)}
              disabled={isReloading}
              className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload Now</span>
            </button>

            <button
              type="button"
              onClick={() => updateSettings(!isEnabled, intervalSeconds, mode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isEnabled
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {isEnabled ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Reload Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateSettings(isEnabled, intervalSeconds, 'data')}
                className={`p-2 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  mode === 'data'
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>Live Sync</span>
                  </span>
                  {mode === 'data' && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  )}
                </div>
                <span className="text-[9px] text-slate-500">
                  Fast, zero screen flicker, keeps form inputs intact
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings(isEnabled, intervalSeconds, 'full')}
                className={`p-2 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  mode === 'full'
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span>Full Reload</span>
                  </span>
                  {mode === 'full' && (
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  )}
                </div>
                <span className="text-[9px] text-slate-500">
                  Hard page reload on manual button click
                </span>
              </button>
            </div>
          </div>

          {/* Interval Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Reload Interval
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => updateSettings(isEnabled, sec, mode)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    intervalSeconds === sec
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {sec} seconds {sec === 3 ? '★' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" /> Auto-reloading every {intervalSeconds}s
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="font-bold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all duration-150 touch-manipulation active:scale-95 group"
          title="Click to configure webapp auto-reload"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-300">
              Auto-Reload:
            </span>
            <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
              {intervalSeconds}s
              <span className="text-[10px] font-mono text-slate-400">
                ({countdown}s)
              </span>
            </span>
          </div>

          <div className="ml-1 p-1 rounded-full bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </div>
        </button>

        {/* Quick Instant Reload Icon */}
        <button
          type="button"
          onClick={() => executeReload(true)}
          disabled={isReloading}
          title="Reload webapp right now"
          className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-150 touch-manipulation active:scale-90 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </aside>
  );
}
