'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  BarChart3,
  Palette,
  Cloud,
  Cpu,
  Smartphone,
  GitBranch,
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';
import { DEFAULT_STUDENT_SKILLS } from '@/lib/mockData';

interface StudentSkillsSectionProps {
  skills?: string[];
  role?: string;
  isOwner?: boolean;
  onEdit?: () => void;
  title?: string;
  initialCount?: number;
  className?: string;
}

export function getSkillVisual(skillName: string) {
  const s = skillName.toLowerCase();
  if (s.includes('fullstack') || s.includes('full-stack') || s.includes('developer') || s.includes('software') || s.includes('code') || s.includes('web dev') || s.includes('frontend') || s.includes('backend')) {
    return {
      icon: Code,
      color: 'text-blue-600',
      bg: 'bg-blue-50/80 hover:bg-blue-100/80',
      border: 'border-blue-200/80 hover:border-blue-400',
      tag: 'Tech Stack'
    };
  }
  if (s.includes('data') || s.includes('analyst') || s.includes('analytics') || s.includes('bi') || s.includes('statistics')) {
    return {
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
      border: 'border-emerald-200/80 hover:border-emerald-400',
      tag: 'Analytics'
    };
  }
  if (s.includes('ui') || s.includes('ux') || s.includes('design') || s.includes('figma') || s.includes('product design')) {
    return {
      icon: Palette,
      color: 'text-purple-600',
      bg: 'bg-purple-50/80 hover:bg-purple-100/80',
      border: 'border-purple-200/80 hover:border-purple-400',
      tag: 'Creative'
    };
  }
  if (s.includes('cloud') || s.includes('aws') || s.includes('azure') || s.includes('gcp')) {
    return {
      icon: Cloud,
      color: 'text-sky-600',
      bg: 'bg-sky-50/80 hover:bg-sky-100/80',
      border: 'border-sky-200/80 hover:border-sky-400',
      tag: 'Cloud'
    };
  }
  if (s.includes('machine learning') || s.includes('ml') || s.includes('ai') || s.includes('intelligence') || s.includes('neural') || s.includes('deep learning')) {
    return {
      icon: Cpu,
      color: 'text-amber-600',
      bg: 'bg-amber-50/80 hover:bg-amber-100/80',
      border: 'border-amber-200/80 hover:border-amber-400',
      tag: 'AI / ML'
    };
  }
  if (s.includes('mobile') || s.includes('android') || s.includes('ios') || s.includes('flutter') || s.includes('react native')) {
    return {
      icon: Smartphone,
      color: 'text-pink-600',
      bg: 'bg-pink-50/80 hover:bg-pink-100/80',
      border: 'border-pink-200/80 hover:border-pink-400',
      tag: 'Mobile'
    };
  }
  if (s.includes('devops') || s.includes('ci/cd') || s.includes('docker') || s.includes('kubernetes')) {
    return {
      icon: GitBranch,
      color: 'text-orange-600',
      bg: 'bg-orange-50/80 hover:bg-orange-100/80',
      border: 'border-orange-200/80 hover:border-orange-400',
      tag: 'DevOps'
    };
  }
  if (s.includes('security') || s.includes('cyber') || s.includes('ethical') || s.includes('infosec')) {
    return {
      icon: ShieldCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50/80 hover:bg-teal-100/80',
      border: 'border-teal-200/80 hover:border-teal-400',
      tag: 'Security'
    };
  }
  if (s.includes('database') || s.includes('sql') || s.includes('postgres') || s.includes('mongo') || s.includes('redis')) {
    return {
      icon: Database,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/80 hover:bg-indigo-100/80',
      border: 'border-indigo-200/80 hover:border-indigo-400',
      tag: 'Data'
    };
  }
  if (s.includes('blockchain') || s.includes('web3') || s.includes('crypto')) {
    return {
      icon: Layers,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50/80 hover:bg-cyan-100/80',
      border: 'border-cyan-200/80 hover:border-cyan-400',
      tag: 'Web3'
    };
  }
  return {
    icon: Sparkles,
    color: 'text-blue-500',
    bg: 'bg-slate-50/90 hover:bg-slate-100',
    border: 'border-slate-200 hover:border-slate-300',
    tag: 'Skill'
  };
}

export default function StudentSkillsSection({
  skills,
  role = 'student',
  isOwner = false,
  onEdit,
  title = 'Student Skill Set & Technical Focus',
  initialCount = 3,
  className = ''
}: StudentSkillsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const effectiveSkills =
    skills && skills.length > 0
      ? skills
      : role === 'student'
      ? DEFAULT_STUDENT_SKILLS
      : [];

  if (effectiveSkills.length === 0) return null;

  const visibleSkills = isExpanded
    ? effectiveSkills
    : effectiveSkills.slice(0, initialCount);

  const hasOverflow = effectiveSkills.length > initialCount;
  const hiddenCount = effectiveSkills.length - initialCount;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Title, Count badge, and Edit button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
              {effectiveSkills.length} skills
            </span>
          </h3>
        </div>

        {isOwner && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
          >
            <Edit3 className="w-3 h-3" />
            <span>Customize Skills</span>
          </button>
        )}
      </div>

      {/* Skills Badges Container */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <AnimatePresence initial={false}>
          {visibleSkills.map((skill, index) => {
            const visual = getSkillVisual(skill);
            const Icon = visual.icon;

            return (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.92, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 4 }}
                transition={{ duration: 0.18, delay: isExpanded ? index * 0.02 : 0 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs cursor-default ${visual.bg} ${visual.border}`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${visual.color}`} />
                <span>{skill}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Interactive View More / View Less Toggle Button */}
        {hasOverflow && (
          <motion.button
            layout
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs border ${
              isExpanded
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-[#E8F5FF] hover:bg-[#D5EEFF] text-[#075080] border-[#CFEAFF]'
            }`}
            title={isExpanded ? 'Collapse skill set' : `Show all ${effectiveSkills.length} skills`}
          >
            {isExpanded ? (
              <>
                <span>View Less</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
              </>
            ) : (
              <>
                <span>View More (+{hiddenCount} more)</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#1687D4]" />
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
