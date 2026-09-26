'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Star, ShieldAlert, Check, X, Scale } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { colleges, savedCollegeIds } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>(
    savedCollegeIds.slice(0, 3).length > 0 ? savedCollegeIds.slice(0, 3) : ['col-psg', 'col-ceg']
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare a maximum of 3 colleges simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedColleges = colleges.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-[#2563EB]">
          <Scale className="h-5 w-5" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Objective Comparison Matrix
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
          Compare up to three institutions side-by-side. Campus Lenz strictly follows transparent data presentation without synthetic AI scores.
        </p>

        {/* Selection badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#64748B]">Select Institutions (Max 3):</span>
          {colleges.map((col) => {
            const isChosen = selectedIds.includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggleSelect(col.id)}
                className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all duration-200 ${
                  isChosen
                    ? 'bg-[#2563EB] text-white shadow-sm scale-102'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                }`}
              >
                {col.name.split(' ')[0]} {isChosen ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {selectedColleges.length === 0 ? (
        <div className="apple-card p-10 text-center text-xs text-[#64748B]">
          No colleges selected. Please choose up to three colleges from above to view the side-by-side comparison.
        </div>
      ) : (
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]">
                <tr>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B] w-1/4">
                    Evaluation Dimension
                  </th>
                  {selectedColleges.map((col) => (
                    <th key={col.id} className="p-4 sm:p-5 font-bold text-sm">
                      <Link href={`/colleges/${col.slug}`} className="hover:text-[#2563EB] transition-colors">
                        {col.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Institution Type</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5">{col.collegeType}</td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Location & State</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5">{col.location}, {col.state}</td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Student Rating</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5">
                      <span className="font-black text-[#D97706]">★ {col.ratingAverage || 'No ratings'}</span>
                      <span className="text-[#94A3B8] ml-1.5">({col.reviewCount} reviews)</span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Annual Fee Range</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5 font-bold text-[#059669]">
                      ₹{col.feesMin?.toLocaleString()} — ₹{col.feesMax?.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Highest Package</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5 font-bold text-[#0F172A]">
                      {col.placementStats?.highestPackage || 'Information not available yet.'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Average Package</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5 font-bold text-[#059669]">
                      {col.placementStats?.averagePackage || 'Information not available yet.'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Placement Rate</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5">
                      {col.placementStats?.placementRate || 'Information not available yet.'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-[#64748B]">Campus Facilities</td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-4 sm:p-5 text-[#475569]">
                      {col.facilities.join(', ')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
