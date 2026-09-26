'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Award, Shield, Star, ThumbsUp, ThumbsDown, MessageSquareQuote, CheckCircle, ArrowLeft, Bookmark, ExternalLink } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion } from 'framer-motion';

export default function CollegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { colleges, reviews, savedCollegeIds, toggleSaveCollege, currentUser, addInstitutionReply } = useApp();

  const college = colleges.find((c) => c.slug === resolvedParams.slug);

  if (!college) {
    notFound();
  }

  const collegeReviews = reviews.filter((r) => r.collegeId === college.id);
  const isSaved = savedCollegeIds.includes(college.id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#38E6A5] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to College Directory</span>
      </Link>

      {/* College Hero Header Card */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-[#192D48] px-2.5 py-0.5 text-xs font-bold text-[#5B8CFF]">
                {college.collegeType} Institution
              </span>
              <span className="rounded-md bg-[#38E6A5]/15 px-2 py-0.5 text-xs font-bold text-[#38E6A5]">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">{college.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#94A3B8]">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-[#38E6A5]" />
                <span>{college.location}, {college.state}</span>
              </div>
              <span>•</span>
              <a
                href={college.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-[#38E6A5] hover:underline"
              >
                <span>Official Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleSaveCollege(college.id)}
              className={`apple-button-secondary text-xs flex items-center space-x-2 ${
                isSaved ? '!border-[#38E6A5] !text-[#38E6A5]' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <Link
              href="/create"
              className="apple-button-primary text-xs"
            >
              Write Review
            </Link>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#1F3653] pt-6">
          <div className="rounded-xl bg-[#192D48] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-xl font-black text-[#F59E0B]">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || 'No ratings yet'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#192D48] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Student Reviews</p>
            <p className="mt-1 text-xl font-black text-[#F8FAFC]">{college.reviewCount}</p>
          </div>
          <div className="rounded-xl bg-[#192D48] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Placement Rate</p>
            <p className="mt-1 text-xl font-black text-[#38E6A5]">
              {college.placementStats?.placementRate || 'Not available'}
            </p>
          </div>
          <div className="rounded-xl bg-[#192D48] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Highest Package</p>
            <p className="mt-1 text-xl font-black text-[#38E6A5]">
              {college.placementStats?.highestPackage || 'Not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Pillars: Official vs Community */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Layer A: Official Information */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#1F3653] pb-4 text-[#5B8CFF]">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Official Overview</p>
              <p className="mt-1.5 leading-relaxed text-[#F8FAFC]">
                {college.officialOverview || 'Information not available yet.'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Academic Programs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.courses.map((crs) => (
                  <span key={crs} className="rounded-lg bg-[#192D48] border border-[#1F3653] px-3 py-1 text-[#F8FAFC] font-medium">
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Campus Facilities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.facilities.map((fac) => (
                  <span key={fac} className="rounded-lg bg-[#0B1320] border border-[#1F3653] px-2.5 py-1 text-[#94A3B8]">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Annual Fee Structure</p>
              <p className="mt-1 text-sm font-bold text-[#38E6A5]">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#94A3B8]">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Community Experience */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#1F3653] pb-4 text-[#38E6A5]">
            <Shield className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Community Experience (Real Student & Alumni Voice)
            </h2>
          </div>

          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Real feedback from students and alumni. As per platform policy, institutions are prohibited from removing criticism or altering ratings.
          </p>

          <div className="space-y-4">
            {collegeReviews.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">Not enough data. Be the first to share an evaluation.</p>
            ) : (
              collegeReviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-[#1F3653] bg-[#192D48] p-5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">
                      {rev.isAnonymous ? 'Anonymous Student' : rev.authorName}
                    </span>
                    <span className="rounded-md bg-[#0B1320] px-2.5 py-0.5 text-[10px] uppercase font-bold text-[#38E6A5]">
                      {rev.reviewerType} • {rev.batch}
                    </span>
                  </div>

                  <p className="font-bold text-[#F8FAFC]">{rev.title}</p>
                  <p className="text-[#94A3B8] leading-relaxed">{rev.experience}</p>

                  {/* Pros & Cons */}
                  <div className="space-y-1.5 border-t border-[#1F3653] pt-3">
                    {rev.pros.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#38E6A5]">
                        <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Pros:</strong> {rev.pros.join(', ')}</span>
                      </div>
                    )}
                    {rev.cons.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#F59E0B]">
                        <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Cons:</strong> {rev.cons.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Institutional Reply */}
                  {rev.institutionReply ? (
                    <div className="mt-3 rounded-lg border border-[#1F3653] bg-[#132238] p-3">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#5B8CFF]">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span>{rev.institutionReply.officialName}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#94A3B8] leading-relaxed">
                        "{rev.institutionReply.text}"
                      </p>
                    </div>
                  ) : (
                    currentUser?.role === 'institution' && (
                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => {
                            const reply = prompt('Enter official institutional response to this review:');
                            if (reply) addInstitutionReply(rev.id, reply);
                          }}
                          className="apple-button-secondary text-[11px] !py-1 !px-2.5 text-[#38E6A5]"
                        >
                          + Reply as Official Institution
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
