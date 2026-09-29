'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  Layers,
  Heart,
  ChevronRight
} from 'lucide-react';
import BusinessModelCanvasModal from './BusinessModelCanvasModal';

export default function Footer() {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-slate-200/60 bg-white/70 backdrop-blur-md text-slate-600 mt-12 transition-all">
        <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand & Team Identity */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1687D4] to-[#0875BD] text-white font-black text-xs shadow-xs">
                  CL
                </div>
                <span className="text-base font-black tracking-tight text-[#05233b]">
                  CAMPUS<span className="text-[#1687D4]">LENZ</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  MCA Project
                </span>
              </div>

              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                The authentic digital campus ecosystem providing real feedback on educational institutions, structured staff teaching evaluations, verified alumni mentorship, and AI-driven placement career guidance.
              </p>

              {/* Team ID & Credentials Pill */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 inline-flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Team</span>
                  <strong className="text-slate-800">LIXDROID</strong>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Team ID</span>
                  <span className="font-mono font-bold text-[#1687D4]">MFAJP27</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <strong className="text-emerald-700">MCA</strong>
                </div>
              </div>

              {/* Interactive Canvas Trigger */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsCanvasOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inspect Business Model Canvas</span>
                </button>
              </div>
            </div>

            {/* Col 2: Platform Pillars */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Platform Features</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/explore" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>College Directory & Reviews</span>
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Multi-College Comparison</span>
                  </Link>
                </li>
                <li>
                  <Link href="/explore?tab=transfers" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>School & College Transfer Hub</span>
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>AI Career Copilot</span>
                  </Link>
                </li>
                <li>
                  <Link href="/connect" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Campus Social & Communities</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Business Model & Partners */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Partner Network</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/explore?tab=partners" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Career Coaching & Skill Bootcamps</span>
                  </Link>
                </li>
                <li>
                  <Link href="/explore?tab=partners" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Education Loan Pre-Approval</span>
                  </Link>
                </li>
                <li>
                  <Link href="/explore?tab=partners" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Verified Student Housing & PGs</span>
                  </Link>
                </li>
                <li>
                  <Link href="/grievance" className="hover:text-[#1687D4] transition flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Grievance & Legal Compliance</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Compliance & Rights Bar */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliant with Student Data Privacy & NAAC/NIRF Institutional Standards</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} Campus Lenz • Project by Team LIXDROID (MFAJP27 - MCA)</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Modal */}
      <BusinessModelCanvasModal
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
      />
    </>
  );
}
