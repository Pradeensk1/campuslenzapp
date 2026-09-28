'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserCheck, Building2, MapPin, Star, GraduationCap, X, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function SearchClient({
  initialColleges = [],
  initialProfiles = [],
}: {
  initialColleges?: any[];
  initialProfiles?: any[];
}) {
  const { allUsers, colleges, currentUser, toggleFollowUser, semanticSearchCollegesWithAI } = useApp();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'accounts' | 'colleges'>('all');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState<any | null>(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  const normalizedQuery = query.toLowerCase().trim();

  // Handle AI semantic search for colleges with debounce
  useEffect(() => {
    if (!useSemanticSearch || !normalizedQuery || normalizedQuery.length < 2) {
      setSemanticResults(null);
      setIsSearchingSemantic(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingSemantic(true);

    const timer = setTimeout(async () => {
      try {
        const res = await semanticSearchCollegesWithAI(normalizedQuery, 10);
        if (!isCancelled) {
          setSemanticResults(res);
        }
      } catch (err) {
        console.error('Semantic search error:', err);
      } finally {
        if (!isCancelled) {
          setIsSearchingSemantic(false);
        }
      }
    }, 280);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [normalizedQuery, useSemanticSearch, semanticSearchCollegesWithAI]);

  // Search through users (Students, Alumni, Staff/Faculty) - strictly exclude Admin accounts
  const matchedUsers = allUsers.filter(user => {
    if (user.role === 'admin') return false;
    if (!normalizedQuery) return true;
    return (
      user.fullName.toLowerCase().includes(normalizedQuery) ||
      user.username.toLowerCase().includes(normalizedQuery) ||
      user.headline.toLowerCase().includes(normalizedQuery) ||
      (user.collegeName && user.collegeName.toLowerCase().includes(normalizedQuery)) ||
      (user.department && user.department.toLowerCase().includes(normalizedQuery)) ||
      user.role.toLowerCase().includes(normalizedQuery)
    );
  });

  // Search through colleges (Standard fallback + AI semantic ranking)
  const matchedColleges = colleges.filter(col => {
    if (!normalizedQuery) return true;
    return (
      col.name.toLowerCase().includes(normalizedQuery) ||
      col.location.toLowerCase().includes(normalizedQuery) ||
      col.courses.some(c => c.toLowerCase().includes(normalizedQuery))
    );
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="apple-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#1687D4]">
            <Search className="h-5 w-5" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Search
            </h1>
          </div>
          
          {/* AI Semantic Search Toggle Pill */}
          <button
            type="button"
            onClick={() => setUseSemanticSearch(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              useSemanticSearch
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white border-blue-500 shadow-sm shadow-blue-200'
                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-blue-400 hover:text-blue-600'
            }`}
            title="Toggle natural language AI semantic search using nomic-embed vector embeddings"
          >
            <Sparkles className={`w-3.5 h-3.5 ${useSemanticSearch ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
            <span>AI Semantic Match</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              useSemanticSearch ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {useSemanticSearch ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              useSemanticSearch
                ? "Ask anything in natural language, e.g. 'top autonomous engineering college with high placement and sports'..."
                : "Search students, alumni, faculty, or colleges..."
            }
            className={`w-full rounded-2xl border py-3 pl-11 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all shadow-2xs ${
              useSemanticSearch
                ? 'border-blue-300 bg-blue-50/20 focus:border-blue-600 ring-2 ring-blue-500/10'
                : 'border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#1687D4]'
            }`}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 pt-2 border-t border-[#F1F5F9] text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'accounts', label: `People (${matchedUsers.length})` },
            {
              id: 'colleges',
              label: useSemanticSearch && semanticResults?.matches
                ? `Colleges (${semanticResults.matches.length} AI matches)`
                : `Colleges (${matchedColleges.length})`,
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1687D4] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULTS FEED */}
      <div className="space-y-6">
        {/* ACCOUNTS SECTION */}
        {(activeTab === 'all' || activeTab === 'accounts') && (
          <div className="apple-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                People ({matchedUsers.length})
              </h2>
            </div>

            {matchedUsers.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                {allUsers.length === 0
                  ? 'No accounts registered yet on the platform.'
                  : `No accounts found matching "${query}".`}
              </p>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {matchedUsers.map(user => {
                  const isFollowing = currentUser ? currentUser.following.includes(user.id) : false;
                  const isSelf = currentUser ? user.id === currentUser.id : false;

                  return (
                    <div
                      key={user.id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors"
                    >
                      {/* Left: Avatar + Details (Instagram Row style) */}
                      <Link
                        href={`/user/${user.username}`}
                        className="flex items-center space-x-3 min-w-0 flex-1"
                      >
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full border border-[#E2E8F0] bg-[#EFF6FF] text-[#2563EB] font-bold text-base flex items-center justify-center shrink-0">
                            {user.fullName[0]}
                          </div>
                          {user.isVerified && (
                            <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#059669] p-0.5 text-white">
                              <UserCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-sm text-[#0F172A] truncate">
                              {user.fullName}
                            </span>
                            <span className="text-xs text-[#64748B] font-medium">
                              @{user.username}
                            </span>
                          </div>

                          <p className="text-xs text-[#475569] line-clamp-1">
                            {user.headline}
                          </p>

                          <div className="mt-0.5 flex items-center space-x-2 text-[11px] text-[#94A3B8]">
                            <span className="capitalize font-semibold text-[#2563EB]">{user.role}</span>
                            <span>•</span>
                            <span>{user.collegeName}</span>
                            <span>•</span>
                            <span>{user.followersCount} followers</span>
                          </div>
                        </div>
                      </Link>

                      {/* Right: Instagram-Style Follow Button */}
                      {!isSelf && (
                        <button
                          onClick={() => toggleFollowUser(user.id)}
                          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                            isFollowing
                              ? 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COLLEGES SECTION */}
        {(activeTab === 'all' || activeTab === 'colleges') && (
          <div className="apple-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Colleges {useSemanticSearch && semanticResults?.matches ? `(${semanticResults.matches.length} AI matches)` : `(${matchedColleges.length})`}
                </h2>
                {useSemanticSearch && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    Vector Embedding Match
                  </span>
                )}
              </div>
              {isSearchingSemantic && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Computing semantic vectors...</span>
                </div>
              )}
            </div>

            {/* Semantic search active notice */}
            {useSemanticSearch && semanticResults && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Ranked by AI semantic relevance for <strong>&ldquo;{query}&rdquo;</strong></span>
                </div>
                <span className="text-[10px] font-mono text-blue-600/80">Model: {semanticResults.model || 'nomic-embed-text'}</span>
              </div>
            )}

            {useSemanticSearch && semanticResults?.matches ? (
              semanticResults.matches.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-4 text-center">
                  No colleges found with semantic relevance to &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {semanticResults.matches.map((match: any) => {
                    const col = colleges.find(c => c.id === match.college_id) || {
                      id: match.college_id,
                      name: match.college_name,
                      slug: match.college_id.replace(/^col-/, ''),
                      collegeType: 'Engineering',
                      location: match.location || 'Tamil Nadu',
                      state: 'TN',
                      ratingAverage: match.rating || 4.5,
                      reviewCount: 12,
                    };
                    const matchPercent = Math.round((match.similarity_score || 0.8) * 100);

                    return (
                      <Link
                        key={match.college_id}
                        href={`/colleges/${col.slug}`}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0 font-bold mt-0.5">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                                {col.name}
                              </span>
                              <span className="rounded bg-[#EFF6FF] px-2 py-0.2 text-[10px] font-bold text-[#2563EB]">
                                {col.collegeType}
                              </span>
                              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                                {matchPercent}% AI Match
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-[#64748B]">
                              <MapPin className="h-3 w-3 text-[#2563EB]" />
                              <span>{col.location}, {col.state}</span>
                              <span>•</span>
                              <span className="font-bold text-[#D97706]">★ {col.ratingAverage || 'N/A'}</span>
                              <span>({col.reviewCount || 0} reviews)</span>
                            </div>

                            {/* Semantic Summary & Matched Attributes */}
                            {match.summary && (
                              <p className="text-xs text-slate-600 line-clamp-1 italic">
                                &ldquo;{match.summary}&rdquo;
                              </p>
                            )}

                            {match.matched_attributes && match.matched_attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {match.matched_attributes.map((attr: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60"
                                  >
                                    ✓ {attr}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 group-hover:underline">
                            View Campus
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : matchedColleges.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                No colleges found matching &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {matchedColleges.map(col => (
                  <Link
                    key={col.id}
                    href={`/colleges/${col.slug}`}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-11 w-11 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] shrink-0 font-bold">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                            {col.name}
                          </span>
                          <span className="rounded bg-[#EFF6FF] px-2 py-0.2 text-[10px] font-bold text-[#2563EB]">
                            {col.collegeType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-[#64748B] mt-0.5">
                          <MapPin className="h-3 w-3 text-[#2563EB]" />
                          <span>{col.location}, {col.state}</span>
                          <span>•</span>
                          <span className="font-bold text-[#D97706]">★ {col.ratingAverage || 'N/A'}</span>
                          <span>({col.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
