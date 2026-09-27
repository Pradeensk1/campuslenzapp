'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import {
  Timer,
  Users,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Tag,
  Code,
  Check,
  AlertTriangle,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Laptop,
  Compass,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentFeaturesHub() {
  const {
    currentUser,
    studyRooms,
    courseQuestions,
    addCourseQuestion,
    upvoteCourseQuestion,
    addCourseAnswer,
    marketplaceItems,
    addMarketplaceItem,
    reserveMarketplaceItem,
    assignmentTasks,
    addAssignmentTask,
    toggleAssignmentTask,
    deleteAssignmentTask,
    examMilestones
  } = useApp();

  const [activeTab, setActiveTab] = useState<'study' | 'qa' | 'marketplace' | 'tracker'>('study');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // 1. POMODORO FOCUS TIMER STATE
  // --------------------------------------------------------------------------
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [activeJoinedRoom, setActiveJoinedRoom] = useState<string | null>('study-1');
  const [focusNote, setFocusNote] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'work') {
        setActionFeedback('🎉 Focus session completed! Time for a 5-minute break.');
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        setActionFeedback('🔔 Break over! Ready to resume focus session?');
        setTimerMode('work');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  // --------------------------------------------------------------------------
  // 2. COURSE Q&A STATE
  // --------------------------------------------------------------------------
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQContent, setNewQContent] = useState('');
  const [newQCourse, setNewQCourse] = useState('CS301');
  const [newQCode, setNewQCode] = useState('');
  const [newQIsAnon, setNewQIsAnon] = useState(false);
  const [answeringQId, setAnsweringQId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState('');

  const filteredQuestions = courseQuestions.filter(q => {
    if (selectedCourseFilter === 'all') return true;
    return q.courseCode.toLowerCase() === selectedCourseFilter.toLowerCase();
  });

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    const authorName = newQIsAnon ? 'Anonymous Student' : currentUser?.fullName || 'Campus Student';
    const authorId = newQIsAnon ? 'anonymous' : currentUser?.id || 'anonymous';
    const res = addCourseQuestion({
      courseCode: newQCourse.trim().toUpperCase(),
      courseName: newQCourse === 'CS301' ? 'Data Structures & Algorithms' : 'Distributed Systems',
      title: newQTitle.trim(),
      content: newQContent.trim(),
      codeSnippet: newQCode.trim() || undefined,
      isAnonymous: newQIsAnon,
      authorId,
      authorName
    });
    setActionFeedback(res.message);
    setNewQTitle('');
    setNewQContent('');
    setNewQCode('');
    setIsAskingQuestion(false);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAnswerSubmit = (qId: string) => {
    if (!answerContent.trim()) return;
    const res = addCourseAnswer(qId, answerContent.trim());
    setActionFeedback(res.message);
    setAnswerContent('');
    setAnsweringQId(null);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // --------------------------------------------------------------------------
  // 3. MARKETPLACE STATE
  // --------------------------------------------------------------------------
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [isListingItem, setIsListingItem] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState<'textbook' | 'equipment' | 'electronics' | 'notes'>('textbook');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemCondition, setItemCondition] = useState<'like_new' | 'good' | 'fair'>('like_new');
  const [itemContact, setItemContact] = useState('');

  const filteredMarketplace = marketplaceItems.filter(item => {
    if (marketCategory === 'all') return true;
    return item.category === marketCategory;
  });

  const handleCreateMarketListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;
    const res = addMarketplaceItem({
      title: itemTitle.trim(),
      category: itemCategory,
      price: itemPrice,
      isFreeOrSwap: itemPrice === 0,
      condition: itemCondition,
      sellerId: currentUser?.id || 'guest',
      sellerName: currentUser?.fullName || 'Campus Student',
      sellerRole: currentUser?.role || 'student',
      sellerContact: itemContact.trim() || currentUser?.email || 'campus@student.edu'
    });
    setActionFeedback(res.message);
    setItemTitle('');
    setItemPrice(0);
    setIsListingItem(false);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReserve = (itemId: string) => {
    const res = reserveMarketplaceItem(itemId);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // --------------------------------------------------------------------------
  // 4. ASSIGNMENT & EXAM TRACKER STATE
  // --------------------------------------------------------------------------
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCourse, setTaskCourse] = useState('CS402');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskUrgency, setTaskUrgency] = useState<'urgent' | 'medium' | 'low'>('medium');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const res = addAssignmentTask({
      title: taskTitle.trim(),
      courseCode: taskCourse.trim().toUpperCase(),
      dueDate: taskDueDate.trim() || 'Next Week',
      urgency: taskUrgency
    });
    setActionFeedback(res.message);
    setTaskTitle('');
    setTaskDueDate('');
    setIsAddingTask(false);
    setTimeout(() => setActionFeedback(null), 4000);
  };

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
            <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Apple-Style Utility Navigation Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'study'
                ? 'bg-white text-[#0071e3] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Study Rooms & Focus</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'qa'
                ? 'bg-white text-[#0071e3] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Course Q&A ({courseQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'marketplace'
                ? 'bg-white text-[#0071e3] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Campus Marketplace ({marketplaceItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'tracker'
                ? 'bg-white text-[#0071e3] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Exam & Task Tracker</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PEER STUDY ROOMS & POMODORO TIMER                                   */}
      {/* ========================================================================= */}
      {activeTab === 'study' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pomodoro Timer Console */}
          <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pomodoro Engine</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  timerMode === 'work' ? 'bg-blue-50 text-[#0071e3]' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {timerMode === 'work' ? '🎯 Focus Mode' : '☕ Break Mode'}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Virtual Focus Session</h2>
              <p className="text-xs text-slate-500">25m deep work interval paired with synchronized peer study sessions.</p>
            </div>

            {/* Timer Dial Display */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="text-5xl font-black tracking-tight text-slate-900 font-mono">
                {formatTimer(timerSeconds)}
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-2">
                {isTimerRunning ? 'Session in progress...' : 'Paused / Ready'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm ${
                  isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0071e3] hover:bg-[#0077ED]'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Timer'}</span>
              </button>
              <button
                onClick={handleResetTimer}
                title="Reset timer"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Session Scratchpad */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500">Active Task Scratchpad</label>
              <input
                type="text"
                placeholder="e.g. Implement Raft heartbeat logic..."
                value={focusNote}
                onChange={e => setFocusNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>
          </div>

          {/* Right: Active Peer Study Rooms */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Peer Study Rooms</h2>
                <p className="text-xs text-slate-500">Join synchronous virtual study lounges with classmates</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                48 Peers Studying Now
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studyRooms.map(room => {
                const isJoined = activeJoinedRoom === room.id;
                return (
                  <div
                    key={room.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isJoined
                        ? 'bg-blue-50/40 border-[#0071e3]/40 shadow-xs ring-1 ring-[#0071e3]/30'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {room.roomTag}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#0071e3]" />
                        {room.activePeerCount} / {room.maxParticipants}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                      {room.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {room.subject}
                    </p>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Host: {room.hostName}
                      </span>
                      <button
                        onClick={() => {
                          setActiveJoinedRoom(room.id);
                          setActionFeedback(`Joined "${room.title}"! Syncing timer.`);
                          setTimeout(() => setActionFeedback(null), 3000);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isJoined
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-[#0071e3] hover:text-white text-slate-700'
                        }`}
                      >
                        {isJoined ? '✓ Joined & Synced' : 'Enter Study Room'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANONYMOUS VERIFIED COURSE Q&A                                      */}
      {/* ========================================================================= */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Campus Course Q&A Forum</h2>
              <p className="text-xs text-slate-500">Ask academic questions anonymously. Endorsed by Professors and TAs.</p>
            </div>
            <button
              onClick={() => setIsAskingQuestion(!isAskingQuestion)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ED] text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Course Question</span>
            </button>
          </div>

          {/* Ask Question Drawer */}
          <AnimatePresence>
            {isAskingQuestion && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handlePostQuestion}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Submit New Question</span>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQIsAnon}
                      onChange={e => setNewQIsAnon(e.target.checked)}
                      className="rounded text-[#0071e3] focus:ring-[#0071e3]"
                    />
                    <span>Post Anonymously</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CS301"
                      value={newQCourse}
                      onChange={e => setNewQCourse(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold focus:ring-[#0071e3]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500">Question Title</label>
                    <input
                      type="text"
                      placeholder="What is your specific doubt or question?"
                      value={newQTitle}
                      onChange={e => setNewQTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Detailed Explanation / Context</label>
                  <textarea
                    rows={2}
                    placeholder="Provide additional context or what you've tried so far..."
                    value={newQContent}
                    onChange={e => setNewQContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Code / Math Snippet (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="// Paste relevant code or equation..."
                    value={newQCode}
                    onChange={e => setNewQCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs focus:ring-[#0071e3]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAskingQuestion(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-bold shadow-xs hover:bg-[#0077ED]"
                  >
                    Post Question
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Filter Course:</span>
            {['all', 'CS301', 'CS402'].map(code => (
              <button
                key={code}
                onClick={() => setSelectedCourseFilter(code)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                  selectedCourseFilter === code
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Questions Stream */}
          <div className="space-y-4">
            {filteredQuestions.map(q => (
              <div key={q.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-[#0071e3] border border-blue-200/50">
                        {q.courseCode}
                      </span>
                      <span className="text-xs text-slate-500">{q.courseName}</span>
                      <span className="text-[10px] text-slate-400">• Asked by {q.authorName}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                  </div>

                  <button
                    onClick={() => upvoteCourseQuestion(q.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#0071e3] text-slate-600 text-xs font-bold border border-slate-200 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{q.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{q.content}</p>

                {q.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                    {q.codeSnippet}
                  </pre>
                )}

                {/* Answers Section */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {q.answers.length} {q.answers.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                    <button
                      onClick={() => setAnsweringQId(answeringQId === q.id ? null : q.id)}
                      className="text-xs font-bold text-[#0071e3] hover:underline"
                    >
                      {answeringQId === q.id ? 'Cancel Reply' : '+ Write Answer'}
                    </button>
                  </div>

                  {/* Inline Answer Form */}
                  {answeringQId === q.id && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <textarea
                        rows={2}
                        placeholder="Write your explanation or verified solution..."
                        value={answerContent}
                        onChange={e => setAnswerContent(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:ring-[#0071e3]"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAnswerSubmit(q.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-bold"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Answers List */}
                  {q.answers.map(ans => (
                    <div
                      key={ans.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        ans.isFacultyEndorsed
                          ? 'bg-emerald-50/70 border border-emerald-200'
                          : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{ans.authorName}</span>
                          {ans.isFacultyEndorsed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold tracking-wide uppercase">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Faculty Endorsed Answer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {ans.upvotes} Upvotes
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{ans.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPUS MARKETPLACE & BOOK SWAP                                     */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Campus Marketplace & Book Swap</h2>
              <p className="text-xs text-slate-500">Buy, sell, or swap used textbooks, lab equipment, and tech gear on campus.</p>
            </div>
            <button
              onClick={() => setIsListingItem(!isListingItem)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>List Item for Sale/Swap</span>
            </button>
          </div>

          {/* Listing Drawer */}
          <AnimatePresence>
            {isListingItem && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateMarketListing}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900">List Item on Campus Board</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Item Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Operating Systems Concepts 10th Ed"
                      value={itemTitle}
                      onChange={e => setItemTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Category</label>
                    <select
                      value={itemCategory}
                      onChange={e => setItemCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                    >
                      <option value="textbook">Textbook</option>
                      <option value="equipment">Lab Equipment</option>
                      <option value="electronics">Electronics / Hardware</option>
                      <option value="notes">Course Notes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Price (₹0 for Free/Swap)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={itemPrice}
                      onChange={e => setItemPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Condition</label>
                    <select
                      value={itemCondition}
                      onChange={e => setItemCondition(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                    >
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Contact / Pickup Spot</label>
                    <input
                      type="text"
                      placeholder="e.g. Hostel Block B or Email"
                      value={itemContact}
                      onChange={e => setItemContact(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsListingItem(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    Publish Listing
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Category:</span>
            {['all', 'textbook', 'equipment', 'electronics', 'notes'].map(cat => (
              <button
                key={cat}
                onClick={() => setMarketCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  marketCategory === cat
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Marketplace Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      {item.condition.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Price:</span>
                    <span className="text-base font-black text-slate-900">
                      {item.price === 0 ? '🎁 Free / Swap' : `₹${item.price}`}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Seller: <span className="font-semibold text-slate-700">{item.sellerName}</span> ({item.sellerRole})
                  </div>

                  {item.isReserved ? (
                    <div className="w-full py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold text-center border border-amber-200">
                      🔒 Reserved by {item.reservedByStudentName || 'Student'}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserve(item.id)}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                    >
                      Reserve for Campus Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXAM COUNTDOWN & ASSIGNMENT TRACKER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Exam Countdown Banners */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Upcoming Semester Exams & Vivas</h2>
              <span className="text-xs text-slate-400">Official Exam Schedule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {examMilestones.map(exam => (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3]">
                      {exam.courseCode}
                    </span>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      ⏳ {exam.remainingDays} Days Left
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{exam.examName}</h3>
                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                    <div>📅 Date: <span className="font-semibold text-slate-700">{exam.examDate}</span></div>
                    <div>📍 Venue: <span className="font-semibold text-slate-700">{exam.venue}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Assignment Checklist */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Course Assignments</h3>
                <p className="text-xs text-slate-500">Track deadlines, submission requirements, and completion progress</p>
              </div>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Assignment</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Assignment Task Description..."
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Course (e.g. CS402)"
                      value={taskCourse}
                      onChange={e => setTaskCourse(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <select
                      value={taskUrgency}
                      onChange={e => setTaskUrgency(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-[#0071e3] text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {assignmentTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    task.isCompleted
                      ? 'bg-slate-50/60 border-slate-200/50 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAssignmentTask(task.id)}
                      className="text-slate-400 hover:text-emerald-600 transition"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-[#0071e3]">{task.courseCode}</span>
                        <span>• Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      task.urgency === 'urgent'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : task.urgency === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {task.urgency}
                    </span>
                    <button
                      onClick={() => deleteAssignmentTask(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 text-xs"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
