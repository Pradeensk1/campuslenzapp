import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, items: [] }, { status: 500 });
  try {
    const { data, error } = await supabase.from('marketplace_items').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message, items: [] }, { status: 400 });
    const items = (data || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      price: m.price ? Number(m.price) : 0,
      isFreeOrSwap: Boolean(m.is_free_or_swap),
      condition: m.condition,
      sellerId: m.seller_id,
      sellerName: m.seller_name,
      sellerRole: m.seller_role || 'student',
      sellerContact: m.seller_contact,
      isReserved: Boolean(m.is_reserved),
      reservedByStudentName: m.reserved_by_student_name,
      createdAt: m.created_at,
    }));
    return NextResponse.json({ success: true, count: items.length, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  try {
    const body = await request.json();
    const { id, title, category, price = 0, isFreeOrSwap = false, condition, sellerId, sellerName, sellerRole = 'student', sellerContact } = body;
    if (!title || !category || !condition || !sellerName || !sellerContact) {
      return NextResponse.json({ success: false, message: 'Missing required marketplace item fields' }, { status: 400 });
    }
    const payload: Record<string, any> = {
      title: title.trim(),
      category: category.trim(),
      price: Number(price) || 0,
      is_free_or_swap: Boolean(isFreeOrSwap),
      condition: condition.trim(),
      seller_id: sellerId || null,
      seller_name: sellerName.trim(),
      seller_role: sellerRole,
      seller_contact: sellerContact.trim(),
      is_reserved: false,
    };
    if (id) payload.id = id;
    const { data, error } = await supabase.from('marketplace_items').insert(payload).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({
      success: true,
      item: {
        id: data.id,
        title: data.title,
        category: data.category,
        price: data.price ? Number(data.price) : 0,
        isFreeOrSwap: Boolean(data.is_free_or_swap),
        condition: data.condition,
        sellerId: data.seller_id,
        sellerName: data.seller_name,
        sellerRole: data.seller_role,
        sellerContact: data.seller_contact,
        isReserved: Boolean(data.is_reserved),
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, message: 'Database offline' }, { status: 500 });
  try {
    const body = await request.json();
    const { id, isReserved, reservedByStudentName } = body;
    if (!id) return NextResponse.json({ success: false, message: 'Item ID required' }, { status: 400 });

    const updates: Record<string, any> = {};
    if (isReserved !== undefined) updates.is_reserved = Boolean(isReserved);
    if (reservedByStudentName !== undefined) updates.reserved_by_student_name = reservedByStudentName;

    const { data, error } = await supabase.from('marketplace_items').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
