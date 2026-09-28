import { NextResponse } from 'next/server';
import { analyzePostAI, runFullPreflightModeration } from '@/lib/aiServiceClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post, author_id, college_id, image_url } = body;

    if (!post || typeof post !== 'string' || !post.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Post content is required.'
      }, { status: 400 });
    }

    const postAnalysis = await analyzePostAI(
      post,
      author_id || 'unknown_author',
      college_id || 'unknown_college'
    );

    const unifiedModeration = runFullPreflightModeration(post, image_url);

    return NextResponse.json({
      success: true,
      postAnalysis,
      unifiedModeration
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Post analysis error'
    }, { status: 500 });
  }
}
