'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import {
  Building2,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Repeat,
  AlertTriangle,
  Send,
  Sparkles,
  Share2,
  Copy,
  Check,
  ExternalLink,
  PlusCircle,
  Lock,
  ThumbsUp,
  Bookmark,
  Radio,
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Clock
} from 'lucide-react';

export default function InstitutionHomeView() {
  const {
    currentUser,
    posts,
    servers,
    addPost,
    repostPost,
    reportPost,
    approveFacultyCommunity,
    rejectFacultyCommunity,
    toggleLikePost,
    toggleSavePost,
    emergencyBroadcast,
    triggerEmergencyBroadcast,
    dismissEmergencyBroadcast
  } = useApp();

  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Official Circular');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [institutionTab, setInstitutionTab] = useState<'governance' | 'broadcast' | 'analytics' | 'compliance'>('governance');

  // Emergency Broadcast Form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'critical' | 'warning' | 'notice'>('notice');

  // False claim report drawer state
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  if (!currentUser) return null;

  // Filter pending faculty proposals
  const pendingFacultyProposals = servers.filter(
    s => s.institutionOwnerId === currentUser.id && s.pendingApproval
  );

  // Official community of this institution (enforced 1 community limit)
  const officialCommunity = servers.find(
    s => s.institutionOwnerId === currentUser.id && !s.pendingApproval
  );

  // Filter student posts for achievement showcase
  const studentPosts = posts.filter(p => p.authorRole === 'student');

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const res = addPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorRole: 'institution',
      authorHeadline: currentUser.headline || 'PSG Tech Administration Desk',
      isVerifiedAuthor: true,
      collegeId: currentUser.collegeId,
      collegeName: currentUser.collegeName,
      content: postContent.trim(),
      topic: postTopic,
      imageUrl: postImageUrl.trim() || undefined,
      isAnonymous: false
    });

    if (res.success) {
      setPostContent('');
      setPostImageUrl('');
      setActionFeedback('📢 Official institution circular broadcasted to campus network!');
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback(res.message || 'Could not broadcast circular');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleCopyInviteLink = () => {
    if (!officialCommunity) return;
    const url = `${window.location.origin}/servers?id=${officialCommunity.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setActionFeedback('🔗 Official Community Invite link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setActionFeedback(null);
    }, 3500);
  };

  const handleShowcaseStudent = (postId: string) => {
    const res = repostPost(postId);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleDisputeSubmit = (postId: string) => {
    if (!disputeReason.trim()) return;
    const res = reportPost(postId, disputeReason.trim());
    setActionFeedback(res.message);
    setReportingPostId(null);
    setDisputeReason('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: University Executive Governance */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-purple-100 text-xs font-bold border border-white/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>University Executive Governance Console</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>NAAC {currentUser.accreditationGrade || 'A++'} Certified</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentUser.fullName}
          </h1>

          <div className="flex items-center gap-2 text-xs text-purple-200">
            <span>License:</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/20">
              {currentUser.certifiedLicenseNumber || 'AICTE-TN-2024-8841'}
            </span>
            <span>•</span>
            <span>Accreditation:</span>
            <span className="font-bold text-white">NIRF Top 50 Engineering</span>
          </div>

          <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
            Broadcast certified campus notices, oversee the official university Discord community, approve pending faculty lab spaces, and showcase stellar student achievements.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {officialCommunity ? (
              <button
                onClick={handleCopyInviteLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-900 text-xs font-bold hover:bg-purple-50 transition shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Invite Copied!' : 'Share Official Community Invite'}</span>
              </button>
            ) : (
              <Link
                href="/servers"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-900 text-xs font-bold hover:bg-purple-50 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Deploy Official Community (1 Allowed)</span>
              </Link>
            )}

            <Link
              href="/connect"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-white text-xs font-semibold border border-white/20 transition"
            >
              <span>Manage Campus Channels</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Segmented Apple-Style Institution Navigation Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setInstitutionTab('governance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              institutionTab === 'governance'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Governance & Community</span>
          </button>
          <button
            onClick={() => setInstitutionTab('broadcast')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              institutionTab === 'broadcast'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Campus Emergency Broadcast</span>
          </button>
          <button
            onClick={() => setInstitutionTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              institutionTab === 'analytics'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Placement & Hiring Analytics</span>
          </button>
          <button
            onClick={() => setInstitutionTab('compliance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              institutionTab === 'compliance'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Accreditation & NAAC/NIRF Export</span>
          </button>
        </div>
      </div>

      {institutionTab === 'governance' && (
        <>
          {/* Main Grid: Broadcast & Student Showcase vs Governance Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Broadcast Console & Student Showcase */}
        <div className="lg:col-span-8 space-y-6">
          {/* Broadcast Composer Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  🏛️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Broadcast Official Institution Circular</h3>
                  <p className="text-[11px] text-slate-400">Verified official communication to all students & faculty</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Official Voice
              </span>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3">
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={3}
                placeholder="Broadcast official announcements, placement milestones, holiday calendars, or accreditation updates..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={postTopic}
                    onChange={e => setPostTopic(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Official Circular">📢 Official Circular</option>
                    <option value="Placement Milestone">💼 Placement Milestone</option>
                    <option value="Exam Notification">📝 Exam Notification</option>
                    <option value="Campus Accreditation">🏆 Campus Accreditation</option>
                    <option value="Admission Advisory">🎓 Admission Advisory</option>
                  </select>

                  <input
                    type="url"
                    value={postImageUrl}
                    onChange={e => setPostImageUrl(e.target.value)}
                    placeholder="Poster / Image URL..."
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none max-w-[160px] truncate"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!postContent.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Notice</span>
                </button>
              </div>
            </form>
          </div>

          {/* Student Achievement Showcase Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Student Achievement Showcase (Repost to University Showcase)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Institutions can showcase verified student achievements on the official campus front-page
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                {studentPosts.length} Student Posts
              </span>
            </div>

            {studentPosts.slice(0, 5).map(post => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                {post.repostedByInstitution && (
                  <div className="bg-purple-50/70 border border-purple-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-purple-900">
                    <Repeat className="w-3 h-3 text-purple-600" />
                    <span>Featured in Official University Showcase</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{post.authorName}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                          Student
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{post.collegeName || 'Campus Lenz'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Showcase Repost Button */}
                    <button
                      onClick={() => handleShowcaseStudent(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition flex items-center gap-1"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Showcase</span>
                    </button>

                    {/* Dispute False Info Button */}
                    <button
                      onClick={() => {
                        setReportingPostId(reportingPostId === post.id ? null : post.id);
                        setDisputeReason('');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Issue Disputed Notice"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50">
                    <img src={post.imageUrl} alt="attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Dispute Notice Drawer if open */}
                {reportingPostId === post.id && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                    <label className="block font-bold text-rose-900">
                      Issue Formal Institutional Dispute Notice:
                    </label>
                    <input
                      type="text"
                      value={disputeReason}
                      onChange={e => setDisputeReason(e.target.value)}
                      placeholder="e.g. Unverified claim regarding placement statistics or exam schedules..."
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReportingPostId(null)}
                        className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisputeSubmit(post.id)}
                        className="px-3.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-2xs"
                      >
                        Issue Dispute Notice
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Community Controller & Faculty Proposal Queue */}
        <div className="lg:col-span-4 space-y-4">
          {/* Official Community Status & 1-Community Enforcement */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">Official Campus Community</h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                1 Allowed Max
              </span>
            </div>

            {officialCommunity ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-950 truncate">{officialCommunity.name}</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{officialCommunity.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-purple-900 font-semibold pt-1 border-t border-purple-100">
                    <span>{officialCommunity.memberCount} Members</span>
                    <span>{officialCommunity.channels.length} Channels</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyInviteLink}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Official Invite Link</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 space-y-2">
                <p>No official community page deployed yet.</p>
                <Link
                  href="/servers"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition inline-flex items-center gap-1 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Deploy Campus Community</span>
                </Link>
              </div>
            )}
          </div>

          {/* Faculty Community Approval Queue */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">Faculty Proposals Queue</h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                {pendingFacultyProposals.length} Pending
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Review and approve community lab pages submitted by verified academic faculty.
            </p>

            {pendingFacultyProposals.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No pending faculty proposals waiting for review.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingFacultyProposals.map(proposal => (
                  <div key={proposal.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{proposal.name}</span>
                      <span className="text-[10px] font-medium text-slate-500">
                        By {proposal.requestedByFacultyName || 'Faculty'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {proposal.description}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          const res = rejectFacultyCommunity(proposal.id);
                          setActionFeedback(res.message);
                          setTimeout(() => setActionFeedback(null), 4000);
                        }}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => {
                          const res = approveFacultyCommunity(proposal.id);
                          setActionFeedback(res.message);
                          setTimeout(() => setActionFeedback(null), 4000);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve Community</span>
                      </button>
                    </div>
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
      {/* TAB 2: CAMPUS EMERGENCY BROADCAST CONTROLLER                               */}
      {/* ========================================================================= */}
      {institutionTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Campus Emergency Broadcast Controller</h2>
              <p className="text-xs text-slate-500">Deploy high-priority banner advisories and emergency alerts that display instantly across the entire campus platform.</p>
            </div>
          </div>

          {/* Active Broadcast Status Card */}
          {emergencyBroadcast && emergencyBroadcast.active ? (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              emergencyBroadcast.severity === 'critical'
                ? 'bg-red-50 border-red-200 text-red-950'
                : emergencyBroadcast.severity === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/80 shadow-2xs flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                  Active {emergencyBroadcast.severity.toUpperCase()} Alert
                </span>
                <span className="text-xs font-semibold text-slate-500">{emergencyBroadcast.issuedAt}</span>
              </div>

              <div>
                <h3 className="text-base font-bold">{emergencyBroadcast.title}</h3>
                <p className="text-xs leading-relaxed mt-1">{emergencyBroadcast.message}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/10">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="font-semibold">Target:</span>
                  <span>{emergencyBroadcast.targetAudiences.join(', ')}</span>
                </div>
                <button
                  onClick={() => {
                    const res = dismissEmergencyBroadcast();
                    setActionFeedback(res.message);
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs"
                >
                  Dismiss / Deactivate Broadcast
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              ℹ️ No active emergency broadcasts currently deployed. System running normal.
            </div>
          )}

          {/* Deploy New Broadcast Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
              const res = triggerEmergencyBroadcast(broadcastTitle.trim(), broadcastMessage.trim(), broadcastSeverity);
              setActionFeedback(res.message);
              setBroadcastTitle('');
              setBroadcastMessage('');
              setTimeout(() => setActionFeedback(null), 4000);
            }}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">Deploy New Campus Advisory or Emergency Alert</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500">Alert Title / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Severe Weather Advisory: Online classes active tomorrow"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Severity Level</label>
                <select
                  value={broadcastSeverity}
                  onChange={e => setBroadcastSeverity(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                >
                  <option value="notice">Notice (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="critical">Critical Emergency (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Detailed Message & Safety Protocols</label>
              <textarea
                rows={3}
                placeholder="Explain the circumstances, campus schedule adjustments, and contact points..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
              >
                Broadcast to Entire Campus Network
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLACEMENT & HIRING ANALYTICS DASHBOARD                             */}
      {/* ========================================================================= */}
      {institutionTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Placement & Corporate Hiring Analytics</h2>
              <p className="text-xs text-slate-500">Comprehensive batch placement metrics, CTC distribution, and corporate partner performance.</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              Verified Batch 2025-2026 Data
            </span>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Placement Rate</span>
              <div className="text-2xl font-black text-emerald-600">96.4%</div>
              <span className="text-[11px] text-slate-500">1,240 / 1,286 Registered</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest CTC Package</span>
              <div className="text-2xl font-black text-slate-900">₹48.5 LPA</div>
              <span className="text-[11px] text-slate-500">Google Inc. (Mountain View)</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average CTC Package</span>
              <div className="text-2xl font-black text-slate-900">₹14.2 LPA</div>
              <span className="text-[11px] text-emerald-600 font-semibold">+18.4% YoY Growth</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tier-1 Corporate Offers</span>
              <div className="text-2xl font-black text-blue-600">420+</div>
              <span className="text-[11px] text-slate-500">Across 68 Global Tech Giants</span>
            </div>
          </div>

          {/* Department Breakdown & Top Recruiters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Department-Wise Placement Statistics</h3>
              <div className="space-y-3">
                {[
                  { dept: 'Computer Science & Engineering', rate: 98.6, avg: '₹18.4 LPA' },
                  { dept: 'Information Technology', rate: 97.2, avg: '₹16.8 LPA' },
                  { dept: 'Electronics & Communication', rate: 94.5, avg: '₹13.5 LPA' },
                  { dept: 'Electrical & Electronics', rate: 91.0, avg: '₹11.2 LPA' },
                  { dept: 'Mechanical Engineering', rate: 89.4, avg: '₹9.8 LPA' }
                ].map(item => (
                  <div key={item.dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.dept}</span>
                      <span className="text-emerald-600 font-bold">{item.rate}% ({item.avg})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0071e3] h-full rounded-full" style={{ width: `${item.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recruiters */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Top Tier-1 Recruiting Corporate Partners</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Google', hires: 18, avg: '₹42 LPA' },
                  { name: 'Microsoft', hires: 26, avg: '₹38 LPA' },
                  { name: 'Amazon', hires: 34, avg: '₹32 LPA' },
                  { name: 'Cisco Systems', hires: 42, avg: '₹22 LPA' },
                  { name: 'Goldman Sachs', hires: 16, avg: '₹28 LPA' },
                  { name: 'Qualcomm', hires: 22, avg: '₹24 LPA' }
                ].map(corp => (
                  <div key={corp.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-bold text-xs text-slate-900">{corp.name}</span>
                    <div className="text-[11px] text-slate-500">
                      Offers: <span className="font-semibold text-slate-700">{corp.hires}</span> • Avg: <span className="font-semibold text-emerald-600">{corp.avg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCREDITATION & COMPLIANCE EXPORT (NIRF / NAAC)                     */}
      {/* ========================================================================= */}
      {institutionTab === 'compliance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Accreditation & Compliance Reporting (NAAC / NIRF)</h2>
              <p className="text-xs text-slate-500">Consolidated institutional compliance indicators ready for annual audit review and report export.</p>
            </div>
            <button
              onClick={() => {
                const reportData = {
                  institution: currentUser.fullName,
                  license: currentUser.certifiedLicenseNumber || 'AICTE-TN-2024-8841',
                  accreditation: currentUser.accreditationGrade || 'NAAC A++',
                  nirfRankingCategory: 'Top 50 Engineering',
                  studentFacultyRatio: '1:14',
                  phdFacultyPercent: '88%',
                  annualResearchFunding: '₹4.2 Crores',
                  placementRate: '96.4%',
                  grievanceResolutionRate: '100%',
                  generatedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compliance_audit_report_${Date.now()}.json`;
                a.click();
                setActionFeedback('📄 Official NIRF/NAAC Compliance Export downloaded successfully!');
                setTimeout(() => setActionFeedback(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Report (JSON)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student to Faculty Ratio</span>
              <div className="text-2xl font-black text-slate-900">1 : 14</div>
              <p className="text-[11px] text-slate-500">Exceeds AICTE mandated 1:15 standard ratio</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Doctorate (Ph.D.) Faculty</span>
              <div className="text-2xl font-black text-slate-900">88.2%</div>
              <p className="text-[11px] text-slate-500">142 full-time professors holding Ph.D. degrees</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual Research Grants</span>
              <div className="text-2xl font-black text-slate-900">₹4.20 Cr</div>
              <p className="text-[11px] text-slate-500">Sponsored by DST, SERB, and Industry MoUs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
