import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { analyzeReviewAspects } from '@/lib/aiModerationModels';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');
  const userId = searchParams.get('userId');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, reviews: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (collegeId) query = query.eq('college_id', collegeId);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, reviews: [] }, { status: 400 });
    }

    const reviews = (data || []).map((r: any) => ({
      id: r.id,
      collegeId: r.college_id,
      userId: r.user_id,
      reviewerType: r.reviewer_type,
      authorName: r.author_name,
      authorUsername: r.author_username,
      isAnonymous: Boolean(r.is_anonymous),
      overallRating: r.overall_rating,
      dimensions: r.dimensions || {},
      title: r.title,
      experience: r.experience,
      pros: r.pros || [],
      cons: r.cons || [],
      advice: r.advice,
      recommendation: Boolean(r.recommendation),
      course: r.course,
      department: r.department,
      batch: r.batch,
      institutionReply: r.institution_reply || null,
      helpfulCount: r.helpful_count || 0,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, reviews: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      id: reviewId,
      collegeId,
      userId,
      reviewerType = 'student',
      authorName,
      authorUsername,
      isAnonymous = false,
      overallRating,
      dimensions,
      title,
      experience,
      pros = [],
      cons = [],
      advice,
      recommendation = true,
      course,
      department,
      batch,
    } = body;

    if (!authorName || !title || !experience || !overallRating) {
      return NextResponse.json({ success: false, message: 'Missing required review fields' }, { status: 400 });
    }

    // Resolve college_id
    let resolvedCollegeId: string = collegeId || 'col-psg';
    const { data: cCheck } = await supabase.from('colleges').select('id').eq('id', resolvedCollegeId).maybeSingle();
    if (!cCheck) {
      const { data: firstCol } = await supabase.from('colleges').select('id').limit(1).maybeSingle();
      resolvedCollegeId = firstCol?.id || 'col-psg';
    }

    // Resolve user_id against profiles
    let resolvedUserId: string | null = userId || null;
    if (resolvedUserId) {
      const { data: pCheck } = await supabase.from('profiles').select('id').eq('id', resolvedUserId).maybeSingle();
      if (!pCheck) resolvedUserId = null;
    }
    if (!resolvedUserId && authorUsername) {
      const { data: pCheck } = await supabase.from('profiles').select('id').ilike('username', authorUsername).maybeSingle();
      if (pCheck) resolvedUserId = pCheck.id;
    }

    // Run AI review aspect analysis via campus-lenz-ai
    const combinedReviewText = `${title}. ${experience}. ${Array.isArray(pros) ? pros.join('. ') : ''}. ${Array.isArray(cons) ? cons.join('. ') : ''}`;
    const aiReviewAnalysis = analyzeReviewAspects(combinedReviewText);

    const mergedDimensions = {
      academics: 4,
      faculty: 4,
      placements: 4,
      infrastructure: 4,
      hostel: 4,
      campusLife: 4,
      valueForMoney: 4,
      studentExperience: 4,
      ...(dimensions || {})
    };

    // Fine-tune dimension scores based on detected aspect sentiments
    for (const aspect of aiReviewAnalysis.aspects) {
      const keyMap: Record<string, keyof typeof mergedDimensions> = {
        'Academics': 'academics',
        'Faculty': 'faculty',
        'Placements': 'placements',
        'Infrastructure': 'infrastructure',
        'Hostel': 'hostel',
        'Campus Life': 'campusLife',
        'Value for Money': 'valueForMoney',
        'Student Experience': 'studentExperience'
      };
      const dimKey = keyMap[aspect.name];
      if (dimKey && !dimensions?.[dimKey]) {
        if (aspect.sentiment === 'positive') mergedDimensions[dimKey] = 5;
        else if (aspect.sentiment === 'negative') mergedDimensions[dimKey] = 2;
        else mergedDimensions[dimKey] = 3;
      }
    }

    const reviewPayload: Record<string, any> = {
      college_id: resolvedCollegeId,
      user_id: resolvedUserId,
      reviewer_type: reviewerType,
      author_name: authorName,
      author_username: authorUsername,
      is_anonymous: isAnonymous,
      overall_rating: overallRating,
      dimensions: mergedDimensions,
      title: title.trim(),
      experience: experience.trim(),
      pros,
      cons,
      advice,
      recommendation,
      course,
      department,
      batch,
      helpful_count: 0,
    };

    if (reviewId) {
      reviewPayload.id = reviewId;
    }

    const { data: newReview, error: insertErr } = await supabase
      .from('reviews')
      .insert(reviewPayload)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 400 });
    }

    // Recalculate college rating and count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('college_id', collegeId);

    if (allReviews && allReviews.length > 0) {
      const avg = Number((allReviews.reduce((sum, r) => sum + r.overall_rating, 0) / allReviews.length).toFixed(1));
      await supabase
        .from('colleges')
        .update({
          rating_average: avg,
          review_count: allReviews.length,
        })
        .eq('id', collegeId);
    }

    return NextResponse.json({
      success: true,
      message: 'Review published successfully',
      review: {
        id: newReview.id,
        collegeId: newReview.college_id,
        userId: newReview.user_id,
        reviewerType: newReview.reviewer_type,
        authorName: newReview.author_name,
        authorUsername: newReview.author_username,
        isAnonymous: Boolean(newReview.is_anonymous),
        overallRating: newReview.overall_rating,
        dimensions: newReview.dimensions || {},
        title: newReview.title,
        experience: newReview.experience,
        pros: newReview.pros || [],
        cons: newReview.cons || [],
        advice: newReview.advice,
        recommendation: Boolean(newReview.recommendation),
        course: newReview.course,
        department: newReview.department,
        batch: newReview.batch,
        institutionReply: newReview.institution_reply || null,
        helpfulCount: newReview.helpful_count || 0,
        createdAt: newReview.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
