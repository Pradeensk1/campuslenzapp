import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CampusConnectHub from '@/components/CampusConnectHub';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name')
    .order('name', { ascending: true });

  const { data: grievances } = await supabase
    .from('grievance_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return <CampusConnectHub initialTab="grievance" />;
}
