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
  UserPlus,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  School,
  Building,
  Layers,
  Award
} from 'lucide-react';

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  icon: any;
  colorClass: string;
  bgSelectedClass: string;
  summary: string;
  destinationPage: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    badge: 'Active Student',
    icon: GraduationCap,
    colorClass: 'text-blue-600',
    bgSelectedClass: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20',
    summary: 'Post original thoughts/media, join Discord servers & submit private grievances to Institution ID',
    destinationPage: 'Campus Feed & Servers (/)'
  },
  {
    id: 'alumni',
    title: 'Alumni',
    badge: 'Verified Alum',
    icon: Briefcase,
    colorClass: 'text-emerald-600',
    bgSelectedClass: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20',
    summary: 'Preview student achievements, provide career guidance, and full commenting/likes on student posts',
    destinationPage: 'Alumni Mentorship Feed (/)'
  },
  {
    id: 'institution',
    title: 'Institution',
    badge: 'Campus Admin',
    icon: Building2,
    colorClass: 'text-purple-600',
    bgSelectedClass: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/20',
    summary: 'Govern campus Discord servers, repost student achievements & report false claims to admin',
    destinationPage: 'Campus Server Builder (/servers)'
  },
  {
    id: 'faculty',
    title: 'Faculty',
    badge: 'Academic Desk',
    icon: BookOpen,
    colorClass: 'text-amber-600',
    bgSelectedClass: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20',
    summary: 'Preview student posts and provide constructive mentorship/academic guidance comments only',
    destinationPage: 'Academic Review Feed (/)'
  },
  {
    id: 'admin',
    title: 'Admin',
    badge: 'Super Admin',
    icon: ShieldCheck,
    colorClass: 'text-rose-600',
    bgSelectedClass: 'border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20',
    summary: 'Global application editing, content moderation & exclusive interactive Developer Terminal CLI',
    destinationPage: 'Admin Console & Terminal (/admin)'
  }
];

export default function ProfessionalRegistrationPage() {
  const router = useRouter();
  const { registerUser, colleges } = useApp();

  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Core Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [headline, setHeadline] = useState('');

  // Role-Specific State
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || 'col-psg');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [course, setCourse] = useState('B.Tech AI & Data Science');
  const [graduationBatch, setGraduationBatch] = useState('2026');
  const [currentCompany, setCurrentCompany] = useState('Microsoft');
  const [adminToken, setAdminToken] = useState('CAMPUSLENZ_ROOT_DEV');

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeOption = ROLE_OPTIONS.find(o => o.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setErrorMessage('Please fill in your name, desired username, and email.');
      return;
    }

    const matchedCol = colleges.find(c => c.id === collegeId);
    setIsSubmitting(true);

    setTimeout(() => {
      let finalHeadline = headline.trim();
      if (!finalHeadline) {
        if (selectedRole === 'student') finalHeadline = `${course} @ ${matchedCol?.name || 'PSG Tech'} | Class of ${graduationBatch}`;
        else if (selectedRole === 'alumni') finalHeadline = `Alum @ ${matchedCol?.name || 'PSG Tech'} | Engineer @ ${currentCompany}`;
        else if (selectedRole === 'institution') finalHeadline = `Official Campus Administration • ${matchedCol?.name || 'University Desk'}`;
        else if (selectedRole === 'faculty') finalHeadline = `Faculty Member • ${department} @ ${matchedCol?.name || 'College'}`;
        else finalHeadline = `Platform Administrator & Lead Developer`;
      }

      const result = registerUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        headline: finalHeadline,
        collegeId,
        collegeName: matchedCol?.name || 'PSG College of Technology',
        department,
        course,
        graduationBatch
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(`${result.message} Redirecting to your destination page (${activeOption.destinationPage})...`);
        setTimeout(() => {
          router.push(result.redirectUrl);
        }, 800);
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
                Academic & Institutional Gateway
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account for Testing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Register a test persona as a Student, Alumni, Institution, Faculty, or Administrator. Your newly created credentials will route you directly to your role-specific dashboard.
          </p>
        </div>

        {/* Step 1: Role Selection Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Step 1: Select Your Testing Role
            </label>
            <span className="text-[11px] text-slate-400">Determines platform privileges</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRole(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? opt.bgSelectedClass + ' shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{opt.title}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{opt.summary}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3: Registration Form Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Register as {activeOption.badge}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Routes to: {activeOption.destinationPage}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeOption.summary}</p>
            </div>
          </div>

          {/* Feedback Banners */}
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

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* Core Credentials Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Core Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Desired Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. ramesh_dev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institutional Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@psgtech.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password / Access Code
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="demo1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Professional Headline / Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science Aspirant | System Design Enthusiast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dynamic Role-Specific Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {activeOption.title} Affiliation & Academic Details
              </h3>

              {/* Institution / College Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Associated College / Institution
                </label>
                <select
                  value={collegeId}
                  onChange={e => setCollegeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location}, {c.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Fields */}
              {selectedRole === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Degree / Course</label>
                    <input
                      type="text"
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder="e.g. MCA or B.Tech AI & DS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Applications"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Graduation Batch</label>
                    <input
                      type="text"
                      value={graduationBatch}
                      onChange={e => setGraduationBatch(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Alumni Fields */}
              {selectedRole === 'alumni' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Company / Employer</label>
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={e => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Microsoft, Google, Zoho"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Graduation Year</label>
                    <input
                      type="text"
                      value={graduationBatch}
                      onChange={e => setGraduationBatch(e.target.value)}
                      placeholder="2023"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Faculty Fields */}
              {selectedRole === 'faculty' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Rank</label>
                    <input
                      type="text"
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder="e.g. Professor / Head of Department"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Institution Admin Fields */}
              {selectedRole === 'institution' && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1">
                  <span className="font-bold">Official Campus Administration Clearance:</span>
                  <p className="text-purple-700">
                    This account will be equipped with rights to deploy campus Discord servers, repost student achievements to the official college profile, and review private grievance reports.
                  </p>
                </div>
              )}

              {/* Super Admin Fields */}
              {selectedRole === 'admin' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Developer Security Key</label>
                  <input
                    type="text"
                    value={adminToken}
                    onChange={e => setAdminToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono text-rose-700 bg-rose-50/30"
                  />
                  <p className="text-[11px] text-slate-400">
                    Provides access to the built-in Developer Interactive Terminal CLI (`admin@campuslenz:~$`).
                  </p>
                </div>
              )}

            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Already have an account? Sign in here
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Test Account...' : `Register & Launch ${activeOption.title} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
