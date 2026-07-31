import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const bets = [
  { key: "red", label: "Red", payout: 2 },
  { key: "black", label: "Black", payout: 2 },
  { key: "even", label: "Even", payout: 2 },
  { key: "odd", label: "Odd", payout: 2 },
  { key: "low", label: "1-18", payout: 2 },
  { key: "high", label: "19-36", payout: 2 },
] as const;

type BetKey = (typeof bets)[number]["key"];

function checkWin(num: number, bet: BetKey): boolean {
  if (num === 0) return false;
  switch (bet) {
    case "red": return REDS.has(num);
    case "black": return !REDS.has(num);
    case "even": return num % 2 === 0;
    case "odd": return num % 2 === 1;
    case "low": return num <= 18;
    case "high": return num > 18;
  }
}

export default function Roulette() {
  const engine = useGameEngine({ slug: "roulette" });
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<BetKey>("red");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ num: number; win: boolean; payout: number } | null>(null);
  const [rotation, setRotation] = useState(0);

  const selected = bets.find((b) => b.key === choice)!;

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setSpinning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    const num = Math.floor(Math.random() * 37);
    const win = checkWin(num, choice);
    const payout = win ? bet * selected.payout : 0;
    setRotation((r) => r + 360 * 5 + num * (360 / 37));
    setResult({ num, win, payout });
    await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { number: num, bet: choice } });
    setSpinning(false);
  };

  return (
    <GameLayout slug="roulette">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center">
        <div className="relative h-56 w-56">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-black shadow-[0_0_50px_rgba(16,185,129,0.25)]" />
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex h-56 w-56 items-center justify-center rounded-full border-4 border-gold-500/40 bg-black/70"
          >
            {Array.from({ length: 37 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{ transform: `rotate(${(360 / 37) * i}deg) translateY(-100px)` }}
              >
                <span className={cn("block h-4 w-1.5 rounded-sm", i === 0 ? "bg-emerald-400" : REDS.has(i) ? "bg-red-500" : "bg-zinc-700")} />
              </div>
            ))}
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-500/50 bg-black font-mono text-3xl font-extrabold">
              {result?.num ?? <span className="text-gold-400">🎡</span>}
            </div>
          </motion.div>
          <div className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 rounded-b bg-gold-400 shadow-glow" />
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mt-4 text-lg font-extrabold", result.win ? "text-emerald-400" : "text-red-400")}
          >
            {result.num === 0 ? "Green 0!" : `${result.num} ${REDS.has(result.num) ? "🔴" : "⚫"}`} —{" "}
            {result.win ? `+₹${result.payout.toFixed(2)}` : "You lost"}
          </motion.p>
        )}
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {bets.map((b) => (
            <button
              key={b.key}
              onClick={() => setChoice(b.key)}
              className={cn(
                "rounded-lg border py-2.5 text-center transition-all",
                choice === b.key ? "border-gold-500/60 bg-gold-500/20 shadow-glow" : "border-white/10 bg-white/5",
              )}
            >
              <p className={cn("text-sm font-bold", choice === b.key ? "text-gold-300" : "text-muted-foreground")}>{b.label}</p>
              <p className="text-[9px] text-muted-foreground">{b.payout}× payout</p>
            </button>
          ))}
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={spinning || engine.busy}>
          {spinning ? "Spinning..." : engine.busy ? "Processing..." : `Bet ${selected.label}`}
        </Button>
      </div>
    </GameLayout>
  );
}
