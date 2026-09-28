import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import UserProfileClient from './UserProfileClient';
import { INITIAL_USERS, INITIAL_POSTS } from '@/lib/mockData';

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { username } = await params;

  // Fetch profile by username
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  let initialProfile = null;
  if (profileData) {
    initialProfile = {
      id: profileData.id,
      username: profileData.username,
      name: profileData.full_name || profileData.name || profileData.username,
      fullName: profileData.full_name || profileData.name || profileData.username,
      email: profileData.email,
      role: profileData.role || 'student',
      headline: profileData.headline,
      bio: profileData.bio,
      collegeId: profileData.college_id,
      collegeName: profileData.college_name,
      avatarUrl: profileData.avatar_url,
      bannerUrl: profileData.banner_url,
      isVerified: Boolean(profileData.is_verified),
      followersCount: profileData.followers_count ?? 0,
      followingCount: profileData.following_count ?? 0,
      followers: [],
      following: [],
      badges: profileData.badges || [],
      socialLinks: profileData.social_links,
      achievements: profileData.achievements,
      createdAt: profileData.created_at,
    };
  } else {
    const mockUser = INITIAL_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (mockUser) {
      initialProfile = mockUser;
    }
  }

  // Fetch user posts
  const { data: postsData } = await supabase
    .from('posts')
    .select('*')
    .or(`author_username.ilike.${username},author_id.eq.${profileData?.id || 'none'}`)
    .order('created_at', { ascending: false });

  let initialPosts: any[] = (postsData || []).map((row: any) => ({
    id: row.id,
    authorId: row.author_id,
    authorUsername: row.author_username,
    authorName: row.author_name,
    authorRole: row.author_role || 'student',
    authorHeadline: row.author_headline,
    isVerifiedAuthor: Boolean(row.is_verified_author),
    isAnonymous: Boolean(row.is_anonymous),
    collegeId: row.college_id,
    collegeName: row.college_name,
    content: row.content,
    topic: row.topic,
    imageUrl: row.image_url,
    likes: Array.isArray(row.likes) ? row.likes : [],
    likesCount: row.likes_count ?? 0,
    comments: [],
    commentsCount: row.comments_count ?? 0,
    sharesCount: row.shares_count ?? 0,
    repostedUserIds: Array.isArray(row.reposted_user_ids) ? row.reposted_user_ids : [],
    moderationStatus: row.moderation_status || 'normal',
    sentiment: row.sentiment || 'neutral',
    createdAt: row.created_at || new Date().toISOString(),
  }));

  if (initialPosts.length === 0) {
    initialPosts = INITIAL_POSTS.filter(
      (p) =>
        (p.authorUsername && p.authorUsername.toLowerCase() === username.toLowerCase()) ||
        (initialProfile?.id && p.authorId === initialProfile.id)
    );
  }

  return (
    <UserProfileClient
      username={username}
      initialProfile={initialProfile}
      initialPosts={initialPosts}
    />
  );
}
