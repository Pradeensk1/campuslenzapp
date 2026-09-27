import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ProfileClient from './ProfileClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('*')
    .order('name', { ascending: true });

  const { data: postsData } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <ProfileClient
      initialColleges={colleges || []}
      initialPosts={postsData || []}
    />
  );
}
