import { NextResponse } from 'next/server';
import { semanticSearchAI } from '@/lib/aiServiceClient';
import { getSupabaseServerClient } from '@/lib/supabase';
import { INITIAL_COLLEGES } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Search query is required.'
      }, { status: 400 });
    }

    let colleges: any[] = [];
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.from('colleges').select('*').limit(30);
      if (data && data.length > 0) {
        colleges = data;
      }
    }

    if (colleges.length === 0) {
      colleges = INITIAL_COLLEGES;
    }

    const searchResult = await semanticSearchAI(query, colleges, Math.min(20, Math.max(1, limit)));

    return NextResponse.json({
      success: true,
      result: searchResult
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Semantic search failed'
    }, { status: 500 });
  }
}
