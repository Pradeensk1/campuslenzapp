'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import {
  Compass,
  Scale,
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
  Check,
  DollarSign,
  Home,
  Zap,
  ShieldCheck,
  Info
} from 'lucide-react';

type CompareAttributeKey = 'placements' | 'fees' | 'academics' | 'campus' | 'activities';

interface AttributeOption {
  key: CompareAttributeKey;
  label: string;
  desc: string;
  icon: any;
}

const ATTRIBUTE_OPTIONS: AttributeOption[] = [
  { key: 'placements', label: 'Placements & Job Offers', desc: 'Highest & average packages, top recruiters, PPOs, training', icon: Award },
  { key: 'fees', label: 'Fees & ROI', desc: 'Tuition, hostel, mess, scholarships & return on investment', icon: DollarSign },
  { key: 'academics', label: 'Academics & Faculty', desc: 'Faculty ratio, Ph.D. percent, curriculum, lab equipment', icon: GraduationCap },
  { key: 'campus', label: 'Hostel & Campus Amenities', desc: 'Wi-Fi speeds, curfew times, mess food rating, sports & medical', icon: Home },
  { key: 'activities', label: 'Clubs & Startup Incubation', desc: 'Tech fests, active clubs, hackathons, incubation support', icon: Zap },
];

interface ExploreCompareHubProps {
  initialTab?: 'explore' | 'compare';
}

function ExploreCompareContent({ initialTab = 'explore' }: ExploreCompareHubProps) {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab') as 'explore' | 'compare' | null;

  const [activeTab, setActiveTab] = useState<'explore' | 'compare'>(
    tabFromQuery || initialTab
  );

  useEffect(() => {
    if (tabFromQuery && (tabFromQuery === 'explore' || tabFromQuery === 'compare')) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const {
    colleges,
    posts,
    allUsers,
    savedCollegeIds,
    toggleSaveCollege,
    toggleLikePost,
    toggleFollowUser,
    currentUser
  } = useApp();

  // =========================================================================
  // EXPLORE STATE & MEMOS
  // =========================================================================
  const [exploreSearch, setExploreSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'colleges' | 'trending' | 'discussions' | 'mentors'>('all');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'autonomous' | 'government'>('all');

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
    return allUsers.filter(u => u.role === 'alumni' || u.role === 'faculty' || (u.role === 'student' && u.followersCount > 200));
  }, [allUsers]);

  const searchFilteredColleges = useMemo(() => {
    if (!exploreSearch.trim()) return colleges;
    const q = exploreSearch.toLowerCase();
    return colleges.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.courses.some(crs => crs.toLowerCase().includes(q))
    );
  }, [colleges, exploreSearch]);

  // =========================================================================
  // COMPARE STATE & LOGIC
  // =========================================================================
  const [selectedIds, setSelectedIds] = useState<string[]>(
    colleges.map(c => c.id)
  );

  const [selectedAttributes, setSelectedAttributes] = useState<Record<CompareAttributeKey, boolean>>({
    placements: true,
    fees: true,
    academics: true,
    campus: true,
    activities: true,
  });

  const toggleCollege = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        alert('Please keep at least one college selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAttribute = (key: CompareAttributeKey) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectOnlyAttribute = (key: CompareAttributeKey) => {
    const next = {
      placements: false,
      fees: false,
      academics: false,
      campus: false,
      activities: false,
    };
    next[key] = true;
    setSelectedAttributes(next);
  };

  const selectAllAttributes = () => {
    setSelectedAttributes({
      placements: true,
      fees: true,
      academics: true,
      campus: true,
      activities: true,
    });
  };

  const activeColleges = colleges.filter(c => selectedIds.includes(c.id));
  const activeAttributeCount = Object.values(selectedAttributes).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-16">
      {/* =============================================================== */}
      {/* UNIFIED HEADER & PILL TAB SWITCHER                              */}
      {/* =============================================================== */}
      <div className="apple-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Explore & Compare Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated campus insights, trending peer discussions, and granular multi-college comparison benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Pill Tab Switcher */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0] text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Explore & Pulse</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
              {colleges.length} Colleges
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'compare'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Compare Matrix</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
              {activeColleges.length} Active
            </span>
          </button>
        </div>
      </div>

      {/* =============================================================== */}
      {/* TAB 1: EXPLORE MODULE                                           */}
      {/* =============================================================== */}
      {activeTab === 'explore' && (
        <div className="space-y-10">
          {/* 1. Apple-Inspired Editorial Hero */}
          <section className="apple-card overflow-hidden border-[#E2E8F0] shadow-xs">
            <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] p-6 sm:p-10 text-white">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#38E6A5]" />
                  <span>Campus Lenz Curation</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  Explore the Pulse of Every Campus
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Curated evidence, top-rated institutions, breakout student achievements, and the most active campus debates in one organized hub.
                </p>
              </div>

              {/* Search Bar inside Hero */}
              <div className="mt-6 max-w-xl relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
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

          {/* 2. Top Performing Colleges */}
          {(selectedSection === 'all' || selectedSection === 'colleges') && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 text-[#2563EB]">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Ranked by Placement & Review Rigor</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    Best Performing Institutions
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('compare')}
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
                >
                  <span>Launch Multi-College Comparison</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {topColleges.map((col, idx) => {
                  const isSaved = savedCollegeIds.includes(col.id);
                  return (
                    <div
                      key={col.id}
                      className="apple-card apple-card-hover flex flex-col justify-between p-6 relative overflow-hidden"
                    >
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

                      <div className="mt-3">
                        <Link href={`/colleges/${col.slug}`} className="group">
                          <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                            {col.name}
                          </h4>
                        </Link>
                        <div className="mt-1 flex items-center space-x-1 text-xs text-[#64748B]">
                          <MapPin className="h-3 w-3 text-[#2563EB]" />
                          <span>{col.location}, {col.state}</span>
                          <span>•</span>
                          <span>{col.collegeType}</span>
                        </div>

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

                        <div className="mt-3 flex flex-wrap gap-1">
                          {col.courses.slice(0, 2).map(c => (
                            <span key={c} className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#475569] font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[#F1F5F9] pt-3 flex items-center justify-between">
                        <Link
                          href={`/colleges/${col.slug}`}
                          className="flex items-center space-x-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>View Evidence</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (!selectedIds.includes(col.id)) {
                              setSelectedIds([...selectedIds, col.id]);
                            }
                            setActiveTab('compare');
                          }}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                        >
                          Compare →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. Recent Trending Posts */}
          {(selectedSection === 'all' || selectedSection === 'trending') && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <Flame className="h-5 w-5 fill-current" />
                <h3 className="text-xl font-bold tracking-tight text-[#0F172A]">
                  Recent Trending Campus Posts
                </h3>
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

                        <p className="mt-3 text-xs sm:text-sm text-[#1E293B] leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </div>

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

          {/* 4. Most Commented Discussions */}
          {(selectedSection === 'all' || selectedSection === 'discussions') && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-[#2563EB]">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-xl font-bold tracking-tight text-[#0F172A]">
                  Hot Campus Discussions (Most Commented)
                </h3>
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
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Mentors */}
          {(selectedSection === 'all' || selectedSection === 'mentors') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#059669]">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Networking & Mentorship</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    Verified Mentors & Student Innovators
                  </h3>
                </div>
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
                          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                            {mentor.fullName}
                          </h4>
                        </Link>
                        <p className="text-[10px] font-semibold text-[#2563EB] uppercase mt-0.5">
                          {mentor.role} • {mentor.graduationBatch}
                        </p>
                        <p className="mt-2 text-xs text-[#64748B] line-clamp-2 leading-snug">
                          {mentor.headline}
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
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: COMPARE MODULE                                           */}
      {/* =============================================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-8">
          {/* Header & College Selection */}
          <div className="apple-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-2 text-[#2563EB]">
              <Scale className="h-5 w-5" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                Multi-College Deep Evidence Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl">
              Compare multiple colleges across granular parameters including tier-1 packages, verified mess ratings, student-faculty ratios, and transparent overall scores.
            </p>

            <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F172A]">
                  Selected Colleges ({activeColleges.length} of {colleges.length}):
                </span>
                <button
                  onClick={() => setSelectedIds(colleges.map(c => c.id))}
                  className="text-[#2563EB] hover:underline font-semibold"
                >
                  Select All
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {colleges.map((col) => {
                  const isSelected = selectedIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleCollege(col.id)}
                      className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-[#2563EB]' : 'border border-[#CBD5E1]'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attribute Checkboxes Filter Bar */}
          <div className="apple-card p-5 sm:p-6 space-y-4 border-l-4 border-l-[#2563EB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Filter Comparison Attributes</span>
                  <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs text-[#2563EB] font-bold">
                    {activeAttributeCount} Active
                  </span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Check/uncheck attributes below to focus specifically on what matters to you (e.g. check <strong>Placements Only</strong> or <strong>Fees Only</strong>).
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={selectAllAttributes}
                  className="rounded-lg bg-[#F1F5F9] px-2.5 py-1 text-[#0F172A] font-semibold hover:bg-[#E2E8F0] transition"
                >
                  All Details
                </button>
                <button
                  onClick={() => selectOnlyAttribute('placements')}
                  className="rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[#2563EB] font-semibold hover:bg-[#DBEAFE] transition"
                >
                  Placements Only
                </button>
                <button
                  onClick={() => selectOnlyAttribute('fees')}
                  className="rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[#059669] font-semibold hover:bg-[#D1FAE5] transition"
                >
                  Fees & ROI Only
                </button>
                <button
                  onClick={() => selectOnlyAttribute('campus')}
                  className="rounded-lg bg-[#FEF3C7] px-2.5 py-1 text-[#D97706] font-semibold hover:bg-[#FDE68A] transition"
                >
                  Hostel Only
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
              {ATTRIBUTE_OPTIONS.map(opt => {
                const isChecked = selectedAttributes[opt.key];
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.key}
                    onClick={() => toggleAttribute(opt.key)}
                    className={`cursor-pointer rounded-xl border p-3 flex items-start space-x-2.5 transition-all ${
                      isChecked
                        ? 'border-[#2563EB] bg-[#EFF6FF]/60 shadow-2xs'
                        : 'border-[#E2E8F0] bg-white opacity-70 hover:opacity-100 hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 ${isChecked ? 'bg-[#2563EB] text-white' : 'border border-[#CBD5E1]'}`}>
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span className="text-xs font-bold text-[#0F172A] truncate">{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2 leading-tight">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Overall Benchmark Scores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#0F172A]">
                <Sparkles className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-base sm:text-lg font-bold">
                  Transparent Overall Benchmark Scores (0–100)
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">Empirical data weighted analysis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeColleges.map((col) => (
                <div key={col.id} className="apple-card p-5 space-y-4 border-t-4 border-t-[#2563EB]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A] line-clamp-1">{col.name}</h4>
                      <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB] mt-1 inline-block">
                        {col.overallScore.badge}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#0F172A]">
                        {col.overallScore.total}
                      </span>
                      <span className="text-xs text-[#94A3B8]">/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-[#F1F5F9]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Placements & Packages</span>
                      <span className="font-bold text-[#059669]">{col.overallScore.placementsScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#059669] h-full rounded-full" style={{ width: `${col.overallScore.placementsScore}%` }} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Fees & ROI</span>
                      <span className="font-bold text-[#2563EB]">{col.overallScore.feesRoiScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${col.overallScore.feesRoiScore}%` }} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Academics & Faculty</span>
                      <span className="font-bold text-[#7C3AED]">{col.overallScore.academicsScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${col.overallScore.academicsScore}%` }} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Hostel & Campus Life</span>
                      <span className="font-bold text-[#D97706]">{col.overallScore.campusLifeScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#D97706] h-full rounded-full" style={{ width: `${col.overallScore.campusLifeScore}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <Link
                      href={`/colleges/${col.slug}`}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-between"
                    >
                      <span>Full College Audit</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Comparison Table based on Selected Checkbox Attributes */}
          <div className="apple-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="p-4 font-bold text-[#64748B] uppercase tracking-wider text-[11px] w-1/4">
                      Attributes
                    </th>
                    {activeColleges.map((col) => (
                      <th key={col.id} className="p-4 font-bold text-[#0F172A] text-sm">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F9]">
                  {/* Placements Attribute */}
                  {selectedAttributes.placements && (
                    <>
                      <tr className="bg-[#EFF6FF]/60 font-bold text-[#1E3A8A]">
                        <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                          <Award className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>1. Placement & Career Metrics</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Highest Package Offered</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-black text-[#059669] text-sm">
                            {c.placementDetails.highestPackage}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Average & Median Package</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4">
                            <span className="font-bold text-[#0F172A]">{c.placementDetails.averagePackage}</span>
                            <span className="text-[10px] text-[#64748B] block mt-0.5">Median: {c.placementDetails.medianPackage}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Placement Success Rate</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                            {c.placementDetails.placementRate}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Tier-1 Product Hires</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                            {c.placementDetails.tier1HiresCount} students placed
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Top Recruiters On Campus</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            <div className="flex flex-wrap gap-1">
                              {c.placementDetails.topRecruiters.map(r => (
                                <span key={r} className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* Fees Attribute */}
                  {selectedAttributes.fees && (
                    <>
                      <tr className="bg-[#ECFDF5]/70 font-bold text-[#065F46]">
                        <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[#059669]" />
                          <span>2. Tuition Fees, Hostel Costs & ROI</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Annual Tuition Fee</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#059669]">
                            {c.feeDetails.tuitionAnnual}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Annual Hostel Room Fee</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.feeDetails.hostelAnnual}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Monthly Mess Food Expense</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.feeDetails.messMonthly}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Scholarships & Financial Aid</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.feeDetails.scholarshipsAvailable}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Return on Investment (ROI) Grade</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#059669]">
                            {c.feeDetails.roiRating}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* Academics Attribute */}
                  {selectedAttributes.academics && (
                    <>
                      <tr className="bg-[#FEF3C7]/60 font-bold text-[#92400E]">
                        <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-[#D97706]" />
                          <span>3. Academics, Faculty & Research Rigor</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Student-to-Faculty Ratio</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                            {c.academicDetails.studentFacultyRatio}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Faculty Ph.D. Qualifications</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                            {c.academicDetails.phdFacultyPercent}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Curriculum Autonomy & Electives</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.academicDetails.curriculumFlexibility}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Annual Sponsored R&D Grants</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#059669]">
                            {c.academicDetails.researchFundingAnnual}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Lab & Compute Equipment</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.academicDetails.labEquipmentGrade}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* Campus & Hostel Attribute */}
                  {selectedAttributes.campus && (
                    <>
                      <tr className="bg-[#F3E8FF]/60 font-bold text-[#6B21A8]">
                        <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                          <Home className="h-3.5 w-3.5 text-[#8B5CF6]" />
                          <span>4. Hostel, Wi-Fi & Living Conditions</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Campus Wi-Fi Speeds</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                            {c.campusDetails.wifiSpeed}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Hostel In-Time Curfew</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-medium text-[#D97706]">
                            {c.campusDetails.hostelCurfew}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Mess Food Quality Rating</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4">
                            <span className="font-bold text-[#0F172A]">★ {c.campusDetails.messFoodRating}</span>
                            <span className="text-[10px] text-[#94A3B8] ml-1">/ 5.0 (Student audit)</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Sports & Recreation Grounds</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.campusDetails.sportsComplex}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">24/7 Medical & Hospital Access</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.campusDetails.medicalFacility}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* Activities Attribute */}
                  {selectedAttributes.activities && (
                    <>
                      <tr className="bg-[#FFF1F2]/60 font-bold text-[#9F1239]">
                        <td colSpan={activeColleges.length + 1} className="p-3 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                          <Zap className="h-3.5 w-3.5 text-[#E11D48]" />
                          <span>5. Extracurriculars, Hackathons & Startup Culture</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Flagship Campus Symposium</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                            {c.activityDetails.annualFestName}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Active Technical Student Clubs</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#2563EB]">
                            {c.activityDetails.techClubsCount} student clubs
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Startup Incubator / Maker Space</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-medium text-[#059669]">
                            {c.activityDetails.incubationCenter}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Annual Hackathons Hosted</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 font-bold text-[#0F172A]">
                            {c.activityDetails.hackathonsOrganizedAnnual} hackathons/year
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="p-4 font-semibold text-[#64748B]">Industry Corporate MoUs</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-4 text-[#475569]">
                            {c.activityDetails.industryMoUs} signed partnerships
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploreCompareHub({ initialTab = 'explore' }: ExploreCompareHubProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Explore & Compare Hub...</div>}>
      <ExploreCompareContent initialTab={initialTab} />
    </Suspense>
  );
}
