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
  Bookmark,
  MoreHorizontal,
  Image,
  Video,
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
  ShieldCheck
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

  // Filter posts by students and alumni only (Phase 1 Spec requirement)
  const studentAndAlumniPosts = posts.filter(
    (p) => p.authorRole === 'student' || p.authorRole === 'alumni'
  );

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN (Cols 1-3): LinkedIn-Inspired Mini Profile Card */}
      <aside className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="apple-card overflow-hidden">
          {/* Card Banner */}
          <div className="h-16 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]" />
          
          <div className="px-4 pb-4 text-center">
            {/* Avatar */}
            <div className="-mt-8 mb-2 flex justify-center">
              <Link href={`/user/${currentUser.username}`}>
                <div className="h-16 w-16 rounded-full border-4 border-white bg-[#EFF6FF] flex items-center justify-center text-xl font-black text-[#2563EB] shadow-sm hover:scale-105 transition-transform">
                  {currentUser.fullName[0]}
                </div>
              </Link>
            </div>

            <Link href={`/user/${currentUser.username}`} className="group">
              <h2 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {currentUser.fullName}
              </h2>
            </Link>
            <div className="mt-1 flex justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentUser.role}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-tight text-[#64748B] line-clamp-2">
              {currentUser.headline}
            </p>

            <div className="mt-4 border-t border-[#F1F5F9] pt-3 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Followers</span>
                <span className="font-bold text-[#2563EB]">{currentUser.followersCount}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Following</span>
                <span className="font-bold text-[#0F172A]">{currentUser.followingCount}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-[#F1F5F9] pt-3 space-y-2">
              <Link
                href={`/user/${currentUser.username}`}
                className="apple-button-secondary w-full text-[11px] !py-1.5 flex items-center justify-center space-x-1"
              >
                <span>View Full Profile</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              <Link
                href="/login"
                className="w-full text-[11px] py-1.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Switch Account / Sign In</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation Links */}
        <div className="apple-card p-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Campus Portals
          </h3>
          <div className="space-y-1.5 text-xs">
            <Link
              href="/servers"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Campus Servers</span>
              </div>
              <span className="text-[10px] text-slate-400">Discord-style</span>
            </Link>

            <Link
              href="/grievance"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Private Grievances</span>
              </div>
              <span className="text-[10px] text-slate-400">to Inst ID</span>
            </Link>

            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span className="font-bold">Admin CLI Terminal</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-700">ROOT</span>
              </Link>
            )}
          </div>
        </div>

        {/* Suggested Peers Card */}
        <div className="apple-card p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Campus Peers to Connect
          </h3>
          <div className="space-y-3">
            {allUsers
              .filter(u => u.id !== currentUser.id && (u.role === 'student' || u.role === 'alumni'))
              .slice(0, 3)
              .map(peer => {
                const isFollowing = currentUser.following.includes(peer.id);
                return (
                  <div key={peer.id} className="flex items-start justify-between gap-2 text-xs">
                    <Link href={`/user/${peer.username}`} className="flex items-center space-x-2 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-[#F1F5F9] flex items-center justify-center font-bold text-[#2563EB] shrink-0">
                        {peer.fullName[0]}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-[#0F172A] truncate hover:text-[#2563EB]">{peer.fullName}</p>
                        <p className="text-[10px] text-[#64748B] truncate">{peer.course || peer.role}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleFollowUser(peer.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                        isFollowing
                          ? 'bg-[#F1F5F9] text-[#64748B]'
                          : 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]'
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

      {/* CENTER COLUMN (Cols 4-9): Main Feed with Role-Aware Post Interactions */}
      <main className="lg:col-span-6 space-y-4">
        
        {/* Role Identity Banner */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {currentUser.role === 'institution' ? (
              <Building2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
            ) : currentUser.role === 'alumni' ? (
              <Briefcase className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : currentUser.role === 'faculty' ? (
              <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0" />
            ) : currentUser.role === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
            <div>
              <span className="font-bold text-slate-900 capitalize">{currentUser.role} Mode Active: </span>
              <span className="text-slate-600">
                {currentUser.role === 'institution'
                  ? 'Right to repost student posts & report false information'
                  : currentUser.role === 'alumni'
                  ? 'Preview student posts with full commenting, likes, and sharing'
                  : currentUser.role === 'faculty'
                  ? 'Preview student posts & provide academic guidance comments'
                  : currentUser.role === 'admin'
                  ? 'Super Administrator with full post moderation & CLI privileges'
                  : 'Author posts, join shielded Discord servers & report faculty in private'}
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap"
          >
            Switch Account
          </Link>
        </div>

        {/* Global Action Feedback Notice */}
        {actionFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* LinkedIn-Inspired "Start a post" Widget (Students, Alumni & Admin only) */}
        {(currentUser.role === 'student' || currentUser.role === 'alumni' || currentUser.role === 'admin') ? (
          <div className="apple-card p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Link href={`/user/${currentUser.username}`}>
                <div className="h-10 w-10 rounded-full bg-[#EFF6FF] text-[#2563EB] font-black flex items-center justify-center shrink-0">
                  {currentUser.fullName[0]}
                </div>
              </Link>
              <Link
                href="/create"
                className="flex-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#64748B] font-medium hover:bg-[#F1F5F9] transition-colors"
              >
                Start a post, ask campus seniors or alumni...
              </Link>
            </div>

            <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2 px-1 text-xs text-[#64748B]">
              <Link href="/create" className="flex items-center space-x-1.5 p-2 rounded-lg hover:bg-[#F8FAFC] transition">
                <Image className="h-4 w-4 text-[#2563EB]" />
                <span className="font-medium">Media</span>
              </Link>
              <Link href="/create" className="flex items-center space-x-1.5 p-2 rounded-lg hover:bg-[#F8FAFC] transition">
                <Calendar className="h-4 w-4 text-[#D97706]" />
                <span className="font-medium">Event</span>
              </Link>
              <Link href="/create" className="flex items-center space-x-1.5 p-2 rounded-lg hover:bg-[#F8FAFC] transition">
                <FileText className="h-4 w-4 text-[#059669]" />
                <span className="font-medium">Write Review</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Notice:</strong> As {currentUser.role === 'institution' ? 'an Institution' : 'a Faculty member'}, you can preview student posts and engage via official actions (reposting/mentorship comments).
            </span>
          </div>
        )}

        {/* Feed Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#64748B]">
            <span>Feed Filter:</span>
            <span className="text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">Students & Alumni Only</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">{studentAndAlumniPosts.length} posts</span>
        </div>

        {/* Post Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {studentAndAlumniPosts.map((post) => {
              const isLiked = post.likes.includes(currentUser.id);
              const isCommentsOpen = activeCommentsPostId === post.id;
              const isAuthorSelf = post.authorId === currentUser.id;
              const isFollowingAuthor = currentUser.following.includes(post.authorId);
              const isFlagged = Boolean(post.reportedByInstitution);

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`apple-card overflow-hidden ${
                    isFlagged ? 'border-amber-200 bg-amber-50/10' : ''
                  }`}
                >
                  {/* Top Institution Repost Banner if present */}
                  {post.repostedByInstitution && (
                    <div className="bg-purple-50/80 border-b border-purple-100 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-purple-900">
                      <Repeat className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        Reposted by <strong>{post.repostedByInstitution.institutionName}</strong>
                      </span>
                    </div>
                  )}

                  {/* Flagged for Institution Review Banner if present */}
                  {post.reportedByInstitution && (
                    <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center gap-2 text-xs text-rose-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span>
                        Flagged by {post.reportedByInstitution.institutionName}: <em>"{post.reportedByInstitution.reason}"</em>
                      </span>
                    </div>
                  )}

                  {/* Post Top Header */}
                  <div className="p-4 sm:p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Link href={post.isAnonymous ? '#' : `/user/${post.authorUsername}`}>
                          <div className="h-11 w-11 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-sm font-bold text-[#0F172A] shrink-0 hover:border-[#2563EB] transition-colors">
                            {post.isAnonymous ? '?' : post.authorName[0]}
                          </div>
                        </Link>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            {post.isAnonymous ? (
                              <span className="text-sm font-bold text-[#0F172A]">Anonymous Student</span>
                            ) : (
                              <Link
                                href={`/user/${post.authorUsername}`}
                                className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors"
                              >
                                {post.authorName}
                              </Link>
                            )}

                            {post.isVerifiedAuthor && !post.isAnonymous && (
                              <span className="flex items-center space-x-0.5 rounded-md bg-[#ECFDF5] px-1.5 py-0.2 text-[10px] font-bold text-[#059669]">
                                <UserCheck className="h-3 w-3" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] leading-tight text-[#64748B] mt-0.5 max-w-sm line-clamp-1">
                            {post.authorHeadline}
                          </p>

                          <div className="mt-0.5 flex items-center space-x-1 text-[11px] text-[#94A3B8]">
                            <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span className="capitalize">{post.authorRole}</span>
                            {post.collegeName && (
                              <>
                                <span>•</span>
                                <span className="text-[#2563EB]">{post.collegeName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Follow Button if not self and not anonymous */}
                      {!isAuthorSelf && !post.isAnonymous && currentUser.role !== 'institution' && (
                        <button
                          onClick={() => toggleFollowUser(post.authorId)}
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                            isFollowingAuthor
                              ? 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                              : 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]'
                          }`}
                        >
                          {isFollowingAuthor ? 'Following' : '+ Follow'}
                        </button>
                      )}

                      {/* Admin Global Delete Shortcut */}
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => deletePost(post.id)}
                          title="Admin Global Delete"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mt-3 text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </div>

                    {/* High-Resolution Uncompressed Post Image Display with Pinterest Zoom Click */}
                    {post.imageUrl && (
                      <div
                        onClick={() => setZoomedPost(post)}
                        className="mt-3 rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] relative group cursor-zoom-in"
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post media attachment"
                          loading="lazy"
                          className="w-full max-h-[460px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        {/* Pinterest Zoom Badge Indicator */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <ZoomIn className="h-3.5 w-3.5" />
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    )}

                    {post.topic && (
                      <div className="mt-3">
                        <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                          #{post.topic.replace(/\s+/g, '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Reaction Counts Bar */}
                  <div className="px-4 py-2 flex items-center justify-between text-xs text-[#64748B] border-t border-[#F1F5F9]">
                    <div className="flex items-center space-x-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white text-[9px]">
                        👍
                      </span>
                      <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                      {post.sharesCount > 0 && (
                        <span className="text-purple-600 font-semibold">• {post.sharesCount} reposts</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="hover:underline hover:text-[#0F172A]"
                    >
                      {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                    </button>
                  </div>

                  {/* Role-Specific Action Bar */}
                  {currentUser.role === 'institution' ? (
                    // Institution Action Rights: Repost to Profile or Report False Info
                    <div className="grid grid-cols-2 border-t border-[#F1F5F9] px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-50/50">
                      <button
                        onClick={() => handleInstitutionRepost(post.id)}
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-purple-700 hover:bg-purple-100/60 transition-colors"
                      >
                        <Repeat className="h-4 w-4 text-purple-600" />
                        <span>Repost to Institution Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setReportingPostId(post.id);
                          setReportReason('');
                        }}
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-rose-700 hover:bg-rose-100/60 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>Report False Info / Negative Target</span>
                      </button>
                    </div>
                  ) : (
                    // Standard / Alumni / Faculty / Student Action Bar
                    <div className="grid grid-cols-4 border-t border-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#64748B]">
                      {currentUser.role !== 'faculty' ? (
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg transition-colors ${
                            isLiked ? 'text-[#2563EB] bg-[#EFF6FF]/60 font-bold' : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{isLiked ? 'Liked' : 'Like'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center py-2.5 text-[11px] text-amber-700 font-semibold">
                          Faculty Review
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg transition-colors ${
                          isCommentsOpen ? 'text-[#2563EB] bg-[#EFF6FF]/60' : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{currentUser.role === 'faculty' ? 'Mentor' : 'Comment'}</span>
                      </button>

                      <button
                        onClick={() => alert('Post link copied to clipboard!')}
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>

                      <Link
                        href="/messages"
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </Link>
                    </div>
                  )}

                  {/* Institution False-Information Reporting Dialog */}
                  {reportingPostId === post.id && (
                    <div className="p-4 border-t border-rose-200 bg-rose-50/60 space-y-2">
                      <label className="block text-xs font-bold text-rose-900">
                        Specify False Information or Unfair Negative Targeting:
                      </label>
                      <input
                        type="text"
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        placeholder="e.g. Unverified claims regarding hostel water quality or syllabus change..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
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
                          className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                        >
                          Submit Report to Platform Admin
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Comments Section (Expandable Accordion) */}
                  {isCommentsOpen && (
                    <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-4 space-y-4">
                      {/* Comment Input */}
                      <form
                        onSubmit={(e) => handleCommentSubmit(post.id, e)}
                        className="flex items-start space-x-2"
                      >
                        <div className="h-8 w-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
                          {currentUser.fullName[0]}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                            placeholder={
                              currentUser.role === 'faculty'
                                ? 'Add academic feedback or guidance as faculty...'
                                : currentUser.role === 'alumni'
                                ? 'Share industry tips or advice as alumnus...'
                                : 'Add a comment or question...'
                            }
                            className="flex-1 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="apple-button-primary !py-1 !px-3 text-xs"
                          >
                            Post
                          </button>
                        </div>
                      </form>

                      {/* Comment List */}
                      <div className="space-y-3 pt-1">
                        {post.comments.length === 0 ? (
                          <p className="text-xs text-[#94A3B8] text-center py-2">
                            No comments yet. Start the conversation!
                          </p>
                        ) : (
                          post.comments.map((cmt) => (
                            <div key={cmt.id} className="flex items-start space-x-2 text-xs">
                              <Link href={`/user/${cmt.authorUsername}`}>
                                <div className="h-7 w-7 rounded-full bg-[#E2E8F0] text-[#0F172A] font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {cmt.authorName[0]}
                                </div>
                              </Link>
                              <div className="flex-1 rounded-2xl bg-white border border-[#E2E8F0] p-3 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Link
                                      href={`/user/${cmt.authorUsername}`}
                                      className="font-bold text-[#0F172A] hover:text-[#2563EB]"
                                    >
                                      {cmt.authorName}
                                    </Link>
                                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {cmt.authorRole}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#94A3B8]">
                                    {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#64748B] line-clamp-1">{cmt.authorHeadline}</p>
                                <p className="mt-1 text-xs text-[#1E293B] leading-relaxed">{cmt.content}</p>
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

      {/* RIGHT COLUMN (Cols 10-12): Campus Community Circles & Search Shortcut */}
      <aside className="hidden lg:block lg:col-span-3 space-y-4">
        {/* Instagram Search Feature Highlight */}
        <div className="apple-card p-4 bg-gradient-to-br from-[#EFF6FF] to-white border-[#BFDBFE]">
          <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <span>Discover Peers</span>
          </h3>
          <p className="mt-1 text-xs text-[#3B82F6]">
            Search like Instagram across students, alumni, and faculty by college and skills.
          </p>
          <Link
            href="/search"
            className="mt-3 apple-button-primary w-full text-xs !py-2 flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <span>Search Profiles & Colleges</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Communities */}
        <div className="apple-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Active Campus Circles
            </h3>
            <Link href="/servers" className="text-xs text-[#2563EB] hover:underline font-semibold">
              Servers →
            </Link>
          </div>
          <div className="space-y-2.5">
            {communities.map((comm) => (
              <div key={comm.id} className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs">
                <p className="font-bold text-[#0F172A]">{comm.name}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-[#64748B]">{comm.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span>{comm.membersCount} members</span>
                  <Link href="/servers" className="font-semibold text-[#2563EB] hover:underline">
                    Join Channel →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

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
