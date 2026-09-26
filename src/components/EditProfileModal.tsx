'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Building, GraduationCap, FileText, Camera } from 'lucide-react';
import { UserProfile } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updatedData: Partial<UserProfile>) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [graduationBatch, setGraduationBatch] = useState(currentUser.graduationBatch || '');
  const [collegeName, setCollegeName] = useState(currentUser.collegeName || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      headline,
      bio,
      department,
      course,
      graduationBatch,
      collegeName
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
          className="relative z-10 w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Edit Profile Details</h2>
              <p className="text-xs text-[#64748B]">Update your public student/alumni credentials</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                required
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Professional / Campus Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. MCA Student @ PSG Tech | Full-Stack Dev"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Bio & Tech Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your skills, research, or interests..."
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {/* College & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Primary College Name
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Course & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Program / Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. MCA or B.Tech AI & DS"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Graduation Year / Batch
                </label>
                <input
                  type="text"
                  value={graduationBatch}
                  onChange={(e) => setGraduationBatch(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={onClose}
                className="apple-button-secondary text-xs !py-2 !px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-button-primary text-xs !py-2 !px-5 flex items-center space-x-1"
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
