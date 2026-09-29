'use client';

import React from 'react';
import { useTheme, CAMPUS_THEMES, CampusTheme } from '@/lib/ThemeContext';
import { Palette, Check, Sparkles, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeCustomizerModal() {
  const { currentTheme, setTheme, isCustomizerOpen, setIsCustomizerOpen } = useTheme();

  if (!isCustomizerOpen) return null;

  const themeList = Object.values(CAMPUS_THEMES);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-5 sm:p-6 text-white overflow-hidden space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Customize App Theme</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  Select your personalized collegiate aesthetic and fluid canvas
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCustomizerOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {themeList.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as CampusTheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-400 ring-2 ring-blue-500/30 bg-slate-800/90 shadow-xl'
                      : 'border-slate-700/70 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="space-y-2 w-full">
                    {/* Color Swatch Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-6 h-6 rounded-lg bg-gradient-to-br ${t.previewGradient} shadow-inner border border-white/20 flex items-center justify-center`}
                        >
                          {t.isLight ? (
                            <Sun className="w-3.5 h-3.5 text-blue-900" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-white/90" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-white tracking-tight">
                          {t.name}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="p-1 rounded-full bg-blue-500 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {t.tagline}
                    </p>
                  </div>

                  {/* Accent Strip */}
                  <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">
                      {t.isLight ? 'Light Frosted' : 'Dark Fluid'}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: t.accentPrimary }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Theme auto-saves to your local browser</span>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
