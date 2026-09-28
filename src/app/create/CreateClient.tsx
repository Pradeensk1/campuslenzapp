'use client';

import { useState, useDeferredValue } from 'react';
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
  const deferredPostContent = useDeferredValue(postContent);
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
      <div className="ocean-glass-card rounded-full p-1.5 flex text-xs shadow-md border border-white/80">
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 rounded-full py-2.5 font-bold transition-all duration-300 ${
            activeTab === 'post'
              ? 'ocean-glossy-button text-white shadow-sm'
              : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/40'
          }`}
        >
          Share Campus Post
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 rounded-full py-2.5 font-bold transition-all duration-300 ${
            activeTab === 'review'
              ? 'ocean-glossy-button text-white shadow-sm'
              : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/40'
          }`}
        >
          Write Structured Review
        </button>
      </div>

      {activeTab === 'post' ? (
        <form onSubmit={handlePostSubmit} className="ocean-glass-card touch-over-glass p-6 sm:p-8 space-y-5 rounded-[28px] border border-white/80 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-sky-950 tracking-tight">Create a Community Post</h2>
            <p className="mt-1 text-xs text-sky-800/80">
              Connect with students and alumni across campuses on placements, hostel realities, and academics.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">
              College Association
            </label>
            <select
              value={postCollegeId}
              onChange={(e) => setPostCollegeId(e.target.value)}
              className="mt-1.5 w-full ocean-glass-input rounded-2xl p-3 text-xs text-sky-950 font-semibold focus:outline-none transition-colors"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">
              Discussion Topic
            </label>
            <select
              value={postTopic}
              onChange={(e) => setPostTopic(e.target.value)}
              className="mt-1.5 w-full ocean-glass-input rounded-2xl p-3 text-xs text-sky-950 font-semibold focus:outline-none transition-colors"
            >
              <option value="Campus Life">Campus Life & Hostels</option>
              <option value="Placements & Prep">Placements & Company Drives</option>
              <option value="Alumni Mentorship">Alumni Mentorship & Advice</option>
              <option value="Admissions & Cutoffs">Admissions & Counseling</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">
              Your Message
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What questions or experiences would you like to share?"
              className="mt-1.5 w-full ocean-glass-input rounded-2xl p-3.5 text-xs sm:text-sm text-sky-950 placeholder-sky-800/40 focus:outline-none transition-colors font-medium"
              required
            />
          </div>

          {/* High-Resolution Photo or Video Attachment Support */}
          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider mb-1.5">
              Attach Photo or Video Media (Lossless Quality)
            </label>
            
            {postImageUrl ? (
              <div className="relative rounded-2xl border border-sky-200/80 bg-slate-950/90 p-2 overflow-hidden shadow-inner">
                {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? (
                  <video
                    src={postImageUrl}
                    controls
                    className="w-full max-h-72 object-contain rounded-xl bg-black"
                  />
                ) : (
                  <img
                    src={postImageUrl}
                    alt="Post media attachment"
                    className="w-full max-h-72 object-cover rounded-xl"
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-4 right-4 bg-sky-950/90 hover:bg-black text-white rounded-full p-2 transition shadow-lg"
                  title="Remove media"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 text-[11px] text-sky-200 px-1 flex items-center justify-between font-medium">
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
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300/80 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-400 p-6 cursor-pointer transition-all group">
                <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                  <div className="h-11 w-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-sky-950">
                    Click to upload or drag & drop photo or video
                  </p>
                  <p className="text-[10px] text-sky-700/80 font-medium">
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
          <div className="flex items-center space-x-3 rounded-2xl border border-sky-200/70 bg-sky-50/60 p-4 text-xs">
            <input
              type="checkbox"
              id="anonPost"
              checked={postAnonymous}
              onChange={(e) => setPostAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
            />
            <label htmlFor="anonPost" className="text-sky-800/90 cursor-pointer font-medium">
              Post as <strong className="text-sky-950">Anonymous Student</strong> (Your identity remains strictly protected publicly while audit accountability is preserved)
            </label>
          </div>

          {/* Post Submission Error Alert */}
          {postError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Submission Blocked by Moderation Policy
              </div>
              <p className="text-rose-700 leading-relaxed font-medium">{postError}</p>
            </div>
          )}

          {/* Open-Source AI Safety Pre-Flight Scanner Box */}
          {deferredPostContent.trim().length > 3 && (() => {
            const ai = runOpenSourceAIModeration(deferredPostContent, postImageUrl);
            const isSevere = ai.toxicity.score >= 80;
            const isSens = ai.isSensitive;
            return (
              <div className="rounded-2xl border border-sky-200/80 bg-sky-100/60 backdrop-blur-xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-sky-950">
                      Campus Lenz AI Pre-Flight Telemetry & Post Analyzer
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-600/70 font-semibold">
                    campus-lenz-ai • toxic-bert • distilbert-sst2
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Category Classifier */}
                  <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white/90 shadow-xs space-y-1">
                    <span className="text-[10px] text-sky-700/70 uppercase font-bold tracking-wider">
                      Topic Classification
                    </span>
                    <div className="font-bold text-sky-700 flex items-center gap-1 truncate">
                      <span className="truncate">{ai.classification?.category || 'General'}</span>
                      <span className="text-[10px] text-sky-600/70">({Math.round((ai.classification?.confidence || 0.8) * 100)}%)</span>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white/90 shadow-xs space-y-1">
                    <span className="text-[10px] text-sky-700/70 uppercase font-bold tracking-wider">
                      Sentiment Analysis
                    </span>
                    <div className="font-bold text-sky-950 capitalize flex items-center gap-1">
                      <span>{ai.sentiment.label}</span>
                      <span className="text-[10px] text-sky-600/70">({Math.round(ai.sentiment.score * 100)}%)</span>
                    </div>
                  </div>

                  {/* Toxicity */}
                  <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white/90 shadow-xs space-y-1">
                    <span className="text-[10px] text-sky-700/70 uppercase font-bold tracking-wider">
                      Toxicity Rating
                    </span>
                    <div className={`font-bold flex items-center gap-1 ${
                      isSevere ? 'text-rose-600' : isSens ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      <span>{ai.toxicity.score}%</span>
                      <span className="text-[10px] font-normal text-sky-700/70 capitalize">({ai.toxicity.severity})</span>
                    </div>
                  </div>

                  {/* Moderation Recommendation */}
                  <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white/90 shadow-xs space-y-1">
                    <span className="text-[10px] text-sky-700/70 uppercase font-bold tracking-wider">
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
                  <div className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>🚨 Policy Alert: Potentially harmful content or severe toxicity ({ai.toxicity.score}%). Submission will be rejected with account suspension.</span>
                  </div>
                ) : isSens ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Sensitivity Notice: Legitimate student discussion flagged as sensitive. Will be published under the AI frosted shield.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✨ Content Approved: Verified clean for campus-wide distribution in {ai.classification?.category || 'General'}.</span>
                  </div>
                )}
              </div>
            );
          })()}

          <button
            type="submit"
            className="ocean-glossy-button w-full text-xs font-bold py-3.5 rounded-2xl text-white shadow-lg shadow-sky-500/25"
          >
            Publish to Campus Feed
          </button>
        </form>
      ) : (
        <form onSubmit={handleReviewSubmit} className="ocean-glass-card touch-over-glass p-6 sm:p-8 space-y-5 rounded-[28px] border border-white/80 shadow-xl">
          <div className="border-b border-sky-100 pb-4">
            <h2 className="text-xl font-black text-sky-950 tracking-tight">Structured College Review</h2>
            <p className="mt-1 text-xs text-sky-800/80">
              Multi-dimensional evaluation. Honest criticism is protected from institutional deletion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">Institution</label>
              <select
                value={reviewCollegeId}
                onChange={(e) => setReviewCollegeId(e.target.value)}
                className="mt-1.5 w-full ocean-glass-input rounded-2xl p-2.5 text-xs text-sky-950 font-semibold focus:outline-none"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">Course & Batch</label>
              <div className="mt-1.5 flex space-x-2">
                <input
                  type="text"
                  value={reviewCourse}
                  onChange={(e) => setReviewCourse(e.target.value)}
                  placeholder="Course (e.g. MCA)"
                  className="w-1/2 ocean-glass-input rounded-2xl p-2.5 text-xs text-sky-950 font-medium"
                />
                <input
                  type="text"
                  value={reviewBatch}
                  onChange={(e) => setReviewBatch(e.target.value)}
                  placeholder="Batch (2025)"
                  className="w-1/2 ocean-glass-input rounded-2xl p-2.5 text-xs text-sky-950 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Dimension ratings */}
          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider mb-2">
              Evaluation Dimensions (1 to 5 Stars)
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs bg-sky-50/60 p-4 rounded-2xl border border-sky-200/70">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-sky-950 font-bold">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <select
                    value={val}
                    onChange={(e) => setRatings({ ...ratings, [key]: Number(e.target.value) })}
                    className="rounded-xl bg-white border border-sky-200 px-2.5 py-1 text-xs text-amber-600 font-bold shadow-xs"
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
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">Review Title</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent placement records, but hostel facilities need overhaul"
              className="mt-1.5 w-full ocean-glass-input rounded-2xl p-3 text-xs sm:text-sm text-sky-950 font-medium placeholder-sky-800/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-900/80 uppercase tracking-wider">Detailed Experience</label>
            <textarea
              rows={3}
              value={reviewExperience}
              onChange={(e) => setReviewExperience(e.target.value)}
              placeholder="Provide realistic, honest insights on faculty teaching, syllabus, and campus life..."
              className="mt-1.5 w-full ocean-glass-input rounded-2xl p-3 text-xs sm:text-sm text-sky-950 font-medium placeholder-sky-800/40"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-emerald-700">Pros (Comma separated)</label>
              <input
                type="text"
                value={reviewPros}
                onChange={(e) => setReviewPros(e.target.value)}
                placeholder="High placements, top faculty"
                className="mt-1.5 w-full ocean-glass-input rounded-2xl p-2.5 text-xs text-sky-950 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-700">Cons (Comma separated)</label>
              <input
                type="text"
                value={reviewCons}
                onChange={(e) => setReviewCons(e.target.value)}
                placeholder="Strict attendance, mess food"
                className="mt-1.5 w-full ocean-glass-input rounded-2xl p-2.5 text-xs text-sky-950 font-medium"
              />
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center space-x-3 rounded-2xl border border-sky-200/70 bg-sky-50/60 p-4 text-xs">
            <input
              type="checkbox"
              id="anonRev"
              checked={reviewAnonymous}
              onChange={(e) => setReviewAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
            />
            <label htmlFor="anonRev" className="text-sky-800/90 cursor-pointer font-medium">
              Publish as <strong className="text-sky-950">Anonymous Contributor</strong>
            </label>
          </div>

          <button
            type="submit"
            className="ocean-glossy-button w-full text-xs font-bold py-3.5 rounded-2xl text-white shadow-lg shadow-sky-500/25"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}
