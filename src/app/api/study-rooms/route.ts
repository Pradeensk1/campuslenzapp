import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, rooms: [] }, { status: 500 });
  try {
    const { data, error } = await supabase.from('study_rooms').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message, rooms: [] }, { status: 400 });
    const rooms = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      activePeerCount: r.active_peer_count ?? 0,
      maxParticipants: r.max_participants ?? 30,
      hostName: r.host_name,
      roomTag: r.room_tag,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ success: true, count: rooms.length, rooms });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, rooms: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  try {
    const body = await request.json();
    const { id, title, subject, activePeerCount = 1, maxParticipants = 30, hostName, roomTag } = body;
    if (!title || !subject || !hostName) {
      return NextResponse.json({ success: false, message: 'Title, subject, and host are required' }, { status: 400 });
    }
    const payload: Record<string, any> = {
      title: title.trim(),
      subject: subject.trim(),
      active_peer_count: activePeerCount,
      max_participants: maxParticipants,
      host_name: hostName.trim(),
      room_tag: roomTag,
    };
    if (id) payload.id = id;
    const { data, error } = await supabase.from('study_rooms').insert(payload).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({
      success: true,
      room: {
        id: data.id,
        title: data.title,
        subject: data.subject,
        activePeerCount: data.active_peer_count ?? 0,
        maxParticipants: data.max_participants ?? 30,
        hostName: data.host_name,
        roomTag: data.room_tag,
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
