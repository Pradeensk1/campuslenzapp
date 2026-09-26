'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Compare', href: '/compare', icon: ShieldCheck },
    { label: 'Create', href: '/create', icon: PlusCircle },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E3A5F] bg-[#112238] px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#38E6A5] text-[#07111F] font-black text-lg">
              CL
            </span>
            <span className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              CAMPUS<span className="text-[#38E6A5]">LENZ</span>
            </span>
          </Link>

          {/* Quick Role Switcher for Testing all Spec Personas */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-xs text-[#94A3B8]">Testing Role:</span>
            <select
              value={currentUser?.role || 'student'}
              onChange={(e) => switchRole(e.target.value as any)}
              className="rounded-md border border-[#1E3A5F] bg-[#162D4A] px-2.5 py-1 text-xs font-semibold text-[#38E6A5] focus:outline-none focus:ring-1 focus:ring-[#38E6A5]"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="institution">Institution</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation (Spec Phase 1 requirement) */}
      <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-[#1E3A5F] bg-[#112238] md:hidden">
        <div className="grid h-16 grid-cols-6 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive ? 'text-[#38E6A5]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
