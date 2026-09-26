'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { PrivateGrievanceReport } from '@/types';
import {
  Shield,
  ShieldAlert,
  Lock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Clock,
  FileText,
  UserCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function GrievancePortalPage() {
  const {
    currentUser,
    colleges,
    grievanceReports,
    submitGrievanceReport,
    resolveGrievanceReport
  } = useApp();

  // Student Form State
  const [targetCollegeId, setTargetCollegeId] = useState(currentUser.collegeId || colleges[0]?.id || 'col-psg');
  const [category, setCategory] = useState<PrivateGrievanceReport['category']>('faculty_conduct');
  const [targetFacultyName, setTargetFacultyName] = useState('');
  const [subjectOrCourse, setSubjectOrCourse] = useState('');
  const [detailedComplaint, setDetailedComplaint] = useState('');
  const [isAnonymousToFaculty, setIsAnonymousToFaculty] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Institution Resolution State
  const [activeReportToResolve, setActiveReportToResolve] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'under_investigation' | 'resolved' | 'action_taken'>('action_taken');

  // Filter reports based on user role
  const isInstitutionOrAdmin = currentUser.role === 'institution' || currentUser.role === 'admin';
  
  // Reports visible to the student
  const studentReports = grievanceReports.filter(r => r.studentId === currentUser.id);

  // Reports visible to the institution (targetInstitutionId matches collegeId or all for admin)
  const institutionReports = isInstitutionOrAdmin
    ? (currentUser.role === 'admin' 
        ? grievanceReports 
        : grievanceReports.filter(r => r.targetInstitutionId === currentUser.collegeId || r.collegeName.includes('PSG Tech') || r.targetInstitutionId === 'col-psg'))
    : [];

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailedComplaint.trim() || !subjectOrCourse.trim()) return;

    const matchedCollege = colleges.find(c => c.id === targetCollegeId);

    const report = submitGrievanceReport({
      studentId: currentUser.id,
      studentName: isAnonymousToFaculty ? 'Confidential Student ID' : currentUser.fullName,
      isAnonymousToFaculty,
      targetInstitutionId: targetCollegeId,
      collegeName: matchedCollege?.name || 'Selected Institution Desk',
      category,
      targetFacultyName: targetFacultyName.trim() || undefined,
      subjectOrCourse: subjectOrCourse.trim(),
      detailedComplaint: detailedComplaint.trim()
    });

    setSubmitSuccess(`Report #${report.id.slice(-6)} submitted securely to ${matchedCollege?.name || 'Institution Desk'}. Student identity is shielded from public feeds.`);
    setDetailedComplaint('');
    setTargetFacultyName('');
    setSubjectOrCourse('');

    setTimeout(() => {
      setSubmitSuccess(null);
    }, 6000);
  };

  const handleResolveSubmit = (reportId: string) => {
    if (!resolutionRemarks.trim()) return;
    resolveGrievanceReport(reportId, resolutionRemarks.trim(), resolutionStatus);
    setActiveReportToResolve(null);
    setResolutionRemarks('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            Confidential Institution ID Grievance Tunnel
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Private Class & Faculty Grievance Reporting
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            A zero-ragebait channel engineered specifically so students can report class disruptions, infrastructure breakdowns, or faculty conduct directly to college administration without fear of public retaliation.
          </p>
        </div>

        {/* Protection Guarantee Notice */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-bold text-slate-900">Why Private Routing Instead of Public Posts?</h3>
            <p className="text-slate-600 leading-relaxed">
              Public posts criticizing specific faculties frequently spiral into unconstructive viral ragebait and jeopardize students academically. Campus Lenz bypasses public social feeds and delivers these reports directly to the <strong>verified Institution ID desk</strong> with identity masking.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {/* Student Submission Form (Rendered for Students or Admins) */}
        {currentUser.role === 'student' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Submit New Private Report</h2>
                  <p className="text-xs text-slate-500">Delivered directly to the official Institution ID inbox</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Student Privilege
              </span>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Institution Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Institution ID / College
                  </label>
                  <select
                    value={targetCollegeId}
                    onChange={e => setTargetCollegeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {colleges.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grievance Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Grievance Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="faculty_conduct">Faculty Conduct / Teaching Pace & Guidance</option>
                    <option value="classroom_issue">Classroom Environment & Practical Lectures</option>
                    <option value="lab_infrastructure">Lab Hardware, Projector & Equipment Malfunction</option>
                    <option value="grading_dispute">Internal Evaluation / Grading Dispute</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Faculty Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Faculty / Staff Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetFacultyName}
                    onChange={e => setTargetFacultyName(e.target.value)}
                    placeholder="e.g. Dr. K. Ramanathan (or leave blank if general dept)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Subject / Course Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject Name / Course Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectOrCourse}
                    onChange={e => setSubjectOrCourse(e.target.value)}
                    placeholder="e.g. MCA-204 Distributed Cloud Architecture"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Detailed Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Grievance Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={detailedComplaint}
                  onChange={e => setDetailedComplaint(e.target.value)}
                  placeholder="Provide objective facts: dates, specific issues with teaching, missing equipment, unfair grading remarks, etc..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  {isAnonymousToFaculty ? (
                    <EyeOff className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Shield Student Identity from Faculty
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Your name and roll number will be withheld from the faculty member and accessible only to institution admin.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymousToFaculty(!isAnonymousToFaculty)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isAnonymousToFaculty
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAnonymousToFaculty ? 'Protected (Active)' : 'Revealed'}
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Transmit Grievance Securely
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Tracking Section: My Filed Grievances */}
        {currentUser.role === 'student' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              My Submitted Grievance Status ({studentReports.length})
            </h3>
            {studentReports.length === 0 ? (
              <p className="text-xs text-slate-500 italic">You have no active grievance submissions on file.</p>
            ) : (
              <div className="space-y-3">
                {studentReports.map(rep => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rep.subjectOrCourse}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold capitalize bg-white border border-slate-200 text-slate-700">
                          {rep.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        rep.status === 'action_taken'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rep.status === 'resolved'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {rep.status === 'action_taken' ? 'Action Taken' : rep.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rep.detailedComplaint}</p>

                    {rep.institutionRemarks && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-800">Institution Official Resolution:</span>
                        <p className="text-slate-600">{rep.institutionRemarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Institution / Admin Review Section */}
        {isInstitutionOrAdmin && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Institution Grievance Review Desk</h2>
                  <p className="text-xs text-slate-500">
                    Confidential submissions addressed to {currentUser.collegeName || 'Your Institution ID'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {currentUser.role.toUpperCase()} ACCESS
              </span>
            </div>

            {institutionReports.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active grievance submissions pending for this institution ID.
              </div>
            ) : (
              <div className="space-y-4">
                {institutionReports.map(rep => (
                  <div key={rep.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{rep.id.slice(-6)}</span>
                          <span className="text-sm font-bold text-slate-900">{rep.subjectOrCourse}</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {rep.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Submitted by: <strong>{rep.studentName}</strong> • Target Faculty: {rep.targetFacultyName || 'General Dept'}
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        rep.status === 'action_taken'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rep.status === 'resolved'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {rep.status === 'action_taken' ? 'Action Taken' : rep.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rep.detailedComplaint}
                    </div>

                    {rep.institutionRemarks ? (
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                        <span className="font-bold text-purple-900">Your Official Resolution on File:</span>
                        <p className="text-purple-800">{rep.institutionRemarks}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {activeReportToResolve === rep.id ? (
                          <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
                            <label className="block text-xs font-bold text-slate-800">
                              Resolution Remarks & Corrective Action
                            </label>
                            <textarea
                              rows={2}
                              value={resolutionRemarks}
                              onChange={e => setResolutionRemarks(e.target.value)}
                              placeholder="e.g. Work order dispatched to IT maintenance; faculty notified for teaching pace adjustment."
                              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                            <div className="flex items-center justify-between">
                              <select
                                value={resolutionStatus}
                                onChange={e => setResolutionStatus(e.target.value as any)}
                                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                              >
                                <option value="action_taken">Action Taken (Maintenance / Notice)</option>
                                <option value="resolved">Resolved Completely</option>
                                <option value="under_investigation">Under Investigation</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveReportToResolve(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveSubmit(rep.id)}
                                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                                >
                                  Submit Action
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReportToResolve(rep.id);
                              setResolutionRemarks('');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors"
                          >
                            Resolve Grievance & Add Action Remarks
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
