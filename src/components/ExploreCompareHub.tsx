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
  Info,
  Trophy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X
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
  // Default to 2 colleges for crisp, uncluttered side-by-side comparison
  const [selectedIds, setSelectedIds] = useState<string[]>([
    colleges[0]?.id || 'col-psg',
    colleges[1]?.id || 'col-ceg'
  ]);

  const [compareCategory, setCompareCategory] = useState<
    'all' | 'placements' | 'fees' | 'academics' | 'campus'
  >('all');
  const [showFullTable, setShowFullTable] = useState(false);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<CompareAttributeKey, boolean>>({
    placements: true,
    fees: true,
    academics: true,
    campus: true,
    activities: true,
  });

  const handleSlotChange = (index: number, newId: string) => {
    if (!newId) return;
    setSelectedIds(prev => {
      const copy = [...prev];
      copy[index] = newId;
      return copy;
    });
  };

  const handleAddSlot = (newId: string) => {
    if (newId && !selectedIds.includes(newId)) {
      setSelectedIds(prev => [...prev, newId]);
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (selectedIds.length <= 2) return;
    setSelectedIds(prev => prev.filter((_, idx) => idx !== index));
  };

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

  // Winner calculations for instant clarity
  const placementWinner = useMemo(() => {
    if (activeColleges.length === 0) return null;
    let max = -1;
    let winner = activeColleges[0];
    activeColleges.forEach(c => {
      const num = parseFloat(c.placementDetails.highestPackage.replace(/[^0-9.]/g, '')) || 0;
      if (num > max) {
        max = num;
        winner = c;
      }
    });
    return winner;
  }, [activeColleges]);

  const feesWinner = useMemo(() => {
    if (activeColleges.length === 0) return null;
    let min = Infinity;
    let winner = activeColleges[0];
    activeColleges.forEach(c => {
      const num = parseFloat(c.feeDetails.tuitionAnnual.replace(/[^0-9.]/g, '')) || Infinity;
      if (num < min) {
        min = num;
        winner = c;
      }
    });
    return winner;
  }, [activeColleges]);

  const messWinner = useMemo(() => {
    if (activeColleges.length === 0) return null;
    let max = -1;
    let winner = activeColleges[0];
    activeColleges.forEach(c => {
      if (c.campusDetails.messFoodRating > max) {
        max = c.campusDetails.messFoodRating;
        winner = c;
      }
    });
    return winner;
  }, [activeColleges]);

  const overallWinner = useMemo(() => {
    if (activeColleges.length === 0) return null;
    let max = -1;
    let winner = activeColleges[0];
    activeColleges.forEach(c => {
      if (c.overallScore.total > max) {
        max = c.overallScore.total;
        winner = c;
      }
    });
    return winner;
  }, [activeColleges]);

  return (
    <div className="space-y-6 pb-16">
      {/* =============================================================== */}
      {/* UNIFIED HEADER & PILL TAB SWITCHER                              */}
      {/* =============================================================== */}
      <div className="ocean-glass-card touch-over-glass p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/80 rounded-[28px] shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-sky-950">
                Explore & Compare Hub
              </h1>
              <p className="text-xs text-sky-800/80 mt-0.5">
                Curated campus insights, trending peer discussions, and granular multi-college comparison benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Pill Tab Switcher */}
        <div className="flex items-center bg-white/60 p-1.5 rounded-full border border-white/90 text-xs font-bold w-full md:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
              activeTab === 'explore'
                ? 'ocean-glossy-button text-white shadow-md'
                : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/50'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Explore & Pulse</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-900 font-bold">
              {colleges.length} Colleges
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
              activeTab === 'compare'
                ? 'ocean-glossy-button text-white shadow-md'
                : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/50'
            }`}
          >
            <Scale className="w-4 h-4 text-cyan-300" />
            <span>Compare Matrix</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-200/60 text-cyan-950 font-bold">
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
          <section className="ocean-glass-card overflow-hidden border border-white/80 rounded-[32px] shadow-xl">
            <div className="bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C2340] p-6 sm:p-10 text-white relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-2xl space-y-3 relative z-10">
                <div className="inline-flex items-center space-x-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="text-white">Campus Lenz Curation</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  Explore the Pulse of Every Campus
                </h2>
                <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-medium">
                  Curated evidence, top-rated institutions, breakout student achievements, and the most active campus debates in one organized hub.
                </p>
              </div>

              {/* Search Bar inside Hero */}
              <div className="mt-6 max-w-xl relative z-10">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-sky-400" />
                <input
                  type="text"
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
                  placeholder="Search colleges (PSG, CEG), courses (MCA), or student discussions..."
                  className="w-full rounded-2xl border border-white/80 bg-white/90 backdrop-blur-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-sky-950 placeholder-sky-800/40 shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-medium"
                />
              </div>
            </div>

            {/* Apple Segmented Category Navigation */}
            <div className="flex overflow-x-auto border-t border-sky-100/80 bg-white/50 backdrop-blur-md p-2 text-xs gap-1">
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
                    className={`flex items-center space-x-1.5 whitespace-nowrap rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
                      selectedSection === tab.id
                        ? 'ocean-glossy-button text-white shadow-xs'
                        : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/60'
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
                  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
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
                          <span suppressHydrationWarning className="text-[10px] text-[#94A3B8]">
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
                  const isFollowing = currentUser ? currentUser.following.includes(mentor.id) : false;
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
      {/* TAB 2: COMPARE MODULE (SIMPLIFIED & INTUITIVE)                  */}
      {/* =============================================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* 1. College Selection Header & Slots */}
          <div className="apple-card p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-[#2563EB]">
                  <Scale className="h-5 w-5" />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                    Compare Colleges
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  Choose 2 or 3 colleges to compare side-by-side with clear answers on placements, fees, and campus life.
                </p>
              </div>

              {/* 1-Click Popular Comparison Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1">
                  Popular:
                </span>
                <button
                  onClick={() => setSelectedIds(['col-psg', 'col-ceg'])}
                  className="rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] transition"
                >
                  PSG Tech vs CEG
                </button>
                <button
                  onClick={() => setSelectedIds(['col-psg', 'col-sns'])}
                  className="rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] transition"
                >
                  PSG Tech vs SNS
                </button>
                <button
                  onClick={() => setSelectedIds(['col-ceg', 'col-sns'])}
                  className="rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] transition"
                >
                  CEG vs SNS
                </button>
                {selectedIds.length < 3 && colleges.length >= 3 && (
                  <button
                    onClick={() => setSelectedIds(colleges.slice(0, 3).map(c => c.id))}
                    className="rounded-full bg-[#F1F5F9] border border-[#CBD5E1] px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition"
                  >
                    Compare All 3
                  </button>
                )}
              </div>
            </div>

            {/* Side-by-Side Selection Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {selectedIds.map((collegeId, idx) => {
                const college = colleges.find(c => c.id === collegeId) || colleges[0];
                return (
                  <div
                    key={`slot-${idx}`}
                    className="relative rounded-2xl border-2 border-[#2563EB]/20 bg-gradient-to-b from-[#F8FAFC] to-white p-4 shadow-xs hover:border-[#2563EB]/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                        College {idx + 1}
                      </span>
                      {selectedIds.length > 2 && (
                        <button
                          onClick={() => handleRemoveSlot(idx)}
                          className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove this slot"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown to change college */}
                    <div className="relative">
                      <select
                        value={college?.id || ''}
                        onChange={(e) => handleSlotChange(idx, e.target.value)}
                        className="w-full font-bold text-sm text-[#0F172A] bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 pr-8 focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden appearance-none cursor-pointer"
                      >
                        {colleges.map(c => (
                          <option key={c.id} value={c.id} disabled={selectedIds.includes(c.id) && c.id !== collegeId}>
                            {c.name} {selectedIds.includes(c.id) && c.id !== collegeId ? '(already picked)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Quick sub-details in slot */}
                    {college && (
                      <div className="mt-2.5 flex items-center justify-between text-xs text-[#64748B]">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{college.location}</span>
                        </span>
                        <span className="font-bold text-[#059669] shrink-0 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          ★ {college.ratingAverage} / 5.0
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add College Slot Button if under 3 */}
              {selectedIds.length < colleges.length && selectedIds.length < 3 && (
                <div className="rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC]/60 p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#EFF6FF]/40 hover:border-[#93C5FD] transition">
                  <p className="text-xs font-semibold text-[#64748B]">Compare one more college?</p>
                  <button
                    onClick={() => {
                      const nextUnselected = colleges.find(c => !selectedIds.includes(c.id));
                      if (nextUnselected) handleAddSlot(nextUnselected.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition shadow-2xs"
                  >
                    <span>+ Add 3rd College</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Smart Decision Summary & Verdict Card */}
          {activeColleges.length >= 2 && (
            <div className="apple-card p-5 sm:p-6 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 border-blue-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1E3A8A]">
                  <Sparkles className="h-5 w-5 text-[#2563EB]" />
                  <h3 className="font-bold text-base sm:text-lg">
                    Quick Verdict: Which one should you pick?
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                  ⚡ AI Comparison Summary
                </span>
              </div>

              {/* 4 Quick Verdict Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Best Placements */}
                {placementWinner && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                        <Trophy className="h-4 w-4 text-emerald-600" />
                        <span>Best for Placements</span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mt-1.5 line-clamp-1">
                        {placementWinner.name}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                        Top: {placementWinner.placementDetails.highestPackage.split('(')[0]}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 border-t border-emerald-100 pt-1.5">
                      Avg {placementWinner.placementDetails.averagePackage.split('(')[0]} • {placementWinner.placementDetails.placementRate}
                    </p>
                  </div>
                )}

                {/* 2. Best ROI / Lowest Fees */}
                {feesWinner && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase tracking-wider">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span>Lowest Fees & Best ROI</span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mt-1.5 line-clamp-1">
                        {feesWinner.name}
                      </p>
                      <p className="text-xs text-blue-700 font-semibold mt-0.5">
                        {feesWinner.feeDetails.tuitionAnnual.split('(')[0]}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 border-t border-blue-100 pt-1.5">
                      ROI Rating: {feesWinner.feeDetails.roiRating.split('(')[0]}
                    </p>
                  </div>
                )}

                {/* 3. Best Hostel Food */}
                {messWinner && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
                        <Home className="h-4 w-4 text-amber-600" />
                        <span>Best Hostel Food</span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mt-1.5 line-clamp-1">
                        {messWinner.name}
                      </p>
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">
                        ★ {messWinner.campusDetails.messFoodRating} / 5.0 Student Rating
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 border-t border-amber-100 pt-1.5">
                      Curfew: {messWinner.campusDetails.hostelCurfew}
                    </p>
                  </div>
                )}

                {/* 4. Top Overall Score */}
                {overallWinner && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold uppercase tracking-wider">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span>Highest Overall Score</span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mt-1.5 line-clamp-1">
                        {overallWinner.name}
                      </p>
                      <p className="text-xs text-purple-700 font-semibold mt-0.5">
                        {overallWinner.overallScore.total} / 100 Benchmarked
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 border-t border-purple-100 pt-1.5">
                      {overallWinner.overallScore.badge}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Category Selector Tabs (Easy Filter Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: '🌟 All Key Stats' },
              { id: 'placements', label: '💼 Placements & Packages' },
              { id: 'fees', label: '💰 Fees & Costs' },
              { id: 'academics', label: '🎓 Academics & Faculty' },
              { id: 'campus', label: '🏠 Hostel & Campus Life' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCompareCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  compareCategory === tab.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Side-by-Side Visual Metric Comparison Cards */}
          <div className="space-y-4">
            {/* CARD 1: OVERALL BENCHMARK SCORES */}
            {compareCategory === 'all' && (
              <div className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-base text-[#0F172A]">Overall Performance Benchmark</h3>
                  </div>
                  <span className="text-xs text-[#64748B]">Score out of 100</span>
                </div>

                <div className={`grid grid-cols-1 ${activeColleges.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                  {activeColleges.map((col) => {
                    const isWinner = overallWinner?.id === col.id;
                    return (
                      <div
                        key={col.id}
                        className={`rounded-2xl p-4 border transition-all ${
                          isWinner
                            ? 'border-blue-500 bg-blue-50/20 shadow-xs ring-1 ring-blue-500/20'
                            : 'border-[#E2E8F0] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-black text-[#2563EB]">{col.name}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{col.collegeType}</p>
                          </div>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 font-bold px-2 py-0.5 text-[10px]">
                              <Trophy className="h-3 w-3" /> Winner
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-black text-[#0F172A]">{col.overallScore.total}</span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>

                        {/* Breakdown meters */}
                        <div className="space-y-2 mt-4 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600">Placements</span>
                              <span className="font-bold text-emerald-600">{col.overallScore.placementsScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${col.overallScore.placementsScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600">Fees & ROI</span>
                              <span className="font-bold text-blue-600">{col.overallScore.feesRoiScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${col.overallScore.feesRoiScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600">Academics</span>
                              <span className="font-bold text-purple-600">{col.overallScore.academicsScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${col.overallScore.academicsScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600">Campus & Hostel</span>
                              <span className="font-bold text-amber-600">{col.overallScore.campusLifeScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${col.overallScore.campusLifeScore}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Link
                            href={`/colleges/${col.slug}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-between group"
                          >
                            <span>View Full Profile</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CARD 2: PLACEMENTS & PACKAGES */}
            {(compareCategory === 'all' || compareCategory === 'placements') && (
              <div className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-base text-[#0F172A]">Placements & Salary Packages</h3>
                      <p className="text-xs text-slate-500">Highest package, average salary & placement percentages</p>
                    </div>
                  </div>
                  {placementWinner && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                      🏆 {placementWinner.name.split(' ')[0]} leads packages
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeColleges.map((col) => {
                    const isHighestPkg = placementWinner?.id === col.id;
                    return (
                      <div
                        key={col.id}
                        className={`rounded-2xl p-4 border ${
                          isHighestPkg
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-[#E2E8F0] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#0F172A] truncate">{col.name}</h4>
                          {isHighestPkg && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              🏆 Top Package
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-3 text-xs">
                          {/* Highest Package */}
                          <div className="bg-slate-50 rounded-xl p-2.5">
                            <span className="text-[11px] text-slate-500 block">Highest Package</span>
                            <span className="text-lg font-black text-emerald-600">
                              {col.placementDetails.highestPackage}
                            </span>
                          </div>

                          {/* Average & Median */}
                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Average Package</span>
                            <span className="font-bold text-[#0F172A]">{col.placementDetails.averagePackage}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Median Salary</span>
                            <span className="font-bold text-[#0F172A]">{col.placementDetails.medianPackage}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Placement Rate</span>
                            <span className="font-bold text-blue-600">{col.placementDetails.placementRate}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Tier-1 Offers</span>
                            <span className="font-bold text-[#0F172A]">{col.placementDetails.tier1HiresCount} students</span>
                          </div>

                          {/* Top Recruiters */}
                          <div className="pt-1">
                            <span className="text-[11px] text-slate-500 block mb-1.5">Top Recruiters</span>
                            <div className="flex flex-wrap gap-1">
                              {col.placementDetails.topRecruiters.map(r => (
                                <span key={r} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CARD 3: FEES, HOSTEL COSTS & ROI */}
            {(compareCategory === 'all' || compareCategory === 'fees') && (
              <div className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-base text-[#0F172A]">Fees, Living Costs & ROI</h3>
                      <p className="text-xs text-slate-500">Annual tuition, hostel rent, food cost and return on investment</p>
                    </div>
                  </div>
                  {feesWinner && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 hidden sm:inline-flex items-center gap-1">
                      💰 {feesWinner.name.split(' ')[0]} lowest cost
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeColleges.map((col) => {
                    const isLowestFee = feesWinner?.id === col.id;
                    return (
                      <div
                        key={col.id}
                        className={`rounded-2xl p-4 border ${
                          isLowestFee
                            ? 'border-blue-500 bg-blue-50/20'
                            : 'border-[#E2E8F0] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#0F172A] truncate">{col.name}</h4>
                          {isLowestFee && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                              💰 Lowest Fee!
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-3 text-xs">
                          {/* Tuition */}
                          <div className="bg-slate-50 rounded-xl p-2.5">
                            <span className="text-[11px] text-slate-500 block">Annual Tuition Fee</span>
                            <span className="text-base font-black text-blue-700">
                              {col.feeDetails.tuitionAnnual}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Hostel Rent / Year</span>
                            <span className="font-bold text-[#0F172A]">{col.feeDetails.hostelAnnual}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Monthly Food / Mess</span>
                            <span className="font-bold text-[#0F172A]">{col.feeDetails.messMonthly}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Exam / Lab Fees</span>
                            <span className="font-bold text-[#0F172A]">{col.feeDetails.examAndLabAnnual}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Value for Money (ROI)</span>
                            <span className="font-bold text-emerald-600">{col.feeDetails.roiRating}</span>
                          </div>

                          {/* Scholarships */}
                          <div className="pt-1">
                            <span className="text-[11px] text-slate-500 block mb-1">Scholarships & Aid</span>
                            <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg leading-relaxed">
                              {col.feeDetails.scholarshipsAvailable}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CARD 4: ACADEMICS & FACULTY */}
            {(compareCategory === 'all' || compareCategory === 'academics') && (
              <div className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Academics & Faculty Rigor</h3>
                    <p className="text-xs text-slate-500">Professor doctorates, faculty ratio & sponsored research</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeColleges.map((col) => (
                    <div key={col.id} className="rounded-2xl p-4 border border-[#E2E8F0] bg-white space-y-3 text-xs">
                      <h4 className="font-bold text-sm text-[#0F172A] truncate">{col.name}</h4>

                      <div className="bg-purple-50/50 rounded-xl p-2.5 border border-purple-100">
                        <span className="text-[11px] text-purple-700 block">Faculty with Ph.D.</span>
                        <span className="text-lg font-black text-purple-900">
                          {col.academicDetails.phdFacultyPercent}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Student-to-Faculty</span>
                        <span className="font-bold text-[#0F172A]">{col.academicDetails.studentFacultyRatio}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Annual Research Grants</span>
                        <span className="font-bold text-emerald-600">{col.academicDetails.researchFundingAnnual}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Lab Infrastructure</span>
                        <span className="font-bold text-[#0F172A] line-clamp-1">{col.academicDetails.labEquipmentGrade}</span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-slate-500 block mb-1">Curriculum & Freedom</span>
                        <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg leading-relaxed">
                          {col.academicDetails.curriculumFlexibility}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 5: HOSTEL, FOOD & CAMPUS LIFE */}
            {(compareCategory === 'all' || compareCategory === 'campus') && (
              <div className="apple-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-amber-600" />
                    <div>
                      <h3 className="font-bold text-base text-[#0F172A]">Hostel, Food & Campus Life</h3>
                      <p className="text-xs text-slate-500">Student verified mess ratings, curfew rules and Wi-Fi speed</p>
                    </div>
                  </div>
                  {messWinner && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 hidden sm:inline-flex items-center gap-1">
                      🍲 {messWinner.name.split(' ')[0]} best food rating
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeColleges.map((col) => {
                    const isFoodWinner = messWinner?.id === col.id;
                    return (
                      <div
                        key={col.id}
                        className={`rounded-2xl p-4 border ${
                          isFoodWinner
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-[#E2E8F0] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#0F172A] truncate">{col.name}</h4>
                          {isFoodWinner && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                              🍲 Best Food
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-3 text-xs">
                          {/* Mess Rating */}
                          <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100">
                            <span className="text-[11px] text-amber-800 block">Student Mess Food Rating</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-lg font-black text-amber-900">
                                ★ {col.campusDetails.messFoodRating}
                              </span>
                              <span className="text-xs text-amber-600">/ 5.0</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Wi-Fi Speeds</span>
                            <span className="font-bold text-[#0F172A]">{col.campusDetails.wifiSpeed}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Hostel Curfew</span>
                            <span className="font-bold text-amber-700">{col.campusDetails.hostelCurfew}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Sports & Grounds</span>
                            <span className="font-bold text-[#0F172A] line-clamp-1">{col.campusDetails.sportsComplex}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Medical 24/7</span>
                            <span className="font-bold text-[#0F172A] line-clamp-1">{col.campusDetails.medicalFacility}</span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-slate-600">Flagship Tech Fest</span>
                            <span className="font-bold text-blue-600">{col.activityDetails.annualFestName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Collapsible Detailed Audit Table (For users who want to inspect every raw detail) */}
          <div className="apple-card overflow-hidden border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setShowFullTable(prev => !prev)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[#2563EB]" />
                <span className="font-bold text-sm text-[#0F172A]">
                  {showFullTable
                    ? 'Hide Detailed Raw Spreadsheet'
                    : 'Show Complete Technical Spreadsheet (All 50+ Parameters)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#2563EB] font-bold">
                <span>{showFullTable ? 'Collapse Table' : 'Expand Table'}</span>
                {showFullTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {showFullTable && (
              <div className="p-4 sm:p-6 border-t border-[#E2E8F0] space-y-6">
                <p className="text-xs text-slate-500">
                  Comprehensive audit across placements, government fee brackets, faculty Ph.D ratios, and student facility reviews.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                        <th className="p-3 font-bold text-[#64748B] uppercase tracking-wider text-[11px] w-1/4">
                          Parameter
                        </th>
                        {activeColleges.map((col) => (
                          <th key={col.id} className="p-3 font-bold text-[#0F172A] text-sm">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {/* Placements */}
                      <tr className="bg-[#EFF6FF]/60 font-bold text-[#1E3A8A]">
                        <td colSpan={activeColleges.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider">
                          1. Placements & Salary Records
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Highest Package</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-black text-emerald-600">
                            {c.placementDetails.highestPackage}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Average Package</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-[#0F172A]">
                            {c.placementDetails.averagePackage}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Placement Rate</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-blue-600">
                            {c.placementDetails.placementRate}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Tier-1 Hires</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-[#0F172A]">
                            {c.placementDetails.tier1HiresCount} hires
                          </td>
                        ))}
                      </tr>

                      {/* Fees */}
                      <tr className="bg-[#ECFDF5]/70 font-bold text-[#065F46]">
                        <td colSpan={activeColleges.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider">
                          2. Tuition, Hostel & Living Costs
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Annual Tuition</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-emerald-600">
                            {c.feeDetails.tuitionAnnual}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Hostel Fee</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-[#475569]">
                            {c.feeDetails.hostelAnnual}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Mess Food Monthly</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-[#475569]">
                            {c.feeDetails.messMonthly}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">ROI Rating</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-emerald-600">
                            {c.feeDetails.roiRating}
                          </td>
                        ))}
                      </tr>

                      {/* Academics */}
                      <tr className="bg-[#FEF3C7]/60 font-bold text-[#92400E]">
                        <td colSpan={activeColleges.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider">
                          3. Academics & Faculty
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Student:Faculty Ratio</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-[#0F172A]">
                            {c.academicDetails.studentFacultyRatio}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Ph.D. Faculty</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-blue-600">
                            {c.academicDetails.phdFacultyPercent}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Research Grants</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-emerald-600 font-semibold">
                            {c.academicDetails.researchFundingAnnual}
                          </td>
                        ))}
                      </tr>

                      {/* Campus */}
                      <tr className="bg-[#F3E8FF]/60 font-bold text-[#6B21A8]">
                        <td colSpan={activeColleges.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider">
                          4. Hostel & Amenities
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Mess Rating</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 font-bold text-[#0F172A]">
                            ★ {c.campusDetails.messFoodRating} / 5.0
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Hostel Curfew</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-amber-700 font-medium">
                            {c.campusDetails.hostelCurfew}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#64748B]">Wi-Fi Speeds</td>
                        {activeColleges.map(c => (
                          <td key={c.id} className="p-3 text-[#0F172A]">
                            {c.campusDetails.wifiSpeed}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
