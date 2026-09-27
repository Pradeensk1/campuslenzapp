import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    // Try matching slug first, then fallback to id
    let { data: college, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!college) {
      const res = await supabase.from('colleges').select('*').eq('id', slug).maybeSingle();
      college = res.data;
      error = res.error;
    }

    if (error || !college) {
      return NextResponse.json({ success: false, message: 'College not found' }, { status: 404 });
    }

    // Fetch reviews for this college
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('college_id', college.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      college: {
        id: college.id,
        slug: college.slug,
        name: college.name,
        location: college.location,
        state: college.state,
        collegeType: college.college_type,
        establishedYear: college.established_year,
        contactEmail: college.contact_email,
        contactPhone: college.contact_phone,
        websiteUrl: college.website_url,
        courses: college.courses || [],
        departments: college.departments || [],
        feesMin: college.fees_min,
        feesMax: college.fees_max,
        feesDescription: college.fees_description,
        placementStats: college.placement_stats || {},
        facilities: college.facilities || [],
        officialOverview: college.official_overview,
        ratingAverage: college.rating_average,
        reviewCount: college.review_count || 0,
        placementDetails: college.placement_details || {},
        feeDetails: college.fee_details || {},
        academicDetails: college.academic_details || {},
        campusDetails: college.campus_details || {},
        activityDetails: college.activity_details || {},
        overallScore: college.overall_score || {},
      },
      reviews: (reviews || []).map((r: any) => ({
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
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
