import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "@/components/casino/gameIcons";
import { cn } from "@/lib/utils";

const MULTIPLIERS = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const W = 320;
const H = 200;

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

  const plotY = (m: number) => H - 20 - (Math.log10(Math.max(m, 1.001)) / Math.log10(11)) * (H - 40);
  const plotX = (m: number) => Math.min(W - 14, ((m - 1) / 10) * W);

  const curvePoints = (() => {
    const pts: string[] = [];
    for (let m = 1; m <= Math.max(multiplier, 1.001); m += 0.02) {
      pts.push(`${plotX(m).toFixed(1)},${plotY(m).toFixed(1)}`);
    }
    return pts.join(" ");
  })();

  return (
    <GameLayout slug="crash">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative h-72 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10" />
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-x-0 top-8 mx-auto h-[200px] w-full px-4">
          <defs>
            <linearGradient id="crashline" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          {[1, 2, 5, 10].map((g) => (
            <g key={g}>
              <line x1="0" y1={plotY(g)} x2={W} y2={plotY(g)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
              <text x="6" y={plotY(g) - 3} fontSize="8" fill="rgba(255,255,255,0.35)">{g}×</text>
            </g>
          ))}
          <polyline points={curvePoints} fill="none" stroke="url(#crashline)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {phase === "crashed" && payout === 0 && (
            <g>
              <line x1="0" y1={plotY(crashedAt)} x2={plotX(crashedAt)} y2={plotY(crashedAt)} stroke="#f87171" strokeDasharray="3 3" />
              <line x1={plotX(crashedAt)} y1={plotY(crashedAt)} x2={plotX(crashedAt)} y2={H - 20} stroke="#f87171" strokeDasharray="3 3" />
              <text x={plotX(crashedAt) + 4} y={plotY(crashedAt) - 4} fontSize="9" fill="#f87171" fontWeight="700">✕ {crashedAt.toFixed(2)}×</text>
            </g>
          )}
        </svg>
        {phase === "running" && (
          <motion.div
            className="absolute z-10"
            style={{ left: 24 + plotX(multiplier), top: 40 + plotY(multiplier) - 24 }}
            animate={{ rotate: [8, -6, 8] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: "mirror" }}
          >
            <RocketIcon size={44} />
          </motion.div>
        )}
        <motion.p
          key={phase === "running" ? "running" : "static"}
          className={`relative z-10 mt-3 text-center font-mono text-5xl font-extrabold tabular-nums ${color}`}
          animate={phase === "running" ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.4, repeat: phase === "running" ? Infinity : 0 }}
        >
          {phase === "idle" ? "Ready" : `${multiplier.toFixed(2)}×`}
        </motion.p>
        <p className="relative z-10 mt-1 text-center text-xs text-muted-foreground">
          {phase === "crashed" ? (payout > 0 ? `Cashed out +₹${payout.toFixed(2)}!` : `Crashed at ${crashedAt.toFixed(2)}×`) : phase === "running" ? "Cash out before it crashes!" : "Place your bet and launch"}
        </p>
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        {phase === "idle" ? (
          <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
            {engine.busy ? "Processing..." : "Launch Rocket"}
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
              className={cn(
                "shrink-0 rounded bg-white/5 px-2 py-1 font-mono text-[10px] font-bold text-gold-300/80",
                m >= crashedAt && phase === "crashed" && m <= 2 && "bg-red-500/20 text-red-400",
              )}
            >
              {m}×
            </span>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
