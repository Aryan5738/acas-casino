import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CardBack, Spade, Heart, Diamond, Club } from "./gameIcons";

export interface CardType {
  rank: string;
  suit: string;
}

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const RANK_VALUES: Record<string, number> = {
  A: 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
};

export function drawCard(): CardType {
  return { rank: RANKS[Math.floor(Math.random() * RANKS.length)], suit: SUITS[Math.floor(Math.random() * SUITS.length)] };
}

export function handValue(hand: CardType[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += RANK_VALUES[c.rank];
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function SuitGlyph({ suit, size }: { suit: string; size: number }) {
  const red = suit === "♥" || suit === "♦";
  const common = { size, className: cn(red ? "text-red-600" : "text-zinc-900") };
  switch (suit) {
    case "♠": return <Spade {...common} />;
    case "♥": return <Heart {...common} />;
    case "♦": return <Diamond {...common} />;
    default: return <Club {...common} />;
  }
}

export function CardFace({ card, small, hidden }: { card: CardType; small?: boolean; hidden?: boolean }) {
  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        className={cn("relative", small ? "h-24 w-16" : "h-36 w-24")}
      >
        <CardBack size={small ? 64 : 96} className="absolute inset-0 h-full w-full drop-shadow-lg" />
      </motion.div>
    );
  }
  const w = small ? 64 : 96;
  const h = small ? 96 : 144;
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      className={cn("relative shrink-0 rounded-xl border border-white/20 bg-gradient-to-br from-white to-zinc-200 shadow-lg", small ? "h-24 w-16" : "h-36 w-24")}
    >
      <div className="absolute left-1.5 top-1.5 flex flex-col items-center">
        <span className={cn("font-serif font-bold leading-none", small ? "text-sm" : "text-base")}>{card.rank}</span>
        <SuitGlyph suit={card.suit} size={small ? 10 : 13} />
      </div>
      <div className="absolute bottom-1.5 right-1.5 flex flex-col items-center">
        <SuitGlyph suit={card.suit} size={small ? 10 : 13} />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SuitGlyph suit={card.suit} size={small ? 28 : 42} />
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute inset-0" opacity="0.08">
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="10" fill="none" stroke="currentColor" className="text-zinc-900" strokeWidth="1.5" />
        <rect x="6" y="6" width={w - 12} height={h - 12} rx="8" fill="none" stroke="currentColor" className="text-zinc-900" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
