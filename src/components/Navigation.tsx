'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, MessageSquare, User, Scale } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Compare', href: '/compare', icon: Scale },
    { label: 'Create', href: '/create', icon: PlusCircle },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1F3653] bg-[#132238] shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="group flex items-center space-x-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#38E6A5] text-[#0B1320] font-black text-lg transition-transform group-hover:scale-105">
              CL
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#F8FAFC]">
                CAMPUS<span className="text-[#38E6A5]">LENZ</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                College Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-[#38E6A5] bg-[#192D48]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#192D48]/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#38E6A5] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Active Testing Role Selector */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-xs font-medium text-[#64748B]">Role:</span>
            <div className="relative">
              <select
                value={currentUser?.role || 'student'}
                onChange={(e) => switchRole(e.target.value as any)}
                aria-label="Testing Role Switcher"
                className="appearance-none rounded-lg border border-[#1F3653] bg-[#192D48] pl-3 pr-8 py-1.5 text-xs font-semibold text-[#38E6A5] focus:outline-none focus:border-[#38E6A5] cursor-pointer transition hover:bg-[#203756]"
              >
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="institution">Institution</option>
                <option value="admin">Admin</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-xs text-[#38E6A5]">
                ▾
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#1F3653] bg-[#132238] shadow-lg md:hidden">
        <div className="grid h-16 grid-cols-6 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-[#38E6A5]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="mt-1 text-[10px] font-semibold tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-1 h-1 w-1 rounded-full bg-[#38E6A5]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
