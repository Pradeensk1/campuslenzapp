'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { DiscordServer, ServerChannel, UserRole } from '@/types';
import {
  Users,
  Megaphone,
  Shield,
  ShieldAlert,
  Send,
  Plus,
  Search,
  Info,
  CheckCheck,
  Paperclip,
  Smile,
  MoreVertical,
  X,
  Lock,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Hash,
  ChevronRight,
  Clock,
  Sparkles,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export default function WhatsAppCommunityPage() {
  const {
    currentUser,
    servers,
    serverMessages,
    sendServerMessage,
    createDiscordServer,
    addChannelToCommunity,
    colleges
  } = useApp();

  // Active Community (WhatsApp Community)
  const [activeCommunityId, setActiveCommunityId] = useState<string>(
    servers[0]?.id || 'server-psg-tech'
  );
  const activeCommunity =
    servers.find((s) => s.id === activeCommunityId) || servers[0];

  // Active Group inside Community
  const [activeGroupId, setActiveGroupId] = useState<string>(
    activeCommunity?.channels[0]?.id || 'ch-announcements'
  );
  const activeGroup =
    activeCommunity?.channels.find((c) => c.id === activeGroupId) ||
    activeCommunity?.channels[0];

  // Search filter for groups inside community
  const [groupSearch, setGroupSearch] = useState('');

  // Chat message input
  const [messageInput, setMessageInput] = useState('');
  const [slowmodeNotice, setSlowmodeNotice] = useState<string | null>(null);

  // Group Info Drawer Modal
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Modals for Admins: Add Group to Community / Create New Community
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState<
    'general' | 'department' | 'placements' | 'alumni-guide' | 'anti-ragebait' | 'announcements'
  >('general');
  const [newGroupIsAnnouncement, setNewGroupIsAnnouncement] = useState(false);
  const [newGroupRagebaitProtected, setNewGroupRagebaitProtected] = useState(false);

  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityCollegeId, setNewCommunityCollegeId] = useState(
    colleges[0]?.id || 'col-psg'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current active group
  const groupMessages = useMemo(() => {
    return serverMessages.filter((m) => m.channelId === activeGroup?.id);
  }, [serverMessages, activeGroup?.id]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  // Is the current active channel an announcement group?
  const isAnnouncementGroup =
    activeGroup?.type === 'announcements' || activeGroup?.isAnnouncementOnly;

  // Can the current user post in this group?
  const canPostInGroup =
    !isAnnouncementGroup ||
    currentUser.role === 'institution' ||
    currentUser.role === 'admin';

  // Announcement group vs Regular discussion groups
  const announcementGroups = useMemo(() => {
    return (
      activeCommunity?.channels.filter(
        (c) => c.type === 'announcements' || c.isAnnouncementOnly
      ) || []
    );
  }, [activeCommunity]);

  const discussionSubGroups = useMemo(() => {
    return (
      activeCommunity?.channels.filter(
        (c) => c.type !== 'announcements' && !c.isAnnouncementOnly
      ) || []
    );
  }, [activeCommunity]);

  // Filtered discussion groups by search query
  const filteredDiscussionGroups = useMemo(() => {
    if (!groupSearch.trim()) return discussionSubGroups;
    const query = groupSearch.toLowerCase();
    return discussionSubGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
    );
  }, [discussionSubGroups, groupSearch]);

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeGroup) return;

    if (!canPostInGroup) {
      setSlowmodeNotice('🔒 Only Community Admins can send messages to this announcement group.');
      setTimeout(() => setSlowmodeNotice(null), 4000);
      return;
    }

    // Check anti-ragebait rules
    if (activeGroup.isRagebaitProtected) {
      const toxicKeywords = ['rage', 'scam', 'hate', 'fraud', 'cheat', 'attack', 'idiot'];
      const text = messageInput.toLowerCase();
      if (toxicKeywords.some((w) => text.includes(w))) {
        setSlowmodeNotice(
          '⚠️ Ragebait Shield triggered: inflammatory phrases detected. Please keep discussions collegiate and constructive.'
        );
        setTimeout(() => setSlowmodeNotice(null), 4000);
        return;
      }
    }

    const res = sendServerMessage(activeGroup.id, messageInput.trim());
    if (res?.message) {
      setSlowmodeNotice(res.message);
      setTimeout(() => setSlowmodeNotice(null), 4000);
    } else {
      setMessageInput('');
      setSlowmodeNotice(null);
    }
  };

  // Add group to community
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !activeCommunity) return;

    const createdChannel = addChannelToCommunity(activeCommunity.id, {
      name: newGroupName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newGroupDescription.trim() || 'Community discussion group.',
      type: newGroupType,
      isRagebaitProtected: newGroupRagebaitProtected,
      isAnnouncementOnly: newGroupIsAnnouncement,
      memberCount: activeCommunity.memberCount
    });

    setActiveGroupId(createdChannel.id);
    setShowAddGroupModal(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupType('general');
    setNewGroupIsAnnouncement(false);
    setNewGroupRagebaitProtected(false);
  };

  // Create new Community
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    const created = createDiscordServer(
      newCommunityName.trim(),
      newCommunityDesc.trim() || 'WhatsApp-style Campus Community for collegiate collaboration.',
      newCommunityCollegeId,
      [
        {
          id: `ch-ann-${Date.now()}`,
          name: 'Official Announcements',
          description: 'Official verified college notices (Admins only broadcast).',
          type: 'announcements',
          isRagebaitProtected: true,
          isAnnouncementOnly: true,
          memberCount: 150
        },
        {
          id: `ch-gen-${Date.now()}`,
          name: 'campus-general',
          description: 'All-members campus discussion & questions.',
          type: 'general',
          isRagebaitProtected: false,
          memberCount: 145
        },
        {
          id: `ch-anti-${Date.now()}`,
          name: 'ragebait-shielded-campus-hall',
          description: 'Constructive discussion channel protected from toxicity.',
          type: 'anti-ragebait',
          isRagebaitProtected: true,
          memberCount: 120
        },
        {
          id: `ch-alm-${Date.now()}`,
          name: 'alumni-career-guidance',
          description: 'Alumni mentorship desk for junior students.',
          type: 'alumni-guide',
          isRagebaitProtected: false,
          memberCount: 95
        }
      ],
      [
        'Strict decorum: zero slander or partisan toxicity.',
        'Anti-ragebait slowmode protection enabled.',
        'Private disputes must be submitted to the Institution Grievance portal.'
      ]
    );

    setActiveCommunityId(created.id);
    setActiveGroupId(created.channels[0].id);
    setShowCreateCommunityModal(false);
    setNewCommunityName('');
    setNewCommunityDesc('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-4 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Top Header Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    WhatsApp Community Groups
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official College Communities
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-group campus ecosystem: One overarching Community, official 📢 Announcements, and topic-specific sub-groups.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Direct Message Link shortcut */}
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Instagram Direct Messages
            </Link>

            {/* Institution / Admin Community Controls */}
            {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddGroupModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sub-Group
                </button>
                <button
                  onClick={() => setShowCreateCommunityModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  New Community
                </button>
              </div>
            )}

            {/* Student Grievance Shortcut */}
            {currentUser.role === 'student' && (
              <Link
                href="/grievance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Report to Institution
              </Link>
            )}
          </div>
        </div>

        {/* WhatsApp Community Layout Container */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[680px]">

          {/* --------------------------------------------------------------- */}
          {/* 1. LEFT SIDEBAR: Community Info & WhatsApp Groups List (4 cols) */}
          {/* --------------------------------------------------------------- */}
          <div className="md:col-span-4 border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Community Banner / Header (WhatsApp Style) */}
              <div className="p-4 border-b border-[#E2E8F0] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                      {activeCommunity.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                          {activeCommunity.name}
                        </h2>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>Community • {activeCommunity.memberCount} members</span>
                      </p>
                    </div>
                  </div>

                  {/* Community Switcher Dropdown */}
                  {servers.length > 1 && (
                    <select
                      value={activeCommunityId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setActiveCommunityId(sId);
                        const sel = servers.find((s) => s.id === sId);
                        if (sel && sel.channels.length > 0) {
                          setActiveGroupId(sel.channels[0].id);
                        }
                      }}
                      className="text-xs bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none"
                    >
                      {servers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.collegeName || s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Community Description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-100">
                  {activeCommunity.description}
                </p>

                {/* Search Groups in Community */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Search groups in this community..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Scrollable Groups List inside Community */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[500px]">

                {/* SECTION 1: ANNOUNCEMENTS GROUP (WhatsApp Signature Feature) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <Megaphone className="w-3 h-3 text-emerald-600" />
                      Community Announcements
                    </span>
                    <span className="text-[9px] font-medium lowercase text-slate-400">broadcasts</span>
                  </div>

                  {announcementGroups.map((group) => {
                    const isSelected = group.id === activeGroupId;
                    const lastMsg = serverMessages
                      .filter((m) => m.channelId === group.id)
                      .slice(-1)[0];

                    return (
                      <button
                        key={group.id}
                        onClick={() => setActiveGroupId(group.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Megaphone className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1">
                                {group.name}
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase">
                                  Official
                                </span>
                              </h4>
                              {lastMsg && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {lastMsg ? lastMsg.content : group.description}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-700 font-medium">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Only Admins can send messages</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* SECTION 2: TOPIC DISCUSSION SUB-GROUPS */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3 h-3 text-slate-400" />
                      Topic & Department Groups ({filteredDiscussionGroups.length})
                    </span>
                    {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => setShowAddGroupModal(true)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 lowercase"
                      >
                        + new group
                      </button>
                    )}
                  </div>

                  {filteredDiscussionGroups.map((group) => {
                    const isSelected = group.id === activeGroupId;
                    const lastMsg = serverMessages
                      .filter((m) => m.channelId === group.id)
                      .slice(-1)[0];

                    const GroupIcon =
                      group.type === 'alumni-guide'
                        ? Briefcase
                        : group.type === 'department'
                        ? BookOpen
                        : group.type === 'placements'
                        ? GraduationCap
                        : group.type === 'anti-ragebait'
                        ? ShieldAlert
                        : Hash;

                    return (
                      <button
                        key={group.id}
                        onClick={() => setActiveGroupId(group.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <GroupIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                #{group.name}
                              </h4>
                              {lastMsg && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {lastMsg ? `${lastMsg.authorName}: ${lastMsg.content}` : group.description}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>{group.memberCount || activeCommunity.memberCount} participants</span>
                              {group.isRagebaitProtected && (
                                <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                                  <Shield className="w-2.5 h-2.5" /> Shielded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* Current User Bar at Bottom of Sidebar */}
            <div className="p-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {currentUser.role} • {currentUser.collegeName || 'Verified Member'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGroupInfo(true)}
                title="View Group / Community Info"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 2. RIGHT CHAT WINDOW: WhatsApp-style Chat Stream (8 cols)        */}
          {/* --------------------------------------------------------------- */}
          <div className="md:col-span-8 flex flex-col justify-between bg-[#F8FAFC]">

            {/* Chat Top Header */}
            <div className="p-3.5 px-4 sm:px-6 border-b border-[#E2E8F0] bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                  isAnnouncementGroup ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  {isAnnouncementGroup ? (
                    <Megaphone className="w-5 h-5" />
                  ) : (
                    <Hash className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                      {isAnnouncementGroup ? '📢 ' : '#'}{activeGroup?.name}
                    </h3>
                    {isAnnouncementGroup && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Admin Broadcast
                      </span>
                    )}
                    {activeGroup?.isRagebaitProtected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" /> Shielded
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {isAnnouncementGroup
                      ? 'Only Community Admins can send messages to this group.'
                      : activeGroup?.description || `${activeGroup?.memberCount || activeCommunity.memberCount} participants`}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGroupInfo(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Group Info</span>
                </button>
              </div>
            </div>

            {/* Banner: Announcement Notice or Ragebait slowmode */}
            {isAnnouncementGroup ? (
              <div className="bg-emerald-50/90 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>Official Announcements:</strong> Messages sent here are delivered directly to all {activeCommunity.memberCount} members of {activeCommunity.name}.
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Verified</span>
              </div>
            ) : activeGroup?.isRagebaitProtected ? (
              <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Ragebait Shield Enabled:</strong> Polite and factual discourse required. 60-second slowmode active.
                  </span>
                </div>
                {currentUser.role === 'student' && (
                  <Link
                    href="/grievance"
                    className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900"
                  >
                    Faculty dispute? Report in private
                  </Link>
                )}
              </div>
            ) : null}

            {/* WhatsApp Messages Canvas */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 max-h-[460px]">
              {groupMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    {isAnnouncementGroup ? (
                      <Megaphone className="w-6 h-6" />
                    ) : (
                      <MessageCircle className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">
                    Welcome to {activeGroup?.name}!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isAnnouncementGroup
                      ? 'No official announcements yet. Community admins will broadcast updates here.'
                      : 'This is the start of the discussion. Share your questions, placement tips, or departmental queries.'}
                  </p>
                </div>
              ) : (
                groupMessages.map((msg) => {
                  const isMe = msg.authorId === currentUser.id;

                  const roleBadgeColor =
                    msg.authorRole === 'institution'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : msg.authorRole === 'alumni'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : msg.authorRole === 'faculty'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : msg.authorRole === 'admin'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  const roleTextColor =
                    msg.authorRole === 'institution'
                      ? 'text-purple-700'
                      : msg.authorRole === 'alumni'
                      ? 'text-emerald-700'
                      : msg.authorRole === 'faculty'
                      ? 'text-amber-700'
                      : msg.authorRole === 'admin'
                      ? 'text-rose-700'
                      : 'text-blue-700';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {/* WhatsApp Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-xs border relative transition-all ${
                          isMe
                            ? 'bg-[#E0F2FE] border-blue-200 text-slate-900 rounded-br-none'
                            : 'bg-white border-slate-200 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        {/* Author info inside bubble (WhatsApp group style) */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-xs font-bold ${roleTextColor}`}>
                              {msg.authorName}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${roleBadgeColor}`}
                            >
                              {msg.authorRole}
                            </span>
                          </div>
                        )}

                        {/* Message content */}
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        {/* Timestamp & WhatsApp Delivery Ticks */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar or Announcement Restricted Banner */}
            <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-white space-y-2">
              {slowmodeNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{slowmodeNotice}</span>
                </div>
              )}

              {/* If announcement group and user cannot post: WhatsApp-style Banner */}
              {!canPostInGroup ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    Only Community Admins can send messages to <strong>#{activeGroup?.name}</strong>.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Attach file (mock)"
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isAnnouncementGroup
                        ? `Broadcast official notice as ${currentUser.fullName}...`
                        : `Message #${activeGroup?.name} as ${currentUser.fullName}...`
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 ${
                      isAnnouncementGroup
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  {isAnnouncementGroup
                    ? 'Official announcement channel • All members receive updates'
                    : 'WhatsApp Community format • Real-time peer collaboration'}
                </span>
                {currentUser.role === 'alumni' && (
                  <span className="text-emerald-600 font-semibold">
                    Alumni Mentor Verified
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: Community & Group Information Drawer                      */}
      {/* ------------------------------------------------------------------ */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {activeCommunity.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Group: #{activeGroup?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  About Group
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeGroup?.description || 'Campus discussion space for student networking.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Group Permissions
                </span>
                <div className="mt-1 space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Send Messages</span>
                    <span className="font-bold text-slate-900">
                      {isAnnouncementGroup ? 'Admins Only' : 'All Participants'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Anti-Ragebait Filter</span>
                    <span className="font-bold text-slate-900">
                      {activeGroup?.isRagebaitProtected ? 'Active (60s slowmode)' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Community Rules
                </span>
                <ul className="mt-1 space-y-1 text-slate-600 list-disc list-inside">
                  {activeCommunity.antiRagebaitRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowGroupInfo(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: Add Sub-Group to Community (For Institution / Admin)       */}
      {/* ------------------------------------------------------------------ */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Sub-Group to {activeCommunity.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. ai-ds-lab-projects"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category / Purpose</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">General Campus Discussion</option>
                  <option value="department">Department & Course Projects</option>
                  <option value="placements">Placement & Interview Intel</option>
                  <option value="alumni-guide">Alumni Career Guidance</option>
                  <option value="anti-ragebait">Shielded Anti-Ragebait Discussion</option>
                  <option value="announcements">Announcement Group (Broadcast only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Description</label>
                <textarea
                  rows={2}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe who this group is for and what discussions are welcome."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGroupIsAnnouncement}
                    onChange={(e) => setNewGroupIsAnnouncement(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Make this an Announcement Group (Only Admins can send messages)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGroupRagebaitProtected}
                    onChange={(e) => setNewGroupRagebaitProtected(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Enable Ragebait Shield (60s slowmode + toxic language filtering)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 3: Create Entire Campus Community (For Institution / Admin)  */}
      {/* ------------------------------------------------------------------ */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Build New WhatsApp-Style Campus Community
                </h3>
              </div>
              <button
                onClick={() => setShowCreateCommunityModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Establish an overarching campus community on the WhatsApp model, automatically equipped with a broadcast 📢 Announcement Group and departmental sub-groups.
            </p>

            <form onSubmit={handleCreateCommunity} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Community Name</label>
                <input
                  type="text"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="e.g. Thiagarajar College of Engineering Community"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target College</label>
                <select
                  value={newCommunityCollegeId}
                  onChange={(e) => setNewCommunityCollegeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Guidelines</label>
                <textarea
                  rows={2}
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="Official community for verified students, faculty notices, and alumni placement tips."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold">Automated Community Groups:</span>
                <p className="text-emerald-700">
                  Includes #Official-Announcements (admin-only broadcast), #campus-general, #ragebait-shielded-campus-hall, and #alumni-career-guidance.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                >
                  Deploy Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
