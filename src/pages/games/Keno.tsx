import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn, shuffle, randomInt } from "@/lib/utils";

const NUMBERS = Array.from({ length: 80 }, (_, i) => i + 1);

function kenoPayout(matches: number, picks: number): number {
  const table: Record<number, number[]> = {
    2: [0, 12],
    3: [0, 2, 42],
    4: [0, 1, 5, 110],
    5: [0, 0, 2, 20, 450],
    6: [0, 0, 1, 5, 90, 1500],
    7: [0, 0, 1, 3, 20, 300, 4000],
    8: [0, 0, 0, 2, 12, 100, 800, 10000],
  };
  const row = table[picks] ?? [];
  return row[matches] ?? 0;
}

export default function Keno() {
  const engine = useGameEngine({ slug: "keno" });
  const [bet, setBet] = useState(100);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "drawing" | "done">("idle");
  const [result, setResult] = useState<{ matches: number; multiplier: number; payout: number } | null>(null);

  const togglePick = (n: number) => {
    if (phase === "drawing") return;
    setPicks((p) => {
      if (p.includes(n)) return p.filter((x) => x !== n);
      if (p.length >= 8) return p;
      return [...p, n];
    });
  };

  const play = async () => {
    if (picks.length < 2) return;
    const txId = await engine.place(bet);
    if (!txId) return;
    setPhase("drawing");
    setDrawn([]);
    setResult(null);
    const pool = shuffle(NUMBERS);
    for (let i = 0; i < 20; i++) {
      setDrawn(pool.slice(0, i + 1));
      await new Promise((r) => setTimeout(r, 350));
    }
    const matches = pool.slice(0, 20).filter((n) => picks.includes(n)).length;
    const multiplier = kenoPayout(matches, picks.length);
    const payout = multiplier > 0 ? bet * multiplier : 0;
    setResult({ matches, multiplier, payout });
    setPhase("done");
    await engine.settle({ betAmount: bet, payout, result: multiplier > 0 ? "win" : "loss", data: { picks, drawn: pool.slice(0, 20), matches } });
  };

  return (
    <GameLayout slug="keno">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Pick {picks.length}/8 numbers
        </p>
        {result && (
          <p className={cn("text-sm font-bold", result.multiplier > 0 ? "text-emerald-400" : "text-red-400")}>
            {result.matches} matches · {result.multiplier}×{" "}
            {result.multiplier > 0 && `+₹${result.payout.toFixed(2)}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {NUMBERS.map((n) => {
          const isPicked = picks.includes(n);
          const isDrawn = drawn.includes(n);
          const isMatch = isPicked && isDrawn;
          return (
            <button
              key={n}
              onClick={() => togglePick(n)}
              disabled={phase === "drawing"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-[11px] font-bold transition-all",
                isMatch && "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
                isDrawn && !isPicked && "border-white/20 bg-white/10 text-foreground",
                isPicked && !isDrawn && "border-gold-500/60 bg-gold-500/20 text-gold-300",
                !isPicked && !isDrawn && "border-white/5 bg-white/[0.03] text-muted-foreground",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={play}
          disabled={phase === "drawing" || engine.busy || picks.length < 2}
        >
          {phase === "drawing" ? "Drawing..." : engine.busy ? "Processing..." : `Play with ${picks.length} picks`}
        </Button>
        {phase === "done" && (
          <Button className="mt-2 w-full" size="lg" variant="ghost" onClick={() => { setPhase("idle"); setPicks([]); setDrawn([]); }}>
            New Game
          </Button>
        )}
      </div>
    </GameLayout>
  );
}
