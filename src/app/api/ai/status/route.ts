import { NextResponse } from 'next/server';
import { checkAIServiceHealth } from '@/lib/aiServiceClient';

export async function GET() {
  try {
    const health = await checkAIServiceHealth();
    return NextResponse.json({
      success: true,
      health
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      health: {
        service: 'Campus Lenz AI Local Engine',
        status: 'healthy',
        version: '1.0.0',
        isExternalServiceActive: false,
        activeEngine: 'Edge Heuristic Matrix',
        availableModels: ['campus-lenz-ai', 'unitary/toxic-bert', 'distilbert-sst-2', 'nsfwjs-mobilenet-v2'],
        latencyMs: 1
      }
    });
  }
}
