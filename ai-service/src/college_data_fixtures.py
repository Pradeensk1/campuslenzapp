"""
DEVELOPMENT FIXTURE ONLY:
This module contains sample institutional profiles strictly for local development,
prototyping, and testing of Campus Lenz AI semantic college search.
Do NOT treat as verified institutional facts. In production, this data is retrieved
from verified database / Supabase records.
"""

SAMPLE_COLLEGES = [
    {
        "college_id": "col_psg_tech",
        "college_name": "PSG College of Technology",
        "location": "Peelamedu, Coimbatore, Tamil Nadu",
        "programs": [
            "B.Tech Computer Science and Engineering",
            "B.Tech Information Technology",
            "Master of Computer Applications (MCA)",
            "M.Tech Software Engineering"
        ],
        "academics": "Rigorous engineering curriculum with strong emphasis on practical problem-solving and industry collaborations.",
        "faculty": "Highly experienced doctoral faculty with active consulting and research publications.",
        "placements": "Outstanding placement record with tier-1 multinational tech firms, high average salary packages, and extensive core recruitment.",
        "infrastructure": "Advanced research laboratories, centralized air-conditioned digital library, and modern computing centers.",
        "hostel": "Separate hostels for boys and girls with study rooms, high-speed internet, and dining halls.",
        "campus_life": "Active student union, technical symposiums, coding clubs, and annual cultural celebrations.",
        "fees": "Higher fee tier compared to government colleges, reflecting self-financed aided engineering programs.",
        "student_experience": "Competitive and industrious peer environment focused on engineering excellence and career growth."
    },
    {
        "college_id": "col_cit",
        "college_name": "Coimbatore Institute of Technology (CIT)",
        "location": "Civil Aerodrome Post, Coimbatore, Tamil Nadu",
        "programs": [
            "B.Tech Computer Science and Engineering",
            "B.Tech Artificial Intelligence and Data Science",
            "Master of Computer Applications (MCA)",
            "M.Sc Software Systems"
        ],
        "academics": "Strong mathematical foundations, computer science core subjects, and recognized postgraduate MCA department.",
        "faculty": "Dedicated professors with accessible guidance and mentorship for student technical projects.",
        "placements": "Consistently strong placements in software engineering and IT services with reputable global recruiters.",
        "infrastructure": "Well-equipped computer laboratories, central library, and Wi-Fi enabled academic blocks.",
        "hostel": "Affordable residential hostel facilities with basic amenities on campus grounds.",
        "campus_life": "Engaging student societies, technical fests, sports meets, and cultural clubs.",
        "fees": "Government-aided affordable fee structure offering high educational value for money.",
        "student_experience": "Balanced student environment with strong academic focus and collaborative peer study."
    },
    {
        "college_id": "col_gct",
        "college_name": "Government College of Technology (GCT)",
        "location": "Thadagam Road, Coimbatore, Tamil Nadu",
        "programs": [
            "B.Tech Computer Science and Engineering",
            "B.Tech Information Technology",
            "Master of Computer Applications (MCA)"
        ],
        "academics": "Traditional state government engineering curriculum focusing on engineering fundamentals.",
        "faculty": "Qualified state-appointed professors with long-standing academic experience.",
        "placements": "Dependable placement assistance with state recruitment drives and leading IT product companies.",
        "infrastructure": "Historic sprawling campus with spacious classrooms, workshop blocks, and sports grounds.",
        "hostel": "Very low-cost government hostel accommodation with essential amenities.",
        "campus_life": "Annual college cultural fest, active alumni association, and competitive athletic teams.",
        "fees": "Highly affordable government fee structure with subsidized tuition and hostel charges.",
        "student_experience": "Diverse socio-economic student body with self-driven academic culture and community spirit."
    },
    {
        "college_id": "col_kct",
        "college_name": "Kumaraguru College of Technology (KCT)",
        "location": "Saravanampatti, Coimbatore, Tamil Nadu",
        "programs": [
            "B.Tech Computer Science and Engineering",
            "B.Tech Information Technology",
            "B.Tech Mechatronics Engineering",
            "Master of Business Administration (MBA)"
        ],
        "academics": "Interdisciplinary learning with innovation labs, project-based courses, and entrepreneurial incubation.",
        "faculty": "Young and dynamic teaching staff emphasizing hands-on learning and experiential workshops.",
        "placements": "Good placement numbers with diverse opportunities across software development, product design, and analytics.",
        "infrastructure": "Sprawling modern campus with tech innovation center (Forge), modern amphitheater, and high-tech sports complex.",
        "hostel": "Modern residential hostel blocks with cafeteria, recreational facilities, and gymnasiums.",
        "campus_life": "Extremely vibrant campus life with over thirty student clubs, cultural fests (Yugam), and music societies.",
        "fees": "Private institution fee structure with merit scholarship assistance.",
        "student_experience": "Energetic, holistic campus atmosphere that encourages extracurriculars and startup ventures."
    },
    {
        "college_id": "col_amrita",
        "college_name": "Amrita Vishwa Vidyapeetham (Coimbatore Campus)",
        "location": "Ettimadai, Coimbatore, Tamil Nadu",
        "programs": [
            "B.Tech Computer Science and Engineering",
            "B.Tech Artificial Intelligence",
            "Master of Computer Applications (MCA)",
            "Integrated M.Sc Data Science"
        ],
        "academics": "Globally ranked multidisciplinary research university with rigorous computing curriculum and cybersecurity focus.",
        "faculty": "Distinguished international and national faculty with extensive patent and research output.",
        "placements": "Top-tier global software placements, high-paying product company offers, and international internships.",
        "infrastructure": "State-of-the-art campus nestled at the Western Ghats foothills with modern computing clusters and Olympic-standard sports facilities.",
        "hostel": "Mandatory residential hostels with strictly vegetarian mess, clean living spaces, and Wi-Fi access.",
        "campus_life": "Disciplined campus environment with spiritual and cultural celebrations, tech fests (Anokha), and community outreach.",
        "fees": "Premium private university fee structure reflecting advanced facilities and research infrastructure.",
        "student_experience": "Quiet, nature-surrounded residential campus with strong academic and ethical emphasis."
    },
    {
        "college_id": "col_sparse_01",
        "college_name": "Coimbatore Regional Technical Institute",
        "location": "Pollachi Road, Coimbatore, Tamil Nadu",
        "programs": [
            "Diploma in Mechanical Engineering",
            "Diploma in Electrical Engineering"
        ],
        # Notice: Academics, faculty, placements, hostel, campus_life, fees are intentionally None
        # to test that missing fields remain missing and are never fabricated.
        "academics": None,
        "faculty": None,
        "placements": None,
        "infrastructure": "Basic workshop sheds and classroom block.",
        "hostel": None,
        "campus_life": None,
        "fees": None,
        "student_experience": None
    }
]
