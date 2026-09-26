'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  UserPlus,
  CheckCircle2,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
    { label: 'Profile', href: `/user/${currentUser.username}`, icon: User },
  ];

  const roleColorBadge =
    currentUser.role === 'institution'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : currentUser.role === 'alumni'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : currentUser.role === 'faculty'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : currentUser.role === 'admin'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  const RoleIcon =
    currentUser.role === 'institution' ? Building2 :
    currentUser.role === 'alumni' ? Briefcase :
    currentUser.role === 'faculty' ? BookOpen :
    currentUser.role === 'admin' ? Terminal :
    GraduationCap;

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

          {/* Professional User Authentication Section (No Inbuilt Role Switcher!) */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* User Info Capsule */}
                <Link
                  href={`/user/${currentUser.username}`}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${roleColorBadge} uppercase tracking-wider`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Professional Sign Out Button */}
                <button
                  onClick={handleLogout}
                  title="Sign out of active account"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Mobile-First Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#E2E8F0] bg-white shadow-lg md:hidden">
        <div className="grid h-16 grid-cols-6 items-center px-1">
          {[
            { label: 'Home', href: '/', icon: Home },
            { label: 'Search', href: '/search', icon: Search },
            { label: 'Explore', href: '/explore', icon: Compass },
            { label: 'Compare', href: '/compare', icon: Scale },
            { label: 'Servers', href: '/servers', icon: MessageSquare },
            { label: 'Profile', href: `/user/${currentUser.username}`, icon: User }
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
