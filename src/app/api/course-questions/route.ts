import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, questions: [] }, { status: 500 });
  try {
    const { data, error } = await supabase.from('course_questions').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message, questions: [] }, { status: 400 });
    const questions = (data || []).map((q: any) => ({
      id: q.id,
      courseCode: q.course_code,
      courseName: q.course_name,
      title: q.title,
      content: q.content,
      codeSnippet: q.code_snippet,
      isAnonymous: Boolean(q.is_anonymous),
      authorId: q.author_id,
      authorName: q.author_name,
      upvotes: q.upvotes ?? 0,
      answers: Array.isArray(q.answers) ? q.answers : [],
      createdAt: q.created_at,
    }));
    return NextResponse.json({ success: true, count: questions.length, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, questions: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  try {
    const body = await request.json();
    const { id, courseCode, courseName, title, content, codeSnippet, isAnonymous = false, authorId, authorName } = body;
    if (!courseCode || !title || !content || !authorName) {
      return NextResponse.json({ success: false, message: 'Missing required question fields' }, { status: 400 });
    }
    const payload: Record<string, any> = {
      course_code: courseCode.trim(),
      course_name: courseName ? courseName.trim() : courseCode.trim(),
      title: title.trim(),
      content: content.trim(),
      code_snippet: codeSnippet || null,
      is_anonymous: Boolean(isAnonymous),
      author_id: authorId || null,
      author_name: authorName,
      upvotes: 0,
      answers: [],
    };
    if (id) payload.id = id;
    const { data, error } = await supabase.from('course_questions').insert(payload).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({
      success: true,
      question: {
        id: data.id,
        courseCode: data.course_code,
        courseName: data.course_name,
        title: data.title,
        content: data.content,
        codeSnippet: data.code_snippet,
        isAnonymous: Boolean(data.is_anonymous),
        authorId: data.author_id,
        authorName: data.author_name,
        upvotes: data.upvotes ?? 0,
        answers: [],
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  try {
    const body = await request.json();
    const { id, upvote, newAnswer } = body;
    if (!id) return NextResponse.json({ success: false, message: 'Question ID required' }, { status: 400 });

    const { data: q, error: fetchErr } = await supabase.from('course_questions').select('*').eq('id', id).single();
    if (fetchErr || !q) return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });

    const updates: Record<string, any> = {};
    if (upvote) {
      updates.upvotes = (q.upvotes || 0) + 1;
    }
    if (newAnswer) {
      const currentAnswers = Array.isArray(q.answers) ? q.answers : [];
      updates.answers = [...currentAnswers, newAnswer];
    }

    const { data, error } = await supabase.from('course_questions').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, question: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
