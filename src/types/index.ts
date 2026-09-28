export type UserRole = 'student' | 'alumni' | 'institution' | 'faculty' | 'staff' | 'admin';

export type ReviewerType = 'student' | 'alumni';

export type VerificationStatus = 'pending' | 'admin_review' | 'approved' | 'rejected';

export type ModerationStatus = 'normal' | 'sensitive' | 'harmful';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorHeadline: string;
  isVerifiedAuthor: boolean;
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  headline: string;
  bio?: string;
  collegeId?: string;
  collegeName?: string;
  department?: string;
  course?: string;
  graduationBatch?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  followers: string[];
  following: string[];
  createdAt: string;
  certifiedLicenseNumber?: string;
  accreditationGrade?: string;
  joinedServerIds?: string[];
  joinedGroupIds?: string[];
  isBanned?: boolean;
  bannedUntil?: string;
  bannedReason?: string;
  weeklyPostCount?: number;
  lastPostTimestamp?: string;
  strikesCount?: number;
  lastStrikeTimestamp?: string;

  // Role-Specific Metadata
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

export interface PlacementDetails {
  highestPackage: string;
  averagePackage: string;
  medianPackage: string;
  placementRate: string;
  topRecruiters: string[];
  internshipOffers: string;
  placementTraining: string;
  tier1HiresCount: number;
}

export interface FeeDetails {
  tuitionAnnual: string;
  hostelAnnual: string;
  messMonthly: string;
  examAndLabAnnual: string;
  scholarshipsAvailable: string;
  roiRating: string;
}

export interface AcademicDetails {
  studentFacultyRatio: string;
  phdFacultyPercent: string;
  curriculumFlexibility: string;
  researchFundingAnnual: string;
  labEquipmentGrade: string;
  academicsRating: number;
}

export interface CampusDetails {
  wifiSpeed: string;
  hostelCurfew: string;
  messFoodRating: number;
  sportsComplex: string;
  medicalFacility: string;
  gymAndFitness: string;
}

export interface ActivityDetails {
  annualFestName: string;
  techClubsCount: number;
  incubationCenter: string;
  hackathonsOrganizedAnnual: number;
  industryMoUs: number;
}

export interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  collegeType: string;
  establishedYear?: number;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  courses: string[];
  departments: string[];
  feesMin?: number;
  feesMax?: number;
  feesDescription?: string;
  placementStats?: {
    highestPackage?: string;
    averagePackage?: string;
    placementRate?: string;
    topRecruiters?: string[];
  };
  facilities: string[];
  officialOverview?: string;
  ratingAverage: number | null;
  reviewCount: number;

  // Granular Multi-Dimension Compare Attributes
  placementDetails: PlacementDetails;
  feeDetails: FeeDetails;
  academicDetails: AcademicDetails;
  campusDetails: CampusDetails;
  activityDetails: ActivityDetails;
  overallScore: {
    total: number; // e.g. 94 out of 100
    placementsScore: number;
    feesRoiScore: number;
    academicsScore: number;
    campusLifeScore: number;
    badge: string;
  };
}

export interface ReviewDimensions {
  academics: number;
  faculty: number;
  placements: number;
  infrastructure: number;
  hostel: number;
  campusLife: number;
  valueForMoney: number;
  studentExperience: number;
}

export interface CollegeReview {
  id: string;
  collegeId: string;
  userId: string;
  reviewerType: ReviewerType;
  authorName: string;
  authorUsername?: string;
  isAnonymous: boolean;
  overallRating: number;
  dimensions: ReviewDimensions;
  title: string;
  experience: string;
  pros: string[];
  cons: string[];
  advice?: string;
  recommendation: boolean;
  course: string;
  department: string;
  batch: string;
  createdAt: string;
  institutionReply?: {
    text: string;
    repliedAt: string;
    officialName: string;
  };
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorHeadline: string;
  isVerifiedAuthor: boolean;
  isAnonymous: boolean;
  collegeId?: string;
  collegeName?: string;
  content: string;
  topic?: string;
  imageUrl?: string;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  moderationStatus: ModerationStatus;
  repostedByInstitution?: {
    institutionId: string;
    institutionName: string;
    repostedAt: string;
  };
  repostedByFaculty?: {
    facultyId: string;
    facultyName: string;
    repostedAt: string;
  };
  repostedByStudent?: {
    studentId: string;
    studentName: string;
    repostedAt: string;
  };
  repostedUserIds?: string[];
  isKnowledgeBased?: boolean;
  isInstitutionReviewOnly?: boolean;
  institutionRating?: number;
  reportedByInstitution?: {
    reportedAt: string;
    reason: string;
    institutionName: string;
  };
  reportedBy?: {
    reporterId: string;
    reporterRole: UserRole;
    reporterName: string;
    reason: string;
    reportedAt: string;
  }[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'toxic' | 'ragebait';
  sentimentScore?: number;
  toxicityScore?: number;
  isSensitive?: boolean;
  sensitiveReason?: string;
  imageSafety?: {
    status: 'safe' | 'suggestive' | 'graphic' | 'sensitive';
    confidence: number;
    model: string;
    detectedLabels?: string[];
  };
  aiModelMetadata?: string;
  isQuarantined?: boolean;
}

export interface TextSentimentAnalysis {
  label: 'positive' | 'neutral' | 'negative' | 'ragebait' | 'toxic';
  score: number;
  polarity: number;
  model: string;
}

export interface TextToxicityAnalysis {
  score: number;
  isToxic: boolean;
  severity: 'clean' | 'mild' | 'moderate' | 'severe';
  flaggedKeywords: string[];
  categories: {
    toxicity: number;
    insult: number;
    threat: number;
    identityHate: number;
    ragebait: number;
  };
  model: string;
}

export interface ImageSafetyClassification {
  status: 'safe' | 'suggestive' | 'graphic' | 'sensitive';
  confidence: number;
  detectedLabels: string[];
  model: string;
}

export interface CampusLenzCategoryClassification {
  category: 'Academics' | 'Faculty' | 'Placements' | 'Infrastructure' | 'Hostel' | 'Campus Life' | 'Events' | 'Fees' | 'Student Experience' | 'General';
  confidence: number;
  isCollegeRelated: boolean;
  model: string;
}

export interface PostAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  category: 'Academics' | 'Faculty' | 'Placements' | 'Infrastructure' | 'Hostel' | 'Campus Life' | 'Events' | 'Fees' | 'Student Experience' | 'General';
  moderation: 'normal' | 'sensitive' | 'spam' | 'potentially_harmful';
  college_related: boolean;
  action: 'publish' | 'reject' | 'safety_review';
  confidence: number;
  model: string;
  flagReason?: string;
}

export interface ReviewAspectAnalysis {
  name: 'Academics' | 'Faculty' | 'Placements' | 'Infrastructure' | 'Hostel' | 'Campus Life' | 'Value for Money' | 'Student Experience';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ReviewAnalysisResult {
  overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  aspects: ReviewAspectAnalysis[];
  model: string;
}

export interface UnifiedAIModerationResult {
  sentiment: TextSentimentAnalysis;
  toxicity: TextToxicityAnalysis;
  imageSafety?: ImageSafetyClassification;
  isSensitive: boolean;
  isHarmful: boolean;
  actionRecommended: 'allow' | 'blur_sensitive' | 'quarantine' | 'auto_ban';
  actionReason?: string;
  classification?: CampusLenzCategoryClassification;
  postAnalysis?: PostAnalysisResult;
}

export interface AIModelSettings {
  autoBanThreshold: number;
  blurThreshold: number;
  autoBanEnabled: boolean;
  activeTextModel: string;
  activeVisionModel: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  collegeId?: string;
  collegeName?: string;
  creatorId: string;
  creatorRole: UserRole;
  isPrivate: boolean;
  membersCount: number;
  category: 'alumni' | 'department' | 'mentoring' | 'career' | 'general';
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  liked?: boolean;
}

export interface MessageRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  previewMessage: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userRole: 'alumni' | 'institution';
  collegeId: string;
  collegeName: string;
  documentType: string;
  documentUrl?: string;
  status: VerificationStatus;
  submittedAt: string;
  adminNotes?: string;
}

// ------------------------------------------------------------------------
// DISCORD-STYLE CAMPUS SERVER & CHANNEL MODELS
// ------------------------------------------------------------------------
export interface ServerMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorHeadline: string;
  content: string;
  createdAt: string;
  isFlaggedForRagebait?: boolean;
}

export interface ServerChannel {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'department' | 'placements' | 'alumni-guide' | 'anti-ragebait' | 'announcements';
  isRagebaitProtected: boolean;
  isAnnouncementOnly?: boolean;
  memberCount?: number;
}

export interface DiscordServer {
  id: string;
  name: string;
  collegeId: string;
  collegeName: string;
  institutionOwnerId: string;
  description: string;
  memberCount: number;
  channels: ServerChannel[];
  antiRagebaitRules: string[];
  isApprovedByInstitution?: boolean;
  pendingApproval?: boolean;
  requestedByFacultyId?: string;
  requestedByFacultyName?: string;
  memberIds?: string[];
}

// ------------------------------------------------------------------------
// PRIVATE GRIEVANCE & FACULTY REPORT MODEL (Students -> Institution ID)
// ------------------------------------------------------------------------
export interface PrivateGrievanceReport {
  id: string;
  studentId: string;
  studentName: string;
  isAnonymousToFaculty: boolean;
  targetInstitutionId: string;
  collegeName: string;
  category: 'classroom_issue' | 'faculty_conduct' | 'lab_infrastructure' | 'grading_dispute';
  targetFacultyName?: string;
  subjectOrCourse: string;
  detailedComplaint: string;
  submittedAt: string;
  status: 'under_investigation' | 'resolved' | 'action_taken';
  institutionRemarks?: string;
}

// ------------------------------------------------------------------------
// NEW ROLE-BASED ADVANCED FEATURE MODELS
// ------------------------------------------------------------------------

export interface StudyRoom {
  id: string;
  title: string;
  subject: string;
  activePeerCount: number;
  maxParticipants: number;
  hostName: string;
  roomTag: 'LeetCode' | 'GATE' | 'Deep Dive' | 'Exam Prep' | 'Silent Study' | 'AI Lab Work' | 'Project Collab' | string;
  hostId?: string;
  createdAt?: string;
  isFocusSessionActive?: boolean;
}

export interface CourseAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  isFacultyEndorsed?: boolean;
  endorsedByName?: string;
}

export interface CourseQuestion {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  content: string;
  codeSnippet?: string;
  isAnonymous: boolean;
  authorId: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
  answers: CourseAnswer[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: 'textbook' | 'equipment' | 'electronics' | 'notes';
  price: number;
  isFreeOrSwap: boolean;
  condition: 'like_new' | 'good' | 'fair';
  sellerId: string;
  sellerName: string;
  sellerRole: UserRole;
  sellerContact?: string;
  imageUrl?: string;
  isReserved: boolean;
  reservedByStudentName?: string;
  createdAt: string;
}

export interface AssignmentTask {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
  urgency: 'urgent' | 'medium' | 'low';
  isCompleted: boolean;
  points?: number;
}

export interface ExamMilestone {
  id: string;
  courseCode: string;
  examName: string;
  examDate: string;
  venue: string;
  remainingDays: number;
}

export interface MentorshipSlot {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniCompany: string;
  topic: 'resume_review' | 'mock_interview' | 'system_design' | 'career_roadmap';
  dateString: string;
  timeString: string;
  isBooked: boolean;
  bookedByStudentId?: string;
  bookedByStudentName?: string;
  notes?: string;
}

export interface AlumniJobReferral {
  id: string;
  alumniId: string;
  alumniName: string;
  company: string;
  roleTitle: string;
  jobType: 'Full-Time' | 'Internship';
  location: string;
  minGpa?: number;
  batchEligible?: string;
  description: string;
  referralRequestsCount: number;
  createdAt: string;
}

export interface ReferralRequest {
  id: string;
  referralId: string;
  studentId: string;
  studentName: string;
  studentGpa: number;
  resumeLink: string;
  note: string;
  status: 'pending' | 'referred' | 'declined';
  submittedAt: string;
}

export interface IndustryAMAEvent {
  id: string;
  hostId: string;
  hostName: string;
  hostTitle: string;
  hostCompany: string;
  topic: string;
  scheduledFor: string;
  isLive: boolean;
  attendeeCount: number;
  questions: {
    id: string;
    authorName: string;
    question: string;
    upvotes: number;
  }[];
}

export interface OfficeHourQueueItem {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  topic: string;
  joinedAt: string;
  status: 'waiting' | 'in_session' | 'resolved';
}

export interface ResearchApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentGpa: number;
  statement: string;
  status: 'pending' | 'accepted' | 'declined';
  appliedAt: string;
}

export interface ResearchOpening {
  id: string;
  professorId: string;
  professorName: string;
  department: string;
  title: string;
  description: string;
  prerequisites: string;
  stipendOrCredits: string;
  minGpa: number;
  status: 'open' | 'filled';
  applicants: ResearchApplication[];
}

export interface LectureMaterialVersion {
  id: string;
  courseCode: string;
  courseName: string;
  professorName: string;
  title: string;
  version: string;
  changelog: string;
  fileUrl: string;
  uploadedAt: string;
  downloadCount: number;
}

export interface EmergencyBroadcast {
  id: string;
  institutionId: string;
  institutionName: string;
  severity: 'critical' | 'warning' | 'notice';
  title: string;
  message: string;
  issuedAt: string;
  active: boolean;
  targetAudiences: string[];
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  actionType: string;
  targetEntity: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

