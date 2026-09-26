'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Star, ShieldAlert, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { colleges, savedCollegeIds } = useApp();

  // Allow selecting up to 3 colleges as per specification
  const [selectedIds, setSelectedIds] = useState<string[]>(
    savedCollegeIds.slice(0, 3).length > 0 ? savedCollegeIds.slice(0, 3) : ['col-psg', 'col-ceg']
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare a maximum of 3 colleges simultaneously as per specification.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedColleges = colleges.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-6">
        <h1 className="text-xl font-bold text-[#F8FAFC]">Multi-College Evidence Comparison</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Compare up to three institutions objectively across academic parameters, fees, placements, and hostel ratings.
        </p>

        {/* College Selector Badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="self-center text-[#94A3B8]">Select (Max 3):</span>
          {colleges.map((col) => {
            const isChosen = selectedIds.includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggleSelect(col.id)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  isChosen
                    ? 'bg-[#38E6A5] text-[#07111F]'
                    : 'border border-[#1E3A5F] bg-[#162D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {col.name.split(' ')[0]} {isChosen ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transparent Evaluation Rule Notice */}
      <div className="rounded-lg border border-[#1E3A5F] bg-[#162D4A] p-4 text-xs text-[#94A3B8]">
        <span className="font-bold text-[#38E6A5]">Transparent Ranking Principle:</span> Campus Lenz presents underlying empirical data side-by-side rather than assigning black-box synthetic AI scores. You make the final decision.
      </div>

      {/* Comparison Matrix Table */}
      {selectedColleges.length === 0 ? (
        <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-8 text-center text-sm text-[#94A3B8]">
          No colleges selected. Please choose up to three colleges from above to view comparison.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1E3A5F] bg-[#112238]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#1E3A5F] bg-[#162D4A] text-[#F8FAFC]">
              <tr>
                <th className="p-4 font-bold text-[#94A3B8] w-1/4">Evaluation Dimension</th>
                {selectedColleges.map((col) => (
                  <th key={col.id} className="p-4 font-bold">
                    <Link href={`/colleges/${col.slug}`} className="hover:text-[#38E6A5]">
                      {col.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F] text-[#F8FAFC]">
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Institution Type</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4">{col.collegeType}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Location & State</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4">{col.location}, {col.state}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Student Rating</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4">
                    <span className="font-bold text-[#FBBF24]">★ {col.ratingAverage || 'No ratings'}</span>
                    <span className="text-[#94A3B8] ml-1">({col.reviewCount} reviews)</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Annual Fee Range</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4 font-semibold text-[#38E6A5]">
                    ₹{col.feesMin?.toLocaleString()} — ₹{col.feesMax?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Highest Package</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4 font-bold">
                    {col.placementStats?.highestPackage || 'Information not available yet.'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Average Package</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4">
                    {col.placementStats?.averagePackage || 'Information not available yet.'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Placement Rate</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4">
                    {col.placementStats?.placementRate || 'Information not available yet.'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-[#94A3B8]">Key Facilities</td>
                {selectedColleges.map((col) => (
                  <td key={col.id} className="p-4 text-[#94A3B8]">
                    {col.facilities.join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
