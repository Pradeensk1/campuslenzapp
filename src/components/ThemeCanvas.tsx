'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeCanvas() {
  const { themeConfig } = useTheme();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: themeConfig.bgApp }}
    >
      {/* 6K Fluid Background Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: "url('/background-ui.jpg')",
          opacity: themeConfig.isLight ? 0.15 : 0.85
        }}
      />

      {/* Dynamic Theme Color Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${themeConfig.wallpaperOverlay} pointer-events-none transition-all duration-700`}
      />

      {/* Subtle Specular Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${themeConfig.accentGlow}, transparent 75%)`
        }}
      />

      {/* Viewport Border Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_65%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  );
}
