'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, User, LogIn } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import CareerCopilot from '@/components/student/CareerCopilot';

export default function CareerClient() {
  const { currentUser, isAuthenticated } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#1687D4] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Campus Feed</span>
        </Link>

        {currentUser && (
          <Link
            href={currentUser.username ? `/user/${currentUser.username}` : '/profile'}
            className="text-xs font-semibold text-slate-600 hover:text-[#1687D4] transition flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>View My Profile</span>
          </Link>
        )}
      </div>

      {!isAuthenticated || !currentUser ? (
        <div className="apple-card p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1687D4] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Sign in to Access Your Career Copilot</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The AI Career Copilot personalizes placement guidance, resumes, and interview questions directly from your verified student profile and skills database.
          </p>
          <div className="pt-2">
            <Link href="/login" className="apple-button-primary text-xs !py-2 !px-6 font-bold inline-flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Continue</span>
            </Link>
          </div>
        </div>
      ) : (
        <CareerCopilot />
      )}
    </div>
  );
}
