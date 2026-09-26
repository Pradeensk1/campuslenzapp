import { College, CollegeReview, Post, Community, UserProfile } from '@/types';

export const INITIAL_COLLEGES: College[] = [
  {
    id: 'col-psg',
    slug: 'psg-college-of-technology',
    name: 'PSG College of Technology',
    location: 'Coimbatore',
    state: 'Tamil Nadu',
    collegeType: 'Autonomous',
    establishedYear: 1951,
    contactEmail: 'contact@psgtech.edu',
    contactPhone: '+91 422 2572177',
    websiteUrl: 'https://www.psgtech.edu',
    courses: ['B.Tech Computer Science', 'B.E Electronics', 'MCA', 'M.Tech AI'],
    departments: ['Computer Science', 'Electrical & Electronics', 'Mechanical', 'Applied Math'],
    feesMin: 65000,
    feesMax: 120000,
    feesDescription: 'Government aided and self-financing annual fee brackets.',
    placementStats: {
      highestPackage: '38 LPA',
      averagePackage: '8.5 LPA',
      placementRate: '94%',
      topRecruiters: ['Microsoft', 'Amazon', 'Cisco', 'Qualcomm', 'TCS']
    },
    facilities: ['Hostel (Separate Boys/Girls)', 'Central Library', 'Advanced Robotics Lab', 'Sports Complex', 'High-Speed Wi-Fi'],
    officialOverview: 'An autonomous, government-aided institution affiliated with Anna University, committed to technical excellence and industry-driven research.',
    ratingAverage: 4.6,
    reviewCount: 28
  },
  {
    id: 'col-ceg',
    slug: 'college-of-engineering-guindy',
    name: 'College of Engineering, Guindy (CEG Anna University)',
    location: 'Chennai',
    state: 'Tamil Nadu',
    collegeType: 'Government',
    establishedYear: 1794,
    contactEmail: 'deanceg@annauniv.edu',
    contactPhone: '+91 44 2235 7004',
    websiteUrl: 'https://ceg.annauniv.edu',
    courses: ['B.E Computer Science', 'B.E Mechanical', 'B.Tech IT', 'MCA'],
    departments: ['Computer Science and Engineering', 'Information Technology', 'Mechanical Engineering'],
    feesMin: 35000,
    feesMax: 70000,
    feesDescription: 'Affordable government fee structure subsidized by the state.',
    placementStats: {
      highestPackage: '42 LPA',
      averagePackage: '9.2 LPA',
      placementRate: '92%',
      topRecruiters: ['Google', 'Adobe', 'Samsung', 'DE Shaw', 'Infosys']
    },
    facilities: ['Heritage Campus', 'Extensive Technical Library', 'Hostel Facilities', 'Innovation Hub', 'Auditorium'],
    officialOverview: 'One of the oldest technical institutions in Asia, offering premier academic and research programs in core engineering disciplines.',
    ratingAverage: 4.7,
    reviewCount: 35
  },
  {
    id: 'col-sns',
    slug: 'sns-college-of-technology',
    name: 'SNS College of Technology',
    location: 'Coimbatore',
    state: 'Tamil Nadu',
    collegeType: 'Autonomous',
    establishedYear: 2002,
    contactEmail: 'office@snsct.org',
    contactPhone: '+91 422 2666264',
    websiteUrl: 'https://snsct.org',
    courses: ['B.Tech AI & Data Science', 'B.E CSE', 'MCA', 'MBA'],
    departments: ['Computer Science', 'Design Thinking Hub', 'Management Studies'],
    feesMin: 85000,
    feesMax: 150000,
    feesDescription: 'Autonomous annual academic fee including design lab amenities.',
    placementStats: {
      highestPackage: '18 LPA',
      averagePackage: '5.2 LPA',
      placementRate: '88%',
      topRecruiters: ['Cognizant', 'Wipro', 'Accenture', 'Zoho', 'Hexaware']
    },
    facilities: ['Design Thinking Spine', 'Modern Hostels', 'IoT Labs', 'Cafeteria', 'Digital Studio'],
    officialOverview: 'First institution in India to implement Design Thinking framework across all engineering curricula.',
    ratingAverage: 4.1,
    reviewCount: 16
  }
];

export const INITIAL_REVIEWS: CollegeReview[] = [
  {
    id: 'rev-1',
    collegeId: 'col-psg',
    userId: 'user-alumni-1',
    reviewerType: 'alumni',
    authorName: 'Karthik Raja',
    isAnonymous: false,
    overallRating: 4.8,
    dimensions: {
      academics: 5,
      faculty: 4,
      placements: 5,
      infrastructure: 4,
      hostel: 4,
      campusLife: 4,
      valueForMoney: 5,
      studentExperience: 5
    },
    title: 'Superb placements and strong industry connections',
    experience: 'PSG Tech gave me rigorous foundation in Computer Science. The coding culture and hackathons were top tier. Placements were seamless for tech branches.',
    pros: ['Top recruiters visit campus', 'Practical lab culture', 'Very supportive alumni network'],
    cons: ['Strict attendance rules', 'Heavy exam schedule'],
    advice: 'Start competitive programming from 2nd year and participate in club activities.',
    recommendation: true,
    course: 'B.Tech Computer Science',
    department: 'Computer Science',
    batch: '2023',
    createdAt: '2026-02-14T10:30:00Z',
    institutionReply: {
      officialName: 'Dean of Student Affairs (PSG Tech)',
      repliedAt: '2026-02-16T12:00:00Z',
      text: 'Thank you for your valuable feedback Karthik. We are continuously enhancing our curriculum with newer AI-focused industry electives.'
    }
  },
  {
    id: 'rev-2',
    collegeId: 'col-psg',
    userId: 'user-student-2',
    reviewerType: 'student',
    authorName: 'Anonymous Student',
    isAnonymous: true,
    overallRating: 4.2,
    dimensions: {
      academics: 5,
      faculty: 4,
      placements: 5,
      infrastructure: 4,
      hostel: 3,
      campusLife: 3,
      valueForMoney: 4,
      studentExperience: 4
    },
    title: 'Great academics, hostel food needs improvement',
    experience: 'The academic quality is undisputed. However, hostel food and mess hygiene can be improved. Sports facilities are well maintained.',
    pros: ['Academics are world-class', 'Peer group is very smart'],
    cons: ['Hostel food quality is average', 'High workload'],
    advice: 'Hostel committee needs to review catering vendors regularly.',
    recommendation: true,
    course: 'MCA',
    department: 'Applied Sciences',
    batch: '2025',
    createdAt: '2026-03-01T09:15:00Z'
  },
  {
    id: 'rev-3',
    collegeId: 'col-sns',
    userId: 'user-alumni-3',
    reviewerType: 'alumni',
    authorName: 'Sanjay Kumar',
    isAnonymous: false,
    overallRating: 4.0,
    dimensions: {
      academics: 4,
      faculty: 4,
      placements: 4,
      infrastructure: 5,
      hostel: 4,
      campusLife: 4,
      valueForMoney: 4,
      studentExperience: 4
    },
    title: 'Good emphasis on design thinking and innovation labs',
    experience: 'The design thinking workshops helped us build practical startup prototypes. Placements for MCA and CSE are consistent with service & mid-product companies.',
    pros: ['Modern infrastructure', 'Design thinking curriculum', 'Active clubs'],
    cons: ['Core company recruitment is relatively lesser than tier-1'],
    advice: 'Focus on independent certifications and GitHub projects.',
    recommendation: true,
    course: 'MCA',
    department: 'Computer Applications',
    batch: '2024',
    createdAt: '2026-01-20T14:45:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-student-1',
    authorName: 'Deepak V',
    authorRole: 'student',
    isVerifiedAuthor: false,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Anyone preparing for upcoming campus drive technical rounds? Lets form a peer study circle for Data Structures and System Design.',
    topic: 'Placements & Prep',
    likesCount: 14,
    commentsCount: 6,
    sharesCount: 2,
    createdAt: '2026-09-24T18:20:00Z',
    moderationStatus: 'normal'
  },
  {
    id: 'post-2',
    authorId: 'user-alumni-1',
    authorName: 'Karthik Raja',
    authorRole: 'alumni',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Open for 1:1 resume reviews and tech mock interviews for 3rd and final year MCA / B.Tech students. Drop a message request if interested!',
    topic: 'Alumni Mentorship',
    likesCount: 38,
    commentsCount: 12,
    sharesCount: 8,
    createdAt: '2026-09-25T11:05:00Z',
    moderationStatus: 'normal'
  },
  {
    id: 'post-3',
    authorId: 'user-anonymous-9',
    authorName: 'Anonymous Student',
    authorRole: 'student',
    isVerifiedAuthor: false,
    isAnonymous: true,
    collegeId: 'col-sns',
    collegeName: 'SNS College of Technology',
    content: 'How is the hostel wifi speed in Block B currently? Need reliable latency for weekend coding contests.',
    topic: 'Hostel & Campus Life',
    likesCount: 7,
    commentsCount: 3,
    sharesCount: 0,
    createdAt: '2026-09-26T14:10:00Z',
    moderationStatus: 'normal'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'PSG Tech - Alumni & Student Mentorship Circle',
    description: 'Direct knowledge sharing, resume tips, and job referrals between PSG alumni and current students.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    creatorId: 'user-alumni-1',
    creatorRole: 'alumni',
    isPrivate: false,
    membersCount: 142,
    category: 'mentoring',
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'comm-2',
    name: 'SNS Alumni — MCA Network',
    description: 'Official alumni gathering space for MCA graduates from SNS College of Technology. Career opportunities and meetup planning.',
    collegeId: 'col-sns',
    collegeName: 'SNS College of Technology',
    creatorId: 'user-alumni-3',
    creatorRole: 'alumni',
    isPrivate: false,
    membersCount: 89,
    category: 'alumni',
    createdAt: '2026-02-05T00:00:00Z'
  },
  {
    id: 'comm-3',
    name: 'Tamil Nadu Engineering Aspirants',
    description: 'Cross-college discussion for admissions, cutoffs, counseling, hostel comparisons, and career roadmap.',
    creatorId: 'user-student-1',
    creatorRole: 'student',
    isPrivate: false,
    membersCount: 310,
    category: 'general',
    createdAt: '2025-11-20T00:00:00Z'
  }
];

export const DEFAULT_USER: UserProfile = {
  id: 'user-demo-student',
  email: 'student@campuslenz.org',
  role: 'student',
  fullName: 'Arun Prakash',
  collegeId: 'col-psg',
  collegeName: 'PSG College of Technology',
  department: 'Computer Applications',
  course: 'MCA',
  graduationBatch: '2026',
  isVerified: false,
  createdAt: '2026-01-01T00:00:00Z'
};
