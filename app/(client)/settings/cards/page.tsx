"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

interface Card {
  id: string;
  number: string;     // 16 xona
  holder: string;
  expiry: string;
  network: "HUMO" | "UZCARD" | "VISA" | "MC";
  primary: boolean;
}

const INITIAL_CARDS: Card[] = [
  { id: "c1", number: "9860123456789012", holder: "JASUR ABDULLAYEV", expiry: "12/27", network: "HUMO",   primary: true  },
  { id: "c2", number: "8600987654321098", holder: "JASUR ABDULLAYEV", expiry: "08/26", network: "UZCARD", primary: false },
];

const NET_COLORS: Record<string, string> = {
  HUMO:   "#00A651",
  UZCARD: "#003087",
  VISA:   "#1A1F71",
  MC:     "#EB001B",
};

function detectNetwork(digits: string): Card["network"] {
  if (digits.startsWith("9860")) return "HUMO";
  if (digits.startsWith("8600")) return "UZCARD";
  if (digits.startsWith("4"))    return "VISA";
  if (digits.startsWith("5"))    return "MC";
  return "UZCARD";
}

function formatCardDisplay(num: string) {
  return num.padEnd(16, "·").match(/.{1,4}/g)?.join("  ") ?? "";
}

function CardVisual({ card, small }: { card: Partial<Card> & { number: string }; small?: boolean }) {
  const network = card.network ?? detectNetwork(card.number.replace(/\D/g, ""));
  const netColor = NET_COLORS[network] ?? "#333";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${small ? "p-4" : "p-5"}`}
      style={{
        background: `linear-gradient(135deg, #111 0%, #2a2a2a 50%, #1a1a1a 100%)`,
        aspectRatio: "1.586/1",
      }}
    >
      {/* Aksent */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${netColor} 0%, transparent 70%)` }} />
      <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, #F5C518 0%, transparent 70%)` }} />

      {/* Chip + Network */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-9 h-6 rounded-md border border-[#F5C518]/40 bg-[#F5C518]/20 flex items-center justify-center">
          <div className="w-6 h-3.5 rounded-sm" style={{ background: "linear-gradient(90deg,#F5C518 50%,#E6B800 50%)" }} />
        </div>
        <span className="text-[10px] font-black tracking-[3px] text-white/70">{network}</span>
      </div>

      {/* Raqam */}
      <p className={`font-mono font-bold tracking-[3px] text-white select-none mb-3 ${small ? "text-sm" : "text-lg"}`}>
        {formatCardDisplay(card.number.replace(/\D/g, ""))}
      </p>

      {/* Holder + Expiry */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white/30 text-[8px] uppercase tracking-[2px] mb-0.5">Karta egasi</p>
          <p className={`text-white font-semibold tracking-wide ${small ? "text-xs" : "text-sm"}`}>
            {card.holder || "ISM FAMILIYA"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[8px] uppercase tracking-[2px] mb-0.5">Muddati</p>
          <p className={`text-white font-bold ${small ? "text-xs" : "text-sm"}`}>{card.expiry || "OO/YY"}</p>
        </div>
      </div>

      {/* Primary badge */}
      {card.primary && (
        <div className="absolute top-3 right-3">
          <span className="bg-[#FFD100] text-black text-[9px] font-black px-2 py-0.5 rounded-full">Asosiy</span>
        </div>
      )}
    </div>
  );
}

function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Card) => void }) {
  const [num,    setNum]    = useState("");
  const [dispNum,setDispNum]= useState("");
  const [expiry, setExpiry] = useState("");
  const [holder, setHolder] = useState("");
  const [loading,setLoading]= useState(false);

  function handleNum(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 16);
    setNum(d);
    setDispNum(d.match(/.{1,4}/g)?.join(" ") ?? d);
  }
  function handleExpiry(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 4);
    setExpiry(d.length >= 3 ? d.slice(0,2) + "/" + d.slice(2) : d);
  }
  function handleHolder(val: string) {
    setHolder(val.toUpperCase().replace(/[^A-Z\s]/g, ""));
  }

  const isValid = num.length === 16 && expiry.length === 5 && holder.length >= 3;

  async function submit() {
    if (!isValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    onAdd({
      id: "c" + Date.now(),
      number: num,
      holder,
      expiry,
      network: detectNetwork(num),
      primary: false,
    });
    onClose();
  }

  const cls = (err?: boolean) => [
    "w-full h-12 px-4 rounded-xl text-sm font-medium outline-none transition-all border-2",
    "dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900",
    "placeholder:dark:text-white/20 placeholder:text-gray-300",
    err ? "border-red-400" : "dark:border-white/15 border-gray-200 focus:border-[#FFD100]",
  ].join(" ");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="w-full max-w-sm dark:bg-[#111] bg-white rounded-3xl p-6 shadow-2xl dark:border-white/10 border border-gray-200"
      >
        {/* Preview */}
        <div className="mb-5">
          <CardVisual
            card={{ number: num, holder, expiry, network: detectNetwork(num), primary: false }}
          />
        </div>

        <div className="space-y-3">
          {/* Karta raqami */}
          <input type="text" inputMode="numeric"
            value={dispNum}
            onChange={e => handleNum(e.target.value)}
            placeholder="8600 •••• •••• ••••"
            maxLength={19}
            className={cls()}
          />

          <div className="grid grid-cols-2 gap-3">
            <input type="text" inputMode="numeric"
              value={expiry}
              onChange={e => handleExpiry(e.target.value)}
              placeholder="OO/YY"
              maxLength={5}
              className={cls()}
            />
            <input type="text"
              value={holder}
              onChange={e => handleHolder(e.target.value)}
              placeholder="ISM FAMILIYA"
              className={cls() + " uppercase tracking-wide"}
            />
          </div>

          <button
            onClick={submit}
            disabled={!isValid || loading}
            className={`w-full h-13 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isValid && !loading
                ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] shadow-[0_4px_20px_rgba(255,209,0,0.2)]"
                : "dark:bg-white/8 bg-gray-100 dark:text-white/25 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saqlanmoqda...</>
            ) : "Kartani qo'shish →"}
          </button>

          <button onClick={onClose}
            className={`w-full h-11 rounded-2xl text-sm font-semibold border dark:border-white/10 border-gray-200 ${muted} hover:dark:border-white/20 hover:border-gray-300 transition-all`}>
            Bekor qilish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CardsPage() {
  const router = useRouter();

  const [cards,     setCards]     = useState<Card[]>(INITIAL_CARDS);
  const [showModal, setShowModal] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function setPrimary(id: string) {
    setCards(cs => cs.map(c => ({ ...c, primary: c.id === id })));
    showToast("Asosiy karta o'zgartirildi");
  }

  function deleteCard(id: string) {
    if (cards.find(c => c.id === id)?.primary) {
      showToast("Asosiy kartani o'chirib bo'lmaydi");
      return;
    }
    setCards(cs => cs.filter(c => c.id !== id));
    showToast("Karta o'chirildi");
  }

  function addCard(card: Card) {
    setCards(cs => [...cs, card]);
    showToast("Yangi karta qo'shildi!");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl bg-[#1a1a1a] dark:bg-white/90 text-white dark:text-gray-900 text-sm font-semibold border dark:border-gray-200 border-white/10"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <AddCardModal onClose={() => setShowModal(false)} onAdd={addCard} />}
      </AnimatePresence>

      {/* Orqaga */}
      <button onClick={() => router.push("/settings")}
        className={`flex items-center gap-2 ${muted} text-sm font-semibold hover:dark:text-white hover:text-gray-900 transition-colors`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Orqaga
      </button>

      {/* Sarlavha */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">To'lov</p>
        <h1 className={`text-2xl font-bold ${main}`}>Kartalarim</h1>
      </motion.div>

      {/* Karta ro'yxati */}
      <div className="space-y-4">
        <AnimatePresence>
          {cards.map((card, i) => (
            <motion.div key={card.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              {/* Karta vizual */}
              <CardVisual card={card} />

              {/* Amallar */}
              <div className="flex gap-2 mt-2">
                {!card.primary && (
                  <button onClick={() => setPrimary(card.id)}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold border-2 border-[#FFD100]/50 text-[#FFD100] hover:bg-[#FFD100]/10 transition-all`}>
                    Asosiy qilish
                  </button>
                )}
                {card.primary && (
                  <div className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center dark:bg-white/[0.03] bg-gray-50 text-[#FFD100] border dark:border-white/8 border-gray-200">
                    ✓ Asosiy karta
                  </div>
                )}
                <button onClick={() => deleteCard(card.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-red-400 border dark:border-white/10 border-gray-200 hover:bg-red-500/8 hover:border-red-500/30 transition-all ${
                    card.primary ? "opacity-30 cursor-not-allowed" : ""
                  }`}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 4h11M5 4V2.5h5V4M6 7v5M9 7v5M3 4l1 9h7l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Yangi karta qo'shish */}
      <motion.button
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        onClick={() => setShowModal(true)}
        className="w-full h-13 py-3.5 rounded-2xl border-2 border-dashed border-[#FFD100]/40 text-[#FFD100] font-bold text-sm hover:border-[#FFD100]/70 hover:bg-[#FFD100]/5 transition-all flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Yangi karta qo&apos;shish
      </motion.button>
    </div>
  );
}
