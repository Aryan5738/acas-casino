import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dice() {
  const engine = useGameEngine({ slug: "dice" });
  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(50);
  const [overUnder, setOverUnder] = useState<"over" | "under">("over");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ roll: number; win: boolean; payout: number } | null>(null);

  const winChance = overUnder === "over" ? (100 - target) / 100 : target / 100;
  const multiplier = (() => {
    if (winChance === 0) return 1000;
    return Math.round((0.99 / winChance) * 100) / 100;
  })();

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setRolling(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1600));
    const roll = Math.floor(Math.random() * 100) + 1;
    const win = overUnder === "over" ? roll > target : roll < target;
    const payout = win ? bet * multiplier : 0;
    setResult({ roll, win, payout });
    await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { roll, target, overUnder, multiplier } });
    setRolling(false);
  };

  return (
    <GameLayout slug="dice">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative mx-auto flex h-48 w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />
        <motion.div
          key={result?.roll ?? "idle"}
          initial={rolling ? { rotate: 0, scale: 0.8 } : false}
          animate={rolling ? { rotate: 1080, scale: [0.8, 1.2, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-2xl border text-4xl font-extrabold",
            result
              ? result.win
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.4)]"
                : "border-red-500/50 bg-red-500/15 text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.4)]"
              : "border-gold-500/40 bg-black/50 text-gold-300 shadow-glow",
          )}
        >
          {result ? result.roll : rolling ? <span className="animate-pulse">?</span> : "🎲"}
        </motion.div>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "absolute bottom-4 text-sm font-bold",
              result.win ? "text-emerald-400" : "text-red-400",
            )}
          >
            {result.win ? `You won ₹${result.payout.toFixed(2)}!` : "You lost this roll"}
          </motion.p>
        )}
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bet Type</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setOverUnder("over")}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-bold transition-colors",
                overUnder === "over" ? "border-gold-500/60 bg-gold-500/20 text-gold-300" : "border-white/10 bg-white/5 text-muted-foreground",
              )}
            >
              Over {target}
            </button>
            <button
              onClick={() => setOverUnder("under")}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-bold transition-colors",
                overUnder === "under" ? "border-gold-500/60 bg-gold-500/20 text-gold-300" : "border-white/10 bg-white/5 text-muted-foreground",
              )}
            >
              Under {target}
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Target</span>
              <span className="font-mono font-bold text-gold-300">{target} · {Math.round(winChance * 100)}% win · {multiplier.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min={2}
              max={98}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-1 w-full accent-gold-500"
            />
          </div>
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={rolling || engine.busy}>
          {rolling ? "Rolling..." : engine.busy ? "Processing..." : "Roll Dice"}
        </Button>
      </div>
    </GameLayout>
  );
}
