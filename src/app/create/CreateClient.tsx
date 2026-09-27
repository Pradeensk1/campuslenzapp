'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Star, Shield, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Sparkles, Image as ImageIcon, X, AlertTriangle, Video, Paperclip } from 'lucide-react';
import { isVideoMedia, formatFileSize, compressImageToDataUrl } from '@/lib/mediaUtils';

export default function CreateClient({
  initialColleges = [],
}: {
  initialColleges?: any[];
}) {
  const router = useRouter();
  const { colleges, currentUser, addPost, addReview, runOpenSourceAIModeration } = useApp();

  const [activeTab, setActiveTab] = useState<'post' | 'review'>('post');
  const [postError, setPostError] = useState<string | null>(null);
  const [isOptimizingMedia, setIsOptimizingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeColleges = colleges.length > 0 ? colleges : initialColleges;

  // Post form state
  const [postCollegeId, setPostCollegeId] = useState(activeColleges[0]?.id || '');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Campus Life');
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [postImageUrl, setPostImageUrl] = useState<string>('');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [mediaFileSize, setMediaFileSize] = useState<number>(0);
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | null>(null);

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
  const [reviewCollegeId, setReviewCollegeId] = useState(colleges[0]?.id || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewExperience, setReviewExperience] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');
  const [reviewAdvice, setReviewAdvice] = useState('');
  const [reviewCourse, setReviewCourse] = useState('MCA');
  const [reviewBatch, setReviewBatch] = useState('2025');
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
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

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    if (isOptimizingMedia) {
      setPostError('Media is still processing. Please wait a moment...');
      return;
    }

    setIsSubmitting(true);
    setPostError(null);
    const chosenCollege = colleges.find(c => c.id === postCollegeId);

    const res = addPost({
      authorId: currentUser?.id || 'guest',
      authorUsername: currentUser?.username || 'student_guest',
      authorName: currentUser?.fullName || (currentUser as any)?.name || 'Student',
      authorRole: currentUser?.role || 'student',
      authorHeadline: currentUser?.headline || 'Student Contributor',
      isVerifiedAuthor: Boolean(currentUser?.isVerified),
      isAnonymous: postAnonymous,
      collegeId: postCollegeId,
      collegeName: chosenCollege?.name,
      content: postContent,
      topic: postTopic,
      imageUrl: postImageUrl || undefined
    });

    setIsSubmitting(false);

    if (!res.success) {
      setPostError(res.message || 'Submission rejected by moderation policy.');
      return;
    }

    router.push('/');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewExperience.trim()) return;

    addReview({
      collegeId: reviewCollegeId,
      userId: currentUser?.id || 'guest',
      reviewerType: currentUser?.role === 'alumni' ? 'alumni' : 'student',
      authorName: currentUser?.fullName || 'Contributor',
      isAnonymous: reviewAnonymous,
      overallRating: ratingOverall,
      dimensions: ratings,
      title: reviewTitle,
      experience: reviewExperience,
      pros: reviewPros ? reviewPros.split(',').map(s => s.trim()) : [],
      cons: reviewCons ? reviewCons.split(',').map(s => s.trim()) : [],
      advice: reviewAdvice,
      recommendation: ratingOverall >= 3,
      course: reviewCourse,
      department: 'Computer Applications',
      batch: reviewBatch
    });

    const chosen = colleges.find(c => c.id === reviewCollegeId);
    router.push(`/colleges/${chosen?.slug || 'explore'}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Segmented Control */}
      <div className="flex rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-1.5 text-xs shadow-xs">
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 ${
            activeTab === 'post'
              ? 'bg-white text-[#0F172A] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Share Campus Post
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 ${
            activeTab === 'review'
              ? 'bg-white text-[#0F172A] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Write Structured Review
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
              {colleges.map((c) => (
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

          {/* Anonymous toggle */}
          <div className="flex items-center space-x-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
            <input
              type="checkbox"
              id="anonPost"
              checked={postAnonymous}
              onChange={(e) => setPostAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-[#2563EB] cursor-pointer"
            />
            <label htmlFor="anonPost" className="text-[#64748B] cursor-pointer font-medium">
              Post as <strong className="text-[#0F172A]">Anonymous Student</strong> (Your identity remains strictly protected publicly while audit accountability is preserved)
            </label>
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
          {postContent.trim().length > 3 && (() => {
            const ai = runOpenSourceAIModeration(postContent, postImageUrl);
            const isSevere = ai.toxicity.score >= 80;
            const isSens = ai.isSensitive;
            return (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Open-Source AI Pre-Flight Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    distilbert-sst2 • toxic-bert • nsfwjs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
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

                  {/* Image Safety */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Visual Classifier
                    </span>
                    <div className="font-bold text-slate-800 capitalize">
                      {postImageUrl ? (ai.imageSafety?.status || 'safe') : 'No Media Attached'}
                    </div>
                  </div>
                </div>

                {isSevere ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>⚠️ Policy Alert: Severe toxicity will trigger an automatic 48h account suspension and audit log.</span>
                  </div>
                ) : isSens ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Sensitivity Notice: Post will be masked behind the frosted AI content shield on the feed.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✨ Content Approved: Verified clean for campus-wide distribution.</span>
                  </div>
                )}
              </div>
            );
          })()}

          <button
            type="submit"
            className="apple-button-primary w-full text-xs font-bold py-3"
          >
            Publish to Campus Feed
          </button>
        </form>
      ) : (
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
                {colleges.map((c) => (
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

          {/* Anonymous toggle */}
          <div className="flex items-center space-x-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
            <input
              type="checkbox"
              id="anonRev"
              checked={reviewAnonymous}
              onChange={(e) => setReviewAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-[#2563EB] cursor-pointer"
            />
            <label htmlFor="anonRev" className="text-[#64748B] cursor-pointer font-medium">
              Publish as <strong className="text-[#0F172A]">Anonymous Contributor</strong>
            </label>
          </div>

          <button
            type="submit"
            className="apple-button-primary w-full text-xs font-bold py-3"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}
