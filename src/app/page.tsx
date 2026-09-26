'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Shield, Sparkles, Building2, UserCheck } from 'lucide-react';
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
      {/* Main Feed Section (Col 1 & 2) */}
      <div className="space-y-4 lg:col-span-2">
        {/* Banner with Connected Layers */}
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5">
          <div className="flex items-center space-x-2 text-[#38E6A5]">
            <Sparkles className="h-5 w-5" />
            <h1 className="text-lg font-bold text-[#F8FAFC]">Campus Ecosystem Feed</h1>
          </div>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Real student experiences, alumni mentorship, and discussions across campuses. Unfiltered and transparent.
          </p>
          
          {/* Quick Filter Tabs */}
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#38E6A5] text-[#07111F]'
                  : 'bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              All Discussions
            </button>
            <button
              onClick={() => setFilter('mentorship')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filter === 'mentorship'
                  ? 'bg-[#38E6A5] text-[#07111F]'
                  : 'bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Alumni Mentorship
            </button>
            <button
              onClick={() => setFilter('placements')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filter === 'placements'
                  ? 'bg-[#38E6A5] text-[#07111F]'
                  : 'bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Placements & Prep
            </button>
          </div>
        </div>

        {/* Quick Post Prompt */}
        <div className="flex items-center justify-between rounded-xl border border-[#1E3A5F] bg-[#162D4A] p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#112238] font-semibold text-[#38E6A5]">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
            <p className="text-sm text-[#94A3B8]">Ask questions, share advice or hostel realities...</p>
          </div>
          <Link
            href="/create"
            className="rounded-lg bg-[#38E6A5] px-4 py-1.5 text-xs font-semibold text-[#07111F] hover:bg-[#70F3C1]"
          >
            Post
          </Link>
        </div>

        {/* Posts Stream */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5 transition hover:border-[#38E6A5]/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#162D4A] text-sm font-bold text-[#F8FAFC]">
                    {post.isAnonymous ? '?' : post.authorName[0]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-[#F8FAFC]">
                        {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                      </span>
                      {post.isVerifiedAuthor && !post.isAnonymous && (
                        <span className="flex items-center space-x-1 rounded bg-[#38E6A5]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#38E6A5]">
                          <UserCheck className="h-3 w-3" />
                          <span>Verified {post.authorRole === 'alumni' ? 'Alumni' : 'Student'}</span>
                        </span>
                      )}
                    </div>
                    {post.collegeName && (
                      <div className="flex items-center space-x-1 text-xs text-[#94A3B8]">
                        <Building2 className="h-3 w-3" />
                        <span>{post.collegeName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {post.topic && (
                  <span className="rounded-full bg-[#162D4A] px-2.5 py-1 text-[11px] font-medium text-[#5B8CFF]">
                    {post.topic}
                  </span>
                )}
              </div>

              {/* Body */}
              <p className="mt-4 text-sm leading-relaxed text-[#F8FAFC]/90">
                {post.content}
              </p>

              {/* Actions Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-[#1E3A5F] pt-3 text-xs text-[#94A3B8]">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className="flex items-center space-x-1.5 hover:text-[#38E6A5]"
                >
                  <Heart className="h-4 w-4" />
                  <span>{post.likesCount}</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentsCount} comments</span>
                </div>
                <button className="flex items-center space-x-1.5 hover:text-[#5B8CFF]">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Sidebar (Col 3): Active Communities & Trust Notice */}
      <aside className="space-y-4">
        {/* Trust Principle Badge */}
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-4">
          <div className="flex items-center space-x-2 text-[#38E6A5]">
            <Shield className="h-4 w-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Campus Lenz Trust System</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
            Institutions cannot delete criticism or change ratings. Negative student experiences are preserved under our transparency guarantee.
          </p>
        </div>

        {/* Communities Box */}
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Alumni & Campus Circles
            </h2>
            <Link href="/explore" className="text-xs text-[#38E6A5] hover:underline">
              Explore
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {communities.map((comm) => (
              <div key={comm.id} className="rounded-lg bg-[#162D4A] p-3 text-xs">
                <p className="font-semibold text-[#F8FAFC]">{comm.name}</p>
                <p className="mt-1 line-clamp-2 text-[#94A3B8]">{comm.description}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#38E6A5]">
                  <span>{comm.membersCount} members</span>
                  <span className="capitalize text-[#94A3B8]">{comm.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
