'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Building, Star, Bookmark, Filter, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
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
      {/* Search Header Hero */}
      <div className="apple-card p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-[#2563EB]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Discovery Engine</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
            Explore Campus Ecosystems
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Search across colleges with verified evidence, honest placement records, and transparent reviews directly submitted by students and alumni.
          </p>
        </div>

        {/* Input Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by college name, city (e.g. Coimbatore), or course (e.g. MCA, AI)..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[#64748B]">
            <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-semibold text-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Autonomous">Autonomous</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[#64748B]">
            <span className="font-medium">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent font-semibold text-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Showing {filteredColleges.length} Verified Institutions
        </p>
        <Link
          href="/compare"
          className="flex items-center space-x-1.5 text-xs font-bold text-[#2563EB] hover:underline transition"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Launch Comparison Matrix</span>
        </Link>
      </div>

      {/* College Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredColleges.map((col, idx) => {
          const isSaved = savedCollegeIds.includes(col.id);
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="apple-card apple-card-hover flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#2563EB]">
                      {col.collegeType}
                    </span>
                    <h2 className="mt-2 text-base font-bold text-[#0F172A]">
                      {col.name}
                    </h2>
                    <div className="mt-1 flex items-center space-x-1.5 text-xs text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
                      <span>{col.location}, {col.state}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveCollege(col.id)}
                    className={`rounded-xl p-2.5 transition-all ${
                      isSaved
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save for Comparison'}
                  >
                    <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Score Indicators */}
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-center text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">Rating</p>
                    <div className="mt-1 flex items-center justify-center space-x-1 font-bold text-[#D97706]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{col.ratingAverage || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">Reviews</p>
                    <p className="mt-1 font-bold text-[#0F172A]">{col.reviewCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">Avg. Package</p>
                    <p className="mt-1 font-bold text-[#059669]">
                      {col.placementStats?.averagePackage || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Course pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {col.courses.slice(0, 3).map((crs) => (
                    <span
                      key={crs}
                      className="rounded-md bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569]"
                    >
                      {crs}
                    </span>
                  ))}
                  {col.courses.length > 3 && (
                    <span className="rounded-md bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-[#94A3B8]">
                      +{col.courses.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action link */}
              <div className="mt-6 border-t border-[#F1F5F9] pt-4">
                <Link
                  href={`/colleges/${col.slug}`}
                  className="flex items-center justify-between text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  <span>Explore Verified Data & Community Reviews</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
