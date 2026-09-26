'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { User, ShieldCheck, Bookmark, Building, LogOut, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfilePage() {
  const { currentUser, colleges, savedCollegeIds, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'saved' | 'verification'>('details');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const savedColleges = colleges.filter(c => savedCollegeIds.includes(c.id));

  // Verification request form state
  const [docType, setDocType] = useState('Alumni Degree Certificate');
  const [docNotes, setDocNotes] = useState('');
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  if (!currentUser) {
    return (
      <div className="apple-card p-12 text-center max-w-lg mx-auto space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Profile</h2>
        <p className="text-xs text-slate-500">
          Your profile, saved colleges, and verification details are linked to your authenticated account.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="apple-button-primary text-xs font-bold py-2.5 px-5"
          >
            Sign In to Account
          </Link>
          <Link
            href="/register"
            className="apple-button-secondary text-xs font-bold py-2.5 px-5"
          >
            Register Fresh
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-2xl font-black text-[#2563EB] shadow-xs">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">{currentUser?.fullName}</h1>
                {currentUser?.isVerified && (
                  <span className="flex items-center space-x-1 rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#059669]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#64748B]">{currentUser?.email}</p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 font-bold uppercase text-[10px] text-[#2563EB]">
                  {currentUser?.role}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="text-[#64748B] font-medium">{currentUser?.collegeName}</span>
              </div>
              <div className="mt-2.5">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="apple-button-secondary text-xs !py-1 !px-3 font-semibold flex items-center space-x-1.5 hover:border-[#2563EB]"
                >
                  <Edit3 className="h-3 w-3 text-[#2563EB]" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Security & Sign Out Section */}
          <div className="flex flex-col space-y-2 text-xs">
            <span className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
              Active Session:
            </span>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#0F172A] capitalize">
                  {currentUser?.role} Account
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Link
                  href="/login"
                  className="apple-button-secondary text-[10px] !py-1 !px-2.5 font-bold flex-1 text-center"
                >
                  Switch Account
                </Link>
                <Link
                  href="/login"
                  className="apple-button-primary text-[10px] !py-1 !px-2.5 font-bold flex items-center justify-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-8 flex space-x-2 border-t border-[#F1F5F9] pt-4 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Academic Profile
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Colleges ({savedColleges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'verification'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Identity Verification
          </button>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="apple-card p-6 text-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Institutional Affiliation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Primary College</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.collegeName || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.department || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Degree / Course</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.course || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Batch Year</span>
              <strong className="mt-1 block text-sm font-bold text-[#0F172A]">{currentUser?.graduationBatch || 'Not Set'}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedColleges.length === 0 ? (
            <div className="apple-card p-8 text-center text-xs text-[#64748B]">
              No colleges saved yet. Bookmark institutions in Explore to build your research space.
            </div>
          ) : (
            savedColleges.map((col) => (
              <div
                key={col.id}
                className="apple-card apple-card-hover flex items-center justify-between p-5 text-xs"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{col.name}</h3>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">{col.location}, {col.state} • {col.collegeType}</p>
                </div>
                <Link
                  href={`/colleges/${col.slug}`}
                  className="apple-button-secondary text-xs font-semibold !py-1.5 !px-3"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="apple-card p-6 sm:p-8 space-y-5 text-xs">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#0F172A]">Institutional Verification Queue</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Spec Rule: Authentication is separate from Verification. Verified status requires documentary evidence reviewed by Admin.
            </p>
          </div>

          {verificationSubmitted ? (
            <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#059669]" />
              <h3 className="mt-3 font-bold text-base text-[#065F46]">Verification Proof Submitted</h3>
              <p className="mt-1 text-xs text-[#047857]">
                Current Lifecycle: <strong>Pending → Admin Review</strong>. Once verified, your profile and reviews will display the official verified badge.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setVerificationSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Document / Proof Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[#0F172A] focus:outline-none"
                >
                  <option value="College Institutional Email">Official College Email (@institution.edu)</option>
                  <option value="Alumni Degree Certificate">Alumni / Student ID Card</option>
                  <option value="Graduation Certificate">Graduation Proof / Provisional Certificate</option>
                  <option value="Institution Admin Letter">Dean / Registrar Authorization Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Registration Number / Verification Details
                </label>
                <textarea
                  rows={3}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Provide ID registration number or official institution credentials..."
                  className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs sm:text-sm text-[#0F172A] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="apple-button-primary text-xs font-bold py-2.5"
              >
                Submit for Admin Verification
              </button>
            </form>
          )}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        currentUser={currentUser}
        onSave={updateProfile}
      />
    </div>
  );
}
