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

    const posts = (data || []).map((row: any) => ({
      id: row.id,
      authorId: row.author_id || (row.author_username ? `user-${row.author_username}` : row.id),
      authorUsername: row.author_username,
      authorName: row.author_name,
      authorRole: row.author_role,
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
      comments: [],
      commentsCount: row.comments_count ?? 0,
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

    const postPayload = {
      author_id: resolvedAuthorId,
      author_username: authorUsername,
      author_name: authorName,
      author_role: authorRole,
      author_headline: authorHeadline,
      is_verified_author: isVerifiedAuthor,
      is_anonymous: isAnonymous,
      college_id: collegeId,
      college_name: collegeName,
      content: content.trim(),
      topic: topic || (authorRole === 'faculty' ? 'Academic Guidance' : 'Campus Discussion'),
      image_url: imageUrl,
      sentiment: aiResult.sentiment.label,
      sentiment_score: aiResult.sentiment.polarity,
      toxicity_score: aiResult.toxicity.score,
      is_sensitive: isSensitive,
      sensitive_reason: aiResult.actionReason,
      is_quarantined: isQuarantined,
      ai_model_metadata: `${aiResult.sentiment.model} + ${aiResult.toxicity.model}${aiResult.imageSafety ? ' + ' + aiResult.imageSafety.model : ''}`,
      moderation_status: isSensitive ? 'sensitive' : 'normal',
    };

    const { data, error } = await supabase.from('posts').insert(postPayload).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Post published successfully to cloud feed.',
      post: data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
