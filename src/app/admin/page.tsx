'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { UnifiedAIModerationResult } from '@/types';
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
  Bot,
  Shield,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface TerminalEntry {
  type: 'input' | 'output';
  text: string;
}

export default function AdminDeveloperPage() {
  const {
    currentUser,
    posts,
    deletePost,
    deleteComment,
    allUsers,
    deleteUser,
    unbanUser,
    colleges,
    grievanceReports,
    servers,
    executeAdminTerminalCommand,
    auditLogs,
    logAdminAction,
    runAIToxicityCheck,
    aiModelSettings,
    updateAIModelSettings,
    runOpenSourceAIModeration
  } = useApp();

  const [activeTab, setActiveTab] = useState<'terminal' | 'users' | 'moderation' | 'audit'>('terminal');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni' | 'faculty' | 'institution' | 'admin'>('all');

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

  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `campus-lenz-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

        {/* Warning if not currently logged in as admin */}
        {!isAdmin && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Administrative Verification Required
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              {currentUser ? (
                <>You are currently authenticated as <strong>{currentUser.fullName} ({currentUser.role})</strong>.</>
              ) : (
                <>You are currently browsing as a <strong>Guest Visitor</strong>.</>
              )}{' '}
              Developer terminal features and global post deletion authority are restricted to the <strong>Super Administrator</strong> role.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Sign In with Administrator Credentials <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

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
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">
              {posts.length}
            </span>
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                                <AlertTriangle className="w-3 h-3" />
                                Banned / Restricted
                              </span>
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
                                    Delete Account
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    3 / 3 Models Active (Local WASM)
                  </span>
                </div>
              </div>

              {/* Model Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Model 1: unitary/toxic-bert */}
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
                    <span>Quant: <strong>INT8</strong></span>
                  </div>
                </div>

                {/* Model 2: distilbert-sst2 */}
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
                    <span>Weights: <strong>268MB</strong></span>
                    <span>Acc: <strong>91.3%</strong></span>
                  </div>
                </div>

                {/* Model 3: nsfwjs-mobilenet-v2 */}
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
                      Client-side visual safety classification for suggestive, graphic, and policy-violating imagery.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Engine: <strong>TF.js WebGL</strong></span>
                    <span>Weights: <strong>16MB</strong></span>
                    <span>Classes: <strong>5 Labels</strong></span>
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

                {/* Feed Sensitive Blur Threshold */}
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-amber-900">
                        Feed Sensitive Blur Shield Threshold
                      </span>
                      <p className="text-[11px] text-amber-700/80">
                        Posts with toxicity &ge; this limit get covered with an Apple-style frosted blur overlay on the campus feed.
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

            {/* 3. MULTI-MODAL AI MODERATION SANDBOX */}
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
                            ? `Content flagged as sensitive (${aiUnifiedResult.actionReason || 'High friction or suggestive imagery'}). Shielded with Apple-style frosted blur overlay on feed.`
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

                  {/* 3 Model Metric Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {Math.round(aiUnifiedResult.sentiment.score * 100)}% Conf
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
                        Polarity Index: <strong>{aiUnifiedResult.sentiment.polarity > 0 ? `+${aiUnifiedResult.sentiment.polarity.toFixed(2)}` : aiUnifiedResult.sentiment.polarity.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Model 2: unitary/toxic-bert */}
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
                        <div>Ragebait: <strong className={aiUnifiedResult.toxicity.categories.ragebait > 40 ? 'text-amber-600' : ''}>{aiUnifiedResult.toxicity.categories.ragebait}%</strong></div>
                        <div>Toxicity: <strong className={aiUnifiedResult.toxicity.categories.toxicity > 40 ? 'text-rose-600' : ''}>{aiUnifiedResult.toxicity.categories.toxicity}%</strong></div>
                      </div>
                    </div>

                    {/* Model 3: nsfwjs-mobilenet-v2 */}
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
                              Conf: {Math.round(aiUnifiedResult.imageSafety.confidence * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img src={aiScanImageUrl} alt="preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              Labels: {aiUnifiedResult.imageSafety.detectedLabels?.join(', ') || 'Normal'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-[11px] text-slate-400 italic">
                          Provide an Image URL above to trigger the MobileNet vision classifier.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sandbox Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                    <div className="text-xs text-slate-500">
                      Provenance: <span className="font-mono text-slate-700">{aiUnifiedResult.sentiment.model} + {aiUnifiedResult.toxicity.model}</span>
                    </div>

                    <div className="flex items-center gap-2">
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
                </div>
              )}
            </div>

            {/* 4. GLOBAL POST MODERATION DESK WITH AI TELEMETRY */}
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

                          {isPostSensitive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold border border-amber-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Shielded on Feed
                            </span>
                          )}

                          {post.imageUrl && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Image Attached
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

      </div>
    </div>
  );
}
