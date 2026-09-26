'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Shield, Sparkles, Building2, UserCheck, ArrowRight, Bookmark } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function HomePage() {
  const { posts, toggleLikePost, currentUser, communities } = useApp();
  const [filter, setFilter] = useState<'all' | 'mentorship' | 'placements'>('all');

  const filteredPosts = posts.filter(post => {
    if (filter === 'mentorship') return post.topic?.toLowerCase().includes('mentor');
    if (filter === 'placements') return post.topic?.toLowerCase().includes('placement');
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Stream (Col 1 & 2) */}
      <div className="space-y-5 lg:col-span-2">
        {/* Banner */}
        <div className="apple-card p-6 border-l-4 border-l-[#2563EB]">
          <div className="flex items-center space-x-2 text-[#2563EB]">
            <Sparkles className="h-5 w-5" />
            <h1 className="text-lg font-bold text-[#0F172A]">Campus Ecosystem Feed</h1>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            Real student experiences, unedited placement feedback, and verified alumni mentorship. No promotional noise.
          </p>
          
          {/* Filter Pills */}
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Discussions' },
              { id: 'mentorship', label: 'Alumni Mentorship' },
              { id: 'placements', label: 'Placements & Prep' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`rounded-full px-4 py-2 font-semibold transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-[#2563EB] text-white shadow-sm scale-102'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Post Prompt Card */}
        <div className="apple-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] font-bold text-[#2563EB]">
                {currentUser?.fullName?.[0] || 'U'}
              </div>
              <p className="text-xs text-[#64748B] truncate font-medium">
                Ask a question about hostel life, academics, or company visits...
              </p>
            </div>
            <Link
              href="/create"
              className="apple-button-primary shrink-0 text-xs"
            >
              Start Post
            </Link>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="apple-card apple-card-hover p-6"
              >
                {/* Author row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F5F9] text-sm font-bold text-[#0F172A]">
                      {post.isAnonymous ? '?' : post.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                        </span>
                        {post.isVerifiedAuthor && !post.isAnonymous && (
                          <span className="flex items-center space-x-1 rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                            <UserCheck className="h-3 w-3" />
                            <span>Verified {post.authorRole === 'alumni' ? 'Alumni' : 'Student'}</span>
                          </span>
                        )}
                      </div>
                      {post.collegeName && (
                        <div className="mt-0.5 flex items-center space-x-1 text-xs text-[#64748B]">
                          <Building2 className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>{post.collegeName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {post.topic && (
                    <span className="rounded-lg bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold text-[#2563EB]">
                      {post.topic}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="mt-4 text-sm leading-relaxed text-[#1E293B]">
                  {post.content}
                </p>

                {/* Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className="flex items-center space-x-1.5 transition-colors hover:text-[#2563EB]"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="font-semibold">{post.likesCount} Helpful</span>
                  </button>
                  <div className="flex items-center space-x-1.5 hover:text-[#0F172A]">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.commentsCount} comments</span>
                  </div>
                  <button className="flex items-center space-x-1.5 transition-colors hover:text-[#2563EB]">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar (Col 3) */}
      <aside className="space-y-5">
        {/* Trust Guarantee Card */}
        <div className="apple-card p-5">
          <div className="flex items-center space-x-2 text-[#059669]">
            <Shield className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Campus Lenz Trust Guarantee</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
            Institutions cannot delete student criticism or manipulate star ratings. Negative feedback is protected as legitimate student evaluation.
          </p>
        </div>

        {/* Communities List */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Alumni & Campus Circles
            </h2>
            <Link href="/explore" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{comm.name}</span>
                  <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[9px] uppercase font-bold text-[#2563EB]">
                    {comm.category}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-normal text-[#64748B]">
                  {comm.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#94A3B8]">
                  <span>{comm.membersCount} active campus peers</span>
                  <Link href="/messages" className="text-[#2563EB] hover:underline font-semibold">
                    Join & Chat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Compare shortcut */}
        <div className="apple-card p-5 bg-[#EFF6FF] border-[#BFDBFE]">
          <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">Need to compare options?</h3>
          <p className="mt-1 text-xs text-[#3B82F6]">
            Select up to 3 institutions to evaluate average packages, hostel ratings, and actual fees side-by-side.
          </p>
          <Link
            href="/compare"
            className="mt-3 apple-button-primary w-full text-xs font-semibold flex items-center justify-center space-x-1"
          >
            <span>Open Comparison Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
