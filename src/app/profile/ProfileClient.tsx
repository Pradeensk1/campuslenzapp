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
  ZoomIn
} from 'lucide-react';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';
import FollowersListModal from '@/components/FollowersListModal';
import PinterestImageModal from '@/components/PinterestImageModal';
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
    servers,
    leaveServer,
    leaveGroup,
    toggleLikePost,
    repostPost,
    addComment
  } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts' | 'details' | 'saved' | 'verification'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [zoomedPost, setZoomedPost] = useState<Post | null>(null);
  const [followersModalTitle, setFollowersModalTitle] = useState<'Followers' | 'Following' | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const savedColleges = colleges.filter(c => savedCollegeIds.includes(c.id));
  const userPosts = posts.filter(p =>
    (currentUser?.id && (p.authorId === currentUser.id || p.authorId === `user-${currentUser.username}`)) ||
    (p.authorUsername && currentUser?.username && p.authorUsername.toLowerCase() === currentUser.username.toLowerCase())
  );
  const userReposts = posts.filter(p =>
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
        <p className="text-xs text-slate-500">
          Your profile, saved colleges, and verification details are linked to your authenticated account.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="apple-button-primary text-xs font-bold py-2.5 px-5"
          >
            Sign In to Account
          </Link>
          <Link
            href="/register"
            className="apple-button-secondary text-xs font-bold py-2.5 px-5"
          >
            Register Fresh
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1.5 hover:border-[#2563EB]"
                >
                  <Edit3 className="h-3 w-3 text-[#2563EB]" />
                  <span>Edit Profile & Avatar</span>
                </button>
                <Link
                  href={`/user/${currentUser.username}`}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1 text-slate-600 hover:text-slate-900"
                >
                  <span>Public View</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Account Security & Sign Out Section */}
          <div className="flex flex-col space-y-2 text-xs">
            <span className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
              Active Session:
            </span>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#0F172A] capitalize">
                  {currentUser?.role} Account
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Link
                  href="/login"
                  className="apple-button-secondary text-[10px] !py-1 !px-2.5 font-bold flex-1 text-center"
                >
                  Switch Account
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="apple-button-primary text-[10px] !py-1 !px-2.5 font-bold flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INSTAGRAM-STYLE INTERACTIVE FOLLOWERS / FOLLOWING STATS BAR */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-[#F1F5F9] pt-4 text-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`p-2.5 rounded-2xl transition cursor-pointer group text-center ${
              activeTab === 'posts' ? 'bg-blue-50/80 border border-blue-200' : 'bg-slate-50/60 hover:bg-slate-100/60'
            }`}
          >
            <p className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
              {userPosts.length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-blue-600">
              Posts (View)
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
              Reposts (View)
            </p>
          </button>

          <button
            onClick={() => setFollowersModalTitle('Followers')}
            className="p-2.5 rounded-2xl bg-slate-50/60 hover:bg-blue-50/60 transition group cursor-pointer text-center"
          >
            <p className="text-base sm:text-lg font-black text-blue-600 group-hover:underline">
              {currentUser.followersCount || (currentUser.followers || []).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-blue-600">
              Followers (Live)
            </p>
          </button>

          <button
            onClick={() => setFollowersModalTitle('Following')}
            className="p-2.5 rounded-2xl bg-slate-50/60 hover:bg-blue-50/60 transition group cursor-pointer text-center"
          >
            <p className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 group-hover:underline">
              {currentUser.followingCount || (currentUser.following || []).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-blue-600">
              Following (Live)
            </p>
          </button>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-4 text-xs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'posts'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Posts ({userPosts.length})</span>
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
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            Academic Profile
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Colleges ({savedColleges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'verification'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            Identity Verification
          </button>
        </div>
      </div>

      {/* TAB CONTENT: POSTS AUTHORED BY USER */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Posts Authored by You ({userPosts.length})</span>
            </h2>
            <Link
              href="/create"
              className="apple-button-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create New Post</span>
            </Link>
          </div>

          {userPosts.length === 0 ? (
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
              {userPosts.map(post => {
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
                      <span>
                        {new Date(post.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
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
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.commentsCount} comments</span>
                        </span>
                        <button
                          onClick={() => repostPost(post.id)}
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
                        onClick={() => repostPost(post.id)}
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
    </div>
  );
}
