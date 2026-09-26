'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  Scale,
  Shield,
  Terminal,
  LogIn,
  Layers
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Compare', href: '/compare', icon: Scale },
    { label: 'Servers', href: '/servers', icon: MessageSquare },
    { label: 'Grievance', href: '/grievance', icon: Shield },
    ...(currentUser.role === 'admin'
      ? [{ label: 'Admin CLI', href: '/admin', icon: Terminal }]
      : []),
    { label: 'Portals', href: '/login', icon: LogIn },
    { label: 'Profile', href: `/user/${currentUser.username}`, icon: User },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2.5 flex-shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white font-black text-lg transition-transform group-hover:scale-105 shadow-sm">
              CL
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#0F172A]">
                CAMPUS<span className="text-[#2563EB]">LENZ</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                College Ecosystem
              </span>
            </div>
          </Link>

          {/* Quick Search Shortcut Bar (Instagram-Inspired in Header) */}
          <div className="hidden lg:block flex-1 max-w-xs mx-4">
            <Link
              href="/search"
              className="flex items-center space-x-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1.5 text-xs text-[#94A3B8] hover:border-[#2563EB] hover:text-[#0F172A] transition-all"
            >
              <Search className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="truncate">Search students, alumni, colleges...</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-[#2563EB] bg-[#EFF6FF]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#2563EB] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Active Persona Role Selector & Quick Portal Switcher */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative">
              <select
                value={currentUser?.role === 'staff' ? 'faculty' : (currentUser?.role || 'student')}
                onChange={(e) => switchRole(e.target.value as any)}
                aria-label="Testing Role Switcher"
                className="appearance-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-3 pr-7 py-1.5 text-xs font-bold text-[#2563EB] focus:outline-none focus:border-[#2563EB] cursor-pointer transition hover:bg-[#F1F5F9]"
              >
                <option value="student">🎓 Student</option>
                <option value="alumni">💼 Alumni</option>
                <option value="institution">🏛️ Institution</option>
                <option value="faculty">📚 Faculty</option>
                <option value="admin">🛡️ Admin (Dev)</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2 text-xs text-[#2563EB]">
                ▾
              </div>
            </div>

            <Link
              href="/login"
              title="Open Role Portals & Permission Breakdown"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portals</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Mobile-First Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#E2E8F0] bg-white shadow-lg md:hidden">
        <div className="grid h-16 grid-cols-7 items-center px-1">
          {[
            { label: 'Home', href: '/', icon: Home },
            { label: 'Search', href: '/search', icon: Search },
            { label: 'Explore', href: '/explore', icon: Compass },
            { label: 'Compare', href: '/compare', icon: Scale },
            { label: 'Servers', href: '/servers', icon: MessageSquare },
            { label: 'Grievance', href: '/grievance', icon: Shield },
            { label: 'Portals', href: '/login', icon: LogIn }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="mt-1 text-[9px] font-semibold tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-1 h-1 w-1 rounded-full bg-[#2563EB]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
