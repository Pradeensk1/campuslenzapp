'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserCheck, UserPlus, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { UserProfile } from '@/types';

interface FollowersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: 'Followers' | 'Following';
  userIds: string[];
}

export default function FollowersListModal({
  isOpen,
  onClose,
  title,
  userIds
}: FollowersListModalProps) {
  const { allUsers, currentUser, toggleFollowUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Resolve user objects
  const resolvedUsers: UserProfile[] = userIds
    .map(id => allUsers.find(u => u.id === id))
    .filter((u): u is UserProfile => Boolean(u));

  const filteredUsers = resolvedUsers.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.collegeName && u.collegeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">
                  {userIds.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Campus network connections</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* User List */}
          <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">No {title.toLowerCase()} found</p>
                <p className="text-[11px]">No users match your criteria</p>
              </div>
            ) : (
              filteredUsers.map(user => {
                const isSelf = currentUser ? currentUser.id === user.id : false;
                const isFollowing = currentUser ? currentUser.following.includes(user.id) : false;

                return (
                  <div key={user.id} className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition">
                    <Link
                      href={`/user/${user.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                            {user.fullName[0] || 'U'}
                          </div>
                        )}
                        {user.isVerified && (
                          <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-600 p-0.5 text-white border border-white">
                            <ShieldCheck className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 transition">
                            {user.fullName}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                        {user.headline && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.headline}</p>
                        )}
                      </div>
                    </Link>

                    {/* Follow Action */}
                    {!isSelf && currentUser && (
                      <button
                        onClick={() => toggleFollowUser(user.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                          isFollowing
                            ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
