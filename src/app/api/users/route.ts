import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const role = searchParams.get('role');
  const collegeId = searchParams.get('collegeId');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, users: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('profiles').select('*').order('followers_count', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    } else {
      query = query.neq('role', 'admin');
    }
    if (collegeId) query = query.eq('college_id', collegeId);
    if (q) {
      query = query.or(`username.ilike.%${q}%,full_name.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, users: [] }, { status: 400 });
    }

    const users = (data || [])
      .filter((u: any) => u.role !== 'admin')
      .map((u: any) => {
        let userBio = u.bio || '';
        let userSkills: string[] | undefined = undefined;
        const skillsMatch = userBio.match(/<!--SKILLS-->([\s\S]*)$/);
        if (skillsMatch) {
          try {
            userSkills = JSON.parse(skillsMatch[1]);
            userBio = userBio.replace(/\s*<!--SKILLS-->[\s\S]*$/, '').trim();
          } catch {}
        }
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          fullName: u.full_name,
          headline: u.headline,
          bio: userBio,
          skills: userSkills,
          avatarUrl: u.avatar_url,
          collegeId: u.college_id,
          collegeName: u.college_name,
          department: u.department,
          course: u.course,
          graduationBatch: u.graduation_batch,
          isVerified: Boolean(u.is_verified),
          followersCount: u.followers_count ?? 0,
          followingCount: u.following_count ?? 0,
          followers: u.followers || [],
          following: u.following || [],
          isBanned: Boolean(u.is_banned),
          strikesCount: u.strikes_count ?? 0,
          createdAt: u.created_at,
        };
      });

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, users: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      id: userId,
      username,
      email,
      fullName,
      role = 'student',
      headline,
      bio,
      collegeId,
      collegeName,
      department,
      course,
      graduationBatch,
    } = body;

    const effectiveFullName = fullName || body.name;

    if (!username || !effectiveFullName) {
      return NextResponse.json({ success: false, message: 'Username and Full Name are required' }, { status: 400 });
    }

    // Check if username already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Account profile already synchronized.',
        user: {
          id: existing.id,
          username: existing.username,
          email: existing.email,
          role: existing.role,
          fullName: existing.full_name,
          headline: existing.headline,
          bio: existing.bio,
          avatarUrl: existing.avatar_url,
          collegeId: existing.college_id,
          collegeName: existing.college_name,
          department: existing.department,
          course: existing.course,
          graduationBatch: existing.graduation_batch,
          isVerified: Boolean(existing.is_verified),
          followersCount: existing.followers_count ?? 0,
          followingCount: existing.following_count ?? 0,
          followers: existing.followers || [],
          following: existing.following || [],
          isBanned: Boolean(existing.is_banned),
          strikesCount: existing.strikes_count ?? 0,
          createdAt: existing.created_at,
        },
      });
    }

    // Sanitize college_id
    let resolvedCollegeId: string | null = collegeId || null;
    if (resolvedCollegeId) {
      const { data: cCheck } = await supabase.from('colleges').select('id').eq('id', resolvedCollegeId).maybeSingle();
      if (!cCheck) resolvedCollegeId = null;
    }

    const newProfile: Record<string, any> = {
      username: username.trim().toLowerCase(),
      email: email || null,
      full_name: effectiveFullName.trim(),
      role,
      headline: headline || `${course || role} @ ${collegeName || 'Campus'}`,
      bio: bio || '',
      college_id: resolvedCollegeId,
      college_name: collegeName || null,
      department: department || null,
      course: course || null,
      graduation_batch: graduationBatch || null,
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      followers: [],
      following: [],
      is_banned: false,
      strikes_count: 0,
    };

    if (userId) {
      newProfile.id = userId;
    }

    const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'User profile registered successfully',
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        fullName: data.full_name,
        headline: data.headline,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        collegeId: data.college_id,
        collegeName: data.college_name,
        department: data.department,
        course: data.course,
        graduationBatch: data.graduation_batch,
        isVerified: Boolean(data.is_verified),
        followersCount: data.followers_count ?? 0,
        followingCount: data.following_count ?? 0,
        followers: data.followers || [],
        following: data.following || [],
        isBanned: Boolean(data.is_banned),
        strikesCount: data.strikes_count ?? 0,
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
