import { cn } from "@/lib/utils";

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5df8d";
const GOLD_DARK = "#b8860b";

interface IconProps {
  size?: number;
  className?: string;
}

/* ---------------- Suits (SVG paths) ---------------- */

export function Spade({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C8 6 4.5 9.5 4.5 13.5a5.5 5.5 0 0 0 4.9 5.46c.5.06.9-.35.9-.86v-2.1l-2 3.2a2.4 2.4 0 1 0 2.7.55V11.5c0 2.5-1.2 4-1.2 4 .3-.3.5-.8.5-1.3.9.3 1.7.3 2.7 0 0 .5.2 1 .5 1.3 0 0-1.2-1.5-1.2-4v8.65a2.4 2.4 0 1 0 2.7-.55l-2-3.2v2.1c0 .51.4.92.9.86a5.5 5.5 0 0 0 4.9-5.46C19.5 9.5 16 6 12 2z" />
    </svg>
  );
}

export function Heart({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21s-7.5-4.7-9.7-9.4C.8 8.2 2.6 4.6 6 4.6c2 0 3.4 1.1 4.2 2.5.3.5.9.5 1.2 0 .8-1.4 2.2-2.5 4.2-2.5 3.4 0 5.2 3.6 3.7 7C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}

export function Diamond({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 20 12 12 22 4 12z" />
    </svg>
  );
}

export function Club({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5a5.2 5.2 0 0 1 2.9 9.5c2.4.6 3.6 2.6 3.6 4.6a3.4 3.4 0 0 1-3.3 3.4l-2.1-3.4v3.2a1.5 1.5 0 1 1-2.2 0v-3.2l-2.1 3.4A3.4 3.4 0 0 1 5.5 16.6c0-2 1.2-4 3.6-4.6a5.2 5.2 0 0 1 2.9-9.5z" />
    </svg>
  );
}

export function CardBack({ size = 96, className }: IconProps) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 96 134" className={className}>
      <defs>
        <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a1a24" />
          <stop offset="1" stopColor="#0a0a0f" />
        </linearGradient>
        <pattern id="cpat" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="none" />
          <path d="M0 8h16M8 0v16" stroke={GOLD} strokeOpacity="0.25" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="92" height="130" rx="10" fill="url(#cbg)" stroke={GOLD} strokeOpacity="0.5" strokeWidth="2" />
      <rect x="8" y="8" width="80" height="118" rx="7" fill="url(#cpat)" />
      <rect x="14" y="14" width="68" height="106" rx="5" fill="none" stroke={GOLD} strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="48" cy="67" r="16" fill="none" stroke={GOLD} strokeOpacity="0.7" strokeWidth="1.5" />
      <path d="M48 51v32M32 67h32" stroke={GOLD} strokeOpacity="0.7" strokeWidth="1.5" />
    </svg>
  );
}

/* ---------------- Game icons ---------------- */

export function MineIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <radialGradient id="minebody" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="1" stopColor="#111827" />
        </radialGradient>
      </defs>
      <g stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round">
        <line x1="24" y1="3" x2="24" y2="9" />
        <line x1="24" y1="3" x2="19" y2="7" />
        <line x1="24" y1="3" x2="29" y2="7" />
      </g>
      <circle cx="24" cy="14" r="2.4" fill="#fbbf24" />
      <g stroke="#111827" strokeWidth="2.6" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="24"
            y1="24"
            x2={24 + 18 * Math.cos((a * Math.PI) / 180)}
            y2={24 + 18 * Math.sin((a * Math.PI) / 180)}
            transform={`rotate(${a + 22.5} 24 24)`}
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="16" fill="url(#minebody)" stroke="#1f2937" strokeWidth="2" />
      <circle cx="19" cy="19" r="4.5" fill="#f9fafb" opacity="0.25" />
      <rect x="20.5" y="33" width="7" height="5" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
    </svg>
  );
}

export function GemIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7b7" />
          <stop offset="0.5" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="gemg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#059669" />
          <stop offset="1" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>
      <path d="M24 3 41 17 24 45 7 17z" fill="url(#gemg)" stroke="#065f46" strokeWidth="1.5" />
      <path d="M24 3 24 45M7 17l17 6 17-6" fill="none" stroke="#065f46" strokeWidth="1.5" opacity="0.7" />
      <path d="M16.5 12 24 21 31.5 12" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export function RouletteIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="22" fill="#14532d" stroke={GOLD} strokeWidth="2.5" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path
          key={i}
          d="M24 24 L24 5 A19 19 0 0 1 32.5 8.2 Z"
          fill={i % 2 ? "#dc2626" : "#0c0a09"}
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="10" fill="#0c0a09" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill={GOLD} />
    </svg>
  );
}

export function DiceIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="diceg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="9" fill="url(#diceg)" stroke="#6b7280" strokeWidth="2" transform="rotate(-8 24 24)" />
      <rect x="4" y="4" width="40" height="40" rx="9" fill="none" stroke="#6b7280" strokeWidth="2" transform="rotate(-8 24 24)" />
      {[
        [17, 17, 31, 31],
        [10, 24, 10, 24],
        [31, 24, 31, 24],
        [10, 10, 10, 10],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <circle cx={x1} cy={y1} r="3.2" fill="#111827" />
          {i === 0 && <circle cx={x2} cy={y2} r="3.2" fill="#111827" />}
        </g>
      ))}
    </svg>
  );
}

export function CoinIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="coing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_LIGHT} />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="url(#coing)" stroke="#7d5a12" strokeWidth="2" />
      <circle cx="24" cy="24" r="16" fill="none" stroke="#7d5a12" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="24" y="32" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="#5c4209">
        A
      </text>
    </svg>
  );
}

export function PlinkoIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="8" r="5" fill={GOLD} stroke="#7d5a12" strokeWidth="1.5" />
      {[6, 14, 22, 30, 38, 42].map((y, r) =>
        Array.from({ length: 8 - r }).map((_, i) => (
          <circle key={`${y}-${i}`} cx={10 + i * 5} cy={y} r="1.6" fill="#9ca3af" opacity="0.8" />
        )),
      )}
      <path d="M24 42v2" stroke="#9ca3af" strokeWidth="1.5" />
    </svg>
  );
}

export function WheelIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {[GOLD, "#1f6feb", "#2da44e", "#bf8700", "#d1242f", "#8250df", "#d03592", GOLD_LIGHT].map((c, i) => (
        <path key={i} d={`M24 24 L24 ${6 + 3} A19 19 0 0 1 ${24 + 19 * Math.sin((45 * (i + 1) * Math.PI) / 180)} ${24 - 19 * Math.cos((45 * (i + 1) * Math.PI) / 180)} Z`} fill={c} transform={`rotate(${i * 45} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="7" fill="#0a0a0f" stroke={GOLD} strokeWidth="2" />
      <circle cx="24" cy="24" r="2" fill={GOLD} />
      <path d="M24 2 L26 8 L22 8 Z" fill={GOLD} />
    </svg>
  );
}

export function RocketIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="rocketg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path d="M24 3c6 4 9 11 9 18 0 4-1.5 7.5-3.5 10H18.5C16.5 28.5 15 25 15 21c0-7 3-14 9-18z" fill="url(#rocketg)" stroke="#0369a1" strokeWidth="1.8" />
      <circle cx="24" cy="20" r="4" fill="#f0f9ff" stroke="#0369a1" strokeWidth="1.5" />
      <path d="M24 31v6M20 37h8M17.5 30c-2.5 3-3.5 7-3.5 9h3l1.5-3.5M30.5 30c2.5 3 3.5 7 3.5 9h-3l-1.5-3.5" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 37c-2 2-3 5-3 8h6c0-3-1-6-3-8z" fill="#f97316" opacity="0.85" />
    </svg>
  );
}

export function CardIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <rect x="6" y="8" width="26" height="34" rx="4" fill="#ffffff" stroke="#6b7280" strokeWidth="1.6" transform="rotate(-6 19 25)" />
      <rect x="16" y="6" width="26" height="34" rx="4" fill="#f8fafc" stroke="#6b7280" strokeWidth="1.6" transform="rotate(5 29 23)" />
      <text x="32" y="26" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="#dc2626">
        21
      </text>
    </svg>
  );
}

export function KenoIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <circle cx="15" cy="14" r="10" fill={GOLD} stroke="#7d5a12" strokeWidth="1.8" />
      <text x="15" y="18" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#5c4209">7</text>
      <circle cx="33" cy="26" r="10" fill="#0ea5e9" stroke="#075985" strokeWidth="1.8" />
      <text x="33" y="30" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#ffffff">21</text>
      <circle cx="20" cy="37" r="9" fill="#22c55e" stroke="#166534" strokeWidth="1.8" />
      <text x="20" y="41" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="#ffffff">45</text>
    </svg>
  );
}

export function DragonIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="dragonh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M8 26c0-9 7-16 16-16 6 0 11 3 13.5 8l6-2-2.5 5.5c2 2.5 3.5 6 3.5 9 0 6-4 10-8.5 7-.5-1.5-1.5-3.5-3-5L24 42l-6-9c-1 0.5-2 .8-3 .8C9.5 33.8 8 30 8 26z"
        fill="url(#dragonh)"
        stroke="#9a3412"
        strokeWidth="1.6"
      />
      <circle cx="19" cy="22" r="2.2" fill="#fef3c7" />
      <circle cx="29" cy="22" r="2.2" fill="#fef3c7" />
      <path d="M22 27l2 2 2-2-2 4z" fill="#7c2d12" />
      <path d="M14 18c1.5 0 1.5 2.5 0 2.5S12.5 18 14 18z" fill="#7c2d12" />
      <path d="M34 18c1.5 0 1.5 2.5 0 2.5s-1.5-2.5 0-2.5z" fill="#7c2d12" />
    </svg>
  );
}

export function PokerIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <rect x="5" y="7" width="26" height="34" rx="4" fill="#ffffff" stroke="#6b7280" strokeWidth="1.6" transform="rotate(-8 18 24)" />
      <rect x="17" y="7" width="26" height="34" rx="4" fill="#f8fafc" stroke="#6b7280" strokeWidth="1.6" />
      <rect x="11" y="14" width="8" height="8" rx="1" fill="#111827" />
      <rect x="25" y="14" width="8" height="8" rx="1" fill="#111827" />
    </svg>
  );
}

export function BaccaratIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="bacc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="0.6" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path d="M24 4 41 16 24 44 7 16z" fill="url(#bacc)" stroke="#0f2557" strokeWidth="1.8" />
      <path d="M24 4 24 44M7 16l17 8 17-8" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.35" />
      <circle cx="24" cy="17" r="3" fill="#bfdbfe" />
    </svg>
  );
}

export function CherryIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path d="M20 16c-1 5-4 8-4 8M20 16c1 5 4 8 4 8" stroke="#16a34a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="26" r="6" fill="#dc2626" />
      <circle cx="28" cy="26" r="6" fill="#ef4444" />
      <circle cx="10" cy="24" r="2" fill="#fecaca" opacity="0.8" />
      <circle cx="26" cy="24" r="2" fill="#fecaca" opacity="0.8" />
    </svg>
  );
}

export function LemonIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="21" rx="13" ry="10" fill="#facc15" stroke="#a16207" strokeWidth="1.6" />
      <path d="M20 10c3 2 4 5 4 9" stroke="#fde047" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="24" r="1.8" fill="#a16207" opacity="0.7" />
    </svg>
  );
}

export function GrapeIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path d="M20 10v4M20 10c0-3 2-5 5-5" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="18" r="3.4" fill="#a855f7" />
      <circle cx="24" cy="18" r="3.4" fill="#9333ea" />
      <circle cx="13" cy="25" r="3.4" fill="#7e22ce" />
      <circle cx="20" cy="25" r="3.4" fill="#9333ea" />
      <circle cx="27" cy="25" r="3.4" fill="#7e22ce" />
      <circle cx="16" cy="32" r="3.4" fill="#7e22ce" />
      <circle cx="24" cy="32" r="3.4" fill="#6b21a8" />
    </svg>
  );
}

export function BellIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path d="M20 4c-7 0-12 5-12 12 0 4-2 6-3 8h30c-1-2-3-4-3-8 0-7-5-12-12-12z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.6" />
      <rect x="16" y="29" width="8" height="4" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
      <circle cx="20" cy="33" r="3.4" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
    </svg>
  );
}

export function StarIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path
        d="M20 3l5.1 10.4 11.4 1.7-8.2 8 1.9 11.3L20 28.9 9.8 34.4l1.9-11.3-8.2-8 11.4-1.7z"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function SevenIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <rect x="5" y="4" width="30" height="32" rx="5" fill="#7f1d1d" />
      <rect x="8" y="7" width="24" height="26" rx="4" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <text x="20" y="28" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fontWeight="700" fill="#fecaca">
        7
      </text>
    </svg>
  );
}

export function DiamondGemIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path d="M20 3 36 15 20 37 4 15z" fill="#22d3ee" stroke="#155e75" strokeWidth="1.6" />
      <path d="M20 3v34M4 15l16 6 16-6" fill="none" stroke="#ffffff" strokeWidth="1.3" opacity="0.4" />
    </svg>
  );
}

export const SLOT_SYMBOLS: Record<string, (p: IconProps) => JSX.Element> = {
  "🍒": CherryIcon,
  "🍋": LemonIcon,
  "🍇": GrapeIcon,
  "🔔": BellIcon,
  "⭐": StarIcon,
  "💎": DiamondGemIcon,
  "7️⃣": SevenIcon,
};

export function GameIcon({ slug, size = 48, className }: IconProps & { slug: string }) {
  const icons: Record<string, (p: IconProps) => JSX.Element> = {
    mines: MineIcon,
    roulette: RouletteIcon,
    dice: DiceIcon,
    coinflip: CoinIcon,
    plinko: PlinkoIcon,
    wheelspin: WheelIcon,
    crash: RocketIcon,
    hilo: CardIcon,
    keno: KenoIcon,
    dragontower: DragonIcon,
    blackjack: CardIcon,
    poker: PokerIcon,
    baccarat: BaccaratIcon,
    slots: CherryIcon,
  };
  const Icon = icons[slug] ?? GemIcon;
  return <Icon size={size} className={className} />;
}

export { GOLD, GOLD_LIGHT, GOLD_DARK };
