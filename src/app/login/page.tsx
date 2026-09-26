'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Lock,
  MessageSquare,
  AlertTriangle,
  Flame,
  Share2,
  LogIn,
  KeyRound,
  Shield,
  Layers
} from 'lucide-react';

interface RolePortalConfig {
  id: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  avatarIcon: any;
  tagline: string;
  defaultUsername: string;
  demoDisplayName: string;
  demoCollege: string;
  canAccess: string[];
  cannotAccess: string[];
  primaryFeatureName: string;
  primaryFeatureDesc: string;
  primaryHref: string;
}

const ROLE_PORTALS: RolePortalConfig[] = [
  {
    id: 'student',
    title: '1. Students Portal',
    badge: 'Active Student',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    avatarIcon: GraduationCap,
    tagline: 'Connect, express, join campus servers & report private feedback directly to institution',
    defaultUsername: 'junith_dev',
    demoDisplayName: 'Junith S (AI & DS, PSG Tech)',
    demoCollege: 'PSG College of Technology',
    canAccess: [
      'Post original thoughts, project achievements, and reels (LinkedIn & Instagram inspired)',
      'Join college-based community channels (Discord-like servers with anti-ragebait protection)',
      'Submit confidential grievance reports on classes & faculty directly to an Institution ID without public ragebait',
      'Follow peers, alumni mentors, and explore top colleges across Tamil Nadu'
    ],
    cannotAccess: [
      'Cannot build new official university servers (Institution privilege)',
      'Cannot access platform developer terminal (Admin privilege)'
    ],
    primaryFeatureName: 'Campus Servers & Private Grievance',
    primaryFeatureDesc: 'Chat in shielded channels and file private academic reports directly to administration.',
    primaryHref: '/servers'
  },
  {
    id: 'alumni',
    title: '2. Alumni Portal',
    badge: 'Verified Alum',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    avatarIcon: Briefcase,
    tagline: 'Preview student achievements, provide industry career guidance & comment on posts',
    defaultUsername: 'karthik_raja',
    demoDisplayName: 'Karthik Raja (SWE II @ Microsoft)',
    demoCollege: 'PSG Tech (Batch 2023)',
    canAccess: [
      'Preview posts from students across engineering & management institutions',
      'Full commenting, liking, sharing, and reposting privileges on student posts',
      'Join institution community channels to guide students and share college/interview experiences',
      'Provide mentorship, referral pointers, and salary package benchmarks'
    ],
    cannotAccess: [
      'Cannot edit institution-wide server settings or submit student grievance reports',
      'Cannot access backend platform administrative developer console'
    ],
    primaryFeatureName: 'Alumni Guidance Hub',
    primaryFeatureDesc: 'Mentor juniors in #alumni-career-guidance and comment on student project portfolios.',
    primaryHref: '/servers'
  },
  {
    id: 'institution',
    title: '3. Institution Portal',
    badge: 'Campus Admin',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    avatarIcon: Building2,
    tagline: 'Build campus Discord servers, repost student achievements & report false information',
    defaultUsername: 'psg_institution_admin',
    demoDisplayName: 'PSG Tech Official Administration',
    demoCollege: 'PSG College of Technology',
    canAccess: [
      'Build and govern official campus Discord servers with custom department & placement channels',
      'Right to REPOST student posts to the verified university profile',
      'Right to REPORT posts containing false information or unfair negative targeting of the institution',
      'Review and resolve private student complaints filed directly to your Institution ID'
    ],
    cannotAccess: [
      'Cannot create student personal reels or random casual posts',
      'Cannot delete student accounts without super admin review'
    ],
    primaryFeatureName: 'Server Builder & Grievance Review',
    primaryFeatureDesc: 'Create department channels and review student faculty/class reports in private.',
    primaryHref: '/servers'
  },
  {
    id: 'faculty',
    title: '4. Faculty Portal',
    badge: 'Faculty Member',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    avatarIcon: BookOpen,
    tagline: 'Preview student academic posts and provide constructive mentorship comments only',
    defaultUsername: 'dr_meenakshi_staff',
    demoDisplayName: 'Dr. Meenakshi Sundaram (Head of CSE)',
    demoCollege: 'PSG College of Technology',
    canAccess: [
      'Preview student academic posts, coding projects, and research queries',
      'Comment on student posts to offer academic critique, guidance, and encouragement',
      'Coordinate in department channels on college servers'
    ],
    cannotAccess: [
      'Limited rights: cannot author student-style posts/reels',
      'Cannot view confidential student grievance reports submitted to Institution ID',
      'Cannot access developer terminal options'
    ],
    primaryFeatureName: 'Academic Mentorship',
    primaryFeatureDesc: 'Engage with student technical posts and advise in department chat spaces.',
    primaryHref: '/'
  },
  {
    id: 'admin',
    title: '5. Admin Portal',
    badge: 'Super Administrator',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    avatarIcon: ShieldCheck,
    tagline: 'Complete platform governance, global content moderation & exclusive Developer Terminal',
    defaultUsername: 'system_admin',
    demoDisplayName: 'Super Admin (System Core)',
    demoCollege: 'Campus Lenz Central Platform',
    canAccess: [
      'All rights to edit, moderate, delete, and manage everything across the application',
      'EXCLUSIVE DEVELOPER OPTION: interactive built-in terminal (admin@campuslenz:~$ CLI)',
      'Audit platform memory, inspect user directory, manage colleges & resolve flagged posts',
      'Run database diagnostics, purge cache, and execute system commands in real time'
    ],
    cannotAccess: [
      'Full unrestricted permissions enabled for all platform modules'
    ],
    primaryFeatureName: 'Admin Control & Developer Terminal',
    primaryFeatureDesc: 'Global platform console with real-time interactive terminal shell.',
    primaryHref: '/admin'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginAsRole, allUsers } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'student');
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('demo1234');
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

  const activePortal = ROLE_PORTALS.find(p => p.id === selectedRole) || ROLE_PORTALS[0];

  const handle1ClickLogin = (portal: RolePortalConfig) => {
    loginAsRole(portal.id, portal.defaultUsername);
    setLoginFeedback(`Authenticated successfully as ${portal.title} (${portal.defaultUsername})! Redirecting...`);
    setTimeout(() => {
      if (portal.id === 'admin') router.push('/admin');
      else if (portal.id === 'institution' || portal.id === 'student') router.push('/servers');
      else router.push('/');
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameToUse = customUsername.trim() || activePortal.defaultUsername;
    loginAsRole(selectedRole, usernameToUse);
    setLoginFeedback(`Logged in as ${usernameToUse} [${selectedRole.toUpperCase()}]!`);
    setTimeout(() => {
      if (selectedRole === 'admin') router.push('/admin');
      else if (selectedRole === 'institution') router.push('/servers');
      else router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            Multi-Portal Role Authentication System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Campus Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Choose your persona below to explore dedicated role permissions, specialized community channels, institutional tools, and administrative developer features.
          </p>
        </div>

        {/* Current Session Banner if already logged in */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{currentUser.fullName}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser.role}
                </span>
                {currentUser.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">@{currentUser.username} • {currentUser.collegeName || 'Platform Global'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5" />
                Developer Terminal
              </Link>
            )}
            <Link
              href="/servers"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Campus Servers
            </Link>
          </div>
        </div>

        {/* Feedback Message */}
        {loginFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{loginFeedback}</span>
          </div>
        )}

        {/* 5 Role Selection Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ROLE_PORTALS.map(portal => {
            const Icon = portal.avatarIcon;
            const isSelected = selectedRole === portal.id;
            return (
              <button
                key={portal.id}
                onClick={() => setSelectedRole(portal.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{portal.title.split('. ')[1]}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{portal.tagline}</p>
              </button>
            );
          })}
        </div>

        {/* Active Portal Detail Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Access Rights & Capabilities Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                {React.createElement(activePortal.avatarIcon, { className: "w-7 h-7 text-blue-600" })}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{activePortal.title}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${activePortal.badgeColor}`}>
                      {activePortal.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{activePortal.tagline}</p>
                </div>
              </div>

              {/* What this role CAN access */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What {activePortal.title.split('. ')[1]} Can Access & Use
                </h3>
                <div className="space-y-2">
                  {activePortal.canAccess.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Scope Limitations */}
              {activePortal.cannotAccess.length > 0 && activePortal.cannotAccess[0] !== 'Full unrestricted permissions enabled for all platform modules' && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-slate-400" />
                    Role Boundary Constraints
                  </h3>
                  <div className="space-y-1.5">
                    {activePortal.cannotAccess.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 italic pl-1">
                        <span className="text-slate-400">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlight Box for Role Special Feature */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Featured Capability: {activePortal.primaryFeatureName}
                  </h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {activePortal.primaryFeatureDesc}
                  </p>
                </div>
                <Link
                  href={activePortal.primaryHref}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors whitespace-nowrap inline-flex items-center gap-1"
                >
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Authentication Action Card */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authenticate as {activePortal.badge}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instant 1-click test login with pre-configured mock persona or custom credentials.
                </p>
              </div>

              {/* 1-Click Fast Login Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handle1ClickLogin(activePortal)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  1-Click Login as {activePortal.defaultUsername}
                </button>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-0.5">
                  <div className="font-semibold text-slate-800">{activePortal.demoDisplayName}</div>
                  <div className="text-[11px] text-slate-500">{activePortal.demoCollege}</div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <hr className="w-full border-slate-200" />
                <span className="absolute bg-slate-50 px-2 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  or custom sign-in
                </span>
              </div>

              {/* Custom Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={customUsername}
                    onChange={e => setCustomUsername(e.target.value)}
                    placeholder={activePortal.defaultUsername}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password / Passcode
                  </label>
                  <input
                    type="password"
                    value={customPassword}
                    onChange={e => setCustomPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Any demo passcode is accepted in local environment.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Sign In with Custom Handle
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Quick Roles Overview Reference Matrix */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Quick Reference: Permission & Access Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Student Posts & Reels</th>
                  <th className="py-3 px-3">Campus Discord Servers</th>
                  <th className="py-3 px-3">Private Grievances</th>
                  <th className="py-3 px-3">Developer Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-blue-600">Students</td>
                  <td className="py-3 px-3">✅ Create, Like & Follow</td>
                  <td className="py-3 px-3">✅ Join Shielded Channels</td>
                  <td className="py-3 px-3">✅ Submit Private to Inst ID</td>
                  <td className="py-3 px-3 text-slate-400">❌ Restricted</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-emerald-600">Alumni</td>
                  <td className="py-3 px-3">✅ Preview, Comment, Like, Repost</td>
                  <td className="py-3 px-3">✅ Join Career Mentorship Desk</td>
                  <td className="py-3 px-3 text-slate-400">❌ N/A</td>
                  <td className="py-3 px-3 text-slate-400">❌ Restricted</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-purple-600">Institutions</td>
                  <td className="py-3 px-3">✅ Repost & Report False Info</td>
                  <td className="py-3 px-3">✅ Build & Govern Servers</td>
                  <td className="py-3 px-3">✅ Review Complaints to Inst ID</td>
                  <td className="py-3 px-3 text-slate-400">❌ Restricted</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-amber-600">Faculty</td>
                  <td className="py-3 px-3">✅ Preview & Comment Only</td>
                  <td className="py-3 px-3">✅ Participate in Dept Channels</td>
                  <td className="py-3 px-3 text-slate-400">❌ Protected from View</td>
                  <td className="py-3 px-3 text-slate-400">❌ Restricted</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-rose-600">Admin</td>
                  <td className="py-3 px-3">✅ Full Management & Deletion</td>
                  <td className="py-3 px-3">✅ Global Server Oversight</td>
                  <td className="py-3 px-3">✅ Audit & Dispute Escalation</td>
                  <td className="py-3 px-3 font-bold text-rose-600">✅ Root Access CLI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
