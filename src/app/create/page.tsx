import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CreateClient from './CreateClient';
import { Suspense } from 'react';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name, slug')
    .order('name', { ascending: true });

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6"><div className="apple-card p-8 text-center text-xs text-[#64748B]">Loading Composer...</div></div>}>
      <CreateClient initialColleges={colleges || []} />
    </Suspense>
  );
}

