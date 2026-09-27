import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdminClient from './AdminClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <AdminClient
      initialAuditLogs={auditLogs || []}
      initialProfiles={profiles || []}
      initialPosts={posts || []}
    />
  );
}
