-- ========================================================
-- CAMPUS LENZ: COMPLETE PRODUCTION DATABASE SCHEMA & SEED
-- Full Support for All Features: Colleges, Reviews, Feed,
-- Grievance Reports, Communities, Academic Tools & Governance
-- Project: https://kyllejmstjsefijyuaew.supabase.co
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  college_type TEXT NOT NULL,
  established_year INT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  courses TEXT[] DEFAULT '{}',
  departments TEXT[] DEFAULT '{}',
  fees_min NUMERIC,
  fees_max NUMERIC,
  fees_description TEXT,
  placement_stats JSONB DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  official_overview TEXT,
  rating_average NUMERIC(3,2),
  review_count INT DEFAULT 0,
  placement_details JSONB DEFAULT '{}',
  fee_details JSONB DEFAULT '{}',
  academic_details JSONB DEFAULT '{}',
  campus_details JSONB DEFAULT '{}',
  activity_details JSONB DEFAULT '{}',
  overall_score JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'alumni', 'faculty', 'institution', 'admin')),
  full_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  department TEXT,
  course TEXT,
  graduation_batch TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  is_banned BOOLEAN DEFAULT FALSE,
  strikes_count INT DEFAULT 0,
  last_strike_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  college_id TEXT NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_type TEXT NOT NULL DEFAULT 'student',
  author_name TEXT NOT NULL,
  author_username TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  dimensions JSONB NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  experience TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  advice TEXT,
  recommendation BOOLEAN DEFAULT TRUE,
  course TEXT,
  department TEXT,
  batch TEXT,
  institution_reply JSONB,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'student',
  author_headline TEXT,
  is_verified_author BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  content TEXT NOT NULL,
  topic TEXT,
  image_url TEXT,
  likes TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  sentiment TEXT DEFAULT 'neutral',
  sentiment_score NUMERIC DEFAULT 0,
  toxicity_score INT DEFAULT 0,
  is_sensitive BOOLEAN DEFAULT FALSE,
  sensitive_reason TEXT,
  is_quarantined BOOLEAN DEFAULT FALSE,
  ai_model_metadata TEXT,
  moderation_status TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'student',
  author_headline TEXT,
  avatar_url TEXT,
  is_verified_author BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  creator_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_role TEXT DEFAULT 'student',
  is_private BOOLEAN DEFAULT FALSE,
  members_count INT DEFAULT 0,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DISCORD SERVERS TABLE
CREATE TABLE IF NOT EXISTS public.discord_servers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  institution_owner_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  member_count INT DEFAULT 0,
  anti_ragebait_rules TEXT[] DEFAULT '{}',
  channels JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVER MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.server_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  channel_id TEXT NOT NULL,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'student',
  author_headline TEXT,
  content TEXT NOT NULL,
  is_flagged_for_ragebait BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GRIEVANCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.grievance_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT,
  is_anonymous_to_faculty BOOLEAN DEFAULT TRUE,
  target_institution_id TEXT NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  college_name TEXT,
  category TEXT NOT NULL,
  target_faculty_name TEXT,
  subject_or_course TEXT NOT NULL,
  detailed_complaint TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  institution_remarks TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DIRECT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. STUDY ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.study_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  active_peer_count INT DEFAULT 0,
  max_participants INT DEFAULT 30,
  host_name TEXT NOT NULL,
  room_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COURSE QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.course_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_snippet TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  author_id TEXT,
  author_name TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  answers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MARKETPLACE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  is_free_or_swap BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL,
  seller_id TEXT,
  seller_name TEXT NOT NULL,
  seller_role TEXT DEFAULT 'student',
  seller_contact TEXT NOT NULL,
  is_reserved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ASSIGNMENT TASKS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  course_code TEXT NOT NULL,
  due_date TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 0
);

-- 15. EXAM MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.exam_milestones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_code TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  exam_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  remaining_days INT DEFAULT 0
);

-- 16. MENTORSHIP SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.mentorship_slots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alumni_id TEXT,
  alumni_name TEXT NOT NULL,
  alumni_company TEXT NOT NULL,
  topic TEXT NOT NULL,
  date_string TEXT NOT NULL,
  time_string TEXT NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by_student_id TEXT,
  booked_by_student_name TEXT,
  notes TEXT
);

-- 17. ALUMNI REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.alumni_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alumni_id TEXT,
  alumni_name TEXT NOT NULL,
  company TEXT NOT NULL,
  role_title TEXT NOT NULL,
  job_type TEXT NOT NULL,
  location TEXT NOT NULL,
  min_gpa NUMERIC DEFAULT 0,
  batch_eligible TEXT,
  description TEXT NOT NULL,
  referral_requests_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. REFERRAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.referral_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  referral_id TEXT NOT NULL REFERENCES public.alumni_referrals(id) ON DELETE CASCADE,
  student_id TEXT,
  student_name TEXT NOT NULL,
  student_gpa NUMERIC,
  resume_link TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. AMA EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.ama_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT,
  host_name TEXT NOT NULL,
  host_title TEXT NOT NULL,
  host_company TEXT NOT NULL,
  topic TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  attendee_count INT DEFAULT 0,
  questions JSONB DEFAULT '[]'
);

-- 20. OFFICE HOUR QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.office_hour_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT,
  student_name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  topic TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  status TEXT DEFAULT 'waiting'
);

-- 21. RESEARCH OPENINGS TABLE
CREATE TABLE IF NOT EXISTS public.research_openings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  professor_id TEXT,
  professor_name TEXT NOT NULL,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prerequisites TEXT,
  stipend_or_credits TEXT,
  min_gpa NUMERIC,
  status TEXT DEFAULT 'open',
  applicants JSONB DEFAULT '[]'
);

-- 22. LECTURE MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.lecture_materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  professor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  file_url TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  download_count INT DEFAULT 0
);

-- 23. EMERGENCY BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_broadcasts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  institution_id TEXT,
  institution_name TEXT NOT NULL,
  severity TEXT DEFAULT 'notice',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  target_audiences TEXT[] DEFAULT '{}'
);

-- 24. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id TEXT,
  admin_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ama_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hour_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public full access" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Public full access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'server_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.server_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'grievance_reports') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.grievance_reports;
  END IF;
END $$;

-- ========================================================
-- COMPLETE STATIC DATA INITIAL SEED (MOCK DATA TO SUPABASE)
-- ========================================================

-- 1. COLLEGES SEED
INSERT INTO public.colleges (id, slug, name, location, state, college_type, established_year, contact_email, contact_phone, website_url, courses, departments, fees_min, fees_max, fees_description, placement_stats, facilities, official_overview, rating_average, review_count, placement_details, fee_details, academic_details, campus_details, activity_details, overall_score)
VALUES ('col-psg', 'psg-college-of-technology', 'PSG College of Technology', 'Coimbatore', 'Tamil Nadu', 'Autonomous (Govt-Aided)', 1951, 'contact@psgtech.edu', '+91 422 2572177', 'https://www.psgtech.edu', '{"B.Tech Computer Science","B.Tech AI & Data Science","MCA","M.Tech AI","B.E Mechanical"}', '{"Computer Science","Artificial Intelligence","Mechanical","Applied Math"}', 65000, 120000, 'Government aided and self-financing annual fee brackets.', '{"highestPackage":"38.5 LPA","averagePackage":"8.8 LPA","placementRate":"94%","topRecruiters":["Microsoft","Amazon","Cisco","Qualcomm","TCS Research","DE Shaw"]}'::jsonb, '{"Hostel (Separate Boys/Girls)","Central 24x7 Library","Advanced Robotics Lab","Sports Complex","High-Speed Wi-Fi"}', 'An autonomous, government-aided institution affiliated with Anna University, committed to technical excellence and industry-driven research.', 4.6, 28, '{"highestPackage":"38.5 LPA (Microsoft / DE Shaw)","averagePackage":"8.8 LPA (Tier-1 Tech Average: 14.5 LPA)","medianPackage":"7.8 LPA","placementRate":"94.2% across engineering branches","topRecruiters":["Microsoft","Amazon","Cisco","Qualcomm","DE Shaw","Morgan Stanley"],"internshipOffers":"320+ pre-placement offers (PPOs) received","placementTraining":"Full 3-semester structured aptitude & DSA bootcamps","tier1HiresCount":164}'::jsonb, '{"tuitionAnnual":"₹65,000 (Govt-Aided) to ₹1,20,000 (Self-Finance)","hostelAnnual":"₹55,000 / year (Standard non-AC) to ₹85,000 / year (AC)","messMonthly":"₹4,200 / month (South Indian veg & non-veg options)","examAndLabAnnual":"₹8,500 / year","scholarshipsAvailable":"State BC/MBC welfare, Merit alumni endowment, AICTE Pragati","roiRating":"9.4 / 10 (Very High return on annual fees)"}'::jsonb, '{"studentFacultyRatio":"1:14 (Very favorable attention)","phdFacultyPercent":"82% of professors hold Ph.D. degrees","curriculumFlexibility":"High autonomy with choice-based credit system (CBCS)","researchFundingAnnual":"₹14.8 Crores in sponsored industry R&D grants","labEquipmentGrade":"Industry-standard Nvidia GPU cluster, CNC machines & Robotics arm","academicsRating":4.8}'::jsonb, '{"wifiSpeed":"1 Gbps optical fiber backbone (100 Mbps per student limit)","hostelCurfew":"8:30 PM for 1st-year students; 9:30 PM for seniors","messFoodRating":3.8,"sportsComplex":"Indoor badminton courts, synthetic basketball, cricket oval, gym","medicalFacility":"PSG IMS&R 24/7 super-specialty hospital support within 2 km","gymAndFitness":"Fully equipped multi-station fitness center on campus"}'::jsonb, '{"annualFestName":"KRIYA (Global technical symposium) & INVENTE","techClubsCount":24,"incubationCenter":"PSG STEP (Science & Technology Entrepreneurial Park)","hackathonsOrganizedAnnual":6,"industryMoUs":45}'::jsonb, '{"total":94,"placementsScore":96,"feesRoiScore":92,"academicsScore":95,"campusLifeScore":90,"badge":"Best Placements & Industry Network"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.colleges (id, slug, name, location, state, college_type, established_year, contact_email, contact_phone, website_url, courses, departments, fees_min, fees_max, fees_description, placement_stats, facilities, official_overview, rating_average, review_count, placement_details, fee_details, academic_details, campus_details, activity_details, overall_score)
VALUES ('col-ceg', 'college-of-engineering-guindy', 'College of Engineering, Guindy (CEG Anna University)', 'Chennai', 'Tamil Nadu', 'Government (Premier University Dept)', 1794, 'deanceg@annauniv.edu', '+91 44 2235 7004', 'https://ceg.annauniv.edu', '{"B.E Computer Science","B.E Mechanical","B.Tech IT","MCA","B.E Electronics"}', '{"Computer Science and Engineering","Information Technology","Mechanical Engineering"}', 35000, 70000, 'Affordable government fee structure subsidized by the state.', '{"highestPackage":"42.0 LPA","averagePackage":"9.2 LPA","placementRate":"92%","topRecruiters":["Google","Adobe","Samsung","DE Shaw","Infosys","Caterpillar"]}'::jsonb, '{"Heritage Campus","Extensive Technical Library","Hostel Facilities","Innovation Hub","Auditorium"}', 'One of the oldest technical institutions in Asia, offering premier academic and research programs in core engineering disciplines.', 4.7, 35, '{"highestPackage":"42.0 LPA (Google / Adobe)","averagePackage":"9.2 LPA (CSE / IT avg: 16.2 LPA)","medianPackage":"8.2 LPA","placementRate":"92.5% across eligible batches","topRecruiters":["Google","Adobe","Samsung R&D","DE Shaw","Qualcomm","Amazon"],"internshipOffers":"280+ summer internships with paid stipends","placementTraining":"Centre for University-Industry Collaboration (CUIC) workshops","tier1HiresCount":182}'::jsonb, '{"tuitionAnnual":"₹35,000 / year (Lowest in state, govt subsidized)","hostelAnnual":"₹32,000 / year (Government hostel amenities)","messMonthly":"₹3,500 / month (Divisional cooperative mess)","examAndLabAnnual":"₹4,500 / year","scholarshipsAvailable":"Full tuition fee waiver for first graduates & 7.5% govt quota","roiRating":"9.8 / 10 (Highest Return On Investment in South India)"}'::jsonb, '{"studentFacultyRatio":"1:12 (Excellent professor availability)","phdFacultyPercent":"94% of core faculty hold Doctorates","curriculumFlexibility":"State syllabus baseline with university research electives","researchFundingAnnual":"₹22.5 Crores in Central Government (DST, DRDO) grants","labEquipmentGrade":"Centennial central computing labs, high performance computing grid","academicsRating":4.9}'::jsonb, '{"wifiSpeed":"500 Mbps NKN (National Knowledge Network) campus grid","hostelCurfew":"9:00 PM for all hostel residents","messFoodRating":3.6,"sportsComplex":"Historic Kottur stadium, Olympic-size swimming pool, tennis courts","medicalFacility":"Health Centre on-campus with resident doctors & ambulance","gymAndFitness":"University gymnasium with dedicated instructors"}'::jsonb, '{"annualFestName":"Kurukshetra (UNESCO patronized tech fest) & Agni","techClubsCount":32,"incubationCenter":"CED (Centre for Entrepreneurship Development) & TBI","hackathonsOrganizedAnnual":8,"industryMoUs":60}'::jsonb, '{"total":96,"placementsScore":97,"feesRoiScore":99,"academicsScore":97,"campusLifeScore":89,"badge":"Best Value for Money & Academic Heritage"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.colleges (id, slug, name, location, state, college_type, established_year, contact_email, contact_phone, website_url, courses, departments, fees_min, fees_max, fees_description, placement_stats, facilities, official_overview, rating_average, review_count, placement_details, fee_details, academic_details, campus_details, activity_details, overall_score)
VALUES ('col-sns', 'sns-college-of-technology', 'SNS College of Technology', 'Coimbatore', 'Tamil Nadu', 'Autonomous (Private)', 2002, 'office@snsct.org', '+91 422 2666264', 'https://snsct.org', '{"B.Tech AI & Data Science","B.E CSE","MCA","MBA","B.Tech IT"}', '{"Computer Science","Design Thinking Hub","Management Studies"}', 85000, 150000, 'Autonomous annual academic fee including design lab amenities.', '{"highestPackage":"18.0 LPA","averagePackage":"5.2 LPA","placementRate":"88%","topRecruiters":["Cognizant","Wipro","Accenture","Zoho","Hexaware","Virtusa"]}'::jsonb, '{"Design Thinking Spine","Modern Hostels","IoT Labs","Cafeteria","Digital Studio"}', 'First institution in India to implement Design Thinking framework across all engineering curricula.', 4.1, 16, '{"highestPackage":"18.0 LPA (Zoho / Product firms)","averagePackage":"5.2 LPA (Core tech offers: 7.5 LPA)","medianPackage":"4.8 LPA","placementRate":"88.0% campus placement rate","topRecruiters":["Cognizant","Wipro","Accenture","Zoho","Hexaware","TCS"],"internshipOffers":"150+ project internships across Coimbatore IT park","placementTraining":"SNSDT Career Development Centre bootcamps & mock interviews","tier1HiresCount":42}'::jsonb, '{"tuitionAnnual":"₹85,000 to ₹1,50,000 / year (Private autonomous slab)","hostelAnnual":"₹75,000 / year (Modern attached washroom rooms)","messMonthly":"₹4,800 / month (Multi-cuisine student food court)","examAndLabAnnual":"₹10,500 / year","scholarshipsAvailable":"Sports quota fee concession, SNS Merit scholarship for 90%+ in 12th","roiRating":"8.1 / 10 (Good for regional placement opportunities)"}'::jsonb, '{"studentFacultyRatio":"1:16","phdFacultyPercent":"58% of faculty holding Ph.D. degrees","curriculumFlexibility":"5-pillar Design Thinking embedded in every course module","researchFundingAnnual":"₹3.2 Crores in seed venture funding & MSME grants","labEquipmentGrade":"Modern Apple Mac design lab, IoT sensors lab, AR/VR suite","academicsRating":4.2}'::jsonb, '{"wifiSpeed":"250 Mbps campus Wi-Fi network with hostel coverage","hostelCurfew":"8:00 PM for female students; 8:30 PM for male students","messFoodRating":4.1,"sportsComplex":"Turf football ground, volleyball courts, indoor games lounge","medicalFacility":"Campus clinic with ambulance and primary care nurse","gymAndFitness":"Fitness studio with cardio & strength training equipment"}'::jsonb, '{"annualFestName":"SNS INNOFEST & Design Thinking Hack-A-Thon","techClubsCount":18,"incubationCenter":"SNS iHub (Incubation Center & Maker Space)","hackathonsOrganizedAnnual":4,"industryMoUs":28}'::jsonb, '{"total":84,"placementsScore":82,"feesRoiScore":81,"academicsScore":85,"campusLifeScore":88,"badge":"Best Design Thinking & Modern Hostels"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. PROFILES SEED
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-student-demo', 'student_scholar', 'student@campuslenz.edu', 'student', 'Verified Campus Student', 'B.Tech Computer Science & Engineering @ PSG Tech | Aspiring Software Engineer', 'Active engineering student passionate about distributed systems, modern full-stack development, and campus tech symposiums.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Science & Engineering', 'B.Tech CSE', '2026', TRUE, 184, 95, '{"user-alumni-demo","user-faculty-demo"}', '{"user-alumni-demo","user-inst-demo"}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-alumni-demo', 'alumni_mentor', 'alumni@campuslenz.edu', 'alumni', 'Alumni Industry Mentor', 'Senior Software Engineer @ Microsoft | Campus Alumnus & Mentor', 'Alumnus supporting junior students with coding interview prep, DSA problem solving patterns, and resume audits.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Science & Engineering', 'B.Tech Computer Science', '2023', TRUE, 1420, 210, '{"user-student-demo"}', '{"user-inst-demo"}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-inst-demo', 'institution_admin', 'admin@psgtech.edu', 'institution', 'PSG Tech Official Administration', 'Official Administrative Desk • PSG College of Technology', 'Official university administrative channel for institutional announcements, department servers, and student welfare governance.', NULL, 'col-psg', 'PSG College of Technology', 'Central Administration', 'Institution Management', 'Administration', TRUE, 4800, 12, '{"user-student-demo","user-alumni-demo"}', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-faculty-demo', 'academic_faculty', 'faculty@psgtech.edu', 'faculty', 'Dr. Academic Faculty Guide', 'Professor & Head of Computer Science @ PSG Tech | Senior Academic Researcher', '15+ years of teaching excellence, advising student research publications, and guiding final year capstone projects.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Science & Engineering', 'Faculty / Staff', 'Faculty Guide', TRUE, 920, 80, '{"user-student-demo"}', '{"user-inst-demo"}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-admin-system', 'system_admin', 'admin@campuslenz.org', 'admin', 'Campus Lenz Super Administrator', 'Platform Trust, Governance & Lead Developer', 'System level operator with complete project management capabilities, developer terminal privileges, and content moderation authority.', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 9999, 0, '{}', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-junith', 'junith_s', 'junith@psgtech.edu', 'student', 'Junith S', 'B.Tech AI & Data Science @ PSG Tech | Kaggle Specialist', 'Machine learning practitioner working on edge inference and computer vision models.', NULL, 'col-psg', 'PSG College of Technology', 'Artificial Intelligence', 'B.Tech AI & DS', '2026', TRUE, 340, 110, '{"user-student-demo"}', '{"user-alumni-demo"}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-arun', 'arun_prakash', 'arun.mca@psgtech.edu', 'student', 'Arun Prakash', 'MCA Final Year @ PSG Tech | Full-Stack Developer', 'Building reactive full-stack web applications and cloud architectures.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Applications', 'MCA', '2025', TRUE, 215, 75, '{}', '{"user-student-demo"}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-karthika', 'karthika_amazon', 'karthika@amazon.com', 'alumni', 'Karthika R', 'Software Engineer II @ Amazon | PSG Alumna (2022)', 'AWS Developer Productivity team in Chennai. Active mentor on campus placement guidance.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Science', 'B.Tech CSE', '2022', TRUE, 890, 130, '{"user-student-demo"}', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-admin-demo', 'super_admin', 'superadmin@campuslenz.org', 'admin', 'Super System Administrator', 'Root Governance & Platform Security Officer', 'Administrative operator account.', NULL, 'col-psg', 'PSG College of Technology', 'Platform Operations', 'System Admin', 'Admin', TRUE, 100, 10, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
INSERT INTO public.profiles (id, username, email, role, full_name, headline, bio, avatar_url, college_id, college_name, department, course, graduation_batch, is_verified, followers_count, following_count, followers, following)
VALUES ('user-rahul', 'rahul_sharma', 'rahul@psgtech.edu', 'student', 'Rahul Sharma (Roll #2203)', 'B.Tech CSE @ PSG Tech', 'Engineering student actively participating in academic research and coding clubs.', NULL, 'col-psg', 'PSG College of Technology', 'Computer Science', 'B.Tech CSE', '2026', TRUE, 45, 60, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 3. REVIEWS SEED
INSERT INTO public.reviews (id, college_id, user_id, reviewer_type, author_name, author_username, is_anonymous, overall_rating, dimensions, title, experience, pros, cons, advice, recommendation, course, department, batch, institution_reply, helpful_count, created_at)
VALUES ('rev-psg-1', 'col-psg', 'user-student-demo', 'student', 'Verified Campus Student', 'student_scholar', FALSE, 5, '{"academics":5,"faculty":4,"placements":5,"infrastructure":4,"hostel":4,"campusLife":4,"valueForMoney":5,"studentExperience":5}'::jsonb, 'Superb placements and strong industry connections', 'PSG Tech provides a rigorous engineering foundation with immense industry exposure. Coding labs and hackathon culture are top notch. Placements are well organized.', '{"Top tech recruiters visit campus","Practical lab culture","Very supportive alumni network"}', '{"Strict attendance criteria","Demanding exam schedule"}', 'Start practicing data structures and algorithms from 2nd year and participate actively in technical clubs.', TRUE, 'B.Tech Computer Science', 'Computer Science', '2023', '{"officialName":"Dean of Student Affairs (PSG Tech)","repliedAt":"2026-02-16T12:00:00Z","text":"Thank you for your valuable feedback. We are continuously enhancing our curriculum with modern AI and Cloud electives."}'::jsonb, 0, '2026-02-14T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, college_id, user_id, reviewer_type, author_name, author_username, is_anonymous, overall_rating, dimensions, title, experience, pros, cons, advice, recommendation, course, department, batch, institution_reply, helpful_count, created_at)
VALUES ('rev-ceg-1', 'col-ceg', 'user-alumni-demo', 'alumni', 'Alumni Industry Mentor', 'alumni_mentor', FALSE, 5, '{"academics":5,"faculty":5,"placements":5,"infrastructure":4,"hostel":3,"campusLife":5,"valueForMoney":5,"studentExperience":5}'::jsonb, 'Historic legacy with unrivaled ROI and campus life', 'The sheer autonomy, technical freedom, and peer quality at CEG Anna University are unmatched. Extremely low tuition fee paired with top-tier product company offers.', '{"Lowest fee in the state","Premier Tier-1 placement recruiters","Vibrant tech fests (Kurukshetra)"}', '{"Hostel amenities are vintage","Administrative processes can be bureaucratic"}', 'Make full use of CUIC placement training and leverage the massive global alumni network.', TRUE, 'B.E Computer Science', 'Computer Science and Engineering', '2022', NULL, 0, '2026-01-20T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. POSTS & COMMENTS SEED
INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, is_verified_author, is_anonymous, college_id, college_name, content, topic, image_url, likes, likes_count, comments_count, shares_count, sentiment, sentiment_score, toxicity_score, is_sensitive, sensitive_reason, moderation_status, ai_model_metadata, created_at)
VALUES ('post-live-1', 'user-student-demo', 'student_scholar', 'Verified Campus Student', 'student', 'B.Tech CSE @ PSG Tech | Full-Stack & Systems Enthusiast', TRUE, FALSE, 'col-psg', 'PSG College of Technology', 'Thrilled to share that our team won 1st Place at the Tamil Nadu State Smart Engineering Hackathon! 🏆

We built an edge AI IoT sensor node for precision agriculture with real-time inference. Huge gratitude to our faculty mentors and the campus computing lab for the round-the-clock compute access. Juniors looking to participate next semester: registrations open next Monday!', 'Hackathons & Projects', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=100', '{"user-alumni-demo","user-faculty-demo"}', 56, 2, 14, 'positive', 0.88, 3, FALSE, NULL, 'normal', 'distilbert-sst2 + toxic-bert + nsfwjs-v2', '2026-09-27T18:40:03.467Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.comments (id, post_id, author_id, author_username, author_name, author_role, author_headline, avatar_url, is_verified_author, content, likes_count, created_at)
VALUES ('c-1', 'post-live-1', 'user-alumni-demo', 'alumni_mentor', 'Alumni Industry Mentor', 'alumni', 'Senior Software Engineer @ Microsoft', NULL, TRUE, 'Fantastic work! Edge optimization and IoT inference are extremely high-demand skills in the industry right now. Keep pushing!', 8, '2026-09-27T18:55:03.467Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.comments (id, post_id, author_id, author_username, author_name, author_role, author_headline, avatar_url, is_verified_author, content, likes_count, created_at)
VALUES ('c-2', 'post-live-1', 'user-faculty-demo', 'academic_faculty', 'Dr. Academic Faculty Guide', 'faculty', 'Professor of Computer Science', NULL, TRUE, 'Very proud of your perseverance and clean engineering execution. Keep up the high standard.', 5, '2026-09-27T19:05:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, is_verified_author, is_anonymous, college_id, college_name, content, topic, image_url, likes, likes_count, comments_count, shares_count, sentiment, sentiment_score, toxicity_score, is_sensitive, sensitive_reason, moderation_status, ai_model_metadata, created_at)
VALUES ('post-live-sensitive', 'user-student-demo', 'anonymous_scholar', 'Anonymous Student', 'student', 'Anonymous Student Contributor', FALSE, TRUE, 'col-psg', 'PSG College of Technology', 'Campus Debate: The new hostel gate curfew and strict timing enforcement is completely frustrating and unfair. Several students are saying this administration is acting like a complete scam college! We demand a transparent student council forum to address these arbitrary policies.', 'Campus Grievance', NULL, '{}', 22, 0, 7, 'ragebait', -0.74, 56, TRUE, 'Sensationalist ragebait discourse and elevated hostility (unitary/toxic-bert score: 56%)', 'sensitive', 'distilbert-sst2 + unitary/toxic-bert', '2026-09-27T18:20:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, is_verified_author, is_anonymous, college_id, college_name, content, topic, image_url, likes, likes_count, comments_count, shares_count, sentiment, sentiment_score, toxicity_score, is_sensitive, sensitive_reason, moderation_status, ai_model_metadata, created_at)
VALUES ('post-live-2', 'user-alumni-demo', 'alumni_mentor', 'Alumni Industry Mentor', 'alumni', 'Senior Software Engineer @ Microsoft | Campus Alumnus', TRUE, FALSE, 'col-psg', 'PSG College of Technology', 'Tips for upcoming tier-1 product campus placement drives:

1. Stop grinding LeetCode blindly without understanding core algorithmic patterns (Two Pointers, Sliding Window, Monotonic Stack, Dynamic Programming).
2. Write modular, clean code with descriptive variable names in live technical rounds.
3. Be prepared to explain trade-offs between Space and Time complexity with concrete examples.

Open for mock technical interviews and resume reviews this Saturday. Drop a comment with your target domain!', 'Alumni Mentorship', NULL, '{"user-student-demo"}', 112, 1, 38, 'positive', 0.76, 4, FALSE, NULL, 'normal', 'distilbert-sst2 + toxic-bert', '2026-09-27T17:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.comments (id, post_id, author_id, author_username, author_name, author_role, author_headline, avatar_url, is_verified_author, content, likes_count, created_at)
VALUES ('c-3', 'post-live-2', 'user-student-demo', 'student_scholar', 'Verified Campus Student', 'student', 'B.Tech CSE @ PSG Tech', NULL, TRUE, 'Super grateful for this guidance! Would love to get my resume reviewed for backend systems roles.', 4, '2026-09-27T17:55:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, is_verified_author, is_anonymous, college_id, college_name, content, topic, image_url, likes, likes_count, comments_count, shares_count, sentiment, sentiment_score, toxicity_score, is_sensitive, sensitive_reason, moderation_status, ai_model_metadata, created_at)
VALUES ('post-live-3', 'user-inst-demo', 'institution_admin', 'PSG Tech Official Administration', 'institution', 'Official Campus Administrative Desk', TRUE, FALSE, 'col-psg', 'PSG College of Technology', '📢 Campus Placement Season Update: 45+ premier technology organizations are scheduled for on-campus drives over the next four weeks. Students are advised to verify their attendance eligibility and update their project repositories on the college placement portal before Friday.', 'Official Announcements', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=100', '{"user-student-demo","user-alumni-demo"}', 145, 0, 52, 'neutral', 0.15, 2, FALSE, NULL, 'normal', 'distilbert-sst2 + toxic-bert + nsfwjs-v2', '2026-09-27T15:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, is_verified_author, is_anonymous, college_id, college_name, content, topic, image_url, likes, likes_count, comments_count, shares_count, sentiment, sentiment_score, toxicity_score, is_sensitive, sensitive_reason, moderation_status, ai_model_metadata, created_at)
VALUES ('post-live-4', 'user-student-demo', 'student_scholar', 'Verified Campus Student', 'student', 'B.Tech CSE @ PSG Tech', TRUE, FALSE, 'col-psg', 'PSG College of Technology', 'Just deployed our open-source campus community & college comparison matrix! Built with Next.js 16, TypeScript, and responsive Apple-style cards. Zero lag, full role-based permissions, and confidential grievance pipelines to institutions. Feedback welcomed! 🚀 #WebDev #NextJS #OpenSource', 'Student Project Showcase', NULL, '{"user-alumni-demo"}', 78, 0, 19, 'positive', 0.82, 3, FALSE, NULL, 'normal', 'distilbert-sst2 + toxic-bert', '2026-09-27T12:15:03.468Z')
ON CONFLICT (id) DO NOTHING;

-- 5. COMMUNITIES SEED
INSERT INTO public.communities (id, name, description, college_id, college_name, creator_id, creator_role, is_private, members_count, category, created_at)
VALUES ('comm-1', 'Tamil Nadu Student & Alumni Mentorship Circle', 'Direct knowledge sharing, resume reviews, and placement referrals across premier engineering colleges.', 'col-psg', 'PSG College of Technology', 'user-alumni-demo', 'alumni', FALSE, 240, 'mentoring', '2026-01-10T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.communities (id, name, description, college_id, college_name, creator_id, creator_role, is_private, members_count, category, created_at)
VALUES ('comm-2', 'Competitive Programming & Hackathons Network', 'Cross-college collaboration for Smart India Hackathons, ACM ICPC, and open-source project builds.', NULL, NULL, 'user-student-demo', 'student', FALSE, 195, 'general', '2026-02-05T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 6. DISCORD SERVERS SEED
INSERT INTO public.discord_servers (id, name, college_id, college_name, institution_owner_id, description, member_count, anti_ragebait_rules, channels)
VALUES ('server-psg-tech', 'PSG Tech Official Campus Server', 'col-psg', 'PSG College of Technology', 'user-inst-demo', 'Official institution-governed campus server. Structured department channels, placement guidance, and ragebait-shielded student discussion.', 840, '{"Zero harassment, name-calling, or inflammatory rhetoric.","Constructive academic criticism only with factual references.","Anti-ragebait slowmode enabled for constructive collegiate discussion.","Faculty grievances must be routed via Private Grievance to Institution ID."}', '[{"id":"ch-announcements","name":"Official Announcements","description":"Direct university broadcasts, exam dates, and semester schedules.","type":"announcements","isRagebaitProtected":true,"isAnnouncementOnly":true,"memberCount":840},{"id":"ch-anti-ragebait-forum","name":"ragebait-shielded-campus-hall","description":"Special discussion space strictly moderated to prevent toxicity.","type":"anti-ragebait","isRagebaitProtected":true,"memberCount":790},{"id":"ch-cse-mca-dept","name":"dept-computer-science-engineering","description":"Department projects, syllabus inquiries, and research lab coordination.","type":"department","isRagebaitProtected":false,"memberCount":312},{"id":"ch-placement-desk","name":"placement-interview-intel","description":"Real-time company interview reports, questions, and alumni tips.","type":"placements","isRagebaitProtected":true,"memberCount":650},{"id":"ch-alumni-mentoring","name":"alumni-career-guidance","description":"Alumni sharing industry experiences and advice for junior students.","type":"alumni-guide","isRagebaitProtected":false,"memberCount":420}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.discord_servers (id, name, college_id, college_name, institution_owner_id, description, member_count, anti_ragebait_rules, channels)
VALUES ('server-ceg-hub', 'CEG Anna University Campus Grid', 'col-ceg', 'College of Engineering, Guindy (CEG)', 'user-inst-demo', 'Official campus server for Anna University CEG students, alumni mentors, and faculty.', 650, '{"Maintain collegiate decorum at all times.","Strict prohibition of partisan hostility or unverified rumors."}', '[{"id":"ch-ceg-announcements","name":"CEG Official Broadcasts","description":"Official Anna University & CEG Dean office announcements.","type":"announcements","isRagebaitProtected":true,"isAnnouncementOnly":true,"memberCount":650},{"id":"ch-ceg-general","name":"campus-general","description":"General student discussions and campus life questions.","type":"general","isRagebaitProtected":false,"memberCount":580},{"id":"ch-ceg-ragebait","name":"moderated-student-concerns","description":"Shielded channel for campus queries with strict moderation.","type":"anti-ragebait","isRagebaitProtected":true,"memberCount":430}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. SERVER MESSAGES SEED
INSERT INTO public.server_messages (id, channel_id, author_id, author_name, author_role, author_headline, content, is_flagged_for_ragebait, created_at)
VALUES ('smsg-1', 'ch-announcements', 'user-inst-demo', 'PSG Tech Official Administration', 'institution', 'Official Administrative Desk', '🚨 Notice: End-semester lab practical schedules for engineering departments have been published on the student portal. Exam registrations close this Friday at 5:00 PM.', FALSE, '2026-09-27T16:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.server_messages (id, channel_id, author_id, author_name, author_role, author_headline, content, is_flagged_for_ragebait, created_at)
VALUES ('smsg-2', 'ch-placement-desk', 'user-alumni-demo', 'Alumni Industry Mentor', 'alumni', 'Senior Software Engineer @ Microsoft', 'For everyone preparing for tier-1 tech drives: Expect 1 online assessment on HackerRank (Array, Tree/Graph, and DP) followed by rounds testing clean code, edge cases, and time/space complexity.', FALSE, '2026-09-27T17:45:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.server_messages (id, channel_id, author_id, author_name, author_role, author_headline, content, is_flagged_for_ragebait, created_at)
VALUES ('smsg-3', 'ch-anti-ragebait-forum', 'user-student-demo', 'Verified Campus Student', 'student', 'B.Tech CSE @ PSG Tech', 'Constructive reminder for hostel residents: If facing Wi-Fi latency during peak study hours in Hostel Block 3, please register the room number on the IT welfare desk so APs can be rebalanced.', FALSE, '2026-09-27T18:30:03.468Z')
ON CONFLICT (id) DO NOTHING;

-- 8. GRIEVANCE REPORTS SEED
INSERT INTO public.grievance_reports (id, student_id, student_name, is_anonymous_to_faculty, target_institution_id, college_name, category, target_faculty_name, subject_or_course, detailed_complaint, status, institution_remarks, submitted_at)
VALUES ('grv-1', 'user-student-demo', 'Confidential Student ID', TRUE, 'col-psg', 'PSG College of Technology', 'lab_infrastructure', 'Central Lab Coordinator', 'Central Computing Facility GPU Allocation', 'High-performance workstation access in the GPU research cluster has experienced scheduling conflicts with regular lab sessions. Requesting designated evening slots for capstone project training.', 'action_taken', 'Lab slots reconfigured. Additional evening research window (5:30 PM - 8:30 PM) activated starting this Monday.', '2026-09-26T19:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.grievance_reports (id, student_id, student_name, is_anonymous_to_faculty, target_institution_id, college_name, category, target_faculty_name, subject_or_course, detailed_complaint, status, institution_remarks, submitted_at)
VALUES ('grv-2', 'user-arun', 'Confidential Student ID', TRUE, 'col-psg', 'PSG College of Technology', 'classroom_issue', 'Department Coordinator', 'Advanced Data Structures Lab (MCA-204)', 'Projector in CSE Room 304 flickers intermittently during algorithmic code walkthroughs.', 'under_investigation', 'Maintenance work order #4102 logged with campus electrical and IT team.', '2026-09-27T07:15:03.468Z')
ON CONFLICT (id) DO NOTHING;

-- 9. DIRECT MESSAGES SEED
INSERT INTO public.direct_messages (id, conversation_id, sender_id, receiver_id, content, is_read, liked, created_at)
VALUES ('dm-1', 'conv-user-alumni-demo-user-student-demo', 'user-student-demo', 'user-alumni-demo', 'Hello sir! Wanted to ask for guidance regarding system design and coding interview rounds for tech campus hiring.', TRUE, NULL, '2026-09-27T18:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.direct_messages (id, conversation_id, sender_id, receiver_id, content, is_read, liked, created_at)
VALUES ('dm-2', 'conv-user-alumni-demo-user-student-demo', 'user-alumni-demo', 'user-student-demo', 'Happy to help! Focus on strong fundamentals in Trees, Graphs, and DP on LeetCode. Also ensure you can explain your full-stack project architecture clearly!', TRUE, TRUE, '2026-09-27T18:30:03.468Z')
ON CONFLICT (id) DO NOTHING;

-- 10. STUDY ROOMS SEED
INSERT INTO public.study_rooms (id, title, subject, active_peer_count, max_participants, host_name, room_tag)
VALUES ('study-1', 'LeetCode Grind: Blind 75 Trees & Dynamic Programming', 'Algorithms & Coding Interview Prep', 14, 30, 'Verified Campus Student', 'LeetCode')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.study_rooms (id, title, subject, active_peer_count, max_participants, host_name, room_tag)
VALUES ('study-2', 'GATE 2027 CS Core Marathon: OS, DBMS & Networks', 'National Exam Preparation', 9, 25, 'Sanjay Kumar', 'GATE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.study_rooms (id, title, subject, active_peer_count, max_participants, host_name, room_tag)
VALUES ('study-3', 'Distributed Systems: Raft, Paxos & Consensus Deep Dive', 'CS402 Exam & Capstone Study', 18, 40, 'Aarav Patel', 'Deep Dive')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.study_rooms (id, title, subject, active_peer_count, max_participants, host_name, room_tag)
VALUES ('study-4', 'Machine Learning & Math for AI: Linear Algebra & Matrix Calculus', 'AI & Data Science Prep', 7, 20, 'Pooja Iyer', 'Exam Prep')
ON CONFLICT (id) DO NOTHING;

-- 11. COURSE QUESTIONS SEED
INSERT INTO public.course_questions (id, course_code, course_name, title, content, code_snippet, is_anonymous, author_id, author_name, upvotes, answers, created_at)
VALUES ('q-1', 'CS301', 'Data Structures & Algorithms', 'Why is Red-Black Tree maximum height bounded strictly by 2 * log2(n + 1)?', 'I understand the property that no two red nodes can appear consecutively, but can someone explain the mathematical derivation why the longest path is at most twice the shortest path?', '// Property 4: If a node is red, both children are black
// Property 5: For each node, all paths to descendants have the same black-height bh(x)
int black_height(Node* root);', FALSE, 'user-student-demo', 'Verified Campus Student', 18, '[{"id":"ans-1","questionId":"q-1","authorId":"user-faculty-demo","authorName":"Dr. Academic Faculty Guide","authorRole":"faculty","content":"Excellent question! Every path from root to leaf has the same black-height bh(x). The shortest possible path contains only black nodes (length = bh(x)). Because no two red nodes can be adjacent, the longest possible path must alternate red and black nodes, giving a maximum length of 2 * bh(x). By induction, a subtree with black-height bh contains at least 2^bh - 1 internal nodes, leading directly to height <= 2 * log2(n + 1).","createdAt":"2026-09-27T17:15:03.468Z","upvotes":24,"isFacultyEndorsed":true,"endorsedByName":"Dr. Academic Faculty Guide"}]'::jsonb, '2026-09-27T16:15:03.468Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.course_questions (id, course_code, course_name, title, content, code_snippet, is_anonymous, author_id, author_name, upvotes, answers, created_at)
VALUES ('q-2', 'CS402', 'Distributed Systems', 'How does Raft avoid split-brain scenario during transient network partitions?', 'When a network partition isolates the leader with a minority of nodes, how does the majority partition elect a new leader and prevent stale client writes from causing inconsistencies?', NULL, TRUE, 'anonymous-student', 'Anonymous Student', 12, '[{"id":"ans-2","questionId":"q-2","authorId":"user-alumni-demo","authorName":"Alumni Industry Mentor","authorRole":"alumni","content":"In Raft, a leader requires a strict majority (quorum: n/2 + 1) to commit an entry. The partitioned minority leader will never receive a majority of AppendEntries confirmations, so client writes to that partition remain uncommitted. Meanwhile, the majority side has quorum to elect a term-incremented leader and commit new entries. Once the partition heals, the old leader receives higher term heartbeats and steps down.","createdAt":"2026-09-27T15:15:03.468Z","upvotes":15,"isFacultyEndorsed":false}]'::jsonb, '2026-09-27T13:15:03.468Z')
ON CONFLICT (id) DO NOTHING;

-- 12. MARKETPLACE ITEMS SEED
INSERT INTO public.marketplace_items (id, title, category, price, is_free_or_swap, condition, seller_id, seller_name, seller_role, seller_contact, is_reserved, created_at)
VALUES ('m-1', 'CLRS Introduction to Algorithms (4th Edition - Hardcover)', 'textbook', 650, FALSE, 'like_new', 'user-alumni-demo', 'Alumni Industry Mentor', 'alumni', 'alumni@campuslenz.edu', FALSE, '2026-09-25T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.marketplace_items (id, title, category, price, is_free_or_swap, condition, seller_id, seller_name, seller_role, seller_contact, is_reserved, created_at)
VALUES ('m-2', 'Texas Instruments TI-Nspire CX II Graphing Calculator', 'equipment', 1200, FALSE, 'good', 'user-student-demo', 'Verified Campus Student', 'student', 'student@campuslenz.edu', FALSE, '2026-09-26T14:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.marketplace_items (id, title, category, price, is_free_or_swap, condition, seller_id, seller_name, seller_role, seller_contact, is_reserved, created_at)
VALUES ('m-3', 'Complete Handwritten Semester 6 Distributed Systems & OS Notes', 'notes', 0, TRUE, 'like_new', 'user-student-demo', 'Verified Campus Student', 'student', 'student@campuslenz.edu', FALSE, '2026-09-27T08:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.marketplace_items (id, title, category, price, is_free_or_swap, condition, seller_id, seller_name, seller_role, seller_contact, is_reserved, created_at)
VALUES ('m-4', 'Raspberry Pi 4 Model B (8GB) with Armor Heatsink & 64GB MicroSD', 'electronics', 2600, FALSE, 'like_new', 'user-student-demo', 'Verified Campus Student', 'student', 'student@campuslenz.edu', FALSE, '2026-09-24T18:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 13. ASSIGNMENT TASKS SEED
INSERT INTO public.assignment_tasks (id, title, course_code, due_date, urgency, is_completed, points)
VALUES ('task-1', 'Implement Raft Consensus Leader Election in Go', 'CS402', 'Tomorrow, 11:59 PM', 'urgent', FALSE, 100)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assignment_tasks (id, title, course_code, due_date, urgency, is_completed, points)
VALUES ('task-2', 'Solve 10 LeetCode Mediums on Graph & BFS/DFS', 'CS301', 'Oct 03, 2026', 'medium', TRUE, 50)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.assignment_tasks (id, title, course_code, due_date, urgency, is_completed, points)
VALUES ('task-3', 'Submit Final Research Capstone Project Synopsis', 'CS499', 'Oct 12, 2026', 'low', FALSE, 200)
ON CONFLICT (id) DO NOTHING;

-- 14. EXAM MILESTONES SEED
INSERT INTO public.exam_milestones (id, course_code, exam_name, exam_date, venue, remaining_days)
VALUES ('exam-1', 'CS402', 'Distributed Systems Mid-Semester Exam', 'Oct 14, 2026', 'Hall 302, Academic Block A', 17)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.exam_milestones (id, course_code, exam_name, exam_date, venue, remaining_days)
VALUES ('exam-2', 'CS301', 'Advanced Data Structures & Algorithms Lab Viva', 'Oct 22, 2026', 'Turing Computing Lab 2', 25)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.exam_milestones (id, course_code, exam_name, exam_date, venue, remaining_days)
VALUES ('exam-3', 'CS410', 'Compiler Design Theory End-Semester Exam', 'Nov 05, 2026', 'Main Auditorium', 39)
ON CONFLICT (id) DO NOTHING;

-- 15. MENTORSHIP SLOTS SEED
INSERT INTO public.mentorship_slots (id, alumni_id, alumni_name, alumni_company, topic, date_string, time_string, is_booked, booked_by_student_id, booked_by_student_name, notes)
VALUES ('slot-1', 'user-alumni-demo', 'Alumni Industry Mentor', 'Microsoft', 'resume_review', 'Sep 29, 2026', '6:00 PM - 6:30 PM', FALSE, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.mentorship_slots (id, alumni_id, alumni_name, alumni_company, topic, date_string, time_string, is_booked, booked_by_student_id, booked_by_student_name, notes)
VALUES ('slot-2', 'user-alumni-demo', 'Alumni Industry Mentor', 'Microsoft', 'mock_interview', 'Oct 01, 2026', '7:00 PM - 7:45 PM', TRUE, 'user-student-demo', 'Verified Campus Student', 'System Design for high-scale URL shortener with Redis caching')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.mentorship_slots (id, alumni_id, alumni_name, alumni_company, topic, date_string, time_string, is_booked, booked_by_student_id, booked_by_student_name, notes)
VALUES ('slot-3', 'user-alumni-demo', 'Alumni Industry Mentor', 'Microsoft', 'career_roadmap', 'Oct 04, 2026', '5:30 PM - 6:00 PM', FALSE, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 16. ALUMNI REFERRALS SEED
INSERT INTO public.alumni_referrals (id, alumni_id, alumni_name, company, role_title, job_type, location, min_gpa, batch_eligible, description, referral_requests_count, created_at)
VALUES ('ref-1', 'user-alumni-demo', 'Alumni Industry Mentor', 'Microsoft', 'Software Development Engineer (SDE-1)', 'Full-Time', 'Bengaluru / Hyderabad (Hybrid)', 8, '2025 - 2026', 'Looking to refer passionate backend/distributed systems graduates proficient in C++, C# or Java with solid algorithms foundations.', 8, '2026-09-24T12:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.alumni_referrals (id, alumni_id, alumni_name, company, role_title, job_type, location, min_gpa, batch_eligible, description, referral_requests_count, created_at)
VALUES ('ref-2', 'user-alumni-demo', 'Alumni Industry Mentor', 'Google', 'Associate Cloud Engineer Intern', 'Internship', 'Bengaluru', 8.5, '2026 - 2027', 'Summer internship opening on the Cloud Infrastructure and Kubernetes cluster management team. Strong OS and Networking basics expected.', 14, '2026-09-26T15:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 17. REFERRAL REQUESTS SEED
INSERT INTO public.referral_requests (id, referral_id, student_id, student_name, student_gpa, resume_link, note, status, submitted_at)
VALUES ('req-1', 'ref-1', 'user-student-demo', 'Verified Campus Student', 8.92, 'https://campuslenz.edu/resumes/verified_student_sde.pdf', 'Completed distributed cache project and solved 450+ LeetCode problems. Looking forward to interviewing for SDE-1.', 'pending', '2026-09-26T18:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 18. AMA EVENTS SEED
INSERT INTO public.ama_events (id, host_id, host_name, host_title, host_company, topic, scheduled_for, is_live, attendee_count, questions)
VALUES ('ama-1', 'user-alumni-demo', 'Alumni Industry Mentor', 'Senior Software Engineer', 'Microsoft', 'Breaking into Tier-1 Tech: How to clear Coding & System Design Interviews in 2026', 'Saturday, 7:00 PM IST', FALSE, 168, '[{"id":"ama-q-1","authorName":"student_scholar","question":"How critical is open-source contribution versus competitive programming for campus placements?","upvotes":28},{"id":"ama-q-2","authorName":"Anonymous Student","question":"What is the best way to structure the first 5 minutes of a system design interview with an interviewer?","upvotes":21}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 19. OFFICE HOUR QUEUE SEED
INSERT INTO public.office_hour_queue (id, student_id, student_name, course_code, topic, joined_at, status)
VALUES ('q-item-1', 'user-student-demo', 'Verified Campus Student', 'CS402', 'Clarification on Paxos two-phase commit abort sequence', '12 mins ago', 'waiting')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.office_hour_queue (id, student_id, student_name, course_code, topic, joined_at, status)
VALUES ('q-item-2', 'user-rahul', 'Rahul Sharma (Roll #2203)', 'CS301', 'Fibonacci Heap decrease-key amortized time proof', '28 mins ago', 'in_session')
ON CONFLICT (id) DO NOTHING;

-- 20. RESEARCH OPENINGS SEED
INSERT INTO public.research_openings (id, professor_id, professor_name, department, title, description, prerequisites, stipend_or_credits, min_gpa, status, applicants)
VALUES ('res-1', 'user-faculty-demo', 'Dr. Academic Faculty Guide', 'Computer Science & Engineering', 'Multimodal Deep Learning for Autonomous Navigation & Drone Vision', 'Funded undergraduate research position focusing on lightweight transformer models and LiDAR sensor fusion on edge devices.', 'Proficiency in PyTorch, Computer Vision, Matrix Calculus & Linux', '₹12,000 / month stipend + 4 Academic Research Credits', 8.2, 'open', '[{"id":"app-1","studentId":"user-student-demo","studentName":"Verified Campus Student","studentGpa":8.92,"statement":"I have built a YOLOv8 real-time object tracking project and completed Stanford CS231n coursework with top grades.","status":"pending","appliedAt":"2 days ago"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 21. LECTURE MATERIALS SEED
INSERT INTO public.lecture_materials (id, course_code, course_name, professor_name, title, version, changelog, file_url, uploaded_at, download_count)
VALUES ('lec-1', 'CS402', 'Distributed Systems', 'Dr. Academic Faculty Guide', 'Complete Lecture Handout: Consensus, Raft, Vector Clocks & Gossip Protocols', 'v2.1', 'Added animated state machine diagrams for split-vote recovery and log compaction.', '/materials/cs402_consensus_v2.1.pdf', '3 days ago', 218)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.lecture_materials (id, course_code, course_name, professor_name, title, version, changelog, file_url, uploaded_at, download_count)
VALUES ('lec-2', 'CS301', 'Data Structures & Algorithms', 'Dr. Academic Faculty Guide', 'Official Lab Manual: Graph Algorithms, Disjoint Sets & Dynamic Programming', 'v1.4', 'Updated benchmark test cases for Dijkstra, Bellman-Ford, and Tarjan SCC lab viva.', '/materials/cs301_lab_manual_v1.4.pdf', '1 week ago', 384)
ON CONFLICT (id) DO NOTHING;

-- 22. EMERGENCY BROADCASTS SEED
INSERT INTO public.emergency_broadcasts (id, institution_id, institution_name, severity, title, message, issued_at, active, target_audiences)
VALUES ('bc-1', 'user-inst-demo', 'PSG Tech Official Administration', 'notice', 'Extended 24/7 Library & Computing Center Hours for Upcoming Mid-Terms', 'Central Digital Library and High-Performance Compute Labs 1-4 will remain open 24/7 starting this Monday with uninterrupted power, campus Wi-Fi, and cafeteria services to support exam prep.', 'Today at 09:30 AM', TRUE, '{"Students","Faculty","Staff"}')
ON CONFLICT (id) DO NOTHING;

-- 23. AUDIT LOGS SEED
INSERT INTO public.audit_logs (id, admin_id, admin_name, action_type, target_entity, details, severity, timestamp)
VALUES ('log-1', 'user-admin-demo', 'Super System Administrator', 'SYSTEM_INITIALIZATION', 'Platform Core', 'Role governance matrix, E2E encryption channels, and anti-ragebait filters loaded.', 'info', '2026-09-27T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (id, admin_id, admin_name, action_type, target_entity, details, severity, timestamp)
VALUES ('log-2', 'user-admin-demo', 'Super System Administrator', 'EMERGENCY_BROADCAST_TRIGGERED', 'Campus Emergency Broadcast', 'PSG Tech Administration published 24/7 Library Hours advisory.', 'info', '2026-09-27T12:30:00Z')
ON CONFLICT (id) DO NOTHING;
