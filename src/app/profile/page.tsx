'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { User, ShieldCheck, Bookmark, Building, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { currentUser, colleges, savedCollegeIds, switchRole } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'saved' | 'verification'>('details');

  const savedColleges = colleges.filter(c => savedCollegeIds.includes(c.id));

  // Verification request form state
  const [docType, setDocType] = useState('Alumni Degree Certificate');
  const [docNotes, setDocNotes] = useState('');
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#192D48] text-2xl font-black text-[#38E6A5] shadow-inner">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">{currentUser?.fullName}</h1>
                {currentUser?.isVerified && (
                  <span className="flex items-center space-x-1 rounded-md bg-[#38E6A5]/15 px-2 py-0.5 text-xs font-bold text-[#38E6A5]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#94A3B8]">{currentUser?.email}</p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <span className="rounded-md bg-[#192D48] px-2.5 py-0.5 font-bold uppercase text-[10px] text-[#5B8CFF]">
                  {currentUser?.role}
                </span>
                <span className="text-[#64748B]">•</span>
                <span className="text-[#94A3B8] font-medium">{currentUser?.collegeName}</span>
              </div>
            </div>
          </div>

          {/* Role Switching shortcuts */}
          <div className="flex flex-col space-y-2 text-xs">
            <span className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
              Switch Testing Persona:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['student', 'alumni', 'institution', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`rounded-lg px-3 py-1.5 font-bold uppercase text-[10px] transition-all duration-200 ${
                    currentUser?.role === r
                      ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                      : 'border border-[#1F3653] bg-[#192D48] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-8 flex space-x-2 border-t border-[#1F3653] pt-4 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Academic Profile
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Colleges ({savedColleges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'verification'
                ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Identity Verification
          </button>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="apple-card p-6 text-xs space-y-4">
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
            Institutional Affiliation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1F3653] bg-[#192D48] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Primary College</span>
              <strong className="mt-1 block text-sm font-bold text-[#F8FAFC]">{currentUser?.collegeName || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#1F3653] bg-[#192D48] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Department</span>
              <strong className="mt-1 block text-sm font-bold text-[#F8FAFC]">{currentUser?.department || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#1F3653] bg-[#192D48] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Degree / Course</span>
              <strong className="mt-1 block text-sm font-bold text-[#F8FAFC]">{currentUser?.course || 'Not Set'}</strong>
            </div>
            <div className="rounded-xl border border-[#1F3653] bg-[#192D48] p-4">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Batch Year</span>
              <strong className="mt-1 block text-sm font-bold text-[#F8FAFC]">{currentUser?.graduationBatch || 'Not Set'}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedColleges.length === 0 ? (
            <div className="apple-card p-8 text-center text-xs text-[#94A3B8]">
              No colleges saved yet. Bookmark institutions in Explore to build your research space.
            </div>
          ) : (
            savedColleges.map((col) => (
              <div
                key={col.id}
                className="apple-card apple-card-hover flex items-center justify-between p-5 text-xs"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{col.name}</h3>
                  <p className="mt-0.5 text-[11px] text-[#94A3B8]">{col.location}, {col.state} • {col.collegeType}</p>
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
          <div className="border-b border-[#1F3653] pb-4">
            <h2 className="text-base font-bold text-[#F8FAFC]">Institutional Verification Queue</h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Spec Rule: Authentication is separate from Verification. Verified status requires documentary evidence reviewed by Admin.
            </p>
          </div>

          {verificationSubmitted ? (
            <div className="rounded-xl border border-[#38E6A5]/30 bg-[#192D48] p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#38E6A5]" />
              <h3 className="mt-3 font-bold text-base text-[#F8FAFC]">Verification Proof Submitted</h3>
              <p className="mt-1 text-xs text-[#94A3B8]">
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
                  className="mt-1.5 w-full rounded-xl border border-[#1F3653] bg-[#192D48] p-3 text-[#F8FAFC] focus:outline-none"
                >
                  <option value="College Institutional Email" className="bg-[#132238]">Official College Email (@institution.edu)</option>
                  <option value="Alumni Degree Certificate" className="bg-[#132238]">Alumni / Student ID Card</option>
                  <option value="Graduation Certificate" className="bg-[#132238]">Graduation Proof / Provisional Certificate</option>
                  <option value="Institution Admin Letter" className="bg-[#132238]">Dean / Registrar Authorization Letter</option>
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
                  className="mt-1.5 w-full rounded-xl border border-[#1F3653] bg-[#192D48] p-3 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none"
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
    </div>
  );
}
