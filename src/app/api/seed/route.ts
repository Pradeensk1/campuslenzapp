import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import {
  INITIAL_COLLEGES,
  INITIAL_USERS,
  INITIAL_REVIEWS,
  INITIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_DISCORD_SERVERS,
  INITIAL_SERVER_MESSAGES,
  INITIAL_GRIEVANCE_REPORTS,
} from '@/lib/mockData';

export async function POST() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: 'Supabase credentials not configured in environment.' },
      { status: 500 }
    );
  }

  const results: Record<string, string> = {};

  try {
    // 1. Seed Colleges
    const { data: existingColleges } = await supabase.from('colleges').select('id').limit(1);
    if (!existingColleges || existingColleges.length === 0) {
      const collegeRows = INITIAL_COLLEGES.map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        location: c.location,
        state: c.state,
        college_type: c.collegeType,
        established_year: c.establishedYear || 1950,
        contact_email: c.contactEmail,
        contact_phone: c.contactPhone,
        website_url: c.websiteUrl,
        courses: c.courses || [],
        departments: c.departments || [],
        fees_min: c.feesMin,
        fees_max: c.feesMax,
        fees_description: c.feesDescription,
        placement_stats: c.placementStats || {},
        facilities: c.facilities || [],
        official_overview: c.officialOverview,
        rating_average: c.ratingAverage,
        review_count: c.reviewCount || 0,
        placement_details: c.placementDetails || {},
        fee_details: c.feeDetails || {},
        academic_details: c.academicDetails || {},
        campus_details: c.campusDetails || {},
        activity_details: c.activityDetails || {},
        overall_score: c.overallScore || {}
      }));
      const { error: colErr } = await supabase.from('colleges').upsert(collegeRows);
      results.colleges = colErr ? `Error: ${colErr.message}` : `Seeded ${collegeRows.length} colleges`;
    } else {
      results.colleges = 'Colleges already populated';
    }

    // 2. Seed Profiles
    const { data: existingProfiles } = await supabase.from('profiles').select('id').limit(1);
    if (!existingProfiles || existingProfiles.length === 0) {
      const profileRows = INITIAL_USERS.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        full_name: u.fullName,
        headline: u.headline,
        bio: u.bio,
        avatar_url: u.avatarUrl,
        college_id: u.collegeId,
        college_name: u.collegeName,
        department: u.department,
        course: u.course,
        graduation_batch: u.graduationBatch,
        is_verified: u.isVerified,
        followers_count: u.followersCount || 0,
        following_count: u.followingCount || 0,
        followers: u.followers || [],
        following: u.following || []
      }));
      const { error: profErr } = await supabase.from('profiles').upsert(profileRows, { onConflict: 'id' });
      results.profiles = profErr ? `Error: ${profErr.message}` : `Seeded ${profileRows.length} profiles`;
    } else {
      results.profiles = 'Profiles already populated';
    }

    // 3. Seed Reviews
    const { data: existingReviews } = await supabase.from('reviews').select('id').limit(1);
    if (!existingReviews || existingReviews.length === 0) {
      const reviewRows = INITIAL_REVIEWS.map(r => ({
        id: r.id,
        college_id: r.collegeId,
        user_id: r.userId,
        reviewer_type: r.reviewerType,
        author_name: r.authorName,
        author_username: r.authorUsername,
        is_anonymous: r.isAnonymous,
        overall_rating: r.overallRating,
        dimensions: r.dimensions,
        title: r.title,
        experience: r.experience,
        pros: r.pros || [],
        cons: r.cons || [],
        advice: r.advice,
        recommendation: r.recommendation,
        course: r.course,
        department: r.department,
        batch: r.batch,
        institution_reply: r.institutionReply || null,
        helpful_count: (r as any).helpfulCount || 0,
        created_at: r.createdAt
      }));
      const { error: revErr } = await supabase.from('reviews').upsert(reviewRows);
      results.reviews = revErr ? `Error: ${revErr.message}` : `Seeded ${reviewRows.length} reviews`;
    } else {
      results.reviews = 'Reviews already populated';
    }

    // 4. Seed Posts & Comments
    const { data: existingPosts } = await supabase.from('posts').select('id').limit(1);
    if (!existingPosts || existingPosts.length === 0) {
      const postRows = INITIAL_POSTS.map(p => ({
        id: p.id,
        author_id: p.authorId,
        author_username: p.authorUsername,
        author_name: p.authorName,
        author_role: p.authorRole,
        author_headline: p.authorHeadline,
        is_verified_author: p.isVerifiedAuthor,
        is_anonymous: p.isAnonymous,
        college_id: p.collegeId,
        college_name: p.collegeName,
        content: p.content,
        topic: p.topic,
        image_url: p.imageUrl,
        likes: p.likes || [],
        likes_count: p.likesCount || 0,
        comments_count: p.commentsCount || 0,
        shares_count: p.sharesCount || 0,
        sentiment: p.sentiment || 'neutral',
        sentiment_score: p.sentimentScore || 0,
        toxicity_score: p.toxicityScore || 0,
        is_sensitive: Boolean(p.isSensitive),
        sensitive_reason: p.sensitiveReason,
        moderation_status: p.moderationStatus || 'normal',
        ai_model_metadata: p.aiModelMetadata,
        created_at: p.createdAt
      }));
      const { error: postErr } = await supabase.from('posts').upsert(postRows);
      results.posts = postErr ? `Error: ${postErr.message}` : `Seeded ${postRows.length} posts`;

      const commentRows: any[] = [];
      for (const p of INITIAL_POSTS) {
        if (p.comments && p.comments.length > 0) {
          for (const c of p.comments) {
            commentRows.push({
              id: c.id,
              post_id: p.id,
              author_id: c.authorId,
              author_username: c.authorUsername,
              author_name: c.authorName,
              author_role: c.authorRole,
              author_headline: c.authorHeadline,
              avatar_url: (c as any).avatarUrl || null,
              is_verified_author: c.isVerifiedAuthor,
              content: c.content,
              likes_count: c.likesCount || 0,
              created_at: c.createdAt
            });
          }
        }
      }
      if (commentRows.length > 0) {
        const { error: cmtErr } = await supabase.from('comments').upsert(commentRows);
        results.comments = cmtErr ? `Error: ${cmtErr.message}` : `Seeded ${commentRows.length} comments`;
      }
    } else {
      results.posts = 'Posts already populated';
    }

    // 5. Seed Communities
    const { data: existingComm } = await supabase.from('communities').select('id').limit(1);
    if (!existingComm || existingComm.length === 0) {
      const commRows = INITIAL_COMMUNITIES.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        college_id: c.collegeId,
        college_name: c.collegeName,
        creator_id: c.creatorId,
        creator_role: c.creatorRole,
        is_private: c.isPrivate,
        members_count: c.membersCount,
        category: c.category,
        created_at: c.createdAt
      }));
      const { error: commErr } = await supabase.from('communities').upsert(commRows);
      results.communities = commErr ? `Error: ${commErr.message}` : `Seeded ${commRows.length} communities`;
    }

    // 6. Seed Grievances
    const { data: existingGrievances } = await supabase.from('grievance_reports').select('id').limit(1);
    if (!existingGrievances || existingGrievances.length === 0) {
      const grvRows = INITIAL_GRIEVANCE_REPORTS.map(g => ({
        id: g.id,
        student_id: g.studentId,
        student_name: g.studentName,
        is_anonymous_to_faculty: g.isAnonymousToFaculty,
        target_institution_id: g.targetInstitutionId,
        college_name: g.collegeName,
        category: g.category,
        target_faculty_name: g.targetFacultyName,
        subject_or_course: g.subjectOrCourse,
        detailed_complaint: g.detailedComplaint,
        status: g.status,
        institution_remarks: g.institutionRemarks,
        submitted_at: g.submittedAt
      }));
      const { error: grvErr } = await supabase.from('grievance_reports').upsert(grvRows);
      results.grievances = grvErr ? `Error: ${grvErr.message}` : `Seeded ${grvRows.length} grievances`;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase database full seed completed.',
      details: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Seed execution failed.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: 'Supabase credentials not configured in environment.' },
      { status: 500 }
    );
  }

  const results: Record<string, string> = {};

  try {
    // Purge mock tables while strictly preserving 'colleges'
    const tablesToClear = [
      'comments',
      'posts',
      'reviews',
      'grievance_reports',
      'communities',
      'direct_messages',
      'study_rooms',
      'marketplace_items',
      'audit_logs',
      'profiles'
    ];

    for (const table of tablesToClear) {
      const { error } = await supabase.from(table).delete().neq('id', 'keep_none_placeholder');
      results[table] = error ? `Error: ${error.message}` : 'Cleared';
    }

    // Verify colleges still exist
    const { count: collegesCount } = await supabase.from('colleges').select('*', { count: 'exact', head: true });
    results['colleges_preserved'] = `Colleges count in DB: ${collegesCount ?? 'active'}`;

    return NextResponse.json({
      success: true,
      message: 'Mock demo data purged from Supabase. Colleges preserved for user registrations.',
      details: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to purge mock data.' },
      { status: 500 }
    );
  }
}

