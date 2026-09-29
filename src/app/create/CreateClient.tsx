'use client';

import { useState, useDeferredValue, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Star, Shield, ShieldCheck, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Sparkles, Image as ImageIcon, X, AlertTriangle, Video, Paperclip, Building2 } from 'lucide-react';
import { isVideoMedia, formatFileSize, compressImageToDataUrl } from '@/lib/mediaUtils';
import { purifyContentText, classifyImageSafety, COLLEGE_INCIDENT_EMAIL_RECIPIENT } from '@/lib/aiModerationModels';

export default function CreateClient({
  initialColleges = [],
}: {
  initialColleges?: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const queryCollegeId = searchParams.get('collegeId');

  const { colleges, posts, currentUser, addPost, addReview, runOpenSourceAIModeration, detectDuplicateWithAI, analyzeImageWithAI } = useApp();

  const [activeTab, setActiveTab] = useState<'post' | 'review' | 'feedback'>(
    queryTab === 'review' ? 'review' : queryTab === 'feedback' ? 'feedback' : 'post'
  );
  const [postError, setPostError] = useState<string | null>(null);
  const [isOptimizingMedia, setIsOptimizingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeColleges = colleges.length > 0 ? colleges : initialColleges;

  // Post form state
  const [postCollegeId, setPostCollegeId] = useState(
    queryCollegeId || activeColleges[0]?.id || ''
  );
  const [postContent, setPostContent] = useState('');
  const deferredPostContent = useDeferredValue(postContent);
  const [postTopic, setPostTopic] = useState('Campus Life');
  const [postType, setPostType] = useState<'stream' | 'review' | 'feedback'>(
    queryTab === 'feedback' ? 'feedback' : 'stream'
  );
  const [institutionReviewRating, setInstitutionReviewRating] = useState(5);
  const [institutionReviewCategory, setInstitutionReviewCategory] = useState('Academics & Faculty');
  const [institutionReviewTitle, setInstitutionReviewTitle] = useState('');
  const [institutionReviewPros, setInstitutionReviewPros] = useState('');
  const [institutionReviewCons, setInstitutionReviewCons] = useState('');

  // Feedback specific state
  const [feedbackCollegeId, setFeedbackCollegeId] = useState(
    queryCollegeId || activeColleges[0]?.id || ''
  );
  const [feedbackCategory, setFeedbackCategory] = useState('Hostel & Mess');
  const [feedbackTarget, setFeedbackTarget] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackContent, setFeedbackContent] = useState('');

  const [postImageUrl, setPostImageUrl] = useState<string>('');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [mediaFileSize, setMediaFileSize] = useState<number>(0);
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | null>(null);

  // AI Duplicate & Image Analysis state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    similarity: number;
    matchedPostContent: string;
    matchedAuthor: string;
  } | null>(null);
  const [imageAIResult, setImageAIResult] = useState<any | null>(null);

  // Real-time duplicate detection across campus stream
  useEffect(() => {
    if (deferredPostContent.trim().length < 15 || !posts || posts.length === 0) {
      setDuplicateWarning(null);
      return;
    }

    let isMounted = true;
    const runCheck = async () => {
      try {
        const candidates = posts.slice(0, 15);
        for (const p of candidates) {
          if (!p.content || p.content === deferredPostContent) continue;
          const res = await detectDuplicateWithAI(deferredPostContent, p.content, 0.78);
          if (res.likely_duplicate && isMounted) {
            setDuplicateWarning({
              similarity: res.similarity,
              matchedPostContent: p.content,
              matchedAuthor: p.authorUsername || p.authorName || 'Campus Student',
            });
            return;
          }
        }
        if (isMounted) setDuplicateWarning(null);
      } catch {
        // safe fallback
      }
    };

    const timer = setTimeout(runCheck, 350);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [deferredPostContent, posts, detectDuplicateWithAI]);

  // Real-time AI image analysis
  useEffect(() => {
    if (!postImageUrl) {
      setImageAIResult(null);
      return;
    }
    let isMounted = true;
    const analyze = async () => {
      try {
        const res = await analyzeImageWithAI(postImageUrl, mediaFileName);
        if (isMounted) setImageAIResult(res);
      } catch {
        // safe
      }
    };
    analyze();
    return () => {
      isMounted = false;
    };
  }, [postImageUrl, mediaFileName, analyzeImageWithAI]);

  // Handle optimized image or video selection
  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    if (isVid && file.size > 4.5 * 1024 * 1024) {
      setPostError('Direct video files must be under 4.5MB due to cloud serverless payload limits. For longer videos, please provide an external link.');
      return;
    }

    setMediaFileName(file.name);
    setMediaFileSize(file.size);
    setMediaFileType(isVid ? 'video' : 'image');
    setPostError(null);

    if (isVid) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPostImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIsOptimizingMedia(true);
      try {
        const compressed = await compressImageToDataUrl(file);
        setPostImageUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setPostImageUrl(event.target.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsOptimizingMedia(false);
      }
    }
  };

  const removeMedia = () => {
    setPostImageUrl('');
    setMediaFileName('');
    setMediaFileSize(0);
    setMediaFileType(null);
  };

  // Review form state
  const [reviewCollegeId, setReviewCollegeId] = useState(
    queryCollegeId || activeColleges[0]?.id || ''
  );
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewExperience, setReviewExperience] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');
  const [reviewAdvice, setReviewAdvice] = useState('');
  const [reviewCourse, setReviewCourse] = useState('MCA');
  const [reviewBatch, setReviewBatch] = useState('2025');
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratings, setRatings] = useState({
    academics: 5,
    faculty: 4,
    placements: 5,
    infrastructure: 4,
    hostel: 3,
    campusLife: 4,
    valueForMoney: 5,
    studentExperience: 4,
  });

  useEffect(() => {
    if (queryTab === 'review') {
      setActiveTab('review');
    } else if (queryTab === 'feedback') {
      setActiveTab('feedback');
      setPostType('feedback');
    } else if (queryTab === 'post') {
      setActiveTab('post');
    }
  }, [queryTab]);

  useEffect(() => {
    if (queryCollegeId) {
      setPostCollegeId(queryCollegeId);
      setReviewCollegeId(queryCollegeId);
      setFeedbackCollegeId(queryCollegeId);
    } else {
      if (!postCollegeId && activeColleges[0]?.id) {
        setPostCollegeId(activeColleges[0].id);
      }
      if (!reviewCollegeId && activeColleges[0]?.id) {
        setReviewCollegeId(activeColleges[0].id);
      }
      if (!feedbackCollegeId && activeColleges[0]?.id) {
        setFeedbackCollegeId(activeColleges[0].id);
      }
    }
  }, [queryCollegeId, activeColleges, postCollegeId, reviewCollegeId, feedbackCollegeId]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;
    if (isOptimizingMedia) {
      setPostError('Media is still processing. Please wait a moment...');
      return;
    }

    setIsSubmitting(true);
    setPostError(null);
    const chosenCollege = activeColleges.find(c => c.id === feedbackCollegeId);

    // AI Text Classification & Purification
    const purification = purifyContentText(feedbackContent.trim());
    const purifiedContent = purification.purifiedText;
    const imageSafety = postImageUrl ? classifyImageSafety(postImageUrl, mediaFileName) : undefined;

    // Automated Redirection / Dispatch to College Mail (pkeditxoffical@gmail.com)
    if (purification.shouldAlertCollege || purification.isPurified || (imageSafety && imageSafety.status !== 'safe')) {
      try {
        fetch('/api/moderation/email-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: {
              fullName: currentUser?.fullName || 'Student Contributor',
              username: currentUser?.username || 'student_user',
              studentRollNo: (currentUser as any)?.studentRollNo || (currentUser as any)?.rollNo || 'REG-VERIFIED',
              collegeName: chosenCollege?.name || currentUser?.collegeName || 'Campus',
              department: currentUser?.department || currentUser?.course || 'Academics',
              graduationBatch: currentUser?.graduationBatch || '2026',
              role: currentUser?.role || 'student'
            },
            purification,
            imageSafety,
            source: 'feed_feedback',
            targetEmail: COLLEGE_INCIDENT_EMAIL_RECIPIENT
          })
        }).catch(() => {});
      } catch (err) {
        console.error('Moderation dispatch error:', err);
      }
    }

    const res = addPost({
      authorId: currentUser?.id || 'guest',
      authorUsername: currentUser?.username || 'student_guest',
      authorName: currentUser?.fullName || (currentUser as any)?.name || 'Student Contributor',
      authorRole: currentUser?.role || 'student',
      authorHeadline: currentUser?.headline || 'Campus Contributor',
      isVerifiedAuthor: Boolean(currentUser?.isVerified),
      isAnonymous: false,
      collegeId: feedbackCollegeId,
      collegeName: chosenCollege?.name,
      content: purifiedContent,
      topic: `Feedback: ${feedbackCategory}`,
      postType: 'feedback',
      rating: feedbackRating,
      feedbackCategory: feedbackCategory,
      feedbackTarget: feedbackTarget.trim() || undefined,
      imageUrl: postImageUrl || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setPostError(res.message || 'Submission rejected by moderation policy.');
      return;
    }

    router.push('/?filter=feedback');
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    if (isOptimizingMedia) {
      setPostError('Media is still processing. Please wait a moment...');
      return;
    }

    setIsSubmitting(true);
    setPostError(null);
    const chosenCollege = activeColleges.find(c => c.id === postCollegeId);

    // AI Text Classification & Purification
    const fullText = `${institutionReviewTitle} ${postContent} ${institutionReviewPros} ${institutionReviewCons}`.trim();
    const purification = purifyContentText(fullText);
    const contentPurification = purifyContentText(postContent.trim());
    const purifiedPostContent = contentPurification.purifiedText;
    const imageSafety = postImageUrl ? classifyImageSafety(postImageUrl, mediaFileName) : undefined;

    // Automated College Incident Dispatch to pkeditxoffical@gmail.com
    if (purification.shouldAlertCollege || purification.isPurified || (imageSafety && imageSafety.status !== 'safe')) {
      try {
        fetch('/api/moderation/email-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: {
              fullName: currentUser?.fullName || 'Student Contributor',
              username: currentUser?.username || 'student_user',
              studentRollNo: (currentUser as any)?.studentRollNo || (currentUser as any)?.rollNo || 'REG-VERIFIED',
              collegeName: chosenCollege?.name || currentUser?.collegeName || 'Campus',
              department: currentUser?.department || currentUser?.course || 'Academics',
              graduationBatch: currentUser?.graduationBatch || '2026',
              role: currentUser?.role || 'student'
            },
            purification: {
              ...purification,
              originalText: postContent.trim(),
              purifiedText: purifiedPostContent
            },
            imageSafety,
            source: postType === 'review' ? 'college_review' : postType === 'feedback' ? 'feed_feedback' : 'feed_post',
            targetEmail: COLLEGE_INCIDENT_EMAIL_RECIPIENT
          })
        }).catch(() => {});
      } catch (err) {
        console.error('Moderation dispatch error:', err);
      }
    }

    if (postType === 'feedback') {
      const res = addPost({
        authorId: currentUser?.id || 'guest',
        authorUsername: currentUser?.username || 'student_guest',
        authorName: currentUser?.fullName || (currentUser as any)?.name || 'Student Contributor',
        authorRole: currentUser?.role || 'student',
        authorHeadline: currentUser?.headline || 'Campus Contributor',
        isVerifiedAuthor: Boolean(currentUser?.isVerified),
        isAnonymous: false,
        collegeId: postCollegeId,
        collegeName: chosenCollege?.name,
        content: purifiedPostContent,
        topic: `Feedback: ${feedbackCategory}`,
        postType: 'feedback',
        rating: feedbackRating,
        feedbackCategory: feedbackCategory,
        feedbackTarget: feedbackTarget.trim() || undefined,
        imageUrl: postImageUrl || undefined,
      });

      setIsSubmitting(false);

      if (!res.success) {
        setPostError(res.message || 'Submission rejected by moderation policy.');
        return;
      }

      router.push('/?filter=feedback');
      return;
    }

    if (postType === 'review' && postCollegeId) {
      const parsedPros = institutionReviewPros ? institutionReviewPros.split(',').map(s => s.trim()).filter(Boolean) : [];
      const parsedCons = institutionReviewCons ? institutionReviewCons.split(',').map(s => s.trim()).filter(Boolean) : [];

      addReview({
        collegeId: postCollegeId,
        userId: currentUser?.id || 'guest',
        reviewerType: 'student',
        authorName: currentUser?.fullName || 'Student Contributor',
        authorUsername: currentUser?.username || 'student_user',
        isAnonymous: false,
        overallRating: institutionReviewRating,
        dimensions: {
          academics: institutionReviewRating,
          faculty: institutionReviewRating,
          placements: institutionReviewRating,
          infrastructure: institutionReviewRating,
          hostel: institutionReviewRating,
          campusLife: institutionReviewRating,
          valueForMoney: institutionReviewRating,
          studentExperience: institutionReviewRating
        },
        title: institutionReviewTitle.trim() || `${institutionReviewCategory} Evaluation`,
        experience: purifiedPostContent,
        pros: parsedPros,
        cons: parsedCons,
        advice: '',
        recommendation: institutionReviewRating >= 3,
        course: currentUser?.course || 'Student',
        department: currentUser?.department || 'Academics',
        batch: currentUser?.graduationBatch || '2026'
      });

      setIsSubmitting(false);
      router.push(chosenCollege?.slug ? `/colleges/${chosenCollege.slug}#reviews` : '/explore');
      return;
    }

    const res = addPost({
      authorId: currentUser?.id || 'guest',
      authorUsername: currentUser?.username || 'student_guest',
      authorName: currentUser?.fullName || (currentUser as any)?.name || 'Student',
      authorRole: currentUser?.role || 'student',
      authorHeadline: currentUser?.headline || 'Student Contributor',
      isVerifiedAuthor: Boolean(currentUser?.isVerified),
      isAnonymous: false,
      collegeId: postCollegeId,
      collegeName: chosenCollege?.name,
      content: purifiedPostContent,
      topic: postTopic,
      imageUrl: postImageUrl || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setPostError(res.message || 'Submission rejected by moderation policy.');
      return;
    }

    router.push('/');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewExperience.trim()) return;

    // AI Text Classification & Purification
    const fullReviewText = `${reviewTitle} ${reviewExperience} ${reviewPros} ${reviewCons} ${reviewAdvice}`.trim();
    const purification = purifyContentText(fullReviewText);
    const purifiedExperience = purifyContentText(reviewExperience.trim()).purifiedText;
    const chosen = activeColleges.find(c => c.id === reviewCollegeId);

    // Automated Incident Alert to pkeditxoffical@gmail.com
    if (purification.shouldAlertCollege || purification.isPurified) {
      try {
        fetch('/api/moderation/email-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: {
              fullName: currentUser?.fullName || 'Contributor',
              username: currentUser?.username || 'reviewer_user',
              studentRollNo: (currentUser as any)?.studentRollNo || (currentUser as any)?.rollNo || 'REG-VERIFIED',
              collegeName: chosen?.name || currentUser?.collegeName || 'Campus',
              department: currentUser?.department || currentUser?.course || 'Academics',
              graduationBatch: currentUser?.graduationBatch || '2026',
              role: currentUser?.role || 'student'
            },
            purification,
            source: 'college_review',
            targetEmail: COLLEGE_INCIDENT_EMAIL_RECIPIENT
          })
        }).catch(() => {});
      } catch (err) {
        console.error('Moderation dispatch error:', err);
      }
    }

    addReview({
      collegeId: reviewCollegeId,
      userId: currentUser?.id || 'guest',
      reviewerType: currentUser?.role === 'alumni' ? 'alumni' : 'student',
      authorName: currentUser?.fullName || 'Contributor',
      authorUsername: currentUser?.username || 'verified_reviewer',
      isAnonymous: false,
      overallRating: ratingOverall,
      dimensions: ratings,
      title: reviewTitle,
      experience: purifiedExperience,
      pros: reviewPros ? reviewPros.split(',').map(s => s.trim()) : [],
      cons: reviewCons ? reviewCons.split(',').map(s => s.trim()) : [],
      advice: reviewAdvice,
      recommendation: ratingOverall >= 3,
      course: reviewCourse,
      department: 'Computer Applications',
      batch: reviewBatch
    });

    const chosenCollege = activeColleges.find(c => c.id === reviewCollegeId);
    router.push(chosenCollege?.slug ? `/colleges/${chosenCollege.slug}#reviews` : '/explore');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Segmented Control */}
      <div className="flex rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-1.5 text-xs shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('post')}
          className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 ${
            activeTab === 'post'
              ? 'bg-white text-[#0F172A] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          📢 Campus Post
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 ${
            activeTab === 'review'
              ? 'bg-white text-[#0F172A] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          ⭐ College Review
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('feedback');
            setPostType('feedback');
          }}
          className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 ${
            activeTab === 'feedback'
              ? 'bg-white text-[#1687D4] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          💡 Campus Feedback
        </button>
      </div>

      {activeTab === 'post' ? (
        <form onSubmit={handlePostSubmit} className="apple-card p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Create a Community Post</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Connect with students and alumni across campuses on placements, hostel realities, and academics.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              College Association
            </label>
            <select
              value={postCollegeId}
              onChange={(e) => setPostCollegeId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none transition-colors"
            >
              {activeColleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Discussion Topic
            </label>
            <select
              value={postTopic}
              onChange={(e) => setPostTopic(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none transition-colors"
            >
              <option value="Campus Life">Campus Life & Hostels</option>
              <option value="Placements & Prep">Placements & Company Drives</option>
              <option value="Alumni Mentorship">Alumni Mentorship & Advice</option>
              <option value="Admissions & Cutoffs">Admissions & Counseling</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Your Message
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What questions or experiences would you like to share?"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* High-Resolution Photo or Video Attachment Support */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Attach Photo or Video Media (Lossless Quality)
            </label>
            
            {postImageUrl ? (
              <div className="relative rounded-xl border border-[#E2E8F0] bg-slate-950 p-2 overflow-hidden">
                {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? (
                  <video
                    src={postImageUrl}
                    controls
                    className="w-full max-h-72 object-contain rounded-lg bg-black"
                  />
                ) : (
                  <img
                    src={postImageUrl}
                    alt="Post media attachment"
                    className="w-full max-h-72 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-4 right-4 bg-[#0F172A]/90 hover:bg-black text-white rounded-full p-1.5 transition shadow-md"
                  title="Remove media"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 text-[11px] text-slate-300 px-1 flex items-center justify-between">
                  <span className="truncate max-w-[320px]">
                    Attached: <strong>{mediaFileName || 'Media Upload'}</strong>
                  </span>
                  <span>
                    {mediaFileSize ? formatFileSize(mediaFileSize) + ' • ' : ''}
                    {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? 'Video' : 'Photo'}
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 transition">
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="h-10 w-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-[#0F172A]">
                    Click to upload or drag & drop photo or video
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Images (PNG, JPG, WebP, GIF) & Videos (MP4, WebM, MOV) up to 50MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Verified Contributor Identity Badge */}
          <div className="flex items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-blue-950 font-semibold">
                Posting with Verified Identity: <strong className="text-blue-900">{currentUser?.fullName || 'Verified Contributor'}</strong> (@{currentUser?.username || 'user'})
              </p>
              <p className="text-[11px] text-blue-700/80 mt-0.5">
                Anonymous posting has been disabled. Automated AI content purification protects respectful campus discourse.
              </p>
            </div>
          </div>

          {/* Post Submission Error Alert */}
          {postError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Submission Blocked by Moderation Policy
              </div>
              <p className="text-rose-700 leading-relaxed">{postError}</p>
            </div>
          )}

          {/* Open-Source AI Safety Pre-Flight Scanner Box */}
          {deferredPostContent.trim().length > 3 && (() => {
            const ai = runOpenSourceAIModeration(deferredPostContent, postImageUrl);
            const isSevere = ai.toxicity.score >= 80;
            const isSens = ai.isSensitive;
            return (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Campus Lenz AI Pre-Flight Telemetry & Post Analyzer
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    campus-lenz-ai • toxic-bert • distilbert-sst2
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Category Classifier */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Topic Classification
                    </span>
                    <div className="font-bold text-blue-700 flex items-center gap-1 truncate">
                      <span className="truncate">{ai.classification?.category || 'General'}</span>
                      <span className="text-[10px] text-slate-400">({Math.round((ai.classification?.confidence || 0.8) * 100)}%)</span>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Sentiment Analysis
                    </span>
                    <div className="font-bold text-slate-800 capitalize flex items-center gap-1">
                      <span>{ai.sentiment.label}</span>
                      <span className="text-[10px] text-slate-400">({Math.round(ai.sentiment.score * 100)}%)</span>
                    </div>
                  </div>

                  {/* Toxicity */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Toxicity Rating
                    </span>
                    <div className={`font-bold flex items-center gap-1 ${
                      isSevere ? 'text-rose-600' : isSens ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      <span>{ai.toxicity.score}%</span>
                      <span className="text-[10px] font-normal text-slate-400 capitalize">({ai.toxicity.severity})</span>
                    </div>
                  </div>

                  {/* Moderation Recommendation */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Moderation Status
                    </span>
                    <div className={`font-bold capitalize truncate ${
                      ai.postAnalysis?.moderation === 'potentially_harmful' ? 'text-rose-600' :
                      ai.postAnalysis?.moderation === 'sensitive' ? 'text-amber-600' :
                      ai.postAnalysis?.moderation === 'spam' ? 'text-orange-600' : 'text-emerald-600'
                    }`}>
                      {ai.postAnalysis?.moderation || 'normal'}
                    </div>
                  </div>
                </div>

                {isSevere ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>🚨 Policy Alert: Potentially harmful content or severe toxicity ({ai.toxicity.score}%). Submission will be rejected with account suspension.</span>
                  </div>
                ) : isSens ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Sensitivity Notice: Legitimate student discussion flagged as sensitive. Will be published under the AI frosted shield.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✨ Content Approved: Verified clean for campus-wide distribution in {ai.classification?.category || 'General'}.</span>
                  </div>
                )}

                {/* AI Duplicate Detection Alert */}
                {duplicateWarning ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">⚠️ High Similarity Alert ({Math.round(duplicateWarning.similarity * 100)}% Match)</span>
                      <p className="font-normal text-amber-800 text-[10px] mt-0.5">
                        Very similar to a recent campus post by @{duplicateWarning.matchedAuthor}: &ldquo;{duplicateWarning.matchedPostContent.slice(0, 85)}...&rdquo;. Please ensure your post provides original questions or perspectives.
                      </p>
                    </div>
                  </div>
                ) : deferredPostContent.trim().length > 30 ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium px-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Original Discussion Verified (Cosine similarity &lt; 78% against campus feed)</span>
                  </div>
                ) : null}

                {/* AI Image Recognition Telemetry */}
                {imageAIResult && (
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-[11px] text-blue-900">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Visual Recognition: <strong className="capitalize">{imageAIResult.category?.replace(/_/g, ' ')}</strong></span>
                      {imageAIResult.college_related && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          Campus Relevant
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-blue-600/80">{imageAIResult.model}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Student Posting Options: Two Dropdown Options */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E8F5FF] via-white to-[#F0F8FF] border border-[#CFEAFF] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#075080] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#1687D4]" />
                  <span>Posting Option & Destination</span>
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                  postType === 'review'
                    ? 'bg-[#1687D4] text-white border-[#1687D4]'
                    : postType === 'feedback'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-[#075080] border-[#CFEAFF]'
                }`}>
                  {postType === 'review' ? '⭐ Option 2: Review' : postType === 'feedback' ? '💡 Option 3: Feedback' : '📢 Option 1: Public Stream'}
                </span>
              </div>

              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as 'stream' | 'review' | 'feedback')}
                className="w-full rounded-xl border border-[#CFEAFF] bg-white p-3 text-xs font-bold text-[#075080] shadow-xs focus:ring-2 focus:ring-[#1687D4]/30 focus:border-[#1687D4] focus:outline-none transition cursor-pointer"
              >
                <option value="stream">
                  Option 1: 📢 Publish in Public Campus Stream (Campus Social Feed)
                </option>
                <option value="review">
                  Option 2: ⭐ Institution Review &amp; Rating (Public Stream + Institution Review Section)
                </option>
                <option value="feedback">
                  Option 3: 💡 Campus Feedback &amp; Grievance (Dedicated Feedback Feed + Department Action)
                </option>
              </select>
            </div>

            {/* When Option 3 (Feedback) is selected: Show feedback controls */}
            {postType === 'feedback' && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs space-y-3.5">
                <div className="flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dedicated Feedback Guarantee:</strong> This item will be posted directly to the <strong>Dedicated Feedback Feed</strong> with rating indicators, visible to campus administrators and student peers.
                  </span>
                </div>

                {/* Rating Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Feedback Rating / Satisfaction Score
                    </label>
                    <span className="text-xs font-bold text-amber-700">
                      {feedbackRating} / 5 Stars
                      <span className="ml-1 text-[11px] text-amber-600 font-normal">
                        ({feedbackRating === 5 ? 'Exceptional' : feedbackRating === 4 ? 'Satisfactory' : feedbackRating === 3 ? 'Needs Improvement' : feedbackRating === 2 ? 'Urgent Attention' : 'Critical Issue'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Category */}
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Facility / Department Category
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'Hostel & Mess',
                      'Academics & Faculty',
                      'Infrastructure & Labs',
                      'Placements & Training',
                      'Campus Facilities',
                      'Administration',
                      'Transport & Parking'
                    ].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFeedbackCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          feedbackCategory === cat
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Facility / Unit */}
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Specific Location or Department (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Block D WiFi, 3rd Floor Lab Air Conditioning, South Mess"
                    value={feedbackTarget}
                    onChange={e => setFeedbackTarget(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* When Option 2 (Review) is selected: Show institution review controls */}
            {postType === 'review' && (
              <div className="p-4 rounded-2xl bg-[#E8F5FF]/90 border border-[#72B7EB] shadow-xs space-y-3.5">
                <div className="flex items-start gap-2 text-xs text-[#075080] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-[#1687D4] shrink-0 mt-0.5" />
                  <span>
                    <strong>Dual-Publish Guarantee:</strong> This evaluation will be posted to the <strong>Campus Social Stream</strong> &amp; <strong>Public Feed</strong>, and recorded directly in the review section of <strong>{activeColleges.find(c => c.id === postCollegeId)?.name || 'Selected Institution'}</strong>.
                  </span>
                </div>

                {/* Star Rating Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-[#075080] uppercase tracking-wider">
                      Overall Institution Rating
                    </label>
                    <span className="text-xs font-bold text-[#1687D4]">
                      {institutionReviewRating} / 5 Stars
                      <span className="ml-1 text-[11px] text-slate-500 font-normal">
                        ({institutionReviewRating === 5 ? 'Exceptional' : institutionReviewRating === 4 ? 'Very Good' : institutionReviewRating === 3 ? 'Average' : institutionReviewRating === 2 ? 'Below Average' : 'Poor'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#CFEAFF]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setInstitutionReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= institutionReviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Category Focus */}
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    Review Category Focus
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'Academics & Faculty',
                      'Placements & Training',
                      'Campus Infrastructure',
                      'Hostel & Amenities',
                      'Overall Student Life'
                    ].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setInstitutionReviewCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          institutionReviewCategory === cat
                            ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-2xs'
                            : 'bg-white text-[#075080] border-[#CFEAFF] hover:bg-[#E8F5FF]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Headline & Optional Pros/Cons */}
                <div>
                  <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Great academic culture and top tier placement preparation"
                    value={institutionReviewTitle}
                    onChange={e => setInstitutionReviewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">
                      Pros (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High placements, Modern labs"
                      value={institutionReviewPros}
                      onChange={e => setInstitutionReviewPros(e.target.value)}
                      className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
                      Cons (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Strict curfew, Average mess"
                      value={institutionReviewCons}
                      onChange={e => setInstitutionReviewCons(e.target.value)}
                      className="w-full p-2 rounded-xl border border-amber-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Verified Contributor Identity Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
              <div className="flex items-center gap-2 font-semibold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Posting as <strong>{currentUser?.fullName || 'Verified Student'}</strong></span>
              </div>
              <span className="text-[10px] font-medium text-blue-700 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200">
                Verified Identity
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="apple-button-primary w-full text-xs font-bold py-3"
          >
            {postType === 'review'
              ? 'Post to Stream & Institution Review Section'
              : postType === 'feedback'
              ? 'Submit Campus Feedback to Dedicated Feed'
              : 'Publish to Campus Social Stream'}
          </button>
        </form>
      ) : activeTab === 'review' ? (
        <form onSubmit={handleReviewSubmit} className="apple-card p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Structured College Review</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Multi-dimensional evaluation. Honest criticism is protected from institutional deletion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">Institution</label>
              <select
                value={reviewCollegeId}
                onChange={(e) => setReviewCollegeId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:outline-none"
              >
                {activeColleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">Course & Batch</label>
              <div className="mt-1.5 flex space-x-2">
                <input
                  type="text"
                  value={reviewCourse}
                  onChange={(e) => setReviewCourse(e.target.value)}
                  placeholder="Course (e.g. MCA)"
                  className="w-1/2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A]"
                />
                <input
                  type="text"
                  value={reviewBatch}
                  onChange={(e) => setReviewBatch(e.target.value)}
                  placeholder="Batch (2025)"
                  className="w-1/2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A]"
                />
              </div>
            </div>
          </div>

          {/* Dimension ratings */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Evaluation Dimensions (1 to 5 Stars)
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-[#0F172A] font-semibold">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <select
                    value={val}
                    onChange={(e) => setRatings({ ...ratings, [key]: Number(e.target.value) })}
                    className="rounded-lg bg-white border border-[#CBD5E1] px-2.5 py-1 text-xs text-[#D97706] font-bold"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} ★</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">Review Title</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent placement records, but hostel facilities need overhaul"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs sm:text-sm text-[#0F172A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">Detailed Experience</label>
            <textarea
              rows={3}
              value={reviewExperience}
              onChange={(e) => setReviewExperience(e.target.value)}
              placeholder="Provide realistic, honest insights on faculty teaching, syllabus, and campus life..."
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs sm:text-sm text-[#0F172A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#059669]">Pros (Comma separated)</label>
              <input
                type="text"
                value={reviewPros}
                onChange={(e) => setReviewPros(e.target.value)}
                placeholder="High placements, top faculty"
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D97706]">Cons (Comma separated)</label>
              <input
                type="text"
                value={reviewCons}
                onChange={(e) => setReviewCons(e.target.value)}
                placeholder="Strict attendance, mess food"
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A]"
              />
            </div>
          </div>

          {/* Verified Reviewer Identity Badge */}
          <div className="flex items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-blue-950 font-semibold">
                Publishing Review as <strong className="text-blue-900">{currentUser?.fullName || 'Verified Reviewer'}</strong>
              </p>
              <p className="text-[11px] text-blue-700/80 mt-0.5">
                Authentic reviews increase campus transparency. All content is analyzed by AI purification filters.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="apple-button-primary w-full text-xs font-bold py-3"
          >
            Submit Review
          </button>
        </form>
      ) : (
        /* DEDICATED CAMPUS FEEDBACK FORM */
        <form onSubmit={handleFeedbackSubmit} className="apple-card p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span>Submit Campus Feedback &amp; Grievance</span>
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Direct actionable feedback on facilities, hostels, labs, or administration. Published in the dedicated Campus Feedback Feed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Target College / Campus
            </label>
            <select
              value={feedbackCollegeId}
              onChange={(e) => setFeedbackCollegeId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none transition-colors"
            >
              {activeColleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Feedback Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'Hostel & Mess',
                'Academics & Faculty',
                'Infrastructure & Labs',
                'Placements & Training',
                'Campus Facilities',
                'Administration',
                'Transport & Parking'
              ].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFeedbackCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    feedbackCategory === cat
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:bg-amber-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Specific Facility / Unit / Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Block D WiFi, 3rd Floor Lab Air Conditioning, South Mess"
              value={feedbackTarget}
              onChange={e => setFeedbackTarget(e.target.value)}
              className="mt-1.5 w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Satisfaction / Status Rating
              </label>
              <span className="text-xs font-bold text-amber-600">
                {feedbackRating} / 5 Stars
                <span className="ml-1 text-[11px] text-slate-500 font-normal">
                  ({feedbackRating === 5 ? 'Exceptional' : feedbackRating === 4 ? 'Good' : feedbackRating === 3 ? 'Needs Improvement' : feedbackRating === 2 ? 'Poor' : 'Critical Issue'})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= feedbackRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Detailed Feedback &amp; Suggestions
            </label>
            <textarea
              rows={4}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Describe what is working well or what needs improvement in detail..."
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Media Attachment */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Supporting Photo or Video Evidence (Optional)
            </label>
            {postImageUrl ? (
              <div className="relative rounded-xl border border-[#E2E8F0] bg-slate-950 p-2 overflow-hidden">
                {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? (
                  <video src={postImageUrl} controls className="w-full max-h-64 object-contain rounded-lg bg-black" />
                ) : (
                  <img src={postImageUrl} alt="Feedback media" className="w-full max-h-64 object-cover rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-4 right-4 bg-[#0F172A]/90 hover:bg-black text-white rounded-full p-1.5 transition shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 cursor-pointer hover:border-[#2563EB] transition">
                <ImageIcon className="h-6 w-6 text-[#2563EB] mb-1" />
                <span className="text-xs font-bold text-[#0F172A]">Attach evidence photo or video clip</span>
                <span className="text-[10px] text-[#64748B]">PNG, JPG, MP4 under 50MB</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Verified Feedback Identity Badge */}
          <div className="flex items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-blue-950 font-semibold">
                Verified Student Feedback from <strong className="text-blue-900">{currentUser?.fullName || 'Student'}</strong>
              </p>
              <p className="text-[11px] text-blue-700/80 mt-0.5">
                Official grievance tracking connects directly with campus administration.
              </p>
            </div>
          </div>

          {postError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              {postError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="apple-button-primary w-full text-xs font-bold py-3 bg-amber-600 hover:bg-amber-700"
          >
            Submit Feedback to Dedicated Feed
          </button>
        </form>
      )}
    </div>
  );
}
