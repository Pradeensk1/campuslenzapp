import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .maybeSingle();

    if (!profile) {
      const res = await supabase.from('profiles').select('*').eq('id', username).maybeSingle();
      profile = res.data;
      error = res.error;
    }

    if (error || !profile) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Fetch user's posts
    const { data: userPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_username', profile.username)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        headline: profile.headline,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        collegeId: profile.college_id,
        collegeName: profile.college_name,
        department: profile.department,
        course: profile.course,
        graduationBatch: profile.graduation_batch,
        isVerified: Boolean(profile.is_verified),
        followersCount: profile.followers_count ?? 0,
        followingCount: profile.following_count ?? 0,
        followers: profile.followers || [],
        following: profile.following || [],
        isBanned: Boolean(profile.is_banned),
        strikesCount: profile.strikes_count ?? 0,
        createdAt: profile.created_at,
      },
      posts: (userPosts || []).map((p: any) => ({
        id: p.id,
        authorId: p.author_id,
        authorUsername: p.author_username,
        authorName: p.author_name,
        authorRole: p.author_role,
        authorHeadline: p.author_headline,
        isVerifiedAuthor: Boolean(p.is_verified_author),
        isAnonymous: Boolean(p.is_anonymous),
        collegeId: p.college_id,
        collegeName: p.college_name,
        content: p.content,
        topic: p.topic,
        imageUrl: p.image_url,
        likes: p.likes || [],
        likesCount: p.likes_count ?? 0,
        commentsCount: p.comments_count ?? 0,
        sharesCount: p.shares_count ?? 0,
        moderationStatus: p.moderation_status || 'normal',
        sentiment: p.sentiment || 'neutral',
        sentimentScore: p.sentiment_score ?? 0,
        toxicityScore: p.toxicity_score ?? 0,
        isSensitive: Boolean(p.is_sensitive),
        createdAt: p.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const updateFields: Record<string, any> = {};

    if (body.fullName !== undefined) updateFields.full_name = body.fullName;
    if (body.headline !== undefined) updateFields.headline = body.headline;
    if (body.bio !== undefined) updateFields.bio = body.bio;
    if (body.avatarUrl !== undefined) updateFields.avatar_url = body.avatarUrl;
    if (body.collegeId !== undefined) updateFields.college_id = body.collegeId;
    if (body.collegeName !== undefined) updateFields.college_name = body.collegeName;
    if (body.department !== undefined) updateFields.department = body.department;
    if (body.course !== undefined) updateFields.course = body.course;
    if (body.graduationBatch !== undefined) updateFields.graduation_batch = body.graduationBatch;
    if (body.isBanned !== undefined) updateFields.is_banned = body.isBanned;
    if (body.strikesCount !== undefined) updateFields.strikes_count = body.strikesCount;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateFields)
      .ilike('username', username)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
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
