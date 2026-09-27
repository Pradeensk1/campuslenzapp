'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import {
  BookOpen,
  Award,
  Repeat,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  FileText,
  ThumbsUp,
  Bookmark,
  Share2,
  ExternalLink,
  MessageSquare,
  Users,
  Calendar,
  Check,
  X,
  Plus,
  Download,
  Tag,
  Search
} from 'lucide-react';

export default function FacultyHomeView() {
  const {
    currentUser,
    posts,
    servers,
    addPost,
    repostPost,
    reportPost,
    requestFacultyCommunity,
    toggleLikePost,
    toggleSavePost,
    officeHourQueue,
    joinOfficeHourQueue,
    admitNextOfficeHourStudent,
    resolveOfficeHourStudent,
    researchOpenings,
    addResearchOpening,
    applyToResearchOpening,
    reviewResearchApplication,
    lectureMaterials,
    addLectureMaterialVersion
  } = useApp();

  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Academic Research');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [facultyTab, setFacultyTab] = useState<'portal' | 'officeHours' | 'research' | 'materials'>('portal');

  // Community proposal form state
  const [isProposingCommunity, setIsProposingCommunity] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');

  // Office hours queue state
  const [studentQueueCourse, setStudentQueueCourse] = useState('CS402');
  const [studentQueueTopic, setStudentQueueTopic] = useState('');

  // Research opening form state
  const [isPostingResearch, setIsPostingResearch] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDept, setResDept] = useState('Computer Science & Engineering');
  const [resPrereqs, setResPrereqs] = useState('');
  const [resStipend, setResStipend] = useState('₹10,000 / mo + Credits');
  const [resGpa, setResGpa] = useState<number>(8.0);
  const [resDesc, setResDesc] = useState('');

  // Student apply to research state
  const [applyingResId, setApplyingResId] = useState<string | null>(null);
  const [appStatement, setAppStatement] = useState('');
  const [appGpa, setAppGpa] = useState<number>(8.5);

  // Lecture material versioning state
  const [isPublishingMaterial, setIsPublishingMaterial] = useState(false);
  const [matCourseCode, setMatCourseCode] = useState('CS402');
  const [matCourseName, setMatCourseName] = useState('Distributed Systems');
  const [matTitle, setMatTitle] = useState('');
  const [matVersion, setMatVersion] = useState('v1.0');
  const [matChangelog, setMatChangelog] = useState('');
  const [matFileUrl, setMatFileUrl] = useState('/materials/handout.pdf');

  if (!currentUser) return null;

  // Filter institution circulars that faculty can repost
  const institutionCirculars = posts.filter(p => p.authorRole === 'institution');

  // Filter faculty's pending/approved community requests
  const myCommunityRequests = servers.filter(s => s.requestedByFacultyId === currentUser.id);

  const handleFacultyPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const res = addPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorRole: 'faculty',
      authorHeadline: currentUser.headline || 'Dr. Academic Faculty Guide',
      isVerifiedAuthor: currentUser.isVerified,
      collegeId: currentUser.collegeId,
      collegeName: currentUser.collegeName,
      content: postContent.trim(),
      topic: postTopic,
      imageUrl: postImageUrl.trim() || undefined,
      isKnowledgeBased: true,
      isAnonymous: false
    });

    if (res.success) {
      setPostContent('');
      setPostImageUrl('');
      setActionFeedback('📘 Academic & Knowledge-based resource published!');
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback(res.message || 'Could not publish post');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleRepostCircular = (postId: string) => {
    const res = repostPost(postId);
    setActionFeedback(res.message || 'Circular repost status updated');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCommunityRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityName.trim()) return;

    const res = requestFacultyCommunity(
      communityName.trim(),
      communityDescription.trim(),
      currentUser.collegeId || 'psg_tech'
    );
    setActionFeedback(res.message || 'Community proposal submitted');
    setCommunityName('');
    setCommunityDescription('');
    setIsProposingCommunity(false);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Academic Knowledge Exchange */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-bold border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Knowledge Exchange & Faculty Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
            Publish peer-reviewed syllabus updates, research highlights, and lecture materials. Coordinate academic circulars with institutional administration and manage department study communities.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setIsProposingCommunity(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-900 text-xs font-bold hover:bg-amber-50 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Propose Department Community</span>
            </button>
            <Link
              href="/connect"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-white text-xs font-semibold border border-white/20 transition"
            >
              <span>View Campus Discord Hub</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Segmented Apple-Style Faculty Navigation Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFacultyTab('portal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              facultyTab === 'portal'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Portal & Circulars</span>
          </button>
          <button
            onClick={() => setFacultyTab('officeHours')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              facultyTab === 'officeHours'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Virtual Office Hours ({officeHourQueue.length})</span>
          </button>
          <button
            onClick={() => setFacultyTab('research')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              facultyTab === 'research'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Research & TA Positions ({researchOpenings.length})</span>
          </button>
          <button
            onClick={() => setFacultyTab('materials')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              facultyTab === 'materials'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lecture Versioning Hub ({lectureMaterials.length})</span>
          </button>
        </div>
      </div>

      {facultyTab === 'portal' && (
        <>
          {/* Propose Community Modal / Drawer */}
          {isProposingCommunity && (
        <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Request New Department Community Page</h3>
            </div>
            <button onClick={() => setIsProposingCommunity(false)} className="text-xs text-slate-400 hover:text-slate-600">
              ✕ Cancel
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Per campus governance policy, faculty communities require approval from the institution administration before going public.
          </p>

          <form onSubmit={handleCommunityRequestSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Community / Lab Name
              </label>
              <input
                type="text"
                required
                value={communityName}
                onChange={e => setCommunityName(e.target.value)}
                placeholder="e.g. CSE AI & Systems Research Lab..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Academic Purpose & Objectives
              </label>
              <textarea
                rows={2}
                required
                value={communityDescription}
                onChange={e => setCommunityDescription(e.target.value)}
                placeholder="Describe syllabus coverage, target student cohorts, and moderation guidelines..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsProposingCommunity(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                Submit Proposal to Institution
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Post Composer & Feed vs Proposals & Circulars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Academic Resource Publisher & Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Knowledge Publisher Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName[0] || 'F'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Publish Academic Knowledge Resource</h3>
                  <p className="text-[11px] text-slate-400">Marked as verified educational content</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Peer-Reviewed
              </span>
            </div>

            <form onSubmit={handleFacultyPostSubmit} className="space-y-3">
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={3}
                placeholder="Share lecture notes, reference material, lab assignment guidelines, or research highlights..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={postTopic}
                    onChange={e => setPostTopic(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Academic Research">🔬 Academic Research</option>
                    <option value="Lecture Notes">📚 Lecture Notes</option>
                    <option value="Department Circular">📢 Department Circular</option>
                    <option value="Lab Syllabus">💻 Lab Syllabus</option>
                    <option value="Exam Preparation">📝 Exam Preparation</option>
                  </select>

                  <input
                    type="url"
                    value={postImageUrl}
                    onChange={e => setPostImageUrl(e.target.value)}
                    placeholder="Diagram / Image URL..."
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none max-w-[160px] truncate"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!postContent.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Resource</span>
                </button>
              </div>
            </form>
          </div>

          {/* Academic Feed */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Campus Academic & Peer Stream</span>
            </h3>

            {posts.map(post => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                {post.isKnowledgeBased && (
                  <div className="bg-blue-50/70 border border-blue-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-blue-900">
                    <BookOpen className="w-3 h-3 text-blue-600" />
                    <span>Peer-Reviewed Educational Resource</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{post.authorName}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                          {post.authorRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{post.collegeName || 'Campus Lenz'}</p>
                    </div>
                  </div>
                  {post.topic && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      #{post.topic}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className="flex items-center gap-1 hover:text-blue-600 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likesCount}</span>
                    </button>
                    {post.authorRole === 'institution' && (
                      <button
                        onClick={() => handleRepostCircular(post.id)}
                        className="flex items-center gap-1 text-purple-700 font-bold hover:bg-purple-50 px-2 py-0.5 rounded-lg transition"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Repost Circular</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className="flex items-center gap-1 hover:text-amber-600 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {post.commentsCount} comments
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Official Circulars & Community Proposals */}
        <div className="lg:col-span-4 space-y-4">
          {/* Official Institution Circulars Feed */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">Institution Announcements</h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                1-Click Repost
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Faculty can officially endorse and repost campus circulars directly to student feeds.
            </p>

            <div className="space-y-3">
              {institutionCirculars.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No active institution circulars yet.
                </p>
              ) : (
                institutionCirculars.map(circular => (
                  <div key={circular.id} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">{circular.authorName}</span>
                      <span className="text-[10px] text-purple-600">Official</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-3">
                      {circular.content}
                    </p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleRepostCircular(circular.id)}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-2xs"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>Repost to Students</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Faculty Community Proposals Status */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">My Community Requests</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {myCommunityRequests.length} Submitted
              </span>
            </div>

            {myCommunityRequests.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 space-y-2">
                <p>You haven't requested any department community pages yet.</p>
                <button
                  onClick={() => setIsProposingCommunity(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs hover:bg-amber-100 transition inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit First Proposal</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myCommunityRequests.map(req => (
                  <div key={req.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{req.name}</span>
                      {req.pendingApproval ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{req.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIRTUAL OFFICE HOURS QUEUE                                          */}
      {/* ========================================================================= */}
      {facultyTab === 'officeHours' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Virtual Office Hours Digital Queue</h2>
              <p className="text-xs text-slate-500">Live queue manager for one-on-one student academic doubts, code reviews, and project advisories.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const res = admitNextOfficeHourStudent();
                  setActionFeedback(res.message);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                Admit Next Student
              </button>
            </div>
          </div>

          {/* Active In-Session Spotlight */}
          {officeHourQueue.some(i => i.status === 'in_session') && (
            <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Currently In 1-on-1 Session
                </span>
                <span className="text-xs text-emerald-800 font-semibold">Active Office Hours</span>
              </div>

              {officeHourQueue.filter(i => i.status === 'in_session').map(activeItem => (
                <div key={activeItem.id} className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeItem.studentName}</h3>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Course: <span className="font-semibold text-slate-900">{activeItem.courseCode}</span> • Topic: "{activeItem.topic}"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const res = resolveOfficeHourStudent(activeItem.id);
                      setActionFeedback(res.message);
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                  >
                    Mark Inquiry Resolved & Complete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Waiting Queue List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Students Waiting in Queue ({officeHourQueue.filter(i => i.status === 'waiting').length})
              </h3>
              <span className="text-xs text-slate-400">Estimated wait time: ~10m per student</span>
            </div>

            <div className="space-y-2">
              {officeHourQueue.filter(i => i.status === 'waiting').map((item, index) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{item.studentName}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md font-bold ml-2">
                        {item.courseCode}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-0.5">"{item.topic}"</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{item.joinedAt}</span>
                    <button
                      onClick={() => {
                        const res = resolveOfficeHourStudent(item.id);
                        setActionFeedback(res.message);
                        setTimeout(() => setActionFeedback(null), 3000);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 text-xs"
                      title="Remove from queue"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {officeHourQueue.filter(i => i.status === 'waiting').length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  🎉 No students currently in waiting queue. Queue is clear!
                </div>
              )}
            </div>
          </div>

          {/* Test Queue Check-In Box */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Simulator: Check Into Office Hours Queue</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Course (e.g. CS402)"
                  value={studentQueueCourse}
                  onChange={e => setStudentQueueCourse(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Doubt / question topic..."
                  value={studentQueueTopic}
                  onChange={e => setStudentQueueTopic(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!studentQueueTopic.trim()) return;
                  const res = joinOfficeHourQueue(studentQueueCourse, studentQueueTopic.trim());
                  setActionFeedback(res.message);
                  setStudentQueueTopic('');
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-bold hover:bg-[#0077ED]"
              >
                + Add Student to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RESEARCH & TA RECRUITMENT                                           */}
      {/* ========================================================================= */}
      {facultyTab === 'research' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Undergraduate Research & TA Recruitment</h2>
              <p className="text-xs text-slate-500">Recruit talented student researchers and teaching assistants for funded lab projects.</p>
            </div>
            <button
              onClick={() => setIsPostingResearch(!isPostingResearch)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Research / TA Opening</span>
            </button>
          </div>

          {/* Post Opening Form */}
          <AnimatePresence>
            {isPostingResearch && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (!resTitle.trim()) return;
                  const res = addResearchOpening({
                    professorId: currentUser.id,
                    professorName: currentUser.fullName,
                    department: resDept,
                    title: resTitle.trim(),
                    description: resDesc.trim() || 'Funded student research position in academic lab.',
                    prerequisites: resPrereqs.trim() || 'Strong mathematical foundations and programming proficiency.',
                    stipendOrCredits: resStipend,
                    minGpa: resGpa
                  });
                  setActionFeedback(res.message);
                  setResTitle('');
                  setResDesc('');
                  setResPrereqs('');
                  setIsPostingResearch(false);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900">Post New Research Assistant / TA Position</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Project / Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Consensus Verification Lab Assistant"
                      value={resTitle}
                      onChange={e => setResTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Department</label>
                    <input
                      type="text"
                      value={resDept}
                      onChange={e => setResDept(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Stipend / Credits</label>
                    <input
                      type="text"
                      value={resStipend}
                      onChange={e => setResStipend(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Minimum GPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={resGpa}
                      onChange={e => setResGpa(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Prerequisites</label>
                    <input
                      type="text"
                      placeholder="e.g. PyTorch, C++, OS"
                      value={resPrereqs}
                      onChange={e => setResPrereqs(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Description & Responsibilities</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the research goals and day-to-day contributions..."
                    value={resDesc}
                    onChange={e => setResDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostingResearch(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                  >
                    Publish Opening
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Openings Grid */}
          <div className="space-y-4">
            {researchOpenings.map(op => (
              <div key={op.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {op.department}
                      </span>
                      <span className="text-xs text-slate-500">Faculty Lead: {op.professorName}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{op.title}</h3>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                    {op.stipendOrCredits}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{op.description}</p>

                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap pt-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">⚡ Prerequisites: {op.prerequisites}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">🎓 Min GPA: {op.minGpa}</span>
                </div>

                {/* Candidate Applications Review Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Applicant Submissions ({op.applicants.length})
                    </span>
                    <button
                      onClick={() => setApplyingResId(applyingResId === op.id ? null : op.id)}
                      className="text-xs font-bold text-[#0071e3] hover:underline"
                    >
                      {applyingResId === op.id ? 'Cancel Application' : '+ Submit Candidate Application'}
                    </button>
                  </div>

                  {/* Apply Form */}
                  {applyingResId === op.id && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900">Apply as Student Researcher / TA</div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Your Cumulative GPA"
                        value={appGpa}
                        onChange={e => setAppGpa(Number(e.target.value))}
                        className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 w-36 font-bold"
                      />
                      <textarea
                        rows={2}
                        placeholder="Statement of purpose / prior relevant projects and coursework..."
                        value={appStatement}
                        onChange={e => setAppStatement(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setApplyingResId(null)}
                          className="px-3 py-1 text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!appStatement.trim()) return;
                            const res = applyToResearchOpening(op.id, appStatement.trim(), appGpa);
                            setActionFeedback(res.message);
                            setAppStatement('');
                            setApplyingResId(null);
                            setTimeout(() => setActionFeedback(null), 3000);
                          }}
                          className="px-4 py-1 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                        >
                          Submit Application
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Applicants List */}
                  {op.applicants.map(app => (
                    <div key={app.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {app.studentName} <span className="text-slate-400 font-normal ml-1">GPA: {app.studentGpa}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">"{app.statement}"</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>

                        {app.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const res = reviewResearchApplication(op.id, app.id, 'accepted');
                                setActionFeedback(res.message);
                                setTimeout(() => setActionFeedback(null), 3000);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                const res = reviewResearchApplication(op.id, app.id, 'declined');
                                setActionFeedback(res.message);
                                setTimeout(() => setActionFeedback(null), 3000);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px]"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LECTURE NOTES & LAB MANUAL VERSIONING HUB                           */}
      {/* ========================================================================= */}
      {facultyTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Lecture Notes & Lab Manual Versioning Hub</h2>
              <p className="text-xs text-slate-500">Publish course handouts, lab manuals, and syllabus revisions with version changelogs and student download telemetry.</p>
            </div>
            <button
              onClick={() => setIsPublishingMaterial(!isPublishingMaterial)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Version</span>
            </button>
          </div>

          {/* Publish New Version Form */}
          <AnimatePresence>
            {isPublishingMaterial && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (!matTitle.trim()) return;
                  const res = addLectureMaterialVersion({
                    courseCode: matCourseCode.trim().toUpperCase(),
                    courseName: matCourseName.trim(),
                    professorName: currentUser.fullName,
                    title: matTitle.trim(),
                    version: matVersion.trim() || 'v1.0',
                    changelog: matChangelog.trim() || 'Initial release of course handout.',
                    fileUrl: matFileUrl
                  });
                  setActionFeedback(res.message);
                  setMatTitle('');
                  setMatChangelog('');
                  setIsPublishingMaterial(false);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900">Publish New Course Material Version</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      value={matCourseCode}
                      onChange={e => setMatCourseCode(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Course Name</label>
                    <input
                      type="text"
                      value={matCourseName}
                      onChange={e => setMatCourseName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Version Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. v2.2"
                      value={matVersion}
                      onChange={e => setMatVersion(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Handout / Manual Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Lecture Notes on Virtual Memory & Paging"
                    value={matTitle}
                    onChange={e => setMatTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Version Changelog</label>
                  <textarea
                    rows={2}
                    placeholder="What changed in this revision? (e.g. Added section 4.2 on TLB hit ratio)..."
                    value={matChangelog}
                    onChange={e => setMatChangelog(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublishingMaterial(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black"
                  >
                    Upload Version
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Materials List */}
          <div className="space-y-4">
            {lectureMaterials.map(mat => (
              <div key={mat.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3]">
                        {mat.courseCode}
                      </span>
                      <span className="text-xs text-slate-500">{mat.courseName}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {mat.version}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{mat.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      📥 {mat.downloadCount} Downloads
                    </span>
                    <a
                      href={mat.fileUrl}
                      onClick={e => {
                        e.preventDefault();
                        setActionFeedback(`Downloading official document "${mat.title}" (${mat.version})...`);
                        setTimeout(() => setActionFeedback(null), 3000);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Version Changelog:</span> {mat.changelog}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Published by {mat.professorName}</span>
                  <span>Uploaded {mat.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
