import { NextResponse } from 'next/server';
import { detectDuplicateAI } from '@/lib/aiServiceClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text_a, text_b, threshold = 0.85 } = body;

    if (!text_a || !text_b) {
      return NextResponse.json({
        success: false,
        message: 'Both text_a and text_b are required for duplicate comparison.'
      }, { status: 400 });
    }

    const result = await detectDuplicateAI(text_a, text_b, threshold);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Duplicate detection failed'
    }, { status: 500 });
  }
}
