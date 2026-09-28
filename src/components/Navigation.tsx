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
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : currentUser?.role === 'alumni'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : currentUser?.role === 'faculty'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : currentUser?.role === 'admin'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  const RoleIcon =
    currentUser?.role === 'institution' ? Building2 :
    currentUser?.role === 'alumni' ? Briefcase :
    currentUser?.role === 'faculty' ? BookOpen :
    currentUser?.role === 'admin' ? Terminal :
    GraduationCap;

  return (
    <>
      {/* Ecosystem Top Island Navigation matching reference */}
      <header className="sticky top-2.5 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all">
        <div className="pointer-events-auto mx-auto max-w-[1560px] rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06),inset_0_1.5px_1px_rgba(255,255,255,0.95)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 transition-all duration-300">
          
          {/* Logo Mark & Text */}
          <Link href="/" className="group flex items-center space-x-2.5 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-teal-400 text-white shadow-md shadow-teal-500/25 transition-transform duration-300 group-hover:scale-105">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a7 7 0 1 0 0 8" />
                <path d="M12 12h.01" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                CAMPUS<span className="text-emerald-600">LENZ</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                ECOSYSTEM
              </span>
            </div>
          </Link>

          {/* Wide Spotlight Search Pill */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <Link
              href="/search"
              className="flex items-center justify-between rounded-full bg-slate-100/70 hover:bg-slate-100/95 border border-slate-200/70 hover:border-slate-300 px-4 py-2 text-xs text-slate-600 shadow-inner transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Search className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />
                <span className="truncate text-xs font-medium text-slate-500">
                  Search students, colleges, courses, internships, events, projects...
                </span>
              </div>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
                ⌘K
              </kbd>
            </Link>
          </div>

          {/* Navigation Items (Home, Explore, Connect, Profile) */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/explore"
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                pathname === '/explore' || pathname === '/compare'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <span>Explore</span>
            </Link>

            <Link
              href="/connect"
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                pathname === '/connect' || pathname === '/servers' || pathname === '/messages'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>Connect Hub</span>
            </Link>

            <Link
              href={currentUser ? `/user/${currentUser.username}` : '/profile'}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                pathname?.startsWith('/user/') || pathname === '/profile'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Profile</span>
            </Link>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                className="relative p-2 rounded-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 text-slate-600 transition"
                title="Notifications"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  6
                </span>
              </button>
            </div>

            {/* User Dropdown Pill */}
            <div className="pl-1">
              {currentUser ? (
                <div className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {(currentUser.fullName || currentUser.username || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[90px]">
                      {currentUser.fullName || currentUser.username || 'partha'}
                    </span>
                    <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      {currentUser.role || 'STUDENT'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-rose-600 transition p-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    P
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[90px]">
                      partha
                    </span>
                    <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      STUDENT
                    </span>
                  </div>
                  <Link href="/login" className="text-slate-400 hover:text-emerald-600 p-0.5" title="Login">
                    <LogIn className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

          </nav>

        </div>
      </header>

      {/* Ocean Blue Floating Curved Mobile Dock */}
      <div className="fixed bottom-4 inset-x-0 mx-auto w-[90%] max-w-sm z-50 md:hidden pointer-events-auto">
        <nav className="rounded-[32px] bg-white/75 backdrop-blur-3xl border border-white/90 shadow-[0_16px_40px_rgba(12,74,110,0.2),inset_0_1.5px_1px_rgba(255,255,255,0.95)] p-2 flex items-center justify-around">
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
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-[#0284C7]' : 'text-slate-500 hover:text-[#0C2340]'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-115 stroke-[2.4] text-[#0284C7]' : ''}`} />
                <span className="mt-0.5 text-[9px] font-bold tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="oceanMobileDockDot"
                    className="h-1 w-1.5 rounded-full bg-[#0284C7] mt-0.5 shadow-[0_0_8px_#0284C7]"
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
