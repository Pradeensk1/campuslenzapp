import { NextResponse } from 'next/server';
import { analyzeMessageAI } from '@/lib/aiServiceClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sender_id, recipient_id } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Message text is required.'
      }, { status: 400 });
    }

    const result = await analyzeMessageAI(
      message,
      sender_id || 'unknown_sender',
      recipient_id || 'unknown_recipient'
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Message analysis failed'
    }, { status: 500 });
  }
}
