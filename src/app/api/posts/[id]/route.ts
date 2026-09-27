import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        authorId: post.author_id,
        authorUsername: post.author_username,
        authorName: post.author_name,
        authorRole: post.author_role,
        authorHeadline: post.author_headline,
        isVerifiedAuthor: Boolean(post.is_verified_author),
        isAnonymous: Boolean(post.is_anonymous),
        collegeId: post.college_id,
        collegeName: post.college_name,
        content: post.content,
        topic: post.topic,
        imageUrl: post.image_url,
        likes: post.likes || [],
        likesCount: post.likes_count ?? 0,
        commentsCount: post.comments_count ?? 0,
        sharesCount: post.shares_count ?? 0,
        moderationStatus: post.moderation_status || 'normal',
        sentiment: post.sentiment || 'neutral',
        sentimentScore: post.sentiment_score ?? 0,
        toxicityScore: post.toxicity_score ?? 0,
        isSensitive: Boolean(post.is_sensitive),
        sensitiveReason: post.sensitive_reason,
        isQuarantined: Boolean(post.is_quarantined),
        aiModelMetadata: post.ai_model_metadata,
        createdAt: post.created_at,
        comments: (comments || []).map((c: any) => ({
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
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
