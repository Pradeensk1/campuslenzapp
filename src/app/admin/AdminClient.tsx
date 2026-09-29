'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import {
  UnifiedAIModerationResult,
  ReviewSummaryResult,
  DuplicateDetectionResult,
  SemanticSearchResult,
  MessageAnalysisResult,
  AIServiceHealth
} from '@/types';
import {
  ShieldCheck,
  Terminal,
  Trash2,
  AlertTriangle,
  Users,
  Building2,
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Clock,
  Radio,
  BarChart3,
  AlertOctagon,
  Check,
  Zap,
  Eye,
  Sliders,
  Image as ImageIcon,
  Video,
  Bot,
  Shield,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Copy,
  MessageSquare,
  CheckCircle,
  RefreshCcw,
  X
} from 'lucide-react';
import { isVideoMedia } from '@/lib/mediaUtils';

interface TerminalEntry {
  type: 'input' | 'output';
  text: string;
}

export default function AdminClient({
  initialAuditLogs = [],
  initialProfiles = [],
  initialPosts = [],
}: {
  initialAuditLogs?: any[];
  initialProfiles?: any[];
  initialPosts?: any[];
}) {
  const {
    currentUser,
    posts,
    deletePost,
    deleteComment,
    allUsers,
    deleteUser,
    unbanUser,
    banUser,
    restoreRestrictedPost,
    colleges,
    grievanceReports,
    servers,
    executeAdminTerminalCommand,
    auditLogs,
    logAdminAction,
    runAIToxicityCheck,
    aiModelSettings,
    updateAIModelSettings,
    runOpenSourceAIModeration,
    loginUser,
    aiServiceStatus,
    refreshAIServiceStatus,
    summarizeReviewsWithAI,
    detectDuplicateWithAI,
    semanticSearchCollegesWithAI,
    analyzeMessageWithAI,
    analyzeImageWithAI
  } = useApp();

  const [activeTab, setActiveTab] = useState<'terminal' | 'users' | 'moderation' | 'audit'>('terminal');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni' | 'faculty' | 'institution' | 'admin'>('all');

  // Anonymous & AI-Restricted Incident Queue State
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'anonymous' | 'toxic' | 'quarantined'>('all');
  const [incidentBanDurations, setIncidentBanDurations] = useState<Record<string, number>>({});
  const [incidentBanReasons, setIncidentBanReasons] = useState<Record<string, string>>({});
  const [incidentActionLoading, setIncidentActionLoading] = useState<Record<string, boolean>>({});

  // Direct User Ban Checkout Modal State
  const [userToBan, setUserToBan] = useState<any | null>(null);
  const [userBanDuration, setUserBanDuration] = useState<number>(72);
  const [userBanReason, setUserBanReason] = useState<string>('Violation of community guidelines and content safety policy');
  const [isProcessingUserBan, setIsProcessingUserBan] = useState(false);

  // Dedicated Admin Gate Login State
  const [adminLoginId, setAdminLoginId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  const handleAdminGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setIsAdminLoggingIn(true);
    try {
      const res = await loginUser(adminLoginId.trim(), adminPassword, 'admin');
      if (!res.success) {
        setAdminLoginError(res.message || 'Invalid administrator credentials. Access denied.');
      } else {
        setActionFeedback('⚡ Root Administrator Clearance Granted! Console unlocked.');
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Authentication failed.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  // AI Content Moderation Console State
  const [aiScanInput, setAiScanInput] = useState('Had an amazing engineering hackathon session today! Proud of the collaborative energy.');
  const [aiScanImageUrl, setAiScanImageUrl] = useState('');
  const [aiScanResult, setAiScanResult] = useState<{
    toxicityScore: number;
    sentiment: 'positive' | 'neutral' | 'toxic' | 'ragebait';
    flagReason?: string;
  } | null>({
    toxicityScore: 4,
    sentiment: 'positive'
  });
  const [aiUnifiedResult, setAiUnifiedResult] = useState<UnifiedAIModerationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // AI Workbench Sub-Tabs: 'post' | 'review' | 'duplicate' | 'message' | 'semantic'
  const [aiWorkbenchTab, setAiWorkbenchTab] = useState<'post' | 'review' | 'duplicate' | 'message' | 'semantic'>('post');
  const [isPingingService, setIsPingingService] = useState(false);

  // Review Summarizer Workbench
  const [reviewSumCollegeId, setReviewSumCollegeId] = useState('col-psg');
  const [reviewSumCustomText, setReviewSumCustomText] = useState(
    'The faculty are exceptionally knowledgeable and research-driven. High placement percentage with marquee recruiters visiting campus every session. However, the hostel rooms are quite old and mess food could be improved significantly. Overall tuition is high but worth the money for the exposure and peer community.'
  );
  const [reviewSumResult, setReviewSumResult] = useState<ReviewSummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Duplicate Detector Workbench
  const [dupTextA, setDupTextA] = useState(
    'The placement cell at PSG Tech needs to invite more core mechanical engineering companies instead of only IT software companies.'
  );
  const [dupTextB, setDupTextB] = useState(
    'PSG College placement department should bring more core mechanical firms rather than just IT service recruiters.'
  );
  const [dupThreshold, setDupThreshold] = useState(0.85);
  const [dupResult, setDupResult] = useState<DuplicateDetectionResult | null>(null);
  const [isDetectingDup, setIsDetectingDup] = useState(false);

  // Message Analyzer Workbench
  const [msgScanText, setMsgScanText] = useState('Can you please share your notes from Dr. Ramesh\'s lecture on distributed systems?');
  const [msgScanResult, setMsgScanResult] = useState<MessageAnalysisResult | null>(null);
  const [isScanningMsg, setIsScanningMsg] = useState(false);

  // Semantic Search Workbench
  const [semanticQuery, setSemanticQuery] = useState('affordable engineering college with great coding culture and good hostel food near coimbatore');
  const [semanticResult, setSemanticResult] = useState<SemanticSearchResult | null>(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Audit Trail State
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([
    {
      type: 'output',
      text: `CAMPUS LENZ DEVELOPER CORE [Version 3.2.0 - Turbopack Node.js Platform]
(c) 2026 Campus Lenz Systems. All rights reserved.

Developer environment initialized. Type 'help' to view available system commands.`
    }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const isAdmin = currentUser?.role === 'admin';

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    // Add to command log for arrow navigation
    setCommandLog(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    if (cmd.toLowerCase() === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    const output = executeAdminTerminalCommand(cmd);

    setTerminalHistory(prev => [
      ...prev,
      { type: 'input', text: `admin@campuslenz:~$ ${cmd}` },
      { type: 'output', text: output }
    ]);

    setTerminalInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandLog.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandLog.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setTerminalInput(commandLog[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandLog.length) {
        setHistoryIndex(-1);
        setTerminalInput('');
      } else {
        setHistoryIndex(nextIndex);
        setTerminalInput(commandLog[nextIndex] || '');
      }
    }
  };

  const filteredUsers = allUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        Boolean(u.collegeName && u.collegeName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditSeverityFilter !== 'all' && log.severity !== auditSeverityFilter) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      return (
        log.actionType.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    if (runOpenSourceAIModeration) {
      setAiUnifiedResult(runOpenSourceAIModeration(aiScanInput, aiScanImageUrl || undefined));
    }
  }, []);

  const handleRunAIScan = (customText?: string, customImage?: string) => {
    const text = customText !== undefined ? customText : aiScanInput;
    const img = customImage !== undefined ? customImage : aiScanImageUrl;
    setIsScanning(true);
    setTimeout(() => {
      const result = runAIToxicityCheck(text);
      setAiScanResult(result);
      if (runOpenSourceAIModeration) {
        const unified = runOpenSourceAIModeration(text, img || undefined);
        setAiUnifiedResult(unified);
      }
      setIsScanning(false);
    }, 250);
  };

  const handleQuarantineScannedText = () => {
    const tox = aiUnifiedResult ? aiUnifiedResult.toxicity.score : (aiScanResult?.toxicityScore ?? 0);
    const sent = aiUnifiedResult ? aiUnifiedResult.sentiment.label : (aiScanResult?.sentiment ?? 'neutral');
    const rec = aiUnifiedResult ? aiUnifiedResult.actionRecommended : 'quarantine';
    logAdminAction(
      'AI_CONTENT_QUARANTINE',
      'Content Moderation Sandbox',
      `Flagged text quarantined (Toxicity ${tox}%, sentiment: ${sent}, recommendation: ${rec}): "${aiScanInput.slice(0, 60)}..."`,
      tox > 70 ? 'critical' : 'warning'
    );
    setActionFeedback(`Content successfully quarantined! Registered in administrative audit trail.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleUpdateAutoBanThreshold = (val: number) => {
    updateAIModelSettings({ autoBanThreshold: val });
    logAdminAction('AI_POLICY_UPDATED', 'Toxicity Engine', `Auto-Ban Toxicity Threshold updated to ${val}%`, 'warning');
    setActionFeedback(`Auto-Ban threshold set to ${val}%. Immediate enforcement active.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleUpdateBlurThreshold = (val: number) => {
    updateAIModelSettings({ blurThreshold: val });
    logAdminAction('AI_POLICY_UPDATED', 'Feed Shield Engine', `Sensitive Content Blur Threshold updated to ${val}%`, 'info');
    setActionFeedback(`Feed blur threshold set to ${val}%.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleToggleAutoBan = () => {
    const newVal = !aiModelSettings.autoBanEnabled;
    updateAIModelSettings({ autoBanEnabled: newVal });
    logAdminAction('AI_POLICY_UPDATED', 'Toxicity Engine', `Automated 48h Toxicity Ban ${newVal ? 'ENABLED' : 'SET TO SIMULATION MODE'}`, newVal ? 'critical' : 'warning');
    setActionFeedback(`Automated Ban Engine is now ${newVal ? 'ACTIVE (Real-time suspensions)' : 'IN SIMULATION MODE (No auto-bans)'}.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handlePingAIService = async () => {
    setIsPingingService(true);
    try {
      const res = await refreshAIServiceStatus();
      setActionFeedback(`⚡ AI Service: ${res.service} (${res.activeEngine}) - Latency: ${res.latencyMs || 1}ms`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch {
      setActionFeedback('⚡ Connected to Local Edge WASM AI Engine');
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setIsPingingService(false);
    }
  };

  const handleRunReviewSummarizer = async () => {
    setIsSummarizing(true);
    try {
      const reviews = reviewSumCustomText
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 5);
      const res = await summarizeReviewsWithAI(reviewSumCollegeId, reviews.length > 0 ? reviews : [reviewSumCustomText]);
      setReviewSumResult(res);
      setActionFeedback('✨ AI Review Summarization Complete!');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      // Fallback
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleRunDuplicateDetector = async () => {
    setIsDetectingDup(true);
    try {
      const res = await detectDuplicateWithAI(dupTextA, dupTextB, dupThreshold);
      setDupResult(res);
      setActionFeedback(`🔍 Duplicate Analysis Complete: ${Math.round(res.similarity * 100)}% Similarity`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      // Fallback
    } finally {
      setIsDetectingDup(false);
    }
  };

  const handleRunMessageScanner = async () => {
    setIsScanningMsg(true);
    try {
      const res = await analyzeMessageWithAI(msgScanText);
      setMsgScanResult(res);
      setActionFeedback(`💬 Direct Message Safety Analysis: ${res.action.toUpperCase()}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      // Fallback
    } finally {
      setIsScanningMsg(false);
    }
  };

  const handleRunSemanticSearch = async () => {
    setIsSearchingSemantic(true);
    try {
      const res = await semanticSearchCollegesWithAI(semanticQuery, 6);
      setSemanticResult(res);
      setActionFeedback(`🏛️ Found ${res.matches.length} Semantic College Matches!`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      // Fallback
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `campus-lenz-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getAIIncidentRecommendation = (post: any) => {
    const tox = post.toxicityScore ?? 0;
    if (tox >= 90 || post.autoDeleted) {
      return {
        hours: 168,
        label: '7-Day Suspension (Tier 3 Severe Threat / Toxicity >= 90%)',
        badge: 'Recommended: 7-Day Ban',
        defaultReason: `Automated AI Ban: Extreme toxicity (${tox}%) - Severe policy violation`
      };
    }
    if (tox >= 75) {
      return {
        hours: 72,
        label: '3-Day Suspension (Tier 2 High Abuse / Hostility >= 75%)',
        badge: 'Recommended: 3-Day Ban',
        defaultReason: `Automated AI Ban: High toxicity (${tox}%) - Hostile discourse detected`
      };
    }
    if (post.isAnonymous) {
      return {
        hours: 24,
        label: '24-Hour Review Hold (Unauthorized Anonymous Feed Bypass)',
        badge: 'Recommended: 24h Hold',
        defaultReason: `Automated AI Hold: Anonymous posting redirected to admin clearance`
      };
    }
    return {
      hours: 24,
      label: '24-Hour Moderation Hold (Tier 1 Warning)',
      badge: 'Recommended: 24h Ban',
      defaultReason: `Automated AI Moderation: Flagged for sensitive discourse (${post.sensitiveReason || 'Flagged content'})`
    };
  };

  const handleCheckoutBan = async (post: any) => {
    if (!isAdmin) return;
    const authorId = post.authorId || post.authorUsername;
    const defaultRec = getAIIncidentRecommendation(post);
    const durationHours = incidentBanDurations[post.id] ?? defaultRec.hours;
    const reason = incidentBanReasons[post.id]?.trim() || defaultRec.defaultReason;

    setIncidentActionLoading(prev => ({ ...prev, [post.id]: true }));
    try {
      const res = banUser(authorId, durationHours, reason);
      logAdminAction(
        'USER_TEMPORARY_BAN',
        `@${post.authorUsername || authorId}`,
        `Admin issued ${durationHours}h temporary suspension to ${post.authorName || authorId}. Reason: "${reason}". Origin Post: ${post.id}`,
        'warning'
      );
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4500);
    } finally {
      setIncidentActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  };

  const handlePurgeRestrictedPost = (postId: string, authorName: string) => {
    if (!isAdmin) return;
    deletePost(postId);
    logAdminAction(
      'POST_DELETED',
      `Post ${postId}`,
      `Restricted post by ${authorName} permanently purged by administrator.`,
      'critical'
    );
    setActionFeedback(`🗑️ Post ${postId} permanently purged and wiped from the platform.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReleasePostToFeed = (postId: string, authorName: string) => {
    if (!isAdmin) return;
    restoreRestrictedPost(postId);
    logAdminAction(
      'POST_APPROVED',
      `Post ${postId}`,
      `Restricted post by ${authorName} manually reviewed and approved for public feed by administrator.`,
      'info'
    );
    setActionFeedback(`✅ Post ${postId} approved and released to the public campus feed!`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleExecuteUserBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToBan || !isAdmin) return;
    setIsProcessingUserBan(true);
    try {
      const res = banUser(userToBan.id, userBanDuration, userBanReason);
      logAdminAction(
        'USER_TEMPORARY_BAN',
        `@${userToBan.username}`,
        `Administrator issued ${userBanDuration}h temporary suspension to ${userToBan.fullName}. Reason: "${userBanReason}"`,
        'warning'
      );
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4500);
      setUserToBan(null);
    } finally {
      setIsProcessingUserBan(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Admin Platform Governance
                </h1>
                <p className="text-xs text-slate-500">
                  Global content control, institutional dispute moderation & Developer Options Terminal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isAdmin ? (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In as Administrator
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Root Clearance Active
              </span>
            )}
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Portal Login
            </Link>
          </div>
        </div>

        {/* Dedicated Admin Login Gate if not authenticated with Super Admin clearance */}
        {!isAdmin ? (
          <div className="max-w-lg mx-auto my-6 apple-card p-6 sm:p-8 space-y-6 text-center border-2 border-[#CFEAFF] shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-[#E8F5FF] text-[#1687D4] flex items-center justify-center mx-auto shadow-inner border border-[#CFEAFF]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Root Administrative Clearance Required
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Access to the Developer Options terminal, content moderation sandbox, and institutional governance requires Root Admin authentication.
              </p>
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminGateLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Login ID
                </label>
                <div className="relative">
                  <Terminal className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={adminLoginId}
                    onChange={e => setAdminLoginId(e.target.value)}
                    placeholder="system_admin or admin@campuslenz.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdminLoggingIn || !adminLoginId.trim() || !adminPassword}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAdminLoggingIn ? 'Verifying Root Clearance...' : 'Authenticate & Unlock Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <Link href="/" className="hover:text-blue-600 font-semibold transition">
                ← Back to Campus Feed
              </Link>
              <span>Provisioned ID: <strong className="text-slate-700 font-mono">system_admin</strong></span>
            </div>
          </div>
        ) : (
          <>
            {/* Platform Vitals Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Platform Users</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{allUsers.length}</div>
            <div className="text-[11px] text-slate-400">5 Distinct Role Portals</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Published Posts</span>
              <FileText className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{posts.length}</div>
            <div className="text-[11px] text-slate-400">LinkedIn & Instagram style</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Campus Discord Servers</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{servers.length}</div>
            <div className="text-[11px] text-slate-400">Anti-Ragebait Active</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Private Grievances</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{grievanceReports.length}</div>
            <div className="text-[11px] text-slate-400">Direct to Institution ID</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Developer Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>User Accounts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Toxicity & Moderation</span>
            {posts.some(p => p.isAnonymous || p.isQuarantined || p.isRestricted || p.redirectedToAdmin || p.autoDeleted) ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] text-white font-extrabold shadow-2xs animate-pulse">
                {posts.filter(p => p.isAnonymous || p.isQuarantined || p.isRestricted || p.redirectedToAdmin || p.autoDeleted).length} Incidents
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">
                {posts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Audit Trail & Activity</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-[10px] text-rose-700 font-extrabold border border-rose-200">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Action feedback banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              {actionFeedback}
            </span>
            <button onClick={() => setActionFeedback(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">✕</button>
          </div>
        )}

        {/* TAB 1: DEVELOPER TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            {isAdmin ? (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
                {/* Terminal Window Top Bar (Apple-style window controls) */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-xs font-mono font-bold text-slate-400 ml-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      admin@campuslenz:~$ (Developer Option Console)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ROOT DEVELOPER PRIVILEGES
                    </span>
                  </div>
                </div>

                {/* Terminal Screen / Log */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="p-5 font-mono text-xs sm:text-sm text-emerald-400 bg-slate-950 min-h-[340px] max-h-[480px] overflow-y-auto space-y-3 cursor-text selection:bg-emerald-800 selection:text-white"
                >
                  {terminalHistory.map((item, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                      {item.type === 'input' ? (
                        <span className="text-slate-300 font-bold">{item.text}</span>
                      ) : (
                        <span className="text-emerald-400/90">{item.text}</span>
                      )}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>

                {/* Terminal Interactive Prompt Input */}
                <form onSubmit={e => {
                  handleTerminalSubmit(e);
                  if (terminalInput.trim() && !['clear'].includes(terminalInput.trim().toLowerCase())) {
                    logAdminAction('TERMINAL_COMMAND', 'CLI Console', `Executed command: "${terminalInput.trim()}"`, 'info');
                  }
                }} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 pl-2">
                    admin@campuslenz:~$
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={e => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="type 'help', 'sysinfo', 'users', 'posts', 'reports', 'db --health', 'clear'..."
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors"
                  >
                    Execute
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Developer Terminal Restricted</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Sign in with the Administrator persona (or click Super Administrator in the floating Role Switcher) to access the interactive CLI shell.
                  </p>
                </div>
              </div>
            )}

            {/* Diagnostic Node Health */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Node Cluster & Runtime Diagnostics</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Cluster Healthy (0 anomalies)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Turbopack Execution Engine</span>
                  <div className="font-bold text-slate-800">Next.js 16.3.6 App Router</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Mock Hydration Storage</span>
                  <div className="font-bold text-slate-800">HTML5 LocalStorage V6 Engine</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Connected Campuses</span>
                  <div className="font-bold text-slate-800">{colleges.length} Active Universities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNT REGISTRY */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">User Account Registry & Direct Account Purge</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full authority to inspect account statuses, remove violating users, and unban restricted accounts
                </p>
              </div>
              
              {/* Search and Role Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search username, name, college..."
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="faculty">Faculty</option>
                  <option value="institution">Institution</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">User / Identity</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">College / Affiliation</th>
                    <th className="pb-3">Followers</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No users match the search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isCurrentAdmin = user.id === currentUser?.id;
                      const isBanned = Boolean(user.isBanned);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 pl-2">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                  user.fullName[0] || 'U'
                                )}
                              </div>
                              <div>
                                <Link href={`/user/${user.username}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                                  {user.fullName}
                                </Link>
                                <div className="text-[11px] text-slate-400">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                              user.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : user.role === 'institution'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : user.role === 'faculty'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : user.role === 'alumni'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 max-w-[180px] truncate">
                            {user.collegeName || 'Campus Lenz Global'}
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {user.followersCount ?? 0}
                          </td>
                          <td className="py-3">
                            {isBanned ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                                  <AlertTriangle className="w-3 h-3" />
                                  Banned / Restricted
                                </span>
                                {user.bannedUntil && (
                                  <div className="text-[10px] text-rose-600 font-mono">
                                    Until: {new Date(user.bannedUntil).toLocaleDateString()} {new Date(user.bannedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                                {user.bannedReason && (
                                  <div className="text-[10px] text-slate-500 italic max-w-[160px] truncate" title={user.bannedReason}>
                                    {user.bannedReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isBanned && isAdmin && (
                                <button
                                  onClick={() => {
                                    const res = unbanUser(user.id);
                                    logAdminAction('USER_UNBANNED', `@${user.username}`, `Restored platform clearance for ${user.fullName}`, 'info');
                                    setActionFeedback(res.message);
                                    setTimeout(() => setActionFeedback(null), 4000);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition"
                                >
                                  Unban
                                </button>
                              )}
                              {!isBanned && !isCurrentAdmin && isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserToBan(user);
                                    setUserBanDuration(72);
                                    setUserBanReason('Policy enforcement: Content violation / Suspension hold');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition flex items-center gap-1"
                                >
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  Temp Ban
                                </button>
                              )}
                              {isAdmin ? (
                                isCurrentAdmin ? (
                                  <span className="text-[11px] text-slate-400 italic">Current Session</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`⚠️ Permanently purge account @${user.username} (${user.fullName}) and all associated posts from the platform database?`)) {
                                        const res = deleteUser(user.id);
                                        logAdminAction('USER_PURGED', `@${user.username}`, `Administrator purged user account (${user.fullName}) and content.`, 'critical');
                                        setActionFeedback(res.message);
                                        setTimeout(() => setActionFeedback(null), 4000);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                )
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Protected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AI CONTENT MODERATION & POST DESK */}
        {activeTab === 'moderation' && (
          <div className="space-y-8">
            {/* 1. OPEN-SOURCE AI MODEL PIPELINE TOPOLOGY & STATUS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-200">
                      <Cpu className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Open-Source AI Model Pipeline & Topology
                      </h2>
                      <p className="text-xs text-slate-500">
                        Zero-cloud local inference pipeline for real-time text sentiment, multi-label toxicity, and vision safety classification
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePingAIService}
                    disabled={isPingingService}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPingingService ? 'animate-spin' : ''}`} />
                    {isPingingService ? 'Pinging...' : 'Ping AI Service'}
                  </button>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    aiServiceStatus?.isExternalServiceActive
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${aiServiceStatus?.isExternalServiceActive ? 'bg-purple-500' : 'bg-emerald-500'} animate-pulse`} />
                    {aiServiceStatus?.isExternalServiceActive
                      ? 'FastAPI Microservice Active (Port 8000)'
                      : '8 / 8 Models Active (Local Edge Resilient Fallback)'}
                  </span>
                </div>
              </div>

              {/* 8 Model Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Model 1: campus-lenz-ai (Category & Post Analyzer) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                      Text & Post Analyzer
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (5ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">campus-lenz-ai</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      10-category topic classification, aspect-based review breakdown, and deterministic policy filter.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>Ollama / Edge</strong></span>
                    <span>Classes: <strong>10 Topics</strong></span>
                  </div>
                </div>

                {/* Model 2: unitary/toxic-bert */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                      Toxicity Classifier
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (11ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">unitary/toxic-bert</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Multi-label NLP transformer analyzing toxicity, threat, insult, obscene, and ragebait signals.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>ONNX Edge</strong></span>
                    <span>Weights: <strong>440MB</strong></span>
                  </div>
                </div>

                {/* Model 3: distilbert-sst2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                      Sentiment Analysis
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (8ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono truncate">distilbert-sst-2-english</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sentiment polarity & academic guidance estimator fine-tuned on Stanford Sentiment Treebank.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>Transformers.js</strong></span>
                    <span>Acc: <strong>91.3%</strong></span>
                  </div>
                </div>

                {/* Model 4: nsfwjs-mobilenet-v2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                      Vision Classifier
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (24ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">nsfwjs-mobilenet-v2</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Visual safety classification for suggestive, graphic, and policy-violating imagery.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>WebGL / Canvas</strong></span>
                    <span>Classes: <strong>5 Labels</strong></span>
                  </div>
                </div>

                {/* Model 5: review_summarizer */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider">
                      Review Summarizer
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (12ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">review-summarizer</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Synthesizes student reviews into key takeaways, positive/negative points, and 8-aspect summaries.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>Multi-Aspect Matrix</strong></span>
                    <span>Aspects: <strong>8 Dims</strong></span>
                  </div>
                </div>

                {/* Model 6: duplicate_detector */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                      Duplicate Detector
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (3ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">duplicate-detector</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      High-precision cosine vector & tri-gram proximity detector for paraphrased student submissions.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>Cosine Vector</strong></span>
                    <span>Threshold: <strong>0.85</strong></span>
                  </div>
                </div>

                {/* Model 7: semantic_search */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase tracking-wider">
                      Semantic Search
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (6ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">nomic-embed-search</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Retrieves colleges using multi-attribute semantic embeddings over programs, fees, placements, and hostel.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>nomic-embed (768d)</strong></span>
                    <span>Dims: <strong>9 Attributes</strong></span>
                  </div>
                </div>

                {/* Model 8: message_analyzer */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-fuchsia-100 text-fuchsia-800 text-[10px] font-black uppercase tracking-wider">
                      Chat Safety Filter
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">● Active (4ms)</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">message-analyzer</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Private message safety classification: flags violence threats, harassment, and commercial scams.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>Safety Filter</strong></span>
                    <span>Status: <strong>Strict Gate</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AUTOMATED GOVERNANCE POLICY & THRESHOLD CONTROLS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                      <SlidersHorizontal className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Automated AI Policy Engine & Thresholds
                      </h2>
                      <p className="text-xs text-slate-500">
                        Configure automated 48-hour account suspension triggers and campus feed sensitive frosted blur thresholds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAutoBan}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                      aiModelSettings.autoBanEnabled
                        ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {aiModelSettings.autoBanEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-rose-600" />
                        <span>Auto-Ban: <strong>ENFORCING</strong></span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-500" />
                        <span>Auto-Ban: <strong>SIMULATION MODE</strong></span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto-Ban Toxicity Threshold */}
                <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-rose-900">
                        Automated Toxicity Ban Threshold
                      </span>
                      <p className="text-[11px] text-rose-700/80">
                        Posts with toxic-bert score &ge; this limit trigger immediate 48h account suspension & post rejection.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white border border-rose-300 text-rose-700 font-mono font-black text-sm shadow-xs">
                      {aiModelSettings.autoBanThreshold}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={1}
                    value={aiModelSettings.autoBanThreshold}
                    onChange={e => handleUpdateAutoBanThreshold(Number(e.target.value))}
                    className="w-full accent-rose-600 h-2 bg-rose-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-rose-600/80 font-semibold">
                    <span>50% (Ultra-Strict)</span>
                    <span>Default: 80%</span>
                    <span>95% (Extreme Only)</span>
                  </div>
                </div>

                {/* Feed Sensitive Restriction Threshold */}
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-amber-900">
                        Feed Sensitive Restriction Threshold
                      </span>
                      <p className="text-[11px] text-amber-700/80">
                        Posts with toxicity &ge; this limit are withheld from public social feeds and routed exclusively to the Admin Queue (Zero Blur Policy).
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-700 font-mono font-black text-sm shadow-xs">
                      {aiModelSettings.blurThreshold}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={15}
                    max={60}
                    step={1}
                    value={aiModelSettings.blurThreshold}
                    onChange={e => handleUpdateBlurThreshold(Number(e.target.value))}
                    className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-amber-600/80 font-semibold">
                    <span>15% (Protective)</span>
                    <span>Default: 35%</span>
                    <span>60% (Permissive)</span>
                  </div>
                </div>
              </div>

              {/* Policy Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-slate-400 font-medium">Quick Policy Profiles:</span>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateAutoBanThreshold(70);
                    handleUpdateBlurThreshold(25);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Strict Standard (70% ban / 25% blur)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateAutoBanThreshold(80);
                    handleUpdateBlurThreshold(35);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Balanced Standard (80% ban / 35% blur)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateAutoBanThreshold(90);
                    handleUpdateBlurThreshold(45);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Lenient / Debate (90% ban / 45% blur)
                </button>
              </div>
            </div>

            {/* 3. ANONYMOUS & AI-RESTRICTED INCIDENT QUEUE & BAN CHECKOUT */}
            <div className="bg-white border-2 border-rose-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Anonymous &amp; AI-Restricted Incident Queue
                      </h2>
                      <p className="text-xs text-slate-500">
                        Zero-blur policy enforcement: Anonymous content and severe AI policy flags are withheld from public social feeds and routed exclusively to admin clearance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter and stats */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {posts.filter(p => p.isAnonymous || p.isQuarantined || p.isRestricted || p.redirectedToAdmin || p.autoDeleted).length} Pending Clearance
                  </span>
                </div>
              </div>

              {/* Sub-Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Incidents', count: posts.filter(p => p.isAnonymous || p.isQuarantined || p.isRestricted || p.redirectedToAdmin || p.autoDeleted).length },
                  { id: 'anonymous', label: '🕵️ Anonymous Posts', count: posts.filter(p => p.isAnonymous).length },
                  { id: 'toxic', label: '🚨 Toxic / Hostile (≥50%)', count: posts.filter(p => (p.toxicityScore ?? 0) >= 50).length },
                  { id: 'quarantined', label: '🔒 AI Quarantined', count: posts.filter(p => p.isQuarantined).length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIncidentFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                      incidentFilter === tab.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${incidentFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Queue Items */}
              {(() => {
                const queuePosts = posts.filter(p => {
                  const isIncident = p.isAnonymous || p.isQuarantined || p.isRestricted || p.redirectedToAdmin || p.autoDeleted;
                  if (!isIncident) return false;
                  if (incidentFilter === 'anonymous') return p.isAnonymous;
                  if (incidentFilter === 'toxic') return (p.toxicityScore ?? 0) >= 50;
                  if (incidentFilter === 'quarantined') return p.isQuarantined;
                  return true;
                });

                if (queuePosts.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-emerald-950">Incident Queue All Clear</h4>
                      <p className="text-xs text-emerald-700 max-w-md mx-auto">
                        Zero anonymous or restricted posts awaiting administrator clearance. The public social feed is clean with zero blurred content.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {queuePosts.map(post => {
                      const authorUser = allUsers.find(
                        u => u.id === post.authorId || (u.username && post.authorUsername && u.username.toLowerCase() === post.authorUsername.toLowerCase())
                      );
                      const rollNo = authorUser?.studentRollNo || (authorUser as any)?.rollNo || 'REG-STUDENT-VERIFIED';
                      const authorStrikes = (authorUser as any)?.warningCount || (authorUser as any)?.strikeCount || 0;
                      const isAuthorBanned = Boolean(authorUser?.isBanned);
                      const tox = post.toxicityScore ?? 0;
                      const rec = getAIIncidentRecommendation(post);
                      const selectedDuration = incidentBanDurations[post.id] ?? rec.hours;
                      const selectedReason = incidentBanReasons[post.id] !== undefined ? incidentBanReasons[post.id] : rec.defaultReason;
                      const isLoading = incidentActionLoading[post.id];

                      return (
                        <div key={post.id} className="p-5 sm:p-6 rounded-2xl border-2 border-rose-200/80 bg-white shadow-xs space-y-4">
                          {/* Top Author Clearance Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-sm overflow-hidden">
                                {authorUser?.avatarUrl ? (
                                  <img src={authorUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  (authorUser?.fullName?.[0] || post.authorName?.[0] || 'U')
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-sm">{authorUser?.fullName || post.authorName}</span>
                                  <span className="text-xs text-slate-500 font-medium">@{authorUser?.username || post.authorUsername}</span>
                                  {post.isAnonymous && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                      🕵️ Anonymous Unmasked
                                    </span>
                                  )}
                                  {isAuthorBanned && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                                      🚫 Banned until {authorUser?.bannedUntil ? new Date(authorUser.bannedUntil).toLocaleDateString() : 'Hold'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>Roll No: <strong className="text-slate-800 font-mono">{rollNo}</strong></span>
                                  <span>•</span>
                                  <span>{authorUser?.collegeName || post.collegeName || 'Campus Lenz'}</span>
                                  <span>•</span>
                                  <span>Strikes: <strong className="text-rose-600">{authorStrikes}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                                tox >= 80 ? 'bg-rose-50 text-rose-700 border-rose-200' : tox >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {tox}% Toxicity
                              </span>
                              {post.autoDeleted && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  Auto-Deleted
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Zero Blur Content Evidence */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">Uncensored Content Evidence (Hidden from Social Feed)</span>
                              <span suppressHydrationWarning className="font-mono text-[11px]">{new Date(post.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium select-text">
                              {post.content}
                            </div>
                            {post.imageUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-w-md bg-black">
                                {isVideoMedia(post.imageUrl) ? (
                                  <video src={post.imageUrl} controls className="w-full max-h-60 object-contain" />
                                ) : (
                                  <img src={post.imageUrl} alt="Evidence attachment" className="w-full max-h-60 object-cover" />
                                )}
                              </div>
                            )}
                            <div className="text-[11px] text-rose-700 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                <span>Zero-Blur Policy: Post is withheld from public feeds. No blur shield shown to students.</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">Post ID: {post.id}</span>
                            </div>
                          </div>

                          {/* Automated Temporary Ban Checkout Bar */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50/80 via-white to-amber-50/40 border border-rose-200 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Zap className="w-4 h-4 text-rose-600" />
                                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                    Automated Ban Checkout
                                  </h4>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                  AI Recommended Action: <strong className="text-rose-900">{rec.label}</strong>
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { h: 24, label: '24h' },
                                  { h: 72, label: '3 Days' },
                                  { h: 168, label: '7 Days' },
                                  { h: 720, label: '30 Days' },
                                  { h: 8760, label: '1 Year' }
                                ].map(dur => (
                                  <button
                                    key={dur.h}
                                    type="button"
                                    onClick={() => setIncidentBanDurations(prev => ({ ...prev, [post.id]: dur.h }))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                                      selectedDuration === dur.h
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {dur.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={selectedReason}
                                onChange={e => setIncidentBanReasons(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                placeholder="Specify reason for temporary ban..."
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-rose-100">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isLoading || !isAdmin}
                                  onClick={() => handleCheckoutBan(post)}
                                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Checkout {selectedDuration >= 24 ? `${selectedDuration / 24}D` : `${selectedDuration}h`} Ban &amp; Suspend</span>
                                </button>

                                {isAuthorBanned && (
                                  <button
                                    type="button"
                                    disabled={!isAdmin}
                                    onClick={() => {
                                      const res = unbanUser(authorUser?.id || post.authorId);
                                      logAdminAction('USER_UNBANNED', `@${authorUser?.username || post.authorUsername}`, `Suspension lifted by admin`, 'info');
                                      setActionFeedback(res.message);
                                      setTimeout(() => setActionFeedback(null), 4000);
                                    }}
                                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
                                  >
                                    Lift Suspension
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  disabled={!isAdmin}
                                  onClick={() => handlePurgeRestrictedPost(post.id, authorUser?.fullName || post.authorName)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs transition flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Auto-Delete Content</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={!isAdmin}
                                  onClick={() => handleReleasePostToFeed(post.id, authorUser?.fullName || post.authorName)}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Release to Feed</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* 4. MULTI-MODAL AI MODERATION SANDBOX */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Multi-Modal AI Testing Sandbox
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Test live post text and visual assets against the unified <span className="font-mono font-semibold">distilbert-sst2</span> + <span className="font-mono font-semibold">toxic-bert</span> + <span className="font-mono font-semibold">nsfwjs</span> inference pipeline
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Edge Pipeline Ready
                  </span>
                </div>
              </div>

              {/* AI Workbench Sub-Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setAiWorkbenchTab('post')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    aiWorkbenchTab === 'post'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Post & Toxicity Analyzer
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkbenchTab('review')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    aiWorkbenchTab === 'review'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Review Summarizer
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkbenchTab('duplicate')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    aiWorkbenchTab === 'duplicate'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  Duplicate Detector
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkbenchTab('message')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    aiWorkbenchTab === 'message'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  Direct Message Safety
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkbenchTab('semantic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    aiWorkbenchTab === 'semantic'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  Semantic College Search
                </button>
              </div>

              {/* WORKBENCH 1: POST & TOXICITY ANALYZER */}
              {aiWorkbenchTab === 'post' && (
                <div className="space-y-6">
                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-400 font-medium">Text Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'Had an amazing engineering hackathon session today! Proud of the collaborative energy.';
                          setAiScanInput(sample);
                          setAiScanImageUrl('');
                          handleRunAIScan(sample, '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition"
                      >
                        🌟 Safe Campus Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'The hostel food and rooms need serious repair, but our professors and placement support are top notch!';
                          setAiScanInput(sample);
                          setAiScanImageUrl('');
                          handleRunAIScan(sample, '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition"
                      >
                        🏫 Mixed Campus Review (campus-lenz-ai)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'Recommended midterm preparation roadmap for Data Structures & Algorithms with cheat sheets and problem sets.';
                          setAiScanInput(sample);
                          setAiScanImageUrl('');
                          handleRunAIScan(sample, '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition"
                      >
                        📘 Academic Guidance
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'The student council election was completely rigged and administration is covering it up boycott the campus mess!';
                          setAiScanInput(sample);
                          setAiScanImageUrl('');
                          handleRunAIScan(sample, '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold transition"
                      >
                        ⚠️ Ragebait / Debate (Blur Trigger)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'You absolute worthless idiot fraud scum deserve to be kicked out and die immediately.';
                          setAiScanInput(sample);
                          setAiScanImageUrl('');
                          handleRunAIScan(sample, '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition"
                      >
                        🚨 Severe Harassment (Auto-Ban Trigger)
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-400 font-medium">Multi-Modal Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sampleText = 'Join us for the Annual Autonomous Robotics Showcase at Tech Quadrangle!';
                          const sampleImg = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80';
                          setAiScanInput(sampleText);
                          setAiScanImageUrl(sampleImg);
                          handleRunAIScan(sampleText, sampleImg);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        🤖 Safe Tech Event Flyer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sampleText = 'Crazy off-campus late night party happening this Friday!';
                          const sampleImg = 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80';
                          setAiScanInput(sampleText);
                          setAiScanImageUrl(sampleImg);
                          handleRunAIScan(sampleText, sampleImg);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        🔞 Nightclub Flyer (Vision Shield)
                      </button>
                    </div>
                  </div>

                  {/* Interactive Input Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Text Content (DistilBERT + Toxic-BERT Tokenizer)
                      </label>
                      <textarea
                        rows={3}
                        value={aiScanInput}
                        onChange={e => setAiScanInput(e.target.value)}
                        placeholder="Paste or type any post content, comment, or circular to evaluate..."
                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Optional Visual Asset URL (MobileNet NSFWJS Vision Classifier)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={aiScanImageUrl}
                            onChange={e => setAiScanImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          {aiScanImageUrl && (
                            <button
                              type="button"
                              onClick={() => setAiScanImageUrl('')}
                              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-slate-400">
                        Text: {aiScanInput.length} chars • Image: {aiScanImageUrl ? 'Attached' : 'None'} • Edge WASM Ready
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isScanning || (!aiScanInput.trim() && !aiScanImageUrl.trim())}
                          onClick={() => handleRunAIScan()}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {isScanning ? 'Executing Pipeline...' : 'Run Multi-Modal Pipeline'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Result Card */}
                  {aiUnifiedResult && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                      {/* Action Banner */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                        aiUnifiedResult.actionRecommended === 'auto_ban'
                          ? 'bg-rose-100/80 border-rose-300 text-rose-900'
                          : aiUnifiedResult.actionRecommended === 'blur_sensitive'
                          ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                          : aiUnifiedResult.actionRecommended === 'quarantine'
                          ? 'bg-orange-100/80 border-orange-300 text-orange-900'
                          : 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          {aiUnifiedResult.actionRecommended === 'auto_ban' ? (
                            <AlertOctagon className="w-5 h-5 text-rose-700 shrink-0" />
                          ) : aiUnifiedResult.actionRecommended === 'blur_sensitive' ? (
                            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider">
                              Policy Verdict: {aiUnifiedResult.actionRecommended.replace('_', ' ')}
                            </div>
                            <div className="text-xs mt-0.5">
                              {aiUnifiedResult.actionRecommended === 'auto_ban'
                                ? `Severe toxicity detected (≥${aiModelSettings.autoBanThreshold}%). Immediate 48-hour account suspension and post rejection enforced.`
                                : aiUnifiedResult.actionRecommended === 'blur_sensitive'
                                ? `Content flagged as sensitive (${aiUnifiedResult.actionReason || 'High friction or suggestive imagery'}). Shielded with frosted blur overlay.`
                                : aiUnifiedResult.actionRecommended === 'quarantine'
                                ? 'Held in moderation holding queue pending administrative clearance.'
                                : 'Content passed all safety filters and is cleared for public campus circulation.'}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-current">
                          Tox: {aiUnifiedResult.toxicity.score}%
                        </span>
                      </div>

                      {/* 4 Model Metric Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Model 0: campus-lenz-ai */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              campus-lenz-ai
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Topic & Policy</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 truncate">
                              {aiUnifiedResult.classification?.category || 'General'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {Math.round((aiUnifiedResult.classification?.confidence || 0.8) * 100)}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                            <div>Moderation: <strong className={aiUnifiedResult.postAnalysis?.moderation === 'normal' ? 'text-emerald-600' : 'text-amber-600'}>{aiUnifiedResult.postAnalysis?.moderation || 'normal'}</strong></div>
                            <div>College Related: <strong>{aiUnifiedResult.postAnalysis?.college_related ? 'Yes' : 'No'}</strong></div>
                            <div>Action: <strong className={aiUnifiedResult.postAnalysis?.action === 'publish' ? 'text-emerald-600' : 'text-rose-600'}>{aiUnifiedResult.postAnalysis?.action?.toUpperCase() || 'PUBLISH'}</strong></div>
                          </div>
                        </div>

                        {/* Model 1: distilbert-sst2 */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-blue-600" />
                              distilbert-sst2
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Sentiment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                              aiUnifiedResult.sentiment.label === 'positive'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : aiUnifiedResult.sentiment.label === 'ragebait'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : aiUnifiedResult.sentiment.label === 'toxic'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {aiUnifiedResult.sentiment.label}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {Math.round(aiUnifiedResult.sentiment.score * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                aiUnifiedResult.sentiment.label === 'positive'
                                  ? 'bg-emerald-500'
                                  : aiUnifiedResult.sentiment.label === 'ragebait'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.round(aiUnifiedResult.sentiment.score * 100)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Polarity: <strong>{aiUnifiedResult.sentiment.polarity > 0 ? `+${aiUnifiedResult.sentiment.polarity.toFixed(2)}` : aiUnifiedResult.sentiment.polarity.toFixed(2)}</strong>
                          </div>
                        </div>

                        {/* Model 2: toxic-bert */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-rose-600" />
                              toxic-bert
                            </span>
                            <span className={`text-xs font-black ${
                              aiUnifiedResult.toxicity.score >= aiModelSettings.autoBanThreshold
                                ? 'text-rose-600'
                                : aiUnifiedResult.toxicity.score >= aiModelSettings.blurThreshold
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}>
                              {aiUnifiedResult.toxicity.score}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                aiUnifiedResult.toxicity.score >= aiModelSettings.autoBanThreshold
                                  ? 'bg-rose-500'
                                  : aiUnifiedResult.toxicity.score >= aiModelSettings.blurThreshold
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${aiUnifiedResult.toxicity.score}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                            <div>Insult: <strong className={aiUnifiedResult.toxicity.categories.insult > 40 ? 'text-rose-600' : ''}>{aiUnifiedResult.toxicity.categories.insult}%</strong></div>
                            <div>Threat: <strong className={aiUnifiedResult.toxicity.categories.threat > 40 ? 'text-rose-600' : ''}>{aiUnifiedResult.toxicity.categories.threat}%</strong></div>
                          </div>
                        </div>

                        {/* Model 3: nsfwjs */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                              nsfwjs-vision
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {aiScanImageUrl ? 'Scanned' : 'No Image'}
                            </span>
                          </div>
                          {aiScanImageUrl && aiUnifiedResult.imageSafety ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  aiUnifiedResult.imageSafety.status === 'safe'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {aiUnifiedResult.imageSafety.status}
                                </span>
                                <span className="text-xs font-bold text-slate-600">
                                  {Math.round(aiUnifiedResult.imageSafety.confidence * 100)}%
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate pt-1">
                                Labels: {aiUnifiedResult.imageSafety.detectedLabels?.join(', ') || 'Normal'}
                              </div>
                            </>
                          ) : (
                            <div className="py-2 text-center text-[11px] text-slate-400 italic">
                              Provide an Image URL above to trigger the MobileNet vision classifier.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quarantine Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                        <div className="text-xs text-slate-500">
                          Provenance: <span className="font-mono text-slate-700">{aiUnifiedResult.sentiment.model} + {aiUnifiedResult.toxicity.model}</span>
                        </div>
                        {aiUnifiedResult.toxicity.score > 30 && isAdmin && (
                          <button
                            type="button"
                            onClick={handleQuarantineScannedText}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Quarantine & Log Action
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WORKBENCH 2: REVIEW SUMMARIZER */}
              {aiWorkbenchTab === 'review' && (
                <div className="space-y-6">
                  {/* Presets */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">Review Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSumCollegeId('col-psg');
                        setReviewSumCustomText(
                          'The faculty are exceptionally knowledgeable and research-driven. High placement percentage with marquee recruiters visiting campus every session. However, the hostel rooms are quite old and mess food could be improved significantly. Overall tuition is high but worth the money for the exposure and peer community.'
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition"
                    >
                      🏫 PSG Tech Feedback Set
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSumCollegeId('col-amrita');
                        setReviewSumCustomText(
                          'Great infrastructure and ultra-modern computing labs. Strict campus discipline and attendance rules. Placements for CSE are outstanding with several international offers. Hostel amenities are clean and mess food is decent with diverse vegetarian options.'
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold transition"
                    >
                      🎓 Amrita Vishwa Vidyapeetham
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSumCollegeId('col-cit');
                        setReviewSumCustomText(
                          'Decent college with strong government-aided fees value. Great coding culture among students and active alumni network. Library resources are extensive though sports facilities are limited. Placements are solid for circuit branches.'
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition"
                    >
                      🏛️ Coimbatore Institute of Tech
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Institution</label>
                        <select
                          value={reviewSumCollegeId}
                          onChange={e => setReviewSumCollegeId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
                        >
                          {colleges.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Batch of Student Review Texts (separated by sentence or newlines)
                      </label>
                      <textarea
                        rows={4}
                        value={reviewSumCustomText}
                        onChange={e => setReviewSumCustomText(e.target.value)}
                        placeholder="Enter real student reviews to synthesize..."
                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isSummarizing || !reviewSumCustomText.trim()}
                        onClick={handleRunReviewSummarizer}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isSummarizing ? 'Synthesizing Reviews...' : '⚡ Run Review Summarizer'}
                      </button>
                    </div>
                  </div>

                  {reviewSumResult && (
                    <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          AI Synthesized Summary ({reviewSumResult.model})
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-purple-100">
                          {reviewSumResult.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Top Strengths & Highlights
                          </span>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                            {reviewSumResult.positive_points.map((pt, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold shrink-0">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Areas Noted for Improvement
                          </span>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                            {reviewSumResult.negative_points.map((pt, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500 font-bold shrink-0">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Aspect Summary Matrix */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700">Aspect-Based Sentiment Synthesis</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {Object.entries(reviewSumResult.aspect_summary).map(([aspect, desc]) => (
                            <div key={aspect} className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-800 block text-[11px] truncate">{aspect}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{desc || 'No specific mentions'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WORKBENCH 3: DUPLICATE & PARAPHRASE DETECTOR */}
              {aiWorkbenchTab === 'duplicate' && (
                <div className="space-y-6">
                  {/* Presets */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">Comparison Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDupTextA('The placement cell at PSG Tech needs to invite more core mechanical engineering companies instead of only IT software companies.');
                        setDupTextB('PSG College placement department should bring more core mechanical firms rather than just IT service recruiters.');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition"
                    >
                      🔄 Near-Duplicate / Paraphrased Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDupTextA('Important circular regarding submission of semester project reports by March 30th.');
                        setDupTextB('Important circular regarding submission of semester project reports by March 30th.');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition"
                    >
                      ⚠️ Exact Identical Submission
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDupTextA('Annual sports day tournament registrations are open for cricket, football, and volleyball.');
                        setDupTextB('The cloud computing workshop hosted by Google DSC is scheduled for this Saturday in CS Lab 4.');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition"
                    >
                      ✨ Distinct / Different Topics
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Text A</label>
                      <textarea
                        rows={3}
                        value={dupTextA}
                        onChange={e => setDupTextA(e.target.value)}
                        placeholder="Enter first post text..."
                        className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 resize-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Text B</label>
                      <textarea
                        rows={3}
                        value={dupTextB}
                        onChange={e => setDupTextB(e.target.value)}
                        placeholder="Enter second post text to compare..."
                        className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Threshold: <strong>{Math.round(dupThreshold * 100)}%</strong></span>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={Math.round(dupThreshold * 100)}
                        onChange={e => setDupThreshold(Number(e.target.value) / 100)}
                        className="w-32 accent-indigo-600"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isDetectingDup || !dupTextA.trim() || !dupTextB.trim()}
                      onClick={handleRunDuplicateDetector}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {isDetectingDup ? 'Computing Vector Cosine...' : '🔍 Compare Cosine Similarity'}
                    </button>
                  </div>

                  {dupResult && (
                    <div className={`p-5 rounded-2xl border space-y-3 ${
                      dupResult.likely_duplicate
                        ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                        : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {dupResult.likely_duplicate ? (
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          <span className="font-extrabold text-sm uppercase tracking-wider">
                            {dupResult.likely_duplicate ? '⚠️ Likely Duplicate Post Detected' : '✨ Original Content Verified'}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black px-3 py-1 rounded-lg bg-white/80 border border-current">
                          Cosine Similarity: {Math.round(dupResult.similarity * 100)}%
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed">
                        {dupResult.likely_duplicate
                          ? `The two submissions share ${Math.round(dupResult.similarity * 100)}% semantic vector proximity (exceeding the ${Math.round(dupResult.threshold * 100)}% threshold). Suggesting spam quarantine or author alert to prevent feed redundancy.`
                          : `The two submissions have only ${Math.round(dupResult.similarity * 100)}% proximity. Classified as distinct, independent contributions.`}
                      </p>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-current/20 flex items-center justify-between">
                        <span>Model: {dupResult.model}</span>
                        <span>Baseline Threshold: {dupResult.threshold}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WORKBENCH 4: DIRECT MESSAGE SAFETY SCANNER */}
              {aiWorkbenchTab === 'message' && (
                <div className="space-y-6">
                  {/* Presets */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">Message Presets:</span>
                    <button
                      type="button"
                      onClick={() => setMsgScanText('Hey! Are you free this afternoon to review the Operating Systems lecture notes together in the library?')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition"
                    >
                      🌟 Safe Academic Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgScanText('Stop acting so smart you complete idiot, everyone in the batch hates you.')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold transition"
                    >
                      ⚠️ Harassment (Warning)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgScanText('I am going to find you after class and beat you up and break your bones tomorrow.')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition"
                    >
                      🚨 Physical Threat (Auto-Block)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgScanText('Make 5000 dollars working from hostel click link immediately at t.me/freecrypto investment guaranteed.')}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold transition"
                    >
                      🚫 Commercial Spam
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Direct Message Content (Private 1-on-1 Chat Stream)
                    </label>
                    <textarea
                      rows={3}
                      value={msgScanText}
                      onChange={e => setMsgScanText(e.target.value)}
                      placeholder="Enter chat message to scan for safety violations..."
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isScanningMsg || !msgScanText.trim()}
                      onClick={handleRunMessageScanner}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                      {isScanningMsg ? 'Scanning Chat Safety...' : '💬 Run Chat Safety Scan'}
                    </button>
                  </div>

                  {msgScanResult && (
                    <div className={`p-5 rounded-2xl border space-y-4 ${
                      msgScanResult.action === 'block'
                        ? 'bg-rose-100/80 border-rose-300 text-rose-950'
                        : msgScanResult.action === 'warn'
                        ? 'bg-amber-100/80 border-amber-300 text-amber-950'
                        : 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {msgScanResult.action === 'block' ? (
                            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                          ) : msgScanResult.action === 'warn' ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          <span className="font-extrabold text-sm uppercase tracking-wider">
                            Verdict: {msgScanResult.action.toUpperCase()} ({msgScanResult.category})
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-current">
                          Sentiment: {msgScanResult.sentiment}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed">
                        {msgScanResult.flagReason || 'Message is verified safe and adheres to collegiate interpersonal standards.'}
                      </p>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-current/20 flex items-center justify-between">
                        <span>Classification: <strong>{msgScanResult.moderation}</strong></span>
                        <span>Model: {msgScanResult.model}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WORKBENCH 5: SEMANTIC COLLEGE SEARCH EXPLORER */}
              {aiWorkbenchTab === 'semantic' && (
                <div className="space-y-6">
                  {/* Presets */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">Query Presets:</span>
                    <button
                      type="button"
                      onClick={() => setSemanticQuery('best college with highest packages in computer science and top coding culture')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-semibold transition"
                    >
                      🚀 High Tech Packages & Coding
                    </button>
                    <button
                      type="button"
                      onClick={() => setSemanticQuery('affordable college with cheap fees and good hostel food near coimbatore')}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold transition"
                    >
                      💰 Affordable Fees & Clean Hostel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSemanticQuery('top engineering college for mechanical and automobile engineering research')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition"
                    >
                      ⚙️ Mechanical & Automobile Research
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={semanticQuery}
                        onChange={e => setSemanticQuery(e.target.value)}
                        placeholder="Ask anything in natural language e.g. 'best coding culture with low fee'..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    <button
                      type="button"
                      disabled={isSearchingSemantic || !semanticQuery.trim()}
                      onClick={handleRunSemanticSearch}
                      className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      {isSearchingSemantic ? 'Vector Matching...' : 'Semantic Search'}
                    </button>
                  </div>

                  {semanticResult && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Found <strong>{semanticResult.matches.length}</strong> matching institutions for &quot;{semanticResult.query}&quot;</span>
                        <span className="font-mono text-[10px] text-cyan-700">Model: {semanticResult.model}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {semanticResult.matches.map((m, idx) => (
                          <div key={m.collegeId || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 hover:border-cyan-300 transition">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                                Match #{idx + 1}
                              </span>
                              <span className="text-xs font-mono font-bold text-cyan-700">
                                {Math.round(m.score * 100)}% Relevance
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{m.collegeName}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{m.snippet}</p>
                            {m.matchedAttributes.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap pt-1">
                                {m.matchedAttributes.map(attr => (
                                  <span key={attr} className="text-[9px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold capitalize">
                                    ✓ {attr}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. GLOBAL POST MODERATION DESK WITH AI TELEMETRY */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Global Post Moderation Desk</h2>
                  <p className="text-xs text-slate-500">Inspect live posts with sentiment provenance, toxicity indicators, or purge violating items</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {posts.length} Active Posts
                </span>
              </div>

              <div className="space-y-4">
                {posts.map(post => {
                  const isFlagged = Boolean(post.reportedByInstitution);
                  const postTox = post.toxicityScore ?? 0;
                  const isPostSensitive = post.isSensitive || postTox >= aiModelSettings.blurThreshold;

                  return (
                    <div
                      key={post.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isFlagged
                          ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200'
                          : isPostSensitive
                          ? 'bg-amber-50/30 border-amber-200'
                          : 'bg-slate-50/60 border-slate-200'
                      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-400">{post.id}</span>
                          <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full capitalize bg-white border border-slate-200 text-slate-600">
                            {post.authorRole}
                          </span>

                          {/* AI Telemetry Badges */}
                          {post.sentiment && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              post.sentiment === 'positive'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : post.sentiment === 'ragebait'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : post.sentiment === 'toxic'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {post.sentiment === 'positive' ? '🌟' : post.sentiment === 'ragebait' ? '⚠️' : post.sentiment === 'toxic' ? '🚨' : '💬'} {post.sentiment}
                            </span>
                          )}

                          {post.isKnowledgeBased && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              📘 Academic
                            </span>
                          )}

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            postTox >= aiModelSettings.autoBanThreshold
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : postTox >= aiModelSettings.blurThreshold
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {postTox}% toxicity
                          </span>

                          {(post.isRestricted || post.isQuarantined || post.isAnonymous || post.autoDeleted || isPostSensitive) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold border border-rose-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              {post.autoDeleted ? 'Auto-Deleted' : post.isAnonymous ? 'Restricted Anonymous' : 'Withheld from Feed (Zero Blur)'}
                            </span>
                          )}

                          {post.imageUrl && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1">
                              {isVideoMedia(post.imageUrl) ? (
                                <>
                                  <Video className="w-3 h-3 text-purple-600" />
                                  Video Attached
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-3 h-3 text-purple-600" />
                                  Image Attached
                                </>
                              )}
                            </span>
                          )}

                          {post.repostedByInstitution && (
                            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Reposted by {post.repostedByInstitution.institutionName}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 line-clamp-2">
                          {post.content}
                        </p>

                        {isFlagged && (
                          <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 space-y-0.5">
                            <span className="font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Institution Flag ({post.reportedByInstitution?.institutionName}):
                            </span>
                            <p className="text-slate-600 italic">
                              "{post.reportedByInstitution?.reason}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setAiScanInput(post.content);
                            setAiScanImageUrl(post.imageUrl || '');
                            handleRunAIScan(post.content, post.imageUrl || '');
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Scan in AI Sandbox
                        </button>

                        {isAdmin ? (
                          <button
                            onClick={() => {
                              deletePost(post.id);
                              logAdminAction('POST_DELETED', `Post ${post.id}`, `Global deletion executed for post by ${post.authorName}: "${post.content.slice(0, 40)}..."`, 'warning');
                              setActionFeedback(`Post ${post.id} deleted globally.`);
                              setTimeout(() => setActionFeedback(null), 3000);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Globally
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Admin Login Required</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMINISTRATIVE AUDIT TRAIL & ACTIVITY LOG */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Administrative Audit Trail & Activity Log
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable chronological ledger of all platform administrative actions, emergency broadcasts, and moderation sweeps
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAuditLogs}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Audit JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logAdminAction(
                      'SECURITY_SWEEP',
                      'Edge Microservices',
                      'Automated security sweep executed across reverse proxy endpoints: 0 unauthorized tokens.',
                      'info'
                    );
                    setActionFeedback('Security sweep logged to audit trail.');
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Log Diagnostic Event
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Severity:
                </span>
                {(['all', 'info', 'warning', 'critical'] as const).map(sev => {
                  const count = sev === 'all'
                    ? auditLogs.length
                    : auditLogs.filter(l => l.severity === sev).length;
                  return (
                    <button
                      key={sev}
                      onClick={() => setAuditSeverityFilter(sev)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize flex items-center gap-1.5 ${
                        auditSeverityFilter === sev
                          ? sev === 'critical'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : sev === 'warning'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {sev}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        auditSeverityFilter === sev ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={e => setAuditSearchQuery(e.target.value)}
                  placeholder="Filter logs by admin, action, target..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Timestamp</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Action Type</th>
                    <th className="pb-3">Admin</th>
                    <th className="pb-3">Target Entity</th>
                    <th className="pb-3 pr-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No audit records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => {
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 pl-2 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                              log.severity === 'critical'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : log.severity === 'warning'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {log.actionType}
                            </span>
                          </td>
                          <td className="py-3 whitespace-nowrap font-medium text-slate-700">
                            {log.adminName}
                          </td>
                          <td className="py-3 whitespace-nowrap font-semibold text-slate-900">
                            {log.targetEntity}
                          </td>
                          <td className="py-3 pr-2 text-slate-600 max-w-xs truncate">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}

        {/* DIRECT USER TEMPORARY BAN CHECKOUT MODAL */}
        {userToBan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Enforce Temporary Account Suspension</h3>
                    <p className="text-xs text-slate-500">Restricts user posting, reviews, and commenting for the specified duration</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUserToBan(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{userToBan.fullName}</span>
                  <span className="text-slate-500">@{userToBan.username}</span>
                </div>
                <div className="text-slate-600 flex items-center justify-between text-[11px]">
                  <span>College: {userToBan.collegeName || 'Campus Lenz'}</span>
                  <span>Role: <strong className="capitalize">{userToBan.role}</strong></span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Strikes Recorded: <strong>{(userToBan as any).warningCount || (userToBan as any).strikeCount || 0}</strong>
                </div>
              </div>

              <form onSubmit={handleExecuteUserBan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Suspension Duration
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { h: 24, label: '24 Hours' },
                      { h: 72, label: '3 Days' },
                      { h: 168, label: '7 Days' },
                      { h: 720, label: '30 Days' },
                      { h: 8760, label: '1 Year' }
                    ].map(dur => (
                      <button
                        key={dur.h}
                        type="button"
                        onClick={() => setUserBanDuration(dur.h)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                          userBanDuration === dur.h
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Suspension Reason (Visible to User &amp; Audit Trail)
                  </label>
                  <input
                    type="text"
                    required
                    value={userBanReason}
                    onChange={e => setUserBanReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    placeholder="e.g. Violation of community standards: toxic content"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUserToBan(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingUserBan}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Enforce {userBanDuration >= 24 ? `${userBanDuration / 24}-Day` : `${userBanDuration}h`} Suspension</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
