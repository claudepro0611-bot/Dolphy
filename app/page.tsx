import Link from "next/link";
// Landing — server component, CSS animatsiyalar ishlatiladi

const TRUCKS = [
  { name: "Gazelle", cap: "1.5 t", price: "25 000" },
  { name: "O'rta",   cap: "5 t",   price: "45 000" },
  { name: "Kamaz",   cap: "10 t",  price: "75 000" },
];

const STEPS = [
  { n: "01", title: "Manzil kiriting",  desc: "Qayerdan va qayerga ekanligini belgilang." },
  { n: "02", title: "Mashina tanlang",  desc: "Yuking hajmiga qarab Gazelle, o'rta yoki Kamaz." },
  { n: "03", title: "Zakaz bering",     desc: "Narxni ko'ring va tasdiqlang — bir bosish kifoya." },
  { n: "04", title: "Kuzating",         desc: "Driver real-time xaritada — joylashuvi jonli ko'rinadi." },
];

const STATS = [
  { value: "2 400+",  label: "Bajarilgan zakaz" },
  { value: "180+",    label: "Faol haydovchi" },
  { value: "4.9",     label: "O'rtacha reyting" },
  { value: "~18 min", label: "O'rtacha kutish" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-black">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD100] flex items-center justify-center text-black font-black text-sm">Y</div>
            <span className="font-bold text-lg tracking-tight">Yotoq</span>
            <span className="text-white/30 text-sm ml-1">Logistics</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#how"    className="hover:text-white transition-colors">Qanday ishlaydi</a>
            <a href="#trucks" className="hover:text-white transition-colors">Mashinalar</a>
            <a href="#stats"  className="hover:text-white transition-colors">Statistika</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-white/30 hover:text-white/60 transition-colors hidden md:block">
              Admin
            </Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Kirish
            </Link>
            <Link href="/register" className="text-sm border border-white/20 text-white/70 hover:border-[#FFD100]/60 hover:text-[#FFD100] transition-colors px-4 py-2 rounded-full hidden md:block">
              Haydovchi bo&apos;ling
            </Link>
            <Link href="/order/new" className="bg-[#FFD100] text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-[#E6BC00] transition-colors">
              Zakaz berish
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-24">
        <div className="inline-flex items-center gap-2 border border-[#FFD100]/30 bg-[#FFD100]/5 text-[#FFD100] text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-[3px] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100] animate-pulse" />
          Toshkentda ishlamoqda
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-3xl mb-6">
          Yukingizni{" "}
          <span className="text-[#FFD100]">tez</span> va{" "}
          <span className="text-[#FFD100]">ishonchli</span>{" "}
          yetkazing
        </h1>
        <p className="text-white/40 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          Bir necha soniyada zakaz bering. Eng yaqin haydovchi darhol
          yo&apos;lga chiqadi. GPS kuzatuv, shaffof narx, qulay to&apos;lov.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/order/new"
            className="bg-[#FFD100] text-black font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#E6BC00] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,209,0,0.2)]"
          >
            Hoziroq zakaz berish →
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 border border-white/15 text-white/60 font-medium text-base px-8 py-4 rounded-2xl hover:border-[#FFD100]/40 hover:text-[#FFD100] transition-all"
          >
            <svg width="16" height="14" viewBox="0 0 22 16" fill="none">
              <rect x="1" y="2" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 4h5l2 4v4h-7V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="17.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Haydovchi bo&apos;lish
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#FFD100] mb-1">{s.value}</div>
              <div className="text-white/35 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-3">Qanday ishlaydi</p>
          <h2 className="text-4xl md:text-5xl font-bold">To&apos;rt qadam, xolos</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="group border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:border-[#FFD100]/40 hover:bg-[#FFD100]/[0.03] transition-all cursor-default"
            >
              <div className="text-[#FFD100] font-black text-5xl mb-5 opacity-20 group-hover:opacity-50 transition-opacity leading-none">
                {s.n}
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUCKS */}
      <section id="trucks" className="bg-white/[0.015] border-y border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-3">Mashinalar</p>
            <h2 className="text-4xl md:text-5xl font-bold">Yukingizdek mashina</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TRUCKS.map((t, i) => (
              <div
                key={t.name}
                className={`relative border rounded-2xl p-8 transition-all hover:scale-[1.02] cursor-pointer ${
                  i === 1
                    ? "border-[#FFD100] bg-[#FFD100]/5 shadow-[0_0_60px_rgba(255,209,0,0.1)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-6 bg-[#FFD100] text-black text-xs font-black px-3 py-1 rounded-full">
                    KO&apos;P TANLANGAN
                  </div>
                )}
                <div className={`text-4xl font-bold mb-5 ${i === 1 ? "text-[#FFD100]" : "text-white/15"}`}>
                  {t.cap}
                </div>
                <h3 className="text-2xl font-bold mb-1">{t.name}</h3>
                <p className="text-white/35 text-sm mb-6">Yuk hajmi: {t.cap}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-[#FFD100]">{t.price}</span>
                  <span className="text-white/35 text-sm mb-0.5">so&apos;mdan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Hoziroq boshlang
        </h2>
        <p className="text-white/35 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Ro&apos;yxatdan o&apos;tish shart emas. Telefon raqamingiz yetarli.
        </p>
        <Link
          href="/order/new"
          className="inline-block bg-[#FFD100] text-black font-black text-lg px-10 py-5 rounded-2xl hover:bg-[#E6BC00] transition-all hover:scale-105 shadow-[0_0_80px_rgba(255,209,0,0.25)]"
        >
          Zakaz berish →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/25 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FFD100] flex items-center justify-center text-black font-black text-xs">Y</div>
            <span className="text-white/40">Yotoq Logistics</span>
          </div>
          <span>© 2025 Yotoq. Toshkent, O&apos;zbekiston</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Shartlar</a>
            <a href="#" className="hover:text-white/60 transition-colors">Maxfiylik</a>
            <a href="https://t.me/yotoq_bot" className="hover:text-white/60 transition-colors">Telegram</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
