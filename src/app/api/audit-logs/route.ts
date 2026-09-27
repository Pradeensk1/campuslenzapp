import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, auditLogs: [] }, { status: 500 });
  }

  try {
    let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(limit);

    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, auditLogs: [] }, { status: 400 });
    }

    const auditLogs = (data || []).map((l: any) => ({
      id: l.id,
      adminId: l.admin_id,
      adminName: l.admin_name,
      actionType: l.action_type,
      targetEntity: l.target_entity,
      details: l.details,
      severity: l.severity,
      timestamp: l.timestamp,
    }));

    return NextResponse.json({ success: true, count: auditLogs.length, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, auditLogs: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { adminId, adminName, actionType, targetEntity, details, severity = 'info' } = body;

    if (!adminName || !actionType || !targetEntity || !details) {
      return NextResponse.json({ success: false, message: 'Missing required audit log fields' }, { status: 400 });
    }

    const payload = {
      admin_id: adminId || null,
      admin_name: adminName,
      action_type: actionType,
      target_entity: targetEntity,
      details,
      severity,
    };

    const { data, error } = await supabase.from('audit_logs').insert(payload).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Audit log recorded',
      log: data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
