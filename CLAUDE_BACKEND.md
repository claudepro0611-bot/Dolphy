# Backend Agent

## Vazifa
Faqat API route, DB, Supabase bilan ishlash.

## Papkalar
- `app/api/` — API routelar
- `lib/` — Supabase client, utility funksiyalar
- `types/` — TypeScript tiplar
- `supabase/migrations/` — SQL migratsiyalar

## Stack
- Next.js App Router API routes
- Supabase (PostgreSQL, Auth, Realtime, RLS)
- TypeScript

## Supabase
- **Project:** `jaibeklvxbqpufsclnxs.supabase.co`
- **Anon client:** `lib/supabase/client.ts`
- **Server client:** `lib/supabase/server.ts`
- **Admin (service role):** API routelarda yaratiladi

## DB jadvallar

### `users`
```sql
id UUID PRIMARY KEY,
phone TEXT,
full_name TEXT,
role TEXT,          -- 'client' | 'driver'
status TEXT,        -- 'active' | 'offline'
is_blocked BOOLEAN DEFAULT false,
created_at TIMESTAMPTZ DEFAULT NOW()
```

### `orders`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
client_id UUID REFERENCES users(id),
driver_id UUID REFERENCES users(id),
from_address TEXT, from_lat FLOAT, from_lng FLOAT,
to_address TEXT,   to_lat FLOAT,   to_lng FLOAT,
vehicle_type TEXT, -- 'gazelle' | 'medium' | 'kamaz' | 'damas' | 'labo' | 'isuzu' | 'fura'
cargo_type TEXT,   cargo_weight FLOAT,
price INTEGER,
status TEXT,        -- 'pending'|'accepted'|'on_way'|'delivered'|'cancelled'
driver_lat FLOAT,  driver_lng FLOAT,
created_at TIMESTAMPTZ DEFAULT NOW()
```

### `pricing`
```sql
id TEXT PRIMARY KEY,   -- 'gazelle' | 'medium' | 'kamaz'
name TEXT, cap TEXT,
base INTEGER,          -- bazaviy narx (so'm)
per_km INTEGER         -- km narxi (so'm)
```

### `vehicles`, `driver_profiles`, `reviews`
Driver onboarding va baholash uchun.

## API routelar

### Mavjud
```
POST /api/v1/orders/accept     — auth bilan order qabul (driver)
GET  /api/v1/pricing           — narxlar (DB yoki default)
POST /api/v1/pricing           — narxlarni saqlash (admin)
POST /api/tg/driver/accept     — TG driver order qabul (service role)
POST /api/auth/send-otp        — OTP yuborish
POST /api/auth/verify-otp      — OTP tasdiqlash
```

### API route pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
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
    const { field } = await req.json()
    if (!field) return NextResponse.json({ error: '...' }, { status: 400 })
    // ...
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server xatosi' }, { status: 500 })
  }
}
```

## RLS qoidalari
- `orders`: INSERT — anon (client_id null bo'lishi mumkin), SELECT — anon, UPDATE — service role
- `users`: SELECT — anon, UPDATE — faqat o'z profili
- `pricing`: SELECT — anon (public), INSERT/UPDATE — faqat service role

## Qoidalar
- Service role faqat server-side (`app/api/` ichida)
- Client-side da hech qachon `SUPABASE_SERVICE_ROLE_KEY` ishlatma
- Har API routeda `try/catch` va tegishli HTTP status kodi
- TypeScript: `any` faqat zarur bo'lsa, aks holda aniq tiplar
- Migratsiyalar: `supabase/migrations/` papkasiga SQL fayl

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=https://jaibeklvxbqpufsclnxs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_YANDEX_API_KEY=...
```

## Keyingi vazifalar (backend)
- GPS tracking endpoint (driver joylashuvini saqlash)
- SMS Auth integratsiya (Eskiz yoki Click SMS)
- To'lov webhook (Click / Payme)
- Baholash API (review yozish, o'rtacha hisoblash)
- Telegram bot notification (order qabul/rad)

## Tegishli emas
- UI komponentlar — frontend agentniki
- Admin/driver panel sahifalari — driver agentniki
