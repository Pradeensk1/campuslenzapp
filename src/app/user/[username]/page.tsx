'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
  ZoomIn
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import EditProfileModal from '@/components/EditProfileModal';
import PinterestImageModal from '@/components/PinterestImageModal';

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const { allUsers, currentUser, toggleFollowUser, posts, toggleLikePost, addComment, updateProfile } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [zoomedPost, setZoomedPost] = useState<Post | null>(null);

  const profileUser = allUsers.find(
    (u) => u.username.toLowerCase() === resolvedParams.username.toLowerCase()
  );

  if (!profileUser) {
    notFound();
  }

  const isSelf = currentUser ? profileUser.id === currentUser.id : false;
  const isFollowing = currentUser ? currentUser.following.includes(profileUser.id) : false;

  // Get all posts authored by this specific user
  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const totalLikesReceived = userPosts.reduce((acc, p) => acc + p.likesCount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-[#EFF6FF] bg-[#2563EB] text-white flex items-center justify-center text-3xl font-black shadow-md">
              {profileUser.fullName[0]}
            </div>
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
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                    {profileUser.fullName}
                  </h1>
                  <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB] capitalize">
                    {profileUser.role}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">@{profileUser.username}</p>
              </div>

              {/* Action Buttons (Follow / Message) */}
              <div className="flex items-center justify-center space-x-2">
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

            {/* INSTAGRAM 4-STAT GRID (Phase 3 Requirement: Posts, Followers, Following, Likes) */}
            <div className="grid grid-cols-4 gap-2 border-y border-[#F1F5F9] py-3 text-center">
              <div>
                <p className="text-base sm:text-lg font-black text-[#0F172A]">{userPosts.length}</p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B]">Posts</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-[#2563EB]">{profileUser.followersCount}</p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B]">Followers</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-[#0F172A]">{profileUser.followingCount}</p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B]">Following</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-[#D97706]">{totalLikesReceived}</p>
                <p className="text-[10px] uppercase font-semibold text-[#64748B]">Likes</p>
              </div>
            </div>

            {/* Bio & Academic Tags */}
            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-[#0F172A]">{profileUser.headline}</p>
              {profileUser.bio && (
                <p className="text-[#475569] leading-relaxed">{profileUser.bio}</p>
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

        {/* Profile Tabs */}
        <div className="flex border-t border-[#F1F5F9] pt-2 text-xs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>POSTS ({userPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>ACADEMIC CREDENTIALS</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-[#64748B] space-y-2">
              <p className="font-semibold text-sm text-[#0F172A]">No posts published yet</p>
              <p>When {profileUser.fullName} shares updates or mentorship posts, they will appear here.</p>
            </div>
          ) : (
            userPosts.map((post) => {
              const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
              return (
                <div key={post.id} className="apple-card p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-semibold text-[#2563EB]">#{post.topic || 'Campus'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* High Resolution Post Image with Zoom Trigger */}
                  {post.imageUrl && (
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
                  )}

                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
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
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Verified Academic Records
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Affiliated College</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{profileUser.collegeName || 'Not Listed'}</strong>
            </div>
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
    </div>
  );
}
