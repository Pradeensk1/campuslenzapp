'use client';

import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  Gift,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  ArrowRight,
  TrendingUp,
  Share2,
  MessageSquare,
  ShieldCheck,
  Star,
  ExternalLink,
  ShoppingBag,
  HelpCircle,
  Zap,
  Clock
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

interface VoucherItem {
  id: string;
  brand: string;
  title: string;
  description: string;
  coinCost: number;
  category: 'food' | 'learning' | 'entertainment' | 'travel';
  categoryLabel: string;
  badge: string;
  expiryDays: number;
  brandLogoBg: string;
  brandLogoText: string;
  sampleCode: string;
}

export default function LenzRewardsHub() {
  const { currentUser } = useApp();

  // User Gamification State (persisted in local state for seamless interaction)
  const [coinBalance, setCoinBalance] = useState<number>(850);
  const [lifetimeCoins, setLifetimeCoins] = useState<number>(1450);
  const [activeSubTab, setActiveSubTab] = useState<'store' | 'earn' | 'my_vouchers'>('store');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemedVouchers, setRedeemedVouchers] = useState<
    Array<{ voucher: VoucherItem; code: string; date: string }>
  >([
    {
      voucher: {
        id: 'v-zomato-initial',
        brand: 'Zomato',
        title: 'Flat ₹150 Off on Campus Food Orders',
        description: 'Valid on orders above ₹299 at student-favorite restaurants',
        coinCost: 300,
        category: 'food',
        categoryLabel: 'Food & Dining',
        badge: 'Top Pick',
        expiryDays: 14,
        brandLogoBg: 'bg-rose-500',
        brandLogoText: 'Z',
        sampleCode: 'LENZ-ZOM-9821'
      },
      code: 'LENZ-ZOM-9821',
      date: '2 days ago'
    }
  ]);
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  // Available Brand Vouchers
  const AVAILABLE_VOUCHERS: VoucherItem[] = [
    {
      id: 'v-zomato',
      brand: 'Zomato',
      title: 'Flat ₹150 Off on Campus Food Orders',
      description: 'Valid on orders above ₹299 across all partnered restaurants near your campus.',
      coinCost: 300,
      category: 'food',
      categoryLabel: 'Food & Dining',
      badge: 'Bestseller',
      expiryDays: 15,
      brandLogoBg: 'bg-rose-600',
      brandLogoText: 'ZOMATO',
      sampleCode: `ZOM-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      id: 'v-swiggy',
      brand: 'Swiggy Instamart',
      title: 'Flat ₹100 Off on Late-Night Study Snacks',
      description: 'Get groceries, cold coffees, and energy drinks delivered in 10 mins to your hostel.',
      coinCost: 200,
      category: 'food',
      categoryLabel: 'Hostel Essentials',
      badge: 'Popular',
      expiryDays: 10,
      brandLogoBg: 'bg-orange-500',
      brandLogoText: 'SWIGGY',
      sampleCode: `SWG-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      id: 'v-coursera',
      brand: 'Coursera',
      title: '25% Off on Professional Certifications',
      description: 'Applicable on DeepLearning.AI, Google Cloud, IBM & AWS industry certificates.',
      coinCost: 500,
      category: 'learning',
      categoryLabel: 'Skills & Edtech',
      badge: 'High Value',
      expiryDays: 30,
      brandLogoBg: 'bg-blue-600',
      brandLogoText: 'COURSERA',
      sampleCode: `COURSERA-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      id: 'v-bookmyshow',
      brand: 'BookMyShow',
      title: '1+1 Free Weekend Movie Ticket Voucher',
      description: 'Buy one ticket and get the second free for student ID holders across INOX / PVR.',
      coinCost: 400,
      category: 'entertainment',
      categoryLabel: 'Weekend Movies',
      badge: 'Limited Stock',
      expiryDays: 20,
      brandLogoBg: 'bg-red-600',
      brandLogoText: 'BMS',
      sampleCode: `BMS-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      id: 'v-rapido',
      brand: 'Rapido Bike & Auto',
      title: 'Flat ₹50 Off on 3 Campus Rides',
      description: 'Commute between campus, PG, railway station, or library with zero surge fees.',
      coinCost: 150,
      category: 'travel',
      categoryLabel: 'Campus Commute',
      badge: 'Everyday Saver',
      expiryDays: 14,
      brandLogoBg: 'bg-amber-500',
      brandLogoText: 'RAPIDO',
      sampleCode: `RAP-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      id: 'v-github',
      brand: 'GitHub Student Pack',
      title: 'Fast-Track Student Verification Perks',
      description: 'Includes JetBrains all-products pack, $100 DigitalOcean credits, and free domain.',
      coinCost: 100,
      category: 'learning',
      categoryLabel: 'Developer Tools',
      badge: 'Dev Favorite',
      expiryDays: 60,
      brandLogoBg: 'bg-slate-900',
      brandLogoText: 'GITHUB',
      sampleCode: `GH-PACK-${Math.floor(1000 + Math.random() * 9000)}`
    }
  ];

  const handleRedeem = (voucher: VoucherItem) => {
    if (coinBalance < voucher.coinCost) {
      alert(`Insufficient LenzCoins! You need ${voucher.coinCost - coinBalance} more coins. Check the 'Earn Coins' tab to complete actions!`);
      return;
    }

    const uniqueCode = `${voucher.brand.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setCoinBalance(prev => prev - voucher.coinCost);
    setRedeemedVouchers(prev => [
      {
        voucher,
        code: uniqueCode,
        date: 'Just now'
      },
      ...prev
    ]);
    setRewardNotification(`Successfully redeemed ${voucher.title}! Code: ${uniqueCode}`);
    setTimeout(() => setRewardNotification(null), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. WALLET BALANCE & GAMIFICATION HEADER                              */}
      {/* ===================================================================== */}
      <div className="apple-card overflow-hidden border-[#E2E8F0] shadow-xs">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                <Coins className="w-4 h-4 text-yellow-200" />
                <span>Campus Lenz Gamification Rewards</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                LenzCoins & Brand Rewards Hub
              </h2>
              <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                Earn real rewards for writing verified department reviews, providing structured faculty feedback, and participating in peer study groups.
              </p>
            </div>

            {/* Wallet Balance Pill */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 text-white shadow-lg w-full sm:w-auto">
              <div className="p-3 bg-white text-amber-600 rounded-2xl shadow-sm">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 block">
                  Available Balance
                </span>
                <div className="text-3xl font-black tracking-tight">
                  {coinBalance} <span className="text-base font-bold text-yellow-200">Coins</span>
                </div>
                <div className="text-[10px] text-white/80 font-medium mt-0.5">
                  Tier: <span className="font-bold text-white">Silver Scholar</span> • Next Tier at 1,000 Coins
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex overflow-x-auto border-t border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveSubTab('store')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'store'
                ? 'bg-white text-amber-700 shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Brand Voucher Store ({AVAILABLE_VOUCHERS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('earn')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'earn'
                ? 'bg-white text-[#1687D4] shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#1687D4]" />
            <span>How to Earn More Coins</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my_vouchers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'my_vouchers'
                ? 'bg-white text-emerald-700 shadow-xs border border-[#E2E8F0]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>My Active Vouchers ({redeemedVouchers.length})</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {rewardNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{rewardNotification}</span>
          </div>
          <button
            onClick={() => setActiveSubTab('my_vouchers')}
            className="text-[11px] font-bold text-emerald-900 underline hover:no-underline"
          >
            View in My Vouchers →
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BRAND VOUCHERS STORE                                              */}
      {/* ===================================================================== */}
      {activeSubTab === 'store' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">
              Exclusive Brand Partner Vouchers
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Vouchers delivered instantly to your account with zero waiting
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_VOUCHERS.map((voucher) => {
              const canAfford = coinBalance >= voucher.coinCost;

              return (
                <div
                  key={voucher.id}
                  className="apple-card p-5 border-[#E2E8F0] shadow-xs bg-white space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl ${voucher.brandLogoBg} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                          {voucher.brandLogoText.slice(0, 3)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A]">{voucher.brand}</h4>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {voucher.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {voucher.badge}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 leading-snug">
                      {voucher.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {voucher.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid for {voucher.expiryDays} days after redemption</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-sm font-black text-amber-600">
                      <Coins className="w-4 h-4" />
                      <span>{voucher.coinCost}</span>
                      <span className="text-[10px] font-normal text-slate-400">Coins</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeem(voucher)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                        canAfford
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Redeem Now' : 'Need More Coins'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. HOW TO EARN COINS (ACTION LEDGER)                                 */}
      {/* ===================================================================== */}
      {activeSubTab === 'earn' && (
        <div className="space-y-4">
          <div className="apple-card p-5 border-[#E2E8F0] shadow-xs bg-white space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Community Reward Contribution Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                LenzCoins reward transparent, verified institutional information. Fake or spam reviews are filtered by AI moderation and deduct 100 coins.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  action: 'Submit Verified Department & Placement Review',
                  reward: '+100 Coins',
                  freq: 'Per department per semester',
                  desc: 'Share detailed insights on lab equipment, internship offers, and real teaching quality.',
                  cta: 'Write Review',
                  href: '/reviews'
                },
                {
                  action: 'Provide Structured Faculty Feedback',
                  reward: '+50 Coins',
                  freq: 'Per enrolled course module',
                  desc: 'Rate concept delivery, practical lab assistance, and syllabus coverage anonymously.',
                  cta: 'Rate Faculty',
                  href: '/student'
                },
                {
                  action: 'Host or Join a Peer Pomodoro Study Room',
                  reward: '+20 Coins',
                  freq: 'Max 60 coins/day',
                  desc: 'Complete at least 50 minutes of focused group study in Campus Lenz virtual study rooms.',
                  cta: 'Go to Study Rooms',
                  href: '/student'
                },
                {
                  action: 'Answer Academic Doubts in Course Q&A',
                  reward: '+25 Coins',
                  freq: 'When your answer gets upvoted',
                  desc: 'Help junior students solve programming bugs, maths equations, or lab viva questions.',
                  cta: 'Browse Q&A',
                  href: '/student'
                },
                {
                  action: 'Refer a College Peer or Classmate',
                  reward: '+150 Coins',
                  freq: 'Unlimited referrals',
                  desc: 'Share your personal student invitation link. Both of you receive bonus coins on verification.',
                  cta: 'Copy Invite Link',
                  onClick: () => copyToClipboard('https://campuslenz.app/join?ref=LENZ-STUDENT-42')
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">{item.action}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {item.reward}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block">Limits: {item.freq}</span>
                  </div>

                  {item.onClick ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1687D4] hover:bg-blue-50 transition-all shadow-xs whitespace-nowrap"
                    >
                      {copiedCode ? 'Link Copied!' : item.cta}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1687D4] hover:bg-blue-50 transition-all shadow-xs whitespace-nowrap"
                    >
                      {item.cta} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MY ACTIVE VOUCHERS                                                */}
      {/* ===================================================================== */}
      {activeSubTab === 'my_vouchers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">
              My Redeemed Vouchers ({redeemedVouchers.length})
            </h3>
            <span className="text-xs text-slate-500">
              Apply coupon codes during checkout on partner apps
            </span>
          </div>

          {redeemedVouchers.length === 0 ? (
            <div className="apple-card p-8 text-center bg-white border-[#E2E8F0] space-y-3">
              <Gift className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No vouchers redeemed yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the brand voucher store and convert your LenzCoins into real dining, learning, and entertainment perks!
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('store')}
                className="px-4 py-2 rounded-xl bg-[#1687D4] text-white text-xs font-bold hover:bg-[#1272B4]"
              >
                Browse Voucher Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedVouchers.map((item, idx) => (
                <div
                  key={idx}
                  className="apple-card p-5 border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {item.voucher.brand} • Claimed {item.date}
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A] mt-0.5">{item.voucher.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">{item.voucher.description}</p>

                  <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Promo Code</span>
                      <span className="font-mono text-sm font-black text-slate-800">{item.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.code)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
                    >
                      {copiedCode === item.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Valid for orders across India</span>
                    <span>Direct API Partner Sync</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
