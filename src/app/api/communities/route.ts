import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');
  const category = searchParams.get('category');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, communities: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('communities').select('*').order('members_count', { ascending: false });

    if (collegeId) query = query.eq('college_id', collegeId);
    if (category && category !== 'all') query = query.eq('category', category);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, communities: [] }, { status: 400 });
    }

    const communities = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      collegeId: c.college_id,
      collegeName: c.college_name,
      creatorId: c.creator_id,
      creatorRole: c.creator_role,
      isPrivate: Boolean(c.is_private),
      membersCount: c.members_count ?? 0,
      category: c.category || 'general',
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, count: communities.length, communities });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, communities: [] }, { status: 500 });
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
      name,
      description,
      collegeId,
      collegeName,
      creatorId,
      creatorRole = 'student',
      isPrivate = false,
      category = 'general',
    } = body;

    if (!name || !description) {
      return NextResponse.json({ success: false, message: 'Name and description are required' }, { status: 400 });
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      college_id: collegeId || null,
      college_name: collegeName || null,
      creator_id: creatorId || null,
      creator_role: creatorRole,
      is_private: isPrivate,
      members_count: 1,
      category,
    };

    const { data, error } = await supabase.from('communities').insert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Community created successfully',
      community: {
        id: data.id,
        name: data.name,
        description: data.description,
        collegeId: data.college_id,
        collegeName: data.college_name,
        creatorId: data.creator_id,
        creatorRole: data.creator_role,
        isPrivate: Boolean(data.is_private),
        membersCount: data.members_count ?? 1,
        category: data.category,
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
