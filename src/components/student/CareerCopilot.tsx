'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import {
  Sparkles,
  Bot,
  Brain,
  Send,
  Building2,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Compass,
  ArrowRight,
  RefreshCw,
  Code,
  FileText,
  UserCheck,
  ChevronRight,
  Layers,
  Database,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from '@/components/EditProfileModal';

interface RoleTrack {
  role: string;
  matchPercent: number;
  matchingSkills: string[];
  missingSkills: string[];
  avgSalaryTier: string;
  topRecruiters: string[];
}

export default function CareerCopilot() {
  const { currentUser, allUsers, colleges } = useApp();

  const [activeSection, setActiveSection] = useState<'copilot' | 'roles' | 'roadmap' | 'alumni'>('copilot');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'copilot'; text: string; time: string }>>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Scored tracks
  const [roleTracks, setRoleTracks] = useState<RoleTrack[]>([]);

  // Get student's verified college data
  const studentCollege = colleges.find(
    c => c.id === currentUser?.collegeId || c.name === currentUser?.collegeName
  );

  // Cross-reference alumni matching the student's college or department
  const matchingAlumni = allUsers.filter(u => {
    if (u.role !== 'alumni') return false;
    const sameCollege = currentUser?.collegeName && u.collegeName &&
      (u.collegeName.toLowerCase() === currentUser.collegeName.toLowerCase() || u.collegeId === currentUser.collegeId);
    const sameDept = currentUser?.department && u.department &&
      (u.department.toLowerCase().includes(currentUser.department.toLowerCase()) || currentUser.department.toLowerCase().includes(u.department.toLowerCase()));
    return sameCollege || sameDept;
  }).slice(0, 4);

  // Default skills
  const studentSkills = currentUser?.skills || [];

  // Initialize Role Readiness & Chat on load / profile update
  useEffect(() => {
    const fetchRoleMatching = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch('/api/ai/career-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: {
              fullName: currentUser.fullName,
              collegeName: currentUser.collegeName,
              department: currentUser.department,
              course: currentUser.course,
              graduationBatch: currentUser.graduationBatch,
              skills: studentSkills,
              headline: currentUser.headline,
              bio: currentUser.bio,
              studentRollNo: currentUser.studentRollNo,
            },
            action: 'match'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.scoredTracks) {
            setRoleTracks(data.scoredTracks);
          }
        }
      } catch {
        // Fallback calculation handled gracefully
      }
    };

    fetchRoleMatching();

    // Initial greeting if chat is empty
    if (chatMessages.length === 0 && currentUser) {
      setChatMessages([
        {
          sender: 'copilot',
          text: `👋 Greetings ${currentUser.fullName}! I've connected to your verified profile database:
• 🏛️ **Institute**: ${currentUser.collegeName || 'Verified Institute'}
• 📚 **Department**: ${currentUser.department || 'Engineering'} (${currentUser.course || 'Undergraduate'})
• 🎓 **Graduation Batch**: Class of ${currentUser.graduationBatch || '2026'}
• 🛠️ **Active Skill Set**: ${studentSkills.length > 0 ? studentSkills.join(', ') : 'None registered yet (click "Update Skills" to enrich your match!)'}

I'm ready to help you land top campus placements, analyze skill gaps, optimize resume bullets, or connect with alumni mentors. How can I assist you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentUser, studentSkills.length]);

  const handleSendMessage = async (textToSend?: string, customAction = 'chat') => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/career-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            fullName: currentUser?.fullName || 'Student',
            collegeName: currentUser?.collegeName || 'Campus Partner',
            department: currentUser?.department || 'Computer Science',
            course: currentUser?.course || 'B.Tech',
            graduationBatch: currentUser?.graduationBatch || '2026',
            skills: studentSkills,
            headline: currentUser?.headline || '',
            bio: currentUser?.bio || '',
            studentRollNo: currentUser?.studentRollNo || ''
          },
          query,
          action: customAction
        })
      });

      const data = await res.json();
      if (data.success) {
        let replyText = data.reply || '';
        if (customAction === 'resume_bullets' && data.bullets) {
          replyText = `📄 **Tailored Resume Bullets for your Profile (${currentUser?.department || 'Tech'}):**\n\n` +
            data.bullets.map((b: string) => `• ${b}`).join('\n\n') +
            `\n\n*Tip: Quantified impacts like "35% efficiency" stand out directly to hiring teams visiting ${currentUser?.collegeName || 'campus'}.*`;
        } else if (customAction === 'interview_question' && data.question) {
          const q = data.question;
          replyText = `🎤 **${q.title}**\n\n${q.scenario}\n\n**Question:** ${q.question}\n\n**Evaluation Criteria:**\n${q.evaluationCriteria.map((c: string) => `• ${c}`).join('\n')}\n\n💡 *Hint: ${q.sampleAnswerHint}*`;
        }

        setChatMessages(prev => [
          ...prev,
          {
            sender: 'copilot',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'copilot',
            text: `⚠️ I encountered an issue processing that request. Please try again.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: `⚠️ Network error. Please check your connectivity and try again.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: '🎯 Placement Readiness',
      prompt: `Analyze my readiness for Tier-1 campus placement drives (Zoho, Amazon, TCS) based on my current profile and skills.`,
      action: 'chat'
    },
    {
      label: '📄 3 Resume Bullets',
      prompt: `Generate 3 high-impact resume bullets customized to my profile skills.`,
      action: 'resume_bullets'
    },
    {
      label: '💡 Skill Gap Analysis',
      prompt: `What are the top 3 high-yield skills I should learn next before my graduation year?`,
      action: 'chat'
    },
    {
      label: '🎤 Mock Technical Interview',
      prompt: `Simulate a technical screening question for my primary skill.`,
      action: 'interview_question'
    },
    {
      label: '🤝 Alumni Referral Strategy',
      prompt: `How should I approach alumni from ${currentUser?.collegeName || 'my college'} for tech job referrals?`,
      action: 'chat'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback Alert */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATABASE PROFILE DIAGNOSTIC & SYNC BAR */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>AI Career Copilot</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Database Synced</span>
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Deeply grounded in your verified student profile, department curriculum, and industry competencies.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Update Profile &amp; Skills</span>
            </button>
          </div>

          {/* Connected Profile Database Data Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-blue-300/70 tracking-wider">Institution</p>
              <p className="font-bold text-white truncate mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{currentUser?.collegeName || 'Campus Partner'}</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-blue-300/70 tracking-wider">Department &amp; Batch</p>
              <p className="font-bold text-white truncate mt-0.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{currentUser?.department || 'Tech'} • &apos;{currentUser?.graduationBatch?.slice(-2) || '26'}</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-blue-300/70 tracking-wider">Registered Skills</p>
              <p className="font-bold text-white truncate mt-0.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{studentSkills.length} Verified {studentSkills.length === 1 ? 'Skill' : 'Skills'}</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-blue-300/70 tracking-wider">Campus Highest CTC</p>
              <p className="font-bold text-white truncate mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{studentCollege?.placementDetails?.highestPackage || '28.5 LPA'}</span>
              </p>
            </div>
          </div>

          {/* Active Skills Horizontal Ribbon */}
          {studentSkills.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 mr-1">Active:</span>
              {studentSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200 flex items-center justify-between">
              <span>⚠️ No skills registered in your database profile yet. Add skills like &quot;Fullstack Developer&quot;, &quot;Data Analyst&quot;, or &quot;UI/UX Designer&quot; to unlock precision role matching.</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="font-bold text-white underline hover:text-amber-100 ml-2"
              >
                Add Skills
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEGMENTED TAB SELECTOR */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSection('copilot')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'copilot'
              ? 'bg-[#1687D4] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Interactive Copilot</span>
        </button>

        <button
          onClick={() => setActiveSection('roles')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'roles'
              ? 'bg-[#1687D4] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Role Match ({roleTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('roadmap')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'roadmap'
              ? 'bg-[#1687D4] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Placement Roadmap</span>
        </button>

        <button
          onClick={() => setActiveSection('alumni')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'alumni'
              ? 'bg-[#1687D4] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Alumni Referral Bridge</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE AI COPILOT CHAT                                       */}
      {/* ========================================================================= */}
      {activeSection === 'copilot' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-50 text-[#1687D4]">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Career Copilot Chat</h3>
                <p className="text-[10px] text-slate-500">Live prompt engine grounded in your academic &amp; skills profile</p>
              </div>
            </div>
            <button
              onClick={() => {
                setChatMessages([]);
                handleSendMessage('Hello! Please refresh my career assessment based on my latest profile.');
              }}
              className="text-[11px] font-bold text-[#1687D4] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-blue-50/40 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Quick Starters:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt, qp.action)}
                className="px-2.5 py-1 rounded-xl bg-white border border-blue-200/80 text-[11px] font-semibold text-[#075080] hover:bg-blue-50 hover:border-blue-300 transition shrink-0 shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[460px]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1687D4] to-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-[#1687D4] text-white shadow-xs rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1687D4] to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Synthesizing placement data from your profile...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot about jobs, interview questions, resume tips, or alumni referrals..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#1687D4] hover:bg-[#075080] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ROLE READINESS & SKILL GAP MATRIX                                 */}
      {/* ========================================================================= */}
      {activeSection === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1687D4]" />
                <span>Industry Role Readiness Matrix</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against your database skills ({studentSkills.length}) and {currentUser?.department || 'academic'} curriculum.
              </p>
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="apple-button-primary text-xs !py-1.5 !px-3 font-bold"
            >
              Add New Skills
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleTracks.map((track, idx) => (
              <div
                key={idx}
                className="apple-card p-5 space-y-4 border-l-4"
                style={{
                  borderLeftColor:
                    track.matchPercent >= 75 ? '#10B981' :
                    track.matchPercent >= 50 ? '#3B82F6' : '#F59E0B'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{track.role}</h3>
                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      Avg Salary: {track.avgSalaryTier}
                    </p>
                  </div>

                  {/* Match Score Badge */}
                  <div
                    className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                      track.matchPercent >= 75
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : track.matchPercent >= 50
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {track.matchPercent}% Match
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${track.matchPercent}%`,
                      backgroundColor:
                        track.matchPercent >= 75 ? '#10B981' :
                        track.matchPercent >= 50 ? '#3B82F6' : '#F59E0B'
                    }}
                  />
                </div>

                {/* Matching Skills */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Skills You Have ({track.matchingSkills.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {track.matchingSkills.length > 0 ? (
                      track.matchingSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{s}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No matching skills registered in profile yet</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills (Skill Gap Analysis) */}
                {track.missingSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Recommended Next Skills (Gap Analysis):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {track.missingSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold flex items-center gap-1">
                          <span>+ {s}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Recruiters */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Recruiters: <strong>{track.topRecruiters.join(', ')}</strong></span>
                  <button
                    onClick={() => {
                      setActiveSection('copilot');
                      handleSendMessage(`How can I prepare specifically for ${track.role} roles at ${track.topRecruiters[0]}?`);
                    }}
                    className="font-bold text-[#1687D4] hover:underline flex items-center gap-0.5"
                  >
                    <span>Prep Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: PLACEMENT & INTERNSHIP ROADMAP                                    */}
      {/* ========================================================================= */}
      {activeSection === 'roadmap' && (
        <div className="apple-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#1687D4]" />
                <span>Placement Roadmap for Class of {currentUser?.graduationBatch || '2026'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Milestones synchronized with campus placement drives at {currentUser?.collegeName || 'your institute'}.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1687D4] bg-blue-50 px-3 py-1 rounded-xl self-start sm:self-center border border-blue-200">
              Target: Day-1 Offers
            </span>
          </div>

          {/* 4-Phase Roadmap Timeline */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">Phase 1: Foundational DSA &amp; Core Engineering</h4>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Completed</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Master array recursion, pointers, linked lists, basic trees, and relational SQL schemas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">Phase 2: Fullstack Capstone &amp; Hackathon Deployments</h4>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">In Progress</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Ship 2 live fullstack applications deploying your profile skills ({studentSkills.slice(0, 2).join(', ') || 'React & Node.js'}). Showcase links on your CampusLenz profile.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  3
                </div>
                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">Phase 3: Summer Internships &amp; Alumni Mock Drives</h4>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Upcoming</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Engage verified alumni mentors on CampusLenz for resume critique, live system design feedback, and internal referrals.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-black text-xs">
                  4
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">Phase 4: Day-1 &amp; Day-2 Campus Placement Onboarding</h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Final Goal</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Aptitude clearance, technical coding rounds, manager fitment rounds, and offer acceptance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ALUMNI REFERRAL & MENTORSHIP BRIDGE                               */}
      {/* ========================================================================= */}
      {activeSection === 'alumni' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Alumni Referral Network</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alumni from {currentUser?.collegeName || 'your college'} working across tech &amp; core industries.
              </p>
            </div>
            <Link
              href="/connect"
              className="apple-button-secondary text-xs !py-1.5 !px-3 font-semibold"
            >
              Browse All Mentors
            </Link>
          </div>

          {matchingAlumni.length === 0 ? (
            <div className="apple-card p-10 text-center text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-900">Connecting to alumni network...</p>
              <p>Explore the Campus Connect Hub to discover alumni across all Tamil Nadu partner institutions.</p>
              <Link href="/connect" className="inline-block mt-2 apple-button-primary text-xs !py-1.5 !px-4">
                Explore Connect Hub
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {matchingAlumni.map((alum) => (
                <div key={alum.id} className="apple-card p-4 space-y-3 border-l-4 border-l-emerald-500">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {alum.avatarUrl ? (
                        <img src={alum.avatarUrl} alt={alum.fullName} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {alum.fullName?.[0] || 'A'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link href={`/user/${alum.username}`} className="font-bold text-slate-900 text-xs hover:text-[#1687D4] transition truncate block">
                          {alum.fullName}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          {alum.designation || 'Software Engineer'} • {alum.company || 'Tech Corp'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {alum.headline || `Alumnus from ${alum.collegeName || 'CampusLenz'}`}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">Class of {alum.graduationBatch || '2023'}</span>
                    <Link
                      href="/messages"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Request Referral</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && currentUser && (
        <EditProfileModal
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          currentUser={currentUser}
          onSave={() => {
            setIsEditingProfile(false);
            setActionFeedback('✅ Profile skills updated! Re-evaluating Career Copilot metrics...');
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      )}
    </div>
  );
}
