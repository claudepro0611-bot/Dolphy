import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId kerak' }, { status: 400 })

    // Foydalanuvchi sessiyasini tekshir
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Kirish talab etiladi. Qayta login qiling.' }, { status: 401 })
    }

    const db = adminClient()

    // Driver public.users da bo'lishi shart (FK constraint).
    // users: (id UUID, phone TEXT NOT NULL, role TEXT, status TEXT, created_at)
    // Yo'q bo'lsa — placeholder phone bilan yaratamiz
    const phone = user.phone
      || user.email?.replace(/[^0-9]/g, '').slice(0, 12)
      || user.id.replace(/-/g, '').slice(0, 12)

    const { error: upsertError } = await db
      .from('users')
      .upsert(
        { id: user.id, phone, role: 'driver', status: 'active' },
        { onConflict: 'id' }
      )

    if (upsertError) {
      console.error('Driver upsert error:', upsertError)
      return NextResponse.json({ error: 'Driver yozuvi yaratib bo\'lmadi: ' + upsertError.message }, { status: 500 })
    }

    // Orderni qabul qilish
    const { data: updated, error } = await db
      .from('orders')
      .update({ status: 'accepted', driver_id: user.id })
      .eq('id', orderId)
      .eq('status', 'pending')
      .is('driver_id', null)
      .select('id')

    if (error) {
      console.error('Accept order DB error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Zakaz allaqachon qabul qilingan yoki topilmadi' }, { status: 409 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Accept route error:', e)
    return NextResponse.json({ error: e?.message ?? 'Server xatosi' }, { status: 500 })
  }
}
