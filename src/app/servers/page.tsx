'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { DiscordServer, ServerChannel } from '@/types';
import {
  Hash,
  Shield,
  ShieldAlert,
  Send,
  Plus,
  Users,
  MessageSquare,
  Building2,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  BookOpen,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CampusServersPage() {
  const {
    currentUser,
    servers,
    serverMessages,
    sendServerMessage,
    createDiscordServer,
    colleges
  } = useApp();

  const [activeServerId, setActiveServerId] = useState<string>(servers[0]?.id || 'server-psg-tech');
  const activeServer = servers.find(s => s.id === activeServerId) || servers[0];

  const [activeChannelId, setActiveChannelId] = useState<string>(
    activeServer?.channels[0]?.id || 'ch-announcements'
  );
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || activeServer?.channels[0];

  const [messageInput, setMessageInput] = useState('');
  const [slowmodeNotice, setSlowmodeNotice] = useState<string | null>(null);

  // Institution Server Builder Modal
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerDescription, setNewServerDescription] = useState('');
  const [newServerCollegeId, setNewServerCollegeId] = useState(colleges[0]?.id || 'col-psg');

  // Filter messages for current channel
  const channelMessages = serverMessages.filter(m => m.channelId === activeChannel?.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    // Check anti-ragebait channel rules
    if (activeChannel.isRagebaitProtected) {
      const toxicWords = ['rage', 'scam', 'hate', 'fraud', 'cheat', 'attack'];
      const text = messageInput.toLowerCase();
      if (toxicWords.some(w => text.includes(w))) {
        setSlowmodeNotice('⚠️ Ragebait Shield triggered: inflammatory phrases detected. Please keep discussions collegiate and constructive.');
        setTimeout(() => setSlowmodeNotice(null), 4000);
        return;
      }
    }

    sendServerMessage(activeChannel.id, messageInput.trim());
    setMessageInput('');
    setSlowmodeNotice(null);
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    const created = createDiscordServer(
      newServerName.trim(),
      newServerDescription.trim() || 'Official college community server on Campus Lenz.',
      newServerCollegeId,
      [
        {
          id: `ch-ann-${Date.now()}`,
          name: 'official-announcements',
          description: 'Official verified college notices.',
          type: 'general',
          isRagebaitProtected: true
        },
        {
          id: `ch-anti-${Date.now()}`,
          name: 'ragebait-shielded-campus-hall',
          description: 'Constructive discussion channel protected from toxicity.',
          type: 'anti-ragebait',
          isRagebaitProtected: true
        },
        {
          id: `ch-alm-${Date.now()}`,
          name: 'alumni-career-guidance',
          description: 'Alumni mentorship desk for junior students.',
          type: 'alumni-guide',
          isRagebaitProtected: false
        }
      ],
      [
        'Strict decorum: zero slander or partisan toxicity.',
        'Anti-ragebait cooldown slowmode active.',
        'Private disputes must be submitted to the Institution Grievance portal.'
      ]
    );

    setActiveServerId(created.id);
    setActiveChannelId(created.channels[0].id);
    setShowCreateServerModal(false);
    setNewServerName('');
    setNewServerDescription('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Top Header & Role Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campus Discord Servers</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Anti-Ragebait Architecture
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Structured collegiate community servers with verified role separation, alumni guidance, and protected inquiry lounges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Show Institution "Build Server" privilege */}
            {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
              <button
                onClick={() => setShowCreateServerModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Build Campus Server
              </button>
            )}

            {/* Quick Grievance Link for Students */}
            {currentUser.role === 'student' && (
              <Link
                href="/grievance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Private Faculty Grievance
              </Link>
            )}

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              Switch Role ({currentUser.role})
            </Link>
          </div>
        </div>

        {/* Discord Layout Container */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
          
          {/* 1. Server Rail (Left Column - 1 col on md, or top on small) */}
          <div className="md:col-span-1 bg-slate-100/80 border-r border-slate-200 p-3 flex md:flex-col items-center gap-3 overflow-x-auto md:overflow-visible">
            {servers.map(server => {
              const isActive = server.id === activeServerId;
              const initials = server.name.split(' ').map(w => w[0]).slice(0, 2).join('');
              return (
                <button
                  key={server.id}
                  onClick={() => {
                    setActiveServerId(server.id);
                    setActiveChannelId(server.channels[0]?.id || '');
                  }}
                  title={server.name}
                  className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white rounded-xl shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-200 hover:rounded-xl border border-slate-200'
                  }`}
                >
                  {initials}
                  {isActive && (
                    <span className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-full" />
                  )}
                </button>
              );
            })}

            {/* Institution Server Create Button */}
            {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
              <button
                onClick={() => setShowCreateServerModal(true)}
                title="Build New Campus Server"
                className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-500 text-slate-400 hover:text-purple-600 flex items-center justify-center transition-all bg-white"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 2. Channels Sidebar (3 cols on md) */}
          <div className="md:col-span-3 bg-slate-50 border-r border-slate-200 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Server Name & Details */}
              <div className="pb-3 border-b border-slate-200/80">
                <h2 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center justify-between">
                  <span className="truncate">{activeServer.name}</span>
                  <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeServer.memberCount} members online</span>
                </div>
              </div>

              {/* Channels List */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Text Channels
                </div>
                {activeServer.channels.map(channel => {
                  const isCurrent = channel.id === activeChannel?.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{channel.name}</span>
                      </div>
                      {channel.isRagebaitProtected && (
                        <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-white/80' : 'text-blue-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Anti-Ragebait Separation Notice Box */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Ragebait Separation System
                </div>
                <p className="text-amber-700 leading-relaxed text-[11px]">
                  Campus Lenz separates emotional viral debates into moderated zones. Faculty disputes are routed exclusively to Institution ID in private.
                </p>
                {currentUser.role === 'student' && (
                  <Link
                    href="/grievance"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 underline hover:text-amber-950 mt-1"
                  >
                    File Private Report to Institution <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Current User Bottom Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                </div>
              </div>
              <Link
                href="/login"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-md hover:bg-slate-200/60"
              >
                Switch
              </Link>
            </div>
          </div>

          {/* 3. Main Chat Channel Area (8 cols on md) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-white h-full">
            
            {/* Channel Top Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <Hash className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {activeChannel?.name || 'select-a-channel'}
                    </h3>
                    {activeChannel?.isRagebaitProtected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" /> Shielded Channel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{activeChannel?.description}</p>
                </div>
              </div>

              {/* Tag for channel type */}
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {activeChannel?.type}
              </span>
            </div>

            {/* Shielded Rules Banner if protected channel */}
            {activeChannel?.isRagebaitProtected && (
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Slowmode: 60s cooldown • Factual and collegiate conduct enforced</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Zero Toxic Slander</span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px]">
              {channelMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Hash className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">Welcome to #{activeChannel?.name}!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This is the start of the #{activeChannel?.name} channel. Be the first to start a constructive conversation.
                  </p>
                </div>
              ) : (
                channelMessages.map(msg => {
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

                  const roleIcon =
                    msg.authorRole === 'institution' ? Building2 :
                    msg.authorRole === 'alumni' ? Briefcase :
                    msg.authorRole === 'faculty' ? BookOpen :
                    GraduationCap;

                  const IconComp = roleIcon;

                  return (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                        {msg.authorName.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{msg.authorName}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                            <IconComp className="w-2.5 h-2.5" />
                            {msg.authorRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-2xl border border-slate-100 inline-block max-w-2xl">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Message Area */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              {slowmodeNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{slowmodeNotice}</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder={`Message #${activeChannel?.name || 'channel'} as ${currentUser.fullName}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Press Enter to send • Protected from ragebait and hostile language</span>
                {currentUser.role === 'alumni' && (
                  <span className="text-emerald-600 font-medium">Alumni Career Guide Active</span>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Institution Build Server Modal */}
      {showCreateServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Build Official Campus Server</h3>
              </div>
              <button
                onClick={() => setShowCreateServerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              As an authorized Institution or Administrator, you can establish an official campus server with structured anti-ragebait moderation and departmental spaces.
            </p>

            <form onSubmit={handleCreateServer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Server Name</label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={e => setNewServerName(e.target.value)}
                  placeholder="e.g. Coimbatore Institute of Technology Hub"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target College</label>
                <select
                  value={newServerCollegeId}
                  onChange={e => setNewServerCollegeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  value={newServerDescription}
                  onChange={e => setNewServerDescription(e.target.value)}
                  placeholder="Official server for student questions, verified announcements & placement intel."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1">
                <span className="font-bold">Automated Channel Provisions:</span>
                <p className="text-[11px] text-purple-700">
                  Includes #official-announcements, #ragebait-shielded-campus-hall, and #alumni-career-guidance out of the box with anti-ragebait filters.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateServerModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                >
                  Deploy Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
