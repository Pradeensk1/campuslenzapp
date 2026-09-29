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
  INITIAL_DIRECT_MESSAGES,
  INITIAL_STUDY_ROOMS,
  INITIAL_COURSE_QUESTIONS,
  INITIAL_MARKETPLACE_ITEMS,
} from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: 'Supabase credentials not configured in environment.' },
      { status: 500 }
    );
  }

  const tables = [
    'colleges',
    'profiles',
    'reviews',
    'posts',
    'comments',
    'communities',
    'grievance_reports',
    'discord_servers',
    'server_messages',
    'direct_messages',
    'study_rooms',
    'course_questions',
    'marketplace_items'
  ];

  const counts: Record<string, number | string> = {};
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      counts[t] = error ? `Error: ${error.message}` : (count ?? 0);
    } catch (e: any) {
      counts[t] = `Exception: ${e.message}`;
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Supabase database tables inspected.',
    counts,
  });
}

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
    // 1. Seed & Sync Colleges (Parent table for reviews, posts, grievances, communities)
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
    const { error: colErr } = await supabase.from('colleges').upsert(collegeRows, { onConflict: 'id' });
    results.colleges = colErr ? `Error: ${colErr.message}` : `Synced ${collegeRows.length} colleges`;

    // 2. Seed & Sync Profiles (Parent table for reviews, posts, comments, communities, grievances, servers)
    // We unconditionally upsert INITIAL_USERS with onConflict 'id' to guarantee foreign keys always resolve
    const profileRows = INITIAL_USERS.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      full_name: u.fullName,
      headline: u.headline,
      bio: u.skills && u.skills.length > 0 ? `${u.bio || ''}\n\n<!--SKILLS-->${JSON.stringify(u.skills)}` : u.bio,
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
    results.profiles = profErr ? `Error: ${profErr.message}` : `Synced ${profileRows.length} profiles`;

    // 3. Seed & Sync Reviews
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
    const { error: revErr } = await supabase.from('reviews').upsert(reviewRows, { onConflict: 'id' });
    results.reviews = revErr ? `Error: ${revErr.message}` : `Synced ${reviewRows.length} reviews`;

    // 4. Seed & Sync Posts & Comments
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
    const { error: postErr } = await supabase.from('posts').upsert(postRows, { onConflict: 'id' });
    results.posts = postErr ? `Error: ${postErr.message}` : `Synced ${postRows.length} posts`;

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
      const { error: cmtErr } = await supabase.from('comments').upsert(commentRows, { onConflict: 'id' });
      results.comments = cmtErr ? `Error: ${cmtErr.message}` : `Synced ${commentRows.length} comments`;
    }

    // 5. Seed & Sync Communities
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
    const { error: commErr } = await supabase.from('communities').upsert(commRows, { onConflict: 'id' });
    results.communities = commErr ? `Error: ${commErr.message}` : `Synced ${commRows.length} communities`;

    // 6. Seed & Sync Grievances
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
    const { error: grvErr } = await supabase.from('grievance_reports').upsert(grvRows, { onConflict: 'id' });
    results.grievances = grvErr ? `Error: ${grvErr.message}` : `Synced ${grvRows.length} grievances`;

    // 7. Seed & Sync Discord Servers
    const srvRows = INITIAL_DISCORD_SERVERS.map(s => ({
      id: s.id,
      name: s.name,
      college_id: s.collegeId,
      college_name: s.collegeName,
      institution_owner_id: s.institutionOwnerId,
      description: s.description,
      member_count: s.memberCount,
      anti_ragebait_rules: s.antiRagebaitRules || [],
      channels: s.channels || [],
      created_at: (s as any).createdAt || new Date().toISOString()
    }));
    const { error: srvErr } = await supabase.from('discord_servers').upsert(srvRows, { onConflict: 'id' });
    results.discord_servers = srvErr ? `Notice: ${srvErr.message}` : `Synced ${srvRows.length} servers`;

    // 8. Seed & Sync Server Messages
    const smsgRows = INITIAL_SERVER_MESSAGES.map(m => ({
      id: m.id,
      channel_id: m.channelId,
      author_id: m.authorId,
      author_name: m.authorName,
      author_role: m.authorRole,
      author_headline: m.authorHeadline,
      content: m.content,
      is_flagged_for_ragebait: Boolean(m.isFlaggedForRagebait),
      created_at: m.createdAt
    }));
    const { error: smsgErr } = await supabase.from('server_messages').upsert(smsgRows, { onConflict: 'id' });
    results.server_messages = smsgErr ? `Notice: ${smsgErr.message}` : `Synced ${smsgRows.length} server messages`;

    // 9. Seed & Sync Direct Messages
    const dmRows = INITIAL_DIRECT_MESSAGES.map(m => ({
      id: m.id,
      conversation_id: m.conversationId,
      sender_id: m.senderId,
      receiver_id: m.receiverId,
      content: m.content,
      is_read: Boolean(m.isRead),
      liked: Boolean(m.liked),
      created_at: m.createdAt
    }));
    const { error: dmErr } = await supabase.from('direct_messages').upsert(dmRows, { onConflict: 'id' });
    results.direct_messages = dmErr ? `Notice: ${dmErr.message}` : `Synced ${dmRows.length} direct messages`;

    // 10. Seed & Sync Study Rooms (if table exists)
    try {
      const roomRows = INITIAL_STUDY_ROOMS.map(r => ({
        id: r.id,
        title: r.title,
        subject: r.subject,
        active_peer_count: r.activePeerCount,
        max_participants: r.maxParticipants,
        host_name: r.hostName,
        room_tag: r.roomTag,
        created_at: r.createdAt || new Date().toISOString()
      }));
      const { error: roomErr } = await supabase.from('study_rooms').upsert(roomRows, { onConflict: 'id' });
      if (!roomErr) results.study_rooms = `Synced ${roomRows.length} study rooms`;
    } catch {}

    // 11. Seed & Sync Course Questions (if table exists)
    try {
      const cqRows = INITIAL_COURSE_QUESTIONS.map(q => ({
        id: q.id,
        course_code: q.courseCode,
        course_name: q.courseName,
        title: q.title,
        content: q.content,
        code_snippet: q.codeSnippet,
        is_anonymous: Boolean(q.isAnonymous),
        author_id: q.authorId,
        author_name: q.authorName,
        upvotes: q.upvotes || 0,
        answers: q.answers || [],
        created_at: q.createdAt
      }));
      const { error: cqErr } = await supabase.from('course_questions').upsert(cqRows, { onConflict: 'id' });
      if (!cqErr) results.course_questions = `Synced ${cqRows.length} course questions`;
    } catch {}

    // 12. Seed & Sync Marketplace Items (if table exists)
    try {
      const mktRows = INITIAL_MARKETPLACE_ITEMS.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        is_free_or_swap: Boolean(item.isFreeOrSwap),
        condition: item.condition,
        seller_id: item.sellerId,
        seller_name: item.sellerName,
        seller_role: item.sellerRole,
        seller_contact: item.sellerContact,
        is_reserved: Boolean(item.isReserved),
        created_at: item.createdAt
      }));
      const { error: mktErr } = await supabase.from('marketplace_items').upsert(mktRows, { onConflict: 'id' });
      if (!mktErr) results.marketplace_items = `Synced ${mktRows.length} marketplace items`;
    } catch {}

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

