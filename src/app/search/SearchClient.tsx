'use client';

import { useState } from 'react';
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
  const { allUsers, colleges, currentUser, toggleFollowUser } = useApp();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'accounts' | 'colleges'>('all');

  const normalizedQuery = query.toLowerCase().trim();

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

  // Search through colleges
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
      {/* Instagram-Inspired Search Hero */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-[#2563EB]">
          <Search className="h-5 w-5" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Instagram-Style Discovery & Search
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Search instantly for students (e.g. <strong>Junith</strong>, <strong>Arun</strong>), alumni, professors, and colleges across institutions.
        </p>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name (e.g. Junith), @username, college, or role..."
            className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none transition-colors shadow-2xs"
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

        {/* Instagram Category Tabs */}
        <div className="flex space-x-2 pt-2 border-t border-[#F1F5F9] text-xs">
          {[
            { id: 'all', label: 'Top Results' },
            { id: 'accounts', label: `People (${matchedUsers.length})` },
            { id: 'colleges', label: `Colleges (${matchedColleges.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
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
                People, Students & Staff ({matchedUsers.length})
              </h2>
              {query && (
                <span className="text-xs text-[#2563EB] font-semibold">Matching "{query}"</span>
              )}
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Institutions & Campuses ({matchedColleges.length})
              </h2>
            </div>

            {matchedColleges.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                No colleges found matching "{query}".
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
