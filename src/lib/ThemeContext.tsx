'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CampusTheme = 'midnight' | 'obsidian' | 'emerald' | 'indigo' | 'ember' | 'glacier';

export interface ThemeConfig {
  id: CampusTheme;
  name: string;
  tagline: string;
  bgApp: string;
  bgCard: string;
  borderCard: string;
  accentPrimary: string;
  accentGlow: string;
  previewGradient: string;
  wallpaperOverlay: string;
  isLight?: boolean;
}

export const CAMPUS_THEMES: Record<CampusTheme, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Liquid Glass',
    tagline: 'Apple iOS 27 Deep Oceanic Fluid Canvas',
    bgApp: '#0c1824',
    bgCard: 'rgba(12, 24, 36, 0.85)',
    borderCard: 'rgba(59, 159, 232, 0.25)',
    accentPrimary: '#1687D4',
    accentGlow: 'rgba(22, 135, 212, 0.4)',
    previewGradient: 'from-[#0c1824] via-[#0875BD] to-[#1687D4]',
    wallpaperOverlay: 'from-black/20 via-transparent to-black/40',
    isLight: false
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian OLED',
    tagline: 'Ultra High-Contrast Pitch Black Slate',
    bgApp: '#05070a',
    bgCard: 'rgba(10, 13, 18, 0.92)',
    borderCard: 'rgba(255, 255, 255, 0.12)',
    accentPrimary: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    previewGradient: 'from-[#05070a] via-[#0f172a] to-[#38bdf8]',
    wallpaperOverlay: 'from-black/60 via-black/40 to-black/80',
    isLight: false
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    tagline: 'Collegiate Botanical & Engineering Dark Mint',
    bgApp: '#061a14',
    bgCard: 'rgba(6, 26, 20, 0.88)',
    borderCard: 'rgba(16, 185, 129, 0.28)',
    accentPrimary: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    previewGradient: 'from-[#061a14] via-[#047857] to-[#10b981]',
    wallpaperOverlay: 'from-emerald-950/30 via-transparent to-black/50',
    isLight: false
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Academic Indigo',
    tagline: 'Prestigious University Amethyst & Deep Violet',
    bgApp: '#0f0a1c',
    bgCard: 'rgba(18, 12, 34, 0.88)',
    borderCard: 'rgba(139, 92, 246, 0.28)',
    accentPrimary: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.4)',
    previewGradient: 'from-[#0f0a1c] via-[#5b21b6] to-[#8b5cf6]',
    wallpaperOverlay: 'from-purple-950/30 via-transparent to-black/50',
    isLight: false
  },
  ember: {
    id: 'ember',
    name: 'Crimson Sunset Ember',
    tagline: 'Warm Autumn Campus Dusk & Ruby Glass',
    bgApp: '#1a0b0d',
    bgCard: 'rgba(28, 12, 15, 0.88)',
    borderCard: 'rgba(244, 63, 94, 0.28)',
    accentPrimary: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.4)',
    previewGradient: 'from-[#1a0b0d] via-[#9f1239] to-[#f43f5e]',
    wallpaperOverlay: 'from-rose-950/30 via-transparent to-black/50',
    isLight: false
  },
  glacier: {
    id: 'glacier',
    name: 'Frosted Glacier Light',
    tagline: 'Airy Daylight Minimalist Water Glass',
    bgApp: '#f0f6fc',
    bgCard: 'rgba(255, 255, 255, 0.95)',
    borderCard: 'rgba(7, 80, 128, 0.15)',
    accentPrimary: '#0875BD',
    accentGlow: 'rgba(8, 117, 189, 0.25)',
    previewGradient: 'from-[#f0f6fc] via-[#CFEAFF] to-[#0875BD]',
    wallpaperOverlay: 'from-white/60 via-white/40 to-white/70',
    isLight: true
  }
};

interface ThemeContextType {
  currentTheme: CampusTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: CampusTheme) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CampusTheme>('midnight');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Load saved theme safely after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cl_theme_preference') as CampusTheme;
      if (saved && CAMPUS_THEMES[saved]) {
        setCurrentTheme(saved);
      }
    } catch {}
  }, []);

  const setTheme = (theme: CampusTheme) => {
    if (!CAMPUS_THEMES[theme]) return;
    setCurrentTheme(theme);
    try {
      localStorage.setItem('cl_theme_preference', theme);
      // Update data-theme on html element
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        const config = CAMPUS_THEMES[theme];
        document.documentElement.style.setProperty('--bg-app', config.bgApp);
        document.documentElement.style.setProperty('--accent-primary', config.accentPrimary);
      }
    } catch {}
  };

  const themeConfig = CAMPUS_THEMES[currentTheme] || CAMPUS_THEMES.midnight;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme,
        isCustomizerOpen,
        setIsCustomizerOpen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
