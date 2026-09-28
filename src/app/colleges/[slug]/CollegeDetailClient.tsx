'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  MapPin,
  Award,
  Shield,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquareQuote,
  CheckCircle,
  ArrowLeft,
  Bookmark,
  ExternalLink,
  PenSquare,
  Sparkles,
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { CollegeReview, ReviewerType } from '@/types';

export default function CollegeDetailClient({
  slug,
  initialCollege,
  initialReviews = [],
}: {
  slug: string;
  initialCollege?: any;
  initialReviews?: any[];
}) {
  const {
    colleges,
    reviews,
    posts,
    savedCollegeIds,
    toggleSaveCollege,
    currentUser,
    addReview,
    addInstitutionReply
  } = useApp();

  const college = colleges.find((c) => c.slug === slug) || initialCollege;

  if (!college) {
    notFound();
  }

  // Filter tab for reviews: 'all' | 'student' | 'alumni' | 'faculty'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'student' | 'alumni' | 'faculty'>('all');

  // Inline Review Composer State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [writerRole, setWriterRole] = useState<ReviewerType>(() => {
    if (currentUser?.role === 'alumni') return 'alumni';
    if (currentUser?.role === 'faculty') return 'faculty';
    return 'student';
  });
  const [writerRating, setWriterRating] = useState(5);
  const [writerTitle, setWriterTitle] = useState('');
  const [writerExperience, setWriterExperience] = useState('');
  const [writerCourse, setWriterCourse] = useState(currentUser?.course || 'B.Tech / Science');
  const [writerBatch, setWriterBatch] = useState(currentUser?.graduationBatch || '2025');
  const [writerDepartment, setWriterDepartment] = useState(currentUser?.department || 'Academics');
  const [writerPros, setWriterPros] = useState('');
  const [writerCons, setWriterCons] = useState('');
  const [writerAdvice, setWriterAdvice] = useState('');
  const [writerAnonymous, setWriterAnonymous] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isSaved = savedCollegeIds.includes(college.id);

  // Comprehensive merged reviews list for this institution:
  // Combines AppContext reviews, initial SSR reviews, and any review posts from the public feed
  const allCollegeReviews: CollegeReview[] = useMemo(() => {
    if (!college) return [];

    const map = new Map<string, CollegeReview>();

    // 1. Initial server-rendered reviews
    (initialReviews || []).forEach((r: any) => {
      if (r && (r.collegeId === college.id || !r.collegeId)) {
        map.set(r.id, r);
      }
    });

    // 2. Global reviews in AppContext
    (reviews || []).forEach((r) => {
      if (r && (r.collegeId === college.id || r.collegeId === college.slug)) {
        map.set(r.id, r);
      }
    });

    // 3. Any feed posts tagged as institution review or Review & Ratings for this college
    (posts || []).forEach((p) => {
      if (
        (p.collegeId === college.id || p.collegeName?.toLowerCase() === college.name?.toLowerCase()) &&
        (p.isInstitutionReviewOnly || p.topic === 'Review & Ratings')
      ) {
        const syntheticId = `feed-rev-${p.id}`;
        if (!map.has(p.id) && !map.has(syntheticId)) {
          // Check if not already matching by author + content
          const alreadyExists = Array.from(map.values()).some(
            (existing) => existing.experience === p.content || (p.content && p.content.includes(existing.title))
          );
          if (!alreadyExists) {
            map.set(syntheticId, {
              id: syntheticId,
              collegeId: college.id,
              userId: p.authorId,
              reviewerType: (p.authorRole === 'alumni' ? 'alumni' : p.authorRole === 'faculty' ? 'faculty' : 'student') as ReviewerType,
              authorName: p.authorName,
              authorUsername: p.authorUsername,
              isAnonymous: p.isAnonymous,
              overallRating: p.institutionRating || 5,
              dimensions: {
                academics: p.institutionRating || 5,
                faculty: p.institutionRating || 5,
                placements: p.institutionRating || 5,
                infrastructure: p.institutionRating || 5,
                hostel: p.institutionRating || 5,
                campusLife: p.institutionRating || 5,
                valueForMoney: p.institutionRating || 5,
                studentExperience: p.institutionRating || 5,
              },
              title: `${p.topic || 'Campus Review'} by ${p.authorName}`,
              experience: p.content,
              pros: [],
              cons: [],
              advice: '',
              recommendation: (p.institutionRating || 5) >= 3,
              course: 'Student Contributor',
              department: 'General',
              batch: 'Recent',
              createdAt: p.createdAt || new Date().toISOString(),
            });
          }
        }
      }
    });

    // Convert map to array and sort newest first
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [college, initialReviews, reviews, posts]);

  const studentReviews = useMemo(
    () => allCollegeReviews.filter((r) => r.reviewerType === 'student' || !r.reviewerType),
    [allCollegeReviews]
  );
  const alumniReviews = useMemo(
    () => allCollegeReviews.filter((r) => r.reviewerType === 'alumni'),
    [allCollegeReviews]
  );
  const facultyReviews = useMemo(
    () => allCollegeReviews.filter((r) => r.reviewerType === 'faculty'),
    [allCollegeReviews]
  );

  const displayedReviews = useMemo(() => {
    if (reviewFilter === 'student') return studentReviews;
    if (reviewFilter === 'alumni') return alumniReviews;
    if (reviewFilter === 'faculty') return facultyReviews;
    return allCollegeReviews;
  }, [reviewFilter, allCollegeReviews, studentReviews, alumniReviews, facultyReviews]);

  // Handle inline review submission
  const handleManualReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerTitle.trim() || !writerExperience.trim()) return;

    setIsSubmittingReview(true);

    const prosArray = writerPros
      ? writerPros.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const consArray = writerCons
      ? writerCons.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    addReview({
      collegeId: college.id,
      userId: currentUser?.id || 'guest-contributor',
      reviewerType: writerRole,
      authorName: writerAnonymous
        ? (writerRole === 'alumni' ? 'Anonymous Alumni' : writerRole === 'faculty' ? 'Anonymous Faculty' : 'Anonymous Student')
        : (currentUser?.fullName || (currentUser as any)?.name || 'Campus Contributor'),
      authorUsername: currentUser?.username,
      isAnonymous: writerAnonymous,
      overallRating: writerRating,
      dimensions: {
        academics: writerRating,
        faculty: writerRating,
        placements: writerRating,
        infrastructure: writerRating,
        hostel: writerRating,
        campusLife: writerRating,
        valueForMoney: writerRating,
        studentExperience: writerRating,
      },
      title: writerTitle.trim(),
      experience: writerExperience.trim(),
      pros: prosArray,
      cons: consArray,
      advice: writerAdvice.trim() || undefined,
      recommendation: writerRating >= 3,
      course: writerCourse.trim() || 'General',
      department: writerDepartment.trim() || 'Academics',
      batch: writerBatch.trim() || '2025',
    });

    setIsSubmittingReview(false);
    setSubmitFeedback('🎉 Your review has been published to this institution and the Campus Social Stream!');
    setWriterTitle('');
    setWriterExperience('');
    setWriterPros('');
    setWriterCons('');
    setWriterAdvice('');
    setIsWritingReview(false);

    setTimeout(() => {
      setSubmitFeedback(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to College Directory</span>
      </Link>

      {/* College Hero Header Card */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">
                {college.collegeType} Institution
              </span>
              <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#059669]">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{college.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B]">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-[#2563EB]" />
                <span>{college.location}, {college.state}</span>
              </div>
              <span>•</span>
              <a
                href={college.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-[#2563EB] hover:underline"
              >
                <span>Official Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleSaveCollege(college.id)}
              className={`apple-button-secondary text-xs flex items-center space-x-2 ${
                isSaved ? '!border-[#2563EB] !text-[#2563EB]' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <button
              onClick={() => {
                setIsWritingReview(true);
                const el = document.getElementById('reviews');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="apple-button-primary text-xs flex items-center gap-1.5"
            >
              <PenSquare className="h-3.5 w-3.5" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#F1F5F9] pt-6">
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-xl font-black text-[#D97706]">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || '5.0'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Total Reviews</p>
            <p className="mt-1 text-xl font-black text-[#0F172A]">{allCollegeReviews.length || college.reviewCount || 0}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Placement Rate</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.placementRate || '92%'}
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Highest Package</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.highestPackage || '₹44 LPA'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Pillars: Official vs Community */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Layer A: Official Information */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-4 text-[#2563EB]">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Official Overview</p>
              <p className="mt-1.5 leading-relaxed text-[#1E293B]">
                {college.officialOverview || 'Information verified by platform administration.'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Academic Programs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.courses?.map((crs: string) => (
                  <span key={crs} className="rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1 text-[#0F172A] font-medium">
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Campus Facilities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.facilities?.map((fac: string) => (
                  <span key={fac} className="rounded-lg bg-white border border-[#E2E8F0] px-2.5 py-1 text-[#64748B]">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Annual Fee Structure</p>
              <p className="mt-1 text-sm font-bold text-[#059669]">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B]">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Community Experience */}
        <div id="reviews" className="apple-card p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center space-x-2 text-[#075080]">
              <Shield className="h-5 w-5 text-[#1687D4]" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Community Experience (Student, Alumni &amp; Faculty Voice)
                </h2>
                <p className="text-[11px] text-[#64748B]">
                  Unfiltered feedback protected from institutional deletion.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWritingReview(prev => !prev)}
              className="apple-button-primary text-xs shrink-0 flex items-center gap-1.5 !py-2 !px-3"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>{isWritingReview ? 'Close Writer' : 'Write Review / Feedback'}</span>
            </button>
          </div>

          {/* Submission Feedback Toast */}
          {submitFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitFeedback}</span>
            </div>
          )}

          {/* Inline Interactive Review & Feedback Writer */}
          {isWritingReview && (
            <form onSubmit={handleManualReviewSubmit} className="rounded-2xl border border-[#72B7EB] bg-[#F0F8FF] p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#CFEAFF] pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1687D4]" />
                  <span className="text-xs font-bold text-[#075080]">Write Review for {college.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reviewer Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1.5">
                  I am evaluating as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWriterRole('student')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                      writerRole === 'student'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:border-[#72B7EB]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWriterRole('alumni')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                      writerRole === 'alumni'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:border-[#72B7EB]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Alumni</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWriterRole('faculty')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                      writerRole === 'faculty'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:border-[#72B7EB]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-[#075080] uppercase tracking-wider">
                    Overall Experience Rating
                  </label>
                  <span className="text-xs font-bold text-[#1687D4]">
                    {writerRating} / 5 Stars
                    <span className="ml-1 text-[11px] text-slate-500 font-normal">
                      ({writerRating === 5 ? 'Exceptional' : writerRating === 4 ? 'Very Good' : writerRating === 3 ? 'Average' : writerRating === 2 ? 'Below Average' : 'Needs Improvement'})
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#CFEAFF]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWriterRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= writerRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Course & Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    Course / Degree
                  </label>
                  <input
                    type="text"
                    value={writerCourse}
                    onChange={(e) => setWriterCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    {writerRole === 'faculty' ? 'Department' : 'Graduation Batch'}
                  </label>
                  <input
                    type="text"
                    value={writerRole === 'faculty' ? writerDepartment : writerBatch}
                    onChange={(e) => writerRole === 'faculty' ? setWriterDepartment(e.target.value) : setWriterBatch(e.target.value)}
                    placeholder={writerRole === 'faculty' ? 'e.g. Dept of Computing' : 'e.g. 2025'}
                    className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  value={writerTitle}
                  onChange={(e) => setWriterTitle(e.target.value)}
                  placeholder="e.g. Outstanding placement preparation and lab infrastructure"
                  className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  required
                />
              </div>

              {/* Experience / Detailed Feedback */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                  Detailed Experience &amp; Feedback
                </label>
                <textarea
                  rows={4}
                  value={writerExperience}
                  onChange={(e) => setWriterExperience(e.target.value)}
                  placeholder="Share realistic details about academics, coding culture, faculty mentoring, hostels, or campus life..."
                  className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  required
                />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">
                    Pros (Key Strengths, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={writerPros}
                    onChange={(e) => setWriterPros(e.target.value)}
                    placeholder="e.g. Top recruiters, 24/7 labs, active clubs"
                    className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
                    Cons (Areas for Improvement, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={writerCons}
                    onChange={(e) => setWriterCons(e.target.value)}
                    placeholder="e.g. Strict attendance, mess food"
                    className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                  />
                </div>
              </div>

              {/* Advice */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                  Advice for Aspirants / Juniors (Optional)
                </label>
                <input
                  type="text"
                  value={writerAdvice}
                  onChange={(e) => setWriterAdvice(e.target.value)}
                  placeholder="e.g. Start DSA prep in 2nd year and build real open source projects"
                  className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1687D4]"
                />
              </div>

              {/* Anonymity option */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#CFEAFF] text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#075080]">
                  <input
                    type="checkbox"
                    checked={writerAnonymous}
                    onChange={(e) => setWriterAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded text-[#1687D4] focus:ring-[#1687D4]"
                  />
                  <span>Post Anonymously (Hide Name &amp; Profile)</span>
                </label>
                <span className="text-[10px] text-slate-400">Protects contributor identity</span>
              </div>

              {/* Cross-publish notice */}
              <div className="p-2.5 rounded-xl bg-white text-[11px] text-[#075080] leading-relaxed flex items-start gap-2 border border-[#CFEAFF]">
                <Sparkles className="w-3.5 h-3.5 text-[#1687D4] shrink-0 mt-0.5" />
                <span>
                  <strong>Dual Stream &amp; Ledger Publish:</strong> Submitting this review automatically lists it here under <strong>{college.name}'s Reviews</strong> AND broadcasts it to the <strong>Campus Social Stream public feed</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="apple-button-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="apple-button-primary text-xs"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Publish Review (Feed + Institution)'}
                </button>
              </div>
            </form>
          )}

          {/* Social-Friendly Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                reviewFilter === 'all'
                  ? 'bg-white text-[#075080] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Reviews ({allCollegeReviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('student')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
                reviewFilter === 'student'
                  ? 'bg-white text-[#075080] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#1687D4]" />
              <span>Students ({studentReviews.length})</span>
            </button>
            <button
              onClick={() => setReviewFilter('alumni')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
                reviewFilter === 'alumni'
                  ? 'bg-white text-[#075080] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#059669]" />
              <span>Alumni Feedback ({alumniReviews.length})</span>
            </button>
            <button
              onClick={() => setReviewFilter('faculty')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
                reviewFilter === 'faculty'
                  ? 'bg-white text-[#075080] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Faculty Insights ({facultyReviews.length})</span>
            </button>
          </div>

          {/* List of Reviews */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#CFEAFF] bg-[#F8FAFC] space-y-3">
                <div className="h-10 w-10 rounded-full bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center mx-auto">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">
                    {reviewFilter === 'all'
                      ? 'No reviews yet for this institution.'
                      : `No ${reviewFilter === 'student' ? 'student' : reviewFilter === 'alumni' ? 'alumni' : 'faculty'} reviews found.`}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Be the first to share an evaluation and help thousands of students make informed choices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWritingReview(true)}
                  className="apple-button-primary text-xs mx-auto"
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-[#CFEAFF] bg-[#F8FAFC] p-5 text-xs space-y-3 hover:border-[#72B7EB] transition-colors"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A] text-sm">
                          {rev.isAnonymous ? 'Anonymous Contributor' : rev.authorName}
                        </span>
                        {rev.course && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {rev.course}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.overallRating ? 'fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-[#075080] text-[11px]">
                          {rev.overallRating}.0 / 5
                        </span>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="shrink-0">
                      {rev.reviewerType === 'alumni' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Briefcase className="w-3 h-3" />
                          <span>Alumni Feedback {rev.batch ? `• ${rev.batch}` : ''}</span>
                        </span>
                      ) : rev.reviewerType === 'faculty' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
                          <BookOpen className="w-3 h-3" />
                          <span>Faculty Insight {rev.department ? `• ${rev.department}` : ''}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5FF] border border-[#CFEAFF] px-2.5 py-0.5 text-[10px] font-bold text-[#075080]">
                          <GraduationCap className="w-3 h-3 text-[#1687D4]" />
                          <span>Student Review {rev.batch ? `• ${rev.batch}` : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Experience */}
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-xs leading-snug">{rev.title}</h3>
                    <p className="mt-1.5 text-[#334155] leading-relaxed whitespace-pre-line">
                      {rev.experience}
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                    <div className="space-y-1.5 border-t border-[#E2E8F0] pt-2.5">
                      {rev.pros && rev.pros.length > 0 && (
                        <div className="flex items-start space-x-2 text-[11px] text-[#059669]">
                          <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span><strong>Pros:</strong> {rev.pros.join(', ')}</span>
                        </div>
                      )}
                      {rev.cons && rev.cons.length > 0 && (
                        <div className="flex items-start space-x-2 text-[11px] text-[#D97706]">
                          <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span><strong>Cons:</strong> {rev.cons.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advice for Aspirants */}
                  {rev.advice && (
                    <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[11px] text-[#475569]">
                      <strong className="text-[#075080]">💡 Advice for Aspirants:</strong> {rev.advice}
                    </div>
                  )}

                  {/* Institutional Reply */}
                  {rev.institutionReply ? (
                    <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#1D4ED8]">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span>{rev.institutionReply.officialName}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#1E3A8A] leading-relaxed">
                        "{rev.institutionReply.text}"
                      </p>
                    </div>
                  ) : (
                    currentUser?.role === 'institution' && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            const reply = prompt('Enter official institutional response to this review:');
                            if (reply) addInstitutionReply(rev.id, reply);
                          }}
                          className="apple-button-secondary text-[11px] !py-1 !px-2.5 text-[#2563EB]"
                        >
                          + Reply as Official Institution
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
