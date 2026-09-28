'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Compass,
  Search,
  MessageSquare,
  User,
  Terminal,
  LogIn,
  LogOut,
  UserPlus,
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

  // Hide navigation bar completely on auth pages (Login & Register)
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register');

  if (isAuthPage) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Explore & Compare', href: '/explore', icon: Compass },
    { label: 'Connect Hub', href: '/connect', icon: MessageSquare },
    ...(isAdmin
      ? [{ label: 'Admin CLI', href: '/admin', icon: Terminal }]
      : []),
    ...(currentUser && isAuthenticated
      ? [{ label: 'Profile', href: `/user/${currentUser.username}`, icon: User }]
      : []),
  ];

  const roleColorBadge =
    currentUser?.role === 'institution'
      ? 'bg-[#E8F5FF] text-[#075080] border-[#CFEAFF]'
      : currentUser?.role === 'alumni'
      ? 'bg-[#E8F5FF] text-[#0875BD] border-[#CFEAFF]'
      : currentUser?.role === 'faculty'
      ? 'bg-[#E8F5FF] text-[#1687D4] border-[#CFEAFF]'
      : currentUser?.role === 'admin'
      ? 'bg-[#CFEAFF] text-[#075080] border-[#8CCCF5]'
      : 'bg-[#F5FBFF] text-[#0875BD] border-[#CFEAFF]';

  const RoleIcon =
    currentUser?.role === 'institution' ? Building2 :
    currentUser?.role === 'alumni' ? Briefcase :
    currentUser?.role === 'faculty' ? BookOpen :
    currentUser?.role === 'admin' ? Terminal :
    GraduationCap;

  return (
    <>
      {/* Apple-Styled Floating Island Navigation (Desktop) */}
      <header className="sticky top-3 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all">
        <div className="pointer-events-auto mx-auto max-w-7xl 2xl:max-w-[1480px] rounded-2xl sm:rounded-full liquid-glass px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 transition-all duration-300">
          
          {/* Apple Squircle Brand Glyph */}
          <Link href="/" className="group flex items-center space-x-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1687D4] to-[#0875BD] text-white font-black text-sm shadow-[0_4px_16px_rgba(22,135,212,0.4)] transition-transform duration-300 group-hover:scale-105">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#05233b] leading-none">
                CAMPUS<span className="text-[#1687D4]">LENZ</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#2d5a7d] mt-0.5">
                Ecosystem
              </span>
            </div>
          </Link>

          {/* Apple macOS Segmented Dock Navigation Items */}
          <nav className="hidden md:flex items-center bg-white/25 backdrop-blur-md p-1 rounded-full border border-white/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isConnect = item.href === '/connect';
              const isExploreCompare = item.href === '/explore';
              const isActive = isConnect
                ? pathname === '/connect' || pathname === '/servers' || pathname === '/messages' || pathname === '/grievance'
                : isExploreCompare
                ? pathname === '/explore' || pathname === '/compare'
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#0875BD] font-bold'
                      : 'text-[#05233b] hover:text-[#0875BD] hover:bg-white/40'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="appleNavPill"
                      className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-full border border-white/60 shadow-xs -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Apple Identity & Sign Out Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                {/* User Info Capsule */}
                <Link
                  href={`/user/${currentUser.username}`}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/35 hover:bg-white/55 backdrop-blur-md border border-white/50 transition-all duration-200 group shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1687D4] to-[#0875BD] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-[#05233b] leading-none truncate max-w-[110px]">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${roleColorBadge} uppercase tracking-wider`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Apple-Styled Sign Out Button */}
                <button
                  onClick={handleLogout}
                  title="Sign out of active account"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/50 bg-white/35 hover:bg-white/55 hover:border-white/80 hover:text-[#0875BD] text-xs font-bold text-[#05233b] transition-all shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#075080] hover:text-[#1687D4] hover:bg-[#E8F5FF] transition-all duration-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#1687D4] hover:bg-[#0875BD] text-white shadow-[0_2px_10px_rgba(22,135,212,0.35)] transition-all duration-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Apple-Styled Floating macOS / iOS Bottom Dock (Mobile) */}
      <div className="fixed bottom-3 inset-x-0 mx-auto w-[92%] max-w-sm z-50 md:hidden pointer-events-auto">
        <nav className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] p-1.5 flex items-center justify-around">
          {[
            { label: 'Home', href: '/', icon: Home },
            { label: 'Search', href: '/search', icon: Search },
            { label: 'Explore', href: '/explore', icon: Compass },
            { label: 'Connect', href: '/connect', icon: MessageSquare },
            isAuthenticated && currentUser
              ? { label: 'Profile', href: `/user/${currentUser.username}`, icon: User }
              : { label: 'Sign In', href: '/login', icon: LogIn }
          ].map((item) => {
            const Icon = item.icon;
            const isConnect = item.href === '/connect';
            const isExploreCompare = item.href === '/explore';
            const isActive = isConnect
              ? pathname === '/connect' || pathname === '/servers' || pathname === '/messages' || pathname === '/grievance'
              : isExploreCompare
              ? pathname === '/explore' || pathname === '/compare'
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-[#1687D4]' : 'text-[#075080]/70 hover:text-[#075080]'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-115 stroke-[2.2]' : ''}`} />
                <span className="mt-0.5 text-[9px] font-semibold tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="appleMobileDockDot"
                    className="h-1 w-1 rounded-full bg-[#1687D4] mt-0.5 shadow-[0_0_6px_#1687D4]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
