import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ExploreCompareHub from '@/components/ExploreCompareHub';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('*')
    .order('rating_average', { ascending: false });

  const { data: communities } = await supabase
    .from('communities')
    .select('*')
    .limit(20);

  return <ExploreCompareHub initialTab="explore" />;
}
