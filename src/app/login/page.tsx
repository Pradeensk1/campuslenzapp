'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  Lock,
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
  ShieldCheck,
  UserPlus,
  Terminal,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface RoleTab {
  id: UserRole;
  label: string;
  badge: string;
  badgeColor: string;
  icon: any;
  targetRedirect: string;
  targetPageName: string;
  demoUsername: string;
  demoEmail: string;
  demoDisplayName: string;
  tagline: string;
}

const ROLE_TABS: RoleTab[] = [
  {
    id: 'student',
    label: 'Student',
    badge: 'Student Portal',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: GraduationCap,
    targetRedirect: '/',
    targetPageName: 'Campus Feed & Servers',
    demoUsername: 'junith_dev',
    demoEmail: 'junith@campuslenz.org',
    demoDisplayName: 'Junith S (AI & DS, PSG Tech)',
    tagline: 'Access campus feeds, join Discord servers & submit confidential faculty grievances'
  },
  {
    id: 'alumni',
    label: 'Alumni',
    badge: 'Alumni Network',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Briefcase,
    targetRedirect: '/',
    targetPageName: 'Alumni Mentorship Feed',
    demoUsername: 'karthik_raja',
    demoEmail: 'karthik@microsoft.com',
    demoDisplayName: 'Karthik Raja (SWE II @ Microsoft)',
    tagline: 'Preview student achievements, provide career guidance & comment on posts'
  },
  {
    id: 'institution',
    label: 'Institution',
    badge: 'Campus Admin',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Building2,
    targetRedirect: '/servers',
    targetPageName: 'Campus Server Builder',
    demoUsername: 'psg_institution_admin',
    demoEmail: 'admin@psgtech.edu',
    demoDisplayName: 'PSG Tech Administration Desk',
    tagline: 'Govern campus Discord servers, repost student achievements & report false claims'
  },
  {
    id: 'faculty',
    label: 'Faculty',
    badge: 'Academic Desk',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: BookOpen,
    targetRedirect: '/',
    targetPageName: 'Academic Mentorship Desk',
    demoUsername: 'dr_meenakshi_staff',
    demoEmail: 'meenakshi@psgtech.edu',
    demoDisplayName: 'Dr. Meenakshi Sundaram (Head of CSE)',
    tagline: 'Preview student projects, provide academic guidance comments and department coordination'
  },
  {
    id: 'admin',
    label: 'Admin',
    badge: 'Developer & Governance',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldCheck,
    targetRedirect: '/admin',
    targetPageName: 'Developer Terminal & Governance',
    demoUsername: 'system_admin',
    demoEmail: 'admin@campuslenz.org',
    demoDisplayName: 'Platform Super Administrator',
    tagline: 'Global content moderation, platform diagnostics & exclusive interactive Developer Terminal'
  }
];

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();

  const [selectedPortal, setSelectedPortal] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDemoDrawer, setShowDemoDrawer] = useState(true);

  const activeTab = ROLE_TABS.find(t => t.id === selectedPortal) || ROLE_TABS[0];

  const handlePortalSwitch = (portalId: UserRole) => {
    setSelectedPortal(portalId);
    setErrorMessage(null);
  };

  const handleQuickFill = (tab: RoleTab) => {
    setSelectedPortal(tab.id);
    setIdentifier(tab.demoUsername);
    setPassword('demo1234');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetIdentifier = identifier.trim() || activeTab.demoUsername;
    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginUser(targetIdentifier, password || 'demo1234', selectedPortal);
      setIsSubmitting(false);

      if (result.success && result.user) {
        setSuccessMessage(`${result.message} Directing to ${activeTab.targetPageName}...`);
        setTimeout(() => {
          router.push(result.redirectUrl);
        }, 600);
      } else {
        setErrorMessage(result.message);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
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
            Sign In to Your Campus Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Secure, role-based platform access. Your login credentials will route you directly to your specific dashboard.
          </p>
        </div>

        {/* 5-Role Portal Selector Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
          {ROLE_TABS.map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedPortal === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePortalSwitch(tab.id)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Login Card with Split Columns */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Form (7 cols on md) */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{activeTab.badge} Sign In</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeTab.badgeColor}`}>
                    {activeTab.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeTab.tagline}</p>
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
                  Username or Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={`e.g. ${activeTab.demoUsername} or ${activeTab.demoEmail}`}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password / Access Code
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Any password works for test accounts
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  <span>Keep me signed in on this browser</span>
                </label>

                <div className="text-xs text-slate-400">
                  Target: <strong className="text-slate-700">{activeTab.targetPageName}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{isSubmitting ? 'Authenticating...' : `Sign In to ${activeTab.label} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Link to Registration Page */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need a custom test persona?</span>
              <Link
                href="/register"
                className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New Account for Testing →
              </Link>
            </div>

          </div>

          {/* Right Column: Testing Credentials & Specific Role Destinations (5 cols on md) */}
          <div className="md:col-span-5 bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-200 p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Test Credentials
              </h3>
              <span className="text-[10px] text-slate-400">1-Click Auto-Fill</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Click any verified test persona below to automatically populate valid login details and test role-specific destination routing:
            </p>

            <div className="space-y-2">
              {ROLE_TABS.map(tab => {
                const Icon = tab.icon;
                const isCurrent = selectedPortal === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleQuickFill(tab)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-bold text-slate-900">{tab.label}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-blue-600">
                        → {tab.targetPageName}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      User: <strong className="text-slate-800">{tab.demoUsername}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {tab.demoDisplayName}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 space-y-1">
              <span className="font-bold">Role-Based Routing Guarantee:</span>
              <p className="text-blue-700 leading-tight">
                Authenticating as <strong>Admin</strong> opens the Developer Terminal CLI, <strong>Institution</strong> opens the Campus Server Builder, and <strong>Student</strong> unlocks the confidential Grievance tunnel.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
