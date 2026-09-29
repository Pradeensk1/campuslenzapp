'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import {
  User,
  ShieldCheck,
  Bookmark,
  Building,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Award,
  ExternalLink,
  Briefcase,
  BookOpen,
  Building2,
  Terminal,
  Clock,
  Repeat,
  FileText,
  Sparkles,
  Lock,
  GraduationCap,
  Heart,
  MessageSquare,
  ZoomIn,
  Trash2,
  Send,
  X,
  Star,
  ArrowRight,
  Lightbulb,
  Coins,
  Gift
} from 'lucide-react';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';
import FollowersListModal from '@/components/FollowersListModal';
import PinterestImageModal from '@/components/PinterestImageModal';
import StudentSkillsSection from '@/components/StudentSkillsSection';
import LenzRewardsHub from '@/components/student/LenzRewardsHub';
import { isVideoMedia } from '@/lib/mediaUtils';
import { Post } from '@/types';

export default function ProfileClient({
  initialColleges = [],
  initialPosts = [],
}: {
  initialColleges?: any[];
  initialPosts?: any[];
}) {
  const router = useRouter();
  const {
    currentUser,
    colleges,
    savedCollegeIds,
    updateProfile,
    logout,
    posts,
    reviews,
    servers,
    leaveServer,
    leaveGroup,
    toggleLikePost,
    repostPost,
    addComment,
    deletePost
  } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'feedback' | 'reposts' | 'details' | 'saved' | 'verification' | 'rewards'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [zoomedPost, setZoomedPost] = useState<Post | null>(null);
  const [followersModalTitle, setFollowersModalTitle] = useState<'Followers' | 'Following' | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleRepost = (postId: string) => {
    const res = repostPost(postId);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const savedColleges = colleges.filter(c => savedCollegeIds.includes(c.id));
  const allAvailablePosts = posts.length > 0 ? posts : initialPosts;
  const userPosts = allAvailablePosts.filter(p => {
    if (!currentUser) return false;
    const matchesId = p.authorId === currentUser.id || p.authorId === `user-${currentUser.username}`;
    const matchesUsername = Boolean(p.authorUsername && currentUser.username && p.authorUsername.toLowerCase() === currentUser.username.toLowerCase());
    const matchesName = Boolean(p.authorName && (
      (currentUser.fullName && p.authorName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
      ((currentUser as any).name && p.authorName.toLowerCase() === (currentUser as any).name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });

  const userStandardPosts = userPosts.filter(p => p.postType !== 'feedback');

  const userReviews = (reviews || []).filter(r => {
    if (!currentUser) return false;
    const matchesId = r.userId === currentUser.id || r.userId === `user-${currentUser.username}`;
    const matchesUsername = Boolean(r.authorUsername && currentUser.username && r.authorUsername.toLowerCase() === currentUser.username.toLowerCase());
    const matchesName = Boolean(r.authorName && (
      (currentUser.fullName && r.authorName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
      ((currentUser as any).name && r.authorName.toLowerCase() === (currentUser as any).name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });

  const userFeedbacks = allAvailablePosts.filter(p => {
    if (!currentUser) return false;
    const isFeedback = p.postType === 'feedback' || p.topic?.toLowerCase().includes('feedback') || p.topic?.toLowerCase().includes('grievance');
    if (!isFeedback) return false;
    const matchesId = p.authorId === currentUser.id || p.authorId === `user-${currentUser.username}`;
    const matchesUsername = Boolean(p.authorUsername && currentUser.username && p.authorUsername.toLowerCase() === currentUser.username.toLowerCase());
    const matchesName = Boolean(p.authorName && (
      (currentUser.fullName && p.authorName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
      ((currentUser as any).name && p.authorName.toLowerCase() === (currentUser as any).name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });

  const userReposts = allAvailablePosts.filter(p =>
    (currentUser?.id && Array.isArray(p.repostedUserIds) && p.repostedUserIds.includes(currentUser.id)) ||
    (currentUser?.id && p.repostedByStudent?.studentId === currentUser.id) ||
    (currentUser?.id && p.repostedByFaculty?.facultyId === currentUser.id) ||
    (currentUser?.id && p.repostedByInstitution?.institutionId === currentUser.id)
  );

  // Verification request form state
  const [docType, setDocType] = useState('Alumni Degree Certificate');
  const [docNotes, setDocNotes] = useState('');
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  if (!currentUser) {
    return (
      <div className="apple-card p-12 text-center max-w-lg mx-auto space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Profile</h2>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="apple-button-primary text-xs font-bold py-2.5 px-5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="apple-button-secondary text-xs font-bold py-2.5 px-5"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1687D4] shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-[#0875BD] hover:text-[#075080]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {/* Instagram Circular DP / Avatar */}
            <div className="relative shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="h-20 w-20 rounded-full object-cover border-3 border-blue-500 shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-md">
                  {currentUser?.fullName?.[0] || 'U'}
                </div>
              )}
              {currentUser?.isVerified && (
                <span className="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-1 text-white border-2 border-white shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">{currentUser?.fullName}</h1>
                {currentUser?.isVerified && (
                  <span className="flex items-center space-x-1 rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#059669]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                )}
                {currentUser.role === 'institution' && currentUser.accreditationGrade && (
                  <span className="flex items-center space-x-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                    <Award className="h-3.5 w-3.5" />
                    <span>{currentUser.accreditationGrade}</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#64748B]">@{currentUser?.username} • {currentUser?.email}</p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 font-bold uppercase text-[10px] text-[#2563EB]">
                  {currentUser?.role}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="text-[#64748B] font-medium">{currentUser?.collegeName}</span>
              </div>
              {currentUser?.headline && (
                <p className="mt-2 text-xs font-semibold text-slate-800">{currentUser.headline}</p>
              )}
              {currentUser?.bio && (
                <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                  {currentUser.bio.replace(/\s*<!--SKILLS-->[\s\S]*$/, '').trim()}
                </p>
              )}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1.5 hover:border-[#1687D4]"
                >
                  <Edit3 className="h-3 w-3 text-[#1687D4]" />
                  <span>Edit Profile</span>
                </button>
                <Link
                  href={`/user/${currentUser.username}`}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1 text-slate-600 hover:text-slate-900"
                >
                  <span>Public View</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1 text-rose-600 hover:text-rose-700 hover:border-rose-300"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT SKILLS & TECHNICAL EXPERTISE (WITH VIEW MORE / VIEW LESS) */}
        {(currentUser.role === 'student' || (currentUser.skills && currentUser.skills.length > 0)) && (
          <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
            <StudentSkillsSection
              skills={currentUser.skills}
              role={currentUser.role}
              isOwner={true}
              onEdit={() => setIsEditingProfile(true)}
              initialCount={3}
            />
          </div>
        )}

        {/* AI CAREER COPILOT - CONNECTED DATABASE HERO BANNER */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">AI Career Copilot Active</span>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Profile Synced</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                Connected to {currentUser.skills?.length || 0} skills, {currentUser.department || 'academics'}, &amp; {currentUser.collegeName || 'institute'} database.
              </p>
            </div>
          </div>

          <Link
            href="/career"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-[#1687D4] hover:from-blue-600 hover:to-[#075080] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Launch Career Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* INTERACTIVE FOLLOWERS / FOLLOWING STATS BAR */}
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2.5 border-t border-[#F1F5F9] pt-4 text-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`p-2.5 rounded-2xl transition cursor-pointer group text-center ${
              activeTab === 'posts' ? 'bg-[#E8F5FF] border border-[#CFEAFF]' : 'bg-slate-50/60 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#1687D4] transition">
              {userStandardPosts.length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-[#1687D4]">
              Posts
            </p>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`p-2.5 rounded-2xl transition cursor-pointer group text-center ${
              activeTab === 'reviews' ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50/60 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-base sm:text-lg font-black text-amber-600 group-hover:text-amber-700 transition">
              {userReviews.length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-amber-600">
              Reviews
            </p>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`p-2.5 rounded-2xl transition cursor-pointer group text-center ${
              activeTab === 'feedback' ? 'bg-amber-100/80 border border-amber-300' : 'bg-slate-50/60 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-base sm:text-lg font-black text-amber-800 group-hover:text-amber-900 transition">
              {userFeedbacks.length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-amber-800">
              Feedback
            </p>
          </button>

          <button
            onClick={() => setActiveTab('reposts')}
            className={`p-2.5 rounded-2xl transition cursor-pointer group text-center ${
              activeTab === 'reposts' ? 'bg-purple-50/80 border border-purple-200' : 'bg-slate-50/60 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-base sm:text-lg font-black text-purple-600 group-hover:text-purple-700 transition">
              {userReposts.length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-purple-600">
              Reposts
            </p>
          </button>

          <button
            onClick={() => setFollowersModalTitle('Followers')}
            className="p-2.5 rounded-2xl bg-slate-50/60 hover:bg-[#E8F5FF] transition group cursor-pointer text-center"
          >
            <p className="text-base sm:text-lg font-black text-[#1687D4] group-hover:underline">
              {currentUser.followersCount || (currentUser.followers || []).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-[#1687D4]">
              Followers
            </p>
          </button>

          <button
            onClick={() => setFollowersModalTitle('Following')}
            className="p-2.5 rounded-2xl bg-slate-50/60 hover:bg-[#E8F5FF] transition group cursor-pointer text-center"
          >
            <p className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#1687D4] group-hover:underline">
              {currentUser.followingCount || (currentUser.following || []).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-[#1687D4]">
              Following
            </p>
          </button>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-4 text-xs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'posts'
                ? 'bg-[#1687D4] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Posts ({userStandardPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-[#64748B] hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            <span>Reviews ({userReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'feedback'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Feedback ({userFeedbacks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reposts')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'reposts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Reposts ({userReposts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-[#1687D4] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            Academic
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-[#1687D4] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved ({savedColleges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'verification'
                ? 'bg-[#1687D4] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            Verification
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
            }`}
          >
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span>LenzCoins & Rewards 🪙</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: POSTS AUTHORED BY USER */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1687D4]" />
              <span>Posts ({userStandardPosts.length})</span>
            </h2>
            <Link
              href="/create"
              className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Post</span>
            </Link>
          </div>

          {userStandardPosts.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-900">No posts published yet</p>
              <p className="max-w-sm mx-auto text-slate-500">
                Share campus updates, academic discussions, projects, or achievements with peers.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 apple-button-primary text-xs font-bold py-2 px-4"
              >
                <span>Write First Post</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userStandardPosts.map(post => {
                const isLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
                const hasReposted = (post.repostedUserIds || []).includes(currentUser.id);
                return (
                  <div key={post.id} className="apple-card p-5 sm:p-6 space-y-3 transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          #{post.topic || 'Campus'}
                        </span>
                        {post.isAnonymous && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <button
                          onClick={() => setPostPendingDelete(post)}
                          title="Delete Post / Reel"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Media preview (video / image) */}
                    {post.imageUrl && (
                      isVideoMedia(post.imageUrl) ? (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-black">
                          <video
                            src={post.imageUrl}
                            controls
                            className="w-full max-h-[420px] rounded-2xl bg-black"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => setZoomedPost(post)}
                          className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-zoom-in"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Post attachment"
                            loading="lazy"
                            className="w-full max-h-[420px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom Full</span>
                          </div>
                        </div>
                      )
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </button>
                        <button
                          onClick={() => setActiveCommentsPostId(prev => prev === post.id ? null : post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            activeCommentsPostId === post.id ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.commentsCount} comments</span>
                        </button>
                        <button
                          onClick={() => handleRepost(post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            hasReposted ? 'text-purple-600 font-bold' : 'hover:text-purple-600'
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{post.sharesCount} reposts</span>
                        </button>
                      </div>

                      <Link
                        href={`/#${post.id}`}
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>View in Feed</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Interactive Commenting Tray */}
                    {activeCommentsPostId === post.id && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((c: any) => (
                              <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                                <div className="flex items-center justify-between font-semibold text-slate-800">
                                  <span>{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-slate-600">{c.text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400 italic py-1 text-center">No comments yet. Be the first to reply!</p>
                          )}
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const text = commentInputs[post.id]?.trim();
                            if (!text) return;
                            addComment(post.id, text);
                            setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                            setActionFeedback('💬 Comment published!');
                            setTimeout(() => setActionFeedback(null), 3000);
                          }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="submit"
                            disabled={!commentInputs[post.id]?.trim()}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS AUTHORED BY USER */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Institutional Reviews &amp; Ratings ({userReviews.length})</span>
            </h2>
            <Link
              href="/create"
              className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </Link>
          </div>

          {userReviews.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <p className="font-bold text-sm text-slate-900">No college reviews submitted yet</p>
              <p className="max-w-sm mx-auto text-slate-500">
                Provide genuine feedback, ratings, and prospective insights for your college or university to guide upcoming aspirants.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 apple-button-primary text-xs font-bold py-2 px-4"
              >
                <span>Submit College Review</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((rev) => {
                const targetCollege = colleges.find(c => c.id === rev.collegeId);
                return (
                  <div key={rev.id} className="apple-card p-5 sm:p-6 space-y-4 border-l-4 border-l-amber-500">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={targetCollege?.slug ? `/colleges/${targetCollege.slug}#reviews` : '/explore'}
                            className="font-black text-slate-900 hover:text-[#1687D4] transition text-sm flex items-center gap-1"
                          >
                            <Building2 className="w-4 h-4 text-[#1687D4]" />
                            <span>{targetCollege?.name || 'Verified Institution'}</span>
                          </Link>
                          {rev.isAnonymous && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              Posted Anonymously
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {rev.course && `${rev.course} • `}{rev.department && `${rev.department} • `}{rev.batch || 'Verified Batch'}
                        </p>
                      </div>

                      {/* Overall Rating Badge */}
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span className="text-xs font-black text-amber-900">{rev.overallRating.toFixed(1)}</span>
                        <span className="text-[10px] text-amber-700 font-medium">/ 5.0</span>
                      </div>
                    </div>

                    {/* Review Title & Experience */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{rev.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{rev.experience}</p>
                    </div>

                    {/* Dimensions Radar/Pills */}
                    {rev.dimensions && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        {Object.entries(rev.dimensions).map(([key, val]) => (
                          <div key={key} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                            <span className="capitalize text-slate-600 font-medium">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-bold text-slate-900 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {typeof val === 'number' ? val.toFixed(1) : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pros & Cons */}
                    {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        {rev.pros && rev.pros.length > 0 && (
                          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <span>✓ Highlights &amp; Pros</span>
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-900">
                              {rev.pros.map((p, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {rev.cons && rev.cons.length > 0 && (
                          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3">
                            <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <span>✗ Areas for Improvement</span>
                            </p>
                            <ul className="space-y-1 text-xs text-rose-900">
                              {rev.cons.map((c, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-rose-500 font-bold">•</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer link to college reviews */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>Submitted {new Date(rev.createdAt).toLocaleDateString()}</span>
                      <Link
                        href={targetCollege?.slug ? `/colleges/${targetCollege.slug}#reviews` : '/explore'}
                        className="font-bold text-[#1687D4] hover:underline flex items-center gap-1"
                      >
                        <span>View on College Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEEDBACK & GRIEVANCES AUTHORED BY USER */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Campus Feedback &amp; Grievances ({userFeedbacks.length})</span>
            </h2>
            <Link
              href="/create"
              className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </Link>
          </div>

          {userFeedbacks.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                💡
              </div>
              <p className="font-bold text-sm text-slate-900">No campus feedback posted yet</p>
              <p className="max-w-sm mx-auto text-slate-500">
                Voice campus grievances, facility improvement suggestions, mess ratings, or classroom concerns with verified transparency.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 apple-button-primary text-xs font-bold py-2 px-4"
              >
                <span>Post Campus Feedback</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userFeedbacks.map(post => {
                const isLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
                return (
                  <div key={post.id} className="apple-card p-5 sm:p-6 space-y-4 border-l-4 border-l-amber-500">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            Campus Feedback
                          </span>
                          {post.feedbackCategory && (
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {post.feedbackCategory}
                            </span>
                          )}
                          {post.isAnonymous && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                              Anonymous Author
                            </span>
                          )}
                        </div>
                        {post.feedbackTarget && (
                          <p className="text-xs text-amber-900 font-semibold mt-1">
                            Target Unit: <strong>{post.feedbackTarget}</strong>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {post.collegeName || 'Campus'} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Rating if present */}
                      {(post.rating || post.institutionRating) && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-black text-amber-900">
                            {(post.rating || post.institutionRating || 4).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">/ 5.0</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Media if present */}
                    {post.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-96 bg-black/5">
                        {isVideoMedia(post.imageUrl) ? (
                          <video
                            src={post.imageUrl}
                            controls
                            className="w-full max-h-96 object-contain"
                          />
                        ) : (
                          <img
                            src={post.imageUrl}
                            alt="Feedback attachment"
                            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition"
                            onClick={() => setZoomedPost(post)}
                          />
                        )}
                      </div>
                    )}

                    {/* Engagement bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center gap-1 font-semibold transition ${
                            isLiked ? 'text-[#1687D4]' : 'hover:text-slate-900'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </button>
                        <button
                          onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                          className="flex items-center gap-1 font-semibold hover:text-slate-900 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href="/?filter=feedback"
                          className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          <span>View in Feedback Stream</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => setPostPendingDelete(post)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REPOSTS */}
      {activeTab === 'reposts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-600" />
              <span>Posts Reposted by You ({userReposts.length})</span>
            </h2>
            <Link
              href="/"
              className="apple-button-secondary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
            >
              <span>Explore Campus Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {userReposts.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Repeat className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-900">No reposts yet</p>
              <p className="max-w-sm mx-auto text-slate-500">
                When you repost campus announcements, student achievements, or discussions from the feed, they will show up here.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 apple-button-secondary text-xs font-bold py-2 px-4"
              >
                <span>Browse Campus Feed</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userReposts.map(post => {
                const isLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
                return (
                  <div key={post.id} className="apple-card p-5 sm:p-6 space-y-3 border-l-4 border-l-purple-500">
                    {/* Repost Header Badge */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-purple-700 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reposted to your profile</span>
                      </div>
                      <button
                        onClick={() => handleRepost(post.id)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                      >
                        Undo Repost
                      </button>
                    </div>

                    {/* Original Author Info */}
                    <div className="flex items-center gap-3">
                      <Link href={`/user/${post.authorUsername}`}>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {post.authorName?.[0] || 'U'}
                        </div>
                      </Link>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/user/${post.authorUsername}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition"
                          >
                            {post.authorName}
                          </Link>
                          {post.isVerifiedAuthor && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span className="text-[10px] font-semibold text-slate-400">
                            @{post.authorUsername}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {post.authorRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Media */}
                    {post.imageUrl && (
                      isVideoMedia(post.imageUrl) ? (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-black">
                          <video
                            src={post.imageUrl}
                            controls
                            className="w-full max-h-[420px] rounded-2xl bg-black"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => setZoomedPost(post)}
                          className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-zoom-in"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Post attachment"
                            loading="lazy"
                            className="w-full max-h-[420px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom Full</span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Footer Stats & Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.commentsCount} comments</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-600 font-semibold">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{post.sharesCount} reposts</span>
                        </span>
                      </div>

                      <Link
                        href={`/#${post.id}`}
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>View in Feed</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* STUDENT ROLE PROFILE */}
          {currentUser.role === 'student' && (
            <>
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Student Academic Profile & Batch
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Active Student
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Primary College</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.collegeName || 'Not Set'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department & Major</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.department || 'Computer Science & Engineering'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Degree Program</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.course || 'B.Tech Computer Science'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Graduation Batch</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.graduationBatch || '2027'}</strong>
                  </div>
                </div>
              </div>

              {/* Student Verified Technical Expertise & Skill Matrix */}
              <div className="apple-card p-6 text-xs space-y-4">
                <StudentSkillsSection
                  skills={currentUser.skills}
                  role={currentUser.role}
                  isOwner={true}
                  onEdit={() => setIsEditingProfile(true)}
                  initialCount={4}
                  title="Technical Skills, Specializations & Competency Matrix"
                />
              </div>

              {/* Joined Communities & Channels */}
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Enrolled Campus Communities & Channels</h3>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {currentUser.joinedServerIds?.length || 0} Communities Joined
                  </span>
                </div>

                {(!currentUser.joinedServerIds || currentUser.joinedServerIds.length === 0) ? (
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <p>You haven't joined any campus communities yet.</p>
                    <Link
                      href="/connect"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                    >
                      <span>Explore & Join Communities</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servers
                      .filter(s => currentUser.joinedServerIds?.includes(s.id))
                      .map(s => (
                        <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {s.memberCount} members
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {s.channels.map(g => (
                                <span
                                  key={g.id}
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                    currentUser.joinedGroupIds?.includes(g.id)
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                                      : 'bg-white text-slate-500 border-slate-200'
                                  }`}
                                >
                                  #{g.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/servers?id=${s.id}`}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                            >
                              Open Hub
                            </Link>
                            <button
                              type="button"
                              onClick={() => leaveServer(s.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ALUMNI ROLE PROFILE */}
          {currentUser.role === 'alumni' && (
            <>
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Professional Industry & Mentorship Profile
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Alumni Mentor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Professional Designation</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.headline || 'Senior Software Engineer'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Mentorship Focus Areas</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">System Design, Cloud Architecture, Interview Coaching</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Alma Mater College</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.collegeName || 'PSG College of Technology'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Graduation Batch</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.graduationBatch || '2021'}</strong>
                  </div>
                </div>

                {/* Follower Threshold & Weekly Quota Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Follower Requirement</span>
                      <span className="text-xs font-mono font-bold">{currentUser.followersCount || 0} / 5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (currentUser.followersCount || 0) >= 5 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, ((currentUser.followersCount || 0) / 5) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {(currentUser.followersCount || 0) >= 5
                        ? 'Eligible to publish updates to campus network'
                        : `Need ${5 - (currentUser.followersCount || 0)} more followers to unlock posting`}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Weekly Post Allowance</span>
                      <span className="text-xs font-mono font-bold">{currentUser.weeklyPostCount || 0} / 5</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, ((currentUser.weeklyPostCount || 0) / 5) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      5 posts allowed per rolling 7-day period
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* FACULTY ROLE PROFILE */}
          {currentUser.role === 'faculty' && (
            <>
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Faculty Academic & Research Profile
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Academic Scholar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Academic Designation</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.headline || 'Professor & Head of Department'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.department || 'Computer Science & Engineering'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Research Specialization</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">Distributed Systems, AI, Cryptography</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Campus Institution</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.collegeName || 'PSG College of Technology'}</strong>
                  </div>
                </div>

                {/* Community Page Requests Status */}
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-2">My Community Proposals</h3>
                  {servers.filter(s => s.requestedByFacultyId === currentUser.id).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No community proposals submitted yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {servers.filter(s => s.requestedByFacultyId === currentUser.id).map(req => (
                        <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-slate-900">{req.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.pendingApproval ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {req.pendingApproval ? 'Pending Institution Approval' : 'Approved & Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* INSTITUTION ROLE PROFILE */}
          {currentUser.role === 'institution' && (
            <>
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      University Accreditation & Executive Details
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Institution Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Certified License Number</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A] font-mono">
                      {currentUser?.certifiedLicenseNumber || 'AICTE-TN-2024-8841'}
                    </strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Accreditation Grade</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">
                      {currentUser?.accreditationGrade || 'NAAC A++ (3.72 CGPA)'}
                    </strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Institution Name</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.collegeName || 'PSG College of Technology'}</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Official Community Page Status</span>
                    <strong className="mt-1 block text-sm font-bold text-emerald-700">
                      {servers.some(s => s.institutionOwnerId === currentUser.id && !s.pendingApproval)
                        ? '1 Official Community Page Active (Max Reached)'
                        : 'Eligible to Deploy Official Community'}
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ADMIN ROLE PROFILE */}
          {currentUser.role === 'admin' && (
            <>
              <div className="apple-card p-6 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Platform Super Administrator Root Clearances
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Root Clearance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Account Deletion Authority</span>
                    <strong className="mt-1 block text-sm font-bold text-rose-700">Permanent User & Post Purge Enabled</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Comment Moderation Desk</span>
                    <strong className="mt-1 block text-sm font-bold text-emerald-700">Inline Comment Deletion Enabled</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Developer Terminal Access</span>
                    <strong className="mt-1 block text-sm font-bold text-[#0F172A]">Interactive System CLI Enabled</strong>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Account Unban Privilege</span>
                    <strong className="mt-1 block text-sm font-bold text-blue-700">Lift Ragebait / Toxicity Restrictions</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Open Admin Platform Console</span>
                  </Link>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedColleges.length === 0 ? (
            <div className="apple-card p-8 text-center text-xs text-[#64748B]">
              No colleges saved yet. Bookmark institutions in Explore to build your research space.
            </div>
          ) : (
            savedColleges.map((col) => (
              <div
                key={col.id}
                className="apple-card apple-card-hover flex items-center justify-between p-5 text-xs"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{col.name}</h3>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">{col.location}, {col.state} • {col.collegeType}</p>
                </div>
                <Link
                  href={`/colleges/${col.slug}`}
                  className="apple-button-secondary text-xs font-semibold !py-1.5 !px-3"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="apple-card p-6 sm:p-8 space-y-5 text-xs">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#0F172A]">Institutional Verification Queue</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Spec Rule: Authentication is separate from Verification. Verified status requires documentary evidence reviewed by Admin.
            </p>
          </div>

          {verificationSubmitted ? (
            <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#059669]" />
              <h3 className="mt-3 font-bold text-base text-[#065F46]">Verification Proof Submitted</h3>
              <p className="mt-1 text-xs text-[#047857]">
                Current Lifecycle: <strong>Pending → Admin Review</strong>. Once verified, your profile and reviews will display the official verified badge.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setVerificationSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Document / Proof Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[#0F172A] focus:outline-none"
                >
                  <option value="College Institutional Email">Official College Email (@institution.edu)</option>
                  <option value="Alumni Degree Certificate">Alumni / Student ID Card</option>
                  <option value="Graduation Certificate">Graduation Proof / Provisional Certificate</option>
                  <option value="Institution Admin Letter">Dean / Registrar Authorization Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Registration Number / Verification Details
                </label>
                <textarea
                  rows={3}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Provide ID registration number or official institution credentials..."
                  className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs sm:text-sm text-[#0F172A] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="apple-button-primary text-xs font-bold py-2.5"
              >
                Submit for Admin Verification
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: LENZCOINS & GAMIFICATION REWARDS */}
      {activeTab === 'rewards' && (
        <LenzRewardsHub />
      )}

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        currentUser={currentUser}
        onSave={updateProfile}
      />

      {/* FOLLOWERS / FOLLOWING INTERACTIVE MODAL */}
      {followersModalTitle && (
        <FollowersListModal
          isOpen={Boolean(followersModalTitle)}
          onClose={() => setFollowersModalTitle(null)}
          title={followersModalTitle}
          userIds={followersModalTitle === 'Followers' ? (currentUser.followers || []) : (currentUser.following || [])}
        />
      )}

      {/* PINTEREST ZOOM MODAL */}
      {zoomedPost && (
        <PinterestImageModal
          post={zoomedPost}
          onClose={() => setZoomedPost(null)}
          onLike={toggleLikePost}
          onComment={addComment}
          currentUser={currentUser}
        />
      )}

      {/* DELETE POST / REEL CONFIRMATION MODAL */}
      {postPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-rose-200/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {postPendingDelete.imageUrl && isVideoMedia(postPendingDelete.imageUrl) ? 'Reel / Video' : 'Post'}?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone. Are you sure you want to permanently delete this content?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 max-h-32 overflow-y-auto">
              <p className="line-clamp-3 italic">"{postPendingDelete.content}"</p>
              {postPendingDelete.imageUrl && (
                <span className="inline-block mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Attachment: {isVideoMedia(postPendingDelete.imageUrl) ? '📹 Video Reel' : '🖼️ Image Media'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPostPendingDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePost(postPendingDelete.id);
                  setPostPendingDelete(null);
                  setActionFeedback('🗑️ Post deleted permanently.');
                  setTimeout(() => setActionFeedback(null), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
