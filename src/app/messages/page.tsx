'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { UserProfile, DirectMessage } from '@/types';
import {
  Send,
  Search,
  PenSquare,
  Heart,
  Image as ImageIcon,
  Smile,
  Info,
  Phone,
  Video,
  Check,
  CheckCheck,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  X,
  User,
  ExternalLink,
  MessageCircle,
  Users
} from 'lucide-react';

export default function InstagramDirectMessagesPage() {
  const {
    currentUser,
    allUsers,
    directMessages,
    sendDirectMessage,
    toggleLikeDirectMessage
  } = useApp();

  // Active chat partner ID (user ID)
  // Default to the first user we have a conversation with, or null
  const initialPartnerId = useMemo(() => {
    const lastMsg = directMessages
      .filter((m) => m.senderId === currentUser.id || m.receiverId === currentUser.id)
      .slice(-1)[0];
    if (lastMsg) {
      return lastMsg.senderId === currentUser.id
        ? lastMsg.receiverId
        : lastMsg.senderId;
    }
    // Fallback to first other user in directory
    const otherUser = allUsers.find((u) => u.id !== currentUser.id);
    return otherUser ? otherUser.id : null;
  }, [directMessages, currentUser.id, allUsers]);

  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId);
  const activePartner = useMemo(() => {
    return allUsers.find((u) => u.id === activePartnerId) || null;
  }, [allUsers, activePartnerId]);

  // Search in conversation list
  const [conversationsSearch, setConversationsSearch] = useState('');

  // Input message state
  const [inputMessage, setInputMessage] = useState('');

  // "New Message" Modal state (allows chatting with ANY user)
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive all active conversations for the current user
  // Group directMessages by the partner's user ID
  const activeConversations = useMemo(() => {
    const partnerMap = new Map<string, DirectMessage[]>();

    directMessages.forEach((msg) => {
      let partnerId: string | null = null;
      if (msg.senderId === currentUser.id) {
        partnerId = msg.receiverId;
      } else if (msg.receiverId === currentUser.id) {
        partnerId = msg.senderId;
      }

      if (partnerId) {
        const existing = partnerMap.get(partnerId) || [];
        existing.push(msg);
        partnerMap.set(partnerId, existing);
      }
    });

    const list: { partner: UserProfile; lastMessage: DirectMessage; messages: DirectMessage[] }[] = [];

    partnerMap.forEach((msgs, pId) => {
      const partner = allUsers.find((u) => u.id === pId);
      if (partner) {
        const sorted = [...msgs].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        list.push({
          partner,
          lastMessage: sorted[sorted.length - 1],
          messages: sorted
        });
      }
    });

    // Sort by most recent message
    list.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return list;
  }, [directMessages, currentUser.id, allUsers]);

  // Filter conversations in the sidebar
  const filteredConversations = useMemo(() => {
    if (!conversationsSearch.trim()) return activeConversations;
    const q = conversationsSearch.toLowerCase();
    return activeConversations.filter(
      (c) =>
        c.partner.fullName.toLowerCase().includes(q) ||
        c.partner.username.toLowerCase().includes(q) ||
        c.partner.collegeName?.toLowerCase().includes(q)
    );
  }, [activeConversations, conversationsSearch]);

  // Active chat messages between currentUser and activePartner
  const currentChatMessages = useMemo(() => {
    if (!activePartner) return [];
    return directMessages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === activePartner.id) ||
          (m.senderId === activePartner.id && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [directMessages, currentUser.id, activePartner]);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  // Filter users for the "New Message" modal (allows searching ANY registered user)
  const candidateUsers = useMemo(() => {
    const list = allUsers.filter((u) => u.id !== currentUser.id);
    if (!userSearchQuery.trim()) return list;
    const q = userSearchQuery.toLowerCase();
    return list.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.collegeName?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [allUsers, currentUser.id, userSearchQuery]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePartner) return;

    sendDirectMessage(activePartner.id, inputMessage.trim());
    setInputMessage('');
  };

  // Send instant Heart reaction (Instagram feature)
  const handleSendHeart = () => {
    if (!activePartner) return;
    sendDirectMessage(activePartner.id, '❤️');
  };

  // Select a user to chat with from the "New Message" modal
  const handleStartChatWithUser = (user: UserProfile) => {
    setActivePartnerId(user.id);
    setShowNewChatModal(false);
    setUserSearchQuery('');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'institution':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'alumni':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'faculty':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-4 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Top Header Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                <Send className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Instagram Direct Messages
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    1-on-1 Direct Chat
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct networking with anyone across Tamil Nadu: connect with verified students, alumni mentors, faculty, and institutions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/servers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              WhatsApp Communities
            </Link>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            >
              <PenSquare className="w-3.5 h-3.5" />
              New Message
            </button>
          </div>
        </div>

        {/* Instagram DM Main Layout Container */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[660px]">

          {/* --------------------------------------------------------------- */}
          {/* 1. LEFT PANEL: Conversations Sidebar & Search (4 cols on md)   */}
          {/* --------------------------------------------------------------- */}
          <div className="md:col-span-4 border-r border-[#E2E8F0] bg-white flex flex-col justify-between">
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Sidebar Header: Current username + New Message Button */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold uppercase">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => setShowNewChatModal(true)}
                  title="Write New Message"
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar for Direct Messages */}
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={conversationsSearch}
                    onChange={(e) => setConversationsSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[500px]">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500">
                      No conversation threads found. Click "New Message" to chat with any student, alumni, or faculty member!
                    </p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      <PenSquare className="w-3 h-3" />
                      Start Chat
                    </button>
                  </div>
                ) : (
                  filteredConversations.map(({ partner, lastMessage }) => {
                    const isSelected = activePartner?.id === partner.id;
                    const isFromMe = lastMessage.senderId === currentUser.id;

                    return (
                      <button
                        key={partner.id}
                        onClick={() => setActivePartnerId(partner.id)}
                        className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-[#EFF6FF]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Avatar with active green dot */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {partner.fullName.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>

                        {/* Partner text details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {partner.fullName}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-slate-500 truncate">
                              {isFromMe ? `You: ${lastMessage.content}` : lastMessage.content}
                            </p>
                            {lastMessage.liked && (
                              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0 ml-1" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(
                                partner.role
                              )}`}
                            >
                              {partner.role}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {partner.collegeName}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

            </div>

            {/* Quick Profile Strip at Bottom of Sidebar */}
            <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <Link
                href={`/user/${currentUser.username}`}
                className="flex items-center gap-2.5 truncate hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {currentUser.role} • View Profile
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Search any user"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 2. RIGHT PANEL: Instagram Direct Message Chat Canvas (8 cols)  */}
          {/* --------------------------------------------------------------- */}
          <div className="md:col-span-8 flex flex-col justify-between bg-white h-full">

            {activePartner ? (
              <>
                {/* Instagram DM Header */}
                <div className="p-3.5 px-4 sm:px-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {activePartner.fullName.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                          {activePartner.fullName}
                        </h3>
                        {activePartner.isVerified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(
                            activePartner.role
                          )}`}
                        >
                          {activePartner.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        @{activePartner.username} • Active now
                      </p>
                    </div>
                  </div>

                  {/* Header actions: Call icons & View Profile Link */}
                  <div className="flex items-center gap-2">
                    <button
                      title="Audio Call (mock)"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      title="Video Call (mock)"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/user/${activePartner.username}`}
                      title="View Full Profile"
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Messages Canvas */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] bg-white">

                  {/* Partner Instagram Intro Card at Top of Thread */}
                  <div className="py-6 text-center space-y-2 border-b border-slate-100 pb-6 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 mx-auto">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-slate-800 text-xl">
                        {activePartner.fullName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{activePartner.fullName}</h4>
                      <p className="text-xs text-slate-500">@{activePartner.username} • {activePartner.collegeName}</p>
                    </div>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      {activePartner.headline || activePartner.bio}
                    </p>
                    <div className="pt-1">
                      <Link
                        href={`/user/${activePartner.username}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        View Profile
                      </Link>
                    </div>
                  </div>

                  {/* Chat message bubbles */}
                  {currentChatMessages.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Send className="w-5 h-5" />
                      </div>
                      <h5 className="font-bold text-xs text-slate-800">
                        Start your conversation with {activePartner.fullName}
                      </h5>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Ask about college experiences, placement advice, or upcoming hackathons.
                      </p>
                    </div>
                  ) : (
                    currentChatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 group ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {/* Partner avatar beside message if incoming */}
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0 mb-1">
                              {activePartner.fullName.charAt(0)}
                            </div>
                          )}

                          {/* Bubble Container */}
                          <div className="relative max-w-[80%] sm:max-w-[65%]">
                            {/* Message Bubble */}
                            <div
                              onDoubleClick={() => toggleLikeDirectMessage(msg.id)}
                              className={`p-3.5 px-4 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all relative ${
                                isMe
                                  ? 'bg-[#0095F6] text-white rounded-br-xs shadow-xs'
                                  : 'bg-[#EFEFEF] text-slate-900 rounded-bl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>

                              {/* Heart reaction badge */}
                              {msg.liked && (
                                <span className="absolute -bottom-2.5 right-2 bg-white rounded-full p-0.5 border border-slate-200 shadow-xs flex items-center justify-center">
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                </span>
                              )}
                            </div>

                            {/* Timestamp & Like Button (Instagram hover style) */}
                            <div
                              className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1 ${
                                isMe ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>

                              {isMe && (
                                <span className="text-slate-400 flex items-center gap-0.5">
                                  • Seen
                                </span>
                              )}

                              {/* Like heart toggle button */}
                              <button
                                onClick={() => toggleLikeDirectMessage(msg.id)}
                                title="React with Heart"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-rose-500"
                              >
                                <Heart className={`w-3 h-3 ${msg.liked ? 'text-rose-500 fill-rose-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Instagram DM Input Bar */}
                <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    {/* Attachment / Photo mock button */}
                    <button
                      type="button"
                      title="Send Photo (mock)"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Message ${activePartner.fullName}...`}
                        className="w-full px-4 py-2.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0095F6] focus:bg-white transition-all pr-10"
                      />

                      {/* Heart Quick React button inside input if empty */}
                      {!inputMessage.trim() && (
                        <button
                          type="button"
                          onClick={handleSendHeart}
                          title="Send ❤️"
                          className="absolute right-3 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Heart className="w-4 h-4 hover:fill-rose-500" />
                        </button>
                      )}
                    </div>

                    {/* Send button (turns active blue when typing) */}
                    {inputMessage.trim() ? (
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-[#0095F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        Send
                      </button>
                    ) : null}
                  </form>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 mt-1.5">
                    <span>Double-click any message to react with ❤️</span>
                    <span>Direct Message with {activePartner.fullName}</span>
                  </div>
                </div>
              </>
            ) : (
              /* Instagram DM Empty State (No conversation selected) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-24 h-24 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Send className="w-12 h-12 text-slate-900 -rotate-45 translate-x-1 -translate-y-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Your Messages</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Send private messages to any student, alumni, faculty member, or institution across Tamil Nadu colleges.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0095F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Send Message
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: "New Message" (Chat with ANY user on the platform)          */}
      {/* ------------------------------------------------------------------ */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* "To:" search bar */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-bold text-xs text-slate-700">To:</span>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search any student, alumni, faculty, college..."
                autoFocus
                className="flex-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Candidate Users List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-1">
                Suggested People ({candidateUsers.length})
              </div>

              {candidateUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChatWithUser(user)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{user.fullName}</span>
                        {user.isVerified && (
                          <span className="text-[10px] text-blue-500">✓</span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        @{user.username} • {user.collegeName}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    Chat
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewChatModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
