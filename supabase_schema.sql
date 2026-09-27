-- ========================================================
-- CAMPUS LENZ: COMPLETE POSTGRESQL PRODUCTION SCHEMA
-- Includes AI Moderation, Role Personas, and Full RLS
-- Project Ref: kyllejmstjsefijyuaew
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING OBJECTS SAFELY IF RE-RUNNING
-- DROP TABLE IF EXISTS public.audit_logs CASCADE;
-- DROP TABLE IF EXISTS public.grievance_reports CASCADE;
-- DROP TABLE IF EXISTS public.comments CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;
-- DROP TABLE IF EXISTS public.institution_replies CASCADE;
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.colleges CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'alumni', 'faculty', 'institution', 'admin')),
  full_name TEXT NOT NULL,
  headline TEXT,
  avatar_url TEXT,
  college_id TEXT,
  college_name TEXT,
  department TEXT,
  course TEXT,
  graduation_batch TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  strikes_count INT DEFAULT 0,
  last_strike_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COLLEGES TABLE
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id TEXT NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_type TEXT NOT NULL DEFAULT 'student',
  author_name TEXT NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POSTS TABLE (With Open-Source AI Sentiment & Toxicity Telemetry)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative', 'ragebait', 'toxic')),
  sentiment_score NUMERIC DEFAULT 0,
  toxicity_score INT DEFAULT 0,
  is_sensitive BOOLEAN DEFAULT FALSE,
  sensitive_reason TEXT,
  is_quarantined BOOLEAN DEFAULT FALSE,
  ai_model_metadata TEXT,
  moderation_status TEXT DEFAULT 'normal' CHECK (moderation_status IN ('normal', 'sensitive', 'harmful')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'student',
  author_username TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT,
  admin_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GRIEVANCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.grievance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT,
  college_id TEXT NOT NULL REFERENCES public.colleges(id),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_investigation', 'resolved', 'action_taken')),
  is_confidential BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE REALTIME & ROW LEVEL SECURITY
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_reports ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for seamless student app experience
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public read colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (is_quarantined = false);
CREATE POLICY "Public insert posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Public delete posts" ON public.posts FOR DELETE USING (true);

CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read grievances" ON public.grievance_reports FOR SELECT USING (true);
CREATE POLICY "Public insert grievances" ON public.grievance_reports FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime Broadcasting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

-- ========================================================
-- BASELINE SEED DATA
-- ========================================================

INSERT INTO public.colleges (id, slug, name, location, state, college_type, established_year, rating_average, review_count, facilities)
VALUES 
  ('col-mit', 'anna-university-mit-campus', 'Madras Institute of Technology (MIT Campus)', 'Chromepet, Chennai', 'Tamil Nadu', 'State University Autonomous', 1949, 4.6, 128, ARRAY['Robotics Hangar', 'Aero Wind Tunnel', 'High-Speed Wi-Fi', 'Central Library']),
  ('col-psg', 'psg-college-of-technology', 'PSG College of Technology', 'Peelamedu, Coimbatore', 'Tamil Nadu', 'Govt Aided Autonomous', 1951, 4.7, 240, ARRAY['Industry 4.0 Center', 'CNC Machine Lab', 'Hostel Gym', 'Innovation Hub']),
  ('col-iitm', 'iit-madras', 'Indian Institute of Technology Madras (IITM)', 'Guindy, Chennai', 'Tamil Nadu', 'Institute of National Importance (INI)', 1959, 4.9, 412, ARRAY['IITM Research Park', 'Supercomputing Lab', 'Olympic Swimming Pool', 'Open Air Theatre'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, headline, college_id, college_name, followers_count, following_count)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'sarah_mit', 'Sarah Jenkins', 'student', 'Final Year Aerospace @ MIT Campus | CubeSat Lead', 'col-mit', 'Madras Institute of Technology', 342, 120),
  ('a0000000-0000-0000-0000-000000000002', 'karthik_alumni', 'Karthik Subramanian', 'alumni', 'SDE-II @ Microsoft | MIT Aerospace Alum', 'col-mit', 'Madras Institute of Technology', 890, 210),
  ('a0000000-0000-0000-0000-000000000003', 'dr_ramanathan', 'Dr. S. Ramanathan', 'faculty', 'Professor & HoD of Computing @ PSG Tech', 'col-psg', 'PSG College of Technology', 450, 45),
  ('a0000000-0000-0000-0000-000000000004', 'admin_psg', 'PSG Tech Dean Office', 'institution', 'Official Verified Institutional Account', 'col-psg', 'PSG College of Technology', 1200, 10),
  ('a0000000-0000-0000-0000-000000000005', 'admin_master', 'Campus Lenz System Admin', 'admin', 'Root Governance & Platform Security Officer', NULL, 'Campus Lenz Global', 99, 99)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, author_username, author_name, author_role, author_headline, content, sentiment, sentiment_score, toxicity_score, is_sensitive, likes_count, comments_count)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'sarah_mit', 'Sarah Jenkins', 'student', 'Final Year Aerospace @ MIT Campus', 'Our student team successfully integrated the solar telemetry array for the campus CubeSat project! Big thanks to faculty advisors.', 'positive', 0.98, 2, false, 84, 12),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'karthik_alumni', 'Karthik Subramanian', 'alumni', 'SDE-II @ Microsoft', 'Opening 3 software engineering internship referral slots for students proficient in TypeScript, React and cloud architectures. DM your resume link.', 'positive', 0.94, 1, false, 142, 28),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'sarah_mit', 'Sarah Jenkins', 'student', 'Final Year Aerospace @ MIT Campus', 'The cafeteria mess food was absolutely terrible today! Complete rip off and boycott needed right now.', 'ragebait', 0.82, 54, true, 23, 19)
ON CONFLICT (id) DO NOTHING;
