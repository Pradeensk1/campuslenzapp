import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CampusConnectHub from '@/components/CampusConnectHub';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: directMessages } = await supabase
    .from('direct_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(20);

  return <CampusConnectHub initialTab="messages" />;
}
