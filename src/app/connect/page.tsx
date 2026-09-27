import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CampusConnectHub from '@/components/CampusConnectHub';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: communities } = await supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: studyRooms } = await supabase
    .from('study_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  return <CampusConnectHub initialTab="community" />;
}
