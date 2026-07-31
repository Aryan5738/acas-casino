import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

export function CardFace({ card, small, hidden }: { card: CardType; small?: boolean; hidden?: boolean }) {
  const red = card.suit === "♥" || card.suit === "♦";
  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        className={cn(
          "flex items-center justify-center rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/30 to-gold-800/40 shadow-lg",
          small ? "h-24 w-16" : "h-36 w-24",
        )}
      >
        <span className={small ? "text-xl" : "text-2xl"}>🂠</span>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      className={cn(
        "flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-white to-zinc-200 shadow-lg",
        small ? "h-24 w-16" : "h-36 w-24",
      )}
    >
      <div className={cn("text-center font-bold", red ? "text-red-600" : "text-zinc-900")}>
        <p className={small ? "text-xl" : "text-3xl"}>{card.rank}</p>
        <p className={small ? "text-lg" : "text-2xl"}>{card.suit}</p>
      </div>
    </motion.div>
  );
}
