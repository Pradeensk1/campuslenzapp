import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { runUnifiedAIModeration, DEFAULT_AI_MODEL_SETTINGS } from '@/lib/aiModerationModels';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');
  const role = searchParams.get('role');
  const sentiment = searchParams.get('sentiment');
  const limit = parseInt(searchParams.get('limit') || '40', 10);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, posts: [] }, { status: 500 });
  }

  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_quarantined', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (collegeId) query = query.eq('college_id', collegeId);
    if (role && role !== 'all') query = query.eq('author_role', role);
    if (sentiment && sentiment !== 'all') query = query.eq('sentiment', sentiment);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message, posts: [] }, { status: 400 });
    }

    const postIds = (data || []).map((r: any) => r.id);
    const commentsByPostId: Record<string, any[]> = {};

    if (postIds.length > 0) {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      if (commentsData) {
        for (const c of commentsData) {
          if (!commentsByPostId[c.post_id]) {
            commentsByPostId[c.post_id] = [];
          }
          commentsByPostId[c.post_id].push({
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

    const posts = (data || []).map((row: any) => {
      const postComments = commentsByPostId[row.id] || [];
      return {
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
        likesCount: row.likes_count ?? (Array.isArray(row.likes) ? row.likes.length : 0),
        comments: postComments,
        commentsCount: postComments.length || (row.comments_count ?? 0),
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
      };
    });

    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, posts: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database client offline.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      id,
      content,
      imageUrl,
      authorId,
      authorUsername,
      authorName,
      authorRole = 'student',
      authorHeadline,
      isVerifiedAuthor = false,
      isAnonymous = false,
      collegeId,
      collegeName,
      topic,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Content cannot be empty.' }, { status: 400 });
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

    // Resolve college_id against colleges table to prevent foreign key errors
    let resolvedCollegeId: string | null = collegeId || null;
    if (resolvedCollegeId) {
      const { data: cCheck } = await supabase.from('colleges').select('id').eq('id', resolvedCollegeId).maybeSingle();
      if (!cCheck) resolvedCollegeId = null;
    }

    // Run Automated Open-Source AI Moderation
    const aiResult = runUnifiedAIModeration(content, imageUrl, DEFAULT_AI_MODEL_SETTINGS);

    // Severe toxicity check (Automatic rejection)
    if (aiResult.actionRecommended === 'auto_ban' || aiResult.toxicity.score >= DEFAULT_AI_MODEL_SETTINGS.autoBanThreshold) {
      return NextResponse.json(
        {
          success: false,
          policyViolation: true,
          actionRecommended: 'auto_ban',
          message: `🚨 Post rejected by unitary/toxic-bert model due to severe toxicity violation (Toxicity: ${aiResult.toxicity.score}%). Account cooldown enforced.`,
        },
        { status: 422 }
      );
    }

    const isSensitive = aiResult.isSensitive || aiResult.toxicity.score >= DEFAULT_AI_MODEL_SETTINGS.blurThreshold;
    const isQuarantined = aiResult.actionRecommended === 'quarantine';

    const resolvedTopic = topic || (aiResult.classification?.category && aiResult.classification.category !== 'General'
      ? aiResult.classification.category
      : (authorRole === 'faculty' ? 'Academic Guidance' : 'Campus Discussion'));

    const postPayload: Record<string, any> = {
      author_id: resolvedAuthorId,
      author_username: authorUsername,
      author_name: authorName,
      author_role: authorRole,
      author_headline: authorHeadline,
      is_verified_author: isVerifiedAuthor,
      is_anonymous: isAnonymous,
      college_id: resolvedCollegeId,
      college_name: collegeName,
      content: content.trim(),
      topic: resolvedTopic,
      image_url: imageUrl || null,
      likes: [],
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      sentiment: aiResult.sentiment.label,
      sentiment_score: aiResult.sentiment.polarity,
      toxicity_score: aiResult.toxicity.score,
      is_sensitive: isSensitive,
      sensitive_reason: aiResult.actionReason,
      is_quarantined: isQuarantined,
      ai_model_metadata: `campus-lenz-ai + ${aiResult.sentiment.model} + ${aiResult.toxicity.model}${aiResult.imageSafety ? ' + ' + aiResult.imageSafety.model : ''}`,
      moderation_status: isSensitive ? 'sensitive' : 'normal',
    };

    if (id) {
      postPayload.id = id;
    }

    const { data, error } = await supabase.from('posts').insert(postPayload).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const mappedPost = {
      id: data.id,
      authorId: data.author_id || (data.author_username ? `user-${data.author_username}` : data.id),
      authorUsername: data.author_username,
      authorName: data.author_name,
      authorRole: data.author_role || 'student',
      authorHeadline: data.author_headline,
      isVerifiedAuthor: Boolean(data.is_verified_author),
      isAnonymous: Boolean(data.is_anonymous),
      collegeId: data.college_id,
      collegeName: data.college_name,
      content: data.content,
      topic: data.topic,
      imageUrl: data.image_url,
      likes: Array.isArray(data.likes) ? data.likes : [],
      likesCount: data.likes_count ?? 0,
      comments: [],
      commentsCount: 0,
      sharesCount: data.shares_count ?? 0,
      repostedUserIds: Array.isArray(data.reposted_user_ids) ? data.reposted_user_ids : [],
      moderationStatus: data.moderation_status || 'normal',
      sentiment: data.sentiment || 'neutral',
      sentimentScore: data.sentiment_score ?? 0,
      toxicityScore: data.toxicity_score ?? 0,
      isSensitive: Boolean(data.is_sensitive),
      sensitiveReason: data.sensitive_reason,
      isQuarantined: Boolean(data.is_quarantined),
      aiModelMetadata: data.ai_model_metadata,
      createdAt: data.created_at || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Post published successfully to cloud feed.',
      post: mappedPost,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
