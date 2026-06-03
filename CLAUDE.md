# Dolphy — Yuk tashish platformasi

## Loyiha haqida
Yandex Go uslubidagi yuk tashish platformasi. O'zbekiston bozori uchun.

**URL:** https://dolphy-web-app.vercel.app  
**Supabase:** jaibeklvxbqpufsclnxs.supabase.co

## Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Supabase (Auth, Realtime, DB)
- Vercel (hosting)
- Yandex Maps API (manzil autocomplete)
- Recharts (grafiklar)
- Framer Motion (animatsiyalar)

## Dizayn qoidalari
- Fon: `#0A0A0A` (qora)
- Aksent: `#C8F135` (yashil-sariq)
- Shrift: system-ui, minimal
- Emoji ishlatma
- Mobile-first, max-width 430px (TG), max-width 5xl (web)
- Tailwind dark: prefix ishlatiladi

## Supabase jadvallar
- `users` — id, phone, full_name, role (client/driver), status, is_blocked
- `orders` — id, client_id, driver_id, from_address, to_address, from_lat, from_lng, to_lat, to_lng, vehicle_type, cargo_type, cargo_weight, price, status, created_at
- `vehicles` — haydovchi transport ma'lumotlari
- `driver_profiles` — haydovchi profili va hujjatlari
- `reviews` — baholash
- `pricing` — id, name, cap, base, per_km

## Order status oqimi
`pending` → `accepted` → `on_way` → `delivered`  
Shuningdek: `cancelled`

## Tayyor bo'limlar
- Driver onboarding (ro'yxatdan o'tish, hujjat yuklash)
- Supabase Auth (OTP orqali)
- Buyurtma berish + real-time kuzatuv
- Driver holat tugmalari (accepted → on_way → delivered)
- Manzil autocomplete (Yandex Maps)
- Mijoz paneli (`/order/`, `/orders/`, `/profile/`)
- Driver paneli (`/driver/`)
- Admin paneli (`/admin/`) — dashboard, zakazlar, foydalanuvchilar, statistika, narxlar
- Telegram Mini App (`/tg/`)
  - Rol tanlash: Mijoz / Haydovchi
  - Mijoz: `/tg/client/` — buyurtma berish
  - Haydovchi: `/tg/driver/` — dashboard, zakazlar, faol zakaz, daromad, profil

## Papka tuzilmasi
```
app/
  (admin)/admin/          — admin panel
  (auth)/                 — login/signup
  (client)/               — mijoz sahifalari
  (onboarding)/           — driver onboarding
  api/
    v1/orders/accept/     — order qabul qilish (auth bilan)
    v1/pricing/           — narxlar GET/POST
    tg/driver/accept/     — TG driver order qabul (service role)
  driver/                 — driver panel
  tg/                     — Telegram Mini App
    client/               — mijoz bo'limi
    driver/               — haydovchi bo'limi
      active/[id]/        — faol zakaz
      earnings/           — daromad
      orders/             — yangi zakazlar (real-time)
      profile/            — profil
```

## Muhim fayllar
- `lib/supabase/client.ts` — anon client
- `lib/supabase/server.ts` — server-side client
- `hooks/useTelegram.ts` — Telegram WebApp SDK
- `app/tg/layout.tsx` — TG layout (rol-aware nav)
- `app/tg/tg-theme-ctx.tsx` — TG dark mode context

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_YANDEX_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Keyingi vazifalar
- GPS tracking (haydovchi joylashuvi real-time)
- SMS Auth (Click SMS yoki Eskiz)
- To'lov tizimi (Click / Payme)
- Baholash tizimi (mijoz → haydovchi)
- Push notifications (Telegram bot orqali)

## Qoidalar
- Har doim TypeScript ishlatiladi, `any` faqat zarur bo'lsa
- Supabase anon client foydalanuvchi tomonda, service role faqat API routelarda
- Real-time uchun `supabase.channel()` + `postgres_changes`
- Deploy: `vercel --prod --yes`
- Pricing jadvalini yaratish SQL: `supabase/migrations/pricing_table.sql`
