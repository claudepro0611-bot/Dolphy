import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-[#C8F135]/10 border-2 border-[#C8F135]/30 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
            <path d="M2 14l9 10L30 2" stroke="#C8F135" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Zakaz qabul qilindi!</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Eng yaqin haydovchi sizning zakazingizni ko&apos;rmoqda.
          Tez orada bog&apos;lanishadi.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/order/new"
            className="w-full h-12 bg-[#C8F135] text-black font-bold rounded-2xl flex items-center justify-center hover:bg-[#b3d92f] transition-all"
          >
            Yangi zakaz →
          </Link>
          <Link
            href="/"
            className="w-full h-12 border border-white/15 text-white/50 font-bold rounded-2xl flex items-center justify-center hover:border-white/30 hover:text-white transition-all"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  );
}
