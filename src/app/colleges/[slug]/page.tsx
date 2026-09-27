import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CollegeDetailClient from './CollegeDetailClient';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { slug } = await params;

  const { data: collegeData } = await supabase
    .from('colleges')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  let initialCollege = null;
  if (collegeData) {
    initialCollege = {
      id: collegeData.id,
      slug: collegeData.slug,
      name: collegeData.name,
      location: collegeData.location,
      state: collegeData.state,
      collegeType: collegeData.college_type || 'Private',
      establishedYear: collegeData.established_year,
      contactEmail: collegeData.contact_email,
      contactPhone: collegeData.contact_phone,
      websiteUrl: collegeData.website_url,
      courses: collegeData.courses || [],
      departments: collegeData.departments || [],
      feesMin: collegeData.fees_min,
      feesMax: collegeData.fees_max,
      feesDescription: collegeData.fees_description,
      placementStats: collegeData.placement_stats || {},
      facilities: collegeData.facilities || [],
      officialOverview: collegeData.official_overview,
      ratingAverage: collegeData.rating_average,
      reviewCount: collegeData.review_count || 0,
      placementDetails: collegeData.placement_details || {},
      feeDetails: collegeData.fee_details || {},
      academicDetails: collegeData.academic_details || {},
      campusDetails: collegeData.campus_details || {},
      activityDetails: collegeData.activity_details || {},
      overallScore: collegeData.overall_score || {
        total: 85,
        placementsScore: 85,
        feesRoiScore: 80,
        academicsScore: 85,
        campusLifeScore: 90,
        badge: 'A+',
      },
    };
  }

  let initialReviews: any[] = [];
  if (collegeData?.id) {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('college_id', collegeData.id)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      initialReviews = reviewsData.map((r: any) => ({
        id: r.id,
        collegeId: r.college_id,
        userId: r.user_id,
        reviewerType: r.reviewer_type || 'student',
        authorName: r.author_name,
        authorUsername: r.author_username,
        isAnonymous: Boolean(r.is_anonymous),
        overallRating: r.overall_rating ?? 5,
        dimensions: r.dimensions || {},
        title: r.title,
        experience: r.experience,
        pros: r.pros || [],
        cons: r.cons || [],
        advice: r.advice,
        recommendation: Boolean(r.recommendation),
        course: r.course || '',
        department: r.department || '',
        batch: r.batch || '',
        createdAt: r.created_at,
        institutionReply: r.institution_reply,
      }));
    }
  }

  return (
    <CollegeDetailClient
      slug={slug}
      initialCollege={initialCollege}
      initialReviews={initialReviews}
    />
  );
}
