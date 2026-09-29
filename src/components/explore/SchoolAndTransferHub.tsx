'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Calculator,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  Users,
  Search,
  BookOpen,
  Building2,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  HelpCircle,
  Percent
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function SchoolAndTransferHub() {
  const { colleges } = useApp();

  // Sub-tab within School & Transfer Hub
  const [subTab, setSubTab] = useState<'cutoff_predictor' | 'exam_calendar' | 'transfer_rules' | 'mentors'>('cutoff_predictor');

  // =========================================================================
  // 1. CUTOFF PREDICTOR STATE
  // =========================================================================
  const [boardType, setBoardType] = useState<'tn_state' | 'cbse' | 'jee'>('tn_state');
  const [mathsMarks, setMathsMarks] = useState<number>(95);
  const [physicsMarks, setPhysicsMarks] = useState<number>(92);
  const [chemistryMarks, setChemistryMarks] = useState<number>(90);
  const [jeePercentile, setJeePercentile] = useState<number>(94.5);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science');
  const [selectedQuota, setSelectedQuota] = useState<'OC' | 'BC' | 'MBC' | 'SC_ST'>('OC');

  // Calculate TN Cutoff out of 200: Maths (100) + Physics/2 (50) + Chemistry/2 (50)
  const calculatedCutoff = useMemo(() => {
    if (boardType === 'tn_state' || boardType === 'cbse') {
      const p = Number(physicsMarks) || 0;
      const c = Number(chemistryMarks) || 0;
      const m = Number(mathsMarks) || 0;
      return +(m + (p / 2) + (c / 2)).toFixed(2);
    }
    return 0;
  }, [boardType, mathsMarks, physicsMarks, chemistryMarks]);

  // College Cutoff Benchmarks Database
  const benchmarkColleges = [
    {
      id: 'col-ceg',
      name: 'College of Engineering, Guindy (CEG - Anna University)',
      location: 'Chennai, Tamil Nadu',
      rating: 4.8,
      avgPackage: '₹11.2 LPA',
      highestPackage: '₹44.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 198.5, BC: 196.5, MBC: 193.0, SC_ST: 185.0 },
      jeeThreshold: 98.2,
      tier: 'Tier 1 Govt',
      category: 'Autonomous / University Dept'
    },
    {
      id: 'col-psg',
      name: 'PSG College of Technology',
      location: 'Coimbatore, Tamil Nadu',
      rating: 4.9,
      avgPackage: '₹12.5 LPA',
      highestPackage: '₹48.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 197.0, BC: 195.0, MBC: 191.5, SC_ST: 182.0 },
      jeeThreshold: 97.5,
      tier: 'Tier 1 Private Aided',
      category: 'Autonomous'
    },
    {
      id: 'col-mit',
      name: 'Madras Institute of Technology (MIT Chromepet)',
      location: 'Chennai, Tamil Nadu',
      rating: 4.7,
      avgPackage: '₹9.8 LPA',
      highestPackage: '₹38.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 196.0, BC: 193.5, MBC: 189.0, SC_ST: 178.5 },
      jeeThreshold: 96.0,
      tier: 'Tier 1 Govt',
      category: 'University Dept'
    },
    {
      id: 'col-cit',
      name: 'Coimbatore Institute of Technology (CIT)',
      location: 'Coimbatore, Tamil Nadu',
      rating: 4.6,
      avgPackage: '₹8.6 LPA',
      highestPackage: '₹32.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 193.5, BC: 190.0, MBC: 185.0, SC_ST: 172.0 },
      jeeThreshold: 93.0,
      tier: 'Tier 1 Aided',
      category: 'Autonomous'
    },
    {
      id: 'col-sns',
      name: 'SNS College of Technology (Autonomous)',
      location: 'Coimbatore, Tamil Nadu',
      rating: 4.5,
      avgPackage: '₹6.2 LPA',
      highestPackage: '₹24.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 184.0, BC: 178.0, MBC: 171.0, SC_ST: 155.0 },
      jeeThreshold: 85.0,
      tier: 'Tier 2 Autonomous',
      category: 'Autonomous'
    },
    {
      id: 'col-kct',
      name: 'Kumaraguru College of Technology (KCT)',
      location: 'Coimbatore, Tamil Nadu',
      rating: 4.6,
      avgPackage: '₹7.8 LPA',
      highestPackage: '₹30.0 LPA',
      branch: 'Computer Science',
      cutoffs: { OC: 191.0, BC: 187.5, MBC: 182.0, SC_ST: 168.0 },
      jeeThreshold: 91.0,
      tier: 'Tier 2 Autonomous',
      category: 'Autonomous'
    }
  ];

  // Match predictor categorisation
  const predictionResults = useMemo(() => {
    return benchmarkColleges.map((col) => {
      let isEligible = false;
      let diff = 0;
      let status: 'Safe' | 'Target' | 'Reach' = 'Reach';

      if (boardType === 'jee') {
        diff = +(jeePercentile - col.jeeThreshold).toFixed(2);
        if (diff >= 1.5) status = 'Safe';
        else if (diff >= -1.5) status = 'Target';
        else status = 'Reach';
      } else {
        const required = col.cutoffs[selectedQuota];
        diff = +(calculatedCutoff - required).toFixed(2);
        if (diff >= 1.5) status = 'Safe';
        else if (diff >= -2.0) status = 'Target';
        else status = 'Reach';
      }

      return {
        ...col,
        diff,
        status,
        requiredCutoff: col.cutoffs[selectedQuota]
      };
    });
  }, [boardType, calculatedCutoff, jeePercentile, selectedQuota]);

  // =========================================================================
  // 2. TRANSFER & CREDIT EQUIVALENCE STATE
  // =========================================================================
  const [currentCgpa, setCurrentCgpa] = useState<number>(8.4);
  const [hasArrears, setHasArrears] = useState<boolean>(false);
  const [currentSemester, setCurrentSemester] = useState<number>(2);
  const [transferType, setTransferType] = useState<'inter_college' | 'lateral_entry'>('inter_college');
  const [diplomaAggregate, setDiplomaAggregate] = useState<number>(82);

  const transferEligibility = useMemo(() => {
    if (transferType === 'inter_college') {
      const eligible = currentCgpa >= 7.5 && !hasArrears && (currentSemester === 2 || currentSemester === 4);
      let reasons: string[] = [];
      if (currentCgpa < 7.5) reasons.push('Minimum Anna University requirement is 7.5 CGPA in completed semesters.');
      if (hasArrears) reasons.push('Zero standing arrears is strictly mandatory for transfer NOC approval.');
      if (currentSemester !== 2 && currentSemester !== 4) reasons.push('Inter-college transfers are permitted exclusively after Semester 2 or Semester 4.');

      return {
        isEligible: eligible,
        reasons,
        quotaAvailable: 'Seats subject to DOTE (Directorate of Technical Education) vacancy matrix (approx. 5-10% of intake)',
        documents: [
          'No Objection Certificate (NOC) signed by current College Principal',
          'Consent Letter & Vacancy Certificate from Target College',
          'Official Grade Sheets for all completed semesters',
          'Anna University Transfer Application Fee Challan (₹5,000)',
          'Equivalence Syllabus Certificate for mapped core courses'
        ]
      };
    } else {
      const eligible = diplomaAggregate >= 55;
      return {
        isEligible: eligible,
        reasons: eligible ? [] : ['Minimum aggregate of 55% across all 6 semesters of Diploma required.'],
        quotaAvailable: 'Direct 2nd Year (3rd Semester) entry via TNEA Lateral Entry Single-Window System (10% supernumerary seats)',
        documents: [
          'Diploma Provisional Certificate / Consolidated Marksheet',
          'Community Certificate for Reservation Quota',
          'Transfer Certificate (TC) from Polytechnic Institute',
          'TNEA Lateral Entry Allotment Order'
        ]
      };
    }
  }, [transferType, currentCgpa, hasArrears, currentSemester, diplomaAggregate]);

  // =========================================================================
  // 3. ENTRANCE EXAM CALENDAR DATA
  // =========================================================================
  const examRoadmap = [
    {
      name: 'TNEA 2025 (Tamil Nadu Engineering Admissions)',
      authority: 'Anna University / DOTE',
      eligibility: '12th HSC (Maths, Physics, Chem)',
      regPeriod: 'May 06 – June 06, 2025',
      counselingPeriod: 'July – August 2025',
      badge: 'Single Window Engineering',
      status: 'Upcoming Registration',
      link: 'https://www.tneaonline.org'
    },
    {
      name: 'JEE Main 2025 (Session 1 & 2)',
      authority: 'National Testing Agency (NTA)',
      eligibility: '12th Science Stream / 75% Criteria',
      regPeriod: 'Nov – Dec 2024 (S1) | Feb – Mar 2025 (S2)',
      counselingPeriod: 'JoSAA / CSAB (June 2025)',
      badge: 'National Tier 1 NITs/IIITs/GFTIs',
      status: 'Admit Card & Exam Window',
      link: 'https://jeemain.nta.nic.in'
    },
    {
      name: 'VITEEE 2025',
      authority: 'Vellore Institute of Technology',
      eligibility: '60% in PCM/PCB (50% reserved categories)',
      regPeriod: 'Nov 2024 – March 2025',
      counselingPeriod: 'May 2025 (Online Multi-Phase)',
      badge: 'Private Deemed University',
      status: 'Registration Open',
      link: 'https://vit.ac.in'
    },
    {
      name: 'COMEDK UGET 2025',
      authority: 'Karnataka Private Medical & Engg Association',
      eligibility: '12th PCM with 45% aggregate',
      regPeriod: 'Feb – April 2025',
      counselingPeriod: 'June – July 2025',
      badge: 'Top Karnataka Engineering Colleges',
      status: 'Registration Active',
      link: 'https://www.comedk.org'
    },
    {
      name: 'CUET UG 2025',
      authority: 'National Testing Agency (NTA)',
      eligibility: '12th any recognized board',
      regPeriod: 'February – March 2025',
      counselingPeriod: 'July 2025 (Central Universities)',
      badge: 'Central & State Universities',
      status: 'Application Active',
      link: 'https://cuetug.ntaonline.in'
    }
  ];

  // =========================================================================
  // 4. ADMISSION & TRANSFER MENTORS
  // =========================================================================
  const transferMentors = [
    {
      name: 'Kavitha Ramasamy',
      role: 'Transferred from Affiliated to CEG Anna Univ (CSE)',
      cgpa: '9.2 CGPA',
      year: 'Batch of 2025',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      helpTopics: ['Anna University NOC Formalities', 'Credit Mappings', 'Hostel Vacancy'],
      available: 'Free 15-min Chat'
    },
    {
      name: 'Aditya Narayanan',
      role: 'Lateral Entry (Diploma to PSG Tech B.E. Mechanical)',
      cgpa: '8.9 CGPA',
      year: 'Batch of 2024 (Now at Caterpillar)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      helpTopics: ['TNEA Lateral Counseling', 'Maths Bridge Courses', 'Campus Transition'],
      available: 'Available this Weekend'
    },
    {
      name: 'Deepak Selvam',
      role: '12th Cutoff 196.5 | TNEA Round 1 Rank #142',
      cgpa: '9.0 CGPA',
      year: 'CIT Coimbatore (AI & DS)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      helpTopics: ['Choice Filling Strategy', 'Autonomous vs Affiliated', 'Lab Infrastructure'],
      available: 'Free Counseling'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="apple-card overflow-hidden border-[#E2E8F0] shadow-xs">
        <div className="bg-gradient-to-r from-[#075080] via-[#1687D4] to-[#3B9FE8] p-6 sm:p-8 text-white relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Campus Lenz • School & Transfer Advisory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              School-to-College & Inter-Campus Transfer Navigator
            </h2>
            <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed">
              Designed specifically for 12th standard school students, parents, and existing college undergraduates seeking branch change, lateral entry, or university transfers across accredited institutions.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex overflow-x-auto border-t border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs font-bold gap-1">
          <button
            onClick={() => setSubTab('cutoff_predictor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              subTab === 'cutoff_predictor'
                ? 'bg-white text-[#1687D4] shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#1687D4]" />
            <span>12th Cutoff & College Matcher</span>
          </button>

          <button
            onClick={() => setSubTab('transfer_rules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              subTab === 'transfer_rules'
                ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Inter-College Transfer & Lateral Rules</span>
          </button>

          <button
            onClick={() => setSubTab('exam_calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              subTab === 'exam_calendar'
                ? 'bg-white text-amber-700 shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>2025 Entrance Exam Timelines</span>
          </button>

          <button
            onClick={() => setSubTab('mentors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              subTab === 'mentors'
                ? 'bg-white text-emerald-700 shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Senior Transfer Mentors</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. CUTOFF & COLLEGE MATCHER                                          */}
      {/* ===================================================================== */}
      {subTab === 'cutoff_predictor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="apple-card p-5 border-[#E2E8F0] shadow-xs space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#1687D4]" />
                  Eligibility & Marks Input
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1687D4]">
                  TNEA 2025 Matrix
                </span>
              </div>

              {/* Board Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Examination Board
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBoardType('tn_state')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                      boardType === 'tn_state'
                        ? 'border-[#1687D4] bg-[#E8F5FF] text-[#1687D4]'
                        : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    TN HSC
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardType('cbse')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                      boardType === 'cbse'
                        ? 'border-[#1687D4] bg-[#E8F5FF] text-[#1687D4]'
                        : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    CBSE / ISC
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardType('jee')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                      boardType === 'jee'
                        ? 'border-[#1687D4] bg-[#E8F5FF] text-[#1687D4]'
                        : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    JEE Main
                  </button>
                </div>
              </div>

              {/* Marks inputs */}
              {boardType !== 'jee' ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Mathematics (out of 100)</span>
                      <span className="font-bold text-[#1687D4]">{mathsMarks} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={mathsMarks}
                      onChange={(e) => setMathsMarks(Number(e.target.value))}
                      className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Physics (out of 100)</span>
                      <span className="font-bold text-[#1687D4]">{physicsMarks} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={physicsMarks}
                      onChange={(e) => setPhysicsMarks(Number(e.target.value))}
                      className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Chemistry (out of 100)</span>
                      <span className="font-bold text-[#1687D4]">{chemistryMarks} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={chemistryMarks}
                      onChange={(e) => setChemistryMarks(Number(e.target.value))}
                      className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Calculated Cutoff badge */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#1687D4]">Your Normalized Cutoff</div>
                      <div className="text-xs text-slate-500 font-medium">Maths + (Physics/2) + (Chem/2)</div>
                    </div>
                    <div className="text-2xl font-black text-[#0F172A]">
                      {calculatedCutoff} <span className="text-xs font-normal text-slate-400">/ 200</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>JEE Main NTA Percentile</span>
                      <span className="font-bold text-[#1687D4]">{jeePercentile} %ile</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="99.9"
                      step="0.1"
                      value={jeePercentile}
                      onChange={(e) => setJeePercentile(Number(e.target.value))}
                      className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Target Branch */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Target Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#E2E8F0] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="AI & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              {/* Quota Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Reservation Category (TNEA Quota)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['OC', 'BC', 'MBC', 'SC_ST'] as const).map((quota) => (
                    <button
                      key={quota}
                      type="button"
                      onClick={() => setSelectedQuota(quota)}
                      className={`py-1.5 text-center rounded-xl text-xs font-bold border transition-all ${
                        selectedQuota === quota
                          ? 'border-[#1687D4] bg-[#E8F5FF] text-[#1687D4]'
                          : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {quota === 'SC_ST' ? 'SC/ST' : quota}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick summary note */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Counseling Reality Check</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Cutoff thresholds are calculated from previous year DOTE Round 1 & Round 2 final allotment ranks. Actual cutoffs may vary by ±1.25 marks based on 2025 HSC pass percentage.
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Predicted Institution Allotments
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedBranch} • Quota: {selectedQuota} • Cutoff Score: {boardType === 'jee' ? `${jeePercentile}%ile` : `${calculatedCutoff} / 200`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                  ● Safe
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                  ● Target
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px]">
                  ● Reach
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {predictionResults.map((college) => {
                const statusConfig = {
                  Safe: {
                    bg: 'bg-emerald-50/50',
                    border: 'border-emerald-200',
                    badgeBg: 'bg-emerald-500 text-white',
                    desc: 'High probability of seat allotment in Round 1'
                  },
                  Target: {
                    bg: 'bg-amber-50/50',
                    border: 'border-amber-200',
                    badgeBg: 'bg-amber-500 text-white',
                    desc: 'Moderate probability; recommended for top choice priority'
                  },
                  Reach: {
                    bg: 'bg-rose-50/40',
                    border: 'border-rose-200',
                    badgeBg: 'bg-rose-500 text-white',
                    desc: 'Aspirational choice; apply in Round 1 upward movement'
                  }
                }[college.status];

                return (
                  <div
                    key={college.id}
                    className={`apple-card p-4 sm:p-5 border transition-all hover:shadow-md ${statusConfig.bg} ${statusConfig.border}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusConfig.badgeBg}`}>
                            {college.status} ({college.diff >= 0 ? `+${college.diff}` : college.diff})
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {college.tier}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            ★ {college.rating} Rating
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">
                          {college.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{college.location}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">Avg CTC: {college.avgPackage}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">Highest: {college.highestPackage}</span>
                        </div>
                      </div>

                      {/* Cutoff Comparison Column */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">
                            {boardType === 'jee' ? 'Min %ile Required' : 'Last Year Cutoff'}
                          </div>
                          <div className="text-lg font-black text-[#0F172A]">
                            {boardType === 'jee' ? `${college.jeeThreshold}%` : college.requiredCutoff}
                          </div>
                        </div>

                        <Link
                          href={`/college/${college.id}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#1687D4] hover:underline"
                        >
                          View Reviews <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 text-[11px] font-medium">
                        {statusConfig.desc}
                      </span>
                      <Link
                        href={`/explore?tab=compare`}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900"
                      >
                        Add to Compare Matrix →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. TRANSFER & CREDIT EQUIVALENCE                                     */}
      {/* ===================================================================== */}
      {subTab === 'transfer_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transfer Checklist Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="apple-card p-5 border-[#E2E8F0] shadow-xs space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Transfer Eligibility Checker
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  DOTE & University Norms
                </span>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Transfer Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferType('inter_college')}
                    className={`p-2.5 text-center rounded-xl text-xs font-bold border transition-all ${
                      transferType === 'inter_college'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                        : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Inter-College Transfer
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Sem 3 or Sem 5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('lateral_entry')}
                    className={`p-2.5 text-center rounded-xl text-xs font-bold border transition-all ${
                      transferType === 'lateral_entry'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                        : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Lateral Entry (LEA)
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Diploma to Direct 2nd Yr</span>
                  </button>
                </div>
              </div>

              {transferType === 'inter_college' ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Cumulative GPA (CGPA)</span>
                      <span className="font-bold text-indigo-600">{currentCgpa} / 10.0</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="10.0"
                      step="0.1"
                      value={currentCgpa}
                      onChange={(e) => setCurrentCgpa(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Min 7.5 required</span>
                      <span>Target: 8.5+</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Completed Semesters
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentSemester(2)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          currentSemester === 2 ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Completed 1st Year (Sem 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentSemester(4)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          currentSemester === 4 ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Completed 2nd Year (Sem 4)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Standing Arrears Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHasArrears(false)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          !hasArrears ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Zero Arrears (Clear)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasArrears(true)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          hasArrears ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Has Pending Arrears
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Diploma Aggregate Percentage</span>
                      <span className="font-bold text-indigo-600">{diplomaAggregate}%</span>
                    </div>
                    <input
                      type="range"
                      min="45"
                      max="100"
                      step="1"
                      value={diplomaAggregate}
                      onChange={(e) => setDiplomaAggregate(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Min 55% eligibility</span>
                      <span>Top Colleges cutoff: 80%+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs ${
                  transferEligibility.isEligible
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  {transferEligibility.isEligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Eligible for Transfer Application</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Currently Ineligible for Transfer</span>
                    </>
                  )}
                </div>
                {transferEligibility.reasons.length > 0 ? (
                  <ul className="mt-2 list-disc list-inside space-y-1 text-[11px]">
                    {transferEligibility.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[11px] leading-relaxed">
                    You satisfy statutory university minimum requirements. Proceed with NOC acquisition and vacancy confirmation at the receiving institution.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines & Mandatory Documents */}
          <div className="lg:col-span-7 space-y-4">
            <div className="apple-card p-5 border-[#E2E8F0] shadow-xs space-y-4 bg-white">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1687D4]" />
                Mandatory Documentation & Step-by-Step Procedure
              </h3>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="font-bold text-slate-900 mb-1">Seat Quota & Approval Window</div>
                <p className="text-[11px] leading-relaxed">
                  {transferEligibility.quotaAvailable}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Required Verification Checklist:
                </div>
                {transferEligibility.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E2E8F0]">
                    <span className="p-1 rounded-lg bg-blue-50 text-[#1687D4] mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[#0F172A]">{doc}</div>
                      <div className="text-[10px] text-slate-400">Must be verified with official institutional seal</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Need guidance on Anna University DOTE filing?
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab('mentors')}
                  className="px-4 py-2 rounded-xl bg-[#1687D4] text-white font-bold hover:bg-[#1272B4] transition-all shadow-xs"
                >
                  Consult Verified Transfer Mentors →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ENTRANCE EXAM ROADMAP                                             */}
      {/* ===================================================================== */}
      {subTab === 'exam_calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              National & State Level Engineering Admissions Timelines (2025–2026)
            </h3>
            <span className="text-xs text-slate-500">Updated weekly with official gazettes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examRoadmap.map((exam, i) => (
              <div key={i} className="apple-card p-5 border-[#E2E8F0] shadow-xs bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {exam.badge}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F172A]">{exam.name}</h4>
                    <p className="text-xs text-slate-500">{exam.authority}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-blue-50 text-[#1687D4]">
                    {exam.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Registration Dates</span>
                    <span className="font-bold text-slate-800 text-[11px]">{exam.regPeriod}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Counseling Rounds</span>
                    <span className="font-bold text-slate-800 text-[11px]">{exam.counselingPeriod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px]">{exam.eligibility}</span>
                  <a
                    href={exam.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#1687D4] hover:underline text-[11px]"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SENIOR TRANSFER MENTORS                                           */}
      {/* ===================================================================== */}
      {subTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Verified Admissions & Lateral Transfer Student Mentors
              </h3>
              <p className="text-xs text-slate-500">
                Connect directly with peers who walked the path — genuine guidance on choices, cutoffs, and hostel realities without college marketing spin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {transferMentors.map((m, idx) => (
              <div key={idx} className="apple-card p-5 border-[#E2E8F0] shadow-xs bg-white space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E2E8F0]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{m.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{m.year}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                        {m.cgpa}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {m.role}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Can Help With:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.helpTopics.map((topic, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-blue-50 text-[#1687D4]">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700">● {m.available}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Connect request initiated for mentor ${m.name}. Check your Campus Messages inbox!`)}
                    className="px-3 py-1.5 rounded-xl bg-[#1687D4] text-white text-xs font-bold hover:bg-[#1272B4] transition-all shadow-xs"
                  >
                    Request Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
