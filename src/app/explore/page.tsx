'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Building2,
  TrendingUp,
  MessageSquare,
  Award,
  Star,
  Bookmark,
  ArrowRight,
  UserCheck,
  Flame,
  ThumbsUp,
  MapPin,
  ChevronRight,
  Filter,
  GraduationCap,
  Users,
  Compass
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function ExplorePage() {
  const { colleges, posts, allUsers, savedCollegeIds, toggleSaveCollege, toggleLikePost, toggleFollowUser, currentUser } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'colleges' | 'trending' | 'discussions' | 'mentors'>('all');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'autonomous' | 'government'>('all');

  // Dynamic calculations for curated Apple-style sections
  const topColleges = useMemo(() => {
    return [...colleges].sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
  }, [colleges]);

  const trendingPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.likesCount - a.likesCount);
  }, [posts]);

  const mostCommentedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.commentsCount - a.commentsCount);
  }, [posts]);

  const featuredMentors = useMemo(() => {
    return allUsers.filter(u => u.role === 'alumni' || u.role === 'staff' || (u.role === 'student' && u.followersCount > 200));
  }, [allUsers]);

  // Global search filtering across colleges & posts
  const searchFilteredColleges = useMemo(() => {
    if (!searchQuery.trim()) return colleges;
    const q = searchQuery.toLowerCase();
    return colleges.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.courses.some(crs => crs.toLowerCase().includes(q))
    );
  }, [colleges, searchQuery]);

  return (
    <div className="space-y-10 pb-12">
      {/* 1. APPLE-INSPIRED EDITORIAL HERO HEADER */}
      <section className="apple-card overflow-hidden border-[#E2E8F0] shadow-sm">
        <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] p-6 sm:p-10 text-white">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#38E6A5]" />
              <span>Campus Lenz Curation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Explore the Pulse of Every Campus
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Curated evidence, top-rated institutions, breakout student achievements, and the most active campus debates in one organized hub.
            </p>
          </div>

          {/* Quick Search Bar inside Hero */}
          <div className="mt-6 max-w-xl relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges (PSG, CEG), courses (MCA), or student discussions..."
              className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#38E6A5]"
            />
          </div>
        </div>

        {/* Apple Segmented Category Navigation */}
        <div className="flex overflow-x-auto border-t border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs">
          {[
            { id: 'all', label: 'All Curations', icon: Compass },
            { id: 'colleges', label: 'Top Colleges', icon: Building2 },
            { id: 'trending', label: 'Trending Posts', icon: Flame },
            { id: 'discussions', label: 'Most Commented', icon: MessageSquare },
            { id: 'mentors', label: 'Alumni & Mentors', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSection(tab.id as any)}
                className={`flex items-center space-x-1.5 whitespace-nowrap rounded-xl px-4 py-2 font-bold transition-all ${
                  selectedSection === tab.id
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. CATEGORY ONE: BEST PERFORMING COLLEGES (Apple Editorial Grid) */}
      {(selectedSection === 'all' || selectedSection === 'colleges') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2 text-[#2563EB]">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ranked by Placement & Review Rigor</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                Best Performing Institutions
              </h2>
            </div>
            <Link
              href="/compare"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <span>Launch 3-Way Comparison</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {topColleges.map((col, idx) => {
              const isSaved = savedCollegeIds.includes(col.id);
              return (
                <div
                  key={col.id}
                  className="apple-card apple-card-hover flex flex-col justify-between p-6 relative overflow-hidden"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-start justify-between">
                    <span className="flex items-center space-x-1 rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#2563EB]">
                      <span>#{idx + 1} Best Performer</span>
                    </span>
                    <button
                      onClick={() => toggleSaveCollege(col.id)}
                      className={`rounded-lg p-2 transition ${
                        isSaved ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                      title={isSaved ? 'Saved in Research' : 'Save for Comparison'}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* College Name & Details */}
                  <div className="mt-3">
                    <Link href={`/colleges/${col.slug}`} className="group">
                      <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                        {col.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center space-x-1 text-xs text-[#64748B]">
                      <MapPin className="h-3 w-3 text-[#2563EB]" />
                      <span>{col.location}, {col.state}</span>
                      <span>•</span>
                      <span>{col.collegeType}</span>
                    </div>

                    {/* High-Impact Stat Pills (Apple Style) */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[#64748B]">Placement</p>
                        <p className="font-black text-[#059669] text-sm mt-0.5">
                          {col.placementStats?.highestPackage || 'N/A'}
                        </p>
                        <p className="text-[9px] text-[#94A3B8]">Rate: {col.placementStats?.placementRate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[#64748B]">Student Rating</p>
                        <div className="flex items-center space-x-1 font-black text-[#D97706] text-sm mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{col.ratingAverage || 'N/A'}</span>
                        </div>
                        <p className="text-[9px] text-[#94A3B8]">{col.reviewCount} verified reviews</p>
                      </div>
                    </div>

                    {/* Courses */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {col.courses.slice(0, 2).map(c => (
                        <span key={c} className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#475569] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Profile Action Link */}
                  <div className="mt-5 border-t border-[#F1F5F9] pt-3">
                    <Link
                      href={`/colleges/${col.slug}`}
                      className="flex items-center justify-between text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                    >
                      <span>View Official & Student Evidence</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. CATEGORY TWO: RECENT TRENDING POSTS (Ranked #1, #2, #3 Leaderboard) */}
      {(selectedSection === 'all' || selectedSection === 'trending') && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[#D97706]">
            <Flame className="h-5 w-5 fill-current" />
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Recent Trending Campus Posts
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            Posts by students and alumni receiving the highest helpful votes across tech discussions, placement rounds, and research breakthroughs.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {trendingPosts.slice(0, 4).map((post, idx) => {
              const isLiked = post.likes.includes(currentUser.id);
              return (
                <div key={post.id} className="apple-card apple-card-hover p-6 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Header with Ranking Leaderboard Pill */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Link href={post.isAnonymous ? '#' : `/user/${post.authorUsername}`}>
                          <div className="h-10 w-10 rounded-full bg-[#EFF6FF] border border-[#E2E8F0] flex items-center justify-center font-bold text-sm text-[#2563EB]">
                            {post.isAnonymous ? '?' : post.authorName[0]}
                          </div>
                        </Link>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <Link
                              href={post.isAnonymous ? '#' : `/user/${post.authorUsername}`}
                              className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB]"
                            >
                              {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                            </Link>
                            {post.isVerifiedAuthor && !post.isAnonymous && (
                              <UserCheck className="h-3.5 w-3.5 text-[#059669]" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#64748B] line-clamp-1">{post.authorHeadline}</p>
                        </div>
                      </div>

                      <span className="flex items-center space-x-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#D97706]">
                        <span>#{idx + 1} Trending</span>
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="mt-3 text-xs sm:text-sm text-[#1E293B] leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                        isLiked ? 'text-[#2563EB]' : 'hover:text-[#0F172A]'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likesCount} Helpful</span>
                    </button>
                    <Link
                      href="/"
                      className="flex items-center space-x-1 text-[#64748B] hover:text-[#2563EB]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{post.commentsCount} comments</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. CATEGORY THREE: MOST COMMENTED MESSAGES & HOT DISCUSSIONS */}
      {(selectedSection === 'all' || selectedSection === 'discussions') && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[#2563EB]">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Hot Campus Discussions (Most Commented)
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            Conversations with the most active peer replies, interview guidance, and verified alumni advice.
          </p>

          <div className="space-y-4">
            {mostCommentedPosts.map((post) => (
              <div key={post.id} className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Link href={`/user/${post.authorUsername}`}>
                      <div className="h-9 w-9 rounded-full bg-[#F1F5F9] font-bold text-xs flex items-center justify-center text-[#0F172A]">
                        {post.authorName[0]}
                      </div>
                    </Link>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/user/${post.authorUsername}`} className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB]">
                          {post.authorName}
                        </Link>
                        {post.collegeName && (
                          <span className="text-xs text-[#2563EB] font-medium">• {post.collegeName}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#94A3B8]">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB] flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{post.commentsCount} active replies</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
                  {post.content}
                </p>

                {/* Latest Comment Preview Box (Apple-Style Nested Snippet) */}
                {post.comments.length > 0 && (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">
                        Latest reply by {post.comments[0].authorName} ({post.comments[0].authorRole}):
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(post.comments[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#475569] italic">
                      "{post.comments[0].content}"
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Link
                    href="/"
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    <span>Join Conversation on Home Feed</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CATEGORY FOUR: ACTIVE ALUMNI & RISING PEERS TO CONNECT */}
      {(selectedSection === 'all' || selectedSection === 'mentors') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-[#059669]">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Networking & Mentorship</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                Verified Mentors & Student Innovators
              </h2>
            </div>
            <Link href="/search" className="text-xs font-bold text-[#2563EB] hover:underline">
              Find More in Search →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featuredMentors.map(mentor => {
              const isFollowing = currentUser.following.includes(mentor.id);
              return (
                <div key={mentor.id} className="apple-card p-5 text-center flex flex-col justify-between space-y-4">
                  <div>
                    <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#EFF6FF] bg-[#2563EB] text-white flex items-center justify-center text-xl font-black shadow-xs">
                      {mentor.fullName[0]}
                    </div>
                    <Link href={`/user/${mentor.username}`} className="block mt-3 group">
                      <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {mentor.fullName}
                      </h3>
                    </Link>
                    <p className="text-[10px] font-semibold text-[#2563EB] uppercase mt-0.5">
                      {mentor.role} • {mentor.graduationBatch}
                    </p>
                    <p className="mt-2 text-xs text-[#64748B] line-clamp-2 leading-snug">
                      {mentor.headline}
                    </p>
                    <p className="mt-2 text-[11px] text-[#94A3B8]">
                      {mentor.followersCount} followers • {mentor.collegeName}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => toggleFollowUser(mentor.id)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                        isFollowing
                          ? 'border border-[#E2E8F0] bg-white text-[#64748B]'
                          : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link
                      href={`/user/${mentor.username}`}
                      className="apple-button-secondary !py-1.5 !px-3 text-xs"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. CATEGORY FIVE: FULL COLLEGE REPOSITORY WITH FILTERS */}
      {(selectedSection === 'all' || selectedSection === 'colleges') && (
        <section className="space-y-4 pt-4 border-t border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                Complete College Directory
              </h2>
              <p className="text-xs text-[#64748B]">
                Filter by Autonomous, Government, or State location to inspect complete fee and placement audits.
              </p>
            </div>
            
            {/* Type selector */}
            <div className="flex space-x-2 text-xs">
              {(['all', 'autonomous', 'government'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setCollegeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 font-bold capitalize transition-all ${
                    collegeFilter === t
                      ? 'bg-[#0F172A] text-white'
                      : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {searchFilteredColleges
              .filter(c => collegeFilter === 'all' || c.collegeType.toLowerCase() === collegeFilter)
              .map(col => (
                <div key={col.id} className="apple-card p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      {col.collegeType}
                    </span>
                    <h3 className="font-bold text-sm text-[#0F172A] truncate">{col.name}</h3>
                    <p className="text-xs text-[#64748B]">{col.location}, {col.state} • ★ {col.ratingAverage} ({col.reviewCount} reviews)</p>
                    <p className="text-xs font-semibold text-[#059669]">Avg. Package: {col.placementStats?.averagePackage}</p>
                  </div>
                  <Link
                    href={`/colleges/${col.slug}`}
                    className="apple-button-secondary text-xs !py-2 shrink-0 font-semibold flex items-center space-x-1"
                  >
                    <span>Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
