import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 32], [70, 68]],
  3: [[30, 32], [50, 50], [70, 68]],
  4: [[32, 32], [68, 32], [32, 68], [68, 68]],
  5: [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]],
  6: [[32, 30], [32, 50], [32, 70], [68, 30], [68, 50], [68, 70]],
};

function DieFace({ value, size = 96 }: { value: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
      <defs>
        <linearGradient id="dieg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id="dieglow" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" fill="url(#dieg)" stroke="#94a3b8" strokeWidth="2" />
      <rect x="8" y="8" width="84" height="84" rx="16" fill="url(#dieglow)" />
      {PIP_POSITIONS[value].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill="#0f172a" opacity="0.9" />
      ))}
    </svg>
  );
}

export default function Dice() {
  const engine = useGameEngine({ slug: "dice" });
  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(50);
  const [overUnder, setOverUnder] = useState<"over" | "under">("over");
  const [rolling, setRolling] = useState(false);
  const [rollValue, setRollValue] = useState(5);
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
    const roll = Math.floor(Math.random() * 100) + 1;
    setRollValue(Math.floor(Math.random() * 6) + 1);
    await new Promise((r) => setTimeout(r, 1600));
    const win = overUnder === "over" ? roll > target : roll < target;
    const payout = win ? bet * multiplier : 0;
    setResult({ roll, win, payout });
    await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { roll, target, overUnder, multiplier } });
    setRolling(false);
  };

  return (
    <GameLayout slug="dice">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative mx-auto flex h-56 w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />
        <motion.div
          key={rolling ? `roll-${Date.now()}` : result ? `res-${result.roll}` : "idle"}
          initial={rolling ? { rotateX: 0, rotateY: 0, scale: 1 } : false}
          animate={
            rolling
              ? { rotateX: [0, 720, 1440, 2160], rotateY: [0, 540, 1080, 2160], scale: [1, 1.12, 0.92, 1] }
              : { rotateX: 0, rotateY: 0, scale: 1 }
          }
          transition={{ duration: 1.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          <DieFace value={result ? Math.ceil(result.roll / 17) : rollValue} size={104} />
        </motion.div>

        <div className="relative mt-3 text-center">
          <p className="font-mono text-2xl font-extrabold text-gold-300">
            {result ? `${result.roll} / 100` : rolling ? "Rolling..." : `${target} ${overUnder === "over" ? "or higher" : "or lower"}`}
          </p>
          <motion.p
            key={result ? result.roll : "x"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-sm font-bold",
              result ? (result.win ? "text-emerald-400" : "text-red-400") : "text-muted-foreground",
            )}
          >
            {result ? (result.win ? `You won ₹${result.payout.toFixed(2)}!` : "You lost this roll") : `Payout ${multiplier.toFixed(2)}x`}
          </motion.p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <div className="mb-4">
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
              <span className="font-mono font-bold text-gold-300">{target} · {Math.round(winChance * 100)}% win · {multiplier.toFixed(2)}x</span>
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
