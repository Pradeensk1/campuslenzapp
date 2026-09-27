import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import SearchClient from './SearchClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('*')
    .order('name', { ascending: true });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <SearchClient
      initialColleges={colleges || []}
      initialProfiles={profiles || []}
    />
  );
}
