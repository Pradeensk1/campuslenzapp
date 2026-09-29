'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/types';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Building2,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';

interface PersonaOption {
  role: UserRole;
  title: string;
  name: string;
  username: string;
  icon: any;
  color: string;
  badge: string;
  summary: string;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    role: 'student',
    title: 'Student Persona',
    name: 'Junith Scholar',
    username: 'student_scholar',
    icon: GraduationCap,
    color: 'from-[#1687D4] to-[#0875BD] text-[#1687D4] bg-[#E8F5FF] border-[#CFEAFF]',
    badge: 'Social & Anonymous',
    summary: 'Full social feed, anonymous posting switch, join/leave communities freely'
  },
  {
    role: 'alumni',
    title: 'Alumni Persona',
    name: 'Karthika Mentor',
    username: 'alumni_mentor',
    icon: Briefcase,
    color: 'from-[#0875BD] to-[#075080] text-[#0875BD] bg-[#E8F5FF] border-[#CFEAFF]',
    badge: 'Mentorship HQ',
    summary: '1-on-1 DMs with students, 5-follower requirement, 5-post/week limit, no public groups'
  },
  {
    role: 'faculty',
    title: 'Faculty Persona',
    name: 'Dr. Arunkumar',
    username: 'academic_faculty',
    icon: BookOpen,
    color: 'from-[#3B9FE8] to-[#1687D4] text-[#1687D4] bg-[#E8F5FF] border-[#CFEAFF]',
    badge: 'Academic Portal',
    summary: 'Peer-reviewed knowledge posts, circular reposting, community proposals'
  },
  {
    role: 'institution',
    title: 'Institution Persona',
    name: 'PSG Tech Administration',
    username: 'institution_admin',
    icon: Building2,
    color: 'from-[#075080] to-[#0875BD] text-[#075080] bg-[#CFEAFF] border-[#8CCCF5]',
    badge: 'Executive Governance',
    summary: '1-community page limit, faculty proposal approvals, showcase student achievements'
  },
  {
    role: 'admin',
    title: 'Super Administrator',
    name: 'Root Administrator',
    username: 'system_admin',
    icon: ShieldCheck,
    color: 'from-[#0875BD] to-[#075080] text-[#075080] bg-[#CFEAFF] border-[#8CCCF5]',
    badge: 'Root Clearance',
    summary: 'Delete any user/post/comment, unban accounts, access Developer Terminal'
  }
];

export default function RolePersonaSwitcher() {
  const { currentUser, initializeTestUser } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentRole = currentUser?.role || 'guest';
  const currentPersona = PERSONA_OPTIONS.find(p => p.role === currentRole);

  const handleSelectRole = (role: UserRole) => {
    const res = initializeTestUser(role);
    setToastMessage(`Switched to ${role.toUpperCase()} mode!`);
    setIsExpanded(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <aside aria-label="Role Persona Switcher" className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-4 right-3 sm:right-4 z-40 font-sans pointer-events-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="mb-2 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-black text-slate-900 tracking-tight">
                Role Persona Simulator
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              1-Click Testing
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Instantly switch between roles to test their customized home dashboards, permissions, and profile views:
          </p>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {PERSONA_OPTIONS.map((persona) => {
              const Icon = persona.icon;
              const isActive = currentRole === persona.role;

              return (
                <button
                  key={persona.role}
                  type="button"
                  onClick={() => handleSelectRole(persona.role)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${persona.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {persona.title}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-white px-1.5 py-0.2 rounded-md shadow-2xs border border-blue-200">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      @{persona.username} ({persona.name})
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                      {persona.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" /> No login password needed
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="font-bold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all duration-150 touch-manipulation active:scale-95 group"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Active:
          </span>
          <span className="text-xs font-extrabold text-white capitalize">
            {currentPersona ? currentPersona.role : 'Guest'}
          </span>
        </div>

        <div className="ml-1 p-1 rounded-full bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </div>
      </button>
    </aside>
  );
}
