'use client';

import { useState, useRef, useDeferredValue } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Building2,
  UserCheck,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  FileText,
  UserPlus,
  UserMinus,
  ArrowRight,
  ZoomIn,
  Repeat,
  AlertTriangle,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  BookOpen,
  Briefcase,
  GraduationCap,
  Scale,
  Search,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Radio,
  Bookmark,
  Heart,
  Eye,
  Check,
  X,
  PlusCircle,
  LogIn,
  Paperclip,
  Video,
  Home,
  Users,
  Compass,
  Crown,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Post } from '@/types';
import { isVideoMedia, formatFileSize, compressImageToDataUrl } from '@/lib/mediaUtils';
import PinterestImageModal from '@/components/PinterestImageModal';
import AlumniHomeView from '@/components/home/AlumniHomeView';
import FacultyHomeView from '@/components/home/FacultyHomeView';
import InstitutionHomeView from '@/components/home/InstitutionHomeView';
import StudentFeaturesHub from '@/components/student/StudentFeaturesHub';

export default function HomePageClient({ initialPosts = [] }: { initialPosts?: Post[]; initialColleges?: any[] }) {
  const {
    posts: contextPosts,
    toggleLikePost,
    addComment,
    addPost,
    currentUser,
    communities,
    toggleFollowUser,
    allUsers,
    repostToInstitution,
    repostPost,
    reportFalseInfoPost,
    reportPost,
    deletePost,
    deleteComment,
    checkAlumniPostEligibility,
    sensitiveContentShieldActive,
    toggleSensitiveContentShield,
    runOpenSourceAIModeration
  } = useApp();

  const posts = contextPosts.length > 0 ? contextPosts : initialPosts;
  
  // Track open comment trays per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Track Pinterest-style zoomed post
  const [zoomedPost, setZoomedPost] = useState<Post | null>(null);

  // Reporting State (Faculty / Institution / Admin)
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Feed Filter Tabs: 'all' | 'students' | 'alumni' | 'institution'
  const [feedFilter, setFeedFilter] = useState<'all' | 'students' | 'alumni' | 'institution'>('all');

  // AI Sentiment & Safety Feed Filter: 'all' | 'positive' | 'academic' | 'sensitive'
  const [feedSentimentFilter, setFeedSentimentFilter] = useState<'all' | 'positive' | 'academic' | 'sensitive'>('all');
  const [unhiddenSensitivePostIds, setUnhiddenSensitivePostIds] = useState<string[]>([]);

  const handleRevealSensitivePost = (postId: string) => {
    setUnhiddenSensitivePostIds(prev => [...prev, postId]);
  };

  // Role-Specific Workspace vs Global Stream View
  const [roleWorkspaceMode, setRoleWorkspaceMode] = useState<boolean>(true);
  const [studentViewMode, setStudentViewMode] = useState<'feed' | 'hub'>('feed');

  // New Navigation & Category State matching Reference Mockup
  const [activeLeftNav, setActiveLeftNav] = useState<string>('home');
  const [trendingTab, setTrendingTab] = useState<string>('All');
  const [recommendedTab, setRecommendedTab] = useState<string>('Colleges');
  const [resourcesTab, setResourcesTab] = useState<string>('Notes');
  const [communityCategory, setCommunityCategory] = useState<string>('All Posts');
  const [followedRecIds, setFollowedRecIds] = useState<string[]>(['rec-1']);

  const toggleFollowRec = (id: string) => {
    setFollowedRecIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bookmarks
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const toggleSavePost = (postId: string) => {
    setSavedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    setActionFeedback(savedPosts.includes(postId) ? 'Removed from saved bookmarks' : '🔖 Saved to your bookmarks!');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Inline Quick Post Composer State
  const [isComposing, setIsComposing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const deferredPostContent = useDeferredValue(postContent);
  const [postTopic, setPostTopic] = useState('Campus Update');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    if (isVid && file.size > 4.5 * 1024 * 1024) {
      setActionFeedback('⚠️ Direct video files must be under 4.5MB. For longer videos, please provide an external link.');
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }

    setMediaFile(file);
    setMediaFileType(isVid ? 'video' : 'image');

    if (isVid) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const compressed = await compressImageToDataUrl(file);
        setPostImageUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setPostImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaFileType(null);
    setPostImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 45) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleSharePost = (postId: string) => {
    try {
      const url = `${window.location.origin}/#${postId}`;
      navigator.clipboard.writeText(url);
      setActionFeedback('⚡ Direct post link copied to clipboard!');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch {
      setActionFeedback('Link copied to clipboard!');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setActionFeedback('⚠️ Please sign in or register to publish a post.');
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }
    if (!postContent.trim()) return;

    const isAnonymous = currentUser.role === 'student' ? isAnonymousPost : false;
    const isKnowledgeBased = currentUser.role === 'faculty';

    const res = addPost({
      authorId: currentUser.id,
      authorUsername: isAnonymous ? 'anonymous_student' : currentUser.username,
      authorName: isAnonymous ? 'Anonymous Student' : currentUser.fullName,
      authorRole: currentUser.role,
      authorHeadline: isAnonymous ? 'Verified Student (Anonymous Post)' : currentUser.headline,
      isVerifiedAuthor: isAnonymous ? false : currentUser.isVerified,
      isAnonymous,
      isKnowledgeBased,
      collegeId: currentUser.collegeId,
      collegeName: currentUser.collegeName,
      content: postContent.trim(),
      topic: postTopic,
      imageUrl: postImageUrl.trim() || undefined
    });

    if (res.success) {
      setPostContent('');
      handleRemoveMedia();
      setIsAnonymousPost(false);
      setIsComposing(false);
      setFeedFilter('all');
      setFeedSentimentFilter('all');
      setActionFeedback('🎉 Post published to live campus stream!');
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback(res.message || 'Could not publish post.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const filteredPosts = posts.filter((p) => {
    // Hide quarantined posts from non-admin users
    if (p.isQuarantined && currentUser?.role !== 'admin') return false;

    // Role filter
    if (feedFilter === 'students' && p.authorRole !== 'student') return false;
    if (feedFilter === 'alumni' && p.authorRole !== 'alumni') return false;
    if (feedFilter === 'institution' && p.authorRole !== 'institution') return false;

    // AI Sentiment & Safety filter
    if (feedSentimentFilter === 'positive' && p.sentiment !== 'positive') return false;
    if (feedSentimentFilter === 'academic' && !p.isKnowledgeBased && !p.topic?.includes('Academic') && !p.topic?.includes('Research') && !p.topic?.includes('Placement') && !p.topic?.includes('Notes')) return false;
    if (feedSentimentFilter === 'sensitive' && !p.isSensitive) return false;

    // Community Category filter
    if (communityCategory === 'Questions' && !p.content.includes('?') && !p.topic?.toLowerCase().includes('question') && !p.topic?.toLowerCase().includes('doubt')) return false;
    if (communityCategory === 'Opportunities' && !p.topic?.toLowerCase().includes('job') && !p.topic?.toLowerCase().includes('intern') && !p.topic?.toLowerCase().includes('hiring') && !p.content.toLowerCase().includes('intern') && !p.content.toLowerCase().includes('job') && !p.content.toLowerCase().includes('hiring')) return false;
    if (communityCategory === 'Projects' && !p.topic?.toLowerCase().includes('project') && !p.content.toLowerCase().includes('project') && !p.content.toLowerCase().includes('build')) return false;
    if (communityCategory === 'Events' && !p.topic?.toLowerCase().includes('event') && !p.topic?.toLowerCase().includes('hackathon') && !p.content.toLowerCase().includes('hackathon') && !p.content.toLowerCase().includes('fest') && !p.content.toLowerCase().includes('webinar')) return false;
    if (communityCategory === 'Achievements' && !p.topic?.toLowerCase().includes('achievement') && !p.topic?.toLowerCase().includes('won') && !p.content.toLowerCase().includes('winner') && !p.content.toLowerCase().includes('congrat') && !p.content.toLowerCase().includes('placed')) return false;

    return true;
  });

  const handleToggleComments = (postId: string) => {
    setActiveCommentsPostId(prev => (prev === postId ? null : postId));
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setActionFeedback('⚠️ Please sign in or register to comment on posts.');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleRepost = (postId: string) => {
    const res = repostPost(postId);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReportPostSubmit = (postId: string) => {
    if (!reportReason.trim()) return;
    const res = reportPost(postId, reportReason.trim());
    setActionFeedback(res.message);
    setReportingPostId(null);
    setReportReason('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // If user is Alumni and wants their dedicated Mentorship HQ workspace
  if (currentUser?.role === 'alumni' && roleWorkspaceMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900">Alumni Mentorship HQ</span>
              <span className="text-[10px] text-slate-400 ml-2">Dedicated Alumni View</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(true)}
              className="px-3 py-1 rounded-lg bg-white text-emerald-700 shadow-2xs font-bold"
            >
              Mentorship HQ
            </button>
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(false)}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900"
            >
              Browse Campus Feed
            </button>
          </div>
        </div>
        <AlumniHomeView />
      </div>
    );
  }

  // If user is Faculty and wants their dedicated Academic Knowledge Exchange workspace
  if (currentUser?.role === 'faculty' && roleWorkspaceMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900">Faculty Academic Knowledge Portal</span>
              <span className="text-[10px] text-slate-400 ml-2">Peer-Reviewed Publishing & Circulars</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(true)}
              className="px-3 py-1 rounded-lg bg-white text-amber-700 shadow-2xs font-bold"
            >
              Academic Portal
            </button>
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(false)}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900"
            >
              Browse Campus Feed
            </button>
          </div>
        </div>
        <FacultyHomeView />
      </div>
    );
  }

  // If user is Institution and wants their dedicated Governance & Broadcast workspace
  if (currentUser?.role === 'institution' && roleWorkspaceMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-50 text-purple-700">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900">University Executive Governance Console</span>
              <span className="text-[10px] text-slate-400 ml-2">Official Broadcasts & Community Controller</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(true)}
              className="px-3 py-1 rounded-lg bg-white text-purple-700 shadow-2xs font-bold"
            >
              Governance Console
            </button>
            <button
              type="button"
              onClick={() => setRoleWorkspaceMode(false)}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900"
            >
              Browse Campus Feed
            </button>
          </div>
        </div>
        <InstitutionHomeView />
      </div>
    );
  }

  return (
    <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Role Workspace Return Banner if browsing feed */}
      {currentUser && (currentUser.role === 'alumni' || currentUser.role === 'faculty' || currentUser.role === 'institution') && (
        <div className="mb-6 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">
              Browsing Campus Feed as {currentUser.role.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400">
              (Role permissions and restrictions apply)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRoleWorkspaceMode(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
          >
            Return to {currentUser.role === 'alumni' ? 'Mentorship HQ' : currentUser.role === 'faculty' ? 'Academic Portal' : 'Governance Console'} →
          </button>
        </div>
      )}

      {/* Admin Quick Governance Alert Banner */}
      {currentUser?.role === 'admin' && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold">
              Root Administrator Active: Full user account purge, post moderation & terminal privileges enabled
            </span>
          </div>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Admin Platform Console →</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (Cols 1-2): 10-Item Nav Card + Premium Upgrade */}
        {/* ========================================================= */}
        <aside className="hidden xl:block xl:col-span-2 space-y-4 sticky top-20">
          
          {/* 10-Item Navigation Card matching reference mockup */}
          <div className="ocean-glass-card p-3 space-y-1 touch-over-glass">
            {[
              { id: 'home', label: 'Home', icon: Home, href: '/' },
              { id: 'colleges', label: 'Colleges', icon: Building2, href: '/colleges' },
              { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase, href: '/jobs' },
              { id: 'resources', label: 'Study Resources', icon: BookOpen, href: '/resources' },
              { id: 'events', label: 'Events', icon: Calendar, href: '/events' },
              { id: 'students', label: 'Students & Community', icon: Users, href: '/servers' },
              { id: 'projects', label: 'Projects & Ideas', icon: Sparkles, href: '/projects' },
              { id: 'explore', label: 'Explore', icon: Compass, href: '/search' },
              { id: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
              { id: 'profile', label: 'My Profile', icon: UserCheck, href: currentUser ? `/user/${currentUser.username}` : '/login' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeLeftNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveLeftNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(5,150,105,0.3)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Upgrade to CampusLenz Premium Card */}
          <div className="rounded-3xl p-4.5 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-emerald-500/10 border border-amber-300/40 backdrop-blur-md shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-[0_4px_10px_rgba(245,158,11,0.3)] shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-900 leading-tight">
                Upgrade to CampusLenz Premium
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Unlock AI Notes, verified alumni mentor badges & mock interviews.
            </p>
            <Link
              href="/register"
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center block shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all"
            >
              Upgrade Now →
            </Link>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN (Cols 3-9): Live Dynamic Feed Stream        */}
        {/* ========================================================= */}
        <main className="col-span-1 xl:col-span-7 space-y-6">
          
          {/* Action Feedback Banner if present */}
          {actionFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{actionFeedback}</span>
              </div>
              <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Student Mode Switcher: Social Stream vs Student Hub & Utilities */}
          <div className="ocean-glass-card p-2 shadow-xs touch-over-glass">
            <div className="flex items-center gap-1.5 p-1 bg-sky-100/50 rounded-2xl text-xs font-semibold w-full sm:w-auto border border-white/60">
              <button
                type="button"
                onClick={() => setStudentViewMode('feed')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all duration-200 ${
                  studentViewMode === 'feed'
                    ? 'bg-white/95 text-[#0284C7] shadow-[0_2px_8px_rgba(2,132,199,0.18)] font-black'
                    : 'text-slate-600 hover:text-[#0C2340]'
                }`}
              >
                Campus Social Stream
              </button>
              <button
                type="button"
                onClick={() => setStudentViewMode('hub')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  studentViewMode === 'hub'
                    ? 'bg-white/95 text-[#0284C7] shadow-[0_2px_8px_rgba(2,132,199,0.18)] font-black'
                    : 'text-slate-600 hover:text-[#0C2340]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Student Hub & Utilities</span>
              </button>
            </div>
          </div>

          {studentViewMode === 'hub' ? (
            <StudentFeaturesHub />
          ) : (
            <>
              {/* 1. Hero Greeting Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 border border-emerald-200/70 p-6 sm:p-7 backdrop-blur-md shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-2.5 text-left z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-300/40 text-emerald-800 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Welcome back, {currentUser ? currentUser.fullName.split(' ')[0] : 'partha'} 👋</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    Good morning, {currentUser ? currentUser.fullName.split(' ')[0] : 'partha'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                    Explore opportunities, connect with peers, and prepare for your dream career today.
                  </p>
                  <div className="pt-1 flex items-center gap-4 flex-wrap">
                    <button
                      onClick={() => {
                        setTrendingTab('Internships');
                        const el = document.getElementById('trending-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
                    >
                      <span>Explore Opportunities</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="italic font-serif text-emerald-800 text-base sm:text-lg font-medium tracking-wide">
                      For a Brighter Future!
                    </span>
                  </div>
                </div>

                {/* Student Portrait / Hero Illustration */}
                <div className="relative shrink-0 hidden sm:block">
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative bg-gradient-to-tr from-emerald-400 to-sky-400">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-200 shadow-md flex items-center gap-1.5 text-[10px] font-black text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CampusLenz Verified</span>
                  </div>
                </div>
              </div>

              {/* 2. 5 Vibrant Quick Action Cards in a Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {/* Find Colleges */}
                <Link
                  href="/colleges"
                  className="group p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-200/70 hover:border-emerald-300 transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">Find Colleges</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">500+ Top Colleges</p>
                  </div>
                </Link>

                {/* Jobs & Internships */}
                <button
                  onClick={() => {
                    setTrendingTab('Internships');
                    const el = document.getElementById('trending-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group text-left p-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/15 border border-orange-200/70 hover:border-orange-300 transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-700 flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-orange-700 transition-colors">Jobs & Internships</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">1,200+ Openings</p>
                  </div>
                </button>

                {/* Study Resources */}
                <button
                  onClick={() => {
                    setTrendingTab('All');
                    const el = document.getElementById('trending-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group text-left p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-200/70 hover:border-indigo-300 transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors">Study Resources</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Notes, PYQs & Books</p>
                  </div>
                </button>

                {/* Campus Events */}
                <button
                  onClick={() => {
                    setTrendingTab('Events');
                    const el = document.getElementById('trending-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group text-left p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-200/70 hover:border-amber-300 transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">Campus Events</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Hackathons & Fests</p>
                  </div>
                </button>

                {/* Find Students */}
                <Link
                  href="/search"
                  className="group p-3.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/15 border border-pink-200/70 hover:border-pink-300 transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-700 flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition-transform">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-pink-700 transition-colors">Find Students</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Connect Peers</p>
                  </div>
                </Link>
              </div>

              {/* 3. 🔥 Trending for Students */}
              <div id="trending-section" className="ocean-glass-card p-5 space-y-4 touch-over-glass">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      🔥 Trending for Students
                    </span>
                  </div>
                  {/* Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {['All', 'Internships', 'Admissions', 'Projects', 'Events', 'Exams'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTrendingTab(tab)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          trendingTab === tab
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white/70 hover:bg-white text-slate-600 border border-white/80'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Opportunity Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    {
                      id: 'trend-1',
                      category: 'Internships',
                      title: 'Python Developer Intern',
                      company: 'TechCorp India',
                      location: 'Remote',
                      stipend: '₹15,000/mo',
                      actionLabel: 'Apply Now',
                      tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
                    },
                    {
                      id: 'trend-2',
                      category: 'Admissions',
                      title: 'MCA Admissions 2026',
                      company: 'Anna University, CEG',
                      location: 'Chennai',
                      stipend: 'Counselling Open',
                      actionLabel: 'View Details',
                      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
                    },
                    {
                      id: 'trend-3',
                      category: 'Events',
                      title: 'Smart India Hackathon 2026',
                      company: 'All India Inter-College',
                      location: 'Hybrid',
                      stipend: 'Prize: ₹1,00,000',
                      actionLabel: 'Register',
                      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
                    },
                    {
                      id: 'trend-4',
                      category: 'Projects',
                      title: 'IoT Project Team Needed',
                      company: 'Final Year CSE Project',
                      location: 'Coimbatore',
                      stipend: '2 Members Wanted',
                      actionLabel: 'Join Team',
                      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
                    },
                  ]
                    .filter((item) => trendingTab === 'All' || item.category === trendingTab)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 shadow-2xs hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                              {item.category}
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-700">{item.stipend}</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 mt-2">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.company} · {item.location}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Verified by CampusLenz</span>
                          <button
                            onClick={() => {
                              setActionFeedback(`✅ Opened application for ${item.title}`);
                              setTimeout(() => setActionFeedback(null), 3000);
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-bold transition shadow-2xs"
                          >
                            {item.actionLabel} →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 4. 👥 Campus Community Header */}
              <div id="community-feed-section" className="ocean-glass-card p-4 space-y-3 touch-over-glass">
                <div className="flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900">Campus Community</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {filteredPosts.length} posts
                    </span>
                  </div>
                  
                  {/* + Create Post Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposing(true);
                      const el = document.getElementById('post-composer-box');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Create Post</span>
                  </button>
                </div>

                {/* Sub-Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {['All Posts', 'Questions', 'Opportunities', 'Projects', 'Events', 'Achievements'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCommunityCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        communityCategory === cat
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white/70 hover:bg-white text-slate-600 border border-white/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Interactive Dynamic Post Composer (All 5 Roles Supported with Permissions) */}
          {currentUser && (
            <div id="post-composer-box" className="ocean-glass-card p-5 space-y-3.5 touch-over-glass">
              {/* Role Context & Quota Banners */}
              {currentUser.role === 'alumni' && (() => {
                const elig = checkAlumniPostEligibility(currentUser);
                if (!elig.eligible) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-950 text-xs space-y-2 backdrop-blur-md">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Alumni Public Posting Restriction</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {elig.message}
                      </p>
                      {elig.followerCount < elig.requiredFollowers && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>Follower Eligibility Progress</span>
                            <span>{elig.followerCount} / {elig.requiredFollowers} Followers</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-amber-200/60 overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (elig.followerCount / elig.requiredFollowers) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-amber-800 italic">
                            💡 Tip: Mentor students via Direct Messages in Connect Hub to gain followers!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-300/50 text-emerald-900 text-[11px] flex items-center justify-between flex-wrap gap-1 backdrop-blur-md">
                    <span className="font-bold">
                      🎓 Alumni Quota: <strong>{elig.weeklyCount} / {elig.maxWeekly} posts</strong> used this week
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      Anti-Ragebait Shield Active
                    </span>
                  </div>
                );
              })()}

              {currentUser.role === 'faculty' && (
                <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-300/50 text-sky-950 text-[11px] flex items-center gap-2 backdrop-blur-md">
                  <BookOpen className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span>
                    <strong>Academic Faculty Stream:</strong> Posts are tagged as academic curriculum, research publications, or laboratory resources.
                  </span>
                </div>
              )}

              {currentUser.role === 'institution' && (
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-300/50 text-cyan-950 text-[11px] flex items-center gap-2 backdrop-blur-md">
                  <Building2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span>
                    <strong>Official Institutional Channel:</strong> Broadcast verified circulars, recruitment drives, and collegiate milestones.
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Link href={`/user/${currentUser.username}`}>
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-[#0284C7] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(2,132,199,0.3)]">
                    {currentUser.fullName[0] || 'U'}
                  </div>
                </Link>

                <div className="flex-1">
                  {!isComposing ? (
                    <button
                      onClick={() => setIsComposing(true)}
                      className="w-full text-left rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md px-4 py-3 text-xs text-slate-500 hover:bg-white/95 hover:text-[#0C2340] shadow-[inset_0_1px_2px_rgba(12,74,110,0.04)] transition-all"
                    >
                      {currentUser.role === 'faculty'
                        ? 'Publish academic research, curriculum notes, or lecture slides...'
                        : currentUser.role === 'institution'
                        ? 'Publish official campus circular or recruitment announcement...'
                        : currentUser.role === 'alumni'
                        ? 'Share career guidance, interview insights, or hiring openings...'
                        : 'Share campus thoughts, job offers, or project releases...'}
                    </button>
                  ) : (
                    <form onSubmit={handleQuickPostSubmit} className="space-y-3">
                      <textarea
                        rows={3}
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        placeholder={
                          currentUser.role === 'faculty'
                            ? 'Share syllabus guidance, research publications, or seminar alerts...'
                            : currentUser.role === 'institution'
                            ? 'Official notification content (Admissions, Examinations, Accreditation)...'
                            : currentUser.role === 'alumni'
                            ? 'Share mentorship advice, career insights, or industry interview tips...'
                            : "What's happening on campus? Share interview tips, symposium invites, or milestones..."
                        }
                        className="ocean-glass-input w-full p-3.5 text-xs text-[#0C2340] resize-none"
                        autoFocus
                      />

                      {/* Live Open-Source AI Telemetry Pill */}
                      {deferredPostContent.trim().length > 3 && (() => {
                        const ai = runOpenSourceAIModeration(deferredPostContent, postImageUrl);
                        const isSevere = ai.toxicity.score >= 80;
                        const isSens = ai.isSensitive;
                        const category = ai.classification?.category || 'General';
                        return (
                          <div className={`p-3 rounded-2xl text-[11px] font-bold flex items-center justify-between transition-all backdrop-blur-md ${
                            isSevere
                              ? 'bg-rose-500/15 border border-rose-300 text-rose-900'
                              : isSens
                              ? 'bg-amber-500/15 border border-amber-300 text-amber-900'
                              : 'bg-emerald-500/15 border border-emerald-300 text-emerald-900'
                          }`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0284C7]" />
                              <span className="truncate">
                                {isSevere ? (
                                  <>🚨 <strong>Critical Toxicity ({ai.toxicity.score}%):</strong> Submission rejected by policy</>
                                ) : isSens ? (
                                  <>⚠️ <strong>Sensitive ({category}):</strong> Post will be masked behind AI feed blur shield.</>
                                ) : (
                                  <>✨ <strong>Clean • {category}:</strong> Toxicity {ai.toxicity.score}% • {ai.sentiment.label} ({Math.round(ai.sentiment.score * 100)}%)</>
                                )}
                              </span>
                            </div>
                            <span className="text-[10px] text-sky-800/60 font-mono hidden sm:inline shrink-0 ml-2">
                              campus-lenz-ai • ocean
                            </span>
                          </div>
                        );
                      })()}

                      {/* Student Anonymous Toggle */}
                      {currentUser.role === 'student' && (
                        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/60 border border-white/80 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-[#0C2340]">
                            <input
                              type="checkbox"
                              checked={isAnonymousPost}
                              onChange={e => setIsAnonymousPost(e.target.checked)}
                              className="h-4 w-4 rounded text-[#0284C7] focus:ring-[#0284C7]"
                            />
                            <span>Post Anonymously (Hide Name & Profile)</span>
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400">Protects student privacy</span>
                        </div>
                      )}

                      {/* Hashtag suggestions */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-slate-400 font-bold">Suggested:</span>
                        {(currentUser.role === 'faculty'
                          ? ['#Research', '#AcademicSyllabus', '#LabProjects', '#GuestLecture', '#ExamGuide']
                          : currentUser.role === 'institution'
                          ? ['#CampusCircular', '#Placements2026', '#Accreditation', '#NIRFRanking']
                          : ['#Placements2026', '#Hackathon', '#AlumniMentorship', '#Projects', '#CampusLife']
                        ).map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setPostContent(prev => prev + ' ' + tag)}
                            className="px-2.5 py-0.5 rounded-full bg-sky-100/60 text-[#0284C7] font-bold hover:bg-sky-200/70 border border-sky-200/40 transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Media File (Image / Video) Upload & URL Attachment */}
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMediaFileChange}
                          className="hidden"
                        />

                        {postImageUrl ? (
                          <div className="relative rounded-2xl border border-white/80 bg-slate-900 overflow-hidden p-2 shadow-sm">
                            {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? (
                              <video
                                src={postImageUrl}
                                controls
                                className="w-full max-h-60 rounded-xl bg-black object-contain"
                              />
                            ) : (
                              <img
                                src={postImageUrl}
                                alt="Attachment preview"
                                className="w-full max-h-60 rounded-xl object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={handleRemoveMedia}
                              className="absolute top-4 right-4 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition shadow-md"
                              title="Remove media"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="px-2 pt-2 text-white/90 text-[11px] flex items-center justify-between">
                              <span className="truncate max-w-[280px]">
                                {mediaFile ? mediaFile.name : 'Attached Media'}
                              </span>
                              <span className="text-[10px] text-white/70">
                                {mediaFile ? formatFileSize(mediaFile.size) : ''} • {mediaFileType === 'video' || isVideoMedia(postImageUrl) ? 'Video' : 'Image'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="ocean-glossy-pill-subtle inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0284C7]"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-[#0284C7]" />
                              <span>Attach Photo or Video</span>
                            </button>

                            <div className="flex-1 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-white/80 bg-white/70">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <input
                                type="url"
                                value={postImageUrl}
                                onChange={e => {
                                  setPostImageUrl(e.target.value);
                                  setMediaFileType(isVideoMedia(e.target.value) ? 'video' : 'image');
                                }}
                                placeholder="or paste image/video URL..."
                                className="w-full text-xs text-[#0C2340] focus:outline-hidden bg-transparent"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={postTopic}
                          onChange={e => setPostTopic(e.target.value)}
                          className="text-xs font-bold text-slate-700 bg-white/80 border border-white/90 rounded-2xl px-3 py-2 shadow-2xs focus:outline-none"
                        >
                          {currentUser.role === 'faculty' ? (
                            <>
                              <option value="Research & Publications">Academic: Research & Publications</option>
                              <option value="Curriculum & Syllabus">Academic: Curriculum & Syllabus</option>
                              <option value="Lab & Project Guidance">Academic: Lab & Project Guidance</option>
                              <option value="Industry Guest Lecture">Academic: Industry Guest Lecture</option>
                              <option value="Examination Guidelines">Academic: Examination Guidelines</option>
                            </>
                          ) : currentUser.role === 'institution' ? (
                            <>
                              <option value="Official Circular">Official Campus Circular</option>
                              <option value="Placement Drives">Placement Drives & Milestone</option>
                              <option value="Academic Calendar">Academic Calendar Update</option>
                              <option value="Accreditation & Awards">Accreditation & NAAC Milestone</option>
                            </>
                          ) : (
                            <>
                              <option value="Campus Update">Campus Update</option>
                              <option value="Campus Placements">Campus Placements</option>
                              <option value="Hackathons & Projects">Hackathons & Projects</option>
                              <option value="Alumni Mentorship">Alumni Mentorship</option>
                              <option value="Research & Achievements">Research & Achievements</option>
                            </>
                          )}
                        </select>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsComposing(false);
                              setPostContent('');
                              setPostImageUrl('');
                              setIsAnonymousPost(false);
                            }}
                            className="ocean-glossy-pill-subtle px-3.5 py-1.5 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!postContent.trim() || (currentUser.role === 'alumni' && !checkAlumniPostEligibility(currentUser).eligible)}
                            className="ocean-glossy-button px-5 py-2 text-xs font-bold disabled:opacity-50"
                          >
                            Publish Post
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {!isComposing && (
                <div className="flex items-center justify-around pt-2.5 border-t border-sky-100/70 text-xs text-slate-600">
                  <button
                    onClick={() => setIsComposing(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-white/80 hover:text-[#0284C7] transition-all font-bold"
                  >
                    <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                    <span>Media</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsComposing(true);
                      setPostTopic('Hackathons & Projects');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-white/80 hover:text-amber-600 transition-all font-bold"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Event</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsComposing(true);
                      setPostTopic('Campus Placements');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-white/80 hover:text-emerald-600 transition-all font-bold"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>Placement</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!currentUser && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Join the Campus Conversation</h3>
                  <p className="text-[11px] text-slate-500">Sign in or register to publish thoughts, placements, and achievements.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login" className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Sign In
                </Link>
                <Link href="/register" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition">
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* 3. Feed Filter & AI Safety Controls Bar */}
          <div className="ocean-glass-card p-4 space-y-3 touch-over-glass">
            {/* Row 1: Role tabs + AI Content Shield Switch */}
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 bg-sky-100/40 p-1.5 rounded-2xl text-xs font-bold border border-white/70">
                <button
                  onClick={() => setFeedFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                    feedFilter === 'all'
                      ? 'bg-white/95 text-[#0284C7] shadow-[0_2px_8px_rgba(2,132,199,0.2)] font-black'
                      : 'text-slate-600 hover:text-[#0C2340]'
                  }`}
                >
                  All Posts ({posts.length})
                </button>
                <button
                  onClick={() => setFeedFilter('students')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                    feedFilter === 'students'
                      ? 'bg-white/95 text-[#0284C7] shadow-[0_2px_8px_rgba(2,132,199,0.2)] font-black'
                      : 'text-slate-600 hover:text-[#0C2340]'
                  }`}
                >
                  Students ({posts.filter(p => p.authorRole === 'student').length})
                </button>
                <button
                  onClick={() => setFeedFilter('alumni')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                    feedFilter === 'alumni'
                      ? 'bg-white/95 text-emerald-600 shadow-[0_2px_8px_rgba(5,150,105,0.2)] font-black'
                      : 'text-slate-600 hover:text-[#0C2340]'
                  }`}
                >
                  Alumni ({posts.filter(p => p.authorRole === 'alumni').length})
                </button>
                <button
                  onClick={() => setFeedFilter('institution')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                    feedFilter === 'institution'
                      ? 'bg-white/95 text-cyan-700 shadow-[0_2px_8px_rgba(14,116,144,0.2)] font-black'
                      : 'text-slate-600 hover:text-[#0C2340]'
                  }`}
                >
                  Circulars
                </button>
              </div>

              {/* AI Content Shield Toggle Button */}
              <button
                type="button"
                onClick={toggleSensitiveContentShield}
                title={sensitiveContentShieldActive ? 'AI Sensitive Content Shield is Active' : 'AI Shield is Paused'}
                className={`ocean-glossy-pill-subtle inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                  sensitiveContentShieldActive
                    ? 'bg-emerald-500/15 text-emerald-900 border-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-white/60 text-slate-600 border-white/80 hover:bg-white/80'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${sensitiveContentShieldActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>AI Shield: {sensitiveContentShieldActive ? 'Active' : 'Off'}</span>
              </button>
            </div>

            {/* Row 2: Sentiment & AI Classification Filter Pills */}
            <div className="flex items-center justify-between border-t border-sky-100/70 pt-2.5 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-sky-800/70 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" /> AI Filter:
                </span>
                <button
                  onClick={() => setFeedSentimentFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    feedSentimentFilter === 'all'
                      ? 'ocean-glossy-button text-white'
                      : 'ocean-glossy-pill-subtle text-slate-600'
                  }`}
                >
                  All Sentiments
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('positive')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    feedSentimentFilter === 'positive'
                      ? 'bg-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)]'
                      : 'ocean-glossy-pill-subtle text-slate-600'
                  }`}
                >
                  <span>🌟 Positive</span>
                  <span className="text-[10px] opacity-80">
                    ({posts.filter(p => p.sentiment === 'positive').length})
                  </span>
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('academic')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    feedSentimentFilter === 'academic'
                      ? 'bg-[#0284C7] text-white shadow-[0_2px_8px_rgba(2,132,199,0.3)]'
                      : 'ocean-glossy-pill-subtle text-slate-600'
                  }`}
                >
                  <span>📘 Academic</span>
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('sensitive')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    feedSentimentFilter === 'sensitive'
                      ? 'bg-amber-600 text-white shadow-[0_2px_8px_rgba(217,119,6,0.3)]'
                      : 'ocean-glossy-pill-subtle text-slate-600'
                  }`}
                >
                  <span>⚠️ Sensitive</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
                    {posts.filter(p => p.isSensitive).length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-sky-900/60 font-semibold">
                {filteredPosts.length} posts matching AI filters
              </span>
            </div>
          </div>

          {/* 4. Stream of Dynamic Post Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
                const isCommentsOpen = activeCommentsPostId === post.id;
                const isAuthorSelf = currentUser ? post.authorId === currentUser.id : false;
                const isFollowingAuthor = currentUser ? currentUser.following.includes(post.authorId) : false;
                const isSaved = savedPosts.includes(post.id);
                const isSensitive = Boolean(post.isSensitive);
                const isShielded = isSensitive && sensitiveContentShieldActive && !unhiddenSensitivePostIds.includes(post.id);

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ocean-glass-card overflow-hidden touch-over-glass"
                  >
                    {/* Top Micro-Banner for Institution Repost */}
                    {post.repostedByInstitution && (
                      <div className="bg-purple-50/60 border-b border-purple-100/80 px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-900">
                        <Repeat className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reposted by {post.repostedByInstitution.institutionName}</span>
                      </div>
                    )}

                    {/* Top Micro-Banner for Faculty Repost */}
                    {post.repostedByFaculty && (
                      <div className="bg-indigo-50/60 border-b border-indigo-100/80 px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-900">
                        <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Recommended by Faculty ({post.repostedByFaculty.facultyName})</span>
                      </div>
                    )}

                    {/* Top Micro-Banner for Knowledge-Based Post */}
                    {post.isKnowledgeBased && (
                      <div className="bg-blue-50/50 border-b border-blue-100/60 px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-900">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Academic & Peer-Reviewed Resource</span>
                      </div>
                    )}

                    {/* Top Micro-Banner for Flagged Posts */}
                    {post.reportedByInstitution && (
                      <div className="bg-rose-50 border-b border-rose-100 px-4 py-1.5 flex items-center gap-1.5 text-[11px] text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>Flagged by institution: <em>"{post.reportedByInstitution.reason}"</em></span>
                      </div>
                    )}

                    {/* Post Header */}
                    <div className="p-4 sm:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Link href={post.isAnonymous ? '#' : `/user/${post.authorUsername}`}>
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-200 to-white border border-white/90 shadow-[0_4px_12px_rgba(2,132,199,0.18),inset_0_1px_1px_#ffffff] flex items-center justify-center text-sm font-black text-[#0284C7] shrink-0 hover:scale-105 transition-transform">
                              {post.isAnonymous ? '?' : post.authorName[0]}
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {post.isAnonymous ? (
                                <span className="text-sm font-extrabold text-[#0C2340]">Anonymous Student</span>
                              ) : (
                                <Link
                                  href={`/user/${post.authorUsername}`}
                                  className="text-sm font-extrabold text-[#0C2340] hover:text-[#0284C7] transition-colors truncate"
                                >
                                  {post.authorName}
                                </Link>
                              )}

                              {post.isVerifiedAuthor && !post.isAnonymous && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
                              )}

                              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.2 rounded-full bg-sky-100/70 text-[#0284C7] border border-sky-200/60 shadow-2xs">
                                {post.authorRole}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-sm">
                              {post.authorHeadline}
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span suppressHydrationWarning>{formatTimeAgo(post.createdAt)}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium truncate">{post.collegeName || 'Campus Lenz'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Action Tools */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!isAuthorSelf && !post.isAnonymous && currentUser && currentUser.role !== 'institution' && (
                            <button
                              onClick={() => toggleFollowUser(post.authorId)}
                              className={`text-xs font-bold px-3 py-1 rounded-full transition-all shrink-0 ${
                                isFollowingAuthor
                                  ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              {isFollowingAuthor ? 'Following' : '+ Follow'}
                            </button>
                          )}

                          {/* Report Post Trigger (Faculty, Institution, Admin, Students) */}
                          {!isAuthorSelf && currentUser && (
                            <button
                              onClick={() => {
                                setReportingPostId(reportingPostId === post.id ? null : post.id);
                                setReportReason('');
                              }}
                              title="Report Content"
                              className={`p-1.5 rounded-lg transition ${
                                reportingPostId === post.id
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Post (Available to Author or Admin) */}
                          {(currentUser?.role === 'admin' || isAuthorSelf) && (
                            <button
                              onClick={() => deletePost(post.id)}
                              title="Delete Post"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Content (Protected by 70% Blur Frosted Sensitive Shield if flagged) */}
                      {isShielded ? (
                        <div className="relative mt-3.5 rounded-3xl border border-amber-300/40 bg-amber-500/10 overflow-hidden min-h-[160px] flex items-center justify-center">
                          {/* Frosted/Blurred Background Preview */}
                          <div className="filter blur-xl select-none pointer-events-none opacity-30 p-5">
                            <p className="text-[13.5px] leading-relaxed text-[#0C2340] line-clamp-3">
                              {post.content}
                            </p>
                            {post.imageUrl && (
                              <div className="mt-2 h-28 bg-slate-200/50 rounded-2xl" />
                            )}
                          </div>

                          {/* Centered Sensitive Content Warning Shield */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/70 backdrop-blur-2xl space-y-2.5">
                            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="space-y-1 max-w-sm">
                              <h4 className="text-xs font-black text-[#0C2340] tracking-tight">
                                Sensitive Content Shield Activated
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                Flagged by open-source AI ({post.aiModelMetadata || 'unitary/toxic-bert'}):{' '}
                                <span className="font-bold text-amber-900">
                                  {post.sensitiveReason || 'Hostile or controversial discourse'}
                                </span>{' '}
                                (Toxicity: {post.toxicityScore ?? 54}%)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRevealSensitivePost(post.id)}
                              className="ocean-glossy-button px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-200" />
                              <span>Show Content Anyway</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Post Body Content */}
                          <p className="mt-3.5 text-[13.5px] leading-relaxed text-[#0C2340] whitespace-pre-line font-normal">
                            {post.content}
                          </p>

                          {/* Media Attachment (Image with Zoom or Video with Player) */}
                          {post.imageUrl && (
                            isVideoMedia(post.imageUrl) ? (
                              <div className="mt-3.5 rounded-3xl overflow-hidden border border-white/80 bg-black shadow-sm">
                                <video
                                  src={post.imageUrl}
                                  controls
                                  className="w-full max-h-[480px] rounded-3xl bg-black"
                                  preload="metadata"
                                />
                              </div>
                            ) : (
                              <div
                                onClick={() => setZoomedPost(post)}
                                className="mt-3.5 rounded-3xl overflow-hidden border border-white/90 bg-sky-50/50 relative group cursor-zoom-in shadow-xs"
                              >
                                <img
                                  src={post.imageUrl}
                                  alt="Post visual attachment"
                                  loading="lazy"
                                  className="w-full max-h-[460px] object-cover rounded-3xl transition-transform duration-300 group-hover:scale-[1.01]"
                                />
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md">
                                  <ZoomIn className="w-3.5 h-3.5 text-sky-300" />
                                  <span>Zoom Full</span>
                                </div>
                              </div>
                            )
                          )}
                        </>
                      )}

                      {/* Topic Tag & AI Provenance Badge */}
                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                        {post.topic && (
                          <span className="text-[11px] font-bold text-[#0284C7] bg-sky-100/60 px-2.5 py-0.5 rounded-full border border-sky-200/50 shadow-2xs">
                            #{post.topic.replace(/\s+/g, '')}
                          </span>
                        )}

                        {/* Open-Source AI Telemetry Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border shadow-2xs backdrop-blur-md ${
                            post.sentiment === 'positive'
                              ? 'bg-emerald-500/15 text-emerald-900 border-emerald-300'
                              : post.isSensitive || post.sentiment === 'ragebait'
                              ? 'bg-amber-500/15 text-amber-900 border-amber-300'
                              : post.sentiment === 'toxic'
                              ? 'bg-rose-500/15 text-rose-900 border-rose-300'
                              : 'bg-white/70 text-slate-600 border-white/80'
                          }`}
                          title={`AI Model: ${post.aiModelMetadata || 'toxic-bert + distilbert'} | Toxicity: ${post.toxicityScore ?? 4}%`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#0284C7]" />
                            <span>{post.sentiment || 'clean'}</span>
                            <span>•</span>
                            <span>{post.toxicityScore ?? 4}% tox</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reactions & Engagement Summary Bar */}
                    <div className="px-5 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-sky-100/70">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0284C7] text-white text-[9px] flex items-center justify-center shadow-xs">
                          👍
                        </span>
                        <span className="font-bold text-[#0C2340]">{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                        {post.sharesCount > 0 && (
                          <span className="text-[#0284C7] font-bold">• {post.sharesCount} reposts</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          👁 {post.likesCount * 14 + 115} views
                        </span>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="hover:text-[#0284C7] transition-colors font-bold text-slate-600"
                        >
                          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                        </button>
                      </div>
                    </div>

                    {/* Action Bar (Glossy Frosted Button Suite) */}
                    <div className="grid grid-cols-5 border-t border-sky-100/70 text-xs font-bold text-slate-600 bg-white/40">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 hover:bg-white/80 hover:text-[#0284C7] transition-colors ${
                          isLiked ? 'text-[#0284C7] font-black' : ''
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 hover:bg-white/80 hover:text-[#0284C7] transition-colors ${
                          isCommentsOpen ? 'text-[#0284C7] font-black' : ''
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Comment</span>
                      </button>

                      <button
                        onClick={() => handleRepost(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 hover:bg-sky-50 hover:text-[#0284C7] transition-colors ${
                          post.repostedByInstitution || post.repostedByFaculty || post.repostedByStudent
                            ? 'text-[#0284C7] font-black'
                            : ''
                        }`}
                        title={
                          currentUser?.role === 'faculty'
                            ? 'Repost official institution circular'
                            : currentUser?.role === 'institution'
                            ? 'Showcase student achievement'
                            : currentUser?.role === 'alumni'
                            ? 'Alumni restricted from reposting'
                            : 'Repost to campus network'
                        }
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {currentUser?.role === 'institution'
                            ? 'Showcase'
                            : currentUser?.role === 'faculty'
                            ? 'Circular'
                            : 'Repost'}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleSavePost(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 hover:bg-white/80 hover:text-amber-600 transition-colors ${
                          isSaved ? 'text-amber-600 font-black' : ''
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center justify-center gap-1.5 py-3 hover:bg-white/80 hover:text-[#0C2340] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Reporting Drawer if active */}
                    {reportingPostId === post.id && (
                      <div className="p-4 border-t border-rose-100 bg-rose-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-rose-900">
                            {currentUser?.role === 'institution'
                              ? 'Issue Official Disputed Claim Notice:'
                              : currentUser?.role === 'faculty'
                              ? 'Report Academic or Conduct Policy Violation:'
                              : 'Report Inappropriate or Misleading Content:'}
                          </label>
                          <span className="text-[10px] text-rose-600 font-medium">Confidential Review</span>
                        </div>
                        <input
                          type="text"
                          value={reportReason}
                          onChange={e => setReportReason(e.target.value)}
                          placeholder={
                            currentUser?.role === 'institution'
                              ? 'e.g. Inaccurate lab infrastructure or unverified placement statistics...'
                              : currentUser?.role === 'faculty'
                              ? 'e.g. Academic misconduct, non-educational content, or student guideline breach...'
                              : 'e.g. Harassment, spam, or misleading claims...'
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setReportingPostId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReportPostSubmit(post.id)}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
                          >
                            Submit Report
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-3">
                        {currentUser ? (
                          <form
                            onSubmit={(e) => handleCommentSubmit(post.id, e)}
                            className="flex items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {currentUser.fullName[0] || 'U'}
                            </div>
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              placeholder={
                                currentUser.role === 'faculty'
                                  ? 'Add academic feedback as faculty...'
                                  : currentUser.role === 'alumni'
                                  ? 'Share career advice as alumnus...'
                                  : 'Add a constructive comment...'
                              }
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                            >
                              Post
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                            <span className="text-slate-500">Sign in to leave a comment on this post</span>
                            <Link href="/login" className="font-bold text-blue-600 hover:underline">
                              Sign In →
                            </Link>
                          </div>
                        )}

                        <div className="space-y-2 pt-1">
                          {post.comments.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2 italic">
                              No comments yet. Be the first to start the conversation!
                            </p>
                          ) : (
                            post.comments.map((cmt) => (
                              <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                                <Link href={`/user/${cmt.authorUsername}`}>
                                  <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {cmt.authorName[0]}
                                  </div>
                                </Link>
                                <div className="flex-1 rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Link
                                        href={`/user/${cmt.authorUsername}`}
                                        className="font-bold text-slate-900 hover:text-blue-600"
                                      >
                                        {cmt.authorName}
                                      </Link>
                                      <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                        {cmt.authorRole}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span suppressHydrationWarning className="text-[10px] text-slate-400">
                                        {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {currentUser?.role === 'admin' && (
                                        <button
                                          onClick={() => deleteComment(post.id, cmt.id)}
                                          title="Delete comment (Admin clearance)"
                                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="mt-1 text-slate-700 leading-relaxed text-[11px]">{cmt.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-2xs">
                  ✨
                </div>
                <h3 className="text-base font-bold text-slate-900">The Feed is Fresh & Clean</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No posts have been published yet. Be the first to share an update, placement celebration, or campus achievement!
                </p>
                {currentUser ? (
                  <button
                    onClick={() => setIsComposing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create First Post</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register Account</span>
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
            </>
          )}
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Cols 10-12): Events, Recommended, Resources */}
        {/* ========================================================= */}
        <aside className="hidden xl:block xl:col-span-3 space-y-5 sticky top-20">
          
          {/* 1. 📅 Upcoming Events */}
          <div className="ocean-glass-card p-4.5 space-y-3.5 touch-over-glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900">Upcoming Events</h3>
              </div>
              <Link href="/events" className="text-[11px] font-bold text-emerald-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                { dateMonth: 'SEP', dateDay: '12', title: 'TN Engineering Cutoff Webinar', detail: 'Online · 6:00 PM', tag: 'Webinar' },
                { dateMonth: 'SEP', dateDay: '18', title: 'HackMIT Inter-College Hackathon', detail: 'MIT Chennai · 24h', tag: 'Hackathon' },
                { dateMonth: 'SEP', dateDay: '25', title: 'TCS National Qualifier Test 2026', detail: 'Online Assessment Exam', tag: 'Placement' },
                { dateMonth: 'OCT', dateDay: '03', title: "PSG Tech Cultural Fest 'Vibrance'", detail: 'PSG Tech, Coimbatore', tag: 'Cultural' },
              ].map((ev, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 shadow-2xs transition-all flex items-center gap-3">
                  {/* Date badge */}
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-[9px] font-extrabold uppercase leading-none">{ev.dateMonth}</span>
                    <span className="text-sm font-black leading-none mt-0.5">{ev.dateDay}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{ev.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ev.detail}</p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ev.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 👥 Recommended for You */}
          <div className="ocean-glass-card p-4.5 space-y-3.5 touch-over-glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900">Recommended for You</h3>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {['Colleges', 'Students', 'Internships', 'Communities'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRecommendedTab(tab)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                    recommendedTab === tab
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white/70 hover:bg-white text-slate-600 border border-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Recommended List */}
            <div className="space-y-2.5">
              {[
                { id: 'rec-1', name: 'PSG College of Technology', location: 'Coimbatore · Top Engineering', iconLetter: 'P' },
                { id: 'rec-2', name: 'Christ University', location: 'Bengaluru · Multi-Disciplinary', iconLetter: 'C' },
                { id: 'rec-3', name: 'Amrita Vishwa Vidyapeetham', location: 'Coimbatore · Top Ranked', iconLetter: 'A' },
                { id: 'rec-4', name: 'Anna University (CEG)', location: 'Chennai · Premier State Univ', iconLetter: 'A' },
              ].map((item) => {
                const isFollowed = followedRecIds.includes(item.id);
                return (
                  <div key={item.id} className="p-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 shadow-2xs transition-all flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-100 to-sky-100 border border-white/90 shadow-2xs flex items-center justify-center font-black text-emerald-700 text-xs shrink-0">
                        {item.iconLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.location}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollowRec(item.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition shrink-0 ${
                        isFollowed
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      {isFollowed ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 📘 Study Resources */}
          <div className="ocean-glass-card p-4.5 space-y-3.5 touch-over-glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900">Study Resources</h3>
              </div>
              <Link href="/resources" className="text-[11px] font-bold text-emerald-600 hover:underline">
                View Library →
              </Link>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {['Notes', 'PYQs', 'Syllabus', 'Books', 'Videos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResourcesTab(tab)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                    resourcesTab === tab
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white/70 hover:bg-white text-slate-600 border border-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Downloadable PDF Items */}
            <div className="space-y-2.5">
              {[
                { title: 'Data Structures & Algorithms - Complete Notes', meta: 'PDF (4.2 MB) · Anna Univ R2021' },
                { title: 'Digital Signal Processing - Solved PYQs (2019-2025)', meta: 'PDF (6.8 MB) · Dept of ECE' },
                { title: 'Database Management Systems - Revision Cheatsheet', meta: 'PDF (2.1 MB) · CS / IT' },
              ].map((res, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 shadow-2xs transition-all flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{res.meta}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActionFeedback(`📥 Downloading ${res.title}...`);
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition shrink-0"
                    title="Download Resource"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* PINTEREST-STYLE ZOOM LIGHTBOX MODAL */}
      <PinterestImageModal
        post={zoomedPost}
        onClose={() => setZoomedPost(null)}
        onLike={toggleLikePost}
        onComment={addComment}
        currentUser={currentUser}
      />
    </div>
  );
}
