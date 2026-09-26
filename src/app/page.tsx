'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Building2,
  UserCheck,
  Sparkles,
  Image,
  Calendar,
  FileText,
  UserPlus,
  UserMinus,
  ArrowRight,
  ZoomIn,
  Repeat,
  AlertTriangle,
  Trash2,
  Shield,
  CheckCircle2,
  Lock,
  BookOpen,
  Briefcase,
  GraduationCap,
  Scale,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Post } from '@/types';
import PinterestImageModal from '@/components/PinterestImageModal';

export default function HomePage() {
  const {
    posts,
    toggleLikePost,
    addComment,
    currentUser,
    communities,
    toggleFollowUser,
    allUsers,
    repostToInstitution,
    reportFalseInfoPost,
    deletePost
  } = useApp();
  
  // Track open comment trays per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Track Pinterest-style zoomed post
  const [zoomedPost, setZoomedPost] = useState<Post | null>(null);

  // Institution Reporting State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Feed Filter Tabs: 'all' | 'students' | 'alumni'
  const [feedFilter, setFeedFilter] = useState<'all' | 'students' | 'alumni'>('all');

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'students') return p.authorRole === 'student';
    if (feedFilter === 'alumni') return p.authorRole === 'alumni';
    return p.authorRole === 'student' || p.authorRole === 'alumni';
  });

  const handleToggleComments = (postId: string) => {
    setActiveCommentsPostId(prev => (prev === postId ? null : postId));
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleInstitutionRepost = (postId: string) => {
    const res = repostToInstitution(postId);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReportFalseInfo = (postId: string) => {
    if (!reportReason.trim()) return;
    const res = reportFalseInfoPost(postId, reportReason.trim());
    setActionFeedback(res.message);
    setReportingPostId(null);
    setReportReason('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (Cols 1-3): Clean Profile & Shortcuts Hub */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
            <div className="px-4 pb-4 text-center">
              <div className="-mt-8 mb-2 flex justify-center">
                <Link href={`/user/${currentUser.username}`}>
                  <div className="h-16 w-16 rounded-2xl border-3 border-white bg-slate-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm hover:scale-102 transition-transform">
                    {currentUser.fullName[0]}
                  </div>
                </Link>
              </div>

              <Link href={`/user/${currentUser.username}`} className="group block">
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {currentUser.fullName}
                </h2>
              </Link>
              
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser.role}
                </span>
                {currentUser.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                )}
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                {currentUser.headline}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{currentUser.followersCount}</div>
                  <div className="text-[10px] text-slate-400">Followers</div>
                </div>
                <div className="border-l border-slate-100">
                  <div className="font-bold text-slate-900">{currentUser.followingCount}</div>
                  <div className="text-[10px] text-slate-400">Following</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <Link
                  href={`/user/${currentUser.username}`}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <span>My Profile</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Hub Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Campus Hub
            </h3>
            <div className="space-y-1 text-xs">
              <Link
                href="/servers"
                className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Discord Servers</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Live</span>
              </Link>

              <Link
                href="/grievance"
                className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Private Grievances</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">To Inst ID</span>
              </Link>

              <Link
                href="/compare"
                className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Compare Colleges</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Matrix</span>
              </Link>
            </div>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN (Cols 4-9): Feed Stream */}
        {/* ========================================================= */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* Action Feedback Banner if present */}
          {actionFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Clean "Start a Post" Composer (Students, Alumni & Admin) */}
          {(currentUser.role === 'student' || currentUser.role === 'alumni' || currentUser.role === 'admin') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <Link href={`/user/${currentUser.username}`}>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.fullName[0]}
                  </div>
                </Link>
                <Link
                  href="/create"
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-100/70 hover:text-slate-700 transition-colors"
                >
                  Share campus thoughts, project updates, or ask seniors...
                </Link>
              </div>

              <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-xs text-slate-600">
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                >
                  <Image className="w-4 h-4 text-blue-500" />
                  <span>Media</span>
                </Link>
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-amber-600 transition-colors font-medium"
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Event</span>
                </Link>
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Review</span>
                </Link>
              </div>
            </div>
          )}

          {/* Clean Feed Filter Pill Tabs */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  feedFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Posts ({posts.filter(p => p.authorRole === 'student' || p.authorRole === 'alumni').length})
              </button>
              <button
                onClick={() => setFeedFilter('students')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  feedFilter === 'students'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setFeedFilter('alumni')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  feedFilter === 'alumni'
                    ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alumni Mentors
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Showing {filteredPosts.length} posts
            </span>
          </div>

          {/* Stream of Clean Post Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const isLiked = post.likes.includes(currentUser.id);
                const isCommentsOpen = activeCommentsPostId === post.id;
                const isAuthorSelf = post.authorId === currentUser.id;
                const isFollowingAuthor = currentUser.following.includes(post.authorId);
                const isFlagged = Boolean(post.reportedByInstitution);

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300/80 transition-colors"
                  >
                    {/* Top Micro-Banner for Institution Repost */}
                    {post.repostedByInstitution && (
                      <div className="bg-purple-50/60 border-b border-purple-100/80 px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-900">
                        <Repeat className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reposted by {post.repostedByInstitution.institutionName}</span>
                      </div>
                    )}

                    {/* Top Micro-Banner for Flagged Posts */}
                    {post.reportedByInstitution && (
                      <div className="bg-rose-50 border-b border-rose-100 px-4 py-1.5 flex items-center gap-1.5 text-[11px] text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>Flagged by institution: <em>"{post.reportedByInstitution.reason}"</em></span>
                      </div>
                    )}

                    {/* Post Header */}
                    <div className="p-4 sm:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Link href={post.isAnonymous ? '#' : `/user/${post.authorUsername}`}>
                            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0 hover:border-blue-500 transition-colors">
                              {post.isAnonymous ? '?' : post.authorName[0]}
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {post.isAnonymous ? (
                                <span className="text-sm font-bold text-slate-900">Anonymous Student</span>
                              ) : (
                                <Link
                                  href={`/user/${post.authorUsername}`}
                                  className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate"
                                >
                                  {post.authorName}
                                </Link>
                              )}

                              {post.isVerifiedAuthor && !post.isAnonymous && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              )}

                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {post.authorRole}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-sm">
                              {post.authorHeadline}
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium truncate">{post.collegeName || 'Campus Lenz'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Follow Button */}
                        {!isAuthorSelf && !post.isAnonymous && currentUser.role !== 'institution' && (
                          <button
                            onClick={() => toggleFollowUser(post.authorId)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all shrink-0 ${
                              isFollowingAuthor
                                ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            {isFollowingAuthor ? 'Following' : '+ Follow'}
                          </button>
                        )}

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => deletePost(post.id)}
                            title="Admin Delete"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Post Body Content */}
                      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Image Attachment with Pinterest Zoom Click */}
                      {post.imageUrl && (
                        <div
                          onClick={() => setZoomedPost(post)}
                          className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-zoom-in"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Post visual attachment"
                            loading="lazy"
                            className="w-full max-h-[460px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom</span>
                          </div>
                        </div>
                      )}

                      {/* Topic Tag */}
                      {post.topic && (
                        <div className="mt-2.5">
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            #{post.topic.replace(/\s+/g, '')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Reactions & Engagement Summary Bar */}
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">
                          👍
                        </span>
                        <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                        {post.sharesCount > 0 && (
                          <span className="text-purple-600 font-semibold">• {post.sharesCount} reposts</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="hover:text-slate-900 transition-colors"
                      >
                        {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                      </button>
                    </div>

                    {/* Action Bar (Clean & Role-Enforced) */}
                    {currentUser.role === 'institution' ? (
                      <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold">
                        <button
                          onClick={() => handleInstitutionRepost(post.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <Repeat className="w-4 h-4" />
                          <span>Repost to Institution</span>
                        </button>
                        <button
                          onClick={() => {
                            setReportingPostId(post.id);
                            setReportReason('');
                          }}
                          className="flex items-center justify-center gap-1.5 py-2.5 text-rose-700 hover:bg-rose-50 transition-colors border-l border-slate-100"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Report False Info</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                        {currentUser.role !== 'faculty' ? (
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 transition-colors ${
                              isLiked ? 'text-blue-600 font-bold' : ''
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{isLiked ? 'Liked' : 'Like'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center py-2.5 text-[11px] text-amber-700 font-semibold">
                            Faculty
                          </div>
                        )}

                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 transition-colors ${
                            isCommentsOpen ? 'text-blue-600 font-bold' : ''
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Comment</span>
                        </button>

                        <button
                          onClick={() => alert('Post link copied to clipboard!')}
                          className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>

                        <Link
                          href="/messages"
                          className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </Link>
                      </div>
                    )}

                    {/* Institution Reporting Drawer if active */}
                    {reportingPostId === post.id && (
                      <div className="p-4 border-t border-rose-100 bg-rose-50/50 space-y-2">
                        <label className="block text-xs font-bold text-rose-900">
                          State specific false information or unverified claim:
                        </label>
                        <input
                          type="text"
                          value={reportReason}
                          onChange={e => setReportReason(e.target.value)}
                          placeholder="e.g. Inaccurate lab infrastructure or unverified placement statistics..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setReportingPostId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReportFalseInfo(post.id)}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                          >
                            Submit Flag
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-3">
                        <form
                          onSubmit={(e) => handleCommentSubmit(post.id, e)}
                          className="flex items-center gap-2"
                        >
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {currentUser.fullName[0]}
                          </div>
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                            placeholder={
                              currentUser.role === 'faculty'
                                ? 'Add academic feedback as faculty...'
                                : currentUser.role === 'alumni'
                                ? 'Share career advice as alumnus...'
                                : 'Add a constructive comment...'
                            }
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                          >
                            Post
                          </button>
                        </form>

                        <div className="space-y-2 pt-1">
                          {post.comments.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2 italic">
                              No comments yet. Be the first to start the conversation!
                            </p>
                          ) : (
                            post.comments.map((cmt) => (
                              <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                                <Link href={`/user/${cmt.authorUsername}`}>
                                  <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {cmt.authorName[0]}
                                  </div>
                                </Link>
                                <div className="flex-1 rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Link
                                        href={`/user/${cmt.authorUsername}`}
                                        className="font-bold text-slate-900 hover:text-blue-600"
                                      >
                                        {cmt.authorName}
                                      </Link>
                                      <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                        {cmt.authorRole}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-slate-700 leading-relaxed text-[11px]">{cmt.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Cols 10-12): Circles & Peer Suggestions */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          
          {/* Quick Search Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Search
            </h3>
            <p className="text-xs text-slate-500">
              Find classmates, seniors, professors, or colleges across Tamil Nadu.
            </p>
            <Link
              href="/search"
              className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-400">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Search alumni, students...</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Active Campus Circles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Campus Channels
              </h3>
              <Link href="/servers" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-2">
              {communities.slice(0, 3).map((comm) => (
                <div key={comm.id} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-800 line-clamp-1">{comm.name}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{comm.description}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{comm.membersCount} members</span>
                    <Link href="/servers" className="text-blue-600 font-semibold hover:underline">
                      Join →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Peers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Peers to Connect
            </h3>
            <div className="space-y-2.5">
              {allUsers
                .filter(u => u.id !== currentUser.id && (u.role === 'student' || u.role === 'alumni'))
                .slice(0, 3)
                .map(peer => {
                  const isFollowing = currentUser.following.includes(peer.id);
                  return (
                    <div key={peer.id} className="flex items-center justify-between gap-2 text-xs">
                      <Link href={`/user/${peer.username}`} className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          {peer.fullName[0]}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate hover:text-blue-600">{peer.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{peer.course || peer.role}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => toggleFollowUser(peer.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors shrink-0 ${
                          isFollowing
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isFollowing ? 'Following' : '+ Follow'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

        </aside>

      </div>

      {/* PINTEREST-STYLE ZOOM LIGHTBOX MODAL */}
      <PinterestImageModal
        post={zoomedPost}
        onClose={() => setZoomedPost(null)}
        onLike={toggleLikePost}
        onComment={addComment}
        currentUser={currentUser}
      />
    </div>
  );
}
