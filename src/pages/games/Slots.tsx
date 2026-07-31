import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { SLOT_SYMBOLS, SevenIcon } from "@/components/casino/gameIcons";
import { cn, weightedRandom } from "@/lib/utils";

const SYMBOLS = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣"];

const SYMBOL_PAYOUTS: Record<string, number> = {
  "🍒": 1.2, "🍋": 1.5, "🍇": 2, "🔔": 3, "⭐": 5, "💎": 10, "7️⃣": 25,
};

function spinReels(): string[][] {
  const reels: string[][] = [];
  for (let r = 0; r < 3; r++) {
    reels.push([
      weightedRandom(SYMBOLS.map((s) => [s, 10])),
      weightedRandom(SYMBOLS.map((s) => [s, 10])),
      weightedRandom(SYMBOLS.map((s) => [s, 10])),
    ]);
  }
  return reels;
}

function SymbolIcon({ symbol, size = 26 }: { symbol: string; size?: number }) {
  const Icon = SLOT_SYMBOLS[symbol] ?? SevenIcon;
  return <Icon size={size} />;
}

export default function Slots() {
  const engine = useGameEngine({ slug: "slots" });
  const [bet, setBet] = useState(100);
  const [reels, setReels] = useState<string[][]>([["🍒", "🍒", "🍒"], ["🍒", "🍒", "🍒"], ["🍒", "🍒", "🍒"]]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ symbol: string; multiplier: number; payout: number } | null>(null);

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setSpinning(true);
    setResult(null);
    const target = spinReels();

    for (let step = 0; step < 8; step++) {
      setReels(spinReels());
      await new Promise((r) => setTimeout(r, 150 + step * 60));
    }
    setReels(target);

    const middle = [target[0][1], target[1][1], target[2][1]];
    const multiplier = middle.every((s) => s === middle[0]) ? SYMBOL_PAYOUTS[middle[0]] : middle.filter((s) => s === middle[0]).length === 2 || middle.filter((s) => s === middle[1]).length === 2 ? 0.5 : 0;
    const payout = bet * multiplier;
    setResult({ symbol: middle[0], multiplier, payout });
    await engine.settle({ betAmount: bet, payout, result: multiplier > 0 ? "win" : "loss", data: { reels: middle, multiplier } });
    setSpinning(false);
  };

  return (
    <GameLayout slug="slots">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative overflow-hidden rounded-2xl p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-600/10" />
        <div className="relative">
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-1 text-xs font-extrabold text-black">
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0 8 4l4 .6-3 2.9.8 4L6 9.2l-3.8 2.3.8-4-3-2.9L4 4z" fill="#3b2703" /></svg>
              JACKPOT ₹1,00,000
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gold-500/20 bg-black/60 p-3">
            {reels.map((row, r) => (
              <div key={r} className="space-y-1.5">
                {row.map((s, i) => {
                  const Symbol = SLOT_SYMBOLS[s];
                  return (
                    <motion.div
                      key={`${r}-${i}-${spinning ? "spin" : s}`}
                      initial={spinning ? { y: -30, opacity: 0.3 } : false}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex h-16 items-center justify-center rounded-xl border",
                        i === 1 ? "border-gold-500/50 bg-gold-500/10 shadow-glow" : "border-white/10 bg-white/5",
                      )}
                    >
                      <Symbol size={42} />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          {result && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-4 flex items-center justify-center gap-2 text-center text-lg font-extrabold",
                result.multiplier > 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {result.multiplier > 0 ? (
                <>
                  <SymbolIcon symbol={result.symbol} />
                  x{result.multiplier} → +₹{result.payout.toFixed(2)}
                </>
              ) : (
                "No match — spin again!"
              )}
            </motion.p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        <div className="mb-3 grid grid-cols-4 gap-1.5">
          {SYMBOLS.slice(0, 4).map((s) => {
            const Symbol = SLOT_SYMBOLS[s];
            return (
              <div key={s} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                <div className="mx-auto w-8"><Symbol size={30} /></div>
                <p className="text-[9px] text-muted-foreground">{SYMBOL_PAYOUTS[s]}x</p>
              </div>
            );
          })}
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={spinning || engine.busy}>
          {spinning ? "Spinning..." : engine.busy ? "Processing..." : "Spin Reels"}
        </Button>
      </div>
    </GameLayout>
  );
}
