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
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    const { data: post, error: fetchErr } = await supabase
      .from('posts')
      .select('id, shares_count')
      .eq('id', id)
      .single();

    if (fetchErr || !post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    const newSharesCount = (post.shares_count || 0) + 1;

    const { error: updateErr } = await supabase
      .from('posts')
      .update({ shares_count: newSharesCount })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sharesCount: newSharesCount,
      userId,
      message: 'Post reposted successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
