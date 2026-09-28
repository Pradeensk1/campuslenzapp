import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import HomePageClient from './HomePageClient';
import { INITIAL_POSTS } from '@/lib/mockData';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: postsData } = await supabase
    .from('posts')
    .select('*')
    .eq('is_quarantined', false)
    .order('created_at', { ascending: false })
    .limit(40);

  const postIds = (postsData || []).map((p: any) => p.id);
  const commentsByPost: Record<string, any[]> = {};

  if (postIds.length > 0) {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    if (commentsData) {
      for (const c of commentsData) {
        if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
        commentsByPost[c.post_id].push({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          authorUsername: c.author_username,
          authorName: c.author_name,
          authorRole: c.author_role || 'student',
          authorHeadline: c.author_headline,
          avatarUrl: c.avatar_url,
          isVerifiedAuthor: Boolean(c.is_verified_author),
          content: c.content,
          likesCount: c.likes_count ?? 0,
          createdAt: c.created_at,
        });
      }
    }
  }

  const posts = (postsData || []).map((row: any) => ({
    id: row.id,
    authorId: row.author_id || (row.author_username ? `user-${row.author_username}` : row.id),
    authorUsername: row.author_username,
    authorName: row.author_name,
    authorRole: row.author_role || 'student',
    authorHeadline: row.author_headline,
    isVerifiedAuthor: Boolean(row.is_verified_author),
    isAnonymous: Boolean(row.is_anonymous),
    collegeId: row.college_id,
    collegeName: row.college_name,
    content: row.content,
    topic: row.topic,
    imageUrl: row.image_url,
    likes: Array.isArray(row.likes) ? row.likes : [],
    likesCount: row.likes_count ?? 0,
    comments: commentsByPost[row.id] || [],
    commentsCount: (commentsByPost[row.id] || []).length || (row.comments_count ?? 0),
    sharesCount: row.shares_count ?? 0,
    repostedUserIds: Array.isArray(row.reposted_user_ids) ? row.reposted_user_ids : [],
    moderationStatus: row.moderation_status || 'normal',
    sentiment: row.sentiment || 'neutral',
    sentimentScore: row.sentiment_score ?? 0,
    toxicityScore: row.toxicity_score ?? 0,
    isSensitive: Boolean(row.is_sensitive),
    sensitiveReason: row.sensitive_reason,
    isQuarantined: Boolean(row.is_quarantined),
    aiModelMetadata: row.ai_model_metadata,
    createdAt: row.created_at || new Date().toISOString(),
  }));

  const { data: colleges } = await supabase
    .from('colleges')
    .select('*')
    .order('rating_average', { ascending: false });

  return <HomePageClient initialPosts={posts.length > 0 ? posts : INITIAL_POSTS} initialColleges={colleges || []} />;
}
