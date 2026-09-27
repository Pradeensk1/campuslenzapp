'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Camera, Sparkles, Building2, ShieldCheck, Award } from 'lucide-react';
import { UserProfile } from '@/types';

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
  
  // Institution specific fields
  const [certifiedLicenseNumber, setCertifiedLicenseNumber] = useState(currentUser.certifiedLicenseNumber || '');
  const [accreditationGrade, setAccreditationGrade] = useState(currentUser.accreditationGrade || 'NAAC A++');

  if (!isOpen) return null;

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
