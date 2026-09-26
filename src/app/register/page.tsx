'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  TAMIL_NADU_COLLEGES,
  getCoursesForCollege,
  getDepartmentsForCourse,
  getCourseDurationYears,
  TamilNaduCollegeItem
} from '@/lib/tamilNaduColleges';
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
  Award,
  Calendar,
  Search,
  Filter,
  Clock,
  MapPin,
  ChevronDown
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

const REGIONS = [
  'All Tamil Nadu',
  'Coimbatore',
  'Chennai',
  'Trichy',
  'Madurai',
  'Salem',
  'Southern TN'
];

export default function ProfessionalRegistrationPage() {
  const router = useRouter();
  const { registerUser } = useApp();

  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Core Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [headline, setHeadline] = useState('');

  // 1. College Cascading Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>('All Tamil Nadu');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('col-psg');

  // Filter colleges based on Region and Search Query
  const filteredColleges = useMemo(() => {
    return TAMIL_NADU_COLLEGES.filter(col => {
      const matchesRegion =
        selectedRegion === 'All Tamil Nadu' || col.region === selectedRegion;
      const matchesQuery =
        col.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
        col.district.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
        col.shortName.toLowerCase().includes(collegeSearchQuery.toLowerCase());
      return matchesRegion && matchesQuery;
    });
  }, [selectedRegion, collegeSearchQuery]);

  const activeCollege = useMemo(() => {
    return (
      TAMIL_NADU_COLLEGES.find(c => c.id === selectedCollegeId) ||
      TAMIL_NADU_COLLEGES[0]
    );
  }, [selectedCollegeId]);

  // 2. Degree and Course Dropdown (Cascading from College)
  const availableCourses = useMemo(() => {
    return getCoursesForCollege(selectedCollegeId);
  }, [selectedCollegeId]);

  const [selectedCourse, setSelectedCourse] = useState<string>(
    'B.Tech Artificial Intelligence & Data Science'
  );

  // Auto-sync course if college changes and current course is not in list
  useEffect(() => {
    if (availableCourses.length > 0 && !availableCourses.includes(selectedCourse)) {
      setSelectedCourse(availableCourses[0]);
    }
  }, [availableCourses, selectedCourse]);

  // 3. Department Dropdown (Cascading from Degree & Course)
  const availableDepartments = useMemo(() => {
    return getDepartmentsForCourse(selectedCourse);
  }, [selectedCourse]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    'Department of Artificial Intelligence & Data Science'
  );

  // Auto-sync department when course changes
  useEffect(() => {
    if (availableDepartments.length > 0 && !availableDepartments.includes(selectedDepartment)) {
      setSelectedDepartment(availableDepartments[0]);
    }
  }, [availableDepartments, selectedDepartment]);

  // 4. Graduation Year "From Year to To Year" State
  const courseDuration = getCourseDurationYears(selectedCourse);
  const [fromYear, setFromYear] = useState<number>(2022);
  const [toYear, setToYear] = useState<number>(2026);

  // Auto-adjust To Year when Course changes or From Year changes
  const handleFromYearChange = (newFrom: number) => {
    setFromYear(newFrom);
    setToYear(newFrom + courseDuration);
  };

  // When course changes, update toYear automatically based on duration
  useEffect(() => {
    setToYear(fromYear + courseDuration);
  }, [courseDuration, fromYear]);

  // Quick Preset Helper
  const setBatchPreset = (start: number, end: number) => {
    setFromYear(start);
    setToYear(end);
  };

  // Additional Role-Specific State
  const [studentRollNo, setStudentRollNo] = useState('');
  const [currentCompany, setCurrentCompany] = useState('Microsoft');
  const [alumniJobTitle, setAlumniJobTitle] = useState('Software Development Engineer II');
  const [aisheCode, setAisheCode] = useState('C-37013');
  const [institutionDesignation, setInstitutionDesignation] = useState('Director of Academic Affairs & Principal');
  const [facultyRank, setFacultyRank] = useState('Professor & Head of Department');
  const [facultyStaffId, setFacultyStaffId] = useState('FAC-CS-104');
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

    if (toYear <= fromYear) {
      setErrorMessage('Graduation "To Year" must be strictly greater than "From Year".');
      return;
    }

    setIsSubmitting(true);

    const formattedBatchRange = `${fromYear} - ${toYear}`;

    setTimeout(() => {
      let finalHeadline = headline.trim();
      if (!finalHeadline) {
        if (selectedRole === 'student') {
          finalHeadline = `${selectedCourse} @ ${activeCollege.shortName} | Class of ${formattedBatchRange}`;
        } else if (selectedRole === 'alumni') {
          finalHeadline = `${alumniJobTitle} @ ${currentCompany} | ${activeCollege.shortName} Alum (Batch ${formattedBatchRange})`;
        } else if (selectedRole === 'institution') {
          finalHeadline = `${institutionDesignation} • ${activeCollege.name}`;
        } else if (selectedRole === 'faculty') {
          finalHeadline = `${facultyRank} • ${selectedDepartment} @ ${activeCollege.shortName}`;
        } else {
          finalHeadline = `Campus Lenz Super Administrator & Platform Lead`;
        }
      }

      const result = registerUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        headline: finalHeadline,
        collegeId: selectedCollegeId,
        collegeName: activeCollege.name,
        department: selectedDepartment,
        course: selectedCourse,
        graduationBatch: formattedBatchRange
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
                Tamil Nadu Higher Education Network
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account for Platform Testing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Choose from all colleges across Tamil Nadu with dynamic degrees, cascading departments, and batch years formatted from start year to completion year.
          </p>
        </div>

        {/* Step 1: Role Selection Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Step 1: Select Your Testing Role
            </label>
            <span className="text-[11px] text-slate-400">Controls specific portal features</span>
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

        {/* Registration Form Container */}
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Step 2: Core Personal Credentials
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
                    placeholder="e.g. Junith S or Dr. Ramesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Desired Username / Handle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. junith_dev"
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
                    placeholder="e.g. student@psgtech.edu or personal email"
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
                  Professional Headline / Bio Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. Aspiring Full-Stack & AI Engineer | 3x Hackathon Winner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dynamic Cascading Section: Colleges of Tamil Nadu -> Degree & Course -> Department -> From Year to To Year */}
            <div className="pt-4 border-t border-slate-100 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  Step 3: Tamil Nadu College & Academic Branch Specification
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {TAMIL_NADU_COLLEGES.length} TN Institutions Indexed
                </span>
              </div>

              {/* 1. College Selection with District/Region Filter */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Select College in Tamil Nadu <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Region Filter Buttons */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {REGIONS.map(reg => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setSelectedRegion(reg)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                          selectedRegion === reg
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* College Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={collegeSearchQuery}
                    onChange={e => setCollegeSearchQuery(e.target.value)}
                    placeholder="Search by college name, short code (e.g. PSG, CEG, SSN, CIT, TCE, GCT) or city..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* College Dropdown */}
                <select
                  value={selectedCollegeId}
                  onChange={e => setSelectedCollegeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {filteredColleges.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.shortName}) — {col.district} [{col.type}]
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Selected: <strong className="text-slate-800">{activeCollege.name}</strong></span>
                  <span className="font-mono text-blue-600">{activeCollege.type} • {activeCollege.district}</span>
                </div>
              </div>

              {/* 2 & 3. Cascading Degree/Course & Department Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 2. Degree and Course Dropdown (Filtered based on College) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Degree & Course Program <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Based on {activeCollege.shortName}</span>
                  </div>

                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableCourses.map((c, idx) => (
                      <option key={idx} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <p className="text-[10px] text-slate-400">
                    Duration: <span className="font-semibold text-slate-700">{courseDuration} Years Program</span>
                  </p>
                </div>

                {/* 3. Department Dropdown (Filtered based on Degree & Course) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Academic Department <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Filtered by Course</span>
                  </div>

                  <select
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableDepartments.map((dept, idx) => (
                      <option key={idx} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  <p className="text-[10px] text-slate-400">
                    Mapped directly to your chosen specialization.
                  </p>
                </div>

              </div>

              {/* 4. Graduation Year Display "From Year to To Year" */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-900">
                      Graduation Year (From Year to To Year) <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  
                  {/* Live Formatted Batch Display */}
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                    🎓 Batch: {fromYear} — {toYear} ({toYear - fromYear} Years)
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Select your joining year and completion year. Quick presets automatically reflect standard 4-year UG and 2-year PG curricula:
                </p>

                {/* Coordinated Dropdowns: From Year and To Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      From Year (Admission / Commencement)
                    </label>
                    <select
                      value={fromYear}
                      onChange={e => handleFromYearChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(yr => (
                        <option key={yr} value={yr}>
                          {yr} (Start Year)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      To Year (Expected Graduation / Completion)
                    </label>
                    <select
                      value={toYear}
                      onChange={e => setToYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                        <option key={yr} value={yr}>
                          {yr} (Graduation Year)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Batch Presets Buttons */}
                <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Quick Batch Presets:
                  </span>
                  
                  {/* UG Presets */}
                  <button
                    type="button"
                    onClick={() => setBatchPreset(2022, 2026)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2022 && toYear === 2026
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2022 - 2026 (Final Year)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchPreset(2023, 2027)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2023 && toYear === 2027
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2023 - 2027 (3rd Year)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchPreset(2024, 2028)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2024 && toYear === 2028
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2024 - 2028 (2nd Year)
                  </button>

                  {/* PG Presets */}
                  <button
                    type="button"
                    onClick={() => setBatchPreset(2024, 2026)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2024 && toYear === 2026
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    2024 - 2026 (PG MCA/M.Tech)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchPreset(2020, 2024)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2020 && toYear === 2024
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    2020 - 2024 (Recent Alum)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchPreset(2019, 2023)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      fromYear === 2019 && toYear === 2023
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    2019 - 2023 (Alum)
                  </button>
                </div>
              </div>

              {/* Role-Specific Secondary Fields */}
              {selectedRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Roll Number / Enrollment Register ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={e => setStudentRollNo(e.target.value)}
                    placeholder="e.g. 24MCA041 or 22CS108"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              {selectedRole === 'alumni' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Company / Organization</label>
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={e => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Microsoft, Google, Zoho"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Job Title / Designation</label>
                    <input
                      type="text"
                      value={alumniJobTitle}
                      onChange={e => setAlumniJobTitle(e.target.value)}
                      placeholder="e.g. Software Engineer II"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'faculty' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Rank / Designation</label>
                    <input
                      type="text"
                      value={facultyRank}
                      onChange={e => setFacultyRank(e.target.value)}
                      placeholder="e.g. Professor & Head of Department"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Staff ID</label>
                    <input
                      type="text"
                      value={facultyStaffId}
                      onChange={e => setFacultyStaffId(e.target.value)}
                      placeholder="e.g. FAC-CSE-104"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'institution' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">AISHE / University Affiliation Code</label>
                    <input
                      type="text"
                      value={aisheCode}
                      onChange={e => setAisheCode(e.target.value)}
                      placeholder="e.g. C-37013"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Authority Title</label>
                    <input
                      type="text"
                      value={institutionDesignation}
                      onChange={e => setInstitutionDesignation(e.target.value)}
                      placeholder="e.g. Director of Academic Affairs"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Developer Root Security Key</label>
                  <input
                    type="text"
                    value={adminToken}
                    onChange={e => setAdminToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-rose-700 bg-rose-50/30"
                  />
                  <p className="text-[11px] text-slate-400">
                    Authorizes access to the interactive built-in terminal CLI (`admin@campuslenz:~$`).
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
                ← Already registered? Return to Sign In
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Configuring Account...' : `Register & Launch ${activeOption.title} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
