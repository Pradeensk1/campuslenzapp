'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Target,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Send,
  RefreshCw,
  Edit3,
  ExternalLink,
  Users,
  Compass,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentCareerProfile } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

const PRESET_ROLES = [
  'Software Development Engineer (SDE-1)',
  'Full-Stack Developer',
  'Frontend Engineer',
  'Backend & Systems Engineer',
  'AI / Machine Learning Engineer',
  'Data Scientist / Analyst',
  'Cloud & DevOps Engineer',
  'Mobile App Developer (Android/iOS)',
  'Cybersecurity Analyst',
  'Product / Technical Consultant'
];

const SUGGESTED_PROMPTS = [
  'Analyze my skill gap for my target role and outline what to learn next.',
  'Create a phased learning roadmap tailored to my graduation batch timeline.',
  'How do I prepare for tier-1 campus placement drives visiting my college?',
  'Recommend 2 impactful portfolio projects that showcase my current and learning skills.'
];

export default function CopilotClient() {
  const { currentUser, colleges, assignmentTasks, examMilestones, updateCareerProfile } = useApp();

  // Find student's college data for placement grounding
  const studentCollege = colleges.find(
    c => c.id === currentUser?.collegeId || c.name.toLowerCase() === currentUser?.collegeName?.toLowerCase()
  );

  const career: StudentCareerProfile = currentUser?.careerProfile || {
    targetRole: '',
    skills: [],
    currentLearning: [],
    completedLearning: []
  };

  // Profile Editor Modal / Drawer state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState(career.targetRole || '');
  const [skillsList, setSkillsList] = useState<string[]>(career.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [currentLearningList, setCurrentLearningList] = useState<string[]>(career.currentLearning || []);
  const [currentLearningInput, setCurrentLearningInput] = useState('');
  const [completedLearningList, setCompletedLearningList] = useState<string[]>(career.completedLearning || []);
  const [completedLearningInput, setCompletedLearningInput] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync editor fields if careerProfile changes
  useEffect(() => {
    if (currentUser?.careerProfile) {
      setTargetRoleInput(currentUser.careerProfile.targetRole || '');
      setSkillsList(currentUser.careerProfile.skills || []);
      setCurrentLearningList(currentUser.careerProfile.currentLearning || []);
      setCompletedLearningList(currentUser.careerProfile.completedLearning || []);
    }
  }, [currentUser?.careerProfile]);

  // Chat Conversation State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${currentUser?.fullName || 'Student'}! I am your **Campus Lenz Career Copilot**.\n\nI combine your academic profile, your skills, and **${studentCollege?.name || currentUser?.collegeName || 'your college'}**'s verified placement data to give you personalized, realistic career guidance and roadmaps.\n\nHow can I help accelerate your career preparation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveCareerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCareerProfile({
      targetRole: targetRoleInput.trim(),
      skills: skillsList,
      currentLearning: currentLearningList,
      completedLearning: completedLearningList
    });
    setSaveFeedback('Career profile saved!');
    setTimeout(() => {
      setSaveFeedback(null);
      setIsEditingProfile(false);
    }, 1500);
  };

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (val && !skillsList.includes(val)) {
      setSkillsList(prev => [...prev, val]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddCurrentLearning = () => {
    const val = currentLearningInput.trim();
    if (val && !currentLearningList.includes(val)) {
      setCurrentLearningList(prev => [...prev, val]);
      setCurrentLearningInput('');
    }
  };

  const handleRemoveCurrentLearning = (item: string) => {
    setCurrentLearningList(prev => prev.filter(i => i !== item));
  };

  const handleAddCompletedLearning = () => {
    const val = completedLearningInput.trim();
    if (val && !completedLearningList.includes(val)) {
      setCompletedLearningList(prev => [...prev, val]);
      setCompletedLearningInput('');
    }
  };

  const handleRemoveCompletedLearning = (item: string) => {
    setCompletedLearningList(prev => prev.filter(i => i !== item));
  };

  // Send message to /api/copilot
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    setErrorMsg(null);
    setInputMessage('');

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload,
          studentContext: {
            fullName: currentUser?.fullName || 'Verified Campus Student',
            collegeName: currentUser?.collegeName || studentCollege?.name || 'College',
            collegeId: currentUser?.collegeId,
            department: currentUser?.department || 'Computer Science',
            course: currentUser?.course || 'Engineering',
            graduationBatch: currentUser?.graduationBatch || '2026',
            careerProfile: {
              targetRole: targetRoleInput.trim() || career.targetRole,
              skills: skillsList,
              currentLearning: currentLearningList,
              completedLearning: completedLearningList
            }
          },
          collegeContext: {
            name: studentCollege?.name,
            placementStats: studentCollege?.placementStats,
            placementDetails: studentCollege?.placementDetails,
            topRecruiters: studentCollege?.placementDetails?.topRecruiters || studentCollege?.placementStats?.topRecruiters || []
          },
          academicContext: {
            tasks: assignmentTasks.map(t => ({
              title: t.title,
              courseCode: t.courseCode,
              isCompleted: t.isCompleted,
              urgency: t.urgency
            })),
            milestones: examMilestones.map(m => ({
              examName: m.examName,
              courseCode: m.courseCode,
              remainingDays: m.remainingDays
            }))
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive a response from Career Copilot.');
      }

      const copilotMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, copilotMessage]);
    } catch (err: any) {
      console.error('Copilot send error:', err);
      setErrorMsg(err.message || 'Network error communicating with Career Copilot.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCareerProfileConfigured = Boolean(career.targetRole && career.skills && career.skills.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1687D4] to-[#0875BD] text-white shadow-[0_4px_12px_rgba(22,135,212,0.35)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#075080]">
              Career <span className="text-[#1687D4]">Copilot</span>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E8F5FF] text-[#0875BD] border border-[#CFEAFF]">
              Challenge 1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized career mentorship grounded in your profile, coursework, and {currentUser?.collegeName || 'campus'} placement intelligence.
          </p>
        </div>

        {/* Career Profile Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsEditingProfile(prev => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-[#1687D4] shadow-xs text-xs font-bold text-[#075080] transition group"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#1687D4] group-hover:scale-110 transition-transform" />
          <span>{isEditingProfile ? 'Close Career Setup' : 'Configure Career Profile'}</span>
        </button>
      </div>

      {/* Missing Information Notice Banner if Career Profile is not set */}
      {!isCareerProfileConfigured && !isEditingProfile && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Missing Target Role or Skills</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Career Copilot provides the sharpest analysis when your target role and current skills are configured.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs shrink-0"
          >
            Set Up Now →
          </button>
        </div>
      )}

      {/* STUDENT PASSPORT & CAREER SETUP (Expandable or Compact) */}
      <AnimatePresence>
        {isEditingProfile ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="apple-card p-5 sm:p-6 border-2 border-[#1687D4]/30 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1687D4]" />
                <h2 className="text-sm font-bold text-slate-900">Career Goals & Skills Configuration</h2>
              </div>
              {saveFeedback && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveFeedback}</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCareerProfile} className="space-y-4 text-xs">
              {/* Target Role */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Career / Role *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    placeholder="e.g. Software Development Engineer (SDE-1), Full-Stack Developer..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1687D4]/20"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold py-0.5">Quick picks:</span>
                    {PRESET_ROLES.slice(0, 5).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRoleInput(role)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                          targetRoleInput === role
                            ? 'bg-[#1687D4] text-white border-[#1687D4] font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#1687D4]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Skills Tag Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Skills ({skillsList.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter (e.g. Python, React, SQL, DSA)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1687D4]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {skillsList.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No skills added yet. Add skills to enable gap analysis.</span>
                  ) : (
                    skillsList.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* What the student is currently learning */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Currently Learning ({currentLearningList.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentLearningInput}
                    onChange={(e) => setCurrentLearningInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCurrentLearning();
                      }
                    }}
                    placeholder="Topics in progress (e.g. System Design, Docker, LeetCode Trees)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1687D4]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCurrentLearning}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {currentLearningList.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">Add topics you are actively studying.</span>
                  ) : (
                    currentLearningList.map(item => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCurrentLearning(item)}
                          className="text-blue-400 hover:text-rose-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Completed Learning / Milestones */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Completed Topics / Coursework Milestones ({completedLearningList.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={completedLearningInput}
                    onChange={(e) => setCompletedLearningInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompletedLearning();
                      }
                    }}
                    placeholder="Finished topics (e.g. Data Structures & Algorithms, DBMS, OOP)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1687D4]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompletedLearning}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {completedLearningList.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">Add topics you have already mastered or completed coursework for.</span>
                  ) : (
                    completedLearningList.map(item => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompletedLearning(item)}
                          className="text-emerald-400 hover:text-rose-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Career Profile</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* COMPACT PASSPORT BAR */
          <div className="apple-card p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Academic Profile */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1687D4]" />
                  <span>Academic Record</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900 truncate">
                  {currentUser?.fullName}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser?.course} • Batch of {currentUser?.graduationBatch}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.collegeName || 'PSG College of Technology'}
                </p>
              </div>

              {/* Target Goal & Current Skills */}
              <div className="space-y-1 md:pl-4 pt-3 md:pt-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Target className="w-3.5 h-3.5 text-[#0875BD]" />
                  <span>Target Role & Skills</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">
                    {career.targetRole || (
                      <span className="text-amber-600 italic">Target role not configured</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {career.skills && career.skills.length > 0 ? (
                    career.skills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No skills listed yet</span>
                  )}
                  {career.skills && career.skills.length > 4 && (
                    <span className="text-[9.5px] font-bold text-slate-400">+{career.skills.length - 4} more</span>
                  )}
                </div>
              </div>

              {/* Placement Intelligence Baseline */}
              <div className="space-y-1 md:pl-4 pt-3 md:pt-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Placement Grounding ({studentCollege?.name?.split(' ')[0] || 'Campus'})</span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Avg: <strong className="text-slate-900">{studentCollege?.placementDetails?.averagePackage || '8.8 LPA'}</strong>
                  {' • '}
                  High: <strong className="text-emerald-700">{studentCollege?.placementDetails?.highestPackage || '38.5 LPA'}</strong>
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {(studentCollege?.placementDetails?.topRecruiters || ['Microsoft', 'Amazon', 'Cisco', 'Zoho'])
                    .slice(0, 3)
                    .map((rec: string) => (
                      <span
                        key={rec}
                        className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                      >
                        {rec}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN COPILOT WORKSPACE (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CHAT STREAM (Cols 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Chat Container */}
          <div className="apple-card flex flex-col h-[600px] border border-slate-200 overflow-hidden shadow-sm">
            
            {/* Header bar */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white/70 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Career Copilot Live Session</span>
                <span className="text-[10px] text-slate-400">• Grounded in {currentUser?.collegeName || 'Campus'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'model',
                      text: `Conversation restarted. Ready to assist with roadmaps, skill gaps, or placement prep for **${career.targetRole || 'your target role'}**!`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="text-slate-400 hover:text-slate-700 text-[11px] font-semibold transition flex items-center gap-1"
                title="Restart chat"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FAFC]/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-[#1687D4] to-[#0875BD] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-white/80' : 'text-[#0875BD]'}`}>
                        {msg.role === 'user' ? 'You' : 'Career Copilot'}
                      </span>
                      <span className={`text-[9.5px] ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Formatted Markdown Content */}
                    <div className="whitespace-pre-line prose-xs">
                      {msg.text}
                    </div>

                    {msg.modelUsed && (
                      <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-400">
                        <span>Grounded by {msg.modelUsed}</span>
                        <span className="text-emerald-600 font-semibold">Campus Lenz Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 shadow-xs space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#0875BD]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing placement data & skill gap analysis...</span>
                    </div>
                    <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1687D4] to-[#0875BD] animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    onClick={() => setErrorMsg(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick 1-Click Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
                Suggested:
              </span>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#1687D4] hover:text-[#0875BD] transition disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                placeholder={
                  career.targetRole
                    ? `Ask anything about ${career.targetRole} roadmap, skill gaps, or campus interviews...`
                    : 'Ask for career guidance, roadmaps, or placement prep...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1687D4]/20"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="apple-button-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask Copilot</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: CAMPUS ECOSYSTEM SHORTCUTS & RESOURCES (Cols 9-12) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Ecosystem Actions */}
          <div className="apple-card p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1687D4]" />
              <span>Campus Lenz Recommended Actions</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Connect your career roadmap to verified campus opportunities:
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/connect?tab=community"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F5FF] border border-slate-200 hover:border-[#CFEAFF] flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#0875BD]">
                      Alumni Mentorship Slots
                    </div>
                    <div className="text-[10px] text-slate-500">Book 1:1 resume & interview prep</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0875BD] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/connect?tab=community"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F5FF] border border-slate-200 hover:border-[#CFEAFF] flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#0875BD]">
                      Alumni Job Referrals
                    </div>
                    <div className="text-[10px] text-slate-500">Tier-1 product referrals for your batch</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0875BD] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F5FF] border border-slate-200 hover:border-[#CFEAFF] flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#0875BD]">
                      Peer Study Rooms
                    </div>
                    <div className="text-[10px] text-slate-500">Blind 75 & LeetCode focus rooms</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0875BD] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Ethics & Placement Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              <span>Grounded Mentorship Framework</span>
            </div>
            <p className="leading-relaxed">
              Career Copilot uses verified historical campus benchmarks and your academic standing. Recommendations do not guarantee job offers, salary brackets, or interview selections. Always verify department guidelines with your college placement cell.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
