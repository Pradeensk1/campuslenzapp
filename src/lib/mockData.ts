import {
  College,
  CollegeReview,
  Post,
  Community,
  UserProfile,
  DiscordServer,
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
  LectureMaterialVersion,
  EmergencyBroadcast,
  AuditLogEntry
} from '@/types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-student-demo',
    username: 'student_scholar',
    email: 'student@campuslenz.edu',
    role: 'student',
    fullName: 'Verified Campus Student',
    headline: 'B.Tech Computer Science & Engineering @ PSG Tech | Aspiring Software Engineer',
    bio: 'Active engineering student passionate about distributed systems, modern full-stack development, and campus tech symposiums.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    graduationBatch: '2026',
    isVerified: true,
    followersCount: 184,
    followingCount: 95,
    followers: ['user-alumni-demo', 'user-faculty-demo'],
    following: ['user-alumni-demo', 'user-inst-demo'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-alumni-demo',
    username: 'alumni_mentor',
    email: 'alumni@campuslenz.edu',
    role: 'alumni',
    fullName: 'Alumni Industry Mentor',
    headline: 'Senior Software Engineer @ Microsoft | Campus Alumnus & Mentor',
    bio: 'Alumnus supporting junior students with coding interview prep, DSA problem solving patterns, and resume audits.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    graduationBatch: '2023',
    isVerified: true,
    followersCount: 1420,
    followingCount: 210,
    followers: ['user-student-demo'],
    following: ['user-inst-demo'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-inst-demo',
    username: 'institution_admin',
    email: 'admin@psgtech.edu',
    role: 'institution',
    fullName: 'PSG Tech Official Administration',
    headline: 'Official Administrative Desk • PSG College of Technology',
    bio: 'Official university administrative channel for institutional announcements, department servers, and student welfare governance.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Central Administration',
    course: 'Institution Management',
    graduationBatch: 'Administration',
    isVerified: true,
    followersCount: 4800,
    followingCount: 12,
    followers: ['user-student-demo', 'user-alumni-demo'],
    following: [],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-faculty-demo',
    username: 'academic_faculty',
    email: 'faculty@psgtech.edu',
    role: 'faculty',
    fullName: 'Dr. Academic Faculty Guide',
    headline: 'Professor & Head of Computer Science @ PSG Tech | Senior Academic Researcher',
    bio: '15+ years of teaching excellence, advising student research publications, and guiding final year capstone projects.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    course: 'Faculty / Staff',
    graduationBatch: 'Faculty Guide',
    isVerified: true,
    followersCount: 920,
    followingCount: 80,
    followers: ['user-student-demo'],
    following: ['user-inst-demo'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-admin-system',
    username: 'system_admin',
    email: 'admin@campuslenz.org',
    role: 'admin',
    fullName: 'Campus Lenz Super Administrator',
    headline: 'Platform Trust, Governance & Lead Developer',
    bio: 'System level operator with complete project management capabilities, developer terminal privileges, and content moderation authority.',
    isVerified: true,
    followersCount: 9999,
    followingCount: 0,
    followers: [],
    following: [],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-junith',
    username: 'junith_s',
    email: 'junith@psgtech.edu',
    role: 'student',
    fullName: 'Junith S',
    headline: 'B.Tech AI & Data Science @ PSG Tech | Kaggle Specialist',
    bio: 'Machine learning practitioner working on edge inference and computer vision models.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Artificial Intelligence',
    course: 'B.Tech AI & DS',
    graduationBatch: '2026',
    isVerified: true,
    followersCount: 340,
    followingCount: 110,
    followers: ['user-student-demo'],
    following: ['user-alumni-demo'],
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'user-arun',
    username: 'arun_prakash',
    email: 'arun.mca@psgtech.edu',
    role: 'student',
    fullName: 'Arun Prakash',
    headline: 'MCA Final Year @ PSG Tech | Full-Stack Developer',
    bio: 'Building reactive full-stack web applications and cloud architectures.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Applications',
    course: 'MCA',
    graduationBatch: '2025',
    isVerified: true,
    followersCount: 215,
    followingCount: 75,
    followers: [],
    following: ['user-student-demo'],
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'user-karthika',
    username: 'karthika_amazon',
    email: 'karthika@amazon.com',
    role: 'alumni',
    fullName: 'Karthika R',
    headline: 'Software Engineer II @ Amazon | PSG Alumna (2022)',
    bio: 'AWS Developer Productivity team in Chennai. Active mentor on campus placement guidance.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    graduationBatch: '2022',
    isVerified: true,
    followersCount: 890,
    followingCount: 130,
    followers: ['user-student-demo'],
    following: [],
    createdAt: '2026-01-10T00:00:00Z'
  }
];

export const INITIAL_COLLEGES: College[] = [
  {
    id: 'col-psg',
    slug: 'psg-college-of-technology',
    name: 'PSG College of Technology',
    location: 'Coimbatore',
    state: 'Tamil Nadu',
    collegeType: 'Autonomous (Govt-Aided)',
    establishedYear: 1951,
    contactEmail: 'contact@psgtech.edu',
    contactPhone: '+91 422 2572177',
    websiteUrl: 'https://www.psgtech.edu',
    courses: ['B.Tech Computer Science', 'B.Tech AI & Data Science', 'MCA', 'M.Tech AI', 'B.E Mechanical'],
    departments: ['Computer Science', 'Artificial Intelligence', 'Mechanical', 'Applied Math'],
    feesMin: 65000,
    feesMax: 120000,
    feesDescription: 'Government aided and self-financing annual fee brackets.',
    placementStats: {
      highestPackage: '38.5 LPA',
      averagePackage: '8.8 LPA',
      placementRate: '94%',
      topRecruiters: ['Microsoft', 'Amazon', 'Cisco', 'Qualcomm', 'TCS Research', 'DE Shaw']
    },
    facilities: ['Hostel (Separate Boys/Girls)', 'Central 24x7 Library', 'Advanced Robotics Lab', 'Sports Complex', 'High-Speed Wi-Fi'],
    officialOverview: 'An autonomous, government-aided institution affiliated with Anna University, committed to technical excellence and industry-driven research.',
    ratingAverage: 4.6,
    reviewCount: 28,

    // Granular Micro-Details for Compare Matrix
    placementDetails: {
      highestPackage: '38.5 LPA (Microsoft / DE Shaw)',
      averagePackage: '8.8 LPA (Tier-1 Tech Average: 14.5 LPA)',
      medianPackage: '7.8 LPA',
      placementRate: '94.2% across engineering branches',
      topRecruiters: ['Microsoft', 'Amazon', 'Cisco', 'Qualcomm', 'DE Shaw', 'Morgan Stanley'],
      internshipOffers: '320+ pre-placement offers (PPOs) received',
      placementTraining: 'Full 3-semester structured aptitude & DSA bootcamps',
      tier1HiresCount: 164
    },
    feeDetails: {
      tuitionAnnual: '₹65,000 (Govt-Aided) to ₹1,20,000 (Self-Finance)',
      hostelAnnual: '₹55,000 / year (Standard non-AC) to ₹85,000 / year (AC)',
      messMonthly: '₹4,200 / month (South Indian veg & non-veg options)',
      examAndLabAnnual: '₹8,500 / year',
      scholarshipsAvailable: 'State BC/MBC welfare, Merit alumni endowment, AICTE Pragati',
      roiRating: '9.4 / 10 (Very High return on annual fees)'
    },
    academicDetails: {
      studentFacultyRatio: '1:14 (Very favorable attention)',
      phdFacultyPercent: '82% of professors hold Ph.D. degrees',
      curriculumFlexibility: 'High autonomy with choice-based credit system (CBCS)',
      researchFundingAnnual: '₹14.8 Crores in sponsored industry R&D grants',
      labEquipmentGrade: 'Industry-standard Nvidia GPU cluster, CNC machines & Robotics arm',
      academicsRating: 4.8
    },
    campusDetails: {
      wifiSpeed: '1 Gbps optical fiber backbone (100 Mbps per student limit)',
      hostelCurfew: '8:30 PM for 1st-year students; 9:30 PM for seniors',
      messFoodRating: 3.8, // out of 5
      sportsComplex: 'Indoor badminton courts, synthetic basketball, cricket oval, gym',
      medicalFacility: 'PSG IMS&R 24/7 super-specialty hospital support within 2 km',
      gymAndFitness: 'Fully equipped multi-station fitness center on campus'
    },
    activityDetails: {
      annualFestName: 'KRIYA (Global technical symposium) & INVENTE',
      techClubsCount: 24,
      incubationCenter: 'PSG STEP (Science & Technology Entrepreneurial Park)',
      hackathonsOrganizedAnnual: 6,
      industryMoUs: 45
    },
    overallScore: {
      total: 94,
      placementsScore: 96,
      feesRoiScore: 92,
      academicsScore: 95,
      campusLifeScore: 90,
      badge: 'Best Placements & Industry Network'
    }
  },
  {
    id: 'col-ceg',
    slug: 'college-of-engineering-guindy',
    name: 'College of Engineering, Guindy (CEG Anna University)',
    location: 'Chennai',
    state: 'Tamil Nadu',
    collegeType: 'Government (Premier University Dept)',
    establishedYear: 1794,
    contactEmail: 'deanceg@annauniv.edu',
    contactPhone: '+91 44 2235 7004',
    websiteUrl: 'https://ceg.annauniv.edu',
    courses: ['B.E Computer Science', 'B.E Mechanical', 'B.Tech IT', 'MCA', 'B.E Electronics'],
    departments: ['Computer Science and Engineering', 'Information Technology', 'Mechanical Engineering'],
    feesMin: 35000,
    feesMax: 70000,
    feesDescription: 'Affordable government fee structure subsidized by the state.',
    placementStats: {
      highestPackage: '42.0 LPA',
      averagePackage: '9.2 LPA',
      placementRate: '92%',
      topRecruiters: ['Google', 'Adobe', 'Samsung', 'DE Shaw', 'Infosys', 'Caterpillar']
    },
    facilities: ['Heritage Campus', 'Extensive Technical Library', 'Hostel Facilities', 'Innovation Hub', 'Auditorium'],
    officialOverview: 'One of the oldest technical institutions in Asia, offering premier academic and research programs in core engineering disciplines.',
    ratingAverage: 4.7,
    reviewCount: 35,

    // Granular Micro-Details for Compare Matrix
    placementDetails: {
      highestPackage: '42.0 LPA (Google / Adobe)',
      averagePackage: '9.2 LPA (CSE / IT avg: 16.2 LPA)',
      medianPackage: '8.2 LPA',
      placementRate: '92.5% across eligible batches',
      topRecruiters: ['Google', 'Adobe', 'Samsung R&D', 'DE Shaw', 'Qualcomm', 'Amazon'],
      internshipOffers: '280+ summer internships with paid stipends',
      placementTraining: 'Centre for University-Industry Collaboration (CUIC) workshops',
      tier1HiresCount: 182
    },
    feeDetails: {
      tuitionAnnual: '₹35,000 / year (Lowest in state, govt subsidized)',
      hostelAnnual: '₹32,000 / year (Government hostel amenities)',
      messMonthly: '₹3,500 / month (Divisional cooperative mess)',
      examAndLabAnnual: '₹4,500 / year',
      scholarshipsAvailable: 'Full tuition fee waiver for first graduates & 7.5% govt quota',
      roiRating: '9.8 / 10 (Highest Return On Investment in South India)'
    },
    academicDetails: {
      studentFacultyRatio: '1:12 (Excellent professor availability)',
      phdFacultyPercent: '94% of core faculty hold Doctorates',
      curriculumFlexibility: 'State syllabus baseline with university research electives',
      researchFundingAnnual: '₹22.5 Crores in Central Government (DST, DRDO) grants',
      labEquipmentGrade: 'Centennial central computing labs, high performance computing grid',
      academicsRating: 4.9
    },
    campusDetails: {
      wifiSpeed: '500 Mbps NKN (National Knowledge Network) campus grid',
      hostelCurfew: '9:00 PM for all hostel residents',
      messFoodRating: 3.6,
      sportsComplex: 'Historic Kottur stadium, Olympic-size swimming pool, tennis courts',
      medicalFacility: 'Health Centre on-campus with resident doctors & ambulance',
      gymAndFitness: 'University gymnasium with dedicated instructors'
    },
    activityDetails: {
      annualFestName: 'Kurukshetra (UNESCO patronized tech fest) & Agni',
      techClubsCount: 32,
      incubationCenter: 'CED (Centre for Entrepreneurship Development) & TBI',
      hackathonsOrganizedAnnual: 8,
      industryMoUs: 60
    },
    overallScore: {
      total: 96,
      placementsScore: 97,
      feesRoiScore: 99,
      academicsScore: 97,
      campusLifeScore: 89,
      badge: 'Best Value for Money & Academic Heritage'
    }
  },
  {
    id: 'col-sns',
    slug: 'sns-college-of-technology',
    name: 'SNS College of Technology',
    location: 'Coimbatore',
    state: 'Tamil Nadu',
    collegeType: 'Autonomous (Private)',
    establishedYear: 2002,
    contactEmail: 'office@snsct.org',
    contactPhone: '+91 422 2666264',
    websiteUrl: 'https://snsct.org',
    courses: ['B.Tech AI & Data Science', 'B.E CSE', 'MCA', 'MBA', 'B.Tech IT'],
    departments: ['Computer Science', 'Design Thinking Hub', 'Management Studies'],
    feesMin: 85000,
    feesMax: 150000,
    feesDescription: 'Autonomous annual academic fee including design lab amenities.',
    placementStats: {
      highestPackage: '18.0 LPA',
      averagePackage: '5.2 LPA',
      placementRate: '88%',
      topRecruiters: ['Cognizant', 'Wipro', 'Accenture', 'Zoho', 'Hexaware', 'Virtusa']
    },
    facilities: ['Design Thinking Spine', 'Modern Hostels', 'IoT Labs', 'Cafeteria', 'Digital Studio'],
    officialOverview: 'First institution in India to implement Design Thinking framework across all engineering curricula.',
    ratingAverage: 4.1,
    reviewCount: 16,

    // Granular Micro-Details for Compare Matrix
    placementDetails: {
      highestPackage: '18.0 LPA (Zoho / Product firms)',
      averagePackage: '5.2 LPA (Core tech offers: 7.5 LPA)',
      medianPackage: '4.8 LPA',
      placementRate: '88.0% campus placement rate',
      topRecruiters: ['Cognizant', 'Wipro', 'Accenture', 'Zoho', 'Hexaware', 'TCS'],
      internshipOffers: '150+ project internships across Coimbatore IT park',
      placementTraining: 'SNSDT Career Development Centre bootcamps & mock interviews',
      tier1HiresCount: 42
    },
    feeDetails: {
      tuitionAnnual: '₹85,000 to ₹1,50,000 / year (Private autonomous slab)',
      hostelAnnual: '₹75,000 / year (Modern attached washroom rooms)',
      messMonthly: '₹4,800 / month (Multi-cuisine student food court)',
      examAndLabAnnual: '₹10,500 / year',
      scholarshipsAvailable: 'Sports quota fee concession, SNS Merit scholarship for 90%+ in 12th',
      roiRating: '8.1 / 10 (Good for regional placement opportunities)'
    },
    academicDetails: {
      studentFacultyRatio: '1:16',
      phdFacultyPercent: '58% of faculty holding Ph.D. degrees',
      curriculumFlexibility: '5-pillar Design Thinking embedded in every course module',
      researchFundingAnnual: '₹3.2 Crores in seed venture funding & MSME grants',
      labEquipmentGrade: 'Modern Apple Mac design lab, IoT sensors lab, AR/VR suite',
      academicsRating: 4.2
    },
    campusDetails: {
      wifiSpeed: '250 Mbps campus Wi-Fi network with hostel coverage',
      hostelCurfew: '8:00 PM for female students; 8:30 PM for male students',
      messFoodRating: 4.1, // out of 5
      sportsComplex: 'Turf football ground, volleyball courts, indoor games lounge',
      medicalFacility: 'Campus clinic with ambulance and primary care nurse',
      gymAndFitness: 'Fitness studio with cardio & strength training equipment'
    },
    activityDetails: {
      annualFestName: 'SNS INNOFEST & Design Thinking Hack-A-Thon',
      techClubsCount: 18,
      incubationCenter: 'SNS iHub (Incubation Center & Maker Space)',
      hackathonsOrganizedAnnual: 4,
      industryMoUs: 28
    },
    overallScore: {
      total: 84,
      placementsScore: 82,
      feesRoiScore: 81,
      academicsScore: 85,
      campusLifeScore: 88,
      badge: 'Best Design Thinking & Modern Hostels'
    }
  }
];

export const INITIAL_REVIEWS: CollegeReview[] = [
  {
    id: 'rev-psg-1',
    collegeId: 'col-psg',
    userId: 'user-student-demo',
    reviewerType: 'student',
    authorName: 'Verified Campus Student',
    authorUsername: 'student_scholar',
    isAnonymous: false,
    overallRating: 5,
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
    experience: 'PSG Tech provides a rigorous engineering foundation with immense industry exposure. Coding labs and hackathon culture are top notch. Placements are well organized.',
    pros: ['Top tech recruiters visit campus', 'Practical lab culture', 'Very supportive alumni network'],
    cons: ['Strict attendance criteria', 'Demanding exam schedule'],
    advice: 'Start practicing data structures and algorithms from 2nd year and participate actively in technical clubs.',
    recommendation: true,
    course: 'B.Tech Computer Science',
    department: 'Computer Science',
    batch: '2023',
    createdAt: '2026-02-14T10:30:00Z',
    institutionReply: {
      officialName: 'Dean of Student Affairs (PSG Tech)',
      repliedAt: '2026-02-16T12:00:00Z',
      text: 'Thank you for your valuable feedback. We are continuously enhancing our curriculum with modern AI and Cloud electives.'
    }
  },
  {
    id: 'rev-ceg-1',
    collegeId: 'col-ceg',
    userId: 'user-alumni-demo',
    reviewerType: 'alumni',
    authorName: 'Alumni Industry Mentor',
    authorUsername: 'alumni_mentor',
    isAnonymous: false,
    overallRating: 5,
    dimensions: {
      academics: 5,
      faculty: 5,
      placements: 5,
      infrastructure: 4,
      hostel: 3,
      campusLife: 5,
      valueForMoney: 5,
      studentExperience: 5
    },
    title: 'Historic legacy with unrivaled ROI and campus life',
    experience: 'The sheer autonomy, technical freedom, and peer quality at CEG Anna University are unmatched. Extremely low tuition fee paired with top-tier product company offers.',
    pros: ['Lowest fee in the state', 'Premier Tier-1 placement recruiters', 'Vibrant tech fests (Kurukshetra)'],
    cons: ['Hostel amenities are vintage', 'Administrative processes can be bureaucratic'],
    advice: 'Make full use of CUIC placement training and leverage the massive global alumni network.',
    recommendation: true,
    course: 'B.E Computer Science',
    department: 'Computer Science and Engineering',
    batch: '2022',
    createdAt: '2026-01-20T14:00:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-live-1',
    authorId: 'user-student-demo',
    authorUsername: 'student_scholar',
    authorName: 'Verified Campus Student',
    authorRole: 'student',
    authorHeadline: 'B.Tech CSE @ PSG Tech | Full-Stack & Systems Enthusiast',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Thrilled to share that our team won 1st Place at the Tamil Nadu State Smart Engineering Hackathon! 🏆\n\nWe built an edge AI IoT sensor node for precision agriculture with real-time inference. Huge gratitude to our faculty mentors and the campus computing lab for the round-the-clock compute access. Juniors looking to participate next semester: registrations open next Monday!',
    topic: 'Hackathons & Projects',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-alumni-demo', 'user-faculty-demo'],
    likesCount: 56,
    commentsCount: 2,
    sharesCount: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'positive',
    sentimentScore: 0.88,
    toxicityScore: 3,
    isSensitive: false,
    aiModelMetadata: 'distilbert-sst2 + toxic-bert + nsfwjs-v2',
    comments: [
      {
        id: 'c-1',
        postId: 'post-live-1',
        authorId: 'user-alumni-demo',
        authorUsername: 'alumni_mentor',
        authorName: 'Alumni Industry Mentor',
        authorRole: 'alumni',
        authorHeadline: 'Senior Software Engineer @ Microsoft',
        isVerifiedAuthor: true,
        content: 'Fantastic work! Edge optimization and IoT inference are extremely high-demand skills in the industry right now. Keep pushing!',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        likesCount: 8
      },
      {
        id: 'c-2',
        postId: 'post-live-1',
        authorId: 'user-faculty-demo',
        authorUsername: 'academic_faculty',
        authorName: 'Dr. Academic Faculty Guide',
        authorRole: 'faculty',
        authorHeadline: 'Professor of Computer Science',
        isVerifiedAuthor: true,
        content: 'Very proud of your perseverance and clean engineering execution. Keep up the high standard.',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        likesCount: 5
      }
    ]
  },
  {
    id: 'post-live-sensitive',
    authorId: 'user-student-demo',
    authorUsername: 'anonymous_scholar',
    authorName: 'Anonymous Student',
    authorRole: 'student',
    authorHeadline: 'Anonymous Student Contributor',
    isVerifiedAuthor: false,
    isAnonymous: true,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Campus Debate: The new hostel gate curfew and strict timing enforcement is completely frustrating and unfair. Several students are saying this administration is acting like a complete scam college! We demand a transparent student council forum to address these arbitrary policies.',
    topic: 'Campus Grievance',
    likes: [],
    likesCount: 22,
    commentsCount: 0,
    sharesCount: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    moderationStatus: 'sensitive',
    sentiment: 'ragebait',
    sentimentScore: -0.74,
    toxicityScore: 56,
    isSensitive: true,
    sensitiveReason: 'Sensationalist ragebait discourse and elevated hostility (unitary/toxic-bert score: 56%)',
    aiModelMetadata: 'distilbert-sst2 + unitary/toxic-bert',
    comments: []
  },
  {
    id: 'post-live-2',
    authorId: 'user-alumni-demo',
    authorUsername: 'alumni_mentor',
    authorName: 'Alumni Industry Mentor',
    authorRole: 'alumni',
    authorHeadline: 'Senior Software Engineer @ Microsoft | Campus Alumnus',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Tips for upcoming tier-1 product campus placement drives:\n\n1. Stop grinding LeetCode blindly without understanding core algorithmic patterns (Two Pointers, Sliding Window, Monotonic Stack, Dynamic Programming).\n2. Write modular, clean code with descriptive variable names in live technical rounds.\n3. Be prepared to explain trade-offs between Space and Time complexity with concrete examples.\n\nOpen for mock technical interviews and resume reviews this Saturday. Drop a comment with your target domain!',
    topic: 'Alumni Mentorship',
    likes: ['user-student-demo'],
    likesCount: 112,
    commentsCount: 1,
    sharesCount: 38,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'positive',
    sentimentScore: 0.76,
    toxicityScore: 4,
    isSensitive: false,
    aiModelMetadata: 'distilbert-sst2 + toxic-bert',
    comments: [
      {
        id: 'c-3',
        postId: 'post-live-2',
        authorId: 'user-student-demo',
        authorUsername: 'student_scholar',
        authorName: 'Verified Campus Student',
        authorRole: 'student',
        authorHeadline: 'B.Tech CSE @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Super grateful for this guidance! Would love to get my resume reviewed for backend systems roles.',
        createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
        likesCount: 4
      }
    ]
  },
  {
    id: 'post-live-3',
    authorId: 'user-inst-demo',
    authorUsername: 'institution_admin',
    authorName: 'PSG Tech Official Administration',
    authorRole: 'institution',
    authorHeadline: 'Official Campus Administrative Desk',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: '📢 Campus Placement Season Update: 45+ premier technology organizations are scheduled for on-campus drives over the next four weeks. Students are advised to verify their attendance eligibility and update their project repositories on the college placement portal before Friday.',
    topic: 'Official Announcements',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-student-demo', 'user-alumni-demo'],
    likesCount: 145,
    commentsCount: 0,
    sharesCount: 52,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'neutral',
    sentimentScore: 0.15,
    toxicityScore: 2,
    isSensitive: false,
    aiModelMetadata: 'distilbert-sst2 + toxic-bert + nsfwjs-v2',
    comments: []
  },
  {
    id: 'post-live-4',
    authorId: 'user-student-demo',
    authorUsername: 'student_scholar',
    authorName: 'Verified Campus Student',
    authorRole: 'student',
    authorHeadline: 'B.Tech CSE @ PSG Tech',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Just deployed our open-source campus community & college comparison matrix! Built with Next.js 16, TypeScript, and responsive Apple-style cards. Zero lag, full role-based permissions, and confidential grievance pipelines to institutions. Feedback welcomed! 🚀 #WebDev #NextJS #OpenSource',
    topic: 'Student Project Showcase',
    likes: ['user-alumni-demo'],
    likesCount: 78,
    commentsCount: 0,
    sharesCount: 19,
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'positive',
    sentimentScore: 0.82,
    toxicityScore: 3,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: []
  },
  {
    id: 'post-seed-neg-hostel',
    authorId: 'user-arun',
    authorUsername: 'arun_prakash',
    authorName: 'Arun Prakash',
    authorRole: 'student',
    authorHeadline: 'MCA Final Year @ PSG Tech',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Constructive Feedback on Hostel D Block: The Wi-Fi speeds drop drastically after 9 PM, making it really difficult to submit online lab assignments. Also, water heater maintenance on the 3rd floor has been pending for two weeks. Hope the hostel committee resolves this soon.',
    topic: 'Hostel',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-student-demo'],
    likesCount: 34,
    commentsCount: 2,
    sharesCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'negative',
    sentimentScore: -0.45,
    toxicityScore: 6,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: [
      {
        id: 'c-seed-1',
        postId: 'post-seed-neg-hostel',
        authorId: 'user-junith',
        authorUsername: 'junith_s',
        authorName: 'Junith S',
        authorRole: 'student',
        authorHeadline: 'B.Tech AI & Data Science @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Same issue in C block as well. We submitted a collective request to the warden desk this morning.',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        likesCount: 7
      }
    ]
  },
  {
    id: 'post-seed-pos-placement',
    authorId: 'user-karthika',
    authorUsername: 'karthika_amazon',
    authorName: 'Karthika R',
    authorRole: 'alumni',
    authorHeadline: 'Software Engineer II @ Amazon | PSG Alumna (2022)',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Huge congratulations to the 2026 batch for securing 120+ Day-1 super dream offers! Our placement training cell and mock technical interview rounds really made a huge difference. Excited to see so many brilliant engineers joining top tier teams.',
    topic: 'Placements',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-student-demo', 'user-arun', 'user-junith'],
    likesCount: 168,
    commentsCount: 1,
    sharesCount: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'positive',
    sentimentScore: 0.92,
    toxicityScore: 2,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: [
      {
        id: 'c-seed-2',
        postId: 'post-seed-pos-placement',
        authorId: 'user-student-demo',
        authorUsername: 'student_scholar',
        authorName: 'Verified Campus Student',
        authorRole: 'student',
        authorHeadline: 'B.Tech CSE @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Thank you Karthika akka! Your mock interview session last month was a game changer for my preparation.',
        createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        likesCount: 12
      }
    ]
  },
  {
    id: 'post-seed-neg-academics',
    authorId: 'user-junith',
    authorUsername: 'junith_s',
    authorName: 'Junith S',
    authorRole: 'student',
    authorHeadline: 'B.Tech AI & Data Science @ PSG Tech',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Honest review on our 6th sem schedule: Having three continuous laboratory exams right before midterms is overwhelming and difficult to manage with final capstone research submissions. A buffer reading day between theory and practicals would really help students perform better.',
    topic: 'Academics',
    likes: ['user-student-demo', 'user-arun'],
    likesCount: 89,
    commentsCount: 0,
    sharesCount: 16,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'negative',
    sentimentScore: -0.38,
    toxicityScore: 5,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: []
  },
  {
    id: 'post-seed-neg-canteen',
    authorId: 'user-student-demo',
    authorUsername: 'student_scholar',
    authorName: 'Verified Campus Student',
    authorRole: 'student',
    authorHeadline: 'B.Tech CSE @ PSG Tech',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Campus Canteen Feedback: The lunch crowd management at the main food court has become chaotic this term. Wait times exceed 25 minutes during the short lunch interval, and meal trays often run out. Adding a digital pre-order token system on our student portal would save everyone valuable time.',
    topic: 'Campus Life',
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-arun', 'user-junith'],
    likesCount: 62,
    commentsCount: 1,
    sharesCount: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'negative',
    sentimentScore: -0.42,
    toxicityScore: 4,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: [
      {
        id: 'c-seed-3',
        postId: 'post-seed-neg-canteen',
        authorId: 'user-arun',
        authorUsername: 'arun_prakash',
        authorName: 'Arun Prakash',
        authorRole: 'student',
        authorHeadline: 'MCA Final Year @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Fully agreed. We barely get 15 minutes to eat after standing in queue. The token system idea is solid.',
        createdAt: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
        likesCount: 5
      }
    ]
  },
  {
    id: 'post-seed-pos-faculty',
    authorId: 'user-faculty-demo',
    authorUsername: 'academic_faculty',
    authorName: 'Dr. Academic Faculty Guide',
    authorRole: 'faculty',
    authorHeadline: 'Professor of Computer Science',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Open Research Advisory: Our Distributed Systems & Cloud Computing laboratory has 4 open funded research assistantships for undergraduate pre-final year students. Focus areas: Kubernetes edge scheduling, distributed consensus, and model serving efficiency. Interested students can drop by Lab 304 during office hours.',
    topic: 'Academics',
    likes: ['user-student-demo', 'user-karthika'],
    likesCount: 95,
    commentsCount: 0,
    sharesCount: 28,
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    moderationStatus: 'normal',
    sentiment: 'positive',
    sentimentScore: 0.85,
    toxicityScore: 2,
    isSensitive: false,
    aiModelMetadata: 'campus-lenz-ai + distilbert-sst2 + toxic-bert',
    comments: []
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Tamil Nadu Student & Alumni Mentorship Circle',
    description: 'Direct knowledge sharing, resume reviews, and placement referrals across premier engineering colleges.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    creatorId: 'user-alumni-demo',
    creatorRole: 'alumni',
    isPrivate: false,
    membersCount: 240,
    category: 'mentoring',
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'comm-2',
    name: 'Competitive Programming & Hackathons Network',
    description: 'Cross-college collaboration for Smart India Hackathons, ACM ICPC, and open-source project builds.',
    creatorId: 'user-student-demo',
    creatorRole: 'student',
    isPrivate: false,
    membersCount: 195,
    category: 'general',
    createdAt: '2026-02-05T00:00:00Z'
  }
];

export const INITIAL_DISCORD_SERVERS: DiscordServer[] = [
  {
    id: 'server-psg-tech',
    name: 'PSG Tech Official Campus Server',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    institutionOwnerId: 'user-inst-demo',
    description: 'Official institution-governed campus server. Structured department channels, placement guidance, and ragebait-shielded student discussion.',
    memberCount: 840,
    antiRagebaitRules: [
      'Zero harassment, name-calling, or inflammatory rhetoric.',
      'Constructive academic criticism only with factual references.',
      'Anti-ragebait slowmode enabled for constructive collegiate discussion.',
      'Faculty grievances must be routed via Private Grievance to Institution ID.'
    ],
    channels: [
      {
        id: 'ch-announcements',
        name: 'Official Announcements',
        description: 'Direct university broadcasts, exam dates, and semester schedules.',
        type: 'announcements',
        isRagebaitProtected: true,
        isAnnouncementOnly: true,
        memberCount: 840
      },
      {
        id: 'ch-anti-ragebait-forum',
        name: 'ragebait-shielded-campus-hall',
        description: 'Special discussion space strictly moderated to prevent toxicity.',
        type: 'anti-ragebait',
        isRagebaitProtected: true,
        memberCount: 790
      },
      {
        id: 'ch-cse-mca-dept',
        name: 'dept-computer-science-engineering',
        description: 'Department projects, syllabus inquiries, and research lab coordination.',
        type: 'department',
        isRagebaitProtected: false,
        memberCount: 312
      },
      {
        id: 'ch-placement-desk',
        name: 'placement-interview-intel',
        description: 'Real-time company interview reports, questions, and alumni tips.',
        type: 'placements',
        isRagebaitProtected: true,
        memberCount: 650
      },
      {
        id: 'ch-alumni-mentoring',
        name: 'alumni-career-guidance',
        description: 'Alumni sharing industry experiences and advice for junior students.',
        type: 'alumni-guide',
        isRagebaitProtected: false,
        memberCount: 420
      }
    ]
  },
  {
    id: 'server-ceg-hub',
    name: 'CEG Anna University Campus Grid',
    collegeId: 'col-ceg',
    collegeName: 'College of Engineering, Guindy (CEG)',
    institutionOwnerId: 'user-inst-demo',
    description: 'Official campus server for Anna University CEG students, alumni mentors, and faculty.',
    memberCount: 650,
    antiRagebaitRules: [
      'Maintain collegiate decorum at all times.',
      'Strict prohibition of partisan hostility or unverified rumors.'
    ],
    channels: [
      {
        id: 'ch-ceg-announcements',
        name: 'CEG Official Broadcasts',
        description: 'Official Anna University & CEG Dean office announcements.',
        type: 'announcements',
        isRagebaitProtected: true,
        isAnnouncementOnly: true,
        memberCount: 650
      },
      {
        id: 'ch-ceg-general',
        name: 'campus-general',
        description: 'General student discussions and campus life questions.',
        type: 'general',
        isRagebaitProtected: false,
        memberCount: 580
      },
      {
        id: 'ch-ceg-ragebait',
        name: 'moderated-student-concerns',
        description: 'Shielded channel for campus queries with strict moderation.',
        type: 'anti-ragebait',
        isRagebaitProtected: true,
        memberCount: 430
      }
    ]
  }
];

export const INITIAL_SERVER_MESSAGES: ServerMessage[] = [
  {
    id: 'smsg-1',
    channelId: 'ch-announcements',
    authorId: 'user-inst-demo',
    authorName: 'PSG Tech Official Administration',
    authorRole: 'institution',
    authorHeadline: 'Official Administrative Desk',
    content: '🚨 Notice: End-semester lab practical schedules for engineering departments have been published on the student portal. Exam registrations close this Friday at 5:00 PM.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isFlaggedForRagebait: false
  },
  {
    id: 'smsg-2',
    channelId: 'ch-placement-desk',
    authorId: 'user-alumni-demo',
    authorName: 'Alumni Industry Mentor',
    authorRole: 'alumni',
    authorHeadline: 'Senior Software Engineer @ Microsoft',
    content: 'For everyone preparing for tier-1 tech drives: Expect 1 online assessment on HackerRank (Array, Tree/Graph, and DP) followed by rounds testing clean code, edge cases, and time/space complexity.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isFlaggedForRagebait: false
  },
  {
    id: 'smsg-3',
    channelId: 'ch-anti-ragebait-forum',
    authorId: 'user-student-demo',
    authorName: 'Verified Campus Student',
    authorRole: 'student',
    authorHeadline: 'B.Tech CSE @ PSG Tech',
    content: 'Constructive reminder for hostel residents: If facing Wi-Fi latency during peak study hours in Hostel Block 3, please register the room number on the IT welfare desk so APs can be rebalanced.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isFlaggedForRagebait: false
  }
];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm-mock-1',
    conversationId: 'conv-user-alumni-demo-user-student-demo',
    senderId: 'user-student-demo',
    receiverId: 'user-alumni-demo',
    content: 'Hello Karthika! I saw your guidance post on tier-1 engineering drives. Could you give me advice on how to structure system design answers for junior roles?',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: true,
    liked: true
  },
  {
    id: 'dm-mock-2',
    conversationId: 'conv-user-alumni-demo-user-student-demo',
    senderId: 'user-alumni-demo',
    receiverId: 'user-student-demo',
    content: 'Hi Junith! For junior roles, focus on: 1) Requirements clarification (functional & non-functional), 2) High-level data flow (client -> gateway -> service -> DB), and 3) Addressing bottlenecks (caching, indexing, pagination). Would love to review a sample mock design with you!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isRead: true,
    liked: false
  },
  {
    id: 'dm-mock-3',
    conversationId: 'conv-user-faculty-demo-user-student-demo',
    senderId: 'user-student-demo',
    receiverId: 'user-faculty-demo',
    content: 'Good afternoon Dr. Arunkumar, will tomorrow’s distributed algorithms lab review cover the Raft consensus simulation module?',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
    liked: false
  },
  {
    id: 'dm-mock-4',
    conversationId: 'conv-user-faculty-demo-user-student-demo',
    senderId: 'user-faculty-demo',
    receiverId: 'user-student-demo',
    content: 'Yes Junith. Please make sure your team has the election timeout test cases committed to the lab repository before the slot starts.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    liked: true
  },
  {
    id: 'dm-mock-5',
    conversationId: 'conv-user-alumni-demo-user-inst-demo',
    senderId: 'user-alumni-demo',
    receiverId: 'user-inst-demo',
    content: 'Respected Administration, our alumni chapter would like to sponsor a ₹1,00,000 prize pool for the upcoming Inter-College Hackathon. Whom should we contact for formal MoA?',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    isRead: true,
    liked: true
  },
  {
    id: 'dm-mock-6',
    conversationId: 'conv-user-alumni-demo-user-inst-demo',
    senderId: 'user-inst-demo',
    receiverId: 'user-alumni-demo',
    content: 'Thank you for this wonderful initiative! Please connect with the Industry Relations cell at industry.cell@psgtech.edu and we will initiate the MoU.',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    isRead: true,
    liked: false
  }
];

export const INITIAL_GRIEVANCE_REPORTS: PrivateGrievanceReport[] = [
  {
    id: 'grv-1',
    studentId: 'user-student-demo',
    studentName: 'Confidential Student ID',
    isAnonymousToFaculty: true,
    targetInstitutionId: 'col-psg',
    collegeName: 'PSG College of Technology',
    category: 'lab_infrastructure',
    targetFacultyName: 'Central Lab Coordinator',
    subjectOrCourse: 'Central Computing Facility GPU Allocation',
    detailedComplaint: 'High-performance workstation access in the GPU research cluster has experienced scheduling conflicts with regular lab sessions. Requesting designated evening slots for capstone project training.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'action_taken',
    institutionRemarks: 'Lab slots reconfigured. Additional evening research window (5:30 PM - 8:30 PM) activated starting this Monday.'
  },
  {
    id: 'grv-2',
    studentId: 'user-arun',
    studentName: 'Confidential Student ID',
    isAnonymousToFaculty: true,
    targetInstitutionId: 'col-psg',
    collegeName: 'PSG College of Technology',
    category: 'classroom_issue',
    targetFacultyName: 'Department Coordinator',
    subjectOrCourse: 'Advanced Data Structures Lab (MCA-204)',
    detailedComplaint: 'Projector in CSE Room 304 flickers intermittently during algorithmic code walkthroughs.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'under_investigation',
    institutionRemarks: 'Maintenance work order #4102 logged with campus electrical and IT team.'
  }
];

// ------------------------------------------------------------------------
// FEATURE MOCK DATASETS
// ------------------------------------------------------------------------

export const INITIAL_STUDY_ROOMS: StudyRoom[] = [
  {
    id: 'study-1',
    title: 'LeetCode Grind: Blind 75 Trees & Dynamic Programming',
    subject: 'Algorithms & Coding Interview Prep',
    activePeerCount: 14,
    maxParticipants: 30,
    hostName: 'Verified Campus Student',
    roomTag: 'LeetCode'
  },
  {
    id: 'study-2',
    title: 'GATE 2027 CS Core Marathon: OS, DBMS & Networks',
    subject: 'National Exam Preparation',
    activePeerCount: 9,
    maxParticipants: 25,
    hostName: 'Sanjay Kumar',
    roomTag: 'GATE'
  },
  {
    id: 'study-3',
    title: 'Distributed Systems: Raft, Paxos & Consensus Deep Dive',
    subject: 'CS402 Exam & Capstone Study',
    activePeerCount: 18,
    maxParticipants: 40,
    hostName: 'Aarav Patel',
    roomTag: 'Deep Dive'
  },
  {
    id: 'study-4',
    title: 'Machine Learning & Math for AI: Linear Algebra & Matrix Calculus',
    subject: 'AI & Data Science Prep',
    activePeerCount: 7,
    maxParticipants: 20,
    hostName: 'Pooja Iyer',
    roomTag: 'Exam Prep'
  }
];

export const INITIAL_COURSE_QUESTIONS: CourseQuestion[] = [
  {
    id: 'q-1',
    courseCode: 'CS301',
    courseName: 'Data Structures & Algorithms',
    title: 'Why is Red-Black Tree maximum height bounded strictly by 2 * log2(n + 1)?',
    content: 'I understand the property that no two red nodes can appear consecutively, but can someone explain the mathematical derivation why the longest path is at most twice the shortest path?',
    codeSnippet: `// Property 4: If a node is red, both children are black
// Property 5: For each node, all paths to descendants have the same black-height bh(x)
int black_height(Node* root);`,
    isAnonymous: false,
    authorId: 'user-student-demo',
    authorName: 'Verified Campus Student',
    upvotes: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    answers: [
      {
        id: 'ans-1',
        questionId: 'q-1',
        authorId: 'user-faculty-demo',
        authorName: 'Dr. Academic Faculty Guide',
        authorRole: 'faculty',
        content: 'Excellent question! Every path from root to leaf has the same black-height bh(x). The shortest possible path contains only black nodes (length = bh(x)). Because no two red nodes can be adjacent, the longest possible path must alternate red and black nodes, giving a maximum length of 2 * bh(x). By induction, a subtree with black-height bh contains at least 2^bh - 1 internal nodes, leading directly to height <= 2 * log2(n + 1).',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        upvotes: 24,
        isFacultyEndorsed: true,
        endorsedByName: 'Dr. Academic Faculty Guide'
      }
    ]
  },
  {
    id: 'q-2',
    courseCode: 'CS402',
    courseName: 'Distributed Systems',
    title: 'How does Raft avoid split-brain scenario during transient network partitions?',
    content: 'When a network partition isolates the leader with a minority of nodes, how does the majority partition elect a new leader and prevent stale client writes from causing inconsistencies?',
    isAnonymous: true,
    authorId: 'anonymous-student',
    authorName: 'Anonymous Student',
    upvotes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    answers: [
      {
        id: 'ans-2',
        questionId: 'q-2',
        authorId: 'user-alumni-demo',
        authorName: 'Alumni Industry Mentor',
        authorRole: 'alumni',
        content: 'In Raft, a leader requires a strict majority (quorum: n/2 + 1) to commit an entry. The partitioned minority leader will never receive a majority of AppendEntries confirmations, so client writes to that partition remain uncommitted. Meanwhile, the majority side has quorum to elect a term-incremented leader and commit new entries. Once the partition heals, the old leader receives higher term heartbeats and steps down.',
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        upvotes: 15,
        isFacultyEndorsed: false
      }
    ]
  }
];

export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'm-1',
    title: 'CLRS Introduction to Algorithms (4th Edition - Hardcover)',
    category: 'textbook',
    price: 650,
    isFreeOrSwap: false,
    condition: 'like_new',
    sellerId: 'user-alumni-demo',
    sellerName: 'Alumni Industry Mentor',
    sellerRole: 'alumni',
    sellerContact: 'alumni@campuslenz.edu',
    isReserved: false,
    createdAt: '2026-09-25T10:00:00Z'
  },
  {
    id: 'm-2',
    title: 'Texas Instruments TI-Nspire CX II Graphing Calculator',
    category: 'equipment',
    price: 1200,
    isFreeOrSwap: false,
    condition: 'good',
    sellerId: 'user-student-demo',
    sellerName: 'Verified Campus Student',
    sellerRole: 'student',
    sellerContact: 'student@campuslenz.edu',
    isReserved: false,
    createdAt: '2026-09-26T14:30:00Z'
  },
  {
    id: 'm-3',
    title: 'Complete Handwritten Semester 6 Distributed Systems & OS Notes',
    category: 'notes',
    price: 0,
    isFreeOrSwap: true,
    condition: 'like_new',
    sellerId: 'user-student-demo',
    sellerName: 'Verified Campus Student',
    sellerRole: 'student',
    sellerContact: 'student@campuslenz.edu',
    isReserved: false,
    createdAt: '2026-09-27T08:00:00Z'
  },
  {
    id: 'm-4',
    title: 'Raspberry Pi 4 Model B (8GB) with Armor Heatsink & 64GB MicroSD',
    category: 'electronics',
    price: 2600,
    isFreeOrSwap: false,
    condition: 'like_new',
    sellerId: 'user-student-demo',
    sellerName: 'Verified Campus Student',
    sellerRole: 'student',
    sellerContact: 'student@campuslenz.edu',
    isReserved: false,
    createdAt: '2026-09-24T18:00:00Z'
  }
];

export const INITIAL_ASSIGNMENTS: AssignmentTask[] = [
  {
    id: 'task-1',
    title: 'Implement Raft Consensus Leader Election in Go',
    courseCode: 'CS402',
    dueDate: 'Tomorrow, 11:59 PM',
    urgency: 'urgent',
    isCompleted: false,
    points: 100
  },
  {
    id: 'task-2',
    title: 'Solve 10 LeetCode Mediums on Graph & BFS/DFS',
    courseCode: 'CS301',
    dueDate: 'Oct 03, 2026',
    urgency: 'medium',
    isCompleted: true,
    points: 50
  },
  {
    id: 'task-3',
    title: 'Submit Final Research Capstone Project Synopsis',
    courseCode: 'CS499',
    dueDate: 'Oct 12, 2026',
    urgency: 'low',
    isCompleted: false,
    points: 200
  }
];

export const INITIAL_EXAMS: ExamMilestone[] = [
  {
    id: 'exam-1',
    courseCode: 'CS402',
    examName: 'Distributed Systems Mid-Semester Exam',
    examDate: 'Oct 14, 2026',
    venue: 'Hall 302, Academic Block A',
    remainingDays: 17
  },
  {
    id: 'exam-2',
    courseCode: 'CS301',
    examName: 'Advanced Data Structures & Algorithms Lab Viva',
    examDate: 'Oct 22, 2026',
    venue: 'Turing Computing Lab 2',
    remainingDays: 25
  },
  {
    id: 'exam-3',
    courseCode: 'CS410',
    examName: 'Compiler Design Theory End-Semester Exam',
    examDate: 'Nov 05, 2026',
    venue: 'Main Auditorium',
    remainingDays: 39
  }
];

export const INITIAL_MENTORSHIP_SLOTS: MentorshipSlot[] = [
  {
    id: 'slot-1',
    alumniId: 'user-alumni-demo',
    alumniName: 'Alumni Industry Mentor',
    alumniCompany: 'Microsoft',
    topic: 'resume_review',
    dateString: 'Sep 29, 2026',
    timeString: '6:00 PM - 6:30 PM',
    isBooked: false
  },
  {
    id: 'slot-2',
    alumniId: 'user-alumni-demo',
    alumniName: 'Alumni Industry Mentor',
    alumniCompany: 'Microsoft',
    topic: 'mock_interview',
    dateString: 'Oct 01, 2026',
    timeString: '7:00 PM - 7:45 PM',
    isBooked: true,
    bookedByStudentId: 'user-student-demo',
    bookedByStudentName: 'Verified Campus Student',
    notes: 'System Design for high-scale URL shortener with Redis caching'
  },
  {
    id: 'slot-3',
    alumniId: 'user-alumni-demo',
    alumniName: 'Alumni Industry Mentor',
    alumniCompany: 'Microsoft',
    topic: 'career_roadmap',
    dateString: 'Oct 04, 2026',
    timeString: '5:30 PM - 6:00 PM',
    isBooked: false
  }
];

export const INITIAL_ALUMNI_REFERRALS: AlumniJobReferral[] = [
  {
    id: 'ref-1',
    alumniId: 'user-alumni-demo',
    alumniName: 'Alumni Industry Mentor',
    company: 'Microsoft',
    roleTitle: 'Software Development Engineer (SDE-1)',
    jobType: 'Full-Time',
    location: 'Bengaluru / Hyderabad (Hybrid)',
    minGpa: 8.0,
    batchEligible: '2025 - 2026',
    description: 'Looking to refer passionate backend/distributed systems graduates proficient in C++, C# or Java with solid algorithms foundations.',
    referralRequestsCount: 8,
    createdAt: '2026-09-24T12:00:00Z'
  },
  {
    id: 'ref-2',
    alumniId: 'user-alumni-demo',
    alumniName: 'Alumni Industry Mentor',
    company: 'Google',
    roleTitle: 'Associate Cloud Engineer Intern',
    jobType: 'Internship',
    location: 'Bengaluru',
    minGpa: 8.5,
    batchEligible: '2026 - 2027',
    description: 'Summer internship opening on the Cloud Infrastructure and Kubernetes cluster management team. Strong OS and Networking basics expected.',
    referralRequestsCount: 14,
    createdAt: '2026-09-26T15:00:00Z'
  }
];

export const INITIAL_REFERRAL_REQUESTS: ReferralRequest[] = [
  {
    id: 'req-1',
    referralId: 'ref-1',
    studentId: 'user-student-demo',
    studentName: 'Verified Campus Student',
    studentGpa: 8.92,
    resumeLink: 'https://campuslenz.edu/resumes/verified_student_sde.pdf',
    note: 'Completed distributed cache project and solved 450+ LeetCode problems. Looking forward to interviewing for SDE-1.',
    status: 'pending',
    submittedAt: '2026-09-26T18:00:00Z'
  }
];

export const INITIAL_AMA_EVENTS: IndustryAMAEvent[] = [
  {
    id: 'ama-1',
    hostId: 'user-alumni-demo',
    hostName: 'Alumni Industry Mentor',
    hostTitle: 'Senior Software Engineer',
    hostCompany: 'Microsoft',
    topic: 'Breaking into Tier-1 Tech: How to clear Coding & System Design Interviews in 2026',
    scheduledFor: 'Saturday, 7:00 PM IST',
    isLive: false,
    attendeeCount: 168,
    questions: [
      {
        id: 'ama-q-1',
        authorName: 'student_scholar',
        question: 'How critical is open-source contribution versus competitive programming for campus placements?',
        upvotes: 28
      },
      {
        id: 'ama-q-2',
        authorName: 'Anonymous Student',
        question: 'What is the best way to structure the first 5 minutes of a system design interview with an interviewer?',
        upvotes: 21
      }
    ]
  }
];

export const INITIAL_OFFICE_HOUR_QUEUE: OfficeHourQueueItem[] = [
  {
    id: 'q-item-1',
    studentId: 'user-student-demo',
    studentName: 'Verified Campus Student',
    courseCode: 'CS402',
    topic: 'Clarification on Paxos two-phase commit abort sequence',
    joinedAt: '12 mins ago',
    status: 'waiting'
  },
  {
    id: 'q-item-2',
    studentId: 'user-rahul',
    studentName: 'Rahul Sharma (Roll #2203)',
    courseCode: 'CS301',
    topic: 'Fibonacci Heap decrease-key amortized time proof',
    joinedAt: '28 mins ago',
    status: 'in_session'
  }
];

export const INITIAL_RESEARCH_OPENINGS: ResearchOpening[] = [
  {
    id: 'res-1',
    professorId: 'user-faculty-demo',
    professorName: 'Dr. Academic Faculty Guide',
    department: 'Computer Science & Engineering',
    title: 'Multimodal Deep Learning for Autonomous Navigation & Drone Vision',
    description: 'Funded undergraduate research position focusing on lightweight transformer models and LiDAR sensor fusion on edge devices.',
    prerequisites: 'Proficiency in PyTorch, Computer Vision, Matrix Calculus & Linux',
    stipendOrCredits: '₹12,000 / month stipend + 4 Academic Research Credits',
    minGpa: 8.2,
    status: 'open',
    applicants: [
      {
        id: 'app-1',
        studentId: 'user-student-demo',
        studentName: 'Verified Campus Student',
        studentGpa: 8.92,
        statement: 'I have built a YOLOv8 real-time object tracking project and completed Stanford CS231n coursework with top grades.',
        status: 'pending',
        appliedAt: '2 days ago'
      }
    ]
  }
];

export const INITIAL_LECTURE_MATERIALS: LectureMaterialVersion[] = [
  {
    id: 'lec-1',
    courseCode: 'CS402',
    courseName: 'Distributed Systems',
    professorName: 'Dr. Academic Faculty Guide',
    title: 'Complete Lecture Handout: Consensus, Raft, Vector Clocks & Gossip Protocols',
    version: 'v2.1',
    changelog: 'Added animated state machine diagrams for split-vote recovery and log compaction.',
    fileUrl: '/materials/cs402_consensus_v2.1.pdf',
    uploadedAt: '3 days ago',
    downloadCount: 218
  },
  {
    id: 'lec-2',
    courseCode: 'CS301',
    courseName: 'Data Structures & Algorithms',
    professorName: 'Dr. Academic Faculty Guide',
    title: 'Official Lab Manual: Graph Algorithms, Disjoint Sets & Dynamic Programming',
    version: 'v1.4',
    changelog: 'Updated benchmark test cases for Dijkstra, Bellman-Ford, and Tarjan SCC lab viva.',
    fileUrl: '/materials/cs301_lab_manual_v1.4.pdf',
    uploadedAt: '1 week ago',
    downloadCount: 384
  }
];

export const INITIAL_EMERGENCY_BROADCAST: EmergencyBroadcast = {
  id: 'bc-1',
  institutionId: 'user-inst-demo',
  institutionName: 'PSG Tech Official Administration',
  severity: 'notice',
  title: 'Extended 24/7 Library & Computing Center Hours for Upcoming Mid-Terms',
  message: 'Central Digital Library and High-Performance Compute Labs 1-4 will remain open 24/7 starting this Monday with uninterrupted power, campus Wi-Fi, and cafeteria services to support exam prep.',
  issuedAt: 'Today at 09:30 AM',
  active: true,
  targetAudiences: ['Students', 'Faculty', 'Staff']
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    adminId: 'user-admin-demo',
    adminName: 'Super System Administrator',
    actionType: 'SYSTEM_INITIALIZATION',
    targetEntity: 'Platform Core',
    details: 'Role governance matrix, E2E encryption channels, and anti-ragebait filters loaded.',
    timestamp: '2026-09-27T10:00:00Z',
    severity: 'info'
  },
  {
    id: 'log-2',
    adminId: 'user-admin-demo',
    adminName: 'Super System Administrator',
    actionType: 'EMERGENCY_BROADCAST_TRIGGERED',
    targetEntity: 'Campus Emergency Broadcast',
    details: 'PSG Tech Administration published 24/7 Library Hours advisory.',
    timestamp: '2026-09-27T12:30:00Z',
    severity: 'info'
  }
];




