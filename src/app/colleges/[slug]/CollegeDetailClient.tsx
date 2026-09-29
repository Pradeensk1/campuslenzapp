'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Plus,
  X,
  Sparkles,
  Filter,
  GraduationCap,
  Briefcase,
  BookOpen,
  User,
  Heart,
  Send,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { ReviewSummaryResult } from '@/types';

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
    savedCollegeIds,
    toggleSaveCollege,
    currentUser,
    addInstitutionReply,
    addReview,
    summarizeReviewsWithAI
  } = useApp();

  const [aiSummary, setAiSummary] = useState<ReviewSummaryResult | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const college = colleges.find((c) => c.slug === slug) || initialCollege;

  if (!college) {
    notFound();
  }

  const isSaved = savedCollegeIds.includes(college.id);

  // Merge context reviews and initialReviews deduplicated by ID, newest first
  const collegeReviews = useMemo(() => {
    const map = new Map<string, any>();
    // First populate initial seed reviews
    (initialReviews || []).forEach((r) => {
      if (r.collegeId === college.id) {
        map.set(r.id, r);
      }
    });
    // Then overlay/prepend context reviews
    const contextReviews = reviews.filter((r) => r.collegeId === college.id);
    contextReviews.forEach((r) => {
      map.set(r.id, r);
    });

    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [reviews, initialReviews, college.id]);

  // Role Filter state: all, student, alumni, faculty
  const [reviewFilter, setReviewFilter] = useState<'all' | 'student' | 'alumni' | 'faculty'>('all');

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return collegeReviews;
    return collegeReviews.filter((r) => r.reviewerType === reviewFilter);
  }, [collegeReviews, reviewFilter]);

  const counts = useMemo(() => {
    return {
      all: collegeReviews.length,
      student: collegeReviews.filter((r) => r.reviewerType === 'student').length,
      alumni: collegeReviews.filter((r) => r.reviewerType === 'alumni').length,
      faculty: collegeReviews.filter((r) => r.reviewerType === 'faculty').length,
    };
  }, [collegeReviews]);

  useEffect(() => {
    if (collegeReviews.length > 0 && !aiSummary && college?.id) {
      const texts = collegeReviews.map(r => `${r.title}. ${r.experience}. ${Array.isArray(r.pros) ? r.pros.join('. ') : ''}`);
      summarizeReviewsWithAI(college.id, texts).then(res => setAiSummary(res)).catch(() => {});
    }
  }, [collegeReviews, college?.id, summarizeReviewsWithAI]);

  const handleRefreshSummary = async () => {
    if (!college?.id) return;
    setIsGeneratingSummary(true);
    try {
      const texts = collegeReviews.map(r => `${r.title}. ${r.experience}. ${Array.isArray(r.pros) ? r.pros.join('. ') : ''}`);
      const res = await summarizeReviewsWithAI(college.id, texts);
      setAiSummary(res);
    } catch {
      // safe fallback
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Helpful reaction local state
  const [helpfulSet, setHelpfulSet] = useState<Set<string>>(new Set());
  const toggleHelpful = (reviewId: string) => {
    setHelpfulSet((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  // Inline "Write Review / Feedback" Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewerType, setReviewerType] = useState<'student' | 'alumni' | 'faculty'>(
    currentUser?.role === 'alumni'
      ? 'alumni'
      : currentUser?.role === 'faculty'
      ? 'faculty'
      : 'student'
  );
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [adviceInput, setAdviceInput] = useState('');
  const [courseInput, setCourseInput] = useState(currentUser?.course || 'Computer Science & Engineering');
  const [batchInput, setBatchInput] = useState(currentUser?.graduationBatch || '2026');
  const [departmentInput, setDepartmentInput] = useState(currentUser?.department || 'School of Engineering');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recommendation, setRecommendation] = useState(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !experience.trim()) return;

    const parsedPros = prosInput ? prosInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const parsedCons = consInput ? consInput.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const authorDisplayName = isAnonymous
      ? reviewerType === 'student'
        ? 'Anonymous Student'
        : reviewerType === 'alumni'
        ? 'Anonymous Alumni'
        : 'Anonymous Faculty'
      : currentUser?.fullName ||
        (reviewerType === 'student'
          ? 'Student Reviewer'
          : reviewerType === 'alumni'
          ? 'Alumni Mentor'
          : 'Faculty Member');

    addReview({
      collegeId: college.id,
      userId: currentUser?.id || 'guest',
      reviewerType,
      authorName: authorDisplayName,
      authorUsername: currentUser?.username || 'verified_reviewer',
      isAnonymous,
      overallRating: rating,
      dimensions: {
        academics: rating,
        faculty: rating,
        placements: rating,
        infrastructure: rating,
        hostel: rating,
        campusLife: rating,
        valueForMoney: rating,
        studentExperience: rating,
      },
      title: title.trim(),
      experience: experience.trim(),
      pros: parsedPros,
      cons: parsedCons,
      advice: adviceInput.trim(),
      recommendation,
      course: courseInput.trim(),
      department: departmentInput.trim(),
      batch: batchInput.trim(),
    });

    setIsModalOpen(false);
    setTitle('');
    setExperience('');
    setProsInput('');
    setConsInput('');
    setAdviceInput('');
    setRating(5);
    setIsAnonymous(false);

    setFeedbackSuccess('🎉 Review posted to Campus Social Stream and added to institution ledger!');
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#075080] hover:text-[#1687D4] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to College Directory</span>
      </Link>

      {/* Success Notification Alert */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#E8F5FF] border border-[#72B7EB] text-[#075080] text-xs font-bold shadow-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1687D4]" />
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* College Hero Header Card */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#1687D4] border border-[#CFEAFF]">
                {college.collegeType} Institution
              </span>
              <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#059669] border border-emerald-100">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {college.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B]">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-[#1687D4]" />
                <span>
                  {college.location}, {college.state}
                </span>
              </div>
              <span>•</span>
              <a
                href={college.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-[#1687D4] hover:underline"
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
                isSaved ? '!border-[#1687D4] !text-[#1687D4] bg-[#E8F5FF]' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="apple-button-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Review / Feedback</span>
            </button>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#F1F5F9] pt-6">
          <div className="rounded-xl bg-[#F8FAFC] border border-[#CFEAFF] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#075080]">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-xl font-black text-[#D97706]">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || 'No ratings yet'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#CFEAFF] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#075080]">Verified Reviews</p>
            <p className="mt-1 text-xl font-black text-[#0F172A]">{collegeReviews.length}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#CFEAFF] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#075080]">Placement Rate</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.placementRate || 'Not available'}
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#CFEAFF] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#075080]">Highest Package</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.highestPackage || 'Not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Pillars: Official vs Community */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Layer A: Official Information (Cols 1-5) */}
        <div className="apple-card p-6 space-y-5 lg:col-span-5 h-fit">
          <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-4 text-[#1687D4]">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#075080]">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#075080] uppercase tracking-wider text-[10px]">
                Official Overview
              </p>
              <p className="mt-1.5 leading-relaxed text-[#1E293B]">
                {college.officialOverview || 'Information not available yet.'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#075080] uppercase tracking-wider text-[10px]">
                Academic Programs
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.courses?.map((crs: string) => (
                  <span
                    key={crs}
                    className="rounded-lg bg-[#E8F5FF] border border-[#CFEAFF] px-3 py-1 text-[#075080] font-semibold text-[11px]"
                  >
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#075080] uppercase tracking-wider text-[10px]">
                Campus Facilities
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.facilities?.map((fac: string) => (
                  <span
                    key={fac}
                    className="rounded-lg bg-white border border-[#CFEAFF] px-2.5 py-1 text-slate-700 text-[11px]"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#075080] uppercase tracking-wider text-[10px]">
                Annual Fee Structure
              </p>
              <p className="mt-1 text-sm font-bold text-[#059669]">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B]">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Community Experience & Multi-Role Reviews Ledger (Cols 6-12) */}
        <div id="reviews" className="apple-card p-6 space-y-5 lg:col-span-7 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center space-x-2 text-[#1687D4]">
              <Shield className="h-5 w-5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#075080]">
                  Institution Reviews &amp; Ratings Ledger
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Verified evaluations from students, alumni &amp; faculty
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="apple-button-primary text-xs flex items-center justify-center gap-1.5 py-2 px-3 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Review / Feedback</span>
            </button>
          </div>

          {/* Social-friendly Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                reviewFilter === 'all'
                  ? 'bg-[#1687D4] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#075080] hover:bg-slate-200'
              }`}
            >
              All Reviews ({counts.all})
            </button>
            <button
              onClick={() => setReviewFilter('student')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                reviewFilter === 'student'
                  ? 'bg-[#1687D4] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#075080] hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Students ({counts.student})</span>
            </button>
            <button
              onClick={() => setReviewFilter('alumni')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                reviewFilter === 'alumni'
                  ? 'bg-[#1687D4] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#075080] hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Alumni Feedback ({counts.alumni})</span>
            </button>
            <button
              onClick={() => setReviewFilter('faculty')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                reviewFilter === 'faculty'
                  ? 'bg-[#1687D4] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#075080] hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Faculty Perspectives ({counts.faculty})</span>
            </button>
          </div>

          {/* AI Review Summary & Insights Card */}
          {collegeReviews.length > 0 && (
            <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-sky-100 text-[#1687D4]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#075080]">
                      ⚡ AI Review Synthesis &amp; Takeaways
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Multi-aspect sentiment extraction powered by campus-lenz-ai
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshSummary}
                  disabled={isGeneratingSummary}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSummary ? 'Synthesizing...' : 'Regenerate Summary'}</span>
                </button>
              </div>

              {aiSummary ? (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-sky-100/80 text-[12px]">
                    {aiSummary.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Top Highlights
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1">
                        {aiSummary.positive_points.slice(0, 3).map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/90 p-3 rounded-xl border border-amber-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Considerations
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1">
                        {aiSummary.negative_points.slice(0, 3).map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {aiSummary.aspect_summary && Object.keys(aiSummary.aspect_summary).length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                      {Object.entries(aiSummary.aspect_summary).filter(([, desc]) => Boolean(desc)).map(([aspect, desc]) => (
                        <span key={aspect} className="px-2 py-0.5 rounded-lg bg-sky-100/70 text-[#075080] border border-sky-200/60 font-semibold" title={desc || ''}>
                          ✓ {aspect}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-slate-400 italic">
                  Analyzing student reviews with campus-lenz-ai...
                </div>
              )}
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#CFEAFF] bg-[#F8FAFC] space-y-3">
                <Shield className="w-8 h-8 text-[#1687D4] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[#075080]">
                  No {reviewFilter !== 'all' ? `${reviewFilter} ` : ''}reviews found for this institution yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Be the first to share an authentic review or feedback.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="apple-button-primary text-xs mx-auto"
                >
                  Write First Review
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const isHelpful = helpfulSet.has(rev.id);
                const displayHelpfulCount = (rev.helpfulCount || 0) + (isHelpful ? 1 : 0);

                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-[#CFEAFF] bg-white p-5 text-xs space-y-3.5 shadow-2xs hover:border-[#72B7EB] transition-all"
                  >
                    {/* Header: Author & Role Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5FF] text-[#1687D4] font-bold text-xs flex items-center justify-center border border-[#CFEAFF]">
                          {rev.isAnonymous ? 'A' : (rev.authorName?.[0] || 'U')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0F172A]">
                              {rev.isAnonymous
                                ? rev.reviewerType === 'student'
                                  ? 'Anonymous Student'
                                  : rev.reviewerType === 'alumni'
                                  ? 'Anonymous Alumni'
                                  : 'Anonymous Faculty'
                                : rev.authorName}
                            </span>
                            {!rev.isAnonymous && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#1687D4]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B]">
                            {rev.course || rev.department ? `${rev.course || rev.department} • ` : ''}
                            {rev.batch ? `Class of ${rev.batch}` : 'Verified Member'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          rev.reviewerType === 'alumni'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                            : rev.reviewerType === 'faculty'
                            ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                            : 'bg-[#E8F5FF] text-[#075080] border-[#CFEAFF]'
                        }`}
                      >
                        {rev.reviewerType === 'alumni'
                          ? 'Alumni Feedback'
                          : rev.reviewerType === 'faculty'
                          ? 'Faculty Review'
                          : 'Student Review'}
                      </span>
                    </div>

                    {/* Star Rating & Title */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.overallRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-[#075080] text-xs">
                          {rev.overallRating}.0 / 5.0
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#0F172A] leading-snug">
                        {rev.title}
                      </h3>
                    </div>

                    {/* Review Body */}
                    <p className="text-[#334155] leading-relaxed whitespace-pre-line text-xs">
                      {rev.experience}
                    </p>

                    {/* Pros & Cons */}
                    {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#F1F5F9]">
                        {rev.pros && rev.pros.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-[#059669] space-y-1">
                            <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              <ThumbsUp className="w-3 h-3 text-[#059669]" />
                              Pros / Highlights:
                            </span>
                            <p className="leading-snug">{rev.pros.join(', ')}</p>
                          </div>
                        )}
                        {rev.cons && rev.cons.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-[#D97706] space-y-1">
                            <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              <ThumbsDown className="w-3 h-3 text-[#D97706]" />
                              Cons / Improvements:
                            </span>
                            <p className="leading-snug">{rev.cons.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advice */}
                    {rev.advice && (
                      <div className="p-2.5 rounded-xl bg-[#F0F8FF] border border-[#CFEAFF] text-[11px] text-[#075080] flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#1687D4] shrink-0 mt-0.5" />
                        <span>
                          <strong>Advice to Aspirants:</strong> {rev.advice}
                        </span>
                      </div>
                    )}

                    {/* Institutional Reply */}
                    {rev.institutionReply ? (
                      <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 space-y-1">
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#1D4ED8]">
                          <MessageSquareQuote className="h-3.5 w-3.5" />
                          <span>Official Institutional Response • {rev.institutionReply.officialName}</span>
                        </div>
                        <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
                          &quot;{rev.institutionReply.text}&quot;
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
                            className="apple-button-secondary text-[11px] !py-1 !px-2.5 text-[#1687D4]"
                          >
                            + Reply as Official Institution
                          </button>
                        </div>
                      )
                    )}

                    {/* Card Footer: Helpful button & Recommendation indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-[11px]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHelpful(rev.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                            isHelpful
                              ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-2xs'
                              : 'bg-white text-[#64748B] border-slate-200 hover:border-[#72B7EB] hover:text-[#075080]'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({displayHelpfulCount})</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INLINE WRITE REVIEW / SHARE FEEDBACK MODAL (Frosted Glass) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-[#CFEAFF] shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#CFEAFF] pb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#075080] flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>Write Review &amp; Share Feedback</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Direct evaluation for <strong>{college.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Dual Stream Publish Notice */}
              <div className="p-3 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-xs text-[#075080] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#1687D4] shrink-0 mt-0.5" />
                <span>
                  <strong>Dual Broadcast:</strong> This review will automatically appear in this college&apos;s review ledger AND broadcast to the <strong>Campus Social Stream</strong>.
                </span>
              </div>

              {/* Reviewer Role Selector */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1.5">
                  I am writing this evaluation as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewerType('student')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      reviewerType === 'student'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:bg-[#E8F5FF]'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Student</span>
                    <span className="text-[10px] opacity-80 block">Current Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerType('alumni')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      reviewerType === 'alumni'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:bg-[#E8F5FF]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Alumni</span>
                    <span className="text-[10px] opacity-80 block">Career Feedback</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerType('faculty')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      reviewerType === 'faculty'
                        ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-xs'
                        : 'bg-white text-[#075080] border-[#CFEAFF] hover:bg-[#E8F5FF]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Faculty</span>
                    <span className="text-[10px] opacity-80 block">Academic View</span>
                  </button>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-[#075080] uppercase tracking-wider">
                    Overall Experience Rating
                  </label>
                  <span className="text-xs font-bold text-[#1687D4]">
                    {rating} / 5 Stars{' '}
                    <span className="text-slate-500 font-normal">
                      ({rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'})
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#CFEAFF]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Role-Specific Fields (Course & Batch / Department) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    {reviewerType === 'faculty' ? 'Department' : 'Degree / Program'}
                  </label>
                  <input
                    type="text"
                    value={reviewerType === 'faculty' ? departmentInput : courseInput}
                    onChange={(e) =>
                      reviewerType === 'faculty'
                        ? setDepartmentInput(e.target.value)
                        : setCourseInput(e.target.value)
                    }
                    placeholder={reviewerType === 'faculty' ? 'e.g. Dept of Computing' : 'e.g. B.Tech CSE / MCA'}
                    className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    {reviewerType === 'faculty' ? 'Experience / Years' : reviewerType === 'alumni' ? 'Graduation Batch' : 'Batch / Year'}
                  </label>
                  <input
                    type="text"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={reviewerType === 'faculty' ? 'e.g. 5+ Years' : 'e.g. 2024'}
                    className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                    required
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Robust placement drives, high academic standards, and helpful alumni network"
                  className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                  required
                />
              </div>

              {/* Detailed Experience */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                  Detailed Experience &amp; Analysis
                </label>
                <textarea
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Share comprehensive insights into professors, examination patterns, hostel living conditions, campus clubs, and placements..."
                  className="w-full p-3 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                  required
                />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">
                    Pros (comma separated)
                  </label>
                  <input
                    type="text"
                    value={prosInput}
                    onChange={(e) => setProsInput(e.target.value)}
                    placeholder="e.g. 95% Placements, Wi-Fi campus"
                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs text-[#0F172A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
                    Cons (comma separated)
                  </label>
                  <input
                    type="text"
                    value={consInput}
                    onChange={(e) => setConsInput(e.target.value)}
                    placeholder="e.g. Strict attendance, Mess food"
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs text-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Advice */}
              <div>
                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                  Advice for Juniors / Aspirants (Optional)
                </label>
                <input
                  type="text"
                  value={adviceInput}
                  onChange={(e) => setAdviceInput(e.target.value)}
                  placeholder="e.g. Start coding competitions from 2nd year and participate in hackathons"
                  className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded text-[#1687D4] focus:ring-[#1687D4]"
                  />
                  <span>Post Review Anonymously (Hide Name &amp; Profile)</span>
                </label>
                <span className="text-[10px] text-slate-400">Protects identity</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CFEAFF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button-primary text-xs font-bold py-2.5 px-5"
                >
                  Submit &amp; Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
