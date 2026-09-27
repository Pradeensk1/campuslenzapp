import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const userId = searchParams.get('userId');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, messages: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('direct_messages').select('*').order('created_at', { ascending: true });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    } else if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, messages: [] }, { status: 400 });
    }

    const messages = (data || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      content: m.content,
      isRead: Boolean(m.is_read),
      liked: Boolean(m.liked),
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
    const { id, conversationId, senderId, receiverId, content } = body;

    if (!senderId || !receiverId || !content || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Sender, receiver, and content are required' }, { status: 400 });
    }

    const effectiveConvId = conversationId || `conv-${[senderId, receiverId].sort().join('-')}`;

    const payload: Record<string, any> = {
      conversation_id: effectiveConvId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
      is_read: false,
      liked: false,
    };

    if (id) {
      payload.id = id;
    }

    const { data, error } = await supabase.from('direct_messages').insert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        isRead: Boolean(data.is_read),
        liked: Boolean(data.liked),
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, liked, isRead } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Message ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (liked !== undefined) updates.liked = Boolean(liked);
    if (isRead !== undefined) updates.is_read = Boolean(isRead);

    const { data, error } = await supabase
      .from('direct_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
