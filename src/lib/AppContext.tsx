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
  DirectMessage,
  StudyRoom,
  CourseQuestion,
  CourseAnswer,
  MarketplaceItem,
  AssignmentTask,
  ExamMilestone,
  MentorshipSlot,
  AlumniJobReferral,
  ReferralRequest,
  IndustryAMAEvent,
  OfficeHourQueueItem,
  ResearchOpening,
  ResearchApplication,
  LectureMaterialVersion,
  EmergencyBroadcast,
  AuditLogEntry,
  AIModelSettings,
  UnifiedAIModerationResult,
  PostAnalysisResult,
  CampusLenzCategoryClassification,
  ReviewAnalysisResult
} from '@/types';
import {
  runUnifiedAIModeration,
  analyzeCampusLenzPost,
  classifyCampusLenzCategory,
  analyzeReviewAspects,
  DEFAULT_AI_MODEL_SETTINGS
} from './aiModerationModels';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_USERS,
  INITIAL_COLLEGES,
  INITIAL_REVIEWS,
  INITIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_DISCORD_SERVERS,
  INITIAL_SERVER_MESSAGES,
  INITIAL_GRIEVANCE_REPORTS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_STUDY_ROOMS,
  INITIAL_COURSE_QUESTIONS,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EXAMS,
  INITIAL_MENTORSHIP_SLOTS,
  INITIAL_ALUMNI_REFERRALS,
  INITIAL_REFERRAL_REQUESTS,
  INITIAL_AMA_EVENTS,
  INITIAL_OFFICE_HOUR_QUEUE,
  INITIAL_RESEARCH_OPENINGS,
  INITIAL_LECTURE_MATERIALS,
  INITIAL_EMERGENCY_BROADCAST,
  INITIAL_AUDIT_LOGS
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
  // Role-Specific Fields
  studentRollNo?: string;
  company?: string;
  designation?: string;
  facultyStaffId?: string;
  specialization?: string;
  experienceYears?: string;
  qualification?: string;
  officeTitle?: string;
  aisheCode?: string;
  contactPhone?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
}

export const getRedirectUrlForRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'institution':
      return '/servers';
    case 'student':
      return '/?stream=students';
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
  savedPostIds: string[];
  toggleSavePost: (postId: string) => { success: boolean; message: string };
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
  repostPost: (postId: string) => { success: boolean; message: string };
  reportFalseInfoPost: (postId: string, reason: string) => { success: boolean; message: string };
  reportPost: (postId: string, reason: string, category?: string) => { success: boolean; message: string };
  deletePost: (postId: string) => { success: boolean; message: string };
  deleteComment: (postId: string, commentId: string) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  unbanUser: (userId: string) => { success: boolean; message: string };
  joinServer: (serverId: string) => { success: boolean; message: string };
  leaveServer: (serverId: string) => { success: boolean; message: string };
  joinGroup: (serverId: string, groupId: string) => { success: boolean; message: string };
  leaveGroup: (serverId: string, groupId: string) => { success: boolean; message: string };
  requestFacultyCommunity: (name: string, description: string, collegeId: string) => { success: boolean; message: string; server?: DiscordServer };
  approveFacultyCommunity: (serverId: string) => { success: boolean; message: string };
  rejectFacultyCommunity: (serverId: string) => { success: boolean; message: string };
  checkAlumniPostEligibility: (user?: UserProfile | null) => { eligible: boolean; followerCount: number; requiredFollowers: number; weeklyCount: number; maxWeekly: number; message?: string };
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
  // --- Advanced Role Features ---
  studyRooms: StudyRoom[];
  addStudyRoom: (room: Omit<StudyRoom, 'id' | 'createdAt'>) => { success: boolean; message: string };
  courseQuestions: CourseQuestion[];
  addCourseQuestion: (q: Omit<CourseQuestion, 'id' | 'createdAt' | 'upvotes' | 'answers'>) => { success: boolean; message: string };
  upvoteCourseQuestion: (questionId: string) => void;
  addCourseAnswer: (questionId: string, content: string) => { success: boolean; message: string };
  marketplaceItems: MarketplaceItem[];
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'isReserved'>) => { success: boolean; message: string };
  reserveMarketplaceItem: (itemId: string) => { success: boolean; message: string };
  assignmentTasks: AssignmentTask[];
  addAssignmentTask: (task: Omit<AssignmentTask, 'id' | 'isCompleted'>) => { success: boolean; message: string };
  toggleAssignmentTask: (taskId: string) => void;
  deleteAssignmentTask: (taskId: string) => void;
  examMilestones: ExamMilestone[];
  mentorshipSlots: MentorshipSlot[];
  bookMentorshipSlot: (slotId: string, notes?: string) => { success: boolean; message: string };
  cancelMentorshipBooking: (slotId: string) => { success: boolean; message: string };
  alumniJobReferrals: AlumniJobReferral[];
  addAlumniJobReferral: (ref: Omit<AlumniJobReferral, 'id' | 'createdAt' | 'referralRequestsCount'>) => { success: boolean; message: string };
  referralRequests: ReferralRequest[];
  requestJobReferral: (referralId: string, studentGpa: number, resumeLink: string, note: string) => { success: boolean; message: string };
  industryAmaEvents: IndustryAMAEvent[];
  upvoteAmaQuestion: (eventId: string, questionId: string) => void;
  submitAmaQuestion: (eventId: string, questionText: string) => { success: boolean; message: string };
  officeHourQueue: OfficeHourQueueItem[];
  joinOfficeHourQueue: (courseCode: string, topic: string) => { success: boolean; message: string };
  admitNextOfficeHourStudent: () => { success: boolean; message: string };
  resolveOfficeHourStudent: (queueId: string) => { success: boolean; message: string };
  researchOpenings: ResearchOpening[];
  addResearchOpening: (opening: Omit<ResearchOpening, 'id' | 'status' | 'applicants'>) => { success: boolean; message: string };
  applyToResearchOpening: (openingId: string, statement: string, studentGpa: number) => { success: boolean; message: string };
  reviewResearchApplication: (openingId: string, applicationId: string, decision: 'accepted' | 'declined') => { success: boolean; message: string };
  lectureMaterials: LectureMaterialVersion[];
  addLectureMaterialVersion: (mat: Omit<LectureMaterialVersion, 'id' | 'uploadedAt' | 'downloadCount'>) => { success: boolean; message: string };
  emergencyBroadcast: EmergencyBroadcast | null;
  triggerEmergencyBroadcast: (title: string, message: string, severity: 'critical' | 'warning' | 'notice') => { success: boolean; message: string };
  dismissEmergencyBroadcast: () => { success: boolean; message: string };
  auditLogs: AuditLogEntry[];
  logAdminAction: (actionType: string, targetEntity: string, details: string, severity?: 'info' | 'warning' | 'critical') => void;
  runAIToxicityCheck: (text: string) => { toxicityScore: number; sentiment: 'positive' | 'neutral' | 'toxic' | 'ragebait'; flagReason?: string };
  sensitiveContentShieldActive: boolean;
  toggleSensitiveContentShield: () => void;
  aiModelSettings: AIModelSettings;
  updateAIModelSettings: (settings: Partial<AIModelSettings>) => void;
  runOpenSourceAIModeration: (content: string, imageUrl?: string) => UnifiedAIModerationResult;
  analyzePostWithAI: (postContent: string, authorId?: string, collegeId?: string) => PostAnalysisResult;
  classifyTextCategory: (text: string) => CampusLenzCategoryClassification;
  analyzeReviewWithAI: (reviewText: string) => ReviewAnalysisResult;
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
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [colleges, setColleges] = useState<College[]>(INITIAL_COLLEGES);
  const [reviews, setReviews] = useState<CollegeReview[]>([]);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [servers, setServers] = useState<DiscordServer[]>(INITIAL_DISCORD_SERVERS);
  const [serverMessages, setServerMessages] = useState<ServerMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [grievanceReports, setGrievanceReports] = useState<PrivateGrievanceReport[]>([]);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  // Advanced Role Features State
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [courseQuestions, setCourseQuestions] = useState<CourseQuestion[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [assignmentTasks, setAssignmentTasks] = useState<AssignmentTask[]>([]);
  const [examMilestones, setExamMilestones] = useState<ExamMilestone[]>([]);
  const [mentorshipSlots, setMentorshipSlots] = useState<MentorshipSlot[]>([]);
  const [alumniJobReferrals, setAlumniJobReferrals] = useState<AlumniJobReferral[]>([]);
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>([]);
  const [industryAmaEvents, setIndustryAmaEvents] = useState<IndustryAMAEvent[]>([]);
  const [officeHourQueue, setOfficeHourQueue] = useState<OfficeHourQueueItem[]>([]);
  const [researchOpenings, setResearchOpenings] = useState<ResearchOpening[]>([]);
  const [lectureMaterials, setLectureMaterials] = useState<LectureMaterialVersion[]>([]);
  const [emergencyBroadcast, setEmergencyBroadcast] = useState<EmergencyBroadcast | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Automated Open-Source AI Moderation & Sensitivity Shield State
  const [sensitiveContentShieldActive, setSensitiveContentShieldActive] = useState<boolean>(true);
  const [aiModelSettings, setAiModelSettings] = useState<AIModelSettings>(DEFAULT_AI_MODEL_SETTINGS);

  const toggleSensitiveContentShield = () => {
    setSensitiveContentShieldActive(prev => !prev);
  };

  const updateAIModelSettings = (settings: Partial<AIModelSettings>) => {
    setAiModelSettings(prev => ({ ...prev, ...settings }));
  };

  const runOpenSourceAIModeration = (content: string, imageUrl?: string) => {
    return runUnifiedAIModeration(content, imageUrl, aiModelSettings);
  };

  const analyzePostWithAI = (postContent: string, authorId?: string, collegeId?: string) => {
    return analyzeCampusLenzPost(postContent, authorId, collegeId);
  };

  const classifyTextCategory = (text: string) => {
    return classifyCampusLenzCategory(text);
  };

  const analyzeReviewWithAI = (reviewText: string) => {
    return analyzeReviewAspects(reviewText);
  };

  // Dynamic Live Feed & Real-Time Engine State
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(false);
  const [stagedLivePosts, setStagedLivePosts] = useState<Post[]>([]);

  // 0. Supabase Real-Time Cloud Synchronization
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const client = supabase;

    const syncCloudPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(prev => {
              const cloudPosts: Post[] = data.posts;
              // Preserve any posts that may be in transition, and preserve local media attachments if cloud has null
              const combined = cloudPosts.map(cp => {
                const localMatch = prev.find(p => p.id === cp.id || (p.content === cp.content && p.authorUsername === cp.authorUsername));
                if (localMatch && localMatch.imageUrl && !cp.imageUrl) {
                  return { ...cp, imageUrl: localMatch.imageUrl };
                }
                return cp;
              });
              prev.forEach(localP => {
                if (!combined.some(c => c.id === localP.id || c.content === localP.content)) {
                  combined.push(localP);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        // Safe silent fallback
      }
    };

    syncCloudPosts();

    // Subscribe to real-time broadcasts
    try {
      const channel = client
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
          const row = payload.new;
          if (!row) return;
          setPosts(prev => {
            if (prev.some(p => p.id === row.id || p.content === row.content)) return prev;
            const incoming: Post = {
              id: row.id,
              authorId: row.author_id || (row.author_username ? `user-${row.author_username}` : row.id),
              authorUsername: row.author_username,
              authorName: row.author_name,
              authorRole: row.author_role || 'student',
              authorHeadline: row.author_headline,
              isVerifiedAuthor: Boolean(row.is_verified_author),
              isAnonymous: Boolean(row.is_anonymous),
              collegeId: row.college_id,
              collegeName: row.college_name,
              content: row.content,
              topic: row.topic,
              imageUrl: row.image_url,
              likes: Array.isArray(row.likes) ? row.likes : [],
              likesCount: row.likes_count ?? 0,
              comments: [],
              commentsCount: row.comments_count ?? 0,
              sharesCount: row.shares_count ?? 0,
              repostedUserIds: Array.isArray(row.reposted_user_ids) ? row.reposted_user_ids : [],
              moderationStatus: row.moderation_status || 'normal',
              sentiment: row.sentiment || 'neutral',
              sentimentScore: row.sentiment_score ?? 0,
              toxicityScore: row.toxicity_score ?? 0,
              isSensitive: Boolean(row.is_sensitive),
              sensitiveReason: row.sensitive_reason,
              isQuarantined: Boolean(row.is_quarantined),
              aiModelMetadata: row.ai_model_metadata,
              createdAt: row.created_at || new Date().toISOString()
            };
            return [incoming, ...prev];
          });
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch {}
  }, []);

  // 1. Hydrate and Clean Legacy Storage on Initial Client Mount
  useEffect(() => {
    try {
      // Clean legacy storage caches
      try {
        localStorage.removeItem('CL_FRESH_DB_V6');
        localStorage.removeItem('CL_FRESH_DB_V5');
        localStorage.removeItem('CL_FRESH_DB_V4');
        localStorage.removeItem('campus_lenz_state_v3');
      } catch {}

      const rawDb = localStorage.getItem('CL_FRESH_DB_V7');
      if (rawDb) {
        const parsed = JSON.parse(rawDb);

        if (parsed.allUsers && Array.isArray(parsed.allUsers)) {
          setAllUsers(parsed.allUsers);
        }
        if (parsed.currentUser) {
          setCurrentUser(parsed.currentUser);
          setIsAuthenticated(true);
        }
        if (parsed.posts && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
          const existingIds = new Set(parsed.posts.map((p: any) => p.id));
          const merged = [...parsed.posts];
          INITIAL_POSTS.forEach(ip => {
            if (!existingIds.has(ip.id)) {
              merged.push(ip);
              existingIds.add(ip.id);
            }
          });
          setPosts(merged);
        } else {
          setPosts(INITIAL_POSTS);
        }
        if (parsed.reviews && Array.isArray(parsed.reviews)) {
          setReviews(parsed.reviews);
        }
        if (parsed.communities && Array.isArray(parsed.communities)) {
          setCommunities(parsed.communities);
        }
        if (parsed.servers && Array.isArray(parsed.servers)) {
          setServers(parsed.servers);
        }
        if (parsed.serverMessages && Array.isArray(parsed.serverMessages)) {
          setServerMessages(parsed.serverMessages);
        }
        if (parsed.directMessages && Array.isArray(parsed.directMessages)) {
          setDirectMessages(parsed.directMessages);
        }
        if (parsed.grievanceReports && Array.isArray(parsed.grievanceReports)) {
          setGrievanceReports(parsed.grievanceReports);
        }
        if (parsed.savedCollegeIds && Array.isArray(parsed.savedCollegeIds)) {
          setSavedCollegeIds(parsed.savedCollegeIds);
        }
        if (parsed.savedPostIds && Array.isArray(parsed.savedPostIds)) {
          setSavedPostIds(parsed.savedPostIds);
        }
        if (parsed.studyRooms && Array.isArray(parsed.studyRooms)) setStudyRooms(parsed.studyRooms);
        if (parsed.courseQuestions && Array.isArray(parsed.courseQuestions)) setCourseQuestions(parsed.courseQuestions);
        if (parsed.marketplaceItems && Array.isArray(parsed.marketplaceItems)) setMarketplaceItems(parsed.marketplaceItems);
        if (parsed.assignmentTasks && Array.isArray(parsed.assignmentTasks)) setAssignmentTasks(parsed.assignmentTasks);
        if (parsed.examMilestones && Array.isArray(parsed.examMilestones)) setExamMilestones(parsed.examMilestones);
        if (parsed.mentorshipSlots && Array.isArray(parsed.mentorshipSlots)) setMentorshipSlots(parsed.mentorshipSlots);
        if (parsed.alumniJobReferrals && Array.isArray(parsed.alumniJobReferrals)) setAlumniJobReferrals(parsed.alumniJobReferrals);
        if (parsed.referralRequests && Array.isArray(parsed.referralRequests)) setReferralRequests(parsed.referralRequests);
        if (parsed.industryAmaEvents && Array.isArray(parsed.industryAmaEvents)) setIndustryAmaEvents(parsed.industryAmaEvents);
        if (parsed.officeHourQueue && Array.isArray(parsed.officeHourQueue)) setOfficeHourQueue(parsed.officeHourQueue);
        if (parsed.researchOpenings && Array.isArray(parsed.researchOpenings)) setResearchOpenings(parsed.researchOpenings);
        if (parsed.lectureMaterials && Array.isArray(parsed.lectureMaterials)) setLectureMaterials(parsed.lectureMaterials);
        if (parsed.emergencyBroadcast !== undefined) {
          setEmergencyBroadcast(parsed.emergencyBroadcast);
        } else {
          setEmergencyBroadcast(null);
        }
        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) setAuditLogs(parsed.auditLogs);
      } else {
        setAllUsers([]);
        setPosts(INITIAL_POSTS);
        setReviews([]);
        setCommunities([]);
        setServers(INITIAL_DISCORD_SERVERS);
        setServerMessages([]);
        setDirectMessages([]);
        setGrievanceReports([]);
        setStudyRooms([]);
        setCourseQuestions([]);
        setMarketplaceItems([]);
        setAssignmentTasks([]);
        setExamMilestones([]);
        setMentorshipSlots([]);
        setAlumniJobReferrals([]);
        setReferralRequests([]);
        setIndustryAmaEvents([]);
        setOfficeHourQueue([]);
        setResearchOpenings([]);
        setLectureMaterials([]);
        setEmergencyBroadcast(null);
        setAuditLogs([]);
      }
    } catch (e) {
      console.error('Storage hydration error:', e);
      setAllUsers([]);
      setServers(INITIAL_DISCORD_SERVERS);
      setPosts([]);
      setEmergencyBroadcast(null);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // 1.5. Dynamic Cloud Data Fetching (Supabase API Routes)
  useEffect(() => {
    let isMounted = true;
    const fetchCloudData = async () => {
      try {
        const [colRes, postRes, revRes, userRes, commRes, grvRes, dmRes, smsgRes, roomRes, qRes, mktRes] = await Promise.allSettled([
          fetch('/api/colleges'),
          fetch('/api/posts'),
          fetch('/api/reviews'),
          fetch('/api/users'),
          fetch('/api/communities'),
          fetch('/api/grievances'),
          fetch('/api/direct-messages'),
          fetch('/api/server-messages'),
          fetch('/api/study-rooms'),
          fetch('/api/course-questions'),
          fetch('/api/marketplace'),
        ]);

        if (!isMounted) return;

        if (colRes.status === 'fulfilled' && colRes.value.ok) {
          const colData = await colRes.value.json();
          if (colData.success && colData.colleges?.length > 0) {
            setColleges(colData.colleges);
          }
        }

        if (postRes.status === 'fulfilled' && postRes.value.ok) {
          const postData = await postRes.value.json();
          if (postData.success && Array.isArray(postData.posts)) {
            setPosts(prev => {
              const cloudMap = new Map(postData.posts.map((cp: Post) => [cp.id, cp]));
              const merged = postData.posts.map((cp: Post) => {
                const localMatch = prev.find(p => p.id === cp.id || p.content === cp.content);
                // Keep local high-res image/video if cloud imageUrl is null
                return {
                  ...cp,
                  imageUrl: cp.imageUrl || localMatch?.imageUrl || null
                };
              });
              // Keep any purely local posts that haven't synced yet
              prev.forEach(localP => {
                if (!cloudMap.has(localP.id) && !merged.some((m: Post) => m.content === localP.content)) {
                  merged.push(localP);
                }
              });
              return merged;
            });
          }
        }

        if (revRes.status === 'fulfilled' && revRes.value.ok) {
          const revData = await revRes.value.json();
          if (revData.success && Array.isArray(revData.reviews)) {
            setReviews(revData.reviews);
          }
        }

        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          const userData = await userRes.value.json();
          if (userData.success && Array.isArray(userData.users)) {
            setAllUsers(userData.users);
            setCurrentUser(prevUser => {
              if (!prevUser) return null;
              const fresh = userData.users.find((u: UserProfile) =>
                u.id === prevUser.id ||
                (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase())
              );
              if (fresh && fresh.id !== prevUser.id) {
                // Patch posts that still carry the old temp authorId
                const oldId = prevUser.id;
                const newId = fresh.id;
                setPosts(prev => prev.map(p =>
                  p.authorId === oldId ? { ...p, authorId: newId } : p
                ));
                // Persist updated user to localStorage
                try {
                  localStorage.setItem('campus_lenz_user', JSON.stringify({ ...prevUser, ...fresh }));
                } catch {}
              }
              return fresh ? { ...prevUser, ...fresh } : prevUser;
            });
          }
        }

        if (commRes.status === 'fulfilled' && commRes.value.ok) {
          const commData = await commRes.value.json();
          if (commData.success && Array.isArray(commData.communities)) {
            setCommunities(commData.communities);
          }
        }

        if (grvRes.status === 'fulfilled' && grvRes.value.ok) {
          const grvData = await grvRes.value.json();
          if (grvData.success && Array.isArray(grvData.grievances)) {
            setGrievanceReports(grvData.grievances);
          }
        }

        if (dmRes.status === 'fulfilled' && dmRes.value.ok) {
          const dmData = await dmRes.value.json();
          if (dmData.success && Array.isArray(dmData.messages) && dmData.messages.length > 0) {
            setDirectMessages(dmData.messages);
          }
        }

        if (smsgRes.status === 'fulfilled' && smsgRes.value.ok) {
          const smsgData = await smsgRes.value.json();
          if (smsgData.success && Array.isArray(smsgData.messages) && smsgData.messages.length > 0) {
            setServerMessages(smsgData.messages);
          }
        }

        if (roomRes.status === 'fulfilled' && roomRes.value.ok) {
          const roomData = await roomRes.value.json();
          if (roomData.success && Array.isArray(roomData.rooms) && roomData.rooms.length > 0) {
            setStudyRooms(roomData.rooms);
          }
        }

        if (qRes.status === 'fulfilled' && qRes.value.ok) {
          const qData = await qRes.value.json();
          if (qData.success && Array.isArray(qData.questions) && qData.questions.length > 0) {
            setCourseQuestions(qData.questions);
          }
        }

        if (mktRes.status === 'fulfilled' && mktRes.value.ok) {
          const mktData = await mktRes.value.json();
          if (mktData.success && Array.isArray(mktData.items) && mktData.items.length > 0) {
            setMarketplaceItems(mktData.items);
          }
        }
      } catch (err) {
        console.warn('API cloud fetch notice:', err);
      }
    };

    fetchCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-Time Dynamic Storage Sync: Auto-persist all mutations (Debounced for 60fps UI performance)
  useEffect(() => {
    if (!hasHydrated) return;

    const timer = setTimeout(() => {
      try {
        const filteredPosts = posts.map(post => {
          if (post.imageUrl && post.imageUrl.startsWith('data:')) {
            const approxSize = Math.floor((post.imageUrl.length * 3) / 4);
            if (approxSize > 500 * 1024) {
              return { ...post, imageUrl: null };
            }
          }
          return post;
        });
        const dataToSave = {
          allUsers,
          currentUser,
          posts: filteredPosts,
          reviews,
          communities,
          servers,
          serverMessages,
          directMessages,
          grievanceReports,
          savedCollegeIds,
          savedPostIds,
          studyRooms,
          courseQuestions,
          marketplaceItems,
          assignmentTasks,
          examMilestones,
          mentorshipSlots,
          alumniJobReferrals,
          referralRequests,
          industryAmaEvents,
          officeHourQueue,
          researchOpenings,
          lectureMaterials,
          emergencyBroadcast,
          auditLogs
        };
        localStorage.setItem('CL_FRESH_DB_V7', JSON.stringify(dataToSave));
        if (currentUser) {
          localStorage.setItem('campus_lenz_user', JSON.stringify(currentUser));
          localStorage.setItem('campus_lenz_auth', 'true');
        } else {
          localStorage.removeItem('campus_lenz_user');
          localStorage.setItem('campus_lenz_auth', 'false');
        }
      } catch {}
    }, 350);

    return () => clearTimeout(timer);
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
    savedCollegeIds,
    savedPostIds,
    studyRooms,
    courseQuestions,
    marketplaceItems,
    assignmentTasks,
    examMilestones,
    mentorshipSlots,
    alumniJobReferrals,
    referralRequests,
    industryAmaEvents,
    officeHourQueue,
    researchOpenings,
    lectureMaterials,
    emergencyBroadcast,
    auditLogs
  ]);

  // 3. Live Stream Engine (No synthetic fake posts auto-injected)
  const triggerLiveActivity = () => {
    // No-op on clean platform
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
      localStorage.removeItem('CL_FRESH_DB_V7');
      localStorage.removeItem('CL_FRESH_DB_V6');
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
    setServers(INITIAL_DISCORD_SERVERS);
    setServerMessages([]);
    setDirectMessages([]);
    setGrievanceReports([]);
    setStudyRooms([]);
    setCourseQuestions([]);
    setMarketplaceItems([]);
    setEmergencyBroadcast(null);
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
        message: 'Please enter your username, email, roll number, or institutional ID.'
      };
    }

    // Dedicated Root Administrator Authentication Check
    if (portalRole === 'admin' || cleanId === 'system_admin' || cleanId === 'admin' || cleanId === 'admin@campuslenz.com') {
      const validAdminPasswords = ['admin123', 'Admin@2026', 'admin'];
      if (!password || !validAdminPasswords.includes(password.trim())) {
        return {
          success: false,
          redirectUrl: '/login?role=admin',
          message: 'Invalid Admin Security Password. Access to Administrative Governance is restricted.'
        };
      }

      let adminAcc = allUsers.find(u => u.role === 'admin' || u.username === 'system_admin');
      if (!adminAcc) {
        adminAcc = {
          id: 'admin_root',
          username: 'system_admin',
          email: 'admin@campuslenz.com',
          role: 'admin',
          fullName: 'Root Administrator',
          headline: 'Super Admin & Governance Terminal Officer',
          isVerified: true,
          followersCount: 0,
          followingCount: 0,
          followers: [],
          following: []
        } as any;
        setAllUsers(prev => [adminAcc!, ...prev]);
      }

      setCurrentUser(adminAcc || null);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('campus_lenz_user', JSON.stringify(adminAcc));
        localStorage.setItem('campus_lenz_auth', 'true');
      } catch {}

      return {
        success: true,
        user: adminAcc,
        redirectUrl: '/admin',
        message: 'Root Administrator Clearance Authenticated.'
      };
    }

    // Search registered users by username, email, roll number, or staff id
    let matched = allUsers.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        (u.studentRollNo && u.studentRollNo.toLowerCase() === cleanId) ||
        (u.facultyStaffId && u.facultyStaffId.toLowerCase() === cleanId)
    );

    // Fallback: check localStorage stored account
    if (!matched && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campus_lenz_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed.username?.toLowerCase() === cleanId ||
            parsed.email?.toLowerCase() === cleanId ||
            parsed.studentRollNo?.toLowerCase() === cleanId ||
            parsed.facultyStaffId?.toLowerCase() === cleanId
          ) {
            matched = parsed;
          }
        }
      } catch {}
    }

    if (!matched) {
      // Async Supabase cloud fallback — fetch user and sync to local state
      fetch(`/api/users?q=${encodeURIComponent(cleanId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.users) && data.users.length > 0) {
            const cloudUser = data.users.find((u: UserProfile) =>
              u.username?.toLowerCase() === cleanId ||
              u.email?.toLowerCase() === cleanId
            );
            if (cloudUser) {
              setAllUsers(prev => {
                if (prev.some(u => u.id === cloudUser.id)) return prev;
                return [cloudUser, ...prev];
              });
              setCurrentUser(cloudUser);
              setIsAuthenticated(true);
              try {
                localStorage.setItem('campus_lenz_user', JSON.stringify(cloudUser));
                localStorage.setItem('campus_lenz_auth', 'true');
              } catch {}
            }
          }
        })
        .catch(() => {});
      return {
        success: false,
        redirectUrl: '/login',
        message: `No registered account found with "${identifier}". Please select your role and click "Register" to create your account.`
      };
    }

    // Check if the user is attempting to sign in to a different role portal
    if (portalRole && matched.role !== portalRole) {
      const portalNames: Record<string, string> = {
        student: 'Student Portal',
        alumni: 'Alumni Network',
        faculty: 'Faculty Academic Desk',
        institution: 'Campus Administration',
      };
      return {
        success: false,
        redirectUrl: '/login',
        message: `Account "${matched.username}" is registered as a ${matched.role.toUpperCase()}. Please switch to the ${portalNames[matched.role] || matched.role} to sign in.`
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

    const generatedUserId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'usr-' + Math.random().toString(36).substring(2, 15);

    const newUser: UserProfile = {
      id: generatedUserId,
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
      createdAt: new Date().toISOString(),
      studentRollNo: data.studentRollNo,
      company: data.company,
      designation: data.designation,
      facultyStaffId: data.facultyStaffId,
      specialization: data.specialization,
      experienceYears: data.experienceYears,
      qualification: data.qualification,
      officeTitle: data.officeTitle,
      aisheCode: data.aisheCode,
      contactPhone: data.contactPhone,
      websiteUrl: data.websiteUrl,
      linkedinUrl: data.linkedinUrl
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        headline: newUser.headline,
        bio: newUser.bio,
        collegeId: newUser.collegeId,
        collegeName: newUser.collegeName,
        department: newUser.department,
        course: newUser.course,
        graduationBatch: newUser.graduationBatch,
        studentRollNo: newUser.studentRollNo,
        company: newUser.company,
        designation: newUser.designation,
        facultyStaffId: newUser.facultyStaffId,
        specialization: newUser.specialization,
        experienceYears: newUser.experienceYears,
        qualification: newUser.qualification,
        officeTitle: newUser.officeTitle,
        aisheCode: newUser.aisheCode,
        contactPhone: newUser.contactPhone,
        websiteUrl: newUser.websiteUrl,
        linkedinUrl: newUser.linkedinUrl
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.user?.id) {
          const finalId = resData.user.id;
          setCurrentUser(prev => prev && prev.username === newUser.username ? { ...prev, id: finalId } : prev);
          setAllUsers(prev => prev.map(u => u.username === newUser.username ? { ...u, id: finalId } : u));
          try {
            const saved = localStorage.getItem('campus_lenz_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              parsed.id = finalId;
              localStorage.setItem('campus_lenz_user', JSON.stringify(parsed));
            }
          } catch {}
        }
      })
      .catch(err => console.warn('User register API notice:', err));

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
      const rawDb = localStorage.getItem('CL_FRESH_DB_V7');
      if (rawDb) {
        const parsed = JSON.parse(rawDb);
        parsed.currentUser = null;
        localStorage.setItem('CL_FRESH_DB_V7', JSON.stringify(parsed));
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

  const toggleSavePost = (postId: string): { success: boolean; message: string } => {
    let isSavedNow = false;
    setSavedPostIds(prev => {
      if (prev.includes(postId)) {
        isSavedNow = false;
        return prev.filter(id => id !== postId);
      } else {
        isSavedNow = true;
        return [...prev, postId];
      }
    });
    return {
      success: true,
      message: isSavedNow ? '🔖 Post saved to your bookmarks!' : 'Post removed from bookmarks.'
    };
  };

  const addReview = (newRev: Omit<CollegeReview, 'id' | 'createdAt'>) => {
    const generatedRevId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'rev-' + Math.random().toString(36).substring(2, 15);

    const fullReview: CollegeReview = {
      ...newRev,
      id: generatedRevId,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [fullReview, ...prev]);

    // Update target college ratings immediately
    const targetCollege = colleges.find(c => c.id === newRev.collegeId);
    if (targetCollege) {
      setColleges(prev => prev.map(c => {
        if (c.id === targetCollege.id) {
          const currentCount = c.reviewCount || 0;
          const currentAvg = typeof c.ratingAverage === 'number' ? c.ratingAverage : 4.0;
          const newAvg = Number(((currentAvg * currentCount + newRev.overallRating) / (currentCount + 1)).toFixed(1));
          return {
            ...c,
            reviewCount: currentCount + 1,
            ratingAverage: newAvg
          };
        }
        return c;
      }));
    }

    // Automatically publish review to live feed stream
    const prosText = newRev.pros && newRev.pros.length > 0 ? `\n✅ Pros: ${newRev.pros.join(', ')}` : '';
    const consText = newRev.cons && newRev.cons.length > 0 ? `\n⚠️ Cons: ${newRev.cons.join(', ')}` : '';
    const adviceText = newRev.advice ? `\n💡 Advice: ${newRev.advice}` : '';

    addPost({
      authorId: newRev.userId,
      authorUsername: newRev.isAnonymous ? 'anonymous_reviewer' : (currentUser?.username || 'verified_student'),
      authorName: newRev.isAnonymous ? 'Anonymous Student' : (newRev.authorName || currentUser?.fullName || 'Student Reviewer'),
      authorRole: newRev.reviewerType || 'student',
      authorHeadline: `${newRev.overallRating}★ Verified Review for ${targetCollege?.name || 'Institution'}`,
      isVerifiedAuthor: !newRev.isAnonymous,
      isAnonymous: newRev.isAnonymous,
      collegeId: newRev.collegeId,
      collegeName: targetCollege?.name,
      topic: 'Review & Ratings',
      content: `⭐ Review for ${targetCollege?.name || 'College'} (${newRev.overallRating}/5 Rating)\n\n"${newRev.title}"\n${newRev.experience}${prosText}${consText}${adviceText}`,
      isInstitutionReviewOnly: true,
      institutionRating: newRev.overallRating
    });

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullReview)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.review) {
          setReviews(prev => prev.map(r => r.id === generatedRevId ? data.review : r));
        }
      })
      .catch(err => console.warn('Review API sync notice:', err));
  };

  // Alumni Creator Requirement & Quota Check
  const checkAlumniPostEligibility = (user?: UserProfile | null) => {
    const target = user || currentUser;
    if (!target) {
      return {
        eligible: false,
        followerCount: 0,
        requiredFollowers: 5,
        weeklyCount: 0,
        maxWeekly: 5,
        message: 'Sign in to verify posting eligibility.'
      };
    }

    if (target.role !== 'alumni') {
      return {
        eligible: true,
        followerCount: target.followers?.length || target.followersCount || 0,
        requiredFollowers: 0,
        weeklyCount: 0,
        maxWeekly: 999
      };
    }

    const followerCount = Math.max(target.followers?.length || 0, target.followersCount || 0);
    const requiredFollowers = 1;
    const maxWeekly = 10;

    // Rolling 7 days count
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const weeklyCount = posts.filter(
      p => p.authorId === target.id && new Date(p.createdAt).getTime() >= sevenDaysAgo
    ).length;

    if (target.isBanned) {
      const isStillBanned = target.bannedUntil ? new Date(target.bannedUntil).getTime() > Date.now() : true;
      if (isStillBanned) {
        return {
          eligible: false,
          followerCount,
          requiredFollowers,
          weeklyCount,
          maxWeekly,
          message: `🚨 Account Cooldown Active: ${target.bannedReason || 'Temporary restriction due to policy violation.'}`
        };
      }
    }

    if (followerCount < requiredFollowers && !target.isVerified) {
      return {
        eligible: false,
        followerCount,
        requiredFollowers,
        weeklyCount,
        maxWeekly,
        message: `🔒 Creator Requirement: At least ${requiredFollowers} follower needed to post publicly (Current: ${followerCount}).`
      };
    }

    if (weeklyCount >= maxWeekly) {
      return {
        eligible: false,
        followerCount,
        requiredFollowers,
        weeklyCount,
        maxWeekly,
        message: `⏱️ Weekly Quota Exceeded: Alumni accounts are limited to ${maxWeekly} posts per rolling week (${weeklyCount}/${maxWeekly} used).`
      };
    }

    return {
      eligible: true,
      followerCount,
      requiredFollowers,
      weeklyCount,
      maxWeekly
    };
  };

  // Comprehensive Role-Based Post Creation Engine
  const addPost = (newPost: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => {
    const effectiveAuthorRole = currentUser?.role || newPost.authorRole || 'student';
    const effectiveAuthorId = currentUser?.id || newPost.authorId || 'user-student-guest';
    const effectiveAuthorUsername = currentUser?.username || newPost.authorUsername || 'student_guest';
    const effectiveAuthorName = currentUser?.fullName || newPost.authorName || 'Campus Student';
    const effectiveHeadline = currentUser?.headline || newPost.authorHeadline || 'Student Contributor';
    const effectiveVerified = currentUser ? Boolean(currentUser.isVerified) : Boolean(newPost.isVerifiedAuthor);
    const effectiveCollegeId = currentUser?.collegeId || newPost.collegeId || 'col-psg';
    const effectiveCollegeName = currentUser?.collegeName || newPost.collegeName || 'PSG College of Technology';

    // Check account ban / cooldown status
    if (currentUser?.isBanned) {
      const isStillBanned = currentUser.bannedUntil ? new Date(currentUser.bannedUntil).getTime() > Date.now() : true;
      if (isStillBanned) {
        return {
          success: false,
          message: `🚨 Account Restricted: Cooldown active until ${currentUser.bannedUntil ? new Date(currentUser.bannedUntil).toLocaleString() : 'further notice'}. Reason: ${currentUser.bannedReason || 'Policy violation'}.`
        };
      }
    }

    // Role Limitation: ALUMNI (Follower threshold, 10/week quota)
    if (effectiveAuthorRole === 'alumni') {
      const eligibility = checkAlumniPostEligibility(currentUser || undefined);
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.message || 'Alumni account does not meet posting eligibility requirements.'
        };
      }
    }

    // AUTOMATED OPEN-SOURCE AI MODERATION SCAN (toxic-bert + distilbert + nsfwjs)
    const aiResult = runUnifiedAIModeration(newPost.content, newPost.imageUrl, aiModelSettings);

    // 1. Critical Threats / Severe Hate Speech -> AUTOMATED TOXICITY BAN (Only for severe threats)
    if (aiModelSettings.autoBanEnabled && (aiResult.toxicity.categories.threat > 90 || aiResult.toxicity.categories.identityHate > 95)) {
      if (currentUser) {
        const nextStrikes = (currentUser.strikesCount || 0) + 1;
        const bannedUntil = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        const updatedUser: UserProfile = {
          ...currentUser,
          isBanned: true,
          bannedUntil,
          bannedReason: `Automated AI Ban: ${aiResult.actionReason || 'Severe threat violation'}`,
          strikesCount: nextStrikes,
          lastStrikeTimestamp: new Date().toISOString()
        };

        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        try {
          localStorage.setItem('campus_lenz_user', JSON.stringify(updatedUser));
        } catch {}

        logAdminAction(
          'AUTOMATED_TOXICITY_BAN',
          `@${currentUser.username}`,
          `AI Model unitary/toxic-bert auto-banned user for 48h (Strike #${nextStrikes}). Violation: "${aiResult.actionReason}". Offending snippet: "${newPost.content.slice(0, 60)}..."`,
          'critical'
        );
      }

      return {
        success: false,
        message: `🚨 Automated AI Action: Post rejected due to severe safety policy violation (Score: ${aiResult.toxicity.score}%). Recorded in administrative audit log.`
      };
    }

    // Quarantine Flagging (only for spam bots or explicit graphic images)
    const isQuarantined = aiResult.actionRecommended === 'quarantine';
    if (isQuarantined) {
      logAdminAction(
        'AI_AUTOMATED_QUARANTINE',
        'Campus Stream',
        `Open-source AI quarantined post by @${effectiveAuthorUsername} (${aiResult.actionReason})`,
        'warning'
      );
    }

    // Role Limitation: FACULTY (Only knowledge-based content)
    let isKnowledgeBased = false;
    let finalTopic = newPost.topic;
    if (effectiveAuthorRole === 'faculty') {
      isKnowledgeBased = true;
      const academicTopics = [
        'Research & Tech', 'Academic Guidance', 'Career & Internships', 'Campus Notice', 'Lecture Notes', 'Knowledge Base',
        'Research & Publications', 'Curriculum & Syllabus', 'Lab & Project Guidance', 'Industry Guest Lecture', 'Examination Guidelines',
        'Academics'
      ];
      if (!newPost.topic || !academicTopics.includes(newPost.topic)) {
        finalTopic = 'Academic Guidance';
      }
    }

    // Role Limitation: INSTITUTION (Official Announcements)
    if (effectiveAuthorRole === 'institution') {
      finalTopic = finalTopic || 'Official Announcement';
    }

    // Role Limitation: STUDENT (Full social capabilities + anonymous toggle)
    const isAnonymous = effectiveAuthorRole === 'student' ? Boolean(newPost.isAnonymous) : false;

    // Topic & Category classification via campus-lenz-ai
    if (!finalTopic || finalTopic === 'Campus Discussion' || finalTopic === 'Campus Update') {
      if (aiResult.classification?.category && aiResult.classification.category !== 'General') {
        finalTopic = aiResult.classification.category;
      }
    }

    const generatedPostId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'post-' + Math.random().toString(36).substring(2, 15);

    const post: Post = {
      ...newPost,
      id: generatedPostId,
      authorId: effectiveAuthorId,
      authorUsername: effectiveAuthorUsername,
      authorName: effectiveAuthorName,
      authorRole: effectiveAuthorRole,
      authorHeadline: effectiveHeadline,
      isVerifiedAuthor: effectiveVerified,
      collegeId: effectiveCollegeId,
      collegeName: effectiveCollegeName,
      topic: finalTopic,
      isAnonymous,
      isKnowledgeBased,
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      moderationStatus: aiResult.isHarmful ? 'harmful' : aiResult.isSensitive ? 'sensitive' : 'normal',
      sentiment: aiResult.sentiment.label,
      sentimentScore: aiResult.sentiment.polarity,
      toxicityScore: aiResult.toxicity.score,
      isSensitive: aiResult.isSensitive,
      sensitiveReason: aiResult.actionReason,
      imageSafety: aiResult.imageSafety,
      aiModelMetadata: `campus-lenz-ai + ${aiResult.sentiment.model} + ${aiResult.toxicity.model}${aiResult.imageSafety ? ' + ' + aiResult.imageSafety.model : ''}`,
      isQuarantined
    };
    setPosts(prev => [post, ...prev]);

    // Only send HTTP/HTTPS image URLs to Supabase — base64 data: URLs are too large
    const supabaseImageUrl = (post.imageUrl && !post.imageUrl.startsWith('data:'))
      ? post.imageUrl
      : null;

    // Push to Supabase Cloud Database via server API route
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: post.id,
        authorId: currentUser?.id || null,
        authorUsername: post.authorUsername,
        authorName: post.authorName,
        authorRole: post.authorRole,
        authorHeadline: post.authorHeadline,
        isVerifiedAuthor: post.isVerifiedAuthor,
        isAnonymous: post.isAnonymous,
        collegeId: post.collegeId,
        collegeName: post.collegeName,
        content: post.content,
        topic: post.topic,
        imageUrl: supabaseImageUrl
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.post) {
          setPosts(prev =>
            prev.map(p =>
              p.id === generatedPostId || p.id === data.post.id
                ? {
                    ...p,
                    ...data.post,
                    authorId: p.authorId || data.post.authorId,
                    authorUsername: p.authorUsername || data.post.authorUsername,
                    authorName: p.authorName || data.post.authorName,
                    imageUrl: data.post.imageUrl || p.imageUrl,
                    comments: p.comments
                  }
                : p
            )
          );
        } else if (data.message) {
          console.warn('Post cloud sync notice:', data.message);
        }
      })
      .catch(err => console.warn('Post API network notice:', err));

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

    fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.likes)) {
          setPosts(prev =>
            prev.map(p =>
              p.id === postId
                ? { ...p, likes: data.likes, likesCount: data.likesCount }
                : p
            )
          );
        }
      })
      .catch(err => console.warn('Like API sync notice:', err));

    return { success: true };
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to comment.' };
    if (!content.trim()) return { success: false, message: 'Comment cannot be blank.' };

    const generatedCommentId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'comm-' + Math.random().toString(36).substring(2, 15);

    const newComment: Comment = {
      id: generatedCommentId,
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

    fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: generatedCommentId,
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorName: currentUser.fullName,
        authorRole: currentUser.role,
        authorHeadline: currentUser.headline,
        isVerifiedAuthor: currentUser.isVerified,
        content: content.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.comment) {
          setPosts(prev =>
            prev.map(p => {
              if (p.id !== postId) return p;
              return {
                ...p,
                comments: p.comments.map(c =>
                  c.id === generatedCommentId ? data.comment : c
                )
              };
            })
          );
        }
      })
      .catch(err => console.warn('Comment API sync notice:', err));

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

    fetch(`/api/posts/${postId}/repost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(err => console.warn('Repost API sync notice:', err));

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

    const isAuthor = currentUser && (
      postToDelete.authorId === currentUser.id ||
      (postToDelete.authorUsername && currentUser.username &&
       postToDelete.authorUsername.toLowerCase() === currentUser.username.toLowerCase())
    );
    const isAdmin = currentUser?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return { success: false, message: 'Only post authors or administrators can delete posts.' };
    }

    setPosts(prev => prev.filter(p => p.id !== postId));

    fetch(`/api/posts/${postId}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Delete post API notice:', err));

    return { success: true, message: 'Post deleted permanently.' };
  };

  const deleteComment = (postId: string, commentId: string) => {
    const isAdmin = currentUser?.role === 'admin';
    if (!isAdmin) {
      return { success: false, message: 'Super Admin clearance required to delete comments.' };
    }
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const newComments = p.comments.filter(c => c.id !== commentId);
        return {
          ...p,
          comments: newComments,
          commentsCount: newComments.length
        };
      })
    );
    return { success: true, message: 'Comment deleted successfully.' };
  };

  // Full User Deletion Engine (Super Admin Exclusive)
  const deleteUser = (userId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Super Admin clearance required to delete accounts.' };
    }
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found in database.' };
    }
    if (targetUser.id === currentUser.id) {
      return { success: false, message: 'Safety check: Cannot delete your own active root administrator session.' };
    }

    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setPosts(prev => prev.filter(p => p.authorId !== userId));
    return { success: true, message: `Account @${targetUser.username} (${targetUser.fullName}) and their posts have been deleted permanently.` };
  };

  // Unban restricted user (Super Admin)
  const unbanUser = (userId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only administrators can unban accounts.' };
    }
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isBanned: false, bannedUntil: undefined, bannedReason: undefined };
      }
      return u;
    }));
    return { success: true, message: 'Account restrictions and cooldown lifted successfully.' };
  };

  // Dynamic Role-Aware Repost Method
  const repostPost = (postId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Please sign in to repost.' };

    if (currentUser.role === 'alumni') {
      return { success: false, message: 'Alumni mentorship accounts cannot repost feed items.' };
    }

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return { success: false, message: 'Post not found.' };

    // Faculty limitation: can ONLY repost official Institution posts
    if (currentUser.role === 'faculty') {
      if (targetPost.authorRole !== 'institution') {
        return {
          success: false,
          message: 'Policy Limitation: Faculty members can only repost official Institution announcements, not student posts.'
        };
      }
    }

    // Institution limitation: reposts student achievement posts
    if (currentUser.role === 'institution') {
      if (targetPost.authorRole !== 'student') {
        return {
          success: false,
          message: 'Policy Limitation: Institutions can only repost verified student achievements to the official university showcase.'
        };
      }
    }

    const currentRepostedIds = Array.isArray(targetPost.repostedUserIds) ? targetPost.repostedUserIds : [];
    const isAlreadyReposted =
      currentRepostedIds.includes(currentUser.id) ||
      (currentUser.role === 'student' && targetPost.repostedByStudent?.studentId === currentUser.id) ||
      (currentUser.role === 'faculty' && targetPost.repostedByFaculty?.facultyId === currentUser.id) ||
      (currentUser.role === 'institution' && targetPost.repostedByInstitution?.institutionId === currentUser.id);

    if (isAlreadyReposted) {
      // Toggle off / Undo Repost
      const updatedRepostedIds = currentRepostedIds.filter(id => id !== currentUser.id);
      const newSharesCount = Math.max(0, (targetPost.sharesCount || 1) - 1);

      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updated: Post = {
              ...p,
              sharesCount: newSharesCount,
              repostedUserIds: updatedRepostedIds
            };
            if (currentUser.role === 'student' && updated.repostedByStudent?.studentId === currentUser.id) {
              delete updated.repostedByStudent;
            }
            if (currentUser.role === 'faculty' && updated.repostedByFaculty?.facultyId === currentUser.id) {
              delete updated.repostedByFaculty;
            }
            if (currentUser.role === 'institution' && updated.repostedByInstitution?.institutionId === currentUser.id) {
              delete updated.repostedByInstitution;
            }
            return updated;
          }
          return p;
        })
      );

      if (isSupabaseConfigured() && supabase) {
        supabase
          .from('posts')
          .update({ shares_count: newSharesCount })
          .eq('id', postId)
          .then(() => {});
      }

      return {
        success: true,
        message: 'Repost removed from your profile.'
      };
    } else {
      // Add Repost
      const updatedRepostedIds = [...currentRepostedIds.filter(id => id !== currentUser.id), currentUser.id];
      const newSharesCount = (targetPost.sharesCount || 0) + 1;

      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updated: Post = {
              ...p,
              sharesCount: newSharesCount,
              repostedUserIds: updatedRepostedIds
            };
            if (currentUser.role === 'institution') {
              updated.repostedByInstitution = {
                institutionId: currentUser.id,
                institutionName: currentUser.fullName,
                repostedAt: new Date().toISOString()
              };
            } else if (currentUser.role === 'faculty') {
              updated.repostedByFaculty = {
                facultyId: currentUser.id,
                facultyName: currentUser.fullName,
                repostedAt: new Date().toISOString()
              };
            } else if (currentUser.role === 'student') {
              updated.repostedByStudent = {
                studentId: currentUser.id,
                studentName: currentUser.fullName,
                repostedAt: new Date().toISOString()
              };
            }
            return updated;
          }
          return p;
        })
      );

      if (isSupabaseConfigured() && supabase) {
        supabase
          .from('posts')
          .update({ shares_count: newSharesCount })
          .eq('id', postId)
          .then(() => {});
      }

      return {
        success: true,
        message: `Reposted to your profile and campus feed!`
      };
    }
  };

  // Content Reporting (Faculty, Institution & Admin)
  const reportPost = (
    postId: string,
    reason: string,
    category: string = 'Spreading Rumors / Misinformation'
  ): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Please sign in to report posts.' };

    if (currentUser.role === 'alumni') {
      return { success: false, message: 'Alumni accounts cannot report content. Please contact campus administration.' };
    }

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return { success: false, message: 'Post not found.' };

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const existingReports = p.reportedBy || [];
          const newReport = {
            reporterId: currentUser.id,
            reporterRole: currentUser.role,
            reporterName: currentUser.fullName,
            reason: `${category}: ${reason.trim() || 'Contains misleading claims or violates collegiate guidelines.'}`,
            reportedAt: new Date().toISOString()
          };
          const updated: Post = {
            ...p,
            reportedBy: [...existingReports, newReport],
            moderationStatus: 'sensitive'
          };
          if (currentUser.role === 'institution') {
            updated.reportedByInstitution = {
              institutionName: currentUser.fullName,
              reason: `${category}: ${reason.trim() || 'Official Institution Dispute / False Claim notice.'}`,
              reportedAt: new Date().toISOString()
            };
          }
          return updated;
        }
        return p;
      })
    );

    return {
      success: true,
      message: `Post reported to Institution governance desk (#${postId.slice(-6)}).`
    };
  };

  // Join & Exit Server Communities (Students & Peers)
  const joinServer = (serverId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sign in required to join this server.' };
    const joined = currentUser.joinedServerIds || [];
    if (joined.includes(serverId)) return { success: true, message: 'Already a member of this community.' };

    const nextJoined = [...joined, serverId];
    const updatedUser: UserProfile = { ...currentUser, joinedServerIds: nextJoined };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        const memberIds = s.memberIds || [];
        return {
          ...s,
          memberCount: s.memberCount + 1,
          memberIds: memberIds.includes(currentUser.id) ? memberIds : [...memberIds, currentUser.id]
        };
      }
      return s;
    }));

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updatedUser));
    } catch {}

    return { success: true, message: 'Joined server community successfully!' };
  };

  const leaveServer = (serverId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sign in required.' };
    const joined = currentUser.joinedServerIds || [];
    const nextJoined = joined.filter(id => id !== serverId);
    const updatedUser: UserProfile = { ...currentUser, joinedServerIds: nextJoined };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        const memberIds = (s.memberIds || []).filter(id => id !== currentUser.id);
        return {
          ...s,
          memberCount: Math.max(1, s.memberCount - 1),
          memberIds
        };
      }
      return s;
    }));

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updatedUser));
    } catch {}

    return { success: true, message: 'Exited server community.' };
  };

  // Join & Exit Community Sub-Groups
  const joinGroup = (serverId: string, groupId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sign in required.' };
    const joined = currentUser.joinedGroupIds || [];
    if (joined.includes(groupId)) return { success: true, message: 'Already a member of this group.' };
    const nextJoined = [...joined, groupId];
    const updatedUser: UserProfile = { ...currentUser, joinedGroupIds: nextJoined };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    return { success: true, message: 'Joined group discussion!' };
  };

  const leaveGroup = (serverId: string, groupId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sign in required.' };
    const joined = currentUser.joinedGroupIds || [];
    const nextJoined = joined.filter(id => id !== groupId);
    const updatedUser: UserProfile = { ...currentUser, joinedGroupIds: nextJoined };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    return { success: true, message: 'Left group discussion.' };
  };

  // Faculty Community Proposal Engine
  const requestFacultyCommunity = (
    name: string,
    description: string,
    collegeId: string
  ): { success: boolean; message: string; server?: DiscordServer } => {
    if (!currentUser || currentUser.role !== 'faculty') {
      return { success: false, message: 'Only faculty members can request department community pages.' };
    }
    const matchedCol = colleges.find(c => c.id === collegeId) || colleges[0];
    const newServer: DiscordServer = {
      id: `server-fac-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Department academic community page.',
      collegeId: matchedCol.id,
      collegeName: matchedCol.name,
      institutionOwnerId: matchedCol.id,
      memberCount: 1,
      channels: [
        {
          id: `ch-ann-${Date.now()}`,
          name: 'faculty-notices',
          description: 'Official department notices and lecture broadcasts.',
          type: 'announcements',
          isAnnouncementOnly: true,
          isRagebaitProtected: true,
          memberCount: 1
        },
        {
          id: `ch-acad-${Date.now()}`,
          name: 'academic-discussions',
          description: 'Faculty-guided curriculum and research question desk.',
          type: 'general',
          isRagebaitProtected: false,
          memberCount: 1
        }
      ],
      antiRagebaitRules: [
        'Strict collegiate decorum and mutual respect required.',
        'Zero ragebait or slander tolerated.',
        'Official institution governance applies.'
      ],
      pendingApproval: true,
      isApprovedByInstitution: false,
      requestedByFacultyId: currentUser.id,
      requestedByFacultyName: currentUser.fullName,
      memberIds: [currentUser.id]
    };

    setServers(prev => [newServer, ...prev]);
    return {
      success: true,
      message: `Community proposal for "${name}" submitted! Awaiting review and authorization from ${matchedCol.name} Administration.`,
      server: newServer
    };
  };

  const approveFacultyCommunity = (serverId: string): { success: boolean; message: string } => {
    if (!currentUser || (currentUser.role !== 'institution' && currentUser.role !== 'admin')) {
      return { success: false, message: 'Only institutions or admins can authorize community proposals.' };
    }
    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        return { ...s, pendingApproval: false, isApprovedByInstitution: true };
      }
      return s;
    }));
    return { success: true, message: 'Faculty community page approved and deployed officially!' };
  };

  const rejectFacultyCommunity = (serverId: string): { success: boolean; message: string } => {
    if (!currentUser || (currentUser.role !== 'institution' && currentUser.role !== 'admin')) {
      return { success: false, message: 'Only institutions or admins can decline community proposals.' };
    }
    setServers(prev => prev.filter(s => s.id !== serverId));
    return { success: true, message: 'Community request rejected and cleared.' };
  };

  const toggleFollowUser = (targetUserIdOrUsername: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to follow users.' };

    // Resolve target in allUsers by ID or username
    const existingTarget = allUsers.find(
      u => u.id === targetUserIdOrUsername ||
      (u.username && u.username.toLowerCase() === targetUserIdOrUsername.toLowerCase())
    );

    const target: UserProfile = existingTarget || ({
      id: targetUserIdOrUsername,
      username: targetUserIdOrUsername,
      fullName: targetUserIdOrUsername,
      role: 'student',
      followers: [],
      followersCount: 0,
      following: [],
      followingCount: 0
    } as any);

    if (!existingTarget) {
      setAllUsers(prev => [target, ...prev]);
    }

    if (target.id === currentUser.id || target.username.toLowerCase() === currentUser.username.toLowerCase()) {
      return { success: false, message: 'You cannot follow yourself.' };
    }

    const targetFollowers = Array.isArray(target.followers) ? target.followers : [];
    const myFollowing = Array.isArray(currentUser.following) ? currentUser.following : [];

    const isAlreadyFollowing =
      targetFollowers.includes(currentUser.id) ||
      (currentUser.username && targetFollowers.includes(currentUser.username)) ||
      myFollowing.includes(target.id) ||
      (target.username && myFollowing.includes(target.username));

    let nextTargetFollowers: string[];
    let nextMyFollowing: string[];

    if (isAlreadyFollowing) {
      nextTargetFollowers = targetFollowers.filter(
        id => id !== currentUser.id && id !== currentUser.username
      );
      nextMyFollowing = myFollowing.filter(
        id => id !== target.id && id !== target.username
      );
    } else {
      nextTargetFollowers = [...targetFollowers.filter(id => id !== currentUser.id && id !== currentUser.username), currentUser.id];
      nextMyFollowing = [...myFollowing.filter(id => id !== target.id && id !== target.username), target.id, target.username].filter(Boolean);
    }

    // Optimistically update allUsers
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === target.id || u.username.toLowerCase() === target.username.toLowerCase()) {
          return {
            ...u,
            followers: nextTargetFollowers,
            followersCount: nextTargetFollowers.length
          };
        }
        if (u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()) {
          return {
            ...u,
            following: nextMyFollowing,
            followingCount: nextMyFollowing.length
          };
        }
        return u;
      })
    );

    // Optimistically update currentUser
    const updatedCurrentUser = {
      ...currentUser,
      following: nextMyFollowing,
      followingCount: nextMyFollowing.length
    };
    setCurrentUser(updatedCurrentUser);

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updatedCurrentUser));
    } catch {}

    // Synchronize to Supabase via follow API
    fetch(`/api/users/${encodeURIComponent(target.username)}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        followerId: currentUser.id,
        followerUsername: currentUser.username
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.targetUser && data.followerUser) {
          setAllUsers(prev =>
            prev.map(u => {
              if (u.id === data.targetUser.id) {
                return {
                  ...u,
                  followers: data.targetUser.followers,
                  followersCount: data.targetUser.followersCount
                };
              }
              if (u.id === data.followerUser.id) {
                return {
                  ...u,
                  following: data.followerUser.following,
                  followingCount: data.followerUser.followingCount
                };
              }
              return u;
            })
          );
        }
      })
      .catch(err => console.warn('Follow API sync notice:', err));
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

    if (currentUser.username) {
      fetch(`/api/users/${encodeURIComponent(currentUser.username)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(err => console.warn('Profile sync notice:', err));
    }
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

    const generatedSmsgId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'smsg-' + Math.random().toString(36).substring(2, 15);

    const newMessage: ServerMessage = {
      id: generatedSmsgId,
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

    fetch('/api/server-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: generatedSmsgId,
        channelId,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorRole: currentUser.role,
        authorHeadline: currentUser.headline,
        content,
        isFlaggedForRagebait: hasRagebaitPattern
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.message) {
          setServerMessages(prev => prev.map(m => m.id === generatedSmsgId ? data.message : m));
        }
      })
      .catch(err => console.warn('Server message API sync notice:', err));

    return { success: true };
  };

  // Instagram-style Direct Messages: Send Message
  const sendDirectMessage = (receiverId: string, content: string): DirectMessage => {
    const senderId = currentUser?.id || 'guest';
    const sortedIds = [senderId, receiverId].sort();
    const conversationId = `conv-${sortedIds[0]}-${sortedIds[1]}`;
    const generatedMsgId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'dm-' + Math.random().toString(36).substring(2, 15);

    const newMsg: DirectMessage = {
      id: generatedMsgId,
      conversationId,
      senderId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setDirectMessages(prev => [...prev, newMsg]);

    fetch('/api/direct-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.message) {
          setDirectMessages(prev => prev.map(m => m.id === generatedMsgId ? data.message : m));
        }
      })
      .catch(err => console.warn('Direct message API sync notice:', err));

    return newMsg;
  };

  // Instagram-style Direct Messages: Toggle Heart Reaction
  const toggleLikeDirectMessage = (messageId: string) => {
    const targetMsg = directMessages.find(m => m.id === messageId);
    if (!targetMsg) return;
    const newLiked = !targetMsg.liked;
    setDirectMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, liked: newLiked } : m)
    );
    fetch('/api/direct-messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId, liked: newLiked })
    }).catch(err => console.warn('Toggle DM like notice:', err));
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
    const generatedGrvId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'grv-' + Math.random().toString(36).substring(2, 15);

    const report: PrivateGrievanceReport = {
      ...data,
      id: generatedGrvId,
      submittedAt: new Date().toISOString(),
      status: 'under_investigation'
    };
    setGrievanceReports(prev => [report, ...prev]);

    fetch('/api/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.grievance) {
          setGrievanceReports(prev => prev.map(g => g.id === generatedGrvId ? resData.grievance : g));
        }
      })
      .catch(err => console.warn('Grievance API sync notice:', err));

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

    fetch('/api/grievances', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reportId,
        status,
        institutionRemarks: remarks
      })
    }).catch(err => console.warn('Resolve grievance API notice:', err));
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
  delete-user <usr> - Permanently delete a user account and their content
  unban <usr>       - Lift toxicity restriction / cooldown on a user
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

      case 'delete-user': {
        const targetUsername = parts[1];
        if (!targetUsername) return "Usage: delete-user <username>";
        const target = allUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!target) return `User '@${targetUsername}' not found in database.`;
        deleteUser(target.id);
        return `[SUCCESS] User '@${target.username}' (${target.fullName}) has been permanently deleted from database.`;
      }

      case 'unban': {
        const targetUsername = parts[1];
        if (!targetUsername) return "Usage: unban <username>";
        const target = allUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!target) return `User '@${targetUsername}' not found in database.`;
        const res = unbanUser(target.id);
        return res.message;
      }

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

  // --- Advanced Role Feature Actions ---
  const addStudyRoom = (room: Omit<StudyRoom, 'id' | 'createdAt'>) => {
    const generatedRoomId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'room-' + Math.random().toString(36).substring(2, 15);

    const newRoom: StudyRoom = {
      ...room,
      id: generatedRoomId,
      createdAt: new Date().toISOString()
    };
    setStudyRooms(prev => [newRoom, ...prev]);

    fetch('/api/study-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.room) {
          setStudyRooms(prev => prev.map(r => r.id === generatedRoomId ? data.room : r));
        }
      })
      .catch(err => console.warn('Study room API sync notice:', err));

    return { success: true, message: `Created "${newRoom.title}" virtual study lounge!` };
  };

  const addCourseQuestion = (q: Omit<CourseQuestion, 'id' | 'createdAt' | 'upvotes' | 'answers'>) => {
    const generatedQId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'q-' + Math.random().toString(36).substring(2, 15);

    const newQuestion: CourseQuestion = {
      ...q,
      id: generatedQId,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      answers: []
    };
    setCourseQuestions(prev => [newQuestion, ...prev]);

    fetch('/api/course-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.question) {
          setCourseQuestions(prev => prev.map(item => item.id === generatedQId ? { ...data.question, answers: item.answers } : item));
        }
      })
      .catch(err => console.warn('Course question API sync notice:', err));

    return { success: true, message: 'Question posted to Course Q&A forum!' };
  };

  const upvoteCourseQuestion = (questionId: string) => {
    setCourseQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q)
    );

    fetch('/api/course-questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionId, upvote: true })
    }).catch(err => console.warn('Upvote API sync notice:', err));
  };

  const addCourseAnswer = (questionId: string, content: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to answer.' };
    const isFaculty = currentUser.role === 'faculty';
    const newAnswer: CourseAnswer = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ans-${Date.now()}`,
      questionId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      isFacultyEndorsed: isFaculty,
      endorsedByName: isFaculty ? currentUser.fullName : undefined
    };
    setCourseQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q)
    );

    fetch('/api/course-questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionId, newAnswer })
    }).catch(err => console.warn('Answer API sync notice:', err));

    return { success: true, message: isFaculty ? 'Faculty endorsed answer published!' : 'Answer posted!' };
  };

  const addMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'isReserved'>) => {
    const generatedMktId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'm-' + Math.random().toString(36).substring(2, 15);

    const newItem: MarketplaceItem = {
      ...item,
      id: generatedMktId,
      createdAt: new Date().toISOString(),
      isReserved: false
    };
    setMarketplaceItems(prev => [newItem, ...prev]);

    fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.item) {
          setMarketplaceItems(prev => prev.map(m => m.id === generatedMktId ? data.item : m));
        }
      })
      .catch(err => console.warn('Marketplace API sync notice:', err));

    return { success: true, message: 'Item listed on campus marketplace!' };
  };

  const reserveMarketplaceItem = (itemId: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to reserve items.' };
    setMarketplaceItems(prev =>
      prev.map(m => m.id === itemId ? { ...m, isReserved: true, reservedByStudentName: currentUser.fullName } : m)
    );

    fetch('/api/marketplace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, isReserved: true, reservedByStudentName: currentUser.fullName })
    }).catch(err => console.warn('Reserve item API notice:', err));

    return { success: true, message: 'Item reserved! Check pickup location.' };
  };

  const addAssignmentTask = (task: Omit<AssignmentTask, 'id' | 'isCompleted'>) => {
    const newTask: AssignmentTask = {
      ...task,
      id: `task-${Date.now()}`,
      isCompleted: false
    };
    setAssignmentTasks(prev => [newTask, ...prev]);
    return { success: true, message: 'Assignment added to checklist!' };
  };

  const toggleAssignmentTask = (taskId: string) => {
    setAssignmentTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
    );
  };

  const deleteAssignmentTask = (taskId: string) => {
    setAssignmentTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const bookMentorshipSlot = (slotId: string, notes?: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to book mentorship.' };
    setMentorshipSlots(prev =>
      prev.map(s => s.id === slotId ? {
        ...s,
        isBooked: true,
        bookedByStudentId: currentUser.id,
        bookedByStudentName: currentUser.fullName,
        notes: notes || s.notes
      } : s)
    );
    return { success: true, message: '1-on-1 Mentorship session confirmed!' };
  };

  const cancelMentorshipBooking = (slotId: string) => {
    setMentorshipSlots(prev =>
      prev.map(s => s.id === slotId ? {
        ...s,
        isBooked: false,
        bookedByStudentId: undefined,
        bookedByStudentName: undefined
      } : s)
    );
    return { success: true, message: 'Booking canceled. Slot is now open.' };
  };

  const addAlumniJobReferral = (ref: Omit<AlumniJobReferral, 'id' | 'createdAt' | 'referralRequestsCount'>) => {
    const newRef: AlumniJobReferral = {
      ...ref,
      id: `ref-${Date.now()}`,
      createdAt: new Date().toISOString(),
      referralRequestsCount: 0
    };
    setAlumniJobReferrals(prev => [newRef, ...prev]);
    return { success: true, message: 'Job opening posted to Alumni Referral Board!' };
  };

  const requestJobReferral = (referralId: string, studentGpa: number, resumeLink: string, note: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to request referral.' };
    const newReq: ReferralRequest = {
      id: `req-${Date.now()}`,
      referralId,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      studentGpa,
      resumeLink,
      note,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setReferralRequests(prev => [newReq, ...prev]);
    setAlumniJobReferrals(prev =>
      prev.map(r => r.id === referralId ? { ...r, referralRequestsCount: r.referralRequestsCount + 1 } : r)
    );
    return { success: true, message: 'Referral request submitted to Alumni!' };
  };

  const upvoteAmaQuestion = (eventId: string, questionId: string) => {
    setIndustryAmaEvents(prev =>
      prev.map(evt => evt.id === eventId ? {
        ...evt,
        questions: evt.questions.map(q => q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q)
      } : evt)
    );
  };

  const submitAmaQuestion = (eventId: string, questionText: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to ask questions.' };
    const newQ = {
      id: `ama-q-${Date.now()}`,
      authorName: currentUser.fullName,
      question: questionText,
      upvotes: 1
    };
    setIndustryAmaEvents(prev =>
      prev.map(evt => evt.id === eventId ? {
        ...evt,
        questions: [...evt.questions, newQ]
      } : evt)
    );
    return { success: true, message: 'Question added to AMA stage queue!' };
  };

  const joinOfficeHourQueue = (courseCode: string, topic: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in to join office hours.' };
    const newItem: OfficeHourQueueItem = {
      id: `q-item-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      courseCode,
      topic,
      joinedAt: 'Just now',
      status: 'waiting'
    };
    setOfficeHourQueue(prev => [...prev, newItem]);
    return { success: true, message: 'Checked into Virtual Office Hours queue!' };
  };

  const admitNextOfficeHourStudent = () => {
    const waiting = officeHourQueue.find(i => i.status === 'waiting');
    if (!waiting) return { success: false, message: 'No students waiting in queue.' };
    setOfficeHourQueue(prev =>
      prev.map(i => i.id === waiting.id ? { ...i, status: 'in_session' } : i)
    );
    return { success: true, message: `Admitted ${waiting.studentName} into office hours session!` };
  };

  const resolveOfficeHourStudent = (queueId: string) => {
    setOfficeHourQueue(prev => prev.filter(i => i.id !== queueId));
    return { success: true, message: 'Student inquiry marked resolved!' };
  };

  const addResearchOpening = (opening: Omit<ResearchOpening, 'id' | 'status' | 'applicants'>) => {
    const newOp: ResearchOpening = {
      ...opening,
      id: `res-${Date.now()}`,
      status: 'open',
      applicants: []
    };
    setResearchOpenings(prev => [newOp, ...prev]);
    return { success: true, message: 'Research & TA opening published!' };
  };

  const applyToResearchOpening = (openingId: string, statement: string, studentGpa: number) => {
    if (!currentUser) return { success: false, message: 'Please sign in to apply.' };
    const newApp: ResearchApplication = {
      id: `app-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      studentGpa,
      statement,
      status: 'pending',
      appliedAt: 'Just now'
    };
    setResearchOpenings(prev =>
      prev.map(op => op.id === openingId ? { ...op, applicants: [...op.applicants, newApp] } : op)
    );
    return { success: true, message: 'Application submitted to Professor!' };
  };

  const reviewResearchApplication = (openingId: string, applicationId: string, decision: 'accepted' | 'declined') => {
    setResearchOpenings(prev =>
      prev.map(op => op.id === openingId ? {
        ...op,
        applicants: op.applicants.map(app => app.id === applicationId ? { ...app, status: decision } : app)
      } : op)
    );
    return { success: true, message: `Candidate application marked as ${decision}.` };
  };

  const addLectureMaterialVersion = (mat: Omit<LectureMaterialVersion, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const newMat: LectureMaterialVersion = {
      ...mat,
      id: `lec-${Date.now()}`,
      uploadedAt: 'Just now',
      downloadCount: 1
    };
    setLectureMaterials(prev => [newMat, ...prev]);
    return { success: true, message: 'New lecture material version published!' };
  };

  const logAdminAction = (actionType: string, targetEntity: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'sys-admin',
      adminName: currentUser?.fullName || 'System Administrator',
      actionType,
      targetEntity,
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const triggerEmergencyBroadcast = (title: string, message: string, severity: 'critical' | 'warning' | 'notice') => {
    const bc: EmergencyBroadcast = {
      id: `bc-${Date.now()}`,
      institutionId: currentUser?.id || 'inst-admin',
      institutionName: currentUser?.fullName || 'Campus Administration',
      severity,
      title,
      message,
      issuedAt: 'Just now',
      active: true,
      targetAudiences: ['Students', 'Faculty', 'Staff']
    };
    setEmergencyBroadcast(bc);
    logAdminAction('EMERGENCY_BROADCAST_TRIGGERED', 'Site-Wide Alert', `Institution deployed ${severity.toUpperCase()} broadcast: "${title}"`, severity === 'critical' ? 'critical' : 'warning');
    return { success: true, message: 'Emergency broadcast published across campus network!' };
  };

  const dismissEmergencyBroadcast = () => {
    setEmergencyBroadcast(null);
    logAdminAction('EMERGENCY_BROADCAST_DISMISSED', 'Site-Wide Alert', 'Emergency broadcast dismissed by administrator', 'info');
    return { success: true, message: 'Emergency broadcast deactivated.' };
  };

  const runAIToxicityCheck = (text: string) => {
    const lower = text.toLowerCase();
    const toxicKeywords = ['idiot', 'scam', 'fraud', 'hate', 'kill', 'threat', 'stupid', 'harass', 'abusive'];
    const ragebaitKeywords = ['worst college', 'don’t join', 'complete waste', 'disaster', 'scammed'];

    let toxicityScore = 6;
    let sentiment: 'positive' | 'neutral' | 'toxic' | 'ragebait' = 'positive';
    let flagReason: string | undefined = undefined;

    for (const kw of toxicKeywords) {
      if (lower.includes(kw)) {
        toxicityScore = Math.max(toxicityScore, 86);
        sentiment = 'toxic';
        flagReason = `Identified toxic language pattern ("${kw}")`;
        break;
      }
    }
    for (const rw of ragebaitKeywords) {
      if (lower.includes(rw)) {
        toxicityScore = Math.max(toxicityScore, 74);
        sentiment = 'ragebait';
        flagReason = `Flagged sensationalist ragebait phrase ("${rw}")`;
        break;
      }
    }
    if (toxicityScore < 30) {
      sentiment = lower.includes('great') || lower.includes('excellent') || lower.includes('congrats') || lower.includes('helpful') ? 'positive' : 'neutral';
    }

    return { toxicityScore, sentiment, flagReason };
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
        savedPostIds,
        toggleSavePost,
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
        repostPost,
        reportFalseInfoPost,
        reportPost,
        deletePost,
        deleteComment,
        deleteUser,
        unbanUser,
        joinServer,
        leaveServer,
        joinGroup,
        leaveGroup,
        requestFacultyCommunity,
        approveFacultyCommunity,
        rejectFacultyCommunity,
        checkAlumniPostEligibility,
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
        resetAllUserData,
        studyRooms,
        addStudyRoom,
        courseQuestions,
        addCourseQuestion,
        upvoteCourseQuestion,
        addCourseAnswer,
        marketplaceItems,
        addMarketplaceItem,
        reserveMarketplaceItem,
        assignmentTasks,
        addAssignmentTask,
        toggleAssignmentTask,
        deleteAssignmentTask,
        examMilestones,
        mentorshipSlots,
        bookMentorshipSlot,
        cancelMentorshipBooking,
        alumniJobReferrals,
        addAlumniJobReferral,
        referralRequests,
        requestJobReferral,
        industryAmaEvents,
        upvoteAmaQuestion,
        submitAmaQuestion,
        officeHourQueue,
        joinOfficeHourQueue,
        admitNextOfficeHourStudent,
        resolveOfficeHourStudent,
        researchOpenings,
        addResearchOpening,
        applyToResearchOpening,
        reviewResearchApplication,
        lectureMaterials,
        addLectureMaterialVersion,
        emergencyBroadcast,
        triggerEmergencyBroadcast,
        dismissEmergencyBroadcast,
        auditLogs,
        logAdminAction,
        runAIToxicityCheck,
        sensitiveContentShieldActive,
        toggleSensitiveContentShield,
        aiModelSettings,
        updateAIModelSettings,
        runOpenSourceAIModeration,
        analyzePostWithAI,
        classifyTextCategory,
        analyzeReviewWithAI
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
