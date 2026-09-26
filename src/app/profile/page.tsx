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
      <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#162D4A] text-xl font-black text-[#38E6A5]">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-[#F8FAFC]">{currentUser?.fullName}</h1>
                {currentUser?.isVerified && (
                  <span className="flex items-center space-x-1 rounded bg-[#38E6A5]/10 px-2 py-0.5 text-xs font-semibold text-[#38E6A5]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">{currentUser?.email}</p>
              <div className="mt-1 flex items-center space-x-2 text-xs">
                <span className="rounded bg-[#162D4A] px-2 py-0.5 font-bold uppercase text-[#5B8CFF]">
                  {currentUser?.role}
                </span>
                <span className="text-[#94A3B8]">{currentUser?.collegeName}</span>
              </div>
            </div>
          </div>

          {/* Role Switching shortcuts */}
          <div className="flex flex-col space-y-2 text-xs">
            <span className="text-[#94A3B8]">Switch Active Persona:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['student', 'alumni', 'institution', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`rounded px-2 py-1 font-semibold uppercase text-[10px] transition ${
                    currentUser?.role === r
                      ? 'bg-[#38E6A5] text-[#07111F]'
                      : 'border border-[#1E3A5F] bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex space-x-2 border-t border-[#1E3A5F] pt-4 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === 'details'
                ? 'bg-[#38E6A5] text-[#07111F]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Academic Info
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-1 rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === 'saved'
                ? 'bg-[#38E6A5] text-[#07111F]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Colleges ({savedColleges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === 'verification'
                ? 'bg-[#38E6A5] text-[#07111F]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Identity Verification
          </button>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5 text-xs space-y-3">
          <h2 className="text-sm font-bold text-[#F8FAFC]">Institutional Affiliation Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#94A3B8]">
            <div className="rounded-lg bg-[#162D4A] p-3">
              <span className="block text-[10px] text-[#94A3B8]">Primary Institution</span>
              <strong className="text-sm text-[#F8FAFC]">{currentUser?.collegeName || 'Not Set'}</strong>
            </div>
            <div className="rounded-lg bg-[#162D4A] p-3">
              <span className="block text-[10px] text-[#94A3B8]">Department</span>
              <strong className="text-sm text-[#F8FAFC]">{currentUser?.department || 'Not Set'}</strong>
            </div>
            <div className="rounded-lg bg-[#162D4A] p-3">
              <span className="block text-[10px] text-[#94A3B8]">Course / Degree</span>
              <strong className="text-sm text-[#F8FAFC]">{currentUser?.course || 'Not Set'}</strong>
            </div>
            <div className="rounded-lg bg-[#162D4A] p-3">
              <span className="block text-[10px] text-[#94A3B8]">Batch / Year</span>
              <strong className="text-sm text-[#F8FAFC]">{currentUser?.graduationBatch || 'Not Set'}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedColleges.length === 0 ? (
            <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6 text-center text-xs text-[#94A3B8]">
              No colleges saved yet. Use the bookmark icon on any college in Explore to save for comparison.
            </div>
          ) : (
            savedColleges.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between rounded-xl border border-[#1E3A5F] bg-[#112238] p-4 text-xs"
              >
                <div>
                  <h3 className="font-bold text-[#F8FAFC]">{col.name}</h3>
                  <p className="text-[11px] text-[#94A3B8]">{col.location}, {col.state} • {col.collegeType}</p>
                </div>
                <Link
                  href={`/colleges/${col.slug}`}
                  className="rounded-lg bg-[#162D4A] px-3 py-1.5 font-semibold text-[#38E6A5] hover:bg-[#38E6A5] hover:text-[#07111F]"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6 space-y-4 text-xs">
          <div className="border-b border-[#1E3A5F] pb-3">
            <h2 className="text-sm font-bold text-[#F8FAFC]">Institutional Evidence & Verification</h2>
            <p className="mt-1 text-[#94A3B8]">
              Spec Requirement: Verification is separate from login authentication. Verified status is granted strictly upon institutional proof review.
            </p>
          </div>

          {verificationSubmitted ? (
            <div className="rounded-lg border border-[#38E6A5]/30 bg-[#162D4A] p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#38E6A5]" />
              <h3 className="mt-2 font-bold text-[#F8FAFC]">Verification Request Submitted</h3>
              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Lifecycle: <strong>Pending → Admin Review → Approved</strong>. You will be notified once reviewed.
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
                <label className="block font-semibold text-[#94A3B8]">Document / Proof Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-[#F8FAFC] focus:outline-none"
                >
                  <option value="College Institutional Email">Official College Email (@institution.edu)</option>
                  <option value="Alumni Degree Certificate">Alumni / Student ID Card</option>
                  <option value="Graduation Certificate">Graduation Proof / Provisional Certificate</option>
                  <option value="Institution Admin Letter">Dean / Registrar Authorization Letter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#94A3B8]">Proof Details / Note</label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Provide ID registration number or official institution credentials for admin verification..."
                  className="mt-1.5 w-full rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-2.5 text-[#F8FAFC] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-[#38E6A5] px-4 py-2 font-bold text-[#07111F] hover:bg-[#70F3C1]"
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
