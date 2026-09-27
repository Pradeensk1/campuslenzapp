'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  UserPlus,
  Shield,
  Sparkles
} from 'lucide-react';

interface PortalTab {
  id: UserRole;
  label: string;
  portalName: string;
  subLabel: string;
  badge: string;
  badgeColor: string;
  cardColor: string;
  accentBorder: string;
  btnColor: string;
  icon: any;
  targetRedirect: string;
  targetPageName: string;
  tagline: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  registerText: string;
}

const PUBLIC_PORTALS: PortalTab[] = [
  {
    id: 'student',
    label: 'Student',
    portalName: 'Student Campus Portal',
    subLabel: 'Undergraduate & PG Students',
    badge: 'Student Portal',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    cardColor: 'border-blue-500 bg-blue-50/30 text-blue-900',
    accentBorder: 'border-blue-200 focus:border-blue-500 focus:ring-blue-500/20',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: GraduationCap,
    targetRedirect: '/',
    targetPageName: 'Campus Feed & Servers',
    tagline: 'Access campus feeds, study rooms, Discord servers & submit confidential grievances.',
    identifierLabel: 'Student Roll Number, Username or Campus Email',
    identifierPlaceholder: 'e.g. 22CS101, anand_k, or student@psgtech.edu',
    registerText: 'New Student? Register with your college & roll number'
  },
  {
    id: 'alumni',
    label: 'Alumni',
    portalName: 'Alumni Network Gateway',
    subLabel: 'Graduates & Industry Mentors',
    badge: 'Alumni Network',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cardColor: 'border-emerald-500 bg-emerald-50/30 text-emerald-900',
    accentBorder: 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: Briefcase,
    targetRedirect: '/',
    targetPageName: 'Alumni Mentorship Feed',
    tagline: 'Connect with collegiate juniors, share job opportunities & participate in AMAs.',
    identifierLabel: 'Alumni Email Address or Registered Username',
    identifierPlaceholder: 'e.g. priya_alum or priya@microsoft.com',
    registerText: 'Graduated Alum? Register with your passing batch & employer'
  },
  {
    id: 'faculty',
    label: 'Faculty',
    portalName: 'Faculty Academic Desk',
    subLabel: 'Professors, HODs & Researchers',
    badge: 'Academic Desk',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    cardColor: 'border-amber-500 bg-amber-50/30 text-amber-900',
    accentBorder: 'border-amber-200 focus:border-amber-500 focus:ring-amber-500/20',
    btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: BookOpen,
    targetRedirect: '/',
    targetPageName: 'Academic Review Feed',
    tagline: 'Review student project submissions, host office hours & post departmental circulars.',
    identifierLabel: 'Faculty Staff ID or Official University Email',
    identifierPlaceholder: 'e.g. FAC-CSE-104 or professor@college.edu',
    registerText: 'Academic Faculty? Register with your department & staff ID'
  },
  {
    id: 'institution',
    label: 'Institution',
    portalName: 'Campus Administration Gateway',
    subLabel: 'College Deans, Principals & Admin',
    badge: 'Campus Admin',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    cardColor: 'border-purple-500 bg-purple-50/30 text-purple-900',
    accentBorder: 'border-purple-200 focus:border-purple-500 focus:ring-purple-500/20',
    btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    icon: Building2,
    targetRedirect: '/servers',
    targetPageName: 'Campus Server Builder',
    tagline: 'Govern campus Discord servers, broadcast official notices & review formal grievances.',
    identifierLabel: 'Authorized Admin Email or Username',
    identifierPlaceholder: 'e.g. dean.academics@college.edu or psg_admin',
    registerText: 'College Administrator? Register your institution & AISHE code'
  }
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useApp();

  const queryRole = searchParams.get('role') as UserRole | null;
  const initialRole: UserRole =
    queryRole && PUBLIC_PORTALS.some(p => p.id === queryRole) ? queryRole : 'student';

  const [selectedPortal, setSelectedPortal] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryRole && PUBLIC_PORTALS.some(p => p.id === queryRole)) {
      setSelectedPortal(queryRole);
    }
  }, [queryRole]);

  const activePortal =
    PUBLIC_PORTALS.find(p => p.id === selectedPortal) || PUBLIC_PORTALS[0];
  const ActiveIcon = activePortal.icon;

  const handlePortalSwitch = (portalId: UserRole) => {
    setSelectedPortal(portalId);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetIdentifier = identifier.trim();
    if (!targetIdentifier) {
      setErrorMessage('Please enter your username, email, or institutional ID.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginUser(targetIdentifier, password, selectedPortal);
      setIsSubmitting(false);

      if (result.success && result.user) {
        setSuccessMessage(`${result.message} Directing to ${activePortal.targetPageName}...`);
        setTimeout(() => {
          router.push(result.redirectUrl);
        }, 500);
      } else {
        setErrorMessage(result.message);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white font-black text-xl shadow-sm">
              CL
            </span>
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                CAMPUS<span className="text-[#2563EB]">LENZ</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Institutional Access Gateway
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Select Your Dedicated Access Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose your campus role below to access your role-specific dashboard and credentials gate.
          </p>
        </div>

        {/* 4 Separate Login Portals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Separated Role Portals
            </label>
            <span className="text-[11px] text-slate-400">Click to switch login view</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PUBLIC_PORTALS.map(portal => {
              const Icon = portal.icon;
              const isSelected = selectedPortal === portal.id;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => handlePortalSwitch(portal.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? `${portal.cardColor} border-2 shadow-sm`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm">{portal.label}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {portal.subLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Dedicated Portal Sign In Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{activePortal.portalName}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activePortal.badgeColor}`}
                  >
                    {activePortal.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activePortal.tagline}</p>
              </div>
            </div>
          </div>

          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {activePortal.identifierLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={activePortal.identifierPlaceholder}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${activePortal.accentBorder}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your account password..."
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${activePortal.accentBorder}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this portal session</span>
              </label>

              <div className="text-xs text-slate-400">
                Directs to: <strong className="text-slate-700">{activePortal.targetPageName}</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${activePortal.btnColor} disabled:opacity-60`}
            >
              <span>{isSubmitting ? 'Authenticating...' : `Sign In to ${activePortal.portalName}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role-Specific Link to Registration */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">Need an account for this portal?</span>
            <Link
              href={`/register?role=${activePortal.id}`}
              className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-center"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{activePortal.registerText} →</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProfessionalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-sm font-semibold text-slate-500">Loading Campus Portals...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
