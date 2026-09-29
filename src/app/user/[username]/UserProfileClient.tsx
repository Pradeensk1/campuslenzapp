'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_USERS } from '@/lib/mockData';
import {
  UserCheck,
  Building2,
  MapPin,
  Calendar,
  Grid,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Share2,
  Check,
  ArrowLeft,
  GraduationCap,
  Heart,
  Edit3,
  ZoomIn,
  Trash2,
  Award,
  Repeat,
  Send,
  X,
  Star,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import EditProfileModal from '@/components/EditProfileModal';
import PinterestImageModal from '@/components/PinterestImageModal';
import FollowersListModal from '@/components/FollowersListModal';
import StudentSkillsSection from '@/components/StudentSkillsSection';
import { isVideoMedia } from '@/lib/mediaUtils';

export default function UserProfileClient({
  username,
  initialProfile,
  initialPosts = [],
}: {
  username: string;
  initialProfile?: any;
  initialPosts?: any[];
}) {
  const router = useRouter();
  const { allUsers, currentUser, toggleFollowUser, posts, reviews, colleges, toggleLikePost, addComment, updateProfile, deleteUser, repostPost, deletePost } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'feedback' | 'reposts' | 'about'>('posts');
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

  const cleanUsername = (username || '').toLowerCase();
  const profileUser =
    allUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        u.id === username
    ) ||
    initialProfile ||
    INITIAL_USERS.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        u.id === username
    ) ||
    (currentUser &&
    (currentUser.username?.toLowerCase() === cleanUsername || currentUser.id === username)
      ? currentUser
      : null) || {
      id: username,
      username: username,
      name: decodeURIComponent(username).replace(/[-_]/g, ' '),
      fullName: decodeURIComponent(username).replace(/[-_]/g, ' '),
      role: 'student' as const,
      headline: 'Campus Contributor',
      bio: 'Verified student community member.',
      collegeName: 'CampusLenz Partner Institute',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      badges: ['Active Contributor'],
      createdAt: new Date().toISOString(),
    };

  const isSelf = currentUser
    ? (profileUser.id === currentUser.id ||
       (profileUser.username && currentUser.username &&
        profileUser.username.toLowerCase() === currentUser.username.toLowerCase()))
    : false;
  const isFollowing = currentUser
    ? ((currentUser.following || []).includes(profileUser.id) || (currentUser.following || []).includes(profileUser.username))
    : false;

  const activePosts = posts.length > 0 ? posts : initialPosts;

  // Get all posts authored by this specific user (safe ID, username, and authorName matching)
  const userPosts = activePosts.filter((p: any) => {
    const matchesId = p.authorId === profileUser.id || p.authorId === `user-${profileUser.username}`;
    const matchesUsername = Boolean(p.authorUsername && profileUser.username && p.authorUsername.toLowerCase() === profileUser.username.toLowerCase());
    const matchesName = Boolean(p.authorName && (
      (profileUser.fullName && p.authorName.toLowerCase() === profileUser.fullName.toLowerCase()) ||
      (profileUser.name && p.authorName.toLowerCase() === profileUser.name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });
  const userStandardPosts = userPosts.filter((p: any) => p.postType !== 'feedback');

  const userReviews = (reviews || []).filter((r: any) => {
    const matchesId = r.userId === profileUser.id || r.userId === `user-${profileUser.username}`;
    const matchesUsername = Boolean(r.authorUsername && profileUser.username && r.authorUsername.toLowerCase() === profileUser.username.toLowerCase());
    const matchesName = Boolean(r.authorName && (
      (profileUser.fullName && r.authorName.toLowerCase() === profileUser.fullName.toLowerCase()) ||
      (profileUser.name && r.authorName.toLowerCase() === profileUser.name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });

  const userFeedbacks = activePosts.filter((p: any) => {
    const isFeedback = p.postType === 'feedback' || p.topic?.toLowerCase().includes('feedback') || p.topic?.toLowerCase().includes('grievance');
    if (!isFeedback) return false;
    const matchesId = p.authorId === profileUser.id || p.authorId === `user-${profileUser.username}`;
    const matchesUsername = Boolean(p.authorUsername && profileUser.username && p.authorUsername.toLowerCase() === profileUser.username.toLowerCase());
    const matchesName = Boolean(p.authorName && (
      (profileUser.fullName && p.authorName.toLowerCase() === profileUser.fullName.toLowerCase()) ||
      (profileUser.name && p.authorName.toLowerCase() === profileUser.name.toLowerCase())
    ));
    return matchesId || matchesUsername || matchesName;
  });

  const userReposts = activePosts.filter(
    (p: any) =>
      (profileUser.id && Array.isArray(p.repostedUserIds) && p.repostedUserIds.includes(profileUser.id)) ||
      (profileUser.id && p.repostedByStudent?.studentId === profileUser.id) ||
      (profileUser.id && p.repostedByFaculty?.facultyId === profileUser.id) ||
      (profileUser.id && p.repostedByInstitution?.institutionId === profileUser.id)
  );
  const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1687D4] shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-[#0875BD] hover:text-[#075080]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Back to feed */}
      <Link
        href="/"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Campus Feed</span>
      </Link>

      {/* INSTAGRAM-STYLE PROFILE HEADER CARD */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Instagram Circular Avatar */}
          <div className="relative shrink-0">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.fullName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-[#EFF6FF] object-cover shadow-md"
              />
            ) : (
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-[#EFF6FF] bg-gradient-to-tr from-[#2563EB] to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
                {profileUser.fullName[0]}
              </div>
            )}
            {profileUser.isVerified && (
              <span className="absolute bottom-1 right-1 rounded-full bg-[#059669] p-1 text-white border-2 border-white shadow-xs">
                <UserCheck className="h-4 w-4" />
              </span>
            )}
          </div>

          {/* Details & Instagram Counter Stats */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                    {profileUser.fullName}
                  </h1>
                  <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB] capitalize">
                    {profileUser.role}
                  </span>
                  {profileUser.role === 'institution' && profileUser.accreditationGrade && (
                    <span className="flex items-center space-x-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                      <Award className="h-3.5 w-3.5" />
                      <span>{profileUser.accreditationGrade}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">@{profileUser.username}</p>
              </div>

              {/* Action Buttons (Follow / Message / Admin Delete User) */}
              <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-1">
                {!isSelf ? (
                  <>
                    <button
                      onClick={() => toggleFollowUser(profileUser.id)}
                      className={`apple-button-primary text-xs !py-1.5 !px-4 ${
                        isFollowing ? '!bg-[#F1F5F9] !text-[#0F172A] hover:!bg-[#E2E8F0]' : ''
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link
                      href="/messages"
                      className="apple-button-secondary text-xs !py-1.5 !px-3 font-semibold"
                    >
                      Message
                    </Link>

                    {/* Admin Delete User Authority */}
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`⚠️ SUPER ADMIN CONFIRMATION:\n\nPermanently delete user @${profileUser.username} (${profileUser.fullName}) and purge all their posts from the platform?`)) {
                            deleteUser(profileUser.id);
                            router.push('/admin');
                          }
                        }}
                        className="apple-button-secondary text-xs !py-1.5 !px-3 font-semibold text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center space-x-1"
                        title="Admin Action: Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete User</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="apple-button-secondary text-xs !py-1.5 !px-3 font-semibold flex items-center space-x-1.5 hover:border-[#2563EB]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* INSTAGRAM 7-STAT GRID (Posts, Reviews, Feedback, Reposts, Followers, Following, Likes) */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 border-y border-[#F1F5F9] py-3 text-center">
              <button
                onClick={() => setActiveTab('posts')}
                className={`rounded-xl p-1 transition cursor-pointer group ${activeTab === 'posts' ? 'bg-blue-50' : 'hover:bg-blue-50/60'}`}
              >
                <p className="text-base sm:text-lg font-black text-[#0F172A] group-hover:text-blue-600">
                  {userStandardPosts.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-blue-600">
                  Posts
                </p>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`rounded-xl p-1 transition cursor-pointer group ${activeTab === 'reviews' ? 'bg-amber-50' : 'hover:bg-amber-50/60'}`}
              >
                <p className="text-base sm:text-lg font-black text-amber-600 group-hover:text-amber-700">
                  {userReviews.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-amber-600">
                  Reviews
                </p>
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`rounded-xl p-1 transition cursor-pointer group ${activeTab === 'feedback' ? 'bg-amber-100/70' : 'hover:bg-amber-50/60'}`}
              >
                <p className="text-base sm:text-lg font-black text-amber-800 group-hover:text-amber-900">
                  {userFeedbacks.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-amber-800">
                  Feedback
                </p>
              </button>
              <button
                onClick={() => setActiveTab('reposts')}
                className={`rounded-xl p-1 transition cursor-pointer group ${activeTab === 'reposts' ? 'bg-purple-50' : 'hover:bg-purple-50/60'}`}
              >
                <p className="text-base sm:text-lg font-black text-purple-600 group-hover:text-purple-700">
                  {userReposts.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-purple-600">
                  Reposts
                </p>
              </button>
              <button
                onClick={() => setFollowersModalTitle('Followers')}
                className="hover:bg-blue-50/60 rounded-xl p-1 transition cursor-pointer group"
              >
                <p className="text-base sm:text-lg font-black text-[#2563EB] group-hover:underline">
                  {profileUser.followersCount || (profileUser.followers || []).length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-blue-600">
                  Followers
                </p>
              </button>
              <button
                onClick={() => setFollowersModalTitle('Following')}
                className="hover:bg-blue-50/60 rounded-xl p-1 transition cursor-pointer group"
              >
                <p className="text-base sm:text-lg font-black text-[#0F172A] group-hover:underline">
                  {profileUser.followingCount || (profileUser.following || []).length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B] group-hover:text-blue-600">
                  Following
                </p>
              </button>
              <div className="p-1">
                <p className="text-base sm:text-lg font-black text-[#D97706]">{totalLikesReceived}</p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B]">Likes</p>
              </div>
            </div>

            {/* Bio & Academic Tags */}
            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-[#0F172A]">{profileUser.headline}</p>
              {profileUser.bio && (
                <p className="text-[#475569] leading-relaxed">
                  {profileUser.bio.replace(/\s*<!--SKILLS-->[\s\S]*$/, '').trim()}
                </p>
              )}
              {profileUser.collegeName && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[#64748B]">
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span className="font-medium text-[#2563EB]">{profileUser.collegeName}</span>
                  </div>
                  {profileUser.course && (
                    <>
                      <span>•</span>
                      <span>{profileUser.course} ({profileUser.graduationBatch})</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STUDENT SKILLS & TECHNICAL EXPERTISE (WITH VIEW MORE / VIEW LESS) */}
        {(profileUser.role === 'student' || (profileUser.skills && profileUser.skills.length > 0)) && (
          <div className="pt-3 border-t border-[#F1F5F9]">
            <StudentSkillsSection
              skills={profileUser.skills}
              role={profileUser.role}
              isOwner={isSelf}
              onEdit={() => setIsEditingProfile(true)}
              initialCount={3}
            />
          </div>
        )}

        {/* AI CAREER COPILOT - CONNECTED DATABASE HERO BANNER */}
        {profileUser.role === 'student' && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">AI Career Copilot Ready</span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Database Linked</span>
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 mt-0.5">
                  Synchronized with {profileUser.skills?.length || 0} skills, {profileUser.department || 'academics'}, &amp; {profileUser.collegeName || 'institute'} database.
                </p>
              </div>
            </div>

            <Link
              href="/career"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-[#1687D4] hover:from-blue-600 hover:to-[#075080] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>{isSelf ? 'Launch My Career Copilot' : 'Explore Career Copilot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Profile Tabs */}
        <div className="flex border-t border-[#F1F5F9] pt-2 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 min-w-[75px] py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'posts'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>POSTS ({userStandardPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[75px] py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-[#64748B] hover:text-amber-600'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>REVIEWS ({userReviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 min-w-[75px] py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'feedback'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-[#64748B] hover:text-amber-700'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>FEEDBACK ({userFeedbacks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reposts')}
            className={`flex-1 min-w-[75px] py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'reposts'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-[#64748B] hover:text-purple-600'
            }`}
          >
            <Repeat className="h-4 w-4" />
            <span>REPOSTS ({userReposts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[75px] py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'about'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>CREDENTIALS</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userStandardPosts.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-[#64748B] space-y-2">
              <p className="font-semibold text-sm text-[#0F172A]">No posts published yet</p>
              <p>When {profileUser.fullName} shares updates or mentorship posts, they will appear here.</p>
            </div>
          ) : (
            userStandardPosts.map((post) => {
              const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
              return (
                <div key={post.id} className="apple-card p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-semibold text-[#2563EB]">#{post.topic || 'Campus'}</span>
                    <div className="flex items-center gap-2">
                      <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {(isSelf || currentUser?.role === 'admin') && (
                        <button
                          onClick={() => setPostPendingDelete(post)}
                          title="Delete Post / Reel"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* High Resolution Post Image with Zoom Trigger or Video Player */}
                  {post.imageUrl && (
                    isVideoMedia(post.imageUrl) ? (
                      <div className="mt-3 rounded-xl overflow-hidden border border-[#E2E8F0] bg-black">
                        <video
                          src={post.imageUrl}
                          controls
                          className="w-full max-h-[380px] rounded-xl bg-black object-contain"
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => setZoomedPost(post)}
                        className="mt-3 rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] relative group cursor-zoom-in"
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post media attachment"
                          loading="lazy"
                          className="w-full max-h-[360px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <ZoomIn className="h-3 w-3" />
                          <span>Zoom</span>
                        </div>
                      </div>
                    )
                  )}

                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                          isLiked ? 'text-[#2563EB]' : 'hover:text-[#0F172A]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                      </button>
                      <button
                        onClick={() => setActiveCommentsPostId(prev => prev === post.id ? null : post.id)}
                        className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                          activeCommentsPostId === post.id ? 'text-[#2563EB]' : 'hover:text-[#0F172A]'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentsCount} comments</span>
                      </button>
                      <button
                        onClick={() => handleRepost(post.id)}
                        className="flex items-center space-x-1.5 font-semibold hover:text-purple-600 transition-colors"
                      >
                        <Repeat className="h-4 w-4" />
                        <span>{post.sharesCount} reposts</span>
                      </button>
                    </div>
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
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Institutional Reviews &amp; Ratings ({userReviews.length})</span>
            </h2>
            {isSelf && (
              <Link
                href="/create"
                className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
              >
                <span>Write Review</span>
              </Link>
            )}
          </div>

          {userReviews.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-[#64748B] space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <p className="font-semibold text-sm text-[#0F172A]">No reviews published yet</p>
              <p>When {profileUser.fullName} reviews educational institutions or courses, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((rev: any) => {
                const targetCollege = colleges.find((c: any) => c.id === rev.collegeId);
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

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span className="text-xs font-black text-amber-900">{Number(rev.overallRating || 5).toFixed(1)}</span>
                        <span className="text-[10px] text-amber-700 font-medium">/ 5.0</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{rev.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{rev.experience}</p>
                    </div>

                    {rev.dimensions && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        {Object.entries(rev.dimensions).map(([key, val]) => (
                          <div key={key} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                            <span className="capitalize text-slate-600 font-medium">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-bold text-slate-900 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {typeof val === 'number' ? val.toFixed(1) : (val as any)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        {rev.pros && rev.pros.length > 0 && (
                          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <span>✓ Highlights &amp; Pros</span>
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-900">
                              {rev.pros.map((p: string, idx: number) => (
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
                              {rev.cons.map((c: string, idx: number) => (
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

      {/* TAB CONTENT: FEEDBACK & GRIEVANCES */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Campus Feedback &amp; Grievances ({userFeedbacks.length})</span>
            </h2>
            {isSelf && (
              <Link
                href="/create"
                className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
              >
                <span>Submit Feedback</span>
              </Link>
            )}
          </div>

          {userFeedbacks.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-[#64748B] space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                💡
              </div>
              <p className="font-semibold text-sm text-[#0F172A]">No campus feedback posted yet</p>
              <p>Campus grievances, facility reviews, and improvement suggestions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userFeedbacks.map((post: any) => {
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

                      {(post.rating || post.institutionRating) && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-black text-amber-900">
                            {Number(post.rating || post.institutionRating || 4).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">/ 5.0</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

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
                        {(isSelf || currentUser?.role === 'admin') && (
                          <button
                            onClick={() => setPostPendingDelete(post)}
                            className="text-slate-400 hover:text-rose-600 transition"
                            title="Delete Feedback"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
          {userReposts.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-[#64748B] space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Repeat className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-[#0F172A]">No reposts yet</p>
              <p>Posts reposted by @{profileUser.username} will appear here.</p>
            </div>
          ) : (
            userReposts.map((post) => {
              const isLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
              const hasCurrentUserReposted = currentUser ? (post.repostedUserIds || []).includes(currentUser.id) : false;
              return (
                <div key={post.id} className="apple-card p-6 space-y-3 border-l-4 border-l-purple-500">
                  {/* Repost Header Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-purple-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-purple-600" />
                      <span>Reposted by @{profileUser.username}</span>
                    </div>
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
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
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
                  <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* High Resolution Post Image with Zoom Trigger or Video Player */}
                  {post.imageUrl && (
                    isVideoMedia(post.imageUrl) ? (
                      <div className="mt-3 rounded-xl overflow-hidden border border-[#E2E8F0] bg-black">
                        <video
                          src={post.imageUrl}
                          controls
                          className="w-full max-h-[380px] rounded-xl bg-black object-contain"
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => setZoomedPost(post)}
                        className="mt-3 rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] relative group cursor-zoom-in"
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post media attachment"
                          loading="lazy"
                          className="w-full max-h-[360px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <ZoomIn className="h-3 w-3" />
                          <span>Zoom</span>
                        </div>
                      </div>
                    )
                  )}

                  {/* Footer Stats & Actions */}
                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                          isLiked ? 'text-[#2563EB]' : 'hover:text-[#0F172A]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentsCount} comments</span>
                      </div>
                      <button
                        onClick={() => repostPost(post.id)}
                        className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                          hasCurrentUserReposted ? 'text-purple-600 font-bold' : 'hover:text-purple-600'
                        }`}
                      >
                        <Repeat className="h-4 w-4" />
                        <span>{post.sharesCount} reposts</span>
                      </button>
                    </div>

                    <Link
                      href={`/#${post.id}`}
                      className="text-blue-600 font-semibold hover:underline text-[11px]"
                    >
                      View in Feed
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <div className="apple-card p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              {profileUser.role === 'institution'
                ? 'Official Institutional Accreditation & Governance'
                : profileUser.role === 'alumni'
                ? 'Alumni Industry & Career Credentials'
                : profileUser.role === 'faculty'
                ? 'Faculty Academic & Department Portfolio'
                : 'Verified Academic Records'}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-blue-50 text-blue-700 border border-blue-200">
              {profileUser.role} Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Affiliated College</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.collegeName || 'Not Listed'}</strong>
            </div>

            {profileUser.role === 'institution' ? (
              <>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Certified License Number</span>
                  <strong className="mt-1 block text-sm font-bold text-purple-700 font-mono">
                    {profileUser.certifiedLicenseNumber || 'AICTE-TN-2024-8841'}
                  </strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Accreditation Grade</span>
                  <strong className="mt-1 block text-sm font-bold text-emerald-700">
                    {profileUser.accreditationGrade || 'NAAC A++'}
                  </strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Institutional Status</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">AICTE Approved & NAAC Accredited</strong>
                </div>
              </>
            ) : profileUser.role === 'alumni' ? (
              <>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Current Role / Company</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.headline || 'Industry Professional'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Graduation Batch</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.graduationBatch || '2021'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Mentorship Mode</span>
                  <strong className="mt-1 block text-sm font-bold text-emerald-700">Open to 1-on-1 Student Guidance</strong>
                </div>
              </>
            ) : profileUser.role === 'faculty' ? (
              <>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Designation</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.headline || 'Academic Faculty'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.department || 'Computer Science'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Research Focus</span>
                  <strong className="mt-1 block text-sm font-bold text-amber-800">Advanced Computing & Systems</strong>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.department || 'Not Listed'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Degree / Program</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.course || 'Not Listed'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Graduation Batch</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.graduationBatch || 'Not Listed'}</strong>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 col-span-1 sm:col-span-2">
                  <StudentSkillsSection
                    skills={profileUser.skills}
                    role={profileUser.role}
                    isOwner={isSelf}
                    onEdit={() => setIsEditingProfile(true)}
                    initialCount={4}
                    title="Verified Student Skills & Expertise"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PINTEREST ZOOM LIGHTBOX MODAL */}
      <PinterestImageModal
        post={zoomedPost}
        onClose={() => setZoomedPost(null)}
        onLike={toggleLikePost}
        onComment={addComment}
        currentUser={currentUser}
      />

      {/* EDIT PROFILE MODAL */}
      {currentUser && (
        <EditProfileModal
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          currentUser={currentUser}
          onSave={updateProfile}
        />
      )}

      {/* FOLLOWERS / FOLLOWING INTERACTIVE MODAL */}
      {followersModalTitle && (
        <FollowersListModal
          isOpen={Boolean(followersModalTitle)}
          onClose={() => setFollowersModalTitle(null)}
          title={followersModalTitle}
          userIds={followersModalTitle === 'Followers' ? (profileUser.followers || []) : (profileUser.following || [])}
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
