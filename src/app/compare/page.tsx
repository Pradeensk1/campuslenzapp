'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import {
  Scale,
  Check,
  Star,
  Award,
  DollarSign,
  GraduationCap,
  Home,
  Zap,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckSquare,
  Square,
  ShieldCheck,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type CompareAttributeKey = 'placements' | 'fees' | 'academics' | 'campus' | 'activities';

interface AttributeOption {
  key: CompareAttributeKey;
  label: string;
  desc: string;
  icon: any;
}

const ATTRIBUTE_OPTIONS: AttributeOption[] = [
  { key: 'placements', label: 'Placements & Job Offers', desc: 'Highest & average packages, top recruiters, PPOs, training', icon: Award },
  { key: 'fees', label: 'Fees & ROI', desc: 'Tuition, hostel, mess, scholarships & return on investment', icon: DollarSign },
  { key: 'academics', label: 'Academics & Faculty', desc: 'Faculty ratio, Ph.D. percent, curriculum, lab equipment', icon: GraduationCap },
  { key: 'campus', label: 'Hostel & Campus Amenities', desc: 'Wi-Fi speeds, curfew times, mess food rating, sports & medical', icon: Home },
  { key: 'activities', label: 'Clubs & Startup Incubation', desc: 'Tech fests, active clubs, hackathons, incubation support', icon: Zap },
];

export default function ComparePage() {
  const { colleges, savedCollegeIds, toggleSaveCollege } = useApp();

  // Selected Colleges State (Supports multiple selections)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    colleges.map(c => c.id) // Default compare all available colleges
  );

  // Selected Comparison Attribute Checkboxes (The new required feature!)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<CompareAttributeKey, boolean>>({
    placements: true,
    fees: true,
    academics: true,
    campus: true,
    activities: true,
  });

  const toggleCollege = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        alert('Please keep at least one college selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAttribute = (key: CompareAttributeKey) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectOnlyAttribute = (key: CompareAttributeKey) => {
    const next = {
      placements: false,
      fees: false,
      academics: false,
      campus: false,
      activities: false,
    };
    next[key] = true;
    setSelectedAttributes(next);
  };

  const selectAllAttributes = () => {
    setSelectedAttributes({
      placements: true,
      fees: true,
      academics: true,
      campus: true,
      activities: true,
    });
  };

  const activeColleges = colleges.filter(c => selectedIds.includes(c.id));
  const activeAttributeCount = Object.values(selectedAttributes).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HEADER HERO */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-[#2563EB]">
          <Scale className="h-5 w-5" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Multi-College Deep Evidence Matrix
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl">
          Compare multiple colleges across granular parameters including tier-1 packages, verified mess ratings, student-faculty ratios, and transparent overall scores.
        </p>

        {/* College Selector Badges */}
        <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0F172A]">
              Selected Colleges ({activeColleges.length} of {colleges.length}):
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedIds(colleges.map(c => c.id))}
                className="text-[#2563EB] hover:underline font-semibold"
              >
                Select All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {colleges.map((col) => {
              const isSelected = selectedIds.includes(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => toggleCollege(col.id)}
                  className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-xs scale-102'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-[#2563EB]' : 'border border-[#CBD5E1]'}`}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. ATTRIBUTE CHECKBOX FILTER BAR (The requested specific feature) */}
      <div className="apple-card p-5 sm:p-6 space-y-4 border-l-4 border-l-[#2563EB]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-1.5">
              <span>Filter Comparison Attributes</span>
              <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs text-[#2563EB] font-bold">
                {activeAttributeCount} Active
              </span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Check/uncheck attributes below to focus specifically on what matters to you (e.g. check <strong>Placements Only</strong> or <strong>Fees Only</strong>).
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={selectAllAttributes}
              className="rounded-lg bg-[#F1F5F9] px-2.5 py-1 text-[#0F172A] font-semibold hover:bg-[#E2E8F0] transition"
            >
              All Details
            </button>
            <button
              onClick={() => selectOnlyAttribute('placements')}
              className="rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[#2563EB] font-semibold hover:bg-[#DBEAFE] transition"
            >
              Placements Only
            </button>
            <button
              onClick={() => selectOnlyAttribute('fees')}
              className="rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[#059669] font-semibold hover:bg-[#D1FAE5] transition"
            >
              Fees & ROI Only
            </button>
            <button
              onClick={() => selectOnlyAttribute('campus')}
              className="rounded-lg bg-[#FEF3C7] px-2.5 py-1 text-[#D97706] font-semibold hover:bg-[#FDE68A] transition"
            >
              Hostel Only
            </button>
          </div>
        </div>

        {/* Interactive Checkbox Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
          {ATTRIBUTE_OPTIONS.map(opt => {
            const isChecked = selectedAttributes[opt.key];
            const Icon = opt.icon;
            return (
              <label
                key={opt.key}
                onClick={() => toggleAttribute(opt.key)}
                className={`cursor-pointer rounded-xl border p-3 flex items-start space-x-2.5 transition-all ${
                  isChecked
                    ? 'border-[#2563EB] bg-[#EFF6FF]/60 shadow-2xs'
                    : 'border-[#E2E8F0] bg-white opacity-70 hover:opacity-100 hover:bg-[#F8FAFC]'
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 ${isChecked ? 'bg-[#2563EB] text-white' : 'border border-[#CBD5E1]'}`}>
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1">
                    <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span className="text-xs font-bold text-[#0F172A] truncate">{opt.label}</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2 leading-tight">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. OVERALL BENCHMARK SCORES (The requested Overall Score feature) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0F172A]">
            <Sparkles className="h-5 w-5 text-[#2563EB]" />
            <h2 className="text-base sm:text-lg font-bold">
              Transparent Overall Benchmark Scores (0–100)
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">Empirical data weighted analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activeColleges.map((col) => (
            <div key={col.id} className="apple-card p-5 space-y-4 border-t-4 border-t-[#2563EB]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] line-clamp-1">{col.name}</h3>
                  <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB] mt-1 inline-block">
                    {col.overallScore.badge}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-[#2563EB]">
                    {col.overallScore.total}
                    <span className="text-xs text-[#94A3B8] font-normal">/100</span>
                  </div>
                  <p className="text-[9px] uppercase font-bold text-[#059669]">Overall Score</p>
                </div>
              </div>

              {/* Progress Meters */}
              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-[#64748B] mb-0.5 font-medium">
                    <span>Placements & Packages</span>
                    <span className="font-bold text-[#0F172A]">{col.overallScore.placementsScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${col.overallScore.placementsScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-0.5 font-medium">
                    <span>Fees & ROI</span>
                    <span className="font-bold text-[#0F172A]">{col.overallScore.feesRoiScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full bg-[#059669] rounded-full"
                      style={{ width: `${col.overallScore.feesRoiScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-0.5 font-medium">
                    <span>Academic Excellence</span>
                    <span className="font-bold text-[#0F172A]">{col.overallScore.academicsScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full bg-[#D97706] rounded-full"
                      style={{ width: `${col.overallScore.academicsScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-0.5 font-medium">
                    <span>Campus & Hostel Life</span>
                    <span className="font-bold text-[#0F172A]">{col.overallScore.campusLifeScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6] rounded-full"
                      style={{ width: `${col.overallScore.campusLifeScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. GRANULAR MULTI-DIMENSIONAL COMPARISON TABLE */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Sticky Table Header */}
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]">
              <tr>
                <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B] w-64 min-w-[200px]">
                  Attributes & Granular Details
                </th>
                {activeColleges.map((col) => (
                  <th key={col.id} className="p-4 sm:p-5 font-bold text-sm min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <Link href={`/colleges/${col.slug}`} className="hover:text-[#2563EB] transition-colors">
                        {col.name}
                      </Link>
                      <button
                        onClick={() => toggleSaveCollege(col.id)}
                        className={`p-1.5 rounded-md ${savedCollegeIds.includes(col.id) ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#0F172A]'}`}
                      >
                        <Bookmark className="h-4 w-4" fill={savedCollegeIds.includes(col.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <span className="text-[10px] font-normal text-[#64748B] block mt-0.5">
                      {col.location}, {col.state} • {col.collegeType}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {/* SECTION: PLACEMENTS */}
              {selectedAttributes.placements && (
                <>
                  <tr className="bg-[#EFF6FF]/60 font-bold text-[#1E3A8A]">
                    <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <Award className="h-3.5 w-3.5 text-[#2563EB]" />
                      <span>1. Placement & Career Metrics</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Highest Package Offered</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-black text-[#059669] text-sm">
                        {c.placementDetails.highestPackage}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Average & Median Package</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4">
                        <span className="font-bold text-[#0F172A]">{c.placementDetails.averagePackage}</span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">Median: {c.placementDetails.medianPackage}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Placement Percentage</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                        {c.placementDetails.placementRate}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Tier-1 Product Recruiter Hires</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                        {c.placementDetails.tier1HiresCount} students placed
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Top Tech Recruiters</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.placementDetails.topRecruiters.map(r => (
                            <span key={r} className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Summer Internship Offers (PPOs)</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.placementDetails.internshipOffers}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Placement Training Support</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.placementDetails.placementTraining}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* SECTION: FEES & ROI */}
              {selectedAttributes.fees && (
                <>
                  <tr className="bg-[#ECFDF5]/70 font-bold text-[#065F46]">
                    <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-[#059669]" />
                      <span>2. Tuition Fees, Hostel Costs & ROI</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Annual Tuition Fee</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#059669]">
                        {c.feeDetails.tuitionAnnual}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Annual Hostel Room Fee</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.feeDetails.hostelAnnual}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Monthly Mess Food Expense</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.feeDetails.messMonthly}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Scholarship & Waivers</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.feeDetails.scholarshipsAvailable}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Calculated Return on Investment (ROI)</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-black text-[#0F172A]">
                        {c.feeDetails.roiRating}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* SECTION: ACADEMICS & FACULTY */}
              {selectedAttributes.academics && (
                <>
                  <tr className="bg-[#FEF3C7]/60 font-bold text-[#92400E]">
                    <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-[#D97706]" />
                      <span>3. Academics, Faculty & Research Rigor</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Student-to-Faculty Ratio</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                        {c.academicDetails.studentFacultyRatio}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Faculty Ph.D. Qualifications</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                        {c.academicDetails.phdFacultyPercent}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Curriculum Autonomy & Electives</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.academicDetails.curriculumFlexibility}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Annual Sponsored R&D Grants</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#059669]">
                        {c.academicDetails.researchFundingAnnual}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Lab & Compute Equipment</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.academicDetails.labEquipmentGrade}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* SECTION: CAMPUS & HOSTEL */}
              {selectedAttributes.campus && (
                <>
                  <tr className="bg-[#F3E8FF]/60 font-bold text-[#6B21A8]">
                    <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <Home className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      <span>4. Hostel, Wi-Fi & Living Conditions</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Campus Wi-Fi Speeds</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                        {c.campusDetails.wifiSpeed}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Hostel In-Time Curfew</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-medium text-[#D97706]">
                        {c.campusDetails.hostelCurfew}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Mess Food Quality Rating</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4">
                        <span className="font-bold text-[#0F172A]">★ {c.campusDetails.messFoodRating}</span>
                        <span className="text-[10px] text-[#94A3B8] ml-1">/ 5.0 (Student audit)</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Sports & Recreation Grounds</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.campusDetails.sportsComplex}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">24/7 Medical & Hospital Access</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.campusDetails.medicalFacility}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* SECTION: ACTIVITIES & CLUBS */}
              {selectedAttributes.activities && (
                <>
                  <tr className="bg-[#FFF1F2]/60 font-bold text-[#9F1239]">
                    <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <Zap className="h-3.5 w-3.5 text-[#E11D48]" />
                      <span>5. Extracurriculars, Hackathons & Startup Culture</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Flagship Campus Symposium</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                        {c.activityDetails.annualFestName}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Active Technical Student Clubs</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                        {c.activityDetails.techClubsCount} student clubs
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Startup Incubator / Maker Space</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-medium text-[#059669]">
                        {c.activityDetails.incubationCenter}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Annual Hackathons Hosted</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                        {c.activityDetails.hackathonsOrganizedAnnual} hackathons/year
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#64748B]">Industry Corporate MoUs</td>
                    {activeColleges.map(c => (
                      <td key={c.id} className="p-4 text-[#475569]">
                        {c.activityDetails.industryMoUs} signed partnerships
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
