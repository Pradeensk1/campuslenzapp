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
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">
                {college.collegeType} Institution
              </span>
              <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#059669]">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{college.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B]">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-[#2563EB]" />
                <span>{college.location}, {college.state}</span>
              </div>
              <span>•</span>
              <a
                href={college.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-[#2563EB] hover:underline"
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
                isSaved ? '!border-[#2563EB] !text-[#2563EB]' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <Link
              href={`/create?tab=review&collegeId=${college.id}`}
              className="apple-button-primary text-xs"
            >
              Write Review
            </Link>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#F1F5F9] pt-6">
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-xl font-black text-[#D97706]">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || 'No ratings yet'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Student Reviews</p>
            <p className="mt-1 text-xl font-black text-[#0F172A]">{college.reviewCount}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Placement Rate</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.placementRate || 'Not available'}
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-[#64748B]">Highest Package</p>
            <p className="mt-1 text-xl font-black text-[#059669]">
              {college.placementStats?.highestPackage || 'Not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Pillars: Official vs Community */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Layer A: Official Information */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-4 text-[#2563EB]">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Official Overview</p>
              <p className="mt-1.5 leading-relaxed text-[#1E293B]">
                {college.officialOverview || 'Information not available yet.'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Academic Programs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.courses?.map((crs: string) => (
                  <span key={crs} className="rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1 text-[#0F172A] font-medium">
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Campus Facilities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {college.facilities?.map((fac: string) => (
                  <span key={fac} className="rounded-lg bg-white border border-[#E2E8F0] px-2.5 py-1 text-[#64748B]">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">Annual Fee Structure</p>
              <p className="mt-1 text-sm font-bold text-[#059669]">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B]">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Community Experience */}
        <div id="reviews" className="apple-card p-6 space-y-5 scroll-mt-24">
          <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-4 text-[#059669]">
            <Shield className="h-5 w-5" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Community Experience (Real Student & Alumni Voice)
            </h2>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Real feedback from students and alumni. As per platform policy, institutions are prohibited from removing criticism or altering ratings.
          </p>

          <div className="space-y-4">
            {collegeReviews.length === 0 ? (
              <p className="text-xs text-[#64748B]">Not enough data. Be the first to share an evaluation.</p>
            ) : (
              collegeReviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">
                      {rev.isAnonymous ? 'Anonymous Student' : rev.authorName}
                    </span>
                    <span className="rounded-md bg-white border border-[#E2E8F0] px-2.5 py-0.5 text-[10px] uppercase font-bold text-[#059669]">
                      {rev.reviewerType} • {rev.batch}
                    </span>
                  </div>

                  <p className="font-bold text-[#0F172A]">{rev.title}</p>
                  <p className="text-[#475569] leading-relaxed">{rev.experience}</p>

                  {/* Pros & Cons */}
                  <div className="space-y-1.5 border-t border-[#E2E8F0] pt-3">
                    {rev.pros.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#059669]">
                        <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Pros:</strong> {rev.pros.join(', ')}</span>
                      </div>
                    )}
                    {rev.cons.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#D97706]">
                        <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span><strong>Cons:</strong> {rev.cons.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Institutional Reply */}
                  {rev.institutionReply ? (
                    <div className="mt-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#1D4ED8]">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span>{rev.institutionReply.officialName}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#1E3A8A] leading-relaxed">
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
                          className="apple-button-secondary text-[11px] !py-1 !px-2.5 text-[#2563EB]"
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
