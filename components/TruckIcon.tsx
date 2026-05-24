type Props = { size?: number; color?: string; className?: string };

// Gazelle — kichik yuk mashinasi (van)
export function GazelleIcon({ size = 48, color = "#FFD100", className = "" }: Props) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 80 48" fill="none" className={className}>
      {/* Kuzov */}
      <rect x="2" y="16" width="52" height="22" rx="3" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5"/>
      {/* Kabina */}
      <path d="M54 22 L54 38 L74 38 L74 26 L66 16 L54 16 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Shisha */}
      <path d="M57 17 L65 17 L71 25 L57 25 Z" fill="white" opacity="0.25"/>
      {/* Deraza */}
      <rect x="6" y="20" width="16" height="10" rx="1.5" fill="white" opacity="0.15"/>
      {/* G'ildirak */}
      <circle cx="18" cy="40" r="6" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="18" cy="40" r="2.5" fill={color} opacity="0.5"/>
      <circle cx="62" cy="40" r="6" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="62" cy="40" r="2.5" fill={color} opacity="0.5"/>
      {/* Yorug'lik */}
      <rect x="72" y="28" width="5" height="4" rx="1" fill={color} opacity="0.8"/>
      <path d="M2 30 L0 30 L0 34 L2 34" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// O'rta truck — o'rta yuk mashinasi
export function MediumTruckIcon({ size = 48, color = "#FFD100", className = "" }: Props) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 88 48" fill="none" className={className}>
      {/* Kuzov */}
      <rect x="2" y="10" width="54" height="28" rx="2" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Kuzov panellari */}
      <line x1="20" y1="10" x2="20" y2="38" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      <line x1="38" y1="10" x2="38" y2="38" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      {/* Kabina */}
      <path d="M56 18 L56 38 L84 38 L84 26 L76 12 L56 12 Z" fill={color} opacity="0.85" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Shisha */}
      <path d="M59 13 L75 13 L81 23 L59 23 Z" fill="white" opacity="0.2"/>
      {/* G'ildirak */}
      <circle cx="16" cy="41" r="6.5" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="16" cy="41" r="2.8" fill={color} opacity="0.4"/>
      <circle cx="44" cy="41" r="6.5" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="44" cy="41" r="2.8" fill={color} opacity="0.4"/>
      <circle cx="72" cy="41" r="6.5" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="72" cy="41" r="2.8" fill={color} opacity="0.4"/>
      {/* Yorug'lik */}
      <rect x="82" y="26" width="4" height="5" rx="1" fill={color} opacity="0.9"/>
      <rect x="82" y="33" width="4" height="3" rx="0.5" fill="#EF4444" opacity="0.7"/>
    </svg>
  );
}

// Kamaz — og'ir yuk mashinasi
export function KamazIcon({ size = 48, color = "#FFD100", className = "" }: Props) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 48" fill="none" className={className}>
      {/* Kuzov */}
      <rect x="2" y="6" width="60" height="32" rx="2" fill={color} opacity="0.1" stroke={color} strokeWidth="1.5"/>
      {/* Kuzov panellari */}
      <line x1="22" y1="6" x2="22" y2="38" stroke={color} strokeWidth="0.8" opacity="0.35"/>
      <line x1="42" y1="6" x2="42" y2="38" stroke={color} strokeWidth="0.8" opacity="0.35"/>
      {/* Kabina */}
      <rect x="62" y="14" width="34" height="24" rx="2" fill={color} opacity="0.8" stroke={color} strokeWidth="1.5"/>
      {/* Kabina yuqori qismi */}
      <rect x="64" y="8" width="28" height="8" rx="2" fill={color} opacity="0.6" stroke={color} strokeWidth="1"/>
      {/* Shisha */}
      <rect x="67" y="16" width="16" height="10" rx="1.5" fill="white" opacity="0.18"/>
      {/* Qo'shimcha deraza */}
      <rect x="86" y="18" width="7" height="7" rx="1" fill="white" opacity="0.12"/>
      {/* G'ildiraklar — 4 ta */}
      <circle cx="14" cy="41" r="6" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="14" cy="41" r="2.5" fill={color} opacity="0.4"/>
      <circle cx="36" cy="41" r="6" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="36" cy="41" r="2.5" fill={color} opacity="0.4"/>
      <circle cx="72" cy="41" r="6.5" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="72" cy="41" r="2.8" fill={color} opacity="0.4"/>
      <circle cx="87" cy="41" r="6.5" fill="#111" stroke={color} strokeWidth="2"/>
      <circle cx="87" cy="41" r="2.8" fill={color} opacity="0.4"/>
      {/* Yorug'lik */}
      <rect x="94" y="20" width="4" height="5" rx="1" fill={color} opacity="0.9"/>
      <rect x="94" y="27" width="4" height="3" rx="0.5" fill="#EF4444" opacity="0.7"/>
      {/* Egzoz */}
      <rect x="60" y="4" width="3" height="6" rx="1" fill={color} opacity="0.4"/>
    </svg>
  );
}

export function TruckIcon({ type, size, color, className }: { type: "gazelle" | "medium" | "kamaz" } & Props) {
  if (type === "gazelle") return <GazelleIcon size={size} color={color} className={className} />;
  if (type === "medium")  return <MediumTruckIcon size={size} color={color} className={className} />;
  return <KamazIcon size={size} color={color} className={className} />;
}
