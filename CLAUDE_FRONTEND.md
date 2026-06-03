# Frontend + TG Agent

## Vazifa
Faqat frontend va Telegram Mini App bilan ishlash.

## Papkalar
- `app/(client)/` — mijoz panel (buyurtma, tarix, profil)
- `app/tg/` — Telegram Mini App
  - `app/tg/client/` — mijoz bo'limi
  - `app/tg/driver/` — haydovchi bo'limi
- `components/` — umumiy komponentlar

## Stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS
- Framer Motion (animatsiyalar)
- Yandex Maps API (manzil autocomplete)
- `useTelegram` hook — `hooks/useTelegram.ts`

## Ranglar
- Fon: `#0A0A0A`
- Aksent: `#C8F135`
- Muted: `dark:text-white/40`
- Border: `dark:border-white/10`

## Dizayn qoidalari
- Emoji ishlatma
- Mobile-first, max-width 430px (TG sahifalari)
- Tun/kun rejimi ishlaydi (`dark:` prefix)
- `rounded-2xl` kartalar, `font-bold` sarlavhalar
- Loading: spinner yoki skeleton (animate-pulse)
- Tugmalar: `bg-[#C8F135] text-black` (asosiy), `dark:bg-white/[0.05]` (ikkilamchi)

## TG Mini App qoidalari
- Barcha sahifalar `'use client'`
- `useTelegram()` hook orqali TG user ma'lumotlari
- BackButton: `tg.BackButton.show()` / `hide()`
- Logout: `localStorage.removeItem('tg_role')` → `router.replace('/tg')`
- Rol: `localStorage.getItem('tg_role')` → `'client'` | `'driver'`
- `/tg/page.tsx` — rol tanlash (auto-redirect yo'q)

## TG sahifalar
```
/tg/               — rol tanlash
/tg/client/        — mijoz bosh sahifa
/tg/driver/        — driver dashboard
/tg/driver/orders/ — yangi zakazlar (real-time)
/tg/driver/active/[id]/ — faol zakaz
/tg/driver/earnings/    — daromad
/tg/driver/profile/     — profil
```

## Supabase (faqat o'qish, real-time)
```typescript
import { supabase } from '@/lib/supabase/client'
// Real-time:
supabase.channel('name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, cb)
  .subscribe()
```

## Tegishli emas
- API route yozma (`app/api/` — backend agentniki)
- DB migratsiya — backend agentniki
- Admin / Driver panel — driver agent niki
