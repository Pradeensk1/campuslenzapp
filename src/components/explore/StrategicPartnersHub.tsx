'use client';

import React, { useState, useMemo } from 'react';
import {
  Handshake,
  Award,
  Sparkles,
  BookOpen,
  DollarSign,
  Home,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Star,
  Zap,
  Tag,
  PhoneCall,
  Clock,
  ChevronRight,
  X,
  Send,
  Building2,
  Percent
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

type PartnerCategory = 'all' | 'coaching' | 'bootcamps' | 'loans' | 'housing';

interface PartnerListing {
  id: string;
  name: string;
  category: 'coaching' | 'bootcamps' | 'loans' | 'housing';
  categoryLabel: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: number;
  highlightOffer: string;
  couponCode?: string;
  logoText: string;
  logoBg: string;
  features: string[];
  ctaLabel: string;
  avgCost: string;
  locationScope: string;
}

export default function StrategicPartnersHub() {
  const { currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>('all');
  const [leadModalPartner, setLeadModalPartner] = useState<PartnerListing | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState(currentUser?.fullName || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.email || '');
  const [applicantGoal, setApplicantGoal] = useState('Immediate Enrollment / Discount Claim');

  // =========================================================================
  // LOAN EMI CALCULATOR STATE
  // =========================================================================
  const [loanAmount, setLoanAmount] = useState<number>(750000); // 7.5 Lakhs
  const [loanInterest, setLoanInterest] = useState<number>(8.5); // 8.5%
  const [loanTenureYears, setLoanTenureYears] = useState<number>(7); // 7 years

  const loanCalculations = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = loanInterest / (12 * 100);
    const totalMonths = loanTenureYears * 12;

    if (monthlyRate === 0) {
      const emi = principal / totalMonths;
      return { emi: Math.round(emi), totalPayment: principal, totalInterest: 0 };
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest)
    };
  }, [loanAmount, loanInterest, loanTenureYears]);

  // =========================================================================
  // PARTNERS DIRECTORY DATA
  // =========================================================================
  const PARTNER_LISTINGS: PartnerListing[] = [
    {
      id: 'p-ace',
      name: 'ACE Engineering Academy',
      category: 'coaching',
      categoryLabel: 'GATE & ESE Exam Prep',
      tagline: '#1 Ranked Institute for GATE CSE, ECE, ME & EE Aspirants',
      description: 'Comprehensive 1-year and 2-year live and classroom foundation programs. Over 75 AIR 1 ranks in GATE across 15 years.',
      rating: 4.9,
      reviewsCount: 1420,
      highlightOffer: 'Flat ₹6,000 Scholarship Concession for Campus Lenz students',
      couponCode: 'LENZACE15',
      logoText: 'ACE',
      logoBg: 'bg-blue-600',
      features: ['Live Interactive Sessions', 'Comprehensive Workbooks', 'National Test Series (GATE OTS)', '1:1 Doubt Solving'],
      ctaLabel: 'Claim ₹6,000 Scholarship',
      avgCost: '₹38,000 - ₹55,000',
      locationScope: 'All India Online & South Hubs (Chennai, Hyd)'
    },
    {
      id: 'p-scaler',
      name: 'Scaler Academy by InterviewBit',
      category: 'bootcamps',
      categoryLabel: 'Fullstack & System Design',
      tagline: 'Tech Upskilling & Guaranteed Placement Support with MAANG Mentors',
      description: 'Structured curriculum designed by top tech leads from Google & Amazon. Covers advanced DSA, Distributed Systems, Microservices, and System Architecture.',
      rating: 4.8,
      reviewsCount: 980,
      highlightOffer: 'Campus Lenz Exclusive: Free Tech Assessment + ₹20,000 Grant',
      couponCode: 'LENZSCALER20',
      logoText: 'SCALER',
      logoBg: 'bg-rose-600',
      features: ['1:1 Mentorship from FAANG Engineers', 'Live Production Capstones', 'Mock Technical Interviews', 'Placement Referral Network'],
      ctaLabel: 'Get Free Tech Assessment',
      avgCost: 'EMI starts ₹8,200/mo',
      locationScope: 'Global Live Online Cohorts'
    },
    {
      id: 'p-sbi-scholar',
      name: 'SBI Scholar Education Loan',
      category: 'loans',
      categoryLabel: 'Institutional Education Loan',
      tagline: '100% Financing with 0 Collateral for Premier & Autonomous Institutes',
      description: 'Concessionary interest rate starting from 8.15% p.a. covering tuition fees, hostel, laptop, and academic books with zero prepayment penalties.',
      rating: 4.9,
      reviewsCount: 3100,
      highlightOffer: 'Zero Processing Fees + Moratorium Period (Course + 1 Year)',
      couponCode: 'LENZLOAN0',
      logoText: 'SBI',
      logoBg: 'bg-[#1687D4]',
      features: ['Collateral-free up to ₹20 Lakhs', 'Co-borrower simple KYC', 'Repayment up to 15 years', '80E Tax Deduction Benefit'],
      ctaLabel: 'Check Pre-Approved Eligibility',
      avgCost: 'Interest Rate from 8.15% p.a.',
      locationScope: 'Pan India Branches & In-Campus Desks'
    },
    {
      id: 'p-hdfc-credila',
      name: 'HDFC Credila Student Finance',
      category: 'loans',
      categoryLabel: 'Specialized Student Loans',
      tagline: 'Customized Education Loans with Doorstep Document Pickup',
      description: 'Fast digital sanctions within 72 hours. Sanctions available even prior to counseling seat allotment to ensure fee security.',
      rating: 4.7,
      reviewsCount: 1850,
      highlightOffer: 'Sanction letter in 72 hours + ₹5,000 Amazon Tech Voucher',
      couponCode: 'LENZCREDILA',
      logoText: 'HDFC',
      logoBg: 'bg-red-700',
      features: ['Pre-admission sanction letters', 'Living expenses & device funding', 'Flexible repayment structures', 'Fast digital processing'],
      ctaLabel: 'Apply for Fast Sanction',
      avgCost: 'Interest from 9.25% p.a.',
      locationScope: 'All Metros & Tier 1/2 Cities'
    },
    {
      id: 'p-stanza',
      name: 'Stanza Living Student Residences',
      category: 'housing',
      categoryLabel: 'Verified Student Housing',
      tagline: 'Modern Co-living & Managed Hostels Near Major Tech Campuses',
      description: 'Fully furnished AC/Non-AC rooms with high-speed Wi-Fi, biometric security, daily housekeeping, and 4-time chef-curated meals.',
      rating: 4.7,
      reviewsCount: 2200,
      highlightOffer: 'Book Free Campus Visit + Flat ₹1,500 off 1st Month Rent',
      couponCode: 'LENZROOM15',
      logoText: 'STANZA',
      logoBg: 'bg-purple-700',
      features: ['Biometric 24x7 Security', 'Chef Curated 4 Meals/Day', 'Daily Professional Housekeeping', 'Gaming & Study Lounges'],
      ctaLabel: 'Book Free Campus Visit',
      avgCost: '₹6,500 - ₹12,000 / month',
      locationScope: 'Coimbatore (near PSG/CIT), Chennai & Bangalore'
    },
    {
      id: 'p-time',
      name: 'T.I.M.E. Education',
      category: 'coaching',
      categoryLabel: 'CAT & Higher Studies',
      tagline: 'Leading Coaching for CAT, MBA Admissions & Bank PO Exams',
      description: 'Rigorous national test series (AIMCAT) simulating actual examination environments with sectional percentiles and GD/PI preparation.',
      rating: 4.8,
      reviewsCount: 1640,
      highlightOffer: 'Free All-India Mock Diagnostic Test + 15% Campus Discount',
      couponCode: 'LENZTIME15',
      logoText: 'TIME',
      logoBg: 'bg-emerald-600',
      features: ['AIMCAT National Test Engine', 'IIM Alumni Mentorship', 'Comprehensive Study Material', 'WAT/PI Mentoring'],
      ctaLabel: 'Take Free Diagnostic Test',
      avgCost: '₹28,000 - ₹45,000',
      locationScope: 'Classroom & Online Pan-South'
    }
  ];

  const filteredPartners = useMemo(() => {
    if (selectedCategory === 'all') return PARTNER_LISTINGS;
    return PARTNER_LISTINGS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const handleOpenLeadModal = (partner: PartnerListing) => {
    setLeadModalPartner(partner);
    setLeadSubmitted(false);
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      alert('Please enter your name.');
      return;
    }
    setLeadSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="apple-card overflow-hidden border-[#E2E8F0] shadow-xs">
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] p-6 sm:p-8 text-white relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3 text-cyan-300">
              <Handshake className="w-4 h-4 text-cyan-300" />
              <span>Campus Lenz • Strategic Partner Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Curated Career, Coaching, Loan & Living Ecosystem
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              We negotiate high-value partner concessions, zero-collateral student loans, guaranteed bootcamps, and verified off-campus student housing exclusively for the Campus Lenz student community.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex overflow-x-auto border-t border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs font-bold gap-1">
          {[
            { id: 'all', label: 'All Ecosystem Partners', icon: Sparkles },
            { id: 'coaching', label: 'GATE & CAT Coaching', icon: Award },
            { id: 'bootcamps', label: 'Tech & Coding Bootcamps', icon: Zap },
            { id: 'loans', label: 'Education Loans & EMI', icon: DollarSign },
            { id: 'housing', label: 'Verified Student Housing / PGs', icon: Home },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as PartnerCategory)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white text-[#1687D4] shadow-xs border border-[#E2E8F0]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#1687D4]' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* EDUCATION LOAN EMI ESTIMATOR (SHOWN ON 'ALL' OR 'LOANS')             */}
      {/* ===================================================================== */}
      {(selectedCategory === 'all' || selectedCategory === 'loans') && (
        <div className="apple-card p-6 border-[#E2E8F0] shadow-xs bg-white space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1687D4] uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-[#1687D4]" />
                Institutional Student Loan Estimator
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                Calculate Monthly EMI & Education Financing Cost
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tax Exempt u/s 80E
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Target Loan Amount (Tuition + Living)</span>
                  <span className="text-[#1687D4] font-black text-sm">
                    ₹{(loanAmount / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="4000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹1 Lakh</span>
                  <span>₹20 Lakhs (Collateral-Free Limit)</span>
                  <span>₹40 Lakhs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Interest Rate (Annual)</span>
                  <span className="text-[#1687D4] font-black text-sm">{loanInterest}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="7.5"
                  max="14.0"
                  step="0.1"
                  value={loanInterest}
                  onChange={(e) => setLoanInterest(Number(e.target.value))}
                  className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>7.5% (Premier Concessions)</span>
                  <span>10.5% (Market Avg)</span>
                  <span>14.0%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Repayment Tenure (Years after Moratorium)</span>
                  <span className="text-[#1687D4] font-black text-sm">{loanTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-[#1687D4] h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 Year</span>
                  <span>7 Years (Standard)</span>
                  <span>15 Years</span>
                </div>
              </div>
            </div>

            {/* Output Metric Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0F172A] p-5 sm:p-6 rounded-2xl text-white space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Estimated Monthly EMI
                </span>
                <div className="text-3xl sm:text-4xl font-black text-cyan-400 mt-1">
                  ₹{loanCalculations.emi.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">Principal</span>
                  <span className="font-bold text-slate-200">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">Total Interest</span>
                  <span className="font-bold text-amber-400">₹{loanCalculations.totalInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const sbi = PARTNER_LISTINGS.find(p => p.id === 'p-sbi-scholar');
                  if (sbi) handleOpenLeadModal(sbi);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1687D4] to-[#3B9FE8] text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Check Pre-Approved Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PARTNERS GRID                                                        */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A]">
            Verified Partner Offers ({filteredPartners.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Direct Campus Lenz voucher codes verified daily
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="apple-card p-5 border-[#E2E8F0] shadow-xs bg-white space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${partner.logoBg} text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs`}>
                      {partner.logoText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#0F172A]">{partner.name}</h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {partner.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{partner.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">({partner.reviewsCount})</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-800">
                  {partner.tagline}
                </p>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {partner.description}
                </p>

                {/* Offer highlight pill */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      {partner.highlightOffer}
                    </span>
                    {partner.couponCode && (
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-white rounded border border-amber-300 text-amber-800">
                        {partner.couponCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Feature checkmarks */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                  {partner.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Pricing / Terms</span>
                  <span className="text-xs font-bold text-[#0F172A]">{partner.avgCost}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLeadModal(partner)}
                  className="px-4 py-2 rounded-xl bg-[#1687D4] text-white text-xs font-bold hover:bg-[#1272B4] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>{partner.ctaLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1-CLICK PARTNER LEAD CAPTURE MODAL                                   */}
      {/* ===================================================================== */}
      {leadModalPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="apple-card bg-white max-w-md w-full p-6 border-[#E2E8F0] shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setLeadModalPartner(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {!leadSubmitted ? (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${leadModalPartner.logoBg} text-white flex items-center justify-center font-bold text-xs`}>
                    {leadModalPartner.logoText}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{leadModalPartner.name}</h3>
                    <p className="text-[11px] text-[#1687D4] font-semibold">{leadModalPartner.highlightOffer}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1687D4]" />
                    <span>Direct Campus Partner SLA</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Your request will be routed directly to the verified student coordinator. Zero unsolicited third-party calls guaranteed.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g., Alex Kumar"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Email / Phone</label>
                    <input
                      type="text"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g., alex@student.ac.in or 9876543210"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Consultation Objective</label>
                    <select
                      value={applicantGoal}
                      onChange={(e) => setApplicantGoal(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                    >
                      <option value="Immediate Enrollment / Discount Claim">Immediate Enrollment / Discount Claim</option>
                      <option value="Free Syllabus & Scholarship Test">Free Syllabus & Scholarship Test</option>
                      <option value="Loan Pre-Approval Document Checklist">Loan Pre-Approval Document Checklist</option>
                      <option value="Hostel Physical Visit & Room Booking">Hostel Physical Visit & Room Booking</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1687D4] text-white font-bold text-xs hover:bg-[#1272B4] transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Claim Voucher Code</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#0F172A]">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your interest token has been dispatched to {leadModalPartner.name}. A representative will contact {applicantPhone} within 4 working hours.
                </p>

                {leadModalPartner.couponCode && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[10px] text-amber-700 uppercase font-bold">Your Exclusive Discount Voucher:</span>
                    <div className="font-mono text-base font-black text-amber-900 tracking-wider">
                      {leadModalPartner.couponCode}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setLeadModalPartner(null)}
                  className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all mt-2"
                >
                  Close & Continue Exploring
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
