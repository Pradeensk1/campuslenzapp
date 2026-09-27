import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import RegisterClient from './RegisterClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name, location, state')
    .order('name', { ascending: true });

  return <RegisterClient initialColleges={colleges || []} />;
}
