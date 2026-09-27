import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import LoginClient from './LoginClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name')
    .order('name', { ascending: true });

  return <LoginClient initialColleges={colleges || []} />;
}
