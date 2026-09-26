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

export const INITIAL_USERS: UserProfile[] = [];

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

export const INITIAL_REVIEWS: CollegeReview[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_COMMUNITIES: Community[] = [];

export const INITIAL_DISCORD_SERVERS: DiscordServer[] = [];

export const INITIAL_SERVER_MESSAGES: ServerMessage[] = [];

export const INITIAL_GRIEVANCE_REPORTS: PrivateGrievanceReport[] = [];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [];


