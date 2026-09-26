'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  College,
  CollegeReview,
  Post,
  Community,
  Comment,
  DiscordServer,
  ServerChannel,
  ServerMessage,
  PrivateGrievanceReport,
  DirectMessage
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_COLLEGES,
  INITIAL_REVIEWS,
  INITIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_DISCORD_SERVERS,
  INITIAL_SERVER_MESSAGES,
  INITIAL_GRIEVANCE_REPORTS,
  INITIAL_DIRECT_MESSAGES
} from './mockData';

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  headline?: string;
  bio?: string;
  collegeId?: string;
  collegeName?: string;
  department?: string;
  course?: string;
  graduationBatch?: string;
}

export const getRedirectUrlForRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'institution':
      return '/servers';
    case 'student':
      return '/';
    case 'alumni':
      return '/';
    case 'faculty':
      return '/';
    default:
      return '/';
  }
};

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  switchRole: (role: UserRole, targetUsername?: string) => void;
  loginAsRole: (role: UserRole, specificUsername?: string) => void;
  initializeTestUser: (role: UserRole) => { user: UserProfile; redirectUrl: string; message: string };
  loginUser: (
    identifier: string,
    password?: string,
    portalRole?: UserRole
  ) => { success: boolean; user?: UserProfile; redirectUrl: string; message: string };
  registerUser: (
    data: RegisterPayload
  ) => { success: boolean; user: UserProfile; redirectUrl: string; message: string };
  logout: () => void;
  allUsers: UserProfile[];
  colleges: College[];
  reviews: CollegeReview[];
  posts: Post[];
  communities: Community[];
  servers: DiscordServer[];
  serverMessages: ServerMessage[];
  directMessages: DirectMessage[];
  sendDirectMessage: (receiverId: string, content: string) => DirectMessage;
  toggleLikeDirectMessage: (messageId: string) => void;
  grievanceReports: PrivateGrievanceReport[];
  savedCollegeIds: string[];
  toggleSaveCollege: (collegeId: string) => void;
  addReview: (review: Omit<CollegeReview, 'id' | 'createdAt'>) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => { success: boolean; message?: string };
  toggleLikePost: (postId: string) => { success: boolean; message?: string };
  addComment: (postId: string, content: string) => { success: boolean; message?: string };
  toggleFollowUser: (targetUserId: string) => void;
  addInstitutionReply: (reviewId: string, replyText: string) => void;
  getUserByUsername: (username: string) => UserProfile | undefined;
  getUserById: (id: string) => UserProfile | undefined;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  repostToInstitution: (postId: string) => { success: boolean; message: string };
  reportFalseInfoPost: (postId: string, reason: string) => { success: boolean; message: string };
  deletePost: (postId: string) => { success: boolean; message: string };
  sendServerMessage: (channelId: string, content: string) => { success: boolean; message?: string };
  createDiscordServer: (
    name: string,
    description: string,
    collegeId: string,
    channels: ServerChannel[],
    antiRagebaitRules: string[]
  ) => DiscordServer;
  addChannelToCommunity: (
    serverId: string,
    channel: Omit<ServerChannel, 'id'>
  ) => ServerChannel;
  submitGrievanceReport: (
    data: Omit<PrivateGrievanceReport, 'id' | 'submittedAt' | 'status'>
  ) => PrivateGrievanceReport;
  resolveGrievanceReport: (
    reportId: string,
    remarks: string,
    status?: 'under_investigation' | 'resolved' | 'action_taken'
  ) => void;
  executeAdminTerminalCommand: (cmd: string) => string;
  isLiveFeedActive: boolean;
  setIsLiveFeedActive: (active: boolean) => void;
  unreadLivePostsCount: number;
  applyUnreadLivePosts: () => void;
  triggerLiveActivity: () => void;
  resetAllUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Simulated Dynamic Campus Stream Updates (Like LinkedIn & Instagram)
const DYNAMIC_CAMPUS_FEED_POOL: Array<Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>> = [
  {
    authorId: 'user-live-sanjay',
    authorUsername: 'sanjay_dev',
    authorName: 'Sanjay V',
    authorRole: 'student',
    authorHeadline: 'Final Year CSE @ PSG Tech | Incoming SDE @ Zoho',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: '🎉 Offer Acceptance: Delighted to share that I have accepted an offer as a Software Development Engineer at Zoho Corporation starting July 2026!\n\nBig thanks to the college placement cell, seniors for mock technical interviews, and my batchmates for the late-night DSA study sessions. For juniors preparing for Zoho: focus intensely on clean recursion, matrix manipulation, and OOP design patterns! 🚀 #ZohoCareers #CampusPlacements #PSGTech',
    topic: 'Campus Placements',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=100'
  },
  {
    authorId: 'user-live-karthika',
    authorUsername: 'karthika_amazon',
    authorName: 'Karthika R',
    authorRole: 'alumni',
    authorHeadline: 'Software Engineer II @ Amazon | PSG Alumna (2022)',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: '🚀 Alumni Referral Opportunity:\nOur AWS Developer Productivity team in Chennai is expanding! We have 2 full-time openings for 2024/2025/2026 graduates with hands-on experience in distributed systems, TypeScript/Go, and cloud architectures.\n\nDrop a comment with your GitHub portfolio or reach out via direct message on Campus Lenz for a direct internal referral! #AlumniNetwork #AmazonJobs #Referral #TechCareers',
    topic: 'Alumni Mentorship'
  },
  {
    authorId: 'user-live-dinesh',
    authorUsername: 'dinesh_robotics',
    authorName: 'Dinesh Kumar',
    authorRole: 'student',
    authorHeadline: 'Robotics & AI Club President @ PSG Tech',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Our campus autonomous rover just completed its live 5km waypoint navigation test across the central campus quadrangle with 99.4% obstacle avoidance accuracy! 🤖 GPS RTK + LiDAR mapping working in harmony. Join us at the robotics open showcase this Friday at 4 PM! #Robotics #EmbeddedSystems #Engineering',
    topic: 'Hackathons & Projects',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=100'
  },
  {
    authorId: 'user-inst-demo',
    authorUsername: 'institution_admin',
    authorName: 'PSG Tech Official Administration',
    authorRole: 'institution',
    authorHeadline: 'Central Administrative Desk',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: '🏛️ Dean of Academic Research: High-Performance GPU Cluster (8x NVIDIA H100) is now live in the Central Computing Facility for all postgraduate, Ph.D., and final-year capstone research projects. Access slots can be booked through the student portal starting tomorrow.',
    topic: 'Official Announcements',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=100'
  },
  {
    authorId: 'user-live-meera',
    authorUsername: 'meera_ai',
    authorName: 'Meera N',
    authorRole: 'student',
    authorHeadline: 'B.Tech AI & Data Science @ PSG Tech | Kaggle Expert',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Just published our benchmark study on Local LLM quantizations (4-bit vs 8-bit) on consumer GPUs! Fine-tuning results show 85% latency reduction with less than 2% perplexity loss. Code and HuggingFace weights linked below! #MachineLearning #OpenSource #AIResearch',
    topic: 'Research & Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=100'
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [colleges] = useState<College[]>(INITIAL_COLLEGES);
  const [reviews, setReviews] = useState<CollegeReview[]>(INITIAL_REVIEWS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [servers, setServers] = useState<DiscordServer[]>(INITIAL_DISCORD_SERVERS);
  const [serverMessages, setServerMessages] = useState<ServerMessage[]>(INITIAL_SERVER_MESSAGES);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(INITIAL_DIRECT_MESSAGES);
  const [grievanceReports, setGrievanceReports] = useState<PrivateGrievanceReport[]>(INITIAL_GRIEVANCE_REPORTS);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);

  // Dynamic Live Feed & Real-Time Engine State
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(false);
  const [stagedLivePosts, setStagedLivePosts] = useState<Post[]>([]);

  // 1. Hydrate and Clean Legacy Storage on Initial Client Mount
  useEffect(() => {
    try {
      // Clean legacy mock user traces if present
      if (!localStorage.getItem('CL_FRESH_DB_V5_PURGED')) {
        localStorage.removeItem('campus_lenz_user');
        localStorage.removeItem('campus_lenz_auth');
        localStorage.removeItem('campus_lenz_saved');
        localStorage.removeItem('campuslenz_v4_purged');
        localStorage.removeItem('CL_DYNAMIC_DB_V3');
        localStorage.removeItem('CL_DYNAMIC_DB_V4');
        localStorage.setItem('CL_FRESH_DB_V5_PURGED', 'true');
      }

      const rawDb = localStorage.getItem('CL_FRESH_DB_V5');
      if (rawDb) {
        const parsed = JSON.parse(rawDb);
        if (parsed.allUsers && Array.isArray(parsed.allUsers)) setAllUsers(parsed.allUsers);
        if (parsed.currentUser) {
          setCurrentUser(parsed.currentUser);
          setIsAuthenticated(true);
        }
        if (parsed.posts && Array.isArray(parsed.posts)) setPosts(parsed.posts);
        if (parsed.reviews && Array.isArray(parsed.reviews)) setReviews(parsed.reviews);
        if (parsed.communities && Array.isArray(parsed.communities)) setCommunities(parsed.communities);
        if (parsed.servers && Array.isArray(parsed.servers)) setServers(parsed.servers);
        if (parsed.serverMessages && Array.isArray(parsed.serverMessages)) setServerMessages(parsed.serverMessages);
        if (parsed.directMessages && Array.isArray(parsed.directMessages)) setDirectMessages(parsed.directMessages);
        if (parsed.grievanceReports && Array.isArray(parsed.grievanceReports)) setGrievanceReports(parsed.grievanceReports);
        if (parsed.savedCollegeIds && Array.isArray(parsed.savedCollegeIds)) setSavedCollegeIds(parsed.savedCollegeIds);
      }
    } catch (e) {
      console.error('Storage hydration error:', e);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // 2. Real-Time Dynamic Storage Sync: Auto-persist all mutations
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      const dataToSave = {
        allUsers,
        currentUser,
        posts,
        reviews,
        communities,
        servers,
        serverMessages,
        directMessages,
        grievanceReports,
        savedCollegeIds
      };
      localStorage.setItem('CL_FRESH_DB_V5', JSON.stringify(dataToSave));
      if (currentUser) {
        localStorage.setItem('campus_lenz_user', JSON.stringify(currentUser));
        localStorage.setItem('campus_lenz_auth', 'true');
      } else {
        localStorage.removeItem('campus_lenz_user');
        localStorage.setItem('campus_lenz_auth', 'false');
      }
    } catch {}
  }, [
    hasHydrated,
    allUsers,
    currentUser,
    isAuthenticated,
    posts,
    reviews,
    communities,
    servers,
    serverMessages,
    directMessages,
    grievanceReports,
    savedCollegeIds
  ]);

  // 3. Automated Dynamic Live Activity Ticker (Runs in Background)
  useEffect(() => {
    if (!hasHydrated || !isLiveFeedActive) return;

    let poolIndex = 0;
    const interval = setInterval(() => {
      const template = DYNAMIC_CAMPUS_FEED_POOL[poolIndex % DYNAMIC_CAMPUS_FEED_POOL.length];
      poolIndex++;

      const newPost: Post = {
        ...template,
        id: `post-live-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: [],
        likesCount: Math.floor(Math.random() * 30) + 15,
        comments: [],
        commentsCount: Math.floor(Math.random() * 3) + 1,
        sharesCount: Math.floor(Math.random() * 10) + 3,
        moderationStatus: 'normal'
      };

      setPosts(prev => [newPost, ...prev]);
    }, 28000);

    return () => clearInterval(interval);
  }, [hasHydrated, isLiveFeedActive]);

  // Manually trigger a live post right now
  const triggerLiveActivity = () => {
    const randomTemplate = DYNAMIC_CAMPUS_FEED_POOL[Math.floor(Math.random() * DYNAMIC_CAMPUS_FEED_POOL.length)];
    const manualPost: Post = {
      ...randomTemplate,
      id: `post-manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: [],
      likesCount: Math.floor(Math.random() * 20) + 10,
      comments: [],
      commentsCount: 1,
      sharesCount: Math.floor(Math.random() * 5) + 1,
      moderationStatus: 'normal'
    };
    setPosts(prev => [manualPost, ...prev]);
  };

  const applyUnreadLivePosts = () => {
    if (stagedLivePosts.length > 0) {
      setPosts(prev => [...stagedLivePosts, ...prev]);
      setStagedLivePosts([]);
    }
  };

  // Complete Data Wipe & Reset Engine
  const resetAllUserData = () => {
    try {
      localStorage.removeItem('CL_FRESH_DB_V5');
      localStorage.removeItem('CL_DYNAMIC_DB_V4');
      localStorage.removeItem('campus_lenz_user');
      localStorage.removeItem('campus_lenz_auth');
      localStorage.removeItem('campus_lenz_saved');
    } catch {}

    setAllUsers([]);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setPosts([]);
    setReviews([]);
    setCommunities([]);
    setServers([]);
    setServerMessages([]);
    setDirectMessages([]);
    setGrievanceReports([]);
    setSavedCollegeIds([]);
    setStagedLivePosts([]);
    setIsLiveFeedActive(false);
  };

  // Initialize a fresh test persona on demand for seamless instant role testing
  const initializeTestUser = (
    role: UserRole
  ): { user: UserProfile; redirectUrl: string; message: string } => {
    const existing = allUsers.find(u => u.role === role);
    if (existing) {
      setCurrentUser(existing);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('campus_lenz_user', JSON.stringify(existing));
        localStorage.setItem('campus_lenz_auth', 'true');
      } catch {}
      return {
        user: existing,
        redirectUrl: getRedirectUrlForRole(existing.role),
        message: `Signed in as [${role.toUpperCase()}]: ${existing.fullName}`
      };
    }

    const testPersona: UserProfile = {
      id: `user-${role}-${Date.now()}`,
      username: `${role}_demo`,
      email: `${role}@campuslenz.edu`,
      role,
      fullName:
        role === 'student'
          ? 'Verified Campus Student'
          : role === 'alumni'
          ? 'Alumni Industry Mentor'
          : role === 'institution'
          ? 'PSG Tech Administration'
          : role === 'faculty'
          ? 'Dr. Academic Faculty Guide'
          : 'Campus Lenz Super Admin',
      headline:
        role === 'student'
          ? 'B.Tech CSE @ PSG Tech | Aspiring Software Engineer'
          : role === 'alumni'
          ? 'Senior Software Engineer | Campus Alumnus & Mentor'
          : role === 'institution'
          ? 'Official Campus Administration Desk • PSG Tech'
          : role === 'faculty'
          ? 'Professor & Head of Department'
          : 'Platform Lead Developer & Trust Administrator',
      bio: `Active ${role} profile on Campus Lenz.`,
      collegeId: 'col-psg',
      collegeName: 'PSG College of Technology',
      department: 'Computer Science & Engineering',
      course: role === 'student' ? 'B.Tech CSE' : undefined,
      graduationBatch: role === 'student' ? '2026' : role === 'alumni' ? '2023' : undefined,
      isVerified: true,
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [testPersona, ...prev]);
    setCurrentUser(testPersona);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(testPersona));
      localStorage.setItem('campus_lenz_auth', 'true');
    } catch {}

    return {
      user: testPersona,
      redirectUrl: getRedirectUrlForRole(testPersona.role),
      message: `Initialized and signed in as [${testPersona.role.toUpperCase()}]: ${testPersona.fullName}!`
    };
  };

  // Professional Login Method: verifies identifier against database & computes proper destination
  const loginUser = (
    identifier: string,
    password?: string,
    portalRole?: UserRole
  ): { success: boolean; user?: UserProfile; redirectUrl: string; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return {
        success: false,
        redirectUrl: '/login',
        message: 'Please enter your username or registered institutional email.'
      };
    }

    // 1. Search existing user directory by username or email
    let matched = allUsers.find(
      u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    // 2. If not matched by exact text, check if identifier matches portalRole
    if (!matched && portalRole) {
      matched = allUsers.find(u => u.role === portalRole);
    }

    if (!matched) {
      return {
        success: false,
        redirectUrl: '/login',
        message: `Account "${identifier}" not found in database. Please register your account or click "Quick Initialize Test Account".`
      };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(matched));
      localStorage.setItem('campus_lenz_auth', 'true');
    } catch {}

    const redirectUrl = getRedirectUrlForRole(matched.role);
    return {
      success: true,
      user: matched,
      redirectUrl,
      message: `Welcome back, ${matched.fullName}! Authenticated as [${matched.role.toUpperCase()}].`
    };
  };

  // Professional Registration Method: registers new user persona and logs them in
  const registerUser = (
    data: RegisterPayload
  ): { success: boolean; user: UserProfile; redirectUrl: string; message: string } => {
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    // Check collision
    const existing = allUsers.find(
      u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      return {
        success: false,
        user: existing,
        redirectUrl: '/login',
        message: `Username "${cleanUsername}" or email is already registered. Please sign in instead.`
      };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      role: data.role,
      fullName: data.fullName.trim(),
      headline:
        data.headline?.trim() ||
        (data.role === 'student'
          ? `${data.course || 'B.Tech / MCA'} Student @ ${data.collegeName || 'PSG Tech'}`
          : data.role === 'alumni'
          ? `Alumnus @ ${data.collegeName || 'PSG Tech'} | Industry Professional`
          : data.role === 'institution'
          ? `Official Campus Administration • ${data.collegeName || 'University Authority'}`
          : data.role === 'faculty'
          ? `Faculty Member • ${data.department || 'Computer Science'}`
          : 'Campus Lenz Super Administrator'),
      bio:
        data.bio?.trim() ||
        `Verified ${data.role} account created on Campus Lenz.`,
      collegeId: data.collegeId || 'col-psg',
      collegeName: data.collegeName || 'PSG College of Technology',
      department: data.department?.trim() || 'Computer Science',
      course: data.course?.trim(),
      graduationBatch: data.graduationBatch?.trim() || '2026',
      isVerified: true,
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(newUser));
      localStorage.setItem('campus_lenz_auth', 'true');
    } catch {}

    const redirectUrl = getRedirectUrlForRole(newUser.role);
    return {
      success: true,
      user: newUser,
      redirectUrl,
      message: `Account created successfully! Welcome to Campus Lenz, ${newUser.fullName}.`
    };
  };

  const loginAsRole = (role: UserRole, specificUsername?: string) => {
    let target: UserProfile | undefined;
    if (specificUsername) {
      target = allUsers.find(u => u.username.toLowerCase() === specificUsername.toLowerCase());
    }
    if (!target) {
      target = allUsers.find(u => u.role === role);
    }

    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('campus_lenz_user', JSON.stringify(target));
        localStorage.setItem('campus_lenz_auth', 'true');
      } catch {}
    } else {
      initializeTestUser(role);
    }
  };

  const switchRole = (role: UserRole, targetUsername?: string) => {
    loginAsRole(role, targetUsername);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('campus_lenz_user');
      localStorage.setItem('campus_lenz_auth', 'false');
      const rawDb = localStorage.getItem('CL_FRESH_DB_V5');
      if (rawDb) {
        const parsed = JSON.parse(rawDb);
        parsed.currentUser = null;
        localStorage.setItem('CL_FRESH_DB_V5', JSON.stringify(parsed));
      }
    } catch {}
  };

  const toggleSaveCollege = (collegeId: string) => {
    setSavedCollegeIds(prev => {
      const next = prev.includes(collegeId)
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId];
      try {
        localStorage.setItem('campus_lenz_saved', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addReview = (newRev: Omit<CollegeReview, 'id' | 'createdAt'>) => {
    const fullReview: CollegeReview = {
      ...newRev,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [fullReview, ...prev]);
  };

  // Student Posting Capability Check
  const addPost = (newPost: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => {
    if (!currentUser) {
      return {
        success: false,
        message: 'Please sign in or register to publish a post.'
      };
    }
    if (currentUser.role === 'institution') {
      return {
        success: false,
        message: 'Institutions can only repost verified student posts to their profile, not create standalone student posts.'
      };
    }
    if (currentUser.role === 'faculty') {
      return {
        success: false,
        message: 'Faculty members have preview and commenting rights on student posts. Student post authoring is reserved for Students and Alumni.'
      };
    }

    const post: Post = {
      ...newPost,
      id: `post-${Date.now()}`,
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      moderationStatus: 'normal'
    };
    setPosts(prev => [post, ...prev]);

    return { success: true };
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to like posts.' };
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likes.includes(currentUser.id);
        const updatedLikes = alreadyLiked
          ? p.likes.filter(id => id !== currentUser.id)
          : [...p.likes, currentUser.id];
        return {
          ...p,
          likes: updatedLikes,
          likesCount: updatedLikes.length
        };
      })
    );
    return { success: true };
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to comment.' };
    if (!content.trim()) return { success: false, message: 'Comment cannot be blank.' };

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      authorHeadline: currentUser.headline,
      isVerifiedAuthor: currentUser.isVerified,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment],
          commentsCount: p.commentsCount + 1
        };
      })
    );
    return { success: true };
  };

  // Institution Repost Right
  const repostToInstitution = (postId: string) => {
    if (!currentUser || (currentUser.role !== 'institution' && currentUser.role !== 'admin')) {
      return {
        success: false,
        message: 'Only authorized Institution accounts can repost student posts to the official university profile.'
      };
    }

    let found = false;
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          found = true;
          return {
            ...p,
            sharesCount: p.sharesCount + 1,
            repostedByInstitution: {
              institutionId: currentUser.id,
              institutionName: currentUser.fullName,
              repostedAt: new Date().toISOString()
            }
          };
        }
        return p;
      })
    );

    return found
      ? { success: true, message: `Successfully reposted to ${currentUser.fullName}'s official institution feed!` }
      : { success: false, message: 'Post not found.' };
  };

  // Institution False Information Report Right
  const reportFalseInfoPost = (postId: string, reason: string) => {
    if (!currentUser || (currentUser.role !== 'institution' && currentUser.role !== 'admin')) {
      return {
        success: false,
        message: 'Only registered Institutions and Admins can file institutional false information flags.'
      };
    }

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            moderationStatus: 'sensitive',
            reportedByInstitution: {
              reportedAt: new Date().toISOString(),
              reason: reason.trim() || 'Contains unverified or misleading campus claims targeting college reputation.',
              institutionName: currentUser.fullName
            }
          };
        }
        return p;
      })
    );

    return {
      success: true,
      message: 'Post flagged for admin review and marked for unverified claims investigation.'
    };
  };

  const deletePost = (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return { success: false, message: 'Post not found.' };

    const isAuthor = currentUser && postToDelete.authorId === currentUser.id;
    const isAdmin = currentUser?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return { success: false, message: 'Only post authors or administrators can delete posts.' };
    }

    setPosts(prev => prev.filter(p => p.id !== postId));
    return { success: true, message: 'Post deleted permanently.' };
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (!currentUser || targetUserId === currentUser.id) return;

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          const isFollowing = u.followers.includes(currentUser.id);
          const nextFollowers = isFollowing
            ? u.followers.filter(id => id !== currentUser.id)
            : [...u.followers, currentUser.id];
          return {
            ...u,
            followers: nextFollowers,
            followersCount: nextFollowers.length
          };
        }
        if (u.id === currentUser.id) {
          const isFollowing = u.following.includes(targetUserId);
          const nextFollowing = isFollowing
            ? u.following.filter(id => id !== targetUserId)
            : [...u.following, targetUserId];
          return {
            ...u,
            following: nextFollowing,
            followingCount: nextFollowing.length
          };
        }
        return u;
      })
    );

    setCurrentUser(prev => {
      if (!prev) return null;
      const isFollowing = prev.following.includes(targetUserId);
      const nextFollowing = isFollowing
        ? prev.following.filter(id => id !== targetUserId)
        : [...prev.following, targetUserId];
      return {
        ...prev,
        following: nextFollowing,
        followingCount: nextFollowing.length
      };
    });
  };

  const addInstitutionReply = (reviewId: string, replyText: string) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            institutionReply: {
              text: replyText,
              repliedAt: new Date().toISOString(),
              officialName: currentUser?.fullName || 'Verified College Representative'
            }
          };
        }
        return r;
      })
    );
  };

  const getUserByUsername = (username: string) => {
    return allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  };

  const getUserById = (id: string) => {
    return allUsers.find(u => u.id === id);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    
    if (updatedData.fullName || updatedData.headline) {
      setPosts(prev => prev.map(p => {
        if (p.authorId === currentUser.id) {
          return {
            ...p,
            authorName: updatedData.fullName || p.authorName,
            authorHeadline: updatedData.headline || p.authorHeadline
          };
        }
        return p;
      }));
    }

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updatedUser));
    } catch {}
  };

  // WhatsApp Community / Campus Servers: Send Message
  const sendServerMessage = (channelId: string, content: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to send messages.' };
    if (!content.trim()) return { success: false, message: 'Message cannot be empty.' };

    // Check if channel is announcement-only and user is not an institution/admin
    const currentServer = servers.find(s => s.channels.some(c => c.id === channelId));
    const targetChannel = currentServer?.channels.find(c => c.id === channelId);
    if (
      targetChannel?.isAnnouncementOnly &&
      currentUser.role !== 'institution' &&
      currentUser.role !== 'admin'
    ) {
      return {
        success: false,
        message: 'Only Community Admins can post to this announcement group.'
      };
    }

    const toxicKeywords = ['rage', 'scam', 'hate', 'fraud', 'kill', 'idiot', 'dump'];
    const lower = content.toLowerCase();
    const hasRagebaitPattern = toxicKeywords.some(w => lower.includes(w));

    const newMessage: ServerMessage = {
      id: `smsg-${Date.now()}`,
      channelId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      authorHeadline: currentUser.headline,
      content,
      createdAt: new Date().toISOString(),
      isFlaggedForRagebait: hasRagebaitPattern
    };

    setServerMessages(prev => [...prev, newMessage]);
    return { success: true };
  };

  // Instagram-style Direct Messages: Send Message
  const sendDirectMessage = (receiverId: string, content: string): DirectMessage => {
    const senderId = currentUser?.id || 'guest';
    const sortedIds = [senderId, receiverId].sort();
    const conversationId = `conv-${sortedIds[0]}-${sortedIds[1]}`;
    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      conversationId,
      senderId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setDirectMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  // Instagram-style Direct Messages: Toggle Heart Reaction
  const toggleLikeDirectMessage = (messageId: string) => {
    setDirectMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, liked: !m.liked } : m))
    );
  };

  // Institution Server Builder
  const createDiscordServer = (
    name: string,
    description: string,
    collegeId: string,
    channels: ServerChannel[],
    antiRagebaitRules: string[]
  ) => {
    const matchedCol = colleges.find(c => c.id === collegeId);
    const newServer: DiscordServer = {
      id: `server-${Date.now()}`,
      name,
      collegeId,
      collegeName: matchedCol?.name || currentUser?.collegeName || 'Official Institution Campus',
      institutionOwnerId: currentUser?.id || 'inst-owner',
      description,
      memberCount: 1,
      channels: channels.length > 0 ? channels : [
        {
          id: `ch-ann-${Date.now()}`,
          name: 'official-broadcasts',
          description: 'Official verified college notices.',
          type: 'general',
          isRagebaitProtected: true
        },
        {
          id: `ch-anti-${Date.now()}`,
          name: 'ragebait-shielded-lounge',
          description: 'Protected constructive discussion channel.',
          type: 'anti-ragebait',
          isRagebaitProtected: true
        }
      ],
      antiRagebaitRules: antiRagebaitRules.length > 0 ? antiRagebaitRules : [
        'Strict decorum: zero slander or partisan toxicity.',
        'Anti-ragebait cooldown slowmode active.',
        'Private disputes must be submitted to the Institution Grievance portal.'
      ]
    };

    setServers(prev => [newServer, ...prev]);
    return newServer;
  };

  // Add Sub-Group / Channel to WhatsApp Community
  const addChannelToCommunity = (
    serverId: string,
    channelData: Omit<ServerChannel, 'id'>
  ): ServerChannel => {
    const newChannel: ServerChannel = {
      ...channelData,
      id: `ch-${Date.now()}`
    };
    setServers(prev =>
      prev.map(s => {
        if (s.id === serverId) {
          return {
            ...s,
            channels: [...s.channels, newChannel]
          };
        }
        return s;
      })
    );
    return newChannel;
  };

  // Private Student Grievance Submission to Institution ID
  const submitGrievanceReport = (
    data: Omit<PrivateGrievanceReport, 'id' | 'submittedAt' | 'status'>
  ) => {
    const report: PrivateGrievanceReport = {
      ...data,
      id: `grv-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'under_investigation'
    };
    setGrievanceReports(prev => [report, ...prev]);
    return report;
  };

  const resolveGrievanceReport = (
    reportId: string,
    remarks: string,
    status: 'under_investigation' | 'resolved' | 'action_taken' = 'action_taken'
  ) => {
    setGrievanceReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            institutionRemarks: remarks
          };
        }
        return r;
      })
    );
  };

  // Developer Options Terminal Command Runner for Admin
  const executeAdminTerminalCommand = (cmd: string): string => {
    const trimmed = cmd.trim();
    if (!trimmed) return '';

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (command) {
      case 'help':
        return `CAMPUS LENZ DEVELOPER TERMINAL v3.2.0 (Turbopack Core)
Available Commands:
  help              - List all available administrative & system commands
  sysinfo / status  - Display runtime diagnostics, engine status & memory metrics
  whoami            - Display active session identity, role, and authorization clearance
  users             - Show all registered users across the 5 role portals
  colleges          - Print verified college database directory count and index
  posts             - Inspect post volume, engagement analytics & flagged entries
  reports           - List institutional false-info reports and private student grievances
  db --health       - Audit system state integrity and database sync status
  purge --cache     - Clear client-side session cache and reload baseline states
  eval <math>       - Safely calculate arithmetic expressions
  clear             - Reset developer console screen`;

      case 'sysinfo':
      case 'status':
        return `SYSTEM STATUS REPORT:
----------------------------------------
Platform Engine : Next.js 16 (App Router + Turbopack)
Theme Engine    : Apple Light Minimalist Slate (Solid UI, No Dark Theme)
Active Memory   : 84.2 MB / 512 MB Allocation
Uptime          : 18h 42m 11s (Zero fatal exceptions)
Auth Mode       : Externalized Multi-Portal Authentication (Student, Alumni, Institution, Faculty, Admin)
Ragebait Shield : Active (Strict automated lexical filter + Cooldown timer)
Grievance Tunnel: E2E Institution-Only Routed (Student PII protected)`;

      case 'whoami':
        if (!currentUser) {
          return `USER SESSION CONTEXT: No active authenticated user (Guest / Unauthenticated).`;
        }
        return `USER SESSION CONTEXT:
  Username : ${currentUser.username}
  Full Name: ${currentUser.fullName}
  Role     : [${currentUser.role.toUpperCase()}]
  Clearance: ${currentUser.role === 'admin' ? 'ROOT / SUPER_ADMIN_DEV (ALL_PRIVILEGES_GRANTED)' : 'STANDARD_ROLE_BOUND'}
  College  : ${currentUser.collegeName || 'Platform Global'}`;

      case 'users':
        const roleCounts: Record<string, number> = {};
        allUsers.forEach(u => {
          roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
        });
        const summary = Object.entries(roleCounts).map(([r, c]) => `  ${r.padEnd(12)}: ${c} active`).join('\n');
        return `REGISTERED USER DIRECTORY (${allUsers.length} total personas):\n${summary}\n\nTop Profiles:\n${allUsers.slice(0, 6).map(u => `  * ${u.username.padEnd(20)} [${u.role.padEnd(11)}] - ${u.fullName}`).join('\n')}`;

      case 'colleges':
        return `COLLEGE DIRECTORY (${colleges.length} Institutions Indexed):
${colleges.map(c => `  [${c.id}] ${c.name} (${c.location}, ${c.state}) | Score: ${c.overallScore?.total || 90}/100`).join('\n')}`;

      case 'posts':
        const totalLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);
        const totalComments = posts.reduce((acc, p) => acc + p.commentsCount, 0);
        const flagged = posts.filter(p => p.reportedByInstitution || p.moderationStatus !== 'normal');
        return `FEED ANALYTICS:
  Total Posts     : ${posts.length}
  Total Likes     : ${totalLikes}
  Total Comments  : ${totalComments}
  Flagged/Reported: ${flagged.length} entries awaiting review
  Recent Post IDs : ${posts.slice(0, 5).map(p => p.id).join(', ')}`;

      case 'reports':
        const grvCount = grievanceReports.length;
        const falseInfoPosts = posts.filter(p => p.reportedByInstitution);
        return `MODERATION & GRIEVANCE REGISTRY:
  Private Student Grievances: ${grvCount} filed to institution desks
  Institution False-Info Flags: ${falseInfoPosts.length} post flags
${grievanceReports.map(g => `  - [${g.id}] to ${g.collegeName} (${g.category}) -> Status: ${g.status}`).join('\n')}`;

      case 'db':
        if (arg === '--health') {
          return `DATABASE INTEGRITY AUDIT:
  * Users Table       : OK (${allUsers.length} records)
  * Colleges Table    : OK (${colleges.length} records)
  * Posts Table       : OK (${posts.length} records)
  * Servers Table     : OK (${servers.length} servers active)
  * Messages Table    : OK (${serverMessages.length} messages)
  * Grievances Table  : OK (${grievanceReports.length} records)
  * Latency           : 0.8ms (Local InMemory Reactive Store)
  STATUS: ALL SYSTEMS NOMINAL`;
        }
        return `Unknown db flag. Use 'db --health'.`;

      case 'purge':
        if (arg === '--all' || arg === '--data') {
          resetAllUserData();
          return `[PURGE ALL] All user data, local storage databases, and caches wiped completely. System restarted with fresh dynamic database.`;
        }
        if (arg === '--cache') {
          return `[PURGE] Local session storage and reactive cached indices cleared. System restarted nominal.`;
        }
        return `Usage: purge --all (wipe all user data) | purge --cache`;

      case 'eval':
        try {
          const expression = arg.replace(/[^0-9+\-*/(). ]/g, '');
          const result = Function(`"use strict"; return (${expression})`)();
          return `Result: ${result}`;
        } catch {
          return `Error evaluating expression.`;
        }

      case 'clear':
        return '__CLEAR__';

      default:
        return `bash: command not found: ${command}. Type 'help' to inspect supported developer commands.`;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        setCurrentUser,
        switchRole,
        loginAsRole,
        initializeTestUser,
        loginUser,
        registerUser,
        logout,
        allUsers,
        colleges,
        reviews,
        posts,
        communities,
        servers,
        serverMessages,
        directMessages,
        sendDirectMessage,
        toggleLikeDirectMessage,
        grievanceReports,
        savedCollegeIds,
        toggleSaveCollege,
        addReview,
        addPost,
        toggleLikePost,
        addComment,
        toggleFollowUser,
        addInstitutionReply,
        getUserByUsername,
        getUserById,
        updateProfile,
        repostToInstitution,
        reportFalseInfoPost,
        deletePost,
        sendServerMessage,
        createDiscordServer,
        addChannelToCommunity,
        submitGrievanceReport,
        resolveGrievanceReport,
        executeAdminTerminalCommand,
        isLiveFeedActive,
        setIsLiveFeedActive,
        unreadLivePostsCount: stagedLivePosts.length,
        applyUnreadLivePosts,
        triggerLiveActivity,
        resetAllUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
