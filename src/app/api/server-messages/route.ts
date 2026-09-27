import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, messages: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('server_messages').select('*').order('created_at', { ascending: true });

    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, messages: [] }, { status: 400 });
    }

    const messages = (data || []).map((m: any) => ({
      id: m.id,
      channelId: m.channel_id,
      authorId: m.author_id,
      authorName: m.author_name,
      authorRole: m.author_role || 'student',
      authorHeadline: m.author_headline,
      content: m.content,
      isFlaggedForRagebait: Boolean(m.is_flagged_for_ragebait),
      createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, count: messages.length, messages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, channelId, authorId, authorName, authorRole = 'student', authorHeadline, content, isFlaggedForRagebait = false } = body;

    if (!channelId || !content || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Channel ID and content are required' }, { status: 400 });
    }

    // Resolve author_id against profiles
    let resolvedAuthorId: string | null = authorId || null;
    if (resolvedAuthorId) {
      const { data: pCheck } = await supabase.from('profiles').select('id').eq('id', resolvedAuthorId).maybeSingle();
      if (!pCheck) resolvedAuthorId = null;
    }

    const payload: Record<string, any> = {
      channel_id: channelId,
      author_id: resolvedAuthorId,
      author_name: authorName || 'Student',
      author_role: authorRole,
      author_headline: authorHeadline,
      content: content.trim(),
      is_flagged_for_ragebait: Boolean(isFlaggedForRagebait),
    };

    if (id) {
      payload.id = id;
    }

    const { data, error } = await supabase.from('server_messages').insert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: data.id,
        channelId: data.channel_id,
        authorId: data.author_id,
        authorName: data.author_name,
        authorRole: data.author_role || 'student',
        authorHeadline: data.author_headline,
        content: data.content,
        isFlaggedForRagebait: Boolean(data.is_flagged_for_ragebait),
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
