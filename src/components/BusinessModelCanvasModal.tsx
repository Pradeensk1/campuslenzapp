'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Users,
  Target,
  Gift,
  ShieldCheck,
  Briefcase,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  GraduationCap,
  ExternalLink,
  BookOpen,
  Sparkles,
  CheckCircle2,
  PieChart,
  Award
} from 'lucide-react';

interface BusinessModelCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModelCanvasModal({ isOpen, onClose }: BusinessModelCanvasModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0c1824]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl rounded-3xl bg-[#0e1d2c] border border-cyan-500/30 text-white shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-6 border-b border-cyan-900/50 bg-gradient-to-r from-[#0a1622] via-[#0d2235] to-[#0a1622] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Official Project Canvas
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Campus Lenz Architecture
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
                BUSINESS MODEL CANVAS
              </h2>
            </div>

            {/* Team Credentials Badge */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Team ID</span>
                <span className="font-mono font-extrabold text-cyan-300">MFAJP27</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Team Name</span>
                <span className="font-extrabold text-blue-300">LIXDROID</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
                <span className="font-extrabold text-emerald-300">MCA</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition ml-2"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas Interactive Grid (9 Standard Business Model Canvas Blocks) */}
          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
            
            {/* Top 5 Primary Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
              
              {/* 1. KEY PARTNERS */}
              <div className="rounded-2xl border border-cyan-900/60 bg-[#112338]/90 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-cyan-900/40">
                    <Users className="w-3.5 h-3.5" />
                    <span>Key Partners</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-slate-300 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span><strong>Schools & Guidance Counselors:</strong> Access to graduating students needing college selection guidance.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span><strong>Colleges & Universities:</strong> Collaboration, official data sharing, and institutional access.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span><strong>Reward Partners / Brands:</strong> Gifts, vouchers, and discounts for student gamification and points.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span><strong>Student Associations & Alumni:</strong> Authentic alumni reviews and student engagement.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span><strong>Legal/Compliance Advisors:</strong> Expertise in student data privacy and compliance.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-cyan-900/40 text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live: Verified Network & Rewards
                </div>
              </div>

              {/* 2. KEY ACTIVITIES & RESOURCES (Stacked Column) */}
              <div className="space-y-3.5 flex flex-col">
                {/* Key Activities */}
                <div className="rounded-2xl border border-blue-900/60 bg-[#112338]/90 p-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5 text-blue-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-blue-900/40">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Key Activities</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Building & maintaining rating/review infrastructure</li>
                    <li>• Fraud/fake-review detection & AI moderation</li>
                    <li>• Sales to institutions & advertisers</li>
                    <li>• Community growth & student acquisition</li>
                    <li>• Legal & data privacy compliance work</li>
                  </ul>
                </div>

                {/* Key Resources */}
                <div className="rounded-2xl border border-indigo-900/60 bg-[#112338]/90 p-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-indigo-900/40">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Key Resources</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Review/rating dataset:</strong> Core proprietary asset</li>
                    <li>• <strong>Verification tech:</strong> Proving real students/alumni</li>
                    <li>• Data infrastructure & analytics engine</li>
                    <li>• <strong>Brand trust & credibility:</strong> Central focus</li>
                  </ul>
                </div>
              </div>

              {/* 3. VALUE PROPOSITION */}
              <div className="rounded-2xl border border-emerald-900/60 bg-[#0f2838]/90 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-emerald-900/40">
                    <Award className="w-3.5 h-3.5" />
                    <span>Value Proposition</span>
                  </div>
                  <div className="mt-3 space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                      <strong className="text-emerald-300 block mb-0.5">For Students:</strong>
                      Real feedback on institutions & staff before committing years of life & money; make informed decisions where to study or transfer.
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                      <strong className="text-blue-300 block mb-0.5">For Staff:</strong>
                      Structured feedback to identify skill/behavior gaps, upskilling needs, and competitive benchmarking.
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                      <strong className="text-purple-300 block mb-0.5">For Institutions:</strong>
                      Aggregated, anonymized insights into which departments/staff need training, reputation & benchmarking.
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40">
                      <strong className="text-amber-300 block mb-0.5">For Coaching & Advertisers:</strong>
                      Access to a warm, interest-segmented audience instead of cold outreach.
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-900/40 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live: Verified Reviews & Copilot
                </div>
              </div>

              {/* 4. CUSTOMER RELATIONSHIPS & CHANNELS (Stacked Column) */}
              <div className="space-y-3.5 flex flex-col">
                {/* Customer Relationships */}
                <div className="rounded-2xl border border-violet-900/60 bg-[#112338]/90 p-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5 text-violet-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-violet-900/40">
                    <Target className="w-3.5 h-3.5" />
                    <span>Customer Relationships</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Self-service:</strong> Students sign up, rate, browse</li>
                    <li>• <strong>Institutional Dashboards:</strong> Account managers & analytics for college clients</li>
                    <li>• <strong>Community Moderation:</strong> AI moderation keeps reviews credible and eliminates malicious content</li>
                  </ul>
                </div>

                {/* Channels */}
                <div className="rounded-2xl border border-sky-900/60 bg-[#112338]/90 p-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5 text-sky-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-sky-900/40">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Channels</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Mobile app & web platform (Core product)</li>
                    <li>• College WhatsApp / Telegram communities</li>
                    <li>• Student forums & campus ambassadors</li>
                    <li>• Alumni networks & LinkedIn groups</li>
                    <li>• SEO contents & college ranking discovery</li>
                  </ul>
                </div>
              </div>

              {/* 5. CUSTOMER SEGMENTS */}
              <div className="rounded-2xl border border-purple-900/60 bg-[#112338]/90 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-purple-300 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-purple-900/40">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Customer Segments</span>
                  </div>
                  <div className="mt-3 space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/30">
                      <strong className="text-purple-300 block">Primary (Free Data Providers):</strong>
                      School students, college/UG students, students wanting to switch institutions, alumni & passed-out students.
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-800/30">
                      <strong className="text-indigo-300 block">Primary (Paying Customers):</strong>
                      Colleges & universities wanting reputation insight and staff performance data.
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-800/30">
                      <strong className="text-cyan-300 block">Secondary (Paying):</strong>
                      Career coaching centers, skill-training orgs, ed-tech companies wanting targeted student reach.
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-900/40 text-[10px] text-purple-400 font-bold flex items-center gap-1">
                  <Users className="w-3 h-3" /> Live: All 4 Campus Roles
                </div>
              </div>

            </div>

            {/* Bottom Row: COST STRUCTURE & REVENUE STREAMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              
              {/* COST STRUCTURE */}
              <div className="rounded-2xl border border-rose-900/60 bg-[#181b2a]/90 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                  <div className="flex items-center gap-2 text-rose-300 font-extrabold uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-rose-400" />
                    <span>Cost Structure</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Core Inherent Costs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <span className="font-bold text-rose-300 block">1. Tech & Development</span>
                    <p className="text-slate-400 text-[10px]">App development, Next.js / cloud hosting, server maintenance, UI/UX design, and cybersecurity.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <span className="font-bold text-rose-300 block">2. Marketing & Acquisition</span>
                    <p className="text-slate-400 text-[10px]">Digital advertising, school outreach programs, promotional events, and referral rewards/gifts.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <span className="font-bold text-rose-300 block">3. Operations & Moderation</span>
                    <p className="text-slate-400 text-[10px]">Automated AI tools required for content moderation, verification, customer/college support.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <span className="font-bold text-rose-300 block">4. Legal & Compliance</span>
                    <p className="text-slate-400 text-[10px]">Data privacy regulations, institutional agreements, and terms of service management.</p>
                  </div>
                </div>
              </div>

              {/* REVENUE STREAMS */}
              <div className="rounded-2xl border border-emerald-900/60 bg-[#122226]/90 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Revenue Streams</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">4 Monetization Engines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 block">1. Institutional Subscriptions</span>
                    <p className="text-slate-400 text-[10px]">Anonymized analytics dashboards, staff performance insights, peer benchmarking (Per-institution annual license).</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 block">2. Advertising & Lead Gen</span>
                    <p className="text-slate-400 text-[10px]">Coaching centers & skill orgs pay for pay-per-lead, impressions, and targeted featured listings.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 block">3. Individual Premium Subscriptions</span>
                    <p className="text-slate-400 text-[10px]">Students pay for detailed comparison reports, 1-on-1 alumni mentorship, transfer advisory (Monthly/annual).</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 block">4. Sponsored Content & Partnerships</span>
                    <p className="text-slate-400 text-[10px]">Education loan providers, student housing/PG networks, ed-tech platforms (CPC/Conversion fee).</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Bar */}
          <div className="p-4 px-6 border-t border-cyan-900/50 bg-[#0a1622] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Lenz Platform Architecture Grounded in Business Canvas (Team LIXDROID - MFAJP27)</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-xs"
            >
              Close Canvas
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
