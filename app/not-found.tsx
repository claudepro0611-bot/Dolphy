import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm animate-fade-up">
        <p className="text-8xl font-black text-white/8 mb-2">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Sahifa topilmadi</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Bu sahifa mavjud emas yoki o&apos;chirilgan bo&apos;lishi mumkin.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/"
            className="bg-[#C8F135] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b3d92f] transition-colors">
            Bosh sahifa →
          </Link>
          <Link href="/dashboard"
            className="border border-white/15 text-white/60 font-semibold px-6 py-3 rounded-xl hover:border-white/30 hover:text-white transition-all">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
