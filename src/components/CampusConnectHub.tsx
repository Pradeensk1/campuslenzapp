'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import {
  UserProfile,
  DirectMessage,
  DiscordServer,
  ServerChannel,
  PrivateGrievanceReport
} from '@/types';
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
  X,
  Lock,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Hash,
  Clock,
  MessageCircle,
  MessageSquare,
  PenSquare,
  Heart,
  Image as ImageIcon,
  Phone,
  Video,
  User,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Share2
} from 'lucide-react';

interface CampusConnectHubProps {
  initialTab?: 'community' | 'messages' | 'grievance';
}

function ConnectHubContent({ initialTab = 'community' }: CampusConnectHubProps) {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab') as
    | 'community'
    | 'messages'
    | 'grievance'
    | null;

  // Active top-level Tab
  const [activeTab, setActiveTab] = useState<'community' | 'messages' | 'grievance'>(
    tabFromQuery || initialTab
  );

  const {
    currentUser,
    allUsers,
    colleges,
    servers,
    serverMessages,
    sendServerMessage,
    createDiscordServer,
    addChannelToCommunity,
    directMessages,
    sendDirectMessage,
    toggleLikeDirectMessage,
    grievanceReports,
    submitGrievanceReport,
    resolveGrievanceReport,
    joinServer,
    leaveServer,
    joinGroup,
    leaveGroup,
    requestFacultyCommunity,
    approveFacultyCommunity,
    rejectFacultyCommunity
  } = useApp();

  const isAlumni = currentUser?.role === 'alumni';
  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'faculty';
  const isInstitution = currentUser?.role === 'institution';
  const isAdmin = currentUser?.role === 'admin';

  const [connectFeedback, setConnectFeedback] = useState<string | null>(null);

  // If alumni, automatically switch away from community tab
  useEffect(() => {
    if (isAlumni && activeTab === 'community') {
      setActiveTab('messages');
    }
  }, [isAlumni, activeTab]);

  // Sync if query param changes
  useEffect(() => {
    if (tabFromQuery && (tabFromQuery === 'community' || tabFromQuery === 'messages' || tabFromQuery === 'grievance')) {
      if (isAlumni && tabFromQuery === 'community') {
        setActiveTab('messages');
      } else {
        setActiveTab(tabFromQuery);
      }
    }
  }, [tabFromQuery, isAlumni]);

  // =========================================================================
  // TAB 1: WHATSAPP COMMUNITY GROUPS STATE & LOGIC
  // =========================================================================
  const [activeCommunityId, setActiveCommunityId] = useState<string>(
    servers[0]?.id || 'server-psg-tech'
  );
  const activeCommunity =
    servers.find((s) => s.id === activeCommunityId) || servers[0];

  const [activeGroupId, setActiveGroupId] = useState<string>(
    activeCommunity?.channels?.[0]?.id || 'ch-announcements'
  );
  const activeGroup =
    activeCommunity?.channels?.find((c) => c.id === activeGroupId) ||
    activeCommunity?.channels?.[0];

  // Keep activeCommunity in sync when servers hydrate or change
  useEffect(() => {
    if (!servers.some((s) => s.id === activeCommunityId) && servers.length > 0) {
      setActiveCommunityId(servers[0].id);
    }
  }, [servers, activeCommunityId]);

  // Keep activeGroup in sync when activeCommunity changes
  useEffect(() => {
    if (activeCommunity?.channels && activeCommunity.channels.length > 0) {
      const channelExists = activeCommunity.channels.some((c) => c.id === activeGroupId);
      if (!channelExists) {
        setActiveGroupId(activeCommunity.channels[0].id);
      }
    }
  }, [activeCommunity, activeGroupId]);

  const [groupSearch, setGroupSearch] = useState('');
  const [communityMessageInput, setCommunityMessageInput] = useState('');
  const [slowmodeNotice, setSlowmodeNotice] = useState<string | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Modals for Admins
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

  const communityMessagesEndRef = useRef<HTMLDivElement>(null);

  const communityChannelMessages = useMemo(() => {
    return serverMessages.filter((m) => m.channelId === activeGroup?.id);
  }, [serverMessages, activeGroup?.id]);

  useEffect(() => {
    if (activeTab === 'community') {
      communityMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communityChannelMessages, activeTab]);

  const isAnnouncementGroup =
    activeGroup?.type === 'announcements' || activeGroup?.isAnnouncementOnly;

  const canPostInCommunityGroup =
    !isAnnouncementGroup ||
    currentUser?.role === 'institution' ||
    currentUser?.role === 'admin';

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

  const filteredDiscussionGroups = useMemo(() => {
    if (!groupSearch.trim()) return discussionSubGroups;
    const query = groupSearch.toLowerCase();
    return discussionSubGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
    );
  }, [discussionSubGroups, groupSearch]);

  const handleSendCommunityMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityMessageInput.trim() || !activeGroup) return;

    if (!canPostInCommunityGroup) {
      setSlowmodeNotice('🔒 Only Community Admins can send messages to this announcement group.');
      setTimeout(() => setSlowmodeNotice(null), 4000);
      return;
    }

    if (activeGroup.isRagebaitProtected) {
      const toxicKeywords = ['rage', 'scam', 'hate', 'fraud', 'cheat', 'attack', 'idiot'];
      const text = communityMessageInput.toLowerCase();
      if (toxicKeywords.some((w) => text.includes(w))) {
        setSlowmodeNotice(
          '⚠️ Ragebait Shield triggered: inflammatory phrases detected. Please keep discussions collegiate and constructive.'
        );
        setTimeout(() => setSlowmodeNotice(null), 4000);
        return;
      }
    }

    const res = sendServerMessage(activeGroup.id, communityMessageInput.trim());
    if (res?.message) {
      setSlowmodeNotice(res.message);
      setTimeout(() => setSlowmodeNotice(null), 4000);
    } else {
      setCommunityMessageInput('');
      setSlowmodeNotice(null);
    }
  };

  const handleAddGroupToCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !activeCommunity) return;

    const created = addChannelToCommunity(activeCommunity.id, {
      name: newGroupName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newGroupDescription.trim() || 'Community discussion group.',
      type: newGroupType,
      isRagebaitProtected: newGroupRagebaitProtected,
      isAnnouncementOnly: newGroupIsAnnouncement,
      memberCount: activeCommunity.memberCount
    });

    setActiveGroupId(created.id);
    setShowAddGroupModal(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupType('general');
    setNewGroupIsAnnouncement(false);
    setNewGroupRagebaitProtected(false);
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    if (isFaculty) {
      const res = requestFacultyCommunity(
        newCommunityName.trim(),
        newCommunityDesc.trim() || 'Academic faculty student interaction hub.',
        newCommunityCollegeId
      );
      setConnectFeedback(res.message);
      setShowCreateCommunityModal(false);
      setNewCommunityName('');
      setNewCommunityDesc('');
      setTimeout(() => setConnectFeedback(null), 4000);
      return;
    }

    if (isInstitution) {
      const existingInstCommunity = servers.find(
        (s) => s.institutionOwnerId === currentUser?.id && !s.pendingApproval
      );
      if (existingInstCommunity) {
        setConnectFeedback(
          `⚠️ Institution Limit: You have already created your 1 official campus community (${existingInstCommunity.name}).`
        );
        setShowCreateCommunityModal(false);
        setTimeout(() => setConnectFeedback(null), 4000);
        return;
      }
    }

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
    setConnectFeedback('🎉 Campus Community launched successfully!');
    setTimeout(() => setConnectFeedback(null), 3000);
  };

  // =========================================================================
  // TAB 2: INSTAGRAM DIRECT MESSAGES STATE & LOGIC
  // =========================================================================
  const initialPartnerId = useMemo(() => {
    if (!currentUser) {
      return allUsers[0]?.id || null;
    }
    const lastMsg = directMessages
      .filter((m) => m.senderId === currentUser.id || m.receiverId === currentUser.id)
      .slice(-1)[0];
    if (lastMsg) {
      return lastMsg.senderId === currentUser.id
        ? lastMsg.receiverId
        : lastMsg.senderId;
    }
    const otherUser = allUsers.find((u) => u.id !== currentUser.id);
    return otherUser ? otherUser.id : (allUsers[0]?.id || null);
  }, [directMessages, currentUser?.id, allUsers]);

  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId);

  // Synchronize activePartnerId when initialPartnerId becomes available
  useEffect(() => {
    if (!activePartnerId && initialPartnerId) {
      setActivePartnerId(initialPartnerId);
    }
  }, [activePartnerId, initialPartnerId]);

  const activePartner = useMemo(() => {
    return allUsers.find((u) => u.id === activePartnerId) || null;
  }, [allUsers, activePartnerId]);

  const [conversationsSearch, setConversationsSearch] = useState('');
  const [directMessageInput, setDirectMessageInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const directMessagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversations = useMemo(() => {
    if (!currentUser) return [];
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

    list.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return list;
  }, [directMessages, currentUser?.id, allUsers]);

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

  const currentChatMessages = useMemo(() => {
    if (!activePartner || !currentUser) return [];
    return directMessages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === activePartner.id) ||
          (m.senderId === activePartner.id && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [directMessages, currentUser?.id, activePartner]);

  useEffect(() => {
    if (activeTab === 'messages') {
      directMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChatMessages, activeTab]);

  const candidateUsers = useMemo(() => {
    const list = allUsers.filter((u) => !currentUser || u.id !== currentUser.id);
    if (!userSearchQuery.trim()) return list;
    const q = userSearchQuery.toLowerCase();
    return list.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.collegeName?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [allUsers, currentUser?.id, userSearchQuery]);

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageInput.trim() || !activePartner) return;

    sendDirectMessage(activePartner.id, directMessageInput.trim());
    setDirectMessageInput('');
  };

  const handleSendHeart = () => {
    if (!activePartner) return;
    sendDirectMessage(activePartner.id, '❤️');
  };

  const handleStartChatWithUser = (user: UserProfile) => {
    setActivePartnerId(user.id);
    setShowNewChatModal(false);
    setUserSearchQuery('');
  };

  // =========================================================================
  // TAB 3: PRIVATE GRIEVANCE STATE & LOGIC
  // =========================================================================
  const [targetCollegeId, setTargetCollegeId] = useState(
    currentUser?.collegeId || colleges[0]?.id || 'col-psg'
  );
  const [category, setCategory] = useState<PrivateGrievanceReport['category']>('faculty_conduct');
  const [targetFacultyName, setTargetFacultyName] = useState('');
  const [subjectOrCourse, setSubjectOrCourse] = useState('');
  const [detailedComplaint, setDetailedComplaint] = useState('');
  const [isAnonymousToFaculty, setIsAnonymousToFaculty] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [activeReportToResolve, setActiveReportToResolve] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<
    'under_investigation' | 'resolved' | 'action_taken'
  >('action_taken');

  const isInstitutionOrAdmin =
    currentUser?.role === 'institution' || currentUser?.role === 'admin';

  const studentReports = currentUser
    ? grievanceReports.filter((r) => r.studentId === currentUser.id)
    : [];

  const institutionReports = isInstitutionOrAdmin && currentUser
    ? currentUser.role === 'admin'
      ? grievanceReports
      : grievanceReports.filter(
          (r) =>
            r.targetInstitutionId === currentUser.collegeId ||
            r.collegeName.includes('PSG Tech') ||
            r.targetInstitutionId === 'col-psg'
        )
    : [];

  const handleStudentGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !detailedComplaint.trim() || !subjectOrCourse.trim()) return;

    const matchedCollege = colleges.find((c) => c.id === targetCollegeId);

    const report = submitGrievanceReport({
      studentId: currentUser.id,
      studentName: isAnonymousToFaculty ? 'Confidential Student ID' : currentUser.fullName,
      isAnonymousToFaculty,
      targetInstitutionId: targetCollegeId,
      collegeName: matchedCollege?.name || 'Selected Institution Desk',
      category,
      targetFacultyName: targetFacultyName.trim() || undefined,
      subjectOrCourse: subjectOrCourse.trim(),
      detailedComplaint: detailedComplaint.trim()
    });

    setSubmitSuccess(
      `Report #${report.id.slice(
        -6
      )} submitted securely to ${matchedCollege?.name || 'Institution Desk'}. Student identity is shielded from public feeds.`
    );
    setDetailedComplaint('');
    setTargetFacultyName('');
    setSubjectOrCourse('');

    setTimeout(() => {
      setSubmitSuccess(null);
    }, 6000);
  };

  const handleResolveGrievanceSubmit = (reportId: string) => {
    if (!resolutionRemarks.trim()) return;
    resolveGrievanceReport(reportId, resolutionRemarks.trim(), resolutionStatus);
    setActiveReportToResolve(null);
    setResolutionRemarks('');
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Campus Connect Hub
          </h2>
          <p className="text-slate-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Join institution community channels, engage in Instagram-style direct chats with verified peers, or submit confidential grievances to college administrations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-xs flex items-center justify-center gap-2"
            >
              Sign In to Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex items-center justify-center"
            >
              Create Fresh Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-4 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* =============================================================== */}
        {/* UNIFIED HEADER & TOP PILL TAB SWITCHER                          */}
        {/* =============================================================== */}
        <div className="ocean-glass-card touch-over-glass border border-white/80 rounded-[28px] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/20">
                <MessageSquare className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-sky-950">
                  Campus Communication & Resolution Hub
                </h1>
                <p className="text-xs text-sky-800/80 mt-0.5">
                  Unified platform: WhatsApp-style campus community groups, Instagram 1-on-1 direct messages, and confidential grievance reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Unified Tab Switcher (Communities hidden for Alumni as requested) */}
          <div className="flex items-center bg-white/60 p-1.5 rounded-full border border-white/90 text-xs font-bold w-full md:w-auto shadow-inner">
            {!isAlumni && (
              <button
                onClick={() => setActiveTab('community')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === 'community'
                    ? 'ocean-glossy-button text-white shadow-md'
                    : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/50'
                }`}
              >
                <Users className="w-4 h-4 text-sky-300" />
                <span>Communities</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-200/60 text-sky-900 font-bold">
                  {activeCommunity?.channels.length || 0}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === 'messages'
                  ? 'ocean-glossy-button text-white shadow-md'
                  : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/50'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-300" />
              <span>Direct Messages</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-200/60 text-sky-900 font-bold">
                {activeConversations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('grievance')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === 'grievance'
                  ? 'ocean-glossy-button text-white shadow-md'
                  : 'text-sky-800/80 hover:text-sky-950 hover:bg-white/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-300" />
              <span>Private Grievance</span>
              {isInstitutionOrAdmin ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-200/60 text-cyan-950 font-bold">
                  {institutionReports.length}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-200/60 text-cyan-950 font-bold">
                  {studentReports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {connectFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{connectFeedback}</span>
            </div>
            <button onClick={() => setConnectFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 1: WHATSAPP COMMUNITY GROUPS                                */}
        {/* =============================================================== */}
        {activeTab === 'community' && (
          !activeCommunity ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Campus Communities Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Deploy an official campus community to connect students, alumni, and faculty in structured discussion channels.
              </p>
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Deploy Community
              </button>
            </div>
          ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[660px]">
            {/* Left Sidebar: Community Info & Groups */}
            <div className="md:col-span-4 border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                        {(activeCommunity.name || 'Campus').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                          {activeCommunity.name}
                        </h2>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>{activeCommunity.memberCount} members</span>
                        </p>
                      </div>
                    </div>

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

                  <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-100">
                    {activeCommunity.description}
                  </p>

                  {/* Role Specific Actions Bar for Community */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    {/* Student Join/Leave Server Button */}
                    {isStudent && (
                      currentUser?.joinedServerIds?.includes(activeCommunity.id) ? (
                        <button
                          type="button"
                          onClick={() => {
                            leaveServer(activeCommunity.id);
                            setConnectFeedback(`Exited ${activeCommunity.name}`);
                            setTimeout(() => setConnectFeedback(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                        >
                          Exit Community
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            joinServer(activeCommunity.id);
                            setConnectFeedback(`Joined ${activeCommunity.name} successfully!`);
                            setTimeout(() => setConnectFeedback(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs"
                        >
                          + Join Community
                        </button>
                      )
                    )}

                    {/* Institution Share Community Link */}
                    {isInstitution && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/servers?community=${activeCommunity.id}`;
                          navigator.clipboard.writeText(url);
                          setConnectFeedback('🔗 Community invite link copied to clipboard!');
                          setTimeout(() => setConnectFeedback(null), 3000);
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-1 transition"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share Invite Link</span>
                      </button>
                    )}

                    {/* Faculty Request Community button */}
                    {isFaculty && (
                      <button
                        type="button"
                        onClick={() => setShowCreateCommunityModal(true)}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                      >
                        + Request Community Approval
                      </button>
                    )}
                  </div>

                  {/* Pending Faculty Community Requests (Institution Approval Desk) */}
                  {(isInstitution || isAdmin) && (() => {
                    const pendingFacultyServers = servers.filter(
                      (s) => s.pendingApproval && (s.collegeId === currentUser?.collegeId || isAdmin)
                    );
                    if (pendingFacultyServers.length === 0) return null;

                    return (
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-purple-900 font-bold text-[11px]">
                          <span>Faculty Proposal Queue ({pendingFacultyServers.length})</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                            Awaiting Dean
                          </span>
                        </div>
                        {pendingFacultyServers.map((s) => (
                          <div key={s.id} className="p-2 rounded-lg bg-white border border-purple-100 space-y-1 text-[11px]">
                            <p className="font-bold text-slate-800">{s.name}</p>
                            <p className="text-[10px] text-slate-500">Proposed by {s.requestedByFacultyName}</p>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const res = approveFacultyCommunity(s.id);
                                  setConnectFeedback(res.message);
                                  setTimeout(() => setConnectFeedback(null), 3000);
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const res = rejectFacultyCommunity(s.id);
                                  setConnectFeedback(res.message);
                                  setTimeout(() => setConnectFeedback(null), 3000);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[10px]"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

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

                {/* Groups list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[480px]">
                  {/* Announcements */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <Megaphone className="w-3 h-3 text-emerald-600" />
                        Community Announcements
                      </span>
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
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              <Megaphone className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                  {group.name}
                                </h4>
                                {lastMsg && (
                                  <span suppressHydrationWarning className="text-[10px] text-slate-400 font-medium">
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
                                <span>Admins broadcast only</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-groups */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3 h-3 text-slate-400" />
                        Sub-Groups ({filteredDiscussionGroups.length})
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
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <GroupIcon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                  #{group.name}
                                </h4>
                                {lastMsg && (
                                  <span suppressHydrationWarning className="text-[10px] text-slate-400 font-medium">
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
                                <span>{group.memberCount || activeCommunity?.memberCount || 120} members</span>
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

              {/* Bottom bar */}
              <div className="p-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.fullName || 'Guest Visitor'}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {currentUser?.role || 'Guest'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {(currentUser?.role === 'institution' || currentUser?.role === 'admin') && (
                    <button
                      onClick={() => setShowAddGroupModal(true)}
                      title="Add Group"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowGroupInfo(true)}
                    title="Community Info"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Chat Canvas */}
            <div className="md:col-span-8 flex flex-col justify-between bg-[#F8FAFC]">
              {/* Header */}
              <div className="p-3.5 px-4 sm:px-6 border-b border-[#E2E8F0] bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    isAnnouncementGroup ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {isAnnouncementGroup ? (
                      <Megaphone className="w-4 h-4" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                      {isAnnouncementGroup ? '📢 ' : '#'}{activeGroup?.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {isAnnouncementGroup
                        ? 'Official Community Announcements (Broadcast only)'
                        : activeGroup?.description || `${activeGroup?.memberCount || activeCommunity?.memberCount || 120} participants`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isStudent && activeCommunity && activeGroup && (
                    <>
                      {currentUser?.joinedGroupIds?.includes(activeGroup.id) ? (
                        <button
                          type="button"
                          onClick={() => {
                            leaveGroup(activeCommunity.id, activeGroup.id);
                            setConnectFeedback(`Exited #${activeGroup.name}`);
                            setTimeout(() => setConnectFeedback(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                        >
                          Leave Channel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            joinGroup(activeCommunity.id, activeGroup.id);
                            setConnectFeedback(`Joined #${activeGroup.name}`);
                            setTimeout(() => setConnectFeedback(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-2xs"
                        >
                          + Join Channel
                        </button>
                      )}

                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>E2E Protected</span>
                      </span>

                      <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Screenshot Shield</span>
                      </span>
                    </>
                  )}

                  <button
                    onClick={() => setShowGroupInfo(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Info</span>
                  </button>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[440px]">
                {communityChannelMessages.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <p className="text-xs text-slate-400">Welcome to #{activeGroup?.name}. Start the conversation.</p>
                  </div>
                ) : (
                  communityChannelMessages.map((msg) => {
                    const isMe = msg.authorId === currentUser?.id;
                    const roleTextColor =
                      msg.authorRole === 'institution'
                        ? 'text-purple-700'
                        : msg.authorRole === 'alumni'
                        ? 'text-emerald-700'
                        : msg.authorRole === 'faculty'
                        ? 'text-amber-700'
                        : 'text-blue-700';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-xs border relative ${
                            isMe
                              ? 'bg-[#E0F2FE] border-blue-200 text-slate-900 rounded-br-none'
                              : 'bg-white border-slate-200 text-slate-900 rounded-bl-none'
                          }`}
                        >
                          {!isMe && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-xs font-bold ${roleTextColor}`}>
                                {msg.authorName}
                              </span>
                              <span className="text-[9px] uppercase px-1 rounded bg-slate-100 text-slate-600 font-semibold">
                                {msg.authorRole}
                              </span>
                            </div>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                            <span suppressHydrationWarning>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={communityMessagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-white space-y-2">
                {slowmodeNotice && (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{slowmodeNotice}</span>
                  </div>
                )}

                {!canPostInCommunityGroup ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Only Community Admins can send messages to <strong>#{activeGroup?.name}</strong>.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendCommunityMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={communityMessageInput}
                      onChange={(e) => setCommunityMessageInput(e.target.value)}
                      placeholder={`Message #${activeGroup?.name}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!communityMessageInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* =============================================================== */}
        {/* TAB 2: INSTAGRAM DIRECT MESSAGES                                */}
        {/* =============================================================== */}
        {activeTab === 'messages' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[660px]">
            {/* Alumni Mentorship Mode Banner */}
            {isAlumni && (
              <div className="md:col-span-12 p-3.5 bg-amber-50/90 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Alumni 1-on-1 Mentorship Mode:</strong> Public community and group channel feeds are hidden for alumni. Direct Messages are your dedicated bridge to guide and connect with students.
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  Verified Alumni Bridge
                </span>
              </div>
            )}

            {/* Left Panel: Conversations list */}
            <div className="md:col-span-4 border-r border-[#E2E8F0] bg-white flex flex-col justify-between">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      @{currentUser.username}
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

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[480px]">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <p className="text-xs text-slate-500">No active threads. Click "New Message" to chat with anyone!</p>
                      <button
                        onClick={() => setShowNewChatModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                        Chat with Anyone
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map(({ partner, lastMessage }) => {
                      const isSelected = activePartner?.id === partner.id;
                      const isFromMe = lastMessage.senderId === currentUser?.id;

                      return (
                        <button
                          key={partner.id}
                          onClick={() => setActivePartnerId(partner.id)}
                          className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                            isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                              {partner.fullName.charAt(0)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {partner.fullName}
                              </h4>
                              <span suppressHydrationWarning className="text-[10px] text-slate-400 font-medium">
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
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(partner.role)}`}>
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

              <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Total Contacts: {allUsers.length}</span>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  + New Chat
                </button>
              </div>
            </div>

            {/* Right Chat Canvas */}
            <div className="md:col-span-8 flex flex-col justify-between bg-white h-full">
              {activePartner ? (
                <>
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
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(activePartner.role)}`}>
                            {activePartner.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">@{activePartner.username} • Active now</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isStudent && (
                        <div className="flex items-center gap-1.5 mr-1">
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>E2E Protected</span>
                          </span>
                          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Screenshot Shield</span>
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/user/${activePartner.username}`}
                        title="View Full Profile"
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px] bg-white">
                    {currentChatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0 mb-1">
                              {activePartner.fullName.charAt(0)}
                            </div>
                          )}

                          <div className="relative max-w-[80%] sm:max-w-[65%]">
                            <div
                              onDoubleClick={() => toggleLikeDirectMessage(msg.id)}
                              className={`p-3.5 px-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                                isMe
                                  ? 'bg-[#0095F6] text-white rounded-br-xs shadow-xs'
                                  : 'bg-[#EFEFEF] text-slate-900 rounded-bl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              {msg.liked && (
                                <span className="absolute -bottom-2.5 right-2 bg-white rounded-full p-0.5 border border-slate-200 shadow-xs flex items-center justify-center">
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                </span>
                              )}
                            </div>

                            <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span suppressHydrationWarning>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <span>• Seen</span>}
                              <button
                                onClick={() => toggleLikeDirectMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-rose-500"
                              >
                                <Heart className={`w-3 h-3 ${msg.liked ? 'text-rose-500 fill-rose-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={directMessagesEndRef} />
                  </div>

                  {/* DM Input Bar */}
                  <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-white">
                    <form onSubmit={handleSendDirectMessage} className="flex items-center gap-2">
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={directMessageInput}
                          onChange={(e) => setDirectMessageInput(e.target.value)}
                          placeholder={`Message ${activePartner.fullName}...`}
                          className="w-full px-4 py-2.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0095F6] focus:bg-white pr-10"
                        />
                        {!directMessageInput.trim() && (
                          <button
                            type="button"
                            onClick={handleSendHeart}
                            title="Send ❤️"
                            className="absolute right-3 text-slate-400 hover:text-rose-500"
                          >
                            <Heart className="w-4 h-4 hover:fill-rose-500" />
                          </button>
                        )}
                      </div>

                      {directMessageInput.trim() ? (
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full bg-[#0095F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Send
                        </button>
                      ) : null}
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <Send className="w-10 h-10 text-slate-900 -rotate-45 translate-x-1 -translate-y-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your Direct Messages</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Send private 1-on-1 messages to any student, alumni, or faculty member.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#0095F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                  >
                    Start a Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: PRIVATE GRIEVANCE PORTAL                                 */}
        {/* =============================================================== */}
        {activeTab === 'grievance' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h3 className="font-bold text-slate-900">Protected Institution ID Grievance Tunnel</h3>
                <p className="text-slate-600 leading-relaxed">
                  Direct student-to-institution dispute routing with optional identity shielding. Kept strictly private to prevent viral social ragebait.
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {/* Student Submission Form */}
            {currentUser.role === 'student' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Submit New Private Report</h2>
                      <p className="text-xs text-slate-500">Delivered directly to the official Institution ID inbox</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Student Privilege
                  </span>
                </div>

                <form onSubmit={handleStudentGrievanceSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Target Institution / College
                      </label>
                      <select
                        value={targetCollegeId}
                        onChange={(e) => setTargetCollegeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                      >
                        {colleges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Grievance Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                      >
                        <option value="faculty_conduct">Faculty Conduct / Teaching Guidance</option>
                        <option value="classroom_issue">Classroom Environment & Lectures</option>
                        <option value="lab_infrastructure">Lab Hardware, Projector & Equipment</option>
                        <option value="grading_dispute">Internal Evaluation / Grading Dispute</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Target Faculty / Staff Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={targetFacultyName}
                        onChange={(e) => setTargetFacultyName(e.target.value)}
                        placeholder="e.g. Dr. K. Ramanathan (or leave blank for dept)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Subject Name / Course Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectOrCourse}
                        onChange={(e) => setSubjectOrCourse(e.target.value)}
                        placeholder="e.g. MCA-204 Distributed Cloud Architecture"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Detailed Grievance Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={detailedComplaint}
                      onChange={(e) => setDetailedComplaint(e.target.value)}
                      placeholder="Provide objective facts: dates, specific issues with teaching, missing equipment, unfair grading remarks, etc..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      {isAnonymousToFaculty ? (
                        <EyeOff className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          Shield Student Identity from Faculty
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Your name will be withheld from the faculty member and accessible only to institution admin.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymousToFaculty(!isAnonymousToFaculty)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isAnonymousToFaculty
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAnonymousToFaculty ? 'Shielded (Active)' : 'Revealed'}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      Transmit Grievance Securely
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Student Submitted History */}
            {currentUser.role === 'student' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  My Submitted Grievance Status ({studentReports.length})
                </h3>
                {studentReports.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">You have no active grievance submissions on file.</p>
                ) : (
                  <div className="space-y-3">
                    {studentReports.map((rep) => (
                      <div key={rep.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{rep.subjectOrCourse}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold capitalize bg-white border border-slate-200 text-slate-700">
                              {rep.category.replace('_', ' ')}
                            </span>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            rep.status === 'action_taken'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rep.status === 'resolved'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {rep.status === 'action_taken' ? 'Action Taken' : rep.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rep.detailedComplaint}</p>
                        {rep.institutionRemarks && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-800">Institution Official Resolution:</span>
                            <p className="text-slate-600">{rep.institutionRemarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Institution / Admin Review Section */}
            {isInstitutionOrAdmin && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-purple-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Institution Grievance Review Desk</h2>
                      <p className="text-xs text-slate-500">
                        Confidential submissions addressed to {currentUser.collegeName || 'Your Institution ID'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {currentUser.role.toUpperCase()} ACCESS
                  </span>
                </div>

                {institutionReports.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No active grievance submissions pending for this institution ID.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {institutionReports.map((rep) => (
                      <div key={rep.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-400">#{rep.id.slice(-6)}</span>
                              <span className="text-sm font-bold text-slate-900">{rep.subjectOrCourse}</span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                {rep.category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Submitted by: <strong>{rep.studentName}</strong> • Target Faculty: {rep.targetFacultyName || 'General Dept'}
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            rep.status === 'action_taken'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rep.status === 'resolved'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {rep.status === 'action_taken' ? 'Action Taken' : rep.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {rep.detailedComplaint}
                        </div>

                        {rep.institutionRemarks ? (
                          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                            <span className="font-bold text-purple-900">Your Official Resolution on File:</span>
                            <p className="text-purple-800">{rep.institutionRemarks}</p>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {activeReportToResolve === rep.id ? (
                              <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
                                <label className="block text-xs font-bold text-slate-800">
                                  Resolution Remarks & Corrective Action
                                </label>
                                <textarea
                                  rows={2}
                                  value={resolutionRemarks}
                                  onChange={(e) => setResolutionRemarks(e.target.value)}
                                  placeholder="e.g. Work order dispatched to IT maintenance; faculty notified for teaching pace adjustment."
                                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <div className="flex items-center justify-between">
                                  <select
                                    value={resolutionStatus}
                                    onChange={(e) => setResolutionStatus(e.target.value as any)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                                  >
                                    <option value="action_taken">Action Taken (Maintenance / Notice)</option>
                                    <option value="resolved">Resolved Completely</option>
                                    <option value="under_investigation">Under Investigation</option>
                                  </select>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setActiveReportToResolve(null)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResolveGrievanceSubmit(rep.id)}
                                      className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                                    >
                                      Submit Action
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReportToResolve(rep.id);
                                  setResolutionRemarks('');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors"
                              >
                                Resolve Grievance & Add Action Remarks
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* =============================================================== */}
      {/* SHARED MODALS                                                   */}
      {/* =============================================================== */}

      {/* 1. New Message Modal (Chat with Anyone on Platform) */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-1">
                Suggested People ({candidateUsers.length})
              </div>

              {candidateUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No users found matching &quot;{userSearchQuery}&quot;.
                </div>
              ) : (
                candidateUsers.map((user) => (
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
                          {user.isVerified && <span className="text-[10px] text-blue-500">✓</span>}
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${getRoleBadge(user.role)}`}>
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
                ))
              )}
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

      {/* 2. Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeCommunity?.name}</h3>
                  <p className="text-[11px] text-slate-500">Group: #{activeGroup?.name}</p>
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
                  Community Rules
                </span>
                <ul className="mt-1 space-y-1 text-slate-600 list-disc list-inside">
                  {(activeCommunity?.antiRagebaitRules || []).map((rule, idx) => (
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

      {/* 3. Add Sub-Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Sub-Group to {activeCommunity?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGroupToCommunity} className="space-y-3.5 text-xs">
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
                <label className="block font-bold text-slate-700 mb-1">Category</label>
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

      {/* 4. Deploy Community Modal */}
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

            <form onSubmit={handleCreateCommunitySubmit} className="space-y-3.5 text-xs">
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
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="Official community guidelines..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
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

export default function CampusConnectHub({ initialTab = 'community' }: CampusConnectHubProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Connect Hub...</div>}>
      <ConnectHubContent initialTab={initialTab} />
    </Suspense>
  );
}
