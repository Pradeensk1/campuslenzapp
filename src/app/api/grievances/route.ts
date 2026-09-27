import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const institutionId = searchParams.get('institutionId');
  const status = searchParams.get('status');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, grievances: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('grievance_reports').select('*').order('submitted_at', { ascending: false });

    if (studentId) query = query.eq('student_id', studentId);
    if (institutionId) query = query.eq('target_institution_id', institutionId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, grievances: [] }, { status: 400 });
    }

    const grievances = (data || []).map((g: any) => ({
      id: g.id,
      studentId: g.student_id,
      studentName: g.student_name,
      isAnonymousToFaculty: Boolean(g.is_anonymous_to_faculty),
      targetInstitutionId: g.target_institution_id,
      collegeName: g.college_name,
      category: g.category,
      targetFacultyName: g.target_faculty_name,
      subjectOrCourse: g.subject_or_course,
      detailedComplaint: g.detailed_complaint,
      status: g.status,
      institutionRemarks: g.institution_remarks,
      submittedAt: g.submitted_at,
    }));

    return NextResponse.json({ success: true, count: grievances.length, grievances });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, grievances: [] }, { status: 500 });
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
      studentId,
      studentName,
      isAnonymousToFaculty = true,
      targetInstitutionId,
      collegeName,
      category,
      targetFacultyName,
      subjectOrCourse,
      detailedComplaint,
    } = body;

    if (!targetInstitutionId || !category || !subjectOrCourse || !detailedComplaint) {
      return NextResponse.json({ success: false, message: 'Missing required grievance details' }, { status: 400 });
    }

    const payload = {
      student_id: studentId || null,
      student_name: isAnonymousToFaculty ? 'Confidential Student' : studentName,
      is_anonymous_to_faculty: isAnonymousToFaculty,
      target_institution_id: targetInstitutionId,
      college_name: collegeName || 'Affiliated Campus',
      category,
      target_faculty_name: targetFacultyName || null,
      subject_or_course: subjectOrCourse.trim(),
      detailed_complaint: detailedComplaint.trim(),
      status: 'submitted',
    };

    const { data, error } = await supabase.from('grievance_reports').insert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Grievance submitted securely to institution desk',
      grievance: {
        id: data.id,
        studentId: data.student_id,
        studentName: data.student_name,
        isAnonymousToFaculty: Boolean(data.is_anonymous_to_faculty),
        targetInstitutionId: data.target_institution_id,
        collegeName: data.college_name,
        category: data.category,
        targetFacultyName: data.target_faculty_name,
        subjectOrCourse: data.subject_or_course,
        detailedComplaint: data.detailed_complaint,
        status: data.status,
        institutionRemarks: data.institution_remarks,
        submittedAt: data.submitted_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, status, institutionRemarks } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Grievance ID is required' }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (status) updateFields.status = status;
    if (institutionRemarks !== undefined) updateFields.institution_remarks = institutionRemarks;

    const { data, error } = await supabase
      .from('grievance_reports')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Grievance record updated',
      grievance: data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
