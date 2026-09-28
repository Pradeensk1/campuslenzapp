import { NextResponse } from 'next/server';
import { summarizeReviewsAI } from '@/lib/aiServiceClient';
import { getSupabaseServerClient } from '@/lib/supabase';
import { INITIAL_REVIEWS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { college_id, reviews } = body;

    const collegeId = college_id || 'col-psg';
    let reviewTexts: string[] = Array.isArray(reviews) ? reviews : [];

    // If no reviews were explicitly passed in body, fetch from Supabase or fallback mockData
    if (reviewTexts.length === 0) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { data } = await supabase
          .from('reviews')
          .select('title, experience, pros, cons')
          .eq('college_id', collegeId)
          .limit(20);

        if (data && data.length > 0) {
          reviewTexts = data.map((r: any) =>
            `${r.title}. ${r.experience}. ${Array.isArray(r.pros) ? r.pros.join('. ') : ''}`
          );
        }
      }

      if (reviewTexts.length === 0) {
        const localMatches = INITIAL_REVIEWS.filter(r => r.collegeId === collegeId);
        reviewTexts = localMatches.map(r => `${r.title}. ${r.experience}. ${r.pros?.join('. ')}`);
      }
    }

    const summaryResult = await summarizeReviewsAI(collegeId, reviewTexts);

    return NextResponse.json({
      success: true,
      collegeId,
      reviewsCount: reviewTexts.length,
      result: summaryResult
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Review summarization failed'
    }, { status: 500 });
  }
}
