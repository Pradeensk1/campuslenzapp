'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import {
  Briefcase,
  Users,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Send,
  Lock,
  ThumbsUp,
  Bookmark,
  Share2,
  Repeat,
  Calendar,
  Plus,
  Radio,
  FileText,
  Check,
  Search,
  Building2,
  ExternalLink
} from 'lucide-react';

export default function AlumniHomeView() {
  const {
    currentUser,
    posts,
    allUsers,
    addPost,
    toggleLikePost,
    toggleSavePost,
    checkAlumniPostEligibility,
    mentorshipSlots,
    bookMentorshipSlot,
    cancelMentorshipBooking,
    alumniJobReferrals,
    addAlumniJobReferral,
    referralRequests,
    requestJobReferral,
    industryAmaEvents,
    upvoteAmaQuestion,
    submitAmaQuestion
  } = useApp();

  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Career Mentorship');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [alumniTab, setAlumniTab] = useState<'overview' | 'scheduler' | 'referrals' | 'ama'>('overview');

  // Scheduler & Booking state
  const [bookingNotes, setBookingNotes] = useState('');

  // Referral creation state
  const [isPostingReferral, setIsPostingReferral] = useState(false);
  const [refCompany, setRefCompany] = useState('Microsoft');
  const [refRole, setRefRole] = useState('');
  const [refType, setRefType] = useState<'Full-Time' | 'Internship'>('Full-Time');
  const [refLocation, setRefLocation] = useState('Bengaluru / Hybrid');
  const [refMinGpa, setRefMinGpa] = useState<number>(8.0);
  const [refBatch, setRefBatch] = useState('2025 - 2026');
  const [refDesc, setRefDesc] = useState('');

  // Referral request form state
  const [requestingRefId, setRequestingRefId] = useState<string | null>(null);
  const [reqGpa, setReqGpa] = useState<number>(8.5);
  const [reqResume, setReqResume] = useState('');
  const [reqNote, setReqNote] = useState('');

  // AMA question input
  const [amaQuestionInput, setAmaQuestionInput] = useState('');

  if (!currentUser) return null;

  const followersCount = currentUser.followersCount || 0;
  const weeklyCount = currentUser.weeklyPostCount || 0;
  const isEligibleToPost = followersCount >= 5 && weeklyCount < 5 && !currentUser.isBanned;

  // Potential student mentees from database
  const studentMentees = allUsers.filter(u => u.role === 'student').slice(0, 5);

  const handleAlumniPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const res = addPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorRole: 'alumni',
      authorHeadline: currentUser.headline || 'Alumni Industry Mentor',
      isVerifiedAuthor: currentUser.isVerified,
      collegeId: currentUser.collegeId,
      collegeName: currentUser.collegeName,
      content: postContent.trim(),
      topic: postTopic,
      imageUrl: postImageUrl.trim() || undefined,
      isAnonymous: false
    });

    if (res.success) {
      setPostContent('');
      setPostImageUrl('');
      setActionFeedback('🎉 Career insight published to campus network!');
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback(res.message || 'Could not publish post');
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Alumni Mentorship HQ */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Alumni Mentorship HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Your dedicated workspace for 1-on-1 student career guidance, campus tech talks, and professional networking. Public group channels are silenced to maintain focus on direct student mentorship.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Student Mentorship DMs</span>
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white text-xs font-semibold border border-white/20 transition"
            >
              <span>View Mentor Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <Briefcase className="w-64 h-64 text-white" />
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Segmented Apple-Style Alumni Navigation Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setAlumniTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              alumniTab === 'overview'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Mentorship & Feed</span>
          </button>
          <button
            onClick={() => setAlumniTab('scheduler')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              alumniTab === 'scheduler'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1-on-1 Interview Scheduler ({mentorshipSlots.length})</span>
          </button>
          <button
            onClick={() => setAlumniTab('referrals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              alumniTab === 'referrals'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Referral Board ({alumniJobReferrals.length})</span>
          </button>
          <button
            onClick={() => setAlumniTab('ama')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              alumniTab === 'ama'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Industry AMA Stages ({industryAmaEvents.length})</span>
          </button>
        </div>
      </div>

      {alumniTab === 'overview' && (
        <>
          {/* Posting Eligibility & Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Follower Threshold */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Follower Requirement</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{followersCount}</span>
            <span className="text-xs text-slate-400">/ 5 required</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                followersCount >= 5 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (followersCount / 5) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {followersCount >= 5 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Follower goal met (Eligible to post)
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                Need {5 - followersCount} more followers from students to unlock public posting
              </span>
            )}
          </p>
        </div>

        {/* Metric 2: Weekly Post Quota */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Weekly Post Limit</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{weeklyCount}</span>
            <span className="text-xs text-slate-400">/ 5 posts used this week</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyCount / 5) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {5 - weeklyCount > 0 ? (
              <span>{5 - weeklyCount} posts remaining for the current rolling week</span>
            ) : (
              <span className="text-rose-600 font-bold">Weekly post limit reached (Resets next cycle)</span>
            )}
          </p>
        </div>

        {/* Metric 3: Anti-Vulgarity Shield */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Content Shield</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anti-Ragebait Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automated linguistic scanner ensures constructive campus discussions. Toxic or vulgar language triggers an immediate 24h cooldown.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Post Composer / Feed vs Mentorship Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Career Post Composer & Stream */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Composer Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName[0] || 'A'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Share Career & Industry Insights</h3>
                  <p className="text-[11px] text-slate-400">Published to verified campus student stream</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Alumni Voice
              </span>
            </div>

            {!isEligibleToPost && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Public Posting Locked</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {followersCount < 5
                    ? `You currently have ${followersCount} followers. You must have at least 5 followers before you can publish updates to the campus stream.`
                    : 'You have reached your 5 posts/week limit. Please wait until your quota refreshes.'}
                </p>
              </div>
            )}

            <form onSubmit={handleAlumniPostSubmit} className="space-y-3">
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                disabled={!isEligibleToPost}
                rows={3}
                placeholder={
                  isEligibleToPost
                    ? "Share interview tips, referral opportunities, or industry advice for students..."
                    : "Connect with students 1-on-1 via Direct Messages to reach the 5-follower goal and unlock posting..."
                }
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={postTopic}
                    onChange={e => setPostTopic(e.target.value)}
                    disabled={!isEligibleToPost}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 focus:outline-none disabled:opacity-60"
                  >
                    <option value="Career Mentorship">💼 Career Mentorship</option>
                    <option value="Industry Trends">🚀 Industry Trends</option>
                    <option value="Interview Prep">🎯 Interview Prep</option>
                    <option value="Tech Stack Advice">💻 Tech Stack Advice</option>
                    <option value="Alumni Achievement">🌟 Alumni Achievement</option>
                  </select>

                  <input
                    type="url"
                    value={postImageUrl}
                    onChange={e => setPostImageUrl(e.target.value)}
                    disabled={!isEligibleToPost}
                    placeholder="Image URL (optional)..."
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 max-w-[160px] truncate"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isEligibleToPost || !postContent.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Insight</span>
                </button>
              </div>
            </form>
          </div>

          {/* Campus Feed Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Campus Career & Discussion Stream</span>
            </h3>

            {posts.slice(0, 5).map(post => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{post.authorName}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                          {post.authorRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{post.collegeName || 'Campus Lenz'}</p>
                    </div>
                  </div>
                  {post.topic && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      #{post.topic}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50">
                    <img src={post.imageUrl} alt="attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className="flex items-center gap-1 hover:text-blue-600 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likesCount}</span>
                    </button>
                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className="flex items-center gap-1 hover:text-amber-600 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {post.commentsCount} comments
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Direct Student Mentorship Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Student Mentorship Queue</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                1-on-1 Chats
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Connect directly with students seeking career guidance, resume feedback, and placement advice.
            </p>

            <div className="space-y-2.5">
              {studentMentees.map(student => (
                <div key={student.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {student.fullName[0]}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/user/${student.username}`} className="text-xs font-bold text-slate-900 hover:text-blue-600 transition truncate block">
                        {student.fullName}
                      </Link>
                      <p className="text-[10px] text-slate-400 truncate">
                        {student.department || 'B.Tech CSE'} • {student.collegeName}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/messages?user=${student.username}`}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition shrink-0"
                    title="Send Mentorship Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <Link
              href="/messages"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition text-center block shadow-xs"
            >
              Open Direct Messages Inbox →
            </Link>
          </div>

          {/* Mentorship Guidelines Card */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 space-y-2 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Mentorship Best Practices</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-emerald-800 list-disc list-inside leading-relaxed">
              <li>Offer actionable resume and portfolio critiques.</li>
              <li>Share realistic expectations about tech interviews and salaries.</li>
              <li>Maintain a safe, welcoming, and encouraging dialogue.</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 1-ON-1 INTERVIEW & RESUME SCHEDULER                                 */}
      {/* ========================================================================= */}
      {alumniTab === 'scheduler' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">1-on-1 Mentorship & Mock Interview Booking</h2>
              <p className="text-xs text-slate-500">Reserved 30-45m calendar slots for direct technical mock interviews and resume teardowns.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ⚡ Verified Microsoft Alumni Slots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mentorshipSlots.map(slot => (
              <div
                key={slot.id}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                  slot.isBooked
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-emerald-200/80 shadow-xs ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {slot.topic.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.isBooked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {slot.isBooked ? '● Confirmed Slot' : '○ Available Slot'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {slot.topic === 'resume_review' ? '📄 In-Depth Resume & ATS Teardown' :
                     slot.topic === 'mock_interview' ? '💻 Coding & System Design Mock' :
                     slot.topic === 'system_design' ? '🏗️ High-Scale Architecture Session' :
                     '🚀 Career Roadmap & FAANG Prep'}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div>📅 Date: <span className="font-semibold text-slate-700">{slot.dateString}</span></div>
                    <div>🕒 Time: <span className="font-semibold text-slate-700">{slot.timeString}</span></div>
                    <div>🏢 Mentor: <span className="font-semibold text-slate-700">{slot.alumniName} ({slot.alumniCompany})</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  {slot.isBooked ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
                        Booked by: <span className="font-bold">{slot.bookedByStudentName}</span>
                        {slot.notes && <div className="text-[10px] text-amber-700 mt-0.5 italic">"{slot.notes}"</div>}
                      </div>
                      <button
                        onClick={() => {
                          const res = cancelMentorshipBooking(slot.id);
                          setActionFeedback(res.message);
                          setTimeout(() => setActionFeedback(null), 3000);
                        }}
                        className="w-full py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Optional note / topic focus..."
                        value={bookingNotes}
                        onChange={e => setBookingNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                      />
                      <button
                        onClick={() => {
                          const res = bookMentorshipSlot(slot.id, bookingNotes);
                          setActionFeedback(res.message);
                          setBookingNotes('');
                          setTimeout(() => setActionFeedback(null), 3000);
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Reserve Mentorship Slot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VERIFIED ALUMNI REFERRAL JOB BOARD                                  */}
      {/* ========================================================================= */}
      {alumniTab === 'referrals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verified Alumni Referral Board</h2>
              <p className="text-xs text-slate-500">Fast-track direct internal employee referrals for top tier-1 tech openings.</p>
            </div>
            <button
              onClick={() => setIsPostingReferral(!isPostingReferral)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Role Referral</span>
            </button>
          </div>

          {/* Post Referral Drawer */}
          <AnimatePresence>
            {isPostingReferral && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (!refRole.trim()) return;
                  const res = addAlumniJobReferral({
                    alumniId: currentUser.id,
                    alumniName: currentUser.fullName,
                    company: refCompany,
                    roleTitle: refRole.trim(),
                    jobType: refType,
                    location: refLocation,
                    minGpa: refMinGpa,
                    batchEligible: refBatch,
                    description: refDesc.trim() || 'Internal referral opening for qualified campus students.'
                  });
                  setActionFeedback(res.message);
                  setRefRole('');
                  setRefDesc('');
                  setIsPostingReferral(false);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900">Post Role Referral at your Company</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Company</label>
                    <input
                      type="text"
                      value={refCompany}
                      onChange={e => setRefCompany(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer (Backend)"
                      value={refRole}
                      onChange={e => setRefRole(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Job Type</label>
                    <select
                      value={refType}
                      onChange={e => setRefType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Location</label>
                    <input
                      type="text"
                      value={refLocation}
                      onChange={e => setRefLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Min GPA Cutoff</label>
                    <input
                      type="number"
                      step="0.1"
                      value={refMinGpa}
                      onChange={e => setRefMinGpa(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Eligible Batches</label>
                    <input
                      type="text"
                      value={refBatch}
                      onChange={e => setRefBatch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Role Requirements & Tech Stack</label>
                  <textarea
                    rows={2}
                    placeholder="Key skills, programming languages, and interview expectations..."
                    value={refDesc}
                    onChange={e => setRefDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostingReferral(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    Publish Opening
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Referrals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alumniJobReferrals.map(job => (
              <div
                key={job.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {job.company}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3]">
                      {job.jobType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{job.roleTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">📍 {job.location}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">🎓 Min GPA: {job.minGpa || 8.0}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">Batch: {job.batchEligible}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Referred by <span className="font-semibold text-slate-700">{job.alumniName}</span>
                  </span>

                  <button
                    onClick={() => setRequestingRefId(requestingRefId === job.id ? null : job.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                  >
                    Request Referral
                  </button>
                </div>

                {/* Request Referral Inline Modal */}
                {requestingRefId === job.id && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-900">Submit Application to {job.alumniName}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Your Cumulative GPA"
                        value={reqGpa}
                        onChange={e => setReqGpa(Number(e.target.value))}
                        className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Resume Link (Google Drive / GitHub)"
                        value={reqResume}
                        onChange={e => setReqResume(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                        required
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Brief note on your key projects and why you're a good fit..."
                      value={reqNote}
                      onChange={e => setReqNote(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestingRefId(null)}
                        className="px-3 py-1 text-xs text-slate-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = requestJobReferral(job.id, reqGpa, reqResume || 'https://campuslenz.edu/resume.pdf', reqNote || 'Strong candidate application.');
                          setActionFeedback(res.message);
                          setRequestingRefId(null);
                          setTimeout(() => setActionFeedback(null), 3000);
                        }}
                        className="px-4 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        Submit Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Incoming Referral Requests Log */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidate Applications Received ({referralRequests.length})
            </h3>
            <div className="space-y-2">
              {referralRequests.map(req => (
                <div key={req.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{req.studentName}</span>
                    <span className="text-slate-400 ml-2">GPA: {req.studentGpa}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">"{req.note}"</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      {req.status.toUpperCase()}
                    </span>
                    <a
                      href={req.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INDUSTRY AMA AUDIO STAGES                                           */}
      {/* ========================================================================= */}
      {alumniTab === 'ama' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live & Scheduled Industry AMA Stages</h2>
              <p className="text-xs text-slate-500">Ask Me Anything virtual stages hosted by alumni in specialized tech sectors.</p>
            </div>
          </div>

          {industryAmaEvents.map(evt => (
            <div key={evt.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Virtual Audio Stage
                    </span>
                    <span className="text-xs font-semibold text-slate-500">📅 {evt.scheduledFor}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{evt.topic}</h3>
                  <div className="text-xs text-slate-500">
                    Host: <span className="font-semibold text-slate-700">{evt.hostName}</span> ({evt.hostTitle} @ {evt.hostCompany})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <Users className="w-3.5 h-3.5" />
                    <span>{evt.attendeeCount} Registered</span>
                  </span>
                </div>
              </div>

              {/* Questions Stream */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Community Stage Questions ({evt.questions.length})</span>
                </div>

                <div className="space-y-2">
                  {evt.questions.map(q => (
                    <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-medium text-slate-900">"{q.question}"</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Asked by {q.authorName}</div>
                      </div>
                      <button
                        onClick={() => upvoteAmaQuestion(evt.id, q.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold transition shadow-2xs"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{q.upvotes}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Submit Question Input */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!amaQuestionInput.trim()) return;
                    const res = submitAmaQuestion(evt.id, amaQuestionInput.trim());
                    setActionFeedback(res.message);
                    setAmaQuestionInput('');
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <input
                    type="text"
                    placeholder="Submit a question for the speaker on stage..."
                    value={amaQuestionInput}
                    onChange={e => setAmaQuestionInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Submit Question
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
