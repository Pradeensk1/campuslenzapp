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
      {/* Ocean Blue Floating Island Navigation (Desktop) */}
      <header className="sticky top-3 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all">
        <div className="pointer-events-auto mx-auto max-w-6xl rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_rgba(12,74,110,0.12),inset_0_1.5px_1px_rgba(255,255,255,0.95)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 transition-all duration-300">
          
          {/* Glossy Brand Glyph */}
          <Link href="/" className="group flex items-center space-x-2.5 flex-shrink-0 touch-over-glass">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white font-black text-sm shadow-[0_4px_16px_rgba(2,132,199,0.38),inset_0_1px_1px_rgba(255,255,255,0.7)] transition-transform duration-300 group-hover:scale-105">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0C2340] leading-none">
                CAMPUS<span className="text-[#0284C7]">LENZ</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#0EA5E9] mt-0.5">
                Ocean Glass
              </span>
            </div>
          </Link>

          {/* Frosted Spotlight Search Capsule */}
          <div className="hidden lg:block flex-1 max-w-xs mx-2">
            <Link
              href="/search"
              className="flex items-center justify-between rounded-full bg-white/60 hover:bg-white/85 border border-white/80 hover:border-sky-300/80 px-4 py-2 text-xs text-sky-950/70 hover:text-sky-950 shadow-[0_2px_8px_rgba(14,165,233,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200 group touch-over-glass"
            >
              <div className="flex items-center space-x-2 truncate">
                <Search className="h-3.5 w-3.5 text-[#0284C7] transition-transform duration-200 group-hover:scale-110" />
                <span className="truncate text-[11px] font-semibold text-slate-600">Spotlight search...</span>
              </div>
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-sky-700 bg-sky-100/70 border border-sky-200/60 rounded-md shadow-2xs">
                ⌘K
              </kbd>
            </Link>
          </div>

          {/* Ocean Glass Dock Navigation Items */}
          <nav className="hidden md:flex items-center bg-sky-100/40 p-1 rounded-full border border-white/70 shadow-[inset_0_1px_2px_rgba(14,165,233,0.08)]">
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
                  className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'text-[#0284C7]'
                      : 'text-slate-600 hover:text-[#0C2340] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4] text-[#0284C7]' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="appleNavPill"
                      className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-full shadow-[0_2px_12px_rgba(2,132,199,0.18),inset_0_1px_1px_#ffffff] -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/user/${currentUser.username}`}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-white/70 hover:bg-white/95 border border-white/90 shadow-[0_2px_8px_rgba(12,74,110,0.08),inset_0_1px_1px_#ffffff] transition-all duration-200 group touch-over-glass"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0284C7] to-cyan-400 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-[#0C2340] leading-none truncate max-w-[110px]">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-full border ${roleColorBadge} uppercase tracking-wider`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of active account"
                  className="p-1.5 rounded-full bg-white/60 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-white/80 shadow-xs transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="ocean-glossy-pill-subtle px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="ocean-glossy-button px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

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
