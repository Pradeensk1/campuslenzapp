import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CampusConnectHub from '@/components/CampusConnectHub';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: servers } = await supabase
    .from('discord_servers')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: serverMessages } = await supabase
    .from('server_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return <CampusConnectHub initialTab="community" />;
}
