'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
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
  Sparkles
} from 'lucide-react';

interface TerminalEntry {
  type: 'input' | 'output';
  text: string;
}

export default function AdminDeveloperPage() {
  const {
    currentUser,
    loginAsRole,
    posts,
    deletePost,
    allUsers,
    colleges,
    grievanceReports,
    servers,
    executeAdminTerminalCommand
  } = useApp();

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

  const isAdmin = currentUser.role === 'admin';

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
              <button
                onClick={() => loginAsRole('admin', 'system_admin')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                Switch to Super Admin
              </button>
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
              All Role Portals
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
              You are currently authenticated as <strong>{currentUser.fullName} ({currentUser.role})</strong>.
              Developer terminal features and global post deletion authority are restricted to the <strong>Super Administrator</strong> role.
            </p>
            <button
              onClick={() => loginAsRole('admin', 'system_admin')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Log In as Administrator <ArrowRight className="w-3 h-3" />
            </button>
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

        {/* DEVELOPER OPTION: Interactive Admin Terminal CLI */}
        {isAdmin && (
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
                  DEVELOPER PRIVILEGES ONLY
                </span>
              </div>
            </div>

            {/* Terminal Screen / Log */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="p-5 font-mono text-xs sm:text-sm text-emerald-400 bg-slate-950 min-h-[300px] max-h-[460px] overflow-y-auto space-y-3 cursor-text selection:bg-emerald-800 selection:text-white"
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
            <form onSubmit={handleTerminalSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
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
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors"
              >
                Execute
              </button>
            </form>
          </div>
        )}

        {/* Global Content Management & Moderation List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Global Post Moderation Desk</h2>
              <p className="text-xs text-slate-500">Super Administrators can permanently delete posts or inspect false-information flags</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {posts.length} Active Posts
            </span>
          </div>

          <div className="space-y-4">
            {posts.map(post => {
              const isFlagged = Boolean(post.reportedByInstitution);
              return (
                <div
                  key={post.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isFlagged
                      ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200'
                      : 'bg-slate-50/60 border-slate-200'
                  } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">{post.id}</span>
                      <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full capitalize bg-white border border-slate-200 text-slate-600">
                        {post.authorRole}
                      </span>
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
                    {isAdmin ? (
                      <button
                        onClick={() => deletePost(post.id)}
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
    </div>
  );
}
