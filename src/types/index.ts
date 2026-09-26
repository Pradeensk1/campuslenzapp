export type UserRole = 'student' | 'alumni' | 'institution' | 'admin';

export type ReviewerType = 'student' | 'alumni';

export type VerificationStatus = 'pending' | 'admin_review' | 'approved' | 'rejected';

export type ModerationStatus = 'normal' | 'sensitive' | 'harmful';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  collegeId?: string;
  collegeName?: string;
  department?: string;
  course?: string;
  graduationBatch?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  collegeType: string; // e.g., 'Autonomous', 'Private', 'Government'
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
  authorName: string;
  authorRole: UserRole;
  isVerifiedAuthor: boolean;
  isAnonymous: boolean;
  collegeId?: string;
  collegeName?: string;
  content: string;
  topic?: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  moderationStatus: ModerationStatus;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  isVerifiedAuthor: boolean;
  content: string;
  createdAt: string;
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
