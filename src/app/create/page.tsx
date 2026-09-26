'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Star, Shield, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Sparkles } from 'lucide-react';

export default function CreateContentPage() {
  const router = useRouter();
  const { colleges, currentUser, addPost, addReview } = useApp();

  const [activeTab, setActiveTab] = useState<'post' | 'review'>('post');

  // Post form state
  const [postCollegeId, setPostCollegeId] = useState(colleges[0]?.id || '');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Campus Life');
  const [postAnonymous, setPostAnonymous] = useState(false);

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

    const chosenCollege = colleges.find(c => c.id === postCollegeId);

    addPost({
      authorId: currentUser?.id || 'guest',
      authorUsername: currentUser?.username || 'student_guest',
      authorName: currentUser?.fullName || 'Student',
      authorRole: currentUser?.role || 'student',
      authorHeadline: currentUser?.headline || 'Student Contributor',
      isVerifiedAuthor: Boolean(currentUser?.isVerified),
      isAnonymous: postAnonymous,
      collegeId: postCollegeId,
      collegeName: chosenCollege?.name,
      content: postContent,
      topic: postTopic
    });

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
