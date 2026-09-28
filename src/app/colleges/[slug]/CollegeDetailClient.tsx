'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Award, Shield, Star, ThumbsUp, ThumbsDown, MessageSquareQuote, CheckCircle, ArrowLeft, Bookmark, ExternalLink } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function CollegeDetailClient({
  slug,
  initialCollege,
  initialReviews = [],
}: {
  slug: string;
  initialCollege?: any;
  initialReviews?: any[];
}) {
  const { colleges, reviews, savedCollegeIds, toggleSaveCollege, currentUser, addInstitutionReply } = useApp();

  const college = colleges.find((c) => c.slug === slug) || initialCollege;

  if (!college) {
    notFound();
  }

  const appReviews = reviews.filter((r) => r.collegeId === college.id);
  const collegeReviews = appReviews.length > 0 ? appReviews : initialReviews;
  const isSaved = savedCollegeIds.includes(college.id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to College Directory</span>
      </Link>

      {/* College Hero Header Card */}
      <div className="ocean-glass-card touch-over-glass p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-sky-100/90 px-3 py-0.5 text-xs font-bold text-sky-800 border border-sky-200/80">
                {college.collegeType} Institution
              </span>
              <span className="rounded-full bg-cyan-50 px-3 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">{college.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-sky-850">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-sky-600" />
                <span className="font-medium text-sky-900">{college.location}, {college.state}</span>
              </div>
              <span>•</span>
              <a
                href={college.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-sky-600 hover:text-sky-800 font-semibold hover:underline"
              >
                <span>Official Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleSaveCollege(college.id)}
              className={`ocean-glossy-pill-subtle text-xs flex items-center space-x-2 !py-2 !px-4 ${
                isSaved ? '!border-sky-400 !text-sky-600 bg-sky-50' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <Link
              href="/create"
              className="ocean-glossy-button text-xs !py-2 !px-5"
            >
              Write Review
            </Link>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-sky-100/80 pt-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 p-4 text-center shadow-xs">
            <p className="text-[10px] uppercase font-bold text-sky-800/70">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-xl font-black text-amber-600">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || 'No ratings yet'}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 p-4 text-center shadow-xs">
            <p className="text-[10px] uppercase font-bold text-sky-800/70">Student Reviews</p>
            <p className="mt-1 text-xl font-black text-sky-950">{college.reviewCount}</p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 p-4 text-center shadow-xs">
            <p className="text-[10px] uppercase font-bold text-sky-800/70">Placement Rate</p>
            <p className="mt-1 text-xl font-black text-emerald-600">
              {college.placementStats?.placementRate || 'Not available'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 p-4 text-center shadow-xs">
            <p className="text-[10px] uppercase font-bold text-sky-800/70">Highest Package</p>
            <p className="mt-1 text-xl font-black text-emerald-600">
              {college.placementStats?.highestPackage || 'Not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Pillars: Official vs Community */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Layer A: Official Information */}
        <div className="ocean-glass-card p-6 space-y-5 rounded-[28px] border border-white/80 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-sky-100/80 pb-4 text-sky-600">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-950">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-sky-800/70 uppercase tracking-wider text-[10px]">Official Overview</p>
              <p className="mt-1.5 leading-relaxed text-sky-950 font-medium">
                {college.officialOverview || 'Information not available yet.'}
              </p>
            </div>

            <div>
              <p className="font-bold text-sky-800/70 uppercase tracking-wider text-[10px]">Academic Programs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.courses?.map((crs: string) => (
                  <span key={crs} className="rounded-full bg-sky-100/80 border border-sky-200/70 px-3.5 py-1 text-sky-950 font-semibold">
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-sky-800/70 uppercase tracking-wider text-[10px]">Campus Facilities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.facilities?.map((fac: string) => (
                  <span key={fac} className="rounded-full bg-white/80 border border-white/90 px-3 py-1 text-sky-800 font-medium shadow-xs">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-sky-800/70 uppercase tracking-wider text-[10px]">Annual Fee Structure</p>
              <p className="mt-1 text-sm font-black text-emerald-600">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()}
              </p>
              <p className="text-[11px] text-sky-800/70 font-medium">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Community Experience */}
        <div className="ocean-glass-card p-6 space-y-5 rounded-[28px] border border-white/80 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-sky-100/80 pb-4 text-emerald-600">
            <Shield className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-950">
              Community Experience (Real Student & Alumni Voice)
            </h2>
          </div>

          <p className="text-xs text-sky-800/80 leading-relaxed font-medium">
            Real feedback from students and alumni. As per platform policy, institutions are prohibited from removing criticism or altering ratings.
          </p>

          <div className="space-y-4">
            {collegeReviews.length === 0 ? (
              <p className="text-xs text-sky-700/70 font-medium">Not enough data. Be the first to share an evaluation.</p>
            ) : (
              collegeReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-sky-100/80 bg-white/70 backdrop-blur-md p-5 text-xs space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">
                      {rev.isAnonymous ? 'Anonymous Student' : rev.authorName}
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[10px] uppercase font-bold text-emerald-800">
                      {rev.reviewerType} • {rev.batch}
                    </span>
                  </div>

                  <p className="font-bold text-sky-950">{rev.title}</p>
                  <p className="text-sky-900/80 leading-relaxed font-medium">{rev.experience}</p>

                  {/* Pros & Cons */}
                  <div className="space-y-1.5 border-t border-sky-100/80 pt-3">
                    {rev.pros.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-emerald-700 font-medium">
                        <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Pros:</strong> {rev.pros.join(', ')}</span>
                      </div>
                    )}
                    {rev.cons.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-amber-700 font-medium">
                        <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Cons:</strong> {rev.cons.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Institutional Reply */}
                  {rev.institutionReply ? (
                    <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-800">
                        <MessageSquareQuote className="h-3.5 w-3.5 text-sky-600" />
                        <span>{rev.institutionReply.officialName}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-sky-950 leading-relaxed font-medium">
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
                          className="ocean-glossy-pill-subtle text-[11px] !py-1 !px-3 text-sky-700 font-bold"
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
