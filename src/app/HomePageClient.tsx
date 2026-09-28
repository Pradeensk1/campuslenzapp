'use client';

import { useState, useRef, useDeferredValue, useEffect } from 'react';
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
  Star
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Post } from '@/types';
import { isVideoMedia, formatFileSize, compressImageToDataUrl } from '@/lib/mediaUtils';
import PinterestImageModal from '@/components/PinterestImageModal';
import AlumniHomeView from '@/components/home/AlumniHomeView';
import FacultyHomeView from '@/components/home/FacultyHomeView';
import InstitutionHomeView from '@/components/home/InstitutionHomeView';

export default function HomePageClient({ initialPosts = [] }: { initialPosts?: Post[]; initialColleges?: any[] }) {
  const {
    posts: contextPosts,
    toggleLikePost,
    addComment,
    addPost,
    addReview,
    currentUser,
    colleges,
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
  
  // Split Feed Streams: 'campus' (all posts across ecosystem) | 'students' (student-only peer stream)
  const [feedStream, setFeedStream] = useState<'campus' | 'students'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('stream') === 'students') return 'students';
    }
    return currentUser?.role === 'student' ? 'students' : 'campus';
  });

  // When student logs in, redirect / default them directly to the students social stream
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('stream') === 'students' || currentUser?.role === 'student') {
        setFeedStream('students');
      }
    } else if (currentUser?.role === 'student') {
      setFeedStream('students');
    }
  }, [currentUser?.role, currentUser?.id]);

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
  const [postType, setPostType] = useState<'stream' | 'review'>('stream');
  const [institutionReviewRating, setInstitutionReviewRating] = useState(5);
  const [institutionReviewCollegeId, setInstitutionReviewCollegeId] = useState('');
  const [institutionReviewCategory, setInstitutionReviewCategory] = useState('Academics & Faculty');
  const [institutionReviewTitle, setInstitutionReviewTitle] = useState('');
  const [institutionReviewPros, setInstitutionReviewPros] = useState('');
  const [institutionReviewCons, setInstitutionReviewCons] = useState('');

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

    // OPTION 2: If student selected "Institution Review & Rating", submit structured review to institution ledger
    // addReview automatically records in the institution platform review section AND broadcasts to Public Campus Stream
    if (currentUser.role === 'student' && postType === 'review') {
      const targetCollegeId = institutionReviewCollegeId || currentUser.collegeId || colleges[0]?.id || 'col-psg';
      const chosenCollege = colleges.find(c => c.id === targetCollegeId || c.name === currentUser.collegeName);
      
      const parsedPros = institutionReviewPros ? institutionReviewPros.split(',').map(s => s.trim()).filter(Boolean) : [];
      const parsedCons = institutionReviewCons ? institutionReviewCons.split(',').map(s => s.trim()).filter(Boolean) : [];

      addReview({
        collegeId: targetCollegeId,
        userId: currentUser.id,
        reviewerType: 'student',
        authorName: isAnonymous ? 'Anonymous Student' : currentUser.fullName,
        isAnonymous,
        overallRating: institutionReviewRating,
        dimensions: {
          academics: institutionReviewRating,
          faculty: institutionReviewRating,
          placements: institutionReviewRating,
          infrastructure: institutionReviewRating,
          hostel: institutionReviewRating,
          campusLife: institutionReviewRating,
          valueForMoney: institutionReviewRating,
          studentExperience: institutionReviewRating
        },
        title: institutionReviewTitle.trim() || `${institutionReviewCategory} Evaluation`,
        experience: postContent.trim(),
        pros: parsedPros,
        cons: parsedCons,
        advice: '',
        recommendation: institutionReviewRating >= 3,
        course: currentUser.course || 'B.Tech / Student',
        department: currentUser.department || 'Academics',
        batch: currentUser.graduationBatch || '2026'
      });

      setPostContent('');
      handleRemoveMedia();
      setIsAnonymousPost(false);
      setPostType('stream');
      setInstitutionReviewRating(5);
      setInstitutionReviewTitle('');
      setInstitutionReviewPros('');
      setInstitutionReviewCons('');
      setIsComposing(false);
      setFeedFilter('all');
      setFeedSentimentFilter('all');
      setActionFeedback(
        `🎉 Review posted to Campus Social Stream and added to ${chosenCollege?.name || 'Institution'}'s Review Section!`
      );
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }

    // OPTION 1: Standard Public Campus Social Stream Post
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
      setPostType('stream');
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

    // Feed Stream filter: If in Students Social Stream, strictly show student peer posts
    if (feedStream === 'students' && p.authorRole !== 'student') return false;

    // Role filter
    if (feedFilter === 'students' && p.authorRole !== 'student') return false;
    if (feedFilter === 'alumni' && p.authorRole !== 'alumni') return false;
    if (feedFilter === 'institution' && p.authorRole !== 'institution') return false;

    // AI Sentiment & Safety filter
    if (feedSentimentFilter === 'positive' && p.sentiment !== 'positive') return false;
    if (feedSentimentFilter === 'academic' && !p.isKnowledgeBased && !p.topic?.includes('Academic') && !p.topic?.includes('Research') && !p.topic?.includes('Placement') && !p.topic?.includes('Notes')) return false;
    if (feedSentimentFilter === 'sensitive' && !p.isSensitive) return false;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="mb-6 p-3.5 rounded-2xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0875BD] shrink-0" />
            <span className="text-xs font-bold">
              Root Administrator Active: Full user account purge, post moderation & terminal privileges enabled
            </span>
          </div>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-xl bg-[#1687D4] hover:bg-[#0875BD] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Admin Platform Console →</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (Cols 1-3): Clean Profile & Shortcuts Hub */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          
          {/* User Profile Card or Guest Welcome Card */}
          {currentUser ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="h-16 bg-gradient-to-r from-[#1687D4] via-[#0875BD] to-[#075080]" />
              <div className="px-4 pb-4 text-center">
                <div className="-mt-8 mb-2 flex justify-center">
                  <Link href={`/user/${currentUser.username}`}>
                    <div className="h-16 w-16 rounded-2xl border-3 border-white bg-slate-100 flex items-center justify-center text-xl font-bold text-[#1687D4] shadow-sm hover:scale-102 transition-transform">
                      {currentUser.fullName[0] || 'U'}
                    </div>
                  </Link>
                </div>

                <Link href={`/user/${currentUser.username}`} className="group block">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {currentUser.fullName}
                  </h2>
                </Link>
                
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {currentUser.role}
                  </span>
                  {currentUser.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>

                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                  {currentUser.headline}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{currentUser.followersCount}</div>
                    <div className="text-[10px] text-slate-400">Followers</div>
                  </div>
                  <div className="border-l border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.followingCount}</div>
                    <div className="text-[10px] text-slate-400">Following</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href={`/user/${currentUser.username}`}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>My Profile</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mx-auto shadow-2xs">
                CL
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Welcome to Campus Lenz</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Join verified college networks, connect with alumni mentors, and explore institutional analytics.
                </p>
              </div>
              <div className="pt-1 flex flex-col gap-2">
                <Link
                  href="/register"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition text-center"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN (Cols 4-9): Live Dynamic Feed Stream        */}
        {/* ========================================================= */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* Action Feedback Banner if present */}
          {actionFeedback && (
            <div className="p-3 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1687D4] flex-shrink-0" />
                <span>{actionFeedback}</span>
              </div>
              <button onClick={() => setActionFeedback(null)} className="text-[#0875BD] hover:text-[#075080]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Feed Stream Switcher: Campus Social Stream vs Students Social Stream */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/80 backdrop-blur-md border border-[#CFEAFF] shadow-xs">
            <div className="flex items-center gap-1.5 p-1 bg-[#E8F5FF]/70 rounded-xl text-xs font-semibold w-full">
              <button
                type="button"
                onClick={() => setFeedStream('campus')}
                className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  feedStream === 'campus'
                    ? 'bg-white text-[#075080] shadow-xs font-bold border border-[#CFEAFF]'
                    : 'text-[#075080]/70 hover:text-[#075080]'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#1687D4]" />
                <span>Campus Social Stream</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E8F5FF] text-[#0875BD] font-bold">
                  {posts.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFeedStream('students')}
                className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  feedStream === 'students'
                    ? 'bg-white text-[#075080] shadow-xs font-bold border border-[#CFEAFF]'
                    : 'text-[#075080]/70 hover:text-[#075080]'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#1687D4]" />
                <span>Students Social Stream</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E8F5FF] text-[#0875BD] font-bold">
                  {posts.filter(p => p.authorRole === 'student').length}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Dynamic Post Composer (All 5 Roles Supported with Permissions) */}
          {currentUser && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              {/* Role Context & Quota Banners */}
              {currentUser.role === 'alumni' && (() => {
                const elig = checkAlumniPostEligibility(currentUser);
                if (!elig.eligible) {
                  return (
                    <div className="p-3.5 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-[#0875BD] shrink-0" />
                        <span>Alumni Public Posting Restriction</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#0A3C5E]">
                        {elig.message}
                      </p>
                      {elig.followerCount < elig.requiredFollowers && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>Follower Eligibility Progress</span>
                            <span>{elig.followerCount} / {elig.requiredFollowers} Followers</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#CFEAFF] overflow-hidden">
                            <div
                              className="h-full bg-[#1687D4] rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (elig.followerCount / elig.requiredFollowers) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-[#0875BD] italic">
                            💡 Tip: Mentor students via Direct Messages in Connect Hub to gain followers!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="p-2.5 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-[11px] flex items-center justify-between flex-wrap gap-1">
                    <span className="font-semibold">
                      🎓 Alumni Quota: <strong>{elig.weeklyCount} / {elig.maxWeekly} posts</strong> used this week
                    </span>
                    <span className="text-[10px] text-[#0875BD] bg-white/80 px-2 py-0.5 rounded border border-[#CFEAFF]">
                      Anti-Ragebait Shield Active
                    </span>
                  </div>
                );
              })()}

              {currentUser.role === 'faculty' && (
                <div className="p-2.5 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-[11px] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1687D4] shrink-0" />
                  <span>
                    <strong>Academic Faculty Stream:</strong> Posts are tagged as academic curriculum, research publications, or laboratory resources.
                  </span>
                </div>
              )}

              {currentUser.role === 'institution' && (
                <div className="p-2.5 rounded-xl bg-[#E8F5FF] border border-[#CFEAFF] text-[#075080] text-[11px] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0875BD] shrink-0" />
                  <span>
                    <strong>Official Institutional Channel:</strong> Broadcast verified circulars, recruitment drives, and collegiate milestones.
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Link href={`/user/${currentUser.username}`}>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.fullName[0] || 'U'}
                  </div>
                </Link>

                <div className="flex-1">
                  {!isComposing ? (
                    <button
                      onClick={() => setIsComposing(true)}
                      className="w-full text-left rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-100/70 hover:text-slate-700 transition"
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
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden resize-none"
                        autoFocus
                      />

                      {/* Live Open-Source AI Telemetry Pill */}
                      {deferredPostContent.trim().length > 3 && (() => {
                        const ai = runOpenSourceAIModeration(deferredPostContent, postImageUrl);
                        const isSevere = ai.toxicity.score >= 80;
                        const isSens = ai.isSensitive;
                        const category = ai.classification?.category || 'General';
                        return (
                          <div className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all ${
                            isSevere
                              ? 'bg-rose-50 border border-rose-200 text-rose-800'
                              : isSens
                              ? 'bg-amber-50 border border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          }`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
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
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline shrink-0 ml-2">
                              campus-lenz-ai • toxic-bert
                            </span>
                          </div>
                        );
                      })()}

                      {/* Student Posting Mode Dropdown: Public Campus Stream vs Institution Review */}
                      {currentUser.role === 'student' && (
                        <div className="space-y-3">
                          {/* Two-Option Dropdown */}
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#E8F5FF] via-white to-[#F0F8FF] border border-[#CFEAFF] shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-[#075080] uppercase tracking-wider flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#1687D4]" />
                                <span>Posting Option / Destination</span>
                              </label>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                postType === 'review'
                                  ? 'bg-[#1687D4] text-white border-[#1687D4]'
                                  : 'bg-white text-[#075080] border-[#CFEAFF]'
                              }`}>
                                {postType === 'review' ? '⭐ Option 2: Review' : '📢 Option 1: Public Stream'}
                              </span>
                            </div>

                            <select
                              value={postType}
                              onChange={e => {
                                const val = e.target.value as 'stream' | 'review';
                                setPostType(val);
                                if (val === 'review' && !institutionReviewCollegeId) {
                                  setInstitutionReviewCollegeId(currentUser.collegeId || colleges[0]?.id || '');
                                }
                              }}
                              className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs font-bold text-[#075080] shadow-xs focus:ring-2 focus:ring-[#1687D4]/30 focus:border-[#1687D4] focus:outline-none transition cursor-pointer"
                            >
                              <option value="stream">
                                Option 1: 📢 Publish in Public Campus Stream (Campus Social Feed)
                              </option>
                              <option value="review">
                                Option 2: ⭐ Institution Review &amp; Rating (Public Stream + Institution Review Section)
                              </option>
                            </select>
                          </div>

                          {/* If Option 2 (Review) is selected: Show full review parameters */}
                          {postType === 'review' && (
                            <div className="p-3.5 rounded-2xl bg-[#E8F5FF]/90 border border-[#72B7EB] shadow-xs space-y-3">
                              <div className="flex items-start gap-2 text-[11px] text-[#075080] leading-snug">
                                <Sparkles className="w-4 h-4 text-[#1687D4] shrink-0 mt-0.5" />
                                <span>
                                  <strong>Dual-Publish Guarantee:</strong> This evaluation will be posted to the <strong>Campus Social Stream</strong> &amp; <strong>Public Feed</strong>, and recorded directly in the selected institution&apos;s <strong>Platform Review Section</strong> for all students to explore.
                                </span>
                              </div>

                              {/* Target Institution Selection */}
                              <div>
                                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                                  Select Target Institution
                                </label>
                                <select
                                  value={institutionReviewCollegeId || currentUser.collegeId || colleges[0]?.id || ''}
                                  onChange={e => setInstitutionReviewCollegeId(e.target.value)}
                                  className="w-full rounded-xl border border-[#CFEAFF] bg-white p-2.5 text-xs text-[#075080] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                                >
                                  {colleges.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.name} {c.id === currentUser.collegeId ? '(Your Enrolled College)' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Star Rating Selector */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-bold text-[#075080] uppercase tracking-wider">
                                    Overall Rating
                                  </label>
                                  <span className="text-xs font-bold text-[#1687D4]">
                                    {institutionReviewRating} / 5 Stars
                                    <span className="ml-1 text-[11px] text-slate-500 font-normal">
                                      ({institutionReviewRating === 5 ? 'Exceptional' : institutionReviewRating === 4 ? 'Very Good' : institutionReviewRating === 3 ? 'Average' : institutionReviewRating === 2 ? 'Below Average' : 'Poor'})
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#CFEAFF]">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setInstitutionReviewRating(star)}
                                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                      title={`Rate ${star} star`}
                                    >
                                      <Star
                                        className={`w-5 h-5 transition-colors ${
                                          star <= institutionReviewRating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-200 hover:text-amber-200'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Evaluation Category Focus */}
                              <div>
                                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                                  Review Category Focus
                                </label>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {[
                                    'Academics & Faculty',
                                    'Placements & Training',
                                    'Campus Infrastructure',
                                    'Hostel & Amenities',
                                    'Overall Student Life'
                                  ].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setInstitutionReviewCategory(cat)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                        institutionReviewCategory === cat
                                          ? 'bg-[#1687D4] text-white border-[#1687D4] shadow-2xs'
                                          : 'bg-white text-[#075080] border-[#CFEAFF] hover:bg-[#E8F5FF]'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Review Headline & Optional Pros/Cons */}
                              <div>
                                <label className="block text-[10px] font-bold text-[#075080] uppercase tracking-wider mb-1">
                                  Review Headline (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Great academic culture and top tier placement preparation"
                                  value={institutionReviewTitle}
                                  onChange={e => setInstitutionReviewTitle(e.target.value)}
                                  className="w-full p-2.5 rounded-xl border border-[#CFEAFF] bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1687D4]"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">
                                    Pros (comma separated)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. High placements, Modern labs"
                                    value={institutionReviewPros}
                                    onChange={e => setInstitutionReviewPros(e.target.value)}
                                    className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
                                    Cons (comma separated)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Strict curfew, Average mess"
                                    value={institutionReviewCons}
                                    onChange={e => setInstitutionReviewCons(e.target.value)}
                                    className="w-full p-2 rounded-xl border border-amber-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Anonymous Toggle */}
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isAnonymousPost}
                                onChange={e => setIsAnonymousPost(e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-[#1687D4] focus:ring-[#1687D4]"
                              />
                              <span>Post Anonymously (Hide Name & Profile)</span>
                            </label>
                            <span className="text-[10px] text-slate-400">Protects student identity</span>
                          </div>
                        </div>
                      )}

                      {/* Hashtag suggestions */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-slate-400 font-semibold">Suggested:</span>
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
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-blue-600 font-semibold hover:bg-blue-50 transition"
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
                          <div className="relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden p-2 shadow-xs">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                              <span>Attach Photo or Video</span>
                            </button>

                            <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <input
                                type="url"
                                value={postImageUrl}
                                onChange={e => {
                                  setPostImageUrl(e.target.value);
                                  setMediaFileType(isVideoMedia(e.target.value) ? 'video' : 'image');
                                }}
                                placeholder="or paste image/video URL..."
                                className="w-full text-xs text-slate-800 focus:outline-hidden"
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
                          className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5"
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
                              setPostType('stream');
                              setInstitutionReviewRating(5);
                              setInstitutionReviewTitle('');
                              setInstitutionReviewPros('');
                              setInstitutionReviewCons('');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!postContent.trim() || (currentUser.role === 'alumni' && !checkAlumniPostEligibility(currentUser).eligible)}
                            className="px-4 py-1.5 rounded-xl bg-[#1687D4] hover:bg-[#075080] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition"
                          >
                            {currentUser.role === 'student' && postType === 'review'
                              ? 'Post to Stream & Institution Review Section'
                              : 'Publish Post'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {!isComposing && (
                <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <button
                    onClick={() => setIsComposing(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition font-medium"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Media</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsComposing(true);
                      setPostTopic('Hackathons & Projects');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-amber-600 transition font-medium"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Event</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsComposing(true);
                      setPostTopic('Campus Placements');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition font-medium"
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2.5">
            {/* Row 1: Role tabs + AI Content Shield Switch */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFeedFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    feedFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Posts ({posts.length})
                </button>
                <button
                  onClick={() => setFeedFilter('students')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    feedFilter === 'students'
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Students ({posts.filter(p => p.authorRole === 'student').length})
                </button>
                <button
                  onClick={() => setFeedFilter('alumni')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    feedFilter === 'alumni'
                      ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Alumni ({posts.filter(p => p.authorRole === 'alumni').length})
                </button>
                <button
                  onClick={() => setFeedFilter('institution')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    feedFilter === 'institution'
                      ? 'bg-white text-purple-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  sensitiveContentShieldActive
                    ? 'bg-[#E8F5FF] text-[#0875BD] border border-[#CFEAFF] hover:bg-[#CFEAFF]'
                    : 'bg-slate-100 text-[#075080] border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${sensitiveContentShieldActive ? 'text-[#1687D4]' : 'text-[#628CA8]'}`} />
                <span>AI Shield: {sensitiveContentShieldActive ? 'Active' : 'Off'}</span>
              </button>
            </div>

            {/* Row 2: Sentiment & AI Classification Filter Pills */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-bold text-[#628CA8] mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1687D4]" /> AI Filter:
                </span>
                <button
                  onClick={() => setFeedSentimentFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
                    feedSentimentFilter === 'all'
                      ? 'bg-[#1687D4] text-white font-bold shadow-2xs'
                      : 'text-[#075080] hover:bg-[#E8F5FF]'
                  }`}
                >
                  All Sentiments
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('positive')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    feedSentimentFilter === 'positive'
                      ? 'bg-[#0875BD] text-white font-bold shadow-2xs'
                      : 'text-[#075080] hover:bg-[#E8F5FF]'
                  }`}
                >
                  <span>🌟 Positive & Inspiring</span>
                  <span className="text-[10px] opacity-75">
                    ({posts.filter(p => p.sentiment === 'positive').length})
                  </span>
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('academic')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    feedSentimentFilter === 'academic'
                      ? 'bg-[#1687D4] text-white font-bold shadow-2xs'
                      : 'text-[#075080] hover:bg-[#E8F5FF]'
                  }`}
                >
                  <span>📘 Academic Guidance</span>
                </button>
                <button
                  onClick={() => setFeedSentimentFilter('sensitive')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    feedSentimentFilter === 'sensitive'
                      ? 'bg-[#075080] text-white font-bold shadow-2xs'
                      : 'text-[#075080] hover:bg-[#E8F5FF]'
                  }`}
                >
                  <span>⚠️ Sensitive / Flagged</span>
                  <span className="text-[10px] px-1 rounded-full bg-[#CFEAFF] text-[#075080] font-bold">
                    {posts.filter(p => p.isSensitive).length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
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
                const isAuthorSelf = currentUser ? (post.authorId === currentUser.id || post.authorUsername === currentUser.username) : false;
                const isFollowingAuthor = Boolean(currentUser?.following && (
                  currentUser.following.includes(post.authorId) ||
                  (post.authorUsername && currentUser.following.includes(post.authorUsername)) ||
                  (post.authorUsername && currentUser.following.some(f => typeof f === 'string' && f.toLowerCase() === post.authorUsername.toLowerCase()))
                ));
                const isSaved = savedPosts.includes(post.id);
                const isSensitive = Boolean(post.isSensitive);
                const isShielded = isSensitive && sensitiveContentShieldActive && !unhiddenSensitivePostIds.includes(post.id);

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300/80 transition-colors"
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
                            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0 hover:border-blue-500 transition-colors">
                              {post.isAnonymous ? '?' : post.authorName[0]}
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {post.isAnonymous ? (
                                <span className="text-sm font-bold text-slate-900">Anonymous Student</span>
                              ) : (
                                <Link
                                  href={`/user/${post.authorUsername}`}
                                  className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate"
                                >
                                  {post.authorName}
                                </Link>
                              )}

                              {post.isVerifiedAuthor && !post.isAnonymous && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              )}

                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
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
                              onClick={() => toggleFollowUser(post.authorId || post.authorUsername)}
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

                      {/* Post Content (Protected by Apple-style Frosted Sensitive Blur Shield if flagged) */}
                      {isShielded ? (
                        <div className="relative mt-3 rounded-2xl border border-amber-200 bg-amber-50/20 overflow-hidden">
                          {/* Frosted/Blurred Background Preview */}
                          <div className="filter blur-md select-none pointer-events-none opacity-40 p-4">
                            <p className="text-[13.5px] leading-relaxed text-slate-800 line-clamp-3">
                              {post.content}
                            </p>
                            {post.imageUrl && (
                              <div className="mt-2 h-28 bg-slate-200 rounded-xl" />
                            )}
                          </div>

                          {/* Centered Sensitive Content Warning Shield */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-white/75 backdrop-blur-xs space-y-2">
                            <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 max-w-sm">
                              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                                Sensitive Content Shield Activated
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                Flagged by open-source AI ({post.aiModelMetadata || 'unitary/toxic-bert'}):{' '}
                                <span className="font-semibold text-amber-900">
                                  {post.sensitiveReason || 'Hostile or controversial discourse'}
                                </span>{' '}
                                (Toxicity: {post.toxicityScore ?? 54}%)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRevealSensitivePost(post.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" />
                              <span>Show Content Anyway</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Post Body Content */}
                          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-line">
                            {post.content}
                          </p>

                          {/* Media Attachment (Image with Zoom or Video with Player) */}
                          {post.imageUrl && (
                            isVideoMedia(post.imageUrl) ? (
                              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-black">
                                <video
                                  src={post.imageUrl}
                                  controls
                                  className="w-full max-h-[480px] rounded-2xl bg-black"
                                  preload="metadata"
                                />
                              </div>
                            ) : (
                              <div
                                onClick={() => setZoomedPost(post)}
                                className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-zoom-in"
                              >
                                <img
                                  src={post.imageUrl}
                                  alt="Post visual attachment"
                                  loading="lazy"
                                  className="w-full max-h-[460px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                                />
                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                                  <ZoomIn className="w-3.5 h-3.5" />
                                  <span>Zoom Full</span>
                                </div>
                              </div>
                            )
                          )}
                        </>
                      )}

                      {/* Topic Tag & AI Provenance Badge */}
                      <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
                        {post.topic && (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            #{post.topic.replace(/\s+/g, '')}
                          </span>
                        )}

                        {/* Open-Source AI Telemetry Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                            post.sentiment === 'positive'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : post.isSensitive || post.sentiment === 'ragebait'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : post.sentiment === 'toxic'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                          title={`AI Model: ${post.aiModelMetadata || 'toxic-bert + distilbert'} | Toxicity: ${post.toxicityScore ?? 4}%`}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{post.sentiment || 'clean'}</span>
                            <span>•</span>
                            <span>{post.toxicityScore ?? 4}% tox</span>
                          </span>
                        </div>
                      </div>

                      {/* Institutional Review & Ratings Direct Link */}
                      {(post.topic === 'Review & Ratings' || post.topic?.toLowerCase().includes('review') || post.isInstitutionReviewOnly) && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#E8F5FF] to-[#F0F9FF] border border-[#CFEAFF] flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-white/90 border border-[#CFEAFF] flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-[#1687D4]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase font-bold text-[#0875BD] tracking-wider bg-white/80 px-1.5 py-0.5 rounded border border-[#CFEAFF]">
                                  {post.isInstitutionReviewOnly ? 'Institution Review Only' : 'Institutional Review'}
                                </span>
                                {post.institutionRating && (
                                  <div className="flex items-center text-amber-500 text-xs font-black">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < (post.institutionRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                      />
                                    ))}
                                    <span className="ml-1 text-[11px] text-[#075080] font-bold">{post.institutionRating}.0</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold text-[#075080] truncate mt-0.5">
                                Official scorecard evaluation for <strong className="text-[#1687D4]">{post.collegeName || 'Verified College'}</strong>
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/colleges/${colleges.find(c => c.id === post.collegeId || c.name === post.collegeName)?.slug || 'explore'}#reviews`}
                            className="px-3 py-1.5 rounded-lg bg-[#1687D4] hover:bg-[#075080] text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1 shrink-0"
                          >
                            <span>Reviews & Ratings</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Reactions & Engagement Summary Bar */}
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">
                          👍
                        </span>
                        <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                        {post.sharesCount > 0 && (
                          <span className="text-purple-600 font-semibold">• {post.sharesCount} reposts</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          👁 {post.likesCount * 14 + 115} views
                        </span>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="hover:text-slate-900 transition-colors font-medium"
                        >
                          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                        </button>
                      </div>
                    </div>

                    {/* Action Bar (LinkedIn & Instagram Interaction Suite) */}
                    <div className="grid grid-cols-5 border-t border-slate-100 text-xs font-semibold text-slate-600">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 transition-colors ${
                          isLiked ? 'text-blue-600 font-bold' : ''
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 transition-colors ${
                          isCommentsOpen ? 'text-blue-600 font-bold' : ''
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Comment</span>
                      </button>

                      <button
                        onClick={() => handleRepost(post.id)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                          post.repostedByInstitution || post.repostedByFaculty || post.repostedByStudent
                            ? 'text-purple-600 font-bold'
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
                        className={`flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 transition-colors ${
                          isSaved ? 'text-amber-600 font-bold' : ''
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Cols 10-12): Circles & Peer Suggestions */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          
          {/* Quick Search Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Search
            </h3>
            <p className="text-xs text-slate-500">
              Find classmates, seniors, professors, or colleges across Tamil Nadu.
            </p>
            <Link
              href="/search"
              className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-400">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Search alumni, students...</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Active Campus Circles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Campus Channels
              </h3>
              <Link href="/servers" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-2">
              {communities.slice(0, 3).map((comm) => (
                <div key={comm.id} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-800 line-clamp-1">{comm.name}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{comm.description}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{comm.membersCount} members</span>
                    <Link href="/servers" className="text-blue-600 font-semibold hover:underline">
                      Join →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Peers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Peers to Connect
            </h3>
            <div className="space-y-2.5">
              {allUsers.filter(u => (!currentUser || u.id !== currentUser.id) && (u.role === 'student' || u.role === 'alumni')).length === 0 ? (
                <div className="text-center py-4 px-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700">No other users registered yet</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Invite batchmates or register a test account.</p>
                  {!currentUser && (
                    <Link href="/register" className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline">
                      Register Now →
                    </Link>
                  )}
                </div>
              ) : (
                allUsers
                  .filter(u => (!currentUser || u.id !== currentUser.id) && (u.role === 'student' || u.role === 'alumni'))
                  .slice(0, 3)
                  .map(peer => {
                    const isFollowing = currentUser ? currentUser.following.includes(peer.id) : false;
                    return (
                      <div key={peer.id} className="flex items-center justify-between gap-2 text-xs">
                        <Link href={`/user/${peer.username}`} className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                            {peer.fullName[0] || 'U'}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate hover:text-blue-600">{peer.fullName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{peer.course || peer.role}</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => toggleFollowUser(peer.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors shrink-0 ${
                            isFollowing
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {isFollowing ? 'Following' : '+ Follow'}
                        </button>
                      </div>
                    );
                  })
              )}
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
