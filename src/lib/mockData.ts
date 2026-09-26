import {
  College,
  CollegeReview,
  Post,
  Community,
  UserProfile,
  DiscordServer,
  ServerMessage,
  PrivateGrievanceReport,
  DirectMessage
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
    id: 'rev-1',
    collegeId: 'col-psg',
    userId: 'user-alumni-demo',
    reviewerType: 'alumni',
    authorName: 'Alumni Industry Mentor',
    authorUsername: 'alumni_mentor',
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
    content: 'Thrilled to share that our team won 1st Place at the Tamil Nadu State Smart Engineering Hackathon! 🏆\n\nWe built an edge AI IoT sensor node for precision agriculture with real-time inference. Huge gratitude to our faculty mentors and the campus computing lab for the round-the-clock compute access. juniors looking to participate next semester: registrations open next Monday!',
    topic: 'Hackathons & Projects',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=100',
    likes: ['user-alumni-demo', 'user-faculty-demo'],
    likesCount: 56,
    commentsCount: 2,
    sharesCount: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    moderationStatus: 'normal',
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
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    moderationStatus: 'normal',
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
  }
];

export const INITIAL_GRIEVANCE_REPORTS: PrivateGrievanceReport[] = [];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm-1',
    conversationId: 'conv-student-alumni',
    senderId: 'user-student-demo',
    receiverId: 'user-alumni-demo',
    content: 'Hello! Wanted to ask for guidance regarding system design and coding interview rounds for tech campus hiring.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isRead: true
  },
  {
    id: 'dm-2',
    conversationId: 'conv-student-alumni',
    senderId: 'user-alumni-demo',
    receiverId: 'user-student-demo',
    content: 'Happy to help! Focus on strong fundamentals in Trees, Graphs, and DP on LeetCode. Also ensure you can explain your full-stack project architecture clearly!',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: true,
    liked: true
  }
];


