import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { followerId, followerUsername } = body;

    if (!followerId && !followerUsername) {
      return NextResponse.json(
        { success: false, message: 'Follower identifier required' },
        { status: 400 }
      );
    }

    // 1. Resolve Target User Profile
    let { data: targetUser, error: targetErr } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .maybeSingle();

    if (!targetUser) {
      const res = await supabase.from('profiles').select('*').eq('id', username).maybeSingle();
      targetUser = res.data;
      targetErr = res.error;
    }

    if (targetErr || !targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
    }

    // 2. Resolve Follower User Profile
    let followerUser = null;
    if (followerId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', followerId).maybeSingle();
      followerUser = data;
    }
    if (!followerUser && followerUsername) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', followerUsername)
        .maybeSingle();
      followerUser = data;
    }

    if (!followerUser) {
      return NextResponse.json({ success: false, message: 'Follower profile not found' }, { status: 404 });
    }

    // Disallow following oneself
    if (targetUser.id === followerUser.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const targetFollowers: string[] = Array.isArray(targetUser.followers) ? targetUser.followers : [];
    const followerFollowing: string[] = Array.isArray(followerUser.following) ? followerUser.following : [];

    const isAlreadyFollowing =
      targetFollowers.includes(followerUser.id) ||
      targetFollowers.includes(followerUser.username) ||
      followerFollowing.includes(targetUser.id) ||
      followerFollowing.includes(targetUser.username);

    let nextTargetFollowers: string[];
    let nextFollowerFollowing: string[];

    if (isAlreadyFollowing) {
      // Unfollow
      nextTargetFollowers = targetFollowers.filter(
        id => id !== followerUser.id && id !== followerUser.username
      );
      nextFollowerFollowing = followerFollowing.filter(
        id => id !== targetUser.id && id !== targetUser.username
      );
    } else {
      // Follow
      nextTargetFollowers = [...targetFollowers.filter(id => id !== followerUser.id), followerUser.id];
      nextFollowerFollowing = [...followerFollowing.filter(id => id !== targetUser.id), targetUser.id];
    }

    // 3. Update Target User in Supabase
    const { data: updatedTarget, error: updateTargetErr } = await supabase
      .from('profiles')
      .update({
        followers: nextTargetFollowers,
        followers_count: nextTargetFollowers.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUser.id)
      .select()
      .single();

    if (updateTargetErr) {
      return NextResponse.json({ success: false, error: updateTargetErr.message }, { status: 500 });
    }

    // 4. Update Follower User in Supabase
    const { data: updatedFollower, error: updateFollowerErr } = await supabase
      .from('profiles')
      .update({
        following: nextFollowerFollowing,
        following_count: nextFollowerFollowing.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', followerUser.id)
      .select()
      .single();

    if (updateFollowerErr) {
      return NextResponse.json({ success: false, error: updateFollowerErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isFollowing: !isAlreadyFollowing,
      message: !isAlreadyFollowing
        ? `Now following @${targetUser.username}`
        : `Unfollowed @${targetUser.username}`,
      targetUser: {
        id: updatedTarget.id,
        username: updatedTarget.username,
        followersCount: updatedTarget.followers_count,
        followingCount: updatedTarget.following_count,
        followers: updatedTarget.followers,
        following: updatedTarget.following
      },
      followerUser: {
        id: updatedFollower.id,
        username: updatedFollower.username,
        followersCount: updatedFollower.followers_count,
        followingCount: updatedFollower.following_count,
        followers: updatedFollower.followers,
        following: updatedFollower.following
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
