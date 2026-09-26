'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Building, Star, Bookmark, Filter, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function ExplorePage() {
  const { colleges, savedCollegeIds, toggleSaveCollege } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  const filteredColleges = colleges.filter((col) => {
    const matchesSearch =
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.courses.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || col.collegeType === selectedType;
    const matchesState = selectedState === 'All' || col.state === selectedState;
    return matchesSearch && matchesType && matchesState;
  });

  return (
    <div className="space-y-6">
      {/* Search & Hero Header */}
      <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6">
        <h1 className="text-xl font-bold text-[#F8FAFC]">Explore & Discover Colleges</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Find colleges through authentic student reviews, real placement statistics, and official institutional information.
        </p>

        {/* Search input bar */}
        <div className="mt-5 relative">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by college name, city (e.g. Coimbatore), or course (e.g. MCA, B.Tech)..."
            className="w-full rounded-xl border border-[#1E3A5F] bg-[#162D4A] py-2.5 pl-11 pr-4 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#38E6A5] focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 rounded-lg border border-[#1E3A5F] bg-[#162D4A] px-3 py-1.5 text-[#94A3B8]">
            <Filter className="h-3.5 w-3.5" />
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-medium text-[#F8FAFC] focus:outline-none"
            >
              <option value="All" className="bg-[#112238]">All Types</option>
              <option value="Autonomous" className="bg-[#112238]">Autonomous</option>
              <option value="Government" className="bg-[#112238]">Government</option>
              <option value="Private" className="bg-[#112238]">Private</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 rounded-lg border border-[#1E3A5F] bg-[#162D4A] px-3 py-1.5 text-[#94A3B8]">
            <span>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent font-medium text-[#F8FAFC] focus:outline-none"
            >
              <option value="All" className="bg-[#112238]">All States</option>
              <option value="Tamil Nadu" className="bg-[#112238]">Tamil Nadu</option>
              <option value="Karnataka" className="bg-[#112238]">Karnataka</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Showing {filteredColleges.length} Verified Institutions
        </p>
        <Link
          href="/compare"
          className="flex items-center space-x-1 text-xs font-semibold text-[#38E6A5] hover:underline"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Compare Institutions</span>
        </Link>
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredColleges.map((col) => {
          const isSaved = savedCollegeIds.includes(col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col justify-between rounded-xl border border-[#1E3A5F] bg-[#112238] p-5 transition hover:border-[#38E6A5]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-[#162D4A] px-2 py-0.5 text-[10px] font-semibold text-[#5B8CFF]">
                      {col.collegeType}
                    </span>
                    <h2 className="mt-2 text-base font-bold text-[#F8FAFC]">
                      {col.name}
                    </h2>
                    <div className="mt-1 flex items-center space-x-1 text-xs text-[#94A3B8]">
                      <MapPin className="h-3.5 w-3.5 text-[#38E6A5]" />
                      <span>{col.location}, {col.state}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveCollege(col.id)}
                    className={`rounded-lg p-2 transition ${
                      isSaved ? 'bg-[#38E6A5]/20 text-[#38E6A5]' : 'bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save for Comparison'}
                  >
                    <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Rating & Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-[#162D4A] p-2.5 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-[#94A3B8]">Student Rating</p>
                    <div className="mt-0.5 flex items-center justify-center space-x-1 font-bold text-[#FBBF24]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{col.ratingAverage || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8]">Reviews</p>
                    <p className="mt-0.5 font-bold text-[#F8FAFC]">{col.reviewCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8]">Avg. Package</p>
                    <p className="mt-0.5 font-bold text-[#38E6A5]">
                      {col.placementStats?.averagePackage || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Popular Courses Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {col.courses.slice(0, 3).map((crs) => (
                    <span
                      key={crs}
                      className="rounded bg-[#07111F] px-2 py-0.5 text-[11px] text-[#94A3B8]"
                    >
                      {crs}
                    </span>
                  ))}
                  {col.courses.length > 3 && (
                    <span className="rounded bg-[#07111F] px-2 py-0.5 text-[11px] text-[#94A3B8]">
                      +{col.courses.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* View Profile Action Link */}
              <div className="mt-5 border-t border-[#1E3A5F] pt-3">
                <Link
                  href={`/colleges/${col.slug}`}
                  className="flex items-center justify-between text-xs font-semibold text-[#38E6A5] hover:text-[#70F3C1]"
                >
                  <span>View Official & Student Evidence</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
