'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Camera, Sparkles, Building2, ShieldCheck, Award, Plus, Tag } from 'lucide-react';
import { UserProfile } from '@/types';
import { DEFAULT_STUDENT_SKILLS, PRESET_SKILL_OPTIONS } from '@/lib/mockData';
import { getSkillVisual } from '@/components/StudentSkillsSection';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updatedData: Partial<UserProfile>) => void;
}

const PRESET_AVATARS = [
  { label: 'Scholar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Coder', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { label: 'Creative', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { label: 'Graduate', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Research', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
  { label: 'Innovator', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { label: 'Faculty', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Leader', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [graduationBatch, setGraduationBatch] = useState(currentUser.graduationBatch || '');
  const [collegeName, setCollegeName] = useState(currentUser.collegeName || '');
  
  // Skills state
  const [skills, setSkills] = useState<string[]>(
    currentUser.skills && currentUser.skills.length > 0
      ? currentUser.skills
      : currentUser.role === 'student'
      ? DEFAULT_STUDENT_SKILLS
      : []
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Institution specific fields
  const [certifiedLicenseNumber, setCertifiedLicenseNumber] = useState(currentUser.certifiedLicenseNumber || '');
  const [accreditationGrade, setAccreditationGrade] = useState(currentUser.accreditationGrade || 'NAAC A++');

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      headline,
      bio,
      avatarUrl: avatarUrl.trim() || undefined,
      department,
      course,
      graduationBatch,
      collegeName,
      skills,
      certifiedLicenseNumber: currentUser.role === 'institution' ? certifiedLicenseNumber : undefined,
      accreditationGrade: currentUser.role === 'institution' ? accreditationGrade : undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Profile & Avatar Settings</h2>
              <p className="text-xs text-slate-500">Instagram-style profile picture, bio and credentials</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* AVATAR & DP SELECTOR (INSTAGRAM / SNAPCHAT STYLE) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Profile Picture & Avatar DP
                </span>
                <span className="text-[10px] text-slate-400">Instagram & Snapchat presets</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Live Preview */}
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {fullName[0] || 'U'}
                    </div>
                  )}
                </div>

                {/* Preset Avatars Bar */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-500 mb-1.5">Select a preset avatar or paste image URL:</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        title={preset.label}
                        className={`h-9 w-9 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                          avatarUrl === preset.url
                            ? 'border-blue-600 scale-110 shadow-sm'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                      </button>
                    ))}
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2 py-1 rounded-lg text-[10px] bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold shrink-0"
                      >
                        Reset Initial
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Image URL input */}
              <div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or paste custom image / avatar URL (https://...)"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* INSTITUTION ACCREDITATION & CERTIFIED LICENSE (FOR INSTITUTION ROLE) */}
            {currentUser.role === 'institution' && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Official Institutional Accreditation & Governance
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-900 uppercase tracking-wider text-[10px] mb-1">
                      Certified License / Approval Number
                    </label>
                    <input
                      type="text"
                      value={certifiedLicenseNumber}
                      onChange={(e) => setCertifiedLicenseNumber(e.target.value)}
                      placeholder="e.g. AICTE-TN-2026-904"
                      className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-900 uppercase tracking-wider text-[10px] mb-1">
                      Accreditation Grade / Status
                    </label>
                    <input
                      type="text"
                      value={accreditationGrade}
                      onChange={(e) => setAccreditationGrade(e.target.value)}
                      placeholder="e.g. NAAC A++ (CGPA 3.82) | NBA"
                      className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Professional / Campus Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. MCA Student @ PSG Tech | Full-Stack Dev"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Bio & Tech Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your skills, research, or interests..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>

            {/* College & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Primary College Name
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Course & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Program / Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. MCA or B.Tech AI & DS"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Graduation Year / Batch
                </label>
                <input
                  type="text"
                  value={graduationBatch}
                  onChange={(e) => setGraduationBatch(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* SKILLS & SPECIALIZATIONS (STUDENT & USER ROLES) */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Skills & Technical Expertise
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  {skills.length} selected
                </span>
              </div>

              {/* Active Selected Skills Tags */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] p-2 bg-white rounded-xl border border-slate-200">
                {skills.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No skills selected yet. Choose from presets below or add custom skills.</p>
                ) : (
                  skills.map((s) => {
                    const visual = getSkillVisual(s);
                    const Icon = visual.icon;
                    return (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${visual.bg} ${visual.border} text-slate-800 shadow-2xs`}
                      >
                        <Icon className={`w-3 h-3 ${visual.color}`} />
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="ml-0.5 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Preset Skills Clickable Pills */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Popular Student Skill Sets (click to toggle):</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SKILL_OPTIONS.map((opt) => {
                    const isSelected = skills.includes(opt);
                    const visual = getSkillVisual(opt);
                    const Icon = visual.icon;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleSkill(opt)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <Icon className={`w-3 h-3 ${visual.color}`} />
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Skill Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  placeholder="Add custom skill (e.g. Next.js, Flutter, PyTorch, Figma)..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSkill()}
                  disabled={!customSkillInput.trim()}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="apple-button-secondary text-xs !py-2 !px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-button-primary text-xs !py-2 !px-5 flex items-center space-x-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
