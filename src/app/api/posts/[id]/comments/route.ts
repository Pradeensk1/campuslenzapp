import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, comments: [] }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message, comments: [] }, { status: 400 });
    }

    const comments = (data || []).map((c: any) => ({
      id: c.id,
      postId: c.post_id,
      authorId: c.author_id,
      authorUsername: c.author_username,
      authorName: c.author_name,
      authorRole: c.author_role,
      authorHeadline: c.author_headline,
      avatarUrl: c.avatar_url,
      isVerifiedAuthor: Boolean(c.is_verified_author),
      content: c.content,
      likesCount: c.likes_count ?? 0,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, count: comments.length, comments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, comments: [] }, { status: 500 });
  }
}

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
    const body = await request.json();
    const {
      id: commentId,
      authorId,
      authorUsername,
      authorName,
      authorRole = 'student',
      authorHeadline,
      avatarUrl,
      isVerifiedAuthor = false,
      content,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Comment content cannot be empty' }, { status: 400 });
    }

    // Resolve author_id from profiles if possible
    let resolvedAuthorId: string | null = authorId || null;
    if (resolvedAuthorId) {
      const { data: pCheck } = await supabase.from('profiles').select('id').eq('id', resolvedAuthorId).maybeSingle();
      if (!pCheck) resolvedAuthorId = null;
    }
    if (!resolvedAuthorId && authorUsername) {
      const { data: pCheck } = await supabase.from('profiles').select('id').ilike('username', authorUsername).maybeSingle();
      if (pCheck) resolvedAuthorId = pCheck.id;
    }

    const commentPayload: Record<string, any> = {
      post_id: id,
      author_id: resolvedAuthorId,
      author_username: authorUsername,
      author_name: authorName,
      author_role: authorRole,
      author_headline: authorHeadline,
      avatar_url: avatarUrl,
      is_verified_author: isVerifiedAuthor,
      content: content.trim(),
      likes_count: 0,
    };

    if (commentId) {
      commentPayload.id = commentId;
    }

    const { data: newComment, error: insertErr } = await supabase
      .from('comments')
      .insert(commentPayload)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 400 });
    }

    // Increment comments_count on post
    const { data: currentPost } = await supabase.from('posts').select('comments_count').eq('id', id).maybeSingle();
    const currentCount = currentPost?.comments_count || 0;
    await supabase.from('posts').update({ comments_count: currentCount + 1 }).eq('id', id);

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        postId: newComment.post_id,
        authorId: newComment.author_id || (newComment.author_username ? `user-${newComment.author_username}` : newComment.id),
        authorUsername: newComment.author_username,
        authorName: newComment.author_name,
        authorRole: newComment.author_role || 'student',
        authorHeadline: newComment.author_headline,
        avatarUrl: newComment.avatar_url,
        isVerifiedAuthor: Boolean(newComment.is_verified_author),
        content: newComment.content,
        likesCount: newComment.likes_count ?? 0,
        createdAt: newComment.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
