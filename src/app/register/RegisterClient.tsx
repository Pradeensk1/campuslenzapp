'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  TAMIL_NADU_COLLEGES,
  getCoursesForCollege,
  getDepartmentsForCourse,
  getCourseDurationYears
} from '@/lib/tamilNaduColleges';
import {
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
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
  MapPin,
  Phone,
  Globe,
  FileBadge,
  Compass
} from 'lucide-react';

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  icon: any;
  colorClass: string;
  borderClass: string;
  bgSelectedClass: string;
  summary: string;
  destinationPage: string;
}

const PUBLIC_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    badge: 'Undergraduate / PG',
    icon: GraduationCap,
    colorClass: 'text-blue-600',
    borderClass: 'border-blue-500',
    bgSelectedClass: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20',
    summary: 'Join collegiate study rooms, participate in feeds, and submit confidential faculty grievances.',
    destinationPage: 'Campus Feed & Servers (/)'
  },
  {
    id: 'alumni',
    title: 'Alumni',
    badge: 'Graduated Industry Alum',
    icon: Briefcase,
    colorClass: 'text-emerald-600',
    borderClass: 'border-emerald-500',
    bgSelectedClass: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20',
    summary: 'Mentor campus juniors, post industry job referrals, and engage in campus tech discussions.',
    destinationPage: 'Alumni Mentorship Feed (/)'
  },
  {
    id: 'faculty',
    title: 'Faculty',
    badge: 'Academic Professor / HOD',
    icon: BookOpen,
    colorClass: 'text-amber-600',
    borderClass: 'border-amber-500',
    bgSelectedClass: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20',
    summary: 'Oversee student academic projects, post departmental announcements, and coordinate research.',
    destinationPage: 'Academic Review Feed (/)'
  },
  {
    id: 'institution',
    title: 'Institution',
    badge: 'Campus Authority / Dean',
    icon: Building2,
    colorClass: 'text-purple-600',
    borderClass: 'border-purple-500',
    bgSelectedClass: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/20',
    summary: 'Govern campus Discord servers, broadcast administrative notices, and resolve formal grievances.',
    destinationPage: 'Campus Server Builder (/servers)'
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

function RegistrationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerUser } = useApp();

  const queryRole = searchParams.get('role') as UserRole | null;
  const initialRole: UserRole =
    queryRole && PUBLIC_ROLE_OPTIONS.some(r => r.id === queryRole) ? queryRole : 'student';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    if (queryRole && PUBLIC_ROLE_OPTIONS.some(r => r.id === queryRole)) {
      setSelectedRole(queryRole);
    }
  }, [queryRole]);

  // Core Account Credentials
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');

  // College Cascading Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>('All Tamil Nadu');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('col-psg');

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

  // Student-specific: Cascading Course & Department
  const availableCourses = useMemo(() => {
    return getCoursesForCollege(selectedCollegeId);
  }, [selectedCollegeId]);

  const [selectedCourse, setSelectedCourse] = useState<string>(
    'B.Tech Artificial Intelligence & Data Science'
  );

  useEffect(() => {
    if (availableCourses.length > 0 && !availableCourses.includes(selectedCourse)) {
      setSelectedCourse(availableCourses[0]);
    }
  }, [availableCourses, selectedCourse]);

  const availableDepartments = useMemo(() => {
    return getDepartmentsForCourse(selectedCourse);
  }, [selectedCourse]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    'Department of Artificial Intelligence & Data Science'
  );

  useEffect(() => {
    if (availableDepartments.length > 0 && !availableDepartments.includes(selectedDepartment)) {
      setSelectedDepartment(availableDepartments[0]);
    }
  }, [availableDepartments, selectedDepartment]);

  // Student-specific: Roll No & Batch (From Year to To Year)
  const [studentRollNo, setStudentRollNo] = useState('');
  const courseDuration = getCourseDurationYears(selectedCourse);
  const [fromYear, setFromYear] = useState<number>(2022);
  const [toYear, setToYear] = useState<number>(2026);

  const handleFromYearChange = (newFrom: number) => {
    setFromYear(newFrom);
    setToYear(newFrom + courseDuration);
  };

  useEffect(() => {
    setToYear(fromYear + courseDuration);
  }, [courseDuration, fromYear]);

  // Alumni-specific State
  const [alumniPassingYear, setAlumniPassingYear] = useState<string>('2023');
  const [alumniDegree, setAlumniDegree] = useState<string>('B.E Computer Science & Engineering');
  const [currentCompany, setCurrentCompany] = useState('');
  const [alumniJobTitle, setAlumniJobTitle] = useState('');
  const [alumniIndustry, setAlumniIndustry] = useState('Software, Cloud & AI Systems');
  const [alumniExperience, setAlumniExperience] = useState('2 - 5 Years');
  const [alumniLinkedin, setAlumniLinkedin] = useState('');

  // Faculty-specific State
  const [facultyStaffId, setFacultyStaffId] = useState('');
  const [facultyRank, setFacultyRank] = useState('Assistant Professor');
  const [facultyDept, setFacultyDept] = useState('Department of Computer Science & Engineering');
  const [facultyQualification, setFacultyQualification] = useState('Ph.D. in Computer Science & Engineering');
  const [facultySpecialization, setFacultySpecialization] = useState('');
  const [facultyExperience, setFacultyExperience] = useState('5 - 10 Years');
  const [facultyCabin, setFacultyCabin] = useState('');

  // Institution-specific State
  const [institutionDesignation, setInstitutionDesignation] = useState('Dean of Academic Affairs');
  const [aisheCode, setAisheCode] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionWebsite, setInstitutionWebsite] = useState('');
  const [institutionOfficeBlock, setInstitutionOfficeBlock] = useState('Main Administrative Block');

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeOption =
    PUBLIC_ROLE_OPTIONS.find(o => o.id === selectedRole) || PUBLIC_ROLE_OPTIONS[0];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Common validations
    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setErrorMessage('Please fill in your full name, username, and email.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('Please create a secure password (at least 4 characters).');
      return;
    }

    // Role-specific validations
    if (selectedRole === 'student') {
      if (!studentRollNo.trim()) {
        setErrorMessage('Student Roll Number / Enrollment Register ID is required.');
        return;
      }
      if (toYear <= fromYear) {
        setErrorMessage('Expected Graduation Year must be strictly greater than Admission Year.');
        return;
      }
    } else if (selectedRole === 'alumni') {
      if (!currentCompany.trim()) {
        setErrorMessage('Please enter your current employer or company name.');
        return;
      }
      if (!alumniJobTitle.trim()) {
        setErrorMessage('Please enter your current job title / designation.');
        return;
      }
    } else if (selectedRole === 'faculty') {
      if (!facultyStaffId.trim()) {
        setErrorMessage('Faculty Staff ID / Employee ID is required.');
        return;
      }
      if (!facultySpecialization.trim()) {
        setErrorMessage('Please enter your academic specialization or primary research area.');
        return;
      }
    } else if (selectedRole === 'institution') {
      if (!aisheCode.trim()) {
        setErrorMessage('AISHE Code or University Institutional Affiliation ID is required.');
        return;
      }
      if (!institutionPhone.trim()) {
        setErrorMessage('Official administrative desk phone or contact number is required.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let finalHeadline = headline.trim();
      let computedDept = selectedDepartment;
      let computedCourse = selectedCourse;
      let computedBatch = `${fromYear} - ${toYear}`;

      if (selectedRole === 'student') {
        computedDept = selectedDepartment;
        computedCourse = selectedCourse;
        computedBatch = `${fromYear} - ${toYear}`;
        if (!finalHeadline) {
          finalHeadline = `${selectedCourse} @ ${activeCollege.shortName} | Class of ${computedBatch}`;
        }
      } else if (selectedRole === 'alumni') {
        computedDept = selectedDepartment;
        computedCourse = alumniDegree;
        computedBatch = `Batch of ${alumniPassingYear}`;
        if (!finalHeadline) {
          finalHeadline = `${alumniJobTitle} @ ${currentCompany} | ${activeCollege.shortName} Alum ('${alumniPassingYear.slice(-2)})`;
        }
      } else if (selectedRole === 'faculty') {
        computedDept = facultyDept;
        computedCourse = facultyQualification;
        computedBatch = `${facultyExperience} Exp`;
        if (!finalHeadline) {
          finalHeadline = `${facultyRank} • ${facultyDept} @ ${activeCollege.shortName}`;
        }
      } else if (selectedRole === 'institution') {
        computedDept = institutionOfficeBlock;
        computedCourse = institutionDesignation;
        computedBatch = `AISHE: ${aisheCode}`;
        if (!finalHeadline) {
          finalHeadline = `${institutionDesignation} • ${activeCollege.name}`;
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
        department: computedDept,
        course: computedCourse,
        graduationBatch: computedBatch,
        studentRollNo: selectedRole === 'student' ? studentRollNo.trim() : undefined,
        company: selectedRole === 'alumni' ? currentCompany.trim() : undefined,
        designation:
          selectedRole === 'alumni'
            ? alumniJobTitle.trim()
            : selectedRole === 'faculty'
            ? facultyRank
            : selectedRole === 'institution'
            ? institutionDesignation
            : undefined,
        facultyStaffId: selectedRole === 'faculty' ? facultyStaffId.trim() : undefined,
        specialization: selectedRole === 'faculty' ? facultySpecialization.trim() : undefined,
        experienceYears:
          selectedRole === 'faculty'
            ? facultyExperience
            : selectedRole === 'alumni'
            ? alumniExperience
            : undefined,
        qualification: selectedRole === 'faculty' ? facultyQualification : undefined,
        officeTitle: selectedRole === 'institution' ? institutionDesignation : undefined,
        aisheCode: selectedRole === 'institution' ? aisheCode.trim() : undefined,
        contactPhone: selectedRole === 'institution' ? institutionPhone.trim() : undefined,
        websiteUrl: selectedRole === 'institution' ? institutionWebsite.trim() : undefined,
        linkedinUrl: selectedRole === 'alumni' ? alumniLinkedin.trim() : undefined
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(`${result.message} Directing to ${activeOption.destinationPage}...`);
        setTimeout(() => {
          router.push(result.redirectUrl);
        }, 800);
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-xl shadow-md shadow-sky-500/25">
              CL
            </span>
            <div className="text-left">
              <span className="text-xl font-black tracking-tight text-sky-950">
                CAMPUS<span className="text-sky-600">LENZ</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-800/70">
                Tamil Nadu Higher Education Network
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
            Create Your Dedicated Campus Account
          </h1>
          <p className="text-xs sm:text-sm text-sky-800/80 max-w-xl mx-auto font-medium">
            Select your role below. Each registration form is strictly customized with only the credentials and details required for your specific profile.
          </p>
        </div>

        {/* Step 1: 4 Separated Role Selection Cards (No Admin) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-sky-800/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Step 1: Select Your Campus Role
            </label>
            <span className="text-[11px] text-sky-700/60 font-medium">Tailors registration fields to your role</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PUBLIC_ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(opt.id);
                    setErrorMessage(null);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'ocean-glass-card border-2 border-sky-400 bg-sky-500/15 shadow-md text-sky-950 scale-[1.02]'
                      : 'bg-white/70 backdrop-blur-md border border-white/80 hover:border-sky-300 hover:bg-white/90 text-sky-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-xs' : 'bg-sky-100/80 text-sky-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-sky-950">{opt.title}</h3>
                  <p className="text-[10px] text-sky-800/70 line-clamp-1 mt-0.5 font-medium">
                    {opt.badge}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Form Container */}
        <div className="ocean-glass-card touch-over-glass border border-white/80 rounded-[32px] p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-sky-100/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-sky-950">
                  {activeOption.title} Registration
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100/90 text-sky-800 font-semibold border border-sky-200">
                  Directs to: {activeOption.destinationPage}
                </span>
              </div>
              <p className="text-xs text-sky-800/70 mt-0.5 font-medium">
                Displaying only fields relevant to verified {activeOption.title.toLowerCase()} accounts.
              </p>
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
            
            {/* Step 2: Core Account Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Step 2: Core Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {selectedRole === 'institution'
                      ? 'Authorized Representative / Officer Name'
                      : selectedRole === 'faculty'
                      ? 'Full Name with Academic Title'
                      : 'Full Name'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={
                      selectedRole === 'faculty'
                        ? 'e.g. Dr. K. Meenakshi'
                        : selectedRole === 'institution'
                        ? 'e.g. Dr. V. Selladurai (Dean / Principal Office)'
                        : selectedRole === 'alumni'
                        ? 'e.g. Priya Venkatesh'
                        : 'e.g. Anand Kumar'
                    }
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
                    placeholder={
                      selectedRole === 'faculty'
                        ? 'e.g. prof_meenakshi'
                        : selectedRole === 'institution'
                        ? 'e.g. psgtech_admin'
                        : 'e.g. anand_k'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {selectedRole === 'student'
                      ? 'Student / Institutional Email'
                      : selectedRole === 'faculty'
                      ? 'Official University / Institutional Email'
                      : selectedRole === 'institution'
                      ? 'Official Administrative Office Email'
                      : 'Email Address (Personal or Work)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'faculty'
                        ? 'e.g. meenakshi@psgtech.edu'
                        : selectedRole === 'institution'
                        ? 'e.g. dean.academics@psgtech.edu'
                        : selectedRole === 'alumni'
                        ? 'e.g. priya@microsoft.com'
                        : 'e.g. student@psgtech.edu'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a secure account password..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Headline / Bio Summary (Optional)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'e.g. Aspiring Full-Stack & AI Engineer | 3x Hackathon Winner'
                      : selectedRole === 'alumni'
                      ? 'e.g. Senior Software Engineer @ Microsoft | Ex-PSG Tech | Open for Referrals'
                      : selectedRole === 'faculty'
                      ? 'e.g. Associate Professor & HOD • Dept of CSE | AI & Cloud Systems Researcher'
                      : 'e.g. Official Campus Administration • PSG College of Technology'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Step 3: College Selection in Tamil Nadu */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  Step 3:{' '}
                  {selectedRole === 'alumni'
                    ? 'Alma Mater Selection (College Graduated From)'
                    : selectedRole === 'faculty'
                    ? 'Appointed College / University'
                    : selectedRole === 'institution'
                    ? 'Represented College in Tamil Nadu'
                    : 'College of Study in Tamil Nadu'}
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {TAMIL_NADU_COLLEGES.length} TN Institutions Indexed
                </span>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Select College <span className="text-rose-500">*</span>
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
            </div>

            {/* Step 4: Role-Specific Fields (ONLY what this user role needs) */}

            {/* A. STUDENT FIELDS */}
            {selectedRole === 'student' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Step 4: Student Academic Enrollment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Degree / Program */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Degree & Course Program <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={e => setSelectedCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {availableCourses.map((c, idx) => (
                        <option key={idx} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Department */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Academic Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={e => setSelectedDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {availableDepartments.map((dept, idx) => (
                        <option key={idx} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Roll Number / Register ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Student Roll Number / Enrollment Register ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentRollNo}
                    onChange={e => setStudentRollNo(e.target.value)}
                    placeholder="e.g. 22CS108 or 24MCA041"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used to verify institutional student status and allow confidential faculty grievance submissions.
                  </p>
                </div>

                {/* Graduation Batch: From Year to To Year */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Academic Batch Period (Admission Year to Expected Graduation) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white">
                      Batch: {fromYear} — {toYear} ({toYear - fromYear} Years)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Admission Year (Commencement)
                      </label>
                      <select
                        value={fromYear}
                        onChange={e => handleFromYearChange(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800"
                      >
                        {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(yr => (
                          <option key={yr} value={yr}>
                            {yr} (Start Year)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Expected Graduation Year (Completion)
                      </label>
                      <select
                        value={toYear}
                        onChange={e => setToYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800"
                      >
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                          <option key={yr} value={yr}>
                            {yr} (Graduation)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. ALUMNI FIELDS */}
            {selectedRole === 'alumni' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  Step 4: Alumni Professional & Career Background
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Employer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Current Company / Organization <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentCompany}
                      onChange={e => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Microsoft, Google, Zoho, Cognizant, AI Startup"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Current Job Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Current Job Title / Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={alumniJobTitle}
                      onChange={e => setAlumniJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer, Product Manager"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Passing Out Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Graduation Year (Batch) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={alumniPassingYear}
                      onChange={e => setAlumniPassingYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800"
                    >
                      {[
                        '2024', '2023', '2022', '2021', '2020', '2019', '2018',
                        '2017', '2016', '2015', '2014', '2012', '2010', '2005'
                      ].map(yr => (
                        <option key={yr} value={yr}>
                          Class of {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Industry Domain */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Industry Domain
                    </label>
                    <select
                      value={alumniIndustry}
                      onChange={e => setAlumniIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800"
                    >
                      <option value="Software, Cloud & AI Systems">Software, Cloud & AI Systems</option>
                      <option value="Product & Technology Management">Product & Technology Management</option>
                      <option value="FinTech & Quantitative Research">FinTech & Quantitative Research</option>
                      <option value="Core Engineering & Robotics">Core Engineering & Robotics</option>
                      <option value="Consulting & Data Strategy">Consulting & Data Strategy</option>
                      <option value="Academic Research & Higher Ed">Academic Research & Higher Ed</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Total Experience
                    </label>
                    <select
                      value={alumniExperience}
                      onChange={e => setAlumniExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800"
                    >
                      <option value="0 - 2 Years">0 - 2 Years (Early Career)</option>
                      <option value="2 - 5 Years">2 - 5 Years (Mid-Level)</option>
                      <option value="5 - 10 Years">5 - 10 Years (Senior / Lead)</option>
                      <option value="10+ Years">10+ Years (Principal / Exec)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Degree Studied */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Degree Completed at {activeCollege.shortName}
                    </label>
                    <input
                      type="text"
                      value={alumniDegree}
                      onChange={e => setAlumniDegree(e.target.value)}
                      placeholder="e.g. B.E Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* LinkedIn / Portfolio URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      LinkedIn Profile / Public Portfolio (Optional)
                    </label>
                    <input
                      type="url"
                      value={alumniLinkedin}
                      onChange={e => setAlumniLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* C. FACULTY FIELDS */}
            {selectedRole === 'faculty' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  Step 4: Academic Appointment & Faculty Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Appointed Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyDept}
                      onChange={e => setFacultyDept(e.target.value)}
                      placeholder="e.g. Department of Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Faculty Staff ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Faculty Staff ID / Employee Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyStaffId}
                      onChange={e => setFacultyStaffId(e.target.value)}
                      placeholder="e.g. FAC-CSE-104 or PSG-EMP-4091"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Academic Rank */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Academic Designation <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={facultyRank}
                      onChange={e => setFacultyRank(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800"
                    >
                      <option value="Professor & Head of Department">Professor & HOD</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor (Senior Grade)">Assistant Professor (Sr)</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Dean of Academic Affairs">Dean of Academic Affairs</option>
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Highest Qualification
                    </label>
                    <select
                      value={facultyQualification}
                      onChange={e => setFacultyQualification(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800"
                    >
                      <option value="Ph.D. in Engineering / Science">Ph.D. in Engineering / Science</option>
                      <option value="Post-Doctoral Fellow">Post-Doctoral Fellow</option>
                      <option value="M.Tech / M.E (First Class)">M.Tech / M.E (First Class)</option>
                      <option value="M.S / M.Sc by Research">M.S / M.Sc by Research</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teaching Experience
                    </label>
                    <select
                      value={facultyExperience}
                      onChange={e => setFacultyExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800"
                    >
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 7 Years">3 - 7 Years</option>
                      <option value="7 - 12 Years">7 - 12 Years</option>
                      <option value="12+ Years">12+ Years (Senior Faculty)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Research Specialization */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Specialization & Research Areas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultySpecialization}
                      onChange={e => setFacultySpecialization(e.target.value)}
                      placeholder="e.g. Distributed Computing, Deep Learning, VLSI Architecture"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Office / Cabin Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Department Cabin / Office Room (Optional)
                    </label>
                    <input
                      type="text"
                      value={facultyCabin}
                      onChange={e => setFacultyCabin(e.target.value)}
                      placeholder="e.g. CSE Department Block, Room 304"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* D. INSTITUTION FIELDS */}
            {selectedRole === 'institution' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Step 4: Institutional Authority & Administrative Governance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Administrative Authority Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Administrative Office / Authority Title <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={institutionDesignation}
                      onChange={e => setInstitutionDesignation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800"
                    >
                      <option value="Office of the Principal">Office of the Principal</option>
                      <option value="Dean of Student Affairs">Dean of Student Affairs</option>
                      <option value="Director of Academic Governance">Director of Academic Governance</option>
                      <option value="Centre for University-Industry Collaboration (CUIC)">CUIC Placement Directorate</option>
                      <option value="Controller of Examinations (COE)">Controller of Examinations</option>
                      <option value="Registrar / Administrative Directorate">Registrar / Administrative Directorate</option>
                    </select>
                  </div>

                  {/* AISHE Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      AISHE / Ministry of Education Affiliation Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={aisheCode}
                      onChange={e => setAisheCode(e.target.value)}
                      placeholder="e.g. C-37013 (PSG) or C-25112 (CEG)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Official Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Desk Phone / Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionPhone}
                      onChange={e => setInstitutionPhone(e.target.value)}
                      placeholder="e.g. +91 422 2572177"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official College Website URL
                    </label>
                    <input
                      type="url"
                      value={institutionWebsite}
                      onChange={e => setInstitutionWebsite(e.target.value)}
                      placeholder="e.g. https://www.psgtech.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                {/* Office Location Block */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Campus Office / Administrative Block Location
                  </label>
                  <input
                    type="text"
                    value={institutionOfficeBlock}
                    onChange={e => setInstitutionOfficeBlock(e.target.value)}
                    placeholder="e.g. Central Administrative Building, 1st Floor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/login?role=${selectedRole}`}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Already registered as {activeOption.title}? Return to Sign In
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Registering Account...'
                    : `Complete ${activeOption.title} Registration`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

export default function RegisterClient({ initialColleges = [] }: { initialColleges?: any[] }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-sm font-semibold text-slate-500">Loading Registration Portal...</div>
        </div>
      }
    >
      <RegistrationFormContent />
    </Suspense>
  );
}
