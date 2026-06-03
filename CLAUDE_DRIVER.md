# Driver + Admin Agent

## Vazifa
Faqat driver paneli va admin panel bilan ishlash.

## Papkalar
- `app/driver/` — driver panel
- `app/(admin)/admin/` — admin panel
- `app/(onboarding)/` — driver onboarding

## Stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS, Framer Motion
- Supabase (real-time, DB)
- Recharts (admin grafiklar)

## Driver panel sahifalari
```
/driver/dashboard/      — bosh sahifa, aktiv zakaz
/driver/orders/         — barcha zakazlar
/driver/orders/[id]/    — zakaz detail + holat tugmalari + GPS
/driver/earnings/       — daromad statistikasi
/driver/profile/        — profil
/driver/settings/       — sozlamalar
```

## Admin panel sahifalari
```
/admin/                 — dashboard (KPI + so'nggi zakazlar)
/admin/orders/          — barcha zakazlar (filter + qidiruv)
/admin/users/           — foydalanuvchilar (bloklash)
/admin/stats/           — statistika (Recharts, real Supabase data)
/admin/pricing/         — narxlar (DB ga saqlash)
```

## Admin kirish
Email ro'yxati: `claudepro0611@gmail.com`, `admin@dolphy.cc`  
Tekshiruv layout da: `supabase.auth.getUser()`

## Order status oqimi
`pending` → `accepted` → `on_way` → `delivered` | `cancelled`

## Holat tugmalari (driver)
```typescript
const NEXT: Record<string, { next: string; label: string }> = {
  accepted: { next: 'on_way',    label: "Yo'lga chiqdim" },
  on_way:   { next: 'delivered', label: 'Yetkazildi'     },
}
await supabase.from('orders').update({ status: next }).eq('id', orderId)
```

## Real-time (driver dashboard)
```typescript
supabase.channel('driver-orders')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders', filter: 'status=eq.pending' },
    (payload) => setOrders(prev => [payload.new, ...prev])
  ).subscribe()
```

## Supabase (admin — service role orqali)
```typescript
import { createClient } from '@supabase/supabase-js'
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

## Ranglar va dizayn
- Fon: `dark:bg-black bg-gray-50`
- Karta: `dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl`
- Aksent: `#C8F135`
- Minimal, emoji yo'q

## Tegishli emas
- TG Mini App — frontend agentniki
- API route yozma — backend agentniki
- DB migratsiya — backend agentniki
