import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const { data: post, error: fetchErr } = await supabase
      .from('posts')
      .select('likes, likes_count')
      .eq('id', id)
      .single();

    if (fetchErr || !post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    const currentLikes: string[] = post.likes || [];
    const isLiked = currentLikes.includes(userId);
    let updatedLikes: string[];

    if (isLiked) {
      updatedLikes = currentLikes.filter((uid) => uid !== userId);
    } else {
      updatedLikes = [...currentLikes, userId];
    }

    const newLikesCount = Math.max(0, updatedLikes.length);

    const { error: updateErr } = await supabase
      .from('posts')
      .update({
        likes: updatedLikes,
        likes_count: newLikesCount,
      })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likesCount: newLikesCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
