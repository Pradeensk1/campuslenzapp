import {
  College,
  CollegeReview,
  Post,
  Community,
  UserProfile,
  DiscordServer,
  ServerMessage,
  PrivateGrievanceReport
} from '@/types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-arun',
    username: 'arun_prakash',
    email: 'arun@campuslenz.org',
    role: 'student',
    fullName: 'Arun Prakash',
    headline: 'MCA Student @ PSG College of Technology | Full-Stack Aspirant',
    bio: '2nd Year Master of Computer Applications student at PSG Tech. Passionate about Next.js, Cloud Architectures, and System Design.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Applications',
    course: 'MCA',
    graduationBatch: '2026',
    isVerified: true,
    followersCount: 148,
    followingCount: 92,
    followers: ['user-junith', 'user-karthik', 'user-deepak'],
    following: ['user-junith', 'user-karthik', 'user-meenakshi'],
    createdAt: '2025-08-10T00:00:00Z'
  },
  {
    id: 'user-junith',
    username: 'junith_dev',
    email: 'junith@campuslenz.org',
    role: 'student',
    fullName: 'Junith S',
    headline: 'B.Tech AI & Data Science @ PSG Tech | Competitive Programmer | Hackathon Finalist',
    bio: 'Exploring Deep Learning, LLM Agents & System Optimization. 3x Smart India Hackathon Finalist. Feel free to connect for collab!',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Artificial Intelligence & Data Science',
    course: 'B.Tech AI & DS',
    graduationBatch: '2026',
    isVerified: true,
    followersCount: 382,
    followingCount: 195,
    followers: ['user-arun', 'user-deepak', 'user-priya'],
    following: ['user-arun', 'user-karthik', 'user-meenakshi'],
    createdAt: '2025-07-01T00:00:00Z'
  },
  {
    id: 'user-karthik',
    username: 'karthik_raja',
    email: 'karthik@microsoft.com',
    role: 'alumni',
    fullName: 'Karthik Raja',
    headline: 'Software Engineer II @ Microsoft | PSG Tech Alum (Batch 2023) | Mentor',
    bio: 'Alumni of PSG Tech CSE. Currently building distributed backend systems at Microsoft. Active mentor for campus placement preparation & DSA.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    graduationBatch: '2023',
    isVerified: true,
    followersCount: 1240,
    followingCount: 310,
    followers: ['user-arun', 'user-junith', 'user-deepak', 'user-priya'],
    following: ['user-meenakshi', 'user-arun'],
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user-meenakshi',
    username: 'dr_meenakshi_staff',
    email: 'meenakshi@psgtech.edu',
    role: 'faculty',
    fullName: 'Dr. Meenakshi Sundaram',
    headline: 'Professor & Head of Computer Science @ PSG College of Technology | IEEE Senior Member',
    bio: 'Academic researcher in Distributed Computing and Machine Learning. 18+ years of teaching excellence and mentoring engineering innovators.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    course: 'Faculty / Staff',
    graduationBatch: 'Faculty',
    isVerified: true,
    followersCount: 890,
    followingCount: 120,
    followers: ['user-arun', 'user-junith', 'user-karthik'],
    following: ['user-karthik'],
    createdAt: '2023-06-20T00:00:00Z'
  },
  {
    id: 'user-deepak',
    username: 'deepak_v',
    email: 'deepak@annauniv.edu',
    role: 'student',
    fullName: 'Deepak V',
    headline: 'B.E CSE Student @ CEG Anna University | Open Source Contributor',
    bio: 'Student at College of Engineering, Guindy (CEG). Exploring Linux kernel programming, Rust, and systems engineering.',
    collegeId: 'col-ceg',
    collegeName: 'College of Engineering, Guindy (CEG)',
    department: 'Computer Science',
    course: 'B.E CSE',
    graduationBatch: '2025',
    isVerified: false,
    followersCount: 215,
    followingCount: 140,
    followers: ['user-arun', 'user-junith'],
    following: ['user-arun', 'user-karthik'],
    createdAt: '2025-02-10T00:00:00Z'
  },
  {
    id: 'user-priya',
    username: 'priya_dharshini',
    email: 'priya@snsct.org',
    role: 'student',
    fullName: 'Priya Dharshini',
    headline: 'MCA Student @ SNS College of Technology | UI/UX Designer & Web Developer',
    bio: 'Building user-centric web applications and experimenting with Design Thinking models. President of Campus Web Developers Club.',
    collegeId: 'col-sns',
    collegeName: 'SNS College of Technology',
    department: 'Computer Applications',
    course: 'MCA',
    graduationBatch: '2025',
    isVerified: true,
    followersCount: 310,
    followingCount: 180,
    followers: ['user-arun', 'user-junith'],
    following: ['user-arun', 'user-junith', 'user-karthik'],
    createdAt: '2025-03-01T00:00:00Z'
  },
  {
    id: 'user-institution-psg',
    username: 'psg_institution_admin',
    email: 'admin@psgtech.edu',
    role: 'institution',
    fullName: 'PSG Tech Official Administration',
    headline: 'Official Administrative Desk • PSG College of Technology',
    bio: 'Official university administrative channel for announcements, department server management, and verified student feedback review.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    department: 'Central Administration',
    course: 'College Management',
    graduationBatch: 'Admin Authority',
    isVerified: true,
    followersCount: 4200,
    followingCount: 15,
    followers: ['user-arun', 'user-junith', 'user-karthik', 'user-deepak', 'user-priya'],
    following: ['user-karthik'],
    createdAt: '2020-01-01T00:00:00Z'
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
    createdAt: '2020-01-01T00:00:00Z'
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
    id: 'rev-1',
    collegeId: 'col-psg',
    userId: 'user-karthik',
    reviewerType: 'alumni',
    authorName: 'Karthik Raja',
    authorUsername: 'karthik_raja',
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
    userId: 'user-arun',
    reviewerType: 'student',
    authorName: 'Arun Prakash',
    authorUsername: 'arun_prakash',
    isAnonymous: false,
    overallRating: 4.5,
    dimensions: {
      academics: 5,
      faculty: 4,
      placements: 5,
      infrastructure: 4,
      hostel: 3,
      campusLife: 4,
      valueForMoney: 5,
      studentExperience: 4
    },
    title: 'Top-tier curriculum and great coding culture',
    experience: 'The MCA program at PSG Tech is on par with B.Tech CSE curricula. High exposure to practical software engineering and active student developer circles.',
    pros: ['Very strong lab curriculum', 'Helpful seniors & alumni network'],
    cons: ['Hostel mess food can be improved', 'Strict attendance criteria'],
    advice: 'Keep a clean GitHub portfolio and solve LeetCode regularly.',
    recommendation: true,
    course: 'MCA',
    department: 'Applied Sciences & CA',
    batch: '2026',
    createdAt: '2026-03-01T09:15:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-junith-1',
    authorId: 'user-junith',
    authorUsername: 'junith_dev',
    authorName: 'Junith S',
    authorRole: 'student',
    authorHeadline: 'B.Tech AI & Data Science @ PSG Tech | Competitive Programmer',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Thrilled to share that our campus AI research team just published our paper on "Optimizing Inference on Resource-Constrained Edge Devices"! 🚀\n\nA huge thank you to Dr. Meenakshi and the PSG Tech CSE lab facilities for the continuous compute support. For 2nd and 3rd year juniors looking to get into research, the robotics & AI lab applications open next week. Don\'t miss it!',
    topic: 'Research & Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-arun', 'user-karthik', 'user-meenakshi'],
    likesCount: 42,
    commentsCount: 3,
    sharesCount: 11,
    createdAt: '2026-09-26T16:30:00Z',
    moderationStatus: 'normal',
    comments: [
      {
        id: 'c-1',
        postId: 'post-junith-1',
        authorId: 'user-karthik',
        authorUsername: 'karthik_raja',
        authorName: 'Karthik Raja',
        authorRole: 'alumni',
        authorHeadline: 'Software Engineer II @ Microsoft | PSG Tech Alum',
        isVerifiedAuthor: true,
        content: 'Brilliant work Junith! Edge optimization is extremely relevant in industry right now. Reach out if you want to test scaling metrics on Azure infrastructure.',
        createdAt: '2026-09-26T17:00:00Z',
        likesCount: 8
      },
      {
        id: 'c-2',
        postId: 'post-junith-1',
        authorId: 'user-arun',
        authorUsername: 'arun_prakash',
        authorName: 'Arun Prakash',
        authorRole: 'student',
        authorHeadline: 'MCA Student @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Congratulations Junith! Would love to learn more about the dataset used during the lab session.',
        createdAt: '2026-09-26T17:25:00Z',
        likesCount: 3
      },
      {
        id: 'c-3',
        postId: 'post-junith-1',
        authorId: 'user-meenakshi',
        authorUsername: 'dr_meenakshi_staff',
        authorName: 'Dr. Meenakshi Sundaram',
        authorRole: 'faculty',
        authorHeadline: 'Professor & Head of CSE @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Very proud of the dedication shown by the team. Keep up the high academic standards!',
        createdAt: '2026-09-26T18:10:00Z',
        likesCount: 12
      }
    ]
  },
  {
    id: 'post-karthik-1',
    authorId: 'user-karthik',
    authorUsername: 'karthik_raja',
    authorName: 'Karthik Raja',
    authorRole: 'alumni',
    authorHeadline: 'Software Engineer II @ Microsoft | PSG Tech Alum',
    isVerifiedAuthor: true,
    isAnonymous: false,
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    content: 'Tips for upcoming tier-1 product campus drives:\n\n1. Stop grinding LeetCode blindly without understanding patterns (Sliding Window, Two Pointers, Monotonic Stack).\n2. Write clean modular code with descriptive variable names in your interview rounds.\n3. Be prepared to explain trade-offs between Space and Time complexity clearly.\n\nOpen for mock interviews and resume reviews this Saturday. Drop a comment or message request with your current year!',
    topic: 'Alumni Mentorship',
    likes: ['user-arun', 'user-junith', 'user-deepak', 'user-priya'],
    likesCount: 89,
    commentsCount: 2,
    sharesCount: 24,
    createdAt: '2026-09-25T11:05:00Z',
    moderationStatus: 'normal',
    comments: [
      {
        id: 'c-4',
        postId: 'post-karthik-1',
        authorId: 'user-arun',
        authorUsername: 'arun_prakash',
        authorName: 'Arun Prakash',
        authorRole: 'student',
        authorHeadline: 'MCA Student @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'Count me in Karthik bhaiya! Sending my resume via message request.',
        createdAt: '2026-09-25T12:00:00Z',
        likesCount: 4
      },
      {
        id: 'c-5',
        postId: 'post-karthik-1',
        authorId: 'user-deepak',
        authorUsername: 'deepak_v',
        authorName: 'Deepak V',
        authorRole: 'student',
        authorHeadline: 'B.E CSE @ CEG Anna University',
        isVerifiedAuthor: false,
        content: 'Super helpful advice. Does Microsoft also focus on Low-Level Design (LLD) for fresher campus hiring?',
        createdAt: '2026-09-25T13:40:00Z',
        likesCount: 2
      }
    ]
  },
  {
    id: 'post-deepak-1',
    authorId: 'user-deepak',
    authorUsername: 'deepak_v',
    authorName: 'Deepak V',
    authorRole: 'student',
    authorHeadline: 'B.E CSE Student @ CEG Anna University',
    isVerifiedAuthor: false,
    isAnonymous: false,
    collegeId: 'col-ceg',
    collegeName: 'College of Engineering, Guindy (CEG)',
    content: 'CEG coding club is hosting a 24-hour inter-college hackathon on Distributed Systems & Web3 next month. Registrations are open to all colleges across Tamil Nadu. Teams of 2 to 4.',
    topic: 'Hackathons & Events',
    likes: ['user-arun', 'user-junith'],
    likesCount: 28,
    commentsCount: 1,
    sharesCount: 9,
    createdAt: '2026-09-24T18:20:00Z',
    moderationStatus: 'normal',
    comments: [
      {
        id: 'c-6',
        postId: 'post-deepak-1',
        authorId: 'user-junith',
        authorUsername: 'junith_dev',
        authorName: 'Junith S',
        authorRole: 'student',
        authorHeadline: 'B.Tech AI & DS @ PSG Tech',
        isVerifiedAuthor: true,
        content: 'PSG Tech AI club is registering 2 teams! Looking forward to meeting everyone in Chennai.',
        createdAt: '2026-09-24T19:10:00Z',
        likesCount: 5
      }
    ]
  },
  {
    id: 'post-anon-1',
    authorId: 'user-anon-9',
    authorUsername: 'anonymous_student',
    authorName: 'Anonymous Student',
    authorRole: 'student',
    authorHeadline: 'Current Student • Confidential Review',
    isVerifiedAuthor: false,
    isAnonymous: true,
    collegeId: 'col-sns',
    collegeName: 'SNS College of Technology',
    content: 'Honest update on hostel facilities: While the design thinking labs and academic classrooms are top notch, the Block B hostel Wi-Fi latency needs serious improvement during contest hours. Can the student council take this up in next month\'s faculty meeting?',
    topic: 'Hostel & Campus Life',
    likes: ['user-priya'],
    likesCount: 19,
    commentsCount: 1,
    sharesCount: 2,
    createdAt: '2026-09-26T14:10:00Z',
    moderationStatus: 'normal',
    comments: [
      {
        id: 'c-7',
        postId: 'post-anon-1',
        authorId: 'user-priya',
        authorUsername: 'priya_dharshini',
        authorName: 'Priya Dharshini',
        authorRole: 'student',
        authorHeadline: 'MCA Student @ SNS CT',
        isVerifiedAuthor: true,
        content: 'Already scheduled for discussion in the IT committee meeting this Tuesday. New 5GHz APs are planned for installation.',
        createdAt: '2026-09-26T15:00:00Z',
        likesCount: 6
      }
    ]
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'PSG Tech - Alumni & Student Mentorship Circle',
    description: 'Direct knowledge sharing, resume tips, and job referrals between PSG alumni and current students.',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    creatorId: 'user-karthik',
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
    creatorId: 'user-priya',
    creatorRole: 'student',
    isPrivate: false,
    membersCount: 89,
    category: 'alumni',
    createdAt: '2026-02-05T00:00:00Z'
  },
  {
    id: 'comm-3',
    name: 'Tamil Nadu Engineering Aspirants',
    description: 'Cross-college discussion for admissions, cutoffs, counseling, hostel comparisons, and career roadmap.',
    creatorId: 'user-deepak',
    creatorRole: 'student',
    isPrivate: false,
    membersCount: 310,
    category: 'general',
    createdAt: '2025-11-20T00:00:00Z'
  }
];

export const INITIAL_DISCORD_SERVERS: DiscordServer[] = [
  {
    id: 'server-psg-tech',
    name: 'PSG Tech Official Campus Server',
    collegeId: 'col-psg',
    collegeName: 'PSG College of Technology',
    institutionOwnerId: 'user-institution-psg',
    description: 'Official institution-governed campus server. Structured department channels, placement guidance, and ragebait-shielded student discussion.',
    memberCount: 840,
    antiRagebaitRules: [
      'Zero harassment, name-calling, or inflammatory rhetoric.',
      'Constructive academic criticism only with factual references.',
      'Anti-ragebait cooldown timer: 60 seconds slowmode enabled.',
      'Personal faculty grievances must be sent via Private Grievance to Institution ID.'
    ],
    channels: [
      {
        id: 'ch-announcements',
        name: 'official-announcements',
        description: 'Direct university broadcasts, exam dates, and semester schedules.',
        type: 'general',
        isRagebaitProtected: true
      },
      {
        id: 'ch-anti-ragebait-forum',
        name: 'ragebait-shielded-campus-hall',
        description: 'Special discussion space strictly moderated to prevent toxicity & sensationalism.',
        type: 'anti-ragebait',
        isRagebaitProtected: true
      },
      {
        id: 'ch-cse-mca-dept',
        name: 'dept-computer-science-mca',
        description: 'Department projects, syllabus inquiries, and research lab coordination.',
        type: 'department',
        isRagebaitProtected: false
      },
      {
        id: 'ch-placement-desk',
        name: 'placement-interview-intel',
        description: 'Real-time company interview reports, interview rounds, and alumni tips.',
        type: 'placements',
        isRagebaitProtected: true
      },
      {
        id: 'ch-alumni-mentoring',
        name: 'alumni-career-guidance',
        description: 'Alumni sharing industry experiences and resume advice for junior students.',
        type: 'alumni-guide',
        isRagebaitProtected: false
      }
    ]
  },
  {
    id: 'server-ceg-hub',
    name: 'CEG Anna University Campus Grid',
    collegeId: 'col-ceg',
    collegeName: 'College of Engineering, Guindy (CEG)',
    institutionOwnerId: 'user-institution-psg',
    description: 'Official campus server for Anna University CEG students, alumni mentors, and faculty.',
    memberCount: 650,
    antiRagebaitRules: [
      'Maintain collegiate decorum at all times.',
      'Strict prohibition of partisan hostility or unverified rumors.'
    ],
    channels: [
      {
        id: 'ch-ceg-general',
        name: 'campus-general',
        description: 'General student discussions and campus life questions.',
        type: 'general',
        isRagebaitProtected: false
      },
      {
        id: 'ch-ceg-ragebait',
        name: 'moderated-student-concerns',
        description: 'Shielded channel for campus queries with strict moderation.',
        type: 'anti-ragebait',
        isRagebaitProtected: true
      }
    ]
  }
];

export const INITIAL_SERVER_MESSAGES: ServerMessage[] = [
  {
    id: 'smsg-1',
    channelId: 'ch-announcements',
    authorId: 'user-institution-psg',
    authorName: 'PSG Tech Official Administration',
    authorRole: 'institution',
    authorHeadline: 'Official Administrative Desk',
    content: '🚨 Notice: End-semester lab practical schedules for MCA and B.Tech departments have been published on the student portal. Exam forms close this Friday at 5:00 PM.',
    createdAt: '2026-09-26T10:00:00Z',
    isFlaggedForRagebait: false
  },
  {
    id: 'smsg-2',
    channelId: 'ch-anti-ragebait-forum',
    authorId: 'user-junith',
    authorName: 'Junith S',
    authorRole: 'student',
    authorHeadline: 'B.Tech AI & DS @ PSG Tech',
    content: 'Reminder to all juniors: When discussing hostel food issues, please submit the specific mess hall number and date so the student welfare committee can present it constructively.',
    createdAt: '2026-09-26T14:15:00Z',
    isFlaggedForRagebait: false
  },
  {
    id: 'smsg-3',
    channelId: 'ch-placement-desk',
    authorId: 'user-karthik',
    authorName: 'Karthik Raja',
    authorRole: 'alumni',
    authorHeadline: 'Software Engineer II @ Microsoft',
    content: 'For everyone asking about the Microsoft campus drive: Expect 1 online assessment (OA) on HackerRank (3 questions: Array, Graph/Tree, and DP) followed by 3 technical rounds focusing on clean code, edge cases, and time/space complexity.',
    createdAt: '2026-09-26T16:20:00Z',
    isFlaggedForRagebait: false
  },
  {
    id: 'smsg-4',
    channelId: 'ch-cse-mca-dept',
    authorId: 'user-meenakshi',
    authorName: 'Dr. Meenakshi Sundaram',
    authorRole: 'faculty',
    authorHeadline: 'Professor & Head of CSE @ PSG Tech',
    content: 'The Department of Computer Science is conducting an open review session for final year project abstracts tomorrow from 2:00 PM to 4:30 PM in Lab 3.',
    createdAt: '2026-09-26T18:00:00Z',
    isFlaggedForRagebait: false
  }
];

export const INITIAL_GRIEVANCE_REPORTS: PrivateGrievanceReport[] = [
  {
    id: 'grv-1',
    studentId: 'user-arun',
    studentName: 'Arun Prakash',
    isAnonymousToFaculty: true,
    targetInstitutionId: 'col-psg',
    collegeName: 'PSG College of Technology',
    category: 'classroom_issue',
    targetFacultyName: 'Department Faculty Coordinator',
    subjectOrCourse: 'Advanced Data Structures (MCA-204)',
    detailedComplaint: 'The laboratory projector and AC system in CSE Room 304 have been malfunctioning for the last three weeks, causing difficulties during live code walkthroughs.',
    submittedAt: '2026-09-25T11:00:00Z',
    status: 'action_taken',
    institutionRemarks: 'Maintenance work order #4102 issued. Projector replaced by campus IT department.'
  }
];
