export interface TamilNaduCollegeItem {
  id: string;
  name: string;
  shortName: string;
  district: string;
  region: 'Chennai' | 'Coimbatore' | 'Madurai' | 'Trichy' | 'Salem' | 'Southern TN';
  type: string;
  courses: string[];
}

export const TAMIL_NADU_COLLEGES: TamilNaduCollegeItem[] = [
  // COIMBATORE REGION
  {
    id: 'col-psg',
    name: 'PSG College of Technology',
    shortName: 'PSG Tech',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous (Govt-Aided)',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Computer Science & Business Systems',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Robotics & Automation',
      'B.E Biomedical Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Computer Science & Engineering',
      'M.Tech Data Science & AI',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-cit',
    name: 'Coimbatore Institute of Technology',
    shortName: 'CIT Coimbatore',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous (Govt-Aided)',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Computer Science',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-gct',
    name: 'Government College of Technology',
    shortName: 'GCT Coimbatore',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Government Autonomous',
    courses: [
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'B.E Industrial Biotechnology',
      'M.E Structural Engineering',
      'M.E Power Systems'
    ]
  },
  {
    id: 'col-kct',
    name: 'Kumaraguru College of Technology',
    shortName: 'KCT',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Mechatronics Engineering',
      'B.E Aeronautical Engineering',
      'B.E Mechanical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-skcet',
    name: 'Sri Krishna College of Engineering and Technology',
    shortName: 'SKCET',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Computer Science & Business Systems',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Mechatronics Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-skct',
    name: 'Sri Krishna College of Technology',
    shortName: 'SKCT',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Civil Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-sns',
    name: 'SNS College of Technology',
    shortName: 'SNSCT',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Aerospace Engineering',
      'B.E Electronics & Communication Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-psg-itech',
    name: 'PSG Institute of Technology and Applied Research',
    shortName: 'PSG iTech',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Computer Science & Business Systems',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering'
    ]
  },
  {
    id: 'col-srec',
    name: 'Sri Ramakrishna Engineering College',
    shortName: 'SREC',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Biomedical Engineering',
      'B.E Robotics & Automation',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-bit',
    name: 'Bannari Amman Institute of Technology',
    shortName: 'BIT Sathy',
    district: 'Erode',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Biotechnology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Agriculture Engineering',
      'B.E Mechatronics Engineering',
      'MCA (Master of Computer Applications)'
    ]
  },
  {
    id: 'col-kec',
    name: 'Kongu Engineering College',
    shortName: 'KEC Perundurai',
    district: 'Erode',
    region: 'Coimbatore',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Chemical Engineering',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Mechatronics Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-amrita',
    name: 'Amrita Vishwa Vidyapeetham',
    shortName: 'Amrita Coimbatore',
    district: 'Coimbatore',
    region: 'Coimbatore',
    type: 'Deemed University',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Computer Science & Engineering',
      'B.Tech Cyber Security',
      'B.Tech Automation & Robotics',
      'B.Tech Aerospace Engineering',
      'M.Tech Artificial Intelligence',
      'MCA (Master of Computer Applications)'
    ]
  },

  // CHENNAI REGION
  {
    id: 'col-ceg',
    name: 'College of Engineering, Guindy (Anna University)',
    shortName: 'CEG Anna University',
    district: 'Chennai',
    region: 'Chennai',
    type: 'University Department (Govt)',
    courses: [
      'B.Tech Information Technology',
      'B.Tech Artificial Intelligence & Data Science',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'B.E Geo-Informatics',
      'B.E Biomedical Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Computer Science & Engineering',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-mit-anna',
    name: 'Madras Institute of Technology (Anna University)',
    shortName: 'MIT Chromepet',
    district: 'Chennai',
    region: 'Chennai',
    type: 'University Department (Govt)',
    courses: [
      'B.Tech Information Technology',
      'B.Tech Artificial Intelligence & Data Science',
      'B.E Computer Science & Engineering',
      'B.E Aeronautical Engineering',
      'B.E Automobile Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Robotics & Automation',
      'M.E Avionics',
      'M.E VLSI Design'
    ]
  },
  {
    id: 'col-ssn',
    name: 'Sri Sivasubramaniya Nadar College of Engineering',
    shortName: 'SSN College of Engineering',
    district: 'Chengalpattu',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Information Technology',
      'B.Tech Artificial Intelligence & Data Science',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Biomedical Engineering',
      'B.E Mechanical Engineering',
      'M.E Computer Science & Engineering',
      'M.E Communication Systems'
    ]
  },
  {
    id: 'col-rec',
    name: 'Rajalakshmi Engineering College',
    shortName: 'REC Chennai',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Computer Science & Business Systems',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Aeronautical Engineering',
      'B.E Biomedical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-st-joseph',
    name: "St. Joseph's College of Engineering",
    shortName: "St. Joseph's",
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Biotechnology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Chemical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-srm',
    name: 'SRM Institute of Science and Technology',
    shortName: 'SRM Kattankulathur',
    district: 'Chengalpattu',
    region: 'Chennai',
    type: 'Deemed University',
    courses: [
      'B.Tech Computer Science & Engineering (Core)',
      'B.Tech AI & Machine Learning',
      'B.Tech Cloud Computing & DevOps',
      'B.Tech Cyber Security',
      'B.Tech Electronics & Communication',
      'B.Tech Biotechnology',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-cit-chennai',
    name: 'Chennai Institute of Technology',
    shortName: 'CIT Chennai',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Computer Science & Business Systems',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Mechatronics Engineering',
      'B.E Electronics & Communication Engineering'
    ]
  },
  {
    id: 'col-licet',
    name: 'Loyola-ICAM College of Engineering and Technology',
    shortName: 'LICET Chennai',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering'
    ]
  },
  {
    id: 'col-easwari',
    name: 'Easwari Engineering College',
    shortName: 'Easwari SRM Group',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Robotics & Automation',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-saveetha',
    name: 'Saveetha Engineering College',
    shortName: 'Saveetha',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Agricultural Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-rmk',
    name: 'R.M.K. Engineering College',
    shortName: 'RMK Kavaraipettai',
    district: 'Thiruvallur',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'MCA (Master of Computer Applications)'
    ]
  },
  {
    id: 'col-velammal',
    name: 'Velammal Engineering College',
    shortName: 'Velammal Chennai',
    district: 'Chennai',
    region: 'Chennai',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Mechanical Engineering',
      'MBA (Master of Business Administration)'
    ]
  },

  // TRICHY & CENTRAL TAMIL NADU
  {
    id: 'col-nitt',
    name: 'National Institute of Technology, Tiruchirappalli',
    shortName: 'NIT Trichy',
    district: 'Tiruchirappalli',
    region: 'Trichy',
    type: 'Institute of National Importance (Central Govt)',
    courses: [
      'B.Tech Computer Science & Engineering',
      'B.Tech Electronics & Communication Engineering',
      'B.Tech Electrical & Electronics Engineering',
      'B.Tech Mechanical Engineering',
      'B.Tech Chemical Engineering',
      'B.Tech Metallurgical & Materials Engineering',
      'B.Tech Civil Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Data Analytics',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-sastra',
    name: 'SASTRA Deemed University',
    shortName: 'SASTRA Thanjavur',
    district: 'Thanjavur',
    region: 'Trichy',
    type: 'Deemed University',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Computer Science & Engineering',
      'B.Tech Information Technology',
      'B.Tech Bioinformatics',
      'B.Tech Electronics & Communication Engineering',
      'B.Tech Mechanical Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Advanced Computing'
    ]
  },
  {
    id: 'col-saranathan',
    name: 'Saranathan College of Engineering',
    shortName: 'Saranathan Trichy',
    district: 'Tiruchirappalli',
    region: 'Trichy',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Instrumentation & Control Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },

  // MADURAI & SOUTHERN TAMIL NADU
  {
    id: 'col-tce',
    name: 'Thiagarajar College of Engineering',
    shortName: 'TCE Madurai',
    district: 'Madurai',
    region: 'Madurai',
    type: 'Autonomous (Govt-Aided)',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Computer Science & Business Systems',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'MCA (Master of Computer Applications)',
      'M.Tech Wireless Technologies'
    ]
  },
  {
    id: 'col-mepco',
    name: 'Mepco Schlenk Engineering College',
    shortName: 'Mepco Sivakasi',
    district: 'Virudhunagar',
    region: 'Southern TN',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Biotechnology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Biomedical Engineering',
      'B.E Mechanical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-acgcet',
    name: 'Alagappa Chettiar Government College of Engineering and Technology',
    shortName: 'ACGCET Karaikudi',
    district: 'Sivaganga',
    region: 'Southern TN',
    type: 'Government Autonomous',
    courses: [
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'M.E Computer Science',
      'M.E Manufacturing Engineering'
    ]
  },
  {
    id: 'col-gce-tirunelveli',
    name: 'Government College of Engineering, Tirunelveli',
    shortName: 'GCE Tirunelveli',
    district: 'Tirunelveli',
    region: 'Southern TN',
    type: 'Government Autonomous',
    courses: [
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Civil Engineering',
      'M.E Engineering Design'
    ]
  },
  {
    id: 'col-nec',
    name: 'National Engineering College',
    shortName: 'NEC Kovilpatti',
    district: 'Thoothukudi',
    region: 'Southern TN',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering'
    ]
  },
  {
    id: 'col-psna',
    name: 'PSNA College of Engineering and Technology',
    shortName: 'PSNA Dindigul',
    district: 'Dindigul',
    region: 'Southern TN',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.E Computer Science & Engineering',
      'B.E Biomedical Engineering',
      'B.E Mechanical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },

  // SALEM & WESTERN TAMIL NADU
  {
    id: 'col-gce-salem',
    name: 'Government College of Engineering, Salem',
    shortName: 'GCE Salem',
    district: 'Salem',
    region: 'Salem',
    type: 'Government Autonomous',
    courses: [
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Electrical & Electronics Engineering',
      'B.E Mechanical Engineering',
      'B.E Metallurgical Engineering',
      'B.E Civil Engineering',
      'M.E Thermal Engineering'
    ]
  },
  {
    id: 'col-sona',
    name: 'Sona College of Technology',
    shortName: 'Sona Salem',
    district: 'Salem',
    region: 'Salem',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Fashion Technology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'B.E Mechatronics Engineering',
      'B.E Biomedical Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-vit',
    name: 'Vellore Institute of Technology',
    shortName: 'VIT Vellore',
    district: 'Vellore',
    region: 'Salem',
    type: 'Deemed University',
    courses: [
      'B.Tech Computer Science & Engineering (Core)',
      'B.Tech Artificial Intelligence & Machine Learning',
      'B.Tech Information Technology',
      'B.Tech Electronics & Communication Engineering',
      'B.Tech Mechanical Engineering',
      'B.Tech Biotechnology',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  },
  {
    id: 'col-ksr',
    name: 'K.S. Rangasamy College of Technology',
    shortName: 'KSRCT Tiruchengode',
    district: 'Namakkal',
    region: 'Salem',
    type: 'Autonomous Private',
    courses: [
      'B.Tech Artificial Intelligence & Data Science',
      'B.Tech Information Technology',
      'B.Tech Biotechnology',
      'B.E Computer Science & Engineering',
      'B.E Electronics & Communication Engineering',
      'MCA (Master of Computer Applications)',
      'MBA (Master of Business Administration)'
    ]
  }
];

// Department mapping derived from Degree & Course selection
export const COURSE_DEPARTMENT_MAP: Record<string, string[]> = {
  'B.Tech Artificial Intelligence & Data Science': [
    'Department of Artificial Intelligence & Data Science',
    'Department of Computer Science & Engineering',
    'School of Computing & Data Science'
  ],
  'B.Tech Information Technology': [
    'Department of Information Technology',
    'Department of Computer Science & Engineering'
  ],
  'B.Tech Computer Science & Business Systems': [
    'Department of Computer Science & Business Systems',
    'Department of Computer Applications',
    'Department of Computer Science & Engineering'
  ],
  'B.E Computer Science & Engineering': [
    'Department of Computer Science & Engineering',
    'School of Computer Engineering'
  ],
  'B.Tech Computer Science & Engineering (Core)': [
    'Department of Computer Science & Engineering',
    'School of Computing'
  ],
  'B.Tech AI & Machine Learning': [
    'Department of Artificial Intelligence & Machine Learning',
    'Department of Computer Science & Engineering'
  ],
  'B.Tech Cloud Computing & DevOps': [
    'Department of Information Technology',
    'Department of Computer Science & Engineering'
  ],
  'B.Tech Cyber Security': [
    'Department of Information Technology & Cyber Security',
    'Department of Computer Science & Engineering'
  ],
  'B.E Electronics & Communication Engineering': [
    'Department of Electronics & Communication Engineering',
    'School of Electrical & Electronics Engineering'
  ],
  'B.E Electrical & Electronics Engineering': [
    'Department of Electrical & Electronics Engineering',
    'Department of Electrical Engineering'
  ],
  'B.E Mechanical Engineering': [
    'Department of Mechanical Engineering',
    'School of Mechanical & Automobile Engineering'
  ],
  'B.E Civil Engineering': [
    'Department of Civil Engineering',
    'School of Civil & Environmental Engineering'
  ],
  'B.E Mechatronics Engineering': [
    'Department of Mechatronics Engineering',
    'Department of Mechanical Engineering'
  ],
  'B.E Robotics & Automation': [
    'Department of Robotics & Automation',
    'Department of Mechanical & Mechatronics'
  ],
  'B.E Biomedical Engineering': [
    'Department of Biomedical Engineering',
    'Department of Electronics & Biomedical Engineering'
  ],
  'B.E Aeronautical Engineering': [
    'Department of Aeronautical Engineering',
    'Department of Aerospace Engineering'
  ],
  'B.E Aerospace Engineering': [
    'Department of Aerospace Engineering',
    'Department of Aeronautical Engineering'
  ],
  'B.E Automobile Engineering': [
    'Department of Automobile Engineering',
    'Department of Mechanical Engineering'
  ],
  'B.Tech Biotechnology': [
    'Department of Biotechnology',
    'Department of Industrial Biotechnology'
  ],
  'B.E Industrial Biotechnology': [
    'Department of Industrial Biotechnology',
    'Department of Biotechnology'
  ],
  'B.Tech Chemical Engineering': [
    'Department of Chemical Engineering',
    'Department of Chemical & Applied Sciences'
  ],
  'B.E Agricultural Engineering': [
    'Department of Agricultural Engineering',
    'Department of Agriculture & Food Technology'
  ],
  'B.E Agriculture Engineering': [
    'Department of Agriculture Engineering',
    'Department of Agricultural Sciences'
  ],
  'B.Tech Fashion Technology': [
    'Department of Fashion Technology',
    'Department of Textile Technology'
  ],
  'B.E Metallurgical Engineering': [
    'Department of Metallurgical Engineering',
    'Department of Materials Science'
  ],
  'B.Tech Metallurgical & Materials Engineering': [
    'Department of Metallurgical & Materials Engineering',
    'Department of Materials Science'
  ],
  'B.E Geo-Informatics': [
    'Department of Civil & Geo-Informatics',
    'Department of Computer Science'
  ],
  'B.E Instrumentation & Control Engineering': [
    'Department of Instrumentation & Control Engineering',
    'Department of Electrical Engineering'
  ],
  'MCA (Master of Computer Applications)': [
    'Department of Computer Applications',
    'Department of Computer Science',
    'School of Computer Applications'
  ],
  'M.Tech Computer Science & Engineering': [
    'Department of Computer Science & Engineering',
    'School of Computing'
  ],
  'M.Tech Computer Science': [
    'Department of Computer Science & Engineering',
    'School of Computing'
  ],
  'M.Tech Data Science & AI': [
    'Department of Data Science & Artificial Intelligence',
    'Department of Computer Science & Engineering'
  ],
  'M.Tech Data Analytics': [
    'Department of Computer Science & Data Analytics',
    'Department of Computer Applications'
  ],
  'M.Tech Artificial Intelligence': [
    'Department of Artificial Intelligence',
    'Department of Computer Science & Engineering'
  ],
  'M.Tech Advanced Computing': [
    'Department of Computer Science & Engineering'
  ],
  'M.E VLSI Design': [
    'Department of Electronics & Communication Engineering'
  ],
  'M.E Avionics': [
    'Department of Aeronautical & Aerospace Engineering'
  ],
  'M.E Structural Engineering': [
    'Department of Civil Engineering'
  ],
  'M.E Power Systems': [
    'Department of Electrical & Electronics Engineering'
  ],
  'M.E Communication Systems': [
    'Department of Electronics & Communication Engineering'
  ],
  'M.E Engineering Design': [
    'Department of Mechanical Engineering'
  ],
  'M.E Manufacturing Engineering': [
    'Department of Mechanical Engineering'
  ],
  'M.E Thermal Engineering': [
    'Department of Mechanical Engineering'
  ],
  'MBA (Master of Business Administration)': [
    'Department of Management Studies',
    'School of Management & Business Studies',
    'Department of Management Sciences'
  ],
  'M.Sc Applied Mathematics & Computing': [
    'Department of Applied Mathematics & Computational Sciences',
    'Department of Mathematics'
  ]
};

// Helper: Get courses for college
export function getCoursesForCollege(collegeId: string): string[] {
  const col = TAMIL_NADU_COLLEGES.find(c => c.id === collegeId);
  return col?.courses && col.courses.length > 0
    ? col.courses
    : [
        'B.Tech Artificial Intelligence & Data Science',
        'B.Tech Information Technology',
        'B.E Computer Science & Engineering',
        'B.E Electronics & Communication Engineering',
        'B.E Mechanical Engineering',
        'MCA (Master of Computer Applications)',
        'MBA (Master of Business Administration)'
      ];
}

// Helper: Get departments for degree & course
export function getDepartmentsForCourse(courseName: string): string[] {
  const matched = COURSE_DEPARTMENT_MAP[courseName];
  if (matched && matched.length > 0) return matched;

  // Fallback heuristic based on keywords
  if (courseName.includes('Computer Science') || courseName.includes('AI') || courseName.includes('Data')) {
    return ['Department of Computer Science & Engineering', 'Department of Artificial Intelligence'];
  }
  if (courseName.includes('MCA')) {
    return ['Department of Computer Applications'];
  }
  if (courseName.includes('MBA') || courseName.includes('Business')) {
    return ['Department of Management Studies'];
  }
  if (courseName.includes('Electronics') || courseName.includes('Communication')) {
    return ['Department of Electronics & Communication Engineering'];
  }
  if (courseName.includes('Mechanical') || courseName.includes('Automobile')) {
    return ['Department of Mechanical Engineering'];
  }
  if (courseName.includes('Civil')) {
    return ['Department of Civil Engineering'];
  }
  return ['Department of Engineering & Technology', 'Department of Applied Sciences'];
}

// Helper: Determine course duration (4 years for B.E/B.Tech, 2 years for MCA/MBA/M.Tech/M.E)
export function getCourseDurationYears(courseName: string): number {
  if (
    courseName.startsWith('MCA') ||
    courseName.startsWith('MBA') ||
    courseName.startsWith('M.Tech') ||
    courseName.startsWith('M.E') ||
    courseName.startsWith('M.Sc')
  ) {
    return 2;
  }
  return 4;
}
