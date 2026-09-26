'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Award, Shield, Star, ThumbsUp, ThumbsDown, MessageSquareQuote, CheckCircle, ArrowLeft, Bookmark } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

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
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#38E6A5]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to College Directory</span>
      </Link>

      {/* College Hero Header */}
      <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#162D4A] px-2.5 py-0.5 text-xs font-semibold text-[#5B8CFF]">
                {college.collegeType} Institution
              </span>
              <span className="rounded bg-[#38E6A5]/10 px-2 py-0.5 text-xs font-semibold text-[#38E6A5]">
                Est. {college.establishedYear}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-[#F8FAFC]">{college.name}</h1>
            <div className="mt-2 flex items-center space-x-2 text-sm text-[#94A3B8]">
              <MapPin className="h-4 w-4 text-[#38E6A5]" />
              <span>{college.location}, {college.state}</span>
              <span>•</span>
              <a href={college.websiteUrl} target="_blank" rel="noreferrer" className="text-[#38E6A5] hover:underline">
                Official Website
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleSaveCollege(college.id)}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                isSaved
                  ? 'bg-[#38E6A5] text-[#07111F]'
                  : 'border border-[#1E3A5F] bg-[#162D4A] text-[#F8FAFC] hover:border-[#38E6A5]'
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Research' : 'Save College'}</span>
            </button>
            <Link
              href="/create"
              className="rounded-lg bg-[#5B8CFF] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-blue-600"
            >
              Write Review
            </Link>
          </div>
        </div>

        {/* Rating Overview Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#1E3A5F] pt-6">
          <div className="rounded-lg bg-[#162D4A] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Average Rating</p>
            <div className="mt-1 flex items-center justify-center space-x-1 text-lg font-bold text-[#FBBF24]">
              <Star className="h-5 w-5 fill-current" />
              <span>{college.ratingAverage || 'No ratings yet'}</span>
            </div>
          </div>
          <div className="rounded-lg bg-[#162D4A] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Total Reviews</p>
            <p className="mt-1 text-lg font-bold text-[#F8FAFC]">{college.reviewCount}</p>
          </div>
          <div className="rounded-lg bg-[#162D4A] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Placement Rate</p>
            <p className="mt-1 text-lg font-bold text-[#38E6A5]">
              {college.placementStats?.placementRate || 'Information not available yet.'}
            </p>
          </div>
          <div className="rounded-lg bg-[#162D4A] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Highest Package</p>
            <p className="mt-1 text-lg font-bold text-[#38E6A5]">
              {college.placementStats?.highestPackage || 'Information not available yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* TWO SEPARATED BLOCKS: SPEC REQUIREMENT (Separation of Official Information from Community Experience) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Layer A: Official Institutional Information */}
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5">
          <div className="flex items-center space-x-2 border-b border-[#1E3A5F] pb-3 text-[#5B8CFF]">
            <Building2 className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
              Official Information (Published by Institution)
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#94A3B8]">Official Overview</p>
              <p className="mt-1 leading-relaxed text-[#F8FAFC]">
                {college.officialOverview || 'Information not available yet.'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#94A3B8]">Programs & Courses Offered</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {college.courses.map((crs) => (
                  <span key={crs} className="rounded bg-[#162D4A] px-2.5 py-1 text-[#F8FAFC]">
                    {crs}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#94A3B8]">Campus Facilities</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {college.facilities.map((fac) => (
                  <span key={fac} className="rounded border border-[#1E3A5F] px-2.5 py-1 text-[#94A3B8]">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#94A3B8]">Fee Structure</p>
              <p className="mt-1 text-[#F8FAFC]">
                ₹{college.feesMin?.toLocaleString()} — ₹{college.feesMax?.toLocaleString()} / year
              </p>
              <p className="text-[11px] text-[#94A3B8]">{college.feesDescription}</p>
            </div>
          </div>
        </div>

        {/* Layer B: Student & Alumni Verified Experience */}
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5">
          <div className="flex items-center space-x-2 border-b border-[#1E3A5F] pb-3 text-[#38E6A5]">
            <Shield className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
              Community Experience (Real Student & Alumni Voice)
            </h2>
          </div>

          <p className="mt-3 text-xs text-[#94A3B8]">
            Direct reports from students on hostels, faculty honesty, and placement reality. Institutions cannot remove negative feedback.
          </p>

          <div className="mt-4 space-y-4">
            {collegeReviews.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">Not enough data. Be the first to submit a review.</p>
            ) : (
              collegeReviews.map((rev) => (
                <div key={rev.id} className="rounded-lg bg-[#162D4A] p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F8FAFC]">
                      {rev.isAnonymous ? 'Anonymous Student' : rev.authorName}
                    </span>
                    <span className="rounded bg-[#07111F] px-2 py-0.5 text-[10px] uppercase font-bold text-[#38E6A5]">
                      {rev.reviewerType} • {rev.batch}
                    </span>
                  </div>

                  <p className="mt-2 font-bold text-[#F8FAFC]">{rev.title}</p>
                  <p className="mt-1 text-[#94A3B8] leading-relaxed">{rev.experience}</p>

                  {/* Pros & Cons */}
                  <div className="mt-3 space-y-1.5 border-t border-[#1E3A5F] pt-2">
                    {rev.pros.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#38E6A5]">
                        <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" />
                        <span><strong>Pros:</strong> {rev.pros.join(', ')}</span>
                      </div>
                    )}
                    {rev.cons.length > 0 && (
                      <div className="flex items-start space-x-2 text-[11px] text-[#FBBF24]">
                        <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" />
                        <span><strong>Cons:</strong> {rev.cons.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Institutional Official Response (Cannot edit/delete review) */}
                  {rev.institutionReply ? (
                    <div className="mt-3 rounded border border-[#1E3A5F] bg-[#112238] p-2.5">
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#5B8CFF]">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span>{rev.institutionReply.officialName}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#94A3B8]">
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
                          className="rounded border border-[#1E3A5F] bg-[#112238] px-2.5 py-1 text-[11px] font-semibold text-[#38E6A5] hover:border-[#38E6A5]"
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
