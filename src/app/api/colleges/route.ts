import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const state = searchParams.get('state');

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, colleges: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('colleges').select('*').order('rating_average', { ascending: false });

    if (state && state !== 'all') {
      query = query.eq('state', state);
    }
    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, colleges: [] }, { status: 400 });
    }

    const colleges = (data || []).map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      location: c.location,
      state: c.state,
      collegeType: c.college_type,
      establishedYear: c.established_year,
      contactEmail: c.contact_email,
      contactPhone: c.contact_phone,
      websiteUrl: c.website_url,
      courses: c.courses || [],
      departments: c.departments || [],
      feesMin: c.fees_min,
      feesMax: c.fees_max,
      feesDescription: c.fees_description,
      placementStats: c.placement_stats || {},
      facilities: c.facilities || [],
      officialOverview: c.official_overview,
      ratingAverage: c.rating_average,
      reviewCount: c.review_count || 0,
      placementDetails: c.placement_details || {},
      feeDetails: c.fee_details || {},
      academicDetails: c.academic_details || {},
      campusDetails: c.campus_details || {},
      activityDetails: c.activity_details || {},
      overallScore: c.overall_score || {},
    }));

    return NextResponse.json({ success: true, count: colleges.length, colleges });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, colleges: [] }, { status: 500 });
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
      id,
      slug,
      name,
      location,
      state,
      collegeType,
      establishedYear,
      contactEmail,
      contactPhone,
      websiteUrl,
      courses,
      departments,
      feesMin,
      feesMax,
      feesDescription,
      placementStats,
      facilities,
      officialOverview,
      placementDetails,
      feeDetails,
      academicDetails,
      campusDetails,
      activityDetails,
      overallScore,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, message: 'College name and slug are required' }, { status: 400 });
    }

    const payload = {
      id: id || `col-${slug}`,
      slug,
      name,
      location,
      state,
      college_type: collegeType,
      established_year: establishedYear,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website_url: websiteUrl,
      courses: courses || [],
      departments: departments || [],
      fees_min: feesMin,
      fees_max: feesMax,
      fees_description: feesDescription,
      placement_stats: placementStats || {},
      facilities: facilities || [],
      official_overview: officialOverview,
      placement_details: placementDetails || {},
      fee_details: feeDetails || {},
      academic_details: academicDetails || {},
      campus_details: campusDetails || {},
      activity_details: activityDetails || {},
      overall_score: overallScore || {},
    };

    const { data, error } = await supabase.from('colleges').upsert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, college: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
