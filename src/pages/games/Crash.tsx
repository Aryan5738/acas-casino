import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";

const MULTIPLIERS = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export default function Crash() {
  const engine = useGameEngine({ slug: "crash" });
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<"idle" | "running" | "crashed">("idle");
  const [multiplier, setMultiplier] = useState(1);
  const [crashedAt, setCrashedAt] = useState(0);
  const [payout, setPayout] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const crashPointRef = useRef(0);

  const curveFn = (t: number) => {
    const k = 0.00006;
    return Math.exp(k * t);
  };

  const start = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setPayout(0);
    setPhase("running");
    setMultiplier(1);
    crashPointRef.current = 1 + Math.random() * 9;
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const t = performance.now() - startTimeRef.current;
      const m = curveFn(t);
      setMultiplier(m);
      if (m >= crashPointRef.current) {
        setPhase("crashed");
        setCrashedAt(crashPointRef.current);
        engine.settle({ betAmount: bet, payout: 0, result: "loss", data: { crashed_at: crashPointRef.current } });
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  const cashOut = async () => {
    if (phase !== "running") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("crashed");
    const winPayout = bet * multiplier;
    setPayout(winPayout);
    await engine.settle({ betAmount: bet, payout: winPayout, result: "win", data: { cashed_at: multiplier } });
  };

  const color = phase === "crashed" ? (payout > 0 ? "text-emerald-400" : "text-red-400") : "text-gold-300";

  return (
    <GameLayout slug="crash">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative flex h-72 flex-col items-center justify-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10" />
        {phase === "running" && (
          <motion.div
            className="absolute bottom-8 text-7xl"
            animate={{ x: [-40, 60], y: [0, -50], rotate: [-10, 15] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
          >
            🚀
          </motion.div>
        )}
        <motion.p
          key={phase === "running" ? "running" : "static"}
          className={`relative z-10 font-mono text-6xl font-extrabold tabular-nums ${color}`}
          animate={phase === "running" ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.4, repeat: phase === "running" ? Infinity : 0 }}
        >
          {phase === "idle" ? "Press Start" : `${multiplier.toFixed(2)}×`}
        </motion.p>
        <p className="relative z-10 mt-2 text-xs text-muted-foreground">
          {phase === "crashed" ? (payout > 0 ? `Cashed out +₹${payout.toFixed(2)}!` : `Crashed at ${crashedAt.toFixed(2)}×`) : phase === "running" ? "Cash out before it crashes!" : "Next round starts now"}
        </p>
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        {phase === "idle" ? (
          <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
            {engine.busy ? "Processing..." : "Start Game"}
          </Button>
        ) : phase === "running" ? (
          <Button className="mt-4 w-full" size="lg" variant="ghost" onClick={cashOut} disabled={engine.busy}>
            Cash Out ₹{(bet * multiplier).toFixed(2)}
          </Button>
        ) : (
          <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
            Play Again
          </Button>
        )}
      </div>

      <div className="mt-3 rounded-2xl glass p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Multiplier History</p>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {MULTIPLIERS.map((m) => (
            <span
              key={m}
              className="shrink-0 rounded bg-white/5 px-2 py-1 font-mono text-[10px] font-bold text-gold-300/80"
            >
              {m}×
            </span>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
