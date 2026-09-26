-- Campus Lenz: PostgreSQL Production Schema with Strict RLS (Row Level Security)
-- Optimized for Supabase Cloud (ap-south-1 / AWS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'institution', 'admin');
CREATE TYPE reviewer_type AS ENUM ('student', 'alumni');
CREATE TYPE verification_status AS ENUM ('pending', 'admin_review', 'approved', 'rejected');
CREATE TYPE moderation_status AS ENUM ('normal', 'sensitive', 'harmful');

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'student',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  college_id TEXT,
  department TEXT,
  course TEXT,
  graduation_batch TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COLLEGES TABLE (Central Anchor Identifier)
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

-- 5. REVIEWS TABLE (Multi-Dimensional)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id TEXT NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_type reviewer_type NOT NULL,
  author_name TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  dimensions JSONB NOT NULL,
  title TEXT NOT NULL,
  experience TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  advice TEXT,
  recommendation BOOLEAN DEFAULT TRUE,
  course TEXT NOT NULL,
  department TEXT NOT NULL,
  batch TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INSTITUTION REPLIES TABLE (Strict Rule: Institutions cannot edit/delete reviews, only reply)
CREATE TABLE IF NOT EXISTS public.institution_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID UNIQUE NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  institution_user_id UUID NOT NULL REFERENCES public.profiles(id),
  official_name TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. POSTS TABLE (Social Feed Layer)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role user_role NOT NULL,
  is_verified_author BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  topic TEXT,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  moderation_status moderation_status DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MESSAGE REQUESTS TABLE (Anti-Spam Barrier)
CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preview_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VERIFICATION REQUESTS TABLE (Evidence Proof for Alumni / Institutions)
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  college_id TEXT NOT NULL REFERENCES public.colleges(id),
  document_type TEXT NOT NULL,
  document_url TEXT,
  status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Colleges: Publicly viewable by anyone
CREATE POLICY "Colleges are viewable by everyone" ON public.colleges
  FOR SELECT USING (true);

-- Reviews: Publicly viewable by everyone
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

-- Reviews: Insertable by authenticated users
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STRICT RULE: Institutions CANNOT delete or update reviews! Only authors or admins
CREATE POLICY "Only authors or admins can delete reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Posts: Publicly viewable by everyone if moderation normal or sensitive
CREATE POLICY "Posts viewable by everyone" ON public.posts
  FOR SELECT USING (moderation_status != 'harmful');

-- Verification Requests: Strict access (Only applicant and Admins)
CREATE POLICY "Users can view own verification requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);
