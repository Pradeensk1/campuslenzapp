'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Star, Shield, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

export default function CreateContentPage() {
  const router = useRouter();
  const { colleges, currentUser, addPost, addReview } = useApp();

  const [activeTab, setActiveTab] = useState<'post' | 'review'>('post');

  // Post form state
  const [postCollegeId, setPostCollegeId] = useState(colleges[0]?.id || '');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Campus Life');
  const [postAnonymous, setPostAnonymous] = useState(false);

  // Review form state (Strict Multi-dimensional spec)
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
      authorName: currentUser?.fullName || 'Student',
      authorRole: currentUser?.role || 'student',
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
      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-[#1E3A5F] bg-[#112238] p-1.5 text-xs">
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 rounded-lg py-2 font-bold transition ${
            activeTab === 'post'
              ? 'bg-[#38E6A5] text-[#07111F]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Share Campus Post
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 rounded-lg py-2 font-bold transition ${
            activeTab === 'review'
              ? 'bg-[#38E6A5] text-[#07111F]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Write Structured Review
        </button>
      </div>

      {activeTab === 'post' ? (
        /* Post Creation Form */
        <form onSubmit={handlePostSubmit} className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6 space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC]">Create a Campus Community Post</h2>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]">Select College Association</label>
            <select
              value={postCollegeId}
              onChange={(e) => setPostCollegeId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-xs text-[#F8FAFC] focus:border-[#38E6A5] focus:outline-none"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]">Discussion Topic</label>
            <select
              value={postTopic}
              onChange={(e) => setPostTopic(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-xs text-[#F8FAFC] focus:border-[#38E6A5] focus:outline-none"
            >
              <option value="Campus Life">Campus Life & Hostels</option>
              <option value="Placements & Prep">Placements & Company Drives</option>
              <option value="Alumni Mentorship">Alumni Mentorship & Advice</option>
              <option value="Admissions & Cutoffs">Admissions & Counseling</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]">Your Post</label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What would you like to discuss with seniors, alumni, or fellow peers?"
              className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#38E6A5] focus:outline-none"
              required
            />
          </div>

          {/* Anonymous toggle (Spec requirement) */}
          <div className="flex items-center space-x-2 rounded-lg bg-[#162D4A] p-3 text-xs">
            <input
              type="checkbox"
              id="anonPost"
              checked={postAnonymous}
              onChange={(e) => setPostAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-[#38E6A5]"
            />
            <label htmlFor="anonPost" className="text-[#94A3B8]">
              Post as <strong className="text-[#F8FAFC]">Anonymous Student</strong> (Your identity remains strictly protected publicly while audit accountability is preserved)
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#38E6A5] py-2.5 text-xs font-bold text-[#07111F] hover:bg-[#70F3C1]"
          >
            Publish Post
          </button>
        </form>
      ) : (
        /* Structured Review Form */
        <form onSubmit={handleReviewSubmit} className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6 space-y-4">
          <div className="border-b border-[#1E3A5F] pb-3">
            <h2 className="text-base font-bold text-[#F8FAFC]">Write Structured College Evaluation</h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Your experience helps prospective students. Real criticism is protected.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8]">Institution</label>
              <select
                value={reviewCollegeId}
                onChange={(e) => setReviewCollegeId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2 text-xs text-[#F8FAFC] focus:outline-none"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8]">Course & Batch</label>
              <div className="mt-1.5 flex space-x-2">
                <input
                  type="text"
                  value={reviewCourse}
                  onChange={(e) => setReviewCourse(e.target.value)}
                  placeholder="Course (e.g. MCA)"
                  className="w-1/2 rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2 text-xs text-[#F8FAFC]"
                />
                <input
                  type="text"
                  value={reviewBatch}
                  onChange={(e) => setReviewBatch(e.target.value)}
                  placeholder="Batch (2025)"
                  className="w-1/2 rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2 text-xs text-[#F8FAFC]"
                />
              </div>
            </div>
          </div>

          {/* Dimension Ratings */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Evaluation Dimensions (1 to 5 Stars)</label>
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#162D4A] p-3 rounded-lg">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-[#F8FAFC]">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <select
                    value={val}
                    onChange={(e) => setRatings({ ...ratings, [key]: Number(e.target.value) })}
                    className="rounded bg-[#07111F] px-2 py-0.5 text-xs text-[#FBBF24] font-bold"
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
            <label className="block text-xs font-semibold text-[#94A3B8]">Review Headline</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent placement records, but hostel facilities need overhaul"
              className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-xs text-[#F8FAFC]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]">Detailed Experience</label>
            <textarea
              rows={3}
              value={reviewExperience}
              onChange={(e) => setReviewExperience(e.target.value)}
              placeholder="Provide realistic, honest insights on faculty teaching, syllabus, and campus life..."
              className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-xs text-[#F8FAFC]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#38E6A5]">Pros (Comma separated)</label>
              <input
                type="text"
                value={reviewPros}
                onChange={(e) => setReviewPros(e.target.value)}
                placeholder="High placements, top faculty"
                className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2 text-xs text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#FBBF24]">Cons (Comma separated)</label>
              <input
                type="text"
                value={reviewCons}
                onChange={(e) => setReviewCons(e.target.value)}
                placeholder="Strict attendance, mess food"
                className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2 text-xs text-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Anonymous reviewer toggle */}
          <div className="flex items-center space-x-2 rounded-lg bg-[#162D4A] p-3 text-xs">
            <input
              type="checkbox"
              id="anonRev"
              checked={reviewAnonymous}
              onChange={(e) => setReviewAnonymous(e.target.checked)}
              className="h-4 w-4 rounded accent-[#38E6A5]"
            />
            <label htmlFor="anonRev" className="text-[#94A3B8]">
              Display as <strong className="text-[#F8FAFC]">Anonymous Contributor</strong>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#38E6A5] py-2.5 text-xs font-bold text-[#07111F] hover:bg-[#70F3C1]"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}
