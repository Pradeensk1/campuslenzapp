'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, MessageSquare, Share2, ZoomIn, ZoomOut, Maximize2, Send, UserCheck, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Post, UserProfile } from '@/types';

interface PinterestModalProps {
  post: Post | null;
  onClose: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  currentUser: UserProfile | null;
}

export default function PinterestImageModal({
  post,
  onClose,
  onLike,
  onComment,
  currentUser
}: PinterestModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [commentText, setCommentText] = useState('');

  if (!post || !post.imageUrl) return null;

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {/* Darkened Blur Backdrop (Pinterest style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        >
          {/* Close Floating Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-white/90 text-[#0F172A] shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition"
            title="Close Zoom"
          >
            <X className="h-5 w-5" />
          </button>

          {/* LEFT: PINTEREST ZOOMABLE IMAGE CONTAINER */}
          <div className="relative md:w-3/5 bg-[#0F172A] flex items-center justify-center p-2 overflow-hidden min-h-[300px] md:min-h-[580px]">
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={post.imageUrl}
                alt="Zoomed campus post photo"
                onClick={() => setIsZoomed(!isZoomed)}
                className={`max-w-full max-h-[85vh] object-contain transition-all duration-300 select-none cursor-pointer ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in hover:opacity-95'
                }`}
              />
            </div>

            {/* Bottom Controls for Zoom */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center space-x-1 hover:text-[#38E6A5] transition"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                <span>{isZoomed ? 'Reset Zoom' : 'Click Photo to Zoom (150%)'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: PINTEREST PIN DETAILS & COMMENTS SIDEBAR */}
          <div className="md:w-2/5 flex flex-col justify-between p-6 overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              {/* Author Row */}
              <div className="flex items-center space-x-3 pb-3 border-b border-[#F1F5F9]">
                <Link href={`/user/${post.authorUsername}`} onClick={onClose}>
                  <div className="h-11 w-11 rounded-full bg-[#EFF6FF] border border-[#E2E8F0] flex items-center justify-center font-bold text-sm text-[#2563EB]">
                    {post.isAnonymous ? '?' : post.authorName[0]}
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <Link
                      href={`/user/${post.authorUsername}`}
                      onClick={onClose}
                      className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB] truncate"
                    >
                      {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                    </Link>
                    {post.isVerifiedAuthor && (
                      <UserCheck className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-1">{post.authorHeadline}</p>
                  {post.collegeName && (
                    <p className="text-[10px] text-[#2563EB] flex items-center space-x-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{post.collegeName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Post Caption / Content */}
              <div className="text-xs sm:text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                {post.content}
              </div>

              {post.topic && (
                <div>
                  <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                    #{post.topic.replace(/\s+/g, '')}
                  </span>
                </div>
              )}

              {/* Engagement Action Bar */}
              <div className="flex items-center justify-between py-2 border-y border-[#F1F5F9] text-xs">
                <button
                  onClick={() => onLike(post.id)}
                  className={`flex items-center space-x-1.5 font-bold px-3 py-1.5 rounded-lg transition ${
                    isLiked
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                </button>

                <div className="flex items-center space-x-1 text-[#64748B]">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>

              {/* Comments Thread (Scrollable) */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Peer Discussion ({post.comments.length})
                </h4>
                {post.comments.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic py-2">
                    No comments yet. Be the first to reply!
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {post.comments.map(c => (
                      <div key={c.id} className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 text-xs">
                        <div className="flex justify-between items-center mb-0.5">
                          <Link href={`/user/${c.authorUsername}`} onClick={onClose} className="font-bold text-[#0F172A] hover:text-[#2563EB]">
                            {c.authorName}
                          </Link>
                          <span suppressHydrationWarning className="text-[10px] text-[#94A3B8]">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] leading-snug">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Comment Input Form at Bottom of Sidebar */}
            <form onSubmit={handleSubmitComment} className="pt-4 border-t border-[#F1F5F9] mt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a reply..."
                  className="flex-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
                <button
                  type="submit"
                  className="apple-button-primary !p-2 shrink-0"
                  title="Send Reply"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
