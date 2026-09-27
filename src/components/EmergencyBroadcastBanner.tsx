'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { AlertTriangle, Info, X, ChevronDown, ChevronUp, ShieldAlert, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyBroadcastBanner() {
  const { emergencyBroadcast, dismissEmergencyBroadcast, currentUser } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!emergencyBroadcast || !emergencyBroadcast.active) {
    return null;
  }

  const isCritical = emergencyBroadcast.severity === 'critical';
  const isWarning = emergencyBroadcast.severity === 'warning';

  const canDismiss = currentUser?.role === 'institution' || currentUser?.role === 'admin';

  const bgGradient = isCritical
    ? 'from-red-600 via-rose-600 to-red-700 text-white border-red-500'
    : isWarning
    ? 'from-amber-600 via-orange-600 to-amber-700 text-white border-amber-500'
    : 'from-blue-600 via-indigo-600 to-sky-700 text-white border-blue-500';

  const badgeBg = isCritical
    ? 'bg-red-950/40 text-red-100 border-red-400/30'
    : isWarning
    ? 'bg-amber-950/40 text-amber-100 border-amber-400/30'
    : 'bg-blue-950/40 text-blue-100 border-blue-400/30';

  const Icon = isCritical ? ShieldAlert : isWarning ? AlertTriangle : Info;

  return (
    <aside aria-label="Campus Emergency Alert" className="w-full relative z-40">
      <div className={`w-full bg-gradient-to-r ${bgGradient} px-4 py-2.5 shadow-md border-b transition-all`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-xs flex-shrink-0 animate-pulse">
              <Icon className="w-4 h-4 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  {emergencyBroadcast.severity} Broadcast
                </span>
                <span className="text-[11px] font-semibold text-white/80 truncate">
                  {emergencyBroadcast.institutionName} • {emergencyBroadcast.issuedAt}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {emergencyBroadcast.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition"
              title="Toggle broadcast details"
            >
              <span>{isExpanded ? 'Less' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {canDismiss && (
              <button
                onClick={dismissEmergencyBroadcast}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition"
                title="Dismiss campus broadcast alert (Admin / Institution clearance)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Details Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-6xl mx-auto pt-3 pb-1 text-xs text-white/95 border-t border-white/20 mt-2 space-y-2">
                <p className="leading-relaxed whitespace-pre-wrap">{emergencyBroadcast.message}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/80">
                  <span className="font-semibold">Audience:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {emergencyBroadcast.targetAudiences.map(aud => (
                      <span key={aud} className="px-2 py-0.5 rounded-md bg-white/15 text-white font-medium text-[10px]">
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
